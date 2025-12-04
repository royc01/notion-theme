// ========================================
// Savor 主题模块化入口文件
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

// 创建统一的命名空间
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
    initAll: async () => {
        try {
            // 按顺序初始化所有模块
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
            // 视图选择UI功能已移除
            await initMindmapDrag();
            initSuperBlockResizer();
        } catch (error) {
            // 主题初始化失败: error
        }
    }
};

// 保持向后兼容性，单独导出函数
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
    // initViewSelect,
    initMindmapDrag,
    initSuperBlockResizer
};

// 主初始化函数
// 已移至Savor命名空间，此处仅为向后兼容
export const initAll = Savor.initAll;