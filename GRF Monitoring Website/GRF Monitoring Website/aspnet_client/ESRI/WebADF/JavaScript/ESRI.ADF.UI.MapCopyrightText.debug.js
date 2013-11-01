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

// Register the namespace for the control.
Type.registerNamespace('ESRI.ADF.UI');

ESRI.ADF.UI.MapCopyrightText = function(element) { 
	/// <summary>
	/// MapCopyrightText is a control for displaying copyright text information.
	/// </summary>
	ESRI.ADF.UI.MapCopyrightText.initializeBase(this, [element]);
	this._copyrightText = null;
	this._calloutWindowTitleText = '';
	this._calloutReference = null;
	var isRTL = (document.dir === 'rtl')
	this._calloutTemplate = '<div style="width:300px;background-color:#fff;border: solid 1px #ddd;padding: 0px; margin:0;" ><div style="background:#eee; margin:0; height: 22px;"><span style="float: '+(isRTL?'right':'left')+';"><b>{@title}</b></span><span style="float: '+(isRTL?'left':'right')+'; cursor: pointer;" onclick="ESRI.ADF.UI.MapCopyrightText.closeClick(\''+this.get_id()+'\');">X</span></div><div style="padding:0;">{@content}</div></div>';	
};
ESRI.ADF.UI.MapCopyrightText.prototype = {
	initialize : function() {
		/// <summary>
		/// Initialize the parent along with any child controls that have not yet been initialized
		/// </summary>
		/// <returns />
		ESRI.ADF.UI.MapCopyrightText.callBaseMethod(this, 'initialize');		
		this._createCallout();
		$addHandler(this.get_element(), 'click', Function.createDelegate(this, this._doMouseClick));
	},
	dispose : function() {
		/// <summary>
		/// Dispose the control
		/// </summary>
		/// <returns />
		if(this._calloutReference !== null) {
			this._calloutReference.dispose();
		}
		$clearHandlers(this.get_element());
		ESRI.ADF.UI.MapCopyrightText.callBaseMethod(this, 'dispose');
	},
	_createCallout : function() {
		if(this._calloutReference === null) {
			this._calloutReference = $create(ESRI.ADF.UI.Callout, { "parent":document.body,"animate":true, "template":this._calloutTemplate, "autoHide":false }, null);
			this._calloutReference.setContent({"content":this._copyrightText,"title":this._calloutWindowTitleText});	
		}
	},
	//
	// Properties /Script descriptor elements
	//
	get_map : function () {
		/// <value type="ESRI.ADF.UI.MapBase" mayBeNull="false">
		/// Obtains the map control to which the navigation is a buddy.
		/// </value>
		return this._map;
	},
	set_map : function(value) {
		if (this._map != value) {
			this._map = value;
			this.raisePropertyChanged('map');
		}
	},
	get_copyrightText : function () {
		/// <value type="String">Obtains the copyright text displayed in the callout window event.</value>
		return this._copyrightText;
	},
	set_copyrightText : function (value) {
		if (this._copyrightText !== value) {
			this._copyrightText = value;
			if(!value) {
				this.get_element().style.display = 'none';
			}
			else {
				this.get_element().style.display = '';
			}
			this.raisePropertyChanged('copyrightText');
		}
	},	
	get_calloutWindowTitleText : function() {
		/// <value>Gets or sets the callout title text.</value>
	    return this._calloutWindowTitleText;
	},
	set_calloutWindowTitleText : function(value) {
	    this._calloutWindowTitleText = value;
	},
	get_callout : function() {
		/// <value> Gets the callout instance this control uses.</value>
		if(this._calloutReference===null) {
			this._createCallout();
		}
		return this._calloutReference;
	},
	///
	/// Event handlers
	///
	_doMouseClick : function (e) {
		var alignment = this._getAlignmentToMap();
		var xy = this._computeXYAndAnchorForCallout(alignment);
		this._calloutReference.setPosition(xy.xCoOrd,xy.yCoOrd);
		this._calloutReference.set_anchorPoint(xy.aPoint);
		if(this._calloutReference.get_isOpen()) {
			 this._calloutReference.hide();
		}
		else {
			 this._calloutReference.show();
		}
	},	
	///
	/// Helper functions
	///
	_getAlignmentToMap : function() {
		// Loop through each of the attached behaviours and see if
		// the dock extender is attached to it
		var list = this.get_element()._behaviors; 
		for(var j=0; list && j < list.length; j++) {
			var behav = this.get_element()._behaviors[j];
			if(ESRI.ADF.Extenders.Dock.isInstanceOfType(behav)) {
				return behav.get_alignment();
			}
		}
		//if not, find position of active text and set alignment after that
		var ctlBounds = Sys.UI.DomElement.getBounds(this.get_element());
		if(ctlBounds.x+ctlBounds.width/2>parseInt(document.body.offsetWidth,10)/2)
			return ESRI.ADF.System.ContentAlignment.BottomRight;
		else
			return ESRI.ADF.System.ContentAlignment.BottomLeft;
	},
	_computeXYAndAnchorForCallout : function(alignment) {
		// get the bounds of the element
		var ctlBounds = Sys.UI.DomElement.getBounds(this.get_element());
		var x = ctlBounds.x;
		var y = ctlBounds.y;
		var width = ctlBounds.width;
		var height = ctlBounds.height;
		var spacing = 3;
		// Compute the vertical coordinate
		switch (alignment) {
			case ESRI.ADF.System.ContentAlignment.TopCenter:
			case ESRI.ADF.System.ContentAlignment.TopRight:
			case ESRI.ADF.System.ContentAlignment.TopLeft:
				y += (height + spacing);
				break;
			case ESRI.ADF.System.ContentAlignment.BottomLeft:
			case ESRI.ADF.System.ContentAlignment.BottomCenter:
			case ESRI.ADF.System.ContentAlignment.BottomRight:
				y -= (spacing);
				break;
		}
		x += spacing + width/2;
		
		// calculate the anchor point
		var anchorPoint = ESRI.ADF.UI.AnchorPoint.BottomLeft;
		switch(alignment) {
			case ESRI.ADF.System.ContentAlignment.TopLeft:
			case ESRI.ADF.System.ContentAlignment.TopCenter:
			case ESRI.ADF.System.ContentAlignment.MiddleCenter:
				anchorPoint = ESRI.ADF.UI.AnchorPoint.TopLeft;
				break;
			case ESRI.ADF.System.ContentAlignment.MiddleLeft:
			case ESRI.ADF.System.ContentAlignment.BottomCenter:
			case ESRI.ADF.System.ContentAlignment.BottomLeft:
				anchorPoint = ESRI.ADF.UI.AnchorPoint.BottomLeft;
				break;

			case ESRI.ADF.System.ContentAlignment.TopRight:
			case ESRI.ADF.System.ContentAlignment.MiddleRight:
				anchorPoint = ESRI.ADF.UI.AnchorPoint.TopRight;
				break;

			case ESRI.ADF.System.ContentAlignment.BottomRight:
				anchorPoint = ESRI.ADF.UI.AnchorPoint.BottomRight;
				break;
		}
		return {"xCoOrd":x,"yCoOrd":y,"aPoint":anchorPoint};
	}
};
ESRI.ADF.UI.MapCopyrightText.closeClick = function(id) {
	var component = $find(id);
	if(component) { component._doMouseClick(); }
};
ESRI.ADF.UI.MapCopyrightText.registerClass('ESRI.ADF.UI.MapCopyrightText', Sys.UI.Control);

if (typeof(Sys) !== 'undefined') { Sys.Application.notifyScriptLoaded(); }
