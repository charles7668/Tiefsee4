
/** 
 * 大量瀏覽模式
 */
class BulkView {

    public visible;
    public load;
    public load2;
    public pageNext;
    public pagePrev;
    public setColumns;
    public setFocus;
    public saveCurrentState;

    constructor(M: MainWindow) {

        var dom_bulkView = document.querySelector("#mView-bulkView") as HTMLTextAreaElement;
        var dom_bulkViewContent = dom_bulkView.querySelector(".bulkView-content") as HTMLElement;

        var dom_menu = document.querySelector("#menu-bulkView") as HTMLSelectElement;
        var dom_columns = dom_menu.querySelector(".js-columns") as HTMLElement;
        var dom_gaplessMode = dom_menu.querySelector(".js-gaplessMode") as HTMLSelectElement;
        var dom_fixedWidth = dom_menu.querySelector(".js-fixedWidth") as HTMLSelectElement;
        var dom_align = dom_menu.querySelector(".js-align") as HTMLSelectElement;
        var dom_indentation = dom_menu.querySelector(".js-indentation") as HTMLSelectElement;

        var dom_number = dom_menu.querySelector(".js-number") as HTMLInputElement;
        var dom_fileName = dom_menu.querySelector(".js-fileName") as HTMLInputElement;
        var dom_imageSize = dom_menu.querySelector(".js-imageSize") as HTMLInputElement;
        var dom_fileSize = dom_menu.querySelector(".js-fileSize") as HTMLInputElement;
        var dom_lastWriteDate = dom_menu.querySelector(".js-lastWriteDate") as HTMLInputElement;
        var dom_lastWriteTime = dom_menu.querySelector(".js-lastWriteTime") as HTMLInputElement;

        var dom_box_gaplessMode = dom_menu.querySelector(".js-box-gaplessMode") as HTMLDivElement;
        var dom_box_indentation = dom_menu.querySelector(".js-box-indentation") as HTMLDivElement;
        var dom_box_fixedWidth = dom_menu.querySelector(".js-box-fixedWidth") as HTMLDivElement;

        /** 名單列表 */
        var arFile: string[] = [];
        /** 項目的邊距 */
        var itemMargin = 0;
        /** 一頁顯示幾張圖片*/
        var imgMaxCount = 100;
        /** 當前頁數 */
        var pageNow = 1;

        /** 記錄離開時捲動到哪個位置 */
        var temp_scrollTop = -1;
        /** 用於判斷列表是否有異動 */
        var temp_arFile: string[] = [];
        /** 用於判斷是否有切換資料夾 */
        var temp_dirPath = "";
        /** 離開前記錄當時的頁碼 */
        var temp_pageNow = -1;
        /** 判斷是否有修改排序方式， SortType + OrderbyType */
        var temp_fileSortType = "";
        /** 判斷是否有捲動 */
        var temp_hasScrolled = false;
        /** 離開前記錄bulkViewContent的寬度 */
        var temp_scrollWidth = 0;
        /** 離開前記錄bulkViewContent的高度 */
        var temp_scrollHeight = 0;

        this.visible = visible;
        this.pageNext = pageNext;
        this.pagePrev = pagePrev;
        this.load = load;
        this.load2 = load2;
        this.setColumns = setColumns;
        this.saveCurrentState = saveCurrentState;
        /** 取得焦點 */
        this.setFocus = () => {
            dom_bulkViewContent.tabIndex = 0;
            dom_bulkViewContent.focus();
        }

        initEvent();


        function initEvent() {

            initGroupRadio(dom_columns); //初始化群組按鈕

            new ResizeObserver(() => { //區塊改變大小時
                requestAnimationFrame(() => {
                    updateColumns();
                })
            }).observe(dom_bulkView);

            //判斷是否有捲動
            dom_bulkView.addEventListener("wheel", () => {
                temp_hasScrolled = true;
            });
            dom_bulkView.addEventListener("touchmove", () => {
                temp_hasScrolled = true;
            });

            (dom_bulkView.querySelectorAll(".bulkView-pagination-prev") as NodeListOf<HTMLDivElement>).forEach(dom => {
                dom.addEventListener("click", () => {
                    pagePrev();
                });
            });
            (dom_bulkView.querySelectorAll(".bulkView-pagination-next") as NodeListOf<HTMLDivElement>).forEach(dom => {
                dom.addEventListener("click", () => {
                    pageNext();
                });
            });
            (dom_bulkView.querySelectorAll(".bulkView-pagination-select") as NodeListOf<HTMLSelectElement>).forEach(dom => {
                dom.addEventListener("input", () => {
                    let val = Number.parseInt(dom.value);
                    showPage(val);
                });
            });

            //------

            let arDomCheckbox = [
                dom_columns,
                dom_gaplessMode,
                dom_fixedWidth,
                dom_align,
                dom_indentation,
                dom_number,
                dom_fileName,
                dom_imageSize,
                dom_fileSize,
                dom_lastWriteDate,
                dom_lastWriteTime
            ];

            let temp_columns = -1; //記錄上一次的值
            arDomCheckbox.forEach((dom) => {
                dom.addEventListener("input", (e) => {
                    apply();
                    if (dom === dom_indentation) {
                        let columns = Number.parseInt(getGroupRadioVal(dom_columns));
                        let indentation = dom_indentation.value;
                        if (columns === 2) {
                            load(pageNow);
                        }
                    }
                });
            });

            //切換 欄 時
            dom_columns.addEventListener("click", (e) => {

                apply();

                let columns = Number.parseInt(getGroupRadioVal(dom_columns));
                let indentation = dom_indentation.value;
                if (indentation === "on") { //在開啟首圖進縮的情況下
                    if (temp_columns === 2 || columns === 2) { //從2欄切換成其他，或從其他切換成2欄
                        load(pageNow);
                    }
                }
                temp_columns = columns;

            });

        }


        /**
         * 從config讀取設定值並套用(用於初始化設定值)
         */
        function initSetting() {
            setGroupRadioVal(dom_columns, M.config.settings.bulkView.columns.toString());
            dom_gaplessMode.value = M.config.settings.bulkView.gaplessMode;
            dom_fixedWidth.value = M.config.settings.bulkView.fixedWidth;
            dom_align.value = M.config.settings.bulkView.align;
            dom_indentation.value = M.config.settings.bulkView.indentation;

            dom_number.checked = M.config.settings.bulkView.show.number;
            dom_fileName.checked = M.config.settings.bulkView.show.fileName
            dom_imageSize.checked = M.config.settings.bulkView.show.imageSize;
            dom_fileSize.checked = M.config.settings.bulkView.show.fileSize;
            dom_lastWriteDate.checked = M.config.settings.bulkView.show.lastWriteDate;
            dom_lastWriteTime.checked = M.config.settings.bulkView.show.lastWriteTime;
            apply();
        }


        /**
         * 套用設定
         */
        function apply() {

            let columns = M.config.settings.bulkView.columns = Number.parseInt(getGroupRadioVal(dom_columns));
            let gaplessMode = M.config.settings.bulkView.gaplessMode = dom_gaplessMode.value;
            let fixedWidth = M.config.settings.bulkView.fixedWidth = dom_fixedWidth.value;
            let align = M.config.settings.bulkView.align = dom_align.value;
            let indentation = M.config.settings.bulkView.indentation = dom_indentation.value;

            dom_bulkViewContent.setAttribute("columns", columns.toString());
            dom_bulkViewContent.setAttribute("align", align);
            if (columns === 1 || columns === 2) {
                dom_bulkViewContent.setAttribute("fixedWidth", fixedWidth);
            } else {
                dom_bulkViewContent.setAttribute("fixedWidth", "");
            }

            dom_bulkViewContent.setAttribute("gaplessMode", gaplessMode);
            updateColumns(columns);

            let number = M.config.settings.bulkView.show.number = dom_number.checked;
            let fileName = M.config.settings.bulkView.show.fileName = dom_fileName.checked;
            let imageSize = M.config.settings.bulkView.show.imageSize = dom_imageSize.checked;
            let fileSize = M.config.settings.bulkView.show.fileSize = dom_fileSize.checked;
            let lastWriteDate = M.config.settings.bulkView.show.lastWriteDate = dom_lastWriteDate.checked;
            let lastWriteTime = M.config.settings.bulkView.show.lastWriteTime = dom_lastWriteTime.checked;
            let arShow = [];
            if (number) { arShow.push("number"); }
            if (fileName) { arShow.push("fileName"); }
            if (imageSize) { arShow.push("imageSize"); }
            if (fileSize) { arShow.push("fileSize"); }
            if (lastWriteDate) { arShow.push("lastWriteDate"); }
            if (lastWriteTime) { arShow.push("lastWriteTime"); }
            dom_bulkViewContent.setAttribute("show", arShow.join(","));

            //顯示或隱藏區塊
            if (columns === 1 || columns === 2) { //無間距模式
                dom_box_gaplessMode.style.display = "block";
            } else {
                dom_box_gaplessMode.style.display = "none";
            }
            if (columns === 1 || columns === 2) { //鎖定寬度
                dom_box_fixedWidth.style.display = "block";
            } else {
                dom_box_fixedWidth.style.display = "none";
            }
            if (columns === 1) { //排列方向
                dom_align.style.display = "none";
            } else {
                dom_align.style.display = "block";
            }
            if (columns === 2) { //第一張圖縮排
                dom_box_indentation.style.display = "block";
            } else {
                dom_box_indentation.style.display = "none";
            }

        }


        function setColumns(n: number) {
            if (n < 1) { n = 1; }
            if (n > 8) { n = 8; }
            setGroupRadioVal(dom_columns, n.toString());
            dom_columns.dispatchEvent(new Event("input"));
        }
        function getColumns() {
            return M.config.settings.bulkView.columns;
        }
        function getFixedWidth() {
            return M.config.settings.bulkView.fixedWidth;
        }
        function getIndentation() {
            return M.config.settings.bulkView.indentation;
        }


        /**
         * 
         * @param n 
         */
        function updateColumns(n?: number) {
            if (n === undefined) {
                n = M.config.settings.bulkView.columns;
            }
            if (n < 1) { n = 1; }
            if (n > 8) { n = 8; }

            setGroupRadioVal(dom_columns, n.toString());
            dom_bulkView.setAttribute("columns", n.toString());
            updateSize();
        }


        /**
         * 重新計算項目大小
         * @param donItem 項目，未傳入則全部重新計算
         */
        function updateSize(donItem?: HTMLElement) {

            dom_bulkViewContent.style.paddingLeft = itemMargin + "px";
            dom_bulkViewContent.style.paddingTop = itemMargin + "px";
            //let domBulkViewWidth = dom_bulkViewContent.offsetWidth - 18 - (getColumns() + 1) * itemMargin;
            //let size = Math.floor(domBulkViewWidth / getColumns());
            let size = Math.floor(dom_bulkViewContent.offsetWidth / getColumns());

            let arItme;
            if (donItem === undefined) {
                arItme = dom_bulkViewContent.querySelectorAll(".bulkView-item");
            } else {
                arItme = [donItem];
            }

            for (let i = 0; i < arItme.length; i++) {
                const item = arItme[i] as HTMLElement;
                item.style.width = `calc( ${100 / getColumns()}% - ${itemMargin}px )`;
                item.style.marginRight = itemMargin + "px";
                item.style.marginBottom = itemMargin + "px";

                let itmecenter = item.querySelector(".bulkView-img") as HTMLElement;
                item.style.minHeight = size / 2 + "px";
                if (getColumns() <= 2) {
                    itmecenter.style.maxHeight = "";
                } else if (getColumns() === 3) {
                    itmecenter.style.maxHeight = size * 3 + "px";
                } else {
                    itmecenter.style.maxHeight = size * 2 + "px";
                }
            }
        }


        /** 
         * 顯示或隱藏dom
         */
        function visible(val: boolean) {
            if (val === true) {
                initSetting();
                dom_bulkView.style.display = "flex";
            } else {
                dom_bulkView.style.display = "none";
            }
        }

        /**
         * 記錄當前狀態(結束大量瀏覽模式前呼叫)
         */
        function saveCurrentState() {
            temp_scrollTop = dom_bulkView.scrollTop; //記錄離開時捲動到哪個位置
            temp_scrollWidth = dom_bulkViewContent.scrollWidth;
            temp_scrollHeight = dom_bulkViewContent.scrollHeight;
        }


        /**
         * 載入列表，並恢復到上次捲動的位置
         */
        async function load2() {

            //設定返回按鈕
            M.toolbarBack.visible(true);
            M.toolbarBack.setEvent(() => {
                M?.script.bulkView.close();
            });

            temp_hasScrolled = false;

            //比較兩個 string[] 是否一樣
            function arraysEqual(a: string[], b: string[]) {
                if (a === b) return true;
                if (a == null || b == null) return false;
                if (a.length !== b.length) return false;

                for (var i = 0; i < a.length; ++i) {
                    if (a[i] !== b[i]) return false;
                }
                return true;
            }

            //套用上次的高度
            function setLastHeight() {
                //如果寬度變化小於100，則暫時使用上次的高度，避免圖片載入完成前導致移位
                if (Math.abs(dom_bulkViewContent.scrollWidth - temp_scrollWidth) < 100) {
                    dom_bulkViewContent.style.minHeight = temp_scrollHeight + "px";
                    setTimeout(() => {
                        dom_bulkViewContent.style.minHeight = "";
                    }, 800);
                }
            }

            //返回上次捲動的位置
            function scrollToLastPosition() {
                dom_bulkView.scrollTop = temp_scrollTop;

                for (let i = 1; i <= 8; i++) {
                    setTimeout(() => {
                        if (temp_hasScrolled === false && temp_pageNow === pageNow) {
                            dom_bulkView.scrollTop = temp_scrollTop;
                        }
                    }, 100 * i);
                }
            }

            arFile = Array.from(M.fileLoad.getWaitingFile());

            if (temp_dirPath === M.fileLoad.getDirPath() && arraysEqual(arFile, temp_arFile)) { //完全一樣

                setLastHeight(); //套用上次的高度
                scrollToLastPosition(); //返回上次捲動的位置

            } else if (temp_dirPath === M.fileLoad.getDirPath()) {

                let fileSortType = M.fileSort.getSortType() + M.fileSort.getOrderbyType();
                if (temp_fileSortType === fileSortType) { //資料夾一樣，排序一樣 (名單不一樣)

                    setLastHeight(); //套用上次的高度
                    scrollToLastPosition(); //返回上次捲動的位置
                    await load(pageNow);

                } else { //資料夾一樣，排序不一樣

                    dom_bulkView.scrollTop = 0; //捲動到最上面
                    await load();

                }

            } else { //完全不一樣

                dom_bulkView.scrollTop = 0; //捲動到最上面
                await load();

            }

            temp_arFile = arFile;
            temp_dirPath = M.fileLoad.getDirPath();
            temp_fileSortType = M.fileSort.getSortType() + M.fileSort.getOrderbyType();
            temp_pageNow = pageNow;
        }


        /**
         * 載入列表
         * @param page 
         */
        async function load(page = 0) {

            arFile = Array.from(M.fileLoad.getWaitingFile());
            if (arFile === undefined) { return; }

            if (getIndentation() === "on" && getColumns() === 2) {
                if (baseWindow.appInfo !== undefined) {
                    let path = Lib.Combine([baseWindow.appInfo.appDirPath, "\\www\\img\\indentation.svg"])
                    arFile.unshift(path);
                }
            }

            showPage(page);
        }


        //以定時的方式執行 show() ，如果在圖片載入完成前接受到多次指令，則只會執行最後一個指令
        var _showPage = async () => { };
        async function timerPage() {
            let func = _showPage;
            _showPage = async () => { };
            await func();

            setTimeout(() => { timerPage(); }, 50);  //遞迴
        }
        timerPage();


        /**
         * 載入頁面
         * @param _page 
         */
        async function showPage(_page?: number) {

            if (_page === undefined) { _page = pageNow; }
            if (_page !== undefined) { pageNow = _page; }
            pageNow = _page;
            if (pageNow < 1) { pageNow = 1; }
            let pageMax = Math.ceil(arFile.length / imgMaxCount);
            if (pageNow >= pageMax) { pageNow = pageMax; }

            updatePagination(); //更新分頁器

            _showPage = async () => {

                let start = ((pageNow - 1) * imgMaxCount);

                dom_bulkViewContent.innerHTML = "";
                for (let i = 0; i < 10; i++) { //分成10次處理
                    let start2 = start + (imgMaxCount / 10) * (i);
                    let end = start + (imgMaxCount / 10) * (i + 1);
                    let newArr = arFile.slice(start2, end); //取得陣列特定範圍
                    if (newArr.length === 0) { break; }
                    let retAr = await WebAPI.getFileInfo2List(newArr);

                    for (let j = 0; j < retAr.length; j++) {
                        const item = retAr[j];
                        let path = item.Path;
                        newItem(path, i * 10 + j);
                    }
                }

                updateColumns();
            }

        }


        /**
         * 更新分頁器
         */
        function updatePagination() {

            let pageMax = Math.ceil(arFile.length / imgMaxCount);

            //更新分頁器下拉選單
            (dom_bulkView.querySelectorAll(".bulkView-pagination-select") as NodeListOf<HTMLSelectElement>).forEach(dom => {
                let html = "";
                for (let i = 0; i < pageMax; i++) {
                    let n = i + 1;
                    let start = i * imgMaxCount + 1;
                    let end = (i + 1) * imgMaxCount;
                    if (end >= arFile.length) { end = arFile.length; }
                    if (getIndentation() === "on" && getColumns() === 2) { //如果有使用首圖縮排
                        start -= 1;
                        end -= 1;
                    }
                    html += `<option value="${n}">${n}　(${start}~${end})</option>`;
                }
                dom.innerHTML = html;
                dom.value = pageNow.toString();
            });

            //不能在上下一頁就禁止點擊
            (dom_bulkView.querySelectorAll(".bulkView-pagination-prev") as NodeListOf<HTMLElement>).forEach(dom => {
                if (pageNow === 1) {
                    dom.setAttribute("freeze", "true");
                } else {
                    dom.setAttribute("freeze", "");
                }
            });
            (dom_bulkView.querySelectorAll(".bulkView-pagination-next") as NodeListOf<HTMLElement>).forEach(dom => {
                if (pageNow === pageMax) {
                    dom.setAttribute("freeze", "true");
                } else {
                    dom.setAttribute("freeze", "");
                }
            });

            //只有一頁就隱藏分頁器
            (dom_bulkView.querySelectorAll(".bulkView-pagination") as NodeListOf<HTMLElement>).forEach(dom => {
                if (pageMax !== 1) {
                    dom.setAttribute("active", "true");
                } else {
                    dom.setAttribute("active", "");
                }
            });

        }


        /**
         * 
         * @param path 
         * @param n 
         * @returns 
         */
        async function newItem(path: string, n: number) {

            let temp_pageNow = pageNow;
            let temp_dir = M.fileLoad.getFilePath();

            let fileInfo2 = await WebAPI.getFileInfo2(path);

            let div = newDom(/*html*/`
                <div class="bulkView-item">
                    <div class="bulkView-center bulkView-loading">
                        <img class="bulkView-img">
                    </div>
                </div>
            `)
            updateSize(div);
            dom_bulkViewContent.appendChild(div);

            let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
            let fileType = Lib.GetFileType(fileInfo2); //取得檔案類型
            let configItem = M.config.getAllowFileTypeItem(GroupType.img, fileType); // ex. { ext:"psd", type:"magick" }
            if (configItem === null) {
                configItem = { ext: "", type: "vips", vipsType: "magick" }
            }
            let configType = configItem.type;

            let vipsType = configItem.vipsType as string;
            let arUrl: { scale: number, url: string }[] = [];
            let width = -1;
            let height = -1;

            if (Lib.IsAnimation(fileInfo2) === true) { //判斷是否為動圖

                let imgInitInfo = await WebAPI.Img.webInit(fileInfo2);
                if (imgInitInfo.code == "1") {
                    width = imgInitInfo.width;
                    height = imgInitInfo.height;
                    arUrl.push({ scale: 1, url: imgInitInfo.path });
                }

            } else if (configType === "vips") {

                let imgInitInfo = await WebAPI.Img.vipsInit(vipsType, fileInfo2);
                if (imgInitInfo.code == "1") {

                    width = imgInitInfo.width;
                    height = imgInitInfo.height;

                    let ratio = Number(M.config.settings.image.tiefseeviewBigimgscaleRatio);
                    if (isNaN(ratio)) { ratio = 0.8; }
                    if (ratio > 0.95) { ratio = 0.95; }
                    if (ratio < 0.5) { ratio = 0.5; }

                    //設定縮放的比例
                    arUrl.push({ scale: 1, url: Lib.pathToURL(imgInitInfo.path) + `?${fileTime}` });
                    for (let i = 1; i <= 30; i++) {
                        let scale = Number(Math.pow(ratio, i).toFixed(3));
                        if (imgInitInfo.width * scale < 200 || imgInitInfo.height * scale < 200) { //如果圖片太小就不處理
                            break;
                        }
                        let imgU = WebAPI.Img.vipsResize(scale, fileInfo2);
                        arUrl.push({ scale: scale, url: imgU })
                    }

                }

            } else { //直接開啟網址

                let url = await WebAPI.Img.getUrl(configType, fileInfo2); //取得圖片網址
                let imgInitInfo = await WebAPI.Img.webInit(url);
                if (imgInitInfo.code == "1") {
                    width = imgInitInfo.width;
                    height = imgInitInfo.height;
                    arUrl.push({ scale: 1, url: imgInitInfo.path });
                }

            }

            if (width === -1) {
                let url = await WebAPI.Img.getUrl("icon", fileInfo2); //取得圖片網址
                width = 256;
                height = 256;
                arUrl.push({ scale: 1, url: url });
            }

            //--------

            if (temp_pageNow !== pageNow) {
                console.warn(`${temp_pageNow} !== ${pageNow}`)
                return;
            }

            //---------

            n = n + 1 + (pageNow - 1) * imgMaxCount;
            if (getIndentation() === "on" && getColumns() === 2) { //如果有使用首圖縮排
                n -= 1;
            }

            let fileName = Lib.GetFileName(fileInfo2.Path);
            let LastWriteTimeUtc = fileInfo2.LastWriteTimeUtc;
            let writeDate = new Date(LastWriteTimeUtc).format("yyyy-MM-dd");
            let writeTime = new Date(LastWriteTimeUtc).format("hh:mm:ss");
            let fileSize = Lib.getFileLength(fileInfo2.Lenght);

            div.innerHTML = /*html*/`
                <div class="bulkView-header">
                    <div class="bulkView-number">${n}</div>
                    <div class="bulkView-fileName">${fileName}</div>
                </div>
                <div class="bulkView-header2">
                    <div class="bulkView-tag bulkView-imageSize">${width},${height}</div>
                    <div class="bulkView-tag bulkView-fileSize">${fileSize}</div>
                    <div class="bulkView-tag bulkView-lastWriteDate">${writeDate}</div>
                    <div class="bulkView-tag bulkView-lastWriteTime">${writeTime}</div>
                </div>
                <div class="bulkView-center">
                    <img class="bulkView-img">
                </div>
            `
            updateSize(div);

            //點擊圖片後，退出大量瀏覽模式
            div.addEventListener("click", async () => {
                if (n !== 0) {
                    M.script.bulkView.close();
                    await M.fileLoad.showFile(n - 1);

                    //設定返回按鈕
                    M.toolbarBack.visible(true);
                    M.toolbarBack.setEvent(() => {
                        M.script.bulkView.show();
                    });
                }
            });

            let dom_img = div.querySelector(".bulkView-img") as HTMLImageElement;
            let dom_center = div.querySelector(".bulkView-center") as HTMLDivElement;

            //載入失敗時
            if (dom_img.onerror === null) {
                dom_img.onerror = () => {
                    dom_img.src = "./img/error.svg";
                }
            }

            //區塊改變大小時
            new ResizeObserver(() => {
                requestAnimationFrame(() => {

                    let ret = arUrl[0];
                    let boxWidth = dom_center.offsetWidth;
                    if (boxWidth <= 0) {
                        return;
                    }

                    //如果是1欄或2欄且有鎖定寬度
                    if (getFixedWidth() !== "off") {
                        let columns = getColumns();
                        if (columns === 1 || columns === 2) {
                            boxWidth = boxWidth * Number.parseInt(getFixedWidth()) / 100;
                        }
                    }

                    let nowScale = boxWidth / width;
                    for (let i = arUrl.length - 1; i >= 0; i--) {
                        const item = arUrl[i];
                        if (item.scale >= nowScale) {
                            ret = item;
                            break;
                        }
                    }

                    if (dom_img.getAttribute("src") !== ret.url) {
                        dom_img.setAttribute("src", ret.url);
                    }
                })
            }).observe(div);


        }


        /**
         * 下一頁
         */
        function pageNext() {
            let page = pageNow;
            page += 1;
            let pageMax = Math.ceil(arFile.length / imgMaxCount);
            if (page >= pageMax) { page = pageMax; }
            if (page !== pageNow) { //如果已經到達最後一頁就不做任何事情
                pageNow = page;
                showPage();
            }
        }


        /**
         * 上一頁
         */
        function pagePrev() {
            let page = pageNow;
            page -= 1;
            if (page <= 1) { page = 1; }
            if (page !== pageNow) { //如果已經是第一頁就不做任何事情
                pageNow = page;
                showPage();
            }
        }


        /** 初始化群組按鈕 */
        function initGroupRadio(dom: HTMLElement) {
            dom.addEventListener("click", (e) => {
                let domActive = e.target as HTMLElement;
                if (domActive === null) { return; }
                let value = domActive.getAttribute("value");
                if (value === null) { value = ""; }
                setGroupRadioVal(dom, value);
            })

            let domActive = dom.querySelector("[active=true]");
            if (domActive === null) { return ""; }
            let value = domActive.getAttribute("value");
            if (value === null) { value = ""; }
            return value;
        }
        /** 取得群組按鈕的值 */
        function getGroupRadioVal(dom: HTMLElement) {
            let domActive = dom.querySelector("[active=true]");
            if (domActive === null) { return ""; }
            let value = domActive.getAttribute("value");
            if (value === null) { value = ""; }
            return value;
        }
        /** 設定群組按鈕的值 */
        function setGroupRadioVal(dom: HTMLElement, value: string) {
            let arDom = dom.querySelectorAll("div");
            for (let i = 0; i < arDom.length; i++) {
                arDom[i].setAttribute("active", "");
            }

            let domActive = dom.querySelector(`[value="${value}"]`);
            if (domActive === null) { return; }
            domActive.setAttribute("active", "true");
        }

    }

}