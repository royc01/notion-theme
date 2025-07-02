(function () {

    // i18n 支持
    const i18n = (function() {
        // 只读取思源应用内语言设置
        let lang = (window.siyuan?.config?.lang || 'en').toLowerCase();
        if (lang === 'zh_cht') lang = 'zh_CHT';
        else if (lang.startsWith('zh')) lang = 'zh_CN';
        else lang = 'en';
        let dict = {};
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `/appearance/themes/Savor/i18n/${lang}.json`, false);
            xhr.send(null);
            if (xhr.status === 200) {
                dict = JSON.parse(xhr.responseText);
            }
        } catch (e) {
            dict = {};
        }
        return function(key) {
            return dict[key] || key;
        }
    })();

    // 预加载所有配色CSS
    const themeStyles = [
        { id: "Sv-theme-color-light", href: "/appearance/themes/Savor/style/theme/savor-light.css" },
        { id: "Sv-theme-color-dark", href: "/appearance/themes/Savor/style/theme/savor-dark.css" },
        { id: "Sv-theme-color-salt", href: "/appearance/themes/Savor/style/theme/savor-salt.css" },
        { id: "Sv-theme-color-sugar", href: "/appearance/themes/Savor/style/theme/savor-sugar.css" },
        { id: "Sv-theme-color-forest", href: "/appearance/themes/Savor/style/theme/savor-forest.css" },
        { id: "Sv-theme-color-flower", href: "/appearance/themes/Savor/style/theme/savor-flower.css" },
        { id: "Sv-theme-color-wind", href: "/appearance/themes/Savor/style/theme/savor-wind.css" },
        { id: "Sv-theme-color-vinegar", href: "/appearance/themes/Savor/style/theme/savor-vinegar.css" },
        { id: "Sv-theme-color-ocean", href: "/appearance/themes/Savor/style/theme/savor-ocean.css" },
        { id: "Sv-theme-color-mountain", href: "/appearance/themes/Savor/style/theme/savor-mountain.css" }
    ];
    function ensureAllThemeLinks() {
        themeStyles.forEach(style => {
            if (!document.getElementById(style.id)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = style.href;
                link.id = style.id;
                link.disabled = true;
                document.head.appendChild(link);
            }
        });
    }
    ensureAllThemeLinks();

    // 保证切换主题模式时配色 link 不会丢失
    const headObserver = new MutationObserver(() => {
        ensureAllThemeLinks();
    });
    headObserver.observe(document.head, { childList: true, subtree: false });

    function switchThemeStyle(themeId) {
        themeStyles.forEach(style => {
            const link = document.getElementById(style.id);
            if (link) link.disabled = (style.id !== themeId);
        });
    }

    function enableSvcolorfulHeading() {
        let styleElement = document.getElementById("snippet-SvcolorfulHeading");
        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = "snippet-SvcolorfulHeading";
            styleElement.innerHTML = `
            :root {
                --Sv-h1: var(--h1-list-graphic);
                --Sv-h2: #8a7da0;
                --Sv-h3: var(--h3-list-graphic);
                --Sv-h4: var(--h4-list-graphic);
                --Sv-h5: #b6a277;
                --Sv-h6: var(--h6-list-graphic);
            }`;
            document.head.appendChild(styleElement);
        }
    }

    function applyRememberedThemeStyle() {
        // 日志：开始执行 applyRememberedThemeStyle
        // console.log('[Savor] applyRememberedThemeStyle called');
        // console.log('[Savor] 当前 config:', window.theme.config);
        // console.log('[Savor] 当前 themeMode:', window.theme.themeMode);
        let rememberedId = null;
        if (window.theme.config) {
            if (window.theme.themeMode === 'light') {
                const lightThemeIds = ["buttonSavor-light", "buttonsalt", "buttonsugar", "buttonforest", "buttonflower", "buttonwind"];
                // console.log('[Savor] lightThemeIds:', lightThemeIds);
                for (const id of lightThemeIds) {
                    if (window.theme.config[id] === "1") {
                        rememberedId = id;
                        break;
                    }
                }
            } else {
                const darkThemeIds = ["buttonSavor-dark", "buttonvinegar", "buttonocean", "buttonmountain"];
                // console.log('[Savor] darkThemeIds:', darkThemeIds);
                for (const id of darkThemeIds) {
                    if (window.theme.config[id] === "1") {
                        rememberedId = id;
                        break;
                    }
                }
            }
        }
        // 默认用 light/dark
        let themeLinkId = 'Sv-theme-color-light';
        if (window.theme.themeMode === 'dark') themeLinkId = 'Sv-theme-color-dark';
        if (rememberedId) {
            themeLinkId = rememberedId.replace(/^button(Savor-)?/, 'Sv-theme-color-');
        }
        // console.log('[Savor] rememberedId:', rememberedId);
        // console.log('[Savor] 最终 themeLinkId:', themeLinkId);
        // 设置 disabled
        themeStyles.forEach(style => {
            const link = document.getElementById(style.id);
            if (link) link.disabled = (style.id !== themeLinkId);
        });
        // 更新按钮状态
        setTimeout(() => {
            const savorToolbar = document.getElementById("savorToolbar");
            if (savorToolbar) {
                savorToolbar.querySelectorAll('.b3-menu__item').forEach(btn => {
                    btn.classList.remove('button_on');
                });
                if (rememberedId) {
                    const activeButton = document.getElementById(rememberedId);
                    if (activeButton) {
                        activeButton.classList.add('button_on');
                    }
                }
            }
        }, 100);
    }







    window.theme = {
        ID_COLOR_STYLE: 'Sv-theme-color',
        config: {},
        themeMode: null,

    // 主题配色切换过渡效果
    applyThemeTransition: function(callback) {
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                if (typeof callback === "function") callback();
            });
        } else {
            if (typeof callback === "function") callback();
        }
    },
                
    // 添加鼠标中键折叠/展开相关函数
    findAncestor: function(element, fn, maxDepth = 50) {
        let depth = 0, parent = element?.parentElement;
        while (parent && depth < maxDepth) {
            if (fn(parent)) return parent;
            parent = parent.parentElement;
            depth++;
        }
        return null;
    },
    isSiyuanFloatingWindow: function(element) {
        return this.findAncestor(element, v => v.getAttribute("data-oid") != null);
    },
    setBlockFold: function(id, fold) {
        if (!id) return;
        if (window._lastFoldedId === id && window._lastFoldedState === fold) return;
        window._lastFoldedId = id;
        window._lastFoldedState = fold;
        fetch('/api/attr/setBlockAttrs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${window.siyuan?.config?.api?.token || ''}`
            },
            body: JSON.stringify({
                id,
                attrs: { fold }
            })
        });
    },
    
    // 初始化鼠标中键折叠/展开功能
    initCollapseExpand: function() {
        const DEBOUNCE_TIME = 300;
        let lastClickTime = 0;
        const self = this;

        document.body.addEventListener("mousedown", (e) => {
            // 只处理鼠标中键
            if (e.button !== 1 || e.shiftKey || e.altKey) return;

            // 防抖
            const now = Date.now();
            if (now - lastClickTime < DEBOUNCE_TIME) return;
            lastClickTime = now;

            // 查找可编辑父元素
            let target = findEditableParent(e.target);
            if (!target) return;

            e.preventDefault();

            // 判断折叠类型
            const parent = target.parentElement;
            const grandParent = parent?.parentElement;
            if (!parent) return;

            if (parent.getAttribute("data-type") === "NodeHeading") {
                // 标题
                if (grandParent?.getAttribute("data-type") === "NodeListItem") {
                    handleListItemCollapse(target);
                } else {
                    handleHeadingCollapse(target);
                }
            } else if (grandParent?.getAttribute("data-type") === "NodeListItem") {
                handleListItemCollapse(target);
            }
        });

        function findEditableParent(el) {
            while (el && el !== document.body) {
                if (el.getAttribute && el.getAttribute("contenteditable") != null) return el;
                el = el.parentElement;
            }
            return null;
        }

        function findElementByCondition(el, cond) {
            if (!el) return null;
            if (cond(el)) return el;
            for (const child of el.children || []) {
                const found = findElementByCondition(child, cond);
                if (found) return found;
            }
            return null;
        }

        function handleHeadingCollapse(el) {
            const protyle = findProtyleContainer(el);
            if (!protyle) return;
            const gutters = protyle.querySelector(".protyle-gutters");
            const foldBtn = findElementByCondition(gutters, v => v.getAttribute("data-type") === "fold");
            foldBtn?.click();
        }

        function findProtyleContainer(el) {
            const classes = ["protyle", "fn__flex-1 protyle", "block__edit fn__flex-1 protyle", "fn__flex-1 spread-search__preview protyle"];
            let cur = el, i = 0;
            while (cur && i++ < 20) {
                if (cur.className && classes.includes(cur.className)) return cur;
                cur = cur.parentElement;
            }
            return null;
        }

        function handleListItemCollapse(el) {
            // 悬浮窗特殊处理
            if (self.isSiyuanFloatingWindow(el)) {
                const listItem = self.findAncestor(el, v => v.classList.contains("li"), 7);
                if (listItem && !listItem.previousElementSibling) {
                    toggleFoldAttribute(listItem);
                    return;
                }
            }
            // 查找列表项
            let content = el;
            let depth = 0;
            while (content.getAttribute("contenteditable") == null && depth++ < 10) content = content.parentElement;
            const listItem = content?.parentElement?.parentElement;
            if (!listItem || listItem.children.length <= 3) return;
            const nodeId = listItem.getAttribute("data-node-id");
            if (!nodeId) return;
            const fold = listItem.getAttribute("fold");
            if (fold === "1") self.setBlockFold(nodeId, "0");
            else self.setBlockFold(nodeId, "1");
        }

        function toggleFoldAttribute(el) {
            const fold = el.getAttribute("fold");
            el.setAttribute("fold", fold === "1" ? "0" : "1");
        }
    }
};

/**----------------------------------列表折叠内容预览查看---------------------------------- */
function collapsedListPreview() {
    window.theme.BodyEventRunFun("mouseover", collapsedListPreviewEvent, 2000);
}

function collapsedListPreviewEvent() {
    // 获取所有折叠的列表项
    const foldedItems = [
        ...document.querySelectorAll(".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [data-node-id].li[fold='1']"),
        ...document.querySelectorAll("[data-oid] [data-node-id].li[fold='1']"),
        ...document.querySelectorAll("#searchPreview [data-node-id].li[fold='1']")
    ];
    // 找到主内容元素
    const previewTargets = foldedItems.reduce((arr, item) => {
        const el = item.children[1];
        if (el && ["p", "h1", "h2", "h3", "h4", "h5", "h6"].includes(el.className)) {
            arr.push(el.children[0]);
        }
        return arr;
    }, []);
    cleanupListPreview();
    previewTargets.forEach(registerPreviewEvents);
}

function cleanupListPreview() {
    [
        ...document.querySelectorAll(".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [ListPreview]"),
        ...document.querySelectorAll("[data-oid] [ListPreview]"),
        ...document.querySelectorAll("#searchPreview [ListPreview]")
    ].forEach(element => {
        const parent = element.parentElement;
        if (!parent || parent.getAttribute("fold") == null || parent.getAttribute("fold") == "0") {
            element.removeAttribute("ListPreview");
            window.theme.EventUtil.off(element.children[0], "mouseenter", handleMouseEnter);
            window.theme.EventUtil.off(parent?.parentElement, "mouseleave", handleMouseLeave);
            Array.from(parent?.parentElement?.children || []).forEach(child => {
                if (child.getAttribute?.("triggerBlock") != null) child.remove();
            });
        }
    });
}

function registerPreviewEvents(element) {
    const parent = element.parentElement, grandParent = parent?.parentElement;
    if (!parent || !grandParent) return;
    if (parent.getAttribute("ListPreview") != null) {
        window.theme.EventUtil.off(element, "mouseenter", handleMouseEnter);
        window.theme.EventUtil.off(grandParent, "mouseleave", handleMouseLeave);
    } else {
        parent.setAttribute("ListPreview", true);
    }
    window.theme.EventUtil.on(element, "mouseenter", handleMouseEnter);
    window.theme.EventUtil.on(grandParent, "mouseleave", handleMouseLeave);
}

function handleMouseEnter(e) {
    const obj = e.target, parent = obj.parentElement, grandParent = parent?.parentElement;
    if (!grandParent) return;
    if ([...grandParent.children].some(child => child.getAttribute?.("triggerBlock") != null)) return;
    const tempDiv = window.theme.createElementEx(obj, "div", null, 'append');
    tempDiv.style.cssText = "display:inline-block;width:0px;height:16px;";
    const X = tempDiv.offsetLeft, Y = tempDiv.offsetTop;
    tempDiv.remove();
    createTriggerBlock(grandParent, obj, X + 45, Y + 2);
    createTriggerBlock(grandParent, obj, obj.offsetLeft + 35, Y + 35);
}

function handleMouseLeave(e) {
    Array.from(e.target.children).forEach(child => {
        if (child.getAttribute?.("triggerBlock") != null) child.remove();
    });
}

function createTriggerBlock(container, refObj, left, top) {
    const previewID = container.getAttribute("data-node-id");
    const triggerBlock = window.theme.createElementEx(container, "div", null, 'append');
    triggerBlock.setAttribute("triggerBlock", true);
    triggerBlock.setAttribute("contenteditable", "false");
    triggerBlock.className = "protyle-attr";
    triggerBlock.style.cssText = `position:absolute;width:20px;height:15px;display:flex;z-index:999;cursor:pointer;WebkitUserModify:read-only;background:transparent;top:${top}px;left:${left}px;`;
    triggerBlock.innerHTML = `<span data-type='a' class='list-A' data-href='siyuan://blocks/${previewID}' style='font-size:15px;line-height:15px;color:transparent;text-shadow:none;border:none;'>####</span>`;
    window.theme.EventUtil.on(triggerBlock, "mouseenter", () => {
        let tries = 0;
        (function tryExpand() {
            tries++;
            let found = false;
            document.querySelectorAll("[data-oid]").forEach(element => {
                const item = element.children[1]?.children[0]?.children[1]?.children[0]?.children[0];
                if (item && item.getAttribute("data-node-id") == previewID) {
                    item.setAttribute("fold", 0);
                    found = true;
                }
            });
            if (!found && tries < 3) setTimeout(tryExpand, 800);
        })();
    });
}



    /**
     * body全局事件频率优化执行
     * @param {*} eventStr 那种事件如 "mouseover"
     * @param {*} fun(e) 执行函数,e：事件对象
     * @param {*} accurate 精确度：每隔多少毫秒检测一次触发事件执行
     * @param {*} delay 检测到事件触发后延时执行的ms
     * @param {*} frequency 执行后再延时重复执行几次
     * @param {*} frequencydelay 执行后再延时重复执行之间的延时时间ms
     */
    window.theme.BodyEventRunFun = function(eventStr, fun, accurate = 100, delay = 0, frequency = 1, frequencydelay = 16) {
        var isMove = true;
        var _e = null;
        window.theme.EventUtil.on(document.body, eventStr, (e) => { isMove = true; _e = e });
        setInterval(() => {
            if (!isMove) return;
            isMove = false;
            setTimeout(() => {
                fun(_e);
                if (frequency == 1) return;
                if (frequencydelay < 16) frequencydelay = 16;
                var _frequencydelay = frequencydelay;
                for (let index = 0; index < frequency; index++) {
                    setTimeout(() => { fun(_e); }, frequencydelay);
                    frequencydelay += _frequencydelay;
                }
            }, delay);
        }, accurate);
    }
    // 事件工具对象，统一事件绑定和解绑
    const EventUtil = {
        on(element, type, handler) {
            if (!element) return;
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + type, handler);
            } else {
                element["on" + type] = handler;
            }
        },
        off(element, type, handler) {
            if (!element) return;
            if (element.removeEventListener) {
                element.removeEventListener(type, handler, false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + type, handler);
            } else {
                element["on" + type] = null;
            }
        }
    };
    window.theme.EventUtil = EventUtil;

    /**
     * 加载样式文件
     * @params {string} href 样式地址
     * @params {string} id 样式 ID
     * @returns {HTMLElement} 创建的样式元素
     */
    window.theme.loadStyle = function (href, id = null) {
        const style = document.createElement('link');
        if (id) style.id = id;
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.href = href;
        document.head.appendChild(style);
        return style;
    }
    
    /**
     * 更新样式文件
     * @params {string} id 样式文件 ID
     * @params {string} href 样式文件地址
     * @returns {HTMLElement} 样式元素
     */
    window.theme.updateStyle = function (id, href) {
        let style = document.getElementById(id);
        if (style) {
            style.setAttribute('href', href);
            return style;
        }
        return window.theme.loadStyle(href, id);
    }
    
    /**
     * 获取主题模式
     * @return {string} light 或 dark
     */
    window.theme.themeMode = (() => {
        // 日志：赋值 themeMode
        // console.log('[Savor] window.siyuan.config.appearance.mode:', window.siyuan?.config?.appearance?.mode);
        switch (window.siyuan.config.appearance.mode) {
            case 0: return 'light';
            case 1: return 'dark';
            default: return null;
        }
    })();
    
    /**---------------------------------------------------------主题-------------------------------------------------------- */
    
    function themeButton() {
        // 检查 savorToolbar 是否存在
        const savorToolbar = document.getElementById("savorToolbar");
        if (!savorToolbar) return;
        
        // 清空现有内容
        savorToolbar.innerHTML = '';
        
        // 只在菜单弹窗里加 observer
        if (savorToolbar.parentElement && savorToolbar.parentElement.id === 'commonMenu') {
            const commonMenu = document.getElementById("commonMenu");
            if (commonMenu) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        // 当菜单隐藏时移除 savorToolbar
                        if (mutation.attributeName === 'class' && 
                            commonMenu.classList.contains('fn__none') && 
                            savorToolbar && savorToolbar.parentNode) {
                            savorToolbar.parentNode.removeChild(savorToolbar);
                        }
                        // 当 data-name 不是 barmode 时移除 savorToolbar
                        if (mutation.attributeName === 'data-name' && 
                            commonMenu.getAttribute('data-name') !== 'barmode' && 
                            savorToolbar && savorToolbar.parentNode) {
                            savorToolbar.parentNode.removeChild(savorToolbar);
                        }
                    });
                });
                
                observer.observe(commonMenu, { attributes: true, attributeFilter: ['class', 'data-name'] });
            }
        }
        
        // 监听主题变化，当主题不是 Savor 时移除 savorToolbar
        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'data-theme-mode' || 
                     mutation.attributeName === 'data-light-theme' || 
                     mutation.attributeName === 'data-dark-theme')) {
                    
                    const savorToolbar = document.getElementById("savorToolbar");
                    if (savorToolbar && !shouldShowSavorToolbar()) {
                        savorToolbar.remove();
                    }
                }
            });
        });
        
        // 开始观察主题变化
        themeObserver.observe(document.documentElement, { 
            attributes: true, 
            attributeFilter: ['data-theme-mode', 'data-light-theme', 'data-dark-theme'] 
        });
        
        // 浅色主题配色
        const lightThemes = [
            { id: "buttonSavor-light", label: i18n("Light 配色"), path: "/appearance/themes/Savor/style/theme/savor-light.css", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.4-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.267 14c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c0.933 0 1.6 0.8 1.6 1.6s-0.8 1.6-1.6 1.6c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c1.867 0 3.333-1.467 3.333-3.333s-1.467-3.067-3.333-3.067z" },
            { id: "buttonsalt", label: i18n("Salt 配色"), path: "/appearance/themes/Savor/style/theme/savor-salt.css", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.133 17.2c-1.867-1.067-3.867-2.133-3.867 0s1.733 3.867 3.867 3.867 3.867-1.733 3.867-3.867-2.133 1.067-3.867 0z" },
            { id: "buttonsugar", label: i18n("Sugar 配色"), path: "/appearance/themes/Savor/style/theme/savor-sugar.css", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-0.267 0-0.533 0-0.8-0.133 2.533-0.133 4.533-2.133 4.533-4.533 0.133-1.067-0.267-2.133-1.067-2.8-0.8-0.8-1.6-1.2-2.8-1.333-0.933-0.133-1.733 0.267-2.4 0.8s-1.067 1.467-1.067 2.267c-0.133 1.467 1.067 2.8 2.533 2.933 1.2 0.133 2.4-0.933 2.4-2.133 0-0.267-0.267-0.533-0.533-0.533s-0.533 0.267-0.533 0.533c0 0.667-0.533 1.2-1.2 1.067-0.933-0.133-1.6-0.8-1.467-1.6 0-0.533 0.267-1.067 0.667-1.467s0.933-0.533 1.6-0.533c0.8 0 1.467 0.267 2 0.933 0.533 0.533 0.8 1.2 0.8 2.133-0.133 2-1.867 3.6-3.867 3.467-1.6-0.133-2.933-0.933-3.733-2.133-0.267-0.8-0.267-1.467-0.267-2.133 0-2.8 2.4-5.2 5.2-5.2s5.2 2.4 5.2 5.2-2.4 5.2-5.2 5.2z" },
            { id: "buttonforest", label: i18n("Forest 配色"), path: "/appearance/themes/Savor/style/theme/savor-forest.css", svg: "M16 12.133c-1.867 0-2.933 1.467-2.933 2.933 0 0.533 0 1.733 0 2.267 0 0.8 0.4 1.467 0.4 1.467 0.4 0.667 1.067 1.2 1.867 1.333v1.2c0 0.267 0.267 0.533 0.533 0.533s0.533-0.267 0.533-0.533v-1.2c1.333-0.267 2.267-1.467 2.267-2.8v-2.267c0.267-1.6-0.933-2.933-2.667-2.933zM17.733 17.333c0 0.8-0.4 1.333-1.2 1.6v-2.267c0-0.267-0.267-0.533-0.533-0.533s-0.533 0.267-0.533 0.533v2.267c-0.8-0.267-1.2-0.933-1.2-1.6v-2.267c0-0.933 0.8-1.733 1.733-1.733s1.733 0.8 1.733 1.733v2.267zM16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.2-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467z" },
            { id: "buttonflower", label: i18n("Flower 配色"), path: "/appearance/themes/Savor/style/theme/savor-flower.css", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467zM19.333 14.533c-0.267 0-1.6 0.267-1.6 0.267s-1.067-1.6-1.733-1.6-1.6 1.6-1.6 1.6-1.333-0.267-1.6-0.267-0.667 1.333-0.667 2.667c0 2.4 1.733 4 4 4s4-1.6 4-4c-0.133-1.333-0.4-2.667-0.8-2.667zM16 19.867c-1.467 0-2.667-1.067-2.667-2.667 0-0.4 0-0.8 0.133-1.2 0.133 0 0.4 0.133 0.533 0.133l0.933 0.267 0.533-0.8c0.133-0.267 0.267-0.533 0.533-0.667v0 0c0.133 0.267 0.4 0.533 0.533 0.8l0.533 0.8 0.933-0.267c0.133 0 0.4-0.133 0.533-0.133 0 0.4 0.133 0.8 0.133 1.2 0 1.333-1.2 2.533-2.667 2.533z" },
            { id: "buttonwind", label: i18n("Wind 配色"), path: "/appearance/themes/Savor/style/theme/savor-wind.css", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467zM18.4 13.2h-0.667c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h0.667c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-6.267c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h6.267c1.067 0 1.867-0.8 1.867-1.867 0-1.333-0.8-2.133-1.867-2.133zM14.667 17.733h-2.533c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h2.533c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-0.667c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h0.667c1.067 0 1.867-0.8 1.867-1.867s-0.8-2.133-1.867-2.133z" }
        ];
        
        // 深色主题配色
        const darkThemes = [
            { id: "buttonSavor-dark", label: i18n("Dark 配色"), path: "/appearance/themes/Savor/style/theme/savor-dark.css", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.4-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.267 14c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c0.933 0 1.6 0.8 1.6 1.6s-0.8 1.6-1.6 1.6c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c1.867 0 3.333-1.467 3.333-3.333s-1.467-3.067-3.333-3.067z" },
            { id: "buttonvinegar", label: i18n("Vinegar 配色"), path: "/appearance/themes/Savor/style/theme/savor-vinegar.css", svg: "M19.467 18.533c-0.133 0-0.133 0-0.133 0.133-0.4 0.133-0.8 0.133-1.2 0.133-2 0-3.2-1.2-3.2-3.2 0-0.4 0.133-1.067 0.267-1.2v-0.133c0-0.133-0.133-0.133-0.133-0.133s-0.133 0-0.267 0.133c-1.333 0.533-2.267 1.867-2.267 3.467 0 2.133 1.6 3.733 3.867 3.733 1.6 0 2.933-0.933 3.467-2.133 0.133-0.133 0.133-0.133 0.133-0.133-0.4-0.533-0.533-0.667-0.533-0.667zM16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2z" },
            { id: "buttonocean", label: i18n("Ocean 配色"), path: "/appearance/themes/Savor/style/theme/savor-ocean.css", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.133 17.2c-1.867-1.067-3.867-2.133-3.867 0s1.733 3.867 3.867 3.867 3.867-1.733 3.867-3.867-2.133 1.067-3.867 0z" },
            { id: "buttonmountain", label: i18n("Mountain 配色"), path: "/appearance/themes/Savor/style/theme/savor-mountain.css", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM14.667 22.267c-1.2-0.267-2.267-0.933-2.933-1.867l2.533-4.4 2.133 3.6-1.733 2.667zM17.867 19.867l0.667-1.2 1.2 2.133c-0.933 0.933-2.133 1.467-3.467 1.467l1.6-2.4zM16 11.467c3.067 0 5.467 2.4 5.467 5.467 0 0.933-0.267 1.867-0.667 2.533l-1.6-2.533c-0.267-0.4-0.667-0.4-0.933-0.267-0.133 0-0.133 0.133-0.267 0.267l-0.667 1.2-2.4-4c-0.267-0.4-0.667-0.4-0.933-0.267-0.133 0-0.133 0.133-0.267 0.267l-2.8 4.8c-0.267-0.667-0.4-1.333-0.4-2 0-3.067 2.4-5.467 5.467-5.467z" }
        ];
        
        // 根据当前主题模式添加相应的主题按钮
        const themes = window.theme.themeMode === 'light' ? lightThemes : darkThemes;
        
        themes.forEach(theme => {
            // 为每个主题配色创建按钮
            const addButton = document.createElement("button");
            addButton.id = theme.id;
            addButton.setAttribute("class", "b3-menu__item");
            addButton.setAttribute("aria-label", theme.label);
            
            addButton.innerHTML = `<svg class="b3-menu__icon savor-icon" viewBox="9 10 14 14" xmlns="http://www.w3.org/2000/svg">
                <path d="${theme.svg}"></path>
            </svg>
            <span class="b3-menu__label">${theme.label}</span>`;
            
            addButton.classList.add('savor-button');
            
            // 检查当前是否已选中此配色
            let themeLinkId = theme.id.replace(/^button(Savor-)?/, 'Sv-theme-color-');
            const currentLink = document.getElementById(themeLinkId);
            if (currentLink && !currentLink.disabled) {
                addButton.classList.add('button_on');
            }
            
            addButton.addEventListener("click", () => {
                // 移除其他按钮的选中状态
                savorToolbar.querySelectorAll('.b3-menu__item').forEach(btn => {
                    btn.classList.remove('button_on');
                });
                
                // 添加当前按钮的选中状态
                addButton.classList.add('button_on');
                
                // 应用主题切换动画
                window.theme.applyThemeTransition(() => {
                    switchThemeStyle(themeLinkId);
                    
                    // 处理彩色标题样式（sugar/flower主题专用）
                    if (themeLinkId === 'Sv-theme-color-sugar' || themeLinkId === 'Sv-theme-color-flower') {
                        enableSvcolorfulHeading();
                    } else {
                        const styleElement = document.getElementById("snippet-SvcolorfulHeading");
                        if (styleElement) {
                            styleElement.parentNode.removeChild(styleElement);
                        }
                    }
                });
                
                // 根据当前主题模式，只将对应模式的配色设置为 "0"
                if (window.theme.themeMode === 'light') {
                    // 明亮模式配色互斥
                    const lightThemeIds = ["buttonSavor-light", "buttonsalt", "buttonsugar", "buttonforest", "buttonflower", "buttonwind"];
                    lightThemeIds.forEach(id => {
                        setItem(id, "0");
                    });
                } else {
                    // 暗黑模式配色互斥
                    const darkThemeIds = ["buttonSavor-dark", "buttonvinegar", "buttonocean", "buttonmountain"];
                    darkThemeIds.forEach(id => {
                        setItem(id, "0");
                    });
                }
                
                // 设置当前配色为 "1"
                setItem(theme.id, "1");
            });
            
            savorToolbar.appendChild(addButton);
        });
         // 在主题按钮初始化后添加功能按钮
         initFeatureButtons();
        }
/**---------------------------------------------------------功能按钮-------------------------------------------------------------- */

// 功能按钮配置
const featureButtons = [
    {
        id: "concealButton",
        label: i18n("挖空"),
        cssPath: "/appearance/themes/Savor/style/topbar/conceal-mark.css",
        styleId: "Sv-theme-color-conceal挖空",
        attrName: "conceal挖空",
        svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.267 0 4.133 1.467 4.933 3.467-0.133 0-0.4 0-0.4 0.133-0.533 0.533-0.933 0.8-1.467 1.2 0 0-0.133 0-0.133 0.133-0.533 0.267-1.2 0.533-1.733 0.533 0 0 0 0-0.133 0-0.4 0.133-0.667 0.133-1.067 0.133-0.267 0-0.667 0-0.933-0.133h-0.133c-0.533-0.133-1.2-0.267-1.6-0.533-0.133-0.133-0.133-0.133-0.133-0.133-0.533-0.267-1.067-0.667-1.467-1.067-0.133-0.133-0.533-0.133-0.8 0-0.133 0.133-0.133 0.533 0 0.8 0.4 0.4 0.8 0.8 1.2 1.067l-0.933 0.8c-0.133 0.133-0.133 0.533 0.133 0.8 0.133 0.133 0.133 0.133 0.4 0.133 0.133 0 0.267-0.133 0.4-0.133l0.933-1.2c0.4 0.133 0.8 0.267 1.2 0.4l-0.267 1.2c-0.133 0.267 0.133 0.533 0.4 0.667h0.267c0.267 0 0.533-0.133 0.533-0.4l0.267-1.2h1.467l0.267 1.2c0.133 0.267 0.267 0.4 0.533 0.4h0.133c0.267-0.133 0.533-0.4 0.4-0.667l-0.267-1.2c0.4-0.133 0.8-0.267 1.2-0.4l0.933 1.2c0.133 0.133 0.267 0.133 0.4 0.133s0.267 0 0.4-0.133c0 0 0-0.133 0.133-0.133-0.933 1.867-2.8 3.333-5.067 3.333zM20.933 18.933c0-0.133 0-0.267-0.133-0.4l-0.8-1.067c0.4-0.267 0.8-0.533 1.067-0.8 0 0.267 0 0.533 0 0.667 0.133 0.533 0 1.067-0.133 1.6z",
        onEnable: () => {},
        onDisable: () => {}
    },
    {
        id: "tabbarVertical",
        label: i18n("垂直页签"),
        cssPath: "/appearance/themes/Savor/style/topbar/tab-bar-vertical.css",
        styleId: "Sv-theme-color-tabbar垂直",
        attrName: "tabbar垂直",
        svg: "M21.067 10.667h-10.133c-0.8 0-1.6 0.8-1.6 1.6v10c0 0.933 0.8 1.733 1.6 1.733h10c0.933 0 1.6-0.8 1.6-1.6v-10.133c0.133-0.8-0.667-1.6-1.467-1.6zM21.333 22.4c0 0.133-0.133 0.267-0.267 0.267h-7.333v-7.733h7.6v7.467zM21.333 13.6h-10.667v-1.333c0-0.133 0.133-0.267 0.267-0.267h10c0.267 0 0.4 0.133 0.4 0.267v1.333z",
        onEnable: () => {
            // 启用垂直页签时，先检查并关闭顶栏合并
            let topbarFixed = document.getElementById("Sv-theme-color-topbar隐藏");
            if (topbarFixed) {
                let topbarBtn = document.getElementById("topBar");
                if (topbarBtn) topbarBtn.click();
            }
            
            // 添加垂直页签宽度调节功能
            setTimeout(() => {
                initTabbarResizer();
            }, 500);
        },
        onDisable: () => {
            // 移除垂直页签宽度调节器
            removeTabbarResizer();
        }
    },
    {
        id: "topBar",
        label: i18n("顶栏合并"),
        cssPath: "/appearance/themes/Savor/style/topbar/top-fixed.css",
        styleId: "Sv-theme-color-topbar隐藏",
        attrName: "topbar隐藏",
        svg: "M21.067 10.667h-1.867c-0.133 0-0.133 0-0.267 0h-3.733c-0.133 0-0.133 0-0.267 0h-4c-0.8 0-1.6 0.8-1.6 1.6v10c0 0.933 0.8 1.733 1.6 1.733h10c0.933 0 1.6-0.8 1.6-1.6v-10.133c0.133-0.8-0.667-1.6-1.467-1.6zM15.333 12h2.4l-1.067 1.6h-2.4l1.067-1.6zM10.667 12.267c0-0.133 0.133-0.267 0.267-0.267h2.8l-1.067 1.6h-2v-1.333zM21.333 22.4c0 0.133-0.133 0.267-0.267 0.267h-10.133c-0.133 0-0.267-0.133-0.267-0.267v-7.333h10.667v7.333zM21.333 13.6h-3.067l1.067-1.6h1.6c0.267 0 0.4 0.133 0.4 0.267 0 0 0 1.333 0 1.333z",
        onEnable: () => {
            // 启用顶栏合并时,先检查并关闭垂直页签
            let verticalTab = document.getElementById("Sv-theme-color-tabbar垂直");
            if (verticalTab) {
                let verticalBtn = document.getElementById("tabbarVertical");
                if (verticalBtn) verticalBtn.click();
            }
            
            // 添加空白div用于拖拽 - 使用setTimeout确保DOM已更新
            setTimeout(() => {
                addDragArea();
            }, 100);
            
            // 启用顶栏合并右间距功能
            if (!window.tabBarsMarginInitialized) {
                window.tabBarsMarginInitialized = true;
                initTabBarsMargin();
            } else {
                // 如果已初始化，则手动更新边距
                if (window.updateTabBarsMargin) {
                    window.updateTabBarsMargin();
                }
            }
        },
        onDisable: () => {
            // 移除空白div
            let dragElement = document.getElementById("savordrag");
            if (dragElement) {
                dragElement.parentNode.removeChild(dragElement);
            }
        }
    },
    {
        id: "bulletThreading",
        label: i18n("列表子弹线"),
        cssPath: "/appearance/themes/Savor/style/topbar/bullet-threading.css",
        styleId: "Sv-theme-color-列表子弹线",
        attrName: "列表子弹线",
        svg: "M20 20c1.067 0 2 0.933 2 2s-0.933 2-2 2-2-0.933-2-2c0-1.067 0.933-2 2-2zM18.4 12c1.6 0 2.933 1.333 2.933 2.933s-1.333 2.933-2.933 2.933h-4.667c-0.933 0-1.6 0.8-1.6 1.6 0 0.933 0.8 1.6 1.6 1.6h2.933c0.267 0 0.667 0.267 0.667 0.667 0 0.267-0.267 0.667-0.667 0.667h-2.933c-1.733 0.267-3.067-1.067-3.067-2.8s1.333-2.933 3.067-2.933h4.667c0.933 0 1.6-0.8 1.6-1.6s-0.8-1.733-1.6-1.733h-2.933c-0.533 0-0.8-0.4-0.8-0.667s0.267-0.667 0.667-0.667c0 0 3.067 0 3.067 0zM20 21.333c-0.267 0-0.667 0.267-0.667 0.667 0 0.267 0.267 0.667 0.667 0.667s0.667-0.267 0.667-0.667c0-0.4-0.267-0.667-0.667-0.667v0zM12 10.667c1.067 0 2 0.933 2 2s-0.933 2-2 2c-1.067 0-2-0.933-2-2s0.933-2 2-2zM12 12c-0.267 0-0.667 0.267-0.667 0.667s0.4 0.667 0.667 0.667c0.4 0 0.667-0.267 0.667-0.667v0c0-0.4-0.267-0.667-0.667-0.667z",
        onEnable: () => {
            // 启用子弹线功能时，添加事件监听器
            initBulletThreading();
        },
        onDisable: () => {
            // 禁用子弹线功能时，移除事件监听器
            removeBulletThreading();
        }
    },
    {
        id: "colorFolder",
        label: i18n("彩色文档树"),
        cssPath: "/appearance/themes/Savor/style/topbar/color-folder.css",
        styleId: "Sv-theme-color-彩色文档树",
        attrName: "彩色文档树",
        svg: "M11.6 14.933c0-0.133 0-0.267 0-0.4 0-2.533 2-4.533 4.4-4.533s4.4 2 4.4 4.533c0 0.133 0 0.267 0 0.4 1.467 0.667 2.533 2.267 2.533 4.133 0 2.533-2 4.533-4.4 4.533-0.933 0-1.867-0.267-2.533-0.8-0.8 0.533-1.6 0.8-2.533 0.8-2.4 0-4.4-2-4.4-4.533 0-1.867 0.933-3.467 2.533-4.133zM11.867 16.267c-0.933 0.533-1.6 1.6-1.6 2.8 0 1.733 1.467 3.2 3.2 3.2 0.533 0 1.067-0.133 1.6-0.4-0.667-0.8-0.933-1.733-0.933-2.8 0-0.133 0-0.267 0-0.4-1.067-0.533-1.867-1.467-2.267-2.4v0zM15.333 18.933v0c0 1.867 1.467 3.2 3.2 3.2s3.2-1.467 3.2-3.2c0-1.2-0.667-2.267-1.6-2.8-0.667 1.6-2.267 2.8-4.133 2.8-0.267 0.133-0.4 0-0.667 0v0zM16 17.733c1.733 0 3.2-1.467 3.2-3.2s-1.467-3.2-3.2-3.2-3.2 1.467-3.2 3.2 1.467 3.2 3.2 3.2z",
        onEnable: () => {},
        onDisable: () => {}
    },
    {
        id: "typewriterMode",
        label: i18n("打字机模式"),
        cssPath: "", // 无需额外CSS
        styleId: "Sv-theme-typewriter-mode",
        attrName: "typewriterMode",
        svg: "M20.133 10.667c1.6 0 2.8 1.2 2.8 2.8v0 6.933c0 1.6-1.2 2.8-2.8 2.8v0h-8.267c-1.6 0-2.8-1.2-2.8-2.8v0-7.067c0-1.467 1.2-2.667 2.8-2.667 0 0 8.267 0 8.267 0zM20.133 12h-8.267c-0.8 0-1.333 0.533-1.333 1.333v0 6.933c0 0.8 0.533 1.333 1.333 1.333h8.533c0.8 0 1.333-0.533 1.333-1.333v-6.933c-0.133-0.667-0.667-1.333-1.6-1.333v0zM19.467 18.933c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-6.933c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667h6.933zM12.533 16.133c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667-0.667-0.267-0.667-0.667 0.267-0.667 0.667-0.667zM16 16.133c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667zM19.467 16.133c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667v0c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667zM12.533 13.333c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667-0.667-0.267-0.667-0.667 0.267-0.667 0.667-0.667zM16 13.333c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667zM19.467 13.333c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667v0c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667z", 
        onEnable: () => { enableTypewriterMode(); },
        onDisable: () => { disableTypewriterMode(); }
    }
];

// 打字机模式
let typewriterModeActive = false;
let typewriterHandler = null;

function enableTypewriterMode() {
    if (typewriterModeActive) return;
    typewriterModeActive = true;
    typewriterHandler = () => {
        // 查找当前编辑区和光标所在块
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        // 找到可编辑父元素
        while (node && node.nodeType === 3) node = node.parentElement;
        const editable = findEditableParent(node);
        if (!editable) return;
        // 只在主编辑区生效
        const protyle = editable.closest('.protyle');
        if (!protyle) return;
        // 获取当前行元素
        let line = node;
        while (line && line !== editable && !line.classList?.contains('protyle-wysiwyg')) {
            if (line.classList && (line.classList.contains('p') || line.classList.contains('h1') || line.classList.contains('h2') || line.classList.contains('h3') || line.classList.contains('h4') || line.classList.contains('h5') || line.classList.contains('h6') || line.classList.contains('li'))) break;
            line = line.parentElement;
        }
        if (!line || line === editable) line = node;
        // 计算滚动
        const rect = line.getBoundingClientRect();
        const container = protyle.querySelector('.protyle-content') || protyle;
        const containerRect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop;
        const offset = rect.top - containerRect.top;
        const center = container.clientHeight * 0.4; // 40% 位置
        // 只在可见区域内滚动
        if (offset < 0 || offset > container.clientHeight) return;
        container.scrollTo({
            top: scrollTop + offset - center + rect.height / 2,
            behavior: "smooth"
        });
    };
    document.addEventListener('selectionchange', typewriterHandler);
}

function disableTypewriterMode() {
    if (!typewriterModeActive) return;
    typewriterModeActive = false;
    if (typewriterHandler) {
        document.removeEventListener('selectionchange', typewriterHandler);
        typewriterHandler = null;
    }
}

// 子弹线相关变量和函数
let bulletThreadingActive = false;
let selectionChangeHandler = null;

// 初始化子弹线功能
function initBulletThreading() {
    if (bulletThreadingActive) return;
    
    bulletThreadingActive = true;
    selectionChangeHandler = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        // 获取当前选中节点的列表项祖先节点
        const range = selection.getRangeAt(0);
        const startNode = range.startContainer;
        
        // 清除所有已有的子弹线样式
        document.querySelectorAll('.en_item_bullet_actived, .en_item_bullet_line')
            .forEach(node => {
                node.classList.remove('en_item_bullet_actived', 'en_item_bullet_line');
                node.style.removeProperty('--en-bullet-line-height');
            });
        
        // 查找当前节点所在的列表路径
        const listItems = [];
        let currentNode = startNode;
        
        // 检查是否存在具有custom-f属性的父级列表
        let hasCustomFParent = false;
        let tempNode = currentNode;
        while (tempNode && tempNode !== document.body) {
            if (tempNode.getAttribute && tempNode.getAttribute('custom-f')) {
                hasCustomFParent = true;
                break;
            }
            tempNode = tempNode.parentElement;
        }
        
        // 如果存在custom-f属性的父级，则不应用子弹线
        if (hasCustomFParent) return;
        
        while (currentNode && currentNode !== document.body) {
            // 跳过具有custom-f属性的列表项
            if (currentNode.dataset?.type === 'NodeListItem' && !currentNode.getAttribute('custom-f')) {
                listItems.push(currentNode);
            }
            currentNode = currentNode.parentElement;
        }
        
        // 如果没有找到列表项，直接返回
        if (listItems.length === 0) return;
        
        // 设置子弹线高度并应用样式
        for (let i = 0; i < listItems.length - 1; i++) {
            const currentItem = listItems[i];
            const parentItem = listItems[i + 1];
            
            const height = currentItem.getBoundingClientRect().top - 
                           parentItem.getBoundingClientRect().top;
            
            currentItem.style.setProperty('--en-bullet-line-height', `${height}px`);
            currentItem.classList.add('en_item_bullet_line');
        }
        
        // 为所有列表项添加激活样式
        listItems.forEach(item => item.classList.add('en_item_bullet_actived'));
    };
    
    // 添加事件监听器
    document.addEventListener('selectionchange', selectionChangeHandler);
}

// 移除子弹线功能
function removeBulletThreading() {
    if (!bulletThreadingActive) return;
    
    bulletThreadingActive = false;
    
    // 移除事件监听器
    if (selectionChangeHandler) {
        document.removeEventListener('selectionchange', selectionChangeHandler);
        selectionChangeHandler = null;
    }
    
    // 清除所有样式
    document.querySelectorAll('.en_item_bullet_actived, .en_item_bullet_line')
        .forEach(node => {
            node.classList.remove('en_item_bullet_actived', 'en_item_bullet_line');
            node.style.removeProperty('--en-bullet-line-height');
        });
}
// 创建功能按钮
function createFeatureButtons() {
    featureButtons.forEach(button => {
        savorThemeToolbarAddButton(
            button.id,
            "b3-menu__item",
            button.label,
            window.theme.themeMode,
            () => {
                if (button.onEnable) button.onEnable();
                let styleElement = document.getElementById(button.styleId);
                if (!styleElement) {
                    styleElement = window.theme.loadStyle(button.cssPath, button.styleId);
                    if (button.id === "bulletThreading") {
                        styleElement.setAttribute("bulletThreading", button.attrName);
                    } else {
                        styleElement.setAttribute("topBarcss", button.attrName);
                    }
                }
            },
            () => {
                const styleElement = document.getElementById(button.styleId);
                if (styleElement) styleElement.remove();
                if (button.onDisable) button.onDisable();
            },
            true,
            button.svg
        );
    });
}
// 在主题按钮初始化后添加功能按钮
function initFeatureButtons() {
    createFeatureButtons();
}
/**---------------------------------------------------------垂直页签宽度调节-------------------------------------------------------------- */
// 垂直页签宽度调节相关变量
let tabbarResizer = null;
let isResizing = false;
let startX = 0;
let startWidth = 0;
const MIN_WIDTH = 150; // 最小宽度
const MAX_WIDTH = 400; // 最大宽度

/**
 * 初始化垂直页签宽度调节器
 */
function initTabbarResizer() {
    // 如果已经存在调节器，先移除
    removeTabbarResizer();
    
    // 获取垂直页签容器 - 修正选择器以获取正确的页签容器
    const tabContainer = document.querySelector('.layout__center .layout-tab-bar');
    if (!tabContainer) return;
    
    // 创建调节器元素
    tabbarResizer = document.createElement('div');
    tabbarResizer.id = 'tabbar-resizer';
    tabbarResizer.className = 'tabbar-resizer';
    tabbarResizer.style.cssText = `
        position: absolute;
        top: 0;
        right: -5px;
        width: 10px;
        height: 100%;
        cursor: col-resize;
        z-index: 100;
    `;
    
    // 添加调节器到页签容器
    tabContainer.style.position = 'relative';
    tabContainer.appendChild(tabbarResizer);
    
    // 添加事件监听
    tabbarResizer.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', resizeTabbar);
    document.addEventListener('mouseup', stopResize);
}

/**
 * 开始调整大小
 * @param {MouseEvent} e - 鼠标事件
 */
function startResize(e) {
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    
    // 修正选择器以获取正确的页签容器
    const tabContainer = document.querySelector('.layout__center .layout-tab-bar');
    startWidth = tabContainer.offsetWidth;
    
    // 添加调整中的样式
    document.body.classList.add('tabbar-resizing');
}

/**
 * 调整页签宽度
 * @param {MouseEvent} e - 鼠标事件
 */
function resizeTabbar(e) {
    if (!isResizing) return;
    
    // 修正选择器以获取正确的页签容器
    const tabContainer = document.querySelector('.layout__center .layout-tab-bar');
    if (!tabContainer) return;
    
    const deltaX = e.clientX - startX;
    let newWidth = startWidth + deltaX;
    
    // 限制宽度范围
    newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH));
    
    // 应用新宽度
    tabContainer.style.width = `${newWidth}px`;
}

/**
 * 停止调整大小
 */
function stopResize() {
    if (!isResizing) return;
    
    isResizing = false;
    document.body.classList.remove('tabbar-resizing');
}

/**
 * 移除垂直页签宽度调节器
 */
function removeTabbarResizer() {
    // 移除事件监听
    document.removeEventListener('mousemove', resizeTabbar);
    document.removeEventListener('mouseup', stopResize);
    
    // 移除调节器元素
    const existingResizer = document.getElementById('tabbar-resizer');
    if (existingResizer) {
        existingResizer.parentNode.removeChild(existingResizer);
    }
    
    // 移除调整中的样式
    document.body.classList.remove('tabbar-resizing');
    
    tabbarResizer = null;
    isResizing = false;
}
/**---------------------------------------------------------插件-------------------------------------------------------------- */
    
// 等待必要的DOM元素加载完成
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

        // 设置超时
        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
};

// 插件按钮配置
const pluginButtons = [
    {
        id: "Splugin",
        label: i18n("收缩/展开插件"),
        cssPath: "/appearance/themes/Savor/style/topbar/Splugin.css",
        styleId: "Sv-theme-color-plugin隐藏",
        attrName: "plugin隐藏",
        style: "display: none;",
        className: "toolbar__item b3-tooltips b3-tooltips__sw",
        onEnable: () => {
            // 延迟执行以确保DOM更新完成
            setTimeout(() => {
                if (window.updateTabBarsMargin) {
                    window.updateTabBarsMargin();
                }
            }, 100);
        },
        onDisable: () => {
            // 延迟执行以确保DOM更新完成
            setTimeout(() => {
                if (window.updateTabBarsMargin) {
                    window.updateTabBarsMargin();
                }
            }, 100);
        }
    }
];

// 创建插件按钮
async function createPluginButtons() {
    const barCommand = await waitForElement('#barCommand');
    if (!barCommand) {
        console.warn('无法找到 #barCommand 元素');
        return;
    }

    // 获取或创建插件容器
    let savorPlugins = document.getElementById("savorPlugins");
    if (!savorPlugins) {
        savorPlugins = createElementEx(barCommand.parentElement, "div", "savorPlugins", 'append');
        if (!savorPlugins) return;
        barCommand.parentNode.insertBefore(savorPlugins, barCommand);
    }

    // 创建所有插件按钮
    pluginButtons.forEach(button => {
        // 检查按钮是否已存在
        if (document.getElementById(button.id)) return;

        // 创建按钮
        const addButton = createElementEx(savorPlugins, "div", null, 'append');
        if (!addButton) return;

        // 设置按钮属性
        addButton.style.float = "top";
        addButton.id = button.id;
        if (button.style) addButton.style.cssText = button.style;  // 添加这行来应用样式
        addButton.setAttribute("class", button.className + " button_off");
        addButton.setAttribute("aria-label", button.label);

        let offNo = '0';

        // 处理记忆状态
        offNo = getItem(button.id) || '0';
        if (offNo === "1") {
            addButton.setAttribute("class", button.className + " button_on");
            // 加载样式
            if (!document.getElementById(button.styleId)) {
                const style = window.theme.loadStyle(button.cssPath, button.styleId);
                style.setAttribute(button.id, button.attrName);
            }
            // 执行自定义启用逻辑
            if (button.onEnable) button.onEnable(addButton);
        }

        // 添加点击事件
        addButton.addEventListener("click", () => {
            if (offNo === "0") {
                addButton.setAttribute("class", button.className + " button_on");
                // 加载样式
                if (!document.getElementById(button.styleId)) {
                    const style = window.theme.loadStyle(button.cssPath, button.styleId);
                    style.setAttribute(button.id, button.attrName);
                }
                // 执行自定义启用逻辑
                if (button.onEnable) button.onEnable(addButton);
                setItem(button.id, "1");
                offNo = "1";
            } else {
                addButton.setAttribute("class", button.className + " button_off");
                // 移除样式
                const styleElement = document.getElementById(button.styleId);
                if (styleElement) styleElement.remove();
                // 执行自定义禁用逻辑
                if (button.onDisable) button.onDisable(addButton);
                setItem(button.id, "0");
                offNo = "0";
            }
        });
    });
}

// 初始化插件按钮
function initPluginButtons() {
    createPluginButtons().catch(error => {
        console.error("初始化插件按钮时出错:", error);
    });
}








/**---------------------------------------------------------思源API操作-------------------------------------------------------------- */
async function 设置思源块属性(内容块id, 属性对象) {
    return 解析响应体(向思源请求数据('/api/attr/setBlockAttrs', {
        id: 内容块id,
        attrs: 属性对象,
    }));
}

/**---------------------------------------------------------视图选择UI-------------------------------------------------------------- */
// 视图按钮配置
const viewButtons = {
    NodeList: [
        { id: "GraphView", attrName: "f", attrValue: "dt", icon: "iconFiles", label: i18n("转换为导图") },
        { id: "TableView", attrName: "f", attrValue: "bg", icon: "iconTable", label: i18n("转换为表格") },
        { id: "kanbanView", attrName: "f", attrValue: "kb", icon: "iconMenu", label: i18n("转换为看板") },
        { id: "DefaultView", attrName: "f", attrValue: "", icon: "iconList", label: i18n("恢复为列表") }
    ],
    NodeTable: [
        { id: "FixWidth", attrName: "f", attrValue: "", icon: "iconTable", label: i18n("自动宽度(换行)") },
        { id: "AutoWidth", attrName: "f", attrValue: "auto", icon: "iconTable", label: i18n("自动宽度(不换行)") },
        { id: "FullWidth", attrName: "f", attrValue: "full", icon: "iconTable", label: i18n("页面宽度") },
        { separator: true },
        { id: "vHeader", attrName: "t", attrValue: "vbiaotou", icon: "iconSuper", label: i18n("竖向表头样式") },
        { id: "Removeth", attrName: "t", attrValue: "biaotou", icon: "iconSuper", label: i18n("空白表头样式") },
        { id: "Defaultth", attrName: "t", attrValue: "", icon: "iconSuper", label: i18n("恢复表头样式") }
    ]
};

/**
 * 创建视图选择按钮
 * @param {string} selectid - 选中块的ID
 * @param {string} selecttype - 选中块的类型
 * @returns {HTMLElement} - 视图选择按钮
 */
function ViewSelect(selectid, selecttype) {
    // 创建主按钮
    const button = document.createElement("button");
    button.id = "viewselect";
    button.className = "b3-menu__item";
    button.innerHTML = `
        <svg class="b3-menu__icon"><use xlink:href="#iconGlobalGraph"></use></svg>
        <span class="b3-menu__label">${i18n("视图选择")}</span>
        <svg class="b3-menu__icon b3-menu__icon--arrow"><use xlink:href="#iconRight"></use></svg>
    `;
    
    // 创建子菜单
    const submenu = document.createElement("button");
    submenu.id = "viewselectSub";
    submenu.className = "b3-menu__submenu";
    
    // 创建菜单项容器
    const menuItems = document.createElement('div');
    menuItems.className = 'b3-menu__items';
    
    // 根据块类型添加相应的按钮
    const buttons = viewButtons[selecttype] || [];
    
    // 使用map和join简化按钮创建逻辑
    menuItems.innerHTML = buttons.map(button => {
        if (button.separator) {
            return '<button class="b3-menu__separator"></button>';
        } else {
            return `
                <button class="b3-menu__item" data-node-id="${selectid}" 
                        custom-attr-name="${button.attrName}" 
                        custom-attr-value="${button.attrValue}">
                    <svg class="b3-menu__icon"><use xlink:href="#${button.icon}"></use></svg>
                    <span class="b3-menu__label">${button.label}</span>
                </button>
            `;
        }
    }).join('');
    
    // 为所有按钮添加点击事件
    menuItems.querySelectorAll('.b3-menu__item').forEach(btn => {
        btn.onclick = ViewMonitor;
    });
    
    submenu.appendChild(menuItems);
    button.appendChild(submenu);
    return button;
}

/**---------------------------------------------------------视图操作-------------------------------------------------------------- */
/**
 * 获取当前选中的块
 * @returns {Object|null} - 选中的块信息或null
 */
function getBlockSelected() {
    const node = document.querySelector('.protyle-wysiwyg--select');
    return node?.dataset?.nodeId ? {
        id: node.dataset.nodeId,
        type: node.dataset.type,
        subtype: node.dataset.subtype
    } : null;
}

/**
 * 初始化点击监听和菜单显示
 */
function initMenuMonitor() {
    window.addEventListener('mouseup', () => {
        setTimeout(() => {
            const selectinfo = getBlockSelected();
            if (selectinfo && (selectinfo.type === "NodeList" || selectinfo.type === "NodeTable")) {
                setTimeout(() => InsertMenuItem(selectinfo.id, selectinfo.type), 0);
            }
        }, 0);
    });
}

/**
 * 插入菜单项
 * @param {string} selectid - 选中块的ID
 * @param {string} selecttype - 选中块的类型
 */
function InsertMenuItem(selectid, selecttype) {
    const commonMenu = document.querySelector("#commonMenu .b3-menu__items");
    if (!commonMenu) return;
    
    const readonly = commonMenu.querySelector('[data-id="updateAndCreatedAt"]');
    const selectview = commonMenu.querySelector('[id="viewselect"]');
    
    if (readonly && !selectview) {
        // 创建分隔线
        const separator = document.createElement('button');
        separator.className = 'b3-menu__separator';
        
        // 插入视图选择按钮和分隔线
        commonMenu.insertBefore(ViewSelect(selectid, selecttype), readonly);
        commonMenu.insertBefore(separator, readonly);
    }
}

/**
 * 视图监控处理函数
 * @param {Event} event - 点击事件
 */
function ViewMonitor(event) {
    const id = event.currentTarget.getAttribute("data-node-id");
    const attrName = 'custom-' + event.currentTarget.getAttribute("custom-attr-name");
    const attrValue = event.currentTarget.getAttribute("custom-attr-value");
    
    // 查找所有匹配的块并应用属性
    const blocks = document.querySelectorAll(`.protyle-wysiwyg [data-node-id="${id}"]`);
    
    // 清除之前的transform数据
    clearTransformData(id, blocks);
    
    // 设置新属性并保存到思源
    if (blocks?.length > 0) {
        blocks.forEach(block => block.setAttribute(attrName, attrValue));
        
        const attrs = { [attrName]: attrValue };
        设置思源块属性(id, attrs);
    }
}

/**
 * 清除块的transform数据
 * @param {string} id - 块ID
 * @param {NodeList} blocks - 块元素列表
 */
function clearTransformData(id, blocks) {
    try {
        // 清除localStorage中的位置数据
        const positions = JSON.parse(localStorage.getItem('dt-positions') || '{}');
        if (positions[id]) {
            delete positions[id];
            localStorage.setItem('dt-positions', JSON.stringify(positions));
            
            // 清除DOM元素的样式
            blocks.forEach(block => {
                block.querySelectorAll(':scope > [data-type="NodeListItem"]').forEach(listItem => {
                    listItem.style.transform = '';
                    listItem.style.cursor = '';
                    listItem.removeAttribute('data-draggable');
                });
            });
        }
    } catch (error) {
        console.error('清除transform数据出错:', error);
    }
}

// 初始化视图选择功能
setTimeout(() => initMenuMonitor(), 1000);

/**---------------------------------------------------------导图拖拽功能-------------------------------------------------------------- */
// 初始化导图拖拽功能
if (typeof window.dragDebounce === 'undefined') {
    // 防抖函数 - 使用requestAnimationFrame提高性能
    window.dragDebounce = (fn) => {
        let timer = null;
        return (...args) => {
            if (timer) cancelAnimationFrame(timer);
            timer = requestAnimationFrame(() => fn(...args));
        };
    };

    // 初始化拖拽功能
    function initDraggable(element) {
        // 找到所有直接子列表项
        const listItems = element.querySelectorAll(':scope > [data-type="NodeListItem"]');
        if (!listItems.length) return;
        
        listItems.forEach(listItem => {
            if (listItem.hasAttribute('data-draggable')) return;
            listItem.setAttribute('data-draggable', 'true');
            
            let startX, startY, initialTransform;
            let scale = 1;
            
            const onMouseDown = e => {
                // 如果是可编辑区域，不处理拖拽
                if (e.target.getAttribute('contenteditable') === 'true') {
                    return;
                }
                
                e.preventDefault();
                listItem.style.cursor = 'grabbing';
                
                initialTransform = new DOMMatrix(getComputedStyle(listItem).transform);
                startX = e.clientX - initialTransform.m41;
                startY = e.clientY - initialTransform.m42;
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp, { once: true });
            };
            
            const onMouseMove = window.dragDebounce(e => {
                const x = e.clientX - startX;
                const y = e.clientY - startY;
                // 直接应用变换，不保存状态
                listItem.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            });
            
            const onMouseUp = () => {
                listItem.style.cursor = 'grab';
                document.removeEventListener('mousemove', onMouseMove);
            };
            
            const onWheel = e => {
                if (e.target.getAttribute('contenteditable') === 'true') {
                    return;
                }
                
                if (!e.altKey) return;
                e.preventDefault();
                
                const delta = e.deltaY;
                const scaleChange = delta > 0 ? 0.9 : 1.1;
                scale = Math.min(Math.max(scale * scaleChange, 0.1), 5);
                
                const transform = new DOMMatrix(getComputedStyle(listItem).transform);
                // 直接应用变换，不保存状态
                listItem.style.transform = `translate(${transform.m41}px, ${transform.m42}px) scale(${scale})`;
            };
            
            // 添加双击复位功能
            const onDoubleClick = e => {
                // 如果是可编辑区域，不处理双击
                if (e.target.getAttribute('contenteditable') === 'true') {
                    return;
                }
                
                // 复位变换
                listItem.style.transform = 'translate(0px, 0px) scale(1)';
                scale = 1;
                
                // 添加动画效果
                listItem.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    listItem.style.transition = '';
                }, 300);
            };
            
            // 设置初始样式
            listItem.style.cursor = 'grab';
            listItem.addEventListener('mousedown', onMouseDown);
            listItem.addEventListener('wheel', onWheel, { passive: false });
            listItem.addEventListener('dblclick', onDoubleClick);
        });
    }

    // DOM观察器 - 简化版本
    function initObserver() {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.target.getAttribute('custom-f') === 'dt') {
                    initDraggable(mutation.target);
                } else if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // 元素节点
                            if (node.getAttribute?.('custom-f') === 'dt') {
                                initDraggable(node);
                            }
                            const dtElements = node.querySelectorAll?.('[custom-f="dt"]');
                            if (dtElements) {
                                dtElements.forEach(initDraggable);
                            }
                        }
                    });
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['custom-f']
        });
        
        // 初始化已存在的元素
        document.querySelectorAll('[custom-f="dt"]').forEach(initDraggable);
    }

    // 启动观察器
    initObserver();
}




/**---------------------------------------------------------顶栏合并右侧间距-------------------------------------------------------------- **/

// 初始化顶栏合并右侧间距功能
function initTabBarsMargin() {
    let rafId = null;
    let dockr = null;
    let dockVertical = null;

    // 缓存 DOM 元素
    const cacheElements = () => {
        dockr = document.querySelector('.layout__dockr');
        dockVertical = document.querySelector('.dock--vertical');
    };

    // 更新边距的函数
    const updateMargins = () => {
        // 检查顶栏合并是否开启
        const topBarFixed = document.getElementById("Sv-theme-color-topbar隐藏");
        if (!topBarFixed) {
            // 如果顶栏合并未开启，清除所有标签栏的右侧边距
            const allReadonlyTabBars = document.querySelectorAll('.layout__center .layout-tab-bar--readonly');
            allReadonlyTabBars.forEach(tabBar => {
                tabBar.style.marginRight = '0px';
            });
            return;
        }
        // 获取所有只读标签栏
        const $ = s => document.querySelectorAll(s);
        const allReadonlyTabBars = $('.layout__center .layout-tab-bar--readonly');
              
        // 检查插件状态
        const pluginHidden = document.getElementById('Sv-theme-color-plugin隐藏');
        
        // 如果插件处于关闭状态，使用固定宽度40，否则按元素数量计算后加20
        const totalLocationWidth = !pluginHidden ? 40 : 
        (document.querySelectorAll('#toolbar [data-location]:not(.fn__none)').length * 28) + 20;
        
        // 获取右侧栏面板宽度（包括浮动状态）
        const rightPanel = document.querySelector('.layout__dockr');
        const rightPanelWidth = rightPanel?.classList.contains('layout--float') 
            ? rightPanel.querySelector('.dock')?.offsetWidth || 0 
            : rightPanel?.offsetWidth || 0;
         
        // 获取右侧停靠栏宽度
        const dockrWidth = document.querySelector('#dockRight')?.offsetWidth || 0;
        
        // 定义固定偏移量
        const FIXED_OFFSET = 234;
        // 计算最终的边距值
        const calculatedMargin = totalLocationWidth + FIXED_OFFSET - rightPanelWidth - dockrWidth;
        const marginRightValue = calculatedMargin > 0 ? `${calculatedMargin}px` : '0px';

        // 检查是否存在分栏
        const resizers = document.querySelectorAll('.layout__center .layout__resize:not(.layout__resize--lr)');
        
        if (resizers.length === 0) {
            // 没有分栏时，设置最后一个标签栏边距
            const lastReadonlyTabBar = allReadonlyTabBars[allReadonlyTabBars.length - 1];
            if (lastReadonlyTabBar) {
                lastReadonlyTabBar.style.marginRight = marginRightValue;
            }
        } else {
            // 有分栏时，为每个分栏前的最后一个标签栏设置边距
            resizers.forEach(resizer => {
                let prevElement = resizer.previousElementSibling;
                if (!prevElement) return;

                const prevReadonlyTabBars = prevElement.querySelectorAll('.layout-tab-bar--readonly');
                if (prevReadonlyTabBars.length > 0) {
                    prevReadonlyTabBars[prevReadonlyTabBars.length - 1].style.marginRight = marginRightValue;
                }
            });
        }
    };

    // 初始化函数
    const init = () => {
        cacheElements();
        
        if (dockr) {
            new ResizeObserver(updateMargins).observe(dockr);
        }

        if (dockVertical) {
            new MutationObserver(updateMargins).observe(dockVertical, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
        
        // 初始更新边距
        updateMargins();
        
        // 添加延迟更新
        setTimeout(updateMargins, 500);
    };

    // 首次初始化
    init();

    // 使用 MutationObserver 监听DOM变化
    const observer = new MutationObserver(() => {
        if (!dockr || !dockVertical) {
            cacheElements();
            if (dockr || dockVertical) {
                init();
            }
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 页面加载完成后再次尝试初始化
    window.addEventListener('load', init);
    
    // 监听主题切换事件
    document.addEventListener('themechange', updateMargins);
    
    // 提供全局更新函数
    window.updateTabBarsMargin = updateMargins;
    
    // 延迟执行一次更新
    setTimeout(updateMargins, 1000);
} // 这里缺少分号，并且函数没有被正确封装

// 添加 findEditableParent 函数的定义
function findEditableParent(element) {
    let current = element;
    while (current && current !== document.body) {
        if (current.getAttribute && current.getAttribute("contenteditable") !== null) {
            return current;
        }
        current = current.parentElement;
    }
    return null;
}






    /**---------------------------------------------------------辅助函数-------------------------------------------------------------- */
    /**
     * 添加顶栏拖拽区域
     */
    function addDragArea() {
        // 检查是否已存在拖拽区域
        let existingDrag = document.getElementById("savordrag");
        if (existingDrag) return;
        
        // 查找barForward元素
        const barForwardElement = document.getElementById("barForward");
        if (!barForwardElement) {
            console.error("barForward元素不存在，无法添加拖拽区域");
            return;
        }
        
        // 创建拖拽区域
        const savordragElement = document.createElement("div");
        savordragElement.id = "savordrag";
        
        // 插入到DOM中
        const parentElement = barForwardElement.parentNode;
        parentElement.insertBefore(savordragElement, barForwardElement.nextSibling);
        
        // 设置样式
        savordragElement.style.cssText = "flex: 1; -webkit-app-region: drag; app-region: drag;";
    }
    
    /**
     * 安全地创建元素并添加到父元素
     * @param {Element} parentElement 父元素
     * @param {string} elementType 要创建的元素类型
     * @param {string} id 可选的元素ID
     * @returns {Element} 创建的元素
     */
    function createElementEx(refElement, tag, id = null, mode = 'append') {
        if (!refElement) {
            console.warn('参考元素不存在，无法创建子元素');
            return null;
        }
        if (!tag) {
            console.error('未指定标签名');
            return null;
        }
        const el = document.createElement(tag);
        if (id) el.id = id;
        if (mode === 'append') {
            refElement.appendChild(el);
        } else if (mode === 'prepend') {
            refElement.insertBefore(el, refElement.firstChild);
        } else if (mode === 'before') {
            refElement.parentElement.insertBefore(el, refElement);
        }
        return el;
    }
    window.theme.createElementEx = createElementEx;
        
    
    
    //+++++++++++++++++++++++++++++++++思源API++++++++++++++++++++++++++++++++++++
    
    async function 向思源请求数据(url, data) {
        try {
            const response = await fetch(url, {
                body: JSON.stringify(data),
                method: 'POST',
                headers: { Authorization: 'Token ' } 
            });
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.error('[Savor] API 请求失败:', error); 
            return null;
        }
    }
    
    async function 解析响应体(response) {
        try {
            const result = await response;
            if (!result) return null;
            return result.code === 0 ? result.data : null;
        } catch (error) {
            console.error('[Savor] 响应解析失败:', error);
            return null;
        }
    }
    
    async function 获取文件(path, then = null, obj = null) {
        const url = '/api/file/getFile';
        await 向思源请求数据(url, { path }).then((v) => {
            if (then) then(v, obj);
        });
    }
    
async function 写入文件(path, filedata, then = null, obj = null, isDir = false, modTime = Date.now()) {
    const blob = new Blob([filedata]);
    const file = new File([blob], path.split('/').pop());
    const formdata = new FormData();
    formdata.append("path", path);
    formdata.append("file", file);
    formdata.append("isDir", isDir);
    formdata.append("modTime", modTime);
    
    try {
        await fetch("/api/file/putFile", {
            body: formdata,
            method: "POST",
            headers: {
                Authorization: `Token ${window.siyuan.config.api.token || ""}`,
            },
        }).then(() => {
            if (then) setTimeout(() => then(obj), 200);
        });
    } catch (error) {
        console.error('写入文件出错:', error);
    }
}
    
    //+++++++++++++++++++++++++++++++++辅助API++++++++++++++++++++++++++++++++++++
    
    /**
     * 方便为主题功能添加开关按钮，并选择是否拥有记忆状态
     * @param {string} ButtonID 按钮ID
     * @param {string} ButtonTitle 按钮作用提示文字
     * @param {string} ButtonLabel 按钮标签
     * @param {string} Mode 主题模式
     * @param {Function} NoClickRunFun 按钮开启执行函数
     * @param {Function} OffClickRunFun 按钮关闭执行函数
     * @param {boolean} Memory 是否设置记忆状态 true为是留空或false为不设置记忆状态
     * @param {string} svgPath 可选的SVG路径数据
    */
    function savorThemeToolbarAddButton(ButtonID, ButtonTitle, ButtonLabel, Mode, NoClickRunFun, OffClickRunFun, Memory, svgPath = null) {
        const savorToolbar = document.getElementById("savorToolbar");
        if (!savorToolbar || document.getElementById(ButtonID)) {
            return null;
        }
        const addButton = document.createElement("button");
        addButton.id = ButtonID;
        // 只保留基础 class + button_off
        let baseClass = "b3-menu__item";
        if (svgPath) baseClass += " savor-button";
        let offNo = '0';
        if (window.theme.themeMode == Mode && Memory) {
            offNo = getItem(ButtonID) || '0';
        }
        // 初始化：未激活加 button_off，激活不加
        addButton.className = baseClass + (offNo == "1" ? "" : " button_off");
        addButton.setAttribute("aria-label", ButtonLabel);
        addButton.innerHTML = svgPath 
            ? `<svg class=\"b3-menu__icon savor-icon\" viewBox=\"9 10 14 14\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"currentColor\" d=\"${svgPath}\"></path></svg><span class=\"b3-menu__label\">${ButtonLabel}</span>`
            : `<svg class=\"b3-menu__icon\"><use xlink:href=\"#iconTheme\"></use></svg><span class=\"b3-menu__label\">${ButtonLabel}</span>`;
            addButton.addEventListener("click", () => {
                const newState = offNo == "0" ? "1" : "0";
                addButton.className = baseClass + (newState == "1" ? "" : " button_off");
                if (newState == "1") {
                    NoClickRunFun(addButton);
                } else {
                    OffClickRunFun(addButton);
                }
                if (Memory) setItem(ButtonID, newState);
                offNo = newState;
            });
        savorToolbar.appendChild(addButton);
        return { button: addButton, state: offNo };
    }

    // 写入配置文件防抖处理
    let saveConfigTimer = null;
    function saveConfigDebounced() {
        if (saveConfigTimer) clearTimeout(saveConfigTimer);
        saveConfigTimer = setTimeout(() => {
            写入文件("/data/snippets/Savor.config.json", JSON.stringify(window.theme.config, undefined, 4));
        }, 300); // 300ms 内多次调用只写一次
    }

    function setItem(key, value) {
        window.theme.config[key] = value;
        saveConfigDebounced();
    }

    function getItem(key) {
        return window.theme.config[key] === undefined ? null : window.theme.config[key];
    }

    function removeItem(key) {
        delete window.theme.config[key];
        saveConfigDebounced();
    }

    /**
     * 为元素注册监听事件
     * @param {Element} element 
     * @param {string} strType 
     * @param {Function} fun 
     */
    function AddEvent(element, strType, fun) {
        if (!element) return;
        if (element.addEventListener) {
            element.addEventListener(strType, fun, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + strType, fun);
        } else {
            element["on" + strType] = fun;
        }
    }
    window.theme.AddEvent = AddEvent;

    /**
     * 简单判断目前思源是否是手机模式
     * @returns {boolean} 是否为手机模式
     */
    function isPhone() {
        return !!document.getElementById("editor");
    }
    
        /**++++++++++++++++++++++++++++++++按需调用++++++++++++++++++++++++++++++ */
        获取文件("/data/snippets/Savor.config.json", (v) => {
            // 处理配置文件
            if (v && typeof v === 'string') {
                try {
                    window.theme.config = JSON.parse(v);
                } catch (e) {
                    window.theme.config = {};
                }
            } else if (v && typeof v === 'object') {
                window.theme.config = v;
            } else {
                window.theme.config = {};
            }
            applyRememberedThemeStyle();
            const funs = () => {
                setTimeout(() => {
                    if (isPhone()) {
                        window.theme.loadStyle("/appearance/themes/Savor/style/module/mobile.css");
                        // 手机端也初始化主题切换按钮
                        setTimeout(() => {
                            // 手机端插入 savorToolbar 到 #toolbarMore 前面，savorToolbar 为浮窗
                            let toolbarMore = document.getElementById('toolbarMore');
                            if (toolbarMore && !document.getElementById('savorToolbar')) {
                                // 创建 savorToolbar
                                const savorToolbar = document.createElement('div');
                                savorToolbar.id = 'savorToolbar';
                                savorToolbar.style.position = 'fixed';
                                savorToolbar.style.top = '56px';
                                savorToolbar.style.right = '16px';
                                savorToolbar.style.zIndex = '9999';
                                savorToolbar.style.background = 'var(--Sv-menu-background)';
                                savorToolbar.style.borderRadius = '12px';
                                savorToolbar.style.boxShadow = '0 2px 16px rgba(0,0,0,0.18)';
                                savorToolbar.style.padding = '10px 8px';
                                savorToolbar.style.display = 'none'; // 默认收起
                                savorToolbar.style.minWidth = '140px';
                                // 创建展开/收缩按钮
                                if (!document.getElementById('savorToolbarToggle')) {
                                    const toggleBtn = document.createElement('button');
                                    toggleBtn.id = 'savorToolbarToggle';
                                    toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="var(--b3-theme-on-surface)" d="M20,8.18V3a1,1,0,0,0-2,0V8.18a3,3,0,0,0,0,5.64V21a1,1,0,0,0,2,0V13.82a3,3,0,0,0,0-5.64ZM19,12a1,1,0,1,1,1-1A1,1,0,0,1,19,12Zm-6,2.18V3a1,1,0,0,0-2,0V14.18a3,3,0,0,0,0,5.64V21a1,1,0,0,0,2,0V19.82a3,3,0,0,0,0-5.64ZM12,18a1,1,0,1,1,1-1A1,1,0,0,1,12,18ZM6,6.18V3A1,1,0,0,0,4,3V6.18a3,3,0,0,0,0,5.64V21a1,1,0,0,0,2,0V11.82A3,3,0,0,0,6,6.18ZM5,10A1,1,0,1,1,6,9,1,1,0,0,1,5,10Z"/></svg>';
                                    toggleBtn.style.cssText = 'background-color: transparent;position:relative;width:32px;height:32px;border:none;top:0;right:0;border-radius:6px;display:flex;align-items:center;justify-content:center;';
                                    toggleBtn.onclick = function(e) {
                                        e.stopPropagation();
                                        savorToolbar.style.display = (savorToolbar.style.display === 'none' ? 'block' : 'none');
                                    };
                                    toolbarMore.parentNode.insertBefore(toggleBtn, toolbarMore);
                                    // 点击其它区域自动关闭浮窗
                                    document.addEventListener('click', function hideSavorToolbar(e) {
                                        if (!savorToolbar.contains(e.target) && e.target !== toggleBtn) {
                                            savorToolbar.style.display = 'none';
                                        }
                                    });
                                }
                                toolbarMore.parentNode.insertBefore(savorToolbar, toolbarMore);
                            }
                            // 初始化主题按钮（与PC端一致）
                            themeButton();
                        }, 100);
                        console.log("==============>附加CSS和特性JS_已经执行<==============");
                    } else {
                        const htmlTag = document.querySelector('html');
                        if (!htmlTag) return;
                        
                        if (!window.tabBarsMarginInitialized) {
                            window.tabBarsMarginInitialized = true;
                            initTabBarsMargin();
                        }
                        // 获取 #barWorkspace 宽度并设置为 CSS 变量
                        function setBarWorkspaceWidth() {
                            const barWorkspace = document.getElementById('barWorkspace');
                            if (barWorkspace) {
                                const width = barWorkspace.offsetWidth;
                                document.documentElement.style.setProperty('--Sv-topfixed-marginLeft', width + 'px');
                            }
                        }
                        
                        // 在DOM加载完成后执行，并监听窗口大小变化
                        setBarWorkspaceWidth();
                        window.addEventListener('resize', setBarWorkspaceWidth);
                        
                        // 监听工作空间切换，因为可能会改变宽度
                        const observer = new MutationObserver(setBarWorkspaceWidth);
                        const barWorkspace = document.getElementById('barWorkspace');
                        if (barWorkspace) {
                            observer.observe(barWorkspace, { childList: true, subtree: true });
                        }
                        
                        // 初始化主题功能，与barMode按钮独立
                        initThemeFeatures();
                        
                        // 监听 #commonMenu 的 data-name 属性变化，只在 barmode 时插入 savorToolbar
                        const commonMenuObserver = new MutationObserver((mutations) => {
                            mutations.forEach((mutation) => {
                                if (mutation.type === 'attributes' && mutation.attributeName === 'data-name') {
                                    const commonMenu = document.getElementById('commonMenu');
                                    if (commonMenu && commonMenu.getAttribute('data-name') === 'barmode') {
                                        // 当 data-name 为 barmode 时，检查主题条件后插入 savorToolbar
                                        if (shouldShowSavorToolbar()) {
                                            initSavorToolbar();
                                        }
                                    } else {
                                        // 当 data-name 不是 barmode 时，移除 savorToolbar
                                        const existingSavorToolbar = document.getElementById('savorToolbar');
                                        if (existingSavorToolbar) {
                                            existingSavorToolbar.remove();
                                        }
                                    }
                                }
                            });
                        });
                        
                        // 开始观察 #commonMenu 的 data-name 属性
                        const commonMenu = document.getElementById('commonMenu');
                        if (commonMenu) {
                            commonMenuObserver.observe(commonMenu, { attributes: true, attributeFilter: ['data-name'] });
                            // 如果当前 data-name 已经是 barmode，检查主题条件后初始化
                            if (commonMenu.getAttribute('data-name') === 'barmode') {
                                if (shouldShowSavorToolbar()) {
                                    initSavorToolbar();
                                }
                            }
                        } else {
                            // 如果 commonMenu 还没加载，等待它出现
                            const commonMenuWaitObserver = new MutationObserver((mutations, obs) => {
                                const commonMenu = document.getElementById('commonMenu');
                                if (commonMenu) {
                                    commonMenuObserver.observe(commonMenu, { attributes: true, attributeFilter: ['data-name'] });
                                    // 如果当前 data-name 已经是 barmode，检查主题条件后初始化
                                    if (commonMenu.getAttribute('data-name') === 'barmode') {
                                        if (shouldShowSavorToolbar()) {
                                            initSavorToolbar();
                                        }
                                    }
                                    obs.disconnect();
                                }
                            });
                            commonMenuWaitObserver.observe(document.body, { childList: true, subtree: true });
                        }

                        // 检查是否应该显示 savorToolbar
                        function shouldShowSavorToolbar() {
                            const html = document.documentElement;
                            const themeMode = html.getAttribute('data-theme-mode');
                            const lightTheme = html.getAttribute('data-light-theme');
                            const darkTheme = html.getAttribute('data-dark-theme');
                            
                            // 浅色模式：data-theme-mode="light" 且 data-light-theme="Savor"
                            if (themeMode === 'light' && lightTheme === 'Savor') {
                                return true;
                            }
                            
                            // 深色模式：data-theme-mode="dark" 且 data-dark-theme="Savor"
                            if (themeMode === 'dark' && darkTheme === 'Savor') {
                                return true;
                            }
                            
                            return false;
                        }
                        
                        // 监听主题变化
                        const themeObserver = new MutationObserver((mutations) => {
                            mutations.forEach((mutation) => {
                                if (mutation.type === 'attributes' && 
                                    (mutation.attributeName === 'data-theme-mode' || 
                                     mutation.attributeName === 'data-light-theme' || 
                                     mutation.attributeName === 'data-dark-theme')) {
                                    
                                    const commonMenu = document.getElementById('commonMenu');
                                    const existingSavorToolbar = document.getElementById('savorToolbar');
                                    
                                    if (commonMenu && commonMenu.getAttribute('data-name') === 'barmode') {
                                        if (shouldShowSavorToolbar()) {
                                            // 如果应该显示但不存在，则创建
                                            if (!existingSavorToolbar) {
                                                initSavorToolbar();
                                            }
                                        } else {
                                            // 如果不应该显示但存在，则移除
                                            if (existingSavorToolbar) {
                                                existingSavorToolbar.remove();
                                            }
                                        }
                                    }
                                }
                            });
                        });
                        
                        // 开始观察主题变化
                        themeObserver.observe(document.documentElement, { 
                            attributes: true, 
                            attributeFilter: ['data-theme-mode', 'data-light-theme', 'data-dark-theme'] 
                        });

                        // 初始化主题的所有功能
                        function initThemeFeatures() {
                            // 初始化鼠标中键折叠/展开功能
                            window.theme.initCollapseExpand();
                            
                            // 初始化插件按钮
                            initPluginButtons();
                            
                            // 初始化主题按钮
                            themeButton();
                            
                            // 初始化顶栏合并右侧间距功能
                            if (!window.tabBarsMarginInitialized) {
                                window.tabBarsMarginInitialized = true;
                                initTabBarsMargin();
                            }
                            // 初始化折叠列表内容预览功能
                            collapsedListPreview();
                        }

                        // 初始化 savorToolbar 的函数，仅负责生成菜单
                        function initSavorToolbar() {
                            // 检查是否已存在
                            if (document.getElementById('savorToolbar')) return;
                            
                            // 检查 #commonMenu 的 data-name 是否为 barmode
                            const commonMenu = document.getElementById('commonMenu');
                            if (!commonMenu || commonMenu.getAttribute('data-name') !== 'barmode') {
                                return;
                            }
                            
                            // 检查主题条件
                            if (!shouldShowSavorToolbar()) {
                                return;
                            }
                            
                            // 创建 savorToolbar
                            const toolbarEdit = document.getElementById("toolbarEdit");
                            const windowControls = document.querySelector("#commonMenu .b3-menu__items");
                            let savorToolbar;
                            
                            if (!toolbarEdit) {
                                savorToolbar = document.createElement("div");
                                savorToolbar.id = "savorToolbar";
                                if (windowControls) {
                                    windowControls.parentElement.insertBefore(savorToolbar, windowControls);
                                }
                            } else {
                                savorToolbar = createElementEx(toolbarEdit, "div", "savorToolbar", 'before');
                                savorToolbar.style.position = "relative";
                            }
                            
                            // 确保创建成功后初始化主题按钮
                            if (savorToolbar) {
                                themeButton();
                                // 应用记忆的主题样式
                                setTimeout(() => {
                                    applyRememberedThemeStyle();
                                }, 100);
                            }
                        }
                        const themeMode = htmlTag.getAttribute('data-theme-mode');
                        
                        // 判断是否为 macOS 平台并添加相应的类
                        if (navigator.platform.toUpperCase().indexOf("MAC") > -1) {
                            document.body.classList.add('body--mac');
                        }
                        // 加载浅色主题配色
                        if (themeMode == 'light') {
                            const lightThemes = [
                                { id: 'buttonsalt', styleId: 'Sv-theme-color-salt' },
                                { id: 'buttonsugar', styleId: 'Sv-theme-color-sugar' },
                                { id: 'buttonforest', styleId: 'Sv-theme-color-forest' },
                                { id: 'buttonflower', styleId: 'Sv-theme-color-flower' },
                                { id: 'buttonwind', styleId: 'Sv-theme-color-wind' }
                            ];
                            let rememberedId = lightThemes.find(theme => getItem(theme.id) === '1')?.styleId;
                            themeStyles.forEach(style => {
                                const link = document.getElementById(style.id);
                                if (link) link.disabled = (style.id !== rememberedId);
                            });
                            
                            // 加载彩色标题样式（sugar/flower主题专用）
                            if (rememberedId === 'Sv-theme-color-sugar' || rememberedId === 'Sv-theme-color-flower') {
                                enableSvcolorfulHeading();
                            }
                        }
                        // 加载深色主题配色
                        if (themeMode == 'dark') {
                            const darkThemes = [
                                { id: 'buttonvinegar', styleId: 'Sv-theme-color-vinegar' },
                                { id: 'buttonocean', styleId: 'Sv-theme-color-ocean' },
                                { id: 'buttonmountain', styleId: 'Sv-theme-color-mountain' }
                            ];
                            let rememberedId = darkThemes.find(theme => getItem(theme.id) === '1')?.styleId;
                            themeStyles.forEach(style => {
                                const link = document.getElementById(style.id);
                                if (link) link.disabled = (style.id !== rememberedId);
                            });
                        }
                        

// 加载功能按钮状态
featureButtons.forEach(button => {
    const buttonState = getItem(button.id);
    if (buttonState == '1') {
        // 检查是否已存在样式
        if (!document.getElementById(button.styleId)) {
            const styleElement = window.theme.loadStyle(button.cssPath, button.styleId);
            if (styleElement) {
                // 修复这里：确保为子弹线设置正确的属性
                if (button.id === "bulletThreading") {
                    styleElement.setAttribute("bulletThreading", button.attrName);
                    // 确保子弹线功能初始化
                    if (button.onEnable) button.onEnable();
                } else {
                    styleElement.setAttribute("topBarcss", button.attrName);
                    // 执行其他功能的启用逻辑
                    if (button.onEnable) button.onEnable();
                }
            }
        }
        
        // 如果是顶栏合并功能且已启用，立即添加拖拽区域并更新间距
        if (button.id === "topBar") {
            // 增加延迟确保DOM完全加载
            setTimeout(() => {
                addDragArea();
                // 确保顶栏合并右侧间距功能已初始化
                if (!window.tabBarsMarginInitialized) {
                    window.tabBarsMarginInitialized = true;
                    initTabBarsMargin();
                } else if (window.updateTabBarsMargin) {
                    // 如果已初始化，则手动更新边距
                    window.updateTabBarsMargin();
                }
                
                // 额外添加一次延迟更新以确保正确应用
                setTimeout(() => {
                    if (window.updateTabBarsMargin) {
                        window.updateTabBarsMargin();
                    }
                }, 500);
            }, 300);
        }
    }
});
                        
                // 加载插件按钮状态
                pluginButtons.forEach(button => {
                    const buttonState = getItem(button.id);
                    if (buttonState == '1') {
                        // 检查是否已存在样式
                        if (!document.getElementById(button.styleId)) {
                            const style = window.theme.loadStyle(button.cssPath, button.styleId);
                            style.setAttribute(button.id, button.attrName);
                        }
                    }
                });
                
                // 在主函数末尾添加插件按钮初始化
                initPluginButtons();
                // 初始化主题按钮
                themeButton();
                
                // 初始化鼠标中键折叠/展开功能
                window.theme.initCollapseExpand();

                // 底栏位置调整功能
                const updateStatusPosition = () => {
                    const statusElement = document.getElementById('status');
                    if (!statusElement) return;

                    const dockr = document.querySelector('.layout__dockr');
                    const dockVertical = document.querySelector('.dock--vertical');
                    
                    const dockrWidth = dockr?.offsetWidth || 0;
                    const isFloatingR = dockr?.classList.contains('layout--float') ?? true;
                    const isDockVerticalHidden = !dockVertical || dockVertical.classList.contains('fn__none');
                    const dockVerticalWidth = isDockVerticalHidden ? 0 : 26;

                    const totalOffset = (isFloatingR || !dockrWidth) 
                        ? (isDockVerticalHidden ? 9 : dockVerticalWidth + 16)
                        : dockrWidth + (isDockVerticalHidden ? 9 : dockVerticalWidth + 16);

                    statusElement.style.transform = `translateX(-${totalOffset}px)`;
                };

                // 使用 RAF 进行防抖
                const updateDebounced = () => {
                    cancelAnimationFrame(window.statusPositionTimer);
                    window.statusPositionTimer = requestAnimationFrame(updateStatusPosition);
                };

                // 设置观察器
                window.statusObserver = new MutationObserver(updateDebounced);
                window.statusObserver.observe(document.body, { childList: true, subtree: true });
                
                if (document.querySelector('.layout__dockr')) {
                    window.statusResizeObserver = new ResizeObserver(updateDebounced);
                    window.statusResizeObserver.observe(document.querySelector('.layout__dockr'));
                }
                
                updateStatusPosition();
                
                console.log("==============>附加CSS和特性JS_已经执行<==============");
            }
        }, 100);
    };
        
        if (v == null) {
            window.theme.config = { "Savor": 1 };
            写入文件("/data/snippets/Savor.config.json", JSON.stringify(window.theme.config, undefined, 4), funs);
        } else {
            window.theme.config = v;
            funs();
        }
    }, () => {
        // 使用默认配置
        window.theme.config = { "Savor": 1 };
        setTimeout(() => {
            themeButton();
            // 即使使用默认配置也初始化鼠标中键折叠/展开功能
            window.theme.initCollapseExpand();
        }, 100);
    });
    
    
     /** 清除样式 **/
     window.destroyTheme = () => { 
        // 删除主题加载的额外样式
        const styleElements = document.querySelectorAll('[id^="Sv-theme-color"]');  
        styleElements.forEach(element => element.parentNode.removeChild(element));
        // 删除切换按钮
        document.querySelector("#savorToolbar")?.remove();
        // 删除空白
        document.querySelector("#savordrag")?.remove();
        // 删除插件展开按钮
        document.querySelector("#savorPlugins")?.remove();
        // 删除列表转功能
        window.removeEventListener('mouseup', initMenuMonitor);

        // 重置顶栏边距
        document.querySelectorAll('.layout__center .layout-tab-bar--readonly').forEach(tabBar => {
            tabBar.style.marginRight = '0px';
        });
        
        // 重置status元素的transform
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.style.transform = '';
        }
        
        // 清理状态栏位置调整相关的观察器
        if (window.statusObserver) {
            window.statusObserver.disconnect();
            window.statusObserver = null;
        }
        
        // 清理ResizeObserver
        if (window.statusResizeObserver) {
            window.statusResizeObserver.disconnect();
            window.statusResizeObserver = null;
        }
        
        // 取消任何待处理的动画帧
        if (window.statusPositionTimer) {
            cancelAnimationFrame(window.statusPositionTimer);
            window.statusPositionTimer = null;
        }
    };

})();

