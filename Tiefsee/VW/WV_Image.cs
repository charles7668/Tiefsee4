﻿using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

namespace Tiefsee {

    [ComVisible(true)]
    public class WV_Image {

        WebWindow M;
        public WV_Image(WebWindow m) {
            this.M = m;
        }

        /// <summary>
        /// 取得任何檔案的圖示
        /// </summary>
        /// <param name="path"></param>
        /// <param name="size">16 32 64 128 256</param>
        /// <returns></returns>
        public string GetFileIcon(String path, int size) {
            if (File.Exists(path) == false) { return ""; }
            // 取得圖片在Windows系統的縮圖
            Bitmap icon = WindowsThumbnailProvider.GetThumbnail(
                path, size, size, ThumbnailOptions.ScaleUp
            );
            string base64 = BitmapToBase64(icon);
            icon.Dispose();
            return base64;
        }

        /// <summary>
        /// 
        /// </summary>
        public string BitmapToBase64(Bitmap bmp) {
            string base64String = "";
            try {
                byte[] temp;
                using (MemoryStream ms = new MemoryStream()) {
                    bmp.Save(ms, ImageFormat.Png);
                    temp = ms.ToArray();
                }
                base64String = "data:image/png;base64," + Convert.ToBase64String(temp);
            } catch (Exception e) {
                System.Windows.Forms.MessageBox.Show(e.ToString());
            }
            return base64String;
        }

    }
}
