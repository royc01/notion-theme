// ========================================
// 模块：列表子弹线功能
// ========================================

let bulletThreadingActive = false;
let selectionChangeHandler = null;
let btRafId = null;
let btLastItems = [];

const clearBulletLineMetrics = (node) => {
    node.style.removeProperty('--en-bullet-line-height');
    node.style.removeProperty('--en-bullet-line-top');
    node.style.removeProperty('--en-bullet-line-left');
    node.style.removeProperty('--en-bullet-line-width');
};

const getBulletCenter = (item) => {
    const action = item.querySelector(':scope > .protyle-action');
    if (!action) return null;

    const { left, top, width, height } = action.getBoundingClientRect();
    return { x: left + width / 2, y: top + height / 2 };
};

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
                clearBulletLineMetrics(node);
            });
            btLastItems = [];
            return;
        }
        const start = sel.getRangeAt(0).startContainer;

        // 清理上一次标记（避免全局查询）
        btLastItems.forEach(node => {
            node.classList.remove('en_item_bullet_actived', 'en_item_bullet_line');
            clearBulletLineMetrics(node);
        });
        btLastItems = [];

        const items = [];
        for (let n = start; n && n !== document.body; n = n.parentElement) {
            if (n.getAttribute?.('custom-f')) return; // 父级存在 custom-f 时直接终止
            if (n.dataset?.type === 'NodeListItem') items.push(n);
        }
        if (items.length === 0) return;

        for (let i = 0; i < items.length - 1; i++) {
            const item = items[i];
            const parentItem = items[i + 1];
            const itemRect = item.getBoundingClientRect();
            const itemBullet = getBulletCenter(item);
            const parentBullet = getBulletCenter(parentItem);

            if (itemBullet && parentBullet) {
                item.style.setProperty('--en-bullet-line-height', `${itemBullet.y - parentBullet.y}px`);
                item.style.setProperty('--en-bullet-line-top', `${parentBullet.y - itemRect.top}px`);
                item.style.setProperty('--en-bullet-line-left', `${parentBullet.x - itemRect.left}px`);
                item.style.setProperty('--en-bullet-line-width', `${itemBullet.x - parentBullet.x}px`);
            } else {
                const height = itemRect.top - parentItem.getBoundingClientRect().top;
                item.style.setProperty('--en-bullet-line-height', `${height}px`);
            }
            item.classList.add('en_item_bullet_line');
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
        clearBulletLineMetrics(node);
    });
    btLastItems = [];
};

// 初始化列表子弹线模块
export const initBulletThreadingModule = () => {
    window.initBulletThreading = initBulletThreading;
    window.removeBulletThreading = removeBulletThreading;
    window.cleanupBulletThreading = removeBulletThreading; 
};

