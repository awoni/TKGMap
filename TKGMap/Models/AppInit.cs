using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace TKGMap.Models
{
    //appsettings.json の設定
    //Host; データを取得するサーバー
    //DIR1;  通行規制位置情報のデータの場所
    //DIR2;  通行規制内容（本日）のデータの場所
    //DIR2;  通行規制内容（今後）のデータの場所
    //OutputDir; ファイルの出力ディレクトリ
    //Ftp;   FTPの出力先のアドレス
    //Id;    FTPのID
    //Password; FTPのパスワード
    //AWSAccessKey: AWSのアクセスキー
    //AWSSecretKey: AWSの秘密キー
    //BucketName: S3のBucket名
    //DataDir: ワーキング用のディレクトリ
    public class AppInit
    {
        public static string Host { get; set; }
        public static string Dir1 { get;} = "/a6/rasterxml/Symbol_08.xml";
        public static string Dir2 { get; } = "/a4/c6/dataxml100/XmlFactory?xml=03";
        public static string OutputDir { get; set; }
        public static string Ftp { get; set; }
        public static string Id { get; set; }
        public static string Password { get; set; }
        public static string AWSAccessKey { get; set; }
        public static string AWSSecretKey { get; set; }
        public static string BucketName { get; set; }
        public static string DataDir { get; set; }

        public static void SetupIni(IConfigurationRoot configuration)
        {
            LoggerClass.Ini(AppContext.BaseDirectory);

            Host = configuration["Host"];
            OutputDir = configuration["OutputDir"];
            Ftp = configuration["Ftp"];
            Id = configuration["Id"];
            Password = configuration["Password"];
            AWSAccessKey = configuration["AWSAccessKey"];
            AWSSecretKey = configuration["AWSSecretKey"];
            BucketName = configuration["BucketName"];
            DataDir = configuration["DataDir"];

            if (!Directory.Exists(DataDir))
                Directory.CreateDirectory(DataDir);
        }
    }
}
