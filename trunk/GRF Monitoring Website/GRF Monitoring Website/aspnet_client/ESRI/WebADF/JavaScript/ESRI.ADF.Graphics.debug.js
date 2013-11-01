////----------------------------------------------------------
//// Copyright (C) ESRI. All rights reserved.
////----------------------------------------------------------
// TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
// Unpublished material - all rights reserved under the 
// Copyright Laws of the United States.
//
// For additional information, contact:
// Environmental Systems Research Institute, Inc.
// Attn: Contracts Dept
// 380 New York Street
// Redlands, California, USA 92373
//
// email: contracts@esri.com

/// <reference assembly="ESRI.ArcGIS.ADF.Web.UI.WebControls" name="ESRI.ArcGIS.ADF.Web.UI.WebControls.Runtime.JavaScript.ESRI.ADF.System.js"/>
/// <reference assembly="ESRI.ArcGIS.ADF.Web.UI.WebControls" name="ESRI.ArcGIS.ADF.Web.UI.WebControls.Runtime.JavaScript.ESRI.ADF.Geometries.js"/>
/// <reference assembly="ESRI.ArcGIS.ADF.Web.UI.WebControls" name="ESRI.ArcGIS.ADF.Web.UI.WebControls.Runtime.JavaScript.ESRI.ADF.UI.Callout.js"/>
Type.registerNamespace('ESRI.ADF.Graphics');

ESRI.ADF.Graphics.Symbol = function(cursor) {
	/// <summary>Abstract symbol class</summary>
	this._cursor = (cursor?cursor:null);
	this._opacity = 1.0;
};
ESRI.ADF.Graphics.Symbol.prototype = {
    clone: function() {
        /// <summary>Creates a clone of this instance</summary>
        /// <returns type="ESRI.ADF.Graphics.Symbol">Symbol</returns>
	throw(new Error.notImplemented('clone')); },
	get_cursor : function() {
		/// <value type="String" mayBeNull="true">Name of mouse cursor to display on hover.</value>
		/// <remarks>
		/// Use HTML cursor names. Examples: 'pointer','hand','crosshair','wait'.
		/// </remarks>
		return this._cursor;
	},
	set_cursor : function(value) { this._cursor = value;},
	get_opacity : function() {
		/// <value type="Number">The opacity of the symbol on a scale from 0..1</value>
		/// <remarks>
		/// Note that for bitmap based symbols that use PNG32 images, the image-embedded opacity will be used 
		/// and this opacity setting is ignored.
		/// </remarks>
		return this._opacity;
	},
	set_opacity : function(value) { this._opacity = value;}
};
ESRI.ADF.Graphics.Symbol.registerClass('ESRI.ADF.Graphics.Symbol');

ESRI.ADF.Graphics.MarkerSymbol = function(imageUrl,centerX,centerY,cursor) {
	/// <summary>Marker symbol</summary>
	/// <param name="imageUrl" type="String" mayBeNull="true" optional="true">Url for image to use as display symbol.</param>
	/// <param name="centerX" type="Number" mayBeNull="true" optional="true" integer="true">Offset in pixels from left to center of image.</param>
	/// <param name="centerY" type="Number" mayBeNull="true" optional="true" integer="true">Offset in pixels from top to center of image.</param>
	/// <param name="cursor" type="String" mayBeNull="true" optional="true">Mousecursor when hovering on marker.</param>
	ESRI.ADF.Graphics.MarkerSymbol.initializeBase(this,[cursor]);
	this._imageUrl = imageUrl;
	this._centerX = (centerX?centerX:0);
	this._centerY = (centerY?centerY:0);
	this._clipX = this._clipY = this._width = this._height = null;
	this._imageFormat = null;
};
ESRI.ADF.Graphics.MarkerSymbol.prototype = { 
	clone : function() {
		/// <summary>Creates a clone of this instance</summary>
		/// <returns type="ESRI.ADF.Graphics.MarkerSymbol">Symbol</returns>
		var symb = new ESRI.ADF.Graphics.MarkerSymbol(this._imageUrl,this._centerX,this._centerY,this._cursor);
		symb.set_clipX(this._clipX);
		symb.set_clipY(this._clipY);
		symb.set_width(this._width);
		symb.set_height(this._height);
		symb.set_opacity(this._opacity);
		symb.set_imageFormat(this._imageFormat);
		return symb;
	},
	get_imageUrl : function() {
		/// <value type="String">Url to marker symbol image.</value>
		return this._imageUrl;
	},
	set_imageUrl : function(value) { this._imageUrl = value;},
	get_imageFormat : function() {
		/// <value name="imageFormat" type="String">
		/// Gets or sets the image format this symbol uses.
		/// </value>
		/// <remarks>
		/// Format should be lowercase. Examples: 'gif','jpg','jpeg','png8','png24','png32'.
		/// The imageformat property is only important for handling PNG transparency correctly in Internet Explorer.
		/// Also note that for png32 images, image transparency is used and symbol <see cref="opacity"/> will be ignored.
		/// </remarks>
		return this._imageFormat;
	},
	set_imageFormat : function(value) { this._imageFormat = value;},
	get_centerX : function() {
		/// <value type="Number" integer="true">Horizontal center of image specified as an offset from the left in pixels.</value>
		return this._centerX;
	},
	set_centerX : function(value) { this._centerX = value;},
	get_centerY : function() {
		/// <value type="Number" integer="true">Vertical center of image specified as an offset from the top in pixels.</value>
		return this._centerY;
	},
	set_centerY : function(value) { this._centerY = value;},
	get_width : function() {
		/// <value type="Number" integer="true" mayBeNull="true">Width of symbol image.</value>
		/// <remarks>The width can be used to resize the symbol, or in the case of clipping, specify the width of the clipping rectangle.</remarks>
		return this._width;
	},
	set_width : function(value) { this._width = value;},
	get_height : function() {
		/// <value type="Number" integer="true" mayBeNull="true">Height of symbol image.</value>
		/// <remarks>The height can be used to resize the symbol, or in the case of clipping, specify the height of the clipping rectangle.</remarks>
		return this._height;
	},
	set_height : function(value) { this._height = value;},
	get_clipX : function() {
		/// <value type="Number" integer="true" mayBeNull="true">Horizontal offset from left of clipping rectangle.</value>
		/// <remarks>Clipping is used for creating symbols using sprites, ie. parts of an image. To use clipping, you
		/// you will need to set both clipX, clipY, width and height properties.</remarks>
		return this._clipX;
	},
	set_clipX : function(value) { this._clipX = value;},
	get_clipY : function() {
		/// <value type="Number" integer="true" mayBeNull="true">Vertical offset from top of clipping rectangle.</value>
		/// <remarks>Clipping is used for creating symbols using sprites, ie. parts of an image. To use clipping, you
		/// you will need to set both clipX, clipY, width and height properties.</remarks>
		return this._clipY;
	},
	set_clipY : function(value) { this._clipY = value;}
};
ESRI.ADF.Graphics.MarkerSymbol.registerClass('ESRI.ADF.Graphics.MarkerSymbol', ESRI.ADF.Graphics.Symbol);

ESRI.ADF.Graphics.CapType = function() {
	/// <summary>
	/// The CapType enumeration specifies the endcap style of a line.
	/// </summary>
	/// <field name="Round" type="Number" integer="true">Round</field>
	/// <field name="Flat" type="Number" integer="true">Flat</field>
	/// <field name="Square" type="Number" integer="true">Square</field>
	throw Error.invalidOperation();
};
ESRI.ADF.Graphics.CapType.prototype = {
	Round : 0,
	Flat: 1,
	Square : 2
};
ESRI.ADF.Graphics.CapType.registerEnum("ESRI.ADF.Graphics.CapType", false);

ESRI.ADF.Graphics.JoinType = function() {
	/// <summary>
	/// The CapType enumeration specifies linetype end
	/// </summary>
	/// <field name="Round" type="Number" integer="true">Round</field>
	/// <field name="Bevel" type="Number" integer="true">Bevel</field>
	/// <field name="Miter" type="Number" integer="true">Miter</field>
	throw Error.invalidOperation();
};
ESRI.ADF.Graphics.JoinType.prototype = {
	Round : 0,
	Bevel: 1,
	Miter : 2
};
ESRI.ADF.Graphics.JoinType.registerEnum("ESRI.ADF.Graphics.JoinType", false);


ESRI.ADF.Graphics.LineSymbol = function(lineColor,width,cursor) {
	/// <summary>Line symbol</summary>
	/// <param name="lineColor" type="String" mayBeNull="true" optional="true">Color of line formatted as an HTML color value.</param>
	/// <param name="width" type="Number" mayBeNull="true" optional="true" integer="true">Width of the line in pixels.</param>
	/// <param name="cursor" type="String" mayBeNull="true" optional="true">Mousecursor when hovering on marker.</param>
	ESRI.ADF.Graphics.LineSymbol.initializeBase(this, [cursor]);
	this._dashPattern = null;
	this._capType = ESRI.ADF.Graphics.CapType.Round;
	this._joinType = ESRI.ADF.Graphics.JoinType.Round;
	this.set_lineColor(lineColor?lineColor:'#000000');
	this._width = (width?width:1.0);
};
ESRI.ADF.Graphics.LineSymbol.prototype = { 
	clone : function() {
		/// <summary>Creates a clone of this instance</summary>
		/// <returns type="ESRI.ADF.Graphics.LineSymbol">Symbol</returns>
		var cloneObj = new ESRI.ADF.Graphics.LineSymbol(this._lineColor,this.get_width(),this.get_cursor());
		cloneObj.set_dashPattern(this.get_dashPattern());
		cloneObj.set_capType(this.get_capType());
		cloneObj.set_joinType(this.get_joinType());
		cloneObj.set_opacity(this.get_opacity());
		return cloneObj;
	},
	get_dashPattern : function() {
		/// <value type="Array" elementType="Number" mayBeNull="true">Dash pattern array</value>
		/// <remarks>Specifies a dash pattern to use on the symbol. Dash styles are defined in terms
		/// of the length of the dash (the drawn part of the stroke) and the length of the space
		/// between the dashes.  The lengths are relative to the line width - a length of "1" is equal to the line width. 
		/// Example: short-dash dot dot: [2,2,0,2,0,2]</remarks>
		return this._dashPattern;
	},
	set_dashPattern : function(value) { this._dashPattern = value;},
	get_capType : function() {
		/// <value type="ESRI.ADF.Graphics.CapType">Gets or sets the <cref="ESRI.ADF.Graphics.CapType"/></value>
		return this._capType;
	},
	set_capType : function(value) { this._capType = value;},
	get_joinType : function() {
		/// <value type="ESRI.ADF.Graphics.JoinType">Gets or sets the <cref="ESRI.ADF.Graphics.JoinType"/></value>
		return this._joinType;
	},
	set_joinType : function(value) { this._joinType = value;},
	get_lineColor : function() {
		/// <value type="String">Gets or sets the line color formatted as an HTML color value</value>
		return this._lineColor;
	},
	set_lineColor : function(value) { this._lineColor = value;},
	get_width : function() {
		/// <value type="Number">Width of line in pixels</value>
		return this._width;
	},
	set_width : function(value) { this._width = value;}
};
ESRI.ADF.Graphics.LineSymbol.registerClass('ESRI.ADF.Graphics.LineSymbol', ESRI.ADF.Graphics.Symbol);

ESRI.ADF.Graphics.FillSymbol = function(color,outlineColor,outlineWidth,cursor) {
	/// <summary>Fill symbol</summary>
	/// <param name="color" type="String" mayBeNull="true" optional="true">Color of fill formatted as an HTML color value.</param>
	/// <param name="lineColor" type="String" mayBeNull="true" optional="true">Color of outline formatted as an HTML color value.</param>
	/// <param name="outlineWidth" type="Number" mayBeNull="true" optional="true" integer="true">Width of the outline in pixels.</param>
	/// <param name="cursor" type="String" mayBeNull="true" optional="true">Mousecursor when hovering on marker.</param>
	ESRI.ADF.Graphics.FillSymbol.initializeBase(this, [cursor]);
	this._fillColor = color;
	if(outlineColor) { this._outline = new ESRI.ADF.Graphics.LineSymbol(outlineColor,outlineWidth); }
	else {this._outline = null; }
};

ESRI.ADF.Graphics.FillSymbol.prototype = {
	clone : function() {
		/// <summary>Creates a clone of this instance</summary>
		/// <returns type="ESRI.ADF.Graphics.FillSymbol">Symbol</returns>
		var cloneObj = new ESRI.ADF.Graphics.FillSymbol(this._fillColor);
		cloneObj.set_opacity(this.get_opacity());
		cloneObj.set_cursor(this.get_cursor());
		var outline = this.get_outline();
		if(outline) { cloneObj.set_outline(outline.clone()); }
		else { cloneObj.set_outline(null); }
		return cloneObj;
	},
	get_fillColor : function() {
		/// <value type="String" mayBeNull="true">Gets or sets the fill color formatted as an HTML color value. If null, no fill is rendered.</value>
		return this._fillColor;
	},
	set_fillColor : function(value) { this._fillColor = value;},
	get_outline : function() {
		/// <value type="ESRI.ADF.Graphics.LineSymbol" mayBeNull="true">Gets or sets the outline of the fill symbol. If null, no outline is rendered.</value>
		return this._outline;
	},
	set_outline : function(value) { this._outline = value;}		
};
ESRI.ADF.Graphics.FillSymbol.registerClass('ESRI.ADF.Graphics.FillSymbol', ESRI.ADF.Graphics.Symbol);

ESRI.ADF.Graphics.GraphicFeatureBase = function(symbol) {
	/// <summary>Abstract Graphic Feature base class</summary>
	ESRI.ADF.Graphics.GraphicFeatureBase.initializeBase(this);
	this._opacity = 1.0;
	this._symbol = (symbol?symbol:null);
	this._selectedSymbol = null;
	this._highlightSymbol = null;
};
ESRI.ADF.Graphics.GraphicFeatureBase.prototype = {
	get_mapTips : function() {
		/// <value type="ESRI.ADF.UI.MapTips" mayBeNull="true">
		/// Gets or sets the MapTips to display when hovering on this feature.
		/// </value>
		return this._mapTips;
	},
	set_mapTips : function(value) {
		if(this._mapTips!==value) {
			if(this._mapTips) { this._mapTips.removeGraphics(this); }
			this._mapTips = value;
			if(this._mapTips) {
				this._mapTips.addGraphics(this);
				if(!this._mapTips.get_isInitialized() && this._map) { this._mapTips.initialize(); }
			}
			this.raisePropertyChanged('mapTips');
		}
	},
	__set_map : function(value) {
		if(this._map!==null && value!==null && this._map !== value) {
			throw new Error.invalidOperation('Cannot add graphic to multiple map instances');
		}
		this._map = value;
		if(this._map===null) { this._mapTips = null; }
		else {
			if(this._mapTips && !this._mapTips._map) {
				this._mapTips.__set_map(this._map);
			}
		}
	},
	__get_canvas : function(canvas) {
		throw Error.notImplemented('__get_canvas');
	},
	get_symbol : function() {
		/// <value type="ESRI.ADF.Graphics.Symbol">Gets or sets the symbol for this feature.</value>
		return this._symbol;
	},
	set_symbol : function(value) {
		if(this._symbol !== value) {
			this._symbol = value;
			this.raisePropertyChanged('symbol');
		}
	},
	get_selectedSymbol : function() {
		/// <value type="ESRI.ADF.Graphics.Symbol">Gets or sets the selected symbol for this feature.</value>
		return this._selectedSymbol;
	},
	set_selectedSymbol : function(value) { 
		if(this._selectedSymbol !== value) {
			this._selectedSymbol = value;
			this.raisePropertyChanged('selectedSymbol');
		}
	},
	get_highlightSymbol : function() {
		/// <value type="ESRI.ADF.Graphics.Symbol">Gets or sets the highlightSymbol symbol for this feature.</value>
		return this._highlightSymbol;
	},
	set_highlightSymbol : function(value) { 
		if(this._highlightSymbol !== value) {
			this._highlightSymbol = value;
			//this.raisePropertyChanged('highlightSymbol');
		}
	},
	add_click : function(handler) {
	/// <summary>Fired when the feature is clicked.</summary>
	/// <remarks>The following table lists the arguments passed to the handler function.
	/// 	<table border="1" cellspacing="0" cols="3" cellpadding="1">
	/// 		<tbody>
	/// 			<tr>
	/// 				<th width="133" height="13">
	/// 					<strong>Arguments</strong></th>
	/// 				<th width="188">
	/// 					<strong>Type</strong></th>
	/// 				<th><strong>Description</strong></th>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>sender</td>
	/// 				<td>ESRI.ADF.Graphics.GraphicFeatureBase</td>
	/// 				<td>The graphic feature group that was clicked</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>click</td>
	/// 				<td>The browsers click event for the point at which the event
	///                 occurred</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('click', handler);
	},
	remove_click : function(handler) { this.get_events().removeHandler('click', handler); },
	add_mouseMove : function(handler) {
	/// <summary>Fired when the mouse moves over the feature.</summary>
	/// <remarks>The following table lists the arguments passed to the handler function.
	/// 	<table border="1" cellspacing="0" cols="3" cellpadding="1">
	/// 		<tbody>
	/// 			<tr>
	/// 				<th width="133" height="13">
	/// 					<strong>Arguments</strong></th>
	/// 				<th width="188">
	/// 					<strong>Type</strong></th>
	/// 				<th><strong>Description</strong></th>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>sender</td>
	/// 				<td>ESRI.ADF.Graphics.GraphicFeatureBase</td>
	/// 				<td>The graphic feature or group over which the mouse was moved</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>click</td>
	/// 				<td>The browsers mousemove event for the point at which the event
	///                 occurred</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('mouseMove', handler);
	},
	remove_mouseMove : function(handler) { this.get_events().removeHandler('mouseMove', handler); },
	add_mouseOver : function(handler) {
	/// <summary>Fired when the mouse enters the feature.</summary>
	/// <remarks>The following table lists the arguments passed to the handler function.
	/// 	<table border="1" cellspacing="0" cols="3" cellpadding="1">
	/// 		<tbody>
	/// 			<tr>
	/// 				<th width="133" height="13">
	/// 					<strong>Arguments</strong></th>
	/// 				<th width="188">
	/// 					<strong>Type</strong></th>
	/// 				<th><strong>Description</strong></th>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>sender</td>
	/// 				<td>ESRI.ADF.Graphics.GraphicFeatureBase</td>
	/// 				<td>The graphic feature or group that was moused over</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>click</td>
	/// 				<td>The browsers mouseover event for the point at which the event
	///                 occurred</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('mouseOver', handler);
	},
	remove_mouseOver : function(handler) { this.get_events().removeHandler('mouseOver', handler); },
	add_mouseOut : function(handler) {
	/// <summary>Fired when the mouse exits the feature.</summary>
	/// <remarks>The following table lists the arguments passed to the handler function.
	/// 	<table border="1" cellspacing="0" cols="3" cellpadding="1">
	/// 		<tbody>
	/// 			<tr>
	/// 				<th width="133" height="13">
	/// 					<strong>Arguments</strong></th>
	/// 				<th width="188">
	/// 					<strong>Type</strong></th>
	/// 				<th><strong>Description</strong></th>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>sender</td>
	/// 				<td>ESRI.ADF.Graphics.GraphicFeatureBase</td>
	/// 				<td>The graphic feature or group from which the mouse was moved away</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>click</td>
	/// 				<td>The browsers mouseout event for the point at which the event
	///                 occurred</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('mouseOut', handler);
	},
	remove_mouseOut : function(handler) { this.get_events().removeHandler('mouseOut', handler); },
	_raiseEvent : function(name,e) {
		var handler = this.get_events().getHandler(name);
		if (handler) { if(!e) { e = Sys.EventArgs.Empty; } handler(this, e); }
	}
};
ESRI.ADF.Graphics.GraphicFeatureBase.registerClass('ESRI.ADF.Graphics.GraphicFeatureBase', Sys.Component);

ESRI.ADF.Graphics.GraphicFeature = function(geometry,symbol,attributes) {
	/// <summary>Graphic Feature for rendering geometry on the client side.</summary>
	/// <param name="geometry" type="ESRI.ADF.Geometries.Geometry">Geometry.</param>
	/// <param name="symbol" type="ESRI.ADF.Graphics.Symbol">Symbolology to apply to this instance.</param>
	/// <param name="attributes" type="Objects" mayBeNull="true" optional="true">Key/value pair object containing attributes associated with this feature.</param>
	ESRI.ADF.Graphics.GraphicFeature.initializeBase(this,[symbol]);
	this._geometry = geometry;
	this._displayOnToc = false;
	this._envelope = null;
	this._graphicReference = null;
	this._canvas = null;
	this._attributes = null;
	this._isSelected = false;
	this._attributes = attributes;
	this._mapTips = null;
	this._map = null;
	this._onClickHandler = Function.createDelegate(this,function(e){ e.element = this; this._raiseEvent('click',e);});
	this._onMoveHandler = Function.createDelegate(this,function(e){e.element = this; this._raiseEvent('mouseMove',e);});
	this._onOverHandler = Function.createDelegate(this,function(e){e.element = this; this._raiseEvent('mouseOver',e);});
	this._onOutHandler = Function.createDelegate(this,function(e){e.element = this; this._raiseEvent('mouseOut',e);});
	this._propChangedHandler = Function.createDelegate(this,this._propertyChanged);
	this._highlight = false;
};
ESRI.ADF.Graphics.GraphicFeature.prototype = {
	initialize : function() {
		/// <summary>Initializes this instance</summary>
		/// <remarks>The graphic feature should be initialized before adding it to the map,
		/// or use the $create method to create and initialize an instance.</remark>
		ESRI.ADF.Graphics.GraphicFeature.callBaseMethod(this, 'initialize');
		this.add_propertyChanged(this._propChangedHandler);
	},
	dispose : function() {
		/// <summary>Disposes this instance.</summary>
		this._envelope = null;
		this.clearGraphicReference();
		if(this._propChangedHandler) { this.remove_propertyChanged(this._propChangedHandler); }
		ESRI.ADF.Graphics.GraphicFeature.callBaseMethod(this, 'dispose');
		this._onClickHandler = null;
		this._onMoveHandler = null;
		this._onOverHandler = null;
		this._onOutHandler = null;
		this._propChangedHandler = null;
	},
	_propertyChanged : function(sender, eventArgs) {
		if(eventArgs.get_propertyName() === 'geometry') { this._envelope=null; }
	},
	getEnvelope : function() {
		/// <summary>Returns the envelope of the geometry.</summary>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Envelope</returns>
		if(!this._envelope && this._geometry) { this._setEnvelope(); }
		return this._envelope;
	},
	_setEnvelope : function() {
			if(this._geometry && this._geometry.getEnvelope) {
				this._envelope = this._geometry.getEnvelope();
			}
			else { this._envelope = null; }
	},
	get_graphicReference : function(element) {
		/// <summary>Gets or sets a reference to the rendered element</summary>
		/// <remarks>For multipart geometries, this returned reference can be an array of element. The reference
		/// is automatically set by the renderer and should usually not be changed by the developer.</remarks>
		return this._graphicReference;		
	},
	set_graphicReference : function(element) {
		if(element===this._graphicReference) { return; }
		this.clearGraphicReference();
		this._graphicReference = element;
		if(this._graphicReference) {
			this._hookEvents();
			this._applyZIndex();
		}
		this.raisePropertyChanged('graphicReference');
	},
	clearGraphicReference : function() {
		/// <summary>Removes the reference from the page display and the graphics element </summary>
		if(this._graphicReference) {
			if(Array.isInstanceOfType(this._graphicReference)) {
				for(var idx=0;idx<this._graphicReference.length;idx++) {
					this._clearGraphicReferenceElement(this._graphicReference[idx]);
					this._graphicReference[idx]=null;
				}
			}
			else { this._clearGraphicReferenceElement(this._graphicReference); }
			this._graphicReference = null;
		}
	},
	_clearGraphicReferenceElement : function(element) {
		if(element) {
			$clearHandlers(element);
			if(element.parentNode) { element.parentNode.removeChild(element); }
		}
	},
	_hookEvents : function() {
		if(Array.isInstanceOfType(this._graphicReference)) {
			for(var idx=0;idx<this._graphicReference.length;idx++) {
				this._hookElementEvent(this._graphicReference[idx]);
			}
		}
		else { this._hookElementEvent(this._graphicReference); }
	},
	_hookElementEvent : function(element) {
		$addHandler(element,'mousemove',this._onMoveHandler);
		$addHandler(element,'mouseover',this._onOverHandler);
		$addHandler(element,'mouseout',this._onOutHandler);
		$addHandler(element,'click',this._onClickHandler);
	},
	__set_groupParent : function(parent) {
		this._parent = parent;
	},
	__get_canvas : function(canvas) {
		if(this._map) {  return this._map._assotateCanvas; }
		if(this._parent) { return this._parent.__get_canvas(); }
		return null;
	},
	__draw : function(updateSymbolOnly) {
		/// <summary>Draws or updates the graphic feature to the canvas using the specified transform function to transform to screen coordinates</summary>
		/// <returns>true if a new element was created, false if it was only updated or null if not rendered.</returns>		
		var symb = this._getActiveSymbol();
		if(!symb) {
			if(this._graphicReference) { //drawing with no symbol hides the object
				if(Array.isInstanceOfType(this._graphicReference)) {
					for(var idx=0;idx<this._graphicReference.length;idx++) {
						this._graphicReference[idx].parentNode.removeChild(this._graphicReference[idx]);
						this._graphicReference[idx] == null;
					}
				}
				else if(this._graphicReference.parentNode) {
					this._graphicReference.parentNode.removeChild(this._graphicReference);
				}
				this._graphicReference = null;
			}
			return;
		}
		if(ESRI.ADF.Geometries.Point.isInstanceOfType(this._geometry) && !ESRI.ADF.Graphics.MarkerSymbol.isInstanceOfType(symb)) {
			throw(new Error.argumentType('symbol', Object.getType(symb), ESRI.ADF.Graphics.MarkerSymbol, 'Invalid symbol type "' + Object.getType(symb).getName()+ '" for rendering geometry of type "'+ Object.getType(this._geometry).getName() + '"'));
		}
		var canvas = this.__get_canvas();
		if(!canvas) { return null; }
		if(this._graphicReference) {
			canvas.updateGeometry(this._geometry,symb,this._graphicReference,updateSymbolOnly);
			this._applyZIndex();
			return false;
		}
		else {
			
			this._graphicReference = canvas.drawGeometry(this._geometry,symb);
			this._applyZIndex();
			return true;
		}
	},
	_getActiveSymbol : function() {
		var symb = null;
		if(this._highlight) { symb = (this._highlightSymbol?this._highlightSymbol : (this._parent ? this._parent.get_highlightSymbol() : symb)); }
		if(!symb && this._isSelected) { symb = (this._selectedSymbol?this._selectedSymbol : (this._parent ? this._parent.get_selectedSymbol() : symb)); }
		if(!symb) { symb = (this._symbol?this._symbol : (this._parent ? this._parent.get_symbol() : null)); }
		if(!symb) { return null; }
		if(this._parent) {
			var opacity = this._parent.get_opacity();
			if(opacity<1) {
				symb = symb.clone();
				symb.set_opacity(symb.get_opacity()*opacity);
			}
		}
		return symb;
	},
	_setSelected : function() {
		if(this._graphicReference) { this.__draw(true); }
	},
	get_highlight: function() {
	    /// <value type="Boolean">Gets or sets whether the graphic feature is highlighted (rendered using highlightSymbol).</value>
		return this._highlight;
	},
	set_highlight : function(value) {
		if(this._highlight !== value) {
			this._highlight = value;
			if(this._graphicReference) { this.__draw(true); }
		}
	},
	_applyZIndex : function() {
		var z = (ESRI.ADF.Geometries.Surface.isInstanceOfType(this._geometry) ? 0:
				(ESRI.ADF.Geometries.Polyline.isInstanceOfType(this._geometry)?2:4)) + (this._highlight?1:0);
		if(Array.isInstanceOfType(this._graphicReference)) {
			for(var idx=0;idx<this._graphicReference.length;idx++) {
				this._applyZIndexElement(z,this._graphicReference[idx]);
			}
		}
		else { this._applyZIndexElement(z,this._graphicReference); }	
	},
	_applyZIndexElement : function(z,e) {
		if(e && e.style) {
			if(z) { e.style.zIndex = z; }
			else { e.style.zIndex = ''; }
		}
	},
	get_isSelected : function() {
		/// <value type="Boolean">Gets or sets whether this feature is selected. If the selectedSymbol property is set,
		/// the feature will change symbology on the map.</value>
		return this._isSelected;
	},
	set_isSelected : function(value) {
		if(this._isSelected!==value) {
			this._isSelected = value;
			this.raisePropertyChanged('isSelected');
			this._setSelected();
		}
	},
	get_geometry : function() {
		/// <value type="ESRI.ADF.Geometries.Geometry">Gets or sets the geometry associated with this feature.</value>
		return this._geometry;
	},
	set_geometry : function(value) {
		if(this._geometry!==value) {
			this._geometry = value;
			this.raisePropertyChanged('geometry');
		}
	},
	get_attributes : function() {
	    /// <value type="Object" mayBeNull="true" optional="true">Key/value pair object containing attributes associated with this feature.</value>
		///<remarks>Attributes are stored as a JSON array.  For example, {"Name" : graphicName, "Total Sales" : totalSales, "Total Income" : sumIncome}.  Each item is a JSON object consisting a string and value.</remarks>
		return this._attributes;
	},
	set_attributes : function(value) {
		if(this._attributes!==value) {
			this._attributes = value;
			this.raisePropertyChanged('attributes');
		}
	}
};
ESRI.ADF.Graphics.GraphicFeature.registerClass('ESRI.ADF.Graphics.GraphicFeature', ESRI.ADF.Graphics.GraphicFeatureBase);

ESRI.ADF.Graphics.GraphicFeatureGroup = function(id,defaultSymbol) {
	/// <summary>
	/// Holds a group of GraphicFeature objects for rendering geometry on the client side.
	/// </summary>
	/// <remarks>
	/// Use the GraphicFeatureGroup to easily manage and style multiple features. The symbology and
	/// maptips of the group will be applied to the individual features, unless they individually
	/// specify symbology or maptips.
	/// </remarks>
	/// <param name="id" type="String" mayBeNull="true" optional="true">
	/// ID of the feature group. After initialization, you can use $find to retrieve this instance.
	/// </param>
	/// <param name="symbol" type="ESRI.ADF.Graphics.Symbol" mayBeNull="true" optional="true">
	/// Symbolology to apply to this instance. If you use a default symbol, the geometry types of the features
	/// in this collection should match the symbol type.
	/// </param>
	this._id = id;
	ESRI.ADF.Graphics.GraphicFeatureGroup.initializeBase(this);
	this._elements = [];
	this._symbol = (defaultSymbol?defaultSymbol:null);
	this._transformFunc = null;
	this._elementChangedHandler = Function.createDelegate(this,this._onElementChanged);
	this._map = null;
	this._mapTips = null;
	this._visible = true;	
	this._onClickHandler = Function.createDelegate(this,function(s,e){ this._raiseEvent('click',e);});
	this._onMoveHandler = Function.createDelegate(this,function(s,e){ this._raiseEvent('mouseMove',e);});
	this._onOverHandler = Function.createDelegate(this,function(s,e){ this._raiseEvent('mouseOver',e);});
	this._onOutHandler = Function.createDelegate(this,function(s,e){ this._raiseEvent('mouseOut',e);});
};
ESRI.ADF.Graphics.GraphicFeatureGroup.prototype = {
	dispose : function() {
		/// <summary>Disposes this instance.</summary>
		this.clear();
		ESRI.ADF.Graphics.GraphicFeatureGroup.callBaseMethod(this, 'dispose');
		this._onClickHandler = null;
		this._onMoveHandler = null;
		this._onOverHandler = null;
		this._onOutHandler = null;
	},
	get : function(index) {
		/// <summary>Gets a feature from this colletion.</summary>
		/// <param name="index" type="Number" integer="true">Index of element in collection</param>
		/// <returns type="ESRI.ADF.Graphics.GraphicFeature">GraphicFeature at index.</returns>		
		return this._elements[index];
	},
	indexOf : function(element) {
		/// <summary>Gets the index of an element in this collection.</summary>
		/// <returns type="Number" integer="true">Index of element.</returns>
		return Array.indexOf(this._elements,element);
	},
	add : function(element) {
		/// <summary>Adds an element to the group.</summary>
		/// <param name="element" type="ESRI.ADF.Graphics.GraphicFeature">GraphicFeature</param>
		/// <returns/>
		this.insert(element,this._elements.length);
		element.__set_groupParent(this);
	},
	insert : function(element,index) {
		/// <summary>Inserts an element into the group.</summary>
		/// <param name="element" type="ESRI.ADF.Graphics.GraphicFeature">GraphicFeature</param>
		/// <param name="index" type="Number" integer="true">Insert index</param>
		/// <returns/>
		Array.insert(this._elements,index,element);
		element.__set_groupParent(this);
		element.add_propertyChanged(this._elementChangedHandler);
		this._hookEvents(element);
		var handler = this.get_events().getHandler('elementAdded');
		if (handler) { handler(this, element); }
	},
	getFeatureCount : function()  {
		/// <summary>Gets the number of features in this group.</summary>
		/// <returns type="Number" integer="true">Number of features in the group.</returns>
		return this._elements.length;
	},
	remove : function(element) {
		/// <summary>Removes an element from the group.</summary>
		/// <param name="element" type="ESRI.ADF.Graphics.GraphicFeature">GraphicFeature</param>
		/// <returns/>
		Array.remove(this._elements,element);
		element.__set_groupParent(null);
		element.remove_propertyChanged(this._elementChangedHandler);
		this._unhookEvents(element);
		element.clearGraphicReference();
		var handler = this.get_events().getHandler('elementRemoved');
		if (handler) { handler(this, element); }
	},
	clearGraphicReference : function() {
		/// <summary>Removes the reference from the page display and the graphics element </summary>
		for(var idx=0;idx<this._elements.length;idx++) {
			this._elements[idx].clearGraphicReference();
		}
	},
	clear : function() {
		/// <summary>Removes and disposes all features in the group.</summary>
		/// <returns/>
		for(var idx=0;idx<this._elements.length;idx++) {
			this._elements[idx].dispose();
			this._elements[idx] = null;
		}
		Array.clear(this._elements);
	},
	__get_canvas : function(canvas) {
		if(this._map) { return this._map._assotateCanvas; }
		else { return null; }
	},
	_onElementChanged : function(sender,eventArgs) {
		var prop = eventArgs.get_propertyName();
		if(prop==='geometry' || prop==='symbol') {
			var handler = this.get_events().getHandler('elementChanged');
			if (handler) { handler(this, sender); }
		}
	},
	_hookEvents : function(gfxElm) {
		gfxElm.add_click(this._onClickHandler);
		gfxElm.add_mouseMove(this._onMoveHandler);
		gfxElm.add_mouseOver(this._onOverHandler);
		gfxElm.add_mouseOut(this._onOutHandler);
	},
	_unhookEvents : function(element) {
		element.remove_click(this._onClickHandler);
		element.remove_mouseMove(this._onMoveHandler);
		element.remove_mouseOver(this._onOverHandler);
		element.remove_mouseOut(this._onOutHandler);
	},
	get_opacity : function() {
		/// <value type="Number">Gets or sets the opacity which will be multiplied with the opacity of all elements in this group when rendered.</value>
		/// <remarks><see cref="MarkerSymbols"/> that uses PNG32 wil ignore this setting.</remarks>
		return this._opacity;
	},
	set_opacity : function(value) { this._opacity = value;},
	get_visible : function() {
		/// <value type="Boolean">Gets or sets the visibility of all the features in the group.</value>
		return this._visible;
	},
	set_visible : function(value) { 
		if(this._visible !== value) {			
			this._visible = value;
			this._setVisible(this._elements,value);
			this.raisePropertyChanged('visible');
		}
	},
	_setVisible : function(features,visible) {
		for(var idx=0;idx<features.length;idx++) {
			if(ESRI.ADF.Graphics.GraphicFeatureGroup.isInstanceOfType(features[idx])) {
				for(var j=0;j<features[idx]._elements.length();j++) {
					this._setVisible(features.features[idx]._elements[j],visible);
				}
			}
			var ref = features[idx].get_graphicReference();
			if(ref) {
				if(Array.isInstanceOfType(ref)) {
					for(var k=0;k<ref.length;k++) {
						ref[k].style.display = (visible?'':'none');
					}
				}
				else { ref.style.display = (visible?'':'none'); }
			}
		}
	},
	add_elementChanged : function(handler) {
	/// <summary>Fired when an element is changed.</summary>
	/// <remarks>The following table lists the arguments passed to the handler function.
	/// 	<table border="1" cellspacing="0" cols="3" cellpadding="1">
	/// 		<tbody>
	/// 			<tr>
	/// 				<th width="133" height="13">
	/// 					<strong>Arguments</strong></th>
	/// 				<th width="188">
	/// 					<strong>Type</strong></th>
	/// 				<th><strong>Description</strong></th>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>sender</td>
	/// 				<td>ESRI.ADF.Graphics.GraphicFeatureGroup</td>
	/// 				<td>The graphic feature group to which a graphic feature was added</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>ESRI.ADF.Graphics.GraphicFeature</td>
	/// 				<td>The graphic feature that was added</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('elementChanged', handler);
	},
	remove_elementChanged : function(handler) { this.get_events().removeHandler('elementChanged', handler); },
	add_elementAdded : function(handler) {
	/// <summary>Fired when an element was added to the group.</summary>
	/// <remarks>The following table lists the arguments passed to the handler function.
	/// 	<table border="1" cellspacing="0" cols="3" cellpadding="1">
	/// 		<tbody>
	/// 			<tr>
	/// 				<th width="133" height="13">
	/// 					<strong>Arguments</strong></th>
	/// 				<th width="188">
	/// 					<strong>Type</strong></th>
	/// 				<th><strong>Description</strong></th>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>sender</td>
	/// 				<td>ESRI.ADF.Graphics.GraphicFeatureGroup</td>
	/// 				<td>The graphic feature group which contains a graphic feature that was changed</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>ESRI.ADF.Graphics.GraphicFeature</td>
	/// 				<td>The graphic feature that was changed</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('elementAdded', handler);
	},
	remove_elementAdded : function(handler) { this.get_events().removeHandler('elementAdded', handler); },
	add_elementRemoved : function(handler) {
	/// <summary>Fired when an element was removed from the group.</summary>
	/// <remarks>The following table lists the arguments passed to the handler function.
	/// 	<table border="1" cellspacing="0" cols="3" cellpadding="1">
	/// 		<tbody>
	/// 			<tr>
	/// 				<th width="133" height="13">
	/// 					<strong>Arguments</strong></th>
	/// 				<th width="188">
	/// 					<strong>Type</strong></th>
	/// 				<th><strong>Description</strong></th>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>sender</td>
	/// 				<td>ESRI.ADF.Graphics.GraphicFeatureGroup</td>
	/// 				<td>The graphic feature group from which a graphic feature was removed</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>ESRI.ADF.Graphics.GraphicFeature</td>
	/// 				<td>The graphic feature that was removed</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('elementRemoved', handler);
	},
	remove_elementRemoved : function(handler) { this.get_events().removeHandler('elementRemoved', handler); }
};
ESRI.ADF.Graphics.GraphicFeatureGroup.registerClass('ESRI.ADF.Graphics.GraphicFeatureGroup',ESRI.ADF.Graphics.GraphicFeatureBase);


//
// Browser specific vector implementations (VML, SVG, HTML, ...)
//

ESRI.ADF.Graphics.__Canvas = function(element,transFunc) {
    /// <summary>Vector graphics layer abstract class </summary>
	/// <param name="element" type="Sys.UI.DomElement">
	/// DOM element that holds the vector canvas
	/// </param>
	/// <returns />
	ESRI.ADF.Graphics.__Canvas.initializeBase(this, [element]);
	this._element = element;
	this._disposed = false;
	this._transFunc = transFunc;
};
ESRI.ADF.Graphics.createCanvas = function(element,transFunc) {
	if(Sys.Browser.agent === Sys.Browser.InternetExplorer) {
			return new ESRI.ADF.Graphics.__VmlCanvas(element,transFunc);
	}
	else {
		return new ESRI.ADF.Graphics.__SvgCanvas(element,transFunc);
	}
};
ESRI.ADF.Graphics.__Canvas.prototype = {
	dispose : function() {
		if(this._disposed) { return; }
		this.clear();
		ESRI.ADF.Graphics.__Canvas.callBaseMethod(this, 'dispose');
		this._disposed = true;
	},
	clear : function() {
		throw(new Error.notImplemented('clear'));
	},
	updateGeometry : function(geom,symbol,element,symbolOnly) {
		if(!element) { return; }
		if(geom && ESRI.ADF.Geometries.GeometryCollection.isInstanceOfType(geom)) {			  
			for(var idx=0;idx<geom.get_count();idx++) {
				this.updateGeometry(geom.get(idx),symbol,element[idx],symbolOnly);
			}
		}
		else {
			if(symbol) { this.setSymbol(element,symbol); }
			if((symbolOnly!==true || ESRI.ADF.Geometries.Point.isInstanceOfType(geom)) && this._transFunc) {
				this.setVertices(element,this._createPntArray(geom,this._transFunc,symbol),symbol);
			}
		}
	},
	drawGeometry : function(geom,symbol) {
		/// <summary>Converts a geometry into an array of screen coordinates and calls a type-based draw function</summary>
		if(ESRI.ADF.Geometries.GeometryCollection.isInstanceOfType(geom)) {			  
			var refs = [];
			for(var idx=0;idx<geom.get_count();idx++) {
				Array.add(refs,this.drawGeometry(geom.get(idx),symbol));
			}
			return refs;
		}
		var array = this._createPntArray(geom,this._transFunc,symbol);
		
		if(ESRI.ADF.Geometries.Polygon.isInstanceOfType(geom)) {
			if(array.length<6) { return null; }
			return this._drawPolygon(array,symbol);
		}
		else if(ESRI.ADF.Geometries.Envelope.isInstanceOfType(geom)) {
			return this._drawEnvelope(array,symbol);
		}
		else if(ESRI.ADF.Geometries.Polyline.isInstanceOfType(geom)) {
			if(array.length<4) { return null; }
			return this._drawPolyline(array,symbol);
		}
		else if(ESRI.ADF.Geometries.Point.isInstanceOfType(geom)) {			  
			return this._drawPoint(array,symbol);
		}
		else if(ESRI.ADF.Geometries.Oval.isInstanceOfType(geom)) {			  
			return this._drawOval(array,symbol);
		}
		else { throw(new Error.notSupported('type not supported for clientside vector graphics rendering')); }
	},
	_drawPoint :  function(pnt, marker) {		
		var shape = this.createPoint(pnt,marker);
		this.setSymbol(shape,marker);
		this.addToCanvas(shape);
		return shape;
	},
	_drawEnvelope : function(pntArray, fill) {
		var shape = this.createEnvelope(pntArray);
		this.setSymbol(shape,fill);	
		this.addToCanvas(shape);
		return shape;
	},
	_drawPolygon : function(pntArray, fill) {
		var shape = this.createPolygon(pntArray);
		this.setSymbol(shape,fill);	
		this.addToCanvas(shape);
		return shape;
	},
	_drawPolyline : function(pntArray, stroke) {
		if(pntArray.length<2) { return null; }
		var line = this.createPolyline(pntArray);
		this.setSymbol(line,stroke);	
		this.addToCanvas(line);
		return line;
	},
	_drawOval : function(pntArray, fill) {
		var shape = this.createOval(pntArray);
		this.setSymbol(shape,fill);	
		this.addToCanvas(shape);
		return shape;
	},
	createPoint : function(pnt, symbol) {
		var div = document.createElement('div');
		var img = document.createElement('img');
		div.appendChild(img);
		div.style.position  = 'absolute';
		this.setVertices(div,pnt,symbol);
		return div;
	},
	_createPntArray : function(geom,transformFunc,symbol){
		var tol = 2; //Pixel tolerance for generalization
		if(ESRI.ADF.Geometries.Polygon.isInstanceOfType(geom)) {
			var parray = [];
			var length = geom.getRingCount();
			for(var j=0;j<length;j++) {
				var ring = geom.getRing(j);
				var pntCount = ring.get_count();	 
				for(var idx=0;idx<pntCount;idx++) {
					var obj = transformFunc(ring.get(idx));
					if(parray.length<2 || Math.abs(parray[parray.length-2]-obj.offsetX)>tol ||
						Math.abs(parray[parray.length-1]-obj.offsetY)>tol || idx===pntCount-1) { //simple generalize
						Array.add(parray, obj.offsetX);
						Array.add(parray, obj.offsetY);
					}
				}
				if(j<length-1) { Array.add(parray,null); }
			}
			return parray;
		}
		else if(ESRI.ADF.Geometries.Polyline.isInstanceOfType(geom)) {			  
			var larray = [];
			var pathCount = geom.getPathCount();
			for(var k=0;k<pathCount;k++) {
				var path = geom.getPath(k);
				var pCount = path.get_count();	 
				for(var l=0;l<pCount;l++) {
					var lobj = transformFunc(path.get(l));
					if(larray.length<2 || Math.abs(larray[larray.length-2]-lobj.offsetX)>tol ||
						Math.abs(larray[larray.length-1]-lobj.offsetY)>tol || l===pCount-1) { //simple generalize
						Array.add(larray, lobj.offsetX);
						Array.add(larray, lobj.offsetY);
					}
				}
				if(k<pathCount-1) { Array.add(larray,null); }
			}
			return larray;
		}	
		else if(ESRI.ADF.Geometries.Point.isInstanceOfType(geom)) {			  
			var pobj = transformFunc(geom);			
			return [pobj.offsetX, pobj.offsetY];
		}
		else if(ESRI.ADF.Geometries.Oval.isInstanceOfType(geom)) {
			var center = transformFunc(geom.get_center());
			var size = transformFunc(new ESRI.ADF.Geometries.Point(geom.get_center().get_x()+geom.get_width()*0.5,geom.get_center().get_y()-geom.get_height()*0.5));
			return [center.offsetX,center.offsetY,Math.abs(size.offsetX-center.offsetX),Math.abs(size.offsetY-center.offsetY)];
		}
		else if(ESRI.ADF.Geometries.Envelope.isInstanceOfType(geom)) {
			var ll = transformFunc(new ESRI.ADF.Geometries.Point(geom.get_xmin(),geom.get_ymin()));
			var ur = transformFunc(new ESRI.ADF.Geometries.Point(geom.get_xmax(),geom.get_ymax()));
			return [ll.offsetX,ll.offsetY,ur.offsetX,ur.offsetY];
		}
		else if(ESRI.ADF.Geometries.GeometryCollection.isInstanceOfType(geom)) {
			Error.argumentType(Object.getTypeName(geom) + ' not yet supported');
		}
		else { throw Error.argumentType('geom', Object.getType(geom), ESRI.ADF.Geometries.Geometry); }
	}
};
ESRI.ADF.Graphics.__Canvas.registerClass('ESRI.ADF.Graphics.__Canvas', Sys.UI.Control);

//
// Svg specific implementation
//
ESRI.ADF.Graphics.__SvgCanvas = function(element,transfunc) {
	ESRI.ADF.Graphics.__SvgCanvas.initializeBase(this, [element,transfunc]);
};
ESRI.ADF.Graphics.__SvgCanvas.prototype = {
	initialize : function() {
		ESRI.ADF.Graphics.__SvgCanvas.callBaseMethod(this, 'initialize');	
		this.namespace = 'http://www.w3.org/2000/svg';
		this._element.style.MozUserSelect = 'none';
		this._element.style.zIndex = '100';
		this._element.parentNode.style.zIndex = '0';
		this._svgRoot = this._element.ownerDocument.createElementNS(this.namespace, 'svg');
		this._svgRoot.style.position = 'relative';
		this._svgRoot.style.width = '100%';
		this._svgRoot.style.height = '100%';
		this._element.appendChild(this._svgRoot);
		this._groupRoot = this._svgRoot.ownerDocument.createElementNS(this.namespace, 'g');
		this._svgRoot.appendChild(this._groupRoot);
	},
	adjustCanvasExtent : function(left,top,height,width) {
		// Applies an offset to the canvas and translates the SVG graphics
		// This is a workaround for the Mozilla SVG overflow bug.
		// see: https://bugzilla.mozilla.org:443/show_bug.cgi?id=378923
		this._svgRoot.style.left = -left + 'px';
		this._svgRoot.style.top = -top + 'px';
		this._element.style.height = height + 'px';
		this._groupRoot.setAttributeNS(null,'transform','translate('+left+' '+top+')');
	},
	clear : function() {
		if(this._disposed) { return; }
		this._svgRoot.innerHTML = '';
	},
	setSymbol : function(shape,symbol) {
		if(ESRI.ADF.Graphics.FillSymbol.isInstanceOfType(symbol)) {	
			this._setFill(shape,symbol);
		}
		else if(ESRI.ADF.Graphics.LineSymbol.isInstanceOfType(symbol)) {	
			this._setStroke(shape,symbol);
		}
		else if(ESRI.ADF.Graphics.MarkerSymbol.isInstanceOfType(symbol)) {	
			this._setMarker(shape,symbol);
		}
	},
	_setStroke : function(shape, stroke)
	{
		if(stroke) {
			shape.setAttributeNS(null, 'stroke', stroke.get_lineColor());
			shape.setAttributeNS(null, 'stroke-width', stroke.get_width());
			shape.setAttributeNS(null, 'stroke-opacity', stroke.get_opacity());
			shape.setAttributeNS(null, 'stroke-linecap', this._joinTypeToSvg(stroke.get_capType()));
			shape.setAttributeNS(null, 'stroke-linejoin', this._joinTypeToSvg(stroke.get_joinType()));
			if(stroke.get_dashPattern()) {
				shape.setAttributeNS(null, 'stroke-dasharray', this._dashPatternToSvg(stroke.get_dashPattern(),stroke.get_width()));
			}
			else {
				shape.removeAttributeNS(null, 'stroke-dasharray');
			}
		}
		else { shape.setAttributeNS(null, 'stroke', 'none'); }
	},
	_dashPatternToSvg : function(pattern,width) {
		if(!pattern || pattern.length===0) { return 'none'; }
		if(String.isInstanceOfType(pattern)) {
		    switch (pattern.toLowerCase()) {
		        case "dash":
		            pattern = [2,2]; break;
		        case "dot":
		            pattern = [1,2]; break;
		        case "dash_dot":
		            pattern = [2,2,1,2]; break;
		        case "dash_dot_dot":
		            pattern = [2,2,1,2,1,2]; break;
		        default:
		            return "none";		        
		    }	    
		}
	    for(var j=0;j<pattern.length;j++) {
	        pattern[j] = (pattern[j] === 1 ? 1 : Math.round(pattern[j]*width));
		}
		return pattern.toString();
	},	
	_capTypeToSvg : function(captype) {
		switch(captype) {
			case ESRI.ADF.Graphics.CapType.Flat: return 'butt';
			case ESRI.ADF.Graphics.CapType.Square: return 'square';
			default: return 'round';
		}
	},
	_joinTypeToSvg : function(jointype) {
		switch(jointype) {
			case ESRI.ADF.Graphics.JoinType.Miter: return 'miter';
			case ESRI.ADF.Graphics.JoinType.Bevel: return 'bevel';
			default: return 'round';
		}
	},
	_setFill : function(shape, fill)
	{
		if(fill && fill.get_fillColor()!==null) {
			shape.setAttributeNS(null, 'fill', fill.get_fillColor());
			shape.setAttributeNS(null, 'fill-opacity', fill.get_opacity());
			shape.setAttributeNS(null, 'fill-rule', 'evenodd');
		}
		else {
			shape.setAttributeNS(null, 'fill', 'none');
		}
		this._setStroke(shape,fill.get_outline());
	},
	setVertices : function(shape,pntArray,symbol) {
		switch(shape.tagName.toLowerCase()) {
			case 'path': shape.setAttributeNS(null, 'd', this._pntArrayToSvgPath(pntArray,shape.closed)); break;
			case 'ellipse':
				shape.setAttributeNS(null, 'cx', pntArray[0] + 'px');
				shape.setAttributeNS(null, 'cy', pntArray[1] + 'px');
				shape.setAttributeNS(null, 'rx', pntArray[2] + 'px');
				shape.setAttributeNS(null, 'ry', pntArray[3] + 'px');				
				break;
			case 'div':
				if(pntArray.length===2 && symbol) { //pnt
					shape.style.left = (pntArray[0] - symbol.get_centerX())+'px';
					shape.style.top = (pntArray[1] - symbol.get_centerY())+'px';
				}
				break;
			case 'rect':
				shape.setAttributeNS(null, 'x', Math.min(pntArray[0],pntArray[2]) + 'px');
				shape.setAttributeNS(null, 'y', Math.min(pntArray[1],pntArray[3]) + 'px');
				shape.setAttributeNS(null, 'width', Math.abs(pntArray[2]-pntArray[0])+ 'px');
				shape.setAttributeNS(null, 'height', Math.abs(pntArray[3]-pntArray[1]) + 'px');				
				break;
			default: break;
		}
		
	},
	_setMarker : function(div,symbol) {
		var img = div.childNodes[0];
		if(symbol.get_cursor()) { img.style.cursor = symbol.get_cursor(); }
		if(!img.src || !img.src.endsWith(symbol.get_imageUrl())) {
			img.src = symbol.get_imageUrl();
		}
		else { img.src = symbol.get_imageUrl(); }
		if(symbol.get_width() && symbol.get_height() && symbol.get_clipX()!==null && symbol.get_clipY()!==null) {
			div.style.width = symbol.get_width() + 'px';
			div.style.height = symbol.get_height() + 'px';
			img.style.left = -symbol.get_clipX()+'px';
			img.style.top = -symbol.get_clipY()+'px';
			img.style.position = 'relative';
			div.style.overflow = 'hidden';
		}
		else {
			if(symbol.get_width()>0) { img.style.width = symbol.get_width() + 'px'; }
			else { img.style.width = 'auto'; }
			if(symbol.get_height()>0) { img.style.height = symbol.get_height() + 'px'; }
			else { img.style.height = 'auto'; }
		}
		if(!symbol.get_imageFormat() || !symbol.get_imageFormat().startsWith('png32')) {
			ESRI.ADF.System.setOpacity(div,symbol.get_opacity());
		}
	},
	createPolyline : function(pntArray) {
		var line = this._svgRoot.ownerDocument.createElementNS(this.namespace, 'path');
		line.closed = false;
		this.setVertices(line,pntArray);				
		line.setAttributeNS(null, 'fill', 'none');
		return line;
	},
	createPolygon : function(pntArray) {
		var shape = this._svgRoot.ownerDocument.createElementNS(this.namespace, 'path');
		shape.closed = true;
		this.setVertices(shape,pntArray);		
		return shape;
	},
	createEnvelope : function(pntArray) {
		var shape = this._svgRoot.ownerDocument.createElementNS(this.namespace, 'rect');
		this.setVertices(shape,pntArray);		
		return shape;
	},
	createOval : function(pntArray) {
		var shape = this._svgRoot.ownerDocument.createElementNS(this.namespace, 'ellipse');
		this.setVertices(shape,pntArray);		
		return shape;
	},
	addToCanvas : function(shape) {
		if(shape.tagName.toLowerCase()==='div') {
			this._element.appendChild(shape);
		}
		else { this._groupRoot.appendChild(shape); }
		shape.setAttributeNS(null, 'overflow', 'visible');		
	},
	_pntArrayToSvgPath : function(pntArray, close) {
		var pathString = '';		
		var j=0;
		var newline = true;
		pathString += 'M';
		while(j<pntArray.length) {
			if(pntArray[j]!==null && j<pntArray.length-1) {
				pathString = pathString.concat(pntArray[j]," ");
				pathString = pathString.concat(pntArray[j+1]," ");
				j++;
				if(newline) { pathString += "L"; newline = false; }
			}
			else if(j<pntArray.length-2) {
				if(close) { pathString += "Z"; }
				pathString += ' M';
				newline = true;
			}
			j++;
		}
		if(close) { pathString += "Z"; }
		return pathString;
	}
};
ESRI.ADF.Graphics.__SvgCanvas.registerClass('ESRI.ADF.Graphics.__SvgCanvas', ESRI.ADF.Graphics.__Canvas);

//
// VML specific implementation
//

ESRI.ADF.Graphics.__VmlCanvas = function(element,transfunc) {
	ESRI.ADF.Graphics.__VmlCanvas.initializeBase(this, [element,transfunc]);
};
ESRI.ADF.Graphics.__VmlCanvas.prototype = {
	initialize : function() {
		ESRI.ADF.Graphics.__VmlCanvas.callBaseMethod(this, 'initialize');			
		this._element.unselectable = 'on';		
	},
	adjustCanvasExtent : function(left,top,height,width) {
		//Not necessary for VML
	},
	clear : function() {
		if(this._disposed) { return; }
		this.get_element().innerHTML = '';
	},
	setSymbol : function(shape,symbol) {
		if(ESRI.ADF.Graphics.FillSymbol.isInstanceOfType(symbol)) {	
			this._setFill(shape,symbol);
		}
		else if(ESRI.ADF.Graphics.LineSymbol.isInstanceOfType(symbol)) {	
			this._setStroke(shape,symbol);
		}
		else if(ESRI.ADF.Graphics.MarkerSymbol.isInstanceOfType(symbol)) {	
			this._setMarker(shape,symbol);
		}
	},
	addToCanvas : function(shape) {
		this._element.appendChild(shape);
	},
	_setStroke : function(shape,stroke) {
		if(shape.tagName.toLowerCase()==='div') {
			shape.style.border = 'solid '+stroke.get_width()+'px ' + stroke.get_lineColor();			
		}
		else {
			var strokes = shape.getElementsByTagName("stroke");
			var strokeElem = this._createVmlStrokeElement(stroke);
			if(strokes.length>0) { shape.replaceChild(strokeElem,strokes[0]); }
			else { shape.appendChild(strokeElem); }
		}
		if(stroke && stroke.get_cursor()) { shape.style.cursor = stroke.get_cursor(); }
	},
	_setFill : function(shape, fill) {
		if(shape.tagName.toLowerCase()==='div') {
			shape.style.backgroundColor = fill.get_fillColor();
			shape.style.filter = 'alpha(opacity='+(fill.get_opacity()*100)+')';
			shape.style.opacity = fill.get_opacity();
			this._setStroke(shape,fill.get_outline());
		}
		else {
			this._setStroke(shape,fill.get_outline());
			var fills = shape.getElementsByTagName("fill");
			var fillElem = this._createVmlFillElement(fill);
			if(fills.length>0) { shape.replaceChild(fillElem,fills[0]); }
			else { shape.appendChild(fillElem); }
			if(fill.get_cursor()) { shape.style.cursor = fill.get_cursor(); }
		}
		if(fill.get_cursor()) { shape.style.cursor = fill.get_cursor(); }
	},
	_setMarker : function(div,symbol) {
		var img = div.childNodes[0];
		if(symbol.get_cursor()) { img.style.cursor = symbol.get_cursor(); }
		if(!img.src || !img.src.endsWith(symbol.get_imageUrl())) {
			if(ESRI.ADF.System.__isIE6) {
				ESRI.ADF.System.setIEPngTransparency(img,symbol.get_imageUrl(),(!symbol.get_width() || !symbol.get_height()),symbol.get_imageFormat());
			}
			else { img.src = symbol.get_imageUrl(); }
		}
		else { img.src = symbol.get_imageUrl(); }
		
		if(symbol.get_width()>0 && symbol.get_height()>0 && symbol.get_clipX()!==null && symbol.get_clipY()!==null) {
			div.style.width = symbol.get_width() + 'px';
			div.style.height = symbol.get_height() + 'px';
			img.style.left = -symbol.get_clipX()+'px';
			img.style.top = -symbol.get_clipY()+'px';
			img.style.position = 'relative';
			div.style.overflow = 'hidden';
		}
		else {
			if(symbol.get_width()>0) { img.style.width = symbol.get_width() + 'px'; }
			else { img.style.width = 'auto'; }
			if(symbol.get_height()>0) { img.style.height = symbol.get_height() + 'px'; }
			else { img.style.height = 'auto'; }
		}
		if(!symbol.get_imageFormat() || !symbol.get_imageFormat().startsWith('png32')) {
			ESRI.ADF.System.setOpacity(div,symbol.get_opacity());
		}
	},
	setVertices : function(shape,pntArray,symbol) {
		switch(shape.tagName.toLowerCase()) {
			case 'shape':
				var path = this._pntArrayToVmlPath(pntArray,shape.filled===true || shape.filled==='t');
				if(shape.path !== path) { shape.path = path; }
				break;
			case 'oval':
				shape.style.left = pntArray[0]-pntArray[2];
				shape.style.top = pntArray[1]-pntArray[3];
				shape.style.width = pntArray[2]*2;
				shape.style.height = pntArray[3]*2;
				break;
			case 'div':
				if(pntArray.length===2 && symbol) { //pnt
					shape.style.left = (pntArray[0] - symbol.get_centerX())+'px';
					shape.style.top = (pntArray[1] - symbol.get_centerY())+'px';
				}
				break;
			case 'rect':
				shape.style.left = Math.min(pntArray[0],pntArray[2])+'px';
				shape.style.top = Math.min(pntArray[1],pntArray[3])+'px';
				shape.style.width = Math.abs(pntArray[2]-pntArray[0])+'px';
				shape.style.height = Math.abs(pntArray[3]-pntArray[1])+'px';
			break;
			default: break;
		}
		
	},
	createPolyline : function(pntArray) {
		var shape=document.createElement('v:shape');
		shape.style.width = this._element.offsetWidth;
		shape.style.height = this._element.offsetHeight;
		shape.coordsize = this._element.offsetWidth + ' ' + this._element.offsetHeight;
		shape.style.position = 'absolute';
		shape.unselectable = false;
		shape.filled = 'f';
		this.setVertices(shape,pntArray);
		return shape;
	},
	createPolygon : function(pntArray) {
		var shape=document.createElement("v:shape");
		shape.style.width = this._element.offsetWidth;
		shape.style.height = this._element.offsetHeight;
		shape.coordsize = this._element.offsetWidth + " " + this._element.offsetHeight;
		shape.style.position = 'absolute';
		shape.filled = 't';
		this.setVertices(shape,pntArray);
		return shape;
	},
	createEnvelope : function(pntArray) {
		var shape=document.createElement("v:rect");
		shape.style.position = 'absolute';
		shape.filled = 't';
		this.setVertices(shape,pntArray);
		return shape;
	},
	createOval : function(pntArray) {
		var shape=document.createElement("v:oval");
		shape.style.position = 'absolute';
		shape.filled = 't';
		this.setVertices(shape,pntArray);
		return shape;
	},
	_createVmlFillElement : function(fill) {
		var fillElem = document.createElement('v:fill');
		fillElem.type = 'solid';
		fillElem.color = fill.get_fillColor();
		if(!fill.get_fillColor()) { fillElem.opacity = '0.0'; }
		else { fillElem.opacity = fill.get_opacity(); }
		return fillElem;
	},	
	_createVmlStrokeElement : function(stroke) {
		var strokeElem = document.createElement('v:stroke');
		if(stroke) {
			strokeElem.color = stroke.get_lineColor();
			strokeElem.weight = stroke.get_width() + 'px';
			strokeElem.opacity = stroke.get_opacity();
			 //Workaround: In IE, strokes with opacity == 0 are not drawn for lines only
			 //Set opacity to 0.01 to enable a completely transparent client graphic with hover behavior
			 if (strokeElem.opacity == 0)
			    strokeElem.opacity = 0.01;
			strokeElem.endcap = this._capTypeToVml(stroke.get_capType());
			strokeElem.joinstyle = this._joinTypeToVml(stroke.get_joinType());
			strokeElem.dashstyle = this._dashPatternToVml(stroke.get_dashPattern());
		}
		else { strokeElem.opacity = '0'; }
		return strokeElem;
	},
	_dashPatternToVml : function(pattern) {
		if(!pattern || pattern.length===0) { return 'solid'; }
		if(String.isInstanceOfType(pattern)) {
		    switch (pattern.toLowerCase()) {
		        case "dash":
		            return "2 2";
		        case "dot":
		            return "1 1";
		        case "dash_dot":
		            return "2 1 1";
		        case "dash_dot_dot":
		            return "longdashdotdot";
		        default:
		            return "solid";		        
		    }	    
		}
		else{
		var dash = pattern[0];
		for(var j=1;j<pattern.length;j++) {
			dash += ' ' + pattern[j];
		}
	    }
		return dash;
	},
	_capTypeToVml : function(captype) {
		switch(captype) {
			case ESRI.ADF.Graphics.CapType.Flat: return 'flat';
			case ESRI.ADF.Graphics.CapType.Square: return 'square';
			default: return 'round';
		}
	},
	_joinTypeToVml : function(jointype) {
		switch(jointype) {
			case ESRI.ADF.Graphics.JoinType.Miter: return 'miter';
			case ESRI.ADF.Graphics.JoinType.Bevel: return 'bevel';
			default: return 'round';
		}
	},
	_pntArrayToVmlPath : function(pntArray, close) {
		var strBuilder = new Sys.StringBuilder();
		var j=0;
		var newline = true;
		strBuilder.append('m');
		while(j<pntArray.length) {
			if(pntArray[j]!==null && j<pntArray.length-1) {
				strBuilder.append(pntArray[j]);
				strBuilder.append(',');
				strBuilder.append(pntArray[j+1]);
				strBuilder.append(' ');
				j++;
				if(newline) { strBuilder.append('l'); newline = false; }
			}
			else if(j<pntArray.length-2) {
				if(close) { strBuilder.append('x'); }
				else { strBuilder.append('e'); }
				strBuilder.append('m');
				newline = true;
			}
			j++;
		}
		if(close) { strBuilder.append('x'); }
		else { strBuilder.append('e'); }
		return strBuilder.toString();
	}
};
ESRI.ADF.Graphics.__VmlCanvas.registerClass('ESRI.ADF.Graphics.__VmlCanvas', ESRI.ADF.Graphics.__Canvas);
if(Sys.Browser.agent === Sys.Browser.InternetExplorer) {
	document.writeln('<xml:namespace ns="urn:schemas-microsoft-com:vml" prefix="v"/>\n');	
    var ss = document.createStyleSheet();
    ss.addRule('v\\:shape', "behavior: url(#default#VML);");
    ss.addRule('v\\:fill', "behavior: url(#default#VML);");
    ss.addRule('v\\:rect', "behavior: url(#default#VML);");
    ss.addRule('v\\:oval', "behavior: url(#default#VML);");
    ss.addRule('v\\:stroke', "behavior: url(#default#VML);");
}

ESRI.ADF.Graphics.ShapeType = function() {
	/// <summary>
	/// The ShapeType enumeration specifies which type of geometry you want to draw on the map
	/// </summary>
	/// <field name="Point" type="Number" integer="true" >Point</field>
	/// <field name="Line" type="Number" integer="true">Line segment</field>
	/// <field name="Path" type="Number" integer="true">Polyline path</field>
	/// <field name="Envelope" type="Number" integer="true">Envelope box</field>
	/// <field name="Circle" type="Number" integer="true">Circle</field>
	/// <field name="Oval" type="Number" integer="true">Oval</field>
	/// <field name="Ring" type="Number" integer="true">Polygon ring</field>
};
ESRI.ADF.Graphics.ShapeType.prototype = {
	Point : 0,
	Line: 1,
	Path : 2,
	Envelope : 10,
	Circle : 11,
	Oval : 12,
	Ring : 13
};
ESRI.ADF.Graphics.ShapeType.registerEnum("ESRI.ADF.Graphics.ShapeType", false);

ESRI.ADF.Graphics.__GraphicsEditor = function(map,canvas,feature,featuretype,style,oncomplete,oncancel,continuous,cursor) {
	this._map = map;
	this._cursor = cursor;
	this._canvas = canvas;
	this._feature = feature;
	this._featuretype = featuretype;
	this._oncomplete = oncomplete;
	this._oncancel = oncancel;
	this._canvas = canvas;
	this._draggingHandler = null;
	this._dragCompletehandler = null;
	this._clickHandler = null;
	this._dblclickHandler = null;
	this._zoomStartHandler = null;
	this._zoomCompletedHandler = null;
	this._moveHandler = null;
	this._style = style;
	this._disposed = false;
	this._continuous = continuous;
	this._initialize();
};
ESRI.ADF.Graphics.__GraphicsEditor.prototype = {
	_initialize : function() {		
		if(!this._style) {
			if(this._featuretype >=10) {
				this._style = new ESRI.ADF.Graphics.FillSymbol('blue','yellow',1.0);
			}
			else {
				this._style = new ESRI.ADF.Graphics.LineSymbol('red',2);
			}
		}
		if(this._feature) { this._startEditFeature(); }
		else { this._startGetFeature(); }
	},
	dispose : function() {
		if(this._disposed || this._disposing) { return; }
		this._disposing = true;
		this._unhookEvents();
		this._geometry = null;
		this._pntColl = null;
		if(this._elmRef) { this._elmRef.parentNode.removeChild(this._elmRef); }
		this._elmRef = null;
		this._oncancel = null;
		this._oncomplete = null;
		this._disposing = false;		
		this._disposed = true;		
	},
	_hookEvents : function() {
		this._orgMouseMode = this._map.get_mouseMode();
		this._oldcursor = this._map.get_cursor();
		this._map.set_mouseMode(ESRI.ADF.UI.MouseMode.Custom);
		if(this._cursor) { this._map.set_cursor(this._cursor); }
		
		this._dblclickHandler = Function.createDelegate(this,this._onDblClick);
		this._moveHandler = Function.createDelegate(this,this._onMouseMove);
		this._mouseDownHandler = Function.createDelegate(this,this._onMouseDown);
		this._mouseUpHandler = Function.createDelegate(this,this._onMouseUp);
		this._zoomStartHandler = Function.createDelegate(this,this._onZoomStart);
		this._zoomCompletedHandler =  Function.createDelegate(this,this._onZoomCompleted);
		this._map.add_dblclick(this._dblclickHandler);		
		this._map.add_mouseMove(this._moveHandler);
		this._map.add_mouseDown(this._mouseDownHandler);
		this._map.add_mouseUp(this._mouseUpHandler);
		this._map.add_zoomStart(this._zoomStartHandler);
		this._map.add_zoomCompleted(this._zoomCompletedHandler);		
	},
	_unhookEvents: function() {
		//if(this._feature) {
			//this._feature.remove_mouseOver(this._onMouseOver);
		//}
		if(this._map.get_mouseMode()!==this._orgMouseMode) {
			this._map.set_mouseMode(this._orgMouseMode);
		}
		this._map.set_cursor(this._oldcursor);
		this._map.remove_dblclick(this._dblclickHandler);
		this._map.remove_mouseMove(this._moveHandler);
		this._map.remove_mouseDown(this._mouseDownHandler);
		this._map.remove_mouseUp(this._mouseUpHandler);
		this._map.remove_zoomStart(this._zoomStartHandler);
		this._map.remove_zoomCompleted(this._zoomCompletedHandler);		
		this._draggingHandler = null;
		this._dragCompletehandler = null;
		this._clickHandler = null;
		this._dblclickHandler = null;
		this._moveHandler = null;
		this._zoomStartHandler = null;
		this._zoomCompletedHandler = null;
	},
	_drawVertices : function() {
		if(this._feature) {
			if(ESRI.ADF.Geometries.Polygon.isInstanceOf(this._feature)) {
				var rings = this._feature.get_geometry().get_rings();
				for(var r=0;r<rings.length;r++) {
					var ring = rings[r];
					for(var v=0;v<ring.length;v++) {
						var env = new ESRI.ADF.Geometries.Envelope(r[0]-1,r[1]-1,r[0]+1,r[1]+1);
						this._canvas.drawGeometry(env,null);
					}
				}
			}
		}
	},
//	_onMouseOver : function(sender,args) {
//	},
	_onMouseDown : function(sender,args) {
		if(args.button === Sys.UI.MouseButton.leftButton && !this._pntColl && this._featuretype!==ESRI.ADF.Graphics.ShapeType.Point) {
			this._pntColl = new ESRI.ADF.Geometries.CoordinateCollection([[args.coordinate.get_x(), args.coordinate.get_y()]]);
		}
	},	
	_onMouseMove : function(sender,args) {
		if(this._pntColl) {
			var count = this._pntColl.get_count();
			if(count>0) {
				if(args.ctrlKey) { 
					var lastpnt = this._pntColl.getLast();
					if(Math.abs(lastpnt[0]-args.coordinate.get_x()) < Math.abs(lastpnt[1]-args.coordinate.get_y())) {
						args.coordinate.set_x(lastpnt[0]);
					}
					else { args.coordinate.set_y(lastpnt[1]); }
				}			
				this._pntColl.add([args.coordinate.get_x(), args.coordinate.get_y()]);
				if(this._featuretype===ESRI.ADF.Graphics.ShapeType.Ring) { this._pntColl.add(this._pntColl.get(0)); }
				this._drawGeometry();
				this._pntColl.removeAt(count);
				if(this._featuretype===ESRI.ADF.Graphics.ShapeType.Ring) { this._pntColl.removeAt(count); }
			}
		}
	},
	_onZoomStart : function(sender,args) {
		this._canvas.get_element().style.display = 'none';
	},
	_onZoomCompleted : function(sender,args) {
		this._drawGeometry();
		this._canvas.get_element().style.display = '';
	},
	_isTwoPointFeatureType : function() {
		return (this._featuretype===ESRI.ADF.Graphics.ShapeType.Line ||
			this._featuretype===ESRI.ADF.Graphics.ShapeType.Oval	||
			this._featuretype===ESRI.ADF.Graphics.ShapeType.Circle || 
			this._featuretype===ESRI.ADF.Graphics.ShapeType.Envelope);
	},
	_onMouseUp : function(sender,e) {
		if(e.button === Sys.UI.MouseButton.leftButton) {
			this.__addPoint(e.coordinate,e.ctrlKey);
		}
		else if(e.button === Sys.UI.MouseButton.rightButton) {
			if(this._pntColl) {
				var count = this._pntColl.get_count();
		
				if(count>1) {
					this._pntColl.removeAt(count-1);
					this._onMouseMove(sender,e);
				}
				else {
					this._pntColl.clear();
					this._cancel(false);
				}
			}
		}
	},
	__addPoint : function(pnt,ortho) {
      if(this._featuretype===ESRI.ADF.Graphics.ShapeType.Point) { 
            this._geometry = pnt;
            this.__completeEditing();
            return;
      }
      if(!this._pntColl) { this._pntColl = new ESRI.ADF.Geometries.CoordinateCollection(); }
      var px = pnt.get_x();
      var py = pnt.get_y();
      var lastpoint = this._pntColl.getLast();
      if(lastpoint) { //Fix to horizontal/vertical lines
            if(ortho) {
                  if(Math.abs(lastpoint[0]-px) < Math.abs(lastpoint[1]-py)) {
                        px = lastpoint[0];
                  }
                  else { py = lastpoint[1]; }
            }
      }
      var isTwoPoint = this._isTwoPointFeatureType();
      if(!lastpoint || isTwoPoint || Math.abs(lastpoint[0]- px)/this._map._pixelsizeX>2 || Math.abs(lastpoint[1]-py)/this._map._pixelsizeY>2) {
            this._pntColl.add([px,py]);
            if(isTwoPoint && this._pntColl.get_count()===2) { 
                  this.__completeEditing();
            }
            else { this._drawGeometry(); }
      }
	},
	_createGeometry : function() {
		if(!this._pntColl) { this._geometry = null;	return; }
		switch(this._featuretype) {
			case ESRI.ADF.Graphics.ShapeType.Ring:
				this._geometry = new ESRI.ADF.Geometries.Polygon(this._pntColl); break;
			case ESRI.ADF.Graphics.ShapeType.Envelope:
				if(this._pntColl.get_count()>1) {
					var x1 = this._pntColl.get(0)[0];
					var y1 = this._pntColl.get(0)[1];
					var x2 = this._pntColl.get(1)[0];
					var y2 = this._pntColl.get(1)[1];
					this._geometry = new ESRI.ADF.Geometries.Envelope(Math.min(x1,x2),Math.min(y1,y2),Math.max(x1,x2),Math.max(y1,y2));
				}
				else {
					this._geometry = new ESRI.ADF.Geometries.Envelope(this._pntColl.get(0)[0],this._pntColl.get(0)[1],this._pntColl.get(0)[0],this._pntColl.get(0)[1]);
				}
				break;
			case ESRI.ADF.Graphics.ShapeType.Path:
			case ESRI.ADF.Graphics.ShapeType.Line:
				this._geometry = new ESRI.ADF.Geometries.Polyline(this._pntColl); break;
			case ESRI.ADF.Graphics.ShapeType.Circle:
			case ESRI.ADF.Graphics.ShapeType.Oval:
				if(this._pntColl.get_count()>1) {
					var a = (this._pntColl.get(1)[0]-this._pntColl.get(0)[0]);
					var b = (this._pntColl.get(1)[1]-this._pntColl.get(0)[1]);
					var scale = Math.sqrt(2);
					if(this._featuretype===ESRI.ADF.Graphics.ShapeType.Circle) {
						a = b = Math.sqrt(a*a+b*b);
					}
					else if(a!==0 && b!==0) {
						a*=scale;
						b*=scale;
					}
					this._geometry = new ESRI.ADF.Geometries.Oval(this._pntColl.getAsPoint(0),a*2,this._featuretype===ESRI.ADF.Graphics.ShapeType.Oval?b*2:null);
				}
				else {
					this._geometry = new ESRI.ADF.Geometries.Oval(this._pntColl.getAsPoint(0),0,0);
				}
				break;
			default: this._geometry=null;
		}
		
	},
	_drawGeometry : function() {
		this._createGeometry();
		if(!this._geometry) { return; }
		if(this._elmRef) {
			this._canvas.updateGeometry(this._geometry,this._style,this._elmRef);
		}
		else {
			this._elmRef = this._canvas.drawGeometry(this._geometry,this._style);
		}
	},
	_onDblClick : function(sender, args) {
		if(this._pntColl && (this._pntColl.get_count()>1 && this._featuretype !== ESRI.ADF.Graphics.ShapeType.Ring ||
		   this._pntColl.get_count()>2)) {
			this.__completeEditing();
		}
		else if(this._featuretype === ESRI.ADF.Graphics.ShapeType.Envelope) {
			if(this._pntColl==null) {
				this.__addPoint(args.coordinate,false);
			}
			this.__completeEditing();
		}
	},
	__completeEditing : function() {
		if(this._featuretype === ESRI.ADF.Graphics.ShapeType.Ring) {
			var firstPnt = this._pntColl.getFirst();
			var lastPnt = this._pntColl.getLast();
			if(firstPnt[0]!==lastPnt[0] || firstPnt[1]!==lastPnt[1]) {
				this._pntColl.add([firstPnt[0],firstPnt[1]]); //Close polygon
            }
		}
		else if(this._featuretype === ESRI.ADF.Graphics.ShapeType.Envelope && this._pntColl.get_count()===1) {
			var firstPnt = this._pntColl.getFirst();        
			this._geometry = new ESRI.ADF.Geometries.Envelope(firstPnt[0],firstPnt[1],firstPnt[0],firstPnt[1]);
		}
		else if (this._isTwoPointFeatureType()) {
            if(this._pntColl.get_count()!==2) {
				throw new Error.invalidOperation('Operation requires two points');
            }
            this._createGeometry();
		}
		if(this._oncomplete && this._geometry) { this._oncomplete(this._geometry); }
		if(!this._continuous) { this.dispose(); }
		else {
			this._pntColl = null;
			this._geometry = null;
			if(this._elmRef) {
				this._elmRef.parentNode.removeChild(this._elmRef);
				this._elmRef=null;
			}
		}
	},
	_startEditFeature : function(feature) {
		this._drawVertices();
		this._hookEvents();
	},
	_startGetFeature : function() {
		this._hookEvents();
	},
	_cancel : function(force) {
		if(this._elmRef) {
			this._elmRef.parentNode.removeChild(this._elmRef);
			this._elmRef = null;
		}
		this._pntColl = null;
		this._geometry = null;
		if(force || !this._continuous) { if(this._oncancel){this._oncancel(true);} this.dispose(); }
	},
	cancel : function() {
		this._cancel(true);
	}
};
ESRI.ADF.Graphics.__GraphicsEditor.registerClass('ESRI.ADF.Graphics.__GraphicsEditor');


//Helper methods for parsing GraphicLayer data from the server
Type.registerNamespace('ESRI.ADF.Graphics.__AdfGraphicsLayer');

ESRI.ADF.Graphics.__AdfGraphicsLayer.parseJsonLayer = function(json,map) {
	/// <summary>
	/// Helper method for parsing a GraphicsLayer serialized on the server,
	/// into a ESRI.ADF.Graphics.GraphicFeatureGroup.
	/// </summary>
	var obj = Sys.Serialization.JavaScriptSerializer.deserialize(json);
	var name = map.get_id() + '_' + obj.tableName;
	var type = obj.type;
	var rows = obj.rows;
	var titleTemplate = obj.title;
	var contentTemplate = obj.contents;
	var opacity = (obj.opacity || obj.opacity===0?obj.opacity:1);
	var visible = (obj.visible!==false);
	var enableCallout = (obj.enableCallout!==false);
	var layer = null;
	var ftype = ESRI.ADF.Geometries.Geometry;
	var symbol = null;
	var selectedSymbol = null;
	var highlightSymbol = null;	
	if(type === 'featureGraphicsLayer')
	{
		switch(obj.featureType) {
			case 'point':
				type = ESRI.ADF.Geometries.Point;
				break;
			case 'line':
				type = ESRI.ADF.Geometries.Line;
				break;
			case 'polygon':
				type = ESRI.ADF.Geometries.Polygon;
				break;
			default:
		}
		symbol = ESRI.ADF.Graphics.__AdfGraphicsLayer._parseSymbol(obj.symbol);
		if(obj.selectedSymbol) { selectedSymbol = ESRI.ADF.Graphics.__AdfGraphicsLayer._parseSymbol(obj.selectedSymbol); }
		if(obj.highlightSymbol) { highlightSymbol = ESRI.ADF.Graphics.__AdfGraphicsLayer._parseSymbol(obj.highlightSymbol); }
	}
	layer = $find(name);
	if(layer) { 
		map.removeGraphic(layer);
		layer.clear();
		layer.set_visible(visible);
		layer.set_symbol(symbol);
		layer.set_selectedSymbol(selectedSymbol);
		layer.set_highlightSymbol(highlightSymbol);
	}
	else {
		layer = $create(ESRI.ADF.Graphics.GraphicFeatureGroup,{"id":name,"visible":visible,"symbol":symbol,"selectedSymbol":selectedSymbol,"highlightSymbol":highlightSymbol});
	}
	if(opacity!==null) { layer.set_opacity(opacity); }
	
	Array.forEach(rows, function(row) { layer.add(ESRI.ADF.Graphics.__AdfGraphicsLayer._parseRow(row,name)); });
	
	if(enableCallout) {
		var id = '__ESRI_WebADF_gfxLayerCallout_' + name;
		var callout = $find(id);
		if(!callout) {
			callout = $create(ESRI.ADF.UI.MapTips,{"animate":false,"hoverTemplate":titleTemplate,"contentTemplate":contentTemplate,"id":id});
		}
		else {
			callout.set_hoverTemplate(titleTemplate);
			callout.set_contentTemplate(contentTemplate);
		}
		layer.set_mapTips(callout);
	}
	else {
		var callout = layer.get_mapTips();
		if(callout) {
			layer.set_mapTips(null);
			callout.dispose();
		}
	}
	if(!ESRI.ADF.Graphics.__mapZoomEvent) {
		ESRI.ADF.Graphics.__mapZoomEvent = {};
		ESRI.ADF.Graphics._mapMouseOver = function(sender,args) {
			if(ESRI.ADF.Graphics._currentMouseHighlightElement) {
				ESRI.ADF.Graphics._currentMouseHighlightElement.set_highlight(false);
				ESRI.ADF.Graphics._currentMouseHighlightElement = null;
			}
			if(!args.element.get_highlight()) { //only highlight if not already highlighted
				args.element.set_highlight(true);
				ESRI.ADF.Graphics._currentMouseHighlightElement = args.element;
			}
		};
		ESRI.ADF.Graphics._mapMouseOut = function(sender,args) {
			if(ESRI.ADF.Graphics._currentMouseHighlightElement === args.element) { //Only un-highlight if a mouseover event highlighted it
				args.element.set_highlight(false);
				ESRI.ADF.Graphics._currentMouseHighlightElement = null;
			}
		};
	}
	layer.add_mouseOver(ESRI.ADF.Graphics._mapMouseOver);
	layer.add_mouseOut(ESRI.ADF.Graphics._mapMouseOut);
	if(!ESRI.ADF.Graphics.__mapZoomEvent[map.get_id()]) {
		ESRI.ADF.Graphics.__mapZoomEvent[map.get_id()] = true; //ensures we only hook up the event once
		map.add_zoomStart(function() {
			if(ESRI.ADF.Graphics._currentMouseHighlightElement) {
				 ESRI.ADF.Graphics._currentMouseHighlightElement.set_highlight(false);
				ESRI.ADF.Graphics._currentMouseHighlightElement=null;
			}
		});
	}
	return layer;
};

ESRI.ADF.Graphics.__AdfGraphicsLayer._parseRow = function(row,layerid) {
	var geometry = ESRI.ADF.Graphics.__AdfGraphicsLayer._parseGeometry(row.geometry);
	var symbol = null;
	var selectedSymbol = null;
	var highlightSymbol = null;
	if(row.symbol) { symbol = ESRI.ADF.Graphics.__AdfGraphicsLayer._parseSymbol(row.symbol); }
	if(row.selectedSymbol) { selectedSymbol = ESRI.ADF.Graphics.__AdfGraphicsLayer._parseSymbol(row.selectedSymbol); }
	if(row.highlightSymbol) { highlightSymbol = ESRI.ADF.Graphics.__AdfGraphicsLayer._parseSymbol(row.highlightSymbol); }
	var id = layerid+'_'+row.id;
	var feat = $find(id);
	if(feat) { feat.dispose(); }
	var gfx = $create(ESRI.ADF.Graphics.GraphicFeature,{"id":id,"isSelected":row.isSelected,"geometry":geometry,"symbol":symbol,"selectedSymbol":selectedSymbol,"highlightSymbol":highlightSymbol,"attributes":row.attributes});
	if(row.geometry.envelope) {
		gfx._envelope = new ESRI.ADF.Geometries.Envelope(row.geometry.envelope[0],row.geometry.envelope[1],row.geometry.envelope[2],row.geometry.envelope[3]);
	}
	return gfx;
};
ESRI.ADF.System.attributeTableRenderer = function(obj) {
	/// <summary>Converts a key/value pair object into a HTML table</summary>
	/// <param name="obj" type="Object">Key/Value pair collection</param>		
	/// <return obj="String">Table of attributes</return>
	if(!obj) { return ''; }
	var strBuilder = new Sys.StringBuilder();
	var content = '';
	strBuilder.append('<div onclick="return false;" onwheel="return false;"><table>');
	for(var key in obj) { strBuilder.append(String.format('<tr><td><b>{0}:</b></td><td>{1}</td></tr>',
	key,obj[key])); }
	strBuilder.append('</table></div>');
	return strBuilder.toString();
};
ESRI.ADF.Graphics.__AdfGraphicsLayer._parseSymbol = function(symbol) {
	if(!symbol) { return null; }
	switch(symbol.type) {
		case 'marker':
			return ESRI.ADF.Graphics.__AdfGraphicsLayer._parseMarkerSymbol(symbol);
		case 'line':
			return ESRI.ADF.Graphics.__AdfGraphicsLayer._parseLineSymbol(symbol);
		case 'fill':
			return ESRI.ADF.Graphics.__AdfGraphicsLayer._parseFillSymbol(symbol);
		default: return null;
	}
};
ESRI.ADF.Graphics.__AdfGraphicsLayer._parseMarkerSymbol = function(symbol) {
	var centerx = symbol.center?symbol.center[0]: (symbol.size[0]*0.5);
	var centery = symbol.center?symbol.center[1]: (symbol.size[1]*0.5);
	var marker = new ESRI.ADF.Graphics.MarkerSymbol(symbol.url,centerx,centery);
	if(symbol.opacity<1) { marker.set_opacity(symbol.opacity); }
	marker.set_width(symbol.size[0]);
	marker.set_height(symbol.size[1]);
	if(symbol.format) { marker.set_imageFormat(symbol.format); }
	return marker;
};
ESRI.ADF.Graphics.__AdfGraphicsLayer._parseLineSymbol = function(symbol) {
	var line = new ESRI.ADF.Graphics.LineSymbol(symbol.color,symbol.width);
	line.set_dashPattern(symbol.lineType);
	if(symbol.opacity<1) { line.set_opacity(symbol.opacity); }
	return line;
};
ESRI.ADF.Graphics.__AdfGraphicsLayer._parseFillSymbol = function(symbol) {
	var fill=null;
	if(symbol.hasBoundary===true) {
		fill = new ESRI.ADF.Graphics.FillSymbol(symbol.color,symbol.boundaryColor,symbol.boundaryWidth);
		fill.get_outline().set_dashPattern(symbol.boundaryType);	
		if(symbol.BoundaryOpacity===0 || symbol.BoundaryOpacity<1) {
			fill.get_outline().set_opacity(symbol.BoundaryOpacity);
		}
	}
	else { fill = new ESRI.ADF.Graphics.FillSymbol(symbol.color); }
	if(symbol.opacity===0 || symbol.opacity<1) {
		fill.set_opacity(symbol.opacity);
	}
	return fill;
};
ESRI.ADF.Graphics.__AdfGraphicsLayer._parseGeometry = function(geom) {
	if(!geom) { return null; }
	switch(geom.type) {
		case 'point':
			return ESRI.ADF.Graphics.__AdfGraphicsLayer._parsePoint(geom);
		case 'multipoint':
			return ESRI.ADF.Graphics.__AdfGraphicsLayer._parseMultiPoint(geom);
		case 'polyline':
			return ESRI.ADF.Graphics.__AdfGraphicsLayer._parsePolyline(geom);
		case 'polygon':
			return ESRI.ADF.Graphics.__AdfGraphicsLayer._parsePolygon(geom);
		case 'envelope':
			return ESRI.ADF.Graphics.__AdfGraphicsLayer._parseEnvelope(geom);			
		default: return null;
	}
};
ESRI.ADF.Graphics.__AdfGraphicsLayer._parsePoint = function(geom) {
	return new ESRI.ADF.Geometries.Point(geom.x,geom.y);
};
ESRI.ADF.Graphics.__AdfGraphicsLayer._parseMultiPoint = function(geom) {
	var pnts = new ESRI.ADF.Geometries.GeometryCollection(ESRI.ADF.Geometries.Point);
	for(var j=0;j<geom.points.length;j++) {
		pnts.add(new ESRI.ADF.Geometries.Point(geom.points[j][0],geom.points[j][1]));
	}
	return pnts;
};
ESRI.ADF.Graphics.__AdfGraphicsLayer._parsePolyline = function(geom) {
	var line = new ESRI.ADF.Geometries.Polyline();
	var paths = geom.paths;
	for(var j=0;j<paths.length;j++) {
		line.addPath(new ESRI.ADF.Geometries.CoordinateCollection(paths[j]));
	}
	return line;
};
ESRI.ADF.Graphics.__AdfGraphicsLayer._parsePolygon = function(geom) {
	var poly = new ESRI.ADF.Geometries.Polygon();
	var rings = geom.rings;
	for(var j=0;j<rings.length;j++) {
		poly.addRing(new ESRI.ADF.Geometries.CoordinateCollection(rings[j]));
	}
	return poly;
};
ESRI.ADF.Graphics.__AdfGraphicsLayer._parseEnvelope = function(geom) {
	return new ESRI.ADF.Geometries.Envelope(geom.coords[0],geom.coords[1],geom.coords[2],geom.coords[3]);
};

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }