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

///////////////////////////////////// Overview Global Variables /////////////////////////////////////
var dragOV = false;
var Overviews = new Array();

var ovCounter = 0;
var ovIndex = 0;
var ovBoxDivId = "";
var ovLeft = 0;
var ovTop = 0;
var ovWidth = 50;
var ovHeight = 50;
var ovRight = 50;
var ovBottom = 50;
var ovBoxLeft = 10;
var ovBoxTop = 10;
var ovBoxWidth = 30;
var ovBoxHeight = 30;
var ovBoxRight = 40;
var ovBoxBottom = 40;
var ovLineWidth = 3;

var ovBoxOpacity = 35;
///////////////////////////////////// Overview Global Variables /////////////////////////////////////

///////////////////////////////////// Common Functions /////////////////////////////////////
// create a new overview object
function OVCreation(controlname,index, width, height,  boxleft, boxtop, boxwidth, boxheight, boxcolor, linewidth) {
	if (boxtop>height) boxtop = height - 1;
	if (boxleft>width) boxleft = width;
	if (boxtop<0) {
		boxheight = boxheight + boxtop;
		if (boxheight<1) boxheight = 1;
		boxtop = 0;
	}
	if (boxleft<0) {
		boxwidth = boxwidth + boxleft;
		if (boxwidth<1) boxwidth = 1;
		boxleft = 0;
	}
	if (isIE) {
		if (boxwidth>width-boxleft) boxwidth = width-boxleft;
		if (boxheight>height-boxtop) boxheight = height-boxtop;
	} else {
		// adjust box size and position on Netscape/Mozilla to allow for div border
		boxwidth -= linewidth;
		boxheight -= linewidth;
		// if necessary, adjust width and height so right or bottom do not go past inside ov div border
		if (boxwidth>width-boxleft-(linewidth*2)) boxwidth = width-boxleft-(linewidth*2);
		if (boxheight>height-boxtop-(linewidth*2)) boxheight = height-boxtop-(linewidth*2);
		// if necessary, change left or top to keep box left and top inside ov div border 
		if (boxtop>height-(linewidth*2)) boxtop -= (linewidth*2) - 1;
		if (boxleft>width-(linewidth*2)) boxleft -= (linewidth*2) - 1;
	}
	this.controlname = controlname;
	this.index = index;
	this.left = 0;
	this.top = 0;
	this.width = width;
	this.height = height;
	this.right = width;
	this.bottom = height;
	//this.uniquedivid = uniquedivid;
	this.boxleft = boxleft;
	this.boxtop = boxtop;
	this.boxwidth = boxwidth;
	this.boxheight = boxheight;
	this.boxright = boxleft + boxwidth;
	this.boxbottom = boxtop + boxheight;
	this.boxcolor = boxcolor;
	this.linewidth = linewidth;
}


// Make OV Div
function MakeOVDiv(ovIndex, control, imageurl, blankurl, tooltip, cellname) 
{
	var d = "OVDiv_" + control;
	var di = "OVImage_" + control;
	var dibox = "OVBoxDiv_" + control;
	var dai = "OVBoxImage_" + control;
	//alert("ovIndex=" + ovIndex + "\nd=" + d + "\ndi=" + di + "\ndibox=" + dibox);
	var m = Overviews[ovIndex];
	var imgwidth= m.width;
	var imgheight = m.height;
	var imgpos = 0;

		// Create the client code
	var s = "";
		// The overall container... position is relative... in flow
			// add table if no cellname.... if passed, it is assumed that width has been also defined as shown below
	if ((cellname==null) || (cellname=="")) s += '<table cellspacing=0 cellpadding=0 width=' + m.width + '><tr><td id="OVCell_' + control + '">';
	s += '<div id="OVControlDiv_' + control + '" style="position: relative; background-color: White; width: ' + m.width + 'px; height: ' + m.height + 'px; overflow:hidden;">\n';	
		// OV div, holds map image ... position is absolute within container
	s += '<div id="' + d + '" style="position: absolute; left: 0px; top: 0px; background-color: White; width: ' + imgwidth + 'px; height: ' + imgheight + 'px; overflow:hidden;">\n';
		// Map image... 
	s += '	<img id="' + di + '" alt="' + tooltip + '"  title="' + tooltip + '" src="' + imageurl + '" width="' + imgwidth + '" height="' + imgheight + '" hspace="0" vspace="0" border="0">\n';
	s += '</div>\n';
	
		// OVBox div, holds map image ... position is absolute within container
	style = "border: " + m.linewidth + "px solid " + m.boxcolor + ";";
	var opac = ovBoxOpacity / 100;
	var platform = navigator.platform;
	if ((platform=="Win32") || ((platform=="MacPPC") && (!isIE))) {
		if (navigator.userAgent.indexOf("Opera")==-1) {
			style += "background-color: White; opacity: " + opac + "; -moz-opacity: " + opac + "; filter: alpha(opacity=" + ovBoxOpacity + ");";
		}
	}
	
	s += '<div id="' + dibox + '" style="position: absolute; left: ' + m.boxleft + 'px; top: ' + m.boxtop + 'px;' + style + ' width: ' + m.boxwidth + 'px; height: ' + m.boxheight + 'px; overflow:hidden; ">\n';
		// Map image... 
	s += '	<img id="' + dai + '" alt="' + tooltip + '"  title="' + tooltip + '" src="' + blankurl + '" width="' + m.boxwidth + '" height="' + m.boxheight + '" hspace="0" vspace="0" border="0">\n';
	s += '</div>\n';
	s += '</div>\n';
	
	if ((cellname==null) || (cellname=="")) {
		s += '</td></tr></table>';
		document.writeln(s);
	} else {
		var obj = document.getElementById(cellname);	
		obj.innerHTML = s;
	}
	
}

///////////////////////////////////// Common Functions /////////////////////////////////////

///////////////////////////////////// Setup Function /////////////////////////////////////
// Set up the OV events
function SetupOVEvents() {
	var zvalue = 9990;
	for (var i=0;i<Overviews.length;i++) {
		var controlname = Overviews[i].controlname;
		var div = "OVBoxDiv_" + controlname;
		var dObj = document.getElementById(div);
		//dObj.style.visibility = "visible";
		dObj.style.cursor = "move";
		dObj.onmousedown = ovDragStart;
		dObj.onmousemove = ovDragMove;
		dObj.onmouseup = ovDragUp;
		dObj.style.zIndex = zvalue;
		zvalue--;
		var div = "OVDiv_" + controlname;
		var dObj = document.getElementById(div);
		//dObj.style.visibility = "visible";
		dObj.style.cursor = "hand";
		dObj.onmousedown = ovClick;
		dObj.style.zIndex = zvalue;
		zvalue--;
	}
	dragOV = false;
}
///////////////////////////////////// Setup Function /////////////////////////////////////

///////////////////////////////////// Mouse Down/Move/Up/Click Functions /////////////////////////////////////
// Start overview AOI move action - mouse down
function ovDragStart(e) {
	if (isLeftButton(e)) {
		if (!dragOV) {
			dragOV = true;
			getXY(e);
			getOVDiv();
		}
	}
	return false;
}

// OV AOI move action - mouse move
function ovDragMove(e) {
	if (dragOV) {
		getXY(e);
		var ovboxw = parseInt(ovBoxWidth / 2);
		var ovboxh = parseInt(ovBoxHeight / 2);
		var ex = mouseX - ovboxw - ovLeft;
		var ey = mouseY - ovboxh - ovTop;
		// make sure that the box stays withing the ov image
		if (ex<0) ex = 0;
		if (ey<0) ey = 0;
		var addsize = ovLineWidth * 2;
		if (isIE) 
			addsize = 0;
		if (ex+ovBoxWidth>ovWidth-addsize) ex = ovWidth - ovBoxWidth - addsize;
		if (ey+ovBoxHeight>ovHeight-addsize) ey = ovHeight - ovBoxHeight - addsize;
		// move div
		moveLayer(ovBoxDivId,ex,ey);
	
	}
	return false
}

// overview AOI up actions - mouse up
function ovDragUp(e) {
	if (dragOV) {
		dragOV=false;
		//divObj.style.cursor = "wait";
		getXY(e);
		var bx = mouseX - ovLeft;
		var by = mouseY - ovTop;
		var ovboxw = parseInt(ovBoxWidth / 2);
		var ovboxh = parseInt(ovBoxHeight / 2);
		//  keep box within the ov image and get new center if necessary
		if (mouseX-ovboxw<ovLeft) bx = ovboxw;
		if (mouseX+ovboxw>ovRight) bx = ovRight - ovboxw - ovLeft;
		if (mouseY-ovboxh<ovTop) by = ovboxh;
		if (mouseY+ovboxh>ovBottom) by = ovBottom - ovboxh - ovTop;
		var f = document.forms[docFormID];
		f.centerx.value=bx;
		f.centery.value=by;
		//alert(OVboxDiv.id + "\n" + bx + ", " + by);
		__doPostBack(Overviews[ovIndex].controlname, 'point');
		// shows the animated gif for Loading Map...
		ShowLoading();
		return false;
	}
	dragOV=false;
}

// OV click outsid the AOI box ... get new center point
function ovClick(e) {
	if (isLeftButton(e)){
		getXY(e);
		getOVDiv();
		var bx = mouseX - ovLeft;
		var by = mouseY - ovTop;
		var f = document.forms[docFormID];
		f.centerx.value=bx;
		f.centery.value=by;
		//alert(OVboxDiv.id + "\n" + bx + ", " + by);
		__doPostBack(Overviews[ovIndex].controlname, 'point');
	}
	return false;
}

// get the ov div where the mouse down event happened
function getOVDiv() {
	ovIndex = 0;
	ovLeft = 0;
	ovTop = 0;
	ovWidth = 0;
	ovHeight = 0;
	for (var i=0;i<Overviews.length;i++) {
		var m = Overviews[i];
		calcElementPosition("OVDiv_" + m.controlname);
		var eRight = eLeft + eWidth;
		var eBottom = eTop + eHeight;
		if ((mouseX>=eLeft) && (mouseX<=eRight) && (mouseY>=eTop) && (mouseY<=eBottom)) {
			ovIndex = i;
			ovLeft = eLeft;
			ovTop = eTop;
			ovWidth = eWidth;
			ovHeight = eHeight;
			ovRight = eRight;
			ovBottom = eBottom;
			ovBoxLeft = m.boxleft;
			ovBoxTop = m.boxtop;
			ovBoxRight = m.boxright;
			ovBoxBottm = m.boxbottom;
			ovBoxWidth = m.boxwidth;
			ovBoxHeight = m.boxheight;
			ovBoxDivId = "OVBoxDiv_" + m.controlname;
			OVboxDiv = document.getElementById(ovBoxDivId);			
			ovLineWidth = m.linewidth;
			break;
		
		}
	}
}

///////////////////////////////////// Mouse Down/Move/Up/Click Functions /////////////////////////////////////





