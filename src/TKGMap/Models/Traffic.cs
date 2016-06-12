// Copyright 2013 (c) Yasuhiro Niji
// Use of this source code is governed by the MIT License,
// as found in the LICENSE.txt file.

using System;
using System.IO;
using System.Net;
using System.Xml;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using TKGMap.Models;
using System.Xml.Linq;
using Amazon.Runtime;
using System.Threading.Tasks;

/*
 * 徳島県県土防災情報システムでは、通行規制の位置情報のXMLファイル(kiseia.xml)と
 * 規制内容のXMLファイル（本日kiseib.xml、今後kiseic.xml）が別ファイルになっているので、
 * 位置座標を規制内容のファイルに追加する処理をして、本日（kisei1.xml）と今後（kisei2.xml）の、
 * ２つのファイルにしています。
 * そのときに、県土防災情報システムでは平面直角座標系を使っているので 
 * それを、Google Maps API 用に緯度経度に変換をしています。 
 */

namespace TKGMap
{
    public class Traffic
    {
        //App.configの設定
        //HOST1; データを取得するサーバー
        //HOST2; データを取得するバックアップ用サーバー
        //DIR1;  通行規制位置情報のデータの場所
        //DIR2;  通行規制内容（本日）のデータの場所
        //DIR2;  通行規制内容（今後）のデータの場所
        //OUTPUTDIR; ファイルの出力ディレクトリ
        //FTP;   FTPの出力先のアドレス
        //ID;    FTPのID
        //PWORD; FTPのパスワード
        //Amazon

        private long javaTime(DateTime dt)
        {
            return (dt.Ticks - DateTime.Parse("1970/1/1 9:00:00").Ticks) / 10000;
        }

        private void AddPoint(XmlDocument xmlDoc, XmlNode xl, string posx, string posy)
        {
            try
            {
                double lat, lng;
                XyToBl.Calcurate(4, double.Parse(posx), double.Parse(posy), out lat, out lng);
            
                XmlElement xel = xmlDoc.CreateElement("Pt");
                xl.AppendChild(xel);
                XmlElement xel2 = xmlDoc.CreateElement("Lat");
                xel2.InnerText = lat.ToString();
                xel.AppendChild(xel2);
                xel2 = xmlDoc.CreateElement("Lng");
                xel2.InnerText = lng.ToString();
                xel.AppendChild(xel2);
            }
            catch
            {}
        }

        private Boolean XmlDetail(XmlDocument xmlDOC, string sid, string cd,
            int td, int tr, string posx, string posy)
        {
            XmlElement xmlroot = xmlDOC.DocumentElement;
            XmlNodeList xl = xmlroot.GetElementsByTagName("trd");
            foreach (XmlNode xln in xl)
            {
                XmlElement xel = (XmlElement)xln;
                if (xel.GetElementsByTagName("rid").Item(0).InnerText == sid)
                {
                    if (xel.GetElementsByTagName("tr").Count == 0)
                    {
                        //１番目のマーク
                        xel = xmlDOC.CreateElement("cd");
                        xel.InnerText = cd;
                        xln.AppendChild(xel);

                        xel = xmlDOC.CreateElement("td");
                        xel.InnerText = Convert.ToString(td);
                        xln.AppendChild(xel);

                        xel = xmlDOC.CreateElement("tr");
                        xel.InnerText = Convert.ToString(tr);
                        xln.AppendChild(xel);
                        AddPoint(xmlDOC, xln, posx, posy);
                    }
                    else if (td == 1)
                    {
                        //本日の規制で２番目以降のマーク
                        AddPoint(xmlDOC, xel, posx, posy);
                    }
                    else if (td == 2)
                    {
                        //今後の規制
                        XmlElement xel1 = (XmlElement)xel.GetElementsByTagName("td")[0];
                        if (xel1.InnerText == "1")
                        {
                            //本日と同じ場合
                            xel1.InnerText = "3";
                        }
                        else if (xel1.InnerText == "2")
                            //今後の規制のみの場合
                            AddPoint(xmlDOC, xel, posx, posy);
                    }
                    return true;
                }
            }
            return false;
        }

        //int num1;  本日の規制数
        //int num2;  今後の規制数
        public void XMLChange(string kiseia, string kiseib, string kiseic, out int num1, out int num2)
        {
            XmlElement xmlroot;
            XmlNodeList xl;
            XmlDocument xmlDOCA = new XmlDocument();
            xmlDOCA.LoadXml(kiseia);
            XmlDocument xmlDOCB = new XmlDocument();
            xmlDOCB.LoadXml(kiseib);
            XmlDocument xmlDOCC = new XmlDocument();
            xmlDOCC.LoadXml(kiseic);

            xmlroot = xmlDOCB.DocumentElement;
            xl = xmlroot.GetElementsByTagName("trd");
            num1 = xl.Count;
            xmlroot = xmlDOCC.DocumentElement;
            xl = xmlroot.GetElementsByTagName("trd");
            num2 = xl.Count;

            xmlroot = xmlDOCA.DocumentElement;
            xl = xmlroot.GetElementsByTagName("Pt");
            for (int n = 0; n < xl.Count; n++)
            {
                string pos = xl.Item(n).InnerText;
                int m = pos.IndexOf(",", 0);
                if (m > 0)
                {
                    string posx = pos.Substring(m + 1);
                    string posy = pos.Substring(0, m);

                    XmlElement xel = (XmlElement)xl.Item(n).ParentNode;
                    //sid ID
                    string sid = Convert.ToString(int.Parse(xel.GetElementsByTagName("Id").Item(0).InnerText.Substring(1, 10)));
                    //cd 規制種別
                    string cd = xel.GetElementsByTagName("Cd")[0].InnerText;
                    //td 1:本日 2:今後
                    int td = int.Parse(xel.GetElementsByTagName("Trm")[0].InnerText.Substring(0, 1));
                    //tr 規制ランク
                    int tr = int.Parse(xel.GetElementsByTagName("Trm")[0].InnerText.Substring(2));
                    if (td == 1)
                    {
                        XmlDetail(xmlDOCB, sid, cd, td, tr, posx, posy);
                    }
                    else if (td == 2)
                    {
                        if (!XmlDetail(xmlDOCC, sid, cd, td, tr, posx, posy)) XmlDetail(xmlDOCB, sid, cd, td, tr, posx, posy);
                    }
                }
            }

            using (var writer = File.OpenWrite(Path.Combine(AppInit.DataDir, "kiseitmp1.xml")))
            {
                xmlDOCB.Save(writer);
            }
            using (var writer = File.OpenWrite(Path.Combine(AppInit.DataDir, "kiseitmp2.xml")))
            {
                xmlDOCC.Save(writer);
            }

            using (StreamReader reader = File.OpenText(Path.Combine(AppInit.DataDir, "kiseitmp1.xml")))
            using (StreamWriter writer = File.CreateText(Path.Combine(AppInit.DataDir, "kisei1.xml")))
            {
                while (!reader.EndOfStream)
                {
                    writer.Write(reader.ReadLine().Trim());
                }
            }

            using (StreamReader reader = File.OpenText(Path.Combine(AppInit.DataDir, "kiseitmp2.xml")))
            using (StreamWriter writer = File.CreateText(Path.Combine(AppInit.DataDir, "kisei2.xml")))
            {
                while (!reader.EndOfStream)
                {
                    writer.Write(reader.ReadLine().Trim());
                }
            }

        }

        public void FileSave()
        {
            if (! String.IsNullOrEmpty(AppInit.OutputDir))
            {
                try
                {
                    File.Copy(Path.Combine(AppInit.OutputDir, "kisei1.xml"), Path.Combine(AppInit.OutputDir, "kisei1.xml"), true);
                    File.Copy(Path.Combine(AppInit.OutputDir, "kisei2.xml"), Path.Combine(AppInit.OutputDir, "kisei2.xml"), true);
                }
                catch (Exception e1)
                {
                    LoggerClass.Error("ファイル保存エラー: " + e1.Message);
                }
            }            
        }

        //FTPでサーバーへのアップロード
        public void FtpPut()
        {
            if (String.IsNullOrEmpty(AppInit.Ftp)) return;
            /*
             * .NET Core では、FTP に対応していない
             * https://github.com/dotnet/corefx/issues/7439
             * 以下の構文が使えるようになったら作成予定
             * var request = (FtpWebRequest)WebRequest.Create(AppInit.Ftp);
             * 
            try
            {
                var wc = new WebClient();
                wc.Credentials = new NetworkCredential(id, password);
                wc.UploadFile(ftp + "kisei1.xml", @"Data\kisei1.xml");
                wc.UploadFile(ftp + "kisei2.xml", @"Data\kisei2.xml");
            }
            catch (Exception e1)
            {
                LoggerClass.Error("FTPアップロードエラー: " + e1.Message);
            }
            */

        }

        //AmazonのS3へのアップロード
        public async Task AmazonS3Upload()
        {
            if (String.IsNullOrEmpty(AppInit.AWSAccessKey)) return;

            AWSCredentials credentials = new Amazon.Runtime.BasicAWSCredentials(AppInit.AWSAccessKey, AppInit.AWSSecretKey);
            var s3Client = new AmazonS3Client(credentials, RegionEndpoint.APNortheast1);
            try
            {
                var utility = new TransferUtility(s3Client, new TransferUtilityConfig());
                await utility.UploadAsync(Path.Combine(AppInit.DataDir, "kisei1.xml"), AppInit.BucketName);
                await utility.UploadAsync(Path.Combine(AppInit.DataDir, "kisei2.xml"), AppInit.BucketName);
                await utility.UploadAsync(Path.Combine(AppInit.DataDir, "kiseia.xml"), AppInit.BucketName);
                await utility.UploadAsync(Path.Combine(AppInit.DataDir, "kiseib.xml"), AppInit.BucketName);
                await utility.UploadAsync(Path.Combine(AppInit.DataDir, "kiseic.xml"), AppInit.BucketName);

                /* S3側で設定
                s3Client.PutACL(new PutACLRequest
                {
                    BucketName = bucket,
                    Key = "kisei1.xml",
                    CannedACL = S3CannedACL.PublicRead
                });
                */
            }
            catch (Exception e1)
            {
                LoggerClass.Error("EC2アップロードエラー: " + e1.Message);
            }
        }

        public void ProgLog(int num1, int num2)
        {
            LoggerClass.Info(
                string.Format("{0:yyyy/MM/dd HH:mm:ss} : 本日{1}件　今後{2}件"
                    , DateTime.Now, num1, num2));
        }
    }
}
