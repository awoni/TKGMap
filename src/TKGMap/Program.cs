// Copyright 2013 (c) Yasuhiro Niji
// Use of this source code is governed by the MIT License,
// as found in the LICENSE.txt file.

//徳島県道路通行規制情報 Google Maps API 版 ver0.1 by y.niji 2006/10/29
//徳島県道路通行規制情報 Google Maps API 版 ver0.34 by y.niji 2008/2/3
//徳島の道路状況 Google Maps API 版 ver0.4 by y.niji 2013/11/15 Google Maps API Ver3に対応

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.PlatformAbstractions;
using System;
using System.IO;
using System.Threading.Tasks;
using TKGMap.Models;

namespace TKGMap
{
    class Program
    {
        static void Main(string[] args)
        {
            var builder = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json")
                .AddJsonFile($"appsettings.{PlatformServices.Default.Runtime.OperatingSystem}.json", optional: true)
                .AddEnvironmentVariables();

            var configuration = builder.Build();
            AppInit.SetupIni(configuration);

            Excute().Wait();
        }

        static async Task Excute()
        { 
            string kiseia = await HttpGet.Get(AppInit.Host + AppInit.Dir1);
            string kiseib = await HttpGet.Get(AppInit.Host + AppInit.Dir2 + "&search=1");
            string kiseic = await HttpGet.Get(AppInit.Host + AppInit.Dir2 + "&search=3");

            if (kiseia != null && kiseib != null)
            { 
                var wcg = new Traffic();
                try
                {
                    int num1;  //本日の規制数
                    int num2;  //今後の規制数
                    wcg.XMLChange(kiseia, kiseib, kiseic, out num1, out num2);
                    wcg.FileSave();
                    wcg.FtpPut();
                    await wcg.AmazonS3Upload();
                    wcg.ProgLog(num1, num2);
                }
                catch (Exception ex)
                {
                    LoggerClass.Error(ex.Message);
                }
            }
        }
    }
}
