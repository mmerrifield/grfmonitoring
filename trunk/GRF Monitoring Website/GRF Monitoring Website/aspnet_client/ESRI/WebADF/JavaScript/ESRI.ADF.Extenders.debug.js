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

Type.registerNamespace('ESRI.ADF.Extenders');

ESRI.ADF.Extenders.Dock = function(element) {

	ESRI.ADF.Extenders.Dock.initializeBase(this, [element]);

	// Id of the map control to dock.
	this._dockControlId = null;

	// Map control to dock.
	this._map = null;

	// Alignment for control.
	this._alignment = ESRI.ADF.System.ContentAlignment.TopLeft;
}

ESRI.ADF.Extenders.Dock.prototype = {

	initialize : function() {
		ESRI.ADF.Extenders.Dock.callBaseMethod(this, 'initialize');

		if (this._map != null)	
		{
			this._onMapResizedHandler = Function.createDelegate(this, this._onMapResized);
			this._map.add_mapResized(this._onMapResizedHandler);
		}
		
		this._dockControl();
	},

	dispose : function() {

		if (this._map != null)
			this._map.remove_mapResized(this._onMapResizedHandler);
		    
		ESRI.ADF.Extenders.Dock.callBaseMethod(this, 'dispose');
	},

	_onMapResized : function(sender, args)
	{
		/// <summary>
		/// Respond to map resize events and reposition targeted control to maintain proper position.
		/// </summary>
	    
		this._dockControl();
	},

	_dockControl : function() {
		/// <summary>
		/// Move our target extended control to the proper location above the chosen map control.
		/// </summary>

		// Obtain target element to be docked, and map we are docking to
		var target = this.get_element();
		if (!target)
			return;
	        
		var mapDock = $get(this._dockControlId);
		if (!mapDock)
			return;

		// Walk up the parent offset hierarchy until you reach the one before the first one, which is the
		// top of the chain. This is the element that should have its position set absolutely to the
		// calculated values below. This solves several problems including the case where the extended control
		// is also extended by the HoverExpand extender which wraps the control in a DIV and thus makes setting
		// the position of the target control no longer have the desired effect. This causes that case to set
		// the DIV to be positioned properly which in turn positions the child element(s) including the target
		// control.
		while (target.offsetParent && target.offsetParent.offsetParent)
			target = target.offsetParent;

		// If our element is not positioned absolutely, make that change immediately
		// so that other elements flow taking this into consideration. This is very
		// important to do NOW, before obtaining bounds and location for the element
		// we are docking to which may be affected by this change in positioning. Also
		// set our z index to be one greater than the element we are docking to so that
		// we appear "on top" of it.
		if (target.style.position != "absolute")
			target.style.position = "absolute"
	        
		target.style.zIndex = Math.max(target.style.zIndex, mapDock.style.zIndex + 1);
	    
		// Get bounds and position of element we are docking to
		var mapBounds = Sys.UI.DomElement.getBounds(mapDock);
		var width = mapBounds.width;
		var height = mapBounds.height;
		var x = mapBounds.x;
		var y = mapBounds.y;

		// Get bounds of target element we are extending
		var ctlBounds = Sys.UI.DomElement.getBounds(target);

		// Compute the horizontal coordinate
		switch (this._alignment) {
			case ESRI.ADF.System.ContentAlignment.TopCenter:
			case ESRI.ADF.System.ContentAlignment.MiddleCenter:
			case ESRI.ADF.System.ContentAlignment.BottomCenter:
				x += Math.max(0, Math.floor(width / 2.0 - ctlBounds.width / 2.0));
				break;

			case ESRI.ADF.System.ContentAlignment.TopRight:
			case ESRI.ADF.System.ContentAlignment.MiddleRight:
			case ESRI.ADF.System.ContentAlignment.BottomRight:
				x += Math.max(0, width - ctlBounds.width);
				break;
		}
	   
		// Compute the vertical coordinate
		switch (this._alignment) {
			case ESRI.ADF.System.ContentAlignment.MiddleLeft:
			case ESRI.ADF.System.ContentAlignment.MiddleCenter:
			case ESRI.ADF.System.ContentAlignment.MiddleRight:
				y += Math.max(0, Math.floor(height / 2.0 - ctlBounds.height / 2.0));
				break;

			case ESRI.ADF.System.ContentAlignment.BottomLeft:
			case ESRI.ADF.System.ContentAlignment.BottomCenter:
			case ESRI.ADF.System.ContentAlignment.BottomRight:
				y += Math.max(0, height - ctlBounds.height);
				break;
		}

		// Set our top left coordinate using calculated values
		Sys.UI.DomElement.setLocation(target, x, y);
	},

	get_dockControlId : function() {
		/// <value type="String">
		/// Map control id to attach/dock.
		/// </value>
		return this._dockControlId;
	},

	set_dockControlId : function(value) {
		if (this._dockControlId != value) {
			this._dockControlId = value;
			this.raisePropertyChanged('dockControlId');
		}
	},

	get_map : function()
	{
		/// <value type="ESRI.ADF.UI.MapBase">
		/// Map javascript object to dock.
		/// </value>
		return this._map;
	},

	set_map : function(value)
	{
		if (this._map != value) {
			this._map = value;
			this.raisePropertyChanged('map');
		}
	},

	get_alignment : function() {
		/// <value type="ESRI.ADF.System.ContentAlignment" integer="true">
		/// Alignment for control. Default is TopLeft.
		/// </value>
		return this._alignment;
	},

	set_alignment : function(value) {
		if (this._alignment != value) {
			this._alignment = value;
			this.raisePropertyChanged('alignment');
		}
	}
}

ESRI.ADF.Extenders.Dock.registerClass('ESRI.ADF.Extenders.Dock', AjaxControlToolkit.BehaviorBase);


ESRI.ADF.Extenders.HoverExpand = function(element) {

	ESRI.ADF.Extenders.HoverExpand.initializeBase(this, [element]);

	// Parent DIV encapsulating targeted element and IMG control for thumbnail
	this._parentDiv = null;

	// DOM object housing the thumbnail image
	this._thumbImgObject = null;

	// DOM object housing the targeted control
	this._ctlObject = null;

	// Opacity to use when the mouse is hovering over the DIV
	this._mouseOverOpacity = 1.0;

	// Opactiy to use when the mouse is not hovering over the DIV
	this._mouseOutOpacity = 0.5;

	// URL to the image to use for the thumbnail
	this._thumbnailImageUrl = "";

	// Alignment for thumbnail image.
	this._thumbnailImageAlignment = ESRI.ADF.System.ContentAlignment.TopLeft;

	// URL for pinned image.
	this._pinnedImageUrl = "";

	// URL for unpinned image.
	this._unpinnedImageUrl = "";

	// Initial pinned state.
	this._pinned = false;

	// DOM object housing the pinned images.
	this._pinImgObject = null;

	// True only if properly configured for pinning
	this._isPinnable = false;

	// Current pinned state
	this._isPinned = false;

	// True only if properly configured for thumbnail
	this._isThumbable = false;
};

ESRI.ADF.Extenders.HoverExpand.prototype = {

	initialize : function() {
		/// <summary>
		/// Initialize the parent along with any child controls that have not yet been initialized.
		/// </summary>

		ESRI.ADF.Extenders.HoverExpand.callBaseMethod(this, 'initialize');
		this._createParentDiv();
	},

	dispose : function() {
		/// <summary>
		/// Dispose the control.
		/// </summary>

		$clearHandlers(this._element);
		ESRI.ADF.Extenders.HoverExpand.callBaseMethod(this, 'dispose');
	},

	_createParentDiv : function() {
		/// <summary>
		/// Create the div that will change the opacity of all children and store the image URL to display
		/// when the mouse does not hover over the control (if the property is set).
		/// </summary>

		// Assign targeted control to this class member
		this._ctlObject = this.get_element();

		// If a thumbnail image cannot be displayed, then there is no reason to perform any pinning logic
		// since pinning a control is something you do to temporarily prevent the thumbnail from appearing
		if (!this._isThumbable)
		{
			this._isPinnable = false;
		}

		// If an alternate image is specified or is pinnable, then add to DIV
		if (this._isThumbable || this._isPinnable)
		{
			// Create DIV to hold target control
			var div = document.createElement("DIV");

			// Make enclosing control have a unique id by appending target control client id
			if (this._ctlObject.id)
			{
				div.id = this._ctlObject.id + "_HoverExpand";
			}

			// Get dimensions of target control so enclosing control can have same dimensions and position
			var bounds = Sys.UI.DomElement.getBounds(this._ctlObject);

			// If the control is positioned absolutely, make enclosing control have same position via the
			// top and left values and position itself absolutely. Also, set target control to have coordinates
			// of 0,0 and copy z-index value to maintain layering. If not absolute, then use relative and
			// do NOT assign values for left and top so natural flow is maintained.
			if (this._ctlObject.style.position == "absolute")
			{
				div.style.left = bounds.x + "px";
				div.style.top = bounds.y + "px";
				div.style.position = this._ctlObject.style.position;
				this._ctlObject.style.left = 0 + "px";
				this._ctlObject.style.top = 0 + "px";

				div.style.zIndex = this._ctlObject.style.zIndex;
				this._ctlObject.style.zIndex = 0;
			}
			else
			{
				div.style.position = "relative";
			}

			// Enclosing control should have same dimensions as target control
			div.style.height = bounds.height + "px";
			div.style.width = bounds.width + "px";

			// Assign local variable to global property
			this._parentDiv = div;

			// Replace the target element with this DIV
			this._ctlObject.parentNode.replaceChild(div, this._ctlObject);

			// Move the target control to be a child of this DIV
			div.appendChild(this._ctlObject);

			// Handle thumbnail logic
			if (this._isThumbable)
			{
				// Create IMG control, assign URL and append to enclosing DOM element
				this._thumbImgObject = document.createElement("IMG");
				this._thumbImgObject.style.position = "absolute";
				div.appendChild(this._thumbImgObject);
				$addHandler(this._thumbImgObject, 'load', Function.createDelegate(this, this._onThumbImageLoaded));
				this._thumbImgObject.src = this._thumbnailImageUrl;
			}

			// Handle pin logic
			if (this._isPinnable)
			{
				// Initialize pinned state from property setting
				this._isPinned = this._pinned;

				// Create IMG control, assign URL and append to enclosing DOM element
				this._pinImgObject = document.createElement("IMG");
				this._pinImgObject.style.position = "absolute";
				div.appendChild(this._pinImgObject);
				$addHandler(this._pinImgObject, 'load', Function.createDelegate(this, this._onPinImageLoaded));
				this._pinImgObject.src = this._getPinnedImage();

				// Listen for mouse click events on the pin image object
				$addHandler(this._pinImgObject, 'click', Function.createDelegate(this, this._doClick));
			}

			// If the initial state is pinned, then hide any thumbnail image, display the control itself
			// and also display the pin image object which will contain the pinned image
			if (this._isPinnable && this._pinned)
			{
				this._showTargetControl(true);
			}
			else
			{
				this._showTargetControl(false);
			}
		}
		else
		{
			// To simplify logic elsewhere, make parent div equal to the control itself if no alternate image
			// is being used (otherwise image is being used as that is where we need to apply event handlers
			// and change opacity).
			this._parentDiv = this._ctlObject;
		}

		// Add event handlers to change opacity and/or thumbnail image
		$addHandler(this._parentDiv, 'mouseover', Function.createDelegate(this, this._doMouseOver));
		$addHandler(this._parentDiv, 'mouseout', Function.createDelegate(this, this._doMouseOut));

		// Assume the mouse is not over the control, so regardless of whether the opacity values are different
		// or not, assign this value. If the values are different, then mouse event handlers will have been
		// configured to toggle between them.
		this._setOpacity(this._mouseOutOpacity);
	},

	_getPinnedImage : function()
	{
		/// <summary>
		/// Obtains the URL for the appropriate image based upon the current pinned state.
		/// </summary>

		if (this._isPinnable)
		{
			return this._isPinned ? this._pinnedImageUrl : this._unpinnedImageUrl;
		}
	},

	_onThumbImageLoaded : function()
	{
		/// <summary>
		/// Positions the thumbnail image object at the proper coordinates based upon alignment.
		/// </summary>

		this._setImagePosition(this._thumbImgObject, this._thumbnailImageAlignment);
	},

	_onPinImageLoaded : function()
	{
		/// <summary>
		/// Positions the pinned image object at the proper coordinates based upon alignment.
		/// </summary>

		this._setImagePosition(this._pinImgObject, ESRI.ADF.System.ContentAlignment.TopRight);
	},

	_setImagePosition : function(imageObject, alignment)
	{
		/// <summary>
		/// Calculate the coordinates for the image object and set the location properly based upon
		/// alignment.
		/// </summary>

		// Get height and width of image and assign to handle element
		var imgBounds = $common.getBounds(imageObject);
		var ctlBounds = $common.getBounds(this._ctlObject);

		// Compute proper left and top values based upon enumerations
		var x = 0;
		var y = 0;

		// Compute the horizontal coordinate
		switch (alignment) {
			case ESRI.ADF.System.ContentAlignment.TopCenter:
			case ESRI.ADF.System.ContentAlignment.MiddleCenter:
			case ESRI.ADF.System.ContentAlignment.BottomCenter:
				x += Math.max(0, Math.floor(ctlBounds.width / 2.0 - imgBounds.width / 2.0));
				break;

			case ESRI.ADF.System.ContentAlignment.TopRight:
			case ESRI.ADF.System.ContentAlignment.MiddleRight:
			case ESRI.ADF.System.ContentAlignment.BottomRight:
				x += Math.max(0, ctlBounds.width - imgBounds.width);
				break;
		}

		// Compute the vertical coordinate
		switch (alignment) {
			case ESRI.ADF.System.ContentAlignment.MiddleLeft:
			case ESRI.ADF.System.ContentAlignment.MiddleCenter:
			case ESRI.ADF.System.ContentAlignment.MiddleRight:
				y += Math.max(0, Math.floor(ctlBounds.height / 2.0 - imgBounds.height / 2.0));
				break;
			case ESRI.ADF.System.ContentAlignment.BottomLeft:
			case ESRI.ADF.System.ContentAlignment.BottomCenter:
			case ESRI.ADF.System.ContentAlignment.BottomRight:
				y += Math.max(0, ctlBounds.height - imgBounds.height);
				break;
		}

		// Position IMG element using calculated X and Y coordinates
		Sys.UI.DomElement.setLocation(imageObject, x, y);
	},

	_setPinnable : function ()
	{
		/// <summary>
		/// Set the isPinnable property based upon the image URL properties.
		/// </summary>

		this._isPinnable = (this._pinnedImageUrl !== "") && (this._unpinnedImageUrl !== "");
	},

	_setOpacity : function(opacity) {
		/// <summary>
		/// Set the opacity of the targeted control.
		/// </summary>

		ESRI.ADF.System.setOpacity(this._parentDiv, opacity);
	},

	_showTargetControl : function(boolVal)
	{
		/// <summary>
		/// Show or hide the target control.
		/// </summary>

		// If the thumbnail properties have not been properly configured then changing visibility of
		// various elements serves no purpose.
		if (this._isThumbable)
		{
			// If the target control is pinned then ignore a request to hide it.
			if (!boolVal && this._isPinned)
			{
				return;
			}
			// Set visibility of the target control and the pinned control together.
			this._ctlObject.style.visibility = boolVal ? "visible" : "hidden";
			if (this._isPinnable)
			{
				this._pinImgObject.style.visibility = boolVal ? "visible" : "hidden";
			}

			// Toggle setting so the opposite applies to the thumbnail control, assign visibility.
			boolVal = !boolVal;
			this._thumbImgObject.style.visibility = boolVal ? "visible" : "hidden";
		}
	},

	_doMouseOver : function (e)
	{
		/// <summary>
		/// Handle mouse over events.
		/// </summary>

		this._setOpacity(this._mouseOverOpacity);
		this._showTargetControl(true);
	},

	_doMouseOut : function (e)
	{
		/// <summary>
		/// Handle mouse out events.
		/// </summary>

		this._setOpacity(this._mouseOutOpacity);
		this._showTargetControl(false);
	},

	_doClick : function (e)
	{
		/// <summary>
		/// Handle mouse click events.
		/// </summary>

		// Toggle the pinned state
		this.setPinned(!this._isPinned);
	},

	setPinned : function(boolVal)
	{
		/// <summary>
		/// Set the isPinned state, displaying the control if necessary.
		/// </summary>

		if (this._isPinnable)
		{
			// Set the pinned state to the desired value and assign proper pinned image
			this._isPinned = boolVal;
			this._pinImgObject.src = this._getPinnedImage();

			// If setting the state to pinned, ensure the control is visible and the thumbnail is not
			// shown. This public method may be called programmatically to make this necessary.
			if (this._isPinned)
			{
				this._showTargetControl(true);
			}
		}
	},

	//
	// Properties
	//

	get_mouseOverOpacity : function() {
		/// <value type="Numeric">
		/// Opactiy to use when the mouse is hovering over the DIV.
		/// </value>
		return this._mouseOverOpacity;
	},

	set_mouseOverOpacity : function(value) {
		if (this._mouseOverOpacity != value) {
			this._mouseOverOpacity = value;
			this.raisePropertyChanged('mouseOverOpacity');
		}
	},

	get_mouseOutOpacity : function() {
		/// <value type="Numeric">
		/// Opactiy to use when the mouse is not hovering over the DIV.
		/// </value>
		return this._mouseOutOpacity;
	},

	set_mouseOutOpacity : function(value) {
		if (this._mouseOutOpacity != value) {
			this._mouseOutOpacity = value;
			this.raisePropertyChanged('mouseOutOpacity');
		}
	},

	get_thumbnailImageUrl : function() {
		/// <value type="String">
		/// Image URL to use for thumbnail.
		/// </value>
		return this._thumbnailImageUrl;
	},

	set_thumbnailImageUrl : function(value) {
		if (this._thumbnailImageUrl != value) {
			this._thumbnailImageUrl = value;
			this._isThumbable = this._thumbnailImageUrl === "" ? false : true;
			this.raisePropertyChanged('thumbnailImageUrl');
		}
	},

	get_thumbnailImageAlignment : function() {
		/// <value type="ESRI.ADF.System.ContentAlignment" integer="true">
		/// Alignment for thumbnail image. Default is TopLeft.
		/// </value>
		return this._thumbnailImageAlignment;
	},

	set_thumbnailImageAlignment : function(value) {
		if (this._thumbnailImageAlignment != value) {
			this._thumbnailImageAlignment = value;
			this.raisePropertyChanged('thumbnailImageAlignment');
		}
	},

	get_pinnedImageUrl : function() {
		/// <value type="String">
		/// URL for pinned image.
		/// </value>
		return this._pinnedImageUrl;
	},

	set_pinnedImageUrl : function(value) {
		if (this._pinnedImageUrl != value) {
			this._pinnedImageUrl = value;
			this._setPinnable();
			this.raisePropertyChanged('pinnedImageUrl');
		}
	},

	get_unpinnedImageUrl : function() {
		/// <value type="String">
		/// URL for unpinned image.
		/// </value>
		return this._unpinnedImageUrl;
	},

	set_unpinnedImageUrl : function(value) {
		if (this._unpinnedImageUrl != value) {
			this._unpinnedImageUrl = value;
			this._setPinnable();
			this.raisePropertyChanged('unpinnedImageUrl');
		}
	},

	get_pinned : function() {
		/// <value type="Boolean">
		/// Initial pinned state.
		/// </value>
		return this._pinned;
	},

	set_pinned : function(value) {
		if (this._pinned != value) {
			this._pinned = value;
			this.raisePropertyChanged('pinned');
		}
	}
};

ESRI.ADF.Extenders.HoverExpand.registerClass('ESRI.ADF.Extenders.HoverExpand', AjaxControlToolkit.BehaviorBase);

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }