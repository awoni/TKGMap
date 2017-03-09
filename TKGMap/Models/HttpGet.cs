using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace TKGMap.Models
{
    public class HttpGet
    {
        public async static Task<string> Get(string url, int ntry = 0)
        {
            try
            {
                using (var client = new HttpClient(new HttpClientHandler
                {
                    AutomaticDecompression = DecompressionMethods.GZip
                 | DecompressionMethods.Deflate
                }))
                {
                    return await client.GetStringAsync(url);
                }
            }
            catch (Exception e1)
            {
                ++ntry;
                if (ntry < 3)
                {
                    await Task.Delay(30);
                    return await Get(url, ++ntry);
                }
                else
                {
                    LoggerClass.Info("データの取得に失敗しました。" + e1.Message + " URL: " + url);
                    return null;
                }
            }
        }
    }
}
