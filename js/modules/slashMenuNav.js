// ========================================
// 模块：斜杠菜单左右键导航
// ========================================

/**
 * 获取当前显示的斜杠菜单
 * @returns {Element|null} 斜杠菜单元素
 */
const getMenu = () => document.querySelector('.hint--menu:not(.fn__none)');

/**
 * 设置菜单项焦点
 * @param {Element} menu 菜单元素
 * @param {Element} el 要设置焦点的菜单项
 */
const setFocus = (menu, el) => {
    if (!el) return;
    const cur = menu.querySelector('.b3-list-item--focus');
    if (cur) cur.classList.remove('b3-list-item--focus');
    el.classList.add('b3-list-item--focus');
};

/**
 * 在同一行的菜单项之间移动焦点
 * @param {'left'|'right'} dir 移动方向
 * @returns {boolean} 是否成功移动
 */
const move = (dir) => {
    const menu = getMenu();
    if (!menu) return false;
    const items = Array.from(menu.querySelectorAll('.b3-list-item'));
    if (!items.length) return false;
    const current = menu.querySelector('.b3-list-item--focus') || items[0];
    const top = current.offsetTop;
    const row = items.filter(el => el.offsetTop === top).sort((a,b)=>a.offsetLeft-b.offsetLeft);
    if (row.length <= 1) return false;
    let i = row.indexOf(current); if (i < 0) i = 0;
    const target = dir==='right' ? row[(i+1)%row.length] : row[(i-1+row.length)%row.length];
    if (target !== current) setFocus(menu, target);
    return true;
};

/**
 * 键盘事件处理函数
 * @param {KeyboardEvent} e 键盘事件
 */
const handler = (e) => {
    // 只处理左右箭头键
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    
    // 如果没有斜杠菜单或为emoji菜单则不处理
    const menu = getMenu();
    if (!menu || menu.querySelector('.emojis')) return;
    
    // 移动焦点并阻止默认行为
    if (move(e.key==='ArrowRight' ? 'right' : 'left')) {
        e.preventDefault();
        e.stopImmediatePropagation();
    }
};

// 事件监听器标识，防止重复安装
let isInstalled = false;

/**
 * 初始化斜杠菜单左右键导航功能
 */
export const initSlashMenuNavigation = () => {
    // 防止重复安装
    if (isInstalled) return;
    isInstalled = true;
    
    // 隐藏分割线，保持行对齐
    if (!document.getElementById('slash-menu-hide-separator')) {
        const st = document.createElement('style');
        st.id = 'slash-menu-hide-separator';
        st.textContent = '.hint--menu .b3-menu__separator{display:none!important;}';
        document.head.appendChild(st);
    }
    
    // 添加键盘事件监听器
    window.addEventListener('keydown', handler, true);
    
    // 将初始化状态添加到全局对象
    window.SavorModules = window.SavorModules || {};
    window.SavorModules.slashMenuNav = { isInstalled: true };
};

/**
 * 清理斜杠菜单左右键导航功能
 */
export const cleanupSlashMenuNavigation = () => {
    // 根据项目规范，此功能为永久保留功能，不实现实际清理逻辑
    isInstalled = false;
    if (window.SavorModules?.slashMenuNav) 
        window.SavorModules.slashMenuNav.isInstalled = false;
};
