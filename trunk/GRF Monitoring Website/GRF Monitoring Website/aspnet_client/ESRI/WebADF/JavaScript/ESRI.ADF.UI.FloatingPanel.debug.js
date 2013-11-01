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

var esriDockContainersOnLoadChecked = false;

Type.registerNamespace('ESRI.ADF.UI');

ESRI.ADF.UI._FloatingPanelZLevel = 1;
FloatingPanels = ESRI.ADF.UI._FloatingPanels = []; //Internal list of panels

ESRI.ADF.UI.FloatingPanel = function(element) {
	/// <summary>
	/// The FloatingPanel control provides a floating container for HTML content.  
	/// </summary>
	ESRI.ADF.UI.FloatingPanel.initializeBase(this, [element]);
	ESRI.ADF.UI._FloatingPanels[ESRI.ADF.UI._FloatingPanels.length] = this;
	this.id = this.get_id()
	this.callbackFunctionString = null;
	this.expandedImage = null;
	this.collapsedImage = null;
	this.dockedImage = null;
	this.undockedImage = null;
	this.transparency = 0;
	this.minWidth = 0;
	this.minHeight = 0;
	this.forcePNG = false;
	this.tempMoveFunction = null;
	this.borderStyle = null;
	this.backgroundColor = null;
	this.bodyBorderStyle = null;
	this.dockedContextMenuID = null;
	this.dockParent = null;
	this._isResizing = false;
	this._isDragging = false;
	this._leftOffset = null;
	this._topOffset = null;
	this._keepInForm = false;
	this._x1 = null;
	this._y1 = null;
	this._restrictToPage = false;
	// todo: if docked, need to find out if parent element is the dockParent. if not, we need to dock it in there after the page loads.
	this.docked = false;
	this._isRtl = false;
	};
	ESRI.ADF.UI.FloatingPanel.prototype = {
	initialize: function() {
		ESRI.ADF.UI.FloatingPanel.callBaseMethod(this, 'initialize');
		this._borderStyle = this.get_element().style.borderStyle;
		var zIndex = parseInt(this.get_element().style.zIndex);
		if (zIndex > ESRI.ADF.UI._FloatingPanelZLevel) {
			ESRI.ADF.UI._FloatingPanelZLevel = zIndex;
		}
		else this.get_element().style.zIndex = ESRI.ADF.UI._FloatingPanelZLevel++;
		this._fixRtl();
		this._backgroundColor = this.get_element().style.backgroundColor;
		this._bodyCell = $get(this.get_id() + '_BodyCell');
		if (this._bodyCell != null)
			this._bodyBorderStyle = this._bodyCell.style.borderStyle;
		this._moveWindowDragHandler = Function.createDelegate(this, this._moveWindowDrag);
		this._endWindowDragHandler = Function.createDelegate(this, this._endWindowDrag);
		this._dragWindowResizeHandler = Function.createDelegate(this, this._dragWindowResize);
		this._endWindowResizeHandler = Function.createDelegate(this, this._endWindowResize);
		this._onContextMenuHandler = Function.createDelegate(this, function(e) { esriShowContextMenu(e, this.dockedContextMenuID, "", "TitleRow"); return false; });
		this._preventHandler = function(e) { e.preventDefault() };
		this._floatingPanelBodyCell = $get(this.get_id() + '_BodyCell');
		this._floatingPanelSideResizeCell = $get(this.get_id() + '_SideResizeCell');
		this._fpTitle = $get(this.get_id() + '_Title');
		if (Sys.Browser.agent === Sys.Browser.Firefox) {
			this._fpTitle.style.MozUserSelect = 'none';
		}
		this._checkDock();
	},
	_checkRtl: function() {
		if (document.defaultView && document.defaultView.getComputedStyle) { //FireFox, Mozilla...
			this._isRtl = (document.defaultView.getComputedStyle(this.get_element(), null)['direction'] == 'rtl');
		}
		else if (this.get_element().currentStyle) { //IE
			this._isRtl = (this.get_element().currentStyle.blockDirection == 'rtl')
		}
		return this._isRtl;
	},
	_fixRtl: function() {
		var rtl = this._isRtl;
		var rtl2 = this._checkRtl();
		if (rtl == rtl2) { return; }
		//Fix alignment on buttons
		var id = this.get_id();
		var btn = $get(id + '_ExpandButton');
		if (!btn) { btn = $get(id + '_CloseButton'); }
		if (!btn) { btn = $get(id + '_DockButton'); }
		if (btn) { btn.parentNode.align = this._isRtl ? 'left' : 'right'; }
		//Fix corner resize arrow
		var corner = $get(id + '_CornerResizeImage');
		if (corner) { corner.style.cursor = this._isRtl ? 'sw-resize' : 'nw-resize'; }
		var title = $get(id + '_TitleCell');
		if (title) {
			if (this._isRtl) { title.style.paddingRight = title.style.paddingLeft; title.style.paddingLeft = ''; }
			else { title.style.paddingLeft = title.style.paddingRight; title.style.paddingRight = ''; }
		}
		var bodycell = $get(id + '_BodyCell');
		if (bodycell) {
			if (this._isRtl) { bodycell.style.paddingRight = bodycell.style.paddingLeft; bodycell.style.paddingLeft = ''; }
			else { bodycell.style.paddingLeft = bodycell.style.paddingRight; bodycell.style.paddingRight = ''; }
		}
	},
	_checkDock: function() {
		if (this.dockParent != null && this.dockParent.length > 0 && this.get_isDocked()) {
			this.dock();
		}
		else if (!this.get_isDocked()) {
			var outsideContainerID = this.get_id() + "_Container";
			var outsideContainer = $get(outsideContainerID);
			if (outsideContainer != null) {
				outsideContainer.parentNode.removeChild(outsideContainer);
				outsideContainer = null;
				this._element = $get(this.get_id());
			}
			outsideContainer = document.createElement('div');
			outsideContainer.id = outsideContainerID;
			outsideContainer.style.margin = "0px";
			outsideContainer.style.padding = "0px";
			if (this._keepInForm && document.forms[0]) { document.forms[0].appendChild(outsideContainer); }
			else { document.body.appendChild(outsideContainer); }
			var fp = this.get_element();
			fp.parentNode.removeChild(fp);
			outsideContainer.appendChild(fp);
		}
	},
	bringToFront: function() {
		/// <summary>Brings the FloatingPanel in front of all other panels.</summary>
		/// <remarks>If the panel is docked, this call has no effect.</remarks>
		if (this.get_isDocked() && this._dockParentElement != null) return;
		var fpDiv = this.get_element();
		if (parseInt(fpDiv.style.zIndex, 10) < ESRI.ADF.UI._FloatingPanelZLevel) {
			fpDiv.style.zIndex = ++ESRI.ADF.UI._FloatingPanelZLevel;
		}
		ie6Workarounds(this.get_id());
		return false;
	},
	_makeTransparent: function() {
		if (this.transparency <= 0) return;
		var element = this.get_element();
		if (element == null) return;
		var dragOpacity = 100 - this.transparency;
		var opac = dragOpacity / 100;
		element.style.opacity = opac;
		element.style.mozOpacity = opac;
		element.style.filter = "alpha(opacity=" + dragOpacity + ")";

		// hide alpha blended png images
		// because alpha blended images don't get well with setting the alpha on the filter.
		var expandButton = $get(this.get_id() + '_ExpandButton');
		var closeButton = $get(this.get_id() + '_CloseButton');
		var dockButton = $get(this.get_id() + '_DockButton');
		if (expandButton != null) expandButton.style.visibility = 'hidden';
		if (closeButton != null) closeButton.style.visibility = 'hidden';
		if (dockButton != null) dockButton.style.visibility = 'hidden';
	},
	_makeOpaque: function() {
		if (this.transparency <= 0) { return; }
		// do not do if moving
		if (document.onmousemove == this._moveWindowDragHandler) return;

		var element = this.get_element();
		if (element == null) { return; }
		element.style.opacity = 1.0;
		element.style.mozOpacity = 1.0;
		element.style.filter = ""; // set this to nothing, which makes it opaque.

		// re-show alpha blended png images that were hidden in makeTransparent
		var expandButton = $get(this.get_id() + '_ExpandButton');
		var closeButton = $get(this.get_id() + '_CloseButton');
		var dockButton = $get(this.get_id() + '_DockButton');
		if (expandButton != null) expandButton.style.visibility = 'visible';
		if (closeButton != null) closeButton.style.visibility = 'visible';
		if (dockButton != null) dockButton.style.visibility = 'visible';
	},
	get_isDragging: function() { return this._isDragging; },
	get_isResizing: function() { return this._isResizing; },
	//Dragging
	_startWindowDrag: function(e) {
		if (this._isDragging) return;
		this._fixRtl();
		this._isDragging = true;
		this._leftOffset = null;
		this._topOffset = null;
		this.get_element().style.position = "absolute";
		$addHandler(document, 'mousemove', this._moveWindowDragHandler);
		$addHandler(document, 'mouseup', this._endWindowDragHandler);
		$addHandler(document, 'selectstart', this._preventHandler);

		this._titleMouseOverFunction = this._fpTitle.onmouseover;
		this._titleMouseOutFunction = this._fpTitle.onmouseout;
		this._fpTitle.onmouseover = null;
		this._fpTitle.onmouseout = null;
		this._maxFloatingPanelDragRight = getWinWidth() - parseInt(this.get_element().offsetWidth, 10);
		var height = parseInt(document.body.scrollHeight, 10);
		var winHeight = getWinHeight();
		if (height < winHeight) { height = winHeight; }

		this._maxFloatingPanelDragBottom = height - parseInt(this.get_element().clientHeight, 10);
		ie6Workarounds(this.get_id());

		this._raiseEvent('dragStart');
		return false;
	},
	_moveWindowDrag: function(e) {
		e = ESRI.ADF.System._makeMouseEventRelativeToElement(e, document, { "x": 0, "y": 0 });
		pos = { "mouseX": e.offsetX, "mouseY": e.offsetY };
		if (this._leftOffset == null || this._topOffset == null) {
			var box = Sys.UI.DomElement.getLocation(this.get_element());
			this._leftOffset = pos.mouseX - box.x;
			this._topOffset = pos.mouseY - box.y;
			box = null;
			this._makeTransparent();
		}
		this._moveTo(pos.mouseX - this._leftOffset, pos.mouseY - this._topOffset);
		ie6Workarounds(this.get_id());

		this._raiseEvent('dragging');

		e.preventDefault();
		e.stopPropagation();
	},
	_moveTo: function(left, top) {
		if (this._restrictToPage) {
			if (left > this._maxFloatingPanelDragRight) { left = this._maxFloatingPanelDragRight; }
			if (left < 0) { left = 0; }
			if (top > this._maxFloatingPanelDragBottom) { top = this._maxFloatingPanelDragBottom; }
		}
		if (top < 0) { top = 0; }
		var element = this.get_element();
		if (this._isRtl && Sys.Browser.agent === Sys.Browser.InternetExplorer) {
			this.get_element().style.right = this._maxFloatingPanelDragRight - left + 'px';
			this.get_element().style.top = top + 'px';
		}
		else {
			Sys.UI.DomElement.setLocation(element, left, top);
		}
	},
	_endWindowDrag: function(e) {
		if (!this._isDragging) { return; }
		this._isDragging = false;
		$removeHandler(document, 'mousemove', this._moveWindowDragHandler);
		$removeHandler(document, 'mouseup', this._endWindowDragHandler);
		this._fpTitle.onmouseover = this._titleMouseOverFunction;
		this._fpTitle.onmouseout = this._titleMouseOutFunction;

		this._makeOpaque();
		ie6Workarounds(this.get_id());
		$removeHandler(document, 'selectstart', this._preventHandler);

		var hfTop = $get(this.get_id() + '_hfTop');
		var hfLeft = $get(this.get_id() + '_hfLeft');
		if (hfTop != null) hfTop.value = this.get_element().style.top;
		if (hfLeft != null) hfLeft.value = this.get_element().style.left;

		this._raiseEvent('dragEnd');
		// Required to fix IE bug that hides the titlebar background image after move
		// All floatingpanels are done here because possible subpanels may be affected.
		resetAllTitleBarBackgroundImages();

		this._isDragging = false;
		e.preventDefault();
		e.stopPropagation();
	},
	//Resizing
	_startWindowResize: function(mode) {
		///// Added for right button check on resize ****/
		if (this._isResizing) return;
		this._isResizing = true;
		///// Added for right button check on resize ****/  
		this._resizeMode = mode ? mode : null;

		if (!this._floatingPanelBodyCell.parentElement) {
			// Parent was refreshed, resync child elements
			this._floatingPanelBodyCell = $get(this.get_id() + '_BodyCell');
			this._floatingPanelSideResizeCell = $get(this.get_id() + '_SideResizeCell');
			this._fpTitle = $get(this.get_id() + '_Title');
		}

		this._x1 = null;
		this._y1 = null;
		this._startWidth = null;
		this._startHeight = null;
		this.showFrame();
		this._tempMoveFunction = document.onmousemove;
		document.onmousemove = this._dragWindowResizeHandler;
		document.onmouseup = this._endWindowResizeHandler;

		this._raiseEvent('resizeStart', mode);
		return false;
	},
	_dragWindowResize: function(e) {
		///// Added for right button check on resize ****/
		if (!isLeftButton(e)) return;
		if (!this._isResizing) return;
		///// Added for right button check on resize ****/ 
		var pos = ESRI.ADF.System.__getAbsoluteMousePosition(e);
		if (this._x1 == null || this._y1 == null || this._startWidth == null || this._startHeight == null) {
			var box = Sys.UI.DomElement.getBounds(this._floatingPanelBodyCell);
			this._startWidth = box.width;
			this._startHeight = box.height;
			this._x1 = pos.mouseX;
			this._y1 = pos.mouseY;
		}
		var tempWidth = null;
		if (this._resizeMode == null || this._resizeMode == 'width') {
			this._leftOffset = pos.mouseX - this._x1;
			if (this._isRtl) { this._leftOffset = this._x1 - pos.mouseX; }
			else { this._leftOffset = pos.mouseX - this._x1; }
			if (this._isRtl && Sys.Browser.agent !== Sys.Browser.InternetExplorer) {
				this.get_element().style.left = pos.mouseX + 'px';
			}
			tempWidth = this._startWidth + this._leftOffset;
			if (isNav) { tempWidth += 10; }
		}

		var tempHeight = null;
		if (this._resizeMode == null || this._resizeMode == 'height') {
			this._topOffset = pos.mouseY - this._y1;
			tempHeight = this._startHeight + this._topOffset;
		}
		this._resize(tempWidth, tempHeight);
		ie6Workarounds(this.get_id());
		if (tempWidth == null) { tempWidth = parseInt(this.get_element().style.width, 10); }
		if (tempHeight == null) { tempHeight = parseInt(this._floatingPanelBodyCell.style.height, 10); }
		this._raiseEvent('resizing', { "width": tempWidth, "height": tempHeight });
		return false;
	},
	_resize: function(width, height) {
		if (width != null && width > this.minWidth) {
			this.get_element().style.width = width + "px";
		}
		if (height != null && height > this.minHeight) {
			this._floatingPanelBodyCell.style.height = height + "px";
			this._floatingPanelSideResizeCell.style.height = height + "px";
		}
	},
	_endWindowResize: function(e) {
		document.onmousemove = this._tempMoveFunction;
		document.onmouseup = null;
		var hfHeight = $get(this.get_id() + '_hfHeight');
		var hfWidth = $get(this.get_id() + '_hfWidth');
		var width = this.get_element().style.width;
		var height = this._floatingPanelBodyCell.style.height;
		if (hfWidth) { hfWidth.value = width }
		if (hfHeight) { hfHeight.value = height; }
		this._raiseEvent('resized', { "width": parseInt(width, 10), "height": parseInt(height, 10) });
		this._isResizing = false;
		return false;
	},
	//Show/hide
	hide: function(doCallback, argument) {
		this.get_element().style.display = 'none';
		var hfVisible = $get(this.get_id() + '_hfVisible');
		if (hfVisible != null) { hfVisible.value = 'false'; }
		this._raiseEvent('hide');
		//show container if directly on page
		var fpContainer = $get(this.get_id() + "_Container");
		if (fpContainer != null) { fpContainer.style.display = 'none'; }

		ie6Workarounds(this.get_id());
		if (doCallback == true || doCallback == null) {
			if (argument == null) { argument = 'EventArg=hidden'; }
			else { argument += '&EventArg=hidden'; }
			var context = null;
			eval(this.callbackFunctionString);
		}
	},
	show: function(doCallback, argument) {
		this._fixRtl();
		this.get_element().style.display = '';
		var hfVisible = $get(this.get_id() + '_hfVisible');
		if (hfVisible != null) hfVisible.value = 'true';
		this._raiseEvent('show');
		//show container if directly on page
		var fpContainer = $get(this.get_id() + "_Container");
		if (fpContainer != null) { fpContainer.style.display = ''; }

		this.bringToFront();
		ie6Workarounds(this.get_id());
		if (doCallback == true || doCallback == null) {
			if (argument == null) { argument = 'EventArg=shown'; }
			else { argument += '&EventArg=shown'; }
			var context = null;
			eval(this.callbackFunctionString);
		}
	},
	setTitle: function(argument) {
		var titleCell = $get(this.get_id() + '_TitleCell');
		if (titleCell != null)
			titleCell.innerHTML = argument;
	},
	toggleVisibility: function(doCallback, argument) {
		var hfVisible = $get(this.get_id() + '_hfVisible');
		if (hfVisible === null) {
			var fp = this.get_element();
			if (fp.style.display == 'none') { showFloatingPanel(fpID, doCallback, argument); }
			else if (hfVisible.value == 'false') { hideFloatingPanel(fpID, doCallback, argument); }
			return;
		}
		if (hfVisible.value == 'true') { this.hide(doCallback, argument); }
		else if (hfVisible.value == 'false') { this.show(doCallback, argument); }
		else {
			var fp = this.get_element();
			hfVisible.value = fp.style.display == 'none' ? 'false' : 'true';
			if (hfVisible.value == 'true') { this.hide(doCallback, argument); }
			else if (hfVisible.value == 'false') { this.show(doCallback, argument); }
		}
	},
	//Expand/collapse
	expand: function() {
		var fpBody = $get(this.get_id() + '_BodyRow');
		var expandButton = $get(this.get_id() + '_ExpandButton');
		var resizeRow = $get(this.get_id() + '_ResizeRow');
		var hfExpanded = $get(this.get_id() + '_hfExpanded');
		if (fpBody == null || expandButton == null) { return; }

		if (fpBody.style.display == 'none') {
			fpBody.style.display = '';
			if (resizeRow != null) resizeRow.style.display = '';
			switchImageSourceAndAlphaBlend(expandButton, this.expandedImage, this.forcePNG);
			if (hfExpanded != null) { hfExpanded.value = 'true'; }
			this._makeOpaque();
		}
		this._raiseEvent('expanded');
		ie6Workarounds(this.get_id());
	},
	collapse: function() {
		var fpBody = $get(this.get_id() + '_BodyRow');
		var expandButton = $get(this.get_id() + '_ExpandButton');
		var resizeRow = $get(this.get_id() + '_ResizeRow');
		var hfExpanded = $get(this.get_id() + '_hfExpanded');
		if (fpBody == null || expandButton == null) { return; }

		if (fpBody.style.display != 'none') {
			fpBody.style.display = 'none';
			if (resizeRow != null) resizeRow.style.display = 'none';
			switchImageSourceAndAlphaBlend(expandButton, this.collapsedImage, this.forcePNG);
			if (hfExpanded != null) { hfExpanded.value = 'false'; }
			this._makeTransparent();
		}
		this._raiseEvent('collapsed');
		ie6Workarounds(this.get_id());
	},
	toggleState: function(fireServerSideExpandEvent, fireServerSideCollapseEvent) {
		var fpBody = $get(this.get_id() + '_BodyRow');
		if (fpBody.style.display == 'none') {
			this.expand();
			if (fireServerSideExpandEvent) {
				var argument = 'EventArg=expanded';
				var context = null;
				eval(this.callbackFunctionString);
			}
		}
		else {
			this.collapse();
			if (fireServerSideCollapseEvent) {
				var argument = 'EventArg=collapsed';
				var context = null;
				eval(this.callbackFunctionString);
			}
		}
	},
	// dock/undock
	dock: function() {
		if (!this.dockParent) { return; }
		this._dockParentElement = $get(this.dockParent);
		if (this._dockParentElement == null) {
			this.set_isDocked(false);
			return;
		}

		this._fixRtl();
		var fp = this.get_element();
		ie6SaveCheckboxState();

		// first set some dock settings
		fp.style.width = "100%";
		fp.style.position = "";
		fp.style.top = "0px";
		fp.style.left = "0px";
		fp.style.zIndex = '';
		//
		// add floatingpanel to dock parent
		//
		// this is to work-around a netscape 8.1.2 bug. If the floatingpanel parent
		// is the same as the node we are appending it to, then it will crash netscape.
		// this workaround just checks to see if the floatingpanel parent is the same as
		// the docking container, if so, we remove the node first before we dock it.

		if (this._dockParentElement == fp.parentElement) fp.parentNode.removeChild(fp);
		this._dockParentElement.appendChild(fp);
		// make floatingpanel not draggable
		var fpTitleRow = $get(this.get_id() + "_Title");
		fpTitleRow.style.cursor = "";
		fpTitleRow.onmousedown = null;
		// turn on contextmenu
		if (this.dockedContextMenuID != null && this.dockedContextMenuID.length > 0) {
			fpTitleRow = $get(this.get_id() + "_Title");
			fpTitleRow.oncontextmenu = this._onContextMenuHandler;
		}
		// make width not resizable
		var fpResizeImage = null;
		fpResizeImage = $get(this.get_id() + "_SideResizeImage");
		fpResizeImage.style.cursor = "";
		fpResizeImage.onmousedown = null;
		// make corner not resizable
		fpResizeImage = $get(this.get_id() + "_CornerResizeImage");
		fpResizeImage.style.cursor = "";
		fpResizeImage.onmousedown = null;

		// switch from undockedImage to dockedImage
		var dockButton = $get(this.get_id() + "_DockButton");
		switchImageSourceAndAlphaBlend(dockButton, this.dockedImage, this.forcePNG);

		this.set_isDocked(true);
		ie6Workarounds(this.get_id());
		ie6RetrieveCheckboxState(fp);
		if (this.onDockFunction != null) this.onDockFunction(fp);
		this._raiseEvent('docked');
	},
	undock: function() {
		if (!this.dockParent) { this.dockParent = this.get_element().parentNode.id }
		if (this.dockParent == null) { return; }
		this._dockParentElement = $get(this.dockParent);
		if (this._dockParentElement == null) return;
		this._fixRtl();
		var fp = this.get_element();

		ie6SaveCheckboxState(fp);

		var outsideContainerID = this.get_id() + "_Container";
		var outsideContainer = $get(outsideContainerID);

		// create outside container if it doesn't exist
		if (outsideContainer == null) {
			outsideContainer = document.createElement('div');
			outsideContainer.id = outsideContainerID;
			outsideContainer.style.margin = "0px";
			outsideContainer.style.padding = "0px";
			if (this._keepInForm && document.forms[0]) { document.forms[0].appendChild(outsideContainer); }
			else { document.body.appendChild(outsideContainer); }
		}

		// add floatingpanel to outside container
		//
		// first set style height and width to clientheight and clientwidth
		fp.style.width = fp.clientWidth + "px";
		//fp.style.height=fp.clientHeight+"px";
		// set some undock settings
		var rect = Sys.UI.DomElement.getBounds(this.get_element());
		fp.style.left = rect.x + rect.width + 10 + "px";
		fp.style.top = rect.y + "px";
		fp.style.position = "absolute";
		// store dockParent
		this._dockParentElement = fp.parentNode;
		this.dockParent = fp.parentNode.id;
		// add floatingpanel to outside container
		outsideContainer.appendChild(fp);
		// make floatingpanel draggable
		var fpTitleRow = $get(this.get_id() + "_Title");
		fpTitleRow.style.cursor = "move";
		fpTitleRow.onmousedown = Function.createDelegate(this, function(e) { if (!isLeftButton(e)) return; this.bringToFront(); this._startWindowDrag(); });

		// turn off dockedContextMenu
		fpTitleRow = $get(this.get_id() + "_Title");
		fpTitleRow.oncontextmenu = null;
		// make width resizable
		var fpResizeImage = null;
		fpResizeImage = $get(this.get_id() + "_SideResizeImage");
		fpResizeImage.style.cursor = "w-resize";
		fpResizeImage.onmousedown = Function.createDelegate(this, function() { this._startWindowResize('width'); if (!Sys.Browser.agent === Sys.Browser.InternetExplorer) return false; });
		// make height resizable
		fpResizeImage = $get(this.get_id() + "_BottomResizeImage");
		fpResizeImage.style.cursor = "s-resize";
		fpResizeImage.onmousedown = Function.createDelegate(this, function() { this._startWindowResize('height'); if (!Sys.Browser.agent === Sys.Browser.InternetExplorer) return false; });
		// make corner resizable
		fpResizeImage = $get(this.get_id() + "_CornerResizeImage");
		fpResizeImage.style.cursor = "nw-resize";
		fpResizeImage.onmousedown = Function.createDelegate(this, function() { this._startWindowResize(); if (!Sys.Browser.agent === Sys.Browser.InternetExplorer) return false; });
		// switch from dockedImage to undockedImage
		var dockButton = $get(this.get_id() + "_DockButton");
		switchImageSourceAndAlphaBlend(dockButton, this.undockedImage, this.forcePNG);
		this.set_isDocked(false);
		this.bringToFront();
		ie6Workarounds(this.get_id());
		ie6RetrieveCheckboxState(fp);
		this._raiseEvent('undocked');
	},
	toggleDockState: function() {
		if (this.get_isDocked()) { this.undock(); }
		else { this.dock(); }
	},
	moveDockedUp: function() {
		if (!this.get_isDocked()) { return; }
		var parentNode = this.get_element().parentNode;
		var refNode = esriGetPreviousSibling(this.get_element());
		if (refNode == null) return;
		parentNode.removeChild(this.get_element());
		parentNode.insertBefore(this.get_element(), refNode);
	},
	moveDockedDown: function() {
		if (!this.get_isDocked()) { return; }
		var parentNode = this.get_element().parentNode;
		if (parentNode == null) return;
		var nextNode = esriGetNextSibling(this.get_element());
		if (nextNode == null) return;
		var refNode = esriGetNextSibling(nextNode);
		if (refNode == null) {
			parentNode.removeChild(this.get_element());
			parentNode.appendChild(this.get_element());
		}
		else {
			parentNode.removeChild(this.get_element());
			parentNode.insertBefore(this.get_element(), refNode);
		}
	},
	moveDockedToTop: function() {
		if (!this.get_isDocked()) { return; }
		var parentNode = this.get_element().parentNode;
		var refNode = esriGetFirstSibling(this.get_element());
		if (refNode == null || refNode == this.get_element()) { return; }
		parentNode.removeChild(this.get_element());
		parentNode.insertBefore(this.get_element(), refNode);
	},
	moveDockedToBottom: function() {
		if (!this.get_isDocked()) { return; }
		var parentNode = this.get_element().parentNode;
		parentNode.removeChild(this.get_element());
		parentNode.appendChild(this.get_element());
	},
	// show/hide frame
	hideFrame: function() {
		// do not hide, if collapsed
		var hfExpanded = $get(this.get_id() + '_hfExpanded');
		if (hfExpanded && hfExpanded.value == 'false') return;
		// do not hide if moving or resizing
		if (this.get_isDragging() || this.get_isResizing()) { return; }

		var floatingPanel = this.get_element();
		var floatingPanelBodyCell = $get(this.get_id() + '_BodyCell');
		var floatingPanelSideResizeCell = $get(this.get_id() + '_SideResizeCell');

		floatingPanel.style.borderStyle = 'none';
		floatingPanel.style.backgroundColor = '';
		floatingPanelBodyCell.style.borderStyle = 'none';
		floatingPanelBodyCell.style.backgroundColor = '';
		floatingPanelSideResizeCell.style.borderStyle = 'none';
		floatingPanelSideResizeCell.style.backgroundColor = '';
		var fpTitle = $get(this.get_id() + '_Title');
		fpTitle.style.visibility = 'hidden';
	},
	showFrame: function() {
		// do not show if moving or resizing
		if (this.get_isDragging() || this.get_isResizing()) { return; }

		var floatingPanel = this.get_element();
		var floatingPanelBodyCell = $get(this.get_id() + '_BodyCell');
		var floatingPanelSideResizeCell = $get(this.get_id() + '_SideResizeCell');

		floatingPanel.style.borderStyle = this._borderStyle;
		floatingPanel.style.backgroundColor = this._backgroundColor;
		floatingPanelBodyCell.style.borderStyle = this._bodyBorderStyle;
		floatingPanelBodyCell.style.backgroundColor = this._backgroundColor;
		floatingPanelSideResizeCell.style.borderStyle = this._bodyBorderStyle;
		floatingPanelSideResizeCell.style.backgroundColor = this._backgroundColor;

		var fpTitle = $get(this.get_id() + '_Title');
		fpTitle.style.visibility = 'visible';
	},
	/// create properties
	get_transparency: function() { return this.transparency; },
	set_transparency: function(value) { if (value < 0) { this.transparency = 0; } else if (value > 100) { this.transparency = 100; } else { this.transparency = value; } },
	get_callbackFunctionString: function() { return this.callbackFunctionString; },
	set_callbackFunctionString: function(value) { this.callbackFunctionString = value; },
	get_expandedImage: function() { return this.expandedImage; },
	set_expandedImage: function(value) { this.expandedImage = value; },
	get_collapsedImage: function() { return this.collapsedImage; },
	set_collapsedImage: function(value) { this.collapsedImage = value; },
	get_dockedImage: function() { return this.dockedImage; },
	set_dockedImage: function(value) { this.dockedImage = value; },
	get_undockedImage: function() { return this.undockedImage; },
	set_undockedImage: function(value) { this.undockedImage = value; },
	get_dockedContextMenuID: function() { return this.dockedContextMenuID; },
	set_dockedContextMenuID: function(value) { this.dockedContextMenuID = value; },
	get_dockParent: function() { return this.dockParent; },
	set_dockParent: function(value) { this.dockParent = value; if (value) { this._dockParentElement = $get(value); } },
	get_forcePNG: function() { return this.forcePNG; },
	set_forcePNG: function(value) { this.forcePNG = value; },
	get_isDocked: function() { return this.docked; },
	set_isDocked: function(value) { this.docked = value; },
	get_restrictToPage: function() { return this._restrictToPage; },
	set_restrictToPage: function(value) { this._restrictToPage = value; },
	get_keepInForm: function() { return this._keepInForm; },
	set_keepInForm: function(value) { this._keepInForm = value; },
	// events
	_raiseEvent: function(name, e) {
		if (!this.get_isInitialized()) { return; }
		var handler = this.get_events().getHandler(name);
		if (handler) { if (e === null || e === 'undefined') { e = Sys.EventArgs.Empty; } handler(this, e); }
	},
	add_dragStart: function(handler) {
	/// <summary>Raised when you start dragging the floating panel.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The floating panel being dragged</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>	
	    this.get_events().addHandler('dragStart', handler); },
	remove_dragStart: function(handler) { this.get_events().removeHandler('dragStart', handler); },
	
	add_dragMove: function(handler) {
	/// <summary>Raised while the floating panel is being moved.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The floating panel that is being moved</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
	    this.get_events().addHandler('dragging', handler); },
	remove_dragMove: function(handler) { this.get_events().removeHandler('dragging', handler); },

	add_dragEnd: function(handler) { 
	/// <summary>Raised when you finish dragging the floating panel .</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The floating panel that was dragged</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
	    this.get_events().addHandler('dragEnd', handler); },
	remove_dragEnd: function(handler) { this.get_events().removeHandler('dragEnd', handler); },

	add_resizeStart: function(handler) {
	/// <summary>Raised when you begin resizing the floating panel.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The floating panel being resized</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
    	this.get_events().addHandler('resizeStart', handler); },
	remove_resizeStart: function(handler) { this.get_events().removeHandler('resizeStart', handler); },

	add_resizing: function(handler) {
	/// <summary>Raised when the floating panel is resizing.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The floating panel being resized</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
	    this.get_events().addHandler('resizing', handler); },
	remove_resizing: function(handler) { this.get_events().removeHandler('resizing', handler); },

	add_resized: function(handler) {
	/// <summary>Raised when you finish resizing the floating panel.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The floating panel that was resized</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>envetArgs.width</td>
	/// 				<td>integer</td>
	/// 				<td>The width of the floating panel</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.height</td>
	/// 				<td>integer</td>
	/// 				<td>The height of the floating panel</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
	    this.get_events().addHandler('resized', handler); },
	remove_resized: function(handler) { this.get_events().removeHandler('resized', handler); },

	add_hide: function(handler) {
	/// <summary>Raised when the floating panel is hidden.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The floating panel that was hidden</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
    	this.get_events().addHandler('hide', handler); },
	remove_hide: function(handler) { this.get_events().removeHandler('hide', handler); },

	add_show: function(handler) {
	/// <summary>Raised when the floating panel is shown.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The floating panel made visible</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
	    this.get_events().addHandler('show', handler); },
	remove_show: function(handler) { this.get_events().removeHandler('show', handler); },

	add_expanded: function(handler) {
	/// <summary>Raised when the floating panel is expanded.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The expanded floating panel</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
    	this.get_events().addHandler('expanded', handler); },
	remove_expanded: function(handler) { this.get_events().removeHandler('expanded', handler); },

	add_collapsed: function(handler) {
	/// <summary>Raised when the floating panel is collapsed.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The collapsed floating panel</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
    	this.get_events().addHandler('collapsed', handler); },
	remove_collapsed: function(handler) { this.get_events().removeHandler('collapsed', handler); },

	add_docked: function(handler) {
	/// <summary>Raised when the floating panel is docked.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The docked floating panel</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
    	this.get_events().addHandler('docked', handler); },
	remove_docked: function(handler) { this.get_events().removeHandler('docked', handler); },

	add_undocked: function(handler) {
	/// <summary>Raised when the floating panel is undocked.</summary>
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
	/// 				<td>ESRI.ADF.UI.FloatingPanel</td>
	/// 				<td>The undocked floating panel</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
    	this.get_events().addHandler('undocked', handler); },
	remove_undocked: function(handler) { this.get_events().removeHandler('undocked', handler); }
};
ESRI.ADF.UI.FloatingPanel.registerClass('ESRI.ADF.UI.FloatingPanel', Sys.UI.Control);

//Shortcut methods (to be removed):
makeOpaque = function(fpID) { var obj=$find(fpID);if(obj)obj._makeOpaque(); };
makeTransparent = function(fpID) { var obj=$find(fpID);if(obj)obj._makeTransparent(); };
esriBringFloatingPanelToFront = function(fpID) { var obj=$find(fpID);if(obj)obj.bringToFront(); };
startWindowDrag = function(fpID) { var obj=$find(fpID);if(obj)obj._startWindowDrag(); };
startWindowResize = function(fpID,mode) { var obj=$find(fpID);if(obj)obj._startWindowResize(mode); };
hideFloatingPanel = function(fpID, doCallback, argument) { var obj=$find(fpID);if(obj)obj.hide(doCallback, argument); };
showFloatingPanel = function(fpID, doCallback, argument) { var obj=$find(fpID);if(obj)obj.show(doCallback, argument); };
expandFloatingPanel = function(fpID) { var obj=$find(fpID);if(obj)obj.expand(); };
collapseFloatingPanel = function(fpID) { var obj=$find(fpID);if(obj)obj.collapse(); };
dockFloatingPanel = function(fpID) { var obj=$find(fpID);if(obj)obj.dock(); };
undockFloatingPanel = function(fpID) {var obj=$find(fpID);if(obj)obj.undock(); };
toggleFloatingPanelDockState = function(fpID) { var obj=$find(fpID);if(obj)obj.toggleDockState(); };
toggleFloatingPanelVisibility = function(fpID, doCallback, argument) {var obj=$find(fpID);if(obj)obj.toggleVisibility(doCallback, argument); };
toggleFloatingPanelState = function(fpID, fireServerSideExpandEvent, fireServerSideCollapseEvent) { var obj=$find(fpID);if(obj)obj.toggleState(fireServerSideExpandEvent, fireServerSideCollapseEvent); };
showFloatingPanelFrame = function(fpID) { var obj=$find(fpID);if(obj)obj.showFrame(); };
hideFloatingPanelFrame = function(fpID) { var obj=$find(fpID);if(obj)obj.hideFrame(); };
esriMoveDockedFloatingPanelUp = function(fpID) { var obj=$find(fpID);if(obj)obj.moveDockedUp(); };
esriMoveDockedFloatingPanelDown = function(fpID) { var obj=$find(fpID);if(obj)obj.moveDockedDown(); };
esriMoveDockedFloatingPanelTop = function(fpID) { var obj=$find(fpID);if(obj)obj.moveDockedToTop(); };
esriMoveDockedFloatingPanelBottom = function(fpID) { var obj=$find(fpID);if(obj)obj.moveDockedToBottom(); };
FloatingPanelObject = function(fpID, transparency, callbackFunctionString, expandedImage, collapsedImage, dockedImage, undockedImage, dockedContextMenuID, dockParent, forcePNG, docked) {
	return $create(ESRI.ADF.UI.FloatingPanel, {
			"transparency":transparency,
			"callbackFunctionString":callbackFunctionString,
			"expandedImage": expandedImage, "collapsedImage": collapsedImage,
			"dockedImage": dockedImage, "undockedImage": undockedImage,
			"dockedContextMenuID": dockedContextMenuID, "dockParent": dockParent,
			"forcePNG":forcePNG, "isDocked":docked} ,null,null,$get(fpID));
};

// Required to fix IE bug that hides the titlebar background image after move
// All floatingpanels are done here because possible subpanels may be affected.
function resetAllTitleBarBackgroundImages() {
	if (ESRI.ADF.System.__isIE6) {
		for (var i=0;i<ESRI.ADF.UI._FloatingPanels.length;i++) {
			var fp=ESRI.ADF.UI._FloatingPanels[i];
			if (fp!=null && fp.get_id().length>0) {
				var fpTitle=$get(fp.get_id()+'_Title');
				if (fpTitle!=null && fpTitle.style!=null) {
					fpTitle.style.backgroundImage=fpTitle.style.backgroundImage;
				}
			}
		}
	}
}

function hideAllFloatingPanels() {
	for (var i=0;i<ESRI.ADF.UI._FloatingPanels.length;i++) {
		var fp=ESRI.ADF.UI._FloatingPanels[i];
		if (fp!=null && fp.get_id().length>0) {
			fp.hide();
		}
	}
}

function esriGetNextSibling(element)
{
	if (element==null)return null;
	var p=element.parentNode;
	var sib=element.nextSibling;
	while(sib!=null)
	{
		if (sib.nodeType==1 && sib.clientHeight>0)
		{
			// make sure it is a floating panel
			if ($find(sib.id)!=null) return sib;
		}
		sib=sib.nextSibling;
	}
return null;
}
function esriGetPreviousSibling(element)
{
	if (element==null)return null;
	var p=element.parentNode;
	var sib=element.previousSibling;
	while(sib!=null)
	{
		if (sib.nodeType==1 && sib.clientHeight>0)
		{
			// make sure it is a floating panel
			if ($find(sib.id)!=null) return sib;
		}
		sib=sib.previousSibling;
	}
	return null;
}
function esriGetFirstSibling(element)
{
	if (element==null)return null;
	var p=element.parentNode;
	if (p==null) return null;
	if (p.childNodes==null) return null;
	for (var i=0; i<p.childNodes.length; i++)
	{
		var sib=p.childNodes[i];
		if (sib==null)continue;
		if (sib.nodeType==1 && sib.clientHeight>0)
		{
			// make sure it is a floating panel
			if ($find(sib.id)!=null) return sib;
		}
	}
	return null;
}

// ie 6 select box workaround (windowed controls)
// and workaround for background image on the title bar disappearing.
function ie6Workarounds(fpID)
{ 
	if (ESRI.ADF.System.__isIE6)
	{
		var fp=$get(fpID)
		if (fp==null)return;
	    
		// workaround for ie bug that makes the background image disappear
		var titleBarRow= $get(fpID + '_Title');
		if (titleBarRow!=null) titleBarRow.style.backgroundImage=titleBarRow.style.backgroundImage;
	    
		var ifrmID = fpID + "_BackgroundIFrame";
		var ifrm = $get(ifrmID);
		// create background iframe if it doesn't exist
		if (ifrm==null)
		{
			ifrm=document.createElement('iframe');
			ifrm.id=ifrmID;
			ifrm.style.position="absolute";
			ifrm.src="javascript:false;";
			ifrm.frameborder="0";
			ifrm.scrolling="no";
			ifrm.style.margin="0px";
			ifrm.style.display="none";
			ifrm.style.padding="0px";
			ifrm.style.filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';
			document.body.appendChild(ifrm);
		}
	    
		if (fp.style.position=="absolute")
		{
			ifrm.style.zIndex=fp.style.zIndex-1;
			ifrm.style.width=fp.offsetWidth;
			ifrm.style.height=fp.offsetHeight;
			ifrm.style.top=fp.style.top;
			ifrm.style.left=fp.style.left;
			ifrm.style.display=fp.style.display;   
		}
		else
		{
			ifrm.style.zIndex=fp.style.zIndex-1;
			ifrm.style.width="0px";
			ifrm.style.height="0px";
			ifrm.style.top="0px";
			ifrm.style.left="0px";
			ifrm.style.display="none";
		}
	}
	return false; 
}

function ie6SaveCheckboxState(fp)
{
	if (ESRI.ADF.System.__isIE6)
	{
		if (fp==null)return;
		var cbs=fp.getElementsByTagName('input');
		if (cbs==null)return;
		for (var i=0; i<cbs.length; i++)
		{
			var cb = cbs[i];
			if (cb==null)continue; 
			if (cb.type!='checkbox')continue;
			cb.savedCheckedState=cb.checked;
		}
	}
}

function ie6RetrieveCheckboxState(fp)
{
	if (ESRI.ADF.System.__isIE6)
	{
		if (fp==null)return;
		var cbs=fp.getElementsByTagName('input'); 
		if (cbs==null)return;
		for (var i=0; i<cbs.length; i++)
		{
			var cb = cbs[i];
			if (cb==null)continue; 
			if (cb.type!='checkbox')continue;
			if (cb.savedCheckedState!=null)
				cb.checked=cb.savedCheckedState;
		}
	}
}