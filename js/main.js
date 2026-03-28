// ========================================
// Savor 主题初始化入口
// ========================================

import { initUtils } from './modules/utils.js';
import { initConfig } from './modules/config.js';
import { initI18n } from './modules/i18n.js';
import { initButtons } from './modules/buttons.js';
import { initTheme } from './modules/themeSetting.js';
import { initStatusBarHiding } from './modules/statusBarHiding.js';
import { initObservers } from './modules/observers.js';
import { initTabbarVertical } from './modules/tabbarVertical.js';
import { initBulletThreadingModule } from './modules/bulletThreading.js';
import { initTypewriterModeModule } from './modules/typewriterMode.js';
import { initSidebarMemoModule } from './modules/sidebarMemo.js';
import { initListPreview } from './modules/listPreview.js';
import { initMobileAndPlatformFeatures } from './modules/mobileMenu.js';
import { initMindmapDrag } from './modules/mindmapDrag.js';
import { initSuperBlockResizer } from './modules/superBlockResizer.js';

let savorInitPromise = null;
let savorInitialized = false;

const initAll = async () => {
    if (savorInitPromise) return savorInitPromise;

    // 允许切换到其他主题后再切回 Savor 时重新构建主题 UI。
    if (savorInitialized) {
        try {
            window.destroyTheme?.();
        } catch (error) {
            // 清理失败时继续尝试重建
        }
        savorInitialized = false;
    }

    savorInitPromise = (async () => {
        try {
            initUtils();
            await initConfig();
            await initI18n();
            await initButtons();
            initTheme();
            initStatusBarHiding();
            initObservers();
            initTabbarVertical();
            initBulletThreadingModule();
            initTypewriterModeModule();
            initSidebarMemoModule();
            initListPreview();
            initMobileAndPlatformFeatures();
            savorInitialized = true;
        } catch (error) {
            // 初始化失败: error
        } finally {
            savorInitPromise = null;
        }
    })();

    return savorInitPromise;
};

export const Savor = {
    initUtils,
    initConfig,
    initI18n,
    initButtons,
    initTheme,
    initStatusBarHiding,
    initObservers,
    initTabbarVertical,
    initBulletThreadingModule,
    initTypewriterModeModule,
    initSidebarMemoModule,
    initListPreview,
    initMobileAndPlatformFeatures,
    initMindmapDrag,
    initSuperBlockResizer,
    initAll
};

export {
    initUtils,
    initConfig,
    initI18n,
    initButtons,
    initTheme,
    initStatusBarHiding,
    initObservers,
    initTabbarVertical,
    initBulletThreadingModule,
    initTypewriterModeModule,
    initSidebarMemoModule,
    initListPreview,
    initMobileAndPlatformFeatures,
    initMindmapDrag,
    initSuperBlockResizer
};

export { initAll };
