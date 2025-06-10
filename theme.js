(function () {
    window.theme = {
        ID_COLOR_STYLE: 'Sv-theme-color',
        config: {},
        themeMode: null,

    // 主题配色切换过渡效果
    applyThemeTransition: function() {
        // 添加过渡类
        document.documentElement.classList.add('theme-transitioning');
        
        // 在过渡完成后移除类（使用过渡时间）
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 600); // 略大于过渡时间以确保完成
    },
                
    // 添加鼠标中键折叠/展开相关函数
    isFatherFather: function(element, fn, maxDepth = 50) {
        if (!element || !element.parentElement) return null;
        
        let depth = 0;
        let parent = element.parentElement;
        
        while (parent && depth < maxDepth) {
            if (fn(parent)) return parent;
            parent = parent.parentElement;
            depth++;
        }
        
        return null;
    },
    
    isSiyuanFloatingWindow: function(element) {
        return this.isFatherFather(element, (v) => v.getAttribute("data-oid") != null);
    },
    
    setBlockfold_1: function(id) {
        if (!id) return;
        
        // 使用缓存避免频繁API调用
        if (window._lastFoldedId === id && window._lastFoldedState === '1') {
            return;
        }
        
        window._lastFoldedId = id;
        window._lastFoldedState = '1';
        
        fetch('/api/attr/setBlockAttrs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ''`
            },
            body: JSON.stringify({
                id: id,
                attrs: {
                    'fold': '1'
                }
            })
        });
    },
    
    setBlockfold_0: function(id) {
        if (!id) return;
        
        // 使用缓存避免频繁API调用
        if (window._lastFoldedId === id && window._lastFoldedState === '0') {
            return;
        }
        
        window._lastFoldedId = id;
        window._lastFoldedState = '0';
        
        fetch('/api/attr/setBlockAttrs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ''`
            },
            body: JSON.stringify({
                id: id,
                attrs: {    
                    'fold': '0'
                }
            })
        });
    },
    
    // 初始化鼠标中键折叠/展开功能
    initCollapseExpand: function() {
        let flag45 = false;
        let lastClickTime = 0;
        const DEBOUNCE_TIME = 300; // 防抖时间，避免频繁触发
        const self = this; // 保存this引用
        
        // 使用事件委托，减少事件监听器数量
        document.body.addEventListener("mouseup", () => {
            flag45 = false;
        });
    
        document.body.addEventListener("mousedown", (e) => {
            // 只处理鼠标中键点击
            if (e.button === 2) { 
                flag45 = true; 
                return;
            }
            
            if (flag45 || e.shiftKey || e.altKey || e.button !== 1) return;
            
            // 防抖处理
            const now = Date.now();
            if (now - lastClickTime < DEBOUNCE_TIME) return;
            lastClickTime = now;
            
            // 查找可编辑元素
            let target = e.target;
            if (target.getAttribute("contenteditable") == null) {
                const editableParent = findEditableParent(target);
                if (editableParent) {
                    target = editableParent;
                } else {
                    return; // 如果找不到可编辑元素，直接返回
                }
            }
    
            const targetParentElement = target.parentElement;
            if (!targetParentElement) return;
    
            // 处理事件并阻止默认行为
            e.preventDefault();
            
            // 判断元素类型并执行相应的折叠/展开操作
            const parentType = targetParentElement.getAttribute("data-type");
            const grandParentElement = targetParentElement.parentElement;
            
            if (parentType === "NodeHeading") {
                // 标题元素
                if (grandParentElement && grandParentElement.getAttribute("data-type") === "NodeListItem") {
                    // 列表中的标题
                    handleListItemCollapse(target);
                } else {
                    // 普通标题
                    handleHeadingCollapse(target);
                }
            } else if (grandParentElement && grandParentElement.getAttribute("data-type") === "NodeListItem") {
                // 列表项
                handleListItemCollapse(target);
            }
        });
    
        // 查找可编辑的父元素
        function findEditableParent(element) {
            return self.isFatherFather(element, (v) => {
                return v.getAttribute("contenteditable") != null;
            }, 10);
        }
    
        // 递归查找符合条件的第一个子元素
        function findElementByCondition(element, condition) {
            if (!element) return null;
            
            if (condition(element)) return element;
            
            const children = element.children;
            for (let i = 0; i < children.length; i++) {
                const result = findElementByCondition(children[i], condition);
                if (result) return result;
            }
            
            return null;
        }
    
        // 处理标题折叠
        function handleHeadingCollapse(element) {
            // 查找protyle容器
            const protyle = findProtyleContainer(element);
            if (!protyle) return;
            
            // 查找折叠按钮并点击
            const gutters = protyle.querySelector(".protyle-gutters");
            if (gutters) {
                const foldButton = findElementByCondition(gutters, (v) => v.getAttribute("data-type") === "fold");
                if (foldButton) {
                    foldButton.click();
                }
            }
        }
        
        // 查找protyle容器
        function findProtyleContainer(element) {
            const protyleClasses = [
                "protyle", 
                "fn__flex-1 protyle", 
                "block__edit fn__flex-1 protyle", 
                "fn__flex-1 spread-search__preview protyle"
            ];
            
            let current = element;
            let i = 0;
            const MAX_DEPTH = 20; // 限制查找深度
            
            while (current && i < MAX_DEPTH) {
                if (current.className && protyleClasses.some(cls => current.className === cls)) {
                    return current;
                }
                current = current.parentElement;
                i++;
            }
            
            return null;
        }
    
        // 处理列表项折叠
        function handleListItemCollapse(element) {
            // 检查是否在悬浮窗中
            const floatingWindow = self.isSiyuanFloatingWindow(element);
            if (floatingWindow) {
                const listItem = self.isFatherFather(element, (v) => v.classList.contains("li"), 7);
                if (listItem && !listItem.previousElementSibling) {
                    // 悬浮窗中的第一个列表项特殊处理
                    toggleFoldAttribute(listItem);
                    return;
                }
            }
    
            // 查找列表项元素
            let contentElement = element;
            let depth = 0;
            while (contentElement.getAttribute("contenteditable") == null && depth < 10) {
                contentElement = contentElement.parentElement;
                depth++;
            }
            
            const listItemElement = contentElement?.parentElement?.parentElement;
            if (!listItemElement) return;
            
            // 检查是否可以折叠（至少有子项）
            if (listItemElement.children.length <= 3) return;
            
            // 获取当前折叠状态并切换
            const nodeId = listItemElement.getAttribute("data-node-id");
            const currentFoldState = listItemElement.getAttribute("fold");
            
            if (!nodeId) return;
            
            if (currentFoldState === "1") {
                self.setBlockfold_0(nodeId);
            } else {
                self.setBlockfold_1(nodeId);
            }
        }
        
        // 切换fold属性
        function toggleFoldAttribute(element) {
            const foldState = element.getAttribute("fold");
            element.setAttribute("fold", foldState === "1" ? "0" : "1");
        }
    }
};
    
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
        /* 根据配置选项判断主题 */
        switch (window.siyuan.config.appearance.mode) {
            case 0: return 'light';
            case 1: return 'dark';
            default: return null;
        }
    })();
    
    // 监听主题模式变化
    const htmlElement = document.documentElement;
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.attributeName === 'data-theme-mode') {
                const newThemeMode = htmlElement.getAttribute('data-theme-mode');
                window.theme.themeMode = newThemeMode;
                
                // 添加主题切换过渡效果
                window.theme.applyThemeTransition();
                
                clearThemeStyles();
                
                const savorToolbar = document.getElementById("savorToolbar");
                if (savorToolbar) {
                    savorToolbar.innerHTML = '';
                    themeButton();
                }
                break;
            }
        }
    });
    
    observer.observe(htmlElement, { attributes: true });
    
    /**
     * 清理主题样式元素
     */
    function clearThemeStyles() {
        document.querySelectorAll('[id^="Sv-theme-color"]')
            .forEach(element => element.parentNode.removeChild(element));
    }
    
    /**
     * 更换主题模式
     * @params {string} lightStyle 浅色主题配置文件路径
     * @params {string} darkStyle 深色主题配置文件路径
     */
    window.theme.changeThemeMode = function (lightStyle, darkStyle) {
        const href_color = window.theme.themeMode === 'light' ? lightStyle : darkStyle;
        window.theme.updateStyle(window.theme.ID_COLOR_STYLE, href_color);
    }
    
    /**---------------------------------------------------------主题-------------------------------------------------------- */
    
    function themeButton() {
        // 检查 savorToolbar 是否存在
        const savorToolbar = document.getElementById("savorToolbar");
        if (!savorToolbar) return;
        
        // 清空现有内容
        savorToolbar.innerHTML = '';
        
        // 添加监视器，当commonMenu隐藏时清除savorToolbar
        const commonMenu = document.getElementById("commonMenu");
        if (commonMenu) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class' && 
                        commonMenu.classList.contains('fn__none') && 
                        savorToolbar && savorToolbar.parentNode) {
                        savorToolbar.parentNode.removeChild(savorToolbar);
                    }
                });
            });
            
            observer.observe(commonMenu, { attributes: true });
        }
        
        // 浅色主题配色
        const lightThemes = [
            { id: "buttonSavor-light", label: "Light 配色", path: "/appearance/themes/Savor/style/theme/savor-light.css", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.4-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.267 14c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c0.933 0 1.6 0.8 1.6 1.6s-0.8 1.6-1.6 1.6c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c1.867 0 3.333-1.467 3.333-3.333s-1.467-3.067-3.333-3.067z" },
            { id: "buttonsalt", label: "Salt 配色", path: "/appearance/themes/Savor/style/theme/savor-salt.css", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.133 17.2c-1.867-1.067-3.867-2.133-3.867 0s1.733 3.867 3.867 3.867 3.867-1.733 3.867-3.867-2.133 1.067-3.867 0z" },
            { id: "buttonsugar", label: "Sugar 配色", path: "/appearance/themes/Savor/style/theme/savor-sugar.css", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-0.267 0-0.533 0-0.8-0.133 2.533-0.133 4.533-2.133 4.533-4.533 0.133-1.067-0.267-2.133-1.067-2.8-0.8-0.8-1.6-1.2-2.8-1.333-0.933-0.133-1.733 0.267-2.4 0.8s-1.067 1.467-1.067 2.267c-0.133 1.467 1.067 2.8 2.533 2.933 1.2 0.133 2.4-0.933 2.4-2.133 0-0.267-0.267-0.533-0.533-0.533s-0.533 0.267-0.533 0.533c0 0.667-0.533 1.2-1.2 1.067-0.933-0.133-1.6-0.8-1.467-1.6 0-0.533 0.267-1.067 0.667-1.467s0.933-0.533 1.6-0.533c0.8 0 1.467 0.267 2 0.933 0.533 0.533 0.8 1.2 0.8 2.133-0.133 2-1.867 3.6-3.867 3.467-1.6-0.133-2.933-0.933-3.733-2.133-0.267-0.8-0.267-1.467-0.267-2.133 0-2.8 2.4-5.2 5.2-5.2s5.2 2.4 5.2 5.2-2.4 5.2-5.2 5.2z" },
            { id: "buttonforest", label: "Forest 配色", path: "/appearance/themes/Savor/style/theme/savor-forest.css", svg: "M16 12.133c-1.867 0-2.933 1.467-2.933 2.933 0 0.533 0 1.733 0 2.267 0 0.8 0.4 1.467 0.4 1.467 0.4 0.667 1.067 1.2 1.867 1.333v1.2c0 0.267 0.267 0.533 0.533 0.533s0.533-0.267 0.533-0.533v-1.2c1.333-0.267 2.267-1.467 2.267-2.8v-2.267c0.267-1.6-0.933-2.933-2.667-2.933zM17.733 17.333c0 0.8-0.4 1.333-1.2 1.6v-2.267c0-0.267-0.267-0.533-0.533-0.533s-0.533 0.267-0.533 0.533v2.267c-0.8-0.267-1.2-0.933-1.2-1.6v-2.267c0-0.933 0.8-1.733 1.733-1.733s1.733 0.8 1.733 1.733v2.267zM16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.2-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467z" },
            { id: "buttonflower", label: "Flower 配色", path: "/appearance/themes/Savor/style/theme/savor-flower.css", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467zM19.333 14.533c-0.267 0-1.6 0.267-1.6 0.267s-1.067-1.6-1.733-1.6-1.6 1.6-1.6 1.6-1.333-0.267-1.6-0.267-0.667 1.333-0.667 2.667c0 2.4 1.733 4 4 4s4-1.6 4-4c-0.133-1.333-0.4-2.667-0.8-2.667zM16 19.867c-1.467 0-2.667-1.067-2.667-2.667 0-0.4 0-0.8 0.133-1.2 0.133 0 0.4 0.133 0.533 0.133l0.933 0.267 0.533-0.8c0.133-0.267 0.267-0.533 0.533-0.667v0 0c0.133 0.267 0.4 0.533 0.533 0.8l0.533 0.8 0.933-0.267c0.133 0 0.4-0.133 0.533-0.133 0 0.4 0.133 0.8 0.133 1.2 0 1.333-1.2 2.533-2.667 2.533z" },
            { id: "buttonwind", label: "Wind 配色", path: "/appearance/themes/Savor/style/theme/savor-wind.css", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM16 22.4c-3.067 0-5.467-2.4-5.467-5.467 0-2.933 2.4-5.467 5.467-5.467s5.467 2.4 5.467 5.467c0 2.933-2.533 5.467-5.467 5.467zM18.4 13.2h-0.667c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h0.667c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-6.267c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h6.267c1.067 0 1.867-0.8 1.867-1.867 0-1.333-0.8-2.133-1.867-2.133zM14.667 17.733h-2.533c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h2.533c0.4 0 0.667 0.267 0.667 0.667s-0.267 0.667-0.667 0.667h-0.667c-0.4 0-0.667 0.267-0.667 0.667s0.267 0.667 0.667 0.667h0.667c1.067 0 1.867-0.8 1.867-1.867s-0.8-2.133-1.867-2.133z" }
        ];
        
        // 深色主题配色
        const darkThemes = [
            { id: "buttonSavor-dark", label: "Dark 配色", path: "/appearance/themes/Savor/style/theme/savor-dark.css", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.4-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.267 14c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c0.933 0 1.6 0.8 1.6 1.6s-0.8 1.6-1.6 1.6c-0.533 0-0.8 0.267-0.8 0.8s0.267 0.8 0.8 0.8c1.867 0 3.333-1.467 3.333-3.333s-1.467-3.067-3.333-3.067z" },
            { id: "buttonvinegar", label: "Vinegar 配色", path: "/appearance/themes/Savor/style/theme/savor-vinegar.css", svg: "M19.467 18.533c-0.133 0-0.133 0-0.133 0.133-0.4 0.133-0.8 0.133-1.2 0.133-2 0-3.2-1.2-3.2-3.2 0-0.4 0.133-1.067 0.267-1.2v-0.133c0-0.133-0.133-0.133-0.133-0.133s-0.133 0-0.267 0.133c-1.333 0.533-2.267 1.867-2.267 3.467 0 2.133 1.6 3.733 3.867 3.733 1.6 0 2.933-0.933 3.467-2.133 0.133-0.133 0.133-0.133 0.133-0.133-0.4-0.533-0.533-0.667-0.533-0.667zM16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2z" },
            { id: "buttonocean", label: "Ocean 配色", path: "/appearance/themes/Savor/style/theme/savor-ocean.css", svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.8 0 5.2 2.4 5.2 5.2s-2.4 5.2-5.2 5.2zM16.133 17.2c-1.867-1.067-3.867-2.133-3.867 0s1.733 3.867 3.867 3.867 3.867-1.733 3.867-3.867-2.133 1.067-3.867 0z" },
            { id: "buttonmountain", label: "Mountain 配色", path: "/appearance/themes/Savor/style/theme/savor-mountain.css", svg: "M16 9.867c-3.867 0-6.933 3.2-6.933 6.933 0 3.867 3.2 7.067 6.933 7.067 3.867 0 7.067-3.2 7.067-7.067-0.133-3.733-3.333-6.933-7.067-6.933zM14.667 22.267c-1.2-0.267-2.267-0.933-2.933-1.867l2.533-4.4 2.133 3.6-1.733 2.667zM17.867 19.867l0.667-1.2 1.2 2.133c-0.933 0.933-2.133 1.467-3.467 1.467l1.6-2.4zM16 11.467c3.067 0 5.467 2.4 5.467 5.467 0 0.933-0.267 1.867-0.667 2.533l-1.6-2.533c-0.267-0.4-0.667-0.4-0.933-0.267-0.133 0-0.133 0.133-0.267 0.267l-0.667 1.2-2.4-4c-0.267-0.4-0.667-0.4-0.933-0.267-0.133 0-0.133 0.133-0.267 0.267l-2.8 4.8c-0.267-0.667-0.4-1.333-0.4-2 0-3.067 2.4-5.467 5.467-5.467z" }
        ];
        
        // 根据当前主题模式添加相应的主题按钮
        const themes = window.theme.themeMode === 'light' ? lightThemes : darkThemes;
        
        themes.forEach(theme => {
            savorThemeToolbarAddButton(
                theme.id,
                "b3-menu__item",
                theme.label,
                window.theme.themeMode,
                () => {
                    const styleId = `Sv-theme-color-${theme.id.replace('button', '')}`;
                    // 检查样式是否已存在，不存在才加载
                    if (!document.getElementById(styleId)) {
                        window.theme.loadStyle(theme.path, styleId).setAttribute("topicfilter", theme.id);
                    }
                    qucuFiiter();
                },
                () => {
                    const styleId = `Sv-theme-color-${theme.id.replace('button', '')}`;
                    const styleElement = document.getElementById(styleId);
                    if (styleElement) styleElement.remove();
                },
                true,
                theme.svg // 传递SVG路径
            );
        });
         // 在主题按钮初始化后添加功能按钮
         initFeatureButtons();
        }
/**---------------------------------------------------------功能按钮-------------------------------------------------------------- */

// 功能按钮配置
const featureButtons = [
    {
        id: "concealButton",
        label: "挖空",
        cssPath: "/appearance/themes/Savor/style/topbar/conceal-mark.css",
        styleId: "Sv-theme-color-conceal挖空",
        attrName: "conceal挖空",
        svg: "M16 10.667c-3.733 0-6.667 2.933-6.667 6.667 0 3.6 3.067 6.667 6.667 6.667 3.733 0 6.667-3.067 6.667-6.667 0-3.733-3.067-6.667-6.667-6.667zM16 22.533c-2.933 0-5.2-2.267-5.2-5.2s2.267-5.2 5.2-5.2c2.267 0 4.133 1.467 4.933 3.467-0.133 0-0.4 0-0.4 0.133-0.533 0.533-0.933 0.8-1.467 1.2 0 0-0.133 0-0.133 0.133-0.533 0.267-1.2 0.533-1.733 0.533 0 0 0 0-0.133 0-0.4 0.133-0.667 0.133-1.067 0.133-0.267 0-0.667 0-0.933-0.133h-0.133c-0.533-0.133-1.2-0.267-1.6-0.533-0.133-0.133-0.133-0.133-0.133-0.133-0.533-0.267-1.067-0.667-1.467-1.067-0.133-0.133-0.533-0.133-0.8 0-0.133 0.133-0.133 0.533 0 0.8 0.4 0.4 0.8 0.8 1.2 1.067l-0.933 0.8c-0.133 0.133-0.133 0.533 0.133 0.8 0.133 0.133 0.133 0.133 0.4 0.133 0.133 0 0.267-0.133 0.4-0.133l0.933-1.2c0.4 0.133 0.8 0.267 1.2 0.4l-0.267 1.2c-0.133 0.267 0.133 0.533 0.4 0.667h0.267c0.267 0 0.533-0.133 0.533-0.4l0.267-1.2h1.467l0.267 1.2c0.133 0.267 0.267 0.4 0.533 0.4h0.133c0.267-0.133 0.533-0.4 0.4-0.667l-0.267-1.2c0.4-0.133 0.8-0.267 1.2-0.4l0.933 1.2c0.133 0.133 0.267 0.133 0.4 0.133s0.267 0 0.4-0.133c0 0 0-0.133 0.133-0.133-0.933 1.867-2.8 3.333-5.067 3.333zM20.933 18.933c0-0.133 0-0.267-0.133-0.4l-0.8-1.067c0.4-0.267 0.8-0.533 1.067-0.8 0 0.267 0 0.533 0 0.667 0.133 0.533 0 1.067-0.133 1.6z",
        onEnable: () => {},
        onDisable: () => {}
    },
    {
        id: "tabbarVertical",
        label: "垂直页签",
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
        label: "顶栏合并",
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
        label: "列表子弹线",
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
        id: "colorolder",
        label: "彩色文档树",
        cssPath: "/appearance/themes/Savor/style/topbar/color-folder.css",
        styleId: "Sv-theme-color-彩色文档树",
        attrName: "彩色文档树",
        svg: "M11.6 14.933c0-0.133 0-0.267 0-0.4 0-2.533 2-4.533 4.4-4.533s4.4 2 4.4 4.533c0 0.133 0 0.267 0 0.4 1.467 0.667 2.533 2.267 2.533 4.133 0 2.533-2 4.533-4.4 4.533-0.933 0-1.867-0.267-2.533-0.8-0.8 0.533-1.6 0.8-2.533 0.8-2.4 0-4.4-2-4.4-4.533 0-1.867 0.933-3.467 2.533-4.133zM11.867 16.267c-0.933 0.533-1.6 1.6-1.6 2.8 0 1.733 1.467 3.2 3.2 3.2 0.533 0 1.067-0.133 1.6-0.4-0.667-0.8-0.933-1.733-0.933-2.8 0-0.133 0-0.267 0-0.4-1.067-0.533-1.867-1.467-2.267-2.4v0zM15.333 18.933v0c0 1.867 1.467 3.2 3.2 3.2s3.2-1.467 3.2-3.2c0-1.2-0.667-2.267-1.6-2.8-0.667 1.6-2.267 2.8-4.133 2.8-0.267 0.133-0.4 0-0.667 0v0zM16 17.733c1.733 0 3.2-1.467 3.2-3.2s-1.467-3.2-3.2-3.2-3.2 1.467-3.2 3.2 1.467 3.2 3.2 3.2z",
        onEnable: () => {},
        onDisable: () => {}
    }
];

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
                // 执行自定义启用逻辑
                if (button.onEnable) button.onEnable();
                
                // 检查是否已存在样式元素
                let styleElement = document.getElementById(button.styleId);
                if (!styleElement) {
                    const style = window.theme.loadStyle(button.cssPath, button.styleId);
                    // 根据按钮ID设置不同的属性
                    if (button.id === "bulletThreading") {
                        style.setAttribute("bulletThreading", button.attrName);
                    } else {
                        style.setAttribute("topBarcss", button.attrName);
                    }
                }
            },
            () => {
                // 移除样式元素
                const styleElement = document.getElementById(button.styleId);
                if (styleElement) styleElement.remove();
                
                // 执行自定义禁用逻辑
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
        label: "收缩/展开插件",
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
        savorPlugins = safeCreateElement(barCommand.parentElement, "div", "savorPlugins");
        if (!savorPlugins) return;
        barCommand.parentNode.insertBefore(savorPlugins, barCommand);
    }

    // 创建所有插件按钮
    pluginButtons.forEach(button => {
        // 检查按钮是否已存在
        if (document.getElementById(button.id)) return;

        // 创建按钮
        const addButton = safeCreateElement(savorPlugins, "div");
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
        { id: "GraphView", attrName: "f", attrValue: "dt", icon: "iconFiles", label: "转换为导图" },
        { id: "TableView", attrName: "f", attrValue: "bg", icon: "iconTable", label: "转换为表格" },
        { id: "kanbanView", attrName: "f", attrValue: "kb", icon: "iconMenu", label: "转换为看板" },
        { id: "DefaultView", attrName: "f", attrValue: "", icon: "iconList", label: "恢复为列表" }
    ],
    NodeTable: [
        { id: "FixWidth", attrName: "f", attrValue: "", icon: "iconTable", label: "自动宽度(换行)" },
        { id: "AutoWidth", attrName: "f", attrValue: "auto", icon: "iconTable", label: "自动宽度(不换行)" },
        { id: "FullWidth", attrName: "f", attrValue: "full", icon: "iconTable", label: "页面宽度" },
        { separator: true },
        { id: "vHeader", attrName: "t", attrValue: "vbiaotou", icon: "iconSuper", label: "竖向表头样式" },
        { id: "Removeth", attrName: "t", attrValue: "biaotou", icon: "iconSuper", label: "空白表头样式" },
        { id: "Defaultth", attrName: "t", attrValue: "", icon: "iconSuper", label: "恢复表头样式" }
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
        <span class="b3-menu__label">视图选择</span>
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
    function safeCreateElement(parentElement, elementType, id = null) {
        if (!parentElement) {
            console.warn('父元素不存在，无法创建子元素');
            return null;
        }
        
        const element = document.createElement(elementType);
        if (id) element.id = id;
        parentElement.appendChild(element);
        return element;
    }
    
    /**
     * 向指定元素前创建插入一个元素，可选添加ID
     * @param {Element} targetElement 目标元素
     * @param {string} addElementTxt 要创建添加的元素标签
     * @param {string} setId 为创建元素设置ID
     * @returns {Element} 创建的元素
     */
    function insertCreateBefore(targetElement, addElementTxt, setId = null) {
        if (!targetElement) {
            console.error("指定元素对象不存在！");
            return null;
        }
        if (!addElementTxt) {
            console.error("未指定字符串！");
            return null;
        }

        const element = document.createElement(addElementTxt);
        if (setId) element.id = setId;
        targetElement.parentElement.insertBefore(element, targetElement);
        return element;
    }
    
    function qucuFiiter() {
        // 去除主题所有滤镜还原按钮状态
        const topicFilters = document.querySelectorAll("head [topicfilter]");
        topicFilters.forEach(element => {
            const offNo = getItem(element.getAttribute("topicfilter"));
            if (offNo == "1") {
                document.getElementById(element.getAttribute("topicfilter"))?.click();
                element.remove();
            }
        });
        
        // 清理多余的样式元素，只保留当前激活的
        const activeFilters = Array.from(document.querySelectorAll("button.button_on")).map(button => button.id);
        
        document.querySelectorAll("head [topicfilter]").forEach(element => {
            if (!activeFilters.includes(element.getAttribute("topicfilter"))) {
                element.remove();
            }
        });
    }
    
    
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
        addButton.style.display = "none";
        addButton.id = ButtonID;
        addButton.setAttribute("class", ButtonTitle + " button_off");
        addButton.setAttribute("aria-label", ButtonLabel);
        
        // 使用模板字符串简化HTML创建
        addButton.innerHTML = svgPath 
            ? `<svg class="b3-menu__icon savor-icon" viewBox="9 10 14 14" xmlns="http://www.w3.org/2000/svg">
                  <path d="${svgPath}"></path>
               </svg>
               <span class="b3-menu__label">${ButtonLabel}</span>`
            : `<svg class="b3-menu__icon"><use xlink:href="#iconTheme"></use></svg>
               <span class="b3-menu__label">${ButtonLabel}</span>`;
        
        if (svgPath) addButton.classList.add('savor-button');
        
        // 简化状态处理逻辑
        let offNo = '0';
        if (window.theme.themeMode == Mode && Memory) {
            offNo = getItem(ButtonID) || '0';
            if (offNo == "1") {
                addButton.setAttribute("class", ButtonTitle + " button_on");
            }
        }
        
        // 使用箭头函数和三元运算符简化点击处理
        addButton.addEventListener("click", () => {
            const newState = offNo == "0" ? "1" : "0";
            const newClass = newState == "1" ? "button_on" : "button_off";
            
            addButton.setAttribute("class", ButtonTitle + " " + newClass);
            window.theme.applyThemeTransition();
            
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

    function setItem(key, value) {
        window.theme.config[key] = value;
        写入文件("/data/snippets/Savor.config.json", JSON.stringify(window.theme.config, undefined, 4));
    }

    function getItem(key) {
        return window.theme.config[key] === undefined ? null : window.theme.config[key];
    }

    function removeItem(key) {
        delete window.theme.config[key];
        写入文件("/data/snippets/Savor.config.json", JSON.stringify(window.theme.config, undefined, 4));
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

    /**
     * 简单判断目前思源是否是手机模式
     * @returns {boolean} 是否为手机模式
     */
    function isPhone() {
        return !!document.getElementById("editor");
    }
    
        /**++++++++++++++++++++++++++++++++按需调用++++++++++++++++++++++++++++++ */
        获取文件("/data/snippets/Savor.config.json", (v) => {
            const funs = () => {
                setTimeout(() => {
                    if (isPhone()) {
                        window.theme.loadStyle("/appearance/themes/Savor/style/module/mobile.css");
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
                        
                        // 添加对 barMode 按钮的点击监听，仅用于生成菜单
                        const barMode = document.getElementById('barMode');
                        if (barMode) {
                            barMode.addEventListener('click', initSavorToolbar);
                        } else {
                            // 如果按钮还没加载，等待它出现
                            window.barModeObserver = new MutationObserver((mutations, obs) => {
                                const barModeBtn = document.getElementById('barMode');
                                if (barModeBtn) {
                                    barModeBtn.addEventListener('click', initSavorToolbar);
                                    obs.disconnect();
                                }
                            });
                            window.barModeObserver.observe(document.body, { childList: true, subtree: true });
                        }

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
                        }

                        // 初始化 savorToolbar 的函数，仅负责生成菜单
                        function initSavorToolbar() {
                            // 检查是否已存在
                            if (document.getElementById('savorToolbar')) return;
                            
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
                                savorToolbar = insertCreateBefore(toolbarEdit, "div", "savorToolbar");
                                savorToolbar.style.position = "relative";
                            }
                            
                            // 确保创建成功后初始化主题按钮
                            if (savorToolbar) {
                                themeButton();

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
                                { id: 'buttonsalt', cssPath: '/appearance/themes/Savor/style/theme/savor-salt.css', styleId: 'Sv-theme-color-salt' },
                                { id: 'buttonsugar', cssPath: '/appearance/themes/Savor/style/theme/savor-sugar.css', styleId: 'Sv-theme-color-sugar' },
                                { id: 'buttonforest', cssPath: '/appearance/themes/Savor/style/theme/savor-forest.css', styleId: 'Sv-theme-color-forest' },
                                { id: 'buttonflower', cssPath: '/appearance/themes/Savor/style/theme/savor-flower.css', styleId: 'Sv-theme-color-flower' },
                                { id: 'buttonwind', cssPath: '/appearance/themes/Savor/style/theme/savor-wind.css', styleId: 'Sv-theme-color-wind' }
                            ];
                            
                            lightThemes.forEach(theme => {
                                const loadState = getItem(theme.id);
                                if (loadState == '1') {
                                    const styleElement = window.theme.loadStyle(theme.cssPath, theme.styleId);
                                    if (styleElement) {
                                        styleElement.setAttribute('topicfilter', theme.id);
                                    }
                                }
                            });
                        }
                        
                        // 加载深色主题配色
                        if (themeMode == 'dark') {
                            const darkThemes = [
                                { id: 'buttonvinegar', cssPath: '/appearance/themes/Savor/style/theme/savor-vinegar.css', styleId: 'Sv-theme-color-vinegar' },
                                { id: 'buttonocean', cssPath: '/appearance/themes/Savor/style/theme/savor-ocean.css', styleId: 'Sv-theme-color-ocean' },
                                { id: 'buttonmountain', cssPath: '/appearance/themes/Savor/style/theme/savor-mountain.css', styleId: 'Sv-theme-color-mountain' }
                            ];
                            
                            darkThemes.forEach(theme => {
                                const loadState = getItem(theme.id);
                                if (loadState == '1') {
                                    const styleElement = window.theme.loadStyle(theme.cssPath, theme.styleId);
                                    if (styleElement) {
                                        styleElement.setAttribute('topicfilter', theme.id);
                                    }
                                }
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






