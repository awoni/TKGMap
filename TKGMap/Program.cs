// Copyright 2013 (c) Yasuhiro Niji
// Use of this source code is governed by the MIT License,
// as found in the LICENSE.txt file.

//徳島県道路通行規制情報 Google Maps API 版 ver0.1 by y.niji 2006/10/29
//徳島県道路通行規制情報 Google Maps API 版 ver0.34 by y.niji 2008/2/3
//徳島の道路状況 Google Maps API 版 ver0.4 by y.niji 2013/11/15 Google Maps API Ver3に対応

using System;
using System.IO;
using NLog;
using System.Windows.Forms;

namespace TKGMap
{
    class Program
    {
        static void Main(string[] args)
        {
            Directory.SetCurrentDirectory(Path.GetDirectoryName(Application.ExecutablePath));
            if (!Directory.Exists("Data"))
                Directory.CreateDirectory("Data");
            var wcg = new Traffic();
            if (wcg.LoadFile())
            {
                try
                {
                    int num1;  //本日の規制数
                    int num2;  //今後の規制数
                    wcg.XMLChange(out num1, out num2);
                    wcg.FileSave();
                    wcg.FtpPut();
                    wcg.AmazonS3Upload();
                    wcg.ProgLog(num1, num2);
                }
                catch (Exception ex)
                {
                    LoggerClass.NLogError(ex.Message);
                }
            }
        }
    }

    public class LoggerClass
    {
        private static Logger logger = LogManager.GetCurrentClassLogger();

        public static void NLogInfo(string message)
        {
            logger.Info(message);
        }

        public static void NLogError(string message)
        {
            logger.Error(message);
        }
    }

}
