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

/// <reference name="MicrosoftAjax.debug.js"/>
Type.registerNamespace('ESRI.ADF.Layers');

ESRI.ADF.Layers.LayerCollection = function() {
	/// <summary>Layer collection used by the map</summary>
	/// <param name="extent" type="ESRI.ADF.Geometries.Envelope">
	/// Extents of the datasource
	/// </param>
	/// <param name="spatialReference" type="String" optional="true" mayBeNull="true">
	/// Spatial reference of this datasource
	/// </param>
	ESRI.ADF.Layers.LayerCollection.initializeBase(this);
	this._resources = [];
	this._levels = null;
	this._pendingResourceCount=0;
	this._resourceChangedHandler = Function.createDelegate(this, this._resourceChanged);
};
ESRI.ADF.Layers.LayerCollection.prototype = {
	dispose : function() {
    /// <summary>Disposes and removes each resource from the collection</summary>
		for(var idx=0;idx<this._resources.length;idx++) {
			this._resources[idx].dispose();
		}
		Array.clear(this._resources);
        ESRI.ADF.Layers.LayerCollection.callBaseMethod(this, 'dispose');
	},
	add : function(layer) {
		/// <summary>Adds a layer to the layer collection</summary>
		/// <param name="layer" type="ESRI.ADF.Layers.Layer">
		/// Layer to add to the collection
		/// </param>
		Array.add(this._resources, layer);
		if(!layer.get_isInitialized())
		{
			layer.add_initialized(Function.createDelegate(this,this._onResourceInitialized));
			this._pendingResourceCount++;
			//alert(this._pendingResourceCount+' increased pendings....'+resource.get_name());
		}
		else if(this._pendingResourceCount===0) {
			this._calculateLevelScheme();
		}
		var handler = this.get_events().getHandler('layerAdded');
		if (handler) { handler(this, layer); }
		layer.add_propertyChanged(this._resourceChangedHandler);		
	},
	insert : function(layer,index) {
		/// <summary>Inserts a layer into the layer collection.</summary>
		/// <param name="layer" type="ESRI.ADF.Layers.Layer">
		/// Layer to insert into the collection.
		/// </param>
		/// <param name="index" type="Number" integer="true">
		/// Position to insert the layer.
		/// </param>
		Array.insert(this._resources,index,layer);
		if(!layer.get_isInitialized())
		{
			layer.add_initialized(Function.createDelegate(this,this._onResourceInitialized));
			this._pendingResourceCount++;
			//alert(this._pendingResourceCount+' increased pendings....'+resource.get_name());
		}
		else if(this._pendingResourceCount===0) {
			this._calculateLevelScheme();
		}
		var handler = this.get_events().getHandler('layerAdded');
		if (handler) { handler(this, layer); }
		layer.add_propertyChanged(this._resourceChangedHandler);		
	},
	remove : function(layer) {
		/// <summary>Removes a layer from the layer collection.</summary>
		/// <param name="layer" type="ESRI.ADF.Layers.Layer">
		/// Layer to remove from the collection.
		/// </param>
		Array.remove(this._resources, layer);
		if(!layer.get_isInitialized())
		{
			layer.remove_initialized(this._onResourceInitialized);
			this._pendingResourceCount--;			
		}
		else { this._calculateLevelScheme(); }
		var handler = this.get_events().getHandler('layerRemoved');
		if (handler) { handler(this, layer); }
		layer.remove_propertyChanged(this._resourceChangedHandler);		
	},
	indexOf : function(layer) {
		/// <summary>Gets the index of a layer in the layer collection.</summary>
		/// <param name="layer" type="ESRI.ADF.Layers.Layer">
		/// Layer to remove from the collection.
		/// </param>
		/// <returns type="Number" integer="true">Index of layer</returns>
		return Array.indexOf(this._resources,layer);
	},
	get_layer : function(index) {
		/// <value type="ESRI.ADF.Layers.Layer">Gets the layer at the specified index of the layer collection.</value>
		/// <param name="index" type="Number" integer="true">Layerindex</param>
		return this._resources[index];
	},
	get_layerCount : function() {
		/// <value type="Number" integer="true">Gets the number of layers in the collection</value>
		return this._resources.length;
	},
	_onResourceInitialized : function(s,e) {
		this._pendingResourceCount--;
		if(this._pendingResourceCount===0) {
			this._calculateLevelScheme();
			var handler = this.get_events().getHandler('layersInitialized');
			if (handler) { handler(this, Sys.EventArgs.Empty); }
		}
	},
	get_hasPendingLayers : function() {
		/// <value type="Boolean">Returns true if this collection contains any layers that are not yet initialized.</value>
		return (this._pendingResourceCount>0);
	},
	get_extent : function() {
		/// <value type="ESRI.ADF.Geometries.Envelope">Gets the combined extent of all initialized layers</value>
		if(this._resources.length===0) { return null; }
		var extent = this._resources[0].get_extent();
		for(var idx=1;idx<this._resources.length;idx++) {
			if(this._resources[idx].get_isInitialized()) {
				extent = extent.join(this._resources[idx].get_extent());
			}
		}
		return extent;
	},
	__hasTiledResources : function() {
		Sys.Debug.trace('__hasTiledResources is obsolete. Use __hasLevels');
		for(var idx=0;idx<this._resources.length;idx++) {
			if(ESRI.ADF.Layers.TileLayer.isInstanceOfType(this._resources[idx])) {
				return true;
			}			
		}
		return false;
	},
	__hasLevels : function() {
		for(var idx=0;idx<this._resources.length;idx++) {
			if(ESRI.ADF.Layers.TileLayer.isInstanceOfType(this._resources[idx])) {
				return true;
			}
			else if(this._resources[idx]._levels) {
				return true;
			}
		}
		return false;
	},
	getLevelByNearestPixelsize : function(pixelsize) {
		/// <summary>Gets the level that closets matches a given pixelsize</summary>
		/// <param name="pixelsizeX" type="Number">
		/// PixelSize resolution to match to (if X and Y resolution differ, X is used)
		/// </param>
		/// <returns type="Number" integer="true">Level index</returns>
		if(!this._levels) { return null; }
		var level = 0;
		for(var idx=1;idx<this._levels.length;idx++)
		{
			if(Math.abs(this._levels[idx]-pixelsize)<Math.abs(this._levels[level]-pixelsize)) {
				level = idx;
			}
		}
		return level;
	},
	get_levelResolution : function(level) {
		/// <value type="Number" integer="true">Gets the pixel resolution at the given level</value>
		/// <param name="level" type="Number" integer="true">Level</param>
		if(this._levels) { return this._levels[level]; }
		else { return null; }
	},
	_calculateLevelScheme : function() {
		if(this.get_layerCount()===0) { this._levels = null; return; }		
		if(!this.__hasLevels()) { 
			this._levels = null;			
		}
		else {
			this._levels = [];
			for(var idx=0;idx<this._resources.length;idx++) {
				if(ESRI.ADF.Layers.TileLayer.isInstanceOfType(this._resources[idx])) {
					var levels = this._resources[idx].get_levels();
					for(var j=0;j<levels.length;j++) {
						if(!Array.contains(this._levels,levels[j].get_resX())) {
							Array.add(this._levels,levels[j].get_resX());
						}
					}
				}
				else if(this._resources[idx].get_levels()) {
					var levels = this._resources[idx].get_levels();
					for(var j=0;j<levels.length;j++) {
						if(!Array.contains(this._levels,levels[j])) {
							Array.add(this._levels,levels[j]);
						}
					}
				}
			}
			this._levels.sort(function(a,b){return (a<b?-1:1);});
			for(var k=this._levels.length-1;k>0;k--) {
				if(this._resolutionsAreSame(this._levels[k],this._levels[k-1])) {
					Array.remove(this._levels,this._levels[k]);
				}
			}
			this._levels.reverse();
		}
	},
	_resourceChanged : function(sender, args) {
		var handler = this.get_events().getHandler('layerChanged');
		if (handler) { handler(this, {"resource": sender, "eventArgs": args}); }
	},
	_resolutionsAreSame : function(r1,r2) {
		if(r1===r2) { return true; }
		//A pixel resolution making a 256px tile less then 1/2 a pixel wider is considered the same
		return (Math.abs(256.0/r1*r2-256.0)<0.5);		
	},
	get_levels : function() {
		/// <value type="Array" elementType="Number">Gets the combined set of level resolutions across all layers</value>
		return this._levels;
	},
	add_layersInitialized : function(handler) {
		/// <summary>Fired when all layers in the layer collection is ready and initialized.</summary>
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
	/// 				<td>ESRI.ADF.Layers.LayerCollection</td>
	/// 				<td>The layer collection containing the initialized layers</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('layersInitialized', handler);
	},
	remove_layersInitialized : function(handler) { this.get_events().removeHandler('layersInitialized', handler); },
	add_layerAdded : function(handler) {
		/// <summary>Fired when a layer was added to the layer collection.</summary>
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
	/// 				<td>ESRI.ADF.Layers.LayerCollection</td>
	/// 				<td>The layer collection to which a layer was added</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>ESRI.ADF.Layers.Layer</td>
	/// 				<td>The layer that was added to the collection</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('layerAdded', handler);
	},
	remove_layerAdded : function(handler) { this.get_events().removeHandler('layerAdded', handler); },
	add_layerRemoved : function(handler) {
		/// <summary>Fired when a layer was removed from the layer collection.</summary>
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
	/// 				<td>ESRI.ADF.Layers.LayerCollection</td>
	/// 				<td>The layer collection from which a layer was removed</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>ESRI.ADF.Layers.Layer</td>
	/// 				<td>The layer that was removed from the collection</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>	
		this.get_events().addHandler('layerRemoved', handler);
	},
	remove_layerRemoved : function(handler) { this.get_events().removeHandler('layerRemoved', handler); },
	add_layerChanged : function(handler) {
		/// <summary>Fired when a property of a layer has changed.</summary>
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
	/// 				<td>ESRI.ADF.Layers.LayerCollection</td>
	/// 				<td>The layer collection containing the layer that was changed</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.resource</td>
	/// 				<td>ESRI.ADF.Layers.Layer</td>
	/// 				<td>The layer that was changed</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.eventArgs</td>
	/// 				<td>Sys.PropertyChangedEventArgs</td>
	/// 				<td>Arguments object containing the name of the property that was modified on the layer.  Accessed by a call to get_propertyName.</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('layerChanged', handler);
	},
	remove_layerChanged : function(handler) { this.get_events().removeHandler('layerChanged', handler); }
};
ESRI.ADF.Layers.LayerCollection.registerClass('ESRI.ADF.Layers.LayerCollection', Sys.Component);

ESRI.ADF.Layers.Layer = function(id, extent, sref) {
	/// <summary>Abstract class for a layer</summary>
	/// <param name="id" type="String">The id of the layer.</param>
	/// <param name="extent" type="ESRI.ADF.Geometries.Envelope">Extent of the datasource.</param>
	/// <param name="spatialReference" type="String" optional="true" mayBeNull="true">Spatial reference of this datasource.</param>
	if(id) { this.set_id(id); }
	ESRI.ADF.Layers.Layer.initializeBase(this);
	this._extent = extent;
	this._spatialReference = sref;
	this._opacity = 1;
	this._visible = true;
	this._functionalities = [];
};
ESRI.ADF.Layers.Layer.prototype = {
	initialize : function() {
		/// <summary>Initializes the layer instance.</summary>
		ESRI.ADF.Layers.Layer.callBaseMethod(this, 'initialize');	
		if(!this._name) { this._name = this.get_id(); }
		var handler = this.get_events().getHandler('initialized');
		if (handler) { handler(this, Sys.EventArgs.Empty); }
	},
	get_extent : function() {
		/// <value name="extent" type="ESRI.ADF.Geometries.Envelope" mayBeNull="true">
		/// Gets or sets the extent of the layer.
		/// </value>
		return this._extent;
	},
	set_extent : function(extent) {
		if(extent && !ESRI.ADF.Geometries.Envelope.isInstanceOfType(extent)) { throw Error.argumentType('extent',Object.getType(extent),ESRI.ADF.Geometries.Envelope); }
		if(this._extent !== extent && (!extent || !this._extent ||
			extent.get_xmin()!==this._extent.get_xmin() || extent.get_ymin()!==this._extent.get_ymin() ||
			extent.get_xmax()!==this._extent.get_xmax() || extent.get_ymax()!==this._extent.get_ymax())) {
			this._extent=extent;
			this.raisePropertyChanged('extent');
		}
	},
	get_imageFormat : function() {
		/// <value type="String">
		/// Gets or sets the imageformat this resource uses.
		/// </value>
		/// <remarks>
		/// Format should be lowercase. Examples: 'gif','jpg','jpeg','png8','png24','png32'.
		/// The imageFormat property is only important for handling PNG transparency correctly in Internet Explorer.
		/// Also note that for png32 images, image transparency is used and layer opacity will be ignored.
		/// </remarks>
		return this._imageFormat;
	},
	set_imageFormat : function(value) {
		this._imageFormat = value;
	},
	get_name : function() {
		/// <value type="String">Gets or sets the name of the layer.</value>
		return this._name;
	},
	set_name : function(value) {
		this._name = value;
	},
	get_spatialReference : function() {
		/// <value type="String">Gets or sets the name of the layer.</value>
		return this._spatialReference;
	},
	set_spatialReference : function(value) {
		this._spatialReference = value;
	},
	get_opacity : function() {
		/// <value type="Number">Gets or sets the opacity of the layer.</value>
		/// <remarks>
		/// <para>The opacity is a value between 0 (transparent) to 1 (opaque).</para>
		/// <para>Note that for png32 images, image transparency is used and layer opacity will be ignored.</para>
		/// </remarks>
		return this._opacity;
	},
	set_opacity : function(value) {
		if(this._opacity !== value) {
			this._opacity = value;
			this.raisePropertyChanged('opacity');
		}
	},
	get_visible : function() {
		/// <value type="Boolean">Gets or sets the visibility of the layer.</value>
		return this._visible;
	},
	set_visible : function(value) {
		if(this._visible !== value) {
			this._visible = value;
			this.raisePropertyChanged('visible');
		}
	},
	add_initialized : function(handler) {
	/// <summary>Fired when a property of a layer has been initialized.</summary>
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
	/// 				<td>ESRI.ADF.Layers.Layer</td>
	/// 				<td>The layer that was initialized</td>
	/// 			</tr> 			
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('initialized', handler);
	},
	remove_initialized : function(handler) { this.get_events().removeHandler('initialized', handler); }
};
ESRI.ADF.Layers.Layer.registerClass('ESRI.ADF.Layers.Layer', Sys.Component);

ESRI.ADF.Layers.LevelInfo = function(tileHeight,tileWidth,rows,columns,resX,resY,minrow,mincol) {
	/// <summary>The levelinfo class defines tilesize and number of tiles on a level,
	/// as well as row/column offset from tileorigin.</summary>
	/// <param name="tileHeight" type="Number" integer="true">Tile height in pixels.</param>
	/// <param name="tileWidth" type="Number" integer="true">Tile width in pixels.</param>
	/// <param name="rows" type="Number" integer="true">Number of rows.</param>
	/// <param name="columns" type="Number" integer="true">Number of columns.</param>
	/// <param name="resX" type="Number">Horizontal resolution.</param>
	/// <param name="resY" type="Number">Vertical resolution.</param>
	/// <param name="minrow" type="Number" integer="true">Minimum row number.</param>
	/// <param name="mincol" type="Number" integer="true">Minimum column number.</param>
	this._tileHeight = tileHeight;
	this._tileWidth = tileWidth;
	this._rows = rows;
	this._columns = columns;
	this._minRow = (minrow?minrow:0);
	this._minCol = (mincol?mincol:0);
	this._resX = resX;
	this._resY = (resY?resY:resX);
};
ESRI.ADF.Layers.LevelInfo.prototype = {
	get_tileHeight : function() {
		/// <value type="Number" integer="true">Gets or sets the tile height in pixels.</value>
		return this._tileHeight;
	},
	set_tileHeight : function(value) { this._tileHeight = value; },
	get_tileWidth : function() {
		/// <value type="Number" integer="true">Gets or sets the tile width in pixels.</value>
		return this._tileWidth;
	},
	set_tileWidth : function(value) { this._tileWidth = value; },
	get_rows : function() {
		/// <value type="Number" integer="true">Gets or sets the number of rows.</value>
		return this._rows;
	},
	set_rows : function(value) { this._rows = value; },
	get_columns : function() {
		/// <value type="Number" integer="true">Gets or sets the number of columns.</value>
		return this._columns;
	},
	set_columns : function(value) { this._columns = value; },
	get_minRow : function() {
		/// <value type="Number" integer="true">Gets or sets the minimum row number.</value>
		return this._minRow;
	},
	set_minRow : function(value) { this._minRow = value; },
	get_minCol : function() {
		/// <value type="Number" integer="true">Gets or sets the minimum column number.</value>
		return this._minCol;
	},
	set_minCol : function(value) { this._minCol = value; },
	get_resX : function() {
		/// <value type="Number">Gets or sets the horizontal resolution.</value>
		return this._resX;
	},
	set_resX : function(value) { this._resX = value; },
	get_resY : function() {
		/// <value type="Number">Gets or sets the vertical resolution.</value>
		return this._resY;
	},
	set_resY : function(value) { this._resY = value; }
};
ESRI.ADF.Layers.LevelInfo.registerClass('ESRI.ADF.Layers.LevelInfo');

ESRI.ADF.Layers.TileLayer = function(id, extent, levels, sref) {
	/// <summary>Abstract class for a tiled layer</summary>
	/// <param name="id" type="String">The id of the layer.</param>
	/// <param name="extent" type="ESRI.ADF.Geometries.Envelope">Extent of the datasource.</param>
	/// <param name="levels" type="Array" elementType="ESRI.ADF.Layers.LevelInfo">
	/// Array of <see cref="ESRI.ADF.Layers.LevelInfo"/> for the supported levels, descending from the largest.
	/// </param>
    /// <param name="spatialReference" type="String" optional="true" mayBeNull="true">
	/// Spatial reference of this datasource.
	/// </param>
	ESRI.ADF.Layers.TileLayer.initializeBase(this, [id, extent, sref]);
	this._levels = (levels?levels:[]);
};

ESRI.ADF.Layers.TileLayer.prototype = {
	getTileUrl : function(column,row,level,handler) {
		/// <summary>Gets the URL of a specific tile</summary>
		/// <param name="column" type="Number" integer="true">Column</param>
		/// <param name="row" type="Number" integer="true">Row</param>
		/// <param name="level" type="Number" integer="true">Level</param>
		/// <param name="handler" type="Function">The method to call with the URL.</param>
		/// <remarks>This function must be overridden by the specific Tiled Layer implementation</remarks>
		throw(new Error.notImplemented('getTileUrl'));
	},
	getLevelExtent : function(level) {
		/// <summary>Computes the extent of all tiles at a specific level.</summary>
		/// <param name="level" type="Number" integer="true">Level</param>
		/// <returns type="ESRI.ADF.Geometries.Envelope">extent</returns>
		var dx = 0; var dy = 0;
		if(this._tileOrigin) {
			dx = this._tileOrigin.get_x();
			dy = this._tileOrigin.get_y();
		}
		else 
		{
			dx = this._extent.get_xmin();
			dy = this._extent.get_ymax();
		}
		var levelinfo = this._levels[level];
		var tilewidth = levelinfo.get_tileWidth()*levelinfo.get_resX();
		var tileheight = levelinfo.get_tileHeight()*levelinfo.get_resY();
		dx += levelinfo.get_minCol() * tilewidth;
		dy -= levelinfo.get_minRow() * tileheight;
		return new ESRI.ADF.Geometries.Envelope(			
			dx , dy - (levelinfo.get_rows())*tileheight,
			dx + (levelinfo.get_columns())*tilewidth, dy,
			this._spatialReference);
	},
	getTileExtent : function(column,row,level) {
		/// <summary>Gets the extent of a specific tile</summary>
		/// <param name="column" type="Number" integer="true">Column</param>
		/// <param name="row" type="Number" integer="true">Row</param>
		/// <param name="level" type="Number" integer="true">Level</param>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Extent of tile</returns>
		var dx = 0; var dy = 0;
		if(this._tileOrigin) {
			dx = this._tileOrigin.get_x();
			dy = this._tileOrigin.get_y();
		}
		else 
		{
			dx = this._extent.get_xmin();
			dy = this._extent.get_ymax();
		}
		var lvl = this._levels[level];
		return new ESRI.ADF.Geometries.Envelope(
			new ESRI.ADF.Geometries.Point(
				(column)*lvl._tileWidth*lvl.get_resX()+dx,
				dy - (row+1)*lvl._tileHeight*lvl.get_resY()),
			new ESRI.ADF.Geometries.Point(
				(column+1)*lvl._tileWidth*lvl.get_resX()+dx,
				dy - (row) * lvl._tileHeight*lvl.get_resY()),
			this._spatialReference);
	},
	getTileSpanWithin : function(envelope, level) {
		/// <summary>Gets the tile span that fully covers an envelope.</summary>
		/// <param name="envelope" type="ESRI.ADF.Geometries.Envelope">
		/// Envelope the returned tilespan should cover
		/// </param>
		/// <param name="level" type="Number" integer="true">Level</param>
		/// <returns type="Array" elementType="Number" elementInteger="true">
		/// Array as [startColumn,startRow,endColumn,endRow]
		/// </returns>
		/// <remarks>
		/// <para>The given envelope will be truncated if if only partially intersects the extent of this resource.</para>
		/// <para>Returns [0,0,-1,-1] if the envelope doesn't intersect the datasource.</para>
		/// </remarks>
		envelope = envelope.intersection(this.getLevelExtent(level));
		if(envelope) {
			var dx = 0; var dy = 0;
			if(this._tileOrigin) {
				dx = this._tileOrigin.get_x();
				dy = this._tileOrigin.get_y();
			}
			else 
			{
				dx = this._extent.get_xmin();
				dy = this._extent.get_ymax();
			}
			var lvl = this._levels[level];
			var res = lvl.get_resX();
			var colStart = Math.floor((envelope.get_xmin()-dx+lvl._resX*0.5) / (res * lvl._tileWidth));
			var rowStart = Math.floor((dy-envelope.get_ymax()+lvl._resY*0.5) / (res * lvl._tileHeight)) ;
			var colEnd = Math.floor((envelope.get_xmax()-dx-lvl._resX*0.5) / (res * lvl._tileWidth));
			var rowEnd = Math.floor((dy-envelope.get_ymin()+lvl._resY*0.5) / (res * lvl._tileHeight));
			if(rowEnd>=lvl.get_rows()+lvl.get_minRow()) { rowEnd = lvl.get_rows()+lvl.get_minRow()-1; }
			if(colEnd>=lvl.get_columns()+lvl.get_minCol()) { colEnd = lvl.get_columns()+lvl.get_minCol()-1; }
			return [ colStart, rowStart, colEnd, rowEnd ];
		}
		else { return [ 0, 0, -1, -1 ]; }
	},
	getLevelByNearestPixelsize : function(pixelsizeX) {
		/// <summary>Gets the level that closets matches a given horizontal pixelsize</summary>
		/// <param name="pixelsizeX" type="Number">
		/// PixelSize resolution to match to (if horizontal and vertical resolution differ, horizontal resolution is used)
		/// </param>
		/// <returns type="Number" integer="true">Level index</returns>
		var level = 0;
		for(var idx=1;idx<this._levels.length;idx++)
		{
			if(Math.abs(this._levels[idx].get_resX()-pixelsizeX)<Math.abs(this._levels[level].get_resX()-pixelsizeX)) {
				level = idx;
			}
		}
		return level;
	},
	getLevelInfo : function(level) {
		/// <summary>Gets a levelinfo at the specified level index.</summary>
		/// <param name="level" type="Number" integer="true">Level</param>
		/// <returns type="ESRI.ADF.Layers.LevelInfo">Levelinfo at the specified level index.</returns>
		return this._levels[level];
	},
	get_minimumResolution : function() {
		/// <value type="Number">Gets the minimum horizontal resolution where this layer is visible.</value>
		return this._levels[0].get_resX();
	},
	set_minimumResolution : function() {
		throw new Error.invalidOperation('Cannot set minimum resolution on a tiled resource');
	},
	get_maximumResolution : function() {
		/// <value type="Number">Gets the maximum horizontal resolution where this layer is visible.</value>
		return this._levels[this._levels.length-1].get_resX();
	},
	set_maximumResolution : function() {
		throw new Error.invalidOperation('Cannot set maximum resolution on a tiled resource');
	},
	get_tileOrigin : function() {
		/// <value type="ESRI.ADF.Geometries.Point">Gets or sets the tileorigin.</value>
		/// <remarks>The tileorigin specifies the upper-left corner of the tile at row=0, column=0 in map units.</remarks>
		return this._tileOrigin;
	},
	set_tileOrigin : function(value) { this._tileOrigin = value; },
	get_levels : function() {
		/// <value type="Array" elementType="ESRI.ADF.Layers.LevelInfo">Gets or sets the LevelInfos for the tiled layer.</value>
		return this._levels;
	},
	set_levels : function(value) { this._levels = value; }	
};
ESRI.ADF.Layers.TileLayer.registerClass('ESRI.ADF.Layers.TileLayer',ESRI.ADF.Layers.Layer);

ESRI.ADF.Layers.DynamicLayer = function(id, extent, sref) {
	/// <summary>Abstract class for a non-tiled resources.</summary>
	/// <param name="id" type="String">The id of the layer.</param>
	/// <param name="extent" type="ESRI.Geometry.Envelope">Extent of the datasource.</param>
	/// <param name="sref" type="String" optional="true" mayBeNull="true"> Spatial reference of this datasource.</param>
	ESRI.ADF.Layers.DynamicLayer.initializeBase(this, [id, extent, sref]);
	this._extent = extent;
	this._spatialReference = null;
	this._useTiling = false;
	this._tilesize = null;
	this._minimumResolution = 0;
	this._maximumResolution = Number.MAX_VALUE;
	this._levels = null;
};
ESRI.ADF.Layers.DynamicLayer.prototype = {
	getUrl : function(minx,miny,maxx,maxy,width,height,handler) {
		/// <summary>Gets the URL of an image covering the specified extent and size</summary>
		/// <param name="minx" type="Number">Left side of extent</param>
		/// <param name="miny" type="Number">Bottom of extent</param>
		/// <param name="maxx" type="Number">Right side of extent</param>
		/// <param name="maxy" type="Number">Top of extent</param>
		/// <param name="width" type="Number" integer="true">Width of image in pixels.</param>
		/// <param name="height" type="Number" integer="true">Height of image in pixels.</param>
		/// <param name="handler" type="Function">The method to call with the URL.</param>
		/// <remarks>This function must be overridden by the specific Dynamic Layer implementation</remarks>
		throw(new Error.notImplemented('getUrl'));
	},
	get_minimumResolution : function() {
		/// <value type="Number">Gets or sets the minimum horizontal resolution where this layer is visible.</value>
		return this._minimumResolution;
	},
	set_minimumResolution : function(value) {
		this._minimumResolution = value;
	},
	get_maximumResolution : function() {
		/// <value type="Number">Gets or sets the maximum horizontal resolution where this layer is visible.</value>
		return this._maximumResolution;
	},
	set_maximumResolution : function(value) {
		this._maximumResolution = value;
	},
	get_useTiling : function() {
		/// <value type="Boolean">Gets or sets whether this resource should emulate a tiled layer.</value>
		return this._useTiling;
	},
	set_useTiling : function(value) {
		this._useTiling = value;
	},
	get_tilesize : function() {
		/// <value type="Array" elementType="Number" elementInteger="true">		
		/// If this resource is tiled (see <see cref="ESRI.ADF.Layers.DynamicLayer.useTiling" />), set this value to control the size of 
		/// the tiles. If this value is not set, the size of the map window will be used.
		/// </value>
		return this._tilesize;
	},
	set_tilesize : function(value) {
		this._tilesize = value;
	},
	get_levels : function() {
		/// <value type="Array" elementType="Number" mayBeNull="true">Gets or sets the a set of predefined resolutions used for this layer</value>
		return this._levels;
	},	
	set_levels : function(value) {
		this._levels = value;
	}
};
ESRI.ADF.Layers.DynamicLayer.registerClass('ESRI.ADF.Layers.DynamicLayer',ESRI.ADF.Layers.Layer);


//
// ADF specific datasource implementations
//

ESRI.ADF.Layers.AdfTileHandler = function() {
	/// <summary>
	/// WebADF Tiled resource retrieved asynchronously from the maphandler
	/// </summary>
	ESRI.ADF.Layers.AdfTileHandler.initializeBase(this);
	this._onCompleteHandler = Function.createDelegate(this,this._onComplete);
	this._timeout = 90000;
};
ESRI.ADF.Layers.AdfTileHandler.prototype = {
    getTileUrl: function(c, r, level, handler) {
        if (c >= 0 && r >= 0) { // don't request a negative tile from a cached resource
            if (ESRI.ADF.System.checkSessionExpired && ESRI.ADF.System.checkSessionExpired()) { return; }
            var argument = '&Row=' + r + '&Column=' + c + '&Level=' + level + '&t=' + (new Date()).getTime();
            var wRequest = new Sys.Net.WebRequest();
            wRequest.add_completed(this._onCompleteHandler);
            wRequest.set_url(this._tileHandlerUrl + argument);
            wRequest.set_userContext(handler);
            wRequest.set_timeout(this._timeout);
            wRequest.invoke();
        }
    },
    _onComplete: function(executor, eventArgs) {
        var handler = executor.get_webRequest().get_userContext();
        var url = executor.get_webRequest().get_url();
        if (executor.get_responseAvailable()) {
            if (ESRI.ADF.System.resetSessionLapse) { ESRI.ADF.System.resetSessionLapse(); }
            var result = executor.get_responseData();
            var obj = null;
            try { obj = Sys.Serialization.JavaScriptSerializer.deserialize(result); }
            catch (ex) {
                this._raiseError('Invalid JSON response: ' + result, url, null);
                handler('');
                return;
            }
            if (obj.code && obj.code !== 200) {
                if (obj.type === 'error') {
                    this._raiseError('DrawTile returned error: ' + obj.errorMessage, url, obj.code);
                }
                else {
                    Sys.Debug.trace('DrawTile returned message: ' + obj.errorMessage);
                }
                handler('');
            }
            else if (!obj.url && obj.url !== '') {
                this._raiseError('Invalid response', url, executor.get_statusCode());
                handler('');
            }
            else if (obj.url === '') {
                this._raiseError('Returned empty URL', url, executor.get_statusCode());
                handler('');
            }
            else { handler(obj.url); }
        }
        else if (executor.get_timedOut()) {
            this._raiseError('Response timed out', url, null);
            handler('');
        }
        else if (executor.get_aborted()) {
            this._raiseError('Request was aborted', url, null);
            handler('');
        }
        else {
            this._raiseError('Empty response', url, executor.get_statusCode());
            handler('');
        }
    },
    _raiseError: function(message, url, statusCode) {
        Sys.Debug.trace('MapHandler error\nmessage:' + message + '\n url:' + url + '\nresource:' + this.get_id() + '\nstatus code:' + statusCode);
        var handler = this.get_events().getHandler('requestError');
        if (handler) { handler(this, { "errorMessage": message, "url": url, "statusCode": statusCode }); }
    },
    add_requestError: function(handler) {
    /// <summary>Fired if the MapHandler request failed.</summary>
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
    /// 				<td>ESRI.ADF.Layers.AdfTileHandler</td>
    /// 				<td>The tile handler that issued the erroneous request</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs.errorMessage</td>
    /// 				<td>String</td>
    /// 				<td>The error message</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs.statusCode</td>
    /// 				<td>Number</td>
    /// 				<td>The http response status code for the request</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs.url</td>
    /// 				<td>String</td>
    /// 				<td>The url requested</td>
    /// 			</tr>
    /// 		</tbody>
    /// 	</table>
    /// </remarks>
        this.get_events().addHandler('requestError', handler);
    },
    remove_requestError: function(handler) { this.get_events().removeHandler('requestError', handler); },
    get_tileHandlerUrl: function() {
		/// <value type="String">Gets or sets the url to the Web ADF TileHandler</value>
        return this._tileHandlerUrl;
    },
    set_tileHandlerUrl: function(value) {
        this._tileHandlerUrl = value;
    },
    get_timeout: function() {
        /// <value type="String">Gets or sets the time-out value for the web request in milliseconds.</value>
        /// <remarks>The web request timeout defaults to 90 seconds.</remarks>
        return this._timeout;
    },
    set_timeout: function(value) { this._timeout = value; }
};
ESRI.ADF.Layers.AdfTileHandler.registerClass('ESRI.ADF.Layers.AdfTileHandler',ESRI.ADF.Layers.TileLayer);

ESRI.ADF.Layers.AdfMapHandler = function() {
	/// <summary>
	/// WebADF Dynamic map resource retrieved asynchronously from the maphandler
	/// </summary>
	ESRI.ADF.Layers.AdfMapHandler.initializeBase(this);
	this._onCompleteHandler = Function.createDelegate(this,this._onComplete);
	this._timeout = 90000;
};
ESRI.ADF.Layers.AdfMapHandler.prototype = {
    getUrl: function(minx, miny, maxx, maxy, width, height, handler) {
        if (ESRI.ADF.System.checkSessionExpired && ESRI.ADF.System.checkSessionExpired()) { return; }
        var argument = '&Extent=' + minx + ',' + miny + ',' + maxx + ',' + maxy + '&Width=' + width + '&Height=' + height + '&t=' + (new Date()).getTime();
        var wRequest = new Sys.Net.WebRequest();
        wRequest.add_completed(this._onCompleteHandler);
        wRequest.set_url(this._mapHandlerUrl + argument);
        wRequest.set_userContext(handler);
        wRequest.set_timeout(this._timeout);
        wRequest.invoke();
    },
    _onComplete: function(executor, eventArgs) {
        var handler = executor.get_webRequest().get_userContext();
        var url = executor.get_webRequest().get_url();
        if (executor.get_responseAvailable()) {
            if (ESRI.ADF.System.resetSessionLapse) { ESRI.ADF.System.resetSessionLapse(); }
            var result = executor.get_responseData();
            var obj = null;
            try { obj = Sys.Serialization.JavaScriptSerializer.deserialize(result); }
            catch (ex) {
                this._raiseError('Invalid JSON response: ' + result, url, null);
                handler('');
                return;
            }
            if (obj.code && obj.code !== 200) {
                if (obj.type === 'error') {
                    this._raiseError('DrawImage returned error: ' + obj.errorMessage, url, obj.code);
                }
                else {
                    Sys.Debug.trace('DrawImage returned message: ' + obj.errorMessage);
                }
                handler('');
            }
            else if (!obj.url && obj.url !== '') {
                this._raiseError('Invalid response', url, executor.get_statusCode());
                handler('');
            }
            else if (obj.url === '') {
                this._raiseError('Returned empty URL', url, executor.get_statusCode());
                handler('');
            }
            else {
                if (obj.imageExtent) {
                    handler(obj.url, new ESRI.ADF.Geometries.Envelope(obj.imageExtent[0], obj.imageExtent[1], obj.imageExtent[2], obj.imageExtent[3]));
                }
                else { handler(obj.url); }
            }
        }
        else if (executor.get_timedOut()) {
            this._raiseError('Response timed out', url, null);
            handler('');
        }
        else if (executor.get_aborted()) {
            this._raiseError('Request was aborted', url, null);
            handler('');
        }
        else {
            this._raiseError('Empty response', url, executor.get_statusCode());
            handler('');
        }
    },
    _raiseError: function(message, url, statusCode) {
        Sys.Debug.trace('MapHandler error\nmessage:' + message + '\n url:' + url + '\nresource:' + this.get_id() + '\nstatus code:' + statusCode);        
        var handler = this.get_events().getHandler('requestError');
        if (handler) { handler(this, { "errorMessage": message, "url": url, "statusCode": statusCode }); }
    },
    add_requestError: function(handler) {
    /// <summary>Fired if the MapHandler request failed.</summary>
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
    /// 				<td>ESRI.ADF.Layers.AdfMapHandler</td>
    /// 				<td>The map handler that issued the erroneous request</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs.errorMessage</td>
    /// 				<td>String</td>
    /// 				<td>The error message</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs.statusCode</td>
    /// 				<td>Number</td>
    /// 				<td>The http response status code for the request</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs.url</td>
    /// 				<td>String</td>
    /// 				<td>The url requested</td>
    /// 			</tr>
    /// 		</tbody>
    /// 	</table>
    /// </remarks>
        this.get_events().addHandler('requestError', handler);
    },
    remove_requestError: function(handler) { this.get_events().removeHandler('requestError', handler); },
    get_mapHandlerUrl: function() {
        /// <value type="String">Gets or sets the url to the WebADF maphandler</value>
        return this._mapHandlerUrl;
    },
    set_mapHandlerUrl: function(value) { this._mapHandlerUrl = value; },
    get_timeout: function() {
        /// <value type="String">Gets or sets the time-out value for the web request in milliseconds.</value>
        /// <remarks>The web request timeout defaults to 90 seconds.</remarks>
        return this._timeout;
    },
    set_timeout: function(value) { this._timeout = value; }
};
ESRI.ADF.Layers.AdfMapHandler.registerClass('ESRI.ADF.Layers.AdfMapHandler',ESRI.ADF.Layers.DynamicLayer);

ESRI.ADF.Layers.AdfMapPageHandler = function() {
	/// <summary>
	/// WebADF Dynamic map resource retrieved asyncronously from the hosting page
	/// </summary>
	ESRI.ADF.Layers.AdfMapPageHandler.initializeBase(this);
	this._requestIdCounter=0;
	this._handlers = {};
};
ESRI.ADF.Layers.AdfMapPageHandler.prototype = {
	getUrl : function(minx,miny,maxx,maxy,width,height,handler) {
		if(ESRI.ADF.System.checkSessionExpired && ESRI.ADF.System.checkSessionExpired()) { return; }
		var id = this._requestIdCounter++;
		var argument = 'EventArg=GetImage&resource='+this.get_id()+'&ID='+id+'&Extent=' + minx + ',' + miny + ',' + maxx + ',' + maxy + '&Width=' + width + '&Height=' + height + '&t='+(new Date()).getTime();
		this._handlers['Request_'+id] = handler;
		this._map.doCallback(argument,this);
	},
	processCallbackResult : function(action,params) {
		if(action === 'GetImage') {
			var obj = params[0];
			var id = obj.id;
			var handler = this._handlers['Request_'+id];
			if(handler) {
				if(obj.error) { this._raiseError('GetImage returned error: ' + obj.error); handler(''); }
				if(obj.imageExtent) { handler(obj.url, new ESRI.ADF.Geometries.Envelope(obj.imageExtent[0],obj.imageExtent[1],obj.imageExtent[2],obj.imageExtent[3])); }
				else { handler(obj.url); }
			}
			return true;
		}
		return false;
	},
	_raiseError : function(message) {
		Sys.Debug.trace('MapPageHandler error: ' + message);
		var handler = this.get_events().getHandler('requestError');
		if (handler) { handler(this, {"errorMessage": message }); }
	},
	add_requestError : function(handler) {
	/// <summary>Fired if the PageMapHandler request failed.</summary>
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
	/// 				<td>ESRI.ADF.Layers.AdfMapPageHandler</td>
	/// 				<td>The map page handler that issued the erroneous request</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.errorMessage</td>
	/// 				<td>String</td>
	/// 				<td>The error message</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('requestError', handler);
	},
	remove_requestError : function(handler) { this.get_events().removeHandler('requestError', handler); },
	get_map : function() {
		/// <value type="ESRI.ADF.UI.MapBase">Gets or sets the map this resource belongs to.</value>
		return this._map;
	},
	set_map : function(value) { this._map = value; }
};
ESRI.ADF.Layers.AdfMapPageHandler.registerClass('ESRI.ADF.Layers.AdfMapPageHandler',ESRI.ADF.Layers.DynamicLayer);


//Resource has tileDirectAccessInfo: http://mnielsen/arcgiscache/WorldMap/Layers/_alllayers,arcgisVirtualDirectoryTileUrlGenerator_png,PNG24
ESRI.ADF.Layers.AdfTileDirectAccess = function() {
	/// <summary>
	/// WebADF Tiled resource - Tile URLs are retrieved by a predefined <see cref="tileUrlGeneratorFunction">TileUrl Generator Function</see>.
	/// </summary>
	this._tileUrlGeneratorFunction = null;
	this._serverUrl = null;
	ESRI.ADF.Layers.AdfTileDirectAccess.initializeBase(this);
};
ESRI.ADF.Layers.AdfTileDirectAccess.prototype = {
	getTileUrl : function(c,r,level,handler) {
		handler(this._tileUrlGeneratorFunction(level, c, r, this._serverUrl));
	},
	get_tileUrlGeneratorFunction : function() {
		/// <summary>
		/// Gets or sets the url generator function.
		/// The function should have take the following paramters:
		///		tileUrlGeneratorFunction(level, column, row, serverurl)
		/// Function should return a string url to the specified tile at zoom-level, row and column.
		/// </summary>
		return this._tileUrlGeneratorFunction;
	},
	set_tileUrlGeneratorFunction : function(value) {
		this._tileUrlGeneratorFunction = value;
	},
	get_serverUrl : function() {
		/// <summary>Gets or sets the base url for the server that will be parsed to the <see cref="tileUrlGeneratorFunction"/></summary>
		return this._serverUrl;
	},
	set_serverUrl : function(value) {
		this._serverUrl = value;
	}
};
ESRI.ADF.Layers.AdfTileDirectAccess.registerClass('ESRI.ADF.Layers.AdfTileDirectAccess',ESRI.ADF.Layers.TileLayer);

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }