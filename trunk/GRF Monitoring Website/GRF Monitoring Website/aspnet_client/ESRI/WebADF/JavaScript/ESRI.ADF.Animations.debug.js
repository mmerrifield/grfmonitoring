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

/// <reference assembly="AjaxControlToolkit" name="AjaxControlToolkit.Common.Common.js"/>
/// <reference assembly="AjaxControlToolkit" name="AjaxControlToolkit.Animation.Animations.js"/>

Type.registerNamespace('ESRI.ADF.Animations');
ESRI.ADF.Animations.ParallelAnimation = function(target, duration, fps, animations) {
	ESRI.ADF.Animations.ParallelAnimation.initializeBase(this, [target, duration, fps, animations]);
}
ESRI.ADF.Animations.ParallelAnimation.prototype = {
	_onTimerTick : function() {
		ESRI.ADF.Animations.ParallelAnimation.callBaseMethod(this, '_onTimerTick');
		var handler = this.get_events().getHandler('tick');
		if (handler) { handler(this); }
	},
	add_tick : function(handler) {
		/// <summary>Event raised on each step when the animation is playing.</summary>
		this.get_events().addHandler('tick', handler);
	},
	remove_tick : function(handler) { this.get_events().removeHandler('tick', handler); }
}
ESRI.ADF.Animations.ParallelAnimation.registerClass('ESRI.ADF.Animations.ParallelAnimation', AjaxControlToolkit.Animation.ParallelAnimation);

ESRI.ADF.Animations.ZoomAnimation = function(target, duration, fps, scaleFactor, centerX, centerY) {
    /// <summary>
    /// The ZoomAnimation scales the size of the target element by the given <code>scaleFactor</code> around
    /// a given center point.
    /// (i.e. a scaleFactor of .5 will shrink it in half and a scaleFactor of 2.0
    /// will double it). It is important to note that
    /// the target must be positioned (i.e. absolutely) so that setting its top/left properties will change
    /// its location in order for center to have an effect.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="scaleFactor" type="Number" mayBeNull="true" optional="true">
    /// The amount to scale the target (a scaleFactor of .5 will
    /// shrink it in half and a scaleFactor of 2.0 will double it). The default value is
    /// 1, which does no scaling.
    /// </param>
    /// <param name="centerX" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Coordinate for the centerX offset to zoom around. If no center is specified, the center of the target is used.
    /// </param>
    /// <param name="centerY" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Coordinate for the centerY offset to zoom around. If no center is specified, the center of the target is used.
    /// </param>
    /// <animation>Zoom</animation>
    ESRI.ADF.Animations.ZoomAnimation.initializeBase(this, [target, duration, fps]);

     // Percentage to scale
    this._scaleFactor = (scaleFactor !== undefined) ? scaleFactor : 1;
    
    // Optional center of the zoom
    if(centerX!=null && centerX!=undefined) this._centerX = centerX;
    else this._centerX = parseInt(target.offsetWidth)*0.5;
    if(centerY!=null && centerY!=undefined) this._centerY = centerY;
    else this._centerY = parseInt(target.offsetHeight)*0.5;
    this._unit = 'px';

	// Initial values
    this._element = null;
    this._initialHeight = null;
    this._initialWidth = null;
    this._initialTop = null;
    this._initialLeft = null;
    this._initialFontSize = null;

}
ESRI.ADF.Animations.ZoomAnimation.prototype = {
     getAnimatedValue : function(percentage) {
        /// <summary>
        /// Get the amount to scale the target
        /// </summary>
        /// <param name="percentage" type="Number">
        /// Percentage of the animation already complete
        /// </param>
        /// <returns type="Number">
        /// Percentage to scale the target
        /// </returns>
        return this.interpolate(1.0, this._scaleFactor, percentage);
    },
	onStart : function() {
    	/// <summary>
        /// The onStart method is called just before the animation is played each time.
        /// </summary>
        ESRI.ADF.Animations.ZoomAnimation.callBaseMethod(this, 'onStart');
        this._element = this.get_target();
        if (this._element) {
			this._initialHeight = parseInt(this._element.offsetHeight);
			this._initialWidth = parseInt(this._element.offsetWidth);
			this._initialTop = parseInt(this._element.offsetTop);
			this._initialLeft = parseInt(this._element.offsetLeft);
        }
    },
    play : function() {
		ESRI.ADF.Animations.ZoomAnimation.callBaseMethod(this, 'play');
        this._timer.add_tick(this.raiseTick);
    },
	setValue : function(scale) {
        /// <summary>
        /// Scale the target by the given percentage
        /// </summary>
        /// <param name="scale" type="Number">
        /// Percentage to scale the target
        /// </param>
        //if(scale==2) debugger; //alert('ending...');
        if (this._element) {
            var width = Math.round(this._initialWidth * scale);
            var height = Math.round(this._initialHeight * scale);
            var style = this._element.style;
            style.width = width+1 + this._unit; 
            style.height = height+1 + this._unit;            
			style.left = this._centerX - Math.round((this._centerX-this._initialLeft)*scale) + this._unit;
			style.top =  this._centerY - Math.round((this._centerY-this._initialTop)*scale) + this._unit;           
        }
    },    
	onEnd : function() {
		/// <summary>
		/// Wipe the cached values after the animation completes
		/// </summary>
		this._element = null;
		this._initialHeight = null;
		this._initialWidth = null;
		this._initialTop = null;
		this._initialLeft = null;
		ESRI.ADF.Animations.ZoomAnimation.callBaseMethod(this, 'onEnd');
	},
	get_scaleFactor : function() {
		/// <value type="Number">Gets or sets the scale factor.</value>
		return this._scaleFactor;
	},
	set_scaleFactor : function(value) {
		this._scaleFactor = value;
	},
	get_centerX : function() {
		/// <value type="Number">Gets or sets the center x to scale around.</value>
		return this._centerX;
	},
	set_centerX : function(value) {
		this._centerX = value;
	},
	get_centerY : function() {
		/// <value type="Number">Gets or sets the center y to scale around.</value>
		return this._centerY;
	},
	set_centerY : function(value) {
		this._centerY = value;
	}
}
ESRI.ADF.Animations.ZoomAnimation.registerClass('ESRI.ADF.Animations.ZoomAnimation', AjaxControlToolkit.Animation.Animation);
AjaxControlToolkit.Animation.registerAnimation('scale', ESRI.ADF.Animations.ZoomAnimation);