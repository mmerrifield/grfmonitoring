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

///////////////////////////////////// Map Common Functions /////////////////////////////////////
// Make Map Div

function MakeMapDiv(mapIndex, control, imageurl, cellname, tooltip) {
	var d = "MapDiv_" + control;
	var di = "MapImage_" + control;
	var m = Maps[mapIndex];
	var imgwidth = m.width;
	var imgheight = m.height;
		// Create the client code
	var s = "";
		// The overall container... position is relative... in flow
			// add table if no cellname.... if passed, it is assumed that width has been also defined as shown below
	if ((cellname==null) || (cellname=="")) s += '<table cellspacing=0 cellpadding=0 width=' + m.width + '><tr><td id="MapCell_' + control + '">';
	s += '<div id="MapControlDiv_' + control + '" style=" position: relative; width: ' + m.width + 'px; height: ' + m.height + 'px; overflow:hidden;">\n';		
		// Map div, holds map image ... position is absolute within container
	s += '<div id="' + d + '" style="position: absolute; left: 0px; top: 0px; background-color: White; width: ' + imgwidth + 'px; height: ' + imgheight + 'px; overflow:hidden;">\n';
		// Map image... 
	s += '	<img id="' + di + '" alt="' + tooltip + '"  title="' + tooltip + '" src="' + imageurl + '" width="' + imgwidth + '" height="' + imgheight + '" hspace="0" vspace="0" border="0">\n';
	s += '</div>\n';
	
	var ldiv = "LineDiv_" + control;
	//create Map Vector Layer
	s += '<div id="' + ldiv + '" style="background-color:transparent; position:absolute; left:0px; top:0px; visibility: hidden; overflow:hidden; width:' + m.width + 'px; height:' + m.height + 'px;"></div>';

	s += '</div>\n';
	if ((cellname==null) || (cellname=="")) {
		s += '</td></tr></table>';
		document.writeln(s);
	} else {
		var obj = document.getElementById(cellname);	
		obj.innerHTML = s;
	}

	setDivZOrder(ldiv,(950 + mapIndex));
	vo[d] = new vectorObjects(ldiv);
	vo[d].lineWidth = m.DragLineWidth;
	vo[d].divColor = m.DragBoxColor;
	pix[d] = new pixelObject(control, m.left,m.top,m.width,m.height);
	xycoord[d] = new coordList();	
}



//Clear Vector Events
function ClearVectorEvents(divid) {
	var linedivname = "LineDiv_" + divid;
	var areadivname = "MapDiv_" + divid;
	areaDivName = areadivname;
	lineDivName = linedivname;
	hideLayer(lineDivName);
	var vd = document.getElementById(areaDivName);
	if (vd!=null) {
		vd.onclick = null;
		vd.onmousedown = null;
		vd.onmousemove = null;
		vd.ondblclick = null;
	}
}
///////////////////////////////////// Map Common Functions /////////////////////////////////////

///////////////////////////////////// Set Tool Functions /////////////////////////////////////
// Drag actions - pan
function MapDragImage(divid, mode, showLoading) {
	mapSetTool(divid, mode, showLoading, mapDragImageStart, null, "move", -1, "hidden", "");
}
	
// Rectangular actions - zooms, select
function MapDragRectangle(divid, mode, showLoading) {
	mapSetTool(divid, mode, showLoading, mapDragRectangleStart, null, "crosshair", -1, "hidden", "");
}
	
// Point actions - identify, CenterAt, ZoomToPoint, etc.
function MapPoint(divid, mode, showLoading) {
	mapSetTool(divid, mode, showLoading, mapPointClick, null, "pointer", "hidden", -1, "");
	document.onmousemove = null;
	document.onmouseup = null;
}
	
// Line actions - measure, sketch, select, etc.
function MapLine(divid, mode, showLoading) {
	mapSetTool(divid, mode, showLoading, null, mapVectorClick, "crosshair", 0, "hidden", 
		"Line - Click to start line. Move cursor to change line and angle. Click again to finish line.");
}

// Polyline action - measure, sketch, select, etc.
function MapPolyline(divid, mode, showLoading) {
	mapSetTool(divid, mode, showLoading, mapVectorClick, null,  "crosshair", 1, "visible", 
		"Polyline - Click to start line. Click again to add vectors. Press Ctrl key while clicking, or double-click to add last vector and complete polyline.");
}

// Polygon action - sketch, select, etc.
function MapPolygon(divid, mode, showLoading) {
	mapSetTool(divid, mode, showLoading, mapVectorClick, null, "crosshair", 2, "visible", 
		"Polygon - Click to start line. Click again to add vectors. Press Ctrl key while clicking, or double-click to add last vector and complete polygon.");
}

// Circle action - sketch, select, etc.  - click/move/click
//function MapCircleClick(divid, mode, showLoading) {
function MapCircle(divid, mode, showLoading) {
	mapSetTool(divid, mode, showLoading, null, mapVectorClick, "crosshair", 3, "hidden", 
		"Circle - Click for center of circle. Move cursor to resize circle. Click again to complete circle.");
}
/*
// Circle action - sketch, select, etc.
function MapCircle(divid, mode, showLoading) {
	//mapSetTool(divid, mode, showLoading, mapVectorMouseDown, null, "crosshair", 3, "hidden", "Circle - Press mouse button and drag to create circle. Depress button to complete circle.");
	mapSetTool(divid, mode, showLoading, mapVectorMouseDown, null, "crosshair", 3, "hidden", "");
}
*/
// Circle action - sketch, select, etc. - mousedown/drag/mouseup
function MapDragCircle(divid, mode, showLoading) {
	//mapSetTool(divid, mode, showLoading, mapVectorMouseDown, null, "crosshair", 3, "hidden", "Circle - Press mouse button and drag to create circle. Depress button to complete circle.");
	mapSetTool(divid, mode, showLoading, mapVectorMouseDown, null, "crosshair", 3, "hidden", "");
}

// Oval action - sketch, select, etc. - click/move/click
function MapOval(divid, mode, showLoading) {
		mapSetTool(divid, mode, showLoading, null, mapVectorClick, "crosshair", 4, "hidden", 
			"Oval - Click for start of oval. Move cursor to resize oval. Click again to complete oval.");
}

// Oval action - sketch, select, etc. - mousedown/drag/mouseup
function MapDragOval(divid, mode, showLoading) {
	mapSetTool(divid, mode, showLoading, mapVectorMouseDown, null, "crosshair", 4, "hidden", "");
}

// Box vector action - sketch, select, etc. - click/move/click
function MapBox(divid, mode, showLoading) {
		mapSetTool(divid, mode, showLoading, null, mapVectorClick, "crosshair", 5, "hidden", "Box - Click for start of box. Move cursor to resize box. Click again to complete box.");
}

// Box vector action - sketch, select, etc. - mousedown/drag/mouseup
function MapDragBox(divid, mode, showLoading) {
		//mapSetTool(divid, mode, showLoading, null, mapVectorClick, "crosshair", 5, "hidden", "Box - Click for start of box. Move cursor to resize box. Click again to complete box.");
		mapSetTool(divid, mode, showLoading, mapVectorMouseDown,null, "crosshair", 5, "hidden", "");
}

function mapSetTool(divid, mode, showLoading, mouseDownFunction, clickFunction, cursor, vectormode, vectorToolbarState, statusMessage)
{
		if ((divid==null) || (divid=="")) divid = "Map1";
		areaDivName = "MapDiv_" + divid;
		lineDivName = "LineDiv_" + divid;
		
		// set up events for map div
		var areaDiv = document.getElementById(areaDivName);
		areaDiv.style.visibility = "visible";
		areaDiv.onclick = clickFunction;
		areaDiv.onmousedown = mouseDownFunction;
		areaDiv.style.cursor = cursor;
		
		//show/hide layers
		showLayer(areaDivName);
		if (vectormode > -1) //for vectors
		{
			showLayer(lineDivName);
			var lineDiv = document.getElementById(lineDivName);
			lineDiv.onclick = clickFunction;
			lineDiv.onmousedown = mouseDownFunction;
			lineDiv.style.cursor = cursor;
			areaDivObj[areaDivName] = areaDiv;
			lineDivObj[areaDivName] = lineDiv;
			vectorMode[areaDivName] = vectormode;
			vectorCount[areaDivName] = 0;
			//vector Toolbar
			var tb = document.getElementById(vectortoolbar);
			if (tb!=null) tb.style.visibility = vectorToolbarState;
			// turn on page mask
			hideLayer("PageMaskDiv_" + divid);
		}
		else
			hideLayer(lineDivName);
		
		//set up mode and show loading
		drawBox = false;
		dragImage = false;
		var m = divid + "_mode";
		document.forms[docFormID].elements[m].value = mode;
		if (showLoading == null) showLoading = true;
		loadingSettings[divid + mode] = showLoading;
		//status bar message
		window.status = statusMessage;
		var hyperDivName = "HyperlinkDiv_" + divid;
		hideLayer(hyperDivName);
		hideLayer("InfoPopUp");
		// turn off markup flag
		promptString = "";

}

///////////////////////////////////// Set Tool Functions /////////////////////////////////////

///////////////////////////////////// MouseDown/Click Functions /////////////////////////////////////

// Line action - pan - mouse down
function mapDragImageStart(e) {
	if (isLeftButton(e)) {
		drawBox = false;
		if (!dragImage) {
			dragImage = true;
			getXY(e);
			getMapDiv(e);
			x1=mouseX;
			y1=mouseY
			x2=x1+1;
			y2=y1+1;
			document.onmousemove = mapDragImageMove;
			document.onmouseup = mapDragImageUp;
		}
	}
	return false;
}

// Rectangular actions - zooms, select - mouse down
function mapDragRectangleStart(e) {
	if (isLeftButton(e)) {
		dragImage = false;
		if (!drawBox) {
			drawBox = true;
			getXY(e);
			getMapDiv(e);
			x1=mouseX;
			y1=mouseY;
			x2=x1+1;
			y2=y1+1;
			
			displayZoomBox(x1,y1,x2,y2, Maps[divIndex].DragBoxColor);					
			document.onmousemove = mapDragRectangleMove;
			document.onmouseup = mapDragRectangleUp;
		}
	}
	return false;
}
	
// Point actions - identify, CenterAt, ZoomToPoint, etc. - mouse down
function mapPointClick(e) {
	if (isLeftButton(e)) {
		getXY(e);
		getMapDiv(e);
		divObj.style.cursor = "wait";
		
		adjustMapCoords();
		
		var f = document.forms[docFormID];
		f.minx.value=zleft;
		f.miny.value=ztop;
		
		postBack(Maps[divIndex].controlname, 'point');
		//alert(divObj.id + "\n" + zleft + "," + ztop);
	}
	return false;
}

function mapVectorClick(e) {
	if (vectorCount[areaDivName]==0) {
		getXY(e);
		getMapDiv(e);
		areaDivObj[areaDivName].onmousemove = mapVectorMove;
		areaDivObj[areaDivName].ondblclick = mapVectorEnd;
		lineDivObj[areaDivName].onmousemove = mapVectorMove;
		lineDivObj[areaDivName].ondblclick = mapVectorEnd;
		controlType = "map";
	}
	var ctrl = (isNav) ? e.modifiers & Event.CONTROL_MASK : window.event.ctrlKey;
	getXY(e);

	pix[areaDivName].x2 = mouseX - eLeft;
	pix[areaDivName].y2 = mouseY - eTop;
	if (((pix[areaDivName].lastX==pix[areaDivName].x2) && (pix[areaDivName].lastY==pix[areaDivName].y2)) || (ctrl)) {
		//if this is a double click's second click or the control key was pressed with the click
		//  then send it on to finish up
		mapVectorEnd(e);
	} else {
		if (vectorCount[areaDivName]==0) {
			// starting vector
			pix[areaDivName].x1 = mouseX - eLeft;
			pix[areaDivName].y1 = mouseY - eTop;
			xycoord[areaDivName].x = new Array();
			xycoord[areaDivName].y = new Array();
			xycoord[areaDivName].x[0] = pix[areaDivName].x1;
			xycoord[areaDivName].y[0] = pix[areaDivName].y1;	
		
		} else {
			switch (vectorMode[areaDivName]) {
				case 0:
					// line
					vo[areaDivName].clearObjects();
					vo[areaDivName].line(pix[areaDivName].x1, pix[areaDivName].y1, pix[areaDivName].x2, pix[areaDivName].y2);
					vo[areaDivName].drawObjects();
					jumpToFinish = true;
					break;
				case 1:
					// polyline
					var n = xycoord[areaDivName].x.length;
					xycoord[areaDivName].x[n] = pix[areaDivName].x2;
					xycoord[areaDivName].y[n] = pix[areaDivName].y2;	
					vo[areaDivName].clearObjects();	
					vo[areaDivName].polyline(xycoord[areaDivName].x,xycoord[areaDivName].y);
					vo[areaDivName].drawObjects();
					break;
				case 2:
					// polygon
					var n = xycoord[areaDivName].x.length;
					xycoord[areaDivName].x[n] = pix[areaDivName].x2;
					xycoord[areaDivName].y[n] = pix[areaDivName].y2;	
					vo[areaDivName].clearObjects();	
					if (vectorCount[areaDivName]>2) vo[areaDivName].polygon(xycoord[areaDivName].x,xycoord[areaDivName].y)
						else vo[areaDivName].polyline(xycoord[areaDivName].x,xycoord[areaDivName].y);
					vo[areaDivName].drawObjects();
					break;
				case 3:
					// circle
					var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
					var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
					var dradius;
					if ((dwidth == 0) || (dheight == 0))  {
						dradius = (dwidth == 0) ? dheight : dwidth;
					} else {
						dradius = Math.sqrt((dwidth * dwidth) + (dheight * dheight));
					}
					vo[areaDivName].clearObjects();
					vo[areaDivName].circle(pix[areaDivName].x1, pix[areaDivName].y1, dradius, true);
					vo[areaDivName].drawObjects();
					jumpToFinish = true;
					break;
				case 4:
					// oval
					var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
					var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
					var dleft = (pix[areaDivName].x1 < pix[areaDivName].x2) ? pix[areaDivName].x1 : pix[areaDivName].x2;
					var dtop = (pix[areaDivName].y2 < pix[areaDivName].y1) ? pix[areaDivName].y2 : pix[areaDivName].y1;
					vo[areaDivName].clearObjects();
					vo[areaDivName].oval(dleft, dtop, dwidth, dheight);
					vo[areaDivName].drawObjects();
					jumpToFinish = true;
					break;
				case 5:
					// box
					var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
					var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
					var dleft = (pix[areaDivName].x1 < pix[areaDivName].x2) ? pix[areaDivName].x1 : pix[areaDivName].x2;
					var dtop = (pix[areaDivName].y2 < pix[areaDivName].y1) ? pix[areaDivName].y2 : pix[areaDivName].y1;
					vo[areaDivName].clearObjects();
					vo[areaDivName].box(dleft, dtop,(dleft + dwidth), (dtop + dheight));
					vo[areaDivName].drawObjects();
					jumpToFinish = true;
					break;
			}
		}
		vectorCount[areaDivName]++;
		pix[areaDivName].lastX = pix[areaDivName].x2;
		pix[areaDivName].lastY = pix[areaDivName].y2;
	
		if (jumpToFinish) mapVectorEnd(e);
	}
	return false;
}

function getMapDiv(e) {
	divLeft = 0;
	divTop = 0;
	divWidth = 0;
	divHeight = 0;
	for (var i=0;i<Maps.length;i++) {
		var dc = Maps[i];
		calcElementPosition("MapDiv_" + dc.controlname);
		if ((mouseX>=eLeft) && (mouseX<=(eLeft+eWidth)) && (mouseY>=eTop) && (mouseY<=(eTop+eHeight)))  {
			divIndex = i;
			divLeft = eLeft;
			divTop = eTop;
			divWidth = eWidth;
			divHeight = eHeight;
			divParentIndex = 0;
			divParentLeft = 0;
			divParentTop = 0;
			divId = "MapDiv_" + dc.controlname;
			divControl = dc.controlname;
			lineWidth = dc.DragBoxWidth;
			divObj = document.getElementById("MapDiv_" + dc.controlname);
			areaDivName = "MapDiv_" + dc.controlname;
			lineDivName = "LineDiv_" + dc.controlname;

			break;
		}
	}

}

///////////////////////////////////// MouseDown/Click Functions /////////////////////////////////////

///////////////////////////////////// MouseMove Functions /////////////////////////////////////
// Line action - pan - mouse move
function mapDragImageMove(e) {
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
			moveLayer(divId, xMove, yMove);
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
			moveLayer(divId,(xMove + divParentLeft),(yMove + divParentTop));
			panClipLayer(divId,cLeft,cTop,cRight,cBottom);
		
		}
	}
	return false;
}

// Rectangular actions - zooms, select - mouse move
function mapDragRectangleMove(e) {
	if (drawBox) {
		getXY(e);
		// stretch ZoomBox
		x2=mouseX;
		y2=mouseY;
		// dataframe adjustments
		if (x2 < divLeft) x2 = divLeft;
		if (x2 > divWidth + divLeft ) x2 = divWidth + divLeft ;
		if (y2 < divTop ) y2 = divTop;
		if (y2 > divHeight + divTop) y2 = divHeight +  divTop; 
		//setClip(lineWidth);
		setClip(Maps[divIndex].DragLineWidth);
	
	}
	return false

}
	
//Vector actions - line, polyline, circle, oval etc.
function mapVectorMove(e) {
	getXY(e);
	adjustMapCoords();
	pix[areaDivName].x2 = mouseX - eLeft;
	pix[areaDivName].y2 = mouseY - eTop;
	switch (vectorMode[areaDivName]) {
		case 0:
			vo[areaDivName].clearObjects();
			vo[areaDivName].line(pix[areaDivName].x1, pix[areaDivName].y1, pix[areaDivName].x2, pix[areaDivName].y2);
			vo[areaDivName].drawObjects();
			break;
		case 1:
			var n = xycoord[areaDivName].x.length - 1;
			vo[areaDivName].clearObjects();	
			if (vectorCount[areaDivName]>1) {
				vo[areaDivName].polyline(xycoord[areaDivName].x,xycoord[areaDivName].y);
				vo[areaDivName].line(pix[areaDivName].x2, pix[areaDivName].y2, xycoord[areaDivName].x[n], xycoord[areaDivName].y[n]);
			} else if (vectorCount[areaDivName]>0){
				vo[areaDivName].line(pix[areaDivName].x1, pix[areaDivName].y1, pix[areaDivName].x2, pix[areaDivName].y2);
			}
			vo[areaDivName].drawObjects();
			break;
		case 2:
			var n = vectorCount[areaDivName];
			if (vectorCount[areaDivName]>0) {
				if (vectorCount[areaDivName]==1) {
				vo[areaDivName].clearObjects();
					vo[areaDivName].line(xycoord[areaDivName].x[0],xycoord[areaDivName].y[0],pix[areaDivName].x2,pix[areaDivName].y2);
					vo[areaDivName].drawObjects();
				} else if (vectorCount[areaDivName]>0){
					var tempx = xycoord[areaDivName].x;
					var tempy = xycoord[areaDivName].y;
					tempx[n] = pix[areaDivName].x2;
					tempy[n] = pix[areaDivName].y2;
					vo[areaDivName].clearObjects();
					vo[areaDivName].polygon(tempx, tempy);
					vo[areaDivName].drawObjects();
				}
			}
			vo[areaDivName].drawObjects();
			break;
		case 3:
			var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
			var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
			var dradius;
			if ((dwidth == 0) || (dheight == 0))  {
				dradius = (dwidth == 0) ? dheight : dwidth;
			} else {
				dradius = Math.sqrt((dwidth * dwidth) + (dheight * dheight));
			}
			
			vo[areaDivName].clearObjects();
			vo[areaDivName].circle(pix[areaDivName].x1, pix[areaDivName].y1, dradius, true);
			vo[areaDivName].drawObjects();
			break;
		case 4:
			var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
			var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
			var dleft = (pix[areaDivName].x1 < pix[areaDivName].x2) ? pix[areaDivName].x1 : pix[areaDivName].x2;
			var dtop = (pix[areaDivName].y1 < pix[areaDivName].y2) ? pix[areaDivName].y1 : pix[areaDivName].y2;
			vo[areaDivName].clearObjects();
			vo[areaDivName].oval(dleft, dtop, dwidth, dheight);
			vo[areaDivName].drawObjects();
			break;
		case 5:
			// box
			var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
			var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
			var dleft = (pix[areaDivName].x1 < pix[areaDivName].x2) ? pix[areaDivName].x1 : pix[areaDivName].x2;
			var dtop = (pix[areaDivName].y2 < pix[areaDivName].y1) ? pix[areaDivName].y2 : pix[areaDivName].y1;
			vo[areaDivName].clearObjects();
			vo[areaDivName].box(dleft, dtop,(dleft + dwidth), (dtop + dheight));
			vo[areaDivName].drawObjects();
			break;
	}
	return false;
}
///////////////////////////////////// MouseMove Functions /////////////////////////////////////

///////////////////////////////////// MouseUp Functions /////////////////////////////////////

// Line action - pan - mouse up
function mapDragImageUp(e) {
	if (dragImage) {
		dragImage = false;
		divObj.style.cursor = "wait";
		getXY(e);

		document.onmousemove = null;
		document.onmouseup = null;

		var ixOffset = x2-x1;
		var iyOffset = y2-y1;
		var centerx;
		var centery; 
		var newX;
		var newY;
		var dfBlurb = "";
		centerx = Math.round(divWidth/2);
		centery = Math.round(divHeight/2);
		newX = centerx - ixOffset;
		newY = centery - iyOffset;
		
		var f = document.forms[docFormID];

		f.minx.value=newX;
		f.miny.value=newY;

		/*
		//alert(divObj.id + "\nXoffset: " + ixOffset + " ... Yoffset: " + iyOffset + "\nCenter at: " + newX + "," + newY);
		hideLayer(divObj.id);
		moveLayer(divObj.id, 0, 0);
		panClipLayer(divObj.id,0,0,divWidth,divHeight);
		replaceLayerContent(divObj.id, "")
		//*/
		/*var reloadTimer;
		window.clearTimeout(reloadTimer);
		reloadTimer = window.setTimeout("postBack(Maps[divIndex].controlname, 'dragimage');",1000);
		*/
		postBack(Maps[divIndex].controlname, 'dragimage');
		
	}
	return false;

}

// Rectangular actions - zooms, select - mouse up
function mapDragRectangleUp(e) {
	if (drawBox) {
		drawBox = false;
		
		divObj.style.cursor = "wait";
		
		getXY(e);

		document.onmousemove = null;
		document.onmouseup = null;
		hideZoomBox();
		setClip(Maps[divIndex].DragLineWidth);
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
		
    	//postBack(Maps[divIndex].controlname, 'dragrectangle');
		//alert(divObj.id + "\n" + zleft + "," + ztop + " x " + zright + "," + zbottom);
		//* Added for Markup and other extensions
		// assumes PostBackMode form element added for this
		var mode = f.elements[Maps[divIndex].controlname+"_mode"].value;
		var cancel = checkPrompt(mode);
		if (!cancel) {
			if (checkForFormElement(docFormID, "PostBackMode")) f.PostBackMode.value = mode;
    		postBack(Maps[divIndex].controlname, 'dragrectangle');
		}  else {
			divObj.style.cursor = savedCursor;
		}
		//*/
		return false;
	}
}

// for double click and finishing up
function mapVectorEnd(e) {
	divObj.style.cursor = "wait";
	var restart = false;
	var clientaction = "line";
	switch (vectorMode[areaDivName]) {
		case 0:
			coordString = pix[areaDivName].x1 + ":" + pix[areaDivName].y1 + "|" + pix[areaDivName].x2 + ":" + pix[areaDivName].y2;
			restart = true;
			break;
		case 1:
			var blurb = "PolyLine:\n";
			coordString ="";
			for (var i=0;i<xycoord[areaDivName].x.length;i++) {
				blurb += "[" + (i+1) + "] " + xycoord[areaDivName].x[i]+ ", "  + xycoord[areaDivName].y[i] + "\n";
				if (i > 0) coordString += "|";
				coordString += xycoord[areaDivName].x[i] + ":" + xycoord[areaDivName].y[i];
			}
			restart = true;
			clientaction = "polyline";
			break;
		case 2:
			var n = xycoord[areaDivName].x.length - 1;
			var m = n - 1;
			if ((xycoord[areaDivName].x[m]==xycoord[areaDivName].x[n]) && (xycoord[areaDivName].y[m]==xycoord[areaDivName].y[n])) {
				xycoord[areaDivName].x.length = n;
				xycoord[areaDivName].y.length = n;
			}
				
			if (vectorCount[areaDivName]>2) {
				var blurb = "Polygon:\n";
				coordString ="";
				for (var i=0;i<xycoord[areaDivName].x.length;i++) {
					blurb += "[" + (i+1) + "] " + xycoord[areaDivName].x[i] + ", "  + xycoord[areaDivName].y[i] + "\n";
					if (i > 0) coordString += "|";
					coordString += xycoord[areaDivName].x[i] + ":" + xycoord[areaDivName].y[i];
				}
				coordString += "|" + xycoord[areaDivName].x[0] + ":" + xycoord[areaDivName].y[0];
				restart = true;
				clientaction = "polygon";
			} else {
				alert("A Polygon needs at least three vectors.");
			}
			
			break;
		case 3:
			var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
			var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
			var dradius;
			if ((dwidth == 0) || (dheight == 0))  {
				dradius = (dwidth == 0) ? dheight : dwidth;
			} else {
				dradius = Math.sqrt((dwidth * dwidth) + (dheight * dheight));
			}
			coordString = pix[areaDivName].x1 + ":" + pix[areaDivName].y1 + ":" + dradius;
			restart = true;
			clientaction = "circle";
			break;
		case 4:
			var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
			var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
			var dleft = (pix[areaDivName].x1 < pix[areaDivName].x2) ? pix[areaDivName].x1 : pix[areaDivName].x2;
			var dtop = (pix[areaDivName].y1 < pix[areaDivName].y2) ? pix[areaDivName].y1 : pix[areaDivName].y2;
			var centerX = dleft + (dwidth / 2);
			var centerY = dtop + (dheight / 2);
			coordString = centerX+ ":" + centerY + ":" + dwidth + ":" + dheight;
			restart = true;
			clientaction = "oval";
			break;
		case 5:

			// box
			var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
			var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
			var dleft = (pix[areaDivName].x1 < pix[areaDivName].x2) ? pix[areaDivName].x1 : pix[areaDivName].x2;
			var dtop = (pix[areaDivName].y2 < pix[areaDivName].y1) ? pix[areaDivName].y2 : pix[areaDivName].y1;
			coordString = dleft + ":" + dtop + "|" + (dleft + dwidth) + ":" + (dtop + dheight);
			restart = true;
			clientaction = "rectangle";			
			break;
	}
	if (restart) {
		vectorCount[areaDivName] = 0;
		xycoord[areaDivName].x = new Array();
		xycoord[areaDivName].y = new Array();

		areaDivObj[areaDivName].onmousemove = null;
		areaDivObj[areaDivName].ondblclick = null;
		lineDivObj[areaDivName].onmousemove = null;
		lineDivObj[areaDivName].ondblclick = null;
		
		pix[areaDivName].lastX = -9999;
		pix[areaDivName].lastY = -9999;
		
		document.forms[docFormID].coords.value = coordString;
		if (checkForFormElement(docFormID, "PostBackMode")) document.forms[docFormID].PostBackMode.value = document.forms[docFormID].elements[Maps[divIndex].controlname+"_mode"].value;
		postBack( pix[areaDivName].controlname, clientaction);
		//alert(divObj.id + "\n" + clientaction + ": " + coordString);
	}
	jumpToFinish = false;
	return false;

}


//Vector actions - for mousedown, drag, mouseup.... circle, oval, and rectangle
function mapVectorMouseDown(e) {
	getXY(e);
	getMapDiv(e);
	areaDivObj[areaDivName].onclick = null;
	areaDivObj[areaDivName].ondblclick = null;
	areaDivObj[areaDivName].onmousemove = mapVectorMove;
	areaDivObj[areaDivName].onmouseup = mapVectorMouseUp;
	lineDivObj[areaDivName].onclick = null;
	lineDivObj[areaDivName].ondblclick = null;
	lineDivObj[areaDivName].onmousemove = mapVectorMove;
	lineDivObj[areaDivName].onmouseup = mapVectorMouseUp;
	document.onmousemove = mapVectorMove;
	document.onmouseup = mapVectorMouseUp;

	controlType = "map";
	
	pix[areaDivName].x1 = mouseX - eLeft;
	pix[areaDivName].y1 = mouseY - eTop;

	vectorCount[areaDivName] = 1;
	pix[areaDivName].lastX = pix[areaDivName].x1;
	pix[areaDivName].lastY = pix[areaDivName].y1;
	
	return false;
}

function mapVectorMouseUp(e) {
	divObj.style.cursor = "wait";
	var restart = false;
	var clientaction = "line";
	switch (vectorMode[areaDivName]) {
		case 3:
			var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
			var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
			var dradius;
			if ((dwidth == 0) || (dheight == 0))  {
				dradius = (dwidth == 0) ? dheight : dwidth;
			} else {
				dradius = Math.sqrt((dwidth * dwidth) + (dheight * dheight));
			}
			coordString = pix[areaDivName].x1 + ":" + pix[areaDivName].y1 + ":" + dradius;
			restart = true;
			clientaction = "circle";
			break;
		case 5:

			// box
			var dwidth = Math.abs(pix[areaDivName].x2 - pix[areaDivName].x1);
			var dheight = Math.abs(pix[areaDivName].y2 - pix[areaDivName].y1);
			var dleft = (pix[areaDivName].x1 < pix[areaDivName].x2) ? pix[areaDivName].x1 : pix[areaDivName].x2;
			var dtop = (pix[areaDivName].y2 < pix[areaDivName].y1) ? pix[areaDivName].y2 : pix[areaDivName].y1;
			coordString = dleft + ":" + dtop + "|" + (dleft + dwidth) + ":" + (dtop + dheight);
			restart = true;
			clientaction = "rectangle";			
			break;
			
	}
	vectorCount[areaDivName] = 0;
	xycoord[areaDivName].x = new Array();
	xycoord[areaDivName].y = new Array();

	areaDivObj[areaDivName].onmousemove = null;
	areaDivObj[areaDivName].ondblclick = null;
	lineDivObj[areaDivName].onmousemove = null;
	lineDivObj[areaDivName].ondblclick = null;
	document.onmousemove = null;
	document.onmouseup = null;
	
	pix[areaDivName].lastX = -9999;
	pix[areaDivName].lastY = -9999;
	
	var m = pix[areaDivName].controlname + "_mode";
	if (checkForFormElement(docFormID, "PostBackMode")) document.forms[docFormID].PostBackMode.value = document.forms[docFormID].elements[m].value;
	document.forms[docFormID].coords.value = coordString;
	//postBack( pix[areaDivName].controlname, clientaction);
	postBack( pix[areaDivName].controlname, document.forms[docFormID].elements[m].value);
	//alert(divObj.id + "\n" + clientaction + ": " + coordString);
	
	return false;

}


///////////////////////////////////// MouseUp Functions /////////////////////////////////////
