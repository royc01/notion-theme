
/* inject local script */
function inject(){
  //获取当前主题名称
  let themeStyle = document.querySelector('#themeStyle')
  if(themeStyle){
    let url = themeStyle.getAttribute('href').split('/')
    let theme = url[url.length - 2]
    if(!theme){
      alert("未能获取到主题名称")
    }else{
      let script = document.querySelector('#emojiScript')
      if(script){
        let js = document.createElement('script')
            js.setAttribute('src','./appearance/themes/' + theme + '/comment/index.js')
            js.setAttribute('type','module')
            js.setAttribute('defer','defer')
        document.head.insertBefore(js,script)
      }else{
        setTimeout(()=>inject(),500)
      }
    }
  }else{
    setTimeout(()=>inject(),500)
  }
}
inject()



const  添加视图菜单监听器 =  function(){
  let 块标菜单 = document.getElementById("commonMenu")
  window.addEventListener("mousedown",判定目标并添加菜单项目)

}
var 全局菜单定时器={}
判定目标并添加菜单项目 = function(event){
  console.log(event.target)
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
};

扩展菜单=function(父元素){

  if(父元素.getAttribute("data-type")=="NodeList"){
    let id = 父元素.getAttribute("data-node-id")
    全局菜单定时器= setInterval(()=>生成列表菜单项目(id), 10);
  }
  else if(父元素.getAttribute("data-type")=="NodeTable"){
    let id = 父元素.getAttribute("data-node-id")
    全局菜单定时器= setInterval(()=>生成列表菜单项目2(id), 10);
  }
}
生成列表菜单项目=function(id){
  let 块标菜单 = document.getElementById("commonMenu")
  let  最后项 = 块标菜单.querySelector(".b3-menu__item--readonly")
  if(最后项){
    console.log(最后项)
    块标菜单.insertBefore(列表转换导图按钮(id),最后项)
    块标菜单.insertBefore(列表恢复默认按钮(id),最后项)

    clearInterval(全局菜单定时器)
  }
}
列表转换导图按钮=function(id){
  let button = document.createElement("button")
  button.className="b3-menu__item diy"
  button.setAttribute("data-node-id",id)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value","dt")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconFiles"></use></svg><span class="b3-menu__label">列表转换导图</span>`
  button.onclick=视图菜单监听器
  return button
}
列表恢复默认按钮=function(id){
  let button = document.createElement("button")
  button.className="b3-menu__item diy"
  button.onclick=视图菜单监听器
  button.setAttribute("data-node-id",id)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value","")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconList"></use></svg><span class="b3-menu__label">列表恢复默认</span>`
  return button
}

生成列表菜单项目2=function(id){
  let 块标菜单 = document.getElementById("commonMenu")
  let  最后项 = 块标菜单.querySelector(".b3-menu__item--readonly")
  if(最后项){
    console.log(最后项)
    块标菜单.insertBefore(页面宽度视图按钮(id),最后项)
    块标菜单.insertBefore(自动宽度视图按钮(id),最后项)

    clearInterval(全局菜单定时器)
  }
}
自动宽度视图按钮=function(id){
  let button = document.createElement("button")
  button.className="b3-menu__item diy"
  button.setAttribute("data-node-id",id)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value","")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">表格自动宽度</span>`
  button.onclick=视图菜单监听器
  return button
}
页面宽度视图按钮=function(id){
  let button = document.createElement("button")
  button.className="b3-menu__item diy"
  button.onclick=视图菜单监听器
  button.setAttribute("data-node-id",id)
  button.setAttribute("custom-attr-name","f")
  button.setAttribute("custom-attr-value","auto")

  button.innerHTML=`<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">表格页面宽度</span>`
  return button
}
添加视图菜单监听器()
视图菜单监听器=function(event){
  console.log(event.currentTarget)
  let id = event.currentTarget.getAttribute("data-node-id")
  let attrName = "custom-"+event.currentTarget.getAttribute("custom-attr-name")
  let attrValue = event.currentTarget.getAttribute("custom-attr-value")
  let blocks = document.querySelectorAll(`.protyle-wysiwyg [data-node-id="${id}"]`)
  if(blocks[0]){
    blocks.forEach(
      block=>block.setAttribute(attrName,attrValue)
    )
  }
}
