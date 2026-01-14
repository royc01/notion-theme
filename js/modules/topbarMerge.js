// ========================================
// 顶栏合并左右间距功能模块
// ========================================

import { debounce, throttle } from './utils.js';

// 存储观察器实例
let rightPanelObserver = null;
let leftPanelObserver = null;
let dockVerticalObserver = null;
let layoutCenterObserver = null;

// 存储更新函数
let updateRightMargins = null;
let updateLeftMargins = null;

// 检测是否为 macOS 平台
const isMacOS = () => {
    return navigator.userAgent.includes('Macintosh') || navigator.userAgent.includes('Mac OS X');
};

/**
 * 初始化顶栏合并左右间距功能
 * @param {string} direction - 方向，"right" 或 "left"
 */
export const initTabBarsMarginUnified = (direction = "right") => {
    const isRight = direction === "right";

    // 更新边距的函数
    const updateMargins = () => {
        const isTopbarMerged = document.documentElement.getAttribute('savor-tabbar') === 'merge';
        const tabBarSelector = isRight
            ? ".layout__center .layout-tab-bar--readonly"
            : ".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)";
        const allTabBars = document.querySelectorAll(tabBarSelector);

        if (!isTopbarMerged) {
            allTabBars.forEach(tabBar => {
                tabBar.style[isRight ? "marginRight" : "marginLeft"] = "0px";
            });
            return;
        }

        // 获取窗口和drag元素的位置信息
        const drag = document.getElementById("drag");
        let marginValue = "0px";
        
        if (drag) {
            if (isRight) {
                // 计算 #drag 到窗口右边界的距离
                const dragRect = drag.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                let distanceToWindowRight = windowWidth - dragRect.right;
                
                // 减去右侧dock的宽度
                const rightDock = document.querySelector(".layout__dockr");
                const rightDockWidth = rightDock?.classList.contains("layout--float")
                    ? rightDock.querySelector(".dock")?.offsetWidth ?? 0
                    : rightDock?.offsetWidth ?? 0;
                const rightDockSelector = "#dockRight";
                const rightDockRealWidth = document.querySelector(rightDockSelector)?.offsetWidth ?? 0;
                
                distanceToWindowRight -= (rightDockWidth + rightDockRealWidth);
                
                // 如果结果是负数，直接为0
                distanceToWindowRight = Math.max(0, distanceToWindowRight);
                
                marginValue = `${distanceToWindowRight}px`;
            } else {
                // 计算 #drag 到窗口左边界的距离
                const dragRect = drag.getBoundingClientRect();
                let distanceToWindowLeft = dragRect.left;
                
                // 减去左侧dock的宽度
                const leftDock = document.querySelector(".layout__dockl");
                const leftDockWidth = leftDock?.classList.contains("layout--float")
                    ? leftDock.querySelector(".dock")?.offsetWidth ?? 0
                    : leftDock?.offsetWidth ?? 0;
                const leftDockSelector = "#dockLeft";
                const leftDockRealWidth = document.querySelector(leftDockSelector)?.offsetWidth ?? 0;
                
                distanceToWindowLeft -= (leftDockWidth + leftDockRealWidth);
                
                // 如果结果是负数，直接为0
                distanceToWindowLeft = Math.max(0, distanceToWindowLeft);
                
                marginValue = `${distanceToWindowLeft}px`;
            }
        }

        // 应用 margin
        if (isRight) {
            allTabBars.forEach(tabBar => tabBar.style.marginRight = "0px");
            const resizers = document.querySelectorAll(".layout__center .layout__resize:not(.layout__resize--lr)");
            if (resizers.length === 0) {
                const lastTabBar = allTabBars[allTabBars.length - 1];
                if (lastTabBar && (lastTabBar.closest(".layout__dockr") || lastTabBar.closest(".layout__center"))) {
                    lastTabBar.style.marginRight = marginValue;
                }
            } else {
                resizers.forEach(resizer => {
                    let prevElement = resizer.previousElementSibling;
                    if (!prevElement) return;
                    const prevTabBars = prevElement.querySelectorAll(".layout-tab-bar--readonly");
                    if (prevTabBars.length > 0) {
                        const lastTabBar = prevTabBars[prevTabBars.length - 1];
                        if (lastTabBar.closest(".layout__dockr") || lastTabBar.closest(".layout__center")) {
                            lastTabBar.style.marginRight = marginValue;
                        }
                    }
                });
            }
        } else {
            const firstTabBar = allTabBars[0];
            if (firstTabBar) {
                firstTabBar.style.marginLeft = marginValue;
            }
        }
    };

    // 为右/左侧分别存储更新函数
    if (isRight) {
        updateRightMargins = updateMargins;
        window.updateTabBarsMargin = updateMargins;
    } else {
        updateLeftMargins = updateMargins;
        window.updateTabBarsMarginLeft = updateMargins;
    }

    // observer 只初始化一次
    const dockSelector = isRight ? ".layout__dockr" : ".layout__dockl";
    const dockVerticalSelector = ".dock--vertical";
    
    // 创建观察器
    const panelObserver = new ResizeObserver(updateMargins);
    const dockVerticalObserverInstance = new MutationObserver(updateMargins);

    function observeDock() {
        const dock = document.querySelector(dockSelector);
        if (dock) panelObserver.observe(dock);
        const dockVertical = document.querySelector(dockVerticalSelector);
        if (dockVertical) {
            dockVerticalObserverInstance.observe(dockVertical, {
                attributes: true,
                attributeFilter: ["class"]
            });
        }
    }

    // 监听 body 结构变化，dock/dockVertical 变化时重新 observe
    new MutationObserver(() => {
        panelObserver.disconnect();
        dockVerticalObserverInstance.disconnect();
        observeDock();
        updateMargins();
    }).observe(document.body, { childList: true, subtree: true });

    // 主题和页面加载时刷新
    window.addEventListener("load", updateMargins);
    document.addEventListener("themechange", updateMargins);

    // 首次初始化
    observeDock();
    updateMargins();
    setTimeout(updateMargins, 500);
    setTimeout(updateMargins, 1000);

    // 存储观察器实例以便后续清理
    if (isRight) {
        rightPanelObserver = panelObserver;
        dockVerticalObserver = dockVerticalObserverInstance;
    } else {
        leftPanelObserver = panelObserver;
    }
};

/**
 * 清理顶栏合并状态的辅助函数
 */
export const cleanupTopbarMerge = () => {
    // 断开观察器
    if (rightPanelObserver) {
        rightPanelObserver.disconnect();
        rightPanelObserver = null;
    }
    if (leftPanelObserver) {
        leftPanelObserver.disconnect();
        leftPanelObserver = null;
    }
    if (dockVerticalObserver) {
        dockVerticalObserver.disconnect();
        dockVerticalObserver = null;
    }
    if (layoutCenterObserver) {
        layoutCenterObserver.disconnect();
        layoutCenterObserver = null;
    }

    // 重置边距（参考旧版本实现）
    document.querySelectorAll(".layout__center .layout-tab-bar--readonly").forEach(tabBar => { 
        tabBar.style.marginRight = "0px"; 
    });
    document.querySelectorAll(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)").forEach(tabBar => { 
        tabBar.style.marginLeft = "0px"; 
    });

    // 清理全局变量
    if (window.updateTabBarsMargin) { 
        window.updateTabBarsMargin = null; 
    }
    if (window.updateTabBarsMarginLeft) { 
        window.updateTabBarsMarginLeft = null; 
    }
    if (window._tabBarsResizeObserver) { 
        window._tabBarsResizeObserver.disconnect(); 
        window._tabBarsResizeObserver = null; 
    }
};

/**
 * 初始化左右两侧的顶栏合并功能
 */
export const initTopbarMergeMargins = () => {
    initTabBarsMarginUnified("right");
    initTabBarsMarginUnified("left");

    // layoutCenter observer 保留
    const layoutCenter = document.querySelector(".layout__center");
    if (layoutCenter) {
        let marginUpdateTimer = null;
        const resizeObserver = new MutationObserver(() => {
            if (marginUpdateTimer) return;
            marginUpdateTimer = requestAnimationFrame(() => {
                window.updateTabBarsMargin?.();
                window.updateTabBarsMarginLeft?.();
                marginUpdateTimer = null;
            });
        });
        resizeObserver.observe(layoutCenter, { childList: true, subtree: true });
        layoutCenterObserver = resizeObserver;
        window._tabBarsResizeObserver = resizeObserver;
    }
};

// 初始化功能
initTopbarMergeMargins();