/*
COPYRIGHT 1995-2003 ESRI

TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
Unpublished material - all rights reserved under the 
Copyright Laws of the United States.

For additional information, contact:
Environmental Systems Research Institute, Inc.
Attn: Contracts Dept
380 New York Street
Redlands, California, USA 92373

email: contracts@esri.com
*/
var m_mapIdentifyFolder;

// set up window for iframe
//var m_windowImagePath = "/aspnet_client/ESRI/WebADF/images/";
//Windows["IdentifyWindow"] = new WindowObject("IdentifyWindow", 600, 450, "Identify Results", false, true, true, true, true, null, "ADF_Default_");
//fwin = Windows["IdentifyWindow"];
//fwin.createDivs();
//fwin.setContents('');
//fwin.moveTo(100, 50);

function MapIdentify(mapIdentifyFolderName, toolbarName, toolName) 
{
	var buddies = Toolbars[toolbarName].buddyControls;
	m_mapIdentifyFolder = mapIdentifyFolderName;
	for (var i = 0; i < buddies.length; i++)
	{
		var map = Maps[buddies[i]];
		MapPoint(map.name, toolName, false);
		// Set the event to the special identify handler
			// Bypasses the default postback process since no new map is needed
		var iddiv = document.getElementById(map.divId);
		if (iddiv!=null) iddiv.onmousedown = MapIdClick;		
	}
	//setupIdentifyWindow();
}
			
// Point action for Identify
// Does not do a postback, but opens the Identify window to process request
function MapIdClick(e) {
	map = getSelectedMapObject(e);
	
	zleft = mouseX - map.containerLeft;
	ztop = mouseY - map.containerTop;

	map.xMin=zleft;
	map.yMin=ztop;

	var f = document.forms[0];
	f.minx.value=zleft;
	f.miny.value=ztop;
	var today = new Date();
	var rand = today.getTime();
	var winId = "IdentifyWindow_" + sessionId;
	var url = m_mapIdentifyFolder + "/Identify.aspx?idx=" + zleft + "&idy=" + ztop + "&idtype=new&random=" + 
		rand + "&mapid=" + map.name + "&pageid=" + pageId;
	// next line opens new browser window with results
	idWin = window.open(url, winId, "width=600,height=450,scrollbars,status,toolbar");
	// the next group of lines puts iframe in dhtml window for results
	//fwin = Windows["IdentifyWindow"];
	//var content = '<div id="IdWindowDiv" style="overflow: hidden;"><iframe id=idframe name=idframe width=100% height=100% src="' + url + '"></iframe></div>';
	//fwin.setContents(content);
	//fwin.show();
	return false;
}

			
		      