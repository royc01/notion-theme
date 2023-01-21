 	///////////////////////////////////////////////////////////////
  // This is the recovered source code from js.map             //
  // Just for references, DO NOT edit or use this file!        //
  ///////////////////////////////////////////////////////////////
  // 从map文件中恢复的可能是源代码的东西，不要使用这个进行任何修改！//
  ///////////////////////////////////////////////////////////////
  
  // install a JSONP callback for chunk loading
 	function webpackJsonpCallback(data) {
 		var chunkIds = data[0];
 		var moreModules = data[1];
 		var executeModules = data[2];

 		// add "moreModules" to the modules object,
 		// then flag all "chunkIds" as loaded and fire callback
 		var moduleId, chunkId, i = 0, resolves = [];
 		for(;i < chunkIds.length; i++) {
 			chunkId = chunkIds[i];
 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
 				resolves.push(installedChunks[chunkId][0]);
 			}
 			installedChunks[chunkId] = 0;
 		}
 		for(moduleId in moreModules) {
 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
 				modules[moduleId] = moreModules[moduleId];
 			}
 		}
 		if(parentJsonpFunction) parentJsonpFunction(data);

 		while(resolves.length) {
 			resolves.shift()();
 		}

 		// add entry modules from loaded chunk to deferred list
 		deferredModules.push.apply(deferredModules, executeModules || []);

 		// run deferred modules when all chunks ready
 		return checkDeferredModules();
 	};
 	function checkDeferredModules() {
 		var result;
 		for(var i = 0; i < deferredModules.length; i++) {
 			var deferredModule = deferredModules[i];
 			var fulfilled = true;
 			for(var j = 1; j < deferredModule.length; j++) {
 				var depId = deferredModule[j];
 				if(installedChunks[depId] !== 0) fulfilled = false;
 			}
 			if(fulfilled) {
 				deferredModules.splice(i--, 1);
 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
 			}
 		}

 		return result;
 	}

 	// The module cache
 	var installedModules = {};

 	// object to store loaded and loading chunks
 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
 	// Promise = chunk loading, 0 = chunk loaded
 	var installedChunks = {
 		"app": 0
 	};

 	var deferredModules = [];

 	// The require function
 	function __webpack_require__(moduleId) {

 		// Check if module is in cache
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}
 		// Create a new module (and put it into the cache)
 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};

 		// Execute the module function
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

 		// Flag the module as loaded
 		module.l = true;

 		// Return the exports of the module
 		return module.exports;
 	}


 	// expose the modules object (__webpack_modules__)
 	__webpack_require__.m = modules;

 	// expose the module cache
 	__webpack_require__.c = installedModules;

 	// define getter function for harmony exports
 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
 		}
 	};

 	// define __esModule on exports
 	__webpack_require__.r = function(exports) {
 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
 		}
 		Object.defineProperty(exports, '__esModule', { value: true });
 	};

 	// create a fake namespace object
 	// mode & 1: value is a module id, require it
 	// mode & 2: merge all properties of value into the ns
 	// mode & 4: return value when already ns object
 	// mode & 8|1: behave like require
 	__webpack_require__.t = function(value, mode) {
 		if(mode & 1) value = __webpack_require__(value);
 		if(mode & 8) return value;
 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
 		var ns = Object.create(null);
 		__webpack_require__.r(ns);
 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
 		return ns;
 	};

 	// getDefaultExport function for compatibility with non-harmony modules
 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};

 	// Object.prototype.hasOwnProperty.call
 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

 	// __webpack_public_path__
 	__webpack_require__.p = "/";

 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
 	jsonpArray.push = webpackJsonpCallback;
 	jsonpArray = jsonpArray.slice();
 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
 	var parentJsonpFunction = oldJsonpFunction;


 	// add entry module to deferred list
 	deferredModules.push([0,"chunk-vendors"]);
 	// run deferred modules when ready
 	return checkDeferredModules();

var render = function render(){var _vm=this,_c=_vm._self._c;return _c('div',{attrs:{"id":"app"}},[_c('div',{staticClass:"con"},[_c('div',{staticClass:"now-data-myself"},[_c('div',{ref:"today",staticClass:"now-data-myself-time",attrs:{"title":"刷新"}},[_vm._v(" "+_vm._s(_vm.date)+"日 ")]),_c('div',{ref:"week",staticClass:"now-data-myself-week",attrs:{"title":_vm.currentNotebook.name}},[_vm._v(" "+_vm._s(_vm.week)+" ")]),(_vm.showNotebookList)?_c('div',{staticClass:"notebooksList",on:{"click":_vm.handleNotebookClick}},_vm._l((_vm.notebookList),function(item){return _c('div',{key:item.id,staticClass:"notebook",attrs:{"data-id":item.id,"data-name":item.name}},[_vm._v(" "+_vm._s(item.name)+" ")])}),0):_vm._e()]),_c('Calendar',{ref:"Calendar",attrs:{"markDate":_vm.markArr,"textTop":_vm.textTop},on:{"choseDay":_vm.clickDay,"changeMonth":_vm.changeDate}})],1)])
}
var staticRenderFns = []

export { render, staticRenderFns }
<template>
  <div id="app">
    <div class="con">
      <div class="now-data-myself">
        <div ref="today" class="now-data-myself-time" title="刷新">
          {{ date }}日
        </div>
        <div
          ref="week"
          class="now-data-myself-week"
          :title="currentNotebook.name"
        >
          {{ week }}
        </div>
        <div
          v-if="showNotebookList"
          class="notebooksList"
          @click="handleNotebookClick"
        >
          <div
            v-for="item in notebookList"
            :key="item.id"
            class="notebook"
            :data-id="item.id"
            :data-name="item.name"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
      <Calendar
        ref="Calendar"
        v-on:choseDay="clickDay"
        v-on:changeMonth="changeDate"
        :markDate="markArr"
        :textTop="textTop"
      ></Calendar>
    </div>
  </div>
</template>

<script>
import Calendar from "vue-calendar-component";
export default {
  name: "App",
  components: { Calendar },
  data() {
    return {
      date: "",
      week: "",
      markArr: [],
      DateLinkToNote: {},
      textTop: ["一", "二", "三", "四", "五", "六", "日"],
      currentNotebook: {
        name: "",
        id: null,
      },
      notebookList: [],
      showNotebookList: false,
    };
  },
  created() {
    var now = new Date();
    this.date = now.getDate(); //得到日期
    var day = now.getDay(); //得到周几
    var arr_week = new Array(
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六"
    );
    this.week = arr_week[day];
  },
  mounted() {
    this.$refs.today.addEventListener(
      "click",
      function () {
        window.location.reload(true);
      },
      false
    );
    this.changeDate();

    this.$refs.week.addEventListener("click", this.handleWeekClick, false);
    if (localStorage.getItem("calendar_current_notebook")) {
      this.currentNotebook = JSON.parse(
        localStorage.getItem("calendar_current_notebook")
      );
    }
  },
  methods: {
    // 选中笔记本
    handleNotebookClick(e) {
      if (e.target.classList.contains("notebook")) {
        this.currentNotebook.name = e.target.getAttribute("data-name");
        this.currentNotebook.id = e.target.getAttribute("data-id");
        this.showNotebookList = false;
        localStorage.setItem(
          "calendar_current_notebook",
          JSON.stringify(this.currentNotebook)
        );
      }
    },
    // 请求函数——向服务器接口发送请求
    async request(url, data = null, method = "POST") {
      return new Promise((resolve, reject) => {
        if (method.toUpperCase() == "POST") {
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token `,
            },
            body: JSON.stringify(data),
          })
            .then(
              (data) => resolve(data.json()),
              (error) => {
                reject(error);
              }
            )
            .catch((err) => {
              console.error("请求失败:", err);
            });
        }
      });
    },
    async clickDay(data) {
      let arr = data.split("/");
      arr[1] = arr[1].padStart(2, "0");
      arr[2] = arr[2].padStart(2, "0");
      let TempData = arr.join("-");
      if (this.DateLinkToNote[TempData]) {
        try {
          window.open(this.DateLinkToNote[TempData]);
        } catch (err) {
          console.error(err);
        }
      } else {
        // 标记——点击没有日记文档的日期时
        if (this.currentNotebook.id) {
          // 获取笔记本配置
          let NotebookConfReqBody = {
            notebook: this.currentNotebook.id,
          };
          let NotebookConf = await this.request(
            "/api/notebook/getNotebookConf",
            NotebookConfReqBody
          );
          // 创建指定日期的空白文档
          let createDocWithMdReqBody = {
            notebook: this.currentNotebook.id,
            path: `/daily note/${arr[0]}/${arr[1]}/${TempData}`,
            markdown: "",
          };
          let res = await this.request(
            "/api/filetree/createDocWithMd",
            createDocWithMdReqBody
          );
          // 打开所创建的文档
          if (res.code === 0 && res.data) {
            let DailyNoteID = res.data;
            try {
              window.open(`siyuan://blocks/${DailyNoteID}`);
              this.DateLinkToNote[TempData] = `siyuan://blocks/${DailyNoteID}`;
              this.markArr.push(TempData);
              // 获取工作空间目录
              let workspaceDir = "";
              let systemConf = await this.request(
                "/api/system/getConf"
              );
              if (systemConf && systemConf.data.conf.system.workspaceDir) {
                workspaceDir = systemConf.data.conf.system.workspaceDir.replace(
                  /\\/g,
                  "/"
                );
              } else {
                console.error("获取工作空间目录失败，请手动设置");
              }
              if (
                NotebookConf.code === 0 &&
                NotebookConf.data &&
                NotebookConf.data.conf
              ) {
                let conf = NotebookConf.data.conf;
                let template_HTML = "";
                // 如果设置了日记模板，则进行模板渲染
                if (conf.dailyNoteTemplatePath) {
                  let template_path =
                    `${workspaceDir}/data/templates${conf.dailyNoteTemplatePath}`.replace(
                      /\//g,
                      "\\"
                    );
                  let TemplateRenderReqBody = {
                    id: DailyNoteID,
                    path: template_path,
                  };
                  let TemplateRenderRes = await this.request(
                    "/api/template/render",
                    TemplateRenderReqBody
                  );
                  if (TemplateRenderRes && TemplateRenderRes.code == 0) {
                    template_HTML = TemplateRenderRes.data.content;
                    setTimeout(() => {
                      (0, window.parent._d.insertHTML)(
                        template_HTML,
                        window.parent._t,
                        !0
                      );
                    }, 1000);
                  }
                }
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
      }
    },
    async changeDate(data) {
      await this.$nextTick();
      let DayArr = document.querySelectorAll(
        ".wh_item_date:not(.wh_other_dayhide)"
      );
      let DateStr = document.querySelector(".wh_content_li");
      DateStr = DateStr.innerText;
      DateStr = DateStr.replace(/年|月/g, "-");
      DayArr.forEach((item) => {
        let tempStr = (DateStr + item.innerText).split("-");
        tempStr[1] = tempStr[1].padStart(2, "0");
        tempStr[2] = tempStr[2].padStart(2, "0");
        tempStr = tempStr.join("-");
        this.AutoMarkDate(tempStr);
      });
    },

    async SiYuan_SQL_dailyNote(DateStr) {
      let url = "/api/query/sql";
      let data = {
        stmt: `select * from blocks  WHERE content LIKE '${DateStr}' AND type = 'd' ORDER BY random() LIMIT 1`,
      };
      let resData = null;
      await fetch(url, {
        body: JSON.stringify(data),
        method: "POST",
        headers: {
          Authorization: `Token `,
        },
      })
        .then(function (response) {
          resData = response.json();
        })
        .catch((err) => {
          console.log(err);
        });
      return resData;
    },
    async AutoMarkDate(data) {
      let res = await this.SiYuan_SQL_dailyNote(data);
      if (!res.code && res.data.length > 0) {
        let link = "siyuan://blocks/" + res.data[0].id;
        this.DateLinkToNote[data] = link;
        this.markArr.push(data);
      }
    },
    async handleWeekClick() {
      this.showNotebookList = !this.showNotebookList;
      let lsNotebooks = await this.request(
        "/api/notebook/lsNotebooks"
      );
      if (
        lsNotebooks.code === 0 &&
        lsNotebooks.data &&
        lsNotebooks.data.notebooks
      ) {
        this.notebookList = lsNotebooks.data.notebooks.filter(
          (item) => item.closed === false
        );
      }
    },
  },
};
</script>

<style lang="stylus">
.notebooksList {
  width: 155px;
  max-width: 200px;
  padding: 10px 20px;
  background: #ededed;
  height: 260px;
  overflow: auto;
  position: fixed;
  z-index: 1;
  top: 45px;
  left: 94px;
}

.notebooksList::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.notebooksList::-webkit-scrollbar-thumb {
  background: #cccccc;
  border-radius: 3px;
}

.notebook {
  min-width: 140px;
  padding: 5px 0px;
}

.notebook:hover {
  background: #ccc;
}

.now-data-myself {
  width: 40%;
  height: 47px;
  margin-left: 60%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}

.con {
  position: relative;
  max-width: 280px;
}

.con .wh_content_all {
  background: transparent !important;
}

.wh_top_changge li {
  color: black !important;
  font-size: 16px !important;
  font-weight: bold;
}

.wh_content_item, .wh_content_item_tag {
  color: #303133 !important;
}

.wh_content_item .wh_isToday {
  background: #00d985 !important;
  color: black !important;
  font-weight: bold;
}

.wh_content_item .wh_chose_day {
  background: #409EFF !important;
}

.wh_item_date:hover {
  background: rgb(217, 236, 255) !important;
  border-radius: 100px !important;
  color: rgb(102, 177, 255) !important;
}

.wh_jiantou1[data-v-2ebcbc83] {
  border-top: 2px solid black !important;
  border-left: 2px solid black !important;
  width: 7px !important;
  height: 7px !important;
}

.wh_jiantou2[data-v-2ebcbc83] {
  border-top: 2px solid #000 !important;
  border-right: 2px solid #000 !important;
  width: 7px !important;
  height: 7px !important;
}

.wh_top_changge + .wh_content {
  border-bottom: 2px solid #0d84e5;
  border-top: 1px solid rgba(227, 227, 227, 0.6);
}

.wh_top_tag[data-v-2ebcbc83] {
  color: black;
  font-weight: bold;
  z-index: 4;
}

.wh_container[data-v-2ebcbc83] {
  max-width: 280px;
}

.wh_top_changge[data-v-2ebcbc83] {
  display: flex;
  width: 60%;
}

.now-data-myself-time {
  color: black;
  font-size: 15px;
  margin-right: 10px;
  font-family: 'Helvetica Neue';
  cursor: pointer;
}

.now-data-myself-week {
  font-size: 10px;
  color: #909399;
}

.wh_top_changge .wh_content_li[data-v-2ebcbc83] {
  font-family: Helvetica;
}

.wh_content_item > .wh_isMark[data-v-2ebcbc83] {
  background: transparent !important;
}

.wh_content_item > .wh_isMark[data-v-2ebcbc83]::after {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0fc37c;
  position: absolute;
  top: 31px;
  left: 18px;
}

body {
  cursor: pointer;
}
</style>

import mod from "-!../node_modules/cache-loader/dist/cjs.js??ref--13-0!../node_modules/thread-loader/dist/cjs.js!../node_modules/babel-loader/lib/index.js!../node_modules/cache-loader/dist/cjs.js??ref--1-0!../node_modules/vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=script&lang=js&"; export default mod; export * from "-!../node_modules/cache-loader/dist/cjs.js??ref--13-0!../node_modules/thread-loader/dist/cjs.js!../node_modules/babel-loader/lib/index.js!../node_modules/cache-loader/dist/cjs.js??ref--1-0!../node_modules/vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=script&lang=js&"
import { render, staticRenderFns } from "./App.vue?vue&type=template&id=a3468ca4&"
import script from "./App.vue?vue&type=script&lang=js&"
export * from "./App.vue?vue&type=script&lang=js&"
import style0 from "./App.vue?vue&type=style&index=0&id=a3468ca4&prod&lang=stylus&"


/* normalize component */
import normalizer from "!../node_modules/vue-loader/lib/runtime/componentNormalizer.js"
var component = normalizer(
  script,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

export default component.exports
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

export * from "-!../node_modules/mini-css-extract-plugin/dist/loader.js??ref--12-oneOf-1-0!../node_modules/css-loader/dist/cjs.js??ref--12-oneOf-1-1!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/src/index.js??ref--12-oneOf-1-2!../node_modules/stylus-loader/index.js??ref--12-oneOf-1-3!../node_modules/cache-loader/dist/cjs.js??ref--1-0!../node_modules/vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=style&index=0&id=a3468ca4&prod&lang=stylus&"
