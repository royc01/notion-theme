  /***js form Morgan***/
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
  生成列表菜单项目=function(){
    let 块标菜单 = document.getElementById("commonMenu")
    let  最后项 = 块标菜单.querySelector(".b3-menu__item--readonly")
    if(最后项){
      块标菜单.insertBefore(选择视图按钮(),最后项)
      块标菜单.insertBefore(菜单分隔项(),最后项)
    }
  }
  
  选择视图按钮=function(){
    let button = document.createElement("button")
    button.id="viewselect"
    button.className="b3-menu__item"
    button.innerHTML='<svg class="b3-menu__icon" style="null"><use xlink:href="#iconPreview"></use></svg><span class="b3-menu__label" style="">选择视图</span><svg class="b3-menu__icon b3-menu__icon--arrow" style="null"><use xlink:href="#iconRight"></use></svg></button>'
    button.appendChild(子菜单栏())
    return button
  }
  
  子菜单栏=function(className = 'b3-menu__submenu') {
    let node = document.createElement('div');
    node.className = className;
    selectid = getBlockSelected()
    id = selectid.id
    if(selectid.type=="NodeList"){
      node.appendChild(列表转换导图按钮(id))
      node.appendChild(列表转换表格按钮(id))
	  node.appendChild(列表转换看板按钮(id))
      node.appendChild(列表恢复默认按钮(id))
    }
    if(selectid.type=="NodeTable"){
      node.appendChild(页面宽度视图按钮(id))
      node.appendChild(自动宽度视图按钮(id))
    }
    return node;
  }
  
  列表转换导图按钮=function(id){
    let button = document.createElement("button")
    button.className="b3-menu__item"
    button.setAttribute("data-node-id",id)
    button.setAttribute("custom-attr-name","f")
    button.setAttribute("custom-attr-value","dt")
  
    button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconFiles"></use></svg><span class="b3-menu__label">转换为导图</span>`
    button.onclick=视图菜单监听器
    return button
  }
  列表转换表格按钮=function(id){
    let button = document.createElement("button")
    button.className="b3-menu__item"
    button.setAttribute("data-node-id",id)
    button.setAttribute("custom-attr-name","f")
    button.setAttribute("custom-attr-value","bg")
  
    button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">转换为表格</span>`
    button.onclick=视图菜单监听器
    return button
  }
  列表转换看板按钮=function(id){
    let button = document.createElement("button")
    button.className="b3-menu__item"
    button.setAttribute("data-node-id",id)
    button.setAttribute("custom-attr-name","f")
    button.setAttribute("custom-attr-value","kb")
  
    button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconMenu"></use></svg><span class="b3-menu__label">转换为看板</span>`
    button.onclick=视图菜单监听器
    return button
  } 
  列表恢复默认按钮=function(id){
    let button = document.createElement("button")
    button.className="b3-menu__item"
    button.onclick=视图菜单监听器
    button.setAttribute("data-node-id",id)
    button.setAttribute("custom-attr-name","f")
    button.setAttribute("custom-attr-value",'')
  
    button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconList"></use></svg><span class="b3-menu__label">恢复为列表</span>`
    return button
  }
  页面宽度视图按钮=function(id){
    let button = document.createElement("button")
    button.className="b3-menu__item"
    button.onclick=视图菜单监听器
    button.setAttribute("data-node-id",id)
    button.setAttribute("custom-attr-name","f")
    button.setAttribute("custom-attr-value","auto")
  
    button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">页面宽度</span>`
    return button
  }
  自动宽度视图按钮=function(id){
    let button = document.createElement("button")
    button.className="b3-menu__item"
    button.setAttribute("data-node-id",id)
    button.setAttribute("custom-attr-name","f")
    button.setAttribute("custom-attr-value","")
    button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">自动宽度</span>`
    button.onclick=视图菜单监听器
    return button
  }
  菜单分隔项=function(className = 'b3-menu__separator') {
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
  
  const  添加视图菜单监听器 =  function(){
    window.addEventListener("mouseup",判定目标并添加菜单项目)
  
  }
  var 全局菜单定时器={}
  判定目标并添加菜单项目 = function(event){
    let 父元素 =event.target.parentElement
    if(父元素.getAttribute("draggable")=="true")
    {
      扩展菜单(父元素)
    }
    else if(
      父元素.parentElement.getAttribute("draggable")=="true"
    ){
      扩展菜单(父元素.parentElement)
    }
  }
  
  扩展菜单=function(父元素){
    if(父元素.getAttribute("data-type")=="NodeList" ||"NodeTable"){
      全局菜单定时器= setTimeout(()=>生成列表菜单项目(), 0);
    }
  
  }
  添加视图菜单监听器()
  视图菜单监听器=function(event){
    // console.log(event.currentTarget)
    let id = event.currentTarget.getAttribute("data-node-id")
    let attrName = 'custom-'+event.currentTarget.getAttribute("custom-attr-name")
    let attrValue = event.currentTarget.getAttribute("custom-attr-value")
    let blocks = document.querySelectorAll(`.protyle-wysiwyg [data-node-id="${id}"]`)
    if(blocks){
      blocks.forEach(block=>block.setAttribute(attrName,attrValue))
    }
    let attrs={}
      attrs[attrName] =attrValue
    // console.log(attrs)
    设置思源块属性(id,attrs)
  }
