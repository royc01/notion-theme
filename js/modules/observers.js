// ========================================
// 观察器模块
// ========================================

import { applyRememberedThemeStyle, initSavorToolbar, initThemeObserver, toggleMenuListener } from './themeSetting.js';
import { addObserver } from './lifecycle.js';

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
        addObserver(document.body, { childList: true, subtree: true }, (mutations, obs) => {
            const cm = document.getElementById("commonMenu");
            if (cm) {
                initSavorToolbar();
                toggleMenuListener(cm, true);
                obs.disconnect();
            }
        });
    }
};

// 初始化所有观察器
export const initObservers = () => {
    // 执行主初始化
    initMain();
};
