// Copyright 2013 (c) Yasuhiro Niji
// Use of this source code is governed by the MIT License,
// as found in the LICENSE.txt file.
var currDowning = false;
var dayflag=0;
var ofc='0000';
var xml;
var headerHtml='<tr><th class="kh">路線名</th><th class="kh">規制区間</th><th class="kh">規制期間</th><th class="kh">規制理由</th><th class="kh">規制内容</th><th class="kh">時間帯</th>'+
 '<th class="kh">備考</th><th class="kh">問合先</th></tr>';
function load() {
	if(getCookie('dayflag')!=null){dayflag=Number(getCookie('dayflag'))}
	if(getCookie('ofc')!=null){ofc=getCookie('ofc')}
    downloadXML();
}
function downloadXML(){
	var dummy = (new Date()).getTime();
	dummy = Math.round(dummy / 60000);
    var url;
	if (dayflag == 1) {
	    url = "./Data/kisei2.xml?" + dummy
	} else {
	    url="./Data/kisei1.xml?" + dummy
	}
	$.ajax({
	    url: url,
	    data: {
	        time: dummy
	    },
	    success: function (data) {
	        xml = data;
	        changeTable(dayflag)
	    }
	});
}
function getCookie(name){
  var search = name + '=';
  if (document.cookie.length>0) {
    offset = document.cookie.indexOf(search);
    if (offset != -1){
      offset += search.length;
      end = document.cookie.indexOf(';',offset);
      if(end == -1){end = document.cookie.length}
      return unescape(document.cookie.substring(offset,end));
    }
  }
  return null;
}
function maketd(marker){
    function eGXml(elmID) { return marker.getElementsByTagName(elmID)[0].textContent }
    var tdhtmls = '<tr><td class="kd">' + marker.parentNode.getElementsByTagName("rkn")[0].textContent;
    if (marker.parentNode.getElementsByTagName("rkn")[0].textContent == '県道') { tdhtmls += marker.parentNode.getElementsByTagName("rnm")[0].textContent + '号' };
    tdhtmls += marker.parentNode.getElementsByTagName("rn")[0].textContent;
    if (notemp(eGXml("rno"))) { tdhtmls += '（' + eGXml("rno") + '）' }
    tdhtmls += '</td><td class="kd">' + eGXml("ssn");
    if (notemp(eGXml("sfn"))) { tdhtmls += '～<br />' + eGXml("sfn") }
    tdhtmls += '</td><td class="kd2">' + eGXml("lsd") + "～<br />" + eGXml("led");
    tdhtmls += '<td class="kd">' + eGXml("rr");
    tdhtmls += '</td><td class="kd">' + eGXml("rc");
    if (notemp(eGXml("rd"))) { tdhtmls += '（' + eGXml("rd") + '）' }
    tdhtmls += '</td><td class="kd1">';
    if (notemp(eGXml("ed"))) { tdhtmls += eGXml("ed").replace(/～/g, "～<br />") + "<br/>" }
    tdhtmls += eGXml("tz").replace(/[：、]/g, "<br />");
    tdhtmls += '</td><td class="kd2">';
    if (notemp(eGXml("rpr"))) { tdhtmls += eGXml("rpr") + "<br />" }
    if (notemp(eGXml("rri"))) { tdhtmls += eGXml("rri").replace(/[：、]/g, "<br />").replace(/～/g, "～<br />") + "<br />" }
    tdhtmls += '迂回路：' + eGXml("dt") + '<br />';
    if (notemp(eGXml("dtn"))) { tdhtmls += '（' + eGXml("dtn") + '）<br />' }
    tdhtmls += '</td><td class="kd">' + eGXml("ofn") + ' ' + eGXml("ot") + '</td></tr>';
    return tdhtmls;
}
function changeTable(flag){
    var table_html, markers;
    switch (flag) {
        case 0:
            table_html = '<h1>災害・異常気象時通行規制</h1><table class="ka">' + headerHtml;
            markers = xml.documentElement.getElementsByTagName("trd");
            if (ofc == '0000') {
                for (var j = 0; j < markers.length; j++) {
                    if (markers[j].parentNode.parentNode.nodeName == "dr") { table_html += maketd(markers[j]) };
                }
            } else {
                for (var j = 0; j < markers.length; j++) {
                    if ((markers[j].parentNode.parentNode.nodeName == "dr") && (markers[j].getElementsByTagName('ofc')[0].textContent == ofc))
                    { table_html += maketd(markers[j])}
                }
            }
            table_html += '</table>';
            table_html += '<h1>本日の工事通行規制</h1><table class="ka">' + headerHtml;
            if (ofc == '0000') {
                for (var j = 0; j < markers.length; j++) {
                    if (markers[j].parentNode.parentNode.nodeName == "cr") { table_html += maketd(markers[j])};
                }
            } else {
                for (var j = 0; j < markers.length; j++) {
                    if ((markers[j].parentNode.parentNode.nodeName == "cr") && (markers[j].getElementsByTagName("ofc")[0].textContent == ofc))
                    { table_html += maketd(markers[j])}
                }
            }
            table_html += "</td></tr></table>";
            break;
        case 1:
            table_html = '<h1>明日以降の工事通行規制</h1><table class="ka">' + headerHtml;
            try {
                markers = xml.documentElement.getElementsByTagName("trd")
                if (ofc == '0000') {
                    for (var j = 0; j < markers.length; j++) {
                        if (markers[j].parentNode.parentNode.nodeName == "cr") { table_html += maketd(markers[j]) }
                    }
                } else {
                    for (var j = 0; j < markers.length; j++) {
                        if ((markers[j].parentNode.parentNode.nodeName == "cr") && (markers[j].getElementsByTagName("ofc")[0].textContent == ofc))
                        { table_html += maketd(markers[j]) }
                    }
                }
            } catch (e) { }
            table_html += "</td></tr></table>";
            break;
        case 2:
            table_html = '<h1>災害・異常気象時通行規制</h1><table class="ka">' + headerHtml;
            markers = xml.documentElement.getElementsByTagName("trd");
            if (ofc == '0000') {
                for (var j = 0; j < markers.length; j++) {
                    if (markers[j].parentNode.parentNode.nodeName == "dr") { table_html += maketd(markers[j]) };
                }
            } else {
                for (var j = 0; j < markers.length; j++) {
                    if ((markers[j].parentNode.parentNode.nodeName == "dr") && (markers[j].getElementsByTagName('ofc')[0].textContent == ofc))
                    { table_html += maketd(markers[j]) }
                }
            }
            table_html += "</td></tr></table>";
            break;
        case 3:
            table_html = '<h1>災害・異常気象時通行規制</h1><table class="ka">' + headerHtml;
            markers = xml.documentElement.getElementsByTagName("trd");
            if (ofc == '0000') {
                for (var j = 0; j < markers.length; j++) {
                    if ((markers[j].parentNode.parentNode.nodeName == "dr") && (markers[j].getElementsByTagName("tr")[0].textContent <= 2))
                    { table_html += maketd(markers[j])};
                }
            } else {
                for (var j = 0; j < markers.length; j++) {
                    if ((markers[j].parentNode.parentNode.nodeName == "dr") && (markers[j].getElementsByTagName("tr")[0].textContent <= 2)
                    && (markers[j].getElementsByTagName('ofc')[0].textContent == ofc)) { table_html += maketd(markers[j]) }
                }
            }
            table_html += '</table>';
            table_html += '<h1>本日の工事通行規制</h1><table class="ka">' + headerHtml;
            if (ofc == '0000') {
                for (var j = 0; j < markers.length; j++) {
                    if ((markers[j].parentNode.parentNode.nodeName == "cr") && (markers[j].getElementsByTagName("tr")[0].textContent <= 2))
                    { table_html += maketd(markers[j])};
                }
            } else {
                for (var j = 0; j < markers.length; j++) {
                    if ((markers[j].parentNode.parentNode.nodeName == "cr") && (markers[j].getElementsByTagName("tr")[0].textContent <= 2)
                    && (markers[j].getElementsByTagName("ofc")[0].textContent == ofc)) { table_html += maketd(markers[j])}
                }
            }
            table_html += "</td></tr></table>";
            break;
    }
    document.getElementById("itiran").innerHTML = table_html;
}
function e(elemId){return document.getElementById(elemId)}
function notemp(st){return (st != "")}
