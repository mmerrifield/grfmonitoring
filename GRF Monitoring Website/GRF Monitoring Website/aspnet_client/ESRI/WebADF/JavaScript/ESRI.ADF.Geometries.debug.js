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
Type.registerNamespace('ESRI.ADF.Geometries');

/* =========== Abstract Geometry ============= */
ESRI.ADF.Geometries.Geometry = function(spatialReference) {
	/// <summary>
	/// Abstract geometry class
	/// </summary>
	/// <param name="spatialReference" type="String" mayBeNull="true" optional="true">
	/// Spatial reference of the geometry
	/// </param>
	//ESRI.ADF.Geometries.Geometry.initializeBase(this);
	this._spatialReference = spatialReference;
};
ESRI.ADF.Geometries.Geometry.prototype = { 
	get_spatialReference : function() {
		/// <value type="String" mayBeNull="true">
		/// Gets or sets the spatial reference
		/// </value>
		return this._spatialReference;
	},
	set_spatialReference : function(value) {
		if(value!=this._spatialReference) {
			this._spatialReference = value;
			this.raisePropertyChanged('spatialReference');
		}
	},
	getEnvelope : function() {
		/// <summary>Returns the minimum enclosing envelope of this geometry.</summary>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Envelope</returns>
		throw(new Error.notImplemented('getEnvelope'));
	}
};
ESRI.ADF.Geometries.Geometry.registerClass('ESRI.ADF.Geometries.Geometry');

/* =========== POINT  ============= */
ESRI.ADF.Geometries.Point = function(x,y,spatialReference) { 
	/// <summary>Point</summary>
	/// <param name="x" type="Number">X coordinate</param>
	/// <param name="y" type="Number">Y coordinate</param>
	/// <param name="spatialReference" type="String" mayBeNull="true" optional="true">
	/// Spatial reference of the geometry
	/// </param>
	ESRI.ADF.Geometries.Point.initializeBase(this, [spatialReference]);
	this.coordinates = [0.0,0.0];	
	if(x) this.coordinates[0] = x;
	if(y) this.coordinates[1] = y;
}
ESRI.ADF.Geometries.Point.prototype = {
	toString : function(separator) {
		/// <summary>Returns a string represention of the point.</summary>
		/// <param name="separator" type="String" optional="true" mayBeNull="true">
		/// Optional coordinate separator. Default is a comma.
		/// </param>
		/// <returns type="String">Character-separated string represention of point.</returns>
		if(!separator) separator = ',';
		return this.coordinates[0].toString() + separator + this.coordinates[1].toString();
	},
	equals : function(other) {
		/// <summary>Returns true if the two points are spatially equal.</summary>
		/// <param name="other" type="ESRI.ADF.Geometries.Point">Point to compare this instance with.</param>
		/// <remarks>Only X and Y values are compared. Spatial reference are ignored for this comparison.</remarks>
		/// <returns type="Boolean">true if both X and Y are the equal.</returns>
		return (this.coordinates[0]==other.coordinates[0] && this.coordinates[1]==other.coordinates[1]);
	},
	getEnvelope : function() {
		/// <summary>Returns the minimum enclosing envelope of this geometry.</summary>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Envelope</returns>
		return new ESRI.ADF.Geometries.Envelope(this,this);
	},
	get_x : function() {
		/// <value type="Number=">Gets or sets the X coordinate of this instance.</value>
		return this.coordinates[0];
	},
	set_x : function(value) {
		this.coordinates[0] = value;
	},
	get_y : function() {
		/// <value type="Number=">Gets or sets the Y coordinate of this instance.</value>
		return this.coordinates[1];
	},
	set_y : function(value) {
		this.coordinates[1] = value;
	}
}
ESRI.ADF.Geometries.Point.fromString = function(value) {
	/// <summary>Parses a comma-separated string representation of a point.</summary>
	/// <returns type="ESRI.ADF.Geometries.Point">Point</returns>
	var arr = value.split(',');
	var x = parseFloat(arr[0]);
	var y = parseFloat(arr[1]);
	return new ESRI.ADF.Geometries.Point(x,y);
}

ESRI.ADF.Geometries.Point.registerClass('ESRI.ADF.Geometries.Point', ESRI.ADF.Geometries.Geometry);

/* =========== Abstract GeometryCollection ============= */
ESRI.ADF.Geometries.GeometryCollection = function(geomtype,spatialReference) { 
	/// <summary>Class for storing a geometry collection.</summary>
	/// <param name="geomType" type="Type" mayBeNull="true" optional="true">
	/// Type of geometry this collection contains. Default is any geometry type (ESRI.ADF.Geometries.Geometry).
	/// </param>
	/// <param name="spatialReference" type="String" mayBeNull="true" optional="true">
	/// Spatial reference of the geometry collection
	/// </param>
	ESRI.ADF.Geometries.GeometryCollection.initializeBase(this, [spatialReference]);
	this._geoms = [];
	if(!geomtype)
		this._type = ESRI.ADF.Geometries.Geometry
	else
		this._type = geomtype;
}

ESRI.ADF.Geometries.GeometryCollection.prototype = {
	isEmpty : function() {
		/// <summary>Returns true of this collection is empty.</summary>
		/// <returns type="Boolean">True if empty</returns>
		return (this._geoms.length>0);
	},
	get_count : function() {
		/// <value type="Number" integer="true">Gets the number of geometries in the collection.</value>
		return this._geoms.length;
	},
	add : function(geom) {
		/// <summary>Adds a geometry to the collection.</summary>
		/// <param name="geom" type="ESRI.ADF.Geometries.Geometry">Geometry</param>
		if(Sys.Debug.isDebug) { var e = Function._validateParams(arguments, [ {name: geom, type: this._type} ]); if(e) { throw e; } };
		this._geoms[this._geoms.length] = geom;
	},
	get : function(index) {
		/// <summary>Gets a geometry at the specified index.</summary>
		/// <param name="index" type="Number" integer="true">index</param>
		/// <returns type="ESRI.ADF.Geometries.Geometry">Geometry</returns>
		return this._geoms[index];
	},
	getFirst : function() {
		/// <summary>Gets the first object in the collection, or null if the collection is empty.</summary>
		/// <returns type="ESRI.ADF.Geometries.Geometry">First object in collection</returns>
		if(this._geoms.length==0) return null;
		else return this._geoms[0];
	},
	getLast : function() {
		/// <summary>Gets the last object in the collection, or null if the collection is empty.</summary>
		/// <returns type="ESRI.ADF.Geometries.Geometry">Last object in collection</returns>
		if(this._geoms.length==0) return null;
		else return this._geoms[this._geoms.length-1];
	},
	remove : function(geom) {
		/// <summary>Removes a geometry from the collection.</summary>
		/// <param name="geom" type="ESRI.ADF.Geometries.Geometry">Geometry</param>
		Array.remove(this._geoms, point);
	},
	removeAt : function(index) {
		/// <summary>Removes a geometry from the collection at the specified index.</summary>
		/// <param name="index" type="Number" integer="true">index</param>
		Array.removeAt(this._geoms, index);
	},
	insert : function(index, geom) {
		/// <summary>Inserts a geometry into the collection at the specified index.</summary>
		/// <param name="index" type="Number" integer="true">index</param>
		/// <param name="geom" type="ESRI.ADF.Geometries.Geometry">Geometry</param>
		if(Sys.Debug.isDebug) { var e = Function._validateParams(arguments, [ {name: point, type: this._type} ]); if(e) { throw e; } };
		Array.insert(this._geoms, index, point);
	},
	clear : function() {
		/// <summary>Clears the collection.</summary>
		Array.clear(this._geoms);
	},
	getEnvelope : function() {
		/// <summary>Returns the minimum enclosing envelope of all geometries in the collection.</summary>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Envelope</returns>
		var env=null;
		for(var idx=0;idx<this.get_count();idx++) {
			if(env) env = env.join(this._geoms[idx].getEnvelope());
			else env = this._geoms[idx].getEnvelope();
		}
		return env;
	}
}
ESRI.ADF.Geometries.GeometryCollection.registerClass('ESRI.ADF.Geometries.GeometryCollection', ESRI.ADF.Geometries.Geometry);


/* =========== CoordinateCollection  ============= */
ESRI.ADF.Geometries.CoordinateCollection = function(points,spatialReference) { 
	/// <summary>Class for storing a collection of points</summary>
	/// <param name="points" type="Array">Point array</param>
	/// <param name="spatialReference" type="String" mayBeNull="true" optional="true">
	/// Spatial reference of the points
	/// </param>
	/// <remarks>Point collections are stored as a number arrays and not as ESRI.ADF.Geometries.Point.</remarks>
	ESRI.ADF.Geometries.CoordinateCollection.initializeBase(this, [spatialReference]);
	this._coords = points?points:[];	
}

ESRI.ADF.Geometries.CoordinateCollection.prototype = {
	toString : function(pntSeperator,coordSeparator) {
		/// <summary>
		/// Formats the instance as "x0,y0 x1,y1, x2,y3, [...] xn,yn". Separator characters can be customized.
		/// </summary>
		/// <param name="pntSeperator" type="String" optional="true" mayBeNull="true">
		/// Optional separator between points. Default is a space.
		/// </param>
		/// <param name="coordSeperator" type="String" optional="true" mayBeNull="true">
		/// Optional separator between X and Y values. Default is a comma.
		/// </param>
		/// <returns type="String">Character-separated string represention of point collection.</returns>
		var pntCount = this.get_count();	 
		if(pntCount==0) return '';
		if(!pntSeperator) pntSeperator = ' ';
		var sb = new Sys.StringBuilder();
		sb.append(this.get(0)[0] + coordSeparator + this.get(0)[1]);
		for(var idx=1;idx<pntCount;idx++) {
			sb.append(pntSeperator);
			sb.append(this.get(idx)[0] + coordSeparator + this.get(idx)[1]);
		}
		return sb.toString();
	},
	getEnvelope : function() {
		/// <summary>Returns the minimum enclosing envelope of all geometries in the collection.</summary>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Envelope</returns>
		if(this._coords.length===0) return null;
		var minx=this._coords[0][0];
		var miny=this._coords[0][1];
		var maxx=minx;
		var maxy=miny;
		for(var idx=1;idx<this.get_count();idx++) {
			var g = this._coords[idx]
			minx=Math.min(minx,g[0]);
			miny=Math.min(miny,g[1]);
			maxx=Math.max(maxx,g[0]);
			maxy=Math.max(maxy,g[1]);			
		}
		return new ESRI.ADF.Geometries.Envelope(minx,miny,maxx,maxy);
	},
	get : function(index) {
		/// <summary>Gets a geometry at the specified index.</summary>
		/// <param name="index" type="Number" integer="true">index</param>
		/// <returns type="Array" elementType="Number">Coordinate as array: [ x , y ]</returns>
		return this._coords[index];
	},
	getAsPoint : function(index) {
		/// <summary>Gets a geometry at the specified index.</summary>
		/// <param name="index" type="Number" integer="true">index</param>
		/// <returns type="Array" elementType="Number">Coordinate as array: [ x , y ]</returns>
		return new ESRI.ADF.Geometries.Point(this._coords[index][0],this._coords[index][1]);
	},
	add : function(coord) {
		/// <summary>Adds a coordinate to the collection.</summary>
		/// <param name="geom" type="Array" elementType="Number">Geometry</param>		
		/// <remarks>The coordinate must be an array with x and y values: [ x , y ]</remarks>
		this._coords[this._coords.length] = coord;
	},
	get_coordinates: function() {
	    /// <value type="Object">
	    /// Gets or sets the array of coordinates
	    /// </value>
	    /// <remarks>The array of coordinates is an array of coordinate arrays.  Each coordinate is an integer array with two items.  </remarks>
		return this._coords;
	},
	set_coordinates : function(value){
		this._coords = value;
	},
	getFirst : function() {
		/// <summary>Gets the first object in the collection, or null if the collection is empty.</summary>
		/// <returns type="ESRI.ADF.Geometries.Geometry">First object in collection</returns>
		if(this._coords.length==0) return null;
		else return this._coords[0];
	},
	getLast : function() {
		/// <summary>Gets the last object in the collection, or null if the collection is empty.</summary>
		/// <returns type="ESRI.ADF.Geometries.Geometry">Last object in collection</returns>
		if(this._coords.length==0) return null;
		else return this._coords[this._coords.length-1];
	},	
	removeAt : function(index) {
		/// <summary>Removes a geometry from the collection at the specified index.</summary>
		/// <param name="index" type="Number" integer="true">index</param>
		Array.removeAt(this._coords, index);
	},
	get_count : function() {
		/// <value type="Number" integer="true">Gets the number of geometries in the collection.</value>
		return this._coords.length;
	},
	clear : function() {
		/// <summary>Clears the collection.</summary>
		this._coords = [];
	}		
}
ESRI.ADF.Geometries.CoordinateCollection.fromString = function(value) {
		/// <summary>Parses a string formatted as "x0,y0 x1,y1, x2,y3, [...] xn,yn"</summary>
		/// <returns type="ESRI.ADF.Geometries.CoordinateCollection">Point collection</returns>
		var pnts = new ESRI.ADF.Geometries.CoordinateCollection();
		if(!value) { return pnts; }
		var arr = value.split(' ');
		var geoms = [];
		for(var k=0;k<arr.length;k++) {
			if(arr[k]) {
				Array.add(geoms, ESRI.ADF.Geometries.Point.fromString(arr[k]).coordinates);
			}
		}
		pnts._coords = geoms;
		return pnts;
}

ESRI.ADF.Geometries.CoordinateCollection.registerClass('ESRI.ADF.Geometries.CoordinateCollection',ESRI.ADF.Geometries.Geometry);

/* =========== Polyline  ============= */
ESRI.ADF.Geometries.Polyline = function(path, spatialReference) { 
	/// <summary>Polyline</summary>
	/// <param name="path" type="ESRI.ADF.Geometries.CoordinateCollection" optional="true" mayBeNull="true">
	/// Initial path to add to polyline's path collection.
	/// </param>
	/// <param name="spatialReference" type="String" mayBeNull="true" optional="true">
	/// Spatial reference of the geometry
	/// </param>
	ESRI.ADF.Geometries.Polyline.initializeBase(this, [spatialReference]);
	this._paths = new ESRI.ADF.Geometries.GeometryCollection(ESRI.ADF.Geometries.CoordinateCollection, spatialReference);
	if(path) this._paths.add(path);
}
ESRI.ADF.Geometries.Polyline.prototype = {	
	addPath : function(path) {
		/// <summary>Adds a path to the geometry collection</summary>
		/// <param name="path" type="ESRI.ADF.Geometries.CoordinateCollection">path</param>
		this._paths.add(path);
	},
	getPath : function(n) {
		/// <summary>Gets the n'th path in the path collection</summary>
		/// <param name="n" type="Number" integer="true">path index</param>		
		/// <returns type="ESRI.ADF.Geometries.CoordinateCollection">path</returns>
		return this._paths.get(n);
	},
	getPathCount : function() {
		/// <summary>Gets the number of paths for this instance.</summary>
		/// <returns type="Number" integer="true">Path count</returns>
		return this._paths.get_count();
	},
	getEnvelope : function() {
		/// <summary>Returns the minimum enclosing envelope of this geometry</summary>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Envelope</returns>
		return this._paths.getEnvelope();
	}
}
ESRI.ADF.Geometries.Polyline.registerClass('ESRI.ADF.Geometries.Polyline', ESRI.ADF.Geometries.Geometry);


/* ========== Surface ========== */
ESRI.ADF.Geometries.Surface = function(spatialReference) { 
	/// <summary>Abstract surface class</summary>
	/// <param name="spatialReference" type="String" mayBeNull="true" optional="true">Spatial reference of the surface</param>
	ESRI.ADF.Geometries.Surface.initializeBase(this, [spatialReference]);
}
ESRI.ADF.Geometries.Surface.prototype = {
	get_area : function() {
		/// <value type="Number">Gets the area of the surface.</value>
		throw(new Error.notImplemented('get_area'));
	}
}
ESRI.ADF.Geometries.Surface.registerClass('ESRI.ADF.Geometries.Surface', ESRI.ADF.Geometries.Geometry);


/* =========== Polygon  ============= */
ESRI.ADF.Geometries.Polygon = function(ring, spatialReference) { 
	/// <summary>Polygon</summary>
	/// <param name="ring" type="ESRI.ADF.Geometries.CoordinateCollection" optional="true" mayBeNull="true">
	/// Initial ring to add to polygon's ring collection.
	/// </param>
	/// <param name="spatialReference" type="String" mayBeNull="true" optional="true">Spatial reference of the surface</param>
	ESRI.ADF.Geometries.Polygon.initializeBase(this, [spatialReference]);
	this._rings = new ESRI.ADF.Geometries.GeometryCollection(ESRI.ADF.Geometries.CoordinateCollection, spatialReference);
	if(ring) this._rings.add(ring);	
}
ESRI.ADF.Geometries.Polygon.prototype = {
	addRing : function(ring) {
		/// <summary>Adds a ring to the geometry collection</summary>
		/// <param name="path" type="ESRI.ADF.Geometries.CoordinateCollection">Ring</param>
		this._rings.add(ring);
	},
	getRing : function(n) {
		/// <summary>Gets the n'th ring in the ring collection</summary>
		/// <param name="n" type="Number" integer="true">Ring index</param>		
		/// <returns type="ESRI.ADF.Geometries.CoordinateCollection">Ring</returns>
		return this._rings.get(n);
	},
	getRingCount : function() {
		/// <summary>Gets the number of rings for this instance.</summary>
		/// <returns type="Number" integer="true">Ring count</returns>
		return this._rings.get_count();
	},
	getEnvelope : function() {
		/// <summary>Returns the minimum enclosing envelope of this geometry</summary>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Envelope</returns>
		return this._rings.getEnvelope();
	}
}
ESRI.ADF.Geometries.Polygon.registerClass('ESRI.ADF.Geometries.Polygon', ESRI.ADF.Geometries.Surface);

/* =========== Oval  ============= */
ESRI.ADF.Geometries.Oval = function(center, width, height, spatialReference) { 
	/// <summary>Oval</summary>
	/// <param name="center" type="ESRI.ADF.Geometries.Point">Center of oval.</param>
	/// <param name="width" type="Number">Width of oval</param>
	/// <param name="height" type="Number" optional="true">Height of oval. Defaults to width</param>
	ESRI.ADF.Geometries.Oval.initializeBase(this, [spatialReference]);
	this._center = center;
	this._width = width;
	this._height = (height==null || height==undefined)?width:height;
}
ESRI.ADF.Geometries.Oval.prototype = {
	getEnvelope : function() {
		/// <summary>Returns the minimum enclosing envelope of this geometry</summary>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Envelope</returns>
		return new ESRI.ADF.Geometries.Envelope(
			this._center.get_x()-Math.abs(this._width)*0.5, this._center.get_y()-Math.abs(this._height)*0.5,
			this._center.get_x()+Math.abs(this._width)*0.5, this._center.get_y()+Math.abs(this._height)*0.5,
			this._spatialReference);
	},
	get_area : function() {
		/// <value type="Number">Gets the area the oval</value>
		return Math.PI * Math.abs(this._width) * Math.abs(this._height);
	},
	toString : function() {
		/// <summary>Returns a string representation of the oval.</summary>		
		/// <returns type="String">String representation of the ovals envelope</returns>
		return this.getEnvelope().toString();
	},
	get_center : function() {
		/// <value type="Number">Gets or sets the center of the oval</value>
		return this._center;
	},
	set_center : function(value) { this._center = value; },
	get_width : function() {
		/// <value type="Number">Gets or sets the width of the oval</value>
		return this._width;
	},
	set_width : function(value) { this._width = value; },
	get_height : function() {
		/// <value type="Number">Gets or sets the height of the oval</value>
		return this._height;
	},
	set_height : function(value) { this._height = value; }
}
ESRI.ADF.Geometries.Oval.registerClass('ESRI.ADF.Geometries.Oval', ESRI.ADF.Geometries.Surface);

/* =========== ENVELOPE  ============= */
ESRI.ADF.Geometries.Envelope = function() { 
	/// <summary>Envelope</summary>
	/// <remarks>The envelope constructor is overloaded and can be instantiated using either
	/// 4 double values [x1,y1,x2,y2] or using two point values [p1,p2].</remarks>
	var n = arguments.length;
	var spatialReference = null;
	if(n>2 && String.isInstanceOfType(arguments[n-1])) {
		spatialReference = arguments[n-1];
	}
	else if(n<2) throw new Error.argument('ESRI.ADF.Geometries.Envelope','Invalid number of arguments');
	
	if(ESRI.ADF.Geometries.Point.isInstanceOfType(arguments[0]) && ESRI.ADF.Geometries.Point.isInstanceOfType(arguments[1])) {
		this._xmin = Math.min(arguments[0].get_x(),arguments[1].get_x());
		this._ymin = Math.min(arguments[0].get_y(),arguments[1].get_y());
		this._xmax = Math.max(arguments[0].get_x(),arguments[1].get_x());
		this._ymax = Math.max(arguments[0].get_y(),arguments[1].get_y());
	}
	else if(n>=4 && Number.isInstanceOfType(arguments[0]) && Number.isInstanceOfType(arguments[1]) && 
		Number.isInstanceOfType(arguments[2]) && Number.isInstanceOfType(arguments[3])) {
		this._xmin = Math.min(arguments[0],arguments[2]);
		this._ymin = Math.min(arguments[1],arguments[3]);
		this._xmax = Math.max(arguments[0],arguments[2]);
		this._ymax = Math.max(arguments[1],arguments[3]);
	}
	else throw new Error.argument('ESRI.ADF.Geometries.Envelope','Invalid arguments');
	ESRI.ADF.Geometries.Envelope.initializeBase(this, [spatialReference]);
}
ESRI.ADF.Geometries.Envelope.prototype = {
	get_area : function() {
		/// <value type="Number">Gets the area of the envelope</value>
		return (this.get_width()*this.get_height());
	},
	toString : function() {
		/// <summary>Returns a string representation of the envelope as "[xmin,ymin xmax,ymax]"</summary>
		/// <returns type="String">Envelope as string "[xmin,ymin xmax,ymax]"</returns>
		return '[' + this._xmin+','+this._ymin + ' ' +this._xmax+','+this._ymax + ']';
	},
	get_xmin : function() {
		/// <value type="Number">Gets or sets the left of the envelope</value>
		return this._xmin;
	},
	set_xmin : function(value) {
		this._xmin = value;
	},
	get_ymin : function() {
		/// <value type="Number">Gets or sets the bottom of the envelope</value>
		return this._ymin;
	},
	set_ymin : function(value) {
		this._ymin = value;
	},
	get_xmax : function() {
		/// <value type="Number">Gets or sets the right of the envelope</value>
		return this._xmax;
	},
	set_xmax : function(value) {
		this._xmax = value;
	},
	get_ymax : function() {
		/// <value type="Number">Gets or sets the top of the envelope</value>
		return this._ymax;
	},
	set_ymax : function(value) {
		this._ymax = value;
	},	
	intersects : function(env2) {
		/// <summary>Checks whether this instance intersects another envelope</summary>
		/// <param name="env2" type="ESRI.ADF.Geometries.Envelope">Envelope to intersect with</param>
		/// <returns type="Boolean">True if they intersect</returns>
		if(!env2) return false;
		return !(env2._xmin > this._xmax ||
				 env2._xmax < this._xmin ||
				 env2._ymin > this._ymax ||
				 env2._ymax < this._ymin);
	},
	join : function(env2) {
		/// <summary>Computes the minimum envelope enclosing this instance and another envelope.</summary>
		/// <param name="env2" type="ESRI.ADF.Geometries.Envelope">Envelope to join with.</param>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Joined envelope</returns>
		if(!env2) return this;
		return new ESRI.ADF.Geometries.Envelope(
			new ESRI.ADF.Geometries.Point(
				(this._xmin<env2._xmin?this._xmin:env2._xmin),
				(this._ymin<env2._ymin?this._ymin:env2._ymin)),
			new ESRI.ADF.Geometries.Point(
				(this._xmax>env2._xmax?this._xmax:env2._xmax),
				(this._ymax>env2._ymax?this._ymax:env2._ymax)),
			this._spatialReference);
	},
	get_width : function() {
		/// <value type="Number">Gets the width of the envelope</value>
		return (this._xmax-this._xmin);
	},
	get_height : function() {
		/// <value type="Number">Gets the height of the envelope</value>
		return (this._ymax-this._ymin);
	},
	get_center : function() {
		/// <value type="ESRI.ADF.Geometries.Point">Gets the center of the envelope</value>
		return new ESRI.ADF.Geometries.Point(
			(this._xmin+this._xmax)*0.5,
			(this._ymin+this._ymax)*0.5, this._spatialReference);
	},
	intersection : function(env2) {
		/// <summary>Computes the intersecting area between this instance and another envelope.</summary>
		/// <param name="env2" type="ESRI.ADF.Geometries.Envelope">Envelope to intersect with.</param>
		/// <returns type="ESRI.ADF.Geometries.Envelope">intersecting area, or null if they do not intersect.</returns>
		if(!this.intersects(env2)) return null;
		return new ESRI.ADF.Geometries.Envelope(
			new ESRI.ADF.Geometries.Point(
				(this._xmin>env2._xmin?this._xmin:env2._xmin),
				(this._ymin>env2._ymin?this._ymin:env2._ymin)),
			new ESRI.ADF.Geometries.Point(
				(this._xmax<env2._xmax?this._xmax:env2._xmax),
				(this._ymax<env2._ymax?this._ymax:env2._ymax)),
			this._spatialReference);
	},
	getEnvelope : function() {
		/// <summary>Returns the minimum enclosing envelope of this geometry</summary>
		/// <returns type="ESRI.ADF.Geometries.Envelope">Envelope</returns>
		return this.clone();
	},
	clone: function() {
	    /// <summary>Creates a clone of this instance</summary>
	    /// <returns type="ESRI.ADF.Geometries.Envelope">Envelope</returns>
		return new ESRI.ADF.Geometries.Envelope(this._xmin,this._ymin,this._xmax,this._ymax);
	}
}
ESRI.ADF.Geometries.Envelope.registerClass('ESRI.ADF.Geometries.Envelope', ESRI.ADF.Geometries.Surface);


if (typeof(Sys) !== "undefined") Sys.Application.notifyScriptLoaded();
