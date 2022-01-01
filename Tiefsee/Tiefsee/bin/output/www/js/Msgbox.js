"use strict";
/**
 * 訊息方塊
 */
class Msgbox {
    constructor() { }
    /**
     * 判斷目前是否有任何顯示中的訊息方塊
     */
    static isShow() {
        return this._isShow;
    }
    /**
     * 顯示
     * @param json
     */
    static show(json) {
        this._isShow = true;
        let txt = ""; //內容文字
        let isInput = false; //是否顯示輸入框
        let inputTxt = ""; //預設的輸入框內容
        let isAllowClose = true; //是否允許關閉
        let isShowBtn = true; //是否顯示按鈕
        let funcYes = (dom, inputTxt) => { this.close(dom); };
        if (json.txt !== undefined) {
            txt = json.txt;
        }
        if (json.isInput !== undefined) {
            isInput = json.isInput;
        }
        if (json.inputTxt !== undefined) {
            inputTxt = json.inputTxt;
        }
        if (json.isAllowClose !== undefined) {
            isAllowClose = json.isAllowClose;
        }
        if (json.isShowBtn !== undefined) {
            isShowBtn = json.isShowBtn;
        }
        if (json.funcYes !== undefined) {
            funcYes = json.funcYes;
        }
        let dom = newDiv(`<div class="msgbox">
                <div class="msgbox-box" active="false">
                    <div class="msgbox-close"></div>
                    <div class="msgbox-txt base-scrollbar">${txt}</div>
                    <input class="msgbox-input" type="text">
                    <div class="msgbox-bottom">
                        <div class="msgbox-btn msgbox-btn__no">取消</div>
                        <div class="msgbox-btn msgbox-btn__yes">確定</div>
                    </div>
                </div>
            </div>`);
        let donBox = dom.querySelector(".msgbox-box");
        let donInput = dom.querySelector(".msgbox-input");
        let donBtnClose = dom.querySelector(".msgbox-close");
        let donBottom = dom.querySelector(".msgbox-bottom");
        let donBtnNo = dom.querySelector(".msgbox-btn__no");
        let donBtnYes = dom.querySelector(".msgbox-btn__yes");
        setTimeout(() => {
            donBox.setAttribute("active", "true");
        }, 1);
        if (json.funcYes === undefined) { //如果沒有指定按下「確定」的事件，就隱藏「取消」按鈕
            donBtnNo.style.display = "none";
        }
        if (isAllowClose === false) { //禁止關閉
            donBtnClose.style.display = "none";
            donBtnNo.style.display = "none";
        }
        if (isShowBtn === false) {
            donBottom.style.display = "none";
        } //不顯示按鈕
        if (isInput === false) {
            donInput.style.display = "none";
        } //沒有輸入框
        donInput.value = inputTxt;
        donBtnClose.addEventListener("click", () => { this.close(dom); });
        donBtnNo.addEventListener("click", () => { this.close(dom); });
        donBtnYes.addEventListener("click", () => { funcYes(dom, inputTxt); });
        document.body.appendChild(dom);
        return dom;
    }
    /**
     * 關閉特定的訊息方塊
     * @param dom
     */
    static close(dom) {
        var _a;
        (_a = dom.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(dom); //移除dom
        //判斷是否還有其他的 訊息方塊
        let arMsgbox = document.querySelectorAll(".msgbox-box");
        for (let i = 0; i < arMsgbox.length; i++) {
            const item = arMsgbox[i];
            if (item.getAttribute("active") == "true") {
                this._isShow = true;
                return;
            }
        }
        this._isShow = false;
    }
    /**
     * 關閉全部
     */
    static closeAll() {
        var _a;
        let arMsgbox = document.querySelectorAll(".msgbox");
        for (let i = 0; i < arMsgbox.length; i++) {
            const dom = arMsgbox[i];
            (_a = dom.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(dom);
        }
        this._isShow = false;
    }
}
Msgbox._isShow = false;
