// ========================================
// 底栏隐藏模块
// ========================================

let statusBarObserver = null;
let statusBarInitTimer = null;

const STATUS_SELECTOR = '.layout__wnd--active > .layout-tab-container > .fn__flex-1:not(.fn__none):not(.protyle)';

// 底栏隐藏功能
const initStatusBarHidingFunc = () => {
    const toggleStatus = () => {
        const status = document.getElementById('status');
        if (status) {
            status.classList.toggle('Sv-StatusHidden', !!document.querySelector(STATUS_SELECTOR));
        }
    };
    
    const initObserver = () => {
        const center = document.querySelector('.layout__center');
        if (center) {
            toggleStatus();
            statusBarObserver = new MutationObserver(toggleStatus);
            statusBarObserver.observe(center, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        } else {
            statusBarInitTimer = setTimeout(initObserver, 200);
        }
    };
    
    initObserver();
};

export const cleanupStatusBarHiding = () => {
    statusBarObserver?.disconnect();
    statusBarObserver = null;
    if (statusBarInitTimer) {
        clearTimeout(statusBarInitTimer);
        statusBarInitTimer = null;
    }
    document.getElementById('status')?.classList.remove('Sv-StatusHidden');
};

// 初始化底栏隐藏功能
export const initStatusBarHiding = () => {
    cleanupStatusBarHiding();
    initStatusBarHidingFunc();
};
