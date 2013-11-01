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


// set path for loading banner image
loadBannerPath = "images";
var displayLoading = false;
var sendDelay = 100;
var currentEventArg = "";

activeControl = "Map1";
var esriCurrentResponseCount = 0;
var esriLastResponseCount = -1;
var postBackInterval = null;

var clientPostbackEventArgs = new Array();
// add additional control non-tool event args, if necessary
clientPostbackEventArgs[0] = "resize";
clientPostbackEventArgs[1] = "scrollwheelzoom";
clientPostbackEventArgs[2] = "dragimage";
clientPostbackEventArgs[3] = "drawtile";
clientPostbackEventArgs[4] = "getextent";
clientPostbackEventArgs[5] = "newextent";
clientPostbackEventArgs[6] = "dragrectangle";
clientPostbackEventArgs[7] = "changelevel";
clientPostbackEventArgs[8] = "point";
clientPostbackEventArgs[9] = "line";
clientPostbackEventArgs[10] = "polyline";
clientPostbackEventArgs[11] = "polygon";
clientPostbackEventArgs[12] = "circle";
clientPostbackEventArgs[13] = "oval";


function postBack(control, eventArg, responseFunction) {
	//eventArg = eventArg.toLowerCase();
	currentEventArg = eventArg;	
	//var map2 = Maps[control];
	//var ov2 = Overviews[control];
	//var page2 = Pages[control];
	var toolbar2 = Toolbars[control];
//	var toc2 = Tocs[control];
	var forcePostBack  = false;
	activeControl = control;
	var mode = "";
	var f;
//	if (map2!=null) {
//		// map request
//		f = map2.document.forms[docFormID];
//		f.minx.value = map2.xMin;
//		f.miny.value = map2.yMin;
//		f.maxx.value = map2.xMax;
//		f.maxy.value = map2.yMax;
//		f.coords.value = map2.coords;
//		var postbackEvents = map2.forcePostBackEvent.split(",");
//		for (var h=0;h<clientPostbackEventArgs.length;h++)
//		{	// Check if eventArg is a PostBack event arg.
//			if (eventArg.toLowerCase()==clientPostbackEventArgs[h])
//			{	//check postback event
//				for (var i=0;i<postbackEvents.length;i++)
//				{	// Check if Postback is for Map Mode.
//					if (map2.mode==postbackEvents[i])
//						forcePostBack = true;
//				}
//			}
//		}
//		f.elements[control + "_mode"].value = map2.mode;
//		mode = map2.mode;
//		map2.mode = map2.tempMode;
//		map2.actionType = map2.tempAction;
//		map2.cursor = map2.tempCursor;
//		if (map2.callBackFunctionString!=null) callBackFunctionString = map2.callBackFunctionString;
//	}
//	 else if (page2!=null) {
//		// page request
//		f = page2.document.forms[docFormID];
//		f.minx.value = page2.xMin;
//		f.miny.value = page2.yMin;
//		f.maxx.value = page2.xMax;
//		f.maxy.value = page2.yMax;
//		f.coords.value = page2.coords;
//		var supportpostbackEvents = page2.toolsSupportingClientPostBack.split(",");
//		for (var j=0;j<clientPostbackEventArgs.length;j++)
//		{	// Check if eventArg is a PostBack event arg.
//			if (eventArg.toLowerCase()==clientPostbackEventArgs[j])
//			{	//check postback event
//				for (var k=0;k<supportpostbackEvents.length;k++)
//				{	// Check if Postback is for Page Mode.
//					if (page2.mode==supportpostbackEvents[k])
//						forcePostBack = true;
//				}
//			}
//		}
//		f.elements[control + "_mode"].value = page2.mode;
//		mode = page2.mode;
//		page2.mode = page2.tempMode;
//		page2.actionType = page2.tempAction;
//		page2.cursor = page2.tempCursor;
//		if (page2.callBackFunctionString!=null) callBackFunctionString = page2.callBackFunctionString;
//	} else if (ov2!=null) {
//		// overview request
//		f = ov2.document.forms[docFormID];
//		f.centerx.value = ov2.centerX;
//		f.centery.value = ov2.centerY;
//        if (eventArg==ov2.forcePostBackEvent)
//            forcePostBack = true;
//		if (ov2.callBackFunctionString!=null) callBackFunctionString = ov2.callBackFunctionString;
//	}  else
	 if (toolbar2!=null) {
		f = toolbar2.document.forms[docFormID];
		//find out if item supports client postback
		// ToDo: set up for forced postback
//		if (toolbar2.enableClientPostBack &&
//			(isForcePostBackTool(eventArg, toolbar2.buttonsSupportingClientPostBack)
//		  || eventArg == "resize" || eventArg == "drawtile") )
//			forcePostBack = true;
		if ((toolbar2.items[currentEventArg]!=null) && (toolbar2.items[currentEventArg].selectAutoPostBack))
			forcePostBack = true;
		if (toolbar2.callBackFunctionString!=null) callBackFunctionString = toolbar2.callBackFunctionString;
	} 	else if (toc2 !=null) {
		f = toc2.document.forms[docFormID];
		//enableClientPostBack = toc2.enableClientPostBack;
		if (toc2.callBackFunctionString!=null) callBackFunctionString = toc2.callBackFunctionString;
	} else {
		alert(control + " is not available or does not exist.");
		return false;
	}
	if (f.elements["PostBackMode"]!=null) f.PostBackMode.value = f.elements[control+"_mode"].value;
	//alert("forcePostBack=" + forcePostBack);
	if (forcePostBack) {
		__doPostBack(control, eventArg);
	} else {
		// send to ClientPostBack
		var querystring = createClientPostBackQueryString(control, eventArg);
		clientPostBack(querystring);
	}
	
	map2=null;
	page2=null;
	ov2=null;
	toolbar2=null;
	toc2=null;
}

function clientPostBack(querystring) {
	
	var argument = querystring;
	var context = activeControl + "," + currentEventArg;
	if (querystring!=null && querystring.length>0) {
		eval(callBackFunctionString);
		// Debug stuff to be removed, or at least commented out
		if (checkForFormElement(document, 0, "MapDebugBox")) document.forms[0].MapDebugBox.value += "PostBack Request: " + querystring + "\n";
	}
}

function delayedClientPostBack(argument, context, callbackString) {
    if (commonCallbackFree) {
        eval(callBackString);
// Debug stuff to be removed, or at least commented out
if (checkForFormElement(document, 0, "MapDebugBox")) document.forms[0].MapDebugBox.value += "PostBack Request: " + querystring + "\n";
        window.clearInterval(postBackInterval);
        commonCallbackFree = false;
    }

}

function postBackError(argument, context) {
	alert("An unhandled exception has occurred:\n" + argument);
}

function createClientPostBackQueryString(control, eventArg) {
	var s = "ControlID=" + control;
	s += "&EventArg=" + eventArg;
	var map2 = map;
	var ov2 = ov;
	var page2 = page;
	var map2 = Maps[control];
	var ov2 = Overviews[control];
	var page2 = Pages[control];
	var toolbar2 = Toolbars[control];
	var toc2 = Tocs[control];
	var f;
	if (map2!=null) {
	  f = map2.document.forms[docFormID];
		s += "&ControlType=Map&PageID=" + map2.pageID;
	} else if (ov2!=null) {
	  f = ov2.document.forms[docFormID];
		s += "&ControlType=OverviewMap&PageID=" + ov2.pageID;
	} else if (page2!=null) {
	  f = page2.document.forms[docFormID];
		s += "&ControlType=PageLayout&PageID=" + page2.pageID;
		s += "&dataframeIndex=" + page2.dataframeIndex;
	} else if (toolbar2!=null) {
	  f = toolbar2.document.forms[docFormID];
		s += "&ControlType=Toolbar&PageID=" + toolbar2.pageID;
	} else if (toc2!=null) {
	  f = toc2.document.forms[docFormID];
		s += "&ControlType=Toc&PageID=" + toc2.pageID;
	}
	
	if (f != null)
	{
	  var fieldList = f.elements["ESRIWebADFHiddenFields"].value;
	  var fields = fieldList.split(',');
	  var value;
	  for (var i= 0; i < fields.length; ++i)
	  {
	    if (f.elements[fields[i]] !=null)
	    {
	      value = f.elements[fields[i]].value;
	      if (value != null)
	        s += "&" + fields[i] + "=" + value;
	    }
	  }
	}
	
	map2=null;
	page2=null;
	ov2=null;
	toolbar2=null;
	toc2=null;
	//alert(s);
	return s;
}

// checks if tool is available for client postback
function isForcePostBackTool(tool,toolstring) {
	//alert("tool: " + tool + "\ntoolstring: " + toolstring);
	var hasIt = false;
	if (toolstring!=null && toolstring!="") {
		var toollist = toolstring.split(",");
		for (var i=0;i<toollist.length;i++) {
			if (toollist[i]==tool) {
				hasIt = true;
				break;
			}
		}
	}
	return hasIt;
}

function tocAutoLayerVisibility(e, tocID) {
	var o;
	if (isNav && e != null)
		o = e.target;
	else
    o = window.event.srcElement;
  if (o.tagName == 'INPUT' && o.type == 'checkbox' && o.name != null && o.name.indexOf('CheckBox') > -1)
	{
	    //alert(o.state);
        o.state = o.checked;
        var req = "EventArg=Toc&" + o.value + "&state=" + o.checked; 
        eval('CallServer_' + tocID + '(req,"");');
	}
}

function resizeContentsFunction(win){
    
	if (win.contentsObject!=null) {
		if (win.contentsObject.resize!=null) //map, overviewmap, pagelayout
			win.contentsObject.resize(win.width, win.height); 
	}
}

function checkForClientPostbackEventArgs(eventArg) {
	//retValue = false;
	for (var i=0;i<clientPostbackEventArgs.length;i++) {
		if (eventArg.toLowerCase().indexOf(clientPostbackEventArgs[i].toLowerCase())!=-1) return true;
	}
	return false;
}
