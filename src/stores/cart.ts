import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export const cartItems = persistentAtom<CartItem[]>('cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const isCartOpen = atom(false);

export const cartCount = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

export const cartTotal = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const current = cartItems.get();
  const existing = current.find((i) => i.id === item.id && i.size === item.size);

  if (existing) {
    cartItems.set(
      current.map((i) =>
        i.id === item.id && i.size === item.size
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  } else {
    cartItems.set([...current, { ...item, quantity: 1 }]);
  }
}

export function removeFromCart(id: string, size: string) {
  cartItems.set(cartItems.get().filter((i) => !(i.id === id && i.size === size)));
}

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

export function clearCart() {
  cartItems.set([]);
}
