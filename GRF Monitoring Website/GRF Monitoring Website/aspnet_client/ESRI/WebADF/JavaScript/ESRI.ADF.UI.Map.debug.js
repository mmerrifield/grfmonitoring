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
/// <reference assembly="ESRI.ArcGIS.ADF.Web.UI.WebControls" name="ESRI.ArcGIS.ADF.Web.UI.WebControls.Runtime.JavaScript.ESRI.ADF.Animations.js"/>
/// <reference assembly="ESRI.ArcGIS.ADF.Web.UI.WebControls" name="ESRI.ArcGIS.ADF.Web.UI.WebControls.Runtime.JavaScript.ESRI.ADF.Layers.js"/>
/// <reference assembly="ESRI.ArcGIS.ADF.Web.UI.WebControls" name="ESRI.ArcGIS.ADF.Web.UI.WebControls.Runtime.JavaScript.ESRI.ADF.Graphics.js"/>
Type.registerNamespace('ESRI.ADF.UI');

ESRI.ADF.UI.MouseMode = function() {
    /// <summary>
    /// The MouseMode enumeration determines how the map reacts to mouse events.
    /// </summary>
    /// <field name="None" type="Number" integer="true" />
    /// <field name="Pan" type="Number" integer="true" />
    /// <field name="ZoomIn" type="Number" integer="true" />
    /// <field name="ZoomOut" type="Number" integer="true" />
    /// <field name="Custom" type="Number" integer="true" />
    throw Error.invalidOperation();
};
ESRI.ADF.UI.MouseMode.prototype = {
    None: 0,
    Pan: 1,
    ZoomIn: 2,
    ZoomOut: 3,
    Custom: 99
};
ESRI.ADF.UI.MouseMode.registerEnum("ESRI.ADF.UI.MouseMode", false);

ESRI.ADF.UI.MapBase = function(element) {
    /// <summary>The base Map class. </summary>
    /// <param name="element" type="Sys.UI.DomElement">
    /// DOM element that should contain the map view
    /// </param>
    /// <remarks>The MapBase class provides a vast majority of the clientside functionality exposed in a Map. </remarks>
    ESRI.ADF.UI.MapBase.initializeBase(this, [element]);
    this._layers = null;
    this._mouseDragState = null;
    this._isZooming = false;
    this._extent = null;
    this._cursor = 'crosshair';
    this._pixelsizeX = 1.0; //Width of pixel in world coordinates
    this._pixelsizeY = this._pixelsizeX; //Height of pixel in world coordinates
    this._disableScrollWheelZoom = false;
    this._keyPanDirection = [0, 0];  //Used for keyboard navigation
    this._mapsize = null;
    this._graphicFeatures = [];
    this._gridOrigin = new ESRI.ADF.Geometries.Point(0, 0);
    this._mouseMode = null;
    this._altAction = null;
    this._ctrlAction = null;
    this._mapsize = this._getInternalElementSize(this.get_element());
    this._extentHistory = [];
    this._currentExtentHistory = null;
    this._mouseWheelDirection = 1;
    this._keyActions = [];
    this._rotation = { "angle": 0, "cos": 1, "sin": 0 };
    this._progressBarEnabled = true;
    this._clipExtentBuffer = 50; //Buffer in pixels added to dynamic images when clipping them to the view
    this._layerReferences = {};
    this._animationSettings = { "duration": 0.25, "fps": 25, "enableFadeTransition": !ESRI.ADF.System.__isIE6, "disableNavigationAnimation": false };
    this._fadingStarted = true;
    this._isPanning = false;
    this._minZoom = 0;
    this._maxZoom = Number.POSITIVE_INFINITY;
    this._progressBarAlignment = ESRI.ADF.System.ContentAlignment.BottomRight;
    this._tileBuffer = null;
    this._loadTilesContinously = true;
};
ESRI.ADF.UI.MapBase.prototype = {
    // 
    // Base class overrides
    //
    initialize: function() {
        /// <summary>Initializes the map control.</summary>
        /// <remarks>Must be called prior to using the map</remarks>
        ESRI.ADF.UI.MapBase.callBaseMethod(this, 'initialize');
        if (!this._mouseMode) { this._mouseMode = ESRI.ADF.UI.MouseMode.Pan; }
        this._setupMap();
        if (this._extentHistory.length === 0) {
            this._addExtentHistory();
        }
        //Hook up control events

        //Zoom animation handlers
        this.add_zoomStart(Function.createDelegate(this, function() {
            this._clearRequestStack();
            this._isZooming = true;
            this._clearVectorGraphics();
            this._tmpExtent = this.get_extent();
            this._fadingStarted = false;
        }));
        this.add_zoomCompleted(Function.createDelegate(this, function() {
            this._isZooming = false;
            this._oldLayersDiv = this._layersDiv;
            this._oldLayersDiv.id = '';
            for (var idx in this._oldLayersDiv.childNodes) {
                if (this._oldLayersDiv.childNodes[idx]) {
                    this._oldLayersDiv.childNodes[idx].id = '';
                }
            }
            this._layersDiv = this._createLayersDiv();
            this._containerDiv.insertBefore(this._layersDiv, this._annotationDiv);
            this._oldLayersDiv.style.left = this._containerDivPos[0] + 'px';
            this._oldLayersDiv.style.top = this._containerDivPos[1] + 'px';
            this._resetGridOffset();
            if (Sys.Browser.agent === Sys.Browser.InternetExplorer && this._animationSettings.enableFadeTransition && !this._animationSettings.disableNavigationAnimation) {
                this._layersDiv.style.filter = "progid:DXImageTransform.Microsoft.Fade(overlap=1, duration=0.5)";
                this._layersDiv.filters[0].Apply();
            }

            if (this._suppressExtentChanged !== true) {
                this._raiseEvent('extentChanged', { "previous": this._tmpExtent, "current": this.get_extent() });
            }
            this._tmpExtent = null;
        }));
        this.add_click(Function.createDelegate(this, this._onClick));
        //Pan drag handlers
        this.add_mouseDragging(Function.createDelegate(this, this._onMouseDragging));
        this.add_mouseDragCompleted(Function.createDelegate(this, this._onMouseDragCompleted));
        //Pan handlers
        this.add_panning(Function.createDelegate(this, function() {
            //Finding and loading tiles is expensive - This will reduce the number of calls
            if (!this._panPanPositionTracker) {
                this._panPanPositionTracker = [this._containerDivPos[0], this._containerDivPos[1]];
                if (this._loadTilesContinously) { this._loadTilesInView(); }
            }
            else {
                var dist = Math.max(
					Math.abs(this._containerDivPos[0] - this._panPanPositionTracker[0]),
					Math.abs(this._containerDivPos[1] - this._panPanPositionTracker[1]));
                if (dist > 64) {
                    this._panPanPositionTracker = [this._containerDivPos[0], this._containerDivPos[1]];
                    if (this._loadTilesContinously) { this._loadTilesInView(); }
                }
            }
            this._raiseEvent('extentChanging');
        }));
        this.add_panCompleted(Function.createDelegate(this, function(s, e) {
            this._extent = null;
            this._panPanPositionTracker = null;
            this._removeOutsideTiles();
            if (this._suppressExtentChanged !== true) {
                this._raiseEvent('extentChanged', e);
            }
            this._tmpExtent = null;
        }));
        //Extent change handlers - will make sure tiles, images and and graphic are loaded on change
        var del = Function.createDelegate(this, function(s, e) {
            this._extent = null;
            this._addExtentHistory(e.previous, e.current);
            this._loadLayersInView(false);
        });
        this.add_extentChanged(del);

        //hook up base events
        $addHandlers(this.get_element(), {
            'dblclick': this._onDblClick,
            'mousedown': this._onMouseDown,
            'contextmenu': function() { return false; }
        }, this);
        this._mouseMoveHandler = Function.createDelegate(this, this._onMouseMove);
        this._mouseUpHandler = Function.createDelegate(this, this._onMouseUp);
        if (Sys.Browser.agent === Sys.Browser.InternetExplorer) {
            $addHandlers(this.get_element(), {
                'mouseenter': Function.createDelegate(this, this._hookEventsOnMouseEnter),
                'mouseleave': Function.createDelegate(this, this._unhookEventsOnMouseLeave)
            }, this);
        }
        else {
            $addHandlers(this.get_element(), {
                'mouseover': Function.createDelegate(this, this._hookEventsOnMouseEnter),
                'mouseout': Function.createDelegate(this, this._unhookEventsOnMouseLeave)
            }, this);
        }
        this._onKeyDownHandler = Function.createDelegate(this, this._onKeyDown);
        this._onKeyUpHandler = Function.createDelegate(this, this._onKeyUp);
        this._onWindowResizeHandler = Function.createDelegate(this, this._onResize);
        this._onWindowBlurHandler = Function.createDelegate(this, function() { this._fireKeyUpAction('all'); });
        $addHandler(window, 'resize', this._onWindowResizeHandler);
        $addHandler(window, 'blur', this._onWindowBlurHandler);
        if (Sys.Browser.agent === Sys.Browser.Firefox) {
            $addHandler(window, 'mouseout', Function.createDelegate(this, function(e) { if (e.target === document.body.parentNode && this._mouseDragState) { this._onMouseUp(e); } }));
        }
        //Wheel handler
        if (!this._disableScrollWheelZoom) { ESRI.ADF.System.addMouseWheelHandler(this.get_element(), this._onMouseWheel, this); }

        //We're ready. Hook up and load layers
        this._hookupLayerCollectionEvents();
    },
    _createProgressBar: function() {
        this._progressBar = $create(ESRI.ADF.UI.ProgressBarExtender, { "width": "200px", "progressBarAlignment": this._progressBarAlignment }, null, { "map": this.get_id() });
    },
    _hookupLayerCollectionEvents: function() {
        if (!this._layers) { this._layers = new ESRI.ADF.Layers.LayerCollection(); }
        if (!this._layers.get_hasPendingLayers() && this._layers._resources.length > 0) { this._loadLayersInView(true); }

        this._layers.add_layerAdded(Function.createDelegate(this, function(sender, args) {
            if (this._layers.get_layerCount() === 1) { //Treat first resource added differently
                var resource = this._layers.get_layer(0);
                if (resource.get_isInitialized()) { //If resource has been initialized, load it now, else wait for it
                    this._loadFirstResource();
                }
                else {
                    resource.add_initialized(Function.createDelegate(this, this._loadFirstResourceAndLayersInView));
                }
            }
            if (!this._layers.get_hasPendingLayers()) {
                if (ESRI.ADF.Layers.DynamicLayer.isInstanceOfType(args)) {
                    this.refreshLayer(args);
                }
                else { this._loadLayersInView(true); }
            }
            else { args.add_initialized(Function.createDelegate(this, function() { this._loadLayersInView() })); }
        }));
        this._layers.add_layersInitialized(Function.createDelegate(this, this._loadLayersInView));
        this._layers.add_layerRemoved(Function.createDelegate(this, function(s, e) {
            this._clearResourceImageTiles(e);
            var layerid = this._getLayerId(e);
            this._removeElement(this._layerReferences[layerid]);
            this._layerReferences[layerid] = null;
            this._removePendingStackStartingWith(layerid, true, false);
        }));
    },
    dispose: function() {
        /// <summary>Disposes the map and cleans up.</summary>
        /// <remarks>dispose is automatically invoked on page.unload, and should usually not be called programmetically</remarks>	
        if (this._progressBar) { this._progressBar.dispose(); }
        $removeHandler(window, 'resize', this._onWindowResizeHandler);
        $removeHandler(window, 'blur', this._onWindowBlurHandler);
        if (this._layers) { this._layers.dispose(); }
        $clearHandlers(this.get_element());
        ESRI.ADF.UI.MapBase.callBaseMethod(this, 'dispose');
    },
    _loadFirstResource: function() {
        var resource = this.get_layers().get_layer(0);
        var level = this._layers.getLevelByNearestPixelsize(this._pixelsizeX);
        if (level === null) { this._pixelsizeY = this._pixelsizeX; }
        else { this._pixelsizeX = this._pixelsizeY = this.get_layers().get_levelResolution(level); }
        this.set_spatialReference(resource.get_spatialReference());
        this._applyExtent(this.get_extent());
        this.refreshGraphics();
    },
    _loadFirstResourceAndLayersInView: function() {
        this._loadFirstResource();
        this._loadLayersInView(true);
    },
    //
    // Internal methods
    //
    _setupMap: function() {
        //MapControlDiv holds all elements of the map control and adds clipping to overflowing elements
        if (!this.get_cursor()) { this.set_cursor('move'); }
        this._controlDiv = document.createElement('div');
        var MapControlDiv = this._controlDiv;
        MapControlDiv.style.overflow = 'hidden';
        MapControlDiv.style.width = '100%';
        MapControlDiv.style.height = '100%';
        MapControlDiv.style.position = 'relative';
        MapControlDiv.style.backgroundImage = 'url(' + ESRI.ADF.System.blankImagePath + ')';
        MapControlDiv.id = 'MapControlDiv_' + this.get_id();
        var mapdiv = null;
        //if(!MapControlDiv.style.backgroundColor) MapControlDiv.style.backgroundColor = 'transparent';
        this.get_element().appendChild(MapControlDiv);
        if (Sys.Browser.agent !== Sys.Browser.InternetExplorer) {
            //Mozilla workaround for firing keydown events
            MapControlDiv.style.MozUserFocus = 'normal';
            this._keyActionDiv = document.createElement('a');
            this._keyActionDiv.id = 'MapMozillaLink_' + this.get_id();
            this._keyActionDiv.style.MozUserFocus = 'normal';
            MapControlDiv.appendChild(this._keyActionDiv);
            $addHandler(this._keyActionDiv, 'mouseover', this._keyActionDiv.focus);
            mapdiv = this._keyActionDiv;
        }
        else { mapdiv = MapControlDiv; }

        //create container Div
        //The container div is moved around during a pan, and everything within it tags alongs
        this._containerDiv = document.createElement('div');
        this._containerDiv.style.width = '100%';
        this._containerDiv.style.height = '100%';
        this._containerDiv.style.position = 'relative';
        this._containerDiv.id = 'MapContainerDiv_' + this.get_id();
        this._containerDiv.style.left = '0';
        this._containerDiv.style.top = '0';
        this._containerDivPos = [0, 0];
        mapdiv.appendChild(this._containerDiv);

        //Create layer div
        this._layersDiv = this._createLayersDiv();
        this._containerDiv.appendChild(this._layersDiv);

        //Create div for annotations
        this._annotationDiv = document.createElement('div');
        this._annotationDiv.id = 'MapAnnotationDiv_' + this.get_id();
        this._containerDiv.appendChild(this._annotationDiv);
        this._annotationDiv.style.position = 'absolute';
        this._annotationDiv.style.left = '0';
        this._annotationDiv.style.top = '0';
        this._annotationDiv.dir = 'ltr';
        this._containerDiv.appendChild(this._annotationDiv);
        this._assotateCanvas = this._createCanvas(this._annotationDiv);

        this.get_element().style.MozUserSelect = 'none';
        if (Sys.Browser.agent === Sys.Browser.InternetExplorer) {
            this.get_element().unselectable = 'on';
        }
        else if (Sys.Browser.agent === Sys.Browser.Safari) {
            this.get_element().style.KhtmlUserSelect = 'none';
        }
        else {
            this.get_element().style.MozUserSelect = 'none';
            this.get_element().style["-moz-user-focus"] = 'normal';
        }
        this._tilesInView = {};
        this._requestStack = [];
        this._pendingSrcImages = [];
        this._mapsize = this._getInternalElementSize(this.get_element());
        this._assotateCanvas.adjustCanvasExtent(this._containerDivPos[0], this._containerDivPos[1], this._mapsize[1], this._mapsize[0]);
        if (this._progressBarEnabled) { this._createProgressBar(); }
    },
    _createLayersDiv: function() {
        var layersDiv = document.createElement('div');
        layersDiv.style.width = '100%';
        layersDiv.style.height = '100%';
        layersDiv.style.position = 'absolute';
        layersDiv.id = this.get_id() + '_layers';
        layersDiv.dir = 'ltr';
        this._layerReferences = {};
        return layersDiv;
    },
    _createCanvas: function(vectorcanvas) {
        vectorcanvas.style.position = 'absolute';
        vectorcanvas.style.width = '100%';
        vectorcanvas.style.height = '100%';
        vectorcanvas.style.overflow = 'visible';
        var map = this;
        var vectorCanvasObj = ESRI.ADF.Graphics.createCanvas(vectorcanvas, function(pnt) { return map._toMapScreen(pnt); });
        if (vectorCanvasObj) { vectorCanvasObj.initialize(); }
        return vectorCanvasObj;
    },
    refresh: function() {
        this._loadLayersInView();
    },
    _clearImageTiles: function() {
        this._clearRequestStack();
        this._tilesInView = {};
        var imgs = null;
        if (this._layersDiv.querySelectorAll) {
            imgs = this._layersDiv.querySelectorAll('.esriMapImage');
        }
        else { imgs = this._layersDiv.getElementsByTagName('img'); }
        for (var idx = 0; idx < imgs.length; idx++) { this._removeElement(imgs[idx]); }
        this._layersDiv.innerHTML = '';
        this._layerReferences = {};
        var ext = this.get_extent();
        this._gridOrigin = new ESRI.ADF.Geometries.Point(ext.get_xmin(), ext.get_ymax());
        this._extent = null;
        this._containerDiv.style.left = 0;
        this._containerDiv.style.top = 0;
        this._containerDivPos = [0, 0];
        this._raiseEvent('gridOriginChanged', this._gridOrigin);
    },
    _clearOldImageTiles: function() {
        if (!this._oldLayersDiv) { return; }
        this._oldLayersDiv.style.display = 'none';
        var imgs = null;
        if (this._oldLayersDiv.querySelectorAll) {
            imgs = this._oldLayersDiv.querySelectorAll('.esriMapImage');
        }
        else { imgs = this._oldLayersDiv.getElementsByTagName('img'); }
        for (var idx = 0; idx < imgs.length; idx++) { this._removeElement(imgs[idx]); }
        imgs = null;
        this._removeElement(this._oldLayersDiv);
        this._oldLayersDiv = null;
    },
    _clearResourceImageTiles: function(resource) {
        //Clear request stack
        var layerid = this._getLayerId(resource);
        var idx = 0;
        for (idx = this._requestStack.length - 1; idx >= 0; idx--) {
            if (this._requestStack[idx].startsWith(layerid)) {
                this._tilesInView[this._requestStack[idx]] = null;
            }
        }
        //Clear loaded tiles list
        for (idx in this._tilesInView) {
            if (idx != null && idx.startsWith(layerid)) {
                this._tilesInView[idx] = null;
            }
        }
        //clear layer
        var layer = this._layerReferences[layerid]
        if (layer) {
            var imgs = null;
            if (layer.querySelectorAll) {
                imgs = layer.querySelectorAll('.esriMapImage');
            }
            else { imgs = layer.getElementsByTagName('img'); }
            for (idx = imgs.length - 1; idx >= 0; idx--) { this._removeElement(imgs[idx]); }
            layer.innerHTML = '';
        }
    },
    refreshLayer: function(layer) {
        /// <summary>Reloads the images in the given layer<summary>
        /// <param name="layer" type="ESRI.ADF.MapResources.Layer">Layer to refresh</param>		
        this._clearResourceImageTiles(layer);
        this._updateLayer(layer);
    },
    _updateLayer: function(resource) {
        if (!resource || !resource.get_isInitialized()) { return; }
        var layerid = this._getLayerId(resource);
        var layer = this._layerReferences[layerid]
        if (!resource.get_visible()) {
            if (layer) { this._removeElement(layer); }
            layer = null;
            this._layerReferences[layerid] = null;
            return;
        }
        if (!layer) { layer = this._createLayerDiv(resource); }
        if (ESRI.ADF.Layers.DynamicLayer.isInstanceOfType(resource)) {
            var ext = this.get_extent();
            if (!resource.get_useTiling()) {
                if (!ext.intersects(resource.get_extent())) { if (layer) { this._layerReferences[layerid] = null; this._removeElement(layer); } return; }
                this._loadImageInView(layerid, ext, resource);
            }
            else {
                if (!ext.intersects(resource.get_extent())) { return; }
                this._loadDynamicTilesInView(resource, layerid);
            }
        }
        else if (ESRI.ADF.Layers.TileLayer.isInstanceOfType(resource)) {
            this._loadResourceTilesInView(resource, layer);
        }
    },
    _loadLayersInView: function() {
        if (!this.get_isInitialized()) { return; }
        this.checkMapsize(true);
        if (this._mapsize[0] === 0 || this._mapsize[1] === 0) {
            return;
        }
        this._assotateCanvas.adjustCanvasExtent(this._containerDivPos[0], this._containerDivPos[1], this._mapsize[1], this._mapsize[0]);
        if (this.get_layers().get_layerCount() > 0) {
            //Loads any missing images and tiles in the view. Called on extentChanged
            if (this.disabled) { return; }
            var ext = this.get_extent();
            if (ext.get_area() === 0) { return; }
            var level = this.get_layers().getLevelByNearestPixelsize(this._pixelsizeX);
            if (level !== null) {
                var resX = this.get_layers().get_levelResolution(level);
                if (this._pixelsizeX !== resX) { //Levels cannot match the current pixelsize - Zoom first
                    this._suppressExtentChanged = true;
                    this.zoom(this._pixelsizeX / resX, null, false);
                    this._suppressExtentChanged = false;
                }
            }
            for (var idx = 0; idx < this._layers.get_layerCount(); idx++) {
                var resource = this._layers.get_layer(idx);
                this._updateLayer(resource);
            }
        }
        this.refreshGraphics();
    },
    _createLayerDiv: function(resource) {
        var index = this._layers.indexOf(resource);
        if (index < 0) return null;
        var layer = document.createElement('div');
        layer.id = this._getLayerId(resource);
        layer.style.position = 'absolute';
        layer.style.left = 0;
        layer.style.top = 0;
        layer.resourceName = resource.get_id();
        this._layerReferences[layer.id] = layer;
        var layerNodes = this._layersDiv.childNodes;
        var length = layerNodes.length;
        var nodeInserted = false;
        for (var i = 0; i < length; i++) {
            var node = layerNodes[i];
            var name = node.resourceName;
            if (!name) { continue; }
            var res = $find(name);
            if (!res) { continue; }
            var idx = this._layers.indexOf(res);
            if (idx > index) {
                this._layersDiv.insertBefore(layer, node);
                nodeInserted = true;
                break;
            }
        }
        if (!nodeInserted) { this._layersDiv.appendChild(layer); }

        if (Sys.Browser.agent !== Sys.Browser.InternetExplorer && resource.get_opacity() < 1 && resource.get_imageFormat() !== 'png32') {
            ESRI.ADF.System.setOpacity(layer, resource.get_opacity());
        }
        return layer;
    },
    _loadImageInView: function(layerid, ext, resource) {
        //Requests a dynamic resource for an image that covers the current view
        //clip the extent to the resource but add a buffer to ensure symbols are not clipped
        var ext2 = resource.get_extent();
        if (this._rotation.angle === 0) {
            var w = this._clipExtentBuffer * this._pixelsizeX;
            var h = this._clipExtentBuffer * this._pixelsizeY;
            ext2 = new ESRI.ADF.Geometries.Envelope(ext2.get_xmin() - w, ext2.get_ymin() - h, ext2.get_xmax() + w, ext2.get_ymax() + h);
            ext2 = ext.intersection(ext2);
        }
        else { ext2 = ext; }
        var width = this._mapsize[0];
        var height = this._mapsize[1];
        width = Math.round(width * (ext2.get_width() / ext.get_width()));
        height = Math.round(height * (ext2.get_height() / ext.get_height()));
        //account for rounding errors		
        ext2.set_xmax(ext2.get_xmin() + width * this._pixelsizeX);
        ext2.set_ymax(ext2.get_ymin() + height * this._pixelsizeY);
        var id = layerid + '_img';
        this._removePendingStackStartingWith(id, true, true);
        if (!this._dynamicImageCounter) { this._dynamicImageCounter = 0; }
        id += this._dynamicImageCounter;
        this._dynamicImageCounter++;
        this._addPendingStack(id);
        var format = resource.get_imageFormat();
        var onready = function(url, adjExtent) {
            this._addImageOnReady(layerid, ext2, url, resource.get_opacity(), id, format, false);
            onready = null;
        };
        var del = Function.createDelegate(this, onready);
        resource.getUrl(ext2.get_xmin(), ext2.get_ymin(), ext2.get_xmax(), ext2.get_ymax(), width, height, del);
    },
    _loadTilesInView: function() {
        //Loads any missing tiles in the view. Called continuously on Panning event
        for (var idx = 0; idx < this._layers.get_layerCount(); idx++) {
            var resource = this._layers.get_layer(idx);
            if (resource && resource.get_isInitialized() && resource._visible) {
                if (ESRI.ADF.Layers.TileLayer.isInstanceOfType(resource)) {
                    var layerid = this._getLayerId(resource);
                    var layer = this._layerReferences[layerid]
                    if (!layer) { layer = this._createLayerDiv(resource); }
                    this._loadResourceTilesInView(resource, layer, idx === 0);
                    layer = null;
                }
                else if (ESRI.ADF.Layers.DynamicLayer.isInstanceOfType(resource) && resource.get_useTiling()) {
                    var dynlayerid = this._getLayerId(resource);
                    var dynlayer = this._layerReferences[dynlayerid]
                    if (!dynlayer) { dynlayer = this._createLayerDiv(resource); }
                    this._loadDynamicTilesInView(resource, dynlayerid, idx === 0);
                    dynlayer = null;
                }
            }
        }
    },
    _loadDynamicTilesInView: function(resource, layerid) {
        var tiles = this._getDynamicTiles(resource, this.get_extent());
        for (var idx in tiles) {
            this._addDynamicTile(tiles[idx], layerid, resource);
        }
    },
    _getDynamicTiles: function(resource, ext) {
        var tilesize = resource.get_tilesize();
        if (!tilesize) {
            if (!this._dynTileSize || this._dynTileSize[0] == 0 || this._dynTileSize[1] == 0) {
                this._dynTileSize = this._mapsize;
                if (this._dynTileSize[0] > 1024) { this._dynTileSize[0] = 1024; }
                if (this._dynTileSize[1] > 1024) { this._dynTileSize[1] = 1024; }
            }
            tilesize = this._dynTileSize;
        }
        var tiles = {};
        if (tilesize[0] > 0 && tilesize[1] > 0) {
            var tilesizeMap = [tilesize[0] * this._pixelsizeX, tilesize[1] * this._pixelsizeY];
            var startcol = Math.floor((ext.get_xmin() - this._gridOrigin.coordinates[0]) / tilesizeMap[0]);
            var startrow = Math.floor((this._gridOrigin.coordinates[1] - ext.get_ymax()) / tilesizeMap[1]);
            var endcol = Math.floor((ext.get_xmax() - this._gridOrigin.coordinates[0] - this._pixelsizeX * 0.5) / tilesizeMap[0]);
            var endrow = Math.floor((this._gridOrigin.coordinates[1] - ext.get_ymin() - this._pixelsizeY * 0.5) / tilesizeMap[1]);
            var idx = 0;
            for (var row = startrow; row <= endrow; row++) {
                var top = this._gridOrigin.coordinates[1] - row * tilesizeMap[1];
                for (var col = startcol; col <= endcol; col++) {
                    var left = this._gridOrigin.coordinates[0] + col * tilesizeMap[0];
                    tiles[idx] = { "env": [left, top - tilesizeMap[1], left + tilesizeMap[0], top], "row": row, "col": col, "width": tilesize[0], "height": tilesize[1] };
                    idx++;
                }
            }
        }
        return tiles;
    },
    _loadResourceTilesInView: function(resource, layer) {
		if (resource.get_minimumResolution() < this._pixelsizeX - this._pixelsizeX/256 ||
			resource.get_maximumResolution() > this._pixelsizeX + this._pixelsizeX/256) { return; }

        var currentLevel = resource.getLevelByNearestPixelsize(this._pixelsizeX);
        var res = resource.get_levels()[currentLevel].get_resX();
        var lod = this._pixelsizeX;
        if (!this._layers._resolutionsAreSame(lod, res)) { return; }
        if (currentLevel !== null) { lod = resource.getLevelInfo(currentLevel).get_resX(); }
        if (lod) {
            var tiles = resource.getTileSpanWithin(this.get_extent(), currentLevel);
            for (var column = tiles[0]; column <= tiles[2]; column++) {
                for (var row = tiles[1]; row <= tiles[3]; row++) {
                    this._addTile(column, row, currentLevel, layer, resource);
                }
            }
        }
    },
    _isTileInPendingStack: function(id) {
        return Array.contains(this._requestStack, id);
    },
    _clearRequestStack: function() {
        if (this._requestStack) {
            var elm = null; var img = null; var parent = null;
            while (this._requestStack.length > 0) {
                elm = Array.dequeue(this._requestStack);
                img = $get(elm);
                if (img) {
                    parent = img.parentNode;
                    this._removeElement(img);
                    if (ESRI.ADF.System.__isIE6 && parent) { this._removeElement(parent); }
                }
            }
        }
        else { this._requestStack = []; }
        this._raiseEvent('onProgress', 0);
    },
    _addPendingStack: function(id) {
        Array.add(this._requestStack, id);
        this._raiseEvent('onProgress', this._requestStack.length);
    },
    _removePendingStack: function(id, removeImg, suppressEvent) {
        if (removeImg === true) {
            var img = $get(id);
            if (img) {
                var parent = img.parentNode;
                this._removeElement(img);
                if (ESRI.ADF.System.__isIE6 && parent) { this._removeElement(parent); }
            }
        }
        if (Array.contains(this._requestStack, id)) {
            Array.remove(this._requestStack, id);
            if (!suppressEvent) { this._raiseEvent('onProgress', this._requestStack.length); }
            if (this._requestStack.length === 0 && this._oldLayersDiv) { this._clearOldImageTiles(); }
        }
    },
    _removePendingStackStartingWith: function(id, removeImg, suppressEvent) {
        Array.forEach(this._requestStack, function(imgid, index, arr) { if (imgid.startsWith(id)) { this._removePendingStack(imgid, removeImg, suppressEvent); } }, this);
    },
    _removeOutsideTiles: function() {
        //remove tiles far outside the view. Called on panCompleted
        //Any tile more than one window width/height away from the current view will be removed
        //Build array of valid tiles
        var tilesToKeep = [];
        for (var resourceIndex = 0; resourceIndex < this.get_layers().get_layerCount(); resourceIndex++) {
            var resource = this.get_layers().get_layer(resourceIndex);
            if (resource && resource.get_visible() === true) {
                var extent = this.get_extent();
                if (this._tileBuffer === null || typeof (this._tileBuffer) == 'undefined' || this._tileBuffer < 0) {
                    bufferWidth = extent.get_width();
                    bufferHeight = extent.get_height();
                }
                else { bufferWidth = bufferHeight = this._tileBuffer * this._pixelsizeX; }
                extent.set_xmin(extent.get_xmin() - bufferWidth);
                extent.set_xmax(extent.get_xmax() + bufferWidth);
                extent.set_ymin(extent.get_ymin() - bufferHeight);
                extent.set_ymax(extent.get_ymax() + bufferHeight);
                if (ESRI.ADF.Layers.TileLayer.isInstanceOfType(resource)) {
                    var currentLevel = resource.getLevelByNearestPixelsize(this._pixelsizeX);
                    var res = resource.get_levels()[currentLevel].get_resX();
                    var lod = this._pixelsizeX;
                    if (!this._layers._resolutionsAreSame(lod, res)) { continue; }
                    var tiles = resource.getTileSpanWithin(extent, currentLevel);
                    for (var column = tiles[0]; column <= tiles[2]; column++) {
                        for (var row = tiles[1]; row <= tiles[3]; row++) {
                            Array.add(tilesToKeep, this._getTileId(resource, row, column, currentLevel));
                        }
                    }
                }
                else if (ESRI.ADF.Layers.DynamicLayer.isInstanceOfType(resource) && resource.get_useTiling()) {
                    var tiles2 = this._getDynamicTiles(resource, extent);
                    for (var idx in tiles2) {
                        Array.add(tilesToKeep, this._getTileId(resource, tiles2[idx].row, tiles2[idx].col, this._pixelsizeX));
                    }
                }
            }
        }
        //check whether loaded tiles are in the valid tiles array. If not, remove them
        for (var id in this._tilesInView) {
            if (id && !Array.contains(tilesToKeep, id)) {
                this._removePendingStack(id, true);
                this._tilesInView[id] = null;
            }
        }
    },
    _getTileId: function(resource, row, column, level) {
        return this._getLayerId(resource) + '_r' + row + 'c' + column + 'l' + level;
    },
    _getLayerId: function(resource) {
        return this._layersDiv.id + '_' + resource.get_id();
    },
    _removeElement: function(element) {
        /// <summary>
        /// IE has a pseudo memoryleak with removeChild.
        /// Remove element from DOM by setting innerHTML, and also remove any eventhandlers attached to the object
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">Element to remove</param>
        if (!element) { return; }
        $clearHandlers(element);
        var garbageBin = $get('IELeakGarbageBin');
        if (!garbageBin) {
            garbageBin = document.createElement('DIV');
            garbageBin.id = 'IELeakGarbageBin';
            garbageBin.style.display = 'none';
            document.body.appendChild(garbageBin);
        }
        garbageBin.appendChild(element);
        if (element.tagName === 'img' || element.tagName === 'IMG') { element.removeAttribute('src'); }
        garbageBin.innerHTML = '';
    },
    _addTile: function(column, row, currentLevel, layer, resource) {
        var tileid = this._getTileId(resource, row, column, currentLevel);
        if (!this._tilesInView[tileid]) {
            this._tilesInView[tileid] = true;
            var tileEnv = resource.getTileExtent(column, row, currentLevel);
            this._addPendingStack(tileid);
            var format = resource.get_imageFormat();
            var handler = Function.createDelegate(this, function(url) { this._addTileOnReady(tileid, tileEnv, resource.get_opacity(), layer, url, format); handler = null; });
            resource.getTileUrl(column, row, currentLevel, handler);
        }
    },
    _addDynamicTile: function(tile, layerid, resource) {
        var tileid = this._getTileId(resource, tile.row, tile.col, this._pixelsizeX);
        if (!this._tilesInView[tileid]) {
            var tileEnv = new ESRI.ADF.Geometries.Envelope(tile.env[0], tile.env[1], tile.env[2], tile.env[3]);
            if (!resource.get_extent().intersects(tileEnv)) { return; }
            this._tilesInView[tileid] = true;
            this._addPendingStack(tileid);
            var format = resource.get_imageFormat();
            var handler = Function.createDelegate(this, function(url) {
                this._addImageOnReady(layerid, tileEnv, url, resource.get_opacity(), tileid, format, true);
                handler = null;
            });
            resource.getUrl(tile.env[0], tile.env[1], tile.env[2], tile.env[3], tile.width, tile.height, handler);
        }
    },
    _addTileOnReady: function(tileid, tileEnv, opacity, layer, url, format) {
        //Adds a tile image to the map  -invoked by the resource's callback
        var img = new Image();
        var container = null;
        var upperLeft = this._toMapScreen(new ESRI.ADF.Geometries.Point(tileEnv.get_xmin(), tileEnv.get_ymax()));
        var bottomRight = this._toMapScreen(new ESRI.ADF.Geometries.Point(tileEnv.get_xmax(), tileEnv.get_ymin()));
        var width = bottomRight.offsetX - upperLeft.offsetX;
        var height = bottomRight.offsetY - upperLeft.offsetY;

        if (ESRI.ADF.System.__isIE6) {
            //In IE6 we need to put images in a container and apply opacity to the div
            //to prevent artifacts in PNG images
            container = document.createElement('div');
            container.className = 'esriMapImage';
            container.appendChild(img);
            container.style.width = width + 'px';
            container.style.height = height + 'px';
            img.format = format;
            img.style.width = '100%';
            img.style.height = '100%';
        }
        else {
            img.className = 'esriMapImage';
            img.style.width = width + 'px';
            img.style.height = height + 'px';
            container = img;
        }
        container.style.position = 'absolute';
        container.style.left = upperLeft.offsetX + 'px';
        container.style.top = upperLeft.offsetY + 'px';

        img.id = tileid;
        if (!this._fncTileOnLoad) {
            this._fncTileOnLoad = function(e) {
                var img = e.target;
                if (Sys.Browser.agent === Sys.Browser.Firefox) {
                    img = e.rawEvent.currentTarget;
                }
                if (!this._isTileInPendingStack(img.id)) {
                    this._removeElement(img);
                    return;
                }
                this._removePendingStack(img.id, false);
                $clearHandlers(img);
                img.onerror = null;
                img.style.display = 'block';
                if (ESRI.ADF.System.__isIE6 && img.format.startsWith('png')) { ESRI.ADF.System.setIEPngTransparency(img, img.src); }
                img = null;
                if (Sys.Browser.agent === Sys.Browser.InternetExplorer && !this._fadingStarted && this._animationSettings.enableFadeTransition && !this._animationSettings.disableNavigationAnimation) {
                    this._fadingStarted = true;
                    if (this._layersDiv.filters[0]) {
                        this._layersDiv.filters[0].Play();
                        window.setTimeout(Function.createDelegate(this, function() { this._layersDiv.style.filter = ''; }), 500);
                    }
                }
            };
        }
        if (!this._fncTileOnError) {
            this._fncTileOnError = Function.createDelegate(this, function(e) {
                var img = null;
                if (!e) e = window.event;
                if (e.srcElement) {
                    img = window.event.srcElement;
                }
                else if (e.currentTarget) {
                    img = e.currentTarget;
                }
                if (!img) { return; }
                img.onerror = null;
                $clearHandlers(img);
                Sys.Debug.trace('Failure loading tile "' + img.id + '" from ' + img.src);
                this._removeElement(img);
                if (!this._isTileInPendingStack(img.id)) { return; }
                this._removePendingStack(img.id, true);
                img = null;
            });
        }
        $addHandlers(img, { 'load': this._fncTileOnLoad }, this);
        img.onerror = this._fncTileOnError; //MSAJAX 3.5 doesn't support the 'error' event using $addHandler
        if (Sys.Browser.agent !== Sys.Browser.InternetExplorer) { img.style.display = 'none'; }
        else if (opacity < 1 && format !== 'png32') { ESRI.ADF.System.setOpacity(container, opacity); }
        layer.appendChild(container);
        img.src = url;
        img = null;
        container = null;
    },
    _addImageOnReady: function(layerid, extent, url, opacity, id, format, keepOld) {
        //Adds a dynamic image to the map - invoked by the layer's callback
        if (!this._isTileInPendingStack(id)) { return; }
        if (!url || url === '') { //Handler returned no image -> Cancel load
            this._removePendingStack(id, false);
            return;
        }
        var layer = this._layerReferences[layerid]
        if (!layer) { this._removePendingStack(id, false); return; }

        if (Array.contains(this._pendingSrcImages, id)) {
            var img2 = $get(id);
            if (img2) {
                var parent = img2.parentNode;
                this._removeElement(img2);
                if (ESRI.ADF.System.__isIE6) {
                    this._removeElement(parent);
                }
            }
            img2 = null;
        }
        else {
            Array.add(this._pendingSrcImages, id);
        }

        var currentImage = $get(id);
        if (currentImage && !keepOld) { currentImage.id += '_old'; }
        var img = new Image();
        img.id = id;
        img.alt = '';
        if (Sys.Browser.agent === Sys.Browser.Safari) {
            img.style.KhtmlUserSelect = 'none';
            img.onmousedown = function() { return false; }
        }
        var container = null;
        if (ESRI.ADF.System.__isIE6) {
            //In IE6 we need to put images in a container and apply opacity to the container
            //to prevent artifacts in PNG images. Unfortunately we cannot put opacity on the
            //layerdiv, because absolute positioned elements doesn't inherit opacity.
            container = document.createElement('div');
            container.className = 'esriMapImage';
            container.appendChild(img);
            container.style.width = Math.round(extent.get_width() / this._pixelsizeX) + 'px';
            container.style.height = Math.round(extent.get_height() / this._pixelsizeY) + 'px';
            img.format = format;
            img.style.width = '100%';
            img.style.height = '100%';
        }
        else {
            img.className = 'esriMapImage';
            img.style.width = Math.round(extent.get_width() / this._pixelsizeX) + 'px';
            img.style.height = Math.round(extent.get_height() / this._pixelsizeY) + 'px';
            container = img;
        }
        var upperLeft = new ESRI.ADF.Geometries.Point(extent.get_xmin(), extent.get_ymax());
        var imgpos = this._toMapScreen(upperLeft);
        container.style.position = 'absolute';
        if (this._rotation.angle === 0) {
            container.style.left = imgpos.offsetX + 'px';
            container.style.top = imgpos.offsetY + 'px';
        }
        else {
            container.style.left = -this._containerDivPos[0] + 'px';
            container.style.top = -this._containerDivPos[1] + 'px';
        }
        //Retain previous image until the new image has been downloaded
        if (!this._fncImageOnLoad) {
            this._fncImageOnLoad = Function.createDelegate(this, this._onImageTileLoaded);
        }
        if (keepOld) { img.keepOld = 'true'; }
        else { img.keepOld = 'false'; }
        $addHandler(img, 'load', this._fncImageOnLoad);
        if (Sys.Browser.agent !== Sys.Browser.InternetExplorer) { img.style.display = 'none'; }
        else if (opacity < 1 && format !== 'png32') {
            ESRI.ADF.System.setOpacity(img, opacity); //In other browsers we set opacity on the layerdiv
        }
        layer.appendChild(container);
        img.src = url;
        img = null;
        container = null;
    },
    _onImageTileLoaded: function(e) {
        //called by the dynamic image's onload event.
        var img = e.target;
        Array.remove(this._pendingSrcImages, img.id);
        if (Sys.Browser.agent === Sys.Browser.Firefox) { img = e.rawEvent.currentTarget; }
        $clearHandlers(img);
        if (!this._isTileInPendingStack(img.id)) {
            this._tilesInView[img.id] = null;
            var parent = img.parentNode;
            this._removeElement(img);
            if (ESRI.ADF.System.__isIE6) { this._removeElement(parent); }
            return;
        }
        this._removePendingStack(img.id, false);
        var layer = img.parentNode;
        if (ESRI.ADF.System.__isIE6) { layer = layer.parentNode; }
        if (img.keepOld !== 'true') {
            var imgs = null;
            if (layer.querySelectorAll) {
                imgs = layer.querySelectorAll('.esriMapImage');
            }
            else { imgs = layer.getElementsByTagName('img'); }
            for (var idx = imgs.length - 1; idx >= 0; idx--) {
                if (imgs[idx].id !== img.id) {
                    if (ESRI.ADF.System.__isIE6) {
                        var prnode = imgs[idx].parentNode;
                        this._removeElement(imgs[idx]);
                        this._removeElement(prnode);
                    }
                    else { this._removeElement(imgs[idx]); }
                }
            }
        }
        if (Sys.Browser.agent === Sys.Browser.InternetExplorer && !this._fadingStarted && this._animationSettings.enableFadeTransition && !this._animationSettings.disableNavigationAnimation) {
            this._fadingStarted = true;
            if (this._layersDiv.filters && this._layersDiv.filters[0]) {
                this._layersDiv.filters[0].Play();
                window.setTimeout(Function.createDelegate(this, function() { this._layersDiv.style.filter = ''; }), 500);
            }
        }
        if (ESRI.ADF.System.__isIE6 && img.format.startsWith('png')) { ESRI.ADF.System.setIEPngTransparency(img, img.src, false, img.format); }
        img.style.display = 'block';
        img = null;
    },
    //
    // Internal DOM event handlers
    //
    _makeMouseEventRelativeToMap: function(e, resetLocation) {
        //Child elements of the map will return mouseevent of the parent, but coordinates are relative to the child
        //This method will change coordinates and target to the map control
        //Calculating location is expensive, so only set resetLocation===true on events that rarely fire (ie. not mousemove)
        if (!this._controlDivLocation || resetLocation) { this._controlDivLocation = Sys.UI.DomElement.getLocation(this._controlDiv); }
        e = ESRI.ADF.System._makeMouseEventRelativeToElement(e, this._controlDiv, this._controlDivLocation);
        e.coordinate = this.toMapPoint(e.offsetX, e.offsetY);
        return e;
    },
    _raiseEvent: function(name, e) {
        if (!this.get_isInitialized()) { return; }
        var handler = this.get_events().getHandler(name);
        if (handler) { if (e === null || typeof (e) === 'undefined') { e = Sys.EventArgs.Empty; } handler(this, e); }
    },
    //Mouse handlers
    _hookEventsOnMouseEnter: function(e) {
        if (this._mouseInsideViewer === true) { return; }
        //only IE support mouseEnter - perform check
        if (Sys.Browser.agent !== Sys.Browser.InternetExplorer && e && (this._isZooming || !this._isMouseEnter(e.rawEvent, this.get_element()))) {
            return;
        }
        this._mouseInsideViewer = true;
        if (this._mouseDragState) { return; } //We are dragging
        if (!this._mapActiveEventsAttached) {
            this._mapActiveEventsAttached = true;
            ESRI.ADF.UI.__DomEvent.__addHandler((Sys.Browser.agent === Sys.Browser.InternetExplorer) ? document.body : window, 'mousemove', this._mouseMoveHandler);
            $addHandler(document, 'keydown', this._onKeyDownHandler);
            $addHandler(document, 'keyup', this._onKeyUpHandler);
        }
        this._raiseEvent('mouseOver', e);
    },
    _unhookEventsOnMouseLeave: function(e) {
        //only IE support mouseLeave - perform check
        if (Sys.Browser.agent !== Sys.Browser.InternetExplorer && e && (this._isZooming || !this._isMouseLeave(e.rawEvent, this.get_element()))) {
            return;
        }
        this._mouseInsideViewer = false;
        if (this._mouseDragState) { return; } //We are dragging - unhook at mouse up
        this._raiseEvent('mouseOut', e);
        if (this._mapActiveEventsAttached) {
            $removeHandler((Sys.Browser.agent === Sys.Browser.InternetExplorer) ? document.body : window, 'mousemove', this._mouseMoveHandler);
            $removeHandler(document, 'keydown', this._onKeyDownHandler);
            $removeHandler(document, 'keyup', this._onKeyUpHandler);
            this._mapActiveEventsAttached = false;
        }
    },
    _isMouseEnter: function(e, handler) {
        if (e.type !== 'mouseover') return false;
        var reltg = e.relatedTarget ? e.relatedTarget : e.fromElement;
        while (reltg && reltg !== handler) reltg = reltg.parentNode;
        return (reltg !== handler);
    },
    _isMouseLeave: function(e, handler) {
        if (e.type !== 'mouseout') return false;
        var reltg = e.relatedTarget ? e.relatedTarget : e.toElement;
        while (reltg && reltg !== handler) reltg = reltg.parentNode;
        return (reltg !== handler);
    },
    _onMouseMove: function(evt) {
        var e = this._makeMouseEventRelativeToMap(evt, false);
        this._raiseEvent('mouseMove', e);
        if (this._mouseDragState) {
            if (this._mouseDragState.button === e.button && this._mouseDragState.mousedownX && this._mouseDragState.mousedownY &&
				this._mouseDragState.button === Sys.UI.MouseButton.leftButton) {
                //dragging with a mouse button down
                e.originX = this._mouseDragState.mousedownX;
                e.originY = this._mouseDragState.mousedownY;
                e.deltaX = e.offsetX - this._mouseDragState.mousedownX;
                e.deltaY = e.offsetY - this._mouseDragState.mousedownY;
                e.mousedownCoordinate = this._mouseDragState.mousedownCoordinate;
                this._raiseEvent('mouseDragging', e);
                evt.preventDefault();
                evt.stopPropagation();
            }
            this._mouseDragState.previousOffsetX = e.offsetX;
            this._mouseDragState.previousOffsetY = e.offsetY;
        }
    },
    _onMouseDown: function(e) {
        e = this._makeMouseEventRelativeToMap(e, true);
        if (!this._mapActiveEventsAttached) { this._hookEventsOnMouseEnter(); }
        if (!this._mouseUpEventAttached) {
            ESRI.ADF.UI.__DomEvent.__addHandler((Sys.Browser.agent === Sys.Browser.InternetExplorer) ? document.body : window, 'mouseup', this._mouseUpHandler);
            this._mouseUpEventAttached = true;
        }
        if (!this._isZooming) {
            this._mouseDragState = {
                "mousedownX": e.offsetX, "mousedownY": e.offsetY,
                "previousOffsetX": e.offsetX, "previousOffsetY": e.offsetY,
                "button": e.button, "mousedownCoordinate": e.coordinate,
                "startExtent": this.get_extent()
            };
        }
        this._raiseEvent('mouseDown', e);
    },
    _onMouseUp: function(evt) {
        var e = this._makeMouseEventRelativeToMap(evt, true);
        this._raiseEvent('mouseUp', e);
        if (this._mouseDragState && this._mouseDragState.button === e.button) {
            if (this._mouseUpEventAttached) {
                $removeHandler((Sys.Browser.agent === Sys.Browser.InternetExplorer) ? document.body : window, 'mouseup', this._mouseUpHandler);
                this._mouseUpEventAttached = false;
            }
            this._controlDivLocation = null;
            if (this._mouseDragState.mousedownX && this._mouseDragState.mousedownY &&
				(this._mouseDragState.mousedownX !== e.offsetX || this._mouseDragState.mousedownY !== e.offsetY)) {
                //Drag end
                e.originX = this._mouseDragState.mousedownX;
                e.originY = this._mouseDragState.mousedownY;
                e.deltaX = e.offsetX - this._mouseDragState.mousedownX;
                e.deltaY = e.offsetY - this._mouseDragState.mousedownY;
                e.mousedownCoordinate = this._mouseDragState.mousedownCoordinate;
                e.mouseStartExtent = this._mouseDragState.startExtent;
                this._mouseDragState = null;
                if (!this._mouseInsideViewer) {
                    this._unhookEventsOnMouseLeave();
                }
                this._raiseEvent('mouseDragCompleted', e);
            }
            else if (this._mouseDragState.mousedownX && this._mouseDragState.mousedownY &&
				(this._mouseDragState.mousedownX === e.offsetX || this._mouseDragState.mousedownY === e.offsetY)) {
                //mouse down+up with no drag in between = click
                this._mouseDragState = null;
                this._raiseEvent('click', e);
            }
        }
        evt.preventDefault();
        evt.stopPropagation();
    },
    _onMouseWheel: function(e) {
        this._mouseDragState = null;
        //if(this._mouseMode !== ESRI.ADF.UI.MouseMode.Custom) {
        if (e.target.namespaceURI && e.target.namespaceURI === 'http://www.w3.org/2000/svg') {
            //Workaround getLocation bug in MS Ajax when mousewheel'ing on SVG graphics
            e.offsetX += parseInt(this._assotateCanvas._svgRoot.style.left, 10);
            e.offsetY += parseInt(this._assotateCanvas._svgRoot.style.top, 10);
            e.target = this._assotateCanvas._svgRoot.parentNode;
        }
        e = this._makeMouseEventRelativeToMap(e, true);
        var now = new Date();
        //Prevent zooming too many times too fast
        if (!this._lastScrollZoomDate || (now - this._lastScrollZoomDate) > 150) {
            if (Sys.Browser.agent === Sys.Browser.InternetExplorer && this._animationSettings.enableFadeTransition && !this._animationSettings.disableNavigationAnimation && this._layersDiv.filters[0] && this._layersDiv.filters[0].status === 1) {
                return;
            }
            this.zoom(this._getZoomFactor(e.wheelDelta * this._mouseWheelDirection > 0), e.coordinate);
            this._lastScrollZoomDate = now;
        }
        //}
    },
    _onDblClick: function(e) {
        e.preventDefault();
        e.stopPropagation();
        e = this._makeMouseEventRelativeToMap(e, true);
        if (this._mouseMode !== ESRI.ADF.UI.MouseMode.Custom) { this.zoom(this._getZoomFactor(true), e.coordinate); }
        this._raiseEvent('dblclick', e);
    },
    _onClick: function(s, e) {
        if (e.button === Sys.UI.MouseButton.leftButton) {
            if (this._mouseMode === ESRI.ADF.UI.MouseMode.ZoomIn) { this.zoom(this._getZoomFactor(true), e.coordinate); }
            else if (this._mouseMode === ESRI.ADF.UI.MouseMode.ZoomOut) { this.zoom(this._getZoomFactor(false), e.coordinate); }
        }
    },
    _getZoomFactor: function(zoomin) {
        if (!this._layers.__hasLevels()) { return (zoomin ? 2 : 0.5); }
        else {
            var level = this._layers.getLevelByNearestPixelsize(this._pixelsizeX);
            var level2Res = this._layers.get_levelResolution(level + (zoomin ? 1 : -1));
            if (!level2Res) { return 1; }
            else { return this._pixelsizeX / level2Res; }
        }
    },
    //Key handlers
    _onKeyDown: function(eventArgs) {
        this._raiseEvent('keyDown', eventArgs);
        if (this._keyActions[eventArgs.keyCode]) {
            this._fireKeyDownAction(this._keyActions[eventArgs.keyCode]);
            return;
        }
    },
    _onKeyUp: function(eventArgs) {
        this._raiseEvent('keyUp', eventArgs);
        if (this._keyActions[eventArgs.keyCode]) {
            this._fireKeyUpAction(this._keyActions[eventArgs.keyCode]);
            return;
        }
    },
    _fireKeyDownAction: function(keyaction) {
        if (!this._currentKeyActions) { this._currentKeyActions = []; }
        var isactive = Array.contains(this._currentKeyActions, keyaction);
        if (isactive && !keyaction.continuous) { return; }
        if (!isactive) { Array.add(this._currentKeyActions, keyaction); }
        if (keyaction.cursor) { this.get_element().style.cursor = keyaction.cursor; }
        keyaction.keydown();
    },
    _fireKeyUpAction: function(keyaction) {
        if (keyaction === 'all' && this._currentKeyActions) {
            for (var idx = 0; idx < this._currentKeyActions.length; idx++) {
                if (keyaction.keyup) { this._currentKeyActions[idx].keyup(); }
            }
            this._currentKeyActions = [];
            if (keyaction.cursor) { this.get_element().style.cursor = this.get_cursor(); }
            return;
        }
        if (!this._currentKeyActions || !Array.contains(this._currentKeyActions, keyaction)) { return; }
        if (keyaction.cursor) { this.get_element().style.cursor = this.get_cursor(); }
        Array.remove(this._currentKeyActions, keyaction);
        if (keyaction.keyup) { keyaction.keyup(); }
    },
    _doContinuousPan: function(x, y) {
        ///<summary>Moves the map the specified amount of pixels</summary>
        /// <param name="x" type="Number" integer="true">Number of pixels to move the map left</param>	
        /// <param name="y" type="Number" integer="true">Number of pixels to move the map up</param>	
        /// <remarks>
        /// Fires a <see cref="panning"> event when x and/or y is !== 0, and a <see cref="panCompleted"> when x and y is 0.
        /// Method is used by the keypanning and navigation control for performing continuous pan,
        /// and is not meant to be used by developers.
        /// It's important to call this method with two zeros when the continuous pan is completed.
        /// </remarks>
        if (!this._tmpKeyPanExtent) { this._tmpKeyPanExtent = this.get_extent(); }
        if (!x && !y) { this._raiseEvent('panCompleted', { "previous": this._tmpKeyPanExtent, "current": this.get_extent() }); this._tmpKeyPanExtent = null; return; }
        this._moveContainerDiv(x, y);
        this._raiseEvent('panning');
    },
    //
    // Internal object event handlers
    //
    _onMouseDragging: function(sender, args) {
        if (this._mouseMode === ESRI.ADF.UI.MouseMode.Pan) {
            this._onMapPanDragging(sender, args);
        }
        else if (this._mouseMode === ESRI.ADF.UI.MouseMode.ZoomIn || this._mouseMode === ESRI.ADF.UI.MouseMode.ZoomOut) {
            if (!this._tempDragBox) {
                this._tempDragBox = document.createElement('div');
                this._tempDragBox.style.border = 'solid 2px #333333';
                this._tempDragBox.style.backgroundColor = '#ffffff';
                this._tempDragBox.style.position = 'absolute';
                ESRI.ADF.System.setOpacity(this._tempDragBox, 0.5);
            }
            this._getEnvelopeDraggingHandler(sender, args);
        }
    },
    _onMouseDragCompleted: function(sender, args) {
        if (this._mouseMode === ESRI.ADF.UI.MouseMode.Pan) {
            this._onMapPanDragCompleted(sender, args);
        }
        else if (this._mouseMode === ESRI.ADF.UI.MouseMode.ZoomIn || this._mouseMode === ESRI.ADF.UI.MouseMode.ZoomOut) {
            this._getEnvelopeComplete(sender, args);
        }
    },
    _moveContainerDiv: function(x, y) {
        this._containerDivPos[0] -= x;
        this._containerDivPos[1] -= y;
        this._containerDiv.style.left = this._containerDivPos[0] + 'px';
        this._containerDiv.style.top = this._containerDivPos[1] + 'px';
        if (this._extent) {
            this._extent._xmin += x * this._pixelsizeX;
            this._extent._xmax += x * this._pixelsizeX;
            this._extent._ymin -= y * this._pixelsizeY;
            this._extent._ymax -= y * this._pixelsizeY;
        }
    },
    _onMapPanDragging: function(sender, e) {
        this._moveContainerDiv((this._mouseDragState.previousOffsetX - e.offsetX), (this._mouseDragState.previousOffsetY - e.offsetY));
        e.originX = this._mouseDragState.mousedownX;
        e.originY = this._mouseDragState.mousedownY;
        this._isPanning = true;
        this._raiseEvent('panning');
    },
    _onMapPanDragCompleted: function(sender, args) {
        this._isPanning = false;
        this._extent = null;
        this._raiseEvent('panCompleted', { "previous": args.mouseStartExtent, "current": this.get_extent() });
    },
    // zoom box methods
    _getEnvelopeDraggingHandler: function(sender, args) {
        if (!this._tempDragBox.parentNode) { this._containerDiv.appendChild(this._tempDragBox); }
        var from = this._toMapScreen(args.mousedownCoordinate);
        var to = this._toMapScreen(args.coordinate);
        var border = parseInt(this._tempDragBox.style.borderWidth, 10);
        var width = Math.abs(from.offsetX - to.offsetX) - border * 2 + (from.offsetX < to.offsetX ? 1 : 0);
        var height = Math.abs(from.offsetY - to.offsetY) - border * 2 + (from.offsetY < to.offsetY ? 1 : 0);
        if (width < 0) { width = 0; }
        if (height < 0) { height = 0; }
        this._tempDragBox.style.left = (from.offsetX < to.offsetX ? from.offsetX : to.offsetX) + 'px';
        this._tempDragBox.style.top = (from.offsetY < to.offsetY ? from.offsetY : to.offsetY) + 'px';
        this._tempDragBox.style.width = width + 'px';
        this._tempDragBox.style.height = height + 'px';
    },
    _getEnvelopeComplete: function(sender, args) {
        this._removeElement(this._tempDragBox);
        this._tempDragBox = null;
        var currentExtent = this.get_extent();
        var env = new ESRI.ADF.Geometries.Envelope(
			Math.min(args.mousedownCoordinate.get_x(), args.coordinate.get_x()),
			Math.min(args.mousedownCoordinate.get_y(), args.coordinate.get_y()),
			Math.max(args.mousedownCoordinate.get_x(), args.coordinate.get_x()),
			Math.max(args.mousedownCoordinate.get_y(), args.coordinate.get_y()), this._spatialReference);
        this._currentState = null;
        if (this._mouseMode === ESRI.ADF.UI.MouseMode.ZoomOut) {
            var newWidth = currentExtent.get_width() * (currentExtent.get_width() / env.get_width());
            var newheight = currentExtent.get_height() * (currentExtent.get_height() / env.get_height());
            env.set_xmin(currentExtent.get_xmin() - ((env.get_xmin() - currentExtent.get_xmin()) * (currentExtent.get_width() / env.get_width())));
            env.set_ymin(currentExtent.get_ymin() - ((env.get_ymin() - currentExtent.get_ymin()) * (currentExtent.get_height() / env.get_height())));
            env.set_xmax(currentExtent.get_xmin() + newWidth);
            env.set_ymax(currentExtent.get_ymin() + newheight);
        }
        //Check whether we can zoom further in
        var scaleFactor = currentExtent.get_width() / env.get_width();
        var toPx = this._pixelsizeX / scaleFactor;
        var toLevel = this.get_layers().getLevelByNearestPixelsize(toPx);
        if (toLevel !== null) { toPx = this.get_layers().get_levelResolution(toLevel); }
        if (this._pixelsizeX === toPx) { return; } //Can't zoom in. Cancel
        this.zoomToBox(env);
    },
    _onZoomStep: function(anim, startScale, endScale, orgScale) {
        this._extent = null;
        var ratio = this._pixelsizeY / this._pixelsizeX;
        this._recalculateContainerOffset();
        this._pixelsizeX = orgScale / anim.interpolate(startScale, endScale, anim.get_percentComplete());
        this._pixelsizeY = this._pixelsizeX * ratio;
        this._raiseEvent('extentChanging');
    },
    _resetGridOffset: function() {
        //resets the grid offset, to prevent pixels values getting too big
        //This will require a redraw of the map
        var ext = this.get_extent();
        this._clearImageTiles();
        this._gridOrigin = new ESRI.ADF.Geometries.Point(ext.get_xmin(), ext.get_ymax());
        this._extent = null;
        this._containerDivPos = [0, 0];
        this._containerDiv.style.left = 0;
        this._containerDiv.style.top = 0;
        this._raiseEvent('gridOriginChanged', this._gridOrigin);
    },
    _onResize: function(e) {
        if (Sys.Browser.agent === Sys.Browser.InternetExplorer) {
            //IE fires this event continuously, so wait a bit before triggering the event
            if (this._resizeTimer) { window.clearTimeout(this._resizeTimer); }
            this._resizeTimer = window.setTimeout(Function.createDelegate(this, this._onResizeComplete), 1000);
        }
        else { this._onResizeComplete(); }
    },
    _onResizeComplete: function() {
        this._resizeTimer = null;
        this.checkMapsize();
    },
    checkMapsize: function(suppressEvent) {
        /// <summary>Checks the current size of the map view for any change.</summary>
        /// <param name="suppressEvent" type="Boolean" mayBeNull="true">
        /// If true, will suppress the extent changed event if the map view size has changed.
        /// </param>
        /// <remarks>
        /// If you manually change the size of the map element, calling this method
        /// will ensure that all layers fill the entire view and causing layer refresh if necessary.
        /// </remarks>
        var size = this._getInternalElementSize(this.get_element());
        if (this._mapsize[0] !== size[0] || this._mapsize[1] !== size[1]) {
            this._tmpExtent = this.get_extent();
            this._mapsize = size;
            this._extent = null;
            this._controlDivLocation = null;
            this._raiseEvent('mapResized', size);
            if (this._rotation.angle !== 0) { this.refreshGraphics(true); }
            if (!suppressEvent && this._suppressExtentChanged !== true) {
                this._raiseEvent('extentChanged', { "previous": this._tmpExtent, "current": this.get_extent() }); this._tmpExtent = null;
            }
        }
    },
    _getInternalElementSize: function(elm) {
        //Gets the inner size of an element (size excluding borders and padding but NOT scrollbars)
        return [parseInt(elm.clientWidth, 10), parseInt(elm.clientHeight, 10)];
    },
    _addExtentHistory: function(previousExt, currentExt) {
        if (this._currentExtentHistory === -1) { return; }
        if (this._currentExtentHistory !== null && this._currentExtentHistory + 1 < this._extentHistory.length) {
            var len = this._extentHistory.length;
            for (var idx = this._currentExtentHistory + 1; idx < len; idx++) {
                Array.removeAt(this._extentHistory, this._currentExtentHistory + 1);
            }
        }
        Array.add(this._extentHistory, this.get_extent());

        if (this._extentHistory.length > 50) { Array.dequeue(this._extentHistory); }
        else { this._currentExtentHistory = this._extentHistory.length - 1; }
    },
    stepExtentHistory: function(steps) {
        /// <summary>Steps back and forth in the extent history.</summary>
        /// <param name="steps" type="Number" integer="true">
        /// Number of steps to move in history. Negative values moves back, positive moves forward.
        /// </param>
        /// <remarks>The map control stores up to the last 50 extent changes. Any old extents are discarded.</remarks>
        /// <returns type="Boolean">False if it reached the end of the history collection.</returns>
        var pos = (this._currentExtentHistory !== null ? this._currentExtentHistory : this._extentHistory.length - 1) + steps;
        if (pos < 0) { pos = 0; }
        else if (pos >= this._extentHistory.length - 1) { pos = this._extentHistory.length - 1; }

        this._currentExtentHistory = -1; //prevent the following setextent from being logged
        //if(!this.zoomToBox(this._extentHistory[pos]))
        //	this.panTo(this._extentHistory[pos].get_center(),true);
        this.set_extent(this._extentHistory[pos]);
        this._currentExtentHistory = pos; //restore position
        return !(pos === 0 || pos === this._extentHistory.length - 1);
    },
    //
    // Navigation
    //
    _initializeZoomAnimation: function(scaleFactor, centerX, centerY) {
        var duration = this._animationSettings.duration;
        var fps = this._animationSettings.fps;
        var animations = [];
        if (centerX === null || typeof (centerX) == "undefined") { centerX = parseInt(this.get_element().clientWidth, 10) * 0.5; }
        if (centerY === null || typeof (centerY) == "undefined") { centerY = parseInt(this.get_element().clientHeight, 10) * 0.5; }
        centerX -= this._containerDivPos[0];
        centerY -= this._containerDivPos[1];
        var moveanim = new AjaxControlToolkit.Animation.MoveAnimation(this._containerDiv, duration, fps, -centerX * (scaleFactor - 1), -centerY * (scaleFactor - 1), true);
        Array.add(animations, moveanim);
        var imgs = null;
        if (this._layersDiv.querySelectorAll) {
            imgs = this._layersDiv.querySelectorAll('.esriMapImage');
        }
        else { imgs = this._layersDiv.getElementsByTagName(ESRI.ADF.System.__isIE6 ? 'div' : 'img'); }
        for (var idx = 0; idx < imgs.length; idx++) {
            var imgTile = imgs[idx];
            if (imgTile && imgTile.tagName && imgTile.tagName.toUpperCase() === (ESRI.ADF.System.__isIE6 ? 'DIV' : 'IMG')) {
                var anim = new ESRI.ADF.Animations.ZoomAnimation(imgTile, duration, fps, scaleFactor, 0.0, 0.0);
                Array.add(animations, anim);
            }
        }
        return new ESRI.ADF.Animations.ParallelAnimation(null, duration, fps, animations);
    },
    zoom: function(scaleFactor, center, animate) {
        /// <summary>Zooms the map around a given center on the screen.</summary>
        /// <param name="scaleFactor" type="Number">
        /// Amount to zoom in on the map. This value may be adjusted to fit a tiled layer.
        /// </param>	
        /// <param name="center" type="ESRI.ADF.Geometries.Point" optional="true" mayBeNull="true">
        /// Center point to zoom around in map coordinates. This point will stay fixed during zoom
        /// If null, the center of the current view is used.
        /// </param>
        /// <param name="animate" type="Boolean" optional="true" mayBeNull="true">
        /// Specifies whether animation should be used for zooming. Default is true.
        /// </param>
        /// <remarks>The scaleFactor might be adjusted to fit the closest pixel resolution if the map contains tiled resources.
        /// If the adjusted scaleFactor is 1, the map will return false and you should call panTo instead.</remarks>
        /// <returns>True if a zoom was performed, false if not (no scale change).
        /// Returns undefined is the zoom was queued up.</returns>
        if (this._isZooming) {
            //We are already zooming - queue it up
            if (!this._zoomQueue) { this._zoomQueue = []; }
            Array.add(this._zoomQueue, { "scaleFactor": scaleFactor, "center": center });
            return;
        }
        this._clearOldImageTiles();
        if (!center) { center = this.get_extent().get_center(); }
        if (animate !== false) { animate = true; }
        var screenPoint = this.toScreenPoint(center);
        var centerOffsetX = screenPoint.offsetX;
        var centerOffsetY = screenPoint.offsetY;

        //Adjust scalefactor to tilescheme (if any)
        var fromPx = this._pixelsizeX;
        var toPx = this._pixelsizeX / scaleFactor;
        var toLevel = this.get_layers().getLevelByNearestPixelsize(toPx);
        if (toLevel !== null) { toPx = this.get_layers().get_levelResolution(toLevel); }
        else {
            if (this._minZoom && toPx < this._minZoom) { toPx = this._minZoom; }
            else if (this._maxZoom && toPx > this._maxZoom) { toPx = this._maxZoom; }
        }
        scaleFactor = fromPx / toPx;

        if (animate && ESRI.ADF.System.__isIE6) {
            //disable animation for IE6 with PNG images that has semitransparency.
            //the alpha filter disappears when images are resized
            //png32 is not affected since transparency is supposed to be baked into the image
            var layers = this.get_layers();
            for (var i = 0; i < layers.get_layerCount(); i++) {
                var layer = layers.get_layer(i);
                if (layer.get_opacity() < 1 && (layer.get_imageFormat() === 'png8' || layer.get_imageFormat() === 'png24')) {
                    animate = false; break;
                }
            }
        }

        if (scaleFactor === 1) { return false; }
        else if (scaleFactor > 25) { animate = false; }

        var anim = this._initializeZoomAnimation(scaleFactor, centerOffsetX, centerOffsetY);
        var startscale = this._pixelsizeX;

        //Calculate resulting extent when zoom is done.
        var endextent = this.get_extent();
        var w0 = endextent.get_width();
        var h0 = endextent.get_height();
        var w1 = w0 / scaleFactor;
        var h1 = h0 / scaleFactor;
        var mx = center.get_x();
        var my = center.get_y();
        var mmx1 = -((w1 * 0.5) * (mx - endextent.get_xmin()) / (w0 * 0.5) - mx);
        var mmy1 = -((h1 * 0.5) * (my - endextent.get_ymin()) / (h0 * 0.5) - my);
        endextent.set_xmin(mmx1);
        endextent.set_xmax(mmx1 + w1);
        endextent.set_ymin(mmy1);
        endextent.set_ymax(mmy1 + h1);

        var onEnd = Function.createDelegate(this, function() {
            this._pixelsizeX = toPx;
            this._pixelsizeY = this._pixelsizeX;
            this._recalculateContainerOffset();
            this._extent = endextent;
            anim.dispose();
            anim = null;
            onEnd = null;
            //Check zoom queue and play the next zoom
            if (this._zoomQueue && this._zoomQueue.length > 0) {
                var next = Array.dequeue(this._zoomQueue);
                this._isZooming = false;
                var result = this.zoom(next.scaleFactor, next.center, true);
                if (!result) { this._raiseEvent('zoomCompleted'); }
            }
            else if (scaleFactor !== 1) { this._raiseEvent('zoomCompleted'); }
        });
        if (animate && !this.get_disableNavigationAnimation()) {
            var ontick = Function.createDelegate(this, function() { this._onZoomStep(anim, 1.0, scaleFactor, startscale); ontick = null; });
            anim.add_tick(ontick);
            anim.add_ended(onEnd);
            this._raiseEvent('zoomStart');
            if (Sys.Browser.agent === Sys.Browser.InternetExplorer && this._layersDiv.filters[0]) {
                this._layersDiv.filters[0].enabled = false;
                this._layersDiv.style.filter = ''
                this._fadingStarted = false;
            }
            anim.play();
        }
        else {
            this._raiseEvent('zoomStart');
            this._applyExtent(endextent);
            this._raiseEvent('zoomCompleted');
        }
        return true;
    },
    zoomTo: function(point, pixelsize, animate) {
        ///<summary>Zooms the map, and centers around a given center</summary>
        /// <param name="point" type="ESRI.ADF.Geometries.Point">
        /// Point to center on the screen.
        /// </param>	
        /// <param name="pixelsize" type="Number">
        /// Pixelsize to zoom to. This value may be adjusted to fit a tiled layer.
        /// </param>
        /// <param name="animate" type="Boolean" optional="true" mayBeNull="true">
        /// Specifies whether animation should be used for zooming. Default is true.
        /// </param>
        /// <remarks>
        /// If the distance or scale between the current view and the envelope is too great, animation will be skipped.
        /// </remarks>

        var width = this._mapsize[0] * 0.5 * pixelsize;
        var height = this._mapsize[1] * 0.5 * pixelsize;
        var box = new ESRI.ADF.Geometries.Envelope(point.get_x() - width, point.get_y() - height,
												   point.get_x() + width, point.get_y() + height);
        return this.zoomToBox(box, animate);
    },
    zoomToBox: function(box, animate) {
        ///<summary>Zooms the map, and centers around a given center</summary>
        /// <param name="box" type="ESRI.ADF.Geometries.Envelope">
        /// Envelope to zoom to.
        /// </param>	
        /// <param name="animate" type="Boolean" optional="true" mayBeNull="true">
        /// Specifies whether animation should be used for zooming. Default is true.
        /// </param>
        /// <remarks>
        /// Envelope will be adjusted so the map will fit the entire box.
        /// </remarks>
        var extent = this.get_extent();
        if (animate === false || !extent.intersects(box)) {
            this.set_extent(box);
            return true;
        }
        //Adjust box ratio to view
        var c = box.get_center();
        var wb = box.get_width();
        var hb = box.get_height();
        var ratio = this._mapsize[1] / this._mapsize[0];
        if (hb / wb > ratio) { wb = hb / ratio; }
        else { hb = wb * ratio; }
        //var box2=new ESRI.ADF.Geometries.Envelope(box.get_xmin(),box.get_ymin(),box.get_xmax(),box.get_ymax());
        box = new ESRI.ADF.Geometries.Envelope(c.get_x() - wb / 2, c.get_y() - hb / 2, c.get_x() + wb / 2, c.get_y() + hb / 2);
        //Calculate zoom center
        var x0 = extent.get_xmin();
        var x1 = box.get_xmin();
        var ymin0 = extent.get_ymin();
        var ymax0 = extent.get_ymax();
        var ymin1 = box.get_ymin();
        var ymax1 = box.get_ymax();
        var a0 = (ymin1 - ymin0) / (x1 - x0);
        var a1 = (ymax1 - ymax0) / (x1 - x0);
        var b0 = ymin0 - a0 * x0;
        var b1 = ymax0 - a1 * x0;
        var x = (b1 - b0) / (a0 - a1);
        var y = a0 * x + b0;
        var result = this.zoom(extent.get_width() / wb, new ESRI.ADF.Geometries.Point(x, y), animate);
        if (result === false) { return this.panTo(box.get_center(), animate); }
        else { return result; }
    },
    panTo: function(point, animate) {
        ///<summary>Pans the map to center around the provided center</summary>
        /// <param name="point" type="ESRI.ADF.Geometries.Point">
        /// Point to center on the screen
        /// </param>	
        /// <param name="animate" type="Boolean" optional="true" mayBeNull="true">
        /// Specifies whether animation should be used for panning. Default is true.
        /// If pan distance is too great (more than one map window size outside the current view), animation will be skipped.
        /// </param>
        if (this._isPanning) { return false; }
        this._tmpExtent = this.get_extent();
        var centerScreen = this.toScreenPoint(point);
        var center = this.toScreenPoint(this.get_center());
        var ulX = center.offsetX - centerScreen.offsetX;
        var ulY = center.offsetY - centerScreen.offsetY;
        if (Math.abs(ulX) < 1 && Math.abs(ulY) < 1) { return false; } //no change
        var width = parseInt(this.get_element().clientWidth, 10);
        var height = parseInt(this.get_element().clientHeight, 10);
        //If pan distance is too great, disable animation
        if (Math.abs(ulX) > width * 1 || Math.abs(ulY) > 2 * height) {
            animate = false;
        }
        if (animate === false || this.get_disableNavigationAnimation()) {
            this._raiseEvent('panning');
            this._moveContainerDiv(-ulX, -ulY);
            this._resetGridOffset();
            this._raiseEvent('panCompleted', { "previous": this._tmpExtent, "current": this.get_extent() });
        }
        else {
            centerScreen = this.toScreenPoint(point);
            var anim = new AjaxControlToolkit.Animation.MoveAnimation(this._containerDiv, 0.5, 25, ulX, ulY, true);
            var onEnd = Function.createDelegate(this, function() {
                anim.dispose();
                this._recalculateContainerOffset();
                anim = null;
                this._isPanning = false;
                this._raiseEvent('panCompleted', { "previous": this._tmpExtent, "current": this.get_extent() });
                onEnd = null;
            });
            anim.add_ended(onEnd);
            this._isPanning = true;
            anim.play();
            var ontick = Function.createDelegate(this, function() { this._recalculateContainerOffset(); this._raiseEvent('panning'); ontick = null; });
            anim._timer.add_tick(ontick);
        }
        return true;
    },
    _recalculateContainerOffset: function() {
        this._containerDivPos = [parseInt(this._containerDiv.style.left, 10), parseInt(this._containerDiv.style.top, 10)];
        this._extent = null;
    },
    set_extent: function(extent) {
        if (!extent) { return; }
        this.checkMapsize();
        if (this._mapsize[0] === 0 || this._mapsize[1] === 0) {
            this._tmpextent = extent; //Map is probably hidden. We will set the extent later
            if (this.get_isInitialized()) {
                //Clean up - we will redraw later when the map gets a valid size
                this._clearRequestStack();
                this._clearVectorGraphics();
                this._clearImageTiles();
            }
            return;
        }
        this._tmpExtent = this.get_extent();
        this._applyExtent(extent);
        if (this._suppressExtentChanged !== true) {
            this._raiseEvent('extentChanged', { "previous": this._tmpExtent, "current": this.get_extent() });
        }
        this._tmpExtent = null;
    },
    _applyExtent: function(extent) {
        //Adjust extent to map ratio
        var c = extent.get_center();
        var wb = extent.get_width();
        var hb = extent.get_height();
        var ratio = this._mapsize[1] / this._mapsize[0];
        if (hb / wb > ratio) { wb = hb / ratio; }
        //Adjust to levels
        var gsd = wb / this._mapsize[0];
        var oldgsd = this._pixelsizeX;
        if (this.get_layers()) {
            var level = this._layers.getLevelByNearestPixelsize(gsd);
            if (level !== null) {
                var gsd2 = this._layers.get_levelResolution(level);
                if (gsd2 < gsd * 0.99 && level > 0) { //Ensure we don't zoom further in than the extent;
                    gsd2 = this._layers.get_levelResolution(level - 1);
                }
                gsd = gsd2;
            }
            else {
                if (this._minZoom && gsd < this._minZoom) { gsd = this._minZoom; }
                else if (this._maxZoom && gsd > this._maxZoom) { gsd = this._maxZoom; }
            }
        }
        this._pixelsizeX = this._pixelsizeY = gsd;
        if (oldgsd !== this._pixelsizeX) {
            //scale change
            this._clearRequestStack();
        }
        this._clearVectorGraphics();
        this._extent = null;
        this._gridOrigin = new ESRI.ADF.Geometries.Point(c.get_x() - this._pixelsizeX * this._mapsize[0] * 0.5,
				 c.get_y() + this._pixelsizeY * this._mapsize[1] * 0.5);
        if (!this.get_isInitialized()) { return; }
        this._containerDivPos = [0, 0];
        this._assotateCanvas.adjustCanvasExtent(this._containerDivPos[0], this._containerDivPos[1], this._mapsize[1], this._mapsize[0]);
        this._containerDiv.style.left = '0';
        this._containerDiv.style.top = '0';
        this._clearImageTiles();
        this._raiseEvent('gridOriginChanged', this._gridOrigin);
    },
    get_extent: function() {
        /// <value type="ESRI.ADF.Geometries.Envelope">
        /// Gets or sets the extent of the current map view
        /// </value>
        /// <remarks>
        /// When setting the extent, the extent may be adjusted to fit the maps aspect ratio and scale levels.
        /// You can check the extent property to get the adjusted extent after setting it.
        /// </remarks>
        if (this._extent) { return this._extent.clone(); }
        if (!this.get_isInitialized()) { return null; }
        if (this._mapsize[0] > 0 && this._tmpextent) {
            var ext = this._tmpextent;
            this._tmpextent = null;
            this._applyExtent(ext);
            this._addExtentHistory();
        }
        else if (this._mapsize[0] === 0 && this._tmpextent) {
            return this._tmpextent;
        }
        else if (this._pixelsizeX === Number.POSITIVE_INFINITY) {
            return this._gridOrigin.getEnvelope();
        }
        var width = this._mapsize[0] * this._pixelsizeX;
        var height = this._mapsize[1] * this._pixelsizeY;
        var x = this._containerDivPos[0] * this._pixelsizeX;
        var y = this._containerDivPos[1] * this._pixelsizeY;
        if (this._rotation.angle !== 0) {
            var x2 = (x * this._rotation.cos) - (y * this._rotation.sin);
            var y2 = (y * this._rotation.cos) + (x * this._rotation.sin);
            x = x2; y = y2;
        }
        var left = this._gridOrigin.get_x() - x;
        var top = this._gridOrigin.get_y() + y;
        this._extent = new ESRI.ADF.Geometries.Envelope(
				new ESRI.ADF.Geometries.Point(left, top - height, this._spatialReference),
				new ESRI.ADF.Geometries.Point(left + width, top, this._spatialReference),
				this._spatialReference);
        return this._extent.clone();
    },
    get_center: function() {
        /// <value type="ESRI.ADF.Geometries.Point">
        /// Gets the center of the current map view.
        /// </value>
        return this.get_extent().get_center();
    },
    toMapPoint: function(viewOffsetX, viewOffsetY) {
        ///<summary>Converts a point relative to the corner of the map window
        /// in pixel units into map units.</summary>
        /// <param name="viewOffsetX" type="Number">
        /// Screen offset in pixels left of the upper left side of the map window.
        /// </param>	
        /// <param name="viewOffsetY" type="Number">
        /// Screen offset in pixels below the upper side of the map window.
        /// </param>	
        /// <returns type="ESRI.ADF.Geometries.Point">Point in map units.</returns>		
        var x; var y;
        if (this._rotation.angle === 0) {
            x = this._gridOrigin.get_x() + (viewOffsetX - this._containerDivPos[0]) * this._pixelsizeX;
            y = this._gridOrigin.get_y() + (this._containerDivPos[1] - viewOffsetY) * this._pixelsizeY;
        }
        else {
            var center = this.get_extent().get_center();
            viewOffsetX -= this._mapsize[0] / 2;
            viewOffsetY -= this._mapsize[1] / 2;
            x = viewOffsetX * this._pixelsizeX;
            y = -viewOffsetY * this._pixelsizeY;
            var x2 = ((x * this._rotation.cos) + (y * this._rotation.sin));
            var y2 = ((y * this._rotation.cos) - (x * this._rotation.sin));
            x = x2 + center.get_x();
            y = y2 + center.get_y();
        }
        return new ESRI.ADF.Geometries.Point(x, y, this._spatialReference);
    },
    _toMapScreen: function(point) {
        /// <summary>Converts an absolute point in map units to a screen point on the map canvas</summary>
        /// <param name="point" type="ESRI.ADF.Geometries.Point">
        /// Point to convert to map canvas screen coordinate
        /// </param>
        /// <remarks>
        /// Returns an object with the following properties:
        /// offsetX : Horizontal offset in pixels from the left side of the current map grid origin
        /// offsetY : Vertical offset in pixels from the top of the current map grid origin
        /// </remarks>
        /// <returns type="Object">Offset point in pixel units relative to the top left corner of the map grid origin</returns>
        var x = point.coordinates ? point.coordinates[0] : point[0];
        var y = point.coordinates ? point.coordinates[1] : point[1];
        if (this._rotation.angle !== 0) {
            var center = this.get_extent().get_center();
            x -= center.coordinates[0];
            y -= center.coordinates[1];
            var x2 = Math.round(((x * this._rotation.cos) - (y * this._rotation.sin)) / this._pixelsizeX + this._mapsize[0] / 2);
            var y2 = Math.round(((y * this._rotation.cos) + (x * this._rotation.sin)) / this._pixelsizeY - this._mapsize[1] / 2);
            x = x2 - this._containerDivPos[0];
            y = y2 + this._containerDivPos[1];
        }
        else {
            x -= this._gridOrigin.coordinates[0];
            y -= this._gridOrigin.coordinates[1];
            x = Math.round(x / this._pixelsizeX);
            y = Math.round(y / this._pixelsizeY);
        }
        return { "offsetX": x, "offsetY": -y };
    },
    toScreenPoint: function(point) {
        /// <summary>Converts an absolute point in map units to a screen point</summary>
        /// <param name="point" type="ESRI.ADF.Geometries.Point">
        /// Point to convert to screen coordinate
        /// </param>
        /// <remarks>
        /// Returns an object with the following properties:
        /// offsetX : Horizontal offset in pixels from the left side of the current map view
        /// offsetY : Vertical offset in pixels from the top of the current map view
        /// </remarks>
        /// <returns type="Object">Offset point in pixel units relative to the top left corner of the map view</returns>		
        var obj = this._toMapScreen(point);
        obj.offsetX += this._containerDivPos[0];
        obj.offsetY += this._containerDivPos[1];
        return obj;
    },
    //
    // Drawing/annotation functionality
    //
    getGeometry: function(type, onComplete, onCancel, linecolor, fillcolor, cursor, continuous) {
        /// <summary>Enables the user to draw a shape on the map.</summary>
        /// <param name="type" type="ESRI.ADF.Graphics.ShapeType">
        /// Shape type to draw on the map
        /// </param>
        /// <param name="onComplete" type="Function">
        /// Function to call on completion. The handler takes one parameter which will return a ESRI.ADF.Geometries.Polyline
        /// </param>
        /// <param name="onCancel" type="Function" optional="true" mayBeNull="true">
        /// Function to call if drawing was cancelled.
        /// </param>
        /// <param name="fillcolor" type="String" optional="true" mayBeNull="true">
        /// HTML color code for fill color used when drawing.  The fill color will be used as fill for surface types with some transparency applied to it.
        /// </param>
        /// <param name="linecolor" type="String" optional="true" mayBeNull="true">
        /// HTML color code for line color used when drawing. The line color will be used as outline color for surface types.
        /// </param>
        /// <param name="cursor" type="String" optional="true" mayBeNull="true">
        /// The CSS style cursor name to use. Defaults to 'crosshair'.
        /// </param>
        /// <param name="continuous" type="Boolean" optional="true" mayBeNull="true">
        /// If true, keeps collecting geometries until cancelGetGeometry() is called or the mousemode changes.
        /// </param>
        this.cancelGetGeometry();
        var style = null;
        if (type < ESRI.ADF.Graphics.ShapeType.Envelope) {
            style = new ESRI.ADF.Graphics.LineSymbol(linecolor ? linecolor : '#000000', this.get_clientToolGraphicsWidth());
        }
        else {
            style = new ESRI.ADF.Graphics.FillSymbol(fillcolor, linecolor || fillcolor ? linecolor : '#000000', this.get_clientToolGraphicsWidth());
            style.set_opacity(0.2);
        }
        var map = this;
        var del = null;
        var cancelDel = function(cancelled) {
            if (cancelled) {
                map._currentState = null;
                del = null;
                cancelDel = null;
                if (onCancel) { onCancel(); }
            }
        };
        del = function(geom) {
            if (!continuous && cancelDel) { cancelDel(false); }
            onComplete(geom);
        };
        this.graphicsEditor = new ESRI.ADF.Graphics.__GraphicsEditor(this, this._assotateCanvas, null, type, style, del, cancelDel, continuous, cursor);
        this._currentState = 'getGeometry';
    },
    cancelGetGeometry: function() {
        /// <summary>Cancels user geometry input initiated by method <see cref="getGeometry" />.</summary>
        if (this.graphicsEditor) {
            this.graphicsEditor.cancel();
            if (this.graphicsEditor) { this.graphicsEditor.dispose(); }
            this.graphicsEditor = null;
        }
        if (this._oldMouseMode) { this.set_mouseMode(this._oldMouseMode); }
        this._oldMouseMode = null;
        this._currentState = null;
    },
    //
    // Feature graphics
    //
    addGraphic: function(element) {
        /// <summary>Adds a GraphicFeature or GraphicFeatureGroup to the canvas</summary>
        /// <param name="element" type="ESRI.ADF.Graphics.GraphicFeatureBase">
        /// Element to add to canvas.</param>
        /// <remarks>
        /// Graphics are drawn from bottom up; polygons first, then poylines, and lastly points.
        /// Within each group, graphics are drawn in the order they where added.
        /// </remarks>
        Array.add(this._graphicFeatures, element);
        element.__set_map(this);
        if (!element.get_isInitialized()) { element.initialize(); }
        if (ESRI.ADF.Graphics.GraphicFeatureGroup.isInstanceOfType(element)) {
            if (!this._featureGroupChangedHandler) { this._featureGroupChangedHandler = Function.createDelegate(this, function(s, e) { this._refreshGraphicsRecursive(s, true); }); }
            element.add_elementChanged(this._featureGroupChangedHandler);
            element.add_elementAdded(this._featureGroupChangedHandler);
            element.add_propertyChanged(this._featureGroupChangedHandler);
            this.refreshGraphics(false);
        }
        else {
            if (!this._featureGraphicChangedHandler) { this._featureGraphicChangedHandler = Function.createDelegate(this, this._onGraphicFeatureChanged); }
            element.add_propertyChanged(this._featureGraphicChangedHandler);
            this._refreshGraphicsRecursive(element, false);
        }
    },
    removeGraphic: function(element) {
        /// <summary>Remove a GraphicFeature or GraphicFeatureGroup from the canvas</summary>
        /// <param name="element" type="ESRI.ADF.Graphics.GraphicFeatureBase">
        /// Element to remove from canvas.
        /// </param>
        if (!element) { return; }
        element.__set_map(null);
        if (ESRI.ADF.Graphics.GraphicFeatureGroup.isInstanceOfType(element)) {
            element.remove_elementChanged(this._featureGroupChangedHandler);
            element.remove_elementAdded(this._featureGroupChangedHandler);
            element.remove_propertyChanged(this._featureGroupChangedHandler);
            element.clearGraphicReference();
        }
        else {
            element.remove_propertyChanged(this._featureGraphicChangedHandler);
            element.clearGraphicReference();
        }
        Array.remove(this._graphicFeatures, element);
    },
    _clearVectorGraphics: function() {
        for (var idx = 0; idx < this._graphicFeatures.length; idx++) {
            if (ESRI.ADF.Graphics.GraphicFeatureGroup.isInstanceOfType(this._graphicFeatures[idx])) {
                for (var j = 0; j < this._graphicFeatures[idx].getFeatureCount(); j++) {
                    this._graphicFeatures[idx].get(j).clearGraphicReference();
                }
            }
            else {
                this._graphicFeatures[idx].clearGraphicReference();
            }
        }
    },
    getShapeCount: function() {
        /// <summary>Gets the number of graphic features in the canvas.</summary>
        /// <returns type="Number" integer="true">Number of objects at the canvas.</returns>
        /// <remarks>A FeatureGraphicGroup is regarded as one object.</remarks>
        return this._graphicFeatures.length;
    },
    refreshGraphics: function(force) {
        /// <summary>Redraws the graphics on the screen</summary>
        /// <param name="force" type="Boolean">Force redraw of features already added drawn on the canvas</param>
        /// <remarks>Features are drawn with surfaces at bottom, lines in middle and points on top,
        ///  but otherwise in the order they were added.</remarks>
        if (this._isZooming) { return; }
        for (var idx = 0; idx < this._graphicFeatures.length; idx++) {
            var feat = this._graphicFeatures[idx];
            this._refreshGraphicsRecursive(feat, force);
        }
    },
    _refreshGraphicsRecursive: function(element, force) {
        if (ESRI.ADF.Graphics.GraphicFeatureGroup.isInstanceOfType(element)) {
            if (!element.get_visible()) { return; }
            for (var j = 0; j < element.getFeatureCount(); j++) {
                var subfeat = element.get(j);
                this._refreshGraphicsRecursive(subfeat, force);
            }
        }
        else {
            if ((force === true || !element.get_graphicReference())) {
                if (element._isDrawing) return;
                var fnc = Function.createDelegate(this, function() {
                    if (this._isZooming) { element._isDrawing = false; return; }
                    var elmExtent = element.getEnvelope();
                    if (elmExtent && this.get_extent().intersects(elmExtent)) {
                        if (element.__draw()) {
                            var gfx = element.get_graphicReference();
                            if (gfx) { element._hookEvents(element, gfx); }
                        }
                    }
                    element._isDrawing = false;
                    fnc = null;
                });
                element._isDrawing = true; //Prevent drawing multiple times on async draw;
                window.setTimeout(fnc, 0); //Prevents script timeout when rendering a lot of results
            }
        }
    },
    _onGraphicFeatureChanged: function(sender, eventArgs) {
        var prop = eventArgs.get_propertyName();
        if (prop === 'geometry' || prop === 'symbol' || prop === 'selectedSymbol' || prop === 'visible') {
            this._refreshGraphicsRecursive(sender, true);
        }
    },
    setKeyAction: function(keycode, onkeydown, onkeyup, cursor, continuous) {
        /// <summary>Sets the action to perform on the map when the a specific key is pressed.</summary>
        /// <param name="keycode" type="Sys.UI.Key">Key to map this action to</param>
        /// <param name="onkeydown" type="Function">Method to call when the key is pressed down</param>
        /// <param name="onkeydown" type="Function" optional="true">Method to call when the key is released.</param>
        /// <param name="cursor" type="String" optional="true">cursor style applied to map.</param>
        /// <param name="continuous" type="Boolean" optional="true">When true, this event will fire continuous while the key is pressed down.</param>
        if (onkeydown !== null) {
            this._keyActions[keycode] = { 'keydown': onkeydown, 'keyup': onkeyup, 'cursor': cursor, 'continuous': (continuous === true ? true : false) };
        }
        else {
            this._keyActions[keycode] = null;
        }
    },
    removeKeyAction: function(keycode) {
        /// <summary>Removes the specified key action from the map.</summary>
        /// <param name="keycode" type="Sys.UI.Key">Key action to remove indicated by the key code</param>
        if (this._keyActions[keycode]) { Array.remove(this._keyActions, keycode); }
    },
    //
    // Properties
    //
    __get_contentDiv: function() {
        /// <summary>Gets the container div that gets panned around and contains all objects in the map.
        /// This is an internal property used for temporarily inserting positioned elements into the 
        /// Map Layer DOM and is not intended for use outside this framework.</summary>
        /// <returns type="Sys.UI.DomElement" />
        return this._containerDiv;
    },
    __get_controlDiv: function() {
        /// <summary>Gets the main div for all objects in the map. This is an internal property used for temporarily
        /// inserting positioned elements into the Map DOM and is not intended for use outside this framework.</summary>
        /// <returns type="Sys.UI.DomElement" />
        return this._controlDiv;
    },
    get_pixelSize: function() {
        /// <value name="pixelSize" type="Number">Gets the current size of a pixel in map units.</value>
        return this._pixelsizeX;
    },
    get_mouseMode: function() {
        /// <value name="mouseMode" type="ESRI.ADF.UI.MouseMode">Gets or sets the current map mode</value>
        return this._mouseMode;
    },
    set_mouseMode: function(value) {
        if (this._mouseMode === value) { return; }
        if (this._tempDragBox) { this._removeElement(this._tempDragBox); this._tempDragBox = null; }
        this.cancelGetGeometry();
        this._mouseMode = value;
        switch (this._mouseMode) {
            case ESRI.ADF.UI.MouseMode.Pan: this.set_cursor('move'); break;
            default:
                this.set_cursor('crosshair');
                break;
        }
        this.raisePropertyChanged('mouseMode');
    },
    get_cursor: function() {
        /// <value type="String">Gets or sets the map cursor name</value>
        return this.get_element().style.cursor;
    },
    set_cursor: function(value) { this.get_element().style.cursor = value; },
    get_enableMouseWheel: function() {
        /// <value type="Boolean">If true enables the mouse wheel for zooming.</value>
        return this._enableMouseWheel;
    },
    set_enableMouseWheel: function(value) { if (value !== this._enableMouseWheel) { this._enableMouseWheel = value; this.raisePropertyChanged('enableMouseWheel'); } },
    get_layers: function() {
        /// <value type="ESRI.ADF.Layers.LayerCollection">Gets or sets the layer collection the maps uses.</value>
        return this._layers;
    },
    set_layers: function(value) {
        if (value !== this._layers) {
            this._layers = value;
            if (value.get_layerCount() > 0) {
                var resource = value.get_layer(0);
                this.set_spatialReference(resource.get_spatialReference());
            }
            if (this.get_isInitialized()) {
                this._clearImageTiles();
                var raiseEvent = false;
                var level = value.getLevelByNearestPixelsize(this._pixelsizeX);
                if (level !== null) {
                    var resX = value.get_levelResolution(level);
                    if (this._pixelsizeX !== resX) {
                        raiseEvent = true;
                    }
                }
                this._hookupLayerCollectionEvents();
                if (raiseEvent) { this._raiseEvent('extentChanged'); }
            }
            this.raisePropertyChanged('layers');
        }
    },
    get_spatialReference: function() {
        /// <value type="String">Gets or sets the spatial reference of the map.</value>
        return this._spatialReference;
    },
    set_spatialReference: function(value) { if (value !== this._spatialReference) { this._spatialReference = value; this.raisePropertyChanged('spatialReference'); } },
    get_disableNavigationAnimation: function() {
        /// <value type="Boolean">If true, disables zoom and pan animations</value>
        return this._animationSettings.disableNavigationAnimation;
    },
    set_disableNavigationAnimation: function(value) { if (value !== this._animationSettings.disableNavigationAnimation) { this._animationSettings.disableNavigationAnimation = value; this.raisePropertyChanged('disableNavigationAnimation'); } },
    get_disableScrollWheelZoom: function() {
        /// <value type="Boolean">If true, disables zoom using scrollwheel</value>
        return this._disableScrollWheelZoom;
    },
    set_disableScrollWheelZoom: function(value) { if (value !== this._disableScrollWheelZoom) { this._disableScrollWheelZoom = value; this.raisePropertyChanged('disableScrollWheelZoom'); } },
    get_mouseWheelDirection: function() {
        /// <value type="Boolean">If true, scroll-down zooms out.</value>
        return this._mouseWheelDirection;
    },
    set_mouseWheelDirection: function(value) { if (value !== this._mouseWheelDirection) { this._mouseWheelDirection = value; this.raisePropertyChanged('mouseWheelDirection'); } },
    get_rotation: function() {
        /// <value type="Number">Gets or sets the rotation of the map</value>
        return this._rotation.angle / Math.PI * 180.0;
    },
    set_rotation: function(value) {
        //var rot = (-value+90)/180.0*Math.PI;
        var rot = value / 180.0 * Math.PI;
        if (rot !== this._rotation.angle) {
            this._rotation.angle = rot;
            this._rotation.cos = Math.cos(this._rotation.angle);
            this._rotation.sin = Math.sin(this._rotation.angle);
            this.raisePropertyChanged('rotation');
        }
    },
    set_dynTileSize: function(value) { this._dynTileSize = value; },
    get_dynTileSize: function() {
        /// <value type="Number">Gets or sets the rotation of the map</value>
        return this._dynTileSize;
    },
    get_progressBarEnabled: function() {
        /// <value type="Boolean">Gets or sets whether the progressbar is enabled or disabled.</value>
        return this._progressBarEnabled;
    },
    set_progressBarEnabled: function(value) {
        if (this._progressBarEnabled !== value) {
            this._progressBarEnabled = value;
            if (this._progressBarEnabled) { this._createProgressBar(); }
            else if (this._progressBar) {
                this._progressBar.dispose();
                this._progressBar = null;
            }
        }
    },
    get_progressBarAlignment: function() {
        /// <value type="ESRI.ADF.System.ContentAlignment">Gets or sets the alignment of the progressbar</value>
        return this._progressBarAlignment;
    },
    set_progressBarAlignment: function(value) {
        this._progressBarAlignment = value;
        if (this._progressBar) { this._progressBar.set_progressBarAlignment(value); }
    },
    set_minZoom: function(value) { this._minZoom = value; },
    get_minZoom: function() {
        /// <value type="Number">Gets or sets the minimum pixel size you are allowed to zoom to, or null/0 if unrestricted.
        /// This value is ignored when using tiled maps.</value>
        return this._minZoom;
    },
    set_maxZoom: function(value) { this._maxZoom = value; },
    get_maxZoom: function() {
        /// <value type="Number">Gets or sets the maximum pixel size you are allowed to zoom to, or null/Number.POSITIVE_INFINITY if unrestricted.
        /// This value is ignored when using tiled maps.</value>
        return this._maxZoom;
    },
    set_tileBuffer: function(value) { this._tileBuffer = value; },
    get_tileBuffer: function() {
        /// <value type="Number" mayBeNull="true">
        /// Gets or sets the buffer in pixels around the viewport where tiles are preserved when panning.
        /// Any tiles completely outside the buffer will be removed from the browser.
        /// </value>
        /// <remark>Setting this value too high, can significantly increase the browser's memory consumption.
        /// If this value is not set, it will default to the size of the current view port.
        /// For slow services and lots of panning back and forth, setting this value high could potentially increase performance,
        /// but for fast cached services setting it to a low value could put less load on the client browser.</remark>
        return this._tileBuffer;
    },
    set_loadTilesContinously: function(value) { this._loadTilesContinously = value; },
    get_loadTilesContinously: function() {
        /// <value type="Boolean">
        /// Gets or sets whether the tiles should continuously load while panning, or wait until panning has stopped.
        /// </value>
        return this._loadTilesContinously;
    },
    //
    // Events
    //
    add_mouseDragging: function(handler) {
        /// <summary>The mouseDragging event is fired when the left mousebutton is down and the mouse moves on the map.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map on which the mouse is being dragged</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>mousemove</td>
	/// 				<td>The browsers mousemove event</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>	
        this.get_events().addHandler('mouseDragging', handler);
    },
    remove_mouseDragging: function(handler) { this.get_events().removeHandler('mouseDragging', handler); },
    add_mouseDragCompleted: function(handler) {
        /// <summary>The mouseDragCompleted event is fired when a drag has ended.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that on which the mouse was dragged</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>mouseup</td>
	/// 				<td>The browsers mouseup event fired when dragging has completed</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('mouseDragCompleted', handler);
    },
    remove_mouseDragCompleted: function(handler) { this.get_events().removeHandler('mouseDragCompleted', handler); },
    add_mouseMove: function(handler) {
        /// <summary>The mouseMove event is fired when the mouse moves over the map.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map over which the mouse is being moved</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>mousemove</td>
	/// 				<td>The mousemove event fired by the browser when the mouse is moved over the map</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('mouseMove', handler);
    },
    remove_mouseMove: function(handler) { this.get_events().removeHandler('mouseMove', handler); },
    add_mouseDown: function(handler) {
        /// <summary>The mouseDown event is fired when a mouse button is pressed down on the map.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that on which the mouse down event occured</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>mousedown</td>
	/// 				<td>The browsers mousedown event</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('mouseDown', handler);
    },
    remove_mouseDown: function(handler) { this.get_events().removeHandler('mouseDown', handler); },
    add_mouseUp: function(handler) {
        /// <summary>The mouseUp event is fired when a mouse button is released on the map.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that on which the mouse up event occured</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>mouseup</td>
	/// 				<td>The browsers mouseup event</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('mouseUp', handler);
    },
    remove_mouseUp: function(handler) { this.get_events().removeHandler('mouseUp', handler); },
    add_mouseOver: function(handler) {
        /// <summary>The mouseUp event is fired when a mouse button is released on the map.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map being moused over</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>mouseenter</td>
	/// 				<td>The mouseenter event fired by the browser when the mouse enters the map area</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('mouseOver', handler);
    },
    remove_mouseOver: function(handler) { this.get_events().removeHandler('mouseOver', handler); },
    add_mouseOut: function(handler) {
        /// <summary>The mouseOut event is fired when the mouse moves out of the map.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that the mouse was moved over</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>mouseleave</td>
	/// 				<td>The mouseleave event fired by the browser when the mouse leaves the map area</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('mouseOut', handler);
    },
    remove_mouseOut: function(handler) { this.get_events().removeHandler('mouseOut', handler); },
    add_click: function(handler) {
        /// <summary>The click event is fired when a mouse button is clicked pushed down and up again without dragging.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that was clicked</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>mouseup</td>
	/// 				<td>The mouseup event fired by the browser when the click is complete</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>	
		
        this.get_events().addHandler('click', handler);
    },
    remove_click: function(handler) {
        this.get_events().removeHandler('click', handler);
    },
    add_dblclick: function(handler) {
	/// <summary>The click event is fired when the map is double-clicked.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that was double clicked</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>dblclick</td>
	/// 				<td>The browsers double click event</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>	
        this.get_events().addHandler('dblclick', handler);
    },
    remove_dblclick: function(handler) { this.get_events().removeHandler('dblclick', handler); },
    add_keyUp: function(handler) {
        /// <summary>The keyUp event is fired when a key is released while the map was in focus..</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that the mouse was over when the key was released</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>keyup</td>
	/// 				<td>The browsers keyup event</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>	
        this.get_events().addHandler('keyUp', handler);
    },
    remove_keyUp: function(handler) { this.get_events().removeHandler('keyUp', handler); },
    add_keyDown: function(handler) {
        /// <summary>Fired when a key was pressed down while the map was in focus.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that the mouse was over when the key was pressed</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>keydown</td>
	/// 				<td>The browsers keydown event</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('keyDown', handler);
    },
    remove_keyDown: function(handler) { this.get_events().removeHandler('keyDown', handler); },
    add_zoomStart: function(handler) {
        /// <summary>Fired when a zoom is starting.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that is being zoomed</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('zoomStart', handler);
    },
    remove_zoomStart: function(handler) { this.get_events().removeHandler('zoomStart', handler); },
    add_zoomCompleted: function(handler) {
        /// <summary>Fired when a zoom has completed.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that was zoomed</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('zoomCompleted', handler);
    },
    remove_zoomCompleted: function(handler) { this.get_events().removeHandler('zoomCompleted', handler); },
    add_panning: function(handler) {
        /// <summary>Fired continuously when the map is panning.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that is being panned</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('panning', handler);
    },
    remove_panning: function(handler) { this.get_events().removeHandler('panning', handler); },
    add_panCompleted: function(handler) {
        /// <summary>Fired when a pan has completed.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map that was panned</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.current</td>
	/// 				<td>ESRI.ADF.Geometries.Envelope</td>
	/// 				<td>New extent</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.previous</td>
	/// 				<td>ESRI.ADF.Geometries.Envelope</td>
	/// 				<td>Old extent</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('panCompleted', handler);
    },
    remove_panCompleted: function(handler) { this.get_events().removeHandler('panCompleted', handler); },
    add_extentChanging: function(handler) {
        /// <summary>Fired continuously when the extent is changing.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map for which the extent is changing</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>	
        this.get_events().addHandler('extentChanging', handler);
    },
    remove_extentChanging: function(handler) { this.get_events().removeHandler('extentChanging', handler); },
    add_extentChanged: function(handler) {
        /// <summary>Fired when the extent is changed.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map for which the extent changed</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.current</td>
	/// 				<td>ESRI.ADF.Geometries.Envelope</td>
	/// 				<td>New extent</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.previous</td>
	/// 				<td>ESRI.ADF.Geometries.Envelope</td>
	/// 				<td>Old extent</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('extentChanged', handler);
    },
    remove_extentChanged: function(handler) { this.get_events().removeHandler('extentChanged', handler); },
    add_onProgress: function(handler) {
        /// <summary>Fired when number of images in the requestqueue is changed.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map executing an operation</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>integer</td>
	/// 				<td>The number of operations pending, not including the current one</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('onProgress', handler);
    },
    remove_onProgress: function(handler) { this.get_events().removeHandler('onProgress', handler); },
    add_mapResized: function(handler) {
        /// <summary>Fired when the map detects a change in its viewport size.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The resized map</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>integer array</td>
	/// 				<td>An array containing the dimensions that the map was resized to.  The first item is the map width, while the second is its height</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		
        this.get_events().addHandler('mapResized', handler);
    },
    remove_mapResized: function(handler) { this.get_events().removeHandler('mapResized', handler); },
    add_gridOriginChanged: function(handler) {
        /// <summary>Fired when grid origin has changed.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapBase</td>
	/// 				<td>The map for which the grid origin was changed</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>ESRI.ADF.Geometries.Point</td>
	/// 				<td>The new grid origin</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
        this.get_events().addHandler('gridOriginChanged', handler);
    },
    remove_gridOriginChanged: function(handler) { this.get_events().removeHandler('gridOriginChanged', handler); },
    __add_mapTipEvent: function(handler) {
        /// <summary>Fired when a maptip is shown/hidden/expanded/collapsed.</summary>
        this.get_events().addHandler('mapTipEvent', handler);
    },
    __remove_mapTipEvent: function(handler) { this.get_events().removeHandler('mapTipEvent', handler); }
};
ESRI.ADF.UI.MapBase.registerClass('ESRI.ADF.UI.MapBase', Sys.UI.Control);


// ESRI WebADF specific implementations
// This clientscript extends the existing JS API with Web ADF specific functionality
//

ESRI.ADF.UI.Map = function(element) {
    /// <summary>
    /// ESRI WebADF Map control class
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement">
    /// DOM element that should contain the map view
    /// </param>
    /// <param name="callbackFunctionString" type="String">
    /// callbackFunctionString to call the server control instance through a callback of partial postback
    /// </param>
    /// <remarks>The Map class represents the server-side Map control and builds on the MapBase class.  The MapBase class exposes most of the clientside functionality a Web ADF JavaScript developer will utilize when working with a Map. </remarks>
    ESRI.ADF.UI.Map.initializeBase(this, [element]);
    this._callbackFunctionString = null;
    this._onExtentsChangedHandler = null;
    this._onMapResizedHandler = null;
    this._restoreFromCookie = false; //State is maintained by server
    this._disableAutoCallbacks = false;
    this._disableDefaultKeyActions = false;
};
ESRI.ADF.UI.Map.prototype = {
    initialize: function() {
        /// <summary>Initializes the map control.</summary>
        /// <remarks>The initialize method must be called prior to using the map. It's automatically called when using $create to instantiate the control</remarks>
        ESRI.ADF.UI.Map.callBaseMethod(this, 'initialize');
        //The following properties and objects are considered obsolete for 9.3+:
        this.divObject = this._layersDiv;
        //Hook up callback events
        this._onExtentsChangedHandler = Function.createDelegate(this, this._onExtentChanged);
        this.add_extentChanged(this._onExtentsChangedHandler);
        this._onMapResizedHandler = Function.createDelegate(this, this._onMapResized);
        this.add_mapResized(this._onMapResizedHandler);
        //Default keyboard actions
        if (!this._disableDefaultKeyActions) {
            var keypanAmount = 50;
            var doKeyPanFunc = Function.createDelegate(this, function() { this._doContinuousPan(this._keyPanDirection[0], this._keyPanDirection[1]); });
            this.setKeyAction(Sys.UI.Key.right, Function.createDelegate(this, function() { this._keyPanDirection[0] = keypanAmount; doKeyPanFunc(); }), Function.createDelegate(this, function() { this._keyPanDirection[0] = 0; doKeyPanFunc(); }), null, true);
            this.setKeyAction(Sys.UI.Key.left, Function.createDelegate(this, function() { this._keyPanDirection[0] = -keypanAmount; doKeyPanFunc(); }), Function.createDelegate(this, function() { this._keyPanDirection[0] = 0; doKeyPanFunc(); }), null, true);
            this.setKeyAction(Sys.UI.Key.up, Function.createDelegate(this, function() { this._keyPanDirection[1] = -keypanAmount; doKeyPanFunc(); }), Function.createDelegate(this, function() { this._keyPanDirection[1] = 0; doKeyPanFunc(); }), null, true);
            this.setKeyAction(Sys.UI.Key.down, Function.createDelegate(this, function() { this._keyPanDirection[1] = keypanAmount; doKeyPanFunc(); }), Function.createDelegate(this, function() { this._keyPanDirection[1] = 0; doKeyPanFunc(); }), null, true);
            this.setKeyAction(33, Function.createDelegate(this, function() { this._keyPanDirection = [keypanAmount, -keypanAmount]; doKeyPanFunc(); }), Function.createDelegate(this, function() { this._keyPanDirection = [0, 0]; doKeyPanFunc(); }), null, true); //Numlock 9
            this.setKeyAction(34, Function.createDelegate(this, function() { this._keyPanDirection = [keypanAmount, keypanAmount]; doKeyPanFunc(); }), Function.createDelegate(this, function() { this._keyPanDirection = [0, 0]; doKeyPanFunc(); }), null, true); //Numlock 3
            this.setKeyAction(35, Function.createDelegate(this, function() { this._keyPanDirection = [-keypanAmount, keypanAmount]; doKeyPanFunc(); }), Function.createDelegate(this, function() { this._keyPanDirection = [0, 0]; doKeyPanFunc(); }), null, true); //Numlock 1
            this.setKeyAction(36, Function.createDelegate(this, function() { this._keyPanDirection = [-keypanAmount, -keypanAmount]; doKeyPanFunc(); }), Function.createDelegate(this, function() { this._keyPanDirection = [0, 0]; doKeyPanFunc(); }), null, true); //Numlock 7
            this.setKeyAction(107, Function.createDelegate(this, function() { this.zoom(2.0); }), null, null, false); //Numlock +
            this.setKeyAction(109, Function.createDelegate(this, function() { this.zoom(0.5); }), null, null, false); //Numlock -
            this.setKeyAction(16,
				Function.createDelegate(this, function(e) {
				    if (this.get_mouseMode() === ESRI.ADF.UI.MouseMode.Custom) { return; }
				    if (!this._shiftkey_restoremode) { this._shiftkey_restoremode = { "mode": this.get_mouseMode(), "cursor": this.get_cursor() }; }
				    this.set_mouseMode(ESRI.ADF.UI.MouseMode.ZoomIn);
				}),
				Function.createDelegate(this, function() {
				    if (this._shiftkey_restoremode) { this.set_mouseMode(this._shiftkey_restoremode.mode); this.set_cursor(this._shiftkey_restoremode.cursor); this._shiftkey_restoremode = null; }
				}), null, false); //shift zoom in box
            this.setKeyAction(17,
				Function.createDelegate(this, function(e) {
				    if (this.get_mouseMode() === ESRI.ADF.UI.MouseMode.Custom) { return; }
				    if (!this._shiftkey_restoremode) { this._shiftkey_restoremode = { "mode": this.get_mouseMode(), "cursor": this.get_cursor() }; }
				    this.set_mouseMode(ESRI.ADF.UI.MouseMode.ZoomOut);
				}),
				Function.createDelegate(this, function() {
				    if (this._shiftkey_restoremode) { this.set_mouseMode(this._shiftkey_restoremode.mode); this.set_cursor(this._shiftkey_restoremode.cursor); this._shiftkey_restoremode = null; }
				}), null, false); //ctrl zoom out box
        }
        if (this.get_element().style.width.endsWith('%') || this.get_element().style.height.endsWith('%')) {
            var ext = this.get_extent();
            if (this._mapsize[0] > 0 && this._mapsize[1] > 0 && ext) {
                this.doCallback('EventArg=MapSizeChanged&xmin=' + ext.get_xmin() + '&ymin=' + ext.get_ymin() + '&xmax=' + ext.get_xmax() + '&ymax=' + ext.get_ymax() + '&WIDTH=' + this._mapsize[0] + '&HEIGHT=' + this._mapsize[1] + '&startup=true', this);
            }
        }
        else {
            //Force recalculation of extent and notify server of changes if it got adjusted
            var ext = this._extent;
            this._extent = null;
            var ext2 = this.get_extent();
            if (ext && ext2) {
                if (ext.get_xmax() !== ext2.get_xmax() || ext.get_ymax() !== ext2.get_ymax() ||
				    ext.get_xmin() !== ext2.get_xmin() || ext.get_ymin() !== ext2.get_ymin()) {
                    this._onExtentChanged();
                }
            }
        }
        //9.2 backwards compatibility:
        Maps[this.get_id()] = this;
    },
    dispose: function() {
        /// <summary>Disposes the map and cleans up.</summary>
        /// <remarks>dispose is automatically invoked on page.unload, and should usually not be called directly</remarks>	
        this.remove_extentChanged(this._onExtentsChangedHandler);
        this._onExtentsChangedHandler = null;
        this.remove_mapResized(this._onMapResizedHandler);
        this._onMapResizedHandler = null;
        ESRI.ADF.UI.Map.callBaseMethod(this, 'dispose');
    },
    _onExtentChanged: function(sender, args) {
        if (!this._disableAutoCallbacks && this._mapsize[0] > 0 && this._mapsize[1] > 0) {
            var extent = args ? args.current : null;
            if (extent) {
                this.doCallback('EventArg=ExtentChanged&xmin=' + extent.get_xmin() + '&ymin=' + extent.get_ymin() +
					'&xmax=' + extent.get_xmax() + '&ymax=' + extent.get_ymax() +
					'&WIDTH=' + this._mapsize[0] + '&HEIGHT=' + this._mapsize[1], this);
            }
        }
    },
    _onMapResized: function(sender, args) {
        if (!this._disableAutoCallbacks) {
            var ext = this.get_extent();
            if (this._mapsize[0] > 0 && this._mapsize[1] > 0) {
                this.doCallback('EventArg=MapSizeChanged&xmin=' + ext.get_xmin() + '&ymin=' + ext.get_ymin() + '&xmax=' + ext.get_xmax() + '&ymax=' + ext.get_ymax() + '&WIDTH=' + this._mapsize[0] + '&HEIGHT=' + this._mapsize[1], this);
            }
        }
    },
    doCallback: function(argument, context) {
        /// <summary>
        /// Performs a callback or partial postback depending on the it's postback mode
        /// </summary>
        /// <param name="argument" type="String">The argument parsed back to the server control</param>
        /// <param name="context" type="String">The context of this callback</param>
        var args = { 'argument': argument };
        this._raiseEvent('onServerRequest', args);
        ESRI.ADF.System._doCallback(this._callbackFunctionString, this.get_uniqueID(), this.get_element().id, args.argument, context);
    },
    processCallbackResult: function(action, params) {
        /// <summary>
        /// Processes a result from a callback or partial postback
        /// </summary>
        /// <param name="action" type="String">Name of action</param>
        /// <param name="params" type="String">Action parameters</param>
        /// <returns type="Boolean">True on success</returns>
        /// <remarks>
        /// This method is invoked by the generic processor 'ESRI.ADF.System.processCallbackResults', 
        /// if the action wasn't supported by the generic process method.
        /// Extend it to add additional server/client functionality to this control.
        /// </remarks>
        if (action === 'insertLayer') {
            var layer = $find(params[0]);
            if (layer) {
                throw Error.invalidOperation('Cannot insert layer. ComponentID "' + params[0] + '" already in use.');
            }
            layer = eval(params[1]);
            var idx = params[2];
            this.get_layers().insert(layer, idx);
            return true;
        }
        else if (action === 'removeLayer') {
            var remlayer = $find(params[0]);
            if (remlayer) {
                this.get_layers().remove(remlayer);
                remlayer.dispose();
                return true;
            }
        }
        else if (action === 'moveLayer') {
            var movelayer = $find(params[0]);
            if (!movelayer) {
                return false;
            }
            var from = params[1];
            var to = params[2];
            this.get_layers().remove(movelayer);
            this.get_layers().insert(movelayer, to);
        }
        else if (action === "refreshLayer") {
            var layerid = params[0];
            var reflayer = $find(layerid);
            var idx = params[2];
            if (reflayer) {
                this.get_layers().remove(reflayer);
                reflayer.dispose();
            }
            reflayer = eval(params[1]);
            this.get_layers().insert(reflayer, idx);
            return true;
        }
        else if (action === "addGraphicsLayer") {
            var addgfxlayer = ESRI.ADF.Graphics.__AdfGraphicsLayer.parseJsonLayer(params[1], this);
            if (addgfxlayer) { this.addGraphic(addgfxlayer); return true; }
        }
        else if (action === "removeGraphicsLayer") {
            var remlayerid = this.get_id() + '_' + params[0];
            var remgfxlayer = $find(remlayerid);
            if (!remgfxlayer) { return false; }
            this.removeGraphic(remgfxlayer);
            remgfxlayer.dispose();
            return true;
        }
        else if (action === "clearGraphicsLayer") {
            var remlayerid = this.get_id() + '_' + params[0];
            var remgfxlayer = $find(remlayerid);
            if (!remgfxlayer) { return false; }
            remgfxlayer.clear();
            return true;
        }
        else if (action === "updateGraphicsLayerRow") {
            var upgfxlayerid = this.get_id() + '_' + params[0];
            var upGfxlayer = $find(upgfxlayerid);
            if (!upGfxlayer) { return false; }
            var uprow = $find(upgfxlayerid + '_' + params[1]);
            if (!uprow) { return false; }
            var rowidx = upGfxlayer.indexOf(uprow);
            upGfxlayer.remove(uprow);
            uprow.dispose();
            uprow = ESRI.ADF.Graphics.__AdfGraphicsLayer._parseRow(eval('(' + params[2] + ')'), upgfxlayerid);
            upGfxlayer.insert(uprow, rowidx);
            return true;
        }
        else if (action === "addGraphicsLayerRow") {
            var addgfxlayerid = this.get_id() + '_' + params[0];
            //var rowid = params[1];			
            var addgfxlayer2 = $find(addgfxlayerid);
            if (!addgfxlayer2) { return false; }
            var row = ESRI.ADF.Graphics.__AdfGraphicsLayer._parseRow(eval('(' + params[2] + ')'), addgfxlayerid);
            addgfxlayer2.add(row);
            return true;
        }
        else if (action === "deleteGraphicsLayerRow") {
            var dellayerid = this.get_id() + '_' + params[0];
            var delgfxlayer = $find(dellayerid);
            if (!delgfxlayer) { return false; }
            var delrow = $find(dellayerid + '_' + params[1]);
            if (!delrow) { return false; }
            delgfxlayer.remove(delrow);
            delrow.dispose();
            return true;
        }
        else if (action === "setextent") {
            this._disableAutoCallbacks = true;
            this.set_extent(new ESRI.ADF.Geometries.Envelope(params[0], params[1], params[2], params[3]));
            this._disableAutoCallbacks = false;
            return true;
        }
        else if (action === "zoomToBox") {
            this._disableAutoCallbacks = true;
            this.zoomToBox(new ESRI.ADF.Geometries.Envelope(parseFloat(params[0]), parseFloat(params[1]), parseFloat(params[2]), parseFloat(params[3])), true);
            this._disableAutoCallbacks = false;
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
    get_callbackFunctionString: function() {
        /// <value name="callbackFunctionString" type="String">Gets or sets the callback function string used to send a request to the serverside Map control.</value>
        /// <remarks>
        /// Executing the callbackfunctionstring will either generate a partial postback or a callback to the server, depending on the current AJAX mode.
        /// To perform a call to the servercontrol, use the <see cref="doCallback"/> method of this instance.
        /// </remarks>
        return this._callbackFunctionString;
    },
    set_callbackFunctionString: function(value) {
        this._callbackFunctionString = value;
    },
    set_clientToolGraphicsColor: function(value) { this._clientToolGraphicsColor = value; },
    get_clientToolGraphicsColor: function() {
        /// <value name="clientToolGraphicsColor" type="String">The color of the box drawn on the Map control display while using the client draw action tools.</value>
        return this._clientToolGraphicsColor;
    },
    set_clientToolGraphicsWidth: function(value) { this._clientToolGraphicsWidth = value; },
    get_clientToolGraphicsWidth: function() {
        /// <value name="clientToolGraphicsWidth" type="Number" integer="true">The width of the box/line on the Map control display while using the client draw action tools.</value>
        return this._clientToolGraphicsWidth;
    },
    add_onServerRequest: function(handler) {
        /// <summary>Raised prior to a server request.</summary>
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
	/// 				<td>ESRI.ADF.UI.Map</td>
	/// 				<td>The map issuing the server request</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.argument</td>
	/// 				<td>String</td>
	/// 				<td>The argument of the request.  The argument can be modified to include or remove argument/value pairs.</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>	
        this.get_events().addHandler('onServerRequest', handler);
    },
    remove_onServerRequest: function(handler) { this.get_events().removeHandler('onServerRequest', handler); }
};
ESRI.ADF.UI.Map.registerClass('ESRI.ADF.UI.Map', ESRI.ADF.UI.MapBase);

//9.2 backwards compatibility functions
///////////////////////////////////// Set Tool Functions /////////////////////////////////////
Type.registerNamespace('ESRI.ADF.MapTools');
//The global method aliases below that are not within the ESRI namespace are considered obsolete for 9.3+. Please use the fully qualified names within ESRI.ADF.MapTools.*
ESRI.ADF.MapTools.fillColor = null;
ESRI.ADF.MapTools.lineColor = 'black';

MapDragImage = ESRI.ADF.MapTools.MapDragImage = function(mapid, mode, showLoading, cursor) {
    var map = $find(mapid);
    if (!map) { map = Pages[mapid]; }
    if (ESRI.ADF.UI.Map.isInstanceOfType(map)) {
        map.set_mouseMode(ESRI.ADF.UI.MouseMode.Pan);
        if (cursor) {
            map.set_cursor(cursor);
        }
    }
    else if (ESRI.ADF.UI.Page.isInstanceOfType(map)) {
        ESRI.ADF.PageTools.PageMapDragImage(mapid, mode, showLoading, cursor);
    }
};
MapDragRectangle = ESRI.ADF.MapTools.DragRectangle = function(mapid, mode, showLoading, cursor) {
    var map = $find(mapid);
    if (!map) { map = Pages[mapid]; }
    if (ESRI.ADF.UI.Map.isInstanceOfType(map)) {
        if (mode === 'MapZoomIn') {
            map.set_mouseMode(ESRI.ADF.UI.MouseMode.ZoomIn);
        }
        else if (mode === 'MapZoomOut') {
            map.set_mouseMode(ESRI.ADF.UI.MouseMode.ZoomOut);
        }
        else {
            var onComplete = Function.createDelegate(map, function(geom) {
                var geomString = geom.get_xmin() + ':' + geom.get_ymin() + '|' + geom.get_xmax() + ':' + geom.get_ymax();
                this.doCallback('EventArg=DragRectangle&coords=' + geomString + '&' + mapid + '_mode=' + mode, this);
            });
            map.getGeometry(ESRI.ADF.Graphics.ShapeType.Envelope, onComplete, function() { map.__activeToolMode = null; }, map.get_clientToolGraphicsColor(), ESRI.ADF.MapTools.fillColor, cursor, true);
            map.__activeToolMode = mode;
        }
        if (cursor) {
            map.set_cursor(cursor);
        }
    }
    else if (ESRI.ADF.UI.Page.isInstanceOfType(map)) {
        ESRI.ADF.PageTools.PageMapDragRectangle(mapid, mode, showLoading, cursor);
    }
};
MapBox = MapDragBox = ESRI.ADF.MapTools.DragRectangle;
MapPoint = ESRI.ADF.MapTools.Point = function(mapid, mode, showLoading, cursor) {
    var map = $find(mapid);
    if (!map) { map = Pages[mapid]; }
    if (ESRI.ADF.UI.Map.isInstanceOfType(map)) {
        var onComplete = Function.createDelegate(map, function(geom) {
            this.doCallback('EventArg=Point&coords=' + geom.toString(':') + '&' + mapid + '_mode=' + mode, this);
        });
        map.getGeometry(ESRI.ADF.Graphics.ShapeType.Point, onComplete, function() { map.__activeToolMode = null; }, null, null, cursor, true);
        map.__activeToolMode = mode;
    }
    else if (ESRI.ADF.UI.Page.isInstanceOfType(map)) {
        ESRI.ADF.PageTools.PageMapPoint(mapid, mode, showLoading, cursor);
    }
};
MapLine = ESRI.ADF.MapTools.Line = function(mapid, mode, showLoading, cursor, vectorToolbarState) {
    var map = $find(mapid);
    var onComplete = Function.createDelegate(map, function(geom) {
        var geomString = geom.getPath(0).toString('|', ':');
        this.doCallback('EventArg=Line&coords=' + geomString + '&' + mapid + '_mode=' + mode, this, null);
    });
    map.getGeometry(ESRI.ADF.Graphics.ShapeType.Line, onComplete, function() { map.__activeToolMode = null; }, map.get_clientToolGraphicsColor(), null, cursor, true);
    map.__activeToolMode = mode;
};
MapPolyline = ESRI.ADF.MapTools.Polyline = function(mapid, mode, showLoading, cursor, vectorToolbarState) {
    var map = $find(mapid);
    var onComplete = Function.createDelegate(map, function(geom) {
        var geomString = geom.getPath(0).toString('|', ':');
        this.doCallback('EventArg=Polyline&coords=' + geomString + '&' + mapid + '_mode=' + mode, this);
    });
    map.getGeometry(ESRI.ADF.Graphics.ShapeType.Path, onComplete, function() { map.__activeToolMode = null; }, map.get_clientToolGraphicsColor(), null, cursor, true);
    map.__activeToolMode = mode;
};
MapPolygon = ESRI.ADF.MapTools.Polygon = function(mapid, mode, showLoading, cursor, vectorToolbarState) {
    var map = $find(mapid);
    var onComplete = Function.createDelegate(map, function(geom) {
        var geomString = geom.getRing(0).toString('|', ':');
        this.doCallback('EventArg=Polygon&coords=' + geomString + '&' + mapid + '_mode=' + mode, this);
    });
    map.getGeometry(ESRI.ADF.Graphics.ShapeType.Ring, onComplete, function() { map.__activeToolMode = null; }, map.get_clientToolGraphicsColor(), ESRI.ADF.MapTools.fillColor, cursor, true);
    map.__activeToolMode = mode;
};
MapDragCircle = MapCircle = ESRI.ADF.MapTools.Circle = function(mapid, mode, showLoading, cursor, vectorToolbarState) {
    var map = $find(mapid);
    var onComplete = Function.createDelegate(map, function(geom) {
        var geomString = geom.get_center().toString(':') + ':' + geom.get_width() * 0.5;
        this.doCallback('EventArg=Circle&coords=' + geomString + '&' + mapid + '_mode=' + mode, this);
    });
    map.getGeometry(ESRI.ADF.Graphics.ShapeType.Circle, onComplete, function() { map.__activeToolMode = null; }, map.get_clientToolGraphicsColor(), ESRI.ADF.MapTools.fillColor, cursor, true);
    map.__activeToolMode = mode;
};
MapDragOval = MapOval = ESRI.ADF.MapTools.Oval = function(mapid, mode, showLoading, cursor, vectorToolbarState) {
    var map = $find(mapid);
    var onComplete = Function.createDelegate(map, function(geom) {
        var geomString = geom.get_center().toString(':') + ':' + Math.abs(geom.get_width()) + ':' + Math.abs(geom.get_height());
        this.doCallback('EventArg=Oval&coords=' + geomString + '&' + mapid + '_mode=' + mode, this);
    });
    map.getGeometry(ESRI.ADF.Graphics.ShapeType.Oval, onComplete, function() { map.__activeToolMode = null; }, map.get_clientToolGraphicsColor(), ESRI.ADF.MapTools.fillColor, cursor, true);
    map.__activeToolMode = mode;
};
MapTips = ESRI.ADF.MapTools.MapTips = function(mapid, mode, showLoading, cursor) {
    //TODO
    throw (new Error.notImplemented('MapTips'));
};
//The following properties and objects are considered obsolete for 9.3+:
ESRI.ADF.UI.MapBase.prototype.resize = function(width, height, resizeExtent) { };
Maps = [];

//
// ProgressBarExtender
//

ESRI.ADF.UI.ProgressBarExtender = function() {
    /// <summary>
    /// The ProgressBarExtender control indicates the progress of a map draw operation.      
    /// </summary>
    ESRI.ADF.UI.ProgressBarExtender.initializeBase(this);
    this._height = 10;
    this._map = null;
    this._width = null;
    this._barIsVisible = false;
    this._opacity = 0.35;
    this._maxNoOfTiles = 1; //Number of missing tiles which corresponds to 0% loaded
    this._displayDelay = 1000; //Number of milliseconds of downloading tiles before showing the progressbar
    this._spinnerPosition = null;
    this._barColor = '#666';
    //this._colors = ['#c3f5c7','#8aec92','#51e25c'] //Colors used for the spinner
    this._colors = ['#99f', '#99d', '#99b']; //Colors used for the spinner
    //this._colors = ['#ddd','#bbb','#999','#777','#555'] //Colors used for the spinner
    this._progressBarAlignment = ESRI.ADF.System.ContentAlignment.BottomRight;
};
ESRI.ADF.UI.ProgressBarExtender.prototype = {
    initialize: function() {
        //Get bounds of map to calculate position of progressbar
        var bounds = Sys.UI.DomElement.getBounds(this._map.get_element());
        //Create outer progressbar
        this._pbar = document.createElement('div');
        this._pbar.style.position = 'absolute';
        this._pbar.style.zIndex = 10000;
        this._pbar.style.height = this._height + 'px';
        this._pbar.style.width = this._width;
        this._pbar.style.border = 'solid 1px #000';
        this._pbar.style.backgroundColor = '#fff';
        this._pbar.style.overflow = 'hidden';
        this._pbar.style.fontSize = '1px';

        ESRI.ADF.System.setOpacity(this._pbar, 0.0);
        //Create fill bar
        this._bar = document.createElement('div');
        this._bar.style.height = this._height + 'px';
        this._bar.style.width = '0';
        this._bar.style.backgroundColor = this._barColor;
        this._bar.style.position = 'relative';

        this._spinner = document.createElement('div');
        for (var i = 0; i < this._colors.length; i++) {
            var stripe = document.createElement('div');
            stripe.style.width = '8px';
            stripe.style.height = this._height + 'px';
            stripe.style.marginLeft = '1px';
            stripe.style.backgroundColor = this._colors[i];
            stripe.style.position = 'absolute';
            stripe.style.left = 9 * i + 'px';
            stripe.style.top = '0px';
            this._spinner.appendChild(stripe);
        }
        this._spinnerWidth = 9 * this._colors.length;
        this._spinner.style.position = 'relative';
        this._spinner.style.left = 0;
        this._spinner.style.zIndex = 1;
        this._pbar.appendChild(this._spinner);
        document.body.appendChild(this._pbar);
        this._pbar.appendChild(this._bar);

        this._barWidth = parseInt(this._pbar.clientWidth, 10);
        //Fade animation stuff
        this._animation1 = new AjaxControlToolkit.Animation.FadeAnimation(this._pbar, 0.25, 25, AjaxControlToolkit.Animation.FadeEffect.FadeIn, 0, this._opacity, true);
        this._animation2 = new AjaxControlToolkit.Animation.FadeAnimation(this._pbar, 0.25, 25, AjaxControlToolkit.Animation.FadeEffect.FadeOut, 0, this._opacity, true);
        //Show/hide progressbar on animation end to prevent any mouse interaction
        this._animation1.add_started(Function.createDelegate(this, function() { this._pbar.style.display = ''; }));
        this._animation2.add_ended(Function.createDelegate(this, function() { this._pbar.style.display = 'none'; }));
        this._onProgressHandler = Function.createDelegate(this, this._onProgress);
        this._zoomStartHandler = Function.createDelegate(this, this._onZoom);
        this._spinnerAnimateHandler = Function.createDelegate(this, this._spinnerAnimate);
        this._mapChanged = Function.createDelegate(this, this._repositionProgressBar);
        this._map.add_onProgress(this._onProgressHandler);
        this._map.add_zoomStart(this._zoomStartHandler);
        this._map.add_mapResized(this._mapChanged);
        this._repositionProgressBar();
    },
    _onLayersChanged: function(s, e) {
        if (e.get_propertyName() == 'layers') {
            s.get_layers().add_layerAdded(this._mapChanged);
            s.get_layers().add_layerRemoved(this._mapChanged);
            this._mapChanged();
        }
    },
    dispose: function() {
        if (this._isDisposed || !this.get_isInitialized()) { return; }
        this._map.get_layers().remove_layerAdded(this._mapChanged);
        this._map.get_layers().remove_layerRemoved(this._mapChanged);
        this._map.remove_mapResized(this._mapChanged);
        this._map.remove_onProgress(this._onProgressHandler);
        this._map.remove_zoomStart(this._zoomStartHandler);
        this._mapChanged = null;
        this._onProgressHandler = null;
        this._zoomStartHandler = null;
        this._animation1.dispose();
        this._animation2.dispose();
        if (this._pbar && this._pbar.parentNode) { this._pbar.parentNode.removeChild(this._pbar); }
        this._bar = null;
        this._pbar = null;
        this._isDisposed = true;
    },
    _spinnerAnimate: function() {
        if (this._spinnerPosition === null || this._spinnerPosition > parseInt(this._barWidth, 10)) { this._spinnerPosition = -this._spinnerWidth; }
        else { this._spinnerPosition += 5; }
        this._spinner.style.left = this._spinnerPosition + 'px';
        if (this._barIsVisible) {
            this._spinnerTimer = window.setTimeout(this._spinnerAnimateHandler, 50);
        }
        else { this._spinnerPosition = null; }
    },
    _showProgressBar: function() {
        this._showTimer = null;
        if (this._barIsVisible) {
            this._animation2.stop();
            this._spinnerAnimate();
            this._animation1.play();
        }
    },
    _onZoom: function() {
        // If the map zooms, all tiles are removed.
        // Hide the bar immediately instead of fading it out.
        this._animation1.stop();
        this._animation2.stop();
        ESRI.ADF.System.setOpacity(this._pbar, 0.0);
        this._barIsVisible = false;
        this._maxNoOfTiles = 1;
    },
    _onProgress: function(s, e) {
        //if(this._maxNoOfTiles<=1) return;
        if (!this._barIsVisible && e > 0) {
            // Delay showing of bar. We don't want to keep fading it in/out if the
            // pending tiles are returned really fast (usually the case with client-cached tiles).
            if (!this._showProgressBarHandler) { this._showProgressBarHandler = Function.createDelegate(this, this._showProgressBar); }
            this._showTimer = window.setTimeout(this._showProgressBarHandler, this._displayDelay);
            this._barIsVisible = true;
        }
        if (e > this._maxNoOfTiles) { this._maxNoOfTiles = e; } //change estimate to maximum images requested
        var width = Math.round(this._barWidth / this._maxNoOfTiles) * (this._maxNoOfTiles - e);
        if (width > this._barWidth) { width = this._barWidth; }
        else if (width < 0) { width = 0; }
        this._bar.style.width = width + 'px';
        if (e === 0 && this._barIsVisible) {
            if (this._showTimer) {
                window.clearTimeout(this._showTimer);
                this._showTimer = null;
            }
            else {
                this._animation1.stop();
                this._animation2.play();
            }
            this._spinnerTimer = null;
            this._barIsVisible = false;
        }
    },
    _repositionProgressBar: function() {
        if (!this._pbar || !this._map._controlDiv) { return; }
        //Reposition in case map size and position also changed
        var bounds = Sys.UI.DomElement.getBounds(this._map._controlDiv); //get size of map
        //right,center,left alignment:
        if (this._progressBarAlignment & 1092) { this._pbar.style.left = (bounds.x + bounds.width - this._barWidth - 5) + 'px'; }
        else if (this._progressBarAlignment & 546) { this._pbar.style.left = (bounds.x + (bounds.width - this._barWidth) / 2) + 'px'; }
        else { this._pbar.style.left = bounds.x + 5 + 'px'; }
        //Bottom,middle,top
        if (this._progressBarAlignment & 1792) { this._pbar.style.top = (bounds.y + bounds.height - this._height - 7) + 'px'; }
        else if (this._progressBarAlignment & 112) { this._pbar.style.top = (bounds.y + (this._height + bounds.height) / 2) + 'px'; }
        else { this._pbar.style.top = (bounds.y + this._height - 7) + 'px'; }
    },
    get_map: function() { return this._map; },
    set_map: function(value) { this._map = value; },
    get_width: function() { return this._width; },
    set_width: function(value) { this._width = value; },
    get_progressBarAlignment: function() { return this._progressBarAlignment; },
    set_progressBarAlignment: function(value) { this._progressBarAlignment = value; this._repositionProgressBar(); }
};
ESRI.ADF.UI.ProgressBarExtender.registerClass('ESRI.ADF.UI.ProgressBarExtender', Sys.Component);


if (typeof (Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }