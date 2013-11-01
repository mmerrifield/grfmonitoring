//  COPYRIGHT © 2006 ESRI
//
//  TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
//  Unpublished material - all rights reserved under the
//  Copyright Laws of the United States and applicable international
//  laws, treaties, and conventions.
// 
//  For additional information, contact:
//  Environmental Systems Research Institute, Inc.
//  Attn: Contracts and Legal Services Department
//  380 New York Street
//  Redlands, California, 92373
//  USA
// 
//  email: contracts@esri.com

Type.registerNamespace('ESRI.ADF');

// Snaptip class
ESRI.ADF.SnapTip = function()
{
    this._map = null;                   // The map displaying snap tips
    this._color = "orange";             // The color of the snap tip
    this._markerSize = 5;               // size of the snap tip marker (use odd number as marker is centered over point)
    this.enabled = false;               // indicates if snap tips should be displayed on keydown
    this._showCircle = false;           // indicates if snap circle should be displayed
    this._snapRadius = 6;               // size of the snap radius in pixels
    this.tip = null;                    // the map tip div that contains text
    this.marker = null;                 // the map tip div that represents the markerdiv
    this.snapTipCursor = {x:-1, y:-1};  // tracks the mouse position over the map
    this.tipVisible = false;            // if the snap tip is visible
    this.tipPending = false;            // if a snap tip callback is pending
    this.tipCancelled = false;          // cancel a tip when the mouse has moved prior to tip display
    this.disableTilMove = false;        // when a tip is shown, mouse click hides tip, don't show again until mouse move
    this._snapCircleSymbol = null;      // The snap circle symbol displayed around the cursor
    this._snapCircle = null;            // The snap circle displayed around the cursor
    this._uniqueID = null;
    this._callbackFunctionString = null;
    this._containerDiv = null;

    ESRI.ADF.SnapTip.initializeBase(this);
}

ESRI.ADF.SnapTip.prototype = {
    get_map: function() {
        return this._map;
    },
    set_map: function(value) {
        if (this.get_isInitialized()) {
            throw Error.invalidOperation("You can't do that now!");
        }
        this._map = value;
    },
    get_markerSize: function() {
        return _markerSize;
    },
    set_markerSize: function(value) {
        this._markerSize = value;
    },
    get_color: function() {
        return _color;
    },
    set_color: function(value) {
        this._color = value;
    },
    get_snapRadius: function() {
        return this._snapRadius;
    },
    set_snapRadius: function(value) {
        this._snapRadius = value;
        this._disposeSnapCircle();
    },
    get_showCircle: function() {
        return this._showCircle;
    },
    set_showCircle: function(value) {
        this._showCircle = value;
    },
    get_containerDiv: function() {
        if (this._containerDiv == null)
            this._containerDiv = this._map.__get_controlDiv();
        return this._containerDiv;
    },
    initialize: function() {
        var container = this.get_containerDiv();

        // Create marker
        var markerID = this.get_id() + "edsnaptipMarker";
        this.marker = $get(markerID, container);
        if (this.marker == null) {
            this.marker = document.createElement('div');
            this.marker.id = markerID;
            this.marker.className = "edsnaptipMarker";
            this.marker.style.display = "none";
            container.appendChild(this.marker);
        }

        // Create tip
        var tipID = this.get_id() + "edsnaptip";
        this.tip = $get(tipID, container);
        if (this.tip == null) {
            this.tip = document.createElement('div');
            this.tip.id = tipID;
            this.tip.className = "edsnaptip";
            this.tip.style.display = "none";
            container.appendChild(this.tip);
        }

        // Snap circle
        this._snapCircleSymbol = new ESRI.ADF.Graphics.FillSymbol(null, 'red', 1);

        // Map events
        this._sKeyDownHandler = Function.createDelegate(this, this._keyDown);
        this._sKeyUpHandler = Function.createDelegate(this, this._keyUp)
        this._map.add_mouseDown(Function.createDelegate(this, this._mouseDown));
        this._map.add_mouseMove(Function.createDelegate(this, this._mouseMove));
        this._map.add_mouseOut(Function.createDelegate(this, this._mouseOut));
        this._map.setKeyAction(83, this._sKeyDownHandler, this._sKeyUpHandler, 'crosshair', true);
        this._map.setKeyAction(115, this._sKeyDownHandler, this._sKeyUpHandler, 'crosshair', true);

        this._offset = Sys.Browser.agent === Sys.Browser.Firefox ? -1 : 0;

        ESRI.ADF.SnapTip.callBaseMethod(this, 'initialize');
    },
    // function to display a snap tip
    showTip: function(x, y, text) {
        var container = this.get_containerDiv();

        // Show marker
        this.marker.style.display = "";

        // Position marker
        this.marker.style.left = parseInt(x) + this._offset - this._markerSize / 2 + 'px';
        this.marker.style.top = parseInt(y) + this._offset - this._markerSize / 2 + 'px';
        this.marker.style.width = this._markerSize + 'px';
        this.marker.style.height = this._markerSize + 'px';
        this.marker.style.backgroundColor = this._color;

        // Position tip
        var bounds = Sys.UI.DomElement.getBounds(container);
        var offsetX = x > (bounds.width - 160) ? -160 : 10;
        var offsetY = y > 50 ? -40 : 10;
        this.tip.style.left = parseInt(x) + offsetX + 'px';
        this.tip.style.top = parseInt(y) + offsetY + 'px';

        this.tip.innerHTML = text;

        // Show tip text
        this.tip.style.display = "";
        this.tipVisible = true;
    },
    hideTip: function() {
        if (this.tipVisible) {
            this.marker.style.display = "none";
            this.tip.style.display = "none";
        }

        this.tipVisible = false;
    },
    enable: function() {
        this.enabled = true;
    },
    disable: function() {
        this.enabled = false;
        this._disposeSnapCircle();
    },
    _disposeSnapCircle: function() {
        if (this._snapCircle) {
            this._map.removeGraphic(this._snapCircle);
            this._snapCircle.dispose();
            this._snapCircle = null;
        }
    },
    _mouseDown: function(map, e) {
        // Stop displaying tip if it is displayed    
        this.hideTip();
    },
    _mouseOut: function(map, e) {
        this.snapTipCursor.x = -1;
        this.snapTipCursor.y = -1;
        this._disposeSnapCircle();
    },
    _mouseMove: function(map, e) {
        if (this.tipPending)
            this.tipCancelled = true;

        // Reset temp cancel
        this.cancelTilMove = false;

        // Stop displaying tip if it is displayed    
        this.hideTip();

        // Track position for next snap tip
        this.snapTipCursor.x = e.offsetX;
        this.snapTipCursor.y = e.offsetY;

        // Update snap circle
        if (this._showCircle && this.enabled) {
            var width = this._map._pixelsizeX * this._snapRadius * 2;
            var geom = new ESRI.ADF.Geometries.Oval(this._map.toMapPoint(e.offsetX, e.offsetY), width, width);
            if (!this._snapCircle) {
                this._snapCircle = $create(ESRI.ADF.Graphics.GraphicFeature, { "geometry": geom, "symbol": this._snapCircleSymbol });
                this._map.addGraphic(this._snapCircle);
            }
            else {
                this._snapCircle.set_geometry(geom);
            }
        }
        else {
            this._disposeSnapCircle();
        }
    },
    _keyDown: function(map, e) {
        // Check if tip was already displayed
        if (this.cancelTilMove)
            return;

        // If a call back is pending or tips disabled or cursor not over map, ignore
        if (!this.tipPending && this.enabled && this.snapTipCursor.x >= 0 && this.snapTipCursor.y >= 0) {
            // Check if any snap rules are defined - web control rendered var
            if (eval(this._map.get_id() + "_snapRulesDefined") == false) {
                this.showTip(this.snapTipCursor.x, this.snapTipCursor.y, "No snapping rules are set.");
            }
            else {
                var arg = "EventArg=ShowSnapTip&x=" + this.snapTipCursor.x + "&y=" + this.snapTipCursor.y;
                this.tipPending = true;
                this.tipCancelled = false;
                this.cancelTilMove = true;
                this.doCallback(arg, this);
            }
        }
    },
    _keyUp: function(map, e) {
        if (this.enabled) {
            // Don't show pending tip and stop displaying tip if it is displayed    
            this.tipCancelled = true;
            this.hideTip();
            this.cancelTilMove = false;
        }
    },
    doCallback: function(argument, context) {
        /// <summary>
        /// Performs a callback or partial postback depending on it's postback mode
        /// </summary>
        /// <param name="argument" type="String">The argument parsed back to the server control</param>
        /// <param name="context" type="string">The context of this callback</param>
        /// <returns />   
        ESRI.ADF.System._doCallback(this._callbackFunctionString, this.get_uniqueID(), this.get_clientID(), argument, context);
    },
    processCallbackResult: function(action, params) {
        /// <summary>
        /// Processes a result from a callback or partial postback
        /// </summary>
        /// <param name="action" type="String">Name of action</param>
        /// <param name="params" type="string">Action parameters</param>
        /// <returns type="Boolean">True on success</returns>
        /// <remarks>
        /// This method is invoked by the generic processer 'ESRI.ADF.System.processCallbackResults', 
        /// if the action wasn't supported by the generic process method.
        /// Extend it to add additional server/client functionality to this control.
        /// </remarks>
        if (action == "setSnapTips") {
            this.tipPending = false;

            // if mouse moved since keydown, don't display result
            if (this.tipCancelled)
                return;

            if (params.length == 3)
                this.showTip(params[0], params[1], params[2]);

            return true;
        }
        return false;
    },
    get_uniqueID: function() {
        /// <value name="uniqueID" type="String">Gets or sets the unique ID used to identify the control serverside</value>
        return this._uniqueID;
    },
    set_uniqueID: function(value) {
        this._uniqueID = value;
    },
    get_clientID: function() {
        /// <value name="clientID" type="String">Gets or sets the client ID used to identify the control serverside</value>
        return this._clientID;
    },
    set_clientID: function(value) {
        this._clientID = value;
    },
    get_callbackFunctionString: function() {
        /// <value name="callbackFunctionString" type="String">Gets or sets the callback function string used to call back to the serverside control.</value>
        /// <remarks>
        /// Executing the callbackfunctionstring will either generate a partial postback or a callback to the server, depending on the current AJAX mode.
        /// To perform a call to the servercontrol, use the <see cref="doCallback"/> method of this instance.
        /// </remarks>
        return this._callbackFunctionString;
    },
    set_callbackFunctionString: function(value) {
        this._callbackFunctionString = value;
    },
    dispose: function() {
        var el = this._map.get_element();
        this._map.remove_mouseDown(this._keyDown);
        this._docMouseMove = null;
        this._mouseDown = null;
        this._map.removeKeyAction(83);
        this._map.removeKeyAction(115);
        this._sKeyDownHandler = null;
        this._sKeyUpHandler = null;
        this._keyUp = null;
        this._keyDown = null;
        ESRI.ADF.SnapTip.callBaseMethod(this, 'dispose');
    }
}

ESRI.ADF.SnapTip.registerClass('ESRI.ADF.SnapTip', Sys.Component);

if (typeof(Sys) !== "undefined") Sys.Application.notifyScriptLoaded();
