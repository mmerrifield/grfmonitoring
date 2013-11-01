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

//////////////////////// Loading: global variables ////////////////////////
var loadingFile = "loading.gif";	// name of image
var loadBannerWidth = 120; 	// width of image
var loadBannerHeight = 24;	// height of image
var loadingSettings = new Array();
//////////////////////// Loading: global variables ////////////////////////

//////////////////////// Common global variables ////////////////////////
// setup test for browser
var isNav = (window.navigator.appName.toLowerCase().indexOf("netscape")>=0);
var isIE = (window.navigator.appName.toLowerCase().indexOf("microsoft")>=0);
var userAgent = navigator.userAgent;
var navType = "IE";
var nav70 = false;
// get flavor of mozilla/netscape
if (isNav) {
	nav70 = (userAgent.indexOf("Netscape/7.0")!=-1);
	if (userAgent.indexOf("FireFox")!=-1) {
		navType = "FireFox";
	} else if (userAgent.indexOf("Opera")!=-1) {
		navType = "Opera";
	} else if (userAgent.indexOf("Safari")!=-1) {
		navType = "Safari";
	} else if (userAgent.indexOf("Netscape")!=-1) {
		navType = "Netscape";
	} else {
		navType = "Mozilla";
	}
}

// if IE, set up page for vector VML usage
if (isIE) {
	document.writeln('<xml:namespace ns="urn:schemas-microsoft-com:vml" prefix="v"/>\n');
	document.writeln('<style type="text/css"> v\\:* { behavior: url(#default#VML);} </style>\n');
}

var doc = document;

// current coords
var mouseX = 0;
var mouseY = 0;

// saved zoom box coords
var x1 = 0;
var y1 = 0;
var x2 = 0;
var y2 = 0;

// zoom box variables
var zleft = 0;
var ztop = 0;
var zright = 0;
var zbottom = 0;

// flags for rectangle drawing or image dragging
var drawBox = false;
var dragImage = false;

// global line width
var lineWidth = 3;

// obj's for Form Identifier
var docFormID = "0";

// dimensions of active div
var divWidth = 500;
var divHeight = 500;
var divLeft = 0;
var divTop = 0;
var divObj;
var divId;
var divIndex = 0;
var divControl;

// for dataframes
var divParentIndex = 0;
var divParentLeft = 0;
var divParentTop = 0;

var leftButton =1;
var rightButton = 2;
if (isNav) {
	leftButton = 1;
	rightButton = 3;
}

var mapCounter = 0;
var pageCounter = 1; //Pages[0] is the controls space

var Maps = new Array();
var Pages = new Array();
Pages[0] = "";

var mapURL = new Array();
var pageURL = new Array();

var pageIndex;
var pageMapIndex;

var Toolbars = new Array();
var ToolbarGroups = new Array();

//for efficiency
var winWidth = getWinWidth();
var winHeight = getWinHeight();

var promptString = "";
var savedCursor = "pointer";
var zoomBoxStyle = "";
var zoomBoxOpacity = 35;

var eLeft = 0;
var eTop = 0;
var eWidth = 0;
var eHeight = 0;

var hasMarkup = false;
var hasPanels = false;
var hasMagnify = false;

//////////////////////// Common global variables ////////////////////////

////////////////////////Vector: global variables////////////////////////
var objString = "";
var divColor = "#FF0000";

// arrayc for vector coords
var xycoords = new Array();

// global for current vector object
var vo = new Array(); 

// vector mode 0=line; 1=polyline; 2=polygon
var vectorMode = new Array();
var vectorCount = new Array();

var pix = new Array();
var xycoord = new Array();

// globals for names of current area div and line div
var areaDivName = "MapDiv_Map1";
var lineDivName = "LineDiv";
var areaDivObj = new Array();
var lineDivObj = new Array();

var jumpToFinish = false;

var coordString = "";
var statusString = "";
var controlType = "Map";

// name of div holding the restart, cancel, delete last buttons
var vectortoolbar = "VectorToolbar";
////////////////////////Vector: global variables////////////////////////

//////////////////////// Common functions ////////////////////////
// create a new data frame object
function MapCreation(controlname,parentindex,index, left, top, width, height, uniquedivid,dragBoxColor,dragLineWidth) {
	if (dragLineWidth==null) dragLineWidth = 3;
	this.controlname = controlname;
	this.parentindex = parentindex;
	this.index = index;
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;
	this.right = left + width;
	this.bottom = top + height;
	this.UniqueDivID = uniquedivid;
	this.DragBoxColor = dragBoxColor;
	this.DragLineWidth = dragLineWidth;
}

// Create a DHTML layer
function createLayer(name, inleft, intop, width, height, visible, content, classname) {
  	document.write('<div id="' + name + '" style="background-color:transparent; position:absolute; overflow:hidden; left:' + inleft + 'px; top:' + intop + 'px; width:' + width + 'px; height:' + height + 'px;' + ';  visibility:' + (visible ? 'visible;' : 'hidden;') +  '"');
	if ((classname!=null) && (classname!="")) document.write(' class="' + classname + '"');
	document.writeln('>');
  	document.writeln(content);
  	document.writeln('</div>');
}

function createLayerWithStyle(name, inleft, intop, width, height, visible, content, classname, style) {
	document.write('<div id="' + name + '" style=" position:absolute; overflow:hidden; left:' + inleft + 'px; top:' + intop + 'px; width:' + width + 'px; height:' + height + 'px;' + ';  visibility:' + (visible ? 'visible;' : 'hidden;') +  style + '"');
	if ((classname!=null) && (classname!="")) document.write(' class="' + classname + '"');
	document.writeln('>');
	document.writeln(content);
	document.writeln('</div>');
}

// Create a DHTML layer with events
function createLayerWithEvents(name, inleft, intop, width, height, visible, content, classname, mousedownevt, mouseupevt, mousemoveevt, mouseoverevt, mouseoutevt) {
    document.write('<div id="' + name + '" style="background-color:transparent; position:absolute; overflow:hidden; left:' + inleft + 'px; top:' + intop + 'px; width:' + width + 'px; height:' + height + 'px;' + ';  visibility:' + (visible ? 'visible;' : 'hidden;') +  '"');
	if ((classname!=null) && (classname!="")) document.write(' class="' + classname + '"');
    if ((mousedownevt!=null) && (mousedownevt!="")) document.write(' onmousedown="' + mousedownevt + '"');
	if ((mouseupevt!=null) && (mouseupevt!="")) document.write(' onmouseup="' + mouseupevt + '"');
	if ((mousemoveevt!=null) && (mousemoveevt!="")) document.write(' onmousemove="' + mousemoveevt + '"');
	if ((mouseoverevt!=null) && (mouseoverevt!="")) document.write(' onmouseover="' + mouseoverevt + '"');
	if ((mouseoutevt!=null) && (mouseoutevt!="")) document.write(' onmouseout="' + mouseoutevt + '"');
	document.writeln('>');
	document.writeln(content);
  	document.writeln('</div>');
}

// get the layer object called "name"
function getLayer(name) {
	var theObj = document.getElementById(name);
	if (theObj!=null) return theObj.style;
	  else return(null);
}

// set layer background color
function setLayerBackgroundColor(name, color) {
  	var layer = getLayer(name);
    layer.backgroundColor = color;
}

// set Div Z-ORDER
function setDivZOrder(name, zvalue)
{
	var layer = getLayer(name);
	layer.zIndex = zvalue;
}

// toggle layer to invisible
function hideLayer(name) {
  	var layer = getLayer(name);
   	if (layer!=null) layer.visibility = "hidden";
	return false;
}

// toggle layer to visible
function showLayer(name) {
  	var layer = getLayer(name);
   	if (layer!=null) layer.visibility = "visible";
	return false;
}

// move layer to x,y
function moveLayer(name, x, y) {		
  	var layer = getLayer(name);	
	if (layer!=null) {	
   		layer.left = x + "px";
		layer.top  = y + "px";
	}
	return false;
}

// replace layer's content with new content
function replaceLayerContent(name, content) {
	var theObj = document.getElementById(name);
	if (theObj!=null) {	  
		theObj.innerHTML = content;	
	}
}


// get cursor location 
function getXY(e) {
	if (isNav) {
		mouseX=e.pageX;
		mouseY=e.pageY;
	} else {
		var theDoc = document;
		var theBody = theDoc.body;
		mouseX=event.clientX + theBody.scrollLeft;
		mouseY=event.clientY + theBody.scrollTop;
	}
	return false;
}

// clip function for zoom box edges... 
function clipLayer(name, clipleft, cliptop, clipright, clipbottom) {
	var layer = getLayer(name);
	if (layer!=null) {
		var newWidth = clipright - clipleft;
		var newHeight = clipbottom - cliptop;
		layer.height = newHeight;
		layer.width	= newWidth;
		layer.top	= cliptop  + "px";
		layer.left	= clipleft + "px";
	}
	return false;

}

// clip functions for moving images
function panClipLayer(name, clipleft, cliptop, clipright, clipbottom) {		
	var layer = getLayer(name);
	if (layer!=null) {
		layer.clip = 'rect(' + cliptop + ' ' +  clipright + ' ' + clipbottom + ' ' + clipleft +')';
	} 
	return false;
}

// get the Map Image width
function getWinWidth () {
	var mapFrameWidth = window.innerWidth;
	if (mapFrameWidth == null) {
		mapFrameWidth = document.body.clientWidth;
	}
	return mapFrameWidth;
}

 //get the Map Image height
function getWinHeight () {
	var mapFrameHeight = window.innerHeight;
	if (mapFrameHeight == null) {
		mapFrameHeight = document.body.clientHeight;
	}
	return mapFrameHeight;
}

// get the coords relative to edge of map div
function adjustMapCoords() {
	var blurb = "";
	zleft = mouseX - (divParentLeft + divLeft);
	ztop = mouseY - (divParentTop + divTop);
	blurb = "Map: " + divId + "\nX=" + zleft + "\nY=" + ztop;
	return blurb;
}

// get which mouse button was pressed
function isLeftButton(e) {
	var theButton= 0;
	var isLeft = false;
	// get the button pushed... if right, ignore... let browser do the popup... it will anyway
	if (isNav) {
		theButton = e.which;
	} else {
		theButton = window.event.button;
	}	
	if (theButton==leftButton) isLeft = true;
	
	return isLeft;
}

// converts color string from Netscape/Mozilla div backgrounds... 
// returned as 'rgb(r g b)'... converted to hex string
function convertNSrgb(color) {
	var h = color;
	if (h.indexOf("rgb")!=-1) {
		// netscape gets "rgb(r, g, b)", so convert to hex
		var re = /%20/gi;
		var h2 = h.replace(re, "");
		endpos = h2.indexOf(")");
		var h3 = h2.substring(4,endpos);
		var ha = h3.split(",");
		var r = parseInt(ha[0]).toString(16);
		if (r.length==1) r = "0" + r;
		var g = parseInt(ha[1]).toString(16);
		if (g.length==1) g = "0" + g;
		var b = parseInt(ha[2]).toString(16);
		if (b.length==1) b = "0" + b;
		color = r + g + b;
		//alert(color);
	}
	return color;
}

function checkPrompt(mode) {
	var cancel = false;
	switch (mode.toLowerCase()) {
		case "markupdeletebox":
		case "markupdeleterectangle":
			cancel = (!confirm("This will delete all Markup elements completely within the box.\nContinue?",true));
			break;
			
	}
	return cancel;
}

function calcElementPosition(elementId) {
	//window.status = elementId;
	var element = document.getElementById(elementId);
	eLeft = 0;
    eTop = 0;
    var eLeftBorder, eTopBorder;
	eWidth = parseInt(element.style.width);
	eHeight = parseInt(element.style.height);
    while(element != null) {
		eLeftBorder = 0;
		eTopBorder = 0;
        eLeft += element.offsetLeft;
        eTop += element.offsetTop;
        if (element.style.borderWidth!="") {
			eLeftBorder = parseInt(element.style.borderWidth);
			eTopBorder = parseInt(element.style.borderWidth);
		} else if (element.style.borderLeftWidth!="") {
			eLeftBorder = parseInt(element.style.borderLeftWidth);
			eTopBorder = parseInt(element.style.borderTopWidth);
		}							
		if (isNaN(eLeftBorder)) eLeftBorder = 0;
		if (isNaN(eTopBorder)) eTopBorder = 0;
		eLeft += eLeftBorder;
		eTop += eTopBorder;
        element = element.offsetParent;
     }
		
}


function postBack(control, eventArg)
{
	__doPostBack(control, eventArg);
	var mode = 	document.forms[docFormID].elements[control + "_mode"].value;
	var showLoading = loadingSettings[control + mode];
	if (showLoading) ShowLoading();
}

function tocAutoLayerVisibility(e)
{
	var o;
	if (isNav && e != null)
		o = e.target;
	else
    o = window.event.srcElement;
  if (o.tagName == 'INPUT' && o.type == 'checkbox' && o.name != null && o.name.indexOf('CheckBox') > -1)
			__doPostBack("","");
}

function checkForFormElement(formId, elemName) {
	var hasIt = false;
	if (document.forms[formId].elements[elemName] != null) hasIt = true;
	return hasIt;
}
///////////////////////////////////// Common functions /////////////////////////////////////

///////////////////////////////////// Loading functions /////////////////////////////////////
// Loading: Create div
function LoadDiv(imagePath)
{
	if (imagePath==null) imagePath = "/aspnet_client/esri_arcgis_server_webcontrols/9_3/images";
	winWidth = getWinWidth();
	winHeight = getWinHeight();
	var loadBannerLeft = parseInt((winWidth - loadBannerWidth)/2);
	var loadBannerTop = parseInt((winHeight - loadBannerHeight)/2);
	//alert(loadBannerLeft + ", " + loadBannerTop);
	var content = '<img src="' + imagePath + '/' + loadingFile  + '" width="' + loadBannerWidth + '" height="' + loadBannerHeight + '" border="0" alt="" align="absmiddle" hspace="0" vspace="0">';
	createLayerWithStyle("Loading",loadBannerLeft,loadBannerTop,loadBannerWidth,loadBannerHeight,false,content,"", "Z-INDEX: 9999;");
}

// Loading: calls to show or hide the banner divs	
function ShowLoading() { showLayer("Loading"); }
function HideLoading() { hideLayer("Loading"); }
///////////////////////////////////// Loading functions /////////////////////////////////////

///////////////////////////////////// Zoombox functions /////////////////////////////////////
function ZoomBoxDiv(image)
{
	if (image==null) image = "/aspnet_client/esri_arcgis_server_webcontrols/9_3/images/pixel.gif";
	
	content = '<img name="zoomImagmaxY" src=' + image + ' width=1 height=1>';
	var style = 'border-color:Black;border-width:3px;border-style:Solid;';
	var zbo = zoomBoxOpacity / 100;
	var platform = navigator.platform;
	if ((platform=="Win32") || ((platform=="MacPPC") && (!isIE))) {
		if (navigator.userAgent.indexOf("Opera")==-1) {
			style += 'background-color: White; opacity: ' + zbo + '; -moz-opacity: ' + zbo + '; filter: alpha(opacity=' + zoomBoxOpacity + ');';
		}
	}
	createLayerWithStyle("zoomBoxTop",-1,-1,1,1,false,content,null,style);
	setDivZOrder("zoomBoxTop", 9991);
}

// clip zoom box layer to mouse coords
function setClip(inSize) {
	if (inSize==null) inSize = 3;
	var lSize = parseInt(inSize) - 1;
	if (lSize < 1) lSize = 1;
	var tempX=x1;
	var tempY=y1;
	if (x1>x2) {
		zright=x1;
		zleft=x2;
	} else {
		zleft=x1;
		zright=x2;
	}
	if (y1>y2) {
		zbottom=y1;
		ztop=y2;
	} else {
		ztop=y1;
		zbottom=y2;
	}
	if ((x1 != x2) && (y1 != y2)) {
		clipZoomBox(zleft,ztop,zright,zbottom,null,inSize)
	}
	return false;
}

function displayZoomBox(left,top,right,bottom,color,size)
{
	clipZoomBox(left,top,right,bottom,color,size)
	showLayer("zoomBoxTop");
}

function hideZoomBox()
{
	window.scrollTo(0,0);
	hideLayer("zoomBoxTop");
	hideLayer("mapTop");
}

function clipZoomBox(left,top,right,bottom,color,size)
{
	var obj = getLayer("zoomBoxTop");
	if (obj!=null) {
		if (size==null) {
			//if (divId.substring(0,4)=="Page") {
			if (pageIndex>0) {
				size = Pages[pageIndex].DragLineWidth;
			} else {
				size = Maps[divIndex].DragLineWidth;
			}
		}
		var w = right - left;
		var h = bottom - top;
		if (isNav) {
			w -= (size*2);
			h -= (size*2);
		}
		if (w<1) w = 1;
		if (h<1) h = 1;
		obj.left = left + "px";
		obj.top = top + "px";
		obj.width = w + "px";
		obj.height = h + "px";
		if (color!=null) obj.borderColor = color;
		obj.borderWidth = size + "px";
		obj.cursor = "crosshair";
	}
}	

///////////////////////////////////// Zoombox functions /////////////////////////////////////

//////////////////////////////////// Vector functions /////////////////////////////////////
// delete the last vector in a polyline or polygon
function DeleteVector() {
	if ((vectorMode[areaDivName]==1) || (vectorMode[areaDivName]==2)) {
		vo[areaDivName].clearObjects();
		if (vectorCount[areaDivName]>0) vectorCount[areaDivName]--;
		if (xycoord[areaDivName].x.length>0) {
			var n = xycoord[areaDivName].x.length - 1;
			xycoord[areaDivName].x.length = n;
			xycoord[areaDivName].y.length = n;
			if (vectorMode[areaDivName]==1) {
				vo[areaDivName].polyline(xycoord[areaDivName].x,xycoord[areaDivName].y);
			} else {
				if (vectorCount[areaDivName]>2) vo[areaDivName].polygon(xycoord[areaDivName].x,xycoord[areaDivName].y)
				 else vo[areaDivName].polyline(xycoord[areaDivName].x,xycoord[areaDivName].y);
			}
			vo[areaDivName].drawObjects();
		}
		
	}
}

// restart the polyline or polygon
function RestartVectors() {
	vectorCount[areaDivName] = 0;
	xycoord[areaDivName].x = new Array();
	xycoord[areaDivName].y = new Array();
	areaDivObj.onmousemove = null;
	areaDivObj.ondblclick = null;
	lineDivObj.onmousemove = null;
	lineDivObj.ondblclick = null;
	vo[areaDivName].clearObjects();
	vo[areaDivName].drawObjects();
}

// stops and clears out all vectors in an object
function CancelVectors() {
	vectorCount[areaDivName] = 0;
	xycoord[areaDivName].x = new Array();
	xycoord[areaDivName].y = new Array();
	areaDivObj.onmousemove = null;
	areaDivObj.ondblclick = null;
	areaDivObj.onclick = null;
	lineDivObj.onmousemove = null;
	lineDivObj.ondblclick = null;
	lineDivObj.onclick = null;
	vo[areaDivName].clearObjects();
	vo[areaDivName].drawObjects();
}

// empty the object string
function clearObjects() {
	this.objString = "";
}

// put the objects on the page within the line div
function drawObjects() {
	this.divObj.innerHTML = this.objString;
}

// set the objects' color
function setObjectColor(color) {
	this.divColor = color;
}

// add to the object string... adds a new div definition
function addToObject(divleft, divtop, divwidth, divheight) {
	this.objString += '<div style="position: absolute;left: ' + divleft + 'px;top: ' + divtop + 'px;width: ' + divwidth + 'px;height: ' + divheight + 'px;overflow:hidden;background-color: ' + this.divColor + ';"><\/div>';
}

// add to the object string... adds a new div definition
function addToObjectColor(divleft, divtop, divwidth, divheight, divcolor) {
	if ((divcolor==null) || (divcolor=="")) divcolor = this.divColor;
	this.objString += '<div style="position: absolute;left: ' + divleft + 'px;top: ' + divtop + 'px;width: ' + divwidth + 'px;height: ' + divheight + 'px;overflow:hidden;background-color: ' + divcolor + ';"><\/div>';
}

// create a new line segment
function line(inX1, inY1, inX2, inY2) {
	if (this.lineWidth < 1) this.lineWidth = 1;
	if (inX1 > inX2) {
		var tempX = inX2;
		var tempY = inY2;
		inX2 = inX1;
		inY2 = inY1;
		inX1 = tempX;
		inY1 = tempY;
	}
	var pwidth = inX2 - inX1;
	var pheight = Math.abs(inY2 - inY1);
	var x = inX1;
	var y = inY1;
	var increment = 1;
	if (inY1 > inY2) increment =  -1;
	var xoffset = x;
	var yoffset = y;
	var size = this.lineWidth;
	var flex_size = size;
	var size_adjust = 0;
	var rl1 = pheight * 2;
	var rl2 = rl1 - (pwidth * 2);
	var rl3 = rl1 - pwidth;
	
	if (pwidth >= pheight) {
		if (size > 1) {
			if (size > 3) {
				flex_size = (size * pwidth * Math.sqrt(1 + pheight * pheight / (pwidth * pwidth)) - pwidth - (size >> 1) * pheight) / pwidth;
				flex_size = (!(size > 4) ? Math.ceil(flex_size) : Math.round(flex_size)) + 1;
			}
			size_adjust = Math.ceil(size / 2);
		}
		while (pwidth > 0) {
			++x;
			if (rl3 > 0) {
				this.addToObject(xoffset, y, x - xoffset + size_adjust, flex_size);
				y += increment;
				rl3 += rl2;
				xoffset = x;
			} else {
				rl3 += rl1;
			}
			pwidth--;
		}
		this.addToObject(xoffset, y, inX2 - xoffset + size_adjust + 1, flex_size);
		
	} else	{
		size_adjust = 1;
		if (size > 1) {
			if (size > 3) {
				flex_size = (size * pheight * Math.sqrt(1 + pwidth * pwidth / (pheight * pheight)) - (size >> 1) * pwidth - pheight) / pheight;
				flex_size = (!(size > 4) ? Math.ceil(flex_size) : Math.round(flex_size)) + 1;
			}
			size_adjust = Math.round(size / 2);
		}
		rl1 = pwidth * 2;
		rl2 = rl1 - (pheight * 2);
		rl3 = rl1 - pheight;
		if (inY2 <= inY1) {

			while (pheight > 0) {
				if (rl3 > 0) {
					this.addToObject(x, y, flex_size, yoffset - y + size_adjust);
					x++;
					y += increment;
					rl3 += rl2;
					yoffset = y;
				} else {
					y += increment;
					rl3 += rl1;
				}
				pheight--;
			}
			this.addToObject(inX2, inY2, flex_size, yoffset - inY2 + size_adjust);
		} else {
			if (size == 1) size_adjust = 0;
			while (pheight > 0) {
				y += increment;
				if (rl3 > 0) {
					this.addToObject(x, yoffset, flex_size, y - yoffset + size_adjust);
					x++;
					rl3 += rl2;
					yoffset = y;
				} else {
					rl3 += rl1;
				}
				pheight--;
			}
			this.addToObject(inX2, yoffset, flex_size, inY2 - yoffset + size_adjust + 1);
		}
	}
}

// create a new VML line segment
function ie_line(inX1, inY1, inX2, inY2) {
	if (this.lineWidth < 1) this.lineWidth = 1;
	this.objString += '<v:line from="' + inX1 + ',' + inY1 + '" to="' + inX2 + ',' + inY2 + '"><v:stroke weight="' + this.lineWidth + 'px" color="' + this.divColor + '" /></v:line>\n';
}

// create a multi-segment line
function polyline(xArray, yArray) {
	for (var i = xArray.length-1;i > 0;i--) {
		this.line(xArray[i], yArray[i], xArray[i-1], yArray[i-1]);
	}
}

function ie_polyline(xArray, yArray) {
	var str = "";
	for (var i = 0;i<xArray.length;i++) {
		if (i>0) str += " ";
		str += xArray[i] + " " + yArray[i];
	}
	this.objString += '<v:polyline points="' + str + '"><v:stroke weight="' + this.lineWidth + 'px" color="' + this.divColor + '" /><v:fill on="false" opacity="0.0" /></v:polyline>\n';
}

// create a closed polygon
function polygon(xArray, yArray) {
	var lastVector = xArray.length - 1;
	this.polyline(xArray, yArray);
	this.line(xArray[lastVector], yArray[lastVector], xArray[0], yArray[0]);
}

function ie_polygon(xArray, yArray) {
	var str = "";
	for (var i = 0;i<xArray.length;i++) {
		if (i>0) str += " ";
		str += xArray[i] + " " + yArray[i];
	}
	str += " " + xArray[0] + " " + yArray[0];
	this.objString += '<v:polyline points="' + str + '"><v:stroke weight="' + this.lineWidth + 'px" color="' + this.divColor + '" /><v:fill on="false" opacity="0.0" /></v:polyline>\n';
}

// create an oval
function oval(ovleft, ovtop, inwidth, inheight) {
	if (this.lineWidth < 1) this.lineWidth = 1;
	var size = this.lineWidth;
	var ovwidth = inwidth + size - 1;
	var ovheight = inheight +  size - 1;
	var halfwidth = Math.floor(ovwidth / 2);
	var halfheight = Math.floor(ovheight / 2);
	var ovw = ovwidth & 1; 
	var ovh = (ovheight & 1 ) + 1;
	var centerx = ovleft + halfwidth;
	var centery = ovtop + halfheight;
	var x = 0; 
	var y = halfheight;
	var w;
	var h;
	var xoff = 0;
	var yoff = halfheight;
	var hwsq = (halfwidth * halfwidth) * 2;
	var hhsq = (halfheight * halfheight) * 2;
	var chpoint = Math.floor(hwsq / 2) * (1 - (halfheight * 2)) + hhsq;
	var chpoint2 = Math.floor(hhsq / 2) - hwsq * ((halfheight * 2) - 1);
	if ((size == 1) || (inwidth <= 1) || (inheight - size <= 1)) {
		do {
			if (chpoint < 0)	{
				chpoint += hhsq * ((x * 2) + 3);
				x++;
				chpoint2 += (hhsq * 2) * x;
			} else if (chpoint2 < 0) {
				chpoint += hhsq * ((x * 2) + 3) - (hwsq * 2) * (y - 1);
				x++;
				chpoint2 += (hhsq * 2) * x - hwsq * ((y * 2) - 3);
				y--;
				w = x - xoff;
				h = yoff - y;
				if (w & 2 && h & 2) {
					this.addToOval(centerx, centery, -x + 1, xoff + ovw, -yoff, yoff - h + 1 + ovh, w, 1);
					this.addToOval(centerx, centery, -x + 1, x - 1 + ovw, -y - 1, y + ovh, 1, 1);
				}
				else {
					this.addToOval(centerx, centery, -x + 1, xoff + ovw, -yoff, yoff - h + ovh, w, h);
				}
				xoff = x;
				yoff = y;
			} else {
				chpoint2 -= hwsq * ((y * 2) - 3);
				y--;
				chpoint -= (hwsq * 2) * y;
			}
		} while (y > 0);
		this.addToObject(centerx - halfwidth, centery - yoff, halfwidth - xoff + 1, (yoff * 2) + ovh);
		this.addToObject(centerx + xoff + ovw, centery - yoff, halfwidth - xoff + 1, (yoff * 2) + ovh);
	} else {
		var left_point, top_point, bottom_point, right_point;
		if (size < 3 && ((size > 2) || ovwidth > 33 && ovheight > 33)) {
			do {
				if (chpoint < 0) {
					chpoint += hhsq * ((x * 2) + 3);
					x++;
					chpoint2 += (hhsq * 2) * x;
					
				} else if (chpoint2 < 0) {
					chpoint += hhsq * ((x * 2) + 3) - (hwsq * 2) * (y - 1);
					x++;
					chpoint2 += (hhsq * 2) * x - hwsq * ((y * 2) - 3);
					y--;
					
					w = x - xoff;
					h = yoff - y;
					if (w - 1) {
						right_point = w + 1 + (size & 1);
						h = size;
					} else if (h - 1) {
						right_point = size;
						h += 1 + (size & 1);
					} else {
						right_point = size;
						h = size;
					}
					this.addToOval(centerx, centery, -x + 1, xoff - right_point + w + ovw, -yoff, -h + yoff + ovh, right_point, h);
					xoff = x;
					yoff = y;
				} else {
					chpoint2 -= hwsq *((y * 2) - 3);
					y--;
					chpoint -= (hwsq * 2) * y;
				}
			} while (y > 0);
			this.addToObject(centerx - halfwidth, centery - yoff, size, (yoff * 2) + ovh);
			this.addToObject(centerx + halfwidth + ovw - size + 1, centery - yoff, size, (yoff * 2) + ovh);
		} else {
			var hw = Math.floor((ovwidth - ((size - 1) * 2)) /2);
			var hh = Math.floor((ovheight - ((size - 1) * 2)) /2);
			var xx = 0;
			var yy = hh;
			var hwsq2 = (hw * hw) * 2;
			var hhsq2 = (hh * hh) * 2;
			var chpoint3 = Math.floor(hwsq2 / 2) * (1 - (hh * 2)) + hhsq2;
			var chpoint4 = Math.floor(hhsq2 / 2) - hwsq2 * ((hh * 2) - 1);
			left_point = new Array();
			top_point = new Array();
			bottom_point = new Array();
			left_point[0] = 0;
			top_point[0] = halfheight;
			bottom_point[0] = hh - 1;
			
			do {
				if (chpoint < 0) {
					chpoint += hhsq * ((x * 2) + 3);
					x++;
					chpoint2 += (hhsq * 2) * x;
					left_point[left_point.length] = x;
					top_point[top_point.length] = y;
				} else if (chpoint2 < 0) {
					chpoint += hhsq * ((x * 2) + 3) - (hwsq * 2) * (y - 1);
					x++;
					chpoint2 += (hhsq * 2) * x - hwsq * ((y * 2) - 3);
					y--;
					left_point[left_point.length] = x;
					top_point[top_point.length] = y;
				} else {
					chpoint2 -= hwsq * ((y * 2) - 3);
					y--;
					chpoint -= (hwsq * 2) * y;
				}
				if (yy > 0) {
					if (chpoint3 < 0) {
						chpoint3 += hhsq2 * ((xx * 2) + 3);
						xx++;
						chpoint4 += (hhsq2 * 2) * xx;
						bottom_point[bottom_point.length] = yy - 1;
					} else if (chpoint4 < 0) {
						chpoint3 += hhsq2 * ((xx * 2) + 3) - (hwsq2 * 2) * (yy - 1);
						xx++;
						chpoint4 += (hhsq2 * 2) * xx - hwsq2 * ((yy * 2) - 3);
						yy--;
						bottom_point[bottom_point.length] = yy - 1;
					} else {
						chpoint4 -= hwsq2 * ((yy * 2) - 3);
						yy--;
						chpoint3 -= (hwsq2 * 2) * yy;
						bottom_point[bottom_point.length-1]--;
					}
				}
			} while (y > 0);
	
			var yoff2 = bottom_point[0];
			var l = left_point.length;
			for (var i = 0; i < l; i++) {
				if (bottom_point[i] != null) {
					if (bottom_point[i] < yoff2 || top_point[i] < yoff) {
						x = left_point[i];
						this.addToOval(centerx, centery, -x + 1, xoff + ovw, -yoff, yoff2 + ovh, x - xoff, yoff - yoff2);
						xoff = x;
						yoff = top_point[i];
						yoff2 = bottom_point[i];
					}
				} else {
					x = left_point[i];
					this.addToObject(centerx - x + 1, centery - yoff, 1, (yoff * 2) + ovh);
					this.addToObject(centerx + xoff + ovw, centery - yoff, 1, (yoff * 2) + ovh);
					xoff = x;
					yoff = top_point[i];
				}
			}
			this.addToObject(centerx - halfwidth, centery - yoff, 1, (yoff * 2) + ovh);
			this.addToObject(centerx + xoff + ovw, centery - yoff, 1, (yoff * 2) + ovh);
		}
	
	}
}

// create an oval
function ie_oval(ovleft, ovtop, inwidth, inheight) {
	this.objString += '<v:oval style="width:' + inwidth + 'px; height:' + inheight + 'px; position:absolute; top:' + ovtop + 'px; left:' + ovleft + 'px;">';
	this.objString += '<v:fill on="false" opacity="0.0" /><v:stroke weight="' + this.lineWidth + 'px" color="' + this.divColor + '" /></v:oval>';
}

// adds 4 vectors to the oval object diagonally from each other
function addToOval(centerx, centery, dleft, dright, dtop, dbottom, dwidth, dheight) {
	this.addToObject(centerx + dleft, centery + dtop,  dwidth , dheight);
	this.addToObject(centerx + dright, centery + dtop, dwidth , dheight);
	this.addToObject(centerx + dright, centery + dbottom,  dwidth , dheight);
	this.addToObject(centerx + dleft, centery + dbottom,  dwidth , dheight);
}

// create a circle using centroid and radius
	// places an optional crosshair at centroid
function circle(centerX, centerY, radius, addcrosshair) {
	var ovwidth = radius * 2;
	var ovleft = centerX - radius;
	var ovtop = centerY - radius;
	if (addcrosshair) {
		if (isIE) {
			this.line(centerX - 4, centerY, centerX + 4, centerY);
			this.line(centerX, centerY - 4, centerX, centerY + 4);
		} else {
			this.addToObject(centerX - 4, centerY, 9, 1);
			this.addToObject(centerX, centerY - 4, 1, 9);
		}
	}
	this.oval(ovleft, ovtop, ovwidth, ovwidth);
}

function box(leftX, topY, rightX, bottomY) {
	var xArray = new Array();
	var yArray = new Array();
	xArray[0] = leftX;
	yArray[0] = topY;
	xArray[1] = rightX;
	yArray[1] = topY;
	xArray[2] = rightX;
	yArray[2] = bottomY;
	xArray[3] = leftX;
	yArray[3] = bottomY;
	this.polygon(xArray, yArray);
}

// vector object
function vectorObjects(divid) {	
	this.objString = "";
	this.divColor = divColor;
	this.divId = divid
	this.divObj = document.getElementById(divid);
	this.lineWidth = lineWidth;
	this.clearObjects = clearObjects;
	this.drawObjects = drawObjects;
	this.setObjectColor = setObjectColor;
	this.circle = circle;
	this.box = box;
	if (isIE) {
		// use VML if using IE
		this.addToObject = null;
		this.line = ie_line;
		this.polyline = ie_polyline;
		this.polygon = ie_polygon;
		this.oval = ie_oval;
		this.addToOval = null;
	} else {
		// otherwise use the vector code	
		this.addToObject = addToObject;
		this.line = line;
		this.polyline = polyline;
		this.polygon = polygon;
		this.oval = oval;
		this.addToOval = addToOval;
	}
}



// creates an object for holding screen coordinates for mouse movement and clicks
function pixelObject(controlname, inleft, intop, inwidth, inheight) {
	// initial click
	this.x1 = 0;
	this.y1 = 0;
	// subsequent clicks
	this.x2 = 0;
	this.y2 = 0;
	// remember the last click
	this.lastX = -99999;
	this.lastY = -99999;
	// position and dimensions of associated area div
	this.divLeft = inleft;
	this.divTop = intop;
	this.divWidth = inwidth;
	this.divHeight = inheight;
	// name of control
	this.controlname = controlname;
}

// creates an object for holding a history list of coordinates of click locations
function coordList() {
	this.x = new Array();
	this.y = new Array();
}

//////////////////////////////////// Vector functions /////////////////////////////////////

