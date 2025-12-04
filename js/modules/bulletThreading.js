// ========================================
// 模块：列表子弹线功能
// ========================================

let bulletThreadingActive = false;
let selectionChangeHandler = null;
let btRafId = null;
let btLastItems = [];

// 初始化列表子弹线功能
export const initBulletThreading = () => {
    if (bulletThreadingActive) return;
    bulletThreadingActive = true;
    const apply = () => {
        btRafId = null;
        const sel = window.getSelection();
        if (!sel.rangeCount) {
            // 清理上一次标记
            btLastItems.forEach(node => {
                node.classList.remove('en_item_bullet_actived', 'en_item_bullet_line');
                node.style.removeProperty('--en-bullet-line-height');
            });
            btLastItems = [];
            return;
        }
        const start = sel.getRangeAt(0).startContainer;

        // 清理上一次标记（避免全局查询）
        btLastItems.forEach(node => {
            node.classList.remove('en_item_bullet_actived', 'en_item_bullet_line');
            node.style.removeProperty('--en-bullet-line-height');
        });
        btLastItems = [];

        const items = [];
        for (let n = start; n && n !== document.body; n = n.parentElement) {
            if (n.getAttribute?.('custom-f')) return; // 父级存在 custom-f 时直接终止
            if (n.dataset?.type === 'NodeListItem') items.push(n);
        }
        if (items.length === 0) return;

        for (let i = 0; i < items.length - 1; i++) {
            const h = items[i].getBoundingClientRect().top - items[i + 1].getBoundingClientRect().top;
            items[i].style.setProperty('--en-bullet-line-height', `${h}px`);
            items[i].classList.add('en_item_bullet_line');
        }
        items.forEach(item => item.classList.add('en_item_bullet_actived'));
        btLastItems = items.slice();
    };

    selectionChangeHandler = () => { if (!btRafId) btRafId = requestAnimationFrame(apply); };
    document.addEventListener('selectionchange', selectionChangeHandler);
};

// 移除列表子弹线功能
export const removeBulletThreading = () => {
    if (!bulletThreadingActive) return;
    bulletThreadingActive = false;
    if (btRafId) { cancelAnimationFrame(btRafId); btRafId = null; }
    if (selectionChangeHandler) {
        document.removeEventListener('selectionchange', selectionChangeHandler);
        selectionChangeHandler = null;
    }
    // 清理剩余标记
    btLastItems.forEach(node => {
        node.classList.remove('en_item_bullet_actived', 'en_item_bullet_line');
        node.style.removeProperty('--en-bullet-line-height');
    });
    btLastItems = [];
};

// 初始化列表子弹线模块
export const initBulletThreadingModule = () => {
    window.initBulletThreading = initBulletThreading;
    window.removeBulletThreading = removeBulletThreading;
    window.cleanupBulletThreading = removeBulletThreading; 
};

