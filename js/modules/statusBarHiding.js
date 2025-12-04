// ========================================
// 底栏隐藏模块
// ========================================

// 底栏隐藏功能
const initStatusBarHidingFunc = () => {
    const selector = '.layout__wnd--active > .layout-tab-container > .fn__flex-1:not(.fn__none):not(.protyle)';
    
    const toggleStatus = () => {
        const status = document.getElementById('status');
        if (status) {
            status.classList.toggle('Sv-StatusHidden', !!document.querySelector(selector));
        }
    };
    
    const initObserver = () => {
        const center = document.querySelector('.layout__center');
        if (center) {
            toggleStatus();
            new MutationObserver(toggleStatus).observe(center, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        } else {
            setTimeout(initObserver, 200);
        }
    };
    
    initObserver();
};

// 初始化底栏隐藏功能
export const initStatusBarHiding = () => {
    initStatusBarHidingFunc();
};