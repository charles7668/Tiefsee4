﻿using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace Tiefsee;

[ComVisible(true)]
public class WV_Path {

    WebWindow M;
    public WV_Path(WebWindow m) {
        this.M = m;
    }

    /// <summary>
    /// 取得 windows啟動資料夾 的路徑
    /// </summary>
    public string GetFolderPathStartup() {
        return Environment.GetFolderPath(Environment.SpecialFolder.Startup);
    }

    /// <summary>
    /// 變更路徑字串的副檔名
    /// </summary>
    public string ChangeExtension(string path, string extension) {
        return Path.ChangeExtension(path, extension);
    }

    /// <summary>
    /// 將一個字串陣列合併為單一路徑
    /// </summary>
    public string Combine(object[] path) {
        String[] ar = new string[path.Length];
        for (int i = 0; i < path.Length; i++) {
            string name = "";
            if (path[i] != null) { name = path[i].ToString(); }
            if (i != 0) {
                if (name.Length > 0)
                    if (name.Substring(0, 1) == "\\" || name.Substring(0, 1) == "/") {
                        name = name.Substring(1); // 拿掉的斜線
                    }
            }
            ar[i] = name;
        }

        return Path.Combine(ar).Replace('/', '\\');
    }

    /// <summary>
    /// 傳回指定路徑字串的目錄資訊
    /// </summary>
    public string GetDirectoryName(string path) {
        return Path.GetDirectoryName(path);
    }

    /// <summary>
    /// 傳回指定路徑字串的副檔名
    /// </summary>
    public string GetExtension(string path) {
        return Path.GetExtension(path);
    }

    /// <summary>
    /// 傳回指定路徑字串的檔案名稱和副檔名
    /// </summary>
    public string GetFileName(string path) {
        return Path.GetFileName(path);
    }

    /// <summary>
    /// 傳回沒有副檔名的指定路徑字串的檔案名稱
    /// </summary>
    public string GetFileNameWithoutExtension(string path) {
        return Path.GetFileNameWithoutExtension(path);
    }

    /// <summary>
    /// 傳回指定路徑字串的絕對路徑
    /// </summary>
    public string GetFullPath(string path) {
        return Path.GetFullPath(path);
    }

    /// <summary>
    /// 把長路經轉成虛擬路徑
    /// </summary>
    public string GetShortPath(string path) {
        int MAX_PATH = 255;
        var shortPath = new StringBuilder(MAX_PATH);
        if (path.StartsWith("\\\\?\\") == false) { // win11必須經過是 \\?\ 開頭的長路經才能處理
            path = "\\\\?\\" + path;
        }
        GetShortPathName(path, shortPath, MAX_PATH);
        string result = shortPath.ToString();
        if (result.StartsWith("\\\\?\\")) {
            result = result.Substring(4);
        }
        return result;
        /*int MAX_PATH = 255;
        var shortPath = new StringBuilder(MAX_PATH);
        GetShortPathName(path, shortPath, MAX_PATH);
        return shortPath.ToString();*/
    }
    [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
    public static extern int GetShortPathName(
        [MarshalAs(UnmanagedType.LPTStr)] string path,
        [MarshalAs(UnmanagedType.LPTStr)] StringBuilder shortPath,
        int shortPathLength
    );

    /// <summary>
    /// 取得陣列，該陣列包含檔案名稱中不允許的字元
    /// </summary>
    public char[] GetInvalidFileNameChars() {
        return Path.GetInvalidFileNameChars();
    }

    /// <summary>
    /// 取得陣列，該陣列包含路徑名稱中不允許的字元
    /// </summary>
    public char[] GetInvalidPathChars() {
        return Path.GetInvalidPathChars();
    }

    /// <summary>
    /// 要從中取得根目錄資訊的路徑
    /// </summary>
    public string GetPathRoot(string path) {
        return Path.GetPathRoot(path);
    }

    /// <summary>
    /// 傳回隨機資料夾名稱或檔案名稱
    /// </summary>
    public string GetRandomFileName() {
        return Path.GetRandomFileName();
    }

    /// <summary>
    /// 在磁碟上建立具名之零位元組的唯一暫存檔案，然後傳回該檔案的完整路徑
    /// </summary>
    public string GetTempFileName() {
        return Path.GetTempFileName();
    }

    /// <summary>
    /// 傳回目前使用者的暫存資料夾的路徑
    /// </summary>
    public string GetTempPath() {
        return Path.GetTempPath();
    }

    /// <summary>
    /// 判斷路徑是否包括副檔名
    /// </summary>
    public bool HasExtension(string path) {
        return Path.HasExtension(path);
    }

    /// <summary>
    /// 取得值，該值指出指定的路徑字串是否包含根目錄
    /// </summary>
    public bool IsPathRooted(string path) {
        return Path.IsPathRooted(path);
    }

}
