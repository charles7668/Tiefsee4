class FileShow {

    public openImage;
    public openVideo;
    public openPdf;
    public openTxt;
    public openWelcome;
    public openNone;
    public openBulkView;
    public getIsLoaded;
    public getGroupType;

    public tiefseeview;
    public dom_imgview;

    public iframes;

    constructor(M: MainWindow) {

        var dom_imgview = document.querySelector("#mView-tiefseeview") as HTMLDivElement;
        var tiefseeview: Tiefseeview = new Tiefseeview(dom_imgview);
        var iframes = new Iframes(M);
        var isLoaded = true;
        /** 目前顯示的類型 */
        var _groupType = GroupType.none;

        this.openImage = openImage;
        this.openVideo = openVideo;
        this.openPdf = openPdf;
        this.openTxt = openTxt;
        this.openWelcome = openWelcome;
        this.openNone = openNone;
        this.openBulkView = openBulkView;
        this.getIsLoaded = getIsLoaded;
        this.getGroupType = getGroupType;

        this.dom_imgview = dom_imgview;
        this.tiefseeview = tiefseeview;

        this.iframes = iframes;

        /** 
         * 取得 目前顯示的類型
         */
        function getGroupType() { return _groupType }

        /**
         * 
         * @param groupType 
         * @returns 
         */
        function setShowType(groupType: string) {

            _groupType = groupType;

            document.body.setAttribute("showType", groupType); // 搭配CSS，用於顯示或隱藏某些選項

            let arToolbarGroup = document.querySelectorAll(".main-toolbar-group");
            for (let i = 0; i < arToolbarGroup.length; i++) {
                const item = arToolbarGroup[i];
                item.setAttribute("active", "");
            }

            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                M.mainFileList.setHide(true); // 暫時隱藏 檔案預覽視窗
                M.mainDirList.setHide(true); // 暫時隱藏 資料夾預覽視窗
                M.mainExif.setHide(true); // 暫時隱藏 詳細資料視窗
                M.largeBtn.setHide(true); // 暫時隱藏 大型切換按鈕
            } else if (groupType === GroupType.img || groupType === GroupType.imgs || groupType === GroupType.video) {
                M.mainFileList.setHide(false); // 解除隱藏 檔案預覽視窗
                M.mainDirList.setHide(false); // 解除隱藏 資料夾預覽視窗
                M.mainExif.setHide(false); // 解除隱藏 詳細資料視窗
                M.largeBtn.setHide(false); // 解除隱藏 大型切換按鈕
            } else if (groupType === GroupType.bulkView) {
                M.mainFileList.setHide(true); // 暫時隱藏 檔案預覽視窗
                M.mainDirList.setHide(false); // 解除隱藏 資料夾預覽視窗
                M.mainExif.setHide(true); // 暫時隱藏 詳細資料視窗
                M.largeBtn.setHide(true); // 暫時隱藏 大型切換按鈕
            } else {
                M.mainFileList.setHide(false); // 解除隱藏 檔案預覽視窗
                M.mainDirList.setHide(false); // 解除隱藏 資料夾預覽視窗
                M.mainExif.setHide(false); // 解除隱藏 詳細資料視窗
                M.largeBtn.setHide(true); // 暫時隱藏 大型切換按鈕
            }


            if (groupType === GroupType.none) {
                setShowToolbar(GroupType.none); // 更換工具列
            }

            if (groupType === GroupType.welcome) {
                setShowToolbar(GroupType.welcome);
                iframes.welcomeview.visible(true);
            } else {
                iframes.welcomeview.visible(false);
            }

            if (groupType === GroupType.img || groupType === GroupType.video) {
                setShowToolbar(GroupType.img);
                dom_imgview.style.display = "block";
            } else {
                dom_imgview.style.display = "none";
                tiefseeview.loadNone();
            }

            if (groupType === GroupType.bulkView) {
                setShowToolbar(GroupType.bulkView);
                M.bulkView.visible(true);
            } else {
                M.bulkView.visible(false);
            }

            if (groupType === GroupType.imgs) {
            }

            if (groupType === GroupType.txt) {
                setShowToolbar(GroupType.txt);
                iframes.textView.visible(true);
            } else {
                iframes.textView.visible(false);
                iframes.textView.loadNone();
            }

            if (groupType === GroupType.monacoEditor) {
                setShowToolbar(GroupType.txt);
                iframes.monacoEditor.visible(true);
            } else {
                iframes.monacoEditor.visible(false);
                iframes.monacoEditor.loadNone();
            }

            if (groupType === GroupType.pdf) {
                setShowToolbar(GroupType.pdf);
                iframes.pdfview.visible(true);
            } else {
                iframes.pdfview.visible(false);
            }

            if (groupType === GroupType.office) {
                setShowToolbar(GroupType.pdf);
                iframes.pDFTronWebviewer.visible(true);
            } else {
                iframes.pDFTronWebviewer.loadNone();
                iframes.pDFTronWebviewer.visible(false);
            }

            if (groupType === GroupType.md) {
                setShowToolbar(GroupType.txt);
                iframes.cherryMarkdown.visible(true);
            } else {
                iframes.cherryMarkdown.visible(false);
                iframes.cherryMarkdown.loadNone();
            }

        }

        /**
         * 
         * @param type 
         * @returns 
         */
        function getToolbarDom(type: string): HTMLElement | null {
            return M.dom_toolbar.querySelector(`.main-toolbar-group[data-name="${type}"]`);
        }

        /**
         * 更換工具列
         * @param type 
         */
        function setShowToolbar(type: string) {
            let arToolbarGroup = document.querySelectorAll(".main-toolbar-group");
            for (let i = 0; i < arToolbarGroup.length; i++) {
                const item = arToolbarGroup[i];
                item.setAttribute("active", "");
            }

            getToolbarDom(type)?.setAttribute("active", "true"); // 更換工具列
        }

        /**
         * 
         */
        function getIsLoaded() {
            return isLoaded;
        }

        /**
         * 載入圖片
         */
        async function openImage(fileInfo2: FileInfo2) {

            isLoaded = false;
            setShowType(GroupType.img); // 改變顯示類型
            let imgurl = fileInfo2.Path; // 圖片網址

            tiefseeview.setLoading(true, 200);

            let imgData = await M.script.img.getImgData(fileInfo2);
            let width = imgData.width;
            let height = imgData.height;
            let arUrl = imgData.arUrl;
            let isAnimation = imgData.isAnimation;
            let isFail = imgData.isFail;

            // 如果圖片載入失敗，就接著判斷是否為文字檔
            if (isFail) {
                if (await WebAPI.isBinary(fileInfo2) === false) {
                    await openTxt(fileInfo2);
                    return;
                }
            }

            if (isAnimation) { // 判斷是否為動圖

                imgurl = await WebAPI.Img.getUrl("web", fileInfo2); // 取得圖片網址並且預載入
                await tiefseeview.loadImg(imgurl); // 使用<img>渲染

            } else {

                // 縮放方式與對齊方式
                let _zoomVal: number = M.config.settings.image.tiefseeviewZoomValue;
                let _zoomType: TiefseeviewZoomType = (<any>TiefseeviewZoomType)[M.config.settings.image.tiefseeviewZoomType];
                if (_zoomType === undefined) { _zoomType = TiefseeviewZoomType["fitWindowOrImageOriginal"] }

                if (arUrl.length === 1) {
                    await tiefseeview.loadBigimg(
                        arUrl[0].url
                    );

                } else {
                    await tiefseeview.loadBigimgscale(
                        arUrl,
                        width, height,
                        _zoomType, _zoomVal
                    );
                }
            }

            initTiefseeview(fileInfo2);
            isLoaded = true;
        }

        /**
         * 載入影片
         */
        async function openVideo(fileInfo2: FileInfo2) {

            isLoaded = false;
            let _path = fileInfo2.Path;
            setShowType(GroupType.video); // 改變顯示類型
            let imgurl = _path; // 圖片網址

            if (M.fileLoad.getGroupType() === GroupType.unknown) { // 如果是未知的類型
                imgurl = await WV_Image.GetFileIcon(_path, 256); // 取得檔案總管的圖示
            } else {
                imgurl = await WebAPI.Img.getUrl("web", fileInfo2);
            }

            tiefseeview.setLoading(true, 200);
            await tiefseeview.preloadImg(imgurl); // 預載入
            await tiefseeview.loadVideo(imgurl); // 使用video渲染

            initTiefseeview(fileInfo2);
            isLoaded = true;
        }

        /**
         * 
         */
        async function initTiefseeview(fileInfo2: FileInfo2) {
            tiefseeview.setLoading(false);
            await tiefseeview.transformRefresh(false); // 初始化 旋轉、鏡像
            tiefseeview.setEventChangeZoom(((ratio: number) => {
                let txt = (ratio * 100).toFixed(0) + "%"

                let dom_btnScale = M.dom_toolbar.querySelector(`[data-name="btnScale"]`); // 工具列
                if (dom_btnScale !== null) { dom_btnScale.innerHTML = txt; }

                M.mainMenu.updateRightMenuImageZoomRatioTxt(txt); // 更新 右鍵選單的圖片縮放比例
            }))

            // 縮放方式與對齊方式
            let _zoomType: TiefseeviewZoomType = (<any>TiefseeviewZoomType)[M.config.settings.image.tiefseeviewZoomType];
            let _zoomVal: number = M.config.settings.image.tiefseeviewZoomValue;
            let _alignType: TiefseeviewAlignType = (<any>TiefseeviewAlignType)[M.config.settings.image.tiefseeviewAlignType];
            if (_zoomType === undefined) { _zoomType = TiefseeviewZoomType["fitWindowOrImageOriginal"] }
            if (_alignType === undefined) { _alignType = TiefseeviewAlignType["center"] }
            tiefseeview.zoomFull(_zoomType, _zoomVal);
            tiefseeview.setAlign(_alignType);

            // 圖片長寬
            let dom_size = getToolbarDom(GroupType.img)?.querySelector(`[data-name="infoSize"]`);
            if (dom_size != null) {
                dom_size.innerHTML = `${tiefseeview.getOriginalWidth()}<br>${tiefseeview.getOriginalHeight()}`;
            }

            // 檔案類型
            let dom_type = getToolbarDom(GroupType.img)?.querySelector(`[data-name="infoType"]`);
            if (dom_type != null) {
                let fileType = Lib.GetFileType(fileInfo2);
                let fileLength = Lib.getFileLength(fileInfo2.Lenght);
                dom_type.innerHTML = `${fileType}<br>${fileLength}`;
            }

            // 檔案修改時間
            let dom_writeTime = getToolbarDom(GroupType.img)?.querySelector(`[data-name="infoWriteTime"]`);
            if (dom_writeTime != null) {
                let timeUtc = fileInfo2.LastWriteTimeUtc;
                let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                dom_writeTime.innerHTML = time;
            }
        }

        /**
         * pdf 或 ai
         */
        async function openPdf(fileInfo2: FileInfo2) {

            let _path = fileInfo2.Path;

            let fileType = Lib.GetFileType(fileInfo2); // 取得檔案類型
            let configItem = M.config.getAllowFileTypeItem(GroupType.pdf, fileType); // ex. { ext:"psd", type:"magick" }
            if (configItem == undefined) {
                configItem = { ext: "", type: "pdf" }
            }
            let configType = configItem.type;

            if (configType == "pdf") {
                setShowType(GroupType.pdf); // 改變顯示類型
                iframes.pdfview.loadFile(fileInfo2);
            }

            if (configType == "PDFTronWebviewer") {
                setShowType(GroupType.office); // 改變顯示類型
                iframes.setTheme();
                await iframes.pDFTronWebviewer.loadFile(_path);
            }


            // 檔案類型
            let dom_type = getToolbarDom(GroupType.pdf)?.querySelector(`[data-name="infoType"]`);
            if (dom_type != null) {
                let fileType = Lib.GetFileType(fileInfo2).toLocaleUpperCase();
                let fileLength = Lib.getFileLength(fileInfo2.Lenght);
                dom_type.innerHTML = `${fileType}<br>${fileLength}`;
            }

            // 檔案修改時間
            let dom_writeTime = getToolbarDom(GroupType.pdf)?.querySelector(`[data-name="infoWriteTime"]`);
            if (dom_writeTime != null) {
                let timeUtc = fileInfo2.LastWriteTimeUtc;
                let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                dom_writeTime.innerHTML = time;
            }

        }

        /**
         * 純文字
         */
        async function openTxt(fileInfo2: FileInfo2) {

            let _path = fileInfo2.Path;

            let fileType = Lib.GetFileType(fileInfo2); // 取得檔案類型
            let configItem = M.config.getAllowFileTypeItem(GroupType.txt, fileType); // ex. { ext:"psd", type:"magick" }
            if (configItem == undefined) {
                configItem = { ext: "", type: "auto" }
            }
            let configType = configItem.type;

            if (baseWindow.appInfo === undefined) { return; }

            let txt = await WebAPI.getText(_path);

            if (configType === "md") {

                setShowType(GroupType.md); // 改變顯示類型
                iframes.setTheme();
                let dir = Lib.GetDirectoryName(_path) as string;
                dir = Lib.pathToURL(dir) + "/";
                await iframes.cherryMarkdown.setReadonly(M.getIsQuickLook());
                await iframes.cherryMarkdown.loadFile(txt, dir);

            } else if (baseWindow.appInfo.plugin.MonacoEditor) {

                setShowType(GroupType.monacoEditor); // 改變顯示類型
                iframes.setTheme();
                if (configType == "auto") {
                    await iframes.monacoEditor.loadFile(txt, _path);
                } else {
                    await iframes.monacoEditor.loadTxt(txt, configType);
                }
                await iframes.monacoEditor.setReadonly(M.getIsQuickLook());

            } else {

                setShowType(GroupType.txt); // 改變顯示類型
                iframes.setTheme();
                iframes.textView.setReadonly(M.getIsQuickLook());
                iframes.textView.loadTxt(txt);
            }

            // 檔案類型
            let dom_type = getToolbarDom(GroupType.txt)?.querySelector(`[data-name="infoType"]`);
            if (dom_type != null) {
                let fileType = Lib.GetFileType(fileInfo2).toLocaleUpperCase();
                let fileLength = Lib.getFileLength(fileInfo2.Lenght);
                dom_type.innerHTML = `${fileType}<br>${fileLength}`;
            }

            // 檔案修改時間
            let dom_writeTime = getToolbarDom(GroupType.txt)?.querySelector(`[data-name="infoWriteTime"]`);
            if (dom_writeTime != null) {
                let timeUtc = fileInfo2.LastWriteTimeUtc;
                let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                dom_writeTime.innerHTML = time;
            }

        }

        /**
         * 起始畫面
         */
        async function openWelcome() {
            baseWindow.setTitle("Tiefsee 4");
            M.fileLoad.setGroupType(GroupType.welcome);
            M.fileLoad.stopFileWatcher();
            setShowType(GroupType.welcome); // 改變顯示類型
        }

        /**
         * 不顯示任何東西
         */
        function openNone() {
            baseWindow.setTitle("Tiefsee 4");
            M.fileLoad.setGroupType(GroupType.none);
            setShowType(GroupType.none); // 改變顯示類型
            M.fileLoad.stopFileWatcher();

            tiefseeview.zoomFull(TiefseeviewZoomType["imageOriginal"]);
            let dom_size = getToolbarDom(GroupType.img)?.querySelector(`[data-name="infoSize"]`); // 圖片長寬
            let dom_type = getToolbarDom(GroupType.img)?.querySelector(`[data-name="infoType"]`); // 檔案類型
            let dom_writeTime = getToolbarDom(GroupType.img)?.querySelector(`[data-name="infoWriteTime"]`);   // 檔案修改時間
            if (dom_size) { dom_size.innerHTML = ""; }
            if (dom_type) { dom_type.innerHTML = ""; }
            if (dom_writeTime) { dom_writeTime.innerHTML = ""; }
        }

        /**
         * 大量瀏覽模式
         */
        async function openBulkView() {

            setShowType(GroupType.bulkView); // 改變顯示類型

            // 資料夾修改時間
            let dir = M.fileLoad.getDirPath();
            let fileInfo2 = await WebAPI.getFileInfo2(dir);
            let dom_writeTime = getToolbarDom(GroupType.bulkView)?.querySelector(`[data-name="infoWriteTime"]`);
            if (dom_writeTime != null) {
                let timeUtc = fileInfo2.LastWriteTimeUtc;
                let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                dom_writeTime.innerHTML = time;
            }
            await M.bulkView.load2();
        }

    }
}
