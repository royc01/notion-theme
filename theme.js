/*----------------日历面板----------------*/
function initcalendar() {
    // 把日历图标 放到  搜索图标前面
    var barSearch = document.getElementById("barSync");
    barSearch.insertAdjacentHTML(
      "afterend",
      '<div id="calendar"class="toolbar__item b3-tooltips b3-tooltips__se" aria-label="日历" ></div>'
    );
    let calendarIcon = document.getElementById("calendar");
  
    // 日历面板，这里是插入挂件
    barSearch.insertAdjacentHTML(
      "afterend",
      ` <div
      data-node-index="1"
      data-type="NodeWidget"
      class="iframe"
      data-subtype="widget"
    >
      <div class="iframe-content">
        <iframe id="calendarPanel" style="visibility:hidden;position: fixed; z-index: 1000; top: 225px; left: 200px;  width: 300px; height: 350px; background-color: var(--b3-theme-background);box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px;border:none; border-radius: 5px; transform: translate(-50%, -50%); overflow: auto;" src="/appearance/themes/Savor/calendar" data-src="/appearance/themes/Savor/calendar" data-subtype="widget" ></iframe>
      </div>
    </div>`
    );
  
    let calendarPanel = document.getElementById("calendarPanel");
  
    calendarIcon.innerHTML = `<svg t="1662957805816" class="icon" viewBox="0 0 35 35" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2374" width="30" height="30"><path d="M13.943 22.171h-0.914c-0.571 0-0.686 0.229-0.686 0.686v0.914c0 0.571 0.229 0.686 0.686 0.686h0.914c0.571 0 0.8-0.229 0.8-0.686v-0.914c-0.114-0.457-0.343-0.686-0.8-0.686zM19.086 22.171h-0.914c-0.571 0-0.8 0.229-0.8 0.686v0.914c0 0.571 0.229 0.686 0.8 0.686h0.914c0.571 0 0.8-0.229 0.8-0.686v-0.914c-0.114-0.457-0.229-0.686-0.8-0.686zM13.943 17.143h-0.914c-0.571 0-0.686 0.229-0.686 0.686v0.914c0 0.571 0.229 0.686 0.686 0.686h0.914c0.571 0 0.8-0.229 0.8-0.686v-0.914c-0.114-0.571-0.343-0.686-0.8-0.686zM8.686 22.171h-0.914c-0.571 0-0.686 0.229-0.686 0.686v0.914c0 0.571 0.229 0.686 0.686 0.686h0.914c0.571 0 0.8-0.229 0.8-0.686v-0.914c0-0.457-0.229-0.686-0.8-0.686zM8.686 17.143h-0.914c-0.571 0-0.686 0.229-0.686 0.686v0.914c0 0.571 0.229 0.686 0.686 0.686h0.914c0.571 0 0.8-0.229 0.8-0.686v-0.914c0-0.571-0.229-0.686-0.8-0.686zM13.943 12h-0.914c-0.571 0-0.686 0.229-0.686 0.686v1.029c0 0.571 0.229 0.686 0.686 0.686h0.914c0.571 0 0.8-0.229 0.8-0.686v-0.914c-0.114-0.571-0.343-0.8-0.8-0.8zM26.857 1.371h-21.714c-3.429 0-5.143 1.714-5.143 5.029v19.2c0 3.314 1.714 5.143 5.143 5.143h21.714c3.429 0 5.143-1.714 5.143-5.143v-19.2c0-3.314-1.714-5.029-5.143-5.029zM28.914 25.6c0 1.371-0.686 2.057-2.057 2.057h-21.714c-1.257 0-2.057-0.686-2.057-2.057v-14.514c0-1.371 0.686-2.057 2.057-2.057h21.714c1.371 0 2.057 0.686 2.057 2.057v14.514zM19.086 17.143h-0.914c-0.571 0-0.8 0.229-0.8 0.686v0.914c0 0.571 0.229 0.686 0.8 0.686h0.914c0.571 0 0.8-0.229 0.8-0.686v-0.914c-0.114-0.571-0.229-0.686-0.8-0.686zM24.229 12h-0.914c-0.571 0-0.8 0.229-0.8 0.686v1.029c0 0.571 0.229 0.686 0.8 0.686h0.914c0.571 0 0.8-0.229 0.8-0.686v-0.914c-0.114-0.571-0.229-0.8-0.8-0.8zM24.229 17.143h-0.914c-0.571 0-0.8 0.229-0.8 0.686v0.914c0 0.571 0.229 0.686 0.8 0.686h0.914c0.571 0 0.8-0.229 0.8-0.686v-0.914c-0.114-0.571-0.229-0.686-0.8-0.686zM19.086 12h-0.914c-0.571 0-0.8 0.229-0.8 0.686v1.029c0 0.571 0.229 0.686 0.8 0.686h0.914c0.571 0 0.8-0.229 0.8-0.686v-0.914c-0.114-0.571-0.229-0.8-0.8-0.8z"></path></svg>`;
  
    calendarIcon.addEventListener(
      "click",
      function (e) {
        e.stopPropagation();
        if (calendarPanel.style.visibility === "hidden") {
          calendarPanel.style.visibility = "visible";
        } else {
          calendarPanel.style.visibility = "hidden";
        }
      },
      false
    );
    calendarPanel.addEventListener('click',function(e){e.stopPropagation()},false)
  
     // 隐藏历史面板
     function hideCalendarPanel() {
      if (calendarPanel.style.visibility === "visible") {
        calendarPanel.style.visibility = "hidden";
      }
    }
    // 点击其他区域时，隐藏日历面板
    window.addEventListener("click", hideCalendarPanel, false);
  }