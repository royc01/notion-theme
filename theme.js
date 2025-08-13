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
            { id: "buttonSavor-light", type: "theme", group: "light", label: i18n.t("Light 配色"), styleId: "Sv-theme-color-light", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.4-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.267 14c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c0.933 0 1.6 0.8 1.6 1.6s-0.8 1.6-1.6 1.6c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c1.867 0 3.333-1.467 3.333-3.333s-1.467-3.067-3.333-3.067z", onEnable: () => { document.documentElement.setAttribute('savor-theme', 'light'); }, onDisable: () => { document.documentElement.removeAttribute('savor-theme'); } },
            { id: "buttonsalt", type: "theme", group: "light", label: i18n.t("Salt 配色"), styleId: "Sv-theme-color-salt", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.133 17.2c-1.867-1.067-3.867-2.133-3.867 0s1.733 3.867 3.867 3.867 3.867-1.733 3.867-3.867-2.133 1.067-3.867 0z", onEnable: () => { document.documentElement.setAttribute('savor-theme', 'salt'); }, onDisable: () => { document.documentElement.removeAttribute('savor-theme'); } },
            { id: "buttonsugar", type: "theme", group: "light", label: i18n.t("Sugar 配色"), styleId: "Sv-theme-color-sugar", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-0.267 0-0.533 0-0.8-0.133 2.533-0.133 4.533-2.133 4.533-4.533 0.133-1.067-0.267-2.133-1.067-2.8-0.8-0.8-1.6-1.2-2.8-1.333-0.933-0.133-1.733 0.267-2.4 0.8s-1.067 1.467-1.067 2.267c-0.133 1.467 1.067 2.8 2.533 2.933 1.2 0.133 2.4-0.933 2.4-2.133 0-0.267-0.267-0.533-0.533-0.533s-0.533 0.267-0.533 0.533c0 0.667-0.533 1.2-1.2 1.067-0.933-0.133-1.6-0.8-1.467-1.6 0-0.533 0.267-1.067 0.667-1.467s0.933-0.533 1.6-0.533c0.8 0 1.467 0.267 2 0.933 0.533 0.533 0.8 1.2 0.8 2.133-0.133 2-1.867 3.6-3.867 3.467-1.6-0.133-2.933-0.933-3.733-2.133-0.267-0.8-0.267-1.467-0.267-2.133 0-2.8 2.4-5.2 5.2-5.2s5.2 2.4 5.2 5.2-2.4 5.2-5.2 5.2z", onEnable: () => { document.documentElement.setAttribute('savor-theme', 'sugar'); }, onDisable: () => { document.documentElement.removeAttribute('savor-theme'); } },
            { id: "buttonforest", type: "theme", group: "light", label: i18n.t("Forest 配色"), styleId: "Sv-theme-color-forest", svg: "M16 12.133c-1.867 0-2.933 1.467-2.933 2.933 0 0.533 0 1.733 0 2.267 0 0.8 0.4 1.467 0.4 1.467 0.4 0.667 1.067 1.2 1.867 1.333v1.2c0 0.267 0.267 0.533 0.533 0.533s0.533-0.267 0.533-0.533v-1.2c1.333-0.267 2.267-1.467 2.267-2.8v-2.267c0.267-1.6-0.933-2.933-2.667-2.933zM17.733 17.333c0 0.8-0.4 1.333-1.2 1.6v-2.267c0-0.267-0.267-0.533-0.533-0.533s-0.533 0.267-0.533 0.533v2.267c-0.8-0.267-1.2-0.933-1.2-1.6v-2.267c0-0.933 0.8-1.733 1.733-1.733s1.733 0.8 1.733 1.733v2.267zM16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467z", onEnable: () => { document.documentElement.setAttribute('savor-theme', 'forest'); }, onDisable: () => { document.documentElement.removeAttribute('savor-theme'); } },
            { id: "buttonflower", type: "theme", group: "light", label: i18n.t("Flower 配色"), styleId: "Sv-theme-color-flower", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467zM19.333 14.533c-0.267 0-1.6 0.267-1.6 0.267s-1.067-1.6-1.733-1.6-1.6 1.6-1.6 1.6-1.333-0.267-1.6-0.267-0.667 1.333-0.667 2.667c0 2.4 1.733 4 4 4s4-1.6 4-4c-0.133-1.333-0.4-2.667-0.8-2.667zM16 19.867c-1.467 0-2.667-1.067-2.667-2.667 0-0.4 0-0.8 0.133-1.2 0.133 0 0.4 0.133 0.533 0.133l0.933 0.267 0.533-0.8c0.133-0.267 0.267-0.533 0.533-0.667v0 0c0.133 0.267 0.4 0.533 0.533 0.8l0.533 0.8 0.933-0.267c0.133 0 0.4-0.133 0.533-0.133 0 0.4 0.133 0.8 0.133 1.2 0 1.333-1.2 2.533-2.667 2.533z", onEnable: () => { document.documentElement.setAttribute('savor-theme', 'flower'); }, onDisable: () => { document.documentElement.removeAttribute('savor-theme'); } },
            { id: "buttonwind", type: "theme", group: "light", label: i18n.t("Wind 配色"), styleId: "Sv-theme-color-wind", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467zM18.4 13.2h-0.667c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h0.667c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-6.267c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h6.267c1.067 0 1.867-0.8 1.867-1.867 0-1.333-0.8-2.133-1.867-2.133zM14.667 17.733h-2.533c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h2.533c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-0.667c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h0.667c1.067 0 1.867-0.8 1.867-1.867s-0.8-2.133-1.867-2.133z", onEnable: () => { document.documentElement.setAttribute('savor-theme', 'wind'); }, onDisable: () => { document.documentElement.removeAttribute('savor-theme'); } },
            // 配色按钮（dark）
            { id: "buttonSavor-dark", type: "theme", group: "dark", label: i18n.t("Dark 配色"), styleId: "Sv-theme-color-dark", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.4-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.267 14c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c0.933 0 1.6 0.8 1.6 1.6s-0.8 1.6-1.6 1.6c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c1.867 0 3.333-1.467 3.333-3.333s-1.467-3.067-3.333-3.067z", onEnable: () => { document.documentElement.setAttribute('savor-theme', 'dark'); }, onDisable: () => { document.documentElement.removeAttribute('savor-theme'); } },
            { id: "buttonvinegar", type: "theme", group: "dark", label: i18n.t("Vinegar 配色"), styleId: "Sv-theme-color-vinegar", svg: "M19.467 18.533c-0.133 0-0.133 0-0.133 0.133-0.4 0.133-0.8 0.133-1.2 0.133-2 0-3.2-1.2-3.2-3.2 0-0.4 0.133-1.067 0.267-1.2v-0.133c0-0.133-0.133-0.133-0.133-0.133s-0.133 0-0.267 0.133c-1.333 0.533-2.267 1.867-2.267 3.467 0 2.133 1.6 3.733 3.867 3.733 1.6 0 2.933-0.933 3.467-2.133 0.133-0.133 0.133-0.133 0.133-0.133-0.4-0.533-0.533-0.667-0.533-0.667zM16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2z", onEnable: () => { document.documentElement.setAttribute('savor-theme', 'vinegar'); }, onDisable: () => { document.documentElement.removeAttribute('savor-theme'); } },
            { id: "buttonocean", type: "theme", group: "dark", label: i18n.t("Ocean 配色"), styleId: "Sv-theme-color-ocean", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.133 17.2c-1.867-1.067-3.867-2.133-3.867 0s1.733 3.867 3.867 3.867 3.867-1.733 3.867-3.867-2.133 1.067-3.867 0z", onEnable: () => { document.documentElement.setAttribute('savor-theme', 'ocean'); }, onDisable: () => { document.documentElement.removeAttribute('savor-theme'); } },
            { id: "buttonmountain", type: "theme", group: "dark", label: i18n.t("Mountain 配色"), styleId: "Sv-theme-color-mountain", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM14.667 22.267c-1.2-0.267-2.267-0.933-2.933-1.867l2.533-4.4 2.133 3.6-1.733 2.667zM17.867 19.867l0.667-1.2 1.2 2.133c-0.933 0.933-2.133 1.467-3.467 1.467l1.6-2.4zM16 11.467c3.067 0 5.467 2.4 5.467 5.467 0 0.933-0.267 1.867-0.667 2.533l-1.6-2.533c-0.267-0.4-0.667-0.4-0.933-0.267-0.133 0-0.133 0.133-0.267 0.267l-0.667 1.2-2.4-4c-0.267-0.4-0.667-0.4-0.933-0.267-0.133 0-0.133 0.133-0.267 0.267l-2.8 4.8c-0.267-0.667-0.4-1.333-0.4-2 0-3.067 2.4-5.467 5.467-5.467z", onEnable: () => { document.documentElement.setAttribute('savor-theme', 'mountain'); }, onDisable: () => { document.documentElement.removeAttribute('savor-theme'); } },
            // 功能按钮
            { id: "concealButton", type: "feature", label: i18n.t("挖空"), styleId: "Sv-theme-color-conceal挖空", attrName: "conceal挖空", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.267 0 4.133 1.467 4.933 3.467-0.133 0-0.4 0-0.4 0.133-0.533 0.533-0.933 0.8-1.467 1.2 0 0-0.133 0-0.133 0.133-0.533 0.267-1.2 0.533-1.733 0.533 0 0 0 0-0.133 0-0.4 0.133-0.667 0.133-1.067 0.133-0.267 0-0.667 0-0.933-0.133h-0.133c-0.533-0.133-1.2-0.267-1.6-0.533-0.133-0.133-0.133-0.133-0.133-0.133-0.533-0.267-1.067-0.667-1.467-1.067-0.133-0.133-0.533-0.133-0.8 0-0.133 0.133-0.133 0.533 0 0.8 0.4 0.4 0.8 0.8 1.2 1.067l-0.933 0.8c-0.133 0.133-0.133 0.533 0.133 0.8 0.133 0.133 0.133 0.133 0.4 0.133 0.133 0 0.267-0.133 0.4-0.133l0.933-1.2c0.4 0.133 0.8 0.267 1.2 0.4l-0.267 1.2c-0.133 0.267 0.133 0.533 0.4 0.667h0.267c0.267 0 0.533-0.133 0.533-0.4l0.267-1.2h1.467l0.267 1.2c0.133 0.267 0.267 0.4 0.533 0.4h0.133c0.267-0.133 0.533-0.4 0.4-0.667l-0.267-1.2c0.4-0.133 0.8-0.267 1.2-0.4l0.933 1.2c0.133 0.133 0.267 0.133 0.4 0.133s0.267 0 0.4-0.133c0 0 0-0.133 0.133-0.133-0.933 1.867-2.8 3.333-5.067 3.333zM20.933 18.933c0-0.133 0-0.267-0.133-0.4l-0.8-1.067c0.4-0.267 0.8-0.533 1.067-0.8 0 0.267 0 0.533 0 0.667 0.133 0.533 0 1.067-0.133 1.6z", onEnable: () => { document.documentElement.setAttribute('savor-conceal-mark', 'true'); }, onDisable: () => { document.documentElement.removeAttribute('savor-conceal-mark'); } },
            { id: "tabbarVertical", type: "feature", label: i18n.t("垂直页签"), styleId: "Sv-theme-color-tabbar垂直", attrName: "tabbar垂直", svg: "M21.067 10.667h-10.133c-0.8 0-1.6 0.8-1.6 1.6v10c0 0.933 0.8 1.733 1.6 1.733h10c0.933 0 1.6-0.8 1.6-1.6v-10.133c0.133-0.8-0.667-1.6-1.467-1.6zM21.333 22.4c0 0.133-0.133 0.267-0.267 0.267h-7.333v-7.733h7.6v7.467zM21.333 13.6h-10.667v-1.333c0-0.133 0.133-0.267 0.267-0.267h10c0.267 0 0.4 0.133 0.4 0.267v1.333z", onEnable: () => { document.getElementById("topBar")?.classList.remove('button_on'); config.set("topbar隐藏", "0"); cleanupTopbarMerge(); document.documentElement.setAttribute('savor-tabbar', 'vertical'); setTimeout(() => tabbarResize.init(), 500); }, onDisable: () => { document.documentElement.removeAttribute('savor-tabbar'); tabbarResize.remove(); } },
            { id: "topBar", type: "feature", label: i18n.t("顶栏合并"), styleId: "Sv-theme-color-topbar隐藏", attrName: "topbar隐藏", svg: "M21.067 10.667h-1.867c-0.133 0-0.133 0-0.267 0h-3.733c-0.133 0-0.133 0-0.267 0h-4c-0.8 0-1.6 0.8-1.6 1.6v10c0 0.933 0.8 1.733 1.6 1.733h10c0.933 0 1.6-0.8 1.6-1.6v-10.133c0.133-0.8-0.667-1.6-1.467-1.6zM15.333 12h2.4l-1.067 1.6h-2.4l1.067-1.6zM10.667 12.267c0-0.133 0.133-0.267 0.267-0.267h2.8l-1.067 1.6h-2v-1.333zM21.333 22.4c0 0.133-0.133 0.267-0.267 0.267h-10.133c-0.133 0-0.267-0.133-0.267-0.267v-7.333h10.667v7.333zM21.333 13.6h-3.067l1.067-1.6h1.6c0.267 0 0.4 0.133 0.4 0.267 0 0 0 1.333 0 1.333z", onEnable: () => { document.getElementById("tabbarVertical")?.classList.remove('button_on'); config.set("tabbar垂直", "0"); tabbarResize.remove(); document.documentElement.setAttribute('savor-tabbar', 'merge'); initTabBarsMarginUnified('right'); initTabBarsMarginUnified('left'); if (window.updateTabBarsMargin) window.updateTabBarsMargin(); if (window.updateTabBarsMarginLeft) window.updateTabBarsMarginLeft(); }, onDisable: () => { document.documentElement.removeAttribute('savor-tabbar'); cleanupTopbarMerge(); } },
            { id: "bulletThreading", type: "feature", label: i18n.t("列表子弹线"), styleId: "Sv-theme-color-列表子弹线", attrName: "列表子弹线", svg: "M20 20c1.067 0 2 0.933 2 2s-0.933 2-2 2-2-0.933-2-2c0-1.067 0.933-2 2-2zM18.4 12c1.6 0 2.933 1.333 2.933 2.933s-1.333 2.933-2.933 2.933h-4.667c-0.933 0-1.6 0.8-1.6 1.6 0 0.933 0.8 1.6 1.6 1.6h2.933c0.267 0 0.667 0.267 0.667 0.667 0 0.267-0.267 0.667-0.667 0.667h-2.933c-1.733 0.267-3.067-1.067-3.067-2.8s1.333-2.933 3.067-2.933h4.667c0.933 0 1.6-0.8 1.6-1.6s-0.8-1.733-1.6-1.733h-2.933c-0.533 0-0.8-0.4-0.8-0.667s0.267-0.667 0.667-0.667c0 0 3.067 0 3.067 0zM20 21.333c-0.267 0-0.667 0.267-0.667 0.667 0 0.267 0.267 0.667 0.667 0.667s0.667-0.267 0.667-0.667c0-0.4-0.267-0.667-0.667-0.667v0zM12 10.667c1.067 0 2 0.933 2 2s-0.933 2-2 2c-1.067 0-2-0.933-2-2s0.933-2 2-2zM12 12c-0.267 0-0.667 0.267-0.667 0.667s0.4 0.667 0.667 0.667c0.4 0 0.667-0.267 0.667-0.667v0c0-0.4-0.267-0.667-0.667-0.667z", onEnable: () => { document.documentElement.setAttribute('savor-bullet-threading', 'true'); initBulletThreading(); }, onDisable: () => { document.documentElement.removeAttribute('savor-bullet-threading'); removeBulletThreading(); } },
            { id: "colorFolder", type: "feature", label: i18n.t("彩色文档树"), styleId: "Sv-theme-color-彩色文档树", attrName: "彩色文档树", svg: "M11.6 14.933c0-0.133 0-0.267 0-0.4 0-2.533 2-4.533 4.4-4.533s4.4 2 4.4 4.533c0 0.133 0 0.267 0 0.4 1.467 0.667 2.533 2.267 2.533 4.133 0 2.533-2 4.533-4.4 4.533-0.933 0-1.867-0.267-2.533-0.8-0.8 0.533-1.6 0.8-2.533 0.8-2.4 0-4.4-2-4.4-4.533 0-1.867 0.933-3.467 2.533-4.133zM11.867 16.267c-0.933 0.533-1.6 1.6-1.6 2.8 0 1.733 1.467 3.2 3.2 3.2 0.533 0 1.067-0.133 1.6-0.4-0.667-0.8-0.933-1.733-0.933-2.8 0-0.133 0-0.267 0-0.4-1.067-0.533-1.867-1.467-2.267-2.4v0zM15.333 18.933v0c0 1.867 1.467 3.2 3.2 3.2s3.2-1.467 3.2-3.2c0-1.2-0.667-2.267-1.6-2.8-0.667 1.6-2.267 2.8-4.133 2.8-0.267 0.133-0.4 0-0.667 0v0zM16 17.733c1.733 0 3.2-1.467 3.2-3.2s-1.467-3.2-3.2-3.2-3.2 1.467-3.2 3.2 1.467 3.2 3.2 3.2z", onEnable: () => { document.documentElement.setAttribute('savor-color-folder', 'true'); }, onDisable: () => { document.documentElement.removeAttribute('savor-color-folder'); } },
            { id: "headingDots", type: "feature", label: i18n.t("标题点标识"), styleId: "Sv-theme-color-标题点标识", attrName: "标题点标识", svg: "M18.533 15.467c-0.8 0-1.467 0.667-1.467 1.467s0.667 1.467 1.467 1.467 1.467-0.667 1.467-1.467-0.667-1.467-1.467-1.467zM13.467 20.4c-0.8 0-1.467 0.667-1.467 1.467s0.667 1.467 1.467 1.467 1.467-0.667 1.467-1.467c0-0.8-0.667-1.467-1.467-1.467zM18.533 20.4c-0.8 0-1.467 0.667-1.467 1.467s0.667 1.467 1.467 1.467 1.467-0.667 1.467-1.467c0-0.8-0.667-1.467-1.467-1.467zM13.467 15.467c-0.8 0-1.467 0.667-1.467 1.467s0.667 1.467 1.467 1.467 1.467-0.667 1.467-1.467-0.667-1.467-1.467-1.467zM18.533 13.467c0.8 0 1.467-0.667 1.467-1.467s-0.667-1.467-1.467-1.467-1.467 0.667-1.467 1.467 0.667 1.467 1.467 1.467zM13.467 10.667c-0.8 0-1.467 0.667-1.467 1.467s0.667 1.467 1.467 1.467 1.467-0.667 1.467-1.467c0-0.933-0.667-1.467-1.467-1.467z", onEnable: () => { document.documentElement.setAttribute('savor-heading-dots', 'true'); }, onDisable: () => { document.documentElement.removeAttribute('savor-heading-dots'); } },
            { id: "typewriterMode", type: "feature", label: i18n.t("打字机模式"), styleId: "Sv-theme-typewriter-mode", attrName: "typewriterMode", svg: "M20.133 10.667c1.6 0 2.8 1.2 2.8 2.8v0 6.933c0 1.6-1.2 2.8-2.8 2.8v0h-8.267c-1.6 0-2.8-1.2-2.8-2.8v0-7.067c0-1.467 1.2-2.667 2.8-2.667 0 0 8.267 0 8.267 0zM20.133 12h-8.267c-0.8 0-1.333 0.533-1.333 1.333v0 6.933c0 0.8 0.533 1.333 1.333 1.333h8.533c0.8 0 1.333-0.533 1.333-1.333v-6.933c-0.133-0.667-0.667-1.333-1.6-1.333v0zM19.467 18.933c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-6.933c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667h6.933zM12.533 16.133c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667-0.667-0.267-0.667-0.667 0.267-0.667 0.667-0.667zM16 16.133c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667zM19.467 16.133c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667v0c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667zM12.533 13.333c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667-0.667-0.267-0.667-0.667 0.267-0.667 0.667-0.667zM16 13.333c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667zM19.467 13.333c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667v0c-0.4 0-0.667-0.267-0.667-0.667s0.267-0.667 0.667-0.667z", onEnable: () => { enableTypewriterMode(); }, onDisable: () => { disableTypewriterMode(); } },
            { id: "sidebarMemo", type: "feature", label: i18n.t("侧边栏备注"), styleId: "Sv-theme-sidebar-memo", attrName: "sidebarMemo", svg: "M19.2 13.733h-6.4c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h6.4c0.4 0 0.667-0.267 0.667-0.667s-0.267-0.667-0.667-0.667zM19.2 16.267h-6.4c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h6.4c0.4 0 0.667-0.267 0.667-0.667s-0.267-0.667-0.667-0.667zM20.533 10.533h-9.067c-1.067 0-1.867 0.8-1.867 1.867v6.4c0 1.067 0.8 1.867 1.867 1.867h7.467l2.4 2.4c0.133 0.133 0.267 0.133 0.4 0.133s0.133 0 0.267 0c0.267-0.133 0.4-0.267 0.4-0.533v-10.267c0-1.067-0.8-1.867-1.867-1.867zM21.067 21.2l-1.467-1.467c-0.133-0.133-0.267-0.133-0.4-0.133h-7.733c-0.4 0-0.667-0.267-0.667-0.667v-6.533c0-0.4 0.267-0.667 0.667-0.667h8.933c0.4 0 0.667 0.267 0.667 0.667v8.8z", onEnable: () => { document.documentElement.setAttribute('savor-sidebar-memo', 'true'); sidebarMemo.openSideBar(true, true); }, onDisable: () => { document.documentElement.removeAttribute('savor-sidebar-memo'); sidebarMemo.openSideBar(false, true); } },
            { id: "officialFontColors", type: "feature", label: i18n.t("官方字体配色"), styleId: "Sv-theme-official-font-colors", attrName: "officialFontColors", svg: "M13.067 10.667v7.467l2.933 2.933v-7.6l-2.933-2.8zM13.733 17.733v-5.333l1.733 1.6v5.333l-1.733-1.6zM9.333 22l3.733-3.733v-7.467l-3.733 3.6v7.6zM16 21.067l2.933-2.933v-7.467l-2.933 2.8v7.6zM18.933 10.667v7.467l3.733 3.733v-7.6l-3.733-3.6zM22 20.133l-2.533-2.4v-5.333l2.533 2.4v5.333z", onEnable: () => { document.documentElement.setAttribute('savor-official-font-colors', 'true'); }, onDisable: () => { document.documentElement.removeAttribute('savor-official-font-colors'); } }
        ];
    }





    const enableSvcolorfulHeading = () => {
        let styleElement = document.getElementById("snippet-SvcolorfulHeading");
        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = "snippet-SvcolorfulHeading";
            styleElement.innerHTML = `
            :root[data-theme-mode="light"] {
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

    // 新增：统一处理彩色标题样式的工具函数，消除重复逻辑
    const updateColorfulHeading = (styleId) => {
        const colorfulThemes = ["Sv-theme-color-sugar", "Sv-theme-color-flower"];
        const styleElement = document.getElementById("snippet-SvcolorfulHeading");
        if (colorfulThemes.includes(styleId)) {
            enableSvcolorfulHeading();
        } else {
            styleElement?.remove();
        }
    }

    const applyRememberedThemeStyle = async (skipFeatures = false) => {
        // 处理主题组
        const processThemeGroup = async (group) => {
            const buttons = allButtons.filter(btn => btn.type === 'theme' && btn.group === group);
            const rememberedButton = buttons.find(btn => config.get(btn.id) === "1");
            const defaultButton = buttons.find(btn => btn.styleId === (group === 'light' ? 'Sv-theme-color-light' : 'Sv-theme-color-dark'));
            
            // 先清理所有主题的savor-theme属性
            allButtons.filter(btn => btn.type === 'theme').forEach(btn => {
                if (btn.onDisable) btn.onDisable();
            });
            
            // 启用记住的主题或默认主题
            const buttonToEnable = rememberedButton || defaultButton;
            if (buttonToEnable && buttonToEnable.onEnable) {
                buttonToEnable.onEnable();
            }
            
            return buttonToEnable;
        };
        
        // 只应用当前主题模式的主题，而不是同时应用light和dark
        const currentThemeMode = window.theme.themeMode;
        const rememberedButton = await processThemeGroup(currentThemeMode);
        
        // 处理彩色标题功能（使用统一函数）
        const currentTheme = rememberedButton?.styleId || (currentThemeMode === 'light' ? 'Sv-theme-color-light' : 'Sv-theme-color-dark');
        updateColorfulHeading(currentTheme);
        
        // 更新按钮状态
        const savorToolbar = document.getElementById("savorToolbar");
        savorToolbar?.querySelectorAll('.b3-menu__item').forEach(btn => {
            btn.classList.remove('button_on');
        });
        
        // 为记住的主题按钮添加激活状态
        if (rememberedButton) {
            document.getElementById(rememberedButton.id)?.classList.add('button_on');
        }
        
        if (!skipFeatures) {
            await applyRememberedFeatures();
        }
    }

    // ========================================
    // 模块：window.theme 对象
    // ========================================
    window.theme = {
        get config() { return config.data; },
        get themeMode() { return window.siyuan?.config?.appearance?.mode === 0 ? 'light' : 'dark'; },

        applyThemeTransition: (callback) => {
            const status = $('#status');
            const currentTransform = status?.style.transform;
            
            const executeCallback = () => {
                callback?.();
                if (status && currentTransform) {
                    setTimeout(() => status.style.transform = currentTransform, 50);
                }
            };
            
            document.startViewTransition ? 
                document.startViewTransition(executeCallback) : 
                executeCallback();
        },

        findEditableParent: (node) => {
            const editableSelectors = ['[contenteditable="true"]', '.protyle-wysiwyg'];
            return editableSelectors.reduce((found, selector) => 
                found || node.closest(selector), null);
        },

        createElementEx: (refElement, tag, id = null, mode = 'append') => {
            if (!refElement || !tag) {
                console.warn('[Savor] 参考元素或标签名不存在');
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
            
            window._lastFoldedId = id;
            window._lastFoldedState = fold;
            
            fetch('/api/attr/setBlockAttrs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${window.siyuan?.config?.api?.token || ''}`
                },
                body: JSON.stringify({ id, attrs: { fold } })
            });
        }
    };


    // ========================================
    // 模块：底栏隐藏
    // ========================================

    (()=>{let s, c, t='.layout__wnd--active > .layout-tab-container > .fn__flex-1:not(.fn__none):not(.protyle)',f=()=>{(s=document.getElementById('status'))&&s.classList.toggle('Sv-StatusHidden',!!document.querySelector(t))};(function w(){(c=document.querySelector('.layout__center'))?(f(),new MutationObserver(f).observe(c,{childList:1,subtree:1,attributes:1,attributeFilter:['class']})):setTimeout(w,200)})()})();

    // ========================================
    // 模块：主题按钮
    // ========================================
    const renderAllButtons = (targetToolbar = null) => {
        const savorToolbar = targetToolbar || document.getElementById("savorToolbar");
        if (!savorToolbar) return;
        savorToolbar.innerHTML = "";
        const fragment = document.createDocumentFragment();

        // 先配色后功能
        const themeMode = window.theme.themeMode;
        // 根据当前模式显示对应组的主题按钮
        const themeButtons = allButtons.filter(btn => btn.type === 'theme' && btn.group === themeMode);
        const featureButtons = allButtons.filter(btn => btn.type === 'feature');
        const buttons = [...themeButtons, ...featureButtons];

        buttons.forEach(btn => {
            const button = document.createElement("button");
            button.id = btn.id;
            button.className = "b3-menu__item savor-button";
            button.setAttribute("aria-label", btn.label);
            button.innerHTML = `<svg class="b3-menu__icon savor-icon" viewBox="9 10 14 14" xmlns="http://www.w3.org/2000/svg"><path d="${btn.svg}"></path></svg><span class="b3-menu__label">${btn.label}</span>`;

            // 状态高亮
            if (btn.type === 'theme') {
                // 检查配置中是否记住了这个主题
                if (config.get(btn.id) === "1") {
                    button.classList.add("button_on");
                }
            } else if (btn.type === 'feature') {
                if (getItem(btn.attrName) === "1") {
                    button.classList.add("button_on");
                }
            }

            // 点击逻辑
            button.addEventListener("click", async () => {
                if (btn.type === 'theme') {
                    // 只移除同组按钮的激活状态
                    const currentGroup = btn.group;
                    if (currentGroup) {
                        const groupButtons = allButtons.filter(b => b.type === 'theme' && b.group === currentGroup);
                        groupButtons.forEach(b => {
                            const groupButton = document.getElementById(b.id);
                            if (groupButton) groupButton.classList.remove('button_on');
                        });
                    }
                    button.classList.add('button_on');
                    
                    window.theme.applyThemeTransition(async () => {
                        // 先移除同组所有主题的HTML属性
                        if (currentGroup) {
                            const groupButtons = allButtons.filter(b => b.type === 'theme' && b.group === currentGroup);
                            groupButtons.forEach(b => {
                                if (b.onDisable) b.onDisable();
                            });
                        }
                        
                        // 然后启用当前主题
                        if (btn.onEnable) btn.onEnable();
                        
                        updateColorfulHeading(btn.styleId);
                        await applyRememberedFeatures();
                        setTimeout(() => {
                            if (window.statusObserver?.updatePosition) {
                                window.statusObserver.updatePosition();
                            }
                        }, 100);
                    });
                    
                    // 记忆状态 - 只重置同组的状态
                    if (currentGroup) {
                        const groupButtons = allButtons.filter(b => b.type === 'theme' && b.group === currentGroup);
                        groupButtons.forEach(b => config.set(b.id, "0"));
                    }
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
                        // 现在所有功能都通过属性控制，不需要加载 CSS
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
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Token ${window.siyuan?.config?.api?.token ?? ""}` 
                    } 
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
        const mode = window.theme.themeMode;
        return document.documentElement.getAttribute(`data-${mode}-theme`) === "Savor";
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
            
            window.theme.applyThemeTransition(() => {});
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

    // 通过 CSS 控制 savorToolbar 的可见性
    const ensureSavorToolbarCSS = () => {
        const id = "savor-toolbar-visibility";
        let st = document.getElementById(id);
        if (!st) { st = document.createElement("style"); st.id = id; document.head.appendChild(st); }
        st.textContent = `#commonMenu[data-name="barmode"] #savorToolbar{display:block!important;}`;
    };

    const initSavorToolbar = () => {
        ensureSavorToolbarCSS();
        // 移动端不创建桌面工具栏
        if (document.getElementById("editor")) return;
        if (document.getElementById("savorToolbar")) return; // 只创建一次
        
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
    const initStatusPosition = () => {
        let lastOffset = null;
        const updatePosition = () => {
            const status = $("#status");
            if (!status) return;
            const dockr = $(".layout__dockr"), dockVertical = $(".dock--vertical");
            const dockrWidth = dockr?.offsetWidth || 0;
            const isFloating = dockr?.classList.contains("layout--float");
            const dockVerticalWidth = (!dockVertical || dockVertical.classList.contains("fn__none")) ? 0 : 26;
            const offset = (!dockrWidth || isFloating) ? (dockVerticalWidth ? dockVerticalWidth + 16 : 9) : dockrWidth + (dockVerticalWidth ? dockVerticalWidth + 16 : 9);
            const layoutCenter = document.querySelector('.layout__center');
            status.style.maxWidth = layoutCenter ? `${layoutCenter.offsetWidth - 8}px` : '';
            if (lastOffset !== offset) status.style.transform = `translateX(-${offset}px)`;
            lastOffset = offset;
        };
        const observer = new ResizeObserver(throttle(updatePosition, 16));
        [".layout__dockr", ".dock--vertical", ".layout__center"].forEach(sel => { const el = $(sel); el && observer.observe(el); });
        window.statusObserver = observer;
        window.statusObserver.updatePosition = updatePosition;
        updatePosition();
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
            
            const commonMenu = getCachedElement("#commonMenu");
            const existingSavorToolbar = document.getElementById("savorToolbar");
            
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
                    // 不再移除，交由 CSS 控制显示
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
            applyRememberedThemeStyle()
        ]);
        [initMiddleClickCollapse, collapsedListPreview].forEach(fn => fn());
        initThemeObserver();
        const commonMenuEl = document.getElementById("commonMenu");
        if (commonMenuEl) {
            ensureSavorToolbarCSS();
            if (shouldShowSavorToolbar()) initSavorToolbar();
            toggleMenuListener(commonMenuEl, true);
        } else {
            const waitObserver = new MutationObserver((mutations, obs) => {
                const cm = document.getElementById("commonMenu");
                if (cm) {
                    ensureSavorToolbarCSS();
                    if (shouldShowSavorToolbar()) initSavorToolbar();
                    toggleMenuListener(cm, true);
                    obs.disconnect();
                }
            });
            waitObserver.observe(document.body, { childList: true, subtree: true });
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

    const collapseHandler = (e) => {
        if (e.button !== 1 || e.shiftKey || e.altKey) return;
        const now = Date.now();
        if (now - lastClickTime < DEBOUNCE_TIME) return;
        lastClickTime = now;

        // 查找可编辑块
        const editable = window.theme.findEditableParent(e.target);
        if (!editable) return;

        // 查找列表项或标题
        const found = editable.closest('[data-type="NodeListItem"], [data-type="NodeHeading"]');
        if (!found) return;

        e.preventDefault();

        // 列表项折叠/展开
        if (found.getAttribute("data-type") === "NodeListItem") {
            const nodeId = found.getAttribute("data-node-id");
            if (!nodeId) return;
            // 只有存在.list子元素时才允许折叠
            const hasList = found.querySelector(':scope > .list');
            if (!hasList) return;
            const fold = found.getAttribute("fold");
            window.theme.setBlockFold(nodeId, fold === "1" ? "0" : "1");
        }
        // 标题折叠/展开
        else if (found.getAttribute("data-type") === "NodeHeading") {
            // 查找同级的折叠按钮
            const protyle = found.closest(".protyle");
            const gutters = protyle && protyle.querySelector(".protyle-gutters");
            const foldBtn = gutters && gutters.querySelector('[data-type="fold"]');
            if (foldBtn) foldBtn.click();
        }
    };

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
// 模块：垂直页签宽度调节功能（精简版）
// ========================================
const tabbarResize = {
    resizer: null, isResizing: false, startX: 0, startWidth: 0, tabbar: null,
    MIN: 150, MAX: 600,
    init() {
        this.remove(false);
        const tabbar = document.querySelector(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)");
        if (tabbar) this.create(tabbar);
    },
    create(tabbar) {
        this.resizer = document.createElement("div");
        Object.assign(this.resizer, { id: "vertical-resize-handle" });
        this.resizer.style.cssText = "position:absolute;top:0;right:-3px;width:6px;height:100%;cursor:col-resize;background:transparent;z-index:2;";
        tabbar.style.position = "relative";
        tabbar.appendChild(this.resizer);
        this.resizer.onmousedown = e => this.start(e, tabbar);
        document.addEventListener("mousemove", this.move);
        document.addEventListener("mouseup", this.stop);
    },
    start(e, tabbar) {
        e.preventDefault();
        Object.assign(this, { isResizing: true, startX: e.clientX, tabbar, startWidth: tabbar.offsetWidth });
        document.body.classList.add("tabbar-resizing");
    },
    move: e => {
        if (!tabbarResize.isResizing || !tabbarResize.tabbar) return;
        let w = tabbarResize.startWidth + (e.clientX - tabbarResize.startX);
        w = Math.max(tabbarResize.MIN, Math.min(w, tabbarResize.MAX));
        tabbarResize.tabbar.style.width = w + "px";
    },
    stop: () => {
        if (!tabbarResize.isResizing) return;
        tabbarResize.isResizing = false;
        document.body.classList.remove("tabbar-resizing");
        tabbarResize.tabbar = null;
    },
    remove(reset = true) {
        document.removeEventListener("mousemove", this.move);
        document.removeEventListener("mouseup", this.stop);
        document.getElementById("vertical-resize-handle")?.remove();
        document.body.classList.remove("tabbar-resizing");
        if (reset) document.querySelectorAll(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)").forEach(tabbar => {
            tabbar.style.width = "";
            tabbar.style.position = "";
        });
        Object.assign(this, { resizer: null, isResizing: false, tabbar: null });
    }
};


// ========================================
// 模块：顶栏合并左右间距功能
// ========================================
function initTabBarsMarginUnified(direction = "right") {
    const isRight = direction === "right";

    function updateMargins() {
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

        // 动态计算按钮宽度
        let barButtonsTotalWidth = 0;
        const drag = document.getElementById("drag");
        if (drag) {
            let el = isRight ? drag.nextElementSibling : drag.previousElementSibling;
            while (el) {
                if (el.offsetParent !== null) {
                    barButtonsTotalWidth += (el.offsetWidth ?? 0) + 4;
                }
                el = isRight ? el.nextElementSibling : el.previousElementSibling;
            }
        }

        // 动态计算 panel/dock 宽度
        const panel = document.querySelector(isRight ? ".layout__dockr" : ".layout__dockl");
        const panelWidth = panel?.classList.contains("layout--float")
            ? panel.querySelector(".dock")?.offsetWidth ?? 0
            : panel?.offsetWidth ?? 0;
        const dockId = isRight ? "#dockRight" : "#dockLeft";
        const dockWidth = document.querySelector(dockId)?.offsetWidth ?? 0;

        // margin 计算
        const calculatedMargin = barButtonsTotalWidth - panelWidth - dockWidth;
        const CUSTOM_MARGIN = isRight ? -14 : 0;
        const marginValue = isRight
            ? `${Math.max(0, (calculatedMargin > 0 ? calculatedMargin + CUSTOM_MARGIN : CUSTOM_MARGIN))}px`
            : `${(calculatedMargin > 0 ? calculatedMargin + CUSTOM_MARGIN : CUSTOM_MARGIN)}px`;

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
    }

    // observer 只初始化一次
    const dockSelector = isRight ? ".layout__dockr" : ".layout__dockl";
    const dockVerticalSelector = ".dock--vertical";
    const panelObserver = new ResizeObserver(updateMargins);
    const dockVerticalObserver = new MutationObserver(updateMargins);

    function observeDock() {
        const dock = document.querySelector(dockSelector);
        if (dock) panelObserver.observe(dock);
        const dockVertical = document.querySelector(dockVerticalSelector);
        if (dockVertical) {
            dockVerticalObserver.observe(dockVertical, {
                attributes: true,
                attributeFilter: ["class"]
            });
        }
    }

    // 监听 body 结构变化，dock/dockVertical 变化时重新 observe
    new MutationObserver(() => {
        panelObserver.disconnect();
        dockVerticalObserver.disconnect();
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
    let typewriterModeActive = false, typewriterHandler = null;

    const enableTypewriterMode = () => {
        if (typewriterModeActive) return;
        typewriterModeActive = true;
        typewriterHandler = throttle(() => {
            const sel = window.getSelection();
            if (!sel.rangeCount) return;
            let node = sel.anchorNode || sel.getRangeAt(0).startContainer;
            node = node.nodeType === 3 ? node.parentElement : node;
            const line = node.closest(".p, .h1, .h2, .h3, .h4, .h5, .h6, .li");
            if (!line) return;
            line.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        }, 100);
        document.addEventListener("selectionchange", typewriterHandler);
    };
    
    const disableTypewriterMode = () => {
        if (!typewriterModeActive) return;
        typewriterModeActive = false;
        if (typewriterHandler) {
            document.removeEventListener("selectionchange", typewriterHandler);
            typewriterHandler = null;
        }
    };





    // ========================================
    // 模块：子弹线功能（精简版）
    // ========================================
    let bulletThreadingActive = false;
    let selectionChangeHandler = null;
    let btRafId = null;
    let btLastItems = [];

    const initBulletThreading = () => {
        if (bulletThreadingActive) return;
        bulletThreadingActive = true;
        const apply = () => {
            btRafId = null;
            const sel = window.getSelection();
            if (!sel.rangeCount) {
                // 清理上一次标记
                btLastItems.forEach(node => {
                    node.classList.remove('en_item_bullet_actived', 'en_item_bullet_line');
                    node.style.removeProperty('--en-bullet-line-height');
                });
                btLastItems = [];
                return;
            }
            const start = sel.getRangeAt(0).startContainer;

            // 清理上一次标记（避免全局查询）
            btLastItems.forEach(node => {
                node.classList.remove('en_item_bullet_actived', 'en_item_bullet_line');
                node.style.removeProperty('--en-bullet-line-height');
            });
            btLastItems = [];

            const items = [];
            for (let n = start; n && n !== document.body; n = n.parentElement) {
                if (n.getAttribute?.('custom-f')) return; // 父级存在 custom-f 时直接终止
                if (n.dataset?.type === 'NodeListItem') items.push(n);
            }
            if (items.length === 0) return;

            for (let i = 0; i < items.length - 1; i++) {
                const h = items[i].getBoundingClientRect().top - items[i + 1].getBoundingClientRect().top;
                items[i].style.setProperty('--en-bullet-line-height', `${h}px`);
                items[i].classList.add('en_item_bullet_line');
            }
            items.forEach(item => item.classList.add('en_item_bullet_actived'));
            btLastItems = items.slice();
        };

        selectionChangeHandler = () => { if (!btRafId) btRafId = requestAnimationFrame(apply); };
        document.addEventListener('selectionchange', selectionChangeHandler);
    };

    const removeBulletThreading = () => {
        if (!bulletThreadingActive) return;
        bulletThreadingActive = false;
        if (btRafId) { cancelAnimationFrame(btRafId); btRafId = null; }
        if (selectionChangeHandler) {
            document.removeEventListener('selectionchange', selectionChangeHandler);
            selectionChangeHandler = null;
        }
        // 清理剩余标记
        btLastItems.forEach(node => {
            node.classList.remove('en_item_bullet_actived', 'en_item_bullet_line');
            node.style.removeProperty('--en-bullet-line-height');
        });
        btLastItems = [];
    }


    // ===================== 新增：list2map 提示 i18n 赋值 =====================
    function setList2MapI18nTip(root = document) {
        const tip = i18n.t("list2map.tip");
        root.querySelectorAll?.('[custom-f="dt"]').forEach(el => {
            el.setAttribute('data-i18n-tip', tip);
        });
    }
    i18n.ready().then(() => {
        setList2MapI18nTip();
        // 监听 DOM 变化，增量赋值
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === "attributes") {
                    const t = mutation.target;
                    if (t.getAttribute?.("custom-f") === "dt") {
                        setList2MapI18nTip(t);
                    }
                } else if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.getAttribute?.("custom-f") === "dt") setList2MapI18nTip(node);
                            const dtNodes = node.querySelectorAll?.('[custom-f="dt"]');
                            if (dtNodes?.length) setList2MapI18nTip(node);
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
        
        menuItems.innerHTML = buttons.map(btn => {
            if (btn.separator) {
                return `<button class="b3-menu__separator"></button>`;
            } else {
                return `
                    <button class="b3-menu__item" data-view-item="1" data-node-id="${selectid}"
                            data-attr-name="${btn.attrName}" data-attr-value="${btn.attrValue}">
                        <svg class="b3-menu__icon"><use xlink:href="#${btn.icon}"></use></svg>
                        <span class="b3-menu__label">${i18n.t(btn.labelKey)}</span>
                    </button>
                `;
            }
        }).join("");
        
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

    // 统一的事件委托，处理视图选择子项点击
    document.addEventListener("click", (event) => {
        const item = event.target.closest('.b3-menu__item[data-view-item="1"]');
        if (!item) return;
        const id = item.dataset.nodeId;
        const attrName = "custom-" + item.dataset.attrName;
        const attrValue = item.dataset.attrValue;
        const blocks = document.querySelectorAll(`.protyle-wysiwyg [data-node-id="${id}"]`);
        clearTransformData(id, blocks);
        if (blocks?.length > 0) {
            blocks.forEach(block => block.setAttribute(attrName, attrValue));
            if (attrValue === "") blocks.forEach(cleanupDraggable);
            设置思源块属性(id, { [attrName]: attrValue });
        }
    }, true);

    const initMenuMonitor = () => {
        window.addEventListener("mouseup", () => {
            requestAnimationFrame(() => {
                const selectinfo = getBlockSelected();
                if (selectinfo && (selectinfo.type === "NodeList" || selectinfo.type === "NodeTable")) {
                    InsertMenuItem(selectinfo.id, selectinfo.type);
                }
            });
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

        // 注入一次性样式，使用 CSS 变量驱动 transform 与光标
        const ensureDTStyles = () => {
            if (window.__dtStylesInjected) return;
            const style = document.createElement("style");
            style.id = "dt-inline-styles";
            style.textContent = `
            [custom-f="dt"][data-draggable] { --dt-scale: 1; }
            [custom-f="dt"] [data-type="NodeListItem"][data-draggable] {
            cursor: grab;
            transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(var(--dt-scale, 1));
            }
            [custom-f="dt"][data-animating] [data-type="NodeListItem"][data-draggable] {
            transition: transform 0.25s ease;
            }
            `;
                document.head.appendChild(style);
                window.__dtStylesInjected = true;
            };

            const initDraggable = (element) => {
                const listItems = element.querySelectorAll(`:scope > [data-type="NodeListItem"]`);
                if (!listItems.length) return;

            ensureDTStyles();

            // 初始化容器状态（一次）
            if (!element.hasAttribute("data-draggable")) {
                element.setAttribute("data-draggable", "true");
                element._scale = 1;
                element.style.setProperty("--dt-scale", "1");

                const onWheel = e => {
                    if (e.target.getAttribute("contenteditable") === "true" || !e.altKey) return;
                    e.preventDefault();
                    const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
                    element._scale = Math.min(Math.max((element._scale || 1) * scaleChange, 0.1), 5);
                    element.style.setProperty("--dt-scale", String(element._scale));
                };

                const onDoubleClick = e => {
                    if (e.target.getAttribute("contenteditable") === "true") return;
                    element._scale = 1;
                    element.style.setProperty("--dt-scale", "1");
                    // 开启动画
                    element.setAttribute("data-animating", "true");
                    const allListItems = element.querySelectorAll(`[data-type="NodeListItem"]`);
                    allListItems.forEach(item => {
                        // 清零位移（CSS 变量 + dataset）
                        item.style.removeProperty("--tx");
                        item.style.removeProperty("--ty");
                        item.dataset.tx = "0";
                        item.dataset.ty = "0";
                    });
                    // 动画结束后移除标记
                    setTimeout(() => element.removeAttribute("data-animating"), 260);
                };

                element.addEventListener("wheel", onWheel, { passive: false });
                element.addEventListener("dblclick", onDoubleClick);
                element._onWheel = onWheel;
                element._onDoubleClick = onDoubleClick;
            }

            // 标记子项为可拖拽（利用样式规则）
            listItems.forEach(listItem => {
                if (!listItem.hasAttribute("data-draggable")) listItem.setAttribute("data-draggable", "true");
            });

            // 使用 Pointer 事件简化移动/释放与触屏支持
            if (!element._onItemPointerDown) {
                element._onItemPointerDown = e => {
                    // 鼠标：仅左键；触屏/笔：允许
                    if (e.pointerType === "mouse" && e.button !== 0) return;
                    if (e.target.getAttribute?.("contenteditable") === "true") return;
                    const listItem = e.target.closest?.('[data-type="NodeListItem"]');
                    if (!listItem || !element.contains(listItem)) return;
                    e.preventDefault();

                    listItem.style.cursor = "grabbing";
                    listItem.setPointerCapture?.(e.pointerId);

                    const baseTx = parseFloat(listItem.dataset.tx || "0");
                    const baseTy = parseFloat(listItem.dataset.ty || "0");
                    const startX = e.clientX - baseTx;
                    const startY = e.clientY - baseTy;

                    let rafId = 0;
                    const onPointerMove = (ev) => {
                        if (rafId) cancelAnimationFrame(rafId);
                        rafId = requestAnimationFrame(() => {
                            const tx = ev.clientX - startX;
                            const ty = ev.clientY - startY;
                            listItem.dataset.tx = String(tx);
                            listItem.dataset.ty = String(ty);
                            listItem.style.setProperty("--tx", `${tx}px`);
                            listItem.style.setProperty("--ty", `${ty}px`);
                        });
                    };

                    const onPointerUp = () => {
                        listItem.style.cursor = "grab";
                        listItem.releasePointerCapture?.(e.pointerId);
                        listItem.removeEventListener("pointermove", onPointerMove);
                        listItem.removeEventListener("pointerup", onPointerUp);
                        listItem.removeEventListener("pointercancel", onPointerUp);
                    };

                    listItem.addEventListener("pointermove", onPointerMove);
                    listItem.addEventListener("pointerup", onPointerUp);
                    listItem.addEventListener("pointercancel", onPointerUp);
                };
                element.addEventListener("pointerdown", element._onItemPointerDown);
            }
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
        // 重置所有列表项的位置
        element.querySelectorAll('[data-type="NodeListItem"]').forEach(item => {
            item.style.removeProperty("--tx");
            item.style.removeProperty("--ty");
            delete item.dataset.tx;
            delete item.dataset.ty;
            item.removeAttribute("data-draggable");
        });

        // 移除自身属性
        element.removeAttribute("data-draggable");
        element._scale = 1;
        element.style.removeProperty("--dt-scale");

        // 清理事件监听器
        if (element._onWheel) {
            element.removeEventListener('wheel', element._onWheel);
            delete element._onWheel;
        }
        if (element._onDoubleClick) {
            element.removeEventListener('dblclick', element._onDoubleClick);
            delete element._onDoubleClick;
        }
        if (element._onItemPointerDown) {
            element.removeEventListener('pointerdown', element._onItemPointerDown);
            delete element._onItemPointerDown;
        }
        if (element._onItemMouseDown) { // 兼容旧实现的清理
            element.removeEventListener('mousedown', element._onItemMouseDown);
            delete element._onItemMouseDown;
        }
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
    const _topBarObserveTarget = document.getElementById("commonMenu") || document.body;
    window.topBarPluginMenuObserver.observe(_topBarObserveTarget, { childList: true, subtree: true });




    // ========================================
    // 模块：移动端和平台判断功能
    // ========================================
    const isPhone = () => {
        return !!document.getElementById("editor");
    }

    const isMac = () => {
        return navigator.platform.toUpperCase().indexOf("MAC") > -1;
    }

    // 清理顶栏合并状态的辅助函数
    const cleanupTopbarMerge = () => {
        window.tabBarsMarginInitialized = false;
        document.querySelectorAll(".layout__center .layout-tab-bar--readonly").forEach(tabBar => { 
            tabBar.style.marginRight = "0px"; 
        });
        document.querySelectorAll(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)").forEach(tabBar => { 
            tabBar.style.marginLeft = "0px"; 
        });
        if (window.updateTabBarsMargin) { window.updateTabBarsMargin = null; }
        if (window.updateTabBarsMarginLeft) { window.updateTabBarsMarginLeft = null; }
        if (window._tabBarsResizeObserver) { 
            window._tabBarsResizeObserver.disconnect(); 
            window._tabBarsResizeObserver = null; 
        }
    };

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
        renderAllButtons(savorToolbar);
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
                
                // 现在所有功能都通过属性控制，不需要加载 CSS
                
                if (btn.onEnable) btn.onEnable();
            }
        }
    }





    // ========================================
    // 模块：主题清理
    // ========================================
    window.destroyTheme = () => { 
        // 清理功能按钮
        allButtons?.forEach(btn => btn.type === 'feature' && $(`#${btn.id}`)?.remove());
        featureButtonsActive?.clear();

        // 执行清理函数
        [tabbarResize.remove, removeBulletThreading, disableTypewriterMode, disableListPreview].forEach(fn => fn?.());

        // 清理属性
        document.documentElement.removeAttribute('savor-bullet-threading');
        document.documentElement.removeAttribute('savor-sidebar-memo');

        // 清理侧边栏和事件
        sidebarMemo?.openSideBar(false);
        sidebarMemo?.unobserveDragTitle?.();
        window.theme._collapseHandler && document.body.removeEventListener("mousedown", window.theme._collapseHandler);
        window.theme._collapseHandler = null;

        // 清理全局变量
        Object.assign(window, {
            tabBarsMarginInitialized: false,
            updateTabBarsMargin: null,
            updateTabBarsMarginLeft: null
        });
        [window.statusObserver, window.topBarPluginMenuObserver].forEach(obs => obs?.disconnect());

        // 清理DOM和样式
        $$("[id^=\"Sv-theme-color\"], #snippet-SvcolorfulHeading, #Sv-theme-typewriter-mode, #savorToolbar").forEach(el => el.remove());
        $$(".layout__center .layout-tab-bar--readonly").forEach(el => el.style.marginRight = "0px");
        $$(".layout__center .layout-tab-bar:not(.layout-tab-bar--readonly)").forEach(el => el.style.marginLeft = "0px");
        $("#status") && Object.assign($("#status").style, { transform: "", maxWidth: "" });

        // 清理缓存
        domCache.clear();
        $("#commonMenu") && toggleMenuListener($("#commonMenu"), false);
        // SuperBlock Resizer cleanup
        try { superBlockResizer?.stop?.(); } catch (e) {}
        try {
            document.getElementById('sb-resizer-styles')?.remove();
            document.body.classList.remove('sb-resizing');
            document.querySelectorAll('.sb-resize-handle').forEach(el => el.remove());
            document.querySelectorAll('.sb-resize-container').forEach(el => el.classList.remove('sb-resize-container'));
        } catch (_) {}
    };
    







    
    // ========================================
    // 模块：侧边栏备注功能
    // ========================================
    const sidebarMemo = (() => {
        let isEnabled = false, observers = {}, editorNode = null;
        let dragTimeout = null, dragMutationObserver = null;

        // 工具函数集合
        const utils = {
            autoResizeDiv(div) {
                div.style.height = 'auto';
                div.style.height = (div.scrollHeight + 1) + 'px';
            },
            setEndOfContenteditable(el) {
                let range = document.createRange();
                range.selectNodeContents(el); range.collapse(false);
                let sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
            },
            insertAtCursor(editableDiv, node) {
                let sel = window.getSelection();
                if (!sel.rangeCount) { editableDiv.appendChild(node); return; }
                let range = sel.getRangeAt(0);
                range.deleteContents(); range.insertNode(node);
                range.setStartAfter(node); range.collapse(true);
                sel.removeAllRanges(); sel.addRange(range);
            },
            bindImageZoom(img) {
                img.style.cursor = 'zoom-in';
                img.ondblclick = e => {
                    e.stopPropagation();
                    let overlay = document.createElement('div');
                    overlay.style.cssText = 'position:fixed;z-index:99999;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
                    let bigImg = document.createElement('img');
                    bigImg.src = img.src;
                    bigImg.style.cssText = 'max-width:90vw;max-height:90vh;box-shadow:0 4px 32px rgba(0,0,0,0.5);border-radius:8px;';
                    overlay.appendChild(bigImg);
                    document.body.appendChild(overlay);
                    overlay.onclick = () => overlay.remove();
                };
            },
            getBlockNode(el) {
                while (el && !el.dataset.nodeId) el = el.parentElement;
                return el;
            },
            toggleMemoHighlight(main, nodeId, index, highlight) {
                const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
                if (!blockEl) return;
                const memoSpans = blockEl.querySelectorAll('span[data-type*="inline-memo"]');
                const target = memoSpans[index];
                if (target) {
                    target.classList.toggle('memo-span-highlight', highlight);
                }
            },

            // 创建连线功能
            createMemoConnection(main, sidebar, memoDiv, nodeId, text, memoIndex) {
                this.removeMemoConnection();
                const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
                if (!blockEl || !memoDiv) return;
                const memoSpans = blockEl.querySelectorAll('span[data-type*="inline-memo"]');
                const memoSpan = memoSpans[memoIndex] || memoSpans[0];
                if (!memoSpan) return;

                const container = document.createElement('div');
                container.id = 'memo-connection-container';
                container.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9998;';
                container.innerHTML = `<svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;"><path stroke="var(--Sv-dock-item--activefocus-background)" stroke-width="2" fill="none" stroke-dasharray="6,4"></path></svg>`;
                document.body.appendChild(container);
                const path = container.querySelector('path');

                const update = () => {
                    const a = memoDiv.getBoundingClientRect(), b = memoSpan.getBoundingClientRect();
                    if (!a.width || !b.width) return;
                    const sx = b.right, sy = b.top + b.height / 2, ex = a.left - 6, ey = a.top + a.height / 2;
                    const o = Math.min(Math.abs(ex - sx) * 0.5, 200);
                    path.setAttribute('d', `M${sx} ${sy}C${sx + o} ${sy},${ex - o} ${ey},${ex} ${ey}`);
                };
                update();
                const onScroll = () => requestAnimationFrame(update);
                window.addEventListener('scroll', onScroll, true);
                window.addEventListener('resize', onScroll);

                this.connectionCleanup = () => {
                    window.removeEventListener('scroll', onScroll, true);
                    window.removeEventListener('resize', onScroll);
                    container.remove();
                    this.connectionCleanup = null;
                };
            },

            // 移除连线
            removeMemoConnection() {
                this.connectionCleanup?.();
            }
        };

        // 监听 #drag 的 title 属性变化
        function observeDragTitle() {
            if (dragMutationObserver) return;
            function waitForDrag() {
                const dragEl = document.getElementById('drag');
                if (!dragEl) {
                    dragTimeout = setTimeout(waitForDrag, 1000);
                    return;
                }
                const debouncedRefresh = debounce(refreshEditor, 1000);
                dragMutationObserver = new MutationObserver(() => {
                    debouncedRefresh();
                });
                dragMutationObserver.observe(dragEl, { attributes: true, attributeFilter: ['title'] });
            }
            waitForDrag();
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
        function refreshMemoOffset(main, sidebar) {
            requestAnimationFrame(() => {
                const MARGIN = 10;
                const memoGroups = {};
                sidebar.querySelectorAll('.memo-item').forEach(memoItem => {
                    if (memoItem.style.display === 'none') return; // 跳过隐藏的备注
                    const nodeId = memoItem.getAttribute('data-node-id');
                    if (!memoGroups[nodeId]) memoGroups[nodeId] = { items: [], totalHeight: 0 };
                    memoGroups[nodeId].items.push(memoItem);
                    memoGroups[nodeId].totalHeight += memoItem.offsetHeight + MARGIN;
                });
                let lastBottom = 0;
                Object.values(memoGroups).forEach(group => {
                    const block = main.querySelector(`div[data-node-id="${group.items[0].getAttribute('data-node-id')}"]`);
                    if (!block) return;
                    const blockRect = block.getBoundingClientRect();
                    const mainRect = main.getBoundingClientRect();
                    const blockCenter = blockRect.top - mainRect.top + blockRect.height / 2;
                    const groupCenter = group.totalHeight / 2;
                    let top = Math.max(0, blockCenter - groupCenter);
                    if (top < lastBottom + MARGIN) top = lastBottom + MARGIN;
                    let currentTop = top;
                    group.items.forEach(item => {
                        item.style.position = 'absolute';
                        item.style.top = `${currentTop}px`;
                        item.style.transition = 'top 0.3s cubic-bezier(0.4,0,0.2,1),transform 0.3s cubic-bezier(0.4,0,0.2,1)';
                        currentTop += item.offsetHeight + MARGIN;
                    });
                    lastBottom = currentTop - MARGIN;
                });
            });
        }

        // 添加侧边栏
        function addSideBar(main) {
            let sidebar = main.parentElement.querySelector('#protyle-sidebar');
            const title = main.parentElement.querySelector('div.protyle-title');
            if (!sidebar && title) {
                sidebar = document.createElement('div');
                sidebar.id = 'protyle-sidebar';
                title.insertAdjacentElement('beforeend', sidebar);
                sidebar.style.cssText = 'position:absolute;right:-230px;width:230px;';
                main.style.minWidth = '90%';
            }
            return sidebar;
        }

        // 编辑备注内容
        function bindMemoEdit(div, memoDiv, el, main, sidebar) {
            div.onclick = e => {
                // 只读模式下禁止编辑
                if (main.getAttribute && main.getAttribute('data-readonly') === 'true') {
                    div.style.cursor = 'auto';
                    return;
                } else {
                    div.style.cursor = 'pointer';
                }
                e.stopPropagation();
                const blockEl = main.querySelector(`div[data-node-id="${el.closest('[data-node-id]').dataset.nodeId}"]`);
                if (memoDiv.classList.contains('editing')) return;
                memoDiv.classList.add('editing');
                memoDiv.style.zIndex = '999';
                const old = el.getAttribute('data-inline-memo-content') || '';
                const input = document.createElement('div');
                input.className = 'memo-edit-input';
                input.contentEditable = 'true';
                input.innerHTML = old.replace(/\n/g, '<br>');
                input.setAttribute('placeholder', '输入备注内容...');
                input.style.cssText = 'width:100%;min-height:60px;padding:6px;border:1px solid var(--b3-theme-primary);border-radius:8px;font-size:0.9em;resize:vertical;box-sizing:border-box;overflow:auto;outline:none;white-space:pre-wrap;word-break:break-all;';
                input.addEventListener('input', () => utils.autoResizeDiv(input));
                utils.autoResizeDiv(input);
                div.replaceWith(input);
                input.focus(); utils.setEndOfContenteditable(input);
                requestAnimationFrame(() => { utils.autoResizeDiv(input); refreshMemoOffset(main, sidebar); });
                const save = () => {
                    let val = input.innerHTML
                        .replace(/<div>/gi, '\n')
                        .replace(/<\/div>/gi, '')
                        .replace(/<br\s*\/?>(?!$)/gi, '\n')
                        .replace(/<p>/gi, '\n')
                        .replace(/<\/p>/gi, '')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/\n\s*\n\s*\n+/g, '\n\n')
                        .trim();
                    if (val !== old) {
                        el.setAttribute('data-inline-memo-content', val);
                        updateInlineMemo(el, val);
                    }
                    const newDiv = document.createElement('div');
                    newDiv.className = 'memo-content-view';
                    newDiv.style.cssText = div.style.cssText;
                    newDiv.innerHTML = (val ? val.replace(/\n/g, '<br>') : '') || '<span style="color:#bbb;">点击编辑备注...</span>';
                    bindMemoEdit(newDiv, memoDiv, el, main, sidebar);
                    input.replaceWith(newDiv);
                    newDiv.querySelectorAll('img').forEach(utils.bindImageZoom);
                    memoDiv.classList.remove('editing');
                    memoDiv.style.zIndex = '';
                    setTimeout(() => refreshMemoOffset(main, sidebar), 100);
                };
                input.onblur = () => setTimeout(() => { if (document.activeElement !== input) save(); }, 100);
                input.onkeydown = e => { 
                    if ((e.key === 'Enter' && e.ctrlKey) || e.key === 'Escape') { 
                        e.preventDefault(); 
                        save(); 
                    } else if (e.key === 'a' && e.ctrlKey) {
                        e.preventDefault();
                        const range = document.createRange();
                        range.selectNodeContents(input);
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                };
                input.addEventListener('paste', e => {
                    e.preventDefault();
                    const items = e.clipboardData?.items;
                    if (items) for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        if (item.type.indexOf('image') !== -1) {
                            const file = item.getAsFile();
                            const reader = new FileReader();
                            reader.onload = evt => {
                                const img = document.createElement('img');
                                img.src = evt.target.result;
                                img.style.maxWidth = '100%';
                                utils.bindImageZoom(img);
                                utils.insertAtCursor(input, img);
                            };
                            reader.readAsDataURL(file);
                            return;
                        }
                    }
                    const text = e.clipboardData?.getData('text');
                    if (text && /^\/?assets\//.test(text)) {
                        const url = text.startsWith('/') ? text : '/' + text;
                        fetch(url).then(res => res.blob()).then(blob => {
                            const reader = new FileReader();
                            reader.onload = evt => {
                                const img = document.createElement('img');
                                img.src = evt.target.result;
                                img.style.maxWidth = '100%';
                                utils.bindImageZoom(img);
                                utils.insertAtCursor(input, img);
                            };
                            reader.readAsDataURL(blob);
                        });
                        return;
                    }
                    if (text) document.execCommand('insertText', false, text);
                }, true);
                input.querySelectorAll('img').forEach(utils.bindImageZoom);
            };
        }

        // 刷新侧边栏备注
        function refreshSideBarMemos(main, sidebar) {
            const memos = main.querySelectorAll('span[data-type*="inline-memo"]');
            sidebar.innerHTML = '';
            const frag = document.createDocumentFragment();
            if (!memos.length) { sidebar.removeAttribute('data-memo-count'); return; }
            const isReadonly = main.getAttribute && main.getAttribute('data-readonly') === 'true';
            const blockMemos = {};
            memos.forEach(el => {
                const block = utils.getBlockNode(el);
                if (!blockMemos[block.dataset.nodeId]) blockMemos[block.dataset.nodeId] = [];
                blockMemos[block.dataset.nodeId].push(el);
            });

            let visibleMemoCount = 0;
            Object.entries(blockMemos).forEach(([nodeId, memosInBlock]) => {
                // 检查块及其父级是否被折叠
                const block = main.querySelector(`div[data-node-id="${nodeId}"]`);
                const isBlockFolded = block && isAnyAncestorFolded(block);

                memosInBlock.forEach((el, idxInBlock) => {
                    const block = utils.getBlockNode(el);
                    const memo = el.getAttribute('data-inline-memo-content') || '';
                    const text = el.textContent || '';
                    const memoDiv = document.createElement('div');
                    memoDiv.className = 'memo-item';
                    memoDiv.setAttribute('data-node-id', block.dataset.nodeId);
                    memoDiv.setAttribute('data-memo-index', idxInBlock);
                    memoDiv.style.cssText = 'margin:8px 0px 8px 16px;padding:8px;border-radius:8px;position:relative;width:220px;box-shadow:rgba(0, 0, 0, 0.03) 0px 12px 20px, var(--b3-border-color) 0px 0px 0px 1px inset;';
                    // 如果块或其父级被折叠，隐藏对应的侧栏备注
                    if (isBlockFolded) {
                        memoDiv.style.display = 'none';
                    } else {
                        visibleMemoCount++;
                    }
                    // 只读样式
                    const memoContentStyle = isReadonly ? 'cursor:auto;' : 'cursor:pointer;';
                    memoDiv.innerHTML = `<div class="memo-title-with-dot" style="font-weight:bold;margin-bottom:4px;font-size:1em;display:flex;align-items:center;"><span class="memo-title-dot"></span>${text}</div><div class="memo-content-view" style="${memoContentStyle}font-size:0.9em;margin-bottom:4px;">${memo ? memo.replace(/\n/g, '<br>') : '<span style=\"color:#bbb;\">点击编辑备注...</span>'}</div>`;
                    // 新增：删除按钮（按索引定位）
                    const titleDiv = memoDiv.querySelector('.memo-title-with-dot');
                    if (titleDiv && !isReadonly) {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.innerHTML = `<svg class="b3-menu__icon" style="vertical-align:middle;"><use xlink:href="#iconTrashcan"></use></svg>`;
                        deleteBtn.style.cssText = 'position:absolute;top:4px;right:4px;padding:0;background: var(--Sv-dock-item--activefocus-background);border:none;border-radius:6px;cursor:pointer;z-index:2;';
                        deleteBtn.setAttribute('data-action', 'delete');
                        titleDiv.appendChild(deleteBtn);
                    }
                    const memoContentDiv = memoDiv.querySelector('.memo-content-view');
                    bindMemoEdit(memoContentDiv, memoDiv, el, main, sidebar);
                    frag.appendChild(memoDiv);
                });
            });
            sidebar.setAttribute('data-memo-count', `共 ${visibleMemoCount} 个备注`);
            sidebar.appendChild(frag);

            // 侧栏事件委托：hover 高亮 + 连线、点击删除
            if (!sidebar._delegated) {
                sidebar.addEventListener('mouseover', e => {
                    const item = e.target.closest('.memo-item');
                    if (!item || !sidebar.contains(item)) return;
                    const rt = e.relatedTarget;
                    if (rt && item.contains(rt)) return; // 仍在同一 memo-item 内部移动时不重新触发
                    const nodeId = item.getAttribute('data-node-id');
                    const memoIndex = Number(item.getAttribute('data-memo-index')) || 0;
                    utils.toggleMemoHighlight(main, nodeId, memoIndex, true);
                    utils.createMemoConnection(main, sidebar, item, nodeId, '', memoIndex);
                }, { passive: true });
                sidebar.addEventListener('mouseout', e => {
                    const item = e.target.closest('.memo-item');
                    if (!item || !sidebar.contains(item)) return;
                    const rt = e.relatedTarget;
                    if (rt && item.contains(rt)) return; // 仍在同一 memo-item 内部移动时不移除
                    const nodeId = item.getAttribute('data-node-id');
                    const memoIndex = Number(item.getAttribute('data-memo-index')) || 0;
                    utils.toggleMemoHighlight(main, nodeId, memoIndex, false);
                    utils.removeMemoConnection();
                }, { passive: true });
                sidebar.addEventListener('click', e => {
                    const btn = e.target.closest('button[data-action="delete"]');
                    if (!btn) return;
                    const item = btn.closest('.memo-item');
                    if (!item) return;
                    e.stopPropagation();
                    const nodeId = item.getAttribute('data-node-id');
                    const memoIndex = Number(item.getAttribute('data-memo-index')) || 0;
                    const blockEl = main.querySelector(`div[data-node-id="${nodeId}"]`);
                    item.remove();
                    utils.removeMemoConnection();
                    if (blockEl) {
                        const memoSpans = Array.from(blockEl.querySelectorAll('span[data-type*="inline-memo"]'));
                        const targetSpan = memoSpans[memoIndex];
                        if (targetSpan) {
                            let types = (targetSpan.getAttribute("data-type") || "").split(" ").filter(t => t !== "inline-memo");
                            if (types.length) {
                                targetSpan.setAttribute("data-type", types.join(" "));
                                targetSpan.removeAttribute("data-inline-memo-content");
                            } else {
                                targetSpan.outerHTML = targetSpan.innerHTML;
                            }
                        }
                        fetch('/api/block/updateBlock', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${window.siyuan?.config?.api?.token ?? ''}` },
                            body: JSON.stringify({ dataType: 'html', data: blockEl.outerHTML, id: blockEl.dataset.nodeId })
                        });
                    }
                });
                sidebar._delegated = true;
            }

            refreshMemoOffset(main, sidebar);
            const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
            if (protyleContent) {
                if (visibleMemoCount > 0) {
                    protyleContent.classList.add('Sv-memo');
                } else {
                    protyleContent.classList.remove('Sv-memo');
                }
            }
        }

        // 更新内联备注到思源
        async function updateInlineMemo(el, content) {
            try {
                let blockEl = el;
                while (blockEl && !blockEl.dataset.nodeId) blockEl = blockEl.parentElement;
                if (!blockEl?.dataset.nodeId) return;
                const blockId = blockEl.dataset.nodeId;
                const allMemos = blockEl.querySelectorAll('span[data-type*="inline-memo"]');
                let targetMemo = null;
                for (const m of allMemos) {
                    if (m.isSameNode(el)) { targetMemo = m; break; }
                }
                if (!targetMemo) return;
                targetMemo.setAttribute('data-inline-memo-content', content);
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
            Object.values(observers).flat().forEach(o => o.disconnect());
            observers = {};
            editorNode.querySelectorAll('div.protyle-wysiwyg').forEach(main => {
                let sidebar = main.parentElement.querySelector('#protyle-sidebar');
                if (!sidebar && isEnabled) sidebar = addSideBar(main);
                if (!sidebar) return;
                const mainId = main.parentElement.parentElement.getAttribute('data-id');
                let refreshTimer = null;
                const observer = new MutationObserver(() => {
                    clearTimeout(refreshTimer);
                    refreshTimer = setTimeout(() => {
                        isEnabled && refreshSideBarMemos(main, sidebar);
                        refreshMemoOffset(main, sidebar); // 新增：DOM 变动时自动刷新侧边栏备注定位
                    }, 100);
                });
                observer.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-inline-memo-content', 'data-readonly', 'fold'] });
                observers[mainId] = [observer];
                refreshSideBarMemos(main, sidebar);
                // 新增：滚动编辑器时侧边栏自动刷新定位（监听 .protyle-content）
                const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
                if (protyleContent && !protyleContent._sidebarMemoScrollBinded) {
                    let scheduled = false;
                    const onScroll = () => {
                        if (scheduled) return;
                        scheduled = true;
                        requestAnimationFrame(() => {
                            refreshMemoOffset(main, sidebar);
                            scheduled = false;
                        });
                    };
                    protyleContent.addEventListener('scroll', onScroll, { passive: true });
                    protyleContent._sidebarMemoScrollBinded = true;
                }
            });
            document.querySelectorAll('.protyle-content').forEach(pc => {
                const main = pc.closest('.protyle')?.querySelector('.protyle-wysiwyg');
                if (main && !main.querySelector('span[data-type*="inline-memo"]')) {
                    pc.classList.remove('Sv-memo');
                }
            });
        }

        // 开关侧边栏
        function openSideBar(open, save = false) {
            if (isEnabled === open) return;
            if (!editorNode && open) {
                (function wait() {
                    editorNode = document.querySelector('div.layout__center');
                    if (editorNode) openSideBar(open, save);
                    else setTimeout(wait, 100);
                })();
                return;
            }
            isEnabled = open;
            if (open) {
                window.siyuan?.eventBus?.on('loaded-protyle', refreshEditor);
                refreshEditor();
                observeDragTitle();
            } else {
                window.siyuan?.eventBus?.off('loaded-protyle', refreshEditor);
                Object.values(observers).flat().forEach(o => o.disconnect());
                observers = {};
                editorNode?.querySelectorAll('div.protyle-wysiwyg').forEach(main => {
                    main.parentElement.querySelector('#protyle-sidebar')?.remove();
                    // 清除 Sv-memo 类
                    const protyleContent = main.closest('.protyle')?.querySelector('.protyle-content');
                    if (protyleContent) {
                        protyleContent.classList.remove('Sv-memo');
                    }
                });
                unobserveDragTitle();
            }
            if (save) config.set('sidebarMemoEnabled', open ? '1' : '0');
        }

        // 初始化
        function init() {
            editorNode = document.querySelector('div.layout__center');
            // 检查是否通过属性控制
            const shouldEnable = document.documentElement.hasAttribute('savor-sidebar-memo');
            openSideBar(shouldEnable, true);
        }

        return {
            init,
            openSideBar,
            isEnabled: () => isEnabled,
            setEnabled: enabled => openSideBar(enabled, true),
            unobserveDragTitle,
        };
    })();
    // 判断某块及其所有父块是否有折叠
    function isAnyAncestorFolded(block) {
        let current = block;
        while (current) {
            if (current.getAttribute && current.getAttribute('fold') === '1') {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }


    // 斜杠菜单左右键导航（内联极简版）
    if (!window.__slashMenuNavInstalled) {
        window.__slashMenuNavInstalled = true;
        // 隐藏分割线，保持行对齐
        const styleId = 'slash-menu-hide-separator';
        if (!document.getElementById(styleId)) {
            const st = document.createElement('style');
            st.id = styleId;
            st.textContent = '.hint--menu .b3-menu__separator{display:none!important;}';
            document.head.appendChild(st);
        }
        const getMenu = () => document.querySelector('.hint--menu:not(.fn__none)');
        const setFocus = (menu, el) => {
            if (!el) return;
            const cur = menu.querySelector('.b3-list-item--focus');
            if (cur) cur.classList.remove('b3-list-item--focus');
            el.classList.add('b3-list-item--focus');
        };
        const move = (dir) => {
            const menu = getMenu();
            if (!menu) return false;
            const items = Array.from(menu.querySelectorAll('.b3-list-item'));
            if (!items.length) return false;
            const current = menu.querySelector('.b3-list-item--focus') || items[0];
            const top = current.offsetTop;
            const row = items.filter(el => el.offsetTop === top).sort((a,b)=>a.offsetLeft-b.offsetLeft);
            if (row.length <= 1) return false;
            let i = row.indexOf(current); if (i < 0) i = 0;
            const target = dir==='right' ? row[(i+1)%row.length] : row[(i-1+row.length)%row.length];
            if (target !== current) setFocus(menu, target);
            return true;
        };
        const handler = (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            if (!getMenu()) return;
            move(e.key==='ArrowRight' ? 'right' : 'left');
            e.preventDefault();
            e.stopImmediatePropagation();
        };
        window.addEventListener('keydown', handler, true);
    }



    
    // ========================================
    // 模块：超级块宽度调节
    // ========================================
    const superBlockResizer = (() => {
        const HANDLE_CLASS = 'sb-resize-handle';
        const SB_CLASS = 'sb-resize-container';
        const MIN_PERCENT = 5;

        let bodyObserver = null;
        let resizeObservers = new WeakMap();
        let scanScheduled = false;

        function ensureStyles() {
            const id = 'sb-resizer-styles';
            if (document.getElementById(id)) return;
            const st = document.createElement('style');
            st.id = id;
            st.textContent = `
            .${SB_CLASS}{position:relative;}
            .${HANDLE_CLASS}{position:absolute;top:0;bottom:0;width:20px;margin-left:-6px;cursor:col-resize;z-index:1;background:transparent;opacity:0;pointer-events:auto;}
            .${HANDLE_CLASS}::after{content:'';position:absolute;top:8px;bottom:8px;left:3px;width:5px;border-radius:3px;background:var(--b3-border-color);opacity:0.5;}
            .sb-resizing *{user-select:none!important;}
            .${HANDLE_CLASS}{transition: opacity 0.3s ease;}
            .${HANDLE_CLASS}:hover{opacity: 1;}
            `;
            document.head.appendChild(st);
        }

        const isColLayout = (sb) => sb?.getAttribute?.('data-sb-layout') === 'col';

        function getColumns(sb) {
            if (!isColLayout(sb)) return [];
            let cols = Array.from(sb.children).filter(el => el?.dataset?.nodeId && el.offsetParent !== null);
            if (cols.length < 2) {
                const wrapper = sb.firstElementChild;
                if (wrapper) {
                    const nested = Array.from(wrapper.children).filter(el => el?.dataset?.nodeId && el.offsetParent !== null);
                    if (nested.length >= 2) cols = nested;
                }
            }
            return cols;
        }

        function readSavedWidth(el) {
            const ds = parseFloat(el?.dataset?.sbPct || '');
            if (isFinite(ds)) return ds;
            const styleText = el?.getAttribute?.('style') || '';
            if (!styleText) return NaN;
            const mCalc = styleText.match(/width\s*:\s*calc\(([-\d.]+)%\s*-\s*([-\d.]+)px\)/i);
            if (mCalc && isFinite(parseFloat(mCalc[1]))) return parseFloat(mCalc[1]);
            const mPct = styleText.match(/width\s*:\s*([-\d.]+)%/i);
            if (mPct && isFinite(parseFloat(mPct[1]))) return parseFloat(mPct[1]);
            return NaN;
        }

        function getColumnGapPx(host) {
            try {
                const cs = getComputedStyle(host);
                let g = parseFloat(cs.columnGap);
                if (!isFinite(g)) {
                    const gap = cs.gap || '';
                    if (gap) {
                        const parts = gap.split(' ');
                        const colGapStr = parts.length === 1 ? parts[0] : parts[1];
                        g = parseFloat(colGapStr);
                    }
                }
                return isFinite(g) ? g : 0;
            } catch (_) { return 0; }
        }

        function setColumnSize(sb, col, percent) {
            const v = Math.max(0, isFinite(percent) ? percent : 0);
            const vRound = Math.round(v * 10) / 10;
            const host = col?.parentElement || sb;
            const colsCount = getColumns(sb).length || 1;
            const gap = getColumnGapPx(host);
            const gapShare = colsCount > 0 ? (gap * (colsCount - 1)) / colsCount : 0;
            const adjustShare = gapShare + 1;
            const calc = `calc(${vRound}% - ${Math.round(adjustShare * 10) / 10}px)`;
            col.style.flex = '0 0 auto';
            col.style.width = calc;
            col.style.flexBasis = calc;
            col.dataset.sbPct = String(vRound);
        }

        function measurePercents(sb, cols) {
            const host = cols[0]?.parentElement || sb;
            const w = host.getBoundingClientRect().width || 1;
            const colsCount = cols.length || 1;
            const gap = getColumnGapPx(host);
            const gapShare = colsCount > 0 ? (gap * (colsCount - 1)) / colsCount : 0;
            return cols.map(col => ((col.getBoundingClientRect().width + gapShare) / w) * 100);
        }

        function normalizePercents(values, minPercent = MIN_PERCENT, total = 100) {
            const n = values.length; if (!n) return [];
            const effMin = Math.min(minPercent, total / n);
            let v = values.map(x => Math.max(0, isFinite(x) ? x : 0));
            v = v.map(x => Math.max(effMin, x));
            const sum = v.reduce((a,b) => a + b, 0);
            const base = effMin * n;
            const varSum = Math.max(0, sum - base);
            const targetVar = Math.max(0, total - base);
            if (varSum === 0) return v.map(() => effMin);
            const factor = targetVar / varSum;
            return v.map(x => effMin + (x - effMin) * factor);
        }

        async function saveWidth(el, pct, gapSharePx) {
            const id = el?.dataset?.nodeId; if (!id) return;
            try {
                const vRound = Math.round(pct * 10) / 10;
                const gapRound = Math.round(((gapSharePx || 0) + 1) * 10) / 10;
                const calcVal = `calc(${vRound}% - ${gapRound}px)`;
                el.style.flex = '0 0 auto';
                el.style.width = calcVal;
                el.style.flexBasis = calcVal;
                const newStyle = el.getAttribute('style') || el.style.cssText || '';
                await 设置思源块属性(id, { 'style': newStyle });
            } catch (_) {}
        }

        		async function clearWidth(el) {
			const id = el?.dataset?.nodeId; if (!id) return;
			try {
				el.style.removeProperty('width');
				el.style.removeProperty('flex-basis');
				el.style.removeProperty('flex');
				delete el.dataset.sbPct;
				const newStyle = el.getAttribute('style') || el.style.cssText || '';
				if (!newStyle) el.removeAttribute('style');
				await 设置思源块属性(id, { 'style': newStyle });
			} catch (_) {}
		}

        function removeHandles(sb) { sb.querySelectorAll(':scope > .' + HANDLE_CLASS).forEach(h => h.remove()); }

        function positionHandles(sb) {
            const cols = getColumns(sb);
            if (cols.length < 2) { removeHandles(sb); return; }
            const rect = sb.getBoundingClientRect();
            const need = cols.length - 1;
            const existing = sb.querySelectorAll(':scope > .' + HANDLE_CLASS);
            if (existing.length === need) {
                for (let i = 0; i < need; i++) {
                    const leftRect = cols[i].getBoundingClientRect();
                    const rightRect = cols[i + 1].getBoundingClientRect();
                    const centerX = ((leftRect.right + rightRect.left) / 2) - rect.left;
                    existing[i].style.left = centerX + 'px';
                }
            } else {
                removeHandles(sb);
                for (let i = 0; i < need; i++) {
                    const leftRect = cols[i].getBoundingClientRect();
                    const rightRect = cols[i + 1].getBoundingClientRect();
                    const centerX = ((leftRect.right + rightRect.left) / 2) - rect.left;
                    const handle = document.createElement('div');
                    handle.className = HANDLE_CLASS;
                    handle.style.left = centerX + 'px';
                    attachDrag(sb, handle, cols[i], cols[i + 1]);
                    sb.appendChild(handle);
                }
            }
        }

        function attachDrag(sb, handle, leftEl, rightEl) {
            let startX = 0, containerWidth = 0, startLeftPct = 0, startRightPct = 0, moved = false;
            let colsAll = [];

            const onPointerDown = (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                e.preventDefault();
                const rect = sb.getBoundingClientRect();
                containerWidth = rect.width || 1;
                startX = e.clientX;
                colsAll = getColumns(sb);
                const saved = colsAll.map(readSavedWidth);
                const measured = measurePercents(sb, colsAll);
                const baseline = normalizePercents(saved.some(v => isFinite(v)) ? saved : measured, MIN_PERCENT, 100);
                const li = colsAll.indexOf(leftEl), ri = colsAll.indexOf(rightEl);
                startLeftPct = baseline[li] ?? 50;
                startRightPct = baseline[ri] ?? 50;
                moved = false;
                sb.classList.add('sb-resizing');
                getColumns(sb).forEach(c => c.style.transition = 'none');
                handle.setPointerCapture?.(e.pointerId);
                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp, { once: true });
            };

            const onPointerMove = throttle((e) => {
                const dx = e.clientX - startX;
                const dxPct = (dx / (containerWidth || 1)) * 100;
                if (Math.abs(dx) < 1) return;
                moved = true;
                const pairBudget = (startLeftPct + startRightPct);
                const min = Math.min(MIN_PERCENT, pairBudget / 2);
                let newLeft = Math.min(Math.max(min, startLeftPct + dxPct), pairBudget - min);
                const newRight = pairBudget - newLeft;
                const cols = getColumns(sb);
                const li = cols.indexOf(leftEl), ri = cols.indexOf(rightEl);
                if (li >= 0) setColumnSize(sb, cols[li], newLeft);
                if (ri >= 0) setColumnSize(sb, cols[ri], newRight);
                positionHandles(sb);
            }, 16);

            const onPointerUp = async () => {
                window.removeEventListener('pointermove', onPointerMove);
                sb.classList.remove('sb-resizing');
                const cols = getColumns(sb);
                if (!moved) {
                    cols.forEach(c => c.style.removeProperty('transition'));
                    positionHandles(sb);
                    return;
                }
                // 计算并应用所有列的当前宽度，确保未拖动列也写入 style
                const percents = measurePercents(sb, cols);
                cols.forEach((c, i) => setColumnSize(sb, c, percents[i]));
                cols.forEach(c => c.style.removeProperty('transition'));
                try {
                    const host = cols[0]?.parentElement || sb;
                    const gap = getColumnGapPx(host);
                    const gapShare = cols.length > 0 ? (gap * (cols.length - 1)) / cols.length : 0;
                    await Promise.all(
                        cols.map((c, i) => saveWidth(c, Math.round(percents[i] * 10) / 10, gapShare))
                    );
                } catch (_) {}
                positionHandles(sb);
            };

            handle.addEventListener('pointerdown', onPointerDown, { capture: true });
            const onDoubleClick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const cols = getColumns(sb);
                if (cols.length < 2) return;
                cols.forEach(c => c.style.removeProperty('transition'));
                try { await Promise.all(cols.map(c => clearWidth(c))); } catch (_) {}
                positionHandles(sb);
            };
            handle.addEventListener('dblclick', onDoubleClick, { capture: true });
        }

        async function applySaved(sb) {
            const cols = getColumns(sb); if (cols.length < 2) return;
            const saved = cols.map(readSavedWidth);
            if (saved.some(v => isFinite(v))) {
                cols.forEach((c, i) => {
                    if (isFinite(saved[i])) setColumnSize(sb, c, saved[i]);
                });
            }
            positionHandles(sb);
        }

        function initSuperBlock(sb) {
            if (!sb || sb._sbResizerInit || !isColLayout(sb)) return;
            sb._sbResizerInit = true;
            sb.classList.add(SB_CLASS);
            applySaved(sb);
            positionHandles(sb);
            let lastW = 0;
            const ro = new ResizeObserver(throttle(() => {
                if (sb.classList.contains('sb-resizing')) return;
                const w = sb.getBoundingClientRect().width;
                if (Math.abs(w - lastW) < 0.5) return;
                lastW = w;
                positionHandles(sb);
            }, 120));
            ro.observe(sb);
            resizeObservers.set(sb, ro);
        }

        function scan() {
            scanScheduled = false;
            document.querySelectorAll('.protyle-wysiwyg [data-type="NodeSuperBlock"][data-sb-layout="col"]').forEach(sb => {
                if (!sb._sbResizerInit) {
                    initSuperBlock(sb);
                } else {
                    if (!sb.querySelector(':scope > .' + HANDLE_CLASS)) {
                        try { applySaved(sb); } catch (_) {}
                        positionHandles(sb);
                    } else {
                        positionHandles(sb);
                    }
                }
            });
        }

        function scheduleScan() {
            if (scanScheduled) return;
            scanScheduled = true;
            requestAnimationFrame(scan);
        }

        function start() {
            ensureStyles();
            scan();
            if (!bodyObserver) {
                bodyObserver = new MutationObserver(mutations => {
                    for (const x of mutations) {
                        if (x.type === 'childList') { scheduleScan(); break; }
                        if (x.type === 'attributes' && x.target?.matches?.('[data-type="NodeSuperBlock"]')) { scheduleScan(); break; }
                    }
                });
                bodyObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-type', 'data-sb-layout'] });
            }
            window.addEventListener('themechange', scheduleScan, { passive: true });
            window.siyuan?.eventBus?.on('loaded-protyle', () => setTimeout(scheduleScan, 50));
        }

        function stop() {
            try { window.siyuan?.eventBus?.off('loaded-protyle', scan); } catch (_) {}
            bodyObserver?.disconnect(); bodyObserver = null;
            window.removeEventListener('themechange', scheduleScan);
            document.querySelectorAll('.' + SB_CLASS).forEach(sb => sb.classList.remove(SB_CLASS));
            document.querySelectorAll('.' + HANDLE_CLASS).forEach(el => el.remove());
            for (const [, ro] of resizeObservers.entries()) ro.disconnect();
            resizeObservers = new WeakMap();
            scanScheduled = false;
        }

        return { start, stop, refresh: scan };
    })();

    setTimeout(() => { try { superBlockResizer.start(); } catch (e) { console.error('[Savor] 超级块调整启动失败:', e); } }, 800);

})();

