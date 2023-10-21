interface WebWindow {

    /** 運行js */
    RunJs(js: string): string;

    /** 視窗取得焦點 */
    Focus(): void;

    /** 設定視窗size */
    SetSize(width: number, height: number): void;

    /** 設定視窗坐標 */
    SetPosition(left: number, top: number): void;

    //StartPosition: number;

    /** 標題 */
    Text: string;

    /**視窗 x坐標 */
    Left: number;

    /**視窗 y坐標 */
    Top: number;

    /**視窗寬度 */
    Width: number;

    /**視窗高度 */
    Height: number;

    /**顯示或隱藏視窗 */
    Visible: boolean;

    /**關閉視窗 */
    Close(): void;

    /** 視窗狀態。 0=視窗化 1=最小化 2=最大化 */
    WindowState: (0 | 1 | 2);
}

interface WV_Window {

    /** 清理webview2的暫存 */
    ClearBrowserCache(): void;

    /** 儲存到 start.ini */
    SetStartIni(startPort: number, startType: number, serverCache: number)

    /** 取得 AppInfo*/
    GetAppInfo(): string;

    /** 網頁載入完成後，呼叫此函數才會顯示視窗 */
    ShowWindow(): void;

    /** 網頁載入完成後，呼叫此函數才會顯示視窗，指定起始坐標 */
    ShowWindowAtPosition(x: number, y: number, width: number, height: number, windowState: string): void;

    /** 網頁載入完成後，呼叫此函數才會顯示視窗，子視窗從父視窗中間開啟 */
    ShowWindowAtCenter(width: number, height: number): void;

    /**
     * 新開視窗
     * @param url 完整網址
     * @param args 命令列參數
     */
    NewWindow(url: string, args: string[]): WebWindow;

    /**
     * 新開子視窗
     * @param url 完整網址
     * @param args 命令列參數
     */
    NewSubWindow(url: string, args: string[]): WebWindow;

    /** 關閉全部的視窗(結束程式) */
    CloseAllWindow();

    /** 傳入 webWindow，將其設為目前視窗的子視窗*/
    SetOwner(webwindow: WebWindow);

    /** 在父親視窗運行js */
    RunJsOfParent(js: string): string;

    /** 啟用AERO毛玻璃效果 */
    SetAERO(type: ("win7" | "win10")): void;

    /** 設定縮放倍率，預設 1.0 */
    SetZoomFactor(d: number): void;

    /** 取得縮放倍率，預設 1.0 */
    GetZoomFactor(): number;

    /** 設定視窗最小size */
    SetMinimumSize(width: number, height: number): void;

    /** 設定視窗size */
    SetSize(width: number, height: number): void;

    /** 設定視窗坐標 */
    SetPosition(left: number, top: number): void;

    /** 取得程式的暫存資料夾，例如 C:\Users\user\AppData\Local\Tiefsee */
    GetAppDataPath(): string;

    /** 取得執行檔目錄 */
    GetAppDirPath(): string;

    /** 取得執行檔路徑 */
    GetAppPath(): string;

    /** 取得命令列參數 */
    GetArguments(): string[];

    /**關閉視窗 */
    Close(): void;

    /** 隱藏視窗 */
    Hide(): void;

    /** 設定視窗的 icon */
    SetIcon(psth: string);

    This(): WebWindow;

    /** 標題 */
    Text: string;

    /**視窗 x坐標 */
    Left: number;

    /**視窗 y坐標 */
    Top: number;

    /**視窗寬度 */
    Width: number;

    /**視窗高度 */
    Height: number;

    /**顯示或隱藏視窗 */
    Visible: boolean;

    /**視窗狀態 */
    WindowState: ("Maximized" | "Minimized" | "Normal");

    /** 啟用或關閉 全螢幕 */
    SetFullScreen(val: bool);
    /** 取得當前是否為 全螢幕 */
    GetFullScreen(): boolean;

    /**視窗置頂 */
    TopMost: boolean;

    /**拖曳視窗 */
    WindowDrag(type: ('CT' | 'RC' | 'CB' | 'LC' | 'LT' | 'RT' | 'LB' | 'RB' | 'move')): void;


}

interface WV_Directory {


    /**
     * 取得跟自己同層的資料夾內的檔案資料(自然排序的前5筆)
     * @param path 
     * @param arExt 副檔名
     * @param maxCount 資料夾允許處理的最大數量
     */
    GetSiblingDir(path: string, arExt: string[], maxCount: number): string;

    /**
     * 檔名陣列 轉 路徑陣列 (用於載入複數檔案
     * @param dirPath 資料夾路徑
     * @param arName 檔名陣列
     */
    GetFiles2(dirPath: string, arName: string[]): string[];

    /** 回傳資料夾裡面的檔案 */
    GetFiles(path: string, searchPattern: string): string[];

    /** 回傳資料夾裡面的子資料夾 */
    GetDirectories(path: string, searchPattern: string): string[];

    /** 判斷指定路徑是否參考磁碟上的現有目錄 */
    Exists(path: string): bool;

    /** 新建目錄 */
    CreateDirectory(path: string): void;

    /** 擷取指定路徑的父目錄 */
    GetParent(path: string);

    /** 刪除資料夾(包含子目錄與檔案) */
    Delete(path: string): string;

    /** 資料夾移到資源回收桶 */
    MoveToRecycle(path: string): string;

    /** 移動檔案或目錄和其內容到新位置 */
    Move(sourceDirName: string, destDirName: string): string;

    /** 取得資料夾的建立時間 */
    GetCreationTimeUtc(path: string): number;

    /** 傳回指定檔案或目錄上次被寫入的日期和時間 */
    GetLastWriteTimeUtc(path: string): number;
}

interface WV_File {

    /** 將base64儲存至暫存資料夾 tempDirWebFile，並回傳路徑 */
    Base64ToTempFile(base64: string, extension: string): string;

    /** 在檔案總管顯示檔案 */
    ShowOnExplorer(path: string): void;

    /** 取得 Type、Lenght、CreationTimeUtc、LastWriteTimeUtc、HexValue(用於判斷檔案類型) */
    GetFileInfo2(path: string): string;

    /**
     *  開啟 選擇檔案 的視窗
     * @param Multiselect 是否允許多選，false表示單選 
     * @param Filter 檔案類型。 abc(*.png)|*.png|All files (*.*)|*.*
     * @param Title 視窗標題
     */
    OpenFileDialog(Multiselect: boolean, Filter: string, Title: string): string[];

    /**
     * 顯示檔案原生右鍵選單
     * @param path 檔案路徑
     * @param followMouse true=顯示於游標旁邊、false=顯示於視窗左上角
     */
    ShowContextMenu(path: string, followMouse: boolean): void;

    /** 列印文件 */
    PrintFile(path: string): void;

    /** 快速拖曳(拖出檔案) */
    DragDropFile(path: string);

    /** 取得文字資料 */
    GetText(path: string): string;

    /** 儲存文字資料 */
    SetText(path: string, txt: string);

    /** new FileInfo */
    GetFileInfo(path: string): WV_FileInfo;

    /** 判斷指定的檔案是否存在 */
    Exists(path: string): bool;

    /** 刪除檔案 */
    Delete(path: string): string;

    /** 檔案移到資源回收桶 */
    MoveToRecycle(path: string): string;

    /**
     * 移動檔案到新位置
     * @param sourceFileName 原始檔案路徑
     * @param destFileName 目標檔案路徑
     * @returns 錯誤訊息，成功的話回傳空字串
     */
    Move(sourceFileName: string, destFileName: string): string;

    /** 取得檔案的建立時間 */
    GetCreationTimeUtc(path: string): number;

    /** 傳回指定檔案或目錄上次被寫入的日期和時間 */
    GetLastWriteTimeUtc(path: string): number;
}

interface WV_FileInfo {

    /** 取得表示目錄完整路徑的字串 */
    DirectoryName: string;

    /** 取得目前檔案的大小，以位元組為單位 */
    Length: number;

    /** 取得檔案的名稱 */
    Name: string;

    /** 取得或設定值，判斷目前檔案是否為唯讀 */
    IsReadOnly: bool;

    /** 取得值，這個值指出檔案是否存在 */
    Exists: bool;

    /** 移動指定的檔案至新的位置，提供指定新檔名的選項 */
    MoveTo(destFileName: string);
}

interface FileInfo2 {
    /** file=檔案、dir=資料夾、none=檔案不存在 */
    Type: ("file" | "dir" | "none"),

    /** 檔案路徑 */
    Path: string;

    /** 檔案大小 */
    Lenght: number,

    /** 建立時間 */
    CreationTimeUtc: number,

    /** 修改時間 */
    LastWriteTimeUtc: number,

    /** 讀取前50個byte，用於辨識檔案類型 */
    HexValue: string,

    /** 完整路徑 (以js回寫的欄位) */
    FullPath: string
}

interface WV_Path {

    /** 取得 windows啟動資料夾 的路徑 */
    GetFolderPathStartup(): string;

    /** 變更路徑字串的副檔名 */
    ChangeExtension(path: string);

    /** 串接路徑 */
    Combine(path: string[]): string;

    /** 取得資料夾路徑 */
    GetDirectoryName(path: string): string;

    /** 取得 副檔名。例如「.jpg」*/
    GetExtension(path: string): string;

    /** 取得 檔名+副檔名，例如「aa.jpg」 */
    GetFileName(path: string): string;

    /** 取得 檔名(沒有副檔名 */
    GetFileNameWithoutExtension(path: string): string;

    /** 取得 絕對路徑 */
    GetFullPath(path: string): string;

    /** 把長路經轉成虛擬路徑 */
    GetShortPath(path: string): string;

    /** 取得陣列，該陣列包含檔案名稱中不允許的字元 */
    GetInvalidFileNameChars(): string[];

    /** 取得陣列，該陣列包含路徑名稱中不允許的字元 */
    GetInvalidPathChars(): string[];

    /** 取得根目錄資訊的路徑。例如「C:\」 */
    GetPathRoot(path: string): string;

    /** 傳回隨機資料夾名稱或檔案名稱。例如「5wq4eeek.jls」 */
    GetRandomFileName(): string;

    /** 在磁碟上建立具名之零位元組的唯一暫存檔案，然後傳回該檔案的完整路徑 */
    GetTempFileName(): string;

    /** 傳回目前使用者的暫存資料夾的路徑 */
    GetTempPath(): string;

    /** 判斷路徑是否包括副檔名 */
    HasExtension(path: string): bool;

    /** 取得值，該值指出指定的路徑字串是否包含根目錄 */
    IsPathRooted(path: string): bool;
}

interface WV_System {

    /** 偵測檔案變化 */
    NewFileWatcher(key: string, path: string);

    /** 取得當前是否有使用「開機自動啟動」 */
    GetTiefseTask(): "Enabled" | "DisabledByUser" | "DisabledByPolicy" | "EnabledByPolicy" | "Disabled";

    /** 設定當前是否有使用「開機自動啟動」 */
    SetTiefseTask(val): "Enabled" | "DisabledByUser" | "DisabledByPolicy" | "EnabledByPolicy" | "Disabled";

    /** 取得當前是否按著空白鍵跟滑鼠滾輪 */
    GetDownKey(): string;

    /**
     * 產生捷徑
     * @param exePath exe路徑
     * @param lnkPath 要儲存的ink路徑
     * @param args 啟動參數
     */
    NewLnk(exePath: string, lnkPath: string, args: string): void;

    /**
     * 取得某一個點所在的螢幕資訊
     * @returns WorkingArea X, Y, Width, Height
     */
    GetScreenFromPoint(x: number, y: number): number[4];

    /**
     * 立即刪除所有圖片暫存
     */
    DeleteAllTemp();

    /**
     * 刪除圖片暫存
     * @param maxImgProcessed 暫存資料夾 tempDirImgProcessed 最多保留的檔案數量
     * @param maxImgZoom 暫存資料夾 tempDirImgZoom 最多保留的檔案數量
     */
    DeleteTemp(maxImgProcessed: number, maxImgZoom: number): void;

    /**
     * 模擬鍵盤
     * @param keys 例如 ^a = ctrl+A
     */
    SendKeys_Send(keys: string);
    /**
     * 模擬鍵盤 ctrl + ?
     * @param keys 例如 a = ctrl+A
     */
    SendKeys_CtrlAnd(key: string);

    /**
     * 存入剪貼簿 - 傳入base64，儲存成圖片。
     * isTransparent=true時，同時把png跟一般圖片存入剪貼簿，支援透明圖片的程式會優先使用png格式
     */
    SetClipboard_Base64ToImage(base64: string, isTransparent: bool): bool;

    /**
     * 存入剪貼簿 - 傳入檔案路徑，儲存成圖片。
     * isTransparent=true時，同時把png跟一般圖片存入剪貼簿，支援透明圖片的程式會優先使用png格式
     */
    SetClipboard_FileToImage(path: string, isTransparent: bool): bool;

    /** 存入剪貼簿 - 傳入檔案路徑，以UTF8開啟，複製成文字 */
    SetClipboard_FileToTxt(path: string): bool;

    /** 存入剪貼簿 - 傳入檔案路徑，複製成base64 */
    SetClipboard_FileToBase64(path: string): bool;

    /** 存入剪貼簿 - 檔案 */
    SetClipboard_File(path: string): bool;

    /** 存入剪貼簿 - 字串 */
    SetClipboard_Txt(txt: string): bool;

    /** 取得作業系統所在的槽，例如 「C:\」 */
    GetSystemRoot(): string;

    /** 取得滑鼠的坐標 */
    GetMousePosition(): number[];

    /** 設定桌布 */
    SetWallpaper(path: string): void;

    /** 是否為win10 */
    IsWindows10(): boolean;

    /** 是否為win7 */
    IsWindows10(): boolean;

    /**
     * lnk 轉 exe路徑
     * @param path lnk捷徑
     */
    LnkToExePath(path: string): string;

    /** 回傳程式目前記憶體使用量（MB */
    GetMemory_mb(): number;

    /** 回收記憶體 */
    Collect(): void;

    /** 關聯副檔名 */
    AssociationExtension(arExtension: string[], appPath: string): void;

    /** 解除關聯副檔名 */
    RemoveAssociationExtension(arExtension: string[], appPath: string): void;


    /** 對檔案進行排序 */
    Sort(ar: string[], type: string)

    /**  對檔案進行排序。同一資料夾內的檔案就不傳入與回傳完整路徑，減少傳輸成本 */
    Sort2(dir: string, ar: string[], type: string)
}

interface WV_RunApp {

    /** 以其他程式開啟(系統原生選單) */
    ShowMenu(path: string): void;

    /**取得開始選單裡面的所有lnk */
    GetStartMenuList(): string[]

    /** 以UWP開啟檔案 */
    RunUwp(uwpId: string, filePath: string): void;

    /**
     * 執行其他程式
     * @param FileName 執行檔路徑
     * @param Arguments 命令參數
     * @param CreateNoWindow 是否使用新視窗
     * @param UseShellExecute false=新視窗個體 
     */
    ProcessStart(FileName: string, Arguments: string, CreateNoWindow: boolean, UseShellExecute: boolean); void

    /** 用瀏覽器開啟網址 */
    OpenUrl(url: string): boolean;
}

interface WV_Image {

    /**
     * 取得任何檔案的圖示
     * @param path 
     * @returns base64
     */
    GetFileIcon(path: string, size: (16 | 32 | 64 | 128 | 256)): string;
}

interface AppInfo {

    /** 命令列參數 */
    args: string[];

    /** 1=直接啟動  2=快速啟動  3=快速啟動+常駐  4=單一執行個體  5=單一執行個體+常駐 */
    startType: number;

    /** 程式開始的port */
    startPort: number;

    /** 伺服器對靜態資源快取的時間(秒) */
    serverCache: number;

    /** 程式所在的資料夾 */
    appDirPath: string;

    /** AppData(使用者資料) */
    appDataPath: string;

    /** 目前使用的port */
    mainPort: number;

    /** setting.js 的路徑 */
    settingPath: string;

    /** setting.js 的文字 */
    settingTxt: string;

    /** 是否為快速預覽的視窗。 0=不是快速預覽 1=長按空白鍵 2=長按滑鼠中鍵 */
    quickLookRunType: number;

    /** 是否為商店版APP */
    isStoreApp: boolean;

    /** 判斷哪些擴充有啟用 */
    plugin: AppInfoPlugin;
}

/** 判斷哪些擴充有啟用 */
interface AppInfoPlugin {
    NConvert: bool,
    QuickLook: bool,
    MonacoEditor: bool,
    PDFTronWebviewer: bool,
    PDFTronWebviewer_js: string,
    PDFTronWebviewer_lib: string,
}

/** 偵測檔案變化 */
interface FileWatcherData {
    Key: string;
    FullPath: string;
    OldFullPath: string;
    ChangeType: "changed" | "created" | "deleted" | "renamed";
    FileType: "file" | "dir";
}