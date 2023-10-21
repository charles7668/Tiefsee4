class Toast {

    static domToastList: undefined | HTMLElement = undefined; //放所有 toastItem 的容器

    /**
     * 顯示一個 Toast 文字訊息
     * @param txt 文字內容
     * @param ms 多少毫秒後自動關閉
     */
    public static show = (txt: string, ms: number) => {

        if (Toast.domToastList === undefined) {
            Toast.domToastList = document.createElement("div") as HTMLElement;
            Toast.domToastList.setAttribute("class", "toastList base-scrollbar");
            document.body.appendChild(Toast.domToastList);
        }

        txt = Lib.escape(txt); //移除可能破壞html的跳脫符號
        txt = txt.replace(/[\n]/g, "<br>");
      
        let domItem: HTMLElement | undefined = Lib.newDom(`
                <div class="toastItem">
                    <div class="toastTxt">${txt}</div>
                    <div class="toastClose"></div>
                </div>
            `);

        //一段時間後自動關閉
        setTimeout(() => {
            if (domItem !== undefined) {
                Toast.domToastList?.removeChild(domItem);
            }
        }, ms);

        //右邊的關閉按鈕
        let toastClose = domItem.querySelector(".toastClose") as HTMLElement;
        toastClose.onclick = () => {
            if (domItem === undefined) { return; }
            Toast.domToastList?.removeChild(domItem);
            domItem = undefined;
        }

        Toast.domToastList.insertBefore(domItem, Toast.domToastList.firstChild);
    }


}