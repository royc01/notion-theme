// ========================================
// 移动端菜单模块
// ========================================

import { renderAllButtons } from './themeSetting.js';

/**
 * 判断是否为移动端设备
 * @returns {boolean} 是否为移动端
 */
const isPhone = () => {
    return !!document.getElementById("editor");
};

/**
 * 初始化移动端菜单
 */
const initMobileMenu = () => {
    // 只在移动端设备上初始化
    if (!isPhone()) return;
    
    document.body.classList.add("body--mobile");
    
    const waitForElement = (selector, timeout = 5000) => {
        return new Promise((resolve) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                return;
            }

            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    };

    waitForElement("#toolbarMore").then(toolbarMore => {
        if (!toolbarMore || document.getElementById("savorToolbar")) return;

        const savorToolbar = document.createElement("div");
        savorToolbar.id = "savorToolbar";
        savorToolbar.style.cssText = `
            position: fixed;
            top: 56px;
            right: 16px;
            z-index: 9999;
            background: var(--Sv-menu-background);
            border-radius: 12px;
            box-shadow: 0 2px 16px rgba(0,0,0,0.18);
            padding: 10px 8px;
            display: none;
            min-width: 140px;
        `;

        if (!document.getElementById("savorToolbarToggle")) {
            const toggleBtn = document.createElement("button");
            toggleBtn.id = "savorToolbarToggle";
            toggleBtn.innerHTML = 
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="var(--b3-theme-on-surface)" d="M20,8.18V3a1,1,0,0,0-2,0V8.18a3,3,0,0,0,0,5.64V21a1,1,0,0,0,2,0V13.82a3,3,0,0,0,0-5.64ZM19,12a1,1,0,1,1,1-1A1,1,0,0,1,19,12Zm-6,2.18V3a1,1,0,0,0-2,0V14.18a3,3,0,0,0,0,5.64V21a1,1,0,0,0,2,0V19.82a3,3,0,0,0,0-5.64ZM12,18a1,1,0,1,1,1-1A1,1,0,0,1,12,18ZM6,6.18V3A1,1,0,0,0,4,3V6.18a3,3,0,0,0,0,5.64V21a1,1,0,0,0,2,0V11.82A3,3,0,0,0,6,6.18ZM5,10A1,1,0,1,1,6,9,1,1,0,0,1,5,10Z"/></svg>`;
            toggleBtn.style.cssText = `
                background-color: transparent;
                position: relative;
                width: 32px;
                height: 32px;
                border: none;
                top: 0;
                right: 0;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            toggleBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                savorToolbar.style.display = (savorToolbar.style.display === "none" ? "grid" : "none");
            });

            toolbarMore.parentNode.insertBefore(toggleBtn, toolbarMore);

            document.addEventListener("click", (e) => {
                if (!savorToolbar.contains(e.target) && e.target !== toggleBtn) {
                    savorToolbar.style.display = "none";
                }
            });
        }

        toolbarMore.parentNode.insertBefore(savorToolbar, toolbarMore);

        initMobileThemeButtons(savorToolbar);
    });
};

/**
 * 初始化移动端主题按钮
 * @param {HTMLElement} savorToolbar - 工具栏容器元素
 */
const initMobileThemeButtons = (savorToolbar) => {
    // 移动端也使用统一的按钮渲染
    renderAllButtons(savorToolbar);
};

/**
 * 初始化移动端和平台相关功能
 */
export const initMobileAndPlatformFeatures = () => {
    // 添加移动端相关类名
    if (isPhone()) {
        document.body.classList.add("body--mobile");
        // 延迟初始化移动端菜单，确保DOM元素已加载
        setTimeout(() => {
            initMobileMenu();
        }, 1000);
    }

    // 添加Mac相关类名
    if (navigator.platform.toUpperCase().indexOf("MAC") > -1) {
        document.body.classList.add("body--mac");
    }
};

// 清理移动端菜单功能
export const cleanupMobileMenu = () => {
    // 移除添加的元素和类名
    document.body.classList.remove("body--mobile");
    document.body.classList.remove("body--mac");
    
    // 移除移动端菜单元素
    const savorToolbar = document.getElementById("savorToolbar");
    if (savorToolbar) {
        savorToolbar.remove();
    }
    
    const savorToolbarToggle = document.getElementById("savorToolbarToggle");
    if (savorToolbarToggle) {
        savorToolbarToggle.remove();
    }
};
