/*
COPYRIGHT 1995-2005 ESRI

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


//////////////////////// Common global variables ////////////////////////

// setup test for browser
var isNav = (window.navigator.appName.toLowerCase().indexOf("netscape")>=0);
var isIE = (Sys.Browser.agent == Sys.Browser.InternetExplorer)
var userAgent = navigator.userAgent;
var navType = "IE";
var nav70 = false;
var nav8 = false;
// get flavor of browser
switch(Sys.Browser.agent) {
	case Sys.Browser.InternetExplorer: 'IE'; break;
	case Sys.Browser.Firefox: navType = 'FireFox'; break;
	case Sys.Browser.Safari: navType = 'Safari'; break;
	case Sys.Browser.Opera: navType = 'Opera'; break;
	default: navType = 'Mozilla'; break;
}

// if IE, check for major versions
if (Sys.Browser.agent == Sys.Browser.InternetExplorer) {
    var ieVersion = Sys.Browser.version;
}

var doc = document;
var defaultImagePath = "/aspnet_client/ESRI/WebADF/images/";
var defaultStylePath = "/aspnet_client/ESRI/WebADF/styles/";
var esriBlankImagePath = "/aspnet_client/ESRI/WebADF/images/blank.gif";

// current coords
var mouseX = 0;
var mouseY = 0;

// saved zoom box coords
var x1 = 0;
var y1 = 0;
var x2 = 0;
var y2 = 0;
var x3 = 0;
var y3 = 0;
var lastX = 0;
var lastY = 0;

// zoom box variables
var zleft = 0;
var ztop = 0;
var zright = 0;
var zbottom = 0;

// obj's for Form Identifier
var docFormID = 0;

var leftButton =1;
var rightButton = 2;
if (isNav) {
	leftButton = 1;
	rightButton = 3;
}

var Maps = [];
var MapNames = [];
var map = null;
var lastmap = null;
var page = null;
var lastpage = null;
var pagemap = null;
var lastpagemap = null;
var mapCount = 0;
var pageCount = 0;
var dragbox = null;

var promptString = "";
var savedCursor = "pointer";

var eLeft = 0;
var eTop = 0;
var eWidth = 0;
var eHeight = 0;

var xMove = 0;
var yMove = 0;

var mapCount = 0;

var jumpToFinish = false;

var coordString = "";
//var statusString = "";
var controlType = "Map";

var Overviews = new Array();
var OverviewNames = new Array();
var ovCount = 0;
var ov = null;

//var Toolbars = new Array();
//var ToolbarGroups = new Array();
//var ToolbarName = new Array();

var Tocs = [];
var TocNames = [];

// popup window objects
var mapWindow = null;
var ovWindow = null;
var tocWindow = null;
var toolWindow = null;
var pageWindow = null;

// maptips objects
var MapTipCollections = [];
var MapTipCollectionNames = [];
var maptipHoverPanel = null;
var maptipExtendedPanels = [];
var maptips = null;
var maptip = null;
var mt_manager = null;
var maptipsActive = false;

var tempMouseMove = null;
var tempMouseUp = null;
var tempContent = "";
var tempStyle = "";

// dynamic stylesheet
var m_StyleSheet = null;
var m_ajaxMethodPrefix = "";
var m_ajaxMethods = null;

var callBackFunctionString = "";
var tileCallbackFunctionString = "";
if (identifyCallbackFunctionString==null)
    var identifyCallbackFunctionString = "";
if (overviewCallbackFunctionString==null)
    var overviewCallbackFunctionString = "";
if (vectorCallbackFunctionString==null)
    var vectorCallbackFunctionString = "";
var hasZoomLevel = false;
var webPageIsLoaded = false;

var commonCallbackFree = true;
var shiftPressed = false;
var ctrlPressed = false;
var altPressed = false;

var esriJavaScriptDecimalDelimiter = ((("theChar is" + (10/100)).indexOf("."))==-1) ? "," : "."; // get decimal delimiter used by JavaScript on user machine
if (typeof(esriSystemDecimalDelimiter)=="undefined") 
    esriSystemDecimalDelimiter = esriJavaScriptDecimalDelimiter;

function createLayer(name, inLeft, inTop, width, height, visible, content, classname, style, container) {
	var oStyle = 'position:absolute; overflow:hidden; left:' + inLeft + 'px; top:' + inTop + 'px; width:' + width + 'px; height:' + height + 'px;' + '  visibility:' + (visible ? 'visible;' : 'hidden;');
	var s = '<div id="' + name + '" style=" position:absolute; overflow:hidden; left:' + inLeft + 'px; top:' + inTop + 'px; width:' + width + 'px; height:' + height + 'px;' + '  visibility:' + (visible ? 'visible;' : 'hidden;');
	if (style!=null)  s += style;
	s += '"';
	if ((classname!=null) && (classname!=""))  s += ' class="' + classname + '"';
	s += '>';
	//s += content;
	//s += '</div>';
	if (container!=null) {
		var contObj = document.getElementById(container);
		contObj.innerHTML = s + content + '</div>';
	} else {
		//alert(s);
		var oDiv = document.createElement("div");
		oDiv.id = name;
		if (style!=null) oStyle += ";" + style;
		oDiv.style.cssText += oStyle;
		if (classname!=null) oDiv.className = classname;
		
		dragObj.innerHTML = content;
		document.body.appendChild(dragObj);		
	}
}

function addDiv(id, content, left, top, width, height, visible, style, className, parent) {
	// add a delay (window.setTimeout('addDiv()', 1000)) for IE if called during page creation 
	var oDiv = document.createElement("div");

	oDiv.id = id;

	if (left!=null) oDiv.style.left = left + "px";
	if (top!=null) oDiv.style.top = top + "px";
	if (width!=null) oDiv.style.width = width + "px";
	if (height!=null) oDiv.style.height = height + "px";
	if (className!=null) oDiv.className = className;
	if (style!=null) oDiv.style.cssText += "; " + style;
	if (oDiv.style.position==null) oDiv.style.position = "absolute";	
	oDiv.innerHTML = content;
	if(parent) { parent.appendChild(oDiv); }
	else { document.body.appendChild(oDiv);	 }
	if (visible!=null) oDiv.style.visibility = visible;	
}


function createLayer2(name, inLeft, inTop, width, height, visible, content, classname, style, container) {
	document.write('<div id="' + name + '" style=" position:absolute; overflow:hidden; left:' + inLeft + 'px; top:' + inTop + 'px; width:' + width + 'px; height:' + height + 'px;' + ';  visibility:' + (visible ? 'visible;' : 'hidden;'));
	if (style!=null) document.write(style);
	document.write('"');
	if ((classname!=null) && (classname!="")) document.write(' class="' + classname + '"');
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

// check to see if the specified div is visible
function isLayerVisible(name) {
	var layer = getLayer(name);
	if (layer!=null) {
		if (layer.visibility == "visible")  return(true);
	}
	return(false);
}



// get cursor location 
function getXY(e) {
	if (isNav) {
		mouseX=e.pageX;
		mouseY=e.pageY;
	} else {
		mouseX=event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
		mouseY=event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
// Added to adjust to cursor hot spot in IE 
		mouseX-=3;
		mouseY-=3;
// Added to adjust to cursor hot spot in IE

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

// add to dynamic style sheet
function addToDynamicStyleSheet(ruleKey, ruleValue) {
	if (isIE) {
		if (m_StyleSheet==null) 
			m_StyleSheet = document.createStyleSheet();
		m_StyleSheet.addRule(ruleKey, ruleValue);
	} else {
		if (m_StyleSheet==null) {
			m_StyleSheet = document.createElement("style");
			document.body.appendChild(m_StyleSheet);
		}
		m_StyleSheet.innerHTML += ruleKey + " {" + ruleValue + "}";
	}
}

function getWinWidth () {
	var mapFrameWidth = window.innerWidth;
	if (mapFrameWidth == null) {
		if (document.documentElement && document.documentElement.clientWidth)
			mapFrameWidth = document.documentElement.clientWidth
		else	
			mapFrameWidth = document.body.clientWidth;
	}
	return mapFrameWidth;
}

 //get the Map Image height
function getWinHeight () {
	var mapFrameHeight = window.innerHeight;
	if (mapFrameHeight == null) {
		if (document.documentElement && document.documentElement.clientHeight)
			mapFrameHeight = document.documentElement.clientHeight;
		else
			mapFrameHeight = document.body.clientHeight;
	}
	return mapFrameHeight;
}

function getElementWidth (element) {
    var width = element.clientWidth;
    while (width<10 && element != null) {
        element = element.offsetParent;
        if (element != null) width = element.clientWidth;
    }
    if (width==null || width<10) width = document.documentElement.clientWidth;
    
    return width;
}

function getElementHeight (element) {
    var height = element.clientHeight;
    while (height<10 && element != null) {
        element = element.offsetParent;
        if (element != null) height = element.clientHeight;
    }
    if (height==null || height<10) height = document.documentElement.clientHeight;
    return height;
}

function getParentWidth (element) {
    if (element.offsetParent != null && element.offsetParent.id.indexOf("FWin_") == 0)
    {
        var mapId = element.offsetParent.id.substring(5);
        var windowElement = document.getElementById("FWinContents_" + mapId);
        return windowElement.clientWidth;
    }
    var parElem = element.parentElement;
    var width = 0;
    while (width==0 && parElem != null) {
        width = parElem.clientWidth;
        parElem = parElem.parentElement;
    }
    if (width==null || width==0) width = document.documentElement.clientWidth;
    
    return width;
}
function getParentHeight (element) {
    if (element.offsetParent != null && element.offsetParent.id.indexOf("FWin_") == 0)
    {
        var mapId = element.offsetParent.id.substring(5);
        var windowElement = document.getElementById("FWinContents_" + mapId);
        return windowElement.clientHeight;
    }
    var parElem = element.parentElement;
    var height = 0;
    while (height==0 && parElem != null) {
        height = parElem.clientHeight;
        parElem = parElem.parentElement;
    }
    if (height==null || height==0) width = document.documentElement.clientHeight;
    
    return height;   
}

function getMapWidth (element)
{
    var width = 0;
    var outermostElement = null;

    if (element.offsetParent != null && element.offsetParent.id.indexOf("FWin_") == 0)
    {
        var mapId = element.offsetParent.id.substring(5);
        var windowElement = document.getElementById("FWinContents_" + mapId);
        return windowElement.clientWidth;
    }
    else if (element.id.indexOf("MapControlDiv_")==0) outermostElement = element.offsetParent.offsetParent;
    
    element = outermostElement;
    while (width == 0 && element != null)
    {
        if (element.width)
            width = element.width;
        else 
            width = element.clientWidth;
        //if (isIE) width += (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
        element = element.offsetParent;
    }
    if (width==null || width==0) width = document.documentElement.clientWidth; // + document.documentElement.scrollLeft;
    return width;
}		

function getMapHeight (element)
{
    var height = 0;
    var outermostElement = null;

    if (element.offsetParent != null && element.offsetParent.id.indexOf("FWin_") == 0)
    {
        var mapId = element.offsetParent.id.substring(5);
        var windowElement = document.getElementById("FWinContents_" + mapId);
        return windowElement.clientHeight;
    }
    else if (element.id.indexOf("MapControlDiv_")==0) outermostElement = element.offsetParent.offsetParent;
    
    element = outermostElement;
    while (height == 0 && element != null)
    {
        if (element.height)
            height = element.height;
        else
            height = element.clientHeight;
        //if (isIE) hight += (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        element = element.offsetParent;
    }
    if (height==null || height==0) height = document.documentElement.clientHeight; // + document.documentElement.scrollTop;
    return height;
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

// find out if shift, ctrl, or alt keys are pressed
function checkShiftCtrlAltKeys(e) {
    if (isIE) 
        e = event;
    shiftPressed = e.shiftKey;
    ctrlPressed = e.ctrlKey;
    altPressed = e.altKey;
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

function calcElementPosition(elementId) {
	//window.status = elementId;
	var element = document.getElementById(elementId);
	eLeft = 0;
    eTop = 0;
    var eLeftBorder, eTopBorder;
	//eWidth = parseInt(element.style.width);
	//eHeight = parseInt(element.style.height);
	eWidth = element.clientWidth;
	eHeight = element.clientHeight;
    while(element != null) {
		eLeftBorder = 0;
		eTopBorder = 0;
        eLeft += element.offsetLeft;
        eTop += element.offsetTop;
        if (element!=document.documentElement) {
            eLeft -= element.scrollLeft;
            eTop -= element.scrollTop;
        }  
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
	 return new RectangleObject("dummy", eLeft, eTop, eWidth, eHeight);
}

function checkForFormElement(mapdoc, formId, elemName) {
	var hasIt = false;
	if (mapdoc.forms[formId].elements[elemName] != null) hasIt = true;
	return hasIt;
}

function resizeElement(ElementId, width, height) {
	var div = document.getElementById(ElementId);
	if (div!=null) {
		if (width!=null) div.style.width = width + "px";
		if (height!=null) div.style.height = height + "px";
	}
}

function remainder(num1, num2) {
	var nfloor = Math.floor(num1 / num2);
	var ftotal = nfloor * num2;
	return(num1 - ftotal);
}


///////////////////////////////////// Common functions /////////////////////////////////////

///////////////////////////////////// Common objects ///////////////////////////////////////

	SimpleObject = function(id) {		
		this._id = this.id = id;		
	}
	SimpleObject.prototype = {
		get_id : function() {
			return this._id;
		}
	}
	SimpleObject.registerClass('SimpleObject');
	
	RectangleObject = function(id, left, top, width, height) {
		RectangleObject.initializeBase(this,[id]);
		//inheritsFrom(new SimpleObject(id), this);
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
	}
	RectangleObject.registerClass('RectangleObject',SimpleObject);
	
	PageElementObject = function(id, left, top, width, height) {
		//inheritsFrom(new RectangleObject(id, left, top, width, height), this);
		PageElementObject.initializeBase(this,[id, left, top, width, height]);
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
		
		this.divId = "";
		this.divObject = null;
		this.document = document;
		this.cursor = "default";
		
		//this.createDivs = null;
	}
	PageElementObject.prototype = {
		show : function() { this.divObject.display=''; },
		hide : function() { this.divObject.display='none'; },
		createDivs : null
	}
	PageElementObject.registerClass('PageElementObject',RectangleObject);
	
	function ControlObject(id, controlType, left, top, width, height) {
		ControlObject.initializeBase(this,[id, left, top, width, height]);
		//inheritsFrom(new PageElementObject(id, left, top, width, height), this);
		this.controlType = controlType;
		this.controlName = id;
		this.mode = "";
		
		this.pageLeft = 0;
		this.pageTop = 0;
		this.xMin = 0;
		this.yMin = 0;
		this.xMax = 0;
		this.yMax = 0;
		this.coords = "";
		
		this.clientAction = "";
		this.actionType = "";
		
		this.pageID = "";
		this.enableClientPostBack = false;
		this.buddyControls = "";
		this.toolsForcingPostback = "";
		
		this.resetDisplay = null;		
	}
	ControlObject.prototype = {
		resize : function(width, height) {
			this.width = width;
			this.height = height;
		},
		setObjects : null,
		setTool : null
	}
	ControlObject.registerClass('ControlObject',PageElementObject);
	// 



var winWidth = getWinWidth();
var winHeight = getWinHeight();

//////////////////////// IE functionality for Mozilla/Netscape ///////////////////////////////
	// make Mozilla browsers emulate IE's node/element functionality
if (isNav) {
	Element.prototype.contains = function(element){
		var range=document.createRange();
		range.selectNode(this);
		return range.compareNode(element)==3;
	}
	
	Element.prototype.applyElement = function(element, where){
		if(!element.splitText){
			element.removeNode();
			if(where && where.toLowerCase()=="inside"){
				for(var i=0;i<this.childNodes.length;i++){
					element.appendChild(this.childNodes[i])
				}
				this.appendChild(element)
			}else{
				var parent_Node=this.parentNode;
				parent_Node.insertBefore(element,this);
				element.appendChild(this);
			}
			return element;
		}
	}

	Element.prototype.insertAdjacent=function(where, element){
		var parent_Node=this.parentNode;
		switch(where.toLowerCase()) {
			case "beforebegin":
				parent_Node.insertBefore(element,this);
				break;
			case "afterend":
				parent_Node.insertBefore(element,this.nextSibling);
				break;
			case "afterbegin":
				this.insertBefore(element,this.childNodes[0]);
				break;
			case "beforeend":
				this.appendChild(element);
				break;
		}
	}
		
	Element.prototype.insertAdjacentText = function(where, text){
		var text_Node=document.createTextNode(text||"")
		this.insertAdjacent(where, text_Node);
	}
	
	Element.prototype.insertAdjacentHTML = function(where, html){
		var range=document.createRange();
		range.selectNode(this);
		var fragment=range.createContextualFragment(html);
		this.insertAdjacent(where, fragment);
	}

	Element.prototype.insertAdjacentElement = function(where,element){
		this.insertAdjacent(where,element);
		return a2;
	}

//	Node.prototype.removeNode = function (node){
//		var parent_Node=this.parentNode;
//		if(parent_Node && !node){
//			var fragment=document.createDocumentFragment();
//			for(var i=0;i<this.childNodes.length;i++){
//				fragment.appendChild(this.childNodes[i])
//			}
//			parent_Node.insertBefore(fragment,this)
//		}
//		return parent_Node ? parent_Node.removeChild(this):this;
//	}

    Node.prototype.removeNode = function( removeChildren ) {
	    var self = this;
	    if ( Boolean( removeChildren ) )
	    {
		    return this.parentNode.removeChild( self );
	    }
	    else
	    {
		    var range = document.createRange();
		    range.selectNodeContents( self );
		    return this.parentNode.replaceChild( range.extractContents(), self );
	    }
    }

	Node.prototype.replaceNode = function (node){
		return this.parentNode.replaceChild(node,this)
	}

	Node.prototype.swapNode=function(node){
		var parent_Node=node.parentNode;
		var next_Sibling=node.nextSibling;
		this.parentNode.replaceChild(node,this);
		parent_Node.insertBefore(this, next_Sibling)
		return this;
	}

    // outerHTML implementation
    var _emptyTags = {
       "IMG":   true,
       "BR":    true,
       "INPUT": true,
       "META":  true,
       "LINK":  true,
       "PARAM": true,
       "HR":    true
    };

    HTMLElement.prototype.__defineGetter__("outerHTML", function () {
       var attrs = this.attributes;
       var str = "<" + this.tagName;
       for (var i = 0; i < attrs.length; i++)
          str += " " + attrs[i].name + "=\"" + attrs[i].value + "\"";

       if (_emptyTags[this.tagName])
          return str + ">";

       return str + ">" + this.innerHTML + "</" + this.tagName + ">";
    });

    HTMLElement.prototype.__defineSetter__("outerHTML", function (sHTML) {
       var r = this.ownerDocument.createRange();
       r.setStartBefore(this);
       var df = r.createContextualFragment(sHTML);
       this.parentNode.replaceChild(df, this);
    });

}


function addEvent(obj, eventName, funct) {
    if (obj.addEventListener) {
        obj.addEventListener(eventName, funct, false); 
        return true;
    } else if (obj.attachEvent) {
        var att = obj.attachEvent("on" + eventName, funct);
        if (!att) alert("Unable to add " + eventName + " event to " + obj.id);
        return att;
    } else {
        alert("Unable to add " + eventName + " event to " + obj.id);
        return false;
    }        
}

function removeEvent(obj, eventName, funct) {
    if (obj.removeEventListener) {
        obj.removeEventListener(eventName, funct, false);
        return true;
    } else if (obj.attachEvent) {
        return obj.detachEvent("on" + eventName, funct);
    } else {
        return false;
    }
}


/*
////////////////////////////// Pre 9.2 function support ////////////////////////////////
// Functions with 9.1 names, calling 9.2 functionality... 
// For support of projects created prior to 9.2
// These functions are called by 9.1 MapViewer Template Identify
/////////////////////////////////////////////////////////////////////////////////////////

function getMapDiv(e) {
	map = getSelectedMapObject(e);
}

function ShowLoading() {
	if (map!=null) {
		if (map.loadingObject!=null) map.loadingObject.show();
	}
	if (page!=null) {
		if (page.loadingObject!=null) page.loadingObject.show();	
	} 
}

function HideLoading() {
	if (map!=null) {
		if (map.loadingObject!=null) map.loadingObject.hide();
	}
	if (page!=null) {
		if (page.loadingObject!=null) page.loadingObject.hide();	
	}
}

function adjustMapCoords() {
	zleft = mouseX - map.pageLeft;
	ztop = mouseY - map.pageTop;
	map.xMin=zleft;
	map.yMin=ztop;
	return null;
}
*/

////////////////////////////// Common Timing functions ////////////////////////////////
// 
/////////////////////////////////////////////////////////////////////////////////////////

var lastResponseReceivedTime = new Date();
var maximumLapseTime = 10; // Change this value to session timeout in minutes


// function executed when page is loaded... other functions can check webPageIsLoaded if necessary before executing
function webPageLoaded() {
    webPageIsLoaded = true;
}

// function that does nothing... used in required hyperlinks such as in treeview so page won't refresh
    // called in link as "javascript: doNothing();"
function doNothing() {
    // nothing happening here
}

// function that gets the elapsed time between requests... so client knows when the server code will not respone anymore
function getSessionLapse() {
    var now = new Date();
    var last = lastResponseReceivedTime;
    var diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60));
    return diff;
}

// function that resets the global laspe start time
function setSessionLapse() {
    lastResponseReceivedTime = new Date();
}

// function that displays an alert indicating session has lapsed
function showLapseAlert() {
    alert("Session has timed out from extended inactivity. A new session must be started to use this application by closing this browser and reopening.");
}

function switchImageSourceAndAlphaBlend(imgElement, newSource, forcePng)
{
    if (forcePng==null) forcePng = false;
    if (imgElement!=null)
    {
        if (ESRI.ADF.System.__isIE6)
        {
            var imageUrl=newSource;
            var imageType=imageUrl.substr(imageUrl.length-3,3);
            if (imageType=="png" || forcePng){
			    if (imgElement.runtimeStyle.filter.indexOf("DXImageTransform.Microsoft.AlphaImageLoader")> -1) {
				    imgElement.filters['DXImageTransform.Microsoft.AlphaImageLoader'].src = newSource;
                }
			    else {
			        imgElement.runtimeStyle.filter += "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + newSource + "',sizingMethod='image');";
					imgElement.src = esriBlankImagePath;
				}
			}
			else {
			    imgElement.src=newSource;
			}
        }
        else
        {
            imgElement.src=newSource;
        }
    }
}
/*
function iframeHideWorkaroundForVML()
{
        if (isIE && ieVersion < 7)
        {
            var iframes=document.getElementsByTagName("iframe");
            if (iframes==null)return;
            for (var i=0;i<iframes.length;i++)
            {
                var iframe=iframes[i];
                if (iframe==null)continue;
                if (iframe.style.hiddenForIE6==null)
                {
                    if (iframe.style.visibility!=null) iframe.style.hiddenForIE6=new String(iframe.style.visibility.toString());
                    iframe.style.visibility='hidden';
                }
           } 
        }
}

function iframeShowWorkaroundForVML()
{
        if (isIE && ieVersion < 7)
        {
            var iframes=document.getElementsByTagName("iframe");
            if (iframes==null)return;
            for (var i=0;i<iframes.length;i++)
            {
                var iframe=iframes[i];
                if (iframe==null)continue;
                if (iframe.style.hiddenForIE6!=null)
                {
                    iframe.style.visibility=iframe.style.hiddenForIE6;
                    iframe.style.hiddenForIE6=null; 
                }
           } 
        }
}

var commonLoaded = true;
*/
function setElementDisplayStyle(id, style)
{
    var elem = document.getElementById(id);
    if (elem != null)
        elem.style.display = style;
}

function expandCollapseElement(expandCollapseImageId, elementId, collapsedImage, expandedImage)
{
    var elem = document.getElementById(elementId);
    var src;
    if (elem != null)
    {
        if (elem.style.display == "none") //collapsed; so expand
        {
            elem.style.display = "block";
            src = expandedImage; 
        }
        else//expanded; so collapse
        {
            elem.style.display = "none";
            src = collapsedImage; 
        }
       if (expandCollapseImageId != null)
        { 
            var image = document.getElementById(expandCollapseImageId);
            if (image != null)
                image.src = src;
        } 
    }
}

function enableDisableElements(enableIds, disableIds)
{
    var element = null;
    if (enableIds != null)
    { 
        var enableArray = enableIds.split(',');
        if (enableArray != null && enableArray.length >0)
        {
            for(var i=0;i<enableArray.length;++i)
            {
                element = document.getElementById(enableArray[i]);
                if (element != null)
               { 
                    element.disabled = false;
                    element.style.color = "";
               } 
            } 
        } 
    } 
    if (disableIds != null)
    { 
        var disableArray = disableIds.split(',');
        if (disableArray != null && disableArray.length >0)
        {
            for(var i=0;i<disableArray.length;++i)
            {
                element = document.getElementById(disableArray[i]);
                if (element != null)
               { 
                    element.disabled = true;  
                    element.style.color = "Gray"; //spans(labels) cannot be disabled in Mozilla.  They have to be grayed out.
               } 
            } 
        } 
    }        
}

function addScriptTag(id, type, language, src, defer, charset, content)
{
    var scriptObj = document.createElement("script");
    // Add script object attributes
    if (id != null) scriptObj.setAttribute("id", id);
    if (type != null) scriptObj.setAttribute("type", type);
    if (charset != null) scriptObj.setAttribute("charset", charset);
    if (src != null) scriptObj.setAttribute("src", src);
    if (language != null) scriptObj.setAttribute("language", language);
    if (defer != null) scriptObj.setAttribute("defer", defer);
   if (content != null) scriptObj.text = content; 
    var headLoc = document.getElementsByTagName("head").item(0);
    headLoc.appendChild(scriptObj);
}