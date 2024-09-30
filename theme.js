window.theme = {};



/**
 * 加载样式文件
 * @params {string} href 样式地址
 * @params {string} id 样式 ID
 */
window.theme.loadStyle = function (href, id = null) {
    let style = document.createElement('link');
    if (id) style.id = id;
    style.type = 'text/css';
    style.rel = 'stylesheet';
    style.href = href;
    document.head.appendChild(style);
}

/**
 * 更新样式文件
 * @params {string} id 样式文件 ID
 * @params {string} href 样式文件地址
 */
window.theme.updateStyle = function (id, href) {
    let style = document.getElementById(id);
    if (style) {
        style.setAttribute('href', href);
    }
    else {
        window.theme.loadStyle(href, id);
    }
}

window.theme.ID_COLOR_STYLE = 'theme-color-style';

/**
 * 获取主题模式
 * @return {string} light 或 dark
 */
window.theme.themeMode = (() => {
    /* 根据浏览器主题判断颜色模式 */
    // switch (true) {
    //     case window.matchMedia('(prefers-color-scheme: light)').matches:
    //         return 'light';
    //     case window.matchMedia('(prefers-color-scheme: dark)').matches:
    //         return 'dark';
    //     default:
    //         return null;
    // }
    /* 根据配置选项判断主题 */
    switch (window.siyuan.config.appearance.mode) {
        case 0:
            return 'light';
        case 1:
            return 'dark';
        default:
            return null;
    }
})();


/**
 * 更换主题模式
 * @params {string} lightStyle 浅色主题配置文件路径
 * @params {string} darkStyle 深色主题配置文件路径
 */
window.theme.changeThemeMode = function (
    lightStyle,
    darkStyle,
) {
    let href_color = null;
    switch (window.theme.themeMode) {
        case 'light':
            href_color = lightStyle;
            break;
        case 'dark':
        default:
            href_color = darkStyle;
            break;
    }
    window.theme.updateStyle(window.theme.ID_COLOR_STYLE, href_color);
}


/* 根据当前主题模式加载样式配置文件 */
window.theme.changeThemeMode(
    `/appearance/themes/Savor/style/topbar/savor-light.css`,
    `/appearance/themes/Savor/style/topbar/savor-dark.css`,
);





/*----------------------------------创建savor主题工具栏区域----------------------------------
function createsavorToolbar() {
    var siYuanToolbar = getSiYuanToolbar();
    var savorToolbar = getsavorToolbar();
    var windowControls = document.getElementById("windowControls");
    if (savorToolbar) siYuanToolbar.removeChild(savorToolbar);
    savorToolbar = insertCreateBefore(windowControls, "div", "savorToolbar");
    savorToolbar.style.marginRight = "14px";
    savorToolbar.style.marginLeft = "11px";
}*/

  /****************************思源API操作**************************/ 
  async function 设置思源块属性(内容块id, 属性对象) {
    let url = '/api/attr/setBlockAttrs'
    return 解析响应体(向思源请求数据(url, {
        id: 内容块id,
        attrs: 属性对象,
    }))
  }
  async function 向思源请求数据(url, data) {
    let resData = null
    await fetch(url, {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            Authorization: `Token ''`,
        }
    }).then(function (response) { resData = response.json() })
    return resData
  }
  async function 解析响应体(response) {
    let r = await response
    return r.code === 0 ? r.data : null
  }
  

  /****UI****/
  function ViewSelect(selectid,selecttype){
  let button = document.createElement("button")
  button.id="viewselect"
  button.className="b3-menu__item"
  button.innerHTML='<svg class="b3-menu__icon" style="null"><use xlink:href="#iconGlobalGraph"></use></svg><span class="b3-menu__label" style="">视图选择</span><svg class="b3-menu__icon b3-menu__icon--arrow" style="null"><use xlink:href="#iconRight"></use></svg></button>'
  button.appendChild(SubMenu(selectid,selecttype))
  return button
}
function SubMenu(selectid,selecttype){
  let button = document.createElement("button")
  button.id="viewselectSub"
  button.className="b3-menu__submenu"
  button.appendChild(MenuItems(selectid,selecttype))
  return button
}

  function MenuItems(selectid,selecttype,className = 'b3-menu__items'){
  let node = document.createElement('div');
  node.className = className;
  if(selecttype=="NodeList"){
    node.appendChild(GraphView(selectid))
    node.appendChild(TableView(selectid))
	node.appendChild(kanbanView(selectid))
    node.appendChild(DefaultView(selectid))
  }
  if(selecttype=="NodeTable"){
    node.appendChild(FixWidth(selectid))
    node.appendChild(AutoWidth(selectid))
	node.appendChild(FullWidth(selectid))
	node.appendChild(vHeader(selectid))
	node.appendChild(Removeth(selectid))
	node.appendChild(Defaultth(selectid))
  }
return node;
}

function GraphView(selectid){
  let button = document.createElement("button")
  button.className="b3-menu__item"
  button.setAttribute("data-node-id",selectid)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value","dt")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconFiles"></use></svg><span class="b3-menu__label">转换为导图</span>`
  button.onclick=ViewMonitor
  return button
}
function TableView(selectid){
  let button = document.createElement("button")
  button.className="b3-menu__item"
  button.setAttribute("data-node-id",selectid)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value","bg")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">转换为表格</span>`
  button.onclick=ViewMonitor
  return button
}
function kanbanView(selectid){
  let button = document.createElement("button")
  button.className="b3-menu__item"
  button.setAttribute("data-node-id",selectid)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value","kb")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconMenu"></use></svg><span class="b3-menu__label">转换为看板</span>`
  button.onclick=ViewMonitor
  return button
}
function DefaultView(selectid){
  let button = document.createElement("button")
  button.className="b3-menu__item"
  button.onclick=ViewMonitor
  button.setAttribute("data-node-id",selectid)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value",'')

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconList"></use></svg><span class="b3-menu__label">恢复为列表</span>`
  return button
}
function FixWidth(selectid){
  let button = document.createElement("button")
  button.className="b3-menu__item"
  button.onclick=ViewMonitor
  button.setAttribute("data-node-id",selectid)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value","")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">自动宽度(换行)</span>`
  return button
}
function AutoWidth(selectid){
  let button = document.createElement("button")
  button.className="b3-menu__item"
  button.setAttribute("data-node-id",selectid)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value","auto")
  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">自动宽度(不换行)</span>`
  button.onclick=ViewMonitor
  return button
}
function FullWidth(selectid){
  let button = document.createElement("button")
  button.className="b3-menu__item"
  button.onclick=ViewMonitor
  button.setAttribute("data-node-id",selectid)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value","full")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">页面宽度</span>`
  return button
}
function vHeader(selectid){
  let button = document.createElement("button")
  button.className="b3-menu__item"
  button.onclick=ViewMonitor
  button.setAttribute("data-node-id",selectid)
  button.setAttribute("custom-attr-name","t")
  button.setAttribute("custom-attr-value","vbiaotou")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconSuper"></use></svg><span class="b3-menu__label">竖向表头样式</span>`
  return button
}
function Removeth(selectid){
  let button = document.createElement("button")
  button.className="b3-menu__item"
  button.onclick=ViewMonitor
  button.setAttribute("data-node-id",selectid)
  button.setAttribute("custom-attr-name","t")
  button.setAttribute("custom-attr-value","biaotou")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconSuper"></use></svg><span class="b3-menu__label">空白表头样式</span>`
  return button
}
function Defaultth(selectid){
  let button = document.createElement("button")
  button.className="b3-menu__item"
  button.setAttribute("data-node-id",selectid)
  button.setAttribute("custom-attr-name","t")
  button.setAttribute("custom-attr-value","")
  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconSuper"></use></svg><span class="b3-menu__label">恢复表头样式</span>`
  button.onclick=ViewMonitor
  return button
}
function MenuSeparator(className = 'b3-menu__separator') {
  let node = document.createElement('button');
  node.className = className;
  return node;
}

/* 操作 */ 

/**
 * 获得所选择的块对应的块 ID
 * @returns {string} 块 ID
 * @returns {
 *     id: string, // 块 ID
 *     type: string, // 块类型
 *     subtype: string, // 块子类型(若没有则为 null)
 * }
 * @returns {null} 没有找到块 ID */
function getBlockSelected() {
    let node_list = document.querySelectorAll('.protyle-wysiwyg--select');
    if (node_list.length === 1 && node_list[0].dataset.nodeId != null) return {
        id: node_list[0].dataset.nodeId,
        type: node_list[0].dataset.type,
        subtype: node_list[0].dataset.subtype,
    };
    return null;
}

function ClickMonitor () {
  window.addEventListener('mouseup', MenuShow)
}

function MenuShow() {
  setTimeout(() => {
    let selectinfo = getBlockSelected()
      if(selectinfo){
      let selecttype = selectinfo.type
      let selectid = selectinfo.id
      if(selecttype=="NodeList"||selecttype=="NodeTable"){
        setTimeout(()=>InsertMenuItem(selectid,selecttype), 0)
      }
    }
  }, 0);
}


function InsertMenuItem(selectid,selecttype){
  let commonMenu = document.querySelector("#commonMenu .b3-menu__items")
  let  readonly = commonMenu.querySelector('[data-id="updateAndCreatedAt"]')
  let  selectview = commonMenu.querySelector('[id="viewselect"]')
  if(readonly){
    if(!selectview){
    commonMenu.insertBefore(ViewSelect(selectid,selecttype),readonly)
    commonMenu.insertBefore(MenuSeparator(),readonly)
    }
  }
}

function ViewMonitor(event){
  let id = event.currentTarget.getAttribute("data-node-id")
  let attrName = 'custom-'+event.currentTarget.getAttribute("custom-attr-name")
  let attrValue = event.currentTarget.getAttribute("custom-attr-value")
  let blocks = document.querySelectorAll(`.protyle-wysiwyg [data-node-id="${id}"]`)
  if(blocks){
    blocks.forEach(block=>block.setAttribute(attrName,attrValue))
  }
  let attrs={}
    attrs[attrName] =attrValue
  设置思源块属性(id,attrs)
}

setTimeout(()=>ClickMonitor(),1000)




















/**---------------------------------------------------------主题-------------------------------------------------------------- */

function themeButton() {
	savorThemeToolbarAddButton(
        "buttonSavor-light",
        "toolbar__item b3-tooltips b3-tooltips__sw",
		"Light 配色",
		'light',
        () => {
            loadStyle("/appearance/themes/Savor/style/topbar/savor-light.css", "theme-color-style-Savor-light").setAttribute("topicfilter", "buttonSavor-light");
            qucuFiiter();
        },
        () => {
            document.getElementById("theme-color-style-Savor-light").remove();
        },
        true
    );
		savorThemeToolbarAddButton(
        "buttonsalt",
        "toolbar__item b3-tooltips b3-tooltips__sw",
		"Salt 配色",
		'light',
        () => {
            loadStyle("/appearance/themes/Savor/style/topbar/salt.css", "theme-color-style-salt主题").setAttribute("topicfilter", "buttonsalt");
            qucuFiiter();
        },
        () => {
            document.getElementById("theme-color-style-salt主题").remove();
        },
        true
    );
		savorThemeToolbarAddButton(
        "buttonsugar",
        "toolbar__item b3-tooltips b3-tooltips__sw",
		"Sugar 配色",
		'light',
        () => {
            loadStyle("/appearance/themes/Savor/style/topbar/sugar.css", "theme-color-style-sugar主题").setAttribute("topicfilter", "buttonsugar");
            qucuFiiter();
        },
        () => {
            document.getElementById("theme-color-style-sugar主题").remove();
        },
        true
    );
		savorThemeToolbarAddButton(
        "buttonSavor-dark",
        "toolbar__item b3-tooltips b3-tooltips__sw",
		"Dark 配色",
		'dark',
        () => {
            loadStyle("/appearance/themes/Savor/style/topbar/savor-dark.css", "theme-color-style-Savor-dark").setAttribute("topicfilter", "buttonSavor-dark");
            qucuFiiter();
        },
        () => {
            document.getElementById("theme-color-style-Savor-dark").remove();
        },
        true
    );
	    savorThemeToolbarAddButton(
        "buttonvinegar",
        "toolbar__item b3-tooltips b3-tooltips__sw",
		"Vinegar 配色",
		'dark',
        () => {
            loadStyle("/appearance/themes/Savor/style/topbar/vinegar.css", "theme-color-style-vinegar主题").setAttribute("topicfilter", "buttonvinegar");
            qucuFiiter();
        },
        () => {
            document.getElementById("theme-color-style-vinegar主题").remove();
        },
        true
    );
}

/**---------------------------------------------------------挖空-------------------------------------------------------------- */

function concealMarkButton() {
    savorThemeToolplusAddButton(
        "conceal",
        "toolbar__item b3-tooltips b3-tooltips__sw",
		"挖空",
        () => {
            loadStyle("/appearance/themes/Savor/style/topbar/conceal-mark.css", "theme-color-style-conceal挖空").setAttribute("topBarcss", "conceal挖空");
        },
        () => {
            document.getElementById("theme-color-style-conceal挖空").remove();
        },
        true
    );
}
/**---------------------------------------------------------垂直-------------------------------------------------------------- */

function tabbarVerticalButton() {
    savorThemeToolplusAddButton(
        "tabbarVertical",
        "toolbar__item b3-tooltips b3-tooltips__sw",
		"垂直页签",
        () => {
            loadStyle("/appearance/themes/Savor/style/topbar/tab-bar-vertical.css", "theme-color-style-tabbar垂直").setAttribute("topBarcss", "tabbar垂直");
        },
        () => {
            document.getElementById("theme-color-style-tabbar垂直").remove();
        },
        true
    );
}

/**---------------------------------------------------------插件-------------------------------------------------------------- */

function SpluginButton() {
    savorPluginsAddButton(
        "Splugin",
        "toolbar__item b3-tooltips b3-tooltips__sw",
		"收缩/展开插件",
        () => {
            loadStyle("/appearance/themes/Savor/style/topbar/Splugin.css", "theme-color-style-plugin隐藏").setAttribute("Splugin", "plugin隐藏");
        },
        () => {
            document.getElementById("theme-color-style-plugin隐藏").remove();
        },
        true
    );
}
/**---------------------------------------------------------顶栏-------------------------------------------------------------- */

function topbarfixedButton() {
    savorThemeToolplusAddButton(
        "topBar",
        "toolbar__item b3-tooltips b3-tooltips__sw",
		"顶栏合并",
        () => {
            loadStyle("/appearance/themes/Savor/style/topbar/top-fixed.css", "theme-color-style-topbar隐藏").setAttribute("topBarcss", "topbar隐藏");
        },
        () => {
            document.getElementById("theme-color-style-topbar隐藏").remove();
        },
        true
    );
}
/**---------------------------------------------------------子弹-------------------------------------------------------------- */

function bulletThreading() {
    savorThemeToolplusAddButton(
        "bulletThreading",
        "toolbar__item b3-tooltips b3-tooltips__sw",
		"列表子弹线",
        () => {
            loadStyle("/appearance/themes/Savor/style/topbar/bullet-threading.css", "theme-color-style-列表子弹线").setAttribute("bulletThreading", "列表子弹线");
        },
        () => {
            document.getElementById("theme-color-style-列表子弹线").remove();
        },
        true
    );
}
//去除主题所有滤镜还原按钮状态
function qucuFiiter() {
    var Topicfilters = document.querySelectorAll("head [topicfilter]");
    Topicfilters.forEach(element => {
        var offNo = getItem(element.getAttribute("topicfilter"));
        if (offNo == "1") {
            document.getElementById(element.getAttribute("topicfilter")).click();
            element.remove();
        }
    });
}																		






/**----------------------------------列表折叠内容预览查看---------------------------------- */
function collapsedListPreview() {
    BodyEventRunFun("mouseover", collapsedListPreviewEvent, 3000)
}



function collapsedListPreviewEvent() {
    var _turn = [...document.querySelectorAll(".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [data-node-id].li[fold='1']"),
    ...document.querySelectorAll("[data-oid] [data-node-id].li[fold='1']"),
    ...document.querySelectorAll("#searchPreview [data-node-id].li[fold='1']")];//查询页面所有的折叠列表
    var turn = [];
    for (let index = 0; index < _turn.length; index++) {//找到列表第一列表项（父项）
        const element = _turn[index].children[1];
        var item = element.className;
        if (item == "p" || item == "h1" || item == "h2" || item == "h3" || item == "h4" || item == "h5" || item == "h6") {
            turn.push(element.children[0])
        }
    }

    //检查注册事件的折叠列表是否恢复未折叠状态,是清除事件和去除标志属性
    var ListPreview = [...document.querySelectorAll(".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [ListPreview]"),
    ...document.querySelectorAll("[data-oid] [ListPreview]"),
    ...document.querySelectorAll("#searchPreview [ListPreview]")];
    for (let index = 0; index < ListPreview.length; index++) {
        const element = ListPreview[index];
        var fold = element.parentElement.getAttribute("fold")

        if (fold == null || fold == 0) {
            element.removeAttribute("ListPreview");
            var item = element.children[0];
            myRemoveEvent(item, "mouseenter", LIstIn);//解绑鼠标进入
            myRemoveEvent(item.parentElement.parentElement, "mouseleave", LIstout);//解绑鼠标离开

            items = Array.from(item.parentElement.parentElement.children);
            for (let index = 0; index < items.length; index++) {
                const element = items[index];
                if (element.getAttribute("triggerBlock") != null) {
                    element.remove();
                }
            }
        }
    }

    for (let index = 0; index < turn.length; index++) {//重新注册、筛选未注册鼠标事件折叠列表
        const element = turn[index];
        var elementPP = element.parentElement.parentElement;

        if (element.parentElement.getAttribute("ListPreview") != null) {
            myRemoveEvent(element, "mouseenter", LIstIn);//解绑鼠标进入
            myRemoveEvent(elementPP, "mouseleave", LIstout);//解绑鼠标离开

            AddEvent(element, "mouseenter", LIstIn);//注册鼠标进入
            AddEvent(elementPP, "mouseleave", LIstout);//注册鼠标离开
        } else {
            element.parentElement.setAttribute("ListPreview", true);
            AddEvent(element, "mouseenter", LIstIn);//注册鼠标进入
            AddEvent(elementPP, "mouseleave", LIstout);//注册鼠标离开
        }
    }
}

var flag22 = false;

function LIstout(e) {
    items = Array.from(e.target.children);
    flag22 = false;
    for (let index = 0; index < items.length; index++) {
        const element = items[index];
        if (element.getAttribute("triggerBlock") != null) {
            element.remove();
        }
    }
}

function LIstIns(e) {

    var id = setInterval(() => {

        if (!flag22) {
            clearInterval(id);
            return;
        }

        var obj = e.target;

        var timeDiv = addinsertCreateElement(obj, "div");
        timeDiv.style.display = "inline-block";
        timeDiv.style.width = "0px";
        timeDiv.style.height = "16px";

        var X = timeDiv.offsetLeft;
        var Y = timeDiv.offsetTop;
        timeDiv.remove();

        var item = obj.parentElement.parentElement;
        if (item == null) return;
        items = item.children
        var itemobj = items[items.length - 1];
        if (itemobj != null && itemobj.getAttribute("triggerBlock") != null) {

            var items1 = items[items.length - 1];
            items1.style.top = (Y + 35) + "px";
            items1.style.left = (obj.offsetLeft + 35) + "px";
            var items2 = items[items.length - 2];
            items2.style.top = (Y + 2) + "px";
            items2.style.left = (X + 45) + "px";
            return;
        }

    }, 500);
}

function LIstIn(e) {
    flag22 = true;

    var obj = e.target;
    var timeDiv = addinsertCreateElement(obj, "div");
    timeDiv.style.display = "inline-block";
    timeDiv.style.width = "0px";
    timeDiv.style.height = "16px";

    var X = timeDiv.offsetLeft;
    var Y = timeDiv.offsetTop;
    timeDiv.remove();

    var f = obj.parentElement.parentElement;
    if (!f) return;
    items = f.children;

    var itemobj = items[items.length - 1];
    if (itemobj != null && itemobj.getAttribute("triggerBlock") != null) return;

    var triggerBlock1 = CreatetriggerBlock(e)//创建触发块1
    //设置触发块样式，将触发块显示在〔 ··· 〕第二行位置
    triggerBlock1.style.top = (Y + 35) + "px";
    triggerBlock1.style.left = (obj.offsetLeft + 35) + "px";
    AddEvent(triggerBlock1, "mouseenter", () => {
        //一秒延时后搜索打开的悬浮窗，将悬浮窗中的列表展开,重复检查三次
        setTimeout(Suspended, 1000)
    });//注册鼠标进入

    var triggerBlock2 = CreatetriggerBlock(e)//创建触发块2
    //设置触发块样式，将触发块显示在〔 ··· 〕位置
    triggerBlock2.style.top = (Y + 2) + "px";
    triggerBlock2.style.left = (X + 45) + "px";

    AddEvent(triggerBlock2, "mouseenter", () => {
        //一秒延时后搜索打开的悬浮窗，将悬浮窗中的列表展开,重复检查三次
        setTimeout(Suspended, 1000)
    });//注册鼠标进入

    //一秒延时后搜索打开的悬浮窗，将悬浮窗中的列表展开,重复检查三次
    var previewID = obj.parentElement.parentElement.getAttribute("data-node-id");
    var jisu = 0;
    function Suspended() {
        jisu++;
        var y = false;
        if (jisu == 3) return
        var Sd = document.querySelectorAll("[data-oid]");
        if (Sd.length >= 1) { //如果找到那么就将悬浮窗中列表展开
            for (let index = 0; index < Sd.length; index++) {
                const element = Sd[index];
                var item = element.children[1].children[0].children[1].children[0].children[0];
                if (item == null) continue;
                if (item.getAttribute("data-node-id") == previewID) {
                    item.setAttribute("fold", 0);
                    y = true;
                }
            }
        }
        if (!y) { setTimeout(Suspended, 800) }
    }
    LIstIns(e);
}

function CreatetriggerBlock(e) {
    var objParent = e.target.parentElement;
    var triggerBlock = addinsertCreateElement(objParent.parentElement, "div");//创建触发块
    //设置触发块样式，将触发块显示在〔 ··· 〕位置
    triggerBlock.setAttribute("triggerBlock", true);
    triggerBlock.style.position = "absolute";
    triggerBlock.style.width = "20px";
    triggerBlock.style.height = "15px";
    //triggerBlock.style.background="red";
    triggerBlock.style.display = "flex";
    triggerBlock.style.zIndex = "999";
    triggerBlock.style.cursor = "pointer";
    triggerBlock.style.WebkitUserModify = "read-only";
    triggerBlock.setAttribute("contenteditable", "false");
    triggerBlock.innerHTML = "&#8203";

    //获取折叠列表ID,设置悬浮窗
    //protyle-wysiwyg__embed data-id
    var previewID = objParent.parentElement.getAttribute("data-node-id");
    triggerBlock.setAttribute("class", "protyle-attr");
    triggerBlock.style.backgroundColor = "transparent";
    //在触发块内创建思源超链接 
    triggerBlock.innerHTML = "<span data-type='a' class='list-A' data-href=siyuan://blocks/" + previewID + ">####</span>";
    //将这个思源连接样式隐藏
    var a = triggerBlock.children[0];
    a.style.fontSize = "15px";
    a.style.lineHeight = "15px";
    a.style.color = "transparent";
    a.style.textShadow = "none";
    a.style.border = "none";
    return triggerBlock;
}




/**----------------鼠标中键标题、列表文本折叠/展开----------------*/
function collapseExpand_Head_List() {
    var flag45 = false;
    AddEvent(document.body, "mouseup", () => {
        flag45 = false;
    });

    AddEvent(document.body, "mousedown", (e) => {
        if (e.button == 2) { flag45 = true; return }
        if (flag45 || e.shiftKey || e.altKey || e.button != 1) return;
        var target = e.target;

        if (target.getAttribute("contenteditable") == null) {
            isFatherFather(target, (v) => {
                if (v.getAttribute("contenteditable") != null) {
                    target = v;
                    return true;
                }
                return false;
            }, 10);
        }

        var targetParentElement = target.parentElement;
        if (targetParentElement == null) return;

        //是标题吗？
        if (targetParentElement != null && targetParentElement.getAttribute("data-type") == "NodeHeading") {

            var targetParentElementParentElement = targetParentElement.parentElement;
            //标题父元素是列表吗？
            if (targetParentElementParentElement != null && targetParentElementParentElement.getAttribute("data-type") == "NodeListItem") {
                e.preventDefault();
                //列表项实现折叠
                _collapseExpand_NodeListItem(target);
            } else {
                e.preventDefault();
                //标题块标项实现折叠
                _collapseExpand_NodeHeading(target);
            }
        } else {//是列表
            var targetParentElementParentElement = targetParentElement.parentElement;
            if (targetParentElementParentElement != null && targetParentElementParentElement.getAttribute("data-type") == "NodeListItem") {
                e.preventDefault();
                //列表项实现折叠
                _collapseExpand_NodeListItem(target);
            }
        }
    });

    //标题，块标实现折叠
    function _collapseExpand_NodeHeading(element) {

        var i = 0;
        while (element.className != "protyle" && element.className != "fn__flex-1 protyle" && element.className != "block__edit fn__flex-1 protyle" && element.className != "fn__flex-1 spread-search__preview protyle") {
            if (i == 999) return;
            i++;
            element = element.parentElement;
        }
        var ddddd = element.children;
        for (let index = ddddd.length - 1; index >= 0; index--) {
            const element = ddddd[index];
            if (element.className == "protyle-gutters") {
                var fold = diguiTooONE_1(element, (v) => { return v.getAttribute("data-type") === "fold"; })
                if (fold != null) fold.click();
                return;
            }
        }
    }

    //列表，列表项实现折叠
    function _collapseExpand_NodeListItem(element) {

        //在悬浮窗中第一个折叠元素吗？
        var SiyuanFloatingWindow = isSiyuanFloatingWindow(element);
        if (SiyuanFloatingWindow) {
            var vs = isFatherFather(element, (v) => v.classList.contains("li"), 7);
            if (vs != null && (vs.previousElementSibling == null)) {
                var foid = vs.getAttribute("fold");
                if (foid == null || foid == "0") {//判断是折叠
                    vs.setAttribute("fold", "1");
                } else {
                    vs.setAttribute("fold", "0");
                }
                return;
            }
        }


        var i = 0;
        while (element.getAttribute("contenteditable") == null) {
            if (i == 999) return;
            i++;
            element = element.parentElement;
        }
        var elementParentElement = element.parentElement.parentElement;

        var fold = elementParentElement.getAttribute("fold");

        if (elementParentElement.children.length == 3) return;

        if (fold == null || fold == "0") {
            setBlockfold_1(elementParentElement.getAttribute("data-node-id"));
        } else {
            setBlockfold_0(elementParentElement.getAttribute("data-node-id"));
        }
    }
}

/**
 * 
 * @param {*} element 元素是否在思源悬浮窗中
 * @returns 是返回悬浮窗元素，否返回null
 */
function isSiyuanFloatingWindow(element) {
    return isFatherFather(element, (v) => {
        if (v.getAttribute("data-oid") != null) {
            return true;
        }
        return false;
    });
}



















//+++++++++++++++++++++++++++++++++思源API++++++++++++++++++++++++++++++++++++
//思源官方API文档  https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md

/**
 * 
 * @param {*} 内容块id 
 * @param {*} 回调函数 
 * @param {*} 传递对象 
 */
async function 根据ID获取人类可读路径(内容块id, then, obj = null) {
    await 向思源请求数据('/api/filetree/getHPathByID', {
        id: 内容块id
    }).then((v) => then(v.data, obj))
}

async function 以id获取文档聚焦内容(id, then, obj = null) {
    await 向思源请求数据('/api/filetree/getDoc', {
        id: id,
        k: "",
        mode: 0,
        size: 36,
    }).then((v) => then(v.data, obj))
}

async function 更新块(id, dataType, data, then = null, obj = null) {
    await 向思源请求数据('/api/block/updateBlock', {
        id: id,
        dataType: dataType,
        data: data,
    }).then((v) => {
        if (then) then(v.data, obj);
    })
}

async function 设置思源块属性(内容块id, 属性对象) {
    let url = '/api/attr/setBlockAttrs'
    return 解析响应体(向思源请求数据(url, {
        id: 内容块id,
        attrs: 属性对象,
    }))
}

async function 获取块属性(内容块id, then = null, obj = null) {
    let url = '/api/attr/getBlockAttrs'
    return 向思源请求数据(url, {
        id: 内容块id
    }).then((v) => {
        if (then) then(v.data, obj);
    })
}

async function 向思源请求数据(url, data) {
    const response = await fetch(url, {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            Authorization: `Token ''`,
        }
    });
    if (response.status === 200)
        return await response.json();
    else return null;
}

async function 解析响应体(response) {
    let r = await response
    return r.code === 0 ? r.data : null
}


async function 获取文件(path, then = null, obj = null) {
    let url = '/api/file/getFile';
    await 向思源请求数据(url, {
        path: path
    }).then((v) => {
        if (then) then(v, obj);
    });
}

async function 写入文件(path, filedata, then = null, obj = null, isDir = false, modTime = Date.now()) {

    let blob = new Blob([filedata]);
    let file = new File([blob], path.split('/').pop());
    let formdata = new FormData();
    formdata.append("path", path);
    formdata.append("file", file);
    formdata.append("isDir", isDir);
    formdata.append("modTime", modTime);
    await fetch(
        "/api/file/putFile", {
        body: formdata,
        method: "POST",
        headers: {
            Authorization: `Token ""`,
        },
    }).then((v) => {
        setTimeout(() => {
            if (then) then(obj);
        }, 200)
    });
}
//添加空白div//
var savordragElement = document.createElement("div");
savordragElement.id = "savordrag";
var barForwardElement = document.getElementById("barForward");
if (barForwardElement !== null) {
    var parentElement = barForwardElement.parentNode;
    parentElement.insertBefore(savordragElement, barForwardElement.nextSibling);
    // 进行其他操作
} else {
    console.error("元素不存在");
}
savordragElement.style.cssText = "flex: 1; app-region: drag;"; 



//+++++++++++++++++++++++++++++++++辅助API++++++++++++++++++++++++++++++++++++


/**
 * 方便为主题功能添加开关按钮，并选择是否拥有记忆状态
 * @param {*} ButtonID 按钮ID。
 * @param {*} ButtonTitle 按钮作用提示文字。
 * @param {*} NoButtonSvg 按钮激活Svg图标路径
 * @param {*} OffButtonSvg 按钮未激活Svg图标路径
 * @param {*} NoClickRunFun 按钮开启执行函数
 * @param {*} OffClickRunFun 按钮关闭执行函数
 * @param {*} Memory 是否设置记忆状态 true为是留空或false为不设置记忆状态。
 */
function savorThemeToolbarAddButton(ButtonID, ButtonTitle , ButtonLabel, Mode, NoClickRunFun, OffClickRunFun, Memory) {
    var savorToolbar = document.getElementById("savorToolbar");
    if (savorToolbar == null) {
        var toolbarEdit = document.getElementById("toolbarEdit");
        var windowControls = document.getElementById("windowControls");

        if (toolbarEdit == null && barBack != null) {
            savorToolbar = document.createElement("div");
            savorToolbar.id = "savorToolbar";
            windowControls.parentElement.insertBefore(savorToolbar, windowControls);
        } else if (toolbarEdit != null) {
            savorToolbar = insertCreateBefore(toolbarEdit, "div", "savorToolbar");
            savorToolbar.style.position = "relative";
        }
    }

    var addButton = addinsertCreateElement(savorToolbar, "div");
    addButton.style.float = "top";


    
    addButton.id = ButtonID;
	addButton.setAttribute("class", ButtonTitle + " button_off");
	addButton.setAttribute("aria-label", ButtonLabel)
	

    if (window.theme.themeMode == Mode) {
        var offNo = '0';


        
        // 如果主题是暗色主题，默认选中样式
        if (Mode == 'dark'){
            if (Memory == true) {
			offNo = getItem(ButtonID);
			if (offNo == "1") {
				addButton.setAttribute("class", ButtonTitle + " button_on");
				setItem(ButtonID, "0");
				NoClickRunFun(addButton);
				setItem(ButtonID, "1");
			} else if (offNo != "0") {
				offNo = "0";
				setItem(ButtonID, "0");
			}
    }

    AddEvent(addButton, "click", () => {

        if (offNo == "0") {
			addButton.setAttribute("class", ButtonTitle + " button_on");
            NoClickRunFun(addButton);
            if (Memory != null) setItem(ButtonID, "1");
            offNo = "1";
            return;
        }

        if (offNo == "1") {
			addButton.setAttribute("class", ButtonTitle + " button_off");
            OffClickRunFun(addButton);
            if (Memory != null) setItem(ButtonID, "0");
            offNo = "0";
            return;
        }
    });
        } else {
    if (Memory == true) {
        offNo = getItem(ButtonID);
        if (offNo == "1") {
			addButton.setAttribute("class", ButtonTitle + " button_on");
            setItem(ButtonID, "0");
            NoClickRunFun(addButton);
            setItem(ButtonID, "1");
        } else if (offNo != "0") {
            offNo = "0";
            setItem(ButtonID, "0");
        }
    }

    AddEvent(addButton, "click", () => {

        if (offNo == "0") {
			addButton.setAttribute("class", ButtonTitle + " button_on");
            NoClickRunFun(addButton);
            if (Memory != null) setItem(ButtonID, "1");
            offNo = "1";
            return;
        }

        if (offNo == "1") {
			addButton.setAttribute("class", ButtonTitle + " button_off");
            OffClickRunFun(addButton);
            if (Memory != null) setItem(ButtonID, "0");
            offNo = "0";
            return;
        }
    })
   }
    }

}


function savorThemeToolplusAddButton(ButtonID, ButtonTitle, ButtonLabel, NoClickRunFun, OffClickRunFun, Memory) {
    var savorToolplus = document.getElementById("savorToolbar");
    if (savorToolplus == null) {
        var toolbarEdit = document.getElementById("toolbarEdit");
        var windowControls = document.getElementById("windowControls");

        if (toolbarEdit == null && windowControls != null) {
            savorToolplus = document.createElement("div");
            savorToolplus.id = "savorToolbar";
            windowControls.parentElement.insertBefore(savorToolplus, windowControls);
        } else if (toolbarEdit != null) {
            savorToolplus = insertCreateBefore(toolbarEdit, "div", "savorToolbar");
            savorToolplus.style.position = "relative";
        }
    }

    var addButton = addinsertCreateElement(savorToolbar, "div");
    addButton.style.float = "top";


    
    addButton.id = ButtonID;
	addButton.setAttribute("class", ButtonTitle + " button_off");
	addButton.setAttribute("aria-label", ButtonLabel)
	

	var offNo = '0';


    if (Memory == true) {
        offNo = getItem(ButtonID);
        if (offNo == "1") {
			addButton.setAttribute("class", ButtonTitle + " button_on");
            setItem(ButtonID, "0");
            NoClickRunFun(addButton);
            setItem(ButtonID, "1");
        } else if (offNo != "0") {
            offNo = "0";
            setItem(ButtonID, "0");
        }
    }

    AddEvent(addButton, "click", () => {

        if (offNo == "0") {
			addButton.setAttribute("class", ButtonTitle + " button_on");
            NoClickRunFun(addButton);
            if (Memory != null) setItem(ButtonID, "1");
            offNo = "1";
            return;
        }

        if (offNo == "1") {
			addButton.setAttribute("class", ButtonTitle + " button_off");
            OffClickRunFun(addButton);
            if (Memory != null) setItem(ButtonID, "0");
            offNo = "0";
            return;
        }
    })

}

function savorPluginsAddButton(ButtonID, ButtonTitle, ButtonLabel, NoClickRunFun, OffClickRunFun, Memory) {
    var savorPlugins = document.getElementById("savorPlugins");
    if (savorPlugins == null) {
        var toolbarEdit = document.getElementById("toolbarEdit");
        var barPlugins = document.getElementById("barPlugins");

        if (toolbarEdit == null && barPlugins != null) {
            savorPlugins = document.createElement("div");
            savorPlugins.id = "savorPlugins";
            barPlugins.parentElement.insertBefore(savorPlugins, barPlugins);
        } else if (toolbarEdit != null) {
            savorPlugins = insertCreateBefore(toolbarEdit, "div", "savorPlugins");
            savorPlugins.style.position = "relative";
        }
    }

    var addButton = addinsertCreateElement(savorPlugins, "div");
    addButton.style.float = "top";


    
    addButton.id = ButtonID;
	addButton.setAttribute("class", ButtonTitle + " button_off");
	addButton.setAttribute("aria-label", ButtonLabel)
	

	var offNo = '0';


    if (Memory == true) {
        offNo = getItem(ButtonID);
        if (offNo == "1") {
			addButton.setAttribute("class", ButtonTitle + " button_on");
            setItem(ButtonID, "0");
            NoClickRunFun(addButton);
            setItem(ButtonID, "1");
        } else if (offNo != "0") {
            offNo = "0";
            setItem(ButtonID, "0");
        }
    }

    AddEvent(addButton, "click", () => {

        if (offNo == "0") {
			addButton.setAttribute("class", ButtonTitle + " button_on");
            NoClickRunFun(addButton);
            if (Memory != null) setItem(ButtonID, "1");
            offNo = "1";
            return;
        }

        if (offNo == "1") {
			addButton.setAttribute("class", ButtonTitle + " button_off");
            OffClickRunFun(addButton);
            if (Memory != null) setItem(ButtonID, "0");
            offNo = "0";
            return;
        }
    })

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
 * 在DIV光标位置插入内容
 * @param {*} content 
 */
function insertContent(content) {
    if (content) {
        var sel = window.getSelection();
        if (sel.rangeCount > 0) {
            var range = sel.getRangeAt(0); //获取选择范围
            range.deleteContents(); //删除选中的内容
            var el = document.createElement("div"); //创建一个空的div外壳
            el.innerHTML = content; //设置div内容为我们想要插入的内容。
            var frag = document.createDocumentFragment(); //创建一个空白的文档片段，便于之后插入dom树
            var node = el.firstChild;
            var lastNode = frag.appendChild(node);
            range.insertNode(frag); //设置选择范围的内容为插入的内容
            var contentRange = range.cloneRange(); //克隆选区

            contentRange.setStartAfter(lastNode); //设置光标位置为插入内容的末尾
            contentRange.collapse(true); //移动光标位置到末尾
            sel.removeAllRanges(); //移出所有选区
            sel.addRange(contentRange); //添加修改后的选区

        }
    }
}


/**
 * 获取DIV文本光标位置
 * @param {*} element 
 * @returns 
 */
function getPosition(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        //谷歌、火狐
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = sel.getRangeAt(0);
            var preCaretRange = range.cloneRange(); //克隆一个选区
            preCaretRange.selectNodeContents(element); //设置选区的节点内容为当前节点
            preCaretRange.setEnd(range.endContainer, range.endOffset); //重置选中区域的结束位置
            caretOffset = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        //IE
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
};
/**
 * 在指定DIV索引位置设置光标
 * @param {*} element 
 * @param {*} index 
 */
function setCursor(element, index) {
    var codeEl = element.firstChild;
    var selection = window.getSelection();
    // 创建新的光标对象
    let range = selection.getRangeAt(0);
    // 光标对象的范围界定为新建的代码节点
    range.selectNodeContents(codeEl)
    // 光标位置定位在代码节点的最大长度
    // console.log(codeEl.length);
    range.setStart(codeEl, index);
    // 使光标开始和光标结束重叠
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
}


/**
 * 获得文本的占用的宽度
 * @param {*} text 字符串文班
 * @param {*} font 文本字体的样式
 * @returns 
 */
function getTextWidth(text, font) {
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

/**
 * 触发元素的事件
 * @param {触发元素事件} type 
 * @param {*} element 
 * @param {*} detail 
 */
function trigger(type, element) {
    var customEvent = new Event(type, { bubbles: false, cancelable: true });
    element.dispatchEvent(customEvent);
}

/**
 * 向body注入新style覆盖原本的css
 * @param {css文本字符串} csstxt 
 */
function injectionCss(csstxt) {
    var styleElement = document.createElement('style');

    styleElement.innerText = t;

    document.body.appendChild(styleElement);
};

/**
 * 向指定父级创建追加一个子元素，并可选添加ID,
 * @param {Element} fatherElement 
 * @param {string} addElementTxt 要创建添加的元素标签
 * @param {string} setId 
 * @returns addElementObject
 */
function addinsertCreateElement(fatherElement, addElementTxt, setId = null) {
    if (!fatherElement) console.error("指定元素对象不存在！");
    if (!addElementTxt) console.error("未指定字符串！");

    var element = document.createElement(addElementTxt);

    if (setId) element.id = setId;

    fatherElement.appendChild(element);

    return element;
}


/**
 * 向指定元素后创建插入一个元素，可选添加ID
 * @param {*} targetElement 目标元素
 * @param {*} addElementTxt 要创建添加的元素标签
 * @param {*} setId 为创建元素设置ID
 */
function insertCreateAfter(targetElement, addElementTxt, setId = null) {

    if (!targetElement) console.error("指定元素对象不存在！");
    if (!addElementTxt) console.error("未指定字符串！");

    var element = document.createElement(addElementTxt);

    if (setId) element.id = setId;

    var parent = targetElement.parentNode;//得到父节点
    if (parent.lastChild === targetElement) {
        //如果最后一个子节点是当前元素那么直接添加即可
        parent.appendChild(element);
        return element;
    } else {
        parent.insertBefore(element, targetElement.nextSibling);//否则，当前节点的下一个节点之前添加
        return element;
    }
}


/**
 * 向指定元素前创建插入一个元素，可选添加ID
 * @param {*} targetElement 目标元素
 * @param {*} addElementTxt 要创建添加的元素标签
 * @param {*} setId 为创建元素设置ID
 */
function insertCreateBefore(targetElement, addElementTxt, setId = null) {

    if (!targetElement) console.error("指定元素对象不存在！");
    if (!addElementTxt) console.error("未指定字符串！");

    var element = document.createElement(addElementTxt);

    if (setId) element.id = setId;

    targetElement.parentElement.insertBefore(element, targetElement);

    return element;
}



/**
 * 为元素注册监听事件
 * @param {Element} element 
 * @param {string} strType 
 * @param {Fun} fun 
 */
function AddEvent(element, strType, fun) {
    //判断浏览器有没有addEventListener方法
    if (element.addEventListener) {
        element.addEventListener(strType, fun, false);
        //判断浏览器有没 有attachEvent IE8的方法	
    } else if (element.attachEvent) {
        element.attachEvent("on" + strType, fun);
        //如果都没有则使用 元素.事件属性这个基本方法
    } else {
        element["on" + strType] = fun;
    }
}


/**
 * 为元素解绑监听事件
 * @param {Element}  element ---注册事件元素对象
 * @param {String}   strType ---注册事件名(不加on 如"click")
 * @param {Function} fun	 ---回调函数
 * 
 */
function myRemoveEvent(element, strType, fun) {
    //判断浏览器有没有addEventListener方法
    if (element.addEventListener) {
        // addEventListener方法专用删除方法
        element.removeEventListener(strType, fun, false);
        //判断浏览器有没有attachEvent IE8的方法	
    } else if (element.attachEvent) {
        // attachEvent方法专用删除事件方法
        element.detachEvent("on" + strType, fun);
        //如果都没有则使用 元素.事件属性这个基本方法
    } else {
        //删除事件用null
        element["on" + strType] = null;
    }
}


/**
* 加载脚本文件
* @param {string} url 脚本地址
* @param {string} type 脚本类型
*/
function loadScript(url, type = 'module') {
    let script = document.createElement('script');
    if (type) script.setAttribute('type', type);
    script.setAttribute('src', url);
    document.head.appendChild(script);
}



/**
 * 得到思源toolbar
 * @returns 
 */
function getSiYuanToolbar() { return document.getElementById("toolbar"); }

/**
 * 得到savorToolbar
 * @returns 
 */
function getsavorToolbar() { return document.getElementById("savorToolbar"); }

/**简单判断目前思源是否是pc窗口模式 */
function isPcWindow() {
    return document.body.classList.contains("body--window");
}

/**简单判断目前思源是否是手机模式 */
function isPhone() {
    return document.getElementById("editor") ;
}


/**
 * 加载样式文件
 * @param {string} url 样式地址
 * @param {string} id 样式 ID
 */
function loadStyle(url, id, cssName) {

    var headElement = document.head;

    let style = document.getElementById(id);
    if (id != null) {
        if (style) headElement.removeChild(style);
    }

    style = document.createElement('link');
    if (id != null) style.id = id;


    style.setAttribute('type', 'text/css');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', url);
    if (cssName != null) style.setAttribute("class", cssName);
    headElement.appendChild(style);
    return style;
}

/**
 * 取出两个数组的不同元素
 * @param {*} arr1 
 * @param {*} arr2 
 * @returns 
 */
function getArrDifference(arr1, arr2) {
    return arr1.concat(arr2).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
    });
}

/**
 * 取出两个数组的相同元素
 * @param {*} arr1 
 * @param {*} arr2 
 * @returns 
 */
function getArrEqual(arr1, arr2) {
    let newArr = [];
    for (let i = 0; i < arr2.length; i++) {
        for (let j = 0; j < arr1.length; j++) {
            if (arr1[j] === arr2[i]) {
                newArr.push(arr1[j]);
            }
        }
    }
    return newArr;
}

/**
 * 思源吭叽元素属性解析看是否包含那种行级元素类型
 * @param {} attributes 
 * @param {*} attribute 
 * @returns 
 */
function attributesContains(attributes, attribute) {
    if (attribute == true) return;
    var arr = attributes.split(" ");
    if (arr.length != 0) {
        arr.forEach((v) => {
            if (v == attribute) attribute = true;
        });
        return attribute == true ? true : false;
    } else {
        return attributes == attribute;
    }
}
/**
 * 间隔执行指定次数的函数(不立即执行)
 * @param {*} time 间隔时间s
 * @param {*} frequency 执行次数
 * @param {*} Fun 执行函数
 */
function IntervalFunTimes(time, frequency, Fun) {

    for (let i = 0; i < frequency; i++) {
        sleep(time * i).then(v => {
            Fun();
        })
    }

    function sleep(time2) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, time2)
        })
    }
}

/**
 * 获得当前浏览器缩放系数 默认值为1
 * @returns 
 */
function detectZoom() {
    var ratio = 0, screen = window.screen, ua = navigator.userAgent.toLowerCase();
    if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    } else if (~ua.indexOf('msie')) {
        if (screen.deviceXDPI && screen.logicalXDPI) {
            ratio = screen.deviceXDPI / screen.logicalXDPI;
        }
    } else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
        ratio = window.outerWidth / window.innerWidth;
    }
    if (ratio) {
        ratio = Math.round(ratio * 100);
    }
    return ratio * 0.01;
};
/**
 * 递归DOM元素查找深度子级的一批符合条件的元素返回数组
 * @param {*} element 要查找DOM元素
 * @param {*} judgeFun 查找函数 : fun(v) return true or false
 * @returns array
 */
function diguiTooALL(element, judgeFun) {

    var target = [];

    if (element == null) return null;
    if (judgeFun == null) return null;


    digui(element);
    return target;

    function digui(elem) {
        var child = elem.children;
        if (child.length == 0) return;

        for (let index = 0; index < child.length; index++) {
            const element2 = child[index];
            if (judgeFun(element2)) {
                target.push(element2);
                digui(element2);
            } else {
                digui(element2);
            }
        }
    }
};

/**
* 递归DOM元素查找深度子级的第一个符合条件的元素 - 子级的子级深度搜索赶紧后在搜索下一个子级
* @param {*} element 要查找DOM元素
* @param {*} judgeFun 查找函数: fun(v) return true or false
* @returns element
*/
function diguiTooONE_1(element, judgeFun, xianz = 999) {

    if (element == null) return null;
    if (judgeFun == null) return null;
    var i = xianz <= 0 ? 10 : xianz;

    return digui(element);

    function digui(elem) {

        if (i <= 0) return null;
        i--;

        var child = elem.children;
        if (child.length == 0) return null;

        for (let index = 0; index < child.length; index++) {
            const element2 = child[index];
            if (judgeFun(element2)) {
                return element2;
            } else {
                var item = digui(element2);
                if (item == null) continue;
                return item;
            }
        }
        return null;
    }
}

/**
* 递归DOM元素查找深度子级的第一个符合条件的元素-同层全部筛选一遍在依次深度搜索。
* @param {*} element 要查找DOM元素
* @param {*} judgeFun 查找函数 : fun(v) return true or false
* @param {*} xianz 限制递归最大次数
* @returns element
*/
function diguiTooONE_2(element, judgeFun, xianz = 999) {

    if (element == null || element.firstElementChild == null) return null;
    if (judgeFun == null) return null;
    var i = xianz <= 0 ? 10 : xianz;
    return digui(element);

    function digui(elem) {

        if (i <= 0) return null;
        i--;

        var child = elem.children;
        var newchild = [];
        for (let index = 0; index < child.length; index++) {
            const element2 = child[index];
            if (judgeFun(element2)) {
                return element2;
            } else {
                if (newchild.firstElementChild != null) newchild.push(element2);
            }
        }

        for (let index = 0; index < newchild.length; index++) {
            const element2 = newchild[index];
            var item = digui(element2);
            if (item == null) continue;
            return item;
        }
        return null;
    }
}
/**
 * 不断查找元素父级的父级知道这个父级符合条件函数
 * @param {*} element 起始元素
 * @param {*} judgeFun 条件函数
 * @param {*} upTimes 限制向上查找父级次数
 * @returns 返回符合条件的父级，或null
 */
function isFatherFather(element, judgeFun, upTimes) {
    var i = 0;
    for (; ;) {
        if (!element) return null;
        if (upTimes < 1 || i >= upTimes) return null;
        if (judgeFun(element)) return element;
        element = element.parentElement;
        i++;
    }
}


/**
 * 获得焦点所在的块
 * @return {HTMLElement} 光标所在块
 * @return {null} 光标不在块内
 */
function getFocusedBlock() {
    let block = window.getSelection()
        && window.getSelection().focusNode
        && window.getSelection().focusNode.parentElement; // 当前光标
    while (block != null && block.dataset.nodeId == null) block = block.parentElement;
    return block;
}


/**
 * 获得指定块位于的编辑区
 * @params {HTMLElement} 
 * @return {HTMLElement} 光标所在块位于的编辑区
 * @return {null} 光标不在块内
 */
function getTargetEditor(block) {
    while (block != null && !block.classList.contains('protyle-content')) block = block.parentElement;
    return block;
}


/**
 * 清除选中文本
 */
function clearSelections() {
    if (window.getSelection) {
        var selection = window.getSelection();
        selection.removeAllRanges();
    } else if (document.selection && document.selection.empty) {
        document.selection.empty();
    }
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
function BodyEventRunFun(eventStr, fun, accurate = 100, delay = 0, frequency = 1, frequencydelay = 16) {
    var isMove = true;
    var _e = null;
    AddEvent(document.body, eventStr, (e) => { isMove = true; _e = e })
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

/**
 * 为元素添加思源悬浮打开指定ID块内容悬浮窗事件
 * @param {*} element 绑定的元素
 * @param {*} id 悬浮窗内打开的块的ID
 */
function suspensionToOpenSiyuanSuspensionWindow(element, id) {
    element.setAttribute("data-defids", '[""]');
    element.classList.add("popover__block");
    element.setAttribute("data-id", id);
}

/**
 * 为元素添加思源点击打开指定ID块内容悬浮窗事件
 * @param {*} element 绑定的元素
 * @param {*} id 悬浮窗内打开的块的ID
 */
function clickToOpenSiyuanFloatingWindow(element, id) {
    element.classList.add("protyle-wysiwyg__embed");
    element.setAttribute("data-id", id);
}

/**
 * 控制台打印输出
 * @param {*} obj 
 */
function c(...data) {
    console.log(data);
}

/**
 * 安全While循环
 * frequency:限制循环次数
 * 返回值不等于null终止循环
 */
function WhileSafety(fun, frequency = 99999) {
    var i = 0;
    if (frequency <= 0) {
        console.log("安全循环次数小于等于0")
        return;
    }
    while (i < frequency) {
        var _return = fun();
        if (_return != null || _return != undefined) return _return;
        i++;
    }
}
/**设置思源块展开 */
function setBlockfold_0(BlockId) {
    设置思源块属性(BlockId, { "fold": "0" });
}

/**设置思源块折叠 */
function setBlockfold_1(BlockId) {
    设置思源块属性(BlockId, { "fold": "1" });
}

/**
    * 得到光标编辑状态下的显示commonMenu菜单;
    * @returns 
    */
function getcommonMenu_Cursor() {
    if ((window.getSelection ? window.getSelection() : document.selection.createRange().text).toString().length != 0) return null;
    var commonMenu = document.querySelector("#commonMenu:not(.fn__none)");
    if (commonMenu == null) return null;
    if (commonMenu.firstChild == null) return null;
    if (commonMenu.children.length < 8) {
        return commonMenu;
    }
    return null;
}

/**
    * 得到光标选中编辑状态下的显示commonMenu菜单;
    * @returns 
    */
function getcommonMenu_Cursor2() {
    if ((window.getSelection ? window.getSelection() : document.selection.createRange().text).toString().length != 0) {
        return document.querySelector("#commonMenu:not(.fn__none)");
    };
    return null;
}

/**
 * 得到快选中状态下的显示commonMenu菜单;
 * @returns 
 */
function getcommonMenu_Bolck() {
    var commonMenu = document.querySelector("#commonMenu:not(.fn__none)");
    if (commonMenu.children.length < 8) {
        return commonMenu;
    }
    return null;
}



/**++++++++++++++++++++++++++++++++按需调用++++++++++++++++++++++++++++++ */
获取文件("/data/snippets/Savor.config.json", (v) => {
    let funs = () => {

		setTimeout(() => {

			if (isPhone()) {

				loadStyle("/appearance/themes/Savor/style/module/mobile.css")

				console.log("==============>附加CSS和特性JS_已经执行<==============");
            } else {
				const htmlTag = document.querySelector('html');
				
                const themeMode = htmlTag.getAttribute('data-theme-mode');
				
				if (themeMode == 'light') {
                    loadsalt = getItem('buttonsalt');
					loadsugar = getItem('buttonsugar');
                    if (loadsalt == '1') {
                        loadStyle(
                            '/appearance/themes/Savor/style/topbar/salt.css',
                            'salt主题'
                        ).setAttribute('topicfilter', 'buttonsalt');
                    }
					if (loadsugar == '1') {
                        loadStyle(
                            '/appearance/themes/Savor/style/topbar/sugar.css',
                            'salt主题'
                        ).setAttribute('topicfilter', 'buttonsugar');
                    }

                }
				if (themeMode == 'dark') {
					loadvinegar = getItem('buttonvinegar');
                    if (loadvinegar == '1') {
                        loadStyle(
                            '/appearance/themes/Savor/style/topbar/vinegar.css',
                            'vinegar主题'
                        ).setAttribute('topicfilter', 'buttonvinegar');
                    }
                }
				
                    
                themeButton();//主题
                            
                concealMarkButton();//挖空
                
                tabbarVerticalButton();//垂直页签

                SpluginButton();//展开插件
				
				topbarfixedButton();//顶栏悬浮
				
				bulletThreading();//子弹线
 
                setTimeout(() => ClickMonitor(), 3000);//各种列表转xx

                collapsedListPreview();//折叠列表内容预览查看

                collapseExpand_Head_List()//鼠标中键标题、列表文本折叠/展开

                //loadScript("/appearance/themes/Savor/comment/index.js");js批注评论

                console.log("==============>附加CSS和特性JS_已经执行<==============");
            }
        }, 100);
    };
    if (v == null) {
        window.theme.config = { "Savor": 1 };
        写入文件("/data/snippets/Savor.config.json", JSON.stringify(window.theme.config, undefined, 4), (a) => { funs() });
    } else {
        window.theme.config = v;
        funs();
    }
});










/**
 * 获得指定块位于的编辑区
 * @params {HTMLElement}
 * @return {HTMLElement} 光标所在块位于的编辑区
 * @return {null} 光标不在块内
 */
function getTargetEditor(block) {
    while (block != null && !block.classList.contains('protyle-wysiwyg')) block = block.parentElement;
    return block;
}

/**
 * 获得焦点所在的块
 * @return {HTMLElement} 光标所在块
 * @return {null} 光标不在块内
 */
function getFocusedBlock() {
    if (document.activeElement.classList.contains('protyle-wysiwyg')) {
        let block = window.getSelection()?.focusNode?.parentElement; // 当前光标
        while (block != null && block.dataset.nodeId == null) block = block.parentElement;
        return block;
    }
}

function focusHandler() {
    /* 获取当前编辑区 */
    let block = getFocusedBlock(); // 当前光标所在块
    /* 当前块已经设置焦点 */
    if (block?.classList.contains(`block-focus`)) return;

    /* 当前块未设置焦点 */
    const editor = getTargetEditor(block); // 当前光标所在块位于的编辑区
    if (editor) {
        editor.querySelectorAll(`.block-focus`).forEach((element) => element.classList.remove(`block-focus`));
        block.classList.add(`block-focus`);
        // setSelector(block);
    }
}

function bulletMain() {
    // 跟踪当前所在块
    window.addEventListener('mouseup', focusHandler, true);
    window.addEventListener('keyup', focusHandler, true);
}

(async () => {
    bulletMain();
    console.log('加载子弹线成功')
})();



/** 清除样式 **/

window.destroyTheme = () => { 
    // 删除主题加载的额外样式
    var Sremove = document.querySelectorAll('[id^="theme-color-style"]');  
    Sremove.forEach(function(Sremove) {  
        Sremove.parentNode.removeChild(Sremove);  
    }); 
    // 删除切换按钮
	document.querySelector("#savorToolbar").remove();
    // 删除空白
    document.querySelector("#savordrag").remove();
    // 删除插件展开按钮
    document.querySelector("#savorPlugins").remove();
	// 删除列表转导图功能
    window.removeEventListener('mouseup', MenuShow);
};



