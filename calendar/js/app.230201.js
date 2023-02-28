(function (modules) {
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
})({
    0: function (t, e, o) {
        t.exports = o("56d7");
    },
    "56d7": function (t, e, o) {
        "use strict";
        o.r(e);
        var a = o("2b0e");

        // source code line 161 block
        var render = function () {
            var _vm = this,
                _c = _vm._self._c;
            return _c("div", { attrs: { id: "app" } }, [
                _c(
                    "div",
                    { staticClass: "con" },
                    [
                        _c("div", { staticClass: "now-data-myself" }, [
                            _c("div", { ref: "today", staticClass: "now-data-myself-time", attrs: { title: "刷新" } }, [_vm._v(" " + _vm._s(_vm.date) + "日 ")]),
                            _c("div", { ref: "week", staticClass: "now-data-myself-week", attrs: { title: _vm.currentNotebook.name } }, [_vm._v(" " + _vm._s(_vm.week) + " ")]),
                            _vm.showNotebookList
                                ? _c("div",{ staticClass: "notebooksList", on: { click: _vm.handleNotebookClick } },
                                        _vm._l(_vm.notebookList, function (o) {
                                            return _c("div", { key: o.id, staticClass: "notebook", attrs: { "data-id": o.id, "data-name": o.name } }, [_vm._v(" " + _vm._s(o.name) + " ")]);
                                        }),
                                        0
                                    )
                                : _vm._e(),
                        ]),
                        _c("Calendar", { ref: "Calendar", attrs: { markDate: _vm.markArr, textTop: _vm.textTop }, on: { choseDay: _vm.clickDay, changeMonth: _vm.changeDate } }),
                    ],
                    1
                ),
            ]);
        };
        // end source code line 161 block

        var r = [],
            i = o("be6e"),
            s = o.n(i);

        ///////////////////////////////////
        // the core code of calendar app //
        ///////////////////////////////////
        var c = {
            name: "App",
            components: { Calendar: s.a },
            data() {
                return { 
                    date: "", 
                    week: "", 
                    markArr: [], 
                    DateLinkToNote: {}, 
                    textTop: ["一", "二", "三", "四", "五", "六", "日"], 
                    currentNotebook: {
                         name: "", id: null 
                    }, 
                    notebookList: [], 
                    showNotebookList: false ,
                    
                    // variable for daily note path
                    dailyNotePath: undefined, 
                    monthCurrent: undefined, 
                    dayCurrent: undefined,
                    template_path: undefined,
                    config_json_path: "/data/snippets/Calendar.config.json"
                };
            },
            created() {
                var now = new Date();
                this.date = now.getDate();  //得到日期
                var day = now.getDay();  //得到周几
                var arr_week = new Array(
                        "星期日",
                        "星期一", 
                        "星期二", 
                        "星期三", 
                        "星期四", 
                        "星期五", 
                        "星期六", 
                    );
                this.week = arr_week[day];
            },
            mounted() {
                this.$refs.today.addEventListener(
                    "click",
                    function () {
                        window.location.reload(!0);
                    },
                    false
                );
                this.$refs.week.addEventListener("click", this.handleWeekClick, false);
                this.init_open_app();
            },
            methods: {
                // 选中笔记本
                async handleNotebookClick(e) {
                    if (e.target.classList.contains("notebook")){
                        this.currentNotebook.name = e.target.getAttribute("data-name");
                        this.currentNotebook.id = e.target.getAttribute("data-id");
                        this.showNotebookList = false;
                        await this.set_crt_nb();

                        // also refersh the template path
                        this.markArr=[];  // 清除之前的日记缓存
                        console.log("[日历插件][Info] Switch currentNotebook to [" + this.currentNotebook.name +"]")
                        await this.parseNotePath();
                        await this.changeDate();
                    };
                },
                // 请求函数——向服务器接口发送请求
                async request(url, data = null, method = "POST") {
                    return new Promise((resolve, reject) => {
                        if ("POST" == method.toUpperCase()) {
                            fetch(url, { 
                                method: "POST", 
                                headers: { 
                                    "Content-Type": "application/json", 
                                    Authorization: "Token " 
                                }, 
                                body: JSON.stringify(data),
                            })
                            .then(
                                (data) => resolve(data.json()),
                                (err) => {
                                    reject(err);
                                }
                            )
                            .catch((err) => {
                                console.error("请求失败:", err);
                            });
                        } 
                    });
                },
                ////////////////////////////
                // 读写之前打开的笔记本记录 //
                ////////////////////////////
                // inspired from https://github.com/UFDXD/HBuilderX-Light/blob/main/theme.js
                
                async 写入文件(path, filedata, then = null, obj = null, isDir = false, modTime = Date.now()) {
                
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
                },

                async get_crt_nb() {

                    try {
                        let r = {"path": this.config_json_path}
                        let calendar_config = await this.request("/api/file/getFile", r);
                        this.currentNotebook = calendar_config;

                    } catch (err) {
                        console.log("[日历插件][Error] 大概率是由于第一次启动，配置文件 [" + this.config_json_path + "] 未创建，文件不存在造成的404, 错误日志如下:\n", err);
                        //大概率是文件没有创建，调用一下创建文件的命令即可
                        await this.set_crt_nb();
                    }

                },

                async set_crt_nb() {
                    await this.写入文件(this.config_json_path, JSON.stringify(this.currentNotebook, undefined, 4));
                },

                ////////////////////////////
                // 读写之前打开的笔记本记录 //
                ////////////////////////////
                
                // initialize notebook data
                async init_open_app(){

                    await this.get_crt_nb();

                    if (this.currentNotebook.name !== "") {
                        console.log("[日历插件][Info] currentNotebook is [" + this.currentNotebook.name +"]");
                    } else {// 在缓存数据中，找不到选中的笔记本
                        // 和下面的handleweekclick差不多的，但是直接调用那个函数会有问题，这边重复一下
                        // 获取所有打开的笔记本列表
                        let lsNotebooks = await this.request("/api/notebook/lsNotebooks");
                        if (
                            0 === lsNotebooks.code && 
                            lsNotebooks.data && 
                            lsNotebooks.data.notebooks
                        ) {
                            this.notebookList = lsNotebooks.data.notebooks.filter(
                                (item) => item.closed  === false
                            );
                        }

                        // set the first notebook as default, to avoid undefined error
                        this.currentNotebook.name = this.notebookList[0].name;
                        this.currentNotebook.id = this.notebookList[0].id;

                        await this.set_crt_nb();

                        // print log info
                        console.log("[日历插件][Info] 未在缓存中找到默认笔记本设置，使用笔记本["+ this.currentNotebook.name +"]作为默认");
                        let success_str = {"msg": "[日历插件][info] 未在缓存中找到默认笔记本设置，使用笔记本["+ this.currentNotebook.name +"]作为默认，如有需要请点击日历的【星期x】按钮进行切换", "timeout": 7000};
                        let print = await this.request("/api/notification/pushMsg", success_str);
                    }

                    this.changeDate();

                },
                // 新添加功能：解析笔记本路径
                async parseNotePath() {
                    // console.log("get in ParseNotePath function", this.currentNotebook.id);
                    // parse the notebook path
                    // path: `/daily note/${e[0]}/${e[1]}/${o}` -> default -> /daily note/2022/10/2022-10-29
                    let nid = { notebook: await this.currentNotebook.id },
                        nb_conf = await this.request("/api/notebook/getNotebookConf", nid);

                    if (0 === nb_conf.code && nb_conf.data) {
                        /////////////////////
                        // 解析日记模板路径 //
                        /////////////////////
                        var notePath = nb_conf.data.conf.dailyNoteSavePath;  // notePath = /今日速记/{{now | date "2006/2006.01"}}/{{now | date "2006.01.02"}}
                        console.log("[日历插件][info] 成功读取用户配置 | 读取日记本【"+ this.currentNotebook.name +"】的 模板路径 为", notePath);

                        // split the notePath to needed path
                        var notePathSplit = notePath.split('/{{') ;  // with 3 element: [/今日速记, now | date "2006/2006.01"}}, now | date "2006.01.02"}} ]
                        this.dailyNotePath = notePathSplit[0];  // -> /今日速记/

                        var monthPath = notePathSplit[1].replace('now | date "', '').replace('"}}', '');   // -> 2006/2006.01
                        this.monthCurrent = monthPath.replaceAll('2006', '${e[0]}').replaceAll('01', '${e[1]}');   // -> '${e[0]}/${e[0]}.${e[1]}'

                        var dayPath = notePathSplit[2].replace('now | date "', '').replace('"}}', ''); // -> 2006.01.02
                        this.dayCurrent = dayPath.replaceAll('2006', '${e[0]}').replaceAll('01', '${e[1]}').replaceAll('02', '${e[2]}')  // -> '${e[0]}.${e[1]}.${e[2]}'

                        console.log("[日历插件][info] 替换为当前日期的模板变量", this.dailyNotePath + '/' + this.monthCurrent + '/' + this.dayCurrent, "其中e为形如[2021, 10, 27]的当前日期变量");

                        /////////////////////
                        // 解析日记模板文件 //
                        /////////////////////

                        // 获取工作空间目录
                        let workspaceDir = "";
                        let systemConf = await this.request("/api/system/getConf");

                        // if can find workspace directory
                        if (systemConf && systemConf.data.conf.system.workspaceDir) {
                            // change the workspace directory to windows format
                            workspaceDir = systemConf.data.conf.system.workspaceDir.replace(/\\/g, "/");

                            this.template_path = `${workspaceDir}/data/templates${nb_conf.data.conf.dailyNoteTemplatePath}`.replace(/\//g, "\\");
                        }else{
                            // push error message
                            // 基本上也不会遇到问题
                            let error_str = {"msg": "[日历插件] 获取工作空间目录失败，请手动设置", "timeout": 7000};
                            let print = await this.request("/api/notification/pushErrMsg", error_str);
                            console.log("[日历插件][Error] 获取工作空间目录失败，请手动设置");
                            this.template_path = undefined;
                        };

                        // push message for users
                        //let print_str = {"msg": "[日历插件] 成功读取日记本【"+ this.currentNotebook.name +"】的配置", "timeout": 7000};
                       // let print = await this.request("/api/notification/pushMsg", print_str);
                    }else{
                        // push error message
                        // 通常情况下不会进入到这个分支里面，n.data已经在init里面成功获取了
                        let error_str = {"msg": "[日历插件] 读取用户配置失败，请点击日历面板->星期，选择对应的笔记本后再试", "timeout": 7000};
                        let print = await this.request("/api/notification/pushErrMsg", error_str);
                        console.log("[日历插件][Error] 读取用户配置失败，请点击日历面板->星期，选择对应的笔记本后再试", nb_conf.data)
                    }
                },
                // 点击日历中日期格子
                async clickDay(data) {
                    let e = data.split("/");
                    e[1] = e[1].padStart(2, "0");
                    e[2] = e[2].padStart(2, "0");
                    // e = [2021, 10, 22]

                    // let TempData = e.join("-"); // -> 2021-10-22
                    let TempData = eval('`'+this.dayCurrent+'`'); // -> 2021-10-22

                    if (this.DateLinkToNote[TempData]) {
                        try {
                            window.open(this.DateLinkToNote[TempData]);
                        } catch (err) {
                            console.log("[日历插件][Error]", err);
                        }
                    }else{ 
                        // 标记——点击没有日记文档的日期时
                        if (this.currentNotebook.id) {
                            // 创建指定日期的空白文档
                            // old code: r = { notebook: this.currentNotebook.id, path: `/daily note/${e[0]}/${e[1]}/${o}`, markdown: "" },
                            let createDocWithMdReqBody = { 
                                notebook: this.currentNotebook.id, 
                                path: eval('`'+this.dailyNotePath+'/'+this.monthCurrent+'/'+this.dayCurrent+'`'), 
                                markdown: "", 
                            };
                            let res = await this.request(
                                "/api/filetree/createDocWithMd", 
                                createDocWithMdReqBody,
                            );
                            console.log(createDocWithMdReqBody)

                            // 打开所创建的文档
                            if (0 === res.code && res.data) {
                                let DailyNoteID = res.data;
                                console.log(DailyNoteID);

                                try {
                                    window.open(`siyuan://blocks/${DailyNoteID}`);
                                    this.DateLinkToNote[TempData] = `siyuan://blocks/${DailyNoteID}`;
                                    this.markArr.push(TempData);

                                    // 如果设置了日记模板，则进行模板渲染
                                    if (typeof this.template_path !== 'undefined') {
                                        let r = { id: DailyNoteID, path: this.template_path };
                                        let resp = await this.request("/api/template/render", r);
                                        // success get dom from template
                                        if (resp && 0 == resp.code){
                                            const block_content = {
                                                "dataType": "dom",
                                                "data": resp.data.content,
                                                "parentID": DailyNoteID
                                            },
                                            bi = await this.request("/api/block/prependBlock", block_content);
                                            // console.log(resp, block_content, bi)
                                        }
                                    }
                                } catch (err) {
                                    console.log(err);
                                }
                            }
                        }  // end if (this.currentNotebook.id) {
                    }
                    ///
                },
                async changeDate(data) {
                    await this.$nextTick();
                    let dayArr = document.querySelectorAll(
                        ".wh_item_date:not(.wh_other_dayhide)"
                    );
                    let dateStr = document.querySelector(".wh_content_li");

                    (dateStr = dateStr.innerText), // 2022年10月
                    (dateStr = dateStr.replace(/年|月/g, "-"));  // 2022-10-

                    // parse the notebook path
                    // console.log(dateStr);
                    if (typeof await this.dayCurrent == 'undefined') {
                        // console.log("get in dayCurrent==undefined judge");
                        await this.parseNotePath();
                    }
                    let this_dayCurrent = await this.dayCurrent;
                    // console.log("def changeDate() this.dayCurrent: ", this.dayCurrent, this_dayCurrent);

                    dayArr.forEach((item) => {
                        let e = (dateStr + item.innerText).split("-");
                        // tempStr = ["2023", "1", "1"]
                        e[1] = e[1].padStart(2, "0");
                        e[2] = e[2].padStart(2, "0");
                        e = eval('`'+this_dayCurrent+'`');
                        // console.log("def changeDate() this.dayCurrent: in for loops ", this_dayCurrent, e);
                        this.AutoMarkDate(e);
                    });
                },
                async SiYuan_SQL_dailyNote(t) {
                    let url = "/api/query/sql",
                        data = { stmt: `select * from blocks  WHERE content LIKE '${t}' AND type = 'd' ORDER BY random() LIMIT 1` },
                        resData = null;
                    return (
                        await fetch(url, { body: JSON.stringify(data), method: "POST", headers: { Authorization: "Token " } })
                            .then(function (t) {
                                resData = t.json();
                            })
                            .catch((t) => {
                                console.log("[日历插件][Error]", t);
                            }),
                        resData
                    );
                },
                async AutoMarkDate(data) {
                    // console.log(data)
                    let res = await this.SiYuan_SQL_dailyNote(data);
                    // console.log(res)
                    if (!res.code && res.data.length > 0) {
                        let link = "siyuan://blocks/" + res.data[0].id;
                        this.DateLinkToNote[data] = link;
                        this.markArr.push(data);
                    }
                },
                async handleWeekClick() {
                    this.showNotebookList = !this.showNotebookList;
                    let lsNotebooks = await this.request("/api/notebook/lsNotebooks");
                    if (
                        0 === lsNotebooks.code && 
                        lsNotebooks.data && 
                        lsNotebooks.data.notebooks
                    ) {
                        this.notebookList = lsNotebooks.data.notebooks.filter(
                            (item) => item.closed  === false
                        );
                    }
                    
                },
            },
        },

        ///////////////////////////////////////
        // End the core code of calendar app //
        ///////////////////////////////////////
            l = c,
            d = (o("d49f"), o("2877")),
            u = Object(d["a"])(l, render, r, !1, null, null, null),
            h = u.exports;
        (a["a"].config.productionTip = !1), new a["a"]({ render: (t) => t(h) }).$mount("#app");
    },
    d49f: function (t, e, o) {
        "use strict";
        o("dbb8");
    },
    dbb8: function (t, e, o) {},
});