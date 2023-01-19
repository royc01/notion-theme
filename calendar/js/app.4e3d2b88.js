(function (t) {
    function e(e) {
        for (var a, i, s = e[0], c = e[1], l = e[2], u = 0, h = []; u < s.length; u++) (i = s[u]), Object.prototype.hasOwnProperty.call(n, i) && n[i] && h.push(n[i][0]), (n[i] = 0);
        for (a in c) Object.prototype.hasOwnProperty.call(c, a) && (t[a] = c[a]);
        d && d(e);
        while (h.length) h.shift()();
        return r.push.apply(r, l || []), o();
    }
    function o() {
        for (var t, e = 0; e < r.length; e++) {
            for (var o = r[e], a = !0, s = 1; s < o.length; s++) {
                var c = o[s];
                0 !== n[c] && (a = !1);
            }
            a && (r.splice(e--, 1), (t = i((i.s = o[0]))));
        }
        return t;
    }
    var a = {},
        n = { app: 0 },
        r = [];
    function i(e) {
        if (a[e]) return a[e].exports;
        var o = (a[e] = { i: e, l: !1, exports: {} });
        return t[e].call(o.exports, o, o.exports, i), (o.l = !0), o.exports;
    }
    (i.m = t),
        (i.c = a),
        (i.d = function (t, e, o) {
            i.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: o });
        }),
        (i.r = function (t) {
            "undefined" !== typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t, "__esModule", { value: !0 });
        }),
        (i.t = function (t, e) {
            if ((1 & e && (t = i(t)), 8 & e)) return t;
            if (4 & e && "object" === typeof t && t && t.__esModule) return t;
            var o = Object.create(null);
            if ((i.r(o), Object.defineProperty(o, "default", { enumerable: !0, value: t }), 2 & e && "string" != typeof t))
                for (var a in t)
                    i.d(
                        o,
                        a,
                        function (e) {
                            return t[e];
                        }.bind(null, a)
                    );
            return o;
        }),
        (i.n = function (t) {
            var e =
                t && t.__esModule
                    ? function () {
                          return t["default"];
                      }
                    : function () {
                          return t;
                      };
            return i.d(e, "a", e), e;
        }),
        (i.o = function (t, e) {
            return Object.prototype.hasOwnProperty.call(t, e);
        }),
        (i.p = "/");
    var s = (window["webpackJsonp"] = window["webpackJsonp"] || []),
        c = s.push.bind(s);
    (s.push = e), (s = s.slice());
    for (var l = 0; l < s.length; l++) e(s[l]);
    var d = c;
    r.push([0, "chunk-vendors"]), o();
})({
    0: function (t, e, o) {
        t.exports = o("56d7");
    },
    "56d7": function (t, e, o) {
        "use strict";
        o.r(e);
        var a = o("2b0e"),
            n = function () {
                var t = this,
                    e = t._self._c;
                return e("div", { attrs: { id: "app" } }, [
                    e(
                        "div",
                        { staticClass: "con" },
                        [
                            e("div", { staticClass: "now-data-myself" }, [
                                e("div", { ref: "today", staticClass: "now-data-myself-time", attrs: { title: "刷新" } }, [t._v(" " + t._s(t.date) + "日 ")]),
                                e("div", { ref: "week", staticClass: "now-data-myself-week", attrs: { title: t.currentNotebook.name } }, [t._v(" " + t._s(t.week) + " ")]),
                                t.showNotebookList
                                    ? e(
                                          "div",
                                          { staticClass: "notebooksList", on: { click: t.handleNotebookClick } },
                                          t._l(t.notebookList, function (o) {
                                              return e("div", { key: o.id, staticClass: "notebook", attrs: { "data-id": o.id, "data-name": o.name } }, [t._v(" " + t._s(o.name) + " ")]);
                                          }),
                                          0
                                      )
                                    : t._e(),
                            ]),
                            e("Calendar", { ref: "Calendar", attrs: { markDate: t.markArr, textTop: t.textTop }, on: { choseDay: t.clickDay, changeMonth: t.changeDate } }),
                        ],
                        1
                    ),
                ]);
            },
            r = [],
            i = o("be6e"),
            s = o.n(i),
            c = {
                name: "App",
                components: { Calendar: s.a },
                data() {
                    return { date: "", week: "", markArr: [], DateLinkToNote: {}, textTop: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], currentNotebook: { name: "", id: null }, notebookList: [], showNotebookList: !1 ,
                        // variable for daily note path
                        dailyNotePath: undefined, monthCurrent: undefined, dayCurrent: undefined,
                    };
                },
                created() {
                    var t = new Date();
                    this.date = t.getDate();
                    var e = t.getDay(),
                        o = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
                    this.week = o[e];
                },
                mounted() {
                    this.$refs.today.addEventListener(
                        "click",
                        function () {
                            window.location.reload(!0);
                        },
                        !1
                    ),
                        this.changeDate(),
                        this.$refs.week.addEventListener("click", this.handleWeekClick, !1),
                        localStorage.getItem("calendar_current_notebook") && (this.currentNotebook = JSON.parse(localStorage.getItem("calendar_current_notebook")));
                },
                methods: {
                    handleNotebookClick(t) {
                        t.target.classList.contains("notebook") &&
                            ((this.currentNotebook.name = t.target.getAttribute("data-name")),
                            (this.currentNotebook.id = t.target.getAttribute("data-id")),
                            (this.showNotebookList = !1),
                            localStorage.setItem("calendar_current_notebook", JSON.stringify(this.currentNotebook)));
                    },
                    async request(t, e = null, o = "POST") {
                        return new Promise((a, n) => {
                            "POST" == o.toUpperCase() &&
                                fetch(t, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Token " }, body: JSON.stringify(e) })
                                    .then(
                                        (t) => a(t.json()),
                                        (t) => {
                                            n(t);
                                        }
                                    )
                                    .catch((t) => {
                                        console.error("请求失败:", t);
                                    });
                        });
                    },
                    async parseNotePath(n) {
                        // console.log("get in ParseNotePath function", this.currentNotebook.id);
                        // parse the notebook path
                        // path: `/daily note/${e[0]}/${e[1]}/${o}` -> default -> /daily note/2022/10/2022-10-29
                        if (0 === n.code && n.data) {
                            // test push messages
                            let success_str = {"msg": "[日历插件][info] 成功读取用户配置", "timeout": 7000};
                            let print = await this.request("/api/notification/pushMsg", success_str);

                            var notePath = n.data.conf.dailyNoteSavePath;  // notePath = /今日速记/{{now | date "2006/2006.01"}}/{{now | date "2006.01.02"}}
                            console.log("[日历插件][info] 读取日历的模板路径：", notePath);
                            // split the notePath to needed path
                            var notePathSplit = notePath.split('/{{') ;  // with 3 element: [/今日速记, now | date "2006/2006.01"}}, now | date "2006.01.02"}} ]
                            this.dailyNotePath = notePathSplit[0];  // -> /今日速记/
    
                            var monthPath = notePathSplit[1].replace('now | date "', '').replace('"}}', '');   // -> 2006/2006.01
                            this.monthCurrent = monthPath.replaceAll('2006', '${e[0]}').replaceAll('01', '${e[1]}');   // -> '${e[0]}/${e[0]}.${e[1]}'
    
                            var dayPath = notePathSplit[2].replace('now | date "', '').replace('"}}', ''); // -> 2006.01.02
                            this.dayCurrent = dayPath.replaceAll('2006', '${e[0]}').replaceAll('01', '${e[1]}').replaceAll('02', '${e[2]}')  // -> '${e[0]}.${e[1]}.${e[2]}'
    
                            console.log("[日历插件][info] 替换为当前日期的模板变量", this.dailyNotePath + '/' + this.monthCurrent + '/' + this.dayCurrent, "其中e为[2021, 10, 27]的当前日期变量");
                        }else{
                            // push error message
                            let error_str = {"msg": "[日历插件][Error] 读取用户配置失败，请点击日历面板->星期，选择对应的笔记本后再试", "timeout": 7000};
                            let print = await this.request("/api/notification/pushMsg", error_str);
                        }
                    },
                    async clickDay(t) {
                        let e = t.split("/");
                        (e[1] = e[1].padStart(2, "0")), (e[2] = e[2].padStart(2, "0"));
                        // e = [2021, 10, 22]

                        // let o = e.join("-"); // -> 2021-10-22
                        let o = eval('`'+this.dayCurrent+'`'); // -> 2021-10-22
                        if (this.DateLinkToNote[o])
                            try {
                                window.open(this.DateLinkToNote[o]);
                            } catch (a) {
                                console.log("[日历插件][Error]", a);
                            }
                        else if (this.currentNotebook.id) {
                            let t = { notebook: this.currentNotebook.id },
                                n = await this.request("/api/notebook/getNotebookConf", t);

                            /////////////////////////////
                            // parse the notebook path //
                            /////////////////////////////
                            if (typeof this.dailyNotePath == 'undefined') {
                                this.parseNotePath(n);
                            }

                            //     r = { notebook: this.currentNotebook.id, path: `/daily note/${e[0]}/${e[1]}/${o}`, markdown: "" },
                            let r = { notebook: this.currentNotebook.id, path: eval('`'+this.dailyNotePath+'/'+this.monthCurrent+'/'+this.dayCurrent+'`'), markdown: "" },
                                i = await this.request("/api/filetree/createDocWithMd", r);
                            console.log(r)
                            if (0 === i.code && i.data) {
                                let t = i.data;
                                console.log(t);
                                try {
                                    window.open("siyuan://blocks/" + t), (this.DateLinkToNote[o] = "siyuan://blocks/" + t), this.markArr.push(o);
                                    let e = "",
                                        a = await this.request("/api/system/getConf");
                                    // if can find workspace directory
                                    if (a && a.data.conf.system.workspaceDir) {
                                        // change the e workspace directory
                                        e = a.data.conf.system.workspaceDir.replace(/\\/g, "/");
                                    }else{
                                        // push error message
                                        let error_str = {"msg": "[日历插件][Error] 获取工作空间目录失败，请手动设置", "timeout": 7000};
                                        let print = await this.request("/api/notification/pushMsg", error_str);
                                    }

                                    // ensure can find necessary data
                                    if ( 0 === n.code && n.data && n.data.conf ) {
                                        let o = n.data.conf,
                                            a = "";
                                        if (o.dailyNoteTemplatePath) {
                                            let n = `${e}/data/templates${o.dailyNoteTemplatePath}`.replace(/\//g, "\\"),
                                                r = { id: t, path: n },
                                                i = await this.request("/api/template/render", r);
                                            // success get dom from template
                                            if (i && 0 == i.code && (a = i.data.content)){
                                                const block_content = {
                                                    "dataType": "dom",
                                                    "data": i.data.content,
                                                    "parentID": t
                                                },
                                                bi = await this.request("/api/block/prependBlock", block_content);
                                                console.log(o, i, block_content, bi)
                                            }
                                        }
                                    }
                                } catch (a) {
                                    console.log(a);
                                }
                            }
                        }
                    },
                    async changeDate(t) {
                        await this.$nextTick();
                        let e = document.querySelectorAll(".wh_item_date:not(.wh_other_dayhide)"),
                            o = document.querySelector(".wh_content_li"),
                            nid = { notebook: this.currentNotebook.id },
                            n = await this.request("/api/notebook/getNotebookConf", nid);

                        (o = o.innerText), // 2022年10月
                        (o = o.replace(/年|月/g, "-"));  // 2022-10-

                        // parse the notebook path
                        // console.log(this.dayCurrent);
                        if (typeof this.dailyNotePath == 'undefined') {
                            this.parseNotePath(n);
                        }
                        // console.log(this.dayCurrent);

                        e.forEach((t) => {
                            let e = (o + t.innerText).split("-");
                            (e[1] = e[1].padStart(2, "0")), 
                            (e[2] = e[2].padStart(2, "0")), 
                            (e = eval('`'+this.dayCurrent+'`')), 
                            this.AutoMarkDate(e);
                        });
                    },
                    async SiYuan_SQL_dailyNote(t) {
                        let e = "/api/query/sql",
                            o = { stmt: `select * from blocks  WHERE content LIKE '${t}' AND type = 'd' ORDER BY random() LIMIT 1` },
                            a = null;
                        return (
                            await fetch(e, { body: JSON.stringify(o), method: "POST", headers: { Authorization: "Token " } })
                                .then(function (t) {
                                    a = t.json();
                                })
                                .catch((t) => {
                                    console.log("[日历插件][Error]", t);
                                }),
                            a
                        );
                    },
                    async AutoMarkDate(t) {
                        // console.log(t);
                        let e = await this.SiYuan_SQL_dailyNote(t);
                        if (!e.code && e.data.length > 0) {
                            let o = "siyuan://blocks/" + e.data[0].id;
                            (this.DateLinkToNote[t] = o), this.markArr.push(t);
                        }
                    },
                    async handleWeekClick() {
                        this.showNotebookList = !this.showNotebookList;
                        let t = await this.request("/api/notebook/lsNotebooks");
                        0 === t.code && t.data && t.data.notebooks && (this.notebookList = t.data.notebooks.filter((t) => !1 === t.closed));
                    },
                },
            },
            l = c,
            d = (o("d49f"), o("2877")),
            u = Object(d["a"])(l, n, r, !1, null, null, null),
            h = u.exports;
        (a["a"].config.productionTip = !1), new a["a"]({ render: (t) => t(h) }).$mount("#app");
    },
    d49f: function (t, e, o) {
        "use strict";
        o("dbb8");
    },
    dbb8: function (t, e, o) {},
});

//# sourceMappingURL=app.4e3d2b88.js.map