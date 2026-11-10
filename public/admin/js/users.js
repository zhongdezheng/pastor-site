/*
================================================================================
文件位置: features/users/script.js
作用: 用户管理 Tab — 添加/删除/改密码/角色切换
被谁引用: admin-all.js 通过 loadTab('tab-users') 调用 loadUsers()
================================================================================
*/
async function loadUsers() {
  try {
    var res = await API.get('/api/users');
    if (!res.ok) throw new Error('获取用户列表失败');
    var users = res.data;
    var tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem">暂无用户</td></tr>';
    } else {
      var ROLE_CN = { admin: '管理员', editor: '编辑', viewer: '只读' };
      var ROLE_TAG = { admin: 'tag-listed', editor: 'tag-info', viewer: 'tag-muted' };
      tbody.innerHTML = users.map(function(u) {
        var activeLabel = u.active ? '' : ' <span class="tag" style="background:#fee2e2;color:#dc2626">已禁用</span>';
        return '<tr>' +
          '<td>' + H(u.username) + activeLabel + '</td>' +
          '<td>' + H(u.display_name || '-') + '</td>' +
          '<td><span class="tag ' + (ROLE_TAG[u.role] || '') + '">' + (ROLE_CN[u.role] || u.role) + '</span></td>' +
          '<td>' + (u.created_at ? u.created_at.substring(0,10) : '-') + '</td>' +
          '<td style="white-space:nowrap">' +
            (u.role === 'admin' ? '' :
              '<select onchange="changeRole(' + u.id + ',this.value)" style="padding:0.2rem;border-radius:6px;border:1px solid var(--border);font-size:0.8rem">' +
                '<option value="">角色</option>' +
                '<option value="admin">管理员</option>' +
                '<option value="editor" ' + (u.role==='editor'?'selected':'') + '>编辑</option>' +
                '<option value="viewer" ' + (u.role==='viewer'?'selected':'') + '>只读</option>' +
              '</select> ') +
            '<button class="btn btn-outline btn-sm" onclick="showPwdModal(' + u.id + ',\'' + H(u.username) + '\')">改密</button> ' +
            (u.active
              ? '<button class="btn btn-danger btn-sm" onclick="deleteUser(' + u.id + ')">禁用</button>'
              : '<button class="btn btn-success btn-sm" onclick="restoreUser(' + u.id + ')">启用</button>') +
          '</td></tr>';
      }).join('');
    }
  } catch(e) {
    console.error('用户管理加载失败:', e);
  }
}

async function addUser() {
  var username = prompt('请输入用户名（字母数字，不可含空格）：');
  if (!username) return;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return alert('用户名只能包含字母、数字和下划线');
  var displayName = prompt('请输入显示名称（可选）：', username) || username;
  var password = prompt('请输入密码（至少6位）：');
  if (!password || password.length < 6) return alert('密码至少6位');
  var role = prompt('选择角色：admin(管理员) / editor(编辑) / viewer(只读)', 'editor');
  if (!['admin','editor','viewer'].includes(role)) return alert('无效角色');

  try {
    var res = await API.post('/api/users', {
      username: username,
      password: password,
      display_name: displayName,
      role: role
    });
    if (!res.ok) return alert(res.error || '添加失败');
    loadUsers();
  } catch(e) {
    alert('添加失败: ' + e.message);
  }
}

function showPwdModal(id, username) {
  var pw = prompt('为【' + username + '】输入新密码（至少6位）：');
  if (!pw || pw.length < 6) return alert('密码至少6位');
  changePassword(id, pw);
}

async function changePassword(id, password) {
  try {
    var res = await API.put('/api/users/' + id + '/password', { password: password });
    if (!res.ok) return alert(res.error || '修改失败');
    alert('✅ 密码修改成功');
  } catch(e) {
    alert('修改失败: ' + e.message);
  }
}

async function changeRole(id, role) {
  if (!role) return;
  try {
    var res = await API.put('/api/users/' + id + '/role', { role: role });
    if (!res.ok) return alert(res.error || '修改失败');
    loadUsers();
  } catch(e) {
    alert('修改失败: ' + e.message);
  }
}

async function deleteUser(id) {
  if (!confirm('确定禁用此用户？禁用后该用户将无法登录。')) return;
  try {
    var res = await API.del('/api/users/' + id);
    if (!res.ok) return alert(res.error || '操作失败');
    loadUsers();
  } catch(e) {
    alert('操作失败: ' + e.message);
  }
}

async function restoreUser(id) {
  try {
    var res = await API.put('/api/users/' + id + '/restore');
    if (!res.ok) return alert(res.error || '操作失败');
    loadUsers();
  } catch(e) {
    alert('操作失败: ' + e.message);
  }
}
