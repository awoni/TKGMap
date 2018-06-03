TKGMap
====

徳島の交通状況 Google Maps API 版
====

Google が提供している交通状況データーに、徳島県が公開している道路の通行規制情報を Google Maps 上でマッシュアップしたものです。

オープンデータが流行していますが、オープンデータの作り方やその公開されたデータを実際に使う方法を解説したものはあまり存在しません。
オープンデータを使う際の参考になれば幸いです。

公開サイト http://tk.ecitizen.jp/

TKGMapは、.NET Core コンソールアプリケーションです。ソースを利用する場合は、Visual Studio 2017 又は .NET Core SDK を利用してください。Windows、Mac、Linux のどれでも動作します。サーバー用のソフトウェアについては Webフォルダーにまとめてあります。

基本的には11年前（2006年）に作ったソフトなので、XMLをDOMで処理をしています。最近であれば、XML の処理もLINQ To XML を使えばもう少し楽に処理ができるし、サーバ用のデータもJsonにしていると思います。

XyToBlは、平面直角座標から緯度、経度への変換ルーチンです。国土地理院のホームページの計算式に基づいて作成していますので、他でも利用できると思います。

## 設定

index.html で Google Maaps API 用のKeyが必要

S3 にデータをアップロードしたい場合の appsettings.json の例

```
{
  "Host": "http://www1.road.pref.tokushima.jp",
  "DataDir": "C:\\Data\\TKGMap",
  "AWSAccessKey": "xxxxx",
  "AWSSecretKey": "xxxxx",
  "BucketName": "tkgmap/kisei"
}
```
