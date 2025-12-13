// ========================================
// 主题功能模块
// ========================================

import { $, debounce, throttle } from './utils.js';
import { config } from './config.js';
import { getAllButtons } from './buttons.js';
import { initTabBarsMarginUnified, cleanupTopbarMerge } from './topbarMerge.js';
import { initMiddleClickCollapse, cleanupMiddleClickCollapse } from './middleClickCollapse.js';
import { initViewSelect, cleanupViewSelect } from './viewSelect.js';
import { initMindmapDrag } from './mindmapDrag.js';
import { initPlatformDetection, cleanupPlatformDetection } from './platform.js';
import { initSlashMenuNavigation } from './slashMenuNav.js';
import { initSuperBlockResizer } from './superBlockResizer.js';
import { initMobileAndPlatformFeatures, cleanupMobileMenu } from './mobileMenu.js';

// 主题相关变量
let featureButtonsActive = new Set();
let domCache = new Map();
let menuListeners = new WeakMap();

// 获取缓存元素
const getCachedElement = (selector) => {
    if (!domCache.has(selector)) {
        domCache.set(selector, document.querySelector(selector));
    }
    return domCache.get(selector);
};

// 获取配置项
const getItem = config.get;

// 应用记住的主题样式
export const applyRememberedThemeStyle = async (skipFeatures = false) => {
    // 只应用当前主题模式的主题，而不是同时应用light和dark
    const currentThemeMode = window.theme.themeMode;
    
    // 处理主题组
    const themeButtons = getAllButtons().filter(btn => btn.type === 'theme' && btn.group === currentThemeMode);
    const [rememberedButton, defaultButton] = themeButtons.reduce((acc, btn) => {
        if (config.get(btn.id) === "1") acc[0] = btn;
        if (btn.styleId === (currentThemeMode === 'light' ? 'Sv-theme-color-light' : 'Sv-theme-color-dark')) acc[1] = btn;
        return acc;
    }, [null, null]);
    
    // 先清理所有主题的savor-theme属性
    getAllButtons().filter(btn => btn.type === 'theme').forEach(btn => btn.onDisable?.());
    
    // 启用记住的主题或默认主题
    const buttonToEnable = rememberedButton || defaultButton;
    buttonToEnable?.onEnable?.();
    
    // 处理彩色标题功能（特定主题使用）
    const currentTheme = buttonToEnable?.styleId || (currentThemeMode === 'light' ? 'Sv-theme-color-light' : 'Sv-theme-color-dark');
    updateColorfulHeading(currentTheme);
    
    // 更新按钮状态
    const savorToolbar = document.getElementById("savorToolbar");
    savorToolbar?.querySelectorAll('.b3-menu__item').forEach(btn => btn.classList.remove('button_on'));
    
    // 为记住的主题按钮添加激活状态
    document.getElementById(buttonToEnable?.id)?.classList.add('button_on');
    
    if (!skipFeatures) {
        await applyRememberedFeatures();
    }
};

// 应用记住的功能
const applyRememberedFeatures = async () => {
    for (const btn of getAllButtons()) {
        if (btn.type === 'feature' && config.get(btn.attrName) === "1") {
            featureButtonsActive.add(btn.id);
            
            const button = document.getElementById(btn.id);
            button?.classList.add("button_on");
            
            // 现在所有功能都通过属性控制，不需要加载 CSS
            btn.onEnable?.();
        }
    }
    
    // 确保超级块宽度调节功能已初始化
    if (typeof window.superBlockResizer?.start === 'function') {
        window.superBlockResizer.start();
    } else if (typeof window.initSuperBlockResizer === 'function') {
        window.initSuperBlockResizer();
    }
};

// 主题组工具函数
const getThemeGroupButtons = (group) => getAllButtons().filter(btn => btn.type === 'theme' && btn.group === group);
const forEachThemeInGroup = (group, fn) => getThemeGroupButtons(group).forEach(fn);
const disableThemeGroup = (group) => forEachThemeInGroup(group, b => b.onDisable?.());
const clearRememberedThemeGroup = (group) => forEachThemeInGroup(group, b => config.set(b.id, "0"));
const unmarkThemeGroupButtons = (group) => forEachThemeInGroup(group, b => document.getElementById(b.id)?.classList.remove('button_on'));
const markThemeButton = (id) => document.getElementById(id)?.classList.add('button_on');

// 应用主题组
export const applyThemeForGroup = async (group, btn) => {
    window.theme.applyThemeTransition(async () => {
        disableThemeGroup(group);
        btn.onEnable?.();
        updateColorfulHeading(btn.styleId);
        await applyRememberedFeatures();
        setTimeout(() => { window.statusObserver?.updatePosition?.(); }, 100);
    });
    clearRememberedThemeGroup(group);
    config.set(btn.id, "1");
};

// 渲染所有按钮
export const renderAllButtons = (targetToolbar = null) => {
    const savorToolbar = targetToolbar || document.getElementById("savorToolbar");
    if (!savorToolbar) return;
    savorToolbar.innerHTML = "";
    const fragment = document.createDocumentFragment();

    // 先配色后功能
    const themeMode = window.theme.themeMode;
    // 根据当前模式显示对应组的主题按钮
    const [themeButtons, featureButtons] = getAllButtons().reduce((acc, btn) => {
        if (btn.type === 'theme' && btn.group === themeMode) acc[0].push(btn);
        else if (btn.type === 'feature') acc[1].push(btn);
        return acc;
    }, [[], []]);
    const buttons = [...themeButtons, ...featureButtons];

    buttons.forEach(btn => {
        const button = document.createElement("button");
        button.id = btn.id;
        button.className = "b3-menu__item savor-button";
        button.setAttribute("aria-label", btn.label);
        
        // 根据按钮类型使用不同的 SVG 处理方式
        if (btn.type === 'theme') {
            // 主题按钮使用完整的 SVG 结构
            button.innerHTML = `<svg class="b3-menu__icon savor-icon" viewBox="1 1 55 31" xmlns="http://www.w3.org/2000/svg">${btn.svg}</svg><span class="b3-menu__label">${btn.label}</span>`;
        } else {
            // 功能按钮使用路径数据
            button.innerHTML = `<svg class="b3-menu__icon savor-icon" viewBox="9 10 14 14" xmlns="http://www.w3.org/2000/svg"><path d="${btn.svg}"></path></svg><span class="b3-menu__label">${btn.label}</span>`;
        }
        
        button.setAttribute("data-type", btn.type);
        // 状态高亮
        const isActivated = (btn.type === 'theme' && config.get(btn.id) === "1") || 
                          (btn.type === 'feature' && getItem(btn.attrName) === "1");
        if (isActivated) {
            button.classList.add("button_on");
        }

        // 点击逻辑
        button.addEventListener("click", async () => {
            if (btn.type === 'theme') {
                const currentGroup = btn.group;
                if (currentGroup) {
                    unmarkThemeGroupButtons(currentGroup);
                }
                button.classList.add('button_on');
                await applyThemeForGroup(currentGroup, btn);
            } else if (btn.type === 'feature') {
                const isActive = button.classList.contains("button_on");
                if (isActive) {
                    button.classList.remove("button_on");
                    document.getElementById(btn.styleId)?.remove();
                    btn.onDisable?.();
                    config.set(btn.attrName, "0");
                } else {
                    button.classList.add("button_on");
                    // 现在所有功能都通过属性控制，不需要加载 CSS
                    btn.onEnable?.();
                    config.set(btn.attrName, "1");
                }
            }
        });
        fragment.appendChild(button);
    });
    savorToolbar.appendChild(fragment);
};

// 工具栏和观察器管理
const shouldShowSavorToolbar = () => {
    const mode = window.theme.themeMode;
    return document.documentElement.getAttribute(`data-${mode}-theme`) === "Savor";
};

const handleMenuClick = (e) => {
    const menuItem = e.target.closest(".b3-menu__item");
    if (!menuItem) return;
    
    const buttonText = menuItem.textContent.trim();
    const { themeLight, themeDark, themeOS } = window.siyuan.languages;
    
    // 简化条件判断
    if (![themeLight, themeDark, themeOS].includes(buttonText)) return;
    
    let targetMode = buttonText === themeOS ? 
        (window.matchMedia("(prefers-color-scheme: light)").matches ? themeLight : themeDark) : 
        buttonText;
    
    const currentMode = window.siyuan.config.appearance.mode === 0 ? themeLight : themeDark;
    if (targetMode === currentMode) return;
    
    const targetTheme = targetMode === themeLight ? window.siyuan.config.appearance.themeLight : window.siyuan.config.appearance.themeDark;
    if (targetTheme !== "Savor") return;
    
    window.theme.applyThemeTransition(() => {});
};

export const toggleMenuListener = (commonMenu, add = true) => {
    if (add && !menuListeners.has(commonMenu)) {
        menuListeners.set(commonMenu, handleMenuClick);
        commonMenu.addEventListener("click", handleMenuClick, true);
    } else if (!add && menuListeners.has(commonMenu)) {
        const listener = menuListeners.get(commonMenu);
        commonMenu.removeEventListener("click", listener, true);
        menuListeners.delete(commonMenu);
    }
};

// 通过 CSS 控制 savorToolbar 的可见性
const ensureSavorToolbarCSS = () => {
    const id = "savor-toolbar-visibility";
    let st = document.getElementById(id);
    if (!st) { 
        st = document.createElement("style"); 
        st.id = id; 
        st.textContent = `
            #commonMenu[data-name="barmode"] #savorToolbar {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
            }
        `;
        document.head.appendChild(st); 
    }
};

// 初始化工具栏
export const initSavorToolbar = () => {
    ensureSavorToolbarCSS();
    // 移动端不创建桌面工具栏
    if (window.SavorPlatform?.isMobile?.() || document.getElementById("savorToolbar")) return;
    
    const commonMenu = document.getElementById("commonMenu");
    if (!commonMenu || !shouldShowSavorToolbar()) return;
    
    const savorToolbar = document.createElement("div");
    savorToolbar.id = "savorToolbar";
    // 简化：始终插入为 #commonMenu 的第一个子元素
    commonMenu.insertBefore(savorToolbar, commonMenu.firstChild);
    
    renderAllButtons();
    requestAnimationFrame(() => applyRememberedThemeStyle());
};

// 底栏悬浮
export const initStatusPosition = () => {
    let lastOffset = null;
    const updatePosition = () => {
        const status = Savor$("#status");
        if (!status) return;
        const dockr = Savor$(".layout__dockr"), dockVertical = Savor$(".dock--vertical");
        const dockrWidth = dockr?.offsetWidth || 0;
        const isFloating = dockr?.classList.contains("layout--float");
        const dockVerticalWidth = (!dockVertical || dockVertical.classList.contains("fn__none")) ? 0 : 26;
        // 简化offset计算
        const baseOffset = dockVerticalWidth ? dockVerticalWidth + 16 : 9;
        const offset = (!dockrWidth || isFloating) ? baseOffset : dockrWidth + baseOffset;
        const layoutCenter = document.querySelector('.layout__center');
        status.style.maxWidth = layoutCenter ? `${layoutCenter.offsetWidth - 8}px` : '';
        if (lastOffset !== offset) status.style.transform = `translateX(-${offset}px)`;
        lastOffset = offset;
    };
    const observer = new ResizeObserver(throttle(updatePosition, 16));
    [".layout__dockr", ".dock--vertical", ".layout__center"].forEach(sel => { const el = Savor$(sel); el && observer.observe(el); });
    window.statusObserver = observer;
    window.statusObserver.updatePosition = updatePosition;
    updatePosition();
};

// 初始化主题观察器
export const initThemeObserver = () => {
    let previousThemeMode = window.theme.themeMode;
    let previousThemeName = shouldShowSavorToolbar() ? "Savor" : null;
    
    const themeObserver = new MutationObserver(debounce(() => {
        const newThemeMode = window.siyuan.config.appearance.mode === 0 ? "light" : "dark";
        const html = document.documentElement;
        const newThemeName = html.getAttribute(`data-${newThemeMode}-theme`);
        
        if (previousThemeMode === newThemeMode && previousThemeName === newThemeName) return;
        
        const isSavorToSavor = previousThemeName === "Savor" && newThemeName === "Savor";
        
        const commonMenu = getCachedElement("#commonMenu");
        const existingSavorToolbar = document.getElementById("savorToolbar");
        
        if (commonMenu?.getAttribute("data-name") === "barmode") {
            if (shouldShowSavorToolbar()) {
                if (!existingSavorToolbar) {
                    initSavorToolbar();
                } else {
                    window.theme.applyThemeTransition(async () => {
                        renderAllButtons();
                        await applyRememberedThemeStyle(isSavorToSavor);
                    });
                }
            } else if (existingSavorToolbar) {
                // 不再移除，交由 CSS 控制显示
            }
            
            // 确保超级块调节功能在主题切换后正常工作
            try {
                if (typeof window.superBlockResizer?.refresh === 'function') {
                    setTimeout(() => window.superBlockResizer.refresh(), 100);
                }
            } catch (e) {
                // 超级块调节功能刷新出错: e
            }
        }
        
        previousThemeMode = newThemeMode;
        previousThemeName = newThemeName;
    }, 16));
    
    themeObserver.observe(document.documentElement, { 
        attributes: true,
        attributeFilter: ["data-theme-mode", "data-light-theme", "data-dark-theme", "class", "data-mode"]
    });
};

// topBarPlugin 菜单调整
export const initTopBarPluginMenuObserver = () => {
    window.topBarPluginMenuObserver = new MutationObserver(() => {
        const commonMenu = document.getElementById("commonMenu");
        if (!commonMenu || commonMenu.getAttribute("data-name") !== "topBarPlugin") return;
        
        commonMenu.querySelectorAll(".b3-menu__submenu").forEach(submenu => {
            const parentItem = submenu.parentElement;
            const buttons = Array.from(submenu.querySelectorAll(".b3-menu__item"));
            
            buttons.forEach(btn => {
                btn.classList.add("submenu-inline");
                const iconSmall = parentItem.querySelector(".b3-menu__icon--small");
                
                // 根据图标位置决定按钮插入位置
                if (iconSmall) {
                    const insertRef = iconSmall.nextSibling || parentItem;
                    (insertRef === parentItem ? insertRef.appendChild : insertRef.parentElement.insertBefore)
                        .call(insertRef === parentItem ? insertRef : insertRef.parentElement, btn, insertRef);
                } else {
                    parentItem.appendChild(btn);
                }
            });
            
            // 如果子菜单为空则移除
            if (!submenu.querySelector(".b3-menu__item")) submenu.remove();
        });
    });
    
    const _topBarObserveTarget = document.getElementById("commonMenu") || document.body;
    window.topBarPluginMenuObserver.observe(_topBarObserveTarget, { childList: true, subtree: true });
};

// 主题清理函数
export const destroyTheme = () => {     
    // 清理功能按钮和全局变量
    window.allButtons?.forEach(btn => btn.type === 'feature' && Savor$(`#${btn.id}`)?.remove());
    window.featureButtonsActive?.clear();
    Object.assign(window, {
        tabBarsMarginInitialized: false,
        updateTabBarsMargin: null,
        updateTabBarsMarginLeft: null
    });
    
    // 断开观察器
    [window.statusObserver, window.topBarPluginMenuObserver].forEach(obs => obs?.disconnect());

    // 清理DOM和样式
    Savor$$('[id^="Sv-theme-color"], #savorToolbar, #savor-toolbar-visibility').forEach(el => el.remove());
    Savor$('#status')?.style.setProperty('transform', '');
    Savor$('#status')?.style.setProperty('max-width', '');

    // 清理缓存和属性
    window.domCache?.clear();
    Savor$('#commonMenu') && window.toggleMenuListener?.(Savor$('#commonMenu'), false);
    document.documentElement.removeAttribute('savor-theme');
    document.documentElement.removeAttribute('savor-tabbar');

    // 统一清理所有功能模块
    const cleanupFunctions = [
        'cleanupTopbarMerge',
        'cleanupTabbarVertical',
        'cleanupBulletThreading',
        'cleanupTypewriterMode',
        'cleanupSidebarMemo',
        'cleanupMiddleClickCollapse',
        'cleanupPlatformDetection',
        'cleanupMobileMenu',
        'disableListPreview'
    ];
    
    cleanupFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            try {
                window[funcName]();
            } catch (e) {
                // ${funcName}执行失败: e
            }
        }
    });
    
    // 清理视图选择功能
    try {
        if (typeof cleanupViewSelect === 'function') {
            cleanupViewSelect();
        }
    } catch (e) {
        // [Savor] 清理视图选择功能时出错: ${e.message}
    }
    
    // 重新初始化超级块宽度调节功能
    try {
        // 停止功能
        if (typeof window.superBlockResizer?.stop === 'function') {
            window.superBlockResizer.stop();
        }
        
        // 移除样式
        const styleElement = document.getElementById('sb-resizer-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        // 重新初始化功能
        window.superBlockResizer = null;
        if (typeof window.initSuperBlockResizer === 'function') {
            window.initSuperBlockResizer();
        }
    } catch (e) {
        // [Savor] 重新初始化超级块宽度调节功能时出错: ${e.message}
    }
    
    // 清理导图拖拽功能
    try {
        // 直接调用导图模块的清理函数
        if (typeof window.cleanupMindmapDrag === 'function') {
            window.cleanupMindmapDrag();
        }
    } catch (e) {
        // [Savor] 清理导图拖拽功能时出错: ${e.message}
    }
    
    // 清理彩色标题样式元素
    const colorfulHeadingStyle = document.getElementById("snippet-SvcolorfulHeading");
    if (colorfulHeadingStyle) {
        colorfulHeadingStyle.remove();
    }
    
    // 额外清理可能存在的定时器
    if (window._tabBarUpdateTimer) {
        clearTimeout(window._tabBarUpdateTimer);
        window._tabBarUpdateTimer = null;
    }
    
    // 清理可能存在的其他全局变量
    window._tabBarsResizeObserver = null;
    window.updateTabBarsMargin = null;
    window.updateTabBarsMarginLeft = null;
};

// 初始化主题功能
export const initTheme = () => { 
    // [Savor] 初始化主题功能
    
    // 将函数添加到全局作用域
    Object.assign(window, {
        applyRememberedThemeStyle,
        applyThemeForGroup,
        renderAllButtons,
        initSavorToolbar,
        initStatusPosition,
        initThemeObserver,
        initTopBarPluginMenuObserver,
        toggleMenuListener,
        destroyTheme
    });
    
    // 添加window.theme对象
    if (!window.theme) {
        window.theme = {
            get config() { return config.data; },
            get themeMode() { return window.siyuan?.config?.appearance?.mode === 0 ? 'light' : 'dark'; },

            applyThemeTransition: (callback) => {
                const status = Savor$('#status');
                const currentTransform = status?.style.transform;
                
                // 简化回调执行逻辑
                const executeCallback = () => {
                    callback?.();
                    if (status && currentTransform) {
                        setTimeout(() => status.style.transform = currentTransform, 50);
                    }
                };
                
                (document.startViewTransition && document.startViewTransition(executeCallback)) || executeCallback();
            },

            findEditableParent: (node) => {
                const editableSelectors = ['[contenteditable="true"]', '.protyle-wysiwyg'];
                return editableSelectors.reduce((found, selector) => 
                    found || node.closest(selector), null);
            },

            createElementEx: (refElement, tag, id = null, mode = 'append') => {
                if (!refElement || !tag) {
                    // [Savor] 参考元素或标签名不存在
                    return null;
                }
                
                const el = document.createElement(tag);
                if (id) el.id = id;
                
                try {
                    const insertModes = {
                        append: () => refElement.appendChild(el),
                        prepend: () => refElement.insertBefore(el, refElement.firstChild),
                        before: () => refElement.parentElement.insertBefore(el, refElement)
                    };
                    
                    insertModes[mode]?.();
                    return el;
                } catch (error) {
                    // [Savor] 创建元素失败: ${error.message}
                    return null;
                }
            },

            BodyEventRunFun: (eventStr, fun, accurate = 100, delay = 0, frequency = 1, frequencydelay = 16) => {
                let isMove = false;
                let _e = null;
                
                window.theme.EventUtil.on(document.body, eventStr, (e) => { 
                    isMove = true; 
                    _e = e; 
                });
                
                setInterval(() => {
                    if (!isMove) return;
                    isMove = false;
                    
                    setTimeout(() => {
                        fun(_e);
                        if (frequency === 1) return;
                        
                        const minDelay = Math.max(16, frequencydelay);
                        for (let i = 1; i < frequency; i++) {
                            setTimeout(() => fun(_e), minDelay * i);
                        }
                    }, delay);
                }, accurate);
            },

            EventUtil: {
                on: (element, type, handler) => element?.addEventListener?.(type, handler, false),
                off: (element, type, handler) => element?.removeEventListener?.(type, handler, false)
            },

            findAncestor: (element, fn, maxDepth = 50) => {
                let depth = 0, parent = element?.parentElement;
                while (parent && depth < maxDepth) {
                    if (fn(parent)) return parent;
                    parent = parent.parentElement;
                    depth++;
                }
                return null;
            },
            
            isSiyuanFloatingWindow: (element) => 
                window.theme.findAncestor(element, v => v.getAttribute("data-oid") != null),
            
            setBlockFold: (id, fold) => {
                if (!id || (window._lastFoldedId === id && window._lastFoldedState === fold)) return;
                window._lastFoldedId = id; window._lastFoldedState = fold;
                设置思源块属性(id, { fold });
            },
            
            // 顶栏合并功能相关函数
            initTabBarsMarginUnified,
            cleanupTopbarMerge
        };
    }
    
    // 添加平台检测功能到window.theme对象
    window.theme.initPlatformDetection = initPlatformDetection;
    window.theme.cleanupPlatformDetection = cleanupPlatformDetection;
    
    // 添加各功能模块的清理函数到window.theme对象
    Object.assign(window.theme, {
        cleanupTabbarVertical: window.cleanupTabbarVertical,
        cleanupBulletThreading: window.cleanupBulletThreading,
        cleanupTypewriterMode: window.cleanupTypewriterMode,
        cleanupSidebarMemo: window.cleanupSidebarMemo,
        cleanupMiddleClickCollapse: cleanupMiddleClickCollapse
    });
    
    // 初始化topBarPlugin菜单观察器
    initTopBarPluginMenuObserver();
    
    // 初始化鼠标中键折叠/展开功能
    initMiddleClickCollapse();
    
    // 初始化视图选择UI功能
    initViewSelect();
    
    // 初始化导图拖拽功能
    initMindmapDrag();
    
    // 初始化平台检测功能
    initPlatformDetection();
    
    // 初始化斜杠菜单左右键导航功能
    initSlashMenuNavigation();
    
    // 初始化超级块宽度调节功能
    initSuperBlockResizer();
};

// 新增：统一处理彩色标题样式的工具函数，消除重复逻辑
const updateColorfulHeading = (styleId) => {
    const colorfulThemes = ["Sv-theme-color-sugar", "Sv-theme-color-flower"];
    if (colorfulThemes.includes(styleId)) {
        // 启用彩色标题样式（仅限亮色主题）
        let element = document.getElementById("snippet-SvcolorfulHeading");
        if (!element) {
            element = document.createElement("style");
            element.id = "snippet-SvcolorfulHeading";
            element.innerHTML = `
            :root[data-theme-mode="light"] {
                --Sv-h1: var(--h1-list-graphic);
                --Sv-h2: #8a7da0;
                --Sv-h3: var(--h3-list-graphic);
                --Sv-h4: var(--h4-list-graphic);
                --Sv-h5: #b6a277;
                --Sv-h6: var(--h6-list-graphic);
            }`;
            document.head.appendChild(element);
        }
    } else {
        // 移除彩色标题样式
        document.getElementById("snippet-SvcolorfulHeading")?.remove();
    }
};
