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

// ESRI.ADF.UI.Navigation
// ESRI.ADF.UI.OverviewMap
// ESRI.ADF.UI.ZoomLevel
// ESRI.ADF.UI.Magnifier

// Register the namespace for the control.
Type.registerNamespace('ESRI.ADF.UI');

ESRI.ADF.UI.Navigation = function(element) { 
	/// <summary>
	/// Navigation is a control for panning a map control.
	/// </summary>
	ESRI.ADF.UI.Navigation.initializeBase(this, [element]);
	this._intervalRate = 25;		// Number of milliseconds between intervals
	this._moveX = 0;
	this._moveY = 0;
	this._speed = 3;
	this._interval = null;
	this._map = null;
	this._mouseUpHandler = null;
	this._mouseMoveHandler = null;
	this._panning = false;
};

ESRI.ADF.UI.Navigation.prototype = {

	initialize : function() {
		/// <summary>
		/// Initialize the parent along with any child controls that have not yet been initialized 
		/// </summary>
		/// <returns />
		ESRI.ADF.UI.Navigation.callBaseMethod(this, 'initialize');
		
		// Get element representing this control so it can be used in the code below
		var nav = this.get_element();

		// Make dragging work properly on Mozilla
		nav.style["-moz-user-focus"]='normal';

		// If no buddy map has been associated with this control, hide this control
		if (this._map === null)
		{
			nav.style.display = "none";
			nav.style.visibility = "hidden";
		}
		else
		{
			// Create event handler references for the mouse events that are handled once panning
			// starts. These are also then used when those events are no longer handled.
			this._mouseUpHandler = Function.createDelegate(this, this._doMouseUp);
			this._mouseMoveHandler = Function.createDelegate(this, this._doMouseMove);

			// Listen for the mouse down event
			$addHandler(this.get_element(), 'mousedown', Function.createDelegate(this, this._doMouseDown));
		}
	},

	dispose : function() {
		/// <summary>
		/// Dispose the control
		/// </summary>
		/// <returns />
		$clearHandlers(this.get_element());
		ESRI.ADF.UI.Navigation.callBaseMethod(this, 'dispose');
	},

	_doMouseDown : function (e)
	{
		/// <summary>
		/// Handle the mouse down event which begins the panning mechanism.
		/// </summary>

		if (e.button == Sys.UI.MouseButton.leftButton)
		{
			if (this._panning === false)
			{
				this._panning = true;

				// Determine which of the 8 directions is selected then use that to request the map to pan
				this._calculatePanDirection (e);
				this._panMap ();

				// Add handlers to handle when the panning should stop and when dragging occurs        
				$addHandler(this.get_element(), 'mouseup', this._mouseUpHandler);
				$addHandler(this.get_element(), 'mousemove', this._mouseMoveHandler);
				$addHandler(document, 'mouseup', this._mouseUpHandler);
				$addHandler(document, 'mousemove', this._mouseMoveHandler);

				// Invoke the panMap method every interval to cause a smooth panning effect. This is canceled
				// when the mouseUpHandler is executed as a result of a mouse up or mouse out event.
				this._interval = window.setInterval(Function.createDelegate(this, this._panMap), this._intervalRate);
			}
		}
		else
		{
			if (this._panning === true)
			{
				this._stopPanning();
			}
		}
	},

	_doMouseMove : function (e)
	{
		/// <summary>
		/// Handle the mouse move event which determines the new direction to pan and pans the map.
		/// </summary>

		if (this._panning === true)
		{
			// Determine which of the 8 directions is selected and update fields so panning will reflect this
			// new direction.
			this._calculatePanDirection (e);

			// Do not perform the default action and do not propagate this so that the cursor will not
			// become a circle with a line through it during the dragging of the mouse while panning.
			e.preventDefault();
			e.stopPropagation();
		}
	},

	_doMouseUp : function (e)
	{
		/// <summary>
		/// Handle the mouse up event which ends the panning mechanism.
		/// </summary>

		if (this._panning === true)
		{
			this._stopPanning();
		}
	},

	_stopPanning : function ()
	{
		this._panning = false;

		// Cancel interval that is causing constant panning
		window.clearInterval (this._interval);

		// Remove handlers assigned when panning started with the mouse down event
		$removeHandler(this.get_element(), 'mouseup', this._mouseUpHandler);
		$removeHandler(this.get_element(), 'mousemove', this._mouseMoveHandler);
		$removeHandler(document, 'mouseup', this._mouseUpHandler);
		$removeHandler(document, 'mousemove', this._mouseMoveHandler);

		// Tell map that we are done panning. It is critical that this be done AFTER the event handlers
		// have been removed (above) because this causes an extent change event to be fired by the map
		// control which can cause this handler to execute twice and an exception will be thrown when it
		// cannot remove the handler a second time.
		this._map._doContinuousPan(0, 0);
	},

	_calculatePanDirection : function (e)
	{
		/// <summary>
		/// Determine which of 8 directions to pan the map. The result of this calculation is the assignment
		/// of the moveX and moveY fields which are then used in the panMap method and multiplied by the speed.
		/// </summary>

		// Convert event argument offset coordinates to be relative to the control itself. Since events
		// can come from the control itself or the document, this transformation must be done so the
		// subsequent calculation will remain consistent.
		var bounds = Sys.UI.DomElement.getBounds (this.get_element());
		var location = Sys.UI.DomElement.getLocation (this.get_element());
		e = ESRI.ADF.System._makeMouseEventRelativeToElement(e,this.get_element(),location);		

		// Determine which quadrant the mouse is in
		var centerX = Math.round (bounds.width / 2);
		var centerY = Math.round (bounds.height / 2);
		var shiftX = e.offsetX - centerX;
		var shiftY = e.offsetY - centerY;
		var shift = (shiftX / shiftY);

		// Reset fields since these may contain values assigned from a previous call. These "results" must
		// be stored in a "static" mechanism like this so that when the interval event occurs, the panMap
		// method will know which direction was last panned and keep using the same direction.
		this._moveX = 0;
		this._moveY = 0;

		if (shift === 0)
		{
			if (shiftY > 0)
			{
				this._moveY = 1;
			}
			else //if (shiftY < 0)
			{
				this._moveY = -1;
			}
		}
		else if (shiftX < 0)
		{
			if (shift >= 0 && shift <= 0.5)
			{
				this._moveY = -1;
			}
			else if (shift > 0.5 && shift <= 1.5)
			{
				this._moveX = -1;
				this._moveY = -1;
			}
			else if (shift > 1.5 || shift <= -1.5)
			{
				this._moveX = -1;
			}
			else if (shift > -1.5 && shift <= -0.5)
			{
				this._moveX = -1;
				this._moveY = 1;
			}
			else
			{
				this._moveY = 1;
			}
		}
		else {
			if (shift >= 0 && shift <= 0.5)
			{
				this._moveY = 1;
			}
			else if (shift > 0.5 && shift <= 1.5)
			{
				this._moveX = 1;
				this._moveY = 1;
			}
			else if (shift > 1.5 || shift <= -1.5)
			{
				this._moveX = 1;
			}
			else if (shift > -1.5 && shift <= -0.5)
			{
				this._moveX = 1;
				this._moveY = -1;
			}
			else
			{
				this._moveY = -1;
			}
		} 
	},

	_panMap : function ()
	{
		/// <summary>
		/// Pan the buddy map control using the moveX and moveY fields of this class.
		/// </summary>
		if (this._moveX !== 0 || this._moveY !== 0)
		{
			this._map._doContinuousPan (this._moveX * this._speed, this._moveY * this._speed);
		}
	},

	get_map : function ()
	{
		/// <field type="ESRI.ADF.UI.Map" mayBeNull="false">
		/// Obtains the map control to which the navigation is a buddy.
		/// </field>
		return this._map;
	},

	set_map : function(value)
	{
		if (this._map != value) {
			this._map = value;
			this.raisePropertyChanged('map');
		}
	},

	get_speed : function ()
	{
		/// <value type="Number">
		/// Obtains the speed that panning should use. This is the number of pixels to pan with each panning
		/// event.
		/// </value>
		return this._speed;
	},

	set_speed : function (value)
	{
		if (this._speed != value) {
			this._speed = value;
			this.raisePropertyChanged('speed');
		}
	}
};

ESRI.ADF.UI.Navigation.registerClass('ESRI.ADF.UI.Navigation', Sys.UI.Control);

//
// Overview Map
//

ESRI.ADF.UI.OverviewMap = function(element) { 
	/// <summary>
	/// OverviewMap is a control for panning a map control and displaying an overview of the
	/// current extent.
	/// </summary>
	ESRI.ADF.UI.OverviewMap.initializeBase(this, [element]);
	this._map = null;
	this._width = 0;
	this._height = 0;
	this._boxLeft = 0;
	this._boxTop = 0;
	this._boxWidth = 0;
	this._boxHeight = 0;
	this._imageURL = "";
	this._blankURL = "";
	this._tooltip = "";
	this._boxColor = "Red";
	this._lineWidth = 3;
	this._lineType = "solid";
	this._aoiResizable = true;
	this._aoiDraggable = true;
	this._aoiMinWidth = 15;
	this._aoiMinHeight = 15;
	this._panMouseUpHandler = null;
	this._panMouseMoveHandler = null;
	this._resizeMouseUpHandler = null;
	this._resizeMouseMoveHandler = null;
	this._mouseDownOriginX = 0;
	this._mouseDownOriginY = 0;
	this._mousePanX = 0;
	this._mousePanY = 0;
	this._resizeWidth = 0;
	this._resizeHeight = 0;
	this._resizeOriginX = 0;
	this._resizeOriginY = 0;
	this._enabled = false;
};

ESRI.ADF.UI.OverviewMap.prototype = {

	initialize : function() {
		/// <summary>
		/// Initialize the parent along with any child controls that have not yet been initialized.
		/// </summary>

		ESRI.ADF.UI.OverviewMap.callBaseMethod(this, 'initialize');
		
		// Get element representing this control so it can be used in the code below
		var ovm = this.get_element();

		// If no buddy map has been associated with this control, hide this control
		if (this._map === null)
		{
			ovm.style.display = "none";
			ovm.style.visibility = "hidden";
		}
		else
		{
			// To indicate that event handlers are established so they can be removed
			this._enabled = true;

			this._right = this._width;
			this._bottom = this._height;
			this._boxRight = this._boxLeft + this._boxWidth;
			this._boxBottom = this._boxTop + this._boxHeight;
			this._aoiResizable = Boolean(this._aoiResizable);
			this._aoiDraggable = Boolean(this._aoiDraggable);

			this._divId = "OVDiv_" + this.get_id();
			this._imageId = "OVImage_" + this.get_id();
			this._boxDivId = "OVBoxDiv_" + this.get_id();
			this._boxImageId = "OVBoxImage_" + this.get_id();
			this._boxResizeDivId = "OVBoxResizeDiv_" + this.get_id();

			this._boxDivObject = null;
			this._imageObject = null;
			this._boxResizeObject = null;

			this._dragOVBox = false;
			this._dragOVResizeBox = false;

			this._mapXRatio = 1;
			this._mapYRatio = 1;
			this._mapXYRatio = 1;

			this._ovPanStartLeft = 0;
			this._ovPanStartTop = 0;

			// Create UI representation
			this._createDivs (ovm);
		}
	},

	dispose : function() {
		/// <summary>
		/// Dispose the control.
		/// </summary>

		$clearHandlers(this._element);
		ESRI.ADF.UI.OverviewMap.callBaseMethod(this, 'dispose');
	},

	_createDivs : function (ovm)
	{
		/// <summary>
		/// Create DIV elements to represent the control.
		/// </summary>

		// keep displayed aoi box within display area
		var leftAdjust = 0;
		var topAdjust = 0;
		if (this._boxLeft<0) {
			leftAdjust = this._boxLeft; 
			this._boxLeft = 0;
		}
		if (this._boxTop<0) {
			topAdjust = this._boxTop; 
			this._boxTop = 0;
		}
		if (this._boxLeft + this._boxWidth+(this._lineWidth*2)>=this._width)
		{
			this._boxWidth = this._width - this._boxLeft-(this._lineWidth*2) + leftAdjust;
		}
		if (this._boxTop + this._boxHeight+(this._lineWidth*2)>=this._height)
		{
			this._boxHeight = this._height - this._boxTop-(this._lineWidth*2) + topAdjust; 
		}

		// Control DIV 
		var s = "";
		s += '<div id="OVControlDiv_' + this.get_id() + '" style="position: relative; background-color: White; width: ' + this._width + 'px; height: ' + this._height + 'px; overflow:hidden;">\n';	

		// Map Image DIV
		s += '<div id="' + this._divId + '" style="position: absolute; left: 0px; top: 0px; background-color: White; width: ' + this._width + 'px; height: ' + this._height + 'px; overflow:hidden;">\n';
		s += '<img id="' + this._imageId + '" alt="' + this._tooltip + '"  title="' + this._tooltip + '" src="' + this._imageURL + '" width="' + this._width + '" height="' + this._height + '" hspace="0" vspace="0" border="0" />\n';
		s += '</div>\n';

		// Box DIV
		var style = "border: " + this._lineWidth + "px " + this._lineType + " " + this._boxColor + ";";
		s += '<div id="' + this._boxDivId + '" style="position: absolute; left: ' + this._boxLeft + 'px; top: ' + this._boxTop + 'px;' + style + ' width: ' + this._boxWidth + 'px; height: ' + this._boxHeight + 'px; overflow:hidden; ">\n';
		s += '<img id="' + this._boxImageId + '" alt="' + this._tooltip + '"  title="' + this._tooltip + '" src="' + this._blankURL + '" width="100%" height="100%" hspace="0" vspace="0" border="0">\n';

		// Add "glass" layer above control to prevent drag issues on Firefox
		if (Sys.Browser.agent == Sys.Browser.Firefox)
		{
			s += '<div style=\"width: 100%; height: 100%; left: 0; top: 0; position: absolute\"></div>';
		}

		s += '</div>\n';

		// Resize DIV
		if (this._aoiResizable)
		{
			s += '<div id="' + this._boxResizeDivId + '" style="position: absolute; left: ' + (this._boxLeft + this._boxWidth - 5) + '; top: ' + (this._boxTop + this._boxHeight - 5) + '; cursor: nw-resize; width: 10px; height: 10px; overflow:hidden;">\n';
			s += '<img  alt="Resize AOI"  title="Resize AOI" src="' + this._blankURL + '" width="10" height="10" hspace="0" vspace="0" border="0" >\n';

			// Add "glass" layer above control to prevent drag issues on Firefox
			if (Sys.Browser.agent == Sys.Browser.Firefox)
			{
				s += '<div style=\"width: 100%; height: 100%; left: 0; top: 0; position: absolute\"></div>';
			}

			s += '</div>\n';
		}

		s += '</div>\n';

		ovm.innerHTML = s;

		this._setObjects();
		this._setEvents();
		this._updateMapRatio();
	},

	_setObjects : function ()
	{
		/// <summary>
		/// Create objects for each DIV so they can be manipulated quickly.
		/// </summary>

		this._divObject = $get(this._divId);
		this._boxDivObject = $get(this._boxDivId);
		this._imageObject = $get(this._imageId);
		
		if (this._aoiResizable)
		{
			this._boxResizeObject = $get(this._boxResizeDivId);
		}
	},

	_setEvents : function ()
	{
		/// <summary>
		/// Create event handlers and assign to UI elements
		/// </summary>

		// Setup cursors and mouse event handler
		if (this._aoiDraggable)
		{
			// Create event handler references for the mouse events that are handled once panning
			// starts. These are also then used when those events are no longer handled.
			this._panMouseUpHandler = Function.createDelegate(this, this._doPanMouseUp);
			this._panMouseMoveHandler = Function.createDelegate(this, this._doPanMouseMove);

			this._boxDivObject.style.cursor = "move";
			this._divObject.style.cursor = "default";
			$addHandler(this._boxDivObject, 'mousedown', Function.createDelegate(this, this._doPanMouseDown));
		}
		// Listen for the mouse down event on resize div
		if (this._aoiResizable)
		{ 
			// Create event handler references for the mouse events that are handled once resizing the AOI box
			// starts. These are also then used when those events are no longer handled.
			this._resizeMouseUpHandler = Function.createDelegate(this, this._doResizeMouseUp);
			this._resizeMouseMoveHandler = Function.createDelegate(this, this._doResizeMouseMove);

			$addHandler(this._boxResizeObject, 'mousedown', Function.createDelegate(this, this._doResizeMouseDown));
		}
	},

	_updateMapRatio : function ()
	{
		/// <summary>
		/// Update map ratio fields which are used to enforce resize AOI
		/// </summary>

		var bounds = Sys.UI.DomElement.getBounds (this._map.get_element());
		var mapWidth = bounds.width;
		var mapHeight = bounds.height;

		this._mapXRatio = mapWidth / this._boxWidth;
		this._mapYRatio = mapHeight / this._boxHeight;
		this._mapXYRatio = mapWidth / mapHeight;

		// Determine maximum X/Y values, using ratio, so AOI resize does not exceed the dimensions
		// of the control itself
		if (this._mapXYRatio > 1)
		{
			this._maxBoxWidth = this._width;
			this._maxBoxHeight = this._width / this._mapXYRatio;
		}
		else
		{
			this._maxBoxWidth = this._height * this._mapXYRatio;
			this._maxBoxHeight = this._height;
		}
		this._maxBoxWidth = Math.min(this._width, this._maxBoxWidth);
		this._maxBoxHeight = Math.min(this._height, this._maxBoxHeight);
	 },
	 
	_doPanMouseDown : function (e)
	{
		/// <summary>
		/// This is invoked when the AOI box is dragged. It will add handlers for other necessary mouse
		/// events to handle dragging and when the drag ends (mouse up).
		/// </summary>

		if (e.button == Sys.UI.MouseButton.leftButton)
		{
			if (!this._dragOVBox)
			{
				// Enter drag mode
				this._dragOVBox = true;

				// Establish coordinates
				this._ovPanStartLeft = this._boxDivObject.offsetLeft;
				this._ovPanStartTop = this._boxDivObject.offsetTop;

				// Remember current location to later determine how far the mouse has been dragged
				this._mouseDownOriginX = this._mousePanX = e.clientX;
				this._mouseDownOriginY = this._mousePanY = e.clientY;

				// Add handlers to handle when the panning should stop and when dragging occurs        
				$addHandler(this.get_element(), 'mouseup', this._panMouseUpHandler);
				$addHandler(this.get_element(), 'mousemove', this._panMouseMoveHandler);
				
				// Do not perform the default action and do not propagate this so that the cursor will not
			    // become a circle with a line through it during the dragging of the mouse while panning.
			    e.preventDefault();
			    e.stopPropagation();
			}
		}
	},

	_doPanMouseMove : function (e)
	{
		/// <summary>
		/// This is invoked when the AOI box is dragged. It will detect the difference between the initial
		/// mouse location and the current location to pan the overview map and associated map controls.
		/// </summary>

		// Execute this code only if we are in drag mode
		if (this._dragOVBox)
		{
			// Move overview map divs
			var ex = this._ovPanStartLeft + (e.clientX - this._mouseDownOriginX);
			var ey = this._ovPanStartTop + (e.clientY - this._mouseDownOriginY);
			this._boxDivObject.style.left = ex + "px";
			this._boxDivObject.style.top = ey + "px";

			// If the AOI is resizable, then move it in relation to its parent
			if (this._aoiResizable)
			{
				this._boxResizeObject.style.left = (ex + this._boxWidth - 5) + "px";
				this._boxResizeObject.style.top = (ey + this._boxHeight - 5) + "px";
			}
			
			// Pan the map by moving it the number of pixels difference between the mouse location the
			// last time we panned the map and the current mouse location
			var nx = Math.round((e.clientX - this._mousePanX) * this._mapXRatio);
			var ny = Math.round((e.clientY - this._mousePanY) * this._mapYRatio);

			// Only pan the map if it is necessary to do so. Invoking this method with both values being
			// zero will cause it to make a postback (if necessary) to refresh the map and we don't want
			// to do that until dragging/panning is done via the mouse up event.
			if (nx !== 0 || ny !== 0)
			{
				this._map._doContinuousPan (nx, ny);
			}

			// Reset origin since we are only interested in panning the map the number of pixels
			// the mouse has moved since the last time we panned the map (not since the original
			// sample was taken during the mouse down event).
			this._mousePanX = e.clientX;
			this._mousePanY = e.clientY;

			// Do not perform the default action and do not propagate this so that the cursor will not
			// become a circle with a line through it during the dragging of the mouse while panning.
			e.preventDefault();
			e.stopPropagation();
		}
	},

	_doPanMouseUp : function (e)
	{
		/// <summary>
		/// This is invoked when the AOI box is no longer dragged. It will exit drag mode, tell the map to 
		/// update itself as needed and remove mouse handlers.
		/// </summary>

		// Exit the dragging mode
		this._dragOVBox = false;

		// Remove handlers assigned when panning started with the mouse down event
		$removeHandler(this.get_element(), 'mouseup', this._panMouseUpHandler);
		$removeHandler(this.get_element(), 'mousemove', this._panMouseMoveHandler);

		// Tell map that we are done panning
		this._map._doContinuousPan (0, 0);
	},

	_doResizeMouseDown : function (e)
	{
		/// <summary>
		/// This is invoked when the AOI box is resized. It will add handlers for other necessary mouse
		/// events to handle resizing and when the resize ends (mouse up).
		/// </summary>

		if (e.button == Sys.UI.MouseButton.leftButton)
		{
			if (!this._dragOVResizeBox)
			{
				// Enter drag mode
				this._dragOVResizeBox = true;

				// Store control center using "client" XY coordinates
				var bounds;
				bounds = Sys.UI.DomElement.getBounds (this.get_element());
				this._resizeOriginX = bounds.x + (bounds.width / 2);
				this._resizeOriginY = bounds.y + (bounds.height / 2);

				// Remember current dimensions of box
				bounds = Sys.UI.DomElement.getBounds (this._boxDivObject);
				this._resizeWidth = bounds.width - (this._lineWidth * 2);
				this._resizeHeight = bounds.height - (this._lineWidth * 2);

				// Add handlers to handle when the resizing should stop and when dragging occurs
				$addHandler(this.get_element(), 'mouseup', this._resizeMouseUpHandler);
				$addHandler(this.get_element(), 'mousemove', this._resizeMouseMoveHandler);
				
				// Do not perform the default action and do not propagate this so that the cursor will not
			    // become a circle with a line through it during the dragging of the mouse while panning.
			    e.preventDefault();
			    e.stopPropagation();
			}
		}
	},

	_doResizeMouseMove : function (e)
	{
		/// <summary>
		/// Handle mouse movement while resizing AOI
		/// </summary>

		// Execute this code only if we are in drag mode
		if (this._dragOVResizeBox)
		{
			var normalWidth = 0;
			var normalHeight = 0;

			// Determine the number of pixels in each direction (X and Y) that the mouse is from
			// the center of the control
			var deltaX = Math.abs(e.clientX - this._resizeOriginX);
			var deltaY = Math.abs(e.clientY - this._resizeOriginY);

			// If the distance in the X direction is greater than distance in the Y direction (taking
			// into consideration the ratio factor) then X determines the rectange, else Y determines
			if (deltaX > (deltaY * this._mapXYRatio))
			{
				normalWidth = deltaX * 2;

				// Make sure width is not too small or too large
				if (normalWidth < this._aoiMinWidth)
				{
					normalWidth = this._aoiMinWidth;
				}
				else if (normalWidth > this._maxBoxWidth)
				{
					normalWidth = this._maxBoxWidth;
				}

				// Height determined by width and ratio between them
				normalHeight = normalWidth / this._mapXYRatio;
			}
			else
			{
				normalHeight = deltaY * 2;

				// Make sure height is not too small or too large
				if (normalHeight < this._aoiMinHeight)
				{
					normalHeight = this._aoiMinHeight;
				}
				else if (normalHeight > this._maxBoxHeight)
				{
					normalHeight = this._maxBoxHeight;
				}

				// Width determined by height and ratio between them
				normalWidth = normalHeight * this._mapXYRatio;
			}

			// Resize DIV object to redraw rectangle based upon updated mouse coordinates
			this._boxDivObject.style.width = (normalWidth - (this._lineWidth * 2)) + "px";
			this._boxDivObject.style.height = (normalHeight - (this._lineWidth * 2)) + "px";
			this._boxDivObject.style.left = ((this._width - normalWidth) / 2) + "px";
			this._boxDivObject.style.top = ((this._height - normalHeight) / 2) + "px";

			this._boxWidth = normalWidth;
			this._boxHeight = normalHeight;

			// Do not perform the default action and do not propagate this so that the cursor will not
			// become a circle with a line through it during the dragging of the mouse while moving.
			e.preventDefault();
			e.stopPropagation();
		}
	},

	_doResizeMouseUp : function (e)
	{
		/// <summary>
		/// Handle mouse up event to end resizing of the AOI
		/// </summary>

		// Exit the dragging mode
		this._dragOVResizeBox = false;

		// Remove handlers assigned when panning started with the mouse down event
		$removeHandler(this.get_element(), 'mouseup', this._resizeMouseUpHandler);
		$removeHandler(this.get_element(), 'mousemove', this._resizeMouseMoveHandler);
		
		// If zooming does not cause a zoom or pan to occur, then we must reset the AOI to its original
		// dimensions
		if (!this._map.zoom(this._resizeWidth / this._boxWidth))
		{
			this._boxDivObject.style.width = this._resizeWidth + "px";
			this._boxDivObject.style.height = this._resizeHeight + "px";
			this._boxDivObject.style.left = ((this._width - this._resizeWidth) / 2) + "px";
			this._boxDivObject.style.top = ((this._height - this._resizeHeight) / 2) + "px";
		}
	},

	_updateAOI : function (boxLeft, boxTop, boxWidth, boxHeight)
	{
		/// <summary>
		/// Process AOI updated values and update corresponding UI elements
		/// </summary>

		this._boxLeft = boxLeft;
		this._boxTop = boxTop;
		this._boxWidth = boxWidth;
		this._boxHeight = boxHeight;
		this._boxRight = boxLeft + boxWidth;
		this._boxBottom = boxTop + boxHeight;
		if(!this.get_isInitialized()) { return; }		
		this._boxDivObject.style.left = boxLeft + "px";
		this._boxDivObject.style.top = boxTop + "px";
		this._boxDivObject.style.width = boxWidth + "px";
		this._boxDivObject.style.height = boxHeight + "px";

		if (this._aoiResizable)
		{
			this._boxResizeObject.style.left = (boxLeft + boxWidth - 5) + "px";
			this._boxResizeObject.style.top = (boxTop + boxHeight - 5) + "px";
		}

		this._updateMapRatio();
	},

	processCallbackResult : function(action, params)
	{
		/// <summary>
		/// Process callback results to update the overview map image and AOI rectangle
		/// </summary>
		if (action=='aoiextent')
		{
			// Process AOI rectangle
			this._updateAOI (params[0], params[1], params[2], params[3]);

			// If an image URL is present in the response parameters, update the image
			if (params[4])
			{
				if(!this._imageObject.src.endsWith(params[4])) {
					this._imageObject.src = params[4];
				}
			}
		}
	},

	show : function()
	{
		/// <summary>
		/// Sets the visibility of the OverviewMap to be visible. 
		/// </summary>
		var ovm = this.get_element();
		if (ovm)
		{
			ovm.style.visibility = 'visible';
		}
	},

	hide : function()
	{
		/// <summary>
		/// Sets the visibility of the OverviewMap to be hidden. 
		/// </summary>
		var ovm = this.get_element();
		if (ovm)
		{
			ovm.style.visibility = 'hidden';
		}
	},

	isVisible : function()
	{
		/// <summary>
		/// Returns whether the OverviewMap is currently visible or not.
		/// </summary>
		var ovm = this.get_element();
		return ovm && ovm.style.visibility != 'hidden';
	},

	//
	// Properties
	//

	get_map : function ()
	{
		/// <field type="ESRI.ADF.UI.Map" mayBeNull="false">
		/// Obtains the map control to which the OverviewMap is a buddy.
		/// </field>
		return this._map;
	},

	set_map : function(value)
	{
		if (this._map != value) {
			this._map = value;
			this.raisePropertyChanged('map');
		}
	},

	get_width : function ()
	{
		/// <field type="Number" integer="true">
		/// The width of the control.
		/// </field>
		return this._width;
	},

	set_width : function(value)
	{
		if (this._width != value) {
			this._width = value;
			this.raisePropertyChanged('width');
		}
	},

	get_height : function ()
	{
		/// <field type="Number" integer="true">
		/// The height of the control.
		/// </field>
		return this._height;
	},

	set_height : function(value)
	{
		if (this._height != value) {
			this._height = value;
			this.raisePropertyChanged('height');
		}
	},

	get_boxLeft : function ()
	{
		/// <field type="Number" integer="true">
		/// The left coordinate of the AOI box.
		/// </field>
		return this._boxLeft;
	},

	set_boxLeft : function(value)
	{
		if (this._boxLeft != value) {
			this._boxLeft = value;
			this.raisePropertyChanged('boxLeft');
		}
	},

	get_boxTop : function ()
	{
		/// <field type="Number" integer="true">
		/// The top coordinate of the AOI box.
		/// </field>
		return this._boxTop;
	},

	set_boxTop : function(value)
	{
		if (this._boxTop != value) {
			this._boxTop = value;
			this.raisePropertyChanged('boxTop');
		}
	},

	get_boxWidth : function ()
	{
		/// <field type="Number" integer="true">
		/// The width of the AOI box.
		/// </field>
		return this._boxWidth;
	},

	set_boxWidth : function(value)
	{
		if (this._boxWidth != value) {
			this._boxWidth = value;
			this.raisePropertyChanged('boxWidth');
		}
	},

	get_boxHeight : function ()
	{
		/// <field type="Number" integer="true">
		/// The height of the AOI box.
		/// </field>
		return this._boxHeight;
	},

	set_boxHeight : function(value)
	{
		if (this._boxHeight != value) {
			this._boxHeight = value;
			this.raisePropertyChanged('boxHeight');
		}
	},

	get_imageURL : function ()
	{
		/// <field type="String" mayBeNull="false">
		/// The image URL of the map to display in the control.
		/// </field>
		return this._imageURL;
	},

	set_imageURL : function(value)
	{
		if (this._imageURL != value) {
			this._imageURL = value;
			this.raisePropertyChanged('imageURL');
		}
	},

	get_blankURL : function ()
	{
		/// <field type="String" mayBeNull="false">
		/// The image URL of the blank image to display in the control.
		/// </field>
		return this._blankURL;
	},

	set_blankURL : function(value)
	{
		if (this._blankURL != value) {
			this._blankURL = value;
			this.raisePropertyChanged('blankURL');
		}
	},

	get_tooltip : function ()
	{
		/// <field type="String" mayBeNull="false">
		/// The tooltip text to display in the control.
		/// </field>
		return this._tooltip;
	},

	set_tooltip : function(value)
	{
		if (this._tooltip != value) {
			this._tooltip = value;
			this.raisePropertyChanged('tooltip');
		}
	},

	get_boxColor : function ()
	{
		/// <field type="String" mayBeNull="false">
		/// The color for the AOI box.
		/// </field>
		return this._boxColor;
	},

	set_boxColor : function(value)
	{
		if (this._boxColor != value) {
			this._boxColor = value;
			this.raisePropertyChanged('boxColor');
		}
	},

	get_lineWidth : function ()
	{
		/// <field type="Number" integer="true">
		/// The line width for the AOI box.
		/// </field>
		return this._lineWidth;
	},

	set_lineWidth : function(value)
	{
		if (this._lineWidth != value) {
			this._lineWidth = value;
			this.raisePropertyChanged('lineWidth');
		}
	},

	get_lineType : function ()
	{
		/// <field type="String" mayBeNull="false">
		/// The line width for the AOI box.
		/// </field>
		return this._lineType;
	},

	set_lineType : function(value)
	{
		if (this._lineType != value) {
			this._lineType = value;
			this.raisePropertyChanged('lineType');
		}
	},

	get_aoiResizable : function ()
	{
		/// <field type="Boolean" mayBeNull="false">
		/// Whether or not the AOI box is resizable.
		/// </field>
		return this._aoiResizable;
	},

	set_aoiResizable : function(value)
	{
		if (this._aoiResizable != value) {
			this._aoiResizable = value;
			this.raisePropertyChanged('aoiResizable');
		}
	},

	get_aoiDraggable : function ()
	{
		/// <field type="Boolean" mayBeNull="false">
		/// Whether or not the AOI box is draggable.
		/// </field>
		return this._aoiDraggable;
	},

	set_aoiDraggable : function(value)
	{
		if (this._aoiDraggable != value) {
			this._aoiDraggable = value;
			this.raisePropertyChanged('aoiDraggable');
		}
	},

	get_aoiMinWidth : function ()
	{
		/// <field type="Integer" mayBeNull="false">
		/// The minimum width of the aoi box.
		/// </field>
		return this._aoiMinWidth;
	},

	set_aoiMinWidth : function(value)
	{
		if (this._aoiMinWidth != value) {
			this._aoiMinWidth = value;
			this.raisePropertyChanged('aoiMinWidth');
		}
	},

	get_aoiMinHeight : function ()
	{
		/// <field type="Integer" mayBeNull="false">
		/// The minimum height of the aoi box.
		/// </field>
		return this._aoiMinHeight;
	},

	set_aoiMinHeight : function(value)
	{
		if (this._aoiMinHeight != value) {
			this._aoiMinHeight = value;
			this.raisePropertyChanged('aoiMinHeight');
		}
	}
};

ESRI.ADF.UI.OverviewMap.registerClass('ESRI.ADF.UI.OverviewMap', Sys.UI.Control);

//
// ZoomLevel
//

//  This is a DragDropManager that returns always a GenericDragDropManager instance.
ESRI.ADF.UI._ZoomLevelDragDropManagerInternal = function() {
	ESRI.ADF.UI._ZoomLevelDragDropManagerInternal.initializeBase(this);

	this._instance = null;
};

ESRI.ADF.UI._ZoomLevelDragDropManagerInternal.prototype = {
	_getInstance : function() {
		this._instance = new AjaxControlToolkit.GenericDragDropManager();

		this._instance.initialize();
		this._instance.add_dragStart(Function.createDelegate(this, this._raiseDragStart));
		this._instance.add_dragStop(Function.createDelegate(this, this._raiseDragStop));

		return this._instance;
	}
};

ESRI.ADF.UI._ZoomLevelDragDropManagerInternal.registerClass('ESRI.ADF.UI._ZoomLevelDragDropManagerInternal', AjaxControlToolkit._DragDropManager);
ESRI.ADF.UI.ZoomLevelDragDropManagerInternal = new ESRI.ADF.UI._ZoomLevelDragDropManagerInternal();

ESRI.ADF.UI.ZoomLevel = function(element) { 
	/// <summary>
	/// ZoomLevel is a control for changing the scale of a map control.
	/// </summary>

	ESRI.ADF.UI.ZoomLevel.initializeBase(this, [element]);

	this._steps =  0;
	this._level = -1;
	this._orientation = 1;		// Vertical by default, if horizontal then this will be set to -1
	this._dynamicZoomInFactor = 2.0;
	this._dynamicZoomOutFactor = 0.5;
	this._map = null;
	this._imgTop = "";
	this._imgBottom = "";
	this._imgSelected = "";
	this._imgDefault = "";
	this._hasLevels = false;
	this._topElement = null;
	this._bottomElement = null;
	this._railElement = null;
	this._handle = null;
	this._handleImage =  null;
	this._isHorizontal = true;
	this._dragHandle = null;
	this._mouseupHandler = null;
	this._selectstartHandler = null;
	this._selectstartPending = false;
	this._imgHeight = 0;
	this._imgWidth = 0;
};

ESRI.ADF.UI.ZoomLevel.prototype = {

	initialize : function()
	{
		/// <summary>
		/// Initialize the parent along with any child controls that have not yet been initialized themselves.
		/// </summary>

		ESRI.ADF.UI.ZoomLevel.callBaseMethod(this, 'initialize');

		// Store whether or not the map has levels (cached versus dynamic)
		this._hasLevels = (this._map.get_layers().get_levels() !== null);
		if (this._hasLevels)
		{
			// Store the number of levels/steps and assign minimum and maximum values
			this._steps = this._map.get_layers().get_levels().length;
			this._minimum = 0;
			this._maximum = this._steps - 1;

			// Listen for extent changed events from the map control. This is so that if the extent
			// changes, we can update the current zoom level to match the zoom level of the map.
			this._mapExtentChangedHandler = Function.createDelegate(this, this._mapExtentChanged);
			this._map.add_extentChanged(this._mapExtentChangedHandler);
		}

		// Initialize user interface layout
		this._initializeLayout();
	}, 

	dispose : function()
	{
		/// <summary>
		/// Dispose the control.
		/// </summary>

		if (this._hasLevels)
		{
			this._disposeHandlers();
			this._map.remove_extentChanged(this._mapExtentChangedHandler);
		}

		ESRI.ADF.UI.ZoomLevel.callBaseMethod(this, 'dispose');
	},

	_setFloat : function (element, direction)
	{
		/// <summary>
		/// Assign the desired float style value using the browser dependent Javascript style property.
		/// </summary>
		/// <param name="element" type="DomElement">Dom element to apply the float style.</param>
		/// <param name="direction" type="String">Value to assign to the float style.</param>

		if (Sys.Browser.agent == Sys.Browser.Firefox)
		{
			element.style.cssFloat = direction;
		}
		else
		{
			element.style.styleFloat = direction;
		}
	},

	_initializeLayout : function()
	{
		/// <summary>
		/// Initialize the user interface layout. This will dynamically create the necessary DOM elements
		/// that represent the control.
		/// </summary>

		var parentElement = this.get_element();
		this._isHorizontal = (this._orientation == -1); 

		// Create +/- button endpoint
		this._topElement = document.createElement('IMG');
		this._topElement.src = (this._isHorizontal ? this._imgBottom : this._imgTop);
		this._topElement.style.cursor = "pointer";
		if (this._isHorizontal)
		{
			this._setFloat (this._topElement, "left");
		}
		else
		{
			this._topElement.style.verticalAlign = "bottom";
			this._topElement.style.display = "block";
		}
		this._topElement.setAttribute("Alt", "Click to zoom in or out.");
		parentElement.appendChild(this._topElement);

		// Create zoom levels
		if (this._hasLevels)
		{
			// Element for the rail.
			this._railElement = document.createElement('DIV');

			// Layout for the handle.
			this._railElement.innerHTML = '<div></div>';
			this._handle = this._railElement.childNodes[0];
			this._handle.style.overflow = 'hidden';
			this._handle.style.position = 'absolute';
			this._handle.style.height = this._imgHeight + 'px';
			this._handle.style.width = this._imgWidth + 'px';
			this._handle.style.left = '0px';
			this._handle.style.top = '0px';

			// Attach rail element to parent and load handle image
			parentElement.appendChild(this._railElement);

			// Create the handle element
			this._handleImage = document.createElement('IMG');
			this._handleImage.style.position = 'absolute';
			this._handleImage.style.left = '0px';
			this._handleImage.style.top = '0px';
			this._handleImage.src = this._imgSelected;
			this._handleImage.setAttribute("Alt", "Click to zoom in or out.");

			this._handle.appendChild(this._handleImage);

			// Configure rail element using height and width
			if (this._isHorizontal)
			{
				this._railElement.style.backgroundRepeat = "repeat-x";
				this._railElement.style.height = this._imgHeight + "px";
				this._railElement.style.width = (this._steps * this._imgWidth) + "px";
				this._setFloat (this._railElement, "left");
			}
			else
			{
				this._railElement.style.backgroundRepeat = "repeat-y";
				this._railElement.style.width = this._imgWidth + "px";
				this._railElement.style.height = (this._steps * this._imgHeight) + "px";
			}

			this._railElement.style.cursor = "pointer";
			this._railElement.style.position = "relative";
			this._railElement.style.display = "block";
			this._railElement.style.backgroundImage = "url('" + this._imgDefault + "')";
			this._railElement.setAttribute("Alt", "Click to zoom in or out.");

			// When the rail element (DIV) is clicked on Firefox, it gains focus and an outline is
			// drawn to indicate this. This style will prevent the outline so it matches IE appearance.
			this._railElement.style.outline = "none";
		}

		// Create +/- button endpoint
		this._bottomElement = document.createElement('IMG');
		this._bottomElement.src = (this._isHorizontal ? this._imgTop : this._imgBottom);
		this._bottomElement.style.cursor = "pointer";
		if (this._isHorizontal)
		{
			this._setFloat (this._bottomElement, "left");
		}
		else
		{
			this._bottomElement.style.verticalAlign = "top";
		}
		this._bottomElement.setAttribute("Alt", "Click to zoom in or out.");
		parentElement.appendChild(this._bottomElement);

		// Initialize controls
		this._initializeSlider();
	},

	_initializeSlider : function()
	{
		/// <summary>
		/// Initialize the control after the user interface has been created. This will establish event handlers
		/// and the drag and drop elements.
		/// </summary>

		// If the map is cached and has levels, then initialize accordingly
		if (this._hasLevels)
		{
			// Position the slider's handle to the current value
			this._setCurrentLevel();

			// Setup the invisible drag handle          
			this._initializeDragHandle();

			// Register ourselves as a drop target
			ESRI.ADF.UI.ZoomLevelDragDropManagerInternal.registerDropTarget(this);
		}

		// Setup event handlers
		this._initializeHandlers();
	},

	_startDragDrop : function(dragVisual)
	{
		/// <summary>
		/// Tells the DragDropManager to start a drag and drop operation.
		/// </summary>

		this._resetDragHandle();
		ESRI.ADF.UI.ZoomLevelDragDropManagerInternal.startDragDrop(this, dragVisual, null);
	},

	_onMouseDown : function(evt)
	{
		/// <summary>
		/// Handle the mouse down event during a drag and drop operation.
		/// </summary>

		window._event = evt;
		evt.preventDefault();

		if(!ESRI.ADF.UI.ZoomLevel.DropPending) {
			ESRI.ADF.UI.ZoomLevel.DropPending = this;

			$addHandler(document, 'selectstart', this._selectstartHandler);
			this._selectstartPending = true;

			this._startDragDrop(this._dragHandle);
		}
	},

	_onMouseUp : function(evt)
	{
		/// <summary>
		/// Handle the mouse up event during a drag and drop operation.
		/// </summary>

		var srcElement = evt.target;

		if(ESRI.ADF.UI.ZoomLevel.DropPending == this) {
			ESRI.ADF.UI.ZoomLevel.DropPending = null;

			if(this._selectstartPending) {
				this._selectstartPending = false;
				$removeHandler(document, 'selectstart', this._selectstartHandler);
			}
		}
	},

	_DragDropHandler : function(evt)
	{
		/// <summary>
		/// Handle various drag and drop events and prevent default action since this is handled by
		/// the generic drag and drop manager.
		/// </summary>

		evt.preventDefault();
	},

	_onSelectStart : function(evt)
	{
		/// <summary>
		/// Handle the document's select start event during a drag and drop operation.
		/// </summary>

		evt.preventDefault();
	},

	_calcValue : function(mouseOffset)
	{
		/// <summary>
		/// Calculate the value for the rail element based upon the mouse position.
		/// </summary>
		/// <param name="mouseOffset" type="Number" mayBeNull="true">Mouse coordinate along the rail axis.</param>
		/// <returns type="Number" integer="true">
		/// The value between the minimum and maximum that indicates the currently selected level.
		/// </returns>

		var val;

		var _minimum = this._minimum;
		var _maximum = this._maximum;
		var handleBounds = this._getHandleBounds();
		var sliderBounds = this._getRailBounds();        
		var handleX = (mouseOffset) ? (mouseOffset - handleBounds.width / 2) : (handleBounds.x - sliderBounds.x);
		var extent = sliderBounds.width - handleBounds.width;
		var percent = handleX / extent;

		val = (handleX === 0) ? _minimum : (handleX == (sliderBounds.width - handleBounds.width)) ? _maximum : _minimum + percent * (_maximum - _minimum);

		if (this._steps > 0)
		{
			val = this._getNearestStepValue(val);
		}

		val = (val < this._minimum) ? this._minimum : (val > this._maximum) ? this._maximum : val;

		this._setLevel(val);

		return val;
	},

	_getBoundsInternal : function(element)
	{
		/// <summary>
		/// Get bounds information for a DOM element and invert the values if the orientation is horizontal.
		/// </summary>
		/// <param name="element" type="DomElement">Dom element to obtain bounds information.</param>
		/// <returns type="Sys.UI.DomElement.Bounds">
		/// An object containing bounds and location information for the desired DOM element.
		/// </returns>

		var bounds = $common.getBounds(element);

		if(!this._isHorizontal) {
			bounds = { x : bounds.y, 
						y : bounds.x, 
						height : bounds.width, 
						width : bounds.height, 
						right : bounds.right,
						bottom : bounds.bottom,
						location : {x:bounds.y, y:bounds.x},
						size : {width:bounds.height, height:bounds.width}
			};
		}

		return bounds;
	},

	_getRailBounds : function()
	{
		/// <summary>
		/// Obtain bounds information for the rail element.
		/// </summary>
		/// <returns type="Sys.UI.DomElement.Bounds">
		/// An object containing bounds and location information for the desired DOM element.
		/// </returns>

		return this._getBoundsInternal(this._railElement);
	},

	_getHandleBounds : function()
	{
		/// <summary>
		/// Obtain bounds information for the handle element.
		/// </summary>
		/// <returns type="Sys.UI.DomElement.Bounds">
		/// An object containing bounds and location information for the desired DOM element.
		/// </returns>

		return this._getBoundsInternal(this._handle);
	},

	_initializeDragHandle : function()
	{
		/// <summary>
		/// Create invisible drag handle to obtain a drag effect with the MS AJAX framework.
		/// </summary>

		this._dragHandle = document.createElement('DIV');
		var dh = this._dragHandle;

		dh.style.position = 'absolute';
		dh.style.width = '1px';
		dh.style.height = '1px';
		dh.style.overflow = 'hidden';
		dh.style.zIndex = '999';
		dh.style.background = 'none';

		document.body.appendChild(this._dragHandle);
	},

	_resetDragHandle : function()
	{
		/// <summary>
		/// Reset the invisible drag handle to its default position.
		/// </summary>

		var handleBounds = $common.getBounds(this._handle);
		$common.setLocation(this._dragHandle, {x:handleBounds.x, y:handleBounds.y});
	},

	_initializeHandlers : function()
	{
		/// <summary>
		/// Create and associate event handlers with DOM elements.
		/// </summary>

		// Respond when "top" element is clicked
		$addHandlers(this._topElement,
			{
				'click': this._onTopClick
			},
			this);

		// If the map has levels, then create additional handlers and respond to various events
		// including drag and drop.
		if (this._hasLevels)
		{
			this._selectstartHandler = Function.createDelegate(this, this._onSelectStart);
			this._mouseupHandler = Function.createDelegate(this, this._onMouseUp);

			$addHandler(document, 'mouseup', this._mouseupHandler);

			$addHandlers(this._handle, 
				{
					'mousedown': this._onMouseDown,
					'dragstart': this._DragDropHandler,
					'drag': this._DragDropHandler,
					'dragend': this._DragDropHandler
				},
				this);

			$addHandlers(this._railElement,
				{
					'click': this._onRailClicked
				},
				this);
		}

		// Respond when "bottom" element is clicked
		$addHandlers(this._bottomElement,
			{
				'click': this._onBottomClick
			},
			this);
	},

	_disposeHandlers : function()
	{
		/// <summary>
		/// Dispose of event handlers.
		/// </summary>

		$clearHandlers(this._topElement);
		$clearHandlers(this._bottomElement);

		if (this._hasLevels)
		{
			$clearHandlers(this._handle);
			$clearHandlers(this._railElement);
			$removeHandler(document, 'mouseup', this._mouseupHandler);

			this._mouseupHandler = null;
			this._selectstartHandler = null;
		}

		if (this._handleImage)
		{
			$clearHandlers(this._handleImage);
		}
	},

	_setHandleOffset : function(value)
	{
		/// <summary>
		/// Compute the offset value for the handle element based upon the input value.
		/// </summary>
		/// <param name="value" type="Number" integer="true">The step/level value where the handle should be positioned.</param>

		var _minimum = this._minimum;
		var _maximum = this._maximum;
		var handleBounds = this._getHandleBounds();
		var sliderBounds = this._getRailBounds();
		var Commons = AjaxControlToolkit.CommonToolkitScripts;

		// If the slider has a containing element with display:none, then the bounds returned will always
		// be zero. To work around that, we retrieve the width value for horizontal layout or height value
		// for vertical layout using the element's style. This implies that both the height and width CSS
		// attributes of the rail and the handle must be set in order for the slider to work properly.
		if (handleBounds.width <= 0 && sliderBounds.width <= 0)
		{
			if(this._isHorizontal) {
				handleBounds.width = parseInt(this._handle.style.width, 10);
				sliderBounds.width = parseInt(this._railElement.style.width, 10);
			}
			else {
				handleBounds.width = parseInt(this._handle.style.height, 10);
				sliderBounds.width = parseInt(this._railElement.style.height, 10);
			}
		}

		var extent = _maximum - _minimum;
		var fraction = (value - _minimum) / extent;
		var hypOffset = Math.round(fraction * (sliderBounds.width - handleBounds.width));

		var offset = (value == _minimum) ? 0 : (value == _maximum) ? (sliderBounds.width - handleBounds.width) : hypOffset;

		if (this._isHorizontal) {
			this._handle.style.left = offset + 'px';
		}
		else {
			this._handle.style.top = offset + 'px';
		}
	},

	_getNearestStepValue : function(value) {
		/// <summary>
		/// Compute the current value for a "discrete" zoom level.
		/// </summary>
		/// <param name="value" type="Number">A value between the minimum and maximum range.</param>
		/// <returns type="Number" integer="true">
		/// The step/level closest to the input value.
		/// </returns>

		if (this._steps === 0)
		{
			return value;
		}

		var extent = this._maximum - this._minimum;
		if (extent === 0)
		{
			return value;
		}

		var delta = extent / (this._steps - 1);
		return Math.round(value / delta) * delta;
	},

	_onHandleReleased : function() {
		/// <summary>
		/// When the handle is released during a drag and drop operation, this is invoked and will cause
		/// the map to zoom to the corresponding step/level.
		/// </summary>

		this._zoomMap();
	},

	_onTopClick : function(evt)
	{
		/// <summary>
		/// This is invoked when the "top" button is clicked which will increment or decrement the current
		/// zoom level based upon orientation or zoom in/out a small amount if the map is dynamic.
		/// </summary>

		if (this._hasLevels)
		{
			this._setLevel(this._getLevel() - 1);
			this._setHandleOffset(this._getLevel());
			this._zoomMap();
		}
		else
		{
			this._map.zoom(this._isHorizontal ? this._dynamicZoomOutFactor : this._dynamicZoomInFactor);
		}
	},

	_onBottomClick : function(evt)
	{
		/// <summary>
		/// This is invoked when the "bottom" button is clicked which will increment or decrement the current
		/// zoom level based upon orientation or zoom in/out a small amount if the map is dynamic.
		/// </summary>

		if (this._hasLevels)
		{
			this._setLevel(this._getLevel() + 1);
			this._setHandleOffset(this._getLevel());
			this._zoomMap();
		}
		else
		{
			this._map.zoom(this._isHorizontal ? this._dynamicZoomInFactor : this._dynamicZoomOutFactor);
		}
	},

	_onRailClicked : function(evt) {
		/// <summary>
		/// This is invoked when the "rail" element is clicked and will determine the offset/level of the
		/// rail so that the map can be zoomed.
		/// </summary>

		if (evt.target == this._railElement)
		{
			// Compute the pointer's offset
			var handleBounds = this._getHandleBounds();
			var sliderBounds = this._getRailBounds();
			var offset = (this._orientation == -1) ? evt.offsetX : evt.offsetY;
			var minOffset = handleBounds.width / 2;
			var maxOffset = sliderBounds.width - minOffset;

			offset = (offset < minOffset) ? minOffset : (offset > maxOffset) ? maxOffset : offset;

			// Calculate step value based upon this offset and zoom the map accordingly
			this._calcValue(offset);
			this._zoomMap();
		}
	},

	_zoomMap : function ()
	{
		/// <summary>
		/// Zoom the map so it is in sync with the current level of the control.
		/// </summary>

		// Zoom the map. Do not set the level since zooming the map will cause an extent change event to
		// occur which this control is configured to respond to. This will then set the level properly
		// and update the UI of this control.
		var curLevel = this._map.get_layers().getLevelByNearestPixelsize(this._map._pixelsizeX);
		var levels = this._map.get_layers().get_levels();

		var mapLevel;
		if (this._isHorizontal)
		{
			mapLevel = this._getLevel();
		}
		else
		{
			mapLevel = this._maximum - this._getLevel();
		}

		// If the current zoom level of the map does not match the level of the control, then zoom the
		// map to make them be in sync.
		if (curLevel != mapLevel)
		{
			var factor = this._map._pixelsizeX / levels[mapLevel];
			this._map.zoom (factor);
		}
	},

	_mapExtentChanged : function(sender, evt)
	{
		/// <summary>
		/// Handle the extent changed event, generated by the map, which begins the zooming mechanism.
		/// </summary>
		this._setCurrentLevel();
	},

	_setCurrentLevel : function ()
	{
		/// <summary>
		/// Helper function used when extent changes and when this control is initialized to determine
		/// initial zoom level.
		/// </summary>

		if (this._hasLevels)
		{
			var level = this._map.get_layers().getLevelByNearestPixelsize(this._map._pixelsizeX);

			// Normalize value so it works with map resolution levels
			if (this._isHorizontal)
			{
				this._setLevel(level);
			}
			else
			{
				this._setLevel(this._maximum - level);
			}

			this._setHandleOffset(this._getLevel());
		}
	},

	_getLevel : function ()
	{
		/// <field type="Number" integer="true">
		/// The current level of zoom. Changing this value does not cause the zoom level control or the map
		/// to change; it is simply a storage mechanism for internal use to validate levels and return the
		/// proper value based upon the orientation of the control.
		/// </field>
		return this._level;
	},

	_setLevel : function (value)
	{
		if (this._level != value)
		{
			if (value >= this._minimum && value <= this._maximum)
			{
				this._level = value;
			}
		}
	},

	//
	// IDragSource Members.
	//

	get_dragDataType : function() {
		return 'HTML';
	},

	getDragData : function() {
		return this._handle;
	},

	get_dragMode : function() {
		return AjaxControlToolkit.DragMode.Move;
	},

	onDragStart : function() {
		this._resetDragHandle();
	},

	onDrag : function() {
		/// <summary>
		/// Invoked when a drag event occurs, this will determine the proper position for the handle
		/// and then use this to calculate the associated level so it can be drawn properly.
		/// </summary>

		var dragHandleBounds = this._getBoundsInternal(this._dragHandle);
		var handleBounds = this._getHandleBounds();
		var sliderBounds = this._getRailBounds();

		var handlePosition; 
		if (this._isHorizontal)
		{
			handlePosition = { x:dragHandleBounds.x - sliderBounds.x, y:0 };
		}
		else
		{
			handlePosition = { y:dragHandleBounds.x - sliderBounds.x, x:0 };
		}
		$common.setLocation(this._handle, handlePosition);

		this._calcValue(null);
		this._setHandleOffset(this._getLevel());
	},

	onDragEnd : function() {
		this._onHandleReleased();
	},

	//
	// IDropTarget members.
	//

	get_dropTargetElement : function() {
		return document.body;
	},

	canDrop : function(dragMode, dataType) {
		return dataType == 'HTML';
	},

	drop : Function.emptyMethod,

	onDragEnterTarget : Function.emptyMethod,

	onDragLeaveTarget : Function.emptyMethod,

	onDragInTarget : Function.emptyMethod,

	//
	// Public Properties
	//

	get_map : function ()
	{
		/// <field type="ESRI.ADF.UI.Map" mayBeNull="false">
		/// Obtains the map control to which the ZoomLevel is a buddy.
		/// </field>
		return this._map;
	},

	set_map : function(value)
	{
		if (this._map != value)
		{
			this._map = value;
			this.raisePropertyChanged('map');
		}
	},

	get_imgTop : function ()
	{
		/// <field type="String" mayBeNull="false">
		/// The image URL for the "top" element of the control. Clicking this will cause the map to
		/// zoom in one level (if vertical) or out one level (if horizontal).
		/// </field>
		return this._imgTop;
	},

	set_imgTop : function(value)
	{
		if (this._imgTop != value)
		{
			this._imgTop = value;
			this.raisePropertyChanged('imgTop');
		}
	},

	get_imgBottom : function ()
	{
		/// <field type="String" mayBeNull="false">
		/// The image URL for the "bottom" element of the control. Clicking this will cause the map to
		/// zoom out one level (if vertical) or in one level (if horizontal).
		/// </field>
		return this._imgBottom;
	},

	set_imgBottom : function(value)
	{
		if (this._imgBottom != value)
		{
			this._imgBottom = value;
			this.raisePropertyChanged('imgBottom');
		}
	},

	get_imgSelected : function ()
	{
		/// <field type="String" mayBeNull="false">
		/// The image URL for the "selected" element of the control. This image will be displayed to
		/// indicate the currently selected zoom level.
		/// </field>
		return this._imgSelected;
	},

	set_imgSelected : function(value)
	{
		if (this._imgSelected != value)
		{
			this._imgSelected = value;
			this.raisePropertyChanged('imgSelected');
		}
	},

	get_imgDefault : function ()
	{
		/// <field type="String" mayBeNull="false">
		/// The image URL for the "not selected" elements of the control. This image will be displayed to
		/// indicate the various levels of the zoom level.
		/// </field>
		return this._imgDefault;
	},

	set_imgDefault : function(value)
	{
		if (this._imgDefault != value)
		{
			this._imgDefault = value;
			this.raisePropertyChanged('imgDefault');
		}
	},

	get_imageHeight : function ()
	{
		/// <field type="Number" integer="true">
		/// Height in pixels of the image used to indicate the currently selected zoom level.
		/// </field>
		return this._imgHeight;
	},

	set_imageHeight : function(value)
	{
		if (this._imgHeight != value)
		{
			this._imgHeight = value;
			this.raisePropertyChanged('imageHeight');
		}
	},

	get_imageWidth : function ()
	{
		/// <field type="Number" integer="true">
		/// Width in pixels of the image used to indicate the currently selected zoom level.
		/// </field>
		return this._imgWidth;
	},

	set_imageWidth : function(value)
	{
		if (this._imgWidth != value)
		{
			this._imgWidth = value;
			this.raisePropertyChanged('imageWidth');
		}
	},

	get_orientation : function ()
	{
		/// <field type="Number" integer="true">
		/// Orientation of the control. Use 1 to indicate vertical orientation and -1 for horizontal.
		/// </field>
		return this._orientation;
	},

	set_orientation : function(value)
	{
		if (this._orientation != value)
		{
			this._orientation = value;
			this.raisePropertyChanged('orientation');
		}
	},

	get_dynamicZoomInFactor : function ()
	{
		/// <field type="Number" integer="true">
		/// When the control is associated with a dynamic map, only the top and bottom images appear
		/// and act as a zoom mechanism similar to the mouse wheel. This value indicates the amount
		/// to zoom in when appropriate.
		/// </field>
		return this._dynamicZoomInFactor;
	},

	set_dynamicZoomInFactor : function(value)
	{
		if (this._dynamicZoomInFactor != value)
		{
			this._dynamicZoomInFactor = value;
			this.raisePropertyChanged('dynamicZoomInFactor');
		}
	},

	get_dynamicZoomOutFactor : function ()
	{
		/// <field type="Number" integer="true">
		/// When the control is associated with a dynamic map, only the top and bottom images appear
		/// and act as a zoom mechanism similar to the mouse wheel. This value indicates the amount
		/// to zoom out when appropriate.
		/// </field>
		return this._dynamicZoomOutFactor;
	},

	set_dynamicZoomOutFactor : function(value)
	{
		if (this._dynamicZoomOutFactor != value)
		{
			this._dynamicZoomOutFactor = value;
			this.raisePropertyChanged('dynamicZoomOutFactor');
		}
	}
};

ESRI.ADF.UI.ZoomLevel.DropPending = null; // Global, used to work around an issue when using the GenericDragDropManager in IE.

ESRI.ADF.UI.ZoomLevel.registerClass('ESRI.ADF.UI.ZoomLevel', Sys.UI.Control);

//
// Magnifier
//

ESRI.ADF.UI.Magnifier = function() {
	ESRI.ADF.UI.Magnifier.initializeBase(this);	
    this._blankImagePath = null; 
	this._magTableWidth = 200;
	this._magTableHeight = 200;
	this._magFactorRowHeight = 18;
	this._floatingPanel = null;
};
ESRI.ADF.UI.Magnifier.prototype = {
	initialize: function() {
		/// <summary>Initializes the magnifier control.</summary>
		ESRI.ADF.UI.Magnifier.callBaseMethod(this, 'initialize');
		var fpID = this._floatingPanel.get_element().id;
		this.set_id(fpID + '_Magnifier');
		Sys.Application.addComponent(this);
		this._floatingPanelBodyCell = $get(fpID + '_BodyCell');
		this._contentDiv = $get(fpID + '_ContentDiv');
		this._contentTable = $get(fpID + '_Content');
		this._contentsContainer = $get(fpID + '_Contents');
		this._factorRow = $get(fpID + '_FactorRow');
		this._magnifierAOI = $get(fpID + '_AOIBox');
		this._magnifierCrosshair = $get(fpID + '_Crosshair');
		this._mapImage = $get(fpID + '_MapImage');
		this._mapArea = $get(fpID + '_MapArea');
		this._extentChangingHandler = Function.createDelegate(this, this._mapExtentChanging);
		this._map.add_extentChanging(this._extentChangingHandler);
		this._hideMapHandler = Function.createDelegate(this, this._hideMapImage);
		this._getMapImageHandler = Function.createDelegate(this, this._getMapImage)
		this._resizeMagnifierArea = Function.createDelegate(this, this._resizeMagnifierArea);
		this._setEventHandlers();
	},
	dispose: function() {
		/// <summary>Disposes the control.</summary>
		this._removeEventHandlers();
		this._map.remove_extentChanging(this._extentChangingHandler);
		this._extentChangingHandler = null;
		ESRI.ADF.UI.Magnifier.callBaseMethod(this, 'dispose');
	},
	_mapExtentChanging: function(map, args) {
		this._hideMapImage();
	},
	doCallback: function(argument, context) {
		/// <summary>
		/// Performs a callback or partial postback depending on it's postback mode
		/// </summary>
		/// <param name="argument" type="String">The argument parsed back to the server control</param>
		/// <param name="context" type="string">The context of this callback</param>
		ESRI.ADF.System._doCallback(this._callbackFunctionString, this.get_uniqueID(), this._floatingPanel.get_element().id, argument, context);
	},
	_setAOIBox: function() {
		var floatingPanel = this._floatingPanel.get_element();
		var controlName = floatingPanel.id;
		var magSelect = $get(controlName + "_MagFactor");
		var tDisplay = floatingPanel.style.display;
		var index = magSelect.selectedIndex;
		var val = parseInt(magSelect.options[index].value, 10);
		var wDiv = this._contentDiv;
		var aoi = this._magnifierAOI;
		var magcross = this._magnifierCrosshair;
		var winWidth = wDiv.clientWidth;
		var winHeight = wDiv.clientHeight;
		if (tDisplay == "none") {
			winHeight = this._magTableHeight;
			winWidth = this._magTableWidth;
		} else {
			this._magTableHeight = winHeight;
			this._magTableWidth = winWidth;
		}
		var aoiWidth = Math.ceil(winWidth / val);
		var aoiHeight = Math.ceil(winHeight / val);
		var magMidX = Math.ceil(winWidth / 2);
		var magMidY = Math.ceil(winHeight / 2);
		var crossWidth = parseInt(magcross.style.width, 10);
		var crossHeight = parseInt(magcross.style.height, 10);
		aoi.style.width = aoiWidth + "px";
		aoi.style.height = aoiHeight + "px";
		aoi.style.left = Math.floor(magMidX - (aoiWidth / 2)) + "px";
		aoi.style.top = Math.floor(magMidY - (aoiHeight / 2)) + "px";
		magcross.style.left = (Math.floor(magMidX - (crossWidth / 2)) + 2) + "px";
		magcross.style.top = (Math.floor(magMidY - (crossHeight / 2)) + 2) + "px";
		crossHeight = parseInt(this._magnifierCrosshair.style.height, 10) + 2;
	},
	_toggleMagnifierMapImage: function(visibility) {
		if (visibility === null) { visibility = "visible"; }
		if (this._mapImage !== null) {
			this._mapImage.style.visibility = visibility;
			if (visibility === "hidden") { this._mapImage.src = this._blankImagePath; }
		}
	},
	_hideMapImage: function() {
		var imgObj = this._mapImage;
		if (imgObj !== null) {
			imgObj.style.visibility = "hidden";
			imgObj.src = this._blankImagePath;
		}
		if (this._magnifierAOI !== null) {
			this._setAOIBox();
			this._magnifierAOI.style.visibility = "visible";
		}
		if (this._magnifierCrosshair !== null) { this._magnifierCrosshair.style.visibility = "visible"; }
	},
	_showMapImage: function() {
		var imgObj = this._mapImage;
		if (imgObj !== null) { imgObj.style.visibility = "visible"; }
		if (this._magnifierAOI !== null) {
			this._magnifierAOI.style.visibility = "hidden";
			this._setAOIBox();
		}
		if (this._magnifierCrosshair !== null) { this._magnifierCrosshair.style.visibility = "hidden"; }
	},
	_requestMagnifierMapImage: function() {
		var m = this._map;
		var coords = "";
		if (m !== null) {
			var box = Sys.UI.DomElement.getBounds(this._magnifierAOI);
			var mbox = Sys.UI.DomElement.getBounds(m.get_element());
			var wDiv = this._contentDiv;
			var winWidth = parseInt(wDiv.clientWidth, 10);
			var winHeight = parseInt(this._mapArea.clientHeight, 10);
			if (!winWidth || !winHeight) { return; }
			if (box !== null) {
				var left = box.x - mbox.x;
				var top = box.y - mbox.y;
				var right = left + box.width;
				var bottom = top + box.height;
				coords = left + "," + top + "," + right + "," + bottom;
			}
			var argument = "ControlType=Magnifier&PageID=" + m.pageID + "&EventArg=NewExtent&width=" + winWidth + "&height=" + winHeight + "&coords=" + coords;
			this.doCallback(argument, this);
		}
	},
	_onMagFactorChange: function() {
		this._setAOIBox();
		this._requestMagnifierMapImage();
	},
	_getMapImage: function() {
		this._hideMapImage();
		this._requestMagnifierMapImage();
	},
	_resizeMagnifierArea: function(sender, args) {
		var height = args.height;
		var width = args.width;
		height -= (this._factorRow.clientHeight + 2);
		var crossHeight = parseInt(this._magnifierCrosshair.style.height, 10) + 2;
		if (height < crossHeight) { height = crossHeight; }
		this._contentDiv.parentNode.style.height = height + "px";
		this._mapArea.style.height = height + "px";
		this._setAOIBox();
	},
	_setStartSize: function() {
		var floatingPanel = this._floatingPanel.get_element();
		// if necessary, need to temporarily expand panel to get interior sizes
		var tDisplay = floatingPanel.style.display;
		floatingPanel.style.display = '';
		var tableheight = this._contentTable.clientHeight;
		var rowheight = this._factorRow.clientHeight;
		if (tDisplay == "none") {
			tableheight = this._magTableHeight;
			rowheight = this._magFactorRowHeight;
		} else {
			this._magTableHeight = tableheight;
			this._magFactorRowHeight = rowheight;
		}
		var height = tableheight - rowheight - 2;
		if (height < 0) { height = 0; }
		this._contentDiv.parentNode.style.height = height + "px";
		this._mapArea.style.height = height + "px";
		this._setAOIBox();
		floatingPanel.style.display = tDisplay;
	},
	_setEventHandlers: function() {
		// functions to call for content action on drag events
		this._floatingPanel.add_dragStart(this._hideMapHandler);
		this._floatingPanel.add_dragEnd(this._getMapImageHandler);
		// functions to call for content action on resize events
		this._floatingPanel.add_resizeStart(this._hideMapHandler);
		this._floatingPanel.add_resizing(this._resizeMagnifierArea);
		this._floatingPanel.add_resized(this._getMapImageHandler);

		// functions to call for content action on hide/show
		this._floatingPanel.add_hide(this._hideMapHandler);
		this._floatingPanel.add_show(this._getMapImageHandler);

		// functions to call for content action on hide/show
		this._floatingPanel.add_expanded(Function.createDelegate(this, this._setStartSize));
		this._floatingPanel.add_expanded(this._getMapImageHandler);

		var magSelect = $get(this._floatingPanel.get_id() + "_MagFactor");
		$addHandlers(magSelect, { 'change': this._onMagFactorChange }, this);
		this._setStartSize();
	},
	_removeEventHandlers: function() {
		if (!this._floatingPanel) { return; }
		// functions to call for content action on drag events
		this._floatingPanel.remove_dragStart(this._hideMapHandler);
		this._floatingPanel.remove_dragEnd(this._getMapImageHandler);
		// functions to call for content action on resize events
		this._floatingPanel.remove_resizeStart(this._hideMapHandler);
		this._floatingPanel.remove_resizing(this._resizeMagnifierArea);
		this._floatingPanel.remove_resized(this._getMapImageHandler);

		// functions to call for content action on hide/show
		this._floatingPanel.remove_hide(this._hideMapHandler);
		this._floatingPanel.remove_show(this._getMapImageHandler);

		// functions to call for content action on hide/show
		this._floatingPanel.remove_expanded(this._getMapImageHandler);

		var magSelect = $get(this._floatingPanel.get_id() + "_MagFactor");
		if (magSelect) { $removeHandler(magSelect, 'change', this._onMagFactorChange); }
	},
	processCallbackResult: function(action, params) {
		/// <summary>
		/// Process callback results to update the overview map image and AOI rectangle
		/// </summary>
		if (action === 'mapimage') {
			this._mapImage.src = params[1];
			if (params.length > 5) {
				var magcoord0 = Math.round(params[2] * 1000) / 1000;
				var magcoord1 = Math.round(params[3] * 1000) / 1000;
				var magcoord2 = Math.round(params[4] * 1000) / 1000;
				var magcoord3 = Math.round(params[5] * 1000) / 1000;
				var extString = "Extent: " + magcoord0 + ", " + magcoord1 + ", " + magcoord2 + ", " + magcoord3;
				this._mapImage.alt = extString;
				this._mapImage.title = extString;
			}
			this._showMapImage();
			return true;
		}
	},
	get_map: function() {
		/// <value type="ESRI.ADF.UI.MapBase" mayBeNull="false">
		/// Gets or sets the map control associated with this instance.
		/// </value>
		return this._map;
	},

	set_map: function(value) {
		if (this._map !== value) {
			if (this._extentChangedHandler) { this._map.remove_extentChanged(this._extentChangedHandler); }
			this._map = value;
			if (this._extentChangedHandler) { this._map.add_extentChanged(this._extentChangedHandler); }
		}
	},
	get_uniqueID: function() {
		/// <value type="String" mayBeNull="false">
		/// The unique ID value of this control.
		/// </value>
		return this._uniqueID;
	},
	set_uniqueID: function(value) { this._uniqueID = value; },
	get_callbackFunctionString: function() {
		/// <value type="String" mayBeNull="false">
		/// The callback string used to create a server callback.
		/// </value>
		return this._callbackFunctionString;
	},
	set_callbackFunctionString: function(value) {
		this._callbackFunctionString = value;
	},
	get_transparency: function() {
		/// <value type="Number"></value>
		return this._transparency;
	},
	set_transparency: function(value) { this._transparency = value; },
	get_magnifyFactor: function() {
		/// <value type="Number"></value>
		return this._magnifyFactor;
	},
	set_magnifyFactor: function(value) { this._magnifyFactor = value; },
	get_blankImagePath: function() {
		/// <value type="String"></value>
		return this._blankImagePath;
	},
	set_blankImagePath: function(value) { this._blankImagePath = value; },
	get_blankImagePath: function() {
		/// <value type="String">FloatingPanel that the magnifier uses.</value>
		return this._floatingPanel;
	},
	set_floatingPanel: function(value) { this._floatingPanel = value; }

};
ESRI.ADF.UI.Magnifier.registerClass('ESRI.ADF.UI.Magnifier', Sys.Component);

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }

