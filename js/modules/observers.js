// ========================================
// 观察器模块
// ========================================

import { applyRememberedThemeStyle, initSavorToolbar, initThemeObserver, initTopBarPluginMenuObserver, toggleMenuListener, initStatusPosition } from './themeSetting.js';

// 主初始化函数
const initMain = async () => {
    await Promise.all([
        window.i18n.ready(),
        window.config.load()
    ]);
    await applyRememberedThemeStyle();
    initThemeObserver();
    const commonMenuEl = document.getElementById("commonMenu");
    if (commonMenuEl) {
        initSavorToolbar();
        toggleMenuListener(commonMenuEl, true);
    } else {
        const waitObserver = new MutationObserver((mutations, obs) => {
            const cm = document.getElementById("commonMenu");
            if (cm) {
                initSavorToolbar();
                toggleMenuListener(cm, true);
                obs.disconnect();
            }
        });
        waitObserver.observe(document.body, { childList: true, subtree: true });
    }
    initStatusPosition();
};

// 初始化所有观察器
export const initObservers = () => {
    // 执行主初始化
    initMain();
};