/*
 * ============================================================================
 * 📁 文件位置: src/stores/cart.ts
 * 🎯 作用: 购物车状态管理 — 使用 Nanostores 实现全局购物车
 * 📦 依赖: nanostores + @nanostores/persistent
 * 🔧 修改指南:
 *   【修改】CartItem 字段 → 加图片/颜色/其他属性时改 CartItem interface
 *   【修改】持久化 key → 改 persistentAtom 的 'cart' 字符串
 *   【修改】本地存储开关 → persistentAtom 自动存 localStorage，去掉 encode/decode 则不持久化
 *
 * 📐 数据流:
 *   用户点「加入购物车」→ addToCart() → 写入 cartItems → cartCount/cartTotal 自动计算
 *   页面刷新 → persistentAtom 从 localStorage 恢复数据
 *   WhatsApp 结账 → cart.ts→cartItems.get() → 生成消息文本
 * ============================================================================
 */

// Nanostores: 微型状态管理库，类似 Redux 但更轻量（<1KB）
import { atom, computed } from 'nanostores';
// persistentAtom: 自动同步到 localStorage，页面刷新不丢失
import { persistentAtom } from '@nanostores/persistent';

// ====== 购物车单项数据结构 ======
export interface CartItem {
  id: string;        // 产品 ID，如 "prod-2"
  name: string;      // 产品名称，如 "Men's White Tee"
  price: number;     // 单价，如 15.99
  size: string;      // 尺码，如 "M" "L" "XL"
  quantity: number;  // 数量，如 2
  image: string;     // 产品图片路径，如 "/images/products/white-tee-main.jpg"
}

// ====== 购物车状态（持久化到 localStorage） ======
// persistentAtom 会自动 JSON 序列化/反序列化，存到 localStorage key='cart'
// 页面刷新后 cartItems 自动恢复
export const cartItems = persistentAtom<CartItem[]>('cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// ====== 购物车弹窗开关 ======
// true→显示购物车侧边栏，false→隐藏
export const isCartOpen = atom(false);

// ====== 购物车商品总数 ======
// computed: 自动派生状态，cartItems 变化时 cartCount 自动重新计算
// 遍历所有商品，把 quantity 加起来
export const cartCount = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

// ====== 购物车总金额 ======
// 同样自动派生，price × quantity 的总和
export const cartTotal = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

// ====== 加入购物车 ======
// 【修改】加购逻辑：相同商品+尺码 → 数量+1；不同 → 新增一行
export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const current = cartItems.get();
  // 查是否有相同 id+尺码 的商品
  const existing = current.find((i) => i.id === item.id && i.size === item.size);

  if (existing) {
    // 已有→数量+1
    cartItems.set(
      current.map((i) =>
        i.id === item.id && i.size === item.size
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  } else {
    // 新商品→追加到数组，数量默认 1
    cartItems.set([...current, { ...item, quantity: 1 }]);
  }
}

// ====== 从购物车移除 ======
// 按 id + size 精确匹配删除（同一产品不同尺码被视为不同购物车项）
export function removeFromCart(id: string, size: string) {
  cartItems.set(cartItems.get().filter((i) => !(i.id === id && i.size === size)));
}

// ====== 更新数量 ======
// quantity ≤ 0 → 自动调用 removeFromCart 删除
// quantity > 0 → 更新该商品数量
export function updateQuantity(id: string, size: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(id, size);
    return;
  }
  cartItems.set(
    cartItems.get().map((i) =>
      i.id === id && i.size === size ? { ...i, quantity } : i
    )
  );
}

// ====== 清空购物车 ======
export function clearCart() {
  cartItems.set([]);
}
