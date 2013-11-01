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

/// <reference assembly="ESRI.ArcGIS.ADF.Web.UI.WebControls" name="ESRI.ArcGIS.ADF.Web.UI.WebControls.Runtime.JavaScript.ESRI.ADF.UI.Map.js"/>

Type.registerNamespace('ESRI.ADF.UI');

ESRI.ADF.UI.AnchorPoint = function() {
	/// <summary>
	/// The AnchorPoint enumeration determines the corner on which to anchor a component.
	/// </summary>
	/// <field name="TopLeft" type="Number" integer="true" />
	/// <field name="TopRight" type="Number" integer="true" />
	/// <field name="BottomLeft" type="Number" integer="true" />
	/// <field name="BottomRight" type="Number" integer="true" />
	throw Error.invalidOperation();
};
ESRI.ADF.UI.AnchorPoint.prototype = {
	TopLeft : 0,
	TopRight : 1,
	BottomLeft : 2,
	BottomRight : 3
};
ESRI.ADF.UI.AnchorPoint.registerEnum("ESRI.ADF.UI.AnchorPoint", false);

ESRI.ADF.UI.CalloutLayout = function() {
ESRI.ADF.UI.CalloutLayout.initializeBase(this);
	this._layout = ESRI.ADF.UI.defaultCalloutTemplate;
};
ESRI.ADF.UI.CalloutLayout.prototype = {
	set_layout: function(value) {
		this._layout = value;
		if (!value.template && value.templateUrl) {
			this._getTemplate();
		}
		else {
			this._onLayoutChanged();
		}
	},
	get_layout: function() { return this._layout; },
	_getTemplate: function() {
		this._layout.template = null;
		var wRequest1 = new Sys.Net.WebRequest();
		wRequest1.set_url(this._layout.templateUrl);
		wRequest1.add_completed(Function.createDelegate(this, this._onTemplateLoaded));
		wRequest1.invoke();
	},
	_onTemplateLoaded: function(executor, eventArgs) {
		if (executor.get_responseAvailable()) {
			this._layout.template = executor.get_responseData();
			this._onLayoutChanged();
		}
	},
	_onLayoutChanged: function() {
		var handler = this.get_events().getHandler('layoutChanged');
		if (handler) { handler(this, this._layout); }
	},
	add_layoutChanged: function(handler) {
	/// <summary>Fired when the CalloutLayout object is changed.</summary>
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
	/// 				<td>ESRI.ADF.UI.CalloutLayout</td>
	/// 				<td>The CalloutLayout object for which the layout was changed</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>JSON object</td>
	/// 				<td>The simple JSON object passed to set_layout to define the new layout</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>	
	    this.get_events().addHandler('layoutChanged', handler); },
	remove_layoutChanged: function(handler) { this.get_events().removeHandler('layoutChanged', handler); }
};
ESRI.ADF.UI.CalloutLayout.registerClass('ESRI.ADF.UI.CalloutLayout',Sys.Component);

ESRI.ADF.UI.Callout = function() {
	/// <summary>
	/// The Callout control displays a dynamic window with HTML content.  The window has an arrow to a target element.    
	/// </summary>
	ESRI.ADF.UI.Callout.initializeBase(this);
	this._parent = document.body; //parent container defaults to the document body
	this._usesDefaultTemplate = true;
	this._isHidden = true;
	this._animate = true;
	this._autoHide = true;
	this._verticalOffset = 0;
	this._clickHandler = Function.createDelegate(this, this._onClick);
	this._mouseoverHandler = Function.createDelegate(this, function(e) { this.stopHideTimer(); this._raiseEvent('mouseOver', e); });
	this._mouseoutHandler = Function.createDelegate(this, function(e) { this.startHideTimer(); this._raiseEvent('mouseOut', e); });
	this._anchorPoint = ESRI.ADF.UI.AnchorPoint.TopLeft;
	this._hideDelayTime = 500;
	this._layout = ESRI.ADF.UI.defaultCalloutTemplate.get_layout();
	this._usesDefaultTemplate = true;
	this._defaultSpriteSize = [1000, 998];
};
ESRI.ADF.UI.Callout.prototype = {
	initialize: function() {
		if (this._usesDefaultTemplate) {
			//if (!this._templateUrl && !this._template) { //Get default template
			//this._templateUrl = ESRI.ADF.UI.defaultCalloutTemplate.get_templateUrl();
			this._layout = ESRI.ADF.UI.defaultCalloutTemplate.get_layout();
			ESRI.ADF.UI.defaultCalloutTemplate.add_layoutChanged(Function.createDelegate(this, function(s, layout) {
				if (this._usesDefaultTemplate) {
					this._layout = layout;
					this._refreshContent();
				}
			}));
		}
		if (this._layout.template) {
			this._createCallout();
			//ESRI.ADF.UI.Callout.callBaseMethod(this, 'initialize');
		}
		else if (this._layout.templateUrl) { //Download template
			var wRequest1 = new Sys.Net.WebRequest();
			wRequest1.set_url(this._layout.templateUrl);
			wRequest1.add_completed(Function.createDelegate(this, this._onTemplateLoaded));
			wRequest1.invoke();
		}
		ESRI.ADF.UI.Callout.callBaseMethod(this, 'initialize');
	},
	_onTemplateLoaded: function(executor, eventArgs) {
		if (executor.get_responseAvailable()) {
			this._layout.template = executor.get_responseData();
		}
		this._createCallout();
	},
	_createCallout: function() {
		this._calloutMain = document.createElement('div');
		this._arrowDiv = document.createElement('div');
		this._contentDiv = document.createElement('div');
		this._calloutMain.style.position = 'absolute';
		this._arrowDiv.style.position = 'absolute';
		this._arrowDiv.style.overflow = 'hidden';

		var abounds = this._layout.arrowBounds[this._anchorPoint ? this._anchorPoint : 0];
		this._arrowDiv.style.width = abounds[2] + 'px';
		this._arrowDiv.style.height = abounds[3] + 'px';

		this._arrowImage = document.createElement('img');
		this._arrowImage.style.position = 'absolute';
		this._arrowImage.style.width = 'auto';
		this._arrowImage.style.height = 'auto';
		this._setArrowImage();
		this._arrowDiv.appendChild(this._arrowImage);
		this._contentDiv.style.position = 'absolute';
		this._contentDiv.style.cursor = 'default';
		this._calloutMain.appendChild(this._contentDiv);
		this._calloutMain.appendChild(this._arrowDiv);
		this._calloutMain.style.zIndex = ESRI.ADF.UI.Callout._zIndex;

		this._animation1 = new AjaxControlToolkit.Animation.FadeAnimation(this._contentDiv, 0.25, 25, AjaxControlToolkit.Animation.FadeEffect.FadeIn, 0, 1, false);
		this._animation2 = new AjaxControlToolkit.Animation.FadeAnimation(this._contentDiv, 0.25, 25, AjaxControlToolkit.Animation.FadeEffect.FadeOut, 0, 1, false);
		this._animation1.add_ended(Function.createDelegate(this, function() { this._arrowDiv.style.display = ''; }));
		this._animation2.add_ended(Function.createDelegate(this, function() { this._calloutMain.style.display = 'none'; }));

		if (this._isHidden) {
			this._calloutMain.style.display = 'none';
			this._arrowDiv.style.display = 'none';
		}
		this._parent.appendChild(this._calloutMain);
		this.setContent(this._content);
		this._reorient();
		this.setPosition(0, 0);
		$addHandler(this._contentDiv, "click", this._clickHandler);
		$addHandler(this._contentDiv, 'mouseover', this._mouseoverHandler);
		$addHandler(this._contentDiv, 'mouseout', this._mouseoutHandler);
		$addHandler(this._contentDiv, 'mousedown', function(e) { e.stopPropagation(); });
	},
	_setArrowImage: function() {
		if (!this._arrowImage) { return; }

		if (ESRI.ADF.System.__isIE6) {
			//in IE6 we need to use a filter and set the correct size of the image
			//to do that, we measure a hidden image when it has loaded the src
			this._tmpimage = document.createElement('img');
			this._tmpimage.style.position = 'absolute';
			this._tmpimage.style.visibility = 'hidden';
			this._tmpimage.style.left = 0;
			this._tmpimage.style.top = 0;
			this._tmpimage.onload = Function.createDelegate(this, function() {
				if (!this._tmpimage) return; //On random occasions this becomes null in IE
				if (this._tmpimage.offsetWidth == 0) { //IE6 sometimes fails measuring size. Default to the default sprite size
					this._arrowImage.style.width = this._defaultSpriteSize[0] + 'px';
					this._arrowImage.style.height = this._defaultSpriteSize[1] + 'px';
				}
				else {
					this._arrowImage.style.width = this._tmpimage.offsetWidth + 'px';
					this._arrowImage.style.height = this._tmpimage.offsetHeight + 'px';
				}
				//cleanup
				this._tmpimage.onload = null;
				this._tmpimage.parentNode.removeChild(this._tmpimage);
				this._tmpimage.removeAttribute('src');
				delete this._tmpimage;
			});
			document.body.appendChild(this._tmpimage);
			this._tmpimage.src = this._layout.arrowUrl;
			this._arrowImage.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', , sizingMethod = 'crop', src='" + this._layout.arrowUrl + "');";
			this._arrowImage.src = esriBlankImagePath;
		}
		else {
			this._arrowImage.src = this._layout.arrowUrl;
		}
	},
	get_width: function() {
		return this._value;
	},
	set_width: function(value) {
		if (this._width !== value) {
			this._width = value;
			this.setContent(this._content);
		}
	},
	set_layout: function(value) {
		this._layout = value;
		this._usesDefaultTemplate = false;
		if (!this._calloutMain) { this._createCallout(); }
		else {
			this._setArrowImage();
			this._refreshContent();
		}
	},
	get_layout: function() {
		return this._layout;
	},
	dispose: function() {
		if (!this._calloutMain) { return; }
		this.hide();
		$clearHandlers(this._contentDiv);
		this._calloutMain.parentNode.removeChild(this._calloutMain);
		this._calloutMain = null;
		this._parent = null;
		ESRI.ADF.UI.Callout.callBaseMethod(this, 'dispose');
	},
	setContent: function(value) {
		/// <summary>Sets the content of the callout relative to its parent.</summary>		
		/// <param name="value" type="Objects">Key value pair object with names to bind to template.</param>
		/// <remarks>Key names matching {@keyname} tags in the template will be replaced by its value.</remarks>
		if (this._content != value) {
			this._content = value;
			this._refreshContent();
			this.raisePropertyChanged("content");
		}
	},
	_refreshContent: function() {
		if (!this.get_isInitialized() || !this._contentDiv) { return; }
		var template = ESRI.ADF.System.templateBinder({ "callout_width": this._width ? this._width + 'px' : 'auto' }, this._layout.template);
		this._contentDiv.innerHTML = ESRI.ADF.System.templateBinder(this._content, template);
		this._reorient();
	},
	setPosition: function(x, y) {
		/// <summary>Sets the position of the callout relative to its parent.</summary>
		/// <param name="x" type="Number">X offset in pixels.</param>	
		/// <param name="y" type="Number">Y offset in pixels.</param>	
		/// <remarks>The position will be offset according to the buffer property and alignment.</remarks>
		if (!this.get_isInitialized()) { return; }
		this._calloutMain.style.left = x + 'px';
		this._calloutMain.style.top = y + 'px';
	},
	getPosition: function() {
		/// <summary>Returns the current screen position of the callout</summary>
		if (!this._calloutMain) { return null; }
		return [parseInt(this._calloutMain.offsetLeft, 10), parseInt(this._calloutMain.offsetTop, 10)];
	},
	checkPosition: function() {
		/// <summary>Checks the position of the callout if the contents has changed.</summary>
		this._reorient();
	},
	_reorient: function() {
		if (!this._contentDiv || this._contentDiv.style.display === 'none' || !this._contentDiv.parentNode) { return; }
		var bounds = Sys.UI.DomElement.getBounds(this._contentDiv);
		if (bounds.width == 0 || bounds.height == 0) { return; }
		var x = 0; var y = 0;
		if (this._anchorPoint == ESRI.ADF.UI.AnchorPoint.BottomRight) { x = y = -1; }
		else if (this._anchorPoint === ESRI.ADF.UI.AnchorPoint.TopRight) { x = -1; }
		else if (this._anchorPoint === ESRI.ADF.UI.AnchorPoint.BottomLeft) { y = -1; }
		var x2 = (x === 0 ? 1 : -1);
		var y2 = (y === 0 ? 1 : -1);
		var abounds = this._layout.arrowBounds[this._anchorPoint ? this._anchorPoint : 0];
		this._arrowDiv.style.width = abounds[2] + 'px';
		this._arrowDiv.style.height = abounds[3] + 'px';
		this._arrowDiv.style.left = (abounds[2] * x + abounds[6] * x2) + 'px';
		this._arrowDiv.style.top = (abounds[3] * y + abounds[7] * y2) + 'px';
		this._arrowImage.style.left = (-abounds[0]) + 'px';
		this._arrowImage.style.top = (-abounds[1]) + 'px';
		var left = (bounds.width * x + (abounds[2] + abounds[4] + abounds[6]) * x2);
		this._contentDiv.style.left = left + 'px';
		this._contentDiv.style.top = (bounds.height * y + (abounds[5] + abounds[7] - this._verticalOffset) * y2) + 'px';
		if (ESRI.ADF.System.__isIE6) {
			//IE6 have issues with overflow. Touching the margin works around that
			var tmp = this._contentDiv.style.marginRight;
			this._contentDiv.style.marginRight = "1px";
			this._contentDiv.style.marginRight = tmp;
			//IE6 offset issue when floating left
			if(document.documentElement.dir == "rtl")
				this._contentDiv.style.left = (left - 1 * (x==0?1:0)) + 'px';
			else
				this._contentDiv.style.left = (left - 1 * x) + 'px';
		}
	},
	startHideTimer: function() {
		/// <summary>Starts a timer that will hide the callout with a slight delay</summary>
		/// <remarks>This function is used for hover events to prevent hiding the callout because the mouse briefly left the trigger object.  Define delay time using get/set_hideDelayTime property.</remarks>
		this.stopHideTimer();
		if (this.get_autoHide()) {
			this._timer = window.setTimeout(Function.createDelegate(this, this.hide), this._hideDelayTime);
		}
	},
	stopHideTimer: function() {
		/// <summary>Stops a timer that will hide the callout with a slight delay</summary>
		/// <remarks>This function is used for hover events to prevent hiding the callout because the mouse briefly left the trigger object</remarks>
		if (this._timer) {
			window.clearTimeout(this._timer);
			this._timer = null;
		}
	},
	show: function() {
		/// <summary>Shows the callout</summary>
		ESRI.ADF.UI.Callout._zIndex++;
		this._isHidden = false;
		if (!this.get_isInitialized()) { return; }
		this._calloutMain.style.zIndex = ESRI.ADF.UI.Callout._zIndex;
		this._calloutMain.style.visibility = 'hidden'; //Ensure layout but stay hidden
		this._calloutMain.style.display = '';
		this._raiseEvent('show');
		this._reorient();
		if (this._animate) { this._animation1.play(); }
		else { this._arrowDiv.style.display = ''; }
		this._calloutMain.style.visibility = ''; //Unhide
	},
	hide: function() {
		/// <summary>Hides the callout</summary>
		if (this._isHidden) { return; }
		if (this._animate) { this._animation2.play(); }
		else { this._calloutMain.style.display = 'none'; }
		this._arrowDiv.style.display = 'none';
		this._isHidden = true;
		this._raiseEvent('hide');
	},
	_onClick: function(e) {
		e.stopPropagation();
		this._raiseEvent('click');
	},
	//
	// Properties
	//
	/// <value type="Boolean">Get the display state (visible, hidden) of the callout.</value>
	get_isOpen: function() {
		return !this._isHidden;
	},
	get_content: function() {
		/// <value type="String">Gets or sets the content of the callout.  The content can be any valid HTML.</value>
		return this._content;
	},
	get_autoHide: function() {
		/// <value type="Boolean">Gets or sets whether the callout should hide itself
		/// shortly after the mouse has left the callout</value>
		return this._autoHide;
	},
	set_autoHide: function(value) {
		if (this._autoHide != value) {
			this._autoHide = value;
			this.raisePropertyChanged("autoHide");
		}
	},
	get_anchorPoint: function() {
		/// <value type="ESRI.ADF.UI.AnchorPoint">Gets or sets the relative position of the callout.</value>
		return this._anchorPoint;
	},
	set_anchorPoint: function(value) {
		if (this._anchorPoint != value) {
			this._anchorPoint = value;
			this._reorient();
		}
	},
	get_animate: function() {
		/// <value type="Boolean">Gets or sets whether the callout fades in and out.</value>
		return this._animate;
	},
	set_animate: function(value) {
		if (this._animate != value) { this._animate = value; }
	},
	get_parent: function() {
		/// <value type="Sys.UI.DomElement" domElement="true">Gets or sets the parent container of this element.
		/// Positioning will be relative to this element.</value>
		return this._parent;
	},
	set_parent: function(value) { if (this._parent != value) { this._parent = value; } },
	get_hideDelayTime: function() {
		/// <value type="Number" integer="true">
		/// Gets or sets the number of milliseconds before a callout hides itself after the mouse leaves it.
		/// </value>
		/// <seealso "autoHide" />
		return this._hideDelayTime;
	},
	set_hideDelayTime: function(value) { if (this._hideDelayTime != value) { this._hideDelayTime = value; } },
	get_template: function() {
		/// <value type="Sys.UI.String" >Gets or sets the callout template.</value>
		return this._layout.template;
	},

	/////////////////////////////////	

	set_template: function(value) { this._layout.template = value; this._usesDefaultTemplate = false; this._refreshContent(); },
	get_templateUrl: function() {
		/// <value type="String">Gets or sets the url to the template.</value>
		/// <remarks>The templateUrl should be set prior to initialize and will override the template property.</remarks>
		return this._templateUrl;
	},
	set_templateUrl: function(value) { this._templateUrl = value; this._usesDefaultTemplate = false; },
	get_arrowImageUrl: function() {
		/// <value type="Sys.UI.String" >Gets or sets the url for the arrow sprite.</value>
		/// <remarks>The image should contain four arrows pointing towards each their corner.</remarks>
		return this._layout.arrowUrl;
	},
	set_arrowImageUrl: function(value) { this._layout.arrowUrl = value; },
	get_arrowSize: function() {
		/// <value type="Array" elementType="Number" elementInteger="true">Gets or sets the width and height of the arrow.</value>
		//TODO!!!
		return this._arrowSettings.size;
	},
	set_arrowSize: function(value) { this._arrowSettings.size = value; },
	get_arrowOffset: function() {
		/// <value type="Array" elementType="Number" elementInteger="true">Gets or sets the offset of the arrow.</value>
		/// <remarks>The offset is the distance from the peak of the arrow to the point where it
		/// should connect to the corner of the callout.</remarks>
		return this._arrowSettings.offset;
	},
	set_arrowOffset: function(value) { this._arrowSettings.offset = value; },
	get_calloutBuffer: function() {
		/// <value type="Number" integer="true">Gets or sets the distance between a callout position and the arrow.</value>
		return this._arrowSettings.buffer;
	},
	set_calloutBuffer: function(value) { this._arrowSettings.buffer = value; },

	////////////////////////////////	

	get_verticalOffset: function() {
		/// <value type="Number" integer="true">Gets or sets the vertical offset between the arrow and the content box.</value>
		/// <remarks>This can be used to slide the contents down or up to make better room for the contents.
		/// A subsequent call to checkPosition will apply this change at once.</remarks>
		return this._verticalOffset;
	},
	set_verticalOffset: function(value) { this._verticalOffset = value; },
	//
	// Events
	//
	_raiseEvent: function(name, e) {
		var handler = this.get_events().getHandler(name);
		if (handler) { if (!e) { e = Sys.EventArgs.Empty; } handler(this, e); }
	},
	add_closed: function(handler) {
	// Not raised
	/// <summary>Raised when the callout was closed.</summary>
		this.get_events().addHandler('closed', handler);
	},
	remove_closed: function(handler) { this.get_events().removeHandler('closed', handler); },
	add_click: function(handler) {
	/// <summary>Raised when the callout was clicked.</summary>
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
	/// 				<td>ESRI.ADF.UI.Callout</td>
	/// 				<td>The callout that was clicked</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('click', handler);
	},
	remove_click: function(handler) { this.get_events().removeHandler('click', handler); },
	add_show: function(handler) {
	/// <summary>Raised when the callout is shown.</summary>
	/// <summary>Raised when the callout was click.</summary>
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
	/// 				<td>ESRI.ADF.UI.Callout</td>
	/// 				<td>The callout that was shown</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('show', handler);
	},
	remove_show: function(handler) { this.get_events().removeHandler('show', handler); },
	add_hide: function(handler) {
	/// <summary>Raised when the callout is hidden.</summary>
	/// <summary>Raised when the callout was click.</summary>
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
	/// 				<td>ESRI.ADF.UI.Callout</td>
	/// 				<td>The callout that was hidden</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('hide', handler);
	},
	remove_hide: function(handler) { this.get_events().removeHandler('hide', handler); },
	add_mouseOut: function(handler) {
	/// <summary>Raised when the mouse exits the callout.</summary>
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
	/// 				<td>ESRI.ADF.UI.Callout</td>
	/// 				<td>The callout from which the mouse was moved away</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>mouseout</td>
	/// 				<td>The browsers mouseout event for the point at which the event
	///                 occurred</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('mouseOut', handler);
	},
	remove_mouseOut: function(handler) { this.get_events().removeHandler('mouseOut', handler); },
	add_mouseOver: function(handler) {
	/// <summary>Raised when the mouse enters the callout.</summary>
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
	/// 				<td>ESRI.ADF.UI.Callout</td>
	/// 				<td>The callout from which the mouse was moved over</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>mouseover</td>
	/// 				<td>The browsers mouseover event for the point at which the event
	///                 occurred</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('mouseOver', handler);
	},
	remove_mouseOver: function(handler) { this.get_events().removeHandler('mouseOver', handler); }
};
ESRI.ADF.UI.Callout.registerClass('ESRI.ADF.UI.Callout', Sys.Component);
ESRI.ADF.UI.Callout._zIndex = 1000;
//
// Callout implementation on GraphicsLayer
//
ESRI.ADF.UI.MapTips = function() {
	/// <summary>
	/// The MapTips control enables the display of dynamic graphic symbology and attribute information in a browser.  
	/// The control initiates an action based on a mouse event with a graphic feature.  
	/// The action may include changing the symbol of the graphic feature ("highlighting"), or displaying a Callout.    
	/// </summary>
	ESRI.ADF.UI.MapTips.initializeBase(this);
	this._clickHandler = Function.createDelegate(this, this._onCalloutClick);
	this._mouseOverHandler = Function.createDelegate(this, this._onMouseOverCallout);
	this._mouseOutHandler = Function.createDelegate(this, this._onMouseOutCallout);
	this._onMouseGfxOverHandler = Function.createDelegate(this, this._onMouseOverGfx);
	this._onMouseGfxOutHandler = Function.createDelegate(this, this._onMouseOutGfx);
	this._onMouseGfxMoveHandler = Function.createDelegate(this, this._onMouseMoveGfx);
	this._onCalloutShowHandler = Function.createDelegate(this, this._onCalloutShow);
	this._onCalloutHideHandler = Function.createDelegate(this, this._onCalloutHide);
	this._onZoomStartHandler = Function.createDelegate(this, function() { if (this._callout) { this._callout.hide(); } window.clearTimeout(this._showDelayedTimer); this._showDelayedTimer = null; });
	this._onGridOriginChanged = Function.createDelegate(this, function() { this._currentElement = null; });
	this._onMapTipEventHandler = Function.createDelegate(this, this._onMapTipEvent);
	this._onCalloutContentChanged = Function.createDelegate(this, this._contentChanged);
	this._currentElement = null;
	this._hoverTemplate = '';
	this._contentTemplate = '';
	this._layout = ESRI.ADF.UI.defaultMapTipsTemplate.get_layout();
	this._map = null;
	this._callout = null;
	this._hoverLayers = [];
	this._animate = true;
	this._maxheight = 150;
	this._width = 250;
	this._isExpanded = false;
	this._maptipID = ESRI.ADF.UI.MapTips._maptipCount; //unique MapTip ID
	this._isDisposed = false;
	this._autoHide = true;
	this._expandOnClick = true;
	this._showOnHover = true;
	this._usesDefaultTemplate = true;
	ESRI.ADF.UI.MapTips._maptipCount++;
};

ESRI.ADF.UI.MapTips.prototype = {
	initialize: function() {
		if (this._usesDefaultTemplate) {
			ESRI.ADF.UI.defaultMapTipsTemplate.add_layoutChanged(Function.createDelegate(this, function(s, args) {
				if (this._usesDefaultTemplate) {
					this._layout = args;
					if (this._callout) {
						this._callout.set_layout(this._createCalloutLayout())
						this._setExpandCollapseState();
					}
					else { this._setupCallout(); }
				}
			}));
		}
		if (this._layout.templateUrl && !this._layout.template) { //Download template
			var wRequest1 = new Sys.Net.WebRequest();
			wRequest1.set_url(this._layout.templateUrl);
			wRequest1.add_completed(Function.createDelegate(this, this._onTemplateLoaded));
			wRequest1.invoke();
		}
		else { this._setupCallout(); }
		ESRI.ADF.UI.MapTips.callBaseMethod(this, 'initialize');
	},
	_onTemplateLoaded: function(executor, eventArgs) {
		if (executor.get_responseAvailable()) {
			this._layout.template = executor.get_responseData();
			if (this._callout) {
				this._callout.set_layout(this._createCalloutLayout())
				this._setExpandCollapseState();
			}
			else { this._setupCallout(); }
		}
	},
	set_template: function(value) {
		/// <value type="String">Gets or sets a callout template used to place around the title and contents.</value>
		/// <remarks>The following is a list of tags you can add that will be automatically substituted:<br/>
		/// {@maptip_contentID} : ID of container for content that collapses (required)<br/>
		/// {@maptip_titleID}  : ID of container for content that collapses (required)<br/>
		/// {@content} : Marks where the content template will be inserted (required)<br/>
		/// {@title} : Marks where the title template will be inserted (required)<br/>
		/// {@maptip_width} : width of maptip (optional)<br/>
		/// {@maptipID} : ID of the maptip<br/>
		/// </remarks>
		this._layout.template = value;
		this._callout.set_layout(this._createCalloutLayout());
		this._usesDefaultTemplate = false;
		this._setExpandCollapseState();
	},
	get_template: function() {
		return this._layout.template;
	},
	_bindTemplate: function(template) {
		var settings = {
			"maptip_contentID": this.get_maptipContentID(),
			"maptip_titleID": this.get_maptipTitleID(),
			"maptipID": this.get_id()
		};
		return ESRI.ADF.System.templateBinder(settings, template);
	},
	createTemplate: function() {
		/// <summary>Creates and returns the maptip template. Override this method to change the layout.</summary>
		/// <remarks>Get the title and content IDs for the template using the 
		/// get_maptipContentID() and get_maptipTitleID() properties.</remarks>		
		//Create template
		//Container
		return null;
	},
	set_layout: function(value) {
		this._layout = value;
		if (this._layout.templateUrl && !this._layout.template) { //Download template
			var wRequest1 = new Sys.Net.WebRequest();
			wRequest1.set_url(this._layout.templateUrl);
			wRequest1.add_completed(Function.createDelegate(this, this._onTemplateLoaded));
			wRequest1.invoke();
		}
		else {
			this._callout.set_layout(this._createCalloutLayout());
		}
		this._usesDefaultTemplate = false;
		this._setExpandCollapseState();
	},
	get_layout: function() {
		return this._layout;
	},
	_onMapTipEvent: function(s, e) {
		if (e.maptip === this || this._isDisposed) { return; }
		this._callout.set_verticalOffset(0);
		if (e.action === 'show' && this._autoHide) {
			this.collapse();
			this._callout.hide();
			window.clearTimeout(this._showDelayedTimer);
			this._showDelayedTimer = null;
		}
	},
	collapse: function() {
		/// <summary>Collapses the callout.</summary>
		//if (this._isExpanded) {
		this._isExpanded = false;
		this._setExpandCollapseState();
		var handler = this.get_events().getHandler('collapsed');
		if (handler) { handler(this, this._currentElement); }
		this._raiseMapTipEvent("collapse");
		//}
	},
	expand: function() {
		/// <summary>Expands the callout.</summary>
		this._isExpanded = true;
		this._setExpandCollapseState();
		var handler = this.get_events().getHandler('expanded');
		if (handler) { handler(this, this._currentElement); }
		this._raiseMapTipEvent("expand");
	},
	_setExpandCollapseState: function() {
		var content = $get(this.get_maptipContentID());
		if (!content) { return; }
		if (this._isExpanded) { content.style.display = ''; }
		else { content.style.display = 'none'; }
		this.adjustHeight();
		this._callout.checkPosition();
		if (ESRI.ADF.System.__isIE6) {
			//IE6 have issues with overflow. Touching the width works around that
			var tmp = content.style.width;
			content.style.width = '';
			content.style.width = tmp;
		}
	},
	_contentChanged: function(s, e) {
		var prop = e.get_propertyName();
		if (prop !== 'content') { return; }
		var tip = $get(this.get_maptipContentID());
		if (tip) {
			if (tip.style.display === 'none' && this._isExpanded) { tip.style.display = ''; }
			else if (tip.style.display !== 'none' && !this._isExpanded) { tip.style.display = 'none'; }
			this.adjustHeight();
		}
	},
	_createCalloutLayout: function() {
		var layoutClone = Sys.Serialization.JavaScriptSerializer.deserialize(Sys.Serialization.JavaScriptSerializer.serialize(this._layout));

		var settings = {
			"callout_width": this._width + 'px',
			"maptip_contentID": this.get_maptipContentID(),
			"maptip_titleID": this.get_maptipTitleID(),
			"maptipID": this.get_id()
		};
		layoutClone.templateUrl = null;
		var template = this.createTemplate();
		if (template) { layoutClone.template = template; }
		else { layoutClone.template = this._bindTemplate(this._layout.template); }

		return layoutClone;
	},
	_setupCallout: function() {
		if (this._callout || !this._map) { return; }
		this._callout = $create(ESRI.ADF.UI.Callout, {
			"parent": this._map._containerDiv, "animate": this._animate,
			"layout": this._createCalloutLayout(), "autoHide": this._autoHide,
			"width": this._width, "id": this.get_id() + '_callout'
		}, {
			"click": this._clickHandler, "propertyChanged": this._onCalloutContentChanged,
			"hide": this._onCalloutHideHandler, "show": this._onCalloutShowHandler,
			"mouseOver": this._mouseOverHandler, "mouseOut": this._mouseOutHandler
		}
		);
		this._map.add_zoomStart(this._onZoomStartHandler);
		this._map.add_gridOriginChanged(this._onGridOriginChanged);
		this._map.__add_mapTipEvent(this._onMapTipEventHandler);
		this._setExpandCollapseState();
	},
	addGraphics: function(gfxLayer) {
		/// <summary>Associates a maptip with the given graphic feature.</summary>
		/// <param name="gfxLayer" type="ESRI.ADF.Graphics.GraphicFeatureBase">
		/// Feature to apply maptips to.</param>
		if (!this._callout && !this._map) {
			if (gfxLayer._map) {
				this._map = gfxLayer._map;
				this._setupCallout();
			}
		}
		gfxLayer.add_mouseOver(this._onMouseGfxOverHandler);
		gfxLayer.add_mouseOut(this._onMouseGfxOutHandler);
		gfxLayer.add_mouseMove(this._onMouseGfxMoveHandler);
		gfxLayer.add_click(this._clickHandler);
		Array.add(this._hoverLayers, gfxLayer);
	},
	removeGraphics: function(gfxLayer) {
		/// <summary>Removes the maptip from the given graphic feature.</summary>
		/// <param name="gfxLayer" type="ESRI.ADF.Graphics.GraphicFeatureBase">
		/// Feature to apply maptips to.</param>
		gfxLayer.remove_mouseOver(this._onMouseGfxOverHandler);
		gfxLayer.remove_mouseOut(this._onMouseGfxOutHandler);
		gfxLayer.remove_mouseMove(this._onMouseGfxMoveHandler);
		gfxLayer.remove_click(this._clickHandler);
		Array.remove(this._hoverLayers, gfxLayer);
	},
	dispose: function() {
		/// <summary>Disposes the maptips.</summary>
		Array.forEach(this._hoverLayers, Function.createDelegate(this, function(layer) { this.removeGraphics(layer); }));
		if (this._map) {
			this._map.remove_zoomStart(this._onMapTipEventHandler);
			this._map.remove_gridOriginChanged(this._onGridOriginChanged);
			this._map.__remove_mapTipEvent(this._onZoomStartHandler);
		}
		if (this._callout) { this._callout.dispose(); }
		this._callout = null;
		this._currentElement = null;
		this._isDisposed = true;
		ESRI.ADF.UI.MapTips.callBaseMethod(this, 'dispose');
	},
	_onMouseOverGfx: function(sender, e) {
		if (!this._showOnHover) { return; };
		if (this._currentElement != e.element) {
			this._callout.set_verticalOffset(0);
			this.collapse();
			this._callout.hide();
			this._setContentByElement(e.element);
			if (ESRI.ADF.Geometries.Point.isInstanceOfType(e.element.get_geometry())) {
				this.setPosition(e.element.get_geometry()); //Always place at center of point geometries			
			}
			else {
				var evt = ESRI.ADF.System._makeMouseEventRelativeToElement(e, this._callout.get_parent());
				this._callout.setPosition(evt.offsetX, evt.offsetY); //Set position relative to parent
			}
		}
		this._callout.stopHideTimer();
		this._showDelayedTimer = window.setTimeout(Function.createDelegate(this, function() {
			this._callout.show();
			if (ESRI.ADF.System.__isIE6) {
				var content = $get(this.get_maptipContentID());
				//IE6 have issues with overflow. Touching the width works around that
				var tmp = content.style.width;
				content.style.width = '';
				content.style.width = tmp;
			}
		}), 500);
	},
	_onMouseMoveGfx: function(sender, evt) {
		if (this._showDelayedTimer && !this._callout.get_isOpen() && this._showOnHover &&
			this._currentElement === evt.element && !ESRI.ADF.Geometries.Point.isInstanceOfType(evt.element.get_geometry())) {
			//Callout follows mouse as long as its not open yet. Callout for points are set in _onMouseOverGfx.
			var e = ESRI.ADF.System._makeMouseEventRelativeToElement(evt, this._callout.get_parent());
			this._callout.setPosition(e.offsetX, e.offsetY); //Set position relative to parent
		}
	},
	setPosition: function(point) {
		/// <summary>Sets the position of a maptip manually using map units.</summary>
		/// <param name="point" type="ESRI.ADF.Geometries.Point">Point in map units</param>
		var pos = this._map._toMapScreen(point);
		this._callout.setPosition(pos.offsetX, pos.offsetY);
	},
	adjustHeight: function() {
		///  <summary>Adjusts the height of the maptip content to fit the mapwindow and/or the maxheight.</summary>
		if (this._callout._calloutMain.style.display === 'none') { //render tip but hide to allow for measurements
			this._callout._calloutMain.style.visible = 'hidden';
			this._callout._calloutMain.style.display = '';
		}
		var pos = this._callout.getPosition();
		var offset = [parseInt(this._callout._parent.style.left, 10), parseInt(this._callout._parent.style.top, 10)];
		var position = [offset[0] + pos[0], offset[1] + pos[1]];
		var centScreen = this._map.toScreenPoint(this._map.get_extent().get_center());
		var align = 0;
		if (position[1] > this._map._mapsize[1] / 2) { align += 2; }
		if (position[0] > this._map._mapsize[0] / 2) { align++; }

		var height = this._map._mapsize[1];
		var offsety = this._callout._layout.arrowBounds[this._callout._anchorPoint ? this._callout._anchorPoint : 0][5];
		var tip = $get(this.get_maptipContentID());
		if (tip) {
			var bottomhalf = (position[1] > centScreen.offsetY);
			var dist = (bottomhalf ? position[1] : height - position[1]); //Distance to top/bottom whatever is the furthest:
			tip.style.height = ''; //reset height to measure it
			var tipHeight = parseInt(this._callout._contentDiv.offsetHeight, 10); // total height of tip
			var contentHeight = parseInt(tip.offsetHeight, 10); // height of content excluding title
			var titleHeight = tipHeight - contentHeight; //height of title,border,margin etc.
			var maxContentHeight = height - titleHeight;
			var adjustedHeight = null;
			if (maxContentHeight && maxContentHeight < contentHeight) { adjustedHeight = maxContentHeight; }
			if (this._maxheight && (adjustedHeight && adjustedHeight > this._maxheight || contentHeight > this._maxheight)) { adjustedHeight = this._maxheight; }
			if (adjustedHeight) { tip.style.height = adjustedHeight + 'px'; contentHeight = adjustedHeight; }
			var os = contentHeight + titleHeight - dist + offsety * 2;
			if (os < 0) os = 0;
			this._callout.set_verticalOffset(os);
		}
		else { this._callout.set_verticalOffset(0); }
		if (this._callout.get_anchorPoint() != align) { this._callout.set_anchorPoint(align); }
		else { this._callout.checkPosition(); }
		if (this._callout._calloutMain.style.visible === 'hidden') { //Reset visibility
			this._callout._calloutMain.style.display = 'none';
			this._callout._calloutMain.style.visible = '';
		}
	},
	_onMouseOutGfx: function(sender, e) {
		if (!this._showOnHover) { return; }
		if (this._showDelayedTimer) { window.clearTimeout(this._showDelayedTimer); this._showDelayedTimer = null; }
		if (this._callout.get_isOpen() && this._autoHide) { this._callout.startHideTimer(); }
	},
	_setContentByElement: function(element) {
		var title = ESRI.ADF.System.templateBinder(element.get_attributes(), this._hoverTemplate);
		var content = '';
		var attr = element.get_attributes()
		if (!this._contentTemplate) {
			if (attr) { content = ESRI.ADF.System.attributeTableRenderer(attr); }
		}
		else { content = ESRI.ADF.System.templateBinder(attr, this._contentTemplate); }
		if (!title) { title = '<div style="width:10px;">&nbsp;</div>'; } //Ensure minimum size in title when empty
		this.setContent(content, title);
		this._currentElement = element;
		this._setExpandCollapseState();
	},
	_onCalloutClick: function() {
		if (this._expandOnClick) { this.expand(); }
	},
	_onCalloutShow: function() {
		this.adjustHeight();
		this._raiseMapTipEvent("show");
	},
	_onCalloutHide: function() {
		this._raiseMapTipEvent("hide");
	},
	_raiseMapTipEvent: function(action) {
		if (this._map) { this._map._raiseEvent('mapTipEvent', { "maptip": this, "element": this._currentElement, "action": action }); }
	},
	_onMouseOverCallout: function() {
		if (this._currentElement) {
			this._currentHighlight = this._currentElement;
		}
	},
	_onMouseOutCallout: function(e) {
		if (this._currentElement && this.autoHide) {
			this._callout.startHideTimer();
		}
	},
	setContent: function(content, title) {
		/// <summary>Sets the content of the maptip</summary>
		/// <param name="content" type="String">HTML content in the maptip</param>
		this._callout.setContent({ "content": content, "title": title });
	},
	get_animate: function() {
		/// <value type="Boolean">Gets or sets whether the maptip should animate on show/hide.</value>
		if (this.get_isInitialized()) { return this._callout.get_animate(); }
		else { return this._animate; }
	},
	set_animate: function(value) {
		this._animate = value;
		if (this.get_isInitialized()) { this._callout.set_animate(value); }
	},
	get_maxheight: function() {
		/// <value type="Number" integer="true">Gets or sets the expanded maximum height of the content of the maptip.</value>
		return this._maxheight;
	},
	set_maxheight: function(value) {
		this._maxheight = value;
	},
	get_width: function() {
		/// <value type="Number" integer="true">Gets or sets the width of the content of the maptip.</value>
		return this._width;
	},
	set_width: function(value) {
		this._width = value;
		if (this._callout != null) {
			this._callout.set_width(value);
		}
	},
	get_showOnHover: function() {
		return this._showOnHover;
	},
	set_showOnHover: function(value) {
		this._showOnHover = value;
		if (value === false && this._callout) { this._callout.hide(); }
	},
	__set_map: function(value) {
		if (this._callout && this._map != value) {
			throw new Error.invalidOperation('Cannot change the map on MapTips once initialized');
		}
		this._map = value;
		this._setupCallout();
	},
	get_callout: function() {
		/// <value type="ESRI.ADF.UI.Callout">Gets the callout instance used by the mapti</value>
		return this._callout;
	},
	get_contentTemplate: function() {
		/// <value type="String">Gets or sets a content template used to format an attributes collection when the maptips is expanded.</value>
		return this._contentTemplate;
	},
	set_contentTemplate: function(value) {
		this._contentTemplate = value;
	},
	get_hoverTemplate: function() {
		/// <value type="String">Gets or sets a hover template used to format an attributes collection when the mouse hovers on a GraphicFeature.</value>
		return this._hoverTemplate;
	},
	set_hoverTemplate: function(value) { this._hoverTemplate = value; },
	set_autoHide: function(value) {
		this._autoHide = value;
	},
	get_autoHide: function() {
		/// <value type="Boolean">Enables or disables the autohide functionality.</value>
		return this._autoHide;
	},
	get_expandOnClick: function() {
		/// <value type="String">Gets or sets whether the callout will expand when you click it.</value>
		return this._expandOnClick;
	},
	set_expandOnClick: function(value) { this._expandOnClick = value; },
	get_isExpanded: function() {
		/// <value type="Boolean">Gets the expanded state of the maptip.</value>
		return this._isExpanded;
	},
	get_maptipContentID: function() {
		/// <value type="String">Gets the client id of the maptip content.</value>
		return "content_" + this._maptipID;
	},
	get_maptipTitleID: function() {
		/// <value type="String">Gets the client id of the maptip title.</value>
		return "title_" + this._maptipID;
	},
	add_expanded: function(handler) {
	/// <summary>Raised when the maptip expands.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapTips</td>
	/// 				<td>The MapTip that was expanded</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs</td>
	/// 				<td>ESRI.ArcGIS.Graphics.GraphicFeature</td>
	/// 				<td>The graphic feature for the current MapTip</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('expanded', handler);
	},
	remove_expanded: function(handler) { this.get_events().removeHandler('expanded', handler); },
	add_collapsed: function(handler) {
	/// <summary>Raised when the maptip collapses.</summary>
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
	/// 				<td>ESRI.ADF.UI.MapTips</td>
	/// 				<td>The MapTip that was collapsed</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('collapsed', handler);
	},
	remove_collapsed: function(handler) { this.get_events().removeHandler('collapsed', handler); }
};

ESRI.ADF.UI.MapTips.registerClass('ESRI.ADF.UI.MapTips', Sys.Component);
ESRI.ADF.UI.MapTips._maptipCount = 0;

ESRI.ADF.UI.createMapTips = function(gfxLayer,map) {
	return new ESRI.ADF.UI.MapTips(gfxLayer,map);
};

Sys.Application.add_init(function() {
    //Register default callout style
    var calloutSettings = {
        "template": '<div style="background-color:#ffa;border: solid 1px #eee;padding: 0px; margin:0;width:{@callout_width}" ><div style="padding:0;">{@content}</div></div>',
        "templateUrl": null,
        "arrowUrl": ESRI.ADF.UI.calloutArrowUrl,
        "arrowBounds": [
        //startX.startY,width,height,offsetx,offsety,bufferX,bufferY
				[0, 0, 18, 30, 0, 6, 5, 5], //NW
				[20, 0, 18, 30, 0, 6, 5, 5], //NE
				[0, 30, 18, 30, 0, 6, 5, 5], //SW
				[20, 30, 18, 30, 0, 6, 5, 5]  //SE
		]
    };
    ESRI.ADF.UI.defaultCalloutTemplate = new ESRI.ADF.UI.CalloutLayout();
    ESRI.ADF.UI.defaultCalloutTemplate.set_layout(calloutSettings);

    //Register default maptip style
    var spriteStyle = String.format(".esriDefaultMaptip .esriDefaultMaptipWindowSprite {{ background-image:url({0}); width:1000px; height:998px; _background-image:none; _filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', sizingMethod='crop', src='{0}'); }}", ESRI.ADF.UI._maptipsSprite);
    var pa = document.getElementsByTagName('head')[0];
    var el = document.createElement('style');
    el.type = 'text/css';
    el.media = 'screen';
    if (el.styleSheet) el.styleSheet.cssText = spriteStyle; // IE
    else el.appendChild(document.createTextNode(spriteStyle)); // others
    pa.appendChild(el);

    var isRTL = (document.documentElement.dir == "rtl"); // find out if the document has been set to right-to-left
    var maptipSettings = {
        "template": '<div style="width:{@callout_width}; position:relative; color: #000;" class="esriDefaultMaptip"><div style="height:5px"><div style="position: absolute; height:5px; width:50%; left:0; overflow:hidden;"><div style="left:0px; position:absolute;" class="esriDefaultMaptipWindowSprite"></div></div><div style="position: absolute; height:5px; width:50%; right:0; overflow:hidden;"><div style="right:0px; position:absolute;" class="esriDefaultMaptipWindowSprite"></div></div></div><div style="position:relative; overflow:hidden;"><div style="overflow:hidden; width: 100%; position:relative; top:0;"><div style="position: absolute; left:0; top:-5px; width:100%; height:998px;"><div style="position: absolute; width:50%; height:100%; left:0; overflow:hidden;"><div class="esriDefaultMaptipWindowSprite" style="left:0;position:absolute;"></div></div><div style="position: absolute; width:50%; height:100%; right:0; overflow:hidden;"><div style="right: 0px;position:absolute;" class="esriDefaultMaptipWindowSprite"></div></div></div><div style="margin:0 10px 0px 10px;position:relative; top:0px;"><div id="{@maptip_titleID}" style="font-weight: bold; width:100%;" class="esriDefaultMaptipWindowTitle">{@title}&nbsp;</div><div id="{@maptip_contentID}" style="background-color:#fff; display:none; margin:0;position:relative; top:0px; overflow:auto;font-size:10pt;width:100%" class="esriDefaultMaptipWindowContent">{@content}</div></div><div id="close" onclick="$find(\'{@maptipID}\').get_callout().hide();" style="cursor:pointer; position: absolute;' + (isRTL ? 'left' : 'right') + ':10px;top:4px;width:7px; height:6px; overflow:hidden;"><div class="esriDefaultMaptipWindowSprite" style="position:absolute;left:-951px; top:-945px;"></div></div></div></div><div style="height:5px;position:relative;"><div style="left:0; top:0; width:50%;overflow:hidden;height:100%;position:absolute;"><div style="bottom:0;position:absolute;left:0" class="esriDefaultMaptipWindowSprite"></div></div><div style="right:0; top:0; width:50%;overflow:hidden;height:100%;position:absolute;"><div style="right:0;bottom:0px;position:absolute;" class="esriDefaultMaptipWindowSprite"></div></div></div></div>',
        "templateUrl": null, //URL to template
        "arrowUrl": ESRI.ADF.UI._maptipsSprite,
        "arrowBounds": [
        //startX.startY,width,height,offsetx,offsety,bufferX,bufferY
		[954, 921, 16, 17, -1, -3, 5, -7], //NW
		[939, 921, 16, 17, -1, -3, 5, -7], //NE
		[954, 921, 16, 17, -1, -3, 5, -7], //SW
		[939, 921, 16, 17, -1, -3, 5, -7]  //SE
	]
    };
    ESRI.ADF.UI.defaultMapTipsTemplate = new ESRI.ADF.UI.CalloutLayout();
    ESRI.ADF.UI.defaultMapTipsTemplate.set_layout(maptipSettings);
});



if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }