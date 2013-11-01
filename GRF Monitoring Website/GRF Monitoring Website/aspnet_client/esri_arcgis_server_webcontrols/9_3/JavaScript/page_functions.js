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

///////////////////////////////////// Page Common Functions /////////////////////////////////////
// create a new Page object
function PageCreation(controlname, width, height, maparray,dragBoxColor,dragLineWidth) {
	this.controlname = controlname;
	this.left = 0;
	this.top = 0;
	this.width = width;
	this.height = height;
	this.maps = maparray;
	this.UniqueDivID = controlname;
	this.DragBoxColor = dragBoxColor;
	if (dragLineWidth==null) dragLineWidth = 3;
	this.DragLineWidth = dragLineWidth;
}

// Make Page Div
function MakePageDiv(i, blankImage, cellname, tooltip) 
{
	var m = Pages[i];
	var control = Pages[i].controlname;
	var d = "PageDiv_" + control;
	var di = "PageImage_" + control;
	var imgwidth = m.width;
	var imgheight = m.height;
		// Create the client code
	var s = "";
		// The overall container... position is relative... in flow

	if ((cellname==null) || (cellname=="")) s += '<table cellspacing=0 cellpadding=0 ><tr><td id="MapCell_' + control + '">';
	s += '<div id="PageControlDiv_' + control + '" style=" position: relative; width: ' + m.width + 'px; height: ' + m.height + 'px; overflow:hidden;">\n';		
		// Page div, holds Page image ... position is absolute within container
	s += '<div id="' + d + '" style="position: absolute; left: 0px; top: 0px; background-color: White; width: ' + imgwidth + 'px; height: ' + imgheight + 'px; overflow:hidden; visibility: visible;">\n';
		// Page image... 
	s += '	<img id="' + di + '" alt="' + tooltip + '"  title="' + tooltip + '" src="' + pageURL[i] + '" width="' + imgwidth + '" height="' + imgheight + '" hspace="0" vspace="0" border="0">\n';
	s += '</div>\n';
		// Page mask... 
	s += '<div id="PageMaskDiv_' + control + '" style="position: absolute; left: 0px; top: 0px; background-color: Transparent; width: ' + imgwidth + 'px; height: ' + imgheight + 'px; visibility: hidden; overflow:hidden;">\n';
	s += '	<img id="PageMaskImage_' + control + '" alt="" src="' + blankImage + '" width="' + imgwidth + '" height="' + imgheight + '" hspace="0" vspace="0" border="0">\n';
	s += '</div>\n';

	s += '<div id="PageMapDiv_' + control + '" style="position: absolute; left: 0px; top: 0px; background-color: Transparent; visibility: visible;">\n';
	// map divs for each layer
	for (var j=0;j<m.maps.length;j++) {
		var dm = "MapMaskImage_" + control + "_" + j;
		var dd = "MapMaskDiv_" + control + "_" + j;
		var di = "MapImage_" + control + "_" + j;
		var d = "MapDiv_" + control + "_" + j;
		var df = m.maps[j];
		s += '<div id="' + dd + '" style="position: absolute; left: 0px; top: 0px; background-color: White; width: ' + imgwidth + 'px; height: ' + imgheight + 'px; overflow:hidden;">\n';
			// Map mask... 
		s += '	<img id="' + dm + '" alt="" src="' + blankImage + '" width="' + imgwidth + '" height="' + imgheight + '" hspace="0" vspace="0" border="0">\n';
		s += '</div>\n';
		s += '<div id="' + d + '" style="position: absolute; left: 0px; top: 0px; background-color: White; width: ' + imgwidth + 'px; height: ' + imgheight + 'px; overflow:hidden;">\n';
			// Map image... 
		s += '	<img id="' + di + '" alt="' + tooltip + '"  title="' + tooltip + '" src="' + pageURL[i] + '" width="' + imgwidth + '" height="' + imgheight + '" hspace="0" vspace="0" border="0">\n';
		s += '</div>\n';
		//alert(d);
	
	}
	s += '</div>\n';
	
	s += '</div>\n';
	if ((cellname==null) || (cellname=="")) {
		s += '</td></tr></table>';
		document.writeln(s);
	} else {
		var obj = document.getElementById(cellname);	
		obj.innerHTML = s;
	}


		// // clip the map divs to the data frame areas
	for (var j=0;j<m.maps.length;j++) {
		var dd = "MapMaskDiv_" + control + "_" + j;
		var d = "MapDiv_" + control + "_" + j;
		var df = m.maps[j];
		// clip it to the map area
		panClipLayer(dd,df.left , df.top, df.left + df.width, df.top + df.height);
		panClipLayer(d,df.left , df.top, df.left + df.width, df.top + df.height);
		
	}

}

///////////////////////////////////// Page Common Functions /////////////////////////////////////

///////////////////////////////////// Set Tool Functions /////////////////////////////////////
// Line actions - pan
function PageDragImage(divid, mode, showLoading) {
	pageSetTool(divid, mode, showLoading, pageDragImageStart, null, "move");
}
	
// Rectangular actions - zooms, select
function PageDragRectangle(divid, mode, showLoading) {
	pageSetTool(divid, mode, showLoading, pageDragRectangleStart, null, "crosshair");
}
	
// Point actions - identify, CenterAt, ZoomToPoint, etc.
function PagePoint(divid, mode, showLoading) {
	pageSetTool(divid, mode, showLoading, pagePointClick, null, "pointer");
	document.onmousemove=null;
	document.onmouseup=null;
}

// Line actions - pan
function PageMapDragImage(divid, mode, showLoading) {
	pageSetTool(divid, mode, showLoading, null, pageMapDragImageStart, "move");
}
	
// Rectangular actions - zooms, select
function PageMapDragRectangle(divid, mode, showLoading) {
	pageSetTool(divid, mode, showLoading, null, pageMapDragRectangleStart, "crosshair");
}
	
// Point actions - identify, CenterAt, ZoomToPoint, etc.
function PageMapPoint(divid, mode, showLoading) {
	pageSetTool(divid, mode, showLoading, null, pageMapPointClick, "pointer");
	document.onmousemove = null;
	document.onmouseup = null;
}

function pageSetTool(divid, mode, showLoading, pageMouseDownFunction, mapMouseDownFunction, cursor)
{
	//alert(mode);
	if (showLoading == null) showLoading = true;
	loadingSettings[divid + mode] = showLoading;
	//find Page
	var page;
	for (var i=1;i<Pages.length;i++) {
		page = Pages[i];
		if (page.UniqueDivID == divid)
			break;
	}
	
	if (page != null)
	{
		// turn off page masks for page tools, turn on for map tools
		var div = "PageMaskDiv_" + divid;
		var divObj = document.getElementById(div);
		var pageMapDiv = "PageMapDiv_" + divid;
		if (mapMouseDownFunction == null)//page tool
		{
			div = "PageDiv_" + divid;
			divObj = document.getElementById(div);
			divObj.onmousedown = pageMouseDownFunction;
			divObj.style.cursor = cursor;
			hideLayer(pageMapDiv);
			
		}
		else//map tool
		{
			// because of Netscape 7.0 quirk, force rendering of map divs
			if (nav70) hideLayer(pageMapDiv);
			showLayer(pageMapDiv);
		}
		// turn off map masks fpr page tools, turn on for map tools
		var mapDiv;;
		var mapdivObj;
		for (var i=0;i<page.maps.length;i++)
		{
			mapDiv = "MapDiv_" + divid + "_" + i;;
			mapdivObj = document.getElementById(mapDiv);
			mapdivObj.onclick = null;
			if (mapMouseDownFunction == null) //page tool
			{
				mapdivObj.onmousedown = null;
			}
			else //map tool
			{
				mapdivObj.style.cursor = cursor;
				mapdivObj.onmousedown = mapMouseDownFunction;
			}
		}
	}
	drawBox = false;
	dragImage = false;
	var m = divid + "_mode";
	document.forms[docFormID].elements[m].value = mode;
}
///////////////////////////////////// Set Tool Functions /////////////////////////////////////

///////////////////////////////////// MouseDown Functions /////////////////////////////////////
// Line action - pan - mouse down
function pageDragImageStart(e) {
	if (isLeftButton(e)) {
		drawBox = false;
		if (!dragImage) {
			dragImage = true;
			getXY(e);
			getPageDiv(e);
			x1=mouseX;
			y1=mouseY
			x2=x1+1;
			y2=y1+1;
			document.onmousemove = pageDragImageMove;
			document.onmouseup = pageDragImageUp;
		}
	}
	return false;
}

// Rectangular actions - zooms, select - mouse down
function pageDragRectangleStart(e) {
	if (isLeftButton(e)) {
		dragImage = false;
		if (!drawBox) {
			drawBox = true;
			getXY(e);
			getPageDiv(e);
			x1=mouseX;
			y1=mouseY;
			x2=x1+1;
			y2=y1+1;
			displayZoomBox(x1,y1,x2,y2,Pages[pageIndex].DragBoxColor);
			document.onmousemove = pageDragRectangleMove;
			document.onmouseup = pageDragRectangleUp;
		}
	}
	return false;
}
	
// Point actions - identify, CenterAt, ZoomToPoint, etc. - mouse down
function pagePointClick(e) {
	if (isLeftButton(e)) {
		getXY(e);
		getPageDiv(e);
		adjustMapCoords();
		var f = document.forms[docFormID];
		f.minx.value=zleft;
		f.miny.value=ztop;
		postBack(Pages[pageIndex].controlname, 'point');
	}
	return false;
}
		
// Line action - pan - mouse down
function pageMapDragImageStart(e) {
	if (isLeftButton(e)) {
		drawBox = false;
		if (!dragImage) {
			dragImage = true;
			getXY(e);
			getPageMapDiv(e);
			x1=mouseX;
			y1=mouseY
			x2=x1+1;
			y2=y1+1;
		
			document.onmousemove = pageMapDragImageMove;
			document.onmouseup = pageMapDragImageUp;
		}
	}
	return false;
}

// Rectangular actions - zooms, select - mouse down
function pageMapDragRectangleStart(e) {
	if (isLeftButton(e)) {
		dragImage = false;
		if (!drawBox) {
			drawBox = true;
			getXY(e);
			getPageMapDiv(e);
			x1=mouseX;
			y1=mouseY;
			x2=x1+1;
			y2=y1+1;
			
			displayZoomBox(x1,y1,x2,y2,Pages[pageIndex].DragBoxColor);
			document.onmousemove = pageMapDragRectangleMove;
			document.onmouseup = pageMapDragRectangleUp;
		}
	}
	return false;
}
	
// Point actions - identify, CenterAt, ZoomToPoint, etc. - mouse down
function pageMapPointClick(e) {
	if (isLeftButton(e)) {
		getXY(e);
		getPageMapDiv(e);
		divObj.style.cursor = "wait";
		adjustMapCoords();
		var f = document.forms[docFormID];
		f.minx.value=zleft;
		f.miny.value=ztop;
		f.mapIndex.value=Pages[pageIndex].maps[pageMapIndex].index;
		postBack(Pages[pageIndex].controlname, 'mappoint');
	}
	return false;
}

// get the map div where the mouse down event happened
function getPageDiv(e) {
	divLeft = 0;
	divTop = 0;
	divWidth = 0;
	divHeight = 0;
	for (var i=1;i<Pages.length;i++) {
		var p = Pages[i];
		calcElementPosition("PageDiv_" + p.controlname);
		if ((mouseX>=eLeft) && (mouseX<=(eLeft+eWidth)) && (mouseY>=eTop) && (mouseY<=(eTop+eHeight)))  {
			divIndex = i;
			divLeft = eLeft;
			divTop = eTop;
			divWidth = eWidth;
			divHeight = eHeight;
			divParentIndex = 0;
			divParentLeft = 0;
			divParentTop = 0;
			divId = "PageDiv_" + p.controlname;
			pageIndex = i;
			divControl = p.controlname;
			lineWidth = p.DragBoxWidth;
			divObj = document.getElementById("PageDiv_" + p.controlname);
			break;
		}
	}
}


// get the map div where the mouse down event happened
function getPageMapDiv(e) {
	divLeft = 0;
	divTop = 0;
	divWidth = 0;
	divHeight = 0;
	for (var i=1;i<Pages.length;i++) {
		var p = Pages[i];
		for (var j=0;j<p.maps.length;j++) {
			calcElementPosition("MapDiv_" + p.controlname + "_" + j);
			var m = p.maps[j];
			if ((mouseX>=eLeft+m.left) && (mouseX<=(eLeft+m.left+m.width)) && (mouseY>=eTop+m.top) && (mouseY<=(eTop+m.top+m.height)))  {
				divIndex = i;
				divLeft = m.left;
				divTop = m.top
				divWidth = m.width;
				divHeight = m.height;
				calcElementPosition("PageDiv_" + p.controlname);
				divParentIndex = i;
				divParentLeft = eLeft;
				divParentTop = eTop;
				divId = "MapDiv_" + p.controlname + "_" + j;
				pageIndex = i;
				pageMapIndex = j;
				divControl = p.controlname;
				lineWidth = p.DragBoxWidth;
				divObj = document.getElementById("MapDiv_" + p.controlname + "_" + j);
				break;
			}
		}
	}
}

///////////////////////////////////// MouseDown Functions /////////////////////////////////////

///////////////////////////////////// MouseMove Functions /////////////////////////////////////
// Line action - pan - mouse move
function pageDragImageMove(e) {
	if (dragImage) {
		getXY(e);
		x2 = mouseX;
		y2 = mouseY;
		if (x2 < divLeft) x2 = divLeft;
		if (x2 > divWidth + divLeft) x2 = divWidth + divLeft;
		if (y2 < divTop) y2 = divTop;
		if (y2 > divHeight + divTop) y2 = divHeight +  divTop; 
		var xMove = x2-x1;
		var yMove = y2-y1;
		var cLeft = -xMove;
		var cTop = -yMove;
		var cRight = divWidth;
		var cBottom = divHeight;
		if (xMove>0) {
			cLeft = 0;
			cRight = divWidth - xMove;
		}
		if (yMove>0) {
			cTop = 0;
			cBottom = divHeight - yMove;
		}
		// move div
		moveLayer(divId,(xMove),(yMove));
		panClipLayer(divId,cLeft,cTop,cRight,cBottom);
	}
	return false;
}

// Rectangular actions - zooms, select - mouse move
function pageDragRectangleMove(e) {
	if (drawBox) {
		getXY(e);
		// stretch ZoomBox
		x2=mouseX;
		y2=mouseY;
		// page adjustments
		if (x2 < divLeft) x2 = divLeft;
		if (x2 > divWidth + divLeft) x2 = divWidth + divLeft;
		if (y2 < divTop) y2 = divTop;
		if (y2 > divHeight + divTop) y2 = divHeight +  divTop; 
		setClip(Pages[divIndex].DragLineWidth);		
	}
	return false
}

// Line action - pan - mouse move
function pageMapDragImageMove(e) {
	if (dragImage) {
		getXY(e);
		
		x2 = mouseX;
		y2 = mouseY;
		if (x2 < divLeft + divParentLeft) x2 = divLeft + divParentLeft;
		if (x2 > divWidth + divLeft + divParentLeft) x2 = divWidth + divLeft + divParentLeft;
		if (y2 < divTop + divParentTop) y2 = divTop + divParentTop;
		if (y2 > divHeight + divTop + divParentTop) y2 = divHeight +  divTop + divParentTop; 
		var xMove = x2-x1;
		var yMove = y2-y1;
		if (divParentIndex==0) {
			var cLeft = -xMove;
			var cTop = -yMove;
			var cRight = divWidth;
			var cBottom = divHeight;
			if (xMove>0) {
				cLeft = 0;
				cRight = divWidth - xMove;
			}
			if (yMove>0) {
				cTop = 0;
				cBottom = divHeight - yMove;
			}
			moveLayer(divId,(xMove + divLeft),(yMove + divTop));
			panClipLayer(divId,cLeft,cTop,cRight,cBottom);
		} else {
			var cLeft = divLeft - xMove;
			var cTop = divTop - yMove;
			var cRight = divLeft + divWidth;
			var cBottom = divTop + divHeight;
			if (xMove>0) {
				cLeft = divLeft;
				cRight = (divLeft + divWidth) - xMove;
			}
			if (yMove>0) {
				cTop = divTop;
				cBottom = (divTop + divHeight) - yMove;
			}
			moveLayer(divId,(xMove),(yMove));
			panClipLayer(divId,cLeft,cTop,cRight,cBottom);
		
		}
	}
	return false;
}

// Rectangular actions - zooms, select - mouse move
function pageMapDragRectangleMove(e) {
	if (drawBox) {
		getXY(e);
		// stretch ZoomBox
		x2=mouseX;
		y2=mouseY;
		// dataframe adjustments
		if (x2 < divLeft + divParentLeft) x2 = divLeft + divParentLeft;
		if (x2 > divWidth + divLeft + divParentLeft) x2 = divWidth + divLeft + divParentLeft;
		if (y2 < divTop + divParentTop) y2 = divTop + divParentTop;
		if (y2 > divHeight + divTop + divParentTop) y2 = divHeight +  divTop + divParentTop; 
		setClip(Pages[pageIndex].DragLineWidth);		
	}
	return false;
}
///////////////////////////////////// MouseMove Functions /////////////////////////////////////

///////////////////////////////////// MouseUp Functions /////////////////////////////////////
// Line action - pan - mouse up
function pageDragImageUp(e) {
	if (dragImage) {
		dragImage = false;
		//divObj.style.cursor = "wait";
		getXY(e);
		
		var ixOffset = x2-x1;
		var iyOffset = y2-y1;
		var centerx = Math.round(divWidth/2);
		var centery = Math.round(divHeight/2);
		showLayer(divId);
		
		var f = document.forms[docFormID];
		f.minx.value=centerx - ixOffset;
		f.miny.value=centery - iyOffset;
		document.onmousemove=null;
		document.onmouseup=null;
    	postBack(Pages[divIndex].controlname, 'dragimage');
		/*
		alert(divObj.id + "\nXoffset: " + ixOffset + " ... Yoffset: " + iyOffset + "\nCenter at: " + (centerx - ixOffset) + "," + (centery - iyOffset));
		moveLayer(divId, 0, 0);
		panClipLayer(divId,0,0,divWidth,divHeight);
		//*/
	}
	return false;
}

// Rectangular actions - zooms, select - mouse up
function pageDragRectangleUp(e) {
	if (drawBox) {
		drawBox = false;
		//divObj.style.cursor = "wait";
		getXY(e);
		hideZoomBox();
		setClip(Pages[divIndex].DragLineWidth);		
		// adjust for offsets
		zleft -= divLeft;
		zright -= divLeft;
		zbottom -= divTop;
		ztop -= divTop;

		var f = document.forms[docFormID];
		f.maxx.value=zright;
		f.maxy.value=zbottom;
		f.minx.value=zleft;
		f.miny.value=ztop;
		document.onmousemove=null;
		document.onmouseup=null;
    	postBack(Pages[divIndex].controlname, 'dragrectangle');
		//alert(divObj.id + "\n" + zleft + "," + ztop + " x " + zright + "," + zbottom);
	}
	return false;
}

// Line action - pan - mouse up
function pageMapDragImageUp(e) {
	if (dragImage) {
		dragImage = false;
		//divObj.style.cursor = "wait";
		getXY(e);
		window.scrollTo(0,0);
		var ixOffset = x2-x1;
		var iyOffset = y2-y1;
		var centerx = Math.round(divWidth/2);
		var centery = Math.round(divHeight/2);
		
		var f = document.forms[docFormID];
		f.minx.value=centerx - ixOffset;
		f.miny.value=centery - iyOffset;
		f.mapIndex.value=Pages[pageIndex].maps[pageMapIndex].index;
		postBack(Pages[pageIndex].controlname, 'mapdragimage');
		/*
		alert(divObj.id + "\nXoffset: " + ixOffset + " ... Yoffset: " + iyOffset + "\nCenter at: " + (centerx - ixOffset) + "," + (centery - iyOffset));
		moveLayer(divId, 0, 0);
		var m = Pages[pageIndex].maps[pageMapIndex];
		panClipLayer(divId,m.left,m.top,(m.left+m.width),(m.top+m.height));
		//*/
	}
	return false;
}

// Rectangular actions - zooms, select - mouse up
function pageMapDragRectangleUp(e) {
	if (drawBox) {
		drawBox = false;
		//divObj.style.cursor = "wait";
		getXY(e);
		hideZoomBox();
		setClip(Pages[pageIndex].DragLineWidth);		
		// adjust for offsets
		zleft -= divLeft + divParentLeft;
		zright -= divLeft + divParentLeft;
		zbottom -= divTop + divParentTop;
		ztop -= divTop + divParentTop;
		var f = document.forms[docFormID];
		f.maxx.value=zright;
		f.maxy.value=zbottom;
		f.minx.value=zleft;
		f.miny.value=ztop;
		f.mapIndex.value=Pages[pageIndex].maps[pageMapIndex].index;
    	postBack(Pages[pageIndex].controlname, 'mapdragrectangle');
		//alert(divObj.id + "\n" + zleft + "," + ztop + " x " + zright + "," + zbottom);

	}
	return false;
}

///////////////////////////////////// MouseUp Functions /////////////////////////////////////

//alert("overview_functions.js loaded");
