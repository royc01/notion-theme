(function () {

    // ========================================
    // 模块：工具函数
    // ========================================
    const debounce = (fn, delay) => {
        let timer = null;
        return (...args) => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };

    const throttle = (fn, delay) => {
        let lastTime = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastTime >= delay) {
                fn(...args);
                lastTime = now;
            }
        };
    };

    const $ = (selector) => selector.startsWith('#') ? 
        document.getElementById(selector.slice(1)) : 
        document.querySelector(selector);

    const $$ = (selector) => document.querySelectorAll(selector);

    // ========================================
    // 模块：统一配置管理
    // ========================================
    const config = {
        data: {},
        save: debounce(function() {
            写入文件("/data/snippets/Savor.config.json", JSON.stringify(config.data, undefined, 4));
        }, 300),
        set(key, value) {
            if (config.data[key] === value) return;
            config.data[key] = value;
            config.save();
        },
        get(key) {
            return config.data[key] ?? null;
        },
        async load() {
            const result = await 获取文件("/data/snippets/Savor.config.json");
            if (result && typeof result === "string") {
                config.data = JSON.parse(result);
            } else if (result) {
                config.data = result;
            } else {
                config.data = { "Savor": 1 };
                config.save();
            }
        }
    };




    // ========================================
    // 模块：i18n 支持
    // ========================================
    const i18n = (() => {
        let lang = (window.siyuan?.config?.lang || 'en').toLowerCase();
        if (lang === 'zh_cht') lang = 'zh_CHT';
        else if (lang.startsWith('zh')) lang = 'zh_CN';
        else lang = 'en';
        let dict = {};
        let ready = fetch(`/appearance/themes/Savor/i18n/${lang}.json`)
            .then(res => res.ok ? res.json() : {})
            .then(json => { dict = json; });
        return {
            t: (key) => dict[key] || key,
            ready: () => ready
        };
    })();



    // ========================================
    // 模块：统一按钮配置（合并 themeStyles）
    // ========================================
    let allButtons = [];
    async function buildAllButtons() {
        await i18n.ready();
        allButtons = [
            // 配色按钮（light）
            { id: "buttonSavor-light", type: "theme", group: "light", label: i18n.t("Light 配色"), cssPath: "/appearance/themes/Savor/style/theme/savor-light.css", styleId: "Sv-theme-color-light", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.4-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.267 14c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c0.933 0 1.6 0.8 1.6 1.6s-0.8 1.6-1.6 1.6c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c1.867 0 3.333-1.467 3.333-3.333s-1.467-3.067-3.333-3.067z" },
            { id: "buttonsalt", type: "theme", group: "light", label: i18n.t("Salt 配色"), cssPath: "/appearance/themes/Savor/style/theme/savor-salt.css", styleId: "Sv-theme-color-salt", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.133 17.2c-1.867-1.067-3.867-2.133-3.867 0s1.733 3.867 3.867 3.867 3.867-1.733 3.867-3.867-2.133 1.067-3.867 0z" },
            { id: "buttonsugar", type: "theme", group: "light", label: i18n.t("Sugar 配色"), cssPath: "/appearance/themes/Savor/style/theme/savor-sugar.css", styleId: "Sv-theme-color-sugar", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-0.267 0-0.533 0-0.8-0.133 2.533-0.133 4.533-2.133 4.533-4.533 0.133-1.067-0.267-2.133-1.067-2.8-0.8-0.8-1.6-1.2-2.8-1.333-0.933-0.133-1.733 0.267-2.4 0.8s-1.067 1.467-1.067 2.267c-0.133 1.467 1.067 2.8 2.533 2.933 1.2 0.133 2.4-0.933 2.4-2.133 0-0.267-0.267-0.533-0.533-0.533s-0.533 0.267-0.533 0.533c0 0.667-0.533 1.2-1.2 1.067-0.933-0.133-1.6-0.8-1.467-1.6 0-0.533 0.267-1.067 0.667-1.467s0.933-0.533 1.6-0.533c0.8 0 1.467 0.267 2 0.933 0.533 0.533 0.8 1.2 0.8 2.133-0.133 2-1.867 3.6-3.867 3.467-1.6-0.133-2.933-0.933-3.733-2.133-0.267-0.8-0.267-1.467-0.267-2.133 0-2.8 2.4-5.2 5.2-5.2s5.2 2.4 5.2 5.2-2.4 5.2-5.2 5.2z" },
            { id: "buttonforest", type: "theme", group: "light", label: i18n.t("Forest 配色"), cssPath: "/appearance/themes/Savor/style/theme/savor-forest.css", styleId: "Sv-theme-color-forest", svg: "M16 12.133c-1.867 0-2.933 1.467-2.933 2.933 0 0.533 0 1.733 0 2.267 0 0.8 0.4 1.467 0.4 1.467 0.4 0.667 1.067 1.2 1.867 1.333v1.2c0 0.267 0.267 0.533 0.533 0.533s0.533-0.267 0.533-0.533v-1.2c1.333-0.267 2.267-1.467 2.267-2.8v-2.267c0.267-1.6-0.933-2.933-2.667-2.933zM17.733 17.333c0 0.8-0.4 1.333-1.2 1.6v-2.267c0-0.267-0.267-0.533-0.533-0.533s-0.533 0.267-0.533 0.533v2.267c-0.8-0.267-1.2-0.933-1.2-1.6v-2.267c0-0.933 0.8-1.733 1.733-1.733s1.733 0.8 1.733 1.733v2.267zM16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467z" },
            { id: "buttonflower", type: "theme", group: "light", label: i18n.t("Flower 配色"), cssPath: "/appearance/themes/Savor/style/theme/savor-flower.css", styleId: "Sv-theme-color-flower", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467zM19.333 14.533c-0.267 0-1.6 0.267-1.6 0.267s-1.067-1.6-1.733-1.6-1.6 1.6-1.6 1.6-1.333-0.267-1.6-0.267-0.667 1.333-0.667 2.667c0 2.4 1.733 4 4 4s4-1.6 4-4c-0.133-1.333-0.4-2.667-0.8-2.667zM16 19.867c-1.467 0-2.667-1.067-2.667-2.667 0-0.4 0-0.8 0.133-1.2 0.133 0 0.4 0.133 0.533 0.133l0.933 0.267 0.533-0.8c0.133-0.267 0.267-0.533 0.533-0.667v0 0c0.133 0.267 0.4 0.533 0.533 0.8l0.533 0.8 0.933-0.267c0.133 0 0.4-0.133 0.533-0.133 0 0.4 0.133 0.8 0.133 1.2 0 1.333-1.2 2.533-2.667 2.533z" },
            { id: "buttonwind", type: "theme", group: "light", label: i18n.t("Wind 配色"), cssPath: "/appearance/themes/Savor/style/theme/savor-wind.css", styleId: "Sv-theme-color-wind", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467zM18.4 13.2h-0.667c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h0.667c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-6.267c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h6.267c1.067 0 1.867-0.8 1.867-1.867 0-1.333-0.8-2.133-1.867-2.133zM14.667 17.733h-2.533c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h2.533c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-0.667c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h0.667c1.067 0 1.867-0.8 1.867-1.867s-0.8-2.133-1.867-2.133z" },
            // 配色按钮（dark）
            { id: "buttonSavor-dark", type: "theme", group: "dark", label: i18n.t("Dark 配色"), cssPath: "/appearance/themes/Savor/style/theme/savor-dark.css", styleId: "Sv-theme-color-dark", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.4-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.267 14c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c0.933 0 1.6 0.8 1.6 1.6s-0.8 1.6-1.6 1.6c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c1.867 0 3.333-1.467 3.333-3.333s-1.467-3.067-3.333-3.067z" },
            { id: "buttonvinegar", type: "theme", group: "dark", label: i18n.t("Vinegar 配色"), cssPath: "/appearance/themes/Savor/style/theme/savor-vinegar.css", styleId: "Sv-theme-color-vinegar", svg: "M19.467 18.533c-0.133 0-0.133 0-0.133 0.133-0.4 0.133-0.8 0.133-1.2 0.133-2 0-3.2-1.2-3.2-3.2 0-0.4 0.133-1.067 0.267-1.2v-0.133c0-0.133-0.133-0.133-0.133-0.133s-0.133 0-0.267 0.133c-1.333 0.533-2.267 1.867-2.267 3.467 0 2.133 1.6 3.733 3.867 3.733 1.6 0 2.933-0.933 3.467-2.133 0.133-0.133 0.133-0.133 0.133-0.133-0.4-0.533-0.533-0.667-0.533-0.667zM16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2z" },
            { id: "buttonocean", type: "theme", group: "dark", label: i18n.t("Ocean 配色"), cssPath: "/appearance/themes/Savor/style/theme/savor-ocean.css", styleId: "Sv-theme-color-ocean", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.133 17.2c-1.867-1.067-3.867-2.133-3.867 0s1.733 3.867 3.867 3.867 3.867-1.733 3.867-3.867-2.133 1.067-3.867 0z" },
            { id: "buttonmountain", type: "theme", group: "dark", label: i18n.t("Mountain 配色"), cssPath: "/appearance/themes/Savor/style/theme/savor-mountain.css", styleId: "Sv-theme-color-mountain", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM14.667 22.267c-1.2-0.267-2.267-0.933-2.933-1.867l2.533-4.4 2.133 3.6-1.733 2.667zM17.867 19.867l0.667-1.2 1.2 2.133c-0.933 0.933-2.133 1.467-3.467 1.467l1.6-2.4zM16 11.467c3.067 0 5.467 2.4 5.467 5.467 0 0.933-0.267 1.867-0.667 2.533l-1.6-2.533c-0.267-0.4-0.667-0.4-0.933-0.267-0.133 0-0.133 0.133-0.267 0.267l-0.667 1.2-2.4-4c-0.267-0.4-0.667-0.4-0.933-0.267-0.133 0-0.133 0.133-0.267 0.267l-2.8 4.8c-0.267-0.667-0.4-1.333-0.4-2 0-3.067 2.4-5.467 5.467-5.467z" },
            // 功能按钮
            { id: "concealButton", type: "feature", label: i18n.t("挖空"), cssPath: "/appearance/themes/Savor/style/topbar/conceal-mark.css", styleId: "Sv-theme-color-conceal挖空", attrName: "conceal挖空", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.267 0 4.133 1.467 4.933 3.467-0.133 0-0.4 0-0.4 0.133-0.533 0.533-0.933 0.8-1.467 1.2 0 0-0.133 0-0.133 0.133-0.533 0.267-1.2 0.533-1.733 0.533 0 0 0 0-0.133 0-0.4 0.133-0.667 0.133-1.067 0.133-0.267 0-0.667 0-0.933-0.133h-0.133c-0.533-0.133-1.2-0.267-1.6-0.533-0.133-0.133-0.133-0.133-0.133-0.133-0.533-0.267-1.067-0.667-1.467-1.067-0.133-0.133-0.533-0.133-0.8 0-0.133 0.133-0.133 0.533 0 0.8 0.4 0.4 0.8 0.8 1.2 1.067l-0.933 0.8c-0.133 0.133-0.133 0.533 0.133 0.8 0.133 0.133 0.133 0.133 0.4 0.133 0.133 0 0.267-0.133 0.4-0.133l0.933-1.2c0.4 0.133 0.8 0.267 1.2 0.4l-0.267 1.2c-0.133 0.267 0.133 0.533 0.4 0.667h0.267c0.267 0 0.533-0.133 0.533-0.4l0.267-1.2h1.467l0.267 1.2c0.133 0.267 0.267 0.4 0.533 0.4h0.133c0.267-0.133 0.533-0.4 0.4-0.667l-0.267-1.2c0.4-0.133 0.8-0.267 1.2-0.4l0.933 1.2c0.133 0.133 0.267 0.133 0.4 0.133s0.267 0 0.4-0.133c0 0 0-0.133 0.133-0.133-0.933 1.867-2.8 3.333-5.067 3.333zM20.933 18.933c0-0.133 0-0.267-0.133-0.4l-0.8-1.067c0.4-0.267 0.8-0.533 1.067-0.8 0 0.267 0 0.533 0 0.667 0.133 0.533 0 1.067-0.133 1.6z", onEnable: () => {}, onDisable: () => {} },
            { id: "tabbarVertical", type: "feature", label: i18n.t("垂直页签"), cssPath: "/appearance/themes/Savor/style/topbar/tab-bar-vertical.css", styleId: "Sv-theme-color-tabbar垂直", attrName: "tabbar垂直", svg: "M21.067 10.667h-10.133c-0.8 0-1.6 0.8-1.6 1.6v10c0 0.933 0.8 1.733 1.6 1.733h10c0.933 0 1.6-0.8 1.6-1.6v-10.133c0.133-0.8-0.667-1.6-1.467-1.6zM21.333 22.4c0 0.133-0.133 0.267-0.267 0.267h-7.333v-7.733h7.6v7.467zM21.333 13.6h-10.667v-1.333c0-0.133 0.133-0.267 0.267-0.267h10c0.267 0 0.4 0.133 0.4 0.267v1.333z", onEnable: () => { let topbarFixed = document.getElementById("Sv-theme-color-topbar隐藏"); if (topbarFixed) { let topbarBtn = document.getElementById("topBar"); if (topbarBtn) topbarBtn.click(); } setTimeout(() => { initTabbarResizer(); }, 500); }, onDisable: () => { removeTabbarResizer(); } },
            { id: "topBar", type: "feature", label: i18n.t("顶栏合并"), cssPath: "/appearance/themes/Savor/style/topbar/top-fixed.css", styleId: "Sv-theme-color-topbar隐藏", attrName: "topbar隐藏", svg: "M21.067 10.667h-1.867c-0.133 0-0.133 0-0.267 0h-3.733c-0.133 0-0.133 0-0.267 0h-4c-0.8 0-1.6 0.8-1.6 1.6v10c0 0.933 0.8 1.733 1.6 1.733h10c0.933 0 1.6-0.8 1.6-1.6v-10.133c0.133-0.8-0.667-1.6-1.467-1.6zM15.333 12h2.4l-1.067 1.6h-2.4l1.067-1.6zM10.667 12.267c0-0.133 0.133-0.267 0.267-0.267h2.8l-1.067 1.6h-2v-1.333zM21.333 22.4c0 0.133-0.133 0.267-0.267 0.267h-10.133c-0.133 0-0.267-0.133-0.267-0.267v-7.333h10.667v7.333zM21.333 13.6h-3.067l1.067-1.6h1.6c0.267 0 0.4 0.133 0.4 0.267 0 0 0 1.333 0 1.333z", onEnable: () => { let verticalTab = document.getElementById("Sv-theme-color-tabbar垂直"); if (verticalTab) { let verticalBtn = document.getElementById("tabbarVertical"); if (verticalBtn) verticalBtn.click(); } initTabBarsMarginUnified('right');initTabBarsMarginUnified('left'); if (window.updateTabBarsMargin) window.updateTabBarsMargin(); if (window.updateTabBarsMarginLeft) window.updateTabBarsMarginLeft(); }, onDisable: () => { window.tabBarsMarginInitialized = false; document.querySelectorAll(".layout__center .layout-tab-bar--readonly").forEach(tabBar => { tabBar.style.marginRight = "0px"; }); document.querySelectorAll(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)").forEach(tabBar => { tabBar.style.marginLeft = "0px"; }); if (window.updateTabBarsMargin) { window.updateTabBarsMargin = null; } if (window.updateTabBarsMarginLeft) { window.updateTabBarsMarginLeft = null; } if (window._tabBarsResizeObserver) { window._tabBarsResizeObserver.disconnect(); window._tabBarsResizeObserver = null; } } },
            { id: "bulletThreading", type: "feature", label: i18n.t("列表子弹线"), cssPath: "/appearance/themes/Savor/style/topbar/bullet-threading.css", styleId: "Sv-theme-color-列表子弹线", attrName: "列表子弹线", svg: "M20 20c1.067 0 2 0.933 2 2s-0.933 2-2 2-2-0.933-2-2c0-1.067 0.933-2 2-2zM18.4 12c1.6 0 2.933 1.333 2.933 2.933s-1.333 2.933-2.933 2.933h-4.667c-0.933 0-1.6 0.8-1.6 1.6 0 0.933 0.8 1.6 1.6 1.6h2.933c0.267 0 0.667 0.267 0.667 0.667 0 0.267-0.267 0.667-0.667 0.667h-2.933c-1.733 0.267-3.067-1.067-3.067-2.8s1.333-2.933 3.067-2.933h4.667c0.933 0 1.6-0.8 1.6-1.6s-0.8-1.733-1.6-1.733h-2.933c-0.533 0-0.8-0.4-0.8-0.667s0.267-0.667 0.667-0.667c0 0 3.067 0 3.067 0zM20 21.333c-0.267 0-0.667 0.267-0.667 0.667 0 0.267 0.267 0.667 0.667 0.667s0.667-0.267 0.667-0.667c0-0.4-0.267-0.667-0.667-0.667v0zM12 10.667c1.067 0 2 0.933 2 2s-0.933 2-2 2c-1.067 0-2-0.933-2-2s0.933-2 2-2zM12 12c-0.267 0-0.667 0.267-0.667 0.667s0.4 0.667 0.667 0.667c0.4 0 0.667-0.267 0.667-0.667v0c0-0.4-0.267-0.667-0.667-0.667z", onEnable: () => { initBulletThreading(); }, onDisable: () => { removeBulletThreading(); } },
            { id: "colorFolder", type: "feature", label: i18n.t("彩色文档树"), cssPath: "/appearance/themes/Savor/style/topbar/color-folder.css", styleId: "Sv-theme-color-彩色文档树", attrName: "彩色文档树", svg: "M11.6 14.933c0-0.133 0-0.267 0-0.4 0-2.533 2-4.533 4.4-4.533s4.4 2 4.4 4.533c0 0.133 0 0.267 0 0.4 1.467 0.667 2.533 2.267 2.533 4.133 0 2.533-2 4.533-4.4 4.533-0.933 0-1.867-0.267-2.533-0.8-0.8 0.533-1.6 0.8-2.533 0.8-2.4 0-4.4-2-4.4-4.533 0-1.867 0.933-3.467 2.533-4.133zM11.867 16.267c-0.933 0.533-1.6 1.6-1.6 2.8 0 1.733 1.467 3.2 3.2 3.2 0.533 0 1.067-0.133 1.6-0.4-0.667-0.8-0.933-1.733-0.933-2.8 0-0.133 0-0.267 0-0.4-1.067-0.533-1.867-1.467-2.267-2.4v0zM15.333 18.933v0c0 1.867 1.467 3.2 3.2 3.2s3.2-1.467 3.2-3.2c0-1.2-0.667-2.267-1.6-2.8-0.667 1.6-2.267 2.8-4.133 2.8-0.267 0.133-0.4 0-0.667 0v0zM16 17.733c1.733 0 3.2-1.467 3.2-3.2s-1.467-3.2-3.2-3.2-3.2 1.467-3.2 3.2 1.467 3.2 3.2 3.2z", onEnable: () => {}, onDisable: () => {} },
            { id: "headingDots", type: "feature", label: i18n.t("标题点标识"), cssPath: "/appearance/themes/Savor/style/topbar/headingdots.css", styleId: "Sv-theme-color-标题点标识", attrName: "标题点标识", svg: "M18.533 15.467c-0.8 0-1.467 0.667-1.467 1.467s0.667 1.467 1.467 1.467 1.467-0.667 1.467-1.467-0.667-1.467-1.467-1.467zM13.467 20.4c-0.8 0-1.467 0.667-1.467 1.467s0.667 1.467 1.467 1.467 1.467-0.667 1.467-1.467c0-0.8-0.667-1.467-1.467-1.467zM18.533 20.4c-0.8 0-1.467 0.667-1.467 1.467s0.667 1.467 1.467 1.467 1.467-0.667 1.467-1.467c0-0.8-0.667-1.467-1.467-1.467zM13.467 15.467c-0.8 0-1.467 0.667-1.467 1.467s0.667 1.467 1.467 1.467 1.467-0.667 1.467-1.467-0.667-1.467-1.467-1.467zM18.533 13.467c0.8 0 1.467-0.667 1.467-1.467s-0.667-1.467-1.467-1.467-1.467 0.667-1.467 1.467 0.667 1.467 1.467 1.467zM13.467 10.667c-0.8 0-1.467 0.667-1.467 1.467s0.667 1.467 1.467 1.467 1.467-0.667 1.467-1.467c0-0.933-0.667-1.467-1.467-1.467z", onEnable: () => {}, onDisable: () => {} },
            { id: "typewriterMode", type: "feature", label: i18n.t("打字机模式"), cssPath: "", styleId: "Sv-theme-typewriter-mode", attrName: "typewriterMode", svg: "M20.133 10.667c1.6 0 2.8 1.2 2.8 2.8v0 6.933c0 1.6-1.2 2.8-2.8 2.8v0h-8.267c-1.6 0-2.8-1.2-2.8-2.8v0-7.067c0-1.467 1.2-2.667 2.8-2.667 0 0 8.267 0 8.267 0zM20.133 12h-8.267c-0.8 0-1.333 0.533-1.333 1.333v0 6.933c0 0.8 0.533 1.333 1.333 1.333h8.533c0.8 0 1.333-0.533 1.333-1.333v-6.933c-0.133-0.667-0.667-1.333-1.6-1.333v0zM19.467 18.933c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-6.933c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667h6.933zM12.533 16.133c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667-0.667-0.267-0.667-0.667 0.267-0.667 0.667-0.667zM16 16.133c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667zM19.467 16.133c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667v0c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667zM12.533 13.333c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667-0.667-0.267-0.667-0.667 0.267-0.667 0.667-0.667zM16 13.333c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667zM19.467 13.333c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667v0c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667z", onEnable: () => { enableTypewriterMode(); }, onDisable: () => { disableTypewriterMode(); } },
            { id: "sidebarMemo", type: "feature", label: i18n.t("侧边栏备注"), cssPath: "/appearance/themes/Savor/style/custom/sidebar-memo.css", styleId: "Sv-theme-sidebar-memo", attrName: "sidebarMemo", svg: "M19.2 13.733h-6.4c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h6.4c0.4 0 0.667-0.267 0.667-0.667s-0.267-0.667-0.667-0.667zM19.2 16.267h-6.4c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h6.4c0.4 0 0.667-0.267 0.667-0.667s-0.267-0.667-0.667-0.667zM20.533 10.533h-9.067c-1.067 0-1.867 0.8-1.867 1.867v6.4c0 1.067 0.8 1.867 1.867 1.867h7.467l2.4 2.4c0.133 0.133 0.267 0.133 0.4 0.133s0.133 0 0.267 0c0.267-0.133 0.4-0.267 0.4-0.533v-10.267c0-1.067-0.8-1.867-1.867-1.867zM21.067 21.2l-1.467-1.467c-0.133-0.133-0.267-0.133-0.4-0.133h-7.733c-0.4 0-0.667-0.267-0.667-0.667v-6.533c0-0.4 0.267-0.667 0.667-0.667h8.933c0.4 0 0.667 0.267 0.667 0.667v8.8z", onEnable: () => { sidebarMemo.setEnabled(true); }, onDisable: () => { sidebarMemo.setEnabled(false); } }
        ];
    }




    // ========================================
    // 模块：CSS 缓存和应用
    // ========================================
    const cssCache = new Map();

    const loadCSS = async (path, cacheKey = path) => {
        if (cssCache.has(cacheKey)) return cssCache.get(cacheKey);
        if (!path) return null;

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const cssText = await response.text();
            cssCache.set(cacheKey, cssText);
            return cssText;
        } catch (error) {
            console.error(`[Savor] 加载CSS失败: ${path}`, error);
            return null;
        }
    }

    async function loadThemeCSS(themeId) {
        const button = allButtons.find(btn => btn.styleId === themeId);
        if (button?.cssPath) {
            return loadCSS(button.cssPath, themeId);
        }
        return null;
    }

    const preloadCurrentModeCSS = () => {
        const themeButtons = allButtons.filter(btn => btn.type === 'theme' && (!btn.group || btn.group === window.theme.themeMode));
        if (!themeButtons) return;
        
        themeButtons.forEach(btn => {
            if (btn?.cssPath) {
                loadCSS(btn.cssPath, btn.styleId);
            }
        });
    }

    const applyCSS = (styleId, cssText) => {
        if (!cssText) return;
        const existing = $(`#${styleId}`);
        if (existing) existing.remove();
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = cssText;
        document.head.appendChild(styleElement);
    }

    const applyThemeCSS = (themeId, cssText) => {
        if (!cssText) return;
        $$('[id^="Sv-theme-color"]').forEach(el => el.remove());
        applyCSS(themeId, cssText);
    }

    const switchThemeStyle = async (themeId) => {
        const cssText = await loadThemeCSS(themeId);
        applyThemeCSS(themeId, cssText);
    }

    const enableSvcolorfulHeading = () => {
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

    const applyRememberedThemeStyle = async (skipFeatures = false) => {
        const themeButtons = allButtons.filter(btn => btn.type === 'theme' && (!btn.group || btn.group === window.theme.themeMode));
        const themeIds = themeButtons.map(btn => btn.id);
        
        const rememberedButton = themeButtons.find(btn => config.get(btn.id) === "1");
        const themeLinkId = rememberedButton 
            ? rememberedButton.styleId
            : `Sv-theme-color-${window.theme.themeMode}`;
        
        await switchThemeStyle(themeLinkId);
        
        const styleElement = document.getElementById("snippet-SvcolorfulHeading");
        if (themeLinkId === 'Sv-theme-color-sugar' || themeLinkId === 'Sv-theme-color-flower') {
            enableSvcolorfulHeading();
        } else if (styleElement) {
            styleElement.remove();
        }
        
        const savorToolbar = document.getElementById("savorToolbar");
        savorToolbar?.querySelectorAll('.b3-menu__item').forEach(btn => {
            btn.classList.remove('button_on');
        });
        rememberedButton && document.getElementById(rememberedButton.id)?.classList.add('button_on');
        
        if (!skipFeatures) {
            await applyRememberedFeatures();
        }
    }

    // ========================================
    // 模块：window.theme 对象
    // ========================================
    window.theme = {
        ID_COLOR_STYLE: 'Sv-theme-color',
        get config() { return config.data; },
        themeMode: null,

        applyThemeTransition: (callback, event = null) => {
            const status = $('#status');
            const currentTransform = status ? status.style.transform : '';
            
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    callback?.();
                    
                    if (status && currentTransform) {
                        setTimeout(() => {
                            status.style.transform = currentTransform;
                        }, 50);
                    }
                });
            } else {
                callback?.();
                
                if (status && currentTransform) {
                    setTimeout(() => {
                        status.style.transform = currentTransform;
                    }, 50);
                }
            }
        },

        findEditableParent: (node) => {
            const editableSelectors = ['[contenteditable="true"]', '.protyle-wysiwyg'];
            
            for (const selector of editableSelectors) {
                const found = node.closest(selector);
                if (found) return found;
            }
            
            return null;
        },

        createElementEx: (refElement, tag, id = null, mode = 'append') => {
            if (!refElement) {
                console.warn('[Savor] 参考元素不存在，无法创建子元素');
                return null;
            }
            if (!tag) {
                console.error('[Savor] 未指定标签名');
                return null;
            }
            
            const el = document.createElement(tag);
            if (id) el.id = id;
            
            try {
                if (mode === 'append') {
                    refElement.appendChild(el);
                } else if (mode === 'prepend') {
                    refElement.insertBefore(el, refElement.firstChild);
                } else if (mode === 'before') {
                    refElement.parentElement.insertBefore(el, refElement);
                }
                return el;
            } catch (error) {
                console.error('[Savor] 创建元素失败:', error);
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
            on: (element, type, handler) => {
                element?.addEventListener?.(type, handler, false);
            },
            off: (element, type, handler) => {
                element?.removeEventListener?.(type, handler, false);
            }
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
        
        isSiyuanFloatingWindow: (element) => {
            return window.theme.findAncestor(element, v => v.getAttribute("data-oid") != null);
        },
        
        setBlockFold: (id, fold) => {
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
        }
    };

    window.theme.themeMode = window.siyuan.config.appearance.mode === 0 ? 'light' : 'dark';




    // ========================================
    // 模块：主题按钮
    // ========================================
    const renderAllButtons = () => {
        const savorToolbar = document.getElementById("savorToolbar");
        if (!savorToolbar) return;
        savorToolbar.innerHTML = "";
        const fragment = document.createDocumentFragment();

        // 先配色后功能
        const themeMode = window.theme.themeMode;
        const themeButtons = allButtons.filter(btn => btn.type === 'theme' && (!btn.group || btn.group === themeMode));
        const featureButtons = allButtons.filter(btn => btn.type === 'feature');
        const buttons = [...themeButtons, ...featureButtons];

        buttons.forEach(btn => {
            const button = document.createElement("button");
            button.id = btn.id;
            button.className = "b3-menu__item savor-button";
            button.setAttribute("aria-label", btn.label);
            button.innerHTML = `<svg class="b3-menu__icon savor-icon" viewBox="9 10 14 14" xmlns="http://www.w3.org/2000/svg"><path d="${btn.svg}"></path></svg><span class="b3-menu__label">${btn.label}</span>`;

            // 状态高亮
            let isActive = false;
                    if (btn.type === 'theme') {
            const themeLinkId = btn.id.replace(/^button(Savor-)?/, 'Sv-theme-color-');
            const themeElement = document.getElementById(themeLinkId);
            if (themeElement && !themeElement.disabled) {
                button.classList.add("button_on");
                isActive = true;
            }
        } else if (btn.type === 'feature') {
            if (getItem(btn.attrName) === "1") {
                button.classList.add("button_on");
                isActive = true;
            }
        }

            // 点击逻辑
            button.addEventListener("click", async () => {
                if (btn.type === 'theme') {
                    savorToolbar.querySelectorAll('.b3-menu__item').forEach(btn => btn.classList.remove('button_on'));
                    button.classList.add('button_on');
                    window.theme.applyThemeTransition(async () => {
                        const cssText = await loadCSS(btn.cssPath);
                        applyThemeCSS(btn.styleId, cssText);
                        const styleElement = document.getElementById("snippet-SvcolorfulHeading");
                        if (btn.styleId === "Sv-theme-color-sugar" || btn.styleId === "Sv-theme-color-flower") {
                            enableSvcolorfulHeading();
                        } else if (styleElement) {
                            styleElement.remove();
                        }
                        await applyRememberedFeatures();
                        setTimeout(() => {
                            if (window.statusObserver?.updatePosition) {
                                window.statusObserver.updatePosition();
                            }
                        }, 100);
                    });
                    // 记忆状态
                    const themeButtons = allButtons.filter(b => b.type === 'theme' && (!b.group || b.group === themeMode));
                    themeButtons.forEach(b => config.set(b.id, "0"));
                    config.set(btn.id, "1");
                } else if (btn.type === 'feature') {
                    const isActive = button.classList.contains("button_on");
                    if (isActive) {
                        button.classList.remove("button_on");
                        const styleElement = document.getElementById(btn.styleId);
                        if (styleElement) styleElement.remove();
                        if (btn.onDisable) btn.onDisable();
                        config.set(btn.attrName, "0");
                    } else {
                        button.classList.add("button_on");
                        if (btn.cssPath) {
                            const cssText = await loadCSS(btn.cssPath);
                            applyCSS(btn.styleId, cssText);
                        }
                        if (btn.onEnable) btn.onEnable();
                        config.set(btn.attrName, "1");
                    }
                }
            });
            fragment.appendChild(button);
        });
        savorToolbar.appendChild(fragment);
    };




    // ========================================
    // 模块：配置、文件操作和初始化管理
    // ========================================
    // 配置和缓存管理
    const saveConfig = debounce(() => {
        写入文件("/data/snippets/Savor.config.json", JSON.stringify(config.data, undefined, 4));
    }, 300);

    const setItem = config.set;
    const getItem = config.get;

    const domCache = new Map();
    const getCachedElement = (selector) => {
        if (!domCache.has(selector)) {
            domCache.set(selector, document.querySelector(selector));
        }
        return domCache.get(selector);
    };

    // 文件操作
    const fileOps = {
        async get(path, callback = null) {
            try {
                const response = await fetch("/api/file/getFile", {
                    body: JSON.stringify({ path }),
                    method: "POST",
                    headers: { Authorization: "Token " } 
                });
                const data = response.ok ? await response.json() : null;
                if (callback) callback(data);
                return data;
            } catch (error) {
                console.error("[Savor] API 请求失败:", error);
                if (callback) callback(null);
                return null;
            }
        },
        
        async put(path, data, callback = null) {
            const formdata = new FormData();
            formdata.append("path", path);
            formdata.append("file", new File([new Blob([data])], path.split("/").pop()));
            formdata.append("isDir", false);
            formdata.append("modTime", Date.now());
            
            try {
                await fetch("/api/file/putFile", {
                    body: formdata,
                    method: "POST",
                    headers: { Authorization: `Token ${window.siyuan.config.api.token ?? ""}` },
                });
                if (callback) setTimeout(() => callback(), 200);
            } catch (error) {
                console.error("写入文件出错:", error);
            }
        }
    };

    const 获取文件 = fileOps.get;
    const 写入文件 = fileOps.put;

    // 工具栏和观察器管理
    const menuListeners = new WeakMap();
    
    const shouldShowSavorToolbar = () => {
        const html = document.documentElement;
        const themeMode = html.getAttribute("data-theme-mode");
        return html.getAttribute(`data-${themeMode}-theme`) === "Savor";
    };

    const handleMenuClick = (e) => {
        const menuItem = e.target.closest(".b3-menu__item");
        if (!menuItem) return;
        
        const buttonText = menuItem.textContent.trim();
        const { themeLight, themeDark, themeOS } = window.siyuan.languages;
        
        if (buttonText === themeLight || buttonText === themeDark || buttonText === themeOS) {
            let targetMode = buttonText === themeOS ? 
                (window.matchMedia("(prefers-color-scheme: light)").matches ? themeLight : themeDark) : 
                buttonText;
            
            const currentMode = window.siyuan.config.appearance.mode === 0 ? themeLight : themeDark;
            if (targetMode === currentMode) return;
            
            const targetTheme = targetMode === themeLight ? window.siyuan.config.appearance.themeLight : window.siyuan.config.appearance.themeDark;
            if (targetTheme !== "Savor") return;
            
            window.theme.applyThemeTransition(() => {}, e);
        }
    };

    const toggleMenuListener = (commonMenu, add = true) => {
        if (add && !menuListeners.has(commonMenu)) {
            menuListeners.set(commonMenu, handleMenuClick);
            commonMenu.addEventListener("click", handleMenuClick, true);
        } else if (!add && menuListeners.has(commonMenu)) {
            const listener = menuListeners.get(commonMenu);
            commonMenu.removeEventListener("click", listener, true);
            menuListeners.delete(commonMenu);
        }
    };

    const initSavorToolbar = () => {
        if (document.getElementById("savorToolbar")) return; // 只创建一次
        
        const commonMenu = document.getElementById("commonMenu");
        if (!commonMenu || commonMenu.getAttribute("data-name") !== "barmode" || !shouldShowSavorToolbar()) return;
        
        const toolbarEdit = document.getElementById("toolbarEdit");
        const windowControls = commonMenu.querySelector(".b3-menu__items");
        let savorToolbar = document.createElement("div");
        savorToolbar.id = "savorToolbar";
        
        if (!toolbarEdit) {
            if (windowControls) {
                windowControls.parentElement.insertBefore(savorToolbar, windowControls);
            }
        } else {
            savorToolbar.style.position = "relative";
            toolbarEdit.parentNode.insertBefore(savorToolbar, toolbarEdit);
        }
        
        renderAllButtons();
        requestAnimationFrame(() => applyRememberedThemeStyle());
    };

    // 观察器初始化函数
    const initStatusPosition = () => {
        let lastOffset = null;
        
        const updatePosition = () => {
            const status = $("#status");
            if (!status) return;
            
            const dockr = $(".layout__dockr");
            const dockVertical = $(".dock--vertical");
            const dockrWidth = dockr?.offsetWidth ?? 0;
            const isFloatingR = dockr?.classList.contains("layout--float") ?? true;
            const isDockVerticalHidden = !dockVertical || dockVertical.classList.contains("fn__none");
            const dockVerticalWidth = isDockVerticalHidden ? 0 : 26;
            
            const totalOffset = (isFloatingR || !dockrWidth) 
                ? (isDockVerticalHidden ? 9 : dockVerticalWidth + 16)
                : dockrWidth + (isDockVerticalHidden ? 9 : dockVerticalWidth + 16);
            
            const layoutCenter = document.querySelector('.layout__center');
            if (layoutCenter) {
                status.style.maxWidth = `${layoutCenter.offsetWidth - 8}px`;
            } else {
                status.style.maxWidth = '';
            }
            
            if (lastOffset !== totalOffset) {
                status.style.transform = `translateX(-${totalOffset}px)`;
                lastOffset = totalOffset;
            }
        };
        
        const statusObserver = new ResizeObserver(throttle(updatePosition, 8));
        
        const dockr = $(".layout__dockr");
        const dockVertical = $(".dock--vertical");
        
        dockr && statusObserver.observe(dockr);
        dockVertical && statusObserver.observe(dockVertical);
        
        window.statusObserver = statusObserver;
        window.statusObserver.updatePosition = updatePosition;
        updatePosition();
    };

    const initToolbarObserver = () => {
        const commonMenuObserver = new MutationObserver(debounce(() => {
            const commonMenu = getCachedElement("#commonMenu");
            const isBarMode = commonMenu?.getAttribute("data-name") === "barmode";
            if (isBarMode && shouldShowSavorToolbar()) {
                initSavorToolbar();
                toggleMenuListener(commonMenu, true);
            } else {
                // 切换到其他菜单时物理移除savorToolbar
                const savorToolbar = document.getElementById("savorToolbar");
                if (savorToolbar) savorToolbar.remove();
                if (commonMenu) toggleMenuListener(commonMenu, false);
            }
        }, 16));
        
        const commonMenu = getCachedElement("#commonMenu");
        if (commonMenu) {
            commonMenuObserver.observe(commonMenu, { attributes: true, attributeFilter: ["data-name"] });
            if (commonMenu.getAttribute("data-name") === "barmode" && shouldShowSavorToolbar()) {
                initSavorToolbar();
                toggleMenuListener(commonMenu, true);
            }
        } else {
            const waitObserver = new MutationObserver((mutations, obs) => {
                const commonMenu = getCachedElement("#commonMenu");
                if (commonMenu) {
                    commonMenuObserver.observe(commonMenu, { attributes: true, attributeFilter: ["data-name"] });
                    if (commonMenu.getAttribute("data-name") === "barmode" && shouldShowSavorToolbar()) {
                        initSavorToolbar();
                        toggleMenuListener(commonMenu, true);
                    }
                    obs.disconnect();
                }
            });
            waitObserver.observe(document.body, { childList: true, subtree: true });
        }
    };

    const initThemeObserver = () => {
        let previousThemeMode = window.theme.themeMode;
        let previousThemeName = shouldShowSavorToolbar() ? "Savor" : null;
        
        const themeObserver = new MutationObserver(debounce(() => {
            const newThemeMode = window.siyuan.config.appearance.mode === 0 ? "light" : "dark";
            const html = document.documentElement;
            const newThemeName = html.getAttribute(`data-${newThemeMode}-theme`);
            
            if (previousThemeMode === newThemeMode && previousThemeName === newThemeName) return;
            
            const isSavorToSavor = previousThemeName === "Savor" && newThemeName === "Savor";
            window.theme.themeMode = newThemeMode;
            
            const commonMenu = getCachedElement("#commonMenu");
            const existingSavorToolbar = getCachedElement("#savorToolbar");
            
            if (commonMenu?.getAttribute("data-name") === "barmode") {
                if (shouldShowSavorToolbar()) {
                    if (!existingSavorToolbar) {
                        initSavorToolbar();
                        setTimeout(() => initMiddleClickCollapse(), 100);
                    } else {
                        window.theme.applyThemeTransition(async () => {
                            renderAllButtons();
                            await applyRememberedThemeStyle(isSavorToSavor);
                        });
                    }
                } else if (existingSavorToolbar) {
                    existingSavorToolbar.remove();
                    domCache.clear();
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

    // 主初始化函数
    (async () => {
        await i18n.ready();
        await buildAllButtons();
        await config.load();
        await Promise.all([
            applyRememberedThemeStyle(),
            preloadCurrentModeCSS()
        ]);
        [initMiddleClickCollapse, collapsedListPreview].forEach(fn => fn());
        initThemeObserver();
        if (document.getElementById("commonMenu")) {
            initToolbarObserver();
        } else {
            setTimeout(initToolbarObserver, 50);
        }
        initStatusPosition();
    })();




    // ========================================
    // 模块：鼠标中键折叠/展开功能
    // ========================================
    const initMiddleClickCollapse = () => {
        if (window.theme._collapseHandler) return;
        
        const DEBOUNCE_TIME = 300;
        let lastClickTime = 0;
        const self = window.theme;

        const collapseHandler = (e) => {
            if (e.button !== 1 || e.shiftKey || e.altKey) return;

            const now = Date.now();
            if (now - lastClickTime < DEBOUNCE_TIME) return;
            lastClickTime = now;

            let target = window.theme.findEditableParent(e.target);
            if (!target) return;

            e.preventDefault();

            const parent = target.parentElement;
            const grandParent = parent?.parentElement;
            if (!parent) return;

            if (parent.getAttribute("data-type") === "NodeHeading") {
                if (grandParent?.getAttribute("data-type") === "NodeListItem") {
                    handleListItemCollapse(target);
                } else {
                    handleHeadingCollapse(target);
                }
            } else if (grandParent?.getAttribute("data-type") === "NodeListItem") {
                handleListItemCollapse(target);
            }
        };

        const findElementByCondition = (el, cond) => {
            if (!el) return null;
            if (cond(el)) return el;
            for (const child of el.children || []) {
                const found = findElementByCondition(child, cond);
                if (found) return found;
            }
            return null;
        }

        const handleHeadingCollapse = (el) => {
            const protyle = findProtyleContainer(el);
            if (!protyle) return;
            const gutters = protyle.querySelector(".protyle-gutters");
            const foldBtn = findElementByCondition(gutters, v => v.getAttribute("data-type") === "fold");
            foldBtn?.click();
        }

        const findProtyleContainer = (el) => {
            const classes = ["protyle", "fn__flex-1 protyle", "block__edit fn__flex-1 protyle", "fn__flex-1 spread-search__preview protyle"];
            let cur = el, i = 0;
            while (cur && i++ < 20) {
                if (cur.className && classes.includes(cur.className)) return cur;
                cur = cur.parentElement;
            }
            return null;
        }

        const handleListItemCollapse = (el) => {
            if (self.isSiyuanFloatingWindow(el)) {
                const listItem = self.findAncestor(el, v => v.classList.contains("li"), 7);
                if (listItem && !listItem.previousElementSibling) {
                    toggleFoldAttribute(listItem);
                    return;
                }
            }
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

        const toggleFoldAttribute = (el) => {
            const fold = el.getAttribute("fold");
            el.setAttribute("fold", fold === "1" ? "0" : "1");
        }

        window.theme._collapseHandler = collapseHandler;
        document.body.addEventListener("mousedown", collapseHandler);
    }




    // ========================================
    // 模块：列表折叠内容预览查看
    // ========================================
    let listPreviewActive = false;
    let listPreviewHandler = null;

    const collapsedListPreview = () => {
        if (listPreviewActive) return;
        listPreviewActive = true;
        
        listPreviewHandler = debounce(collapsedListPreviewEvent, 100);
        window.theme.BodyEventRunFun("mouseover", listPreviewHandler, 2000);
        
        setTimeout(() => {
            collapsedListPreviewEvent();
        }, 500);
    }

    const collapsedListPreviewEvent = () => {
        const foldedItems = [
            ...document.querySelectorAll(".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [data-node-id].li[fold='1']"),
            ...document.querySelectorAll("[data-oid] [data-node-id].li[fold='1']"),
            ...document.querySelectorAll("#searchPreview [data-node-id].li[fold='1']")
        ];
        
        const previewTargets = foldedItems.reduce((arr, item) => {
            const el = item.children[1];
            if (el && ["p", "h1", "h2", "h3", "h4", "h5", "h6"].includes(el.className)) {
                const contentElement = el.children[0];
                if (contentElement) {
                    arr.push(contentElement);
                }
            }
            return arr;
        }, []);
        
        cleanupListPreview();
        previewTargets.forEach(registerPreviewEvents);
    }

    const cleanupListPreview = () => {
        [
            ...document.querySelectorAll(".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [ListPreview]"),
            ...document.querySelectorAll("[data-oid] [ListPreview]"),
            ...document.querySelectorAll("#searchPreview [ListPreview]")
        ].forEach(element => {
            const parent = element.parentElement;
            if (!parent || parent.getAttribute("fold") == null || parent.getAttribute("fold") == "0") {
                element.removeAttribute("ListPreview");
                if (element.children[0]) {
                    window.theme.EventUtil.off(element.children[0], "mouseenter", handleMouseEnter);
                }
                if (parent?.parentElement) {
                    window.theme.EventUtil.off(parent.parentElement, "mouseleave", handleMouseLeave);
                }
                Array.from(parent?.parentElement?.children || []).forEach(child => {
                    if (child.getAttribute?.("triggerBlock") != null) {
                        child.remove();
                    }
                });
            }
        });
    }

    const registerPreviewEvents = (element) => {
        const parent = element.parentElement, grandParent = parent?.parentElement;
        if (!parent || !grandParent) return;
        
        if (parent.getAttribute("ListPreview") != null) {
            window.theme.EventUtil.off(element, "mouseenter", handleMouseEnter);
            window.theme.EventUtil.off(grandParent, "mouseleave", handleMouseLeave);
        }
        
        parent.setAttribute("ListPreview", true);
        window.theme.EventUtil.on(element, "mouseenter", handleMouseEnter);
        window.theme.EventUtil.on(grandParent, "mouseleave", handleMouseLeave);
    }

    const handleMouseEnter = (e) => {
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

    const handleMouseLeave = (e) => {
        e.target.querySelectorAll('[triggerBlock]').forEach(el => el.remove());
    }

    const createTriggerBlock = (container, refObj, left, top) => {
        const previewID = container.getAttribute("data-node-id");
        if (!previewID) return;
        
        const triggerBlock = window.theme.createElementEx(container, "div", null, 'append');
        if (!triggerBlock) return;
        
        triggerBlock.setAttribute("triggerBlock", "true");
        triggerBlock.setAttribute("contenteditable", "false");
        triggerBlock.className = "protyle-attr";
        triggerBlock.style.cssText = `position:absolute;width:20px;height:15px;display:flex;z-index:999;cursor:pointer;WebkitUserModify:read-only;background:transparent;top:${top}px;left:${left}px;`;
        triggerBlock.innerHTML = `<span data-type='a' class='list-A' data-href='siyuan://blocks/${previewID}' style='font-size:15px;line-height:15px;color:transparent;text-shadow:none;border:none;'>####</span>`;
    }

    const disableListPreview = () => {
        if (!listPreviewActive) return;
        
        listPreviewActive = false;
        listPreviewHandler = null;
        
        cleanupListPreview();
        document.querySelectorAll('[triggerBlock]').forEach(el => el.remove());
    }




    // ========================================
    // 模块：垂直页签宽度调节功能
    // ========================================
    let tabbarResizer = null;
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    let currentTabbar = null;
    const MIN_WIDTH = 150;
    const MAX_WIDTH = 400;

    const initTabbarResizer = () => {
        removeTabbarResizer(false); // 初始化时不重置宽度
        const verticalTabbar = document.querySelector(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)");
        if (verticalTabbar) {
            createResizer(verticalTabbar);
        }
    }

    const createResizer = (verticalTabbar) => {
        tabbarResizer = document.createElement("div");
        tabbarResizer.id = "vertical-resize-handle";
        tabbarResizer.style.cssText = `
            position: absolute;
            top: 0;
            right: -3px;
            width: 6px;
            height: 100%;
            cursor: col-resize;
            background: transparent;
            z-index: 1000;
        `;
        verticalTabbar.style.position = "relative";
        verticalTabbar.appendChild(tabbarResizer);
        tabbarResizer.addEventListener("mousedown", startResize);
        document.addEventListener("mousemove", resizeTabbar);
        document.addEventListener("mouseup", stopResize);
    }

    const startResize = (e) => {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        currentTabbar = e.target.parentElement;
        if (!currentTabbar) return;
        startWidth = currentTabbar.offsetWidth;
        document.body.classList.add("tabbar-resizing");
    }

    const resizeTabbar = (e) => {
        if (!isResizing || !currentTabbar) return;
        const deltaX = e.clientX - startX;
        let newWidth = startWidth + deltaX;
        newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH));
        currentTabbar.style.width = newWidth + "px";
    }

    const stopResize = () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.classList.remove("tabbar-resizing");
        currentTabbar = null;
    }

    const removeTabbarResizer = (resetWidth = true) => {
        document.removeEventListener("mousemove", resizeTabbar);
        document.removeEventListener("mouseup", stopResize);
        const existingResizer = document.getElementById("vertical-resize-handle");
        if (existingResizer) existingResizer.remove();
        document.body.classList.remove("tabbar-resizing");
        
        // 只在需要时重置宽度
        if (resetWidth) {
            document.querySelectorAll(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)").forEach(tabbar => {
                tabbar.style.width = "";
                tabbar.style.position = "";
            });
        }
        
        tabbarResizer = null;
        isResizing = false;
        currentTabbar = null;
    }




    // ========================================
    // 模块：顶栏合并左右间距功能
    // ========================================
    const initTabBarsMarginUnified = (direction = "right") => {
        let dock = null;
        let dockVertical = null;
        const isRight = direction === "right";

        const cacheElements = () => {
            dock = document.querySelector(isRight ? ".layout__dockr" : ".layout__dockl");
            dockVertical = document.querySelector(".dock--vertical");
        };

        const updateMargins = () => {
            const topBarFixed = document.getElementById("Sv-theme-color-topbar隐藏");
            if (!topBarFixed) {
                const selector = isRight
                    ? ".layout__center .layout-tab-bar--readonly"
                    : ".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)";
                document.querySelectorAll(selector).forEach(tabBar => {
                    tabBar.style[isRight ? "marginRight" : "marginLeft"] = "0px";
                });
                return;
            }
            const $ = s => document.querySelectorAll(s);
            const allTabBars = isRight
                ? $(".layout__center .layout-tab-bar--readonly")
                : $(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)");

            const panel = document.querySelector(isRight ? ".layout__dockr" : ".layout__dockl");
            const panelWidth = panel?.classList.contains("layout--float")
                ? panel.querySelector(".dock")?.offsetWidth ?? 0
                : panel?.offsetWidth ?? 0;

            const dockId = isRight ? "#dockRight" : "#dockLeft";
            const dockWidth = document.querySelector(dockId)?.offsetWidth ?? 0;

            let barButtonsTotalWidth = 0;
            const drag = document.getElementById("drag");
            if (drag) {
                if (isRight) {
                    // #drag 后面所有兄弟元素
                    let el = drag.nextElementSibling;
                    while (el) {
                        if (el.offsetParent !== null) {
                            barButtonsTotalWidth += (el.offsetWidth ?? 0) + 4;
                        }
                        el = el.nextElementSibling;
                    }
                } else {
                    // #drag 前面所有兄弟元素
                    let el = drag.previousElementSibling;
                    while (el) {
                        if (el.offsetParent !== null) {
                            barButtonsTotalWidth += (el.offsetWidth ?? 0) + 4;
                        }
                        el = el.previousElementSibling;
                    }
                }
            }

            const calculatedMargin = barButtonsTotalWidth - panelWidth - dockWidth;
            const CUSTOM_MARGIN_RIGHT = -14;
            const CUSTOM_MARGIN_LEFT = 0;
            let marginValue;
            if (isRight) {
                const calcMargin = (calculatedMargin > 0 ? calculatedMargin + CUSTOM_MARGIN_RIGHT : CUSTOM_MARGIN_RIGHT);
                marginValue = `${Math.max(0, calcMargin)}px`;
            } else {
                const calcMargin = (calculatedMargin > 0 ? calculatedMargin + CUSTOM_MARGIN_LEFT : CUSTOM_MARGIN_LEFT);
                marginValue = `${calcMargin}px`;
            }

            if (isRight) {
                allTabBars.forEach(tabBar => {
                    tabBar.style.marginRight = "0px";
                });
                const resizers = document.querySelectorAll(".layout__center .layout__resize:not(.layout__resize--lr)");
                if (resizers.length === 0) {
                    const lastTabBar = allTabBars[allTabBars.length - 1];
                    if (lastTabBar) {
                        if (lastTabBar.closest(".layout__dockr") || lastTabBar.closest(".layout__center")) {
                            lastTabBar.style.marginRight = marginValue;
                        }
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

        const init = () => {
            cacheElements();
            if (dock) new ResizeObserver(updateMargins).observe(dock);
            if (dockVertical) {
                new MutationObserver(updateMargins).observe(dockVertical, {
                    attributes: true,
                    attributeFilter: ["class"]
                });
            }
            updateMargins();
            setTimeout(updateMargins, 500);
        };

        init();

        const observer = new MutationObserver(() => {
            if (!dock || !dockVertical) {
                cacheElements();
                if (dock || dockVertical) init();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
        window.addEventListener("load", init);
        document.addEventListener("themechange", updateMargins);
        
        if (isRight) {
            window.updateTabBarsMargin = updateMargins;
        } else {
            window.updateTabBarsMarginLeft = updateMargins;
        }
        setTimeout(updateMargins, 1000);
    }

    // 初始化左右两侧
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
        window._tabBarsResizeObserver = resizeObserver;
    }




    // ========================================
    // 模块：打字机模式
    // ========================================
    let typewriterModeActive = false;
    let typewriterHandler = null;

    const enableTypewriterMode = () => {
        if (typewriterModeActive) return;
        typewriterModeActive = true;
        
        typewriterHandler = debounce(() => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const node = range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer;
            const editable = window.theme.findEditableParent(node);
            if (!editable) return;
            
            const protyle = editable.closest(".protyle");
            if (!protyle) return;
            
            const line = node.closest(".p, .h1, .h2, .h3, .h4, .h5, .h6, .li") || node;
            const container = protyle.querySelector(".protyle-content") || protyle;
            
            const rect = line.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const center = container.clientHeight * 0.4;
            const targetScrollTop = container.scrollTop + rect.top - containerRect.top - center + rect.height / 2;
            
            container.scrollTo({
                top: targetScrollTop,
                behavior: "smooth"
            });
        }, 100);
        
        document.addEventListener("selectionchange", typewriterHandler);
    }

    const disableTypewriterMode = () => {
        if (!typewriterModeActive) return;
        typewriterModeActive = false;
        if (typewriterHandler) {
            document.removeEventListener("selectionchange", typewriterHandler);
            typewriterHandler = null;
        }
    }




    // ========================================
    // 模块：子弹线功能
    // ========================================
    let bulletThreadingActive = false;
    let selectionChangeHandler = null;
    let lastListItems = null;


    const initBulletThreading = () => {
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

    const removeBulletThreading = () => {
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


    // ===================== 新增：list2map 提示 i18n 赋值 =====================
    function setList2MapI18nTip() {
        const tip = i18n.t("list2map.tip");
        document.querySelectorAll('[custom-f="dt"]').forEach(el => {
            el.setAttribute('data-i18n-tip', tip);
        });
    }
    i18n.ready().then(() => {
        setList2MapI18nTip();
        // 监听 DOM 变化，动态赋值
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === "attributes" && mutation.target.getAttribute("custom-f") === "dt") {
                    setList2MapI18nTip();
                } else if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.getAttribute?.("custom-f") === "dt" || node.querySelector?.('[custom-f="dt"]')) {
                                setList2MapI18nTip();
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
            attributeFilter: ["custom-f"]
        });
    });


    // ========================================
    // 模块：视图选择UI
    // ========================================
    const viewButtons = {
        NodeList: [
            { id: "GraphView", attrName: "f", attrValue: "dt", icon: "iconFiles", labelKey: "转换为导图" },
            { id: "TableView", attrName: "f", attrValue: "bg", icon: "iconTable", labelKey: "转换为表格" },
            { id: "kanbanView", attrName: "f", attrValue: "kb", icon: "iconMenu", labelKey: "转换为看板" },
            { id: "DefaultView", attrName: "f", attrValue: "", icon: "iconList", labelKey: "恢复为列表" }
        ],
        NodeTable: [
            { id: "FixWidth", attrName: "f", attrValue: "", icon: "iconTable", labelKey: "默认宽度" },
            { id: "FullWidth", attrName: "f", attrValue: "full", icon: "iconTable", labelKey: "页面宽度" },
            { separator: true },
            { id: "vHeader", attrName: "t", attrValue: "vbiaotou", icon: "iconSuper", labelKey: "竖向表头样式" },
            { id: "Removeth", attrName: "t", attrValue: "biaotou", icon: "iconSuper", labelKey: "空白表头样式" },
            { id: "Defaultth", attrName: "t", attrValue: "", icon: "iconSuper", labelKey: "恢复表头样式" }
        ]
    };

    const ViewSelect = (selectid, selecttype) => {
        const button = document.createElement("button");
        button.id = "viewselect";
        button.className = "b3-menu__item";
        button.innerHTML = `
            <svg class="b3-menu__icon"><use xlink:href="#iconGlobalGraph"></use></svg>
            <span class="b3-menu__label">${i18n.t("视图选择")}</span>
            <svg class="b3-menu__icon b3-menu__icon--arrow"><use xlink:href="#iconRight"></use></svg>
        `;
        
        const submenu = document.createElement("button");
        submenu.id = "viewselectSub";
        submenu.className = "b3-menu__submenu";
        
        const menuItems = document.createElement("div");
        menuItems.className = "b3-menu__items";
        
        const buttons = viewButtons[selecttype] || [];
        
        menuItems.innerHTML = buttons.map(button => {
            if (button.separator) {
                return `<button class="b3-menu__separator"></button>`;
            } else {
                return `
                    <button class="b3-menu__item" data-node-id="${selectid}" 
                            custom-attr-name="${button.attrName}" 
                            custom-attr-value="${button.attrValue}">
                        <svg class="b3-menu__icon"><use xlink:href="#${button.icon}"></use></svg>
                        <span class="b3-menu__label">${i18n.t(button.labelKey)}</span>
                    </button>
                `;
            }
        }).join("");
        
        menuItems.querySelectorAll(".b3-menu__item").forEach(btn => {
            btn.onclick = ViewMonitor;
        });
        
        submenu.appendChild(menuItems);
        button.appendChild(submenu);
        return button;
    }

    const getBlockSelected = () => {
        const node = document.querySelector(".protyle-wysiwyg--select");
        return node?.dataset?.nodeId ? {
            id: node.dataset.nodeId,
            type: node.dataset.type,
            subtype: node.dataset.subtype
        } : null;
    }

    const initMenuMonitor = () => {
        window.addEventListener("mouseup", () => {
            setTimeout(() => {
                const selectinfo = getBlockSelected();
                if (selectinfo && (selectinfo.type === "NodeList" || selectinfo.type === "NodeTable")) {
                    setTimeout(() => InsertMenuItem(selectinfo.id, selectinfo.type), 0);
                }
            }, 0);
        });
    }

    const InsertMenuItem = (selectid, selecttype) => {
        const commonMenu = document.querySelector("#commonMenu .b3-menu__items");
        if (!commonMenu) return;
        
        const readonly = commonMenu.querySelector(`[data-id="updateAndCreatedAt"]`);
        const selectview = commonMenu.querySelector(`[id="viewselect"]`);
        
        if (readonly && !selectview) {
            const separator = document.createElement("button");
            separator.className = "b3-menu__separator";
            
            commonMenu.insertBefore(ViewSelect(selectid, selecttype), readonly);
            commonMenu.insertBefore(separator, readonly);
        }
    }

    const ViewMonitor = (event) => {
        const target = event.currentTarget;
        const id = target.getAttribute("data-node-id");
        const attrName = "custom-" + target.getAttribute("custom-attr-name");
        const attrValue = target.getAttribute("custom-attr-value");
        
        const blocks = document.querySelectorAll(`.protyle-wysiwyg [data-node-id="${id}"]`);
        clearTransformData(id, blocks);
        
        if (blocks?.length > 0) {
            blocks.forEach(block => block.setAttribute(attrName, attrValue));
            if (attrValue === "") blocks.forEach(cleanupDraggable);
            设置思源块属性(id, { [attrName]: attrValue });
        }
    }

    const 设置思源块属性 = async (id, attrs) => {
        try {
            const response = await fetch("/api/attr/setBlockAttrs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${window.siyuan?.config?.api?.token ?? ""}`
                },
                body: JSON.stringify({
                    id,
                    attrs
                })
            });
            
            if (!response.ok) {
                console.error("[Savor] 设置块属性失败:", response.statusText);
            }
        } catch (error) {
            console.error("[Savor] 设置块属性出错:", error);
        }
    }

    const clearTransformData = (id, blocks) => {
        try {
            const positions = JSON.parse(localStorage.getItem("dt-positions") || "{}");
            if (positions[id]) {
                delete positions[id];
                localStorage.setItem("dt-positions", JSON.stringify(positions));
                blocks.forEach(cleanupDraggable);
            }
        } catch (error) {
            console.error("清除transform数据出错:", error);
        }
    }

    setTimeout(() => initMenuMonitor(), 1000);




    // ========================================
    // 模块：导图拖拽功能
    // ========================================
    if (typeof window.dragDebounce === "undefined") {
        window.dragDebounce = (fn) => {
            let timer = null;
            return (...args) => {
                if (timer) cancelAnimationFrame(timer);
                timer = requestAnimationFrame(() => fn(...args));
            };
        };

        const initDraggable = (element) => {
            const listItems = element.querySelectorAll(`:scope > [data-type="NodeListItem"]`);
            if (!listItems.length) return;
            
            // 为整个导图容器设置共享的缩放状态
            if (!element.hasAttribute("data-draggable")) {
                element.setAttribute("data-draggable", "true");
                element._scale = 1;
                
                // 初始化事件监听器数组
                element._wheelListeners = [];
                element._doubleClickListeners = [];
                element._mouseDownListeners = [];
                
                // 为整个导图容器添加滚轮和双击事件监听器
                const onWheel = e => {
                    if (e.target.getAttribute("contenteditable") === "true" || !e.altKey) return;
                    e.preventDefault();
                    
                    const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
                    element._scale = Math.min(Math.max(element._scale * scaleChange, 0.1), 5);
                    
                    element.querySelectorAll(`[data-type="NodeListItem"]`).forEach(item => {
                        const transform = new DOMMatrix(getComputedStyle(item).transform);
                        item.style.transform = `translate(${transform.m41}px, ${transform.m42}px) scale(${element._scale})`;
                    });
                };
                
                const onDoubleClick = e => {
                    if (e.target.getAttribute("contenteditable") === "true") return;
                    
                    const allListItems = element.querySelectorAll(`[data-type="NodeListItem"]`);
                    allListItems.forEach(item => {
                        item.style.transform = "translate(0px, 0px) scale(1)";
                        item.style.transition = "transform 0.3s ease";
                    });
                    
                    element._scale = 1;
                    setTimeout(() => allListItems.forEach(item => item.style.transition = ""), 300);
                };
                
                element.addEventListener("wheel", onWheel, { passive: false });
                element.addEventListener("dblclick", onDoubleClick);
                
                // 保存事件监听器引用
                element._wheelListeners.push(onWheel);
                element._doubleClickListeners.push(onDoubleClick);
            }
            
            listItems.forEach(listItem => {
                if (listItem.hasAttribute("data-draggable")) return;
                listItem.setAttribute("data-draggable", "true");
                
                let startX, startY, initialTransform;
                
                const onMouseDown = e => {
                    if (e.target.getAttribute("contenteditable") === "true") return;
                    
                    e.preventDefault();
                    listItem.style.cursor = "grabbing";
                    
                    initialTransform = new DOMMatrix(getComputedStyle(listItem).transform);
                    startX = e.clientX - initialTransform.m41;
                    startY = e.clientY - initialTransform.m42;
                    
                    const onMouseMove = window.dragDebounce(e => {
                        listItem.style.transform = `translate(${e.clientX - startX}px, ${e.clientY - startY}px) scale(${element._scale})`;
                    });
                    
                    const onMouseUp = () => {
                        listItem.style.cursor = "grab";
                        document.removeEventListener("mousemove", onMouseMove);
                    };
                    
                    document.addEventListener("mousemove", onMouseMove);
                    document.addEventListener("mouseup", onMouseUp, { once: true });
                };
                
                listItem.style.cursor = "grab";
                listItem.addEventListener("mousedown", onMouseDown);
                
                // 保存鼠标事件监听器引用
                element._mouseDownListeners.push({ element: listItem, handler: onMouseDown });
            });
        }

        const initObserver = () => {
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (mutation.type === "attributes" && mutation.target.getAttribute("custom-f") === "dt") {
                        initDraggable(mutation.target);
                    } else if (mutation.type === "childList") {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) {
                                if (node.getAttribute?.("custom-f") === "dt") {
                                    initDraggable(node);
                                }
                                const dtElements = node.querySelectorAll?.(`[custom-f="dt"]`);
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
                attributeFilter: ["custom-f"]
            });
            
            document.querySelectorAll(`[custom-f="dt"]`).forEach(initDraggable);
        }

        initObserver();
    }

    // ========================================
    // 模块：清理导图拖拽功能
    // ========================================
    const cleanupDraggable = (element) => {
        // 重置所有列表项的位置和缩放
        element.querySelectorAll('[data-type="NodeListItem"]').forEach(item => {
            item.style.transform = "translate(0px, 0px) scale(1)";
            item.style.cursor = "";
            item.removeAttribute("data-draggable");
            item.style.transition = "transform 0.3s ease";
        });

        // 移除自身属性
        element.removeAttribute("data-draggable");
        element._scale = 1;

        // 清理事件监听器
        ['_wheelListeners', '_doubleClickListeners', '_mouseDownListeners'].forEach((prop, idx) => {
            const eventType = ['wheel', 'dblclick', 'mousedown'][idx];
            (element[prop] || []).forEach(listener => {
                if (eventType === 'mousedown' && listener.element) {
                    listener.element.removeEventListener(eventType, listener.handler);
                } else {
                    element.removeEventListener(eventType, listener, { passive: false });
                }
            });
            delete element[prop];
        });

        // 延时移除过渡样式
        setTimeout(() => {
            element.querySelectorAll('[data-type="NodeListItem"]').forEach(item => {
                item.style.transition = "";
            });
        }, 300);
    };


    // ========================================
    // 模块：topBarPlugin 菜单调整
    // ========================================
    window.topBarPluginMenuObserver = new MutationObserver(() => {
        const commonMenu = document.getElementById("commonMenu");
        if (!commonMenu || commonMenu.getAttribute("data-name") !== "topBarPlugin") return;
        commonMenu.querySelectorAll(".b3-menu__submenu").forEach(submenu => {
            const parentItem = submenu.parentElement;
            const buttons = Array.from(submenu.querySelectorAll(".b3-menu__item"));
            buttons.forEach(btn => {
                btn.classList.add("submenu-inline");
                const iconSmall = parentItem.querySelector(".b3-menu__icon--small");
                if (iconSmall && iconSmall.nextSibling) {
                    parentItem.insertBefore(btn, iconSmall.nextSibling);
                } else if (iconSmall) {
                    parentItem.appendChild(btn);
                } else {
                    parentItem.appendChild(btn);
                }
            });
            if (!submenu.querySelector(".b3-menu__item")) submenu.remove();
        });
    });
    window.topBarPluginMenuObserver.observe(document.body, { childList: true, subtree: true });




    // ========================================
    // 模块：移动端和平台判断功能
    // ========================================
    const isPhone = () => {
        return !!document.getElementById("editor");
    }

    const isMac = () => {
        return navigator.platform.toUpperCase().indexOf("MAC") > -1;
    }

    const initMobileAndPlatformFeatures = () => {
        if (isPhone()) {
            document.body.classList.add("body--mobile");
            const mobileStyle = document.createElement("link");
            mobileStyle.rel = "stylesheet";
            mobileStyle.href = "/appearance/themes/Savor/style/module/mobile.css";
            document.head.appendChild(mobileStyle);
            initMobileMenu();
        }

        if (isMac()) {
            document.body.classList.add("body--mac");
        }
    }

    const initMobileMenu = () => {
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
                    savorToolbar.style.display = (savorToolbar.style.display === "none" ? "block" : "none");
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
    }

    const initMobileThemeButtons = (savorToolbar) => {
        // 移动端也使用统一的按钮渲染
        renderAllButtons();
    }

    setTimeout(() => {
        initMobileAndPlatformFeatures();
    }, 1000);




    // ========================================
    // 模块：功能按钮相关变量和函数
    // ========================================
    const featureButtonsActive = new Set();
    const applyRememberedFeatures = async () => {
        for (const btn of allButtons) {
            if (btn.type === 'feature' && config.get(btn.attrName) === "1") {
                featureButtonsActive.add(btn.id);
                
                const button = document.getElementById(btn.id);
                if (button) {
                    button.classList.add("button_on");
                }
                
                if (btn.cssPath) {
                    const cssText = await loadCSS(btn.cssPath);
                    applyCSS(btn.styleId, cssText);
                }
                
                if (btn.onEnable) btn.onEnable();
            }
        }
    }





    // ========================================
    // 模块：清理样式
    // ========================================
    window.destroyTheme = () => { 
        allButtons?.forEach(btn => {
            if (btn.type === 'feature') {
                $(`#${btn.id}`)?.remove();
                $(`#${btn.styleId}`)?.remove();
            }
        });
        featureButtonsActive?.clear();
        
        [removeTabbarResizer, removeBulletThreading, disableTypewriterMode, disableListPreview]
            .forEach(fn => fn?.());
        
        // 清理侧边栏备注功能
        if (sidebarMemo) {
            sidebarMemo.openSideBar(false);
            sidebarMemo.unobserveDragTitle?.(); // 确保清理 drag 监听
        }
        
        if (window.theme._collapseHandler) {
            document.body.removeEventListener("mousedown", window.theme._collapseHandler);
            window.theme._collapseHandler = null;
        }
        
        Object.assign(window, {
            tabBarsMarginInitialized: false,
            updateTabBarsMargin: null,
            updateTabBarsMarginLeft: null
        });
        
        window.statusObserver?.disconnect();
        window.statusObserver = null;
        
        $$("[id^=\"Sv-theme-color\"]").forEach(el => el.remove());
        $("#snippet-SvcolorfulHeading")?.remove();
        $("#Sv-theme-typewriter-mode")?.remove();
        $("#savorToolbar")?.remove();
        $$(".layout__center .layout-tab-bar--readonly").forEach(el => el.style.marginRight = "0px");
        $$(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)").forEach(el => el.style.marginLeft = "0px");
        
        cssCache.clear();
        domCache.clear();
        
        const commonMenu = $("#commonMenu");
        if (commonMenu) toggleMenuListener(commonMenu, false);
        
        // 清理状态栏样式
        const status = $("#status");
        if (status) {
            status.style.transform = "";
            status.style.maxWidth = "";
        }
        // 清理 topBarPluginMenuObserver
        if (window.topBarPluginMenuObserver) {
            window.topBarPluginMenuObserver.disconnect();
            window.topBarPluginMenuObserver = null;
        }
    };


    









    
    // ========================================
    // 模块：侧边栏备注功能
    // ========================================
    const sidebarMemo = (() => {
        let isEnabled = false, observers = {}, editorNode = null;
        let dragTimeout = null, dragMutationObserver = null;

        // 获取块节点
        const getBlockNode = el => { while (el && !el.dataset.nodeId) el = el.parentElement; return el; };

        // 新增：监听 #drag 的 title 属性变化（简化版）
        function observeDragTitle() {
            if (dragMutationObserver) return;
            function tryObserve() {
                const dragEl = document.getElementById('drag');
                if (!dragEl) {
                    dragTimeout = setTimeout(tryObserve, 1000);
                    return;
                }
                let lastTitle = dragEl.getAttribute('title');
                let debounceTimer = null;
                dragMutationObserver = new MutationObserver(mutations => {
                    for (const mutation of mutations) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
                            const newTitle = dragEl.getAttribute('title');
                            if (newTitle !== lastTitle) {
                                lastTitle = newTitle;
                                clearTimeout(debounceTimer);
                                debounceTimer = setTimeout(refreshEditor, 1000);
                            }
                        }
                    }
                });
                dragMutationObserver.observe(dragEl, { attributes: true, attributeFilter: ['title'] });
            }
            tryObserve();
        }
        function unobserveDragTitle() {
            if (dragMutationObserver) {
                dragMutationObserver.disconnect();
                dragMutationObserver = null;
            }
            if (dragTimeout) {
                clearTimeout(dragTimeout);
                dragTimeout = null;
            }
        }

        // 刷新侧边栏备注位置
        const refreshMemoOffset = (main, sidebar) => {
            requestAnimationFrame(() => {
                const MARGIN = 10;
                // 分组并累加高度
                const memoGroups = {};
                sidebar.querySelectorAll('.memo-item').forEach(memoItem => {
                    const nodeId = memoItem.getAttribute('data-node-id');
                    if (!memoGroups[nodeId]) memoGroups[nodeId] = { items: [], totalHeight: 0 };
                    memoGroups[nodeId].items.push(memoItem);
                    memoGroups[nodeId].totalHeight += memoItem.offsetHeight + MARGIN;
                });
        
                // 排序，防重叠并定位
                let lastBottom = 0;
                Object.values(memoGroups)
                    .map(group => {
                        const block = main.querySelector(`div[data-node-id="${group.items[0].getAttribute('data-node-id')}"]`);
                        if (!block) return null;
                        const blockRect = block.getBoundingClientRect();
                        const mainRect = main.getBoundingClientRect();
                        const blockCenter = blockRect.top - mainRect.top + blockRect.height / 2;
                        const groupCenter = group.totalHeight / 2;
                        let top = Math.max(0, blockCenter - groupCenter);
                        // 防止重叠
                        if (top < lastBottom + MARGIN) top = lastBottom + MARGIN;
                        let currentTop = top;
                        group.items.forEach(item => {
                            item.style.position = 'absolute';
                            item.style.top = `${currentTop}px`;
                            item.style.transition = 'top 0.3s cubic-bezier(0.4,0,0.2,1)';
                            currentTop += item.offsetHeight + MARGIN;
                        });
                        lastBottom = currentTop - MARGIN;
                        return null;
                    });
            });
        };

        // 添加侧边栏
        const addSideBar = main => {
            let sidebar = main.parentElement.querySelector('#protyle-sidebar');
            const title = main.parentElement.querySelector('div.protyle-title');
            const pr = parseFloat(getComputedStyle(main).paddingRight);
            const isFull = main.parentElement.dataset.fullwidth;
            if (!sidebar) {
                sidebar = document.createElement('div');
                sidebar.id = 'protyle-sidebar';
                title.insertAdjacentElement('beforeend', sidebar);
                sidebar.style.cssText = 'position:absolute;right:-230px;width:230px;z-index:3;';
                main.style.minWidth = '90%';
            }
            return sidebar;
        };

        // 编辑备注内容
        function bindMemoEdit(div, memoDiv, el, main, sidebar) {
            div.onclick = e => {
                e.stopPropagation();
                // 高亮正文块
                const blockEl = main.querySelector(`div[data-node-id="${el.closest('[data-node-id]').dataset.nodeId}"]`);
                if (blockEl) {
                    blockEl.style.transition = 'background-color 1.2s cubic-bezier(0.4,0,0.2,1)';
                    blockEl.style.backgroundColor = 'var(--b3-theme-primary-lightest)';
                    setTimeout(() => {
                        blockEl.style.backgroundColor = '';
                        setTimeout(() => {
                            blockEl.style.transition = '';
                        }, 1200);
                    }, 1200);
                }
                if (memoDiv.classList.contains('editing')) return;
                memoDiv.classList.add('editing');
                memoDiv.style.zIndex = '999'; // 编辑时提升z-index
                const old = el.getAttribute('data-inline-memo-content') || '';
                const input = document.createElement('textarea');
                input.className = 'memo-edit-input';
                input.value = old;
                input.placeholder = '输入备注内容...';
                input.style.cssText = 'width:100%;min-height:60px;padding:6px;border:1px solid var(--b3-theme-primary);border-radius:8px;font-size:0.9em;resize:none;box-sizing:border-box;overflow:hidden;';
                // 自适应高度函数
                function autoResizeTextarea(textarea) {
                    textarea.style.height = 'auto';
                    textarea.style.height = textarea.scrollHeight + 'px';
                }
                input.addEventListener('input', () => autoResizeTextarea(input));
                autoResizeTextarea(input); // 初始时自适应
                div.replaceWith(input);
                input.focus(); input.select();
                requestAnimationFrame(() => {
                    autoResizeTextarea(input);
                    refreshMemoOffset(main, sidebar); // 进入编辑后立即刷新，避免重叠
                });
                const save = () => {
                    const val = input.value.trim();
                    if (val !== old) {
                        el.setAttribute('data-inline-memo-content', val);
                        updateInlineMemo(el, val);
                    }
                    const newDiv = document.createElement('div');
                    newDiv.className = 'memo-content-view';
                    newDiv.style.cssText = div.style.cssText;
                    newDiv.innerHTML = val || '<span style="color:#bbb;">点击编辑备注...</span>';
                    bindMemoEdit(newDiv, memoDiv, el, main, sidebar);
                    input.replaceWith(newDiv);
                    memoDiv.classList.remove('editing');
                    memoDiv.style.zIndex = '';
                    memoDiv.style.transform = '';
                    setTimeout(() => { memoDiv.style.transition = ''; }, 300);
                    setTimeout(() => refreshMemoOffset(main, sidebar), 100);
                };
                input.onblur = () => setTimeout(() => { if (document.activeElement !== input) save(); }, 100);
                input.onkeydown = e => {
                    if ((e.key === 'Enter' && e.ctrlKey) || e.key === 'Escape') { e.preventDefault(); save(); }
                };
            };
        }

        // 刷新侧边栏备注
        const refreshSideBarMemos = (main, sidebar) => {
            const memos = main.querySelectorAll('span[data-type*="inline-memo"]');
            sidebar.innerHTML = '';
            if (!memos.length) { sidebar.removeAttribute('data-memo-count'); return; }
            
            memos.forEach((el, idx) => {
                const block = getBlockNode(el);
                const memo = el.getAttribute('data-inline-memo-content') || '';
                const text = el.textContent || '';
                const memoDiv = document.createElement('div');
                memoDiv.className = 'memo-item';
                memoDiv.setAttribute('data-node-id', block.dataset.nodeId);
                memoDiv.setAttribute('data-memo-index', idx);
                memoDiv.style.cssText = 'margin:8px;padding:8px;border:1px solid var(--b3-border-color);border-radius:8px;position:relative;width:220px;box-shadow:0 1px 3px rgba(0,0,0,0.1);';
                memoDiv.innerHTML = `<div class="memo-title-with-dot" style="font-weight:bold;margin-bottom:4px;font-size:1em;display:flex;align-items:center;"><span class="memo-title-dot"></span>${text}</div><div class="memo-content-view" style="color:var(--b3-theme-on-background);font-size:0.9em;margin-bottom:4px;cursor:pointer;">${memo || '<span style=\\"color:#bbb;\\">点击编辑备注...</span>'}</div>`;
                // 改为 hover 高亮正文块
                memoDiv.onmouseenter = e => {
                    if (e.target.classList.contains('memo-content-view')) return;
                    // 只高亮内容一致的 inline-memo span
                    const blockEl = main.querySelector(`div[data-node-id="${block.dataset.nodeId}"]`);
                    if (blockEl) {
                        const allMemos = blockEl.querySelectorAll('span[data-type*="inline-memo"]');
                        const memoText = text;
                        allMemos.forEach(span => {
                            if (span.textContent === memoText) {
                                span.classList.add('memo-span-highlight');
                            }
                        });
                    }
                };
                memoDiv.onmouseleave = e => {
                    // 只取消内容一致的 inline-memo span 高亮
                    const blockEl = main.querySelector(`div[data-node-id="${block.dataset.nodeId}"]`);
                    if (blockEl) {
                        const allMemos = blockEl.querySelectorAll('span[data-type*="inline-memo"]');
                        const memoText = text;
                        allMemos.forEach(span => {
                            if (span.textContent === memoText) {
                                span.classList.remove('memo-span-highlight');
                            }
                        });
                    }
                };
                const memoContentDiv = memoDiv.querySelector('.memo-content-view');
                bindMemoEdit(memoContentDiv, memoDiv, el, main, sidebar);
                sidebar.appendChild(memoDiv);
            });
            
            sidebar.setAttribute('data-memo-count', `共 ${memos.length} 个备注`);
            refreshMemoOffset(main, sidebar);
            // 检查并设置 .protyle-content 的 Sv-memo class
            const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
            if (protyleContent) {
                if (memos.length > 0) {
                    protyleContent.classList.add('Sv-memo');
                } else {
                    protyleContent.classList.remove('Sv-memo');
                }
            }
        };

        // 更新内联备注到思源
        async function updateInlineMemo(el, content) {
            try {
                let blockEl = el;
                while (blockEl && !blockEl.dataset.nodeId) blockEl = blockEl.parentElement;
                if (!blockEl?.dataset.nodeId) return;
                const blockId = blockEl.dataset.nodeId;
                // 在 blockEl 下找到与 el 完全相同的 inline-memo span
                const allMemos = blockEl.querySelectorAll('span[data-type*="inline-memo"]');
                let targetMemo = null;
                for (const m of allMemos) {
                    if (m.isSameNode(el)) {
                        targetMemo = m;
                        break;
                    }
                }
                if (!targetMemo) return;
                targetMemo.setAttribute('data-inline-memo-content', content);
                // 只更新属性，不动 innerHTML
                const newHtml = blockEl.outerHTML;
                await fetch('/api/block/updateBlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${window.siyuan?.config?.api?.token ?? ''}` },
                    body: JSON.stringify({ dataType: 'html', data: newHtml, id: blockId })
                });
            } catch (e) { console.error('[Savor] 更新备注出错:', e); }
        }

        // 刷新编辑器（observer 回调加防抖）
        function refreshEditor() {
            if (!editorNode) return;
            const mains = editorNode.querySelectorAll('div.protyle-wysiwyg');
            Object.values(observers).forEach(list => list.forEach(o => o.disconnect()));
            observers = {};
            mains.forEach(main => {
                const sidebar = addSideBar(main);
                if (sidebar) {
                    const mainId = main.parentElement.parentElement.getAttribute('data-id');
                    let refreshTimer = null;
                    const observer = new MutationObserver(() => {
                        clearTimeout(refreshTimer);
                        refreshTimer = setTimeout(() => { if (isEnabled) refreshSideBarMemos(main, sidebar); }, 100);
                    });
                    observer.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-inline-memo-content'] });
                    observers[mainId] = [observer];
                    refreshSideBarMemos(main, sidebar);
                }
            });
            // 修复：切换到没有备注的文档时移除 Sv-memo class
            document.querySelectorAll('.protyle-content').forEach(pc => {
                const main = pc.closest('.protyle')?.querySelector('.protyle-wysiwyg');
                if (main && main.querySelectorAll('span[data-type*="inline-memo"]').length === 0) {
                    pc.classList.remove('Sv-memo');
                }
            });
        }

        // 开关侧边栏（合并 setEnabled 逻辑）
        function openSideBar(open, save = false) {
            if (!editorNode && open) {
                // 等待 editorNode 出现后再初始化
                const wait = () => {
                    editorNode = document.querySelector('div.layout__center');
                    if (editorNode) {
                        openSideBar(open, save);
                    } else setTimeout(wait, 100);
                };
                setTimeout(wait, 100);
                return;
            }
            isEnabled = open;
            if (open) {
                window.siyuan?.eventBus?.on('loaded-protyle', refreshEditor);
                refreshEditor();
                observeDragTitle();
            } else {
                window.siyuan?.eventBus?.off('loaded-protyle', refreshEditor);
                Object.values(observers).forEach(list => list.forEach(o => o.disconnect()));
                observers = {};
                if (editorNode) editorNode.querySelectorAll('div.protyle-wysiwyg').forEach(main => {
                    const sidebar = main.parentElement.querySelector('#protyle-sidebar');
                    if (sidebar) {
                        sidebar.innerHTML = '';
                        sidebar.remove();
                    }
                });
                unobserveDragTitle();
            }
            if (save) config.set('sidebarMemoEnabled', open ? '1' : '0');
        }

        // 初始化
        function init() {
            editorNode = document.querySelector('div.layout__center');
            openSideBar(config.get('sidebarMemoEnabled') === '1', true);
        }

        return {
            init,
            openSideBar,
            isEnabled: () => isEnabled,
            setEnabled: enabled => openSideBar(enabled, true),
            unobserveDragTitle,
        };
    })();

})();


