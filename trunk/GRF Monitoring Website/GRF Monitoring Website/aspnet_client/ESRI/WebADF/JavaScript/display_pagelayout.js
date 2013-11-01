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

20050921

email: contracts@esri.com
*/

var dataframeIndex = 0;
var dataframe = null;

var Pages = [];
var PageNames = [];

Type.registerNamespace('ESRI.ADF.UI');

ESRI.ADF.UI.Page = function(element) {
	ESRI.ADF.UI.Page.initializeBase(this,[element]);
	this.index = 0;
	this.left = 0;
	this.top = 0;
	this.divId = "PageDiv_" + this.get_id();
	this.imageId = "PageImage_" + this.get_id();
	this.maskId = "PageMaskDiv_" + this.get_id();
	
	// action flags
	this.drawBox = false;
	this.dragImage = false;
	this.showLoading = true;
	
	this.actionType = "MapDragRectangle";
	this.clientAction = "MapDragRectangle";
	this.mode = "MapZoomIn";
	this.pageMode = true;
	
	this.moveFunction = null;
		
	// associated objects
	this.imageObject = null;
	this.maskObject = null;
	this.loadingObject = null;
	this._dragBoxColor = "Black";
	this._dragLineWidth = 3;
	this.imgUrl = "";
	this.cursor = "default";
	
	this._dataframes = [];
	this.dataframeIndex = 0;
	this._imageUrl=null;
	this._blankImage=null;
	this._cellName=null;
	this._toolTip=null;
}
ESRI.ADF.UI.Page.prototype = {
	initialize : function() {
		ESRI.ADF.UI.Page.callBaseMethod(this, 'initialize');
		this._createDivs();
		this._dragbox = new ESRI.ADF.UI.DragBoxObject(35,null,this.get_id()+'_dragbox');
		this._dragbox.createDivs();
	},
	// actions
	_createDivs : function() {
		var d = this.divId;
		var imgWidth = this._width;
		var imgHeight = this._height;
		var id = this.get_id();
		// Create the client code
		var s = "";
		// The overall container... position is relative... in flow
	
		if ((this._cellName==null) || (this._cellName=="")) {
			 s += '<table cellspacing=0 cellpadding=0 ><tr><td id="MapCell_' + this.get_id() + '">';
		}
		s += '<div id="PageControlDiv_' + id + '" style="position: relative; width: ' + this._width + 'px; height: ' + this._height + 'px; overflow:hidden;">';
		// Page div, holds Page image ... position is absolute within container
		s += '<div id="' + d + '" style="position: absolute; left: 0px; top: 0px; background-color: White; width: ' + imgWidth + 'px; height: ' + imgHeight + 'px; overflow:hidden;">';
		// Page image... 
		s += '<img id="' + this.imageId + '" alt="' + this._toolTip + '"  title="' + this._toolTip + '" src="' + this._imageUrl + '" width="' + imgWidth + '" height="' + imgHeight + '" hspace="0" vspace="0" border="0" />';
		s += '</div>';
		// Page mask... 
		s += '<div id="' + this.maskId + '" style="position: absolute; left: 0px; top: 0px; background-color: Transparent; width: ' + imgWidth + 'px; height: ' + imgHeight + 'px; display: '+(this.pageMode?'none':'')+'; overflow:hidden;">';
		
		// map divs for each layer
		for (var j=0;j<this._dataframes.length;j++) {
			var df = this._dataframes[j];
			df.divId = "MapDiv_" + this.get_id() + "_" + j;
			df.imageId = "MapImage_" + this.get_id() + "_" + j;
			df.maskId = "MapMask_" + this.get_id() + "_" + j;
			// Map mask... 
			s += '<div id="' + df.divId + '" style="padding:0;margin:0;position: absolute; left: '+(df.left-1)+'px; top: '+(df.top-1)+'px; background-color: White; width: ' + (df.width+2) + 'px; height: ' + (df.height+2) + 'px; overflow:hidden;">';
			// Map image... 
			s += '<div id="' + df.maskId + '" style="padding:0;margin:0;width:' + (df.width+2) + 'px; height:' + (df.height+2) + 'px; position: absolute; left:0; top:0px; overflow: hidden;" >';
			s += '<img id="' + df.imageId + '" alt="" src="' + this._imageUrl + '" width="' + imgWidth + '" height="' + imgHeight + '" hspace="0" vspace="0" border="0" style="position: absolute; left:'+(-df.left+1)+'px; top:'+(-df.top+1)+'px;" />';
			s += '</div>';
			s += '</div>';
		}
		s += '</div>\n</div>';
		if ((this._cellName===null) || (this._cellName==="")) {
			s += '</td></tr></table>';
			document.writeln(s);
		} else {
			var obj = $get(this._cellName);	
			obj.innerHTML = s;
		}
		this.setObjects();	
		this._setTool();	
	},
	setObjects : function() {
		this.divObject = $get(this.divId);
		this.imageObject = $get(this.imageId);
		this.maskObject = $get(this.maskId);
		if (this._dataframes!=null) {
			for (var j=0;j<this._dataframes.length;j++) {
				var df = this._dataframes[j];				
				df.divObject = $get(df.divId);
				df.imageObject = $get(df.imageId);
				df.maskObject = $get(df.maskId);
			}
		}
		//this.index = pageCount;
		//PageNames[pageCount] = this.get_id();
		//pageCount++;
	},
	_hideLayer : function(obj) {
		obj.style.display = 'none';
	},
	_showLayer : function(obj) {
		obj.style.display = '';
	},
	_moveLayer : function(element, x, y) {		
  		if (element!=null) {	
   			element.style.left = x + "px";
			element.style.top  = y + "px";
		}
	},
	setTool : function(mode, isPageTool, showLoading, clientAction, cursor, statusMessage) {
		this.pageMode = isPageTool;
		this.mode = mode;
		this.actionType = clientAction;
		this.cursor = cursor;
		this._setTool();
	},
	_setTool : function() {
		this.divObject.onclick = null;
		var df;
		if (this.pageMode) { // page tool
			
			// turn off page mask			
			this._hideLayer(this.maskObject);
			this.divObject.style.cursor = this.cursor;
			this.divObject.onmousedown = PageMouseDown; //this._pageMouseDownHandler; 
			
		} else { // dataframe tool
			// turn on page mask
			this._showLayer(this.maskObject);
			this.divObject.onmousedown = null;
			this.divObject.onmousemove = null;
			this.divObject.onmouseup = null;
			
			// turn on dataframe divs
			for (var i=0;i<this._dataframes.length;i++) {
				df = this._dataframes[i];
				df.divObject.style.cursor = this.cursor;
				df.cursor = this.cursor;
				df.divObject.onmousedown = PageMapMouseDown; //this._mapMouseDownHandler;
			}
		}

		this.drawBox = false;
		this.dragImage = false;
		var m = this.get_id() + "_mode";		
	},
	resetDisplay : function() {
		this.divObject.style.cursor = this.cursor;
		if (this.actionType=="PageDragImage") this.resetPageDrag();
		for (var i=0;i<this._dataframes.length;i++) {
			var df = this._dataframes[i];
			df.divObject.style.cursor = df.cursor;
			if ((this.actionType=="PageMapDragImage") && (dataframeIndex==i)) this.resetMapDrag(i);
		}
	},
	resetPageDrag : function() {
		this._moveLayer(this.divObject,0,0);
		this._panClipLayer(this.divObject, 0, 0, this.width, this.height);
	},
	resetMapDrag : function(index) {
		if (index==null) index = 0;
		var df = this._dataframes[index]
		this._moveLayer(df.divObject,0,0);
		this._panClipLayer(df.divObject, df.left, df.top, df.left+df.width, df.top+df.height);
	},
	hide : function() {
		this._hideLayer($get("PageControlDiv_" + this.get_id()));
		this._hideLayer(this.maskId);
		this._hideLayer(this.divId);
		for (var i=0;i<this._dataframes.length;i++) {
			df = this._dataframes[i];
			this._hideLayer(df.divObject);
			this._hideLayer(df.maskObject);
		}		
	},
	show : function() {
		this._showLayer($get("PageControlDiv_" + this.get_id()));
		if (this.pageMode) {
			this._hideLayer(this.divId);
			this._showLayer(this.maskObject);
			for (var i=0;i<this._dataframes.length;i++) {
				df = this._dataframes[i];
				this._hideLayer(df.divObject);
				this._hideLayer(df.maskObject);
			}
		} else {
			this._showLayer(this.divObject);
			this._showLayer(this.maskObject);
			// turn on dataframe divs
			for (var i=0;i<this._dataframes.length;i++) {
				df = this._dataframes[i];
				this._showLayer(df.divObject);
				this._showLayer(df.maskObject);
			}
		}
	},
	doCallback : function(argument, context) {
		/// <summary>
		/// Performs a callback or partial postback depending on it's postback mode
		/// </summary>
		/// <param name="argument" type="String">The argument parsed back to the server control</param>
		/// <param name="context" type="string">The context of this callback</param>
		ESRI.ADF.System._doCallback(this._callbackFunctionString, this.get_uniqueID(), this.get_id(), argument, context);
	},
	processCallbackResult : function(action, params) {
		/// <summary>
		/// Process callback results to update the overview map image and AOI rectangle
		/// </summary>
        if (action=="refresh") {
			this._createDivs();
        }
	},
	get_uniqueID : function () {
		/// <value type="String" mayBeNull="false">
		/// The unique ID value of this control.
		/// </value>
		return this._uniqueID;
    },
    set_uniqueID : function(value) { this._uniqueID = value; },	
    get_callbackFunctionString : function () {
		/// <value type="String" mayBeNull="false">
		/// The callback string used to create a server callback.
		/// </value>
		return this._callbackFunctionString;
	},
	set_callbackFunctionString : function(value) {
		this._callbackFunctionString = value;
	},
	get_dragBoxColor : function() { return this._dragBoxColor; },
	set_dragBoxColor : function(value) { this._dragBoxColor = value; },
	get_dragLineWidth : function() { return this._dragLineWidth; },
	set_dragLineWidth : function(value) { this._dragLineWidth = value; },
	get_width : function() { return this._width; },
	set_width : function(value) { this._width = value; },
	get_height : function() { return this._height; },
	set_height : function(value) { this._height = value; },
	get_imageUrl : function() { return this._imageUrl; },
	set_imageUrl : function(value) { this._imageUrl = value; },
	get_blankImage : function() { return this._blankImage; },
	set_blankImage : function(value) { this._blankImage = value; },
	get_cellName : function() { return this._cellName; },
	set_cellName : function(value) { this._cellName = value; },
	get_toolTip : function() { return this._toolTip; },
	set_toolTip : function(value) { this._toolTip = value; },
	get_dataframes : function() { return this._dataframes; },
	set_dataframes : function(value) { this._dataframes = value; }
}
ESRI.ADF.UI.Page.registerClass('ESRI.ADF.UI.Page',Sys.UI.Control); //ControlObject

DataFrameObject = ESRI.ADF.UI.DataFrame = function(controlName, index, left, top, width, height, dragBoxColor, dragLineWidth, toolTip) { 
	ESRI.ADF.UI.DataFrame.initializeBase(this,[controlName, left, top, width, height]);
	this.index = index;
	this.controlName = controlName;
	this.divId = "MapDiv_" + controlName + "_" + index;
	this.imageId = "MapImage_" + controlName + "_" + index;
	this.maskId = "MapMaskDiv_" + controlName + "_" + index;
	this.maskDivId = "MapMaskImage_" + controlName + "_" + index;
	this.parentId = controlName;
	this.dragBoxColor = "Black";
	if (dragBoxColor!=null) this.dragBoxColor = dragBoxColor;
	this.dragLineWidth = 3;
	if (dragLineWidth!=null) this.dragLineWidth = dragLineWidth;
	this.imgUrl = "";
	this.cursor = "default";
	this.dataframeIndex = index;
	
	this.toolTip = "";
	if (toolTip!=null) this.toolTip = toolTip;
	
	this.moveFunction = null;
	
	// associated objects
	this.imageObject = null;
	this.maskObject = null;
	
	// actions
}
ESRI.ADF.UI.DataFrame.registerClass('ESRI.ADF.UI.DataFrame',PageElementObject);

DragBoxObject = ESRI.ADF.UI.DragBoxObject = function(opacity,parent,id) {
	ESRI.ADF.UI.DragBoxObject.initializeBase(this,[id, 0, 0, 0, 0]);
	this.opacity = opacity;
	if (opacity==null) this.opacity = 100;
	this._parent = parent;
	this.imageObject = null;
	this.divId = this._id;
}
ESRI.ADF.UI.DragBoxObject.prototype = {
	createDivs : function() {
		//content = '<img name="' + this.imageId + '" src=' + this.imageUrl + ' width=1 height=1>';
		var content = '<div id="'+this._id+'" style="position: absolute; border-color:Black;border-width:3px;border-style:Solid;display:none;';
		var zbo = this.opacity / 100;
		var platform = navigator.platform;
		if ((platform=="Win32") || ((platform=="MacPPC") && (!isIE))) {
			if (navigator.userAgent.indexOf("Opera")==-1) {
				content += 'background-color: White; opacity: ' + zbo + '; -moz-opacity: ' + zbo + '; filter: alpha(opacity=' + this.opacity + ');';
			}
		}
		content += 'z-index: 999991;"></div>';
		var div = document.createElement('div');
		div.innerHTML = content;
		this.document.body.appendChild(div);
		this.divObject = $get(this._id);
	},
	// clip zoom box layer to mouse coords
	clip : function(inSize) {
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
			this.update(zleft,ztop,zright,zbottom,null,inSize)
		}
		return false;
	},	
	hide : function() {
		window.scrollTo(0,0);
		this.divObject.style.display='none';
	},
	show : function() {
		this.divObject.style.display='';
	},		
	update : function(left,top,right,bottom,color,size) {
		if (this.divObject!=null) {
			var style = this.divObject.style;
			this.divObject.innerHTML = '';
			if (size==null) {
				//if (divId.substring(0,4)=="Page") {
				if (page!=null) { size = page.dragLineWidth; }
			}
			var w = right - left;
			var h = bottom - top;
			    w-=size;
			    h-=size;
			w = w- (x2>x1?2*size-2:-size);
			h = h- (y2>y1?2*size-2:-size);
			if (w<0) w = 0;
			if (h<0) h = 0;
			if(Sys.Browser.agent!==Sys.Browser.InternetExplorer) { left++; top++; }
			style.left = left+(x2<x1?-2:0) + "px";
			style.top = top+(y2<y1?-2:0) + "px";
		
			style.width = w + "px";
			style.height = h + "px";
			if (color!=null) { style.borderColor = color; }
			style.borderWidth = size + "px";
			style.fontSize = '1pt';
			style.padding = '0';
			style.cursor = "crosshair";
		}
	}
}
ESRI.ADF.UI.DragBoxObject.registerClass('ESRI.ADF.UI.DragBoxObject',PageElementObject);



function getSelectedPageObject(e) {
	var p = null;
	var d = (isNav && e !=null) ? e.target : window.event.srcElement;
	var control = "PageLayout1";
	if ((d!=null) && (d.tagName!=null)) {
		if (d.tagName.indexOf("DIV")==-1) d = d.offsetParent;
		// add additional div checks if necessary
		control = d.id.substring(8);
		if (Pages[control]==null) p = lastpage;
			else p = Pages[control];
		var box = calcElementPosition(p.divId);
		p.pageLeft = box.left;
		p.pageTop = box.top;
		p.width = box.width;
		p.height = box.height;
		divObj = document.getElementById(p.divId);
		lastpage = p;
		box=null;
	}
	return p;
}

function getSelectedDataframeObject(e) {
	var p = null;
	var d = (isNav && e !=null) ? e.target : window.event.srcElement;
	var control = "PageLayout1";
	if ((d!=null) && (d.tagName!=null)) {
		if (d.tagName.indexOf("DIV")==-1) d = d.offsetParent;
		var startpos = d.id.indexOf("_");
		if (startpos!=-1) {
			startpos++;
			var endpos = d.id.lastIndexOf("_");
			control = d.id.substring(startpos, endpos);
			p = Pages[control];
			dataframeIndex = parseInt(d.id.substring(endpos+1));
			var df = p._dataframes[dataframeIndex];
			var box = calcElementPosition(df.divId);
			df.pageLeft = box.left;
			df.pageTop = box.top;
			box=null;
		}
	}
	return p;
}

function getPageObjectByXY(x,y) {
	var pp = null;
	for (var i=0;i<PageNames.length;i++) {
		var p = Pages[PageNames[i]];
		var box = calcElementPosition(p.divId);
		var right = box.left + box.width;
		var bottom = box.top + box.height;
		if ((x>=box.left) && (x<=right) && (y>=box.top) && (y<=bottom)) {
			pp = p;
			break;
		}
		box=null;
	}
	return pp;
}

///////////////////////////////////// Set Tool Functions /////////////////////////////////////
Type.registerNamespace('ESRI.ADF.PageTools');

PageDragImage = ESRI.ADF.PageTools.PageDragImage = function(divid, mode, showLoading, cursor) {
	var thisCursor = "move";
	if ((cursor!=null) && (cursor!="")) thisCursor = cursor;
	page = $find(divid);
	if (page!=null) {
		page.setTool(mode, true, showLoading, "PageDragImage", thisCursor);
	}
}

PageDragRectangle = ESRI.ADF.PageTools.PageDragRectangle = function(divid, mode, showLoading, cursor) {
	var thisCursor = "crosshair";
	if ((cursor!=null) && (cursor!="")) thisCursor = cursor;
	page = Pages[divid];
	if (page!=null) {
		page.setTool(mode, true, showLoading, "PageDragRectangle", thisCursor);
	}
}

PagePoint = ESRI.ADF.PageTools.PagePoint = function(divid, mode, showLoading, cursor) {
	var thisCursor = "pointer";
	if ((cursor!=null) && (cursor!="")) thisCursor = cursor;
	page = $find(divid);
	if (page!=null) {
		page.setTool(mode, true, showLoading, "PagePoint", thisCursor);
	}
}


PageMapDragImage = ESRI.ADF.PageTools.PageMapDragImage = function(divid, mode, showLoading, cursor) {
	var thisCursor = "move";
	if ((cursor!=null) && (cursor!="")) thisCursor = cursor;
	page = $find(divid);
	if (page!=null) {
		page.setTool(mode, false, showLoading, "PageMapDragImage", thisCursor);
	}
}

PageMapDragRectangle = ESRI.ADF.PageTools.PageMapDragRectangle = function(divid, mode, showLoading, cursor) {
	var thisCursor = "crosshair";
	if ((cursor!=null) && (cursor!="")) thisCursor = cursor;
	page = $find(divid);
	if (page!=null) {
		page.setTool(mode, false, showLoading, "PageMapDragRectangle", thisCursor);
	}
}

PageMapPoint = ESRI.ADF.PageTools.PageMapPoint = function(divid, mode, showLoading, cursor) {
	var thisCursor = "pointer";
	if ((cursor!=null) && (cursor!="")) thisCursor = cursor;
	page = $find(divid);
	if (page!=null) {
		page.setTool(mode, false, showLoading, "PageMapPoint", thisCursor);
	}
}



///////////////////////////////////// Set Tool Functions /////////////////////////////////////


////////////////////////////////////// Event Handlers ///////////////////////////////////////

function PageMouseDown(e) {
	// mouse down event handler for page tools
	page = getSelectedPageObject(e);
	var obj = ESRI.ADF.System.__getAbsoluteMousePosition(e);
	switch (page.actionType) {
		case "PageDragImage":
			if (isLeftButton(e)) {
				page.drawBox = false;
				if (!page.dragImage) {
					page.dragImage = true;
					x1=obj.mouseX;
					y1=obj.mouseY;
					x2=x1+1;
					y2=y1+1;
					
					//$addHandler(window,'mouseup',PageMouseUp);
					//$addHandler(page.divObject,'onmousemove',PageMouseMove);
					page.divObject.onmouseup = PageMouseUp;
					page.divObject.onmousemove = PageMouseMove;
				}
			}
			break;
		case "PageDragRectangle":
			if (isLeftButton(e)) {
				page.dragImage = false;
				if (!page.drawBox) {
					page.drawBox = true;
					x1=obj.mouseX;
					y1=obj.mouseY;
					x2=x1+1;
					y2=y1+1;
					
					if (page._dragbox!=null) {
						page._dragbox.update(x1,y1,x2,y2,page._dragBoxColor, 0);
						page._dragbox.show();
					}
					//$addHandler(page.divObject,'mouseup',PageMouseUp);
					//$addHandler(page.divObject,'onmousemove',PageMouseMove);
					//page.divObject.onmouseup = PageMouseUp;
					$addHandler(document.body,'mouseup',PageMouseUp);
					page.divObject.onmousemove = PageMouseMove;
				}
			}
			break;
		case "PagePoint":
			if (isLeftButton(e)) {
				page.dragImage = false;
				page.drawBox = false;
				page.xMin = obj.mouseX - page.pageLeft;
				page.yMin = obj.mouseY - page.pageTop;
				page.doCallback('EventArg=point&dataframeIndex='+page.dataframeIndex+'&xmin='+page.xMin+'&ymin='+page.yMin+'&xmax=0&ymax=0&'+page.get_id()+'_mode='+page.mode,page);
				//postBack(page.controlName, 'point');
			}
			break;
			
	}
	
	return false;
}

function PageMouseMove(e) {
	// mouse move event handler for page tools
	var pos = ESRI.ADF.System.__getAbsoluteMousePosition(e);
	switch (page.actionType) {
		case "PageDragImage":
			if (page.dragImage) {
				x2 = pos.mouseX;
				y2 = pos.mouseY;
				if (x2 < page.pageLeft) x2 = page.pageLeft;
				if (x2 > page.width + page.pageLeft) x2 = page.width + page.pageLeft;
				if (y2 < page.pageTop) y2 = page.pageTop;
				if (y2 > page.height + page.pageTop) y2 = page.height +  page.pageTop; 
				var xMove = x2-x1;
				var yMove = y2-y1;
				var cLeft = -xMove;
				var cTop = -yMove;
				var cRight = page.width;
				var cBottom = page.height;
				if (xMove>0) {
					cLeft = 0;
					cRight = page.width - xMove;
				}
				if (yMove>0) {
					cTop = 0;
					cBottom = page.height - yMove;
				}
				// move div
				page._moveLayer(page.divObject,xMove,yMove);
			}
			break;
			
		case "PageDragRectangle":
			if (page.drawBox) {
				x2=pos.mouseX;
				y2=pos.mouseY;
				if (x2 < page.pageLeft) x2 = page.pageLeft;
				if (x2 > page.pageLeft + page.width) x2 = page.pageLeft + page.width;
				if (y2 < page.pageTop) y2 = page.pageTop;
				if (y2 > page.pageTop + page.height) y2 = page.pageTop + page.height;
				
				if (page._dragbox!=null) page._dragbox.clip(page.drawlineWidth);
				
			}
			break;
	}
	return false;
}
function pageDoCallback(page,eventarg) {
	var str = 'EventArg='+eventarg;
	str += '&minx='+page.xMin;
	str += '&miny='+page.yMin;
	str += '&maxx='+page.xMax;
	str += '&maxy='+page.yMax;
	str += '&dataframeIndex='+page.dataframeIndex;
	//str += '&value='+page.coords;
	str += '&'+page.get_id()+'_mode='+page.mode;
	page.doCallback(str,page);
}
function PageMouseUp(e) {
	// mouse up event handler for page tools
	switch (page.actionType) {
		case "PageDragImage":
			if (page.dragImage) {
				page.dragImage = false;
				
				var ixOffset = x2-x1;
				var iyOffset = y2-y1;
				var centerX = Math.round(page.width/2);
				var centerY = Math.round(page.height/2);
				showLayer(page.divId);
				
				page.xMin=centerX - ixOffset;
				page.yMin=centerY - iyOffset;
				page.xMax = 0;
				page.yMax = 0;
				
				//$removeHandler(page.divObject,'mouseup',PageMouseUp);
				//$removeHandler(page.divObject,'onmousemove',PageMouseMove);
				page.divObject.onmousemove=null;
				page.divObject.onmouseup=null;
				//$removeHandler(window,'mouseup',PageMouseUp);
				page.divObject.style.cursor = "wait";
				pageDoCallback(page,'dragimage');
				//page.doCallback('EventArg=dragimage&dataframeIndex='+page.dataframeIndex+'&xmin='+page.xMin+'&ymin='+page.yMin+'&xmax=0&ymax=0&'+page.get_id()+'_mode='+page.mode,page);
				//postBack(page.controlName, 'dragimage');
			}
			break;
		case "PageDragRectangle":
			if (page.drawBox) {
				page.drawBox = false;
				if (page._dragbox!=null) page._dragbox.hide();
				zleft -= page.pageLeft;
				ztop -= page.pageTop;
				zright -= page.pageLeft;
				zbottom -= page.pageTop;
				page.xMin = zleft;
				page.yMin = ztop;
				page.xMax = zright;
				page.yMax = zbottom;
				//$removeHandler(page.divObject,'mouseup',PageMouseUp);
				//$removeHandler(page.divObject,'onmousemove',PageMouseMove);
				page.divObject.onmousemove=null;
				//page.divObject.onmouseup=null;
				$removeHandler(document.body,'mouseup',PageMouseUp);
				page.divObject.style.cursor = "wait";
				pageDoCallback(page,'dragrectangle');
				//page.doCallback('EventArg=dragrectangle&dataframeIndex='+page.dataframeIndex+'&xmin='+zleft+'&ymin='+ztop+'&xmax='+zright+'&ymax='+zbottom+'&'+page.get_id()+'_mode='+page.mode,page);
				//postBack(page.controlName, 'dragrectangle');
			}
			break;
	}
	return true;
}
/*************************/
/* Map Frame interaction */
/*************************/
function PageMapMouseDown(e) {
	// mouse down event handler for dataframe tools
	page = (getSelectedDataframeObject(e));
	page.dataframeIndex = dataframeIndex;
	var df = page._dataframes[dataframeIndex];
	var obj = ESRI.ADF.System.__getAbsoluteMousePosition(e);
	switch (page.actionType) {
		case "PageMapDragImage":
			if (isLeftButton(e)) {
				page.drawBox = false;
				if (!page.dragImage) {
					page.dragImage = true;
					x1=obj.mouseX;
					y1=obj.mouseY;
					x2=x1+1;
					y2=y1+1;
					//$addHandler(document.body,'mouseup',PageMapMouseUp);
					//$addHandler(df.divObject,'onmousemove',PageMapMouseMove);
					df.divObject.onmouseup = PageMapMouseUp;
					df.divObject.onmousemove = PageMapMouseMove;
				}
			}
			break;
		case "PageMapDragRectangle":
			if (isLeftButton(e)) {
				page.dragImage = false;
				if (!page.drawBox) {
					page.drawBox = true;
					x1=obj.mouseX;
					y1=obj.mouseY;
					x2=x1+1;
					y2=y1+1;
				
					if (page._dragbox!=null) {
						page._dragbox.update(x1,y1,x2,y2,page._dragBoxColor, page._dragLineWidth);
						page._dragbox.show();
					}
					//$addHandler(df.divObject,'mouseup',PageMapMouseUp);
					//$addHandler(df.divObject,'onmousemove',PageMapMouseMove);
					$addHandler(document.body,'mouseup',PageMapMouseUp);
					//df.divObject.onmouseup = PageMapMouseUp;
					df.divObject.onmousemove = PageMapMouseMove;
				}
			}

			break;
		case "PageMapPoint":
			if (isLeftButton(e)) {
				page.dragImage = false;
				page.drawBox = false;
				page.xMin = obj.mouseX - (df.pageLeft + df.left);
				page.yMin = obj.mouseY - (df.pageTop + df.top);
				pageDoCallback(page,'mappoint');
			}
			break;
	}
	return false;
}

function PageMapMouseMove(e) {
	// mouse move event handler for dataframe tools
	var obj = ESRI.ADF.System.__getAbsoluteMousePosition(e);
	var df = page._dataframes[dataframeIndex];
	var left = df.pageLeft;// + df.left;
	var top = df.pageTop;// + df.top;
	switch (page.actionType) {
		case "PageMapDragImage":
			x2 = obj.mouseX;
			y2 = obj.mouseY;
//			if (x2 < left) x2 = left;
//			if (x2 > left + df.width) x2 = left + df.width;
//			if (y2 < top) y2 = top;
//			if (y2 > top + df.height) y2 = top + df.height;
			var xMove = x2 - x1;
			var yMove = y2 - y1;
			var cLeft = df.left - xMove;
			var cTop = df.top - yMove;
			var cRight = df.left + df.width;
			var cBottom = df.top + df.height;
//			if (xMove>0) {
//				cLeft = df.left;
//				cRight = (df.left + df.width) - xMove;
//			}
//			if (yMove>0) {
//				cTop = df.top;
//				cBottom = (df.top + df.height) - yMove;
//			}
			// move image
			df.maskObject.style.position = 'absolute';
			df.maskObject.style.left = (xMove)+'px';
			df.maskObject.style.top = (yMove)+'px';			 
			break;
		case "PageMapDragRectangle":
			if (page.drawBox) {
				x2=obj.mouseX;
				y2=obj.mouseY;
				if (x2 < left) x2 = left;
				if (x2 > left + df.width) x2 = left + df.width;
				if (y2 < top) y2 = top;
				if (y2 > top + df.height) y2 = top + df.height;
				if (page._dragbox!=null) page._dragbox.clip(df.drawlineWidth);				
			}
			break;		
	}
	return false;
}

function PageMapMouseUp(e) {
	// mouse up event handler for dataframe tools
	var df = page._dataframes[dataframeIndex];
	switch (page.actionType) {
		case "PageMapDragImage":
			if (page.dragImage) {
				page.dragImage = false;
				var ixOffset = x2 - x1;
				var iyOffset = y2 - y1;
				var centerX = Math.round(df.width / 2);
				var centerY = Math.round(df.height / 2);
				page._showLayer(df.divObject);
				page.xMin = centerX - ixOffset;
				page.yMin = centerY - iyOffset;
				page.xMax = 0;
				page.yMax = 0;
				df.divObject.onmouseup = null;
				df.divObject.onmousemove = null;
				
				pageDoCallback(page,'mapdragimage');				
			}
			break;
		case "PageMapDragRectangle":
			if (page.drawBox) {
				page.drawBox = false;
				df.divObject.style.cursor = "wait";
				if (page._dragbox!=null) page._dragbox.hide();
				zleft -= (df.pageLeft);// + df.left);
				ztop -= (df.pageTop);// + df.top);
				zright -= (df.pageLeft);// + df.left);
				zbottom -= (df.pageTop);// + df.top);
				page.xMin = zleft;
				page.yMin = ztop;
				page.xMax = zright;
				page.yMax = zbottom;
				$removeHandler(document.body,'mouseup',PageMapMouseUp);
				//$removeHandler(df.divObject,'onmousemove',PageMapMouseMove);
				df.divObject.onmouseup = null;
				df.divObject.onmousemove = null;
				//postBack(page.controlName, 'mapdragrectangle');
				pageDoCallback(page,'mapdragrectangle');
				//page.doCallback('EventArg=mapdragrectangle&dataframeIndex='+page.dataframeIndex+'&xmin='+zleft+'&ymin='+ztop+'&xmax='+zright+'&ymax='+zbottom+'&'+page.get_id()+'_mode='+page.mode,page);
			}
			break;
	}
	return true;
}

if (typeof(Sys) !== "undefined") Sys.Application.notifyScriptLoaded();