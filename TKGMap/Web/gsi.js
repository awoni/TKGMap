// Copyright 2013 (c) Yasuhiro Niji
// Use of this source code is governed by the MIT License,
// as found in the LICENSE.txt file.
//地理院タイルの設定に関しては、Takanori Sato氏のGoma-Anを参考にさせていただきました。
//http://user.numazu-ct.ac.jp/~tsato/webmap/
var map;
var geocoder=null;
var localmarker=null;
var baseIcon;
var gSmallIcon;
var currDowning = false;
var gmarkers = [];
var infoWindows = [];
var markersArray = [];
var currInfo;
var tdhtmls=[];
var todayn=0;
var todaym=0;
var m;
var n;
var dayflag=0;
var ofc='0000';
var xml1;
var xml2;
var headerHtml='<tr><th class="kh">路線名</th><th class="kh">規制区間</th><th class="kh">規制期間</th><th class="kh">規制理由</th><th class="kh">規制内容</th><th class="kh">時間帯</th>'+
 '<th class="kh">備考</th><th class="kh">問合先</th><th class="kl">地図</a></th></tr>';
window.onresize=resizeApp;
function setMap(lat, lng, num) { map.setCenter(new google.maps.LatLng(lat, lng), num) }
function resizeApp() {
	var offsetTop = 30;
	var mapElem = e("map");
	for (var elem = mapElem; elem != null; elem = elem.offsetParent) {
		offsetTop += elem.offsetTop;
	}
	var height = getWindowHeight() - offsetTop;
	if (height > 320) { mapElem.style.height = height + "px" } else { mapElem.style.height = "320px" }
	var width = $('body').innerWidth();
	if (width > 320) { mapElem.style.width = width + "px" } else { mapElem.style.width = "320px" }
}
function load2() {
    location.href = "#mapmark";
    resizeApp();
    geocoder = new google.maps.Geocoder();

    var gsistdMaptype = new GSIstd2012MapType();
    var gsiortMaptype = new GSIortMapType();
    var gsigazo1Maptype = new GSIgazo1MapType();
    
    var mapOptions = {
        center: new google.maps.LatLng(33.93, 134.189941),
        zoom: 10,
        mapTypeControlOptions: {
            mapTypeIds: ["GSIstd2012", "GSIort", "GSIgazo1"]
        }
    };
    map = new google.maps.Map(document.getElementById("map"),
    mapOptions);
    
    map.mapTypes.set("GSIstd2012", gsistdMaptype);
    map.mapTypes.set("GSIort", gsiortMaptype);
    map.mapTypes.set("GSIgazo1", gsigazo1Maptype);
    map.setMapTypeId('GSIstd2012');

    var trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
    google.maps.event.addListener(map, 'click', function () {
        if (currInfo != null)
            currInfo.close();
    });
    setTimeout("downloadXML1()", 100);
    document.getElementById('id0').sb1.selectedIndex = 0;
    document.getElementById('id0').sb2.selectedIndex = 0;
    document.getElementById('id0').sb4.selectedIndex = 0;
    document.getElementById('id0').sb5.selectedIndex = 0;
    setInterval("downloadXML1()", 600000);
}
// 地理院タイル 旧標準地図、徳島は新標準地図が見えない。整備できたら変更
function GSIstd2012MapType() { }
GSIstd2012MapType.prototype.tileSize = new google.maps.Size(256, 256);
GSIstd2012MapType.prototype.maxZoom = 18; // ～11→新標準地図，12～18→旧標準地図
GSIstd2012MapType.prototype.name = "地理院";
GSIstd2012MapType.prototype.alt = "国土地理院の地図（在来版標準地図）を見る";
GSIstd2012MapType.prototype.getTile = function (tileCoord, zoom, ownerDocument) {
    var tile_x = tileCoord.x % Math.pow(2, zoom);
    if (tile_x < 0) {
        tile_x += Math.pow(2, zoom);
    }
    var img = ownerDocument.createElement("img");
    img.style.width = this.tileSize.width + "px";
    img.style.height = this.tileSize.height + "px";
    if (zoom < 12) {
        img.src = "http://cyberjapandata.gsi.go.jp/xyz/std/" + zoom + "/" + tile_x + "/" + tileCoord.y + ".png";
    } else {
        img.src = "http://cyberjapandata.gsi.go.jp/xyz/std2012/" + zoom + "/" + tile_x + "/" + tileCoord.y + ".png";
    }
    return img;
};
// 地理院タイル 電子国土基本図（オルソ画像）
function GSIortMapType() { }
GSIortMapType.prototype.tileSize = new google.maps.Size(256, 256);
GSIortMapType.prototype.maxZoom = 17; // ～14→標準地図，15～→オルソ画像
GSIortMapType.prototype.name = "地理院写真";
GSIortMapType.prototype.alt = "国土地理院の空中写真(オルソ画像)を見る";
GSIortMapType.prototype.getTile = function (tileCoord, zoom, ownerDocument) {
    var tile_x = tileCoord.x % Math.pow(2, zoom);
    if (tile_x < 0) {
        tile_x += Math.pow(2, zoom);
    }
    var img = ownerDocument.createElement("img");
    img.style.width = this.tileSize.width + "px";
    img.style.height = this.tileSize.height + "px";
    if (zoom < 12) {
        img.src = "http://cyberjapandata.gsi.go.jp/xyz/std/" + zoom + "/" + tile_x + "/" + tileCoord.y + ".png";
    } else if (zoom < 15) {
        img.src = "http://cyberjapandata.gsi.go.jp/xyz/std2012/" + zoom + "/" + tile_x + "/" + tileCoord.y + ".png";
    } else {
        img.src = "http://cyberjapandata.gsi.go.jp/xyz/ort/" + zoom + "/" + tile_x + "/" + tileCoord.y + ".jpg";
    }
    return img;
};
// 地理院タイル 国土画像情報（第１期）
function GSIgazo1MapType() { }
GSIgazo1MapType.prototype.tileSize = new google.maps.Size(256, 256);
GSIgazo1MapType.prototype.maxZoom = 17; // 15～17 (現在の提供範囲)
GSIgazo1MapType.prototype.name = "地理院写真1975";
GSIgazo1MapType.prototype.alt = "国土画像情報(1974年～1978年撮影)を見る";
GSIgazo1MapType.prototype.getTile = function (tileCoord, zoom, ownerDocument) {
    var tile_x = tileCoord.x % Math.pow(2, zoom);
    if (tile_x < 0) {
        tile_x += Math.pow(2, zoom);
    }
    var img = ownerDocument.createElement("img");
    img.style.width = this.tileSize.width + "px";
    img.style.height = this.tileSize.height + "px";
    if (zoom < 12) {
        img.src = "http://cyberjapandata.gsi.go.jp/xyz/std/" + zoom + "/" + tile_x + "/" + tileCoord.y + ".png";
    } else if (zoom < 15) {
        img.src = "http://cyberjapandata.gsi.go.jp/xyz/std2012/" + zoom + "/" + tile_x + "/" + tileCoord.y + ".png";
    } else {
        img.src = "http://cyberjapandata.gsi.go.jp/xyz/gazo1/" + zoom + "/" + tile_x + "/" + tileCoord.y + ".jpg";
    }
    return img;
};
function downloadXML1(){
	if(currDowning){return}
	currDowning = true;
	var dummy = (new Date()).getTime();
	dummy = Math.round(dummy / 60000);
	$.ajax({
	    url: "./Data/kisei1.xml",
	    data: {
	        time: dummy
	    },
	    success: function (data) {
	        xml1 = data;
	        try {
	            document.getElementById("ctime").innerHTML = xml1.documentElement.getElementsByTagName("cd")[0].textContent;
	        } catch (e) { return }
	        for (var j = 0; j < gmarkers.length; j++) {
	            gmarkers[j].setMap(null)
	        }
	        gmarkers = [];
	        tdhtmls = [];
	        m = 0;
	        n = 0;
	        var markers = xml1.documentElement.getElementsByTagName("trd");
	        for (var i = 0; i < markers.length ; i++) { loadTraffic(markers[i]) }
	        todaym = m; todayn = n;
	        downloadXML2();
	    }
	});	
}
function downloadXML2() {
    var dummy = (new Date()).getTime();
    dummy = Math.round(dummy / 60000);
    $.ajax({
        url: "/Data/kisei2.xml",
        data: {
            time: dummy
        },
        success: function(data) {
            xml2=data;
            var markers = xml2.documentElement.getElementsByTagName("trd");
            for(var i = 0; i < markers.length ; i++) {loadTraffic(markers[i])}
            currDowning = false;
            setTimeout("tproc()",100);
        }
    });
}
function tproc(){
	changeMarkers(dayflag);
	setTimeout("changeTable(dayflag)",100);
}
function maketd(marker){
    function eGXml(elmID){return marker.getElementsByTagName(elmID)[0].textContent}
    var tdhtmls ='<tr><td class="kd">' + marker.parentNode.getElementsByTagName("rkn")[0].textContent;
    if (marker.parentNode.getElementsByTagName("rkn")[0].textContent == '県道') { tdhtmls += marker.parentNode.getElementsByTagName("rnm")[0].textContent+'号' };
    tdhtmls+=marker.parentNode.getElementsByTagName("rn")[0].textContent;
	if(notemp(eGXml("rno"))){tdhtmls +='（' + eGXml("rno")+'）'} 
	tdhtmls += '</td><td class="kd">' + eGXml("ssn"); 
	if(notemp(eGXml("sfn"))){tdhtmls += '～<br />' + eGXml("sfn")} 
	tdhtmls += '</td><td class="kd2">' + eGXml("lsd") + "～<br />" + eGXml("led");
	tdhtmls += '<td class="kd">' + eGXml("rr");
	tdhtmls += '</td><td class="kd">'+ eGXml("rc");
	if(notemp(eGXml("rd"))){tdhtmls += '（' + eGXml("rd") + '）'}
	tdhtmls += '</td><td class="kd1">';
	if(notemp(eGXml("ed"))){tdhtmls +=eGXml("ed").replace(/～/g,"～<br />")+"<br/>"}
	tdhtmls += eGXml("tz").replace(/[：、]/g,"<br />");
	tdhtmls += '</td><td class="kd2">';
	if(notemp(eGXml("rpr"))){tdhtmls+=eGXml("rpr")+"<br />"}
	if(notemp(eGXml("rri"))){tdhtmls+=eGXml("rri").replace(/[：、]/g,"<br />").replace(/～/g,"～<br />")+"<br />"}
	tdhtmls+='迂回路：'+eGXml("dt")+'<br />';
	if(notemp(eGXml("dtn"))){tdhtmls+='（' + eGXml("dtn") + '）<br />'}
	tdhtmls += '</td><td class="kd">' + eGXml("ofn")+' '+eGXml("ot") + '</td><td class="kd3">';
	return tdhtmls;
}
function changeTable(flag){
	var table_html, markers;
	switch(flag){
	case 0:
		table_html = '<h1>災害・異常気象時通行規制</h1><table class="ka">' + headerHtml;
		markers = xml1.documentElement.getElementsByTagName("trd");
		if(ofc=='0000'){
			for(var j=0;j<markers.length;j++){
				if(markers[j].parentNode.parentNode.nodeName=="dr"){table_html+=maketd(markers[j])+tdhtmls[j]};
			}
		}else{
			for(var j=0;j<markers.length;j++){
			    if ((markers[j].parentNode.parentNode.nodeName == "dr") && (markers[j].getElementsByTagName('ofc')[0].textContent == ofc))
					{table_html+=maketd(markers[j])+tdhtmls[j]}
			}
		}
		table_html += '</table>';
		table_html += '<h1>本日の工事通行規制</h1><table class="ka">' + headerHtml;
		if(ofc=='0000'){
			for(var j=0;j<markers.length;j++){
				if(markers[j].parentNode.parentNode.nodeName=="cr"){table_html+=maketd(markers[j])+tdhtmls[j]};
			}
		}else{
			for(var j=0;j<markers.length;j++){
			    if((markers[j].parentNode.parentNode.nodeName=="cr")&&(markers[j].getElementsByTagName("ofc")[0].textContent==ofc))
					{table_html+=maketd(markers[j])+tdhtmls[j]}
			}
		}
		table_html += "</td></tr></table>";
		break;
	case 1:
		table_html = '<h1>明日以降の工事通行規制</h1><table class="ka">' + headerHtml;
		try{
			markers = xml2.documentElement.getElementsByTagName("trd")
			if(ofc=='0000'){
				for(var j=0;j<markers.length;j++){
					if(markers[j].parentNode.parentNode.nodeName=="cr"){table_html+=maketd(markers[j])+tdhtmls[j+todayn]}
				}
			}else{
				for(var j=0;j<markers.length;j++){
				    if((markers[j].parentNode.parentNode.nodeName=="cr")&&(markers[j].getElementsByTagName("ofc")[0].textContent==ofc))
					{table_html+=maketd(markers[j])+tdhtmls[j+todayn]}
				}
			}
		}catch(e){}
		table_html += "</td></tr></table>";
		break;
	case 2:
		table_html = '<h1>災害・異常気象時通行規制</h1><table class="ka">' + headerHtml;
		markers = xml1.documentElement.getElementsByTagName("trd");
		if(ofc=='0000'){
			for(var j=0;j<markers.length;j++){
				if(markers[j].parentNode.parentNode.nodeName=="dr"){table_html+=maketd(markers[j])+tdhtmls[j]};
			}
		}else{
			for(var j=0;j<markers.length;j++){
			    if((markers[j].parentNode.parentNode.nodeName=="dr")&&(markers[j].getElementsByTagName('ofc')[0].textContent==ofc))
					{table_html+=maketd(markers[j])+tdhtmls[j]}
			}
		}
		table_html += "</td></tr></table>";
		break;
	case 3:
		table_html = '<h1>災害・異常気象時通行規制</h1><table class="ka">' + headerHtml;
		markers = xml1.documentElement.getElementsByTagName("trd");
		if(ofc=='0000'){
			for(var j=0;j<markers.length;j++){
			    if((markers[j].parentNode.parentNode.nodeName=="dr")&&(markers[j].getElementsByTagName("tr")[0].textContent<=2))
				{table_html+=maketd(markers[j])+tdhtmls[j]};
			}
		}else{
			for(var j=0;j<markers.length;j++){
			    if((markers[j].parentNode.parentNode.nodeName=="dr")&&(markers[j].getElementsByTagName("tr")[0].textContent<=2)
				&&(markers[j].getElementsByTagName('ofc')[0].textContent==ofc)){table_html+=maketd(markers[j])+tdhtmls[j]}
			}
		}
		table_html += '</table>';
		table_html += '<h1>本日の工事通行規制</h1><table class="ka">' + headerHtml;
		if(ofc=='0000'){
			for(var j=0;j<markers.length;j++){
			    if((markers[j].parentNode.parentNode.nodeName=="cr")&&(markers[j].getElementsByTagName("tr")[0].textContent<=2))
				{table_html+=maketd(markers[j])+tdhtmls[j]};
			}
		}else{
			for(var j=0;j<markers.length;j++){
			    if((markers[j].parentNode.parentNode.nodeName=="cr")&&(markers[j].getElementsByTagName("tr")[0].textContent<=2)
				&&(markers[j].getElementsByTagName("ofc")[0].textContent==ofc)){table_html+=maketd(markers[j])+tdhtmls[j]}
			}
		}
		table_html += "</td></tr></table>";
		break;
	}
	document.getElementById("itiran").innerHTML = table_html;
}
function changeMarkers(flag){
	var markers
	switch(flag){
	case 0:
		for(var j=0;j<todaym;j++){gmarkers[j].setMap(map)}
		for (var j = todaym; j < gmarkers.length; j++) { gmarkers[j].setMap(null) }
		break;
	case 1:
		markers = xml1.documentElement.getElementsByTagName("Pt");
		for(var j=0;j<markers.length;j++){
		    if (markers[j].parentNode.getElementsByTagName("td")[0].textContent == 1) { gmarkers[j].setMap(null) } else { gmarkers[j].setMap(map) }
		}
		for(var j=todaym;j<gmarkers.length;j++){gmarkers[j].setMap(map)}
		break;
	case 2:
		markers = xml1.documentElement.getElementsByTagName("Pt");
		for(var j=0;j<markers.length;j++){
		    if (markers[j].parentNode.parentNode.parentNode.nodeName == "dr") { gmarkers[j].setMap(map) } else { gmarkers[j].setMap(null) }
		}
		for (var j = todaym; j < gmarkers.length; j++) { gmarkers[j].setMap(null) }
		break;
	case 3:
		markers = xml1.documentElement.getElementsByTagName("Pt");
		for(var j=0;j<markers.length;j++){
		    if (markers[j].parentNode.getElementsByTagName("tr")[0].textContent <= 2) { gmarkers[j].setMap(map) } else { gmarkers[j].setMap(null) }
		}
		for (var j = todaym; j < gmarkers.length; j++) { gmarkers[j].setMap(null) }
		break;
	}
}
function changeday(flag){
	if(dayflag!=flag){
		setTimeout("tproc()",10);
		dayflag=flag;
	}
	document.getElementById('id0').sb1.selectedIndex=dayflag;
	document.getElementById('id0').sb2.selectedIndex=dayflag;
	document.body.focus();
}
function tproc1(){
	changeTable(dayflag);
	setTimeout(function(){changeMarkers(dayflag);window.location.hash = 'tablemark';},100);
}
function changeday1(flag){
	if(dayflag!=flag){
		setTimeout("tproc1()",10);
		dayflag=flag;
	}
	document.getElementById('id0').sb1.selectedIndex=dayflag;
	document.getElementById('id0').sb2.selectedIndex=dayflag;
	document.body.focus();
}
function changeOffice(val){
	if(ofc!=val){ofc=val;changeTable(dayflag)}
	document.body.focus();
	window.location.hash = 'tablemark';
}
function loadTraffic(markerXml){
    var iconsource = markerXml.getElementsByTagName("cd")[0].textContent + ".png";
	var mpxml = markerXml.getElementsByTagName("Pt");
	tdhtmls[n]='';
	for(var j=0;j<mpxml.length;j++){ 
	    var point = new google.maps.LatLng(mpxml[j].getElementsByTagName("Lat")[0].textContent, mpxml[j].getElementsByTagName("Lng")[0].textContent);
	    var marker = new google.maps.Marker({
	        position: point,
	        map: map,
	        icon: "./traffic_icons/" + iconsource
	    });
	    var info = new google.maps.InfoWindow({
	        content: setInfoHtml(markerXml)
	    });
	    infoWindows[m] = info;
	    google.maps.event.addListener(marker, "click", function () {
	        if (currInfo != null) currInfo.close();
	        info.open(map, marker);
	        currInfo = info;
	    });
		gmarkers[m] = marker;
		if(mpxml.length==1){tdhtmls[n] = '<a href="javascript:sideclick(' + m + ')">マーク</a><br />'}
		else{tdhtmls[n] += '<a href="javascript:sideclick(' + m + ')">マーク' + (j+1) + '</a><br />'}
		m++;	
	}
	n++;
}
function setInfoHtml(markerXml) {
    var marker = markerXml.getElementsByTagName("Pt")[0].parentNode;
	function eGXml(elmID) { return marker.getElementsByTagName(elmID)[0].textContent}
	var vhtml = '<div><table><tr><th class="ph">路 線 名</th><td  class="pd">' +marker.parentNode.getElementsByTagName("rkn")[0].textContent;
	if(marker.parentNode.getElementsByTagName("rkn")[0].textContent=='県道'){vhtml+=marker.parentNode.getElementsByTagName("rnm")[0].textContent+'号'}
	vhtml+=marker.parentNode.getElementsByTagName("rn")[0].textContent;
	if(notemp(eGXml("rno"))){vhtml +='（' + eGXml("rno")+'）'}
	vhtml += '</td> </tr><tr><th class="ph">規制区間</th><td  class="pd">'+eGXml("ssn");
	if(notemp(eGXml("sfn"))){vhtml+= '～<br />' + eGXml("sfn")}
	vhtml +='</td></tr><tr><th class="ph">規制期間</th><td class="pd">' + 
		eGXml("lsd") + "～<br />" + eGXml("led");
	vhtml += '</td> </tr><tr><th class="ph">規制理由</th><td  class="pd">' + eGXml("rr");
	vhtml += '</td></tr><tr><th class="ph">規制内容</th><td  class="pd">' + eGXml("rc");
	if(notemp(eGXml("rd"))){vhtml += '（' + eGXml("rd") + '）'}
	vhtml += '</td></tr><tr><th class="ph">時 間 帯</th><td  class="pd">'
	if(notemp(eGXml("ed"))){vhtml += eGXml("ed")+"<br/>"}
	vhtml += eGXml("tz").replace(/：/,"<br />").replace(/、.{11}、.{11}、/g,function(match, idx, old){return match+"<br />"});
	vhtml += '</td></tr><tr><th class="ph">迂 回 路</th><td  class="pd">' + eGXml("dt");
	if(notemp(eGXml("dtn"))){vhtml += '（' + eGXml("dtn") + '）'}
	vhtml += '</td></tr><tr><th class="ph">備    考</th><td  class="pd">'
	if(notemp(eGXml("rpr"))){vhtml += eGXml("rpr")+"<br />"}
	if(notemp(eGXml("rri"))){vhtml += eGXml("rri").replace(/：/,"<br />").replace(/、.{11}、.{11}、/g,function(match, idx, old){return match+"<br />"})}
	vhtml += '</td></tr><tr><th class="ph">問い合わせ先</th><td  class="pd">' + eGXml("ofn")+ " " + eGXml("ot") +
		'</td> </tr></table></div>';
	return vhtml;
}
function sideclick(m) {
    infoWindows[m].open(map, gmarkers[m]);
    window.location.hash = 'mapmark';
}
function e(elemId){return document.getElementById(elemId)}
function notemp(st){return (st != "")}
function getWindowHeight(){
	if (window.self && self.innerHeight) {return self.innerHeight}
	if (document.documentElement && document.documentElement.clientHeight) {
		return document.documentElement.clientHeight;
	}
	return 0;
}
function getWindowWidth(){
	if (window.self && self.innerWidth) {return self.innerWidth}
	if (document.documentElement && document.documentElement.clientWidth) {
		return document.documentElement.clientWidth;
	}
	return 0;
}
function printMap(){
	document.cookie='dayflag='+dayflag;
	document.cookie='zoom='+map.getZoom();
	document.cookie='lat='+map.getCenter().lat();
	document.cookie='lng='+map.getCenter().lng();
	window.open('printmap34.html');
}
function printTable(){
	document.cookie='dayflag='+dayflag;
	document.cookie='ofc='+ofc;
	window.open('printtable34.html');
}
function changecity(num){
	switch(num){
		case 1:setMap(34.073137,134.552307,12);break;
		case 2:setMap(34.171761,134.60947,12);break;
		case 3:setMap(34.004431,134.590673,12);break;
		case 4:setMap(33.921355,134.659681,12);break;
		case 5:setMap(34.065459,134.359531,12);break;
		case 6:setMap(34.081242,134.235935,12);break;
		case 7:setMap(34.053015,134.170189,12);break;
		case 8:setMap(34.02,134.1,11,11);break;
		case 9:setMap(34.025348,133.807297,12);break;
		case 10:setMap(33.96,133.9,11,11);break;
		case 11:setMap(33.930542,134.512825,12);break;
		case 12:setMap(33.887802,134.401932,12);break;
		case 13:setMap(33.992334,134.453773,12);break;
		case 14:setMap(34.074559,134.440813,12);break;
		case 15:setMap(33.966712,134.35039,12);break;
		case 16:setMap(33.856518,134.496431,12);break;
		case 17:setMap(33.8,134.36,11,11);break;
		case 18:setMap(33.733477,134.535999,12);break;
		case 19:setMap(33.668354,134.420772,12);break;
		case 20:setMap(33.601681,134.351978,12);break;
		case 21:setMap(34.132695,134.581146,12);break;
		case 22:setMap(34.125021,134.546986,12);break;
		case 23:setMap(34.126478,134.49523,12);break;
		case 24:setMap(34.144132,134.462743,12);break;
		case 25:setMap(34.121042,134.404764,12);break;
		case 26:setMap(34.035875,134.064789,12);break;
		case 27:setMap(34.036622,133.936987,12);break;
	}
	document.body.focus();
}
function geocode(address) {
	if (geocoder) {
	    geocoder.geocode({ 'address': address }, function(results, status) {
	        if (status == google.maps.GeocoderStatus.OK) {
	            if (localmarker != null) localmarker.setMap(null);
	            map.setCenter(results[0].geometry.location);
	            if (map.getZoom() < 13) {
	                map.setZoom(13)
	            }
	            localmarker = new google.maps.Marker({
	                map: map,
	                position: results[0].geometry.location
	                //icon:"http://labs.google.com/ridefinder/images/mm_20_green.png"
	            });
	            var info = new google.maps.InfoWindow({
	                content: address
	            });
	            google.maps.event.addListener(localmarker, "click", function () {
	                info.open(map, localmarker);
	            });
	            google.maps.event.trigger(localmarker, 'click');
	        } else {
	            alert(address + " が見つかりません。")
	        }
	    });
	}
}


