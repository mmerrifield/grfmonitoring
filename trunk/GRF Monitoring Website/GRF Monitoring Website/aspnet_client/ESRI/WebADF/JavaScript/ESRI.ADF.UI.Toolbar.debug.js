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

Type.registerNamespace('ESRI.ADF.UI');

var Toolbars = [];
var ToolbarGroups = [];
var ToolbarName = [];


ESRI.ADF.UI.Toolbar = function(element) { 
	/// <summary>
	/// Toolbar is a control for manipulating a map control.
	/// </summary>
	ESRI.ADF.UI.Toolbar.initializeBase(this, [element]);
	this._map = null;
	this._buddies = null;
	this._enabled = false;
	this._toolbarExtentChangedHandler = Function.createDelegate(this,this._toolbarExtentChanged);
}
ESRI.ADF.UI.Toolbar.prototype = {
	dispose : function() {
		/// <summary>
		/// Dispose the control
		/// </summary>
		$clearHandlers(this._element);
		this._clearBuddyHandlers();
		ESRI.ADF.UI.Toolbar.callBaseMethod(this, 'dispose');
	},
	_setupBuddyHandlers : function() {	
		// Listen for extent changed events from the map controls. This is so that if the extent
		// changes, we can update it with the back and forward buttons.
		if (this._buddies != null) {
			for (var i=0; i < this._buddies.length; i++) {
				var component = $find(this._buddies[i]);
				if (component != null && ESRI.ADF.UI.MapBase.isInstanceOfType(component)) {
					component.add_extentChanged(this._toolbarExtentChangedHandler);
				}
			}
			// To indicate that event handlers are established so they can be removed
			this._enabled = true;
		}
	},
	_clearBuddyHandlers : function() {
		if (this._enabled && this._buddies != null) {
			for (var i=0; i < this._buddies.length; i++)
			{
				var map = $find(this._buddies[i]);
				if (map != null && ESRI.ADF.UI.MapBase.isInstanceOfType(map)) {
					map.remove_extentChanged(this._toolbarExtentChangedHandler);
				}
			}
			this._enabled = false;
		}
	},
	_toolbarExtentChanged : function(sender, eventArgs) {
		/// <summary>
		/// Handle the extent changed event, generated by the map, which is used by Back and Forward Buttons.
		/// </summary>
		/// <param name="sender" type="object">map control.</param>
		/// <param name="eventArgs" type="string">event arguments.</param>
		var map = sender;
		var toolbar = Toolbars[this.get_element().id];
		if (toolbar == null) return;
		// enable Back button
		var backButton = toolbar.items[toolbar.btnMapBack];
		if (backButton) { backButton.disabled = false; }
		var forwardButton = toolbar.items[toolbar.btnMapForward];
		if (forwardButton) { forwardButton.disabled = true; }
		toolbar.refreshCommands();
	},
	toolbarMapHistory : function(toolbarID, mapIDs, toolbarItemName, step) {
		/// <summary>
		/// Handle the extent changed event, generated by the map, which is used by Back and Forward Buttons.
		/// </summary>
		/// <param name="mapIDs" type="string">Buddy controls Map IDs.</param>
		/// <param name="ToolbarID" type="string">Toolbar ID.</param>
		/// <param name="toolbarItemName" type="String">Toolbar item name.</param>
		/// <param name="step" type="int">history increment. negative for backward. positive for forward.</param>
		var toolbar = Toolbars[toolbarID];
		if (toolbar == null) return;
		var moreHistory = false;
		var toolbarBuddies = mapIDs.split(",");
		for (var i = 0; i < toolbarBuddies.length; i++) {
			// Each buddy Map control
			var map = $find(toolbarBuddies[i]);
			if (map) { moreHistory = map.stepExtentHistory(step); }
			
			if (step < 0)
			{	// Back Button Pressed.
				var backButton = toolbar.items[toolbarItemName];
				var forwardButton = toolbar.items[backButton.buddyItem];
				//enable Forward button
				if (forwardButton) { forwardButton.disabled = false; }
				if (!moreHistory) { backButton.disabled = true; }
			}
			else
			{	// Forward Button Pressed.
				var forwardButton = toolbar.items[toolbarItemName];
				var backButton = toolbar.items[forwardButton.buddyItem];
				// enable Back button
				if (backButton) { backButton.disabled = false; }
				if (!moreHistory) { forwardButton.disabled = true; }
				else { forwardButton.disabled = false; }
			}
		}
		toolbar.refreshCommands();
	},
	doCallback : function(argument, context) {
		/// <summary>
		/// Performs a callback or partial postback depending on it's postback mode
		/// </summary>
		/// <param name="argument" type="String">The argument parsed back to the server control</param>
		/// <param name="context" type="string">The context of this callback</param>
		ESRI.ADF.System._doCallback(this._callbackFunctionString, this.get_uniqueID(), this.get_element().id, argument, context);
	},
	processCallbackResult : function(action, params)
	{
	},
	get_callbackFunctionString : function ()
	{	/// <field type="String" mayBeNull="false">
		/// The callback string used to process a server side callback.
		/// </field>
		return this._callbackFunctionString;
	},
	set_callbackFunctionString : function(value)
	{
		if (this._callbackFunctionString != value) {
			this._callbackFunctionString = value;
			this.raisePropertyChanged('callbackFunctionString');
		}
	},
	//
	// Properties
	//
	get_uniqueID : function ()
	{	/// <field type="String" mayBeNull="false">
		/// The unique ID value of this control.
		/// </field>
		return this._uniqueID;
	},
	set_uniqueID : function(value)
	{
		if (this._uniqueID != value) {
			this._uniqueID = value;
			this.raisePropertyChanged('uniqueID');
		}
	},	
	get_buddies : function ()
	{	/// <field type="Array" elementType="String">
		/// Buddy controls for this map
		/// </field>
		return this._buddies;
	},
	set_buddies : function(value)
	{
		if (this._buddies != value) {
			this._buddies = value;
			this._setupBuddyHandlers();
			this.raisePropertyChanged('buddies');
		}
	},
	get_map : function () {
		/// <field type="Sys.Component">
		/// This is just a dummy property for setting up buddy controls at the second createComponent pass
		/// </field>
	},
	set_map : function(value)
	{
		this._setupBuddyHandlers();
	},
	add_onToolSelected : function(handler)
	/// <summary>Fired when a tool is selected in the Toolbar</summary>
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
	/// 				<td>ESRI.ADF.UI.Toolbar</td>
	/// 				<td>Toolbar containing the selected tool</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.tool</td>
	/// 				<td>Tool JSON object</td>
	/// 				<td>A simple JSON object encapsulating the properties of the selected tool</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
	{
	    this.get_events().addHandler('onToolSelected', handler);
	},
	remove_onToolSelected : function(handler)
	{
	    this.get_events().removeHandler('onToolSelected', handler);
	}
}
ESRI.ADF.UI.Toolbar.registerClass('ESRI.ADF.UI.Toolbar', Sys.UI.Control);


var esriClientActionFunction = null;

///////////////////////////////////// Object Creation Functions /////////////////////////////////////
function ToolbarGroupObject(name, toolbars)
{
	this.name = name;
	this.toolbars = toolbars.split(",");;
}

function ToolbarItemObject(name, defaultImage, selectedImage, hoverImage, disabledImage, 
	clientAction, isClientActionCustom, showLoading, disabled, buddyItem, selectAutoPostBack, cursor)
{
	this.name = name;
	this.defaultImage = defaultImage;
	this.selectedImage = selectedImage;
	this.hoverImage = hoverImage;
	this.disabledImage = disabledImage;
	this.clientAction = clientAction;
	this.isClientActionCustom = isClientActionCustom;
	this.showLoading = showLoading;
	this.disabled = disabled;
	this.buddyItem = buddyItem;
	this.selectAutoPostBack = selectAutoPostBack;
	this.cursor = cursor;
	this.preExecFunction = null;
}

function ToolbarObject(name, toolbarStyle, defaultStyle, selectedStyle, hoverStyle, disabledStyle, tools, commands, buddyControls, itemArray, group, currentToolField, callbackFunctionString)
{
	this.name = name;
	this.toolbarStyle = toolbarStyle;
	this.defaultStyle = defaultStyle;
	this.selectedStyle = selectedStyle;
	this.hoverStyle = hoverStyle;
	this.disabledStyle = disabledStyle;
	this.tools = 	tools.split(",");
	this.commands = commands.split(",");
	if (buddyControls != "")
		this.buddyControls = buddyControls.split(",");
	else
		this.buddyControls = null;
	this.items = itemArray;
	this.group = group;
	this.currentToolField = currentToolField;
	this.enableClientPostBack = false;
	this.pageID = "";
	this.buttonsSupportingClientPostBack = "";
	this.document = document;
	this.btnMapBack = "";
	this.btnMapForward = "";
	
	if (callbackFunctionString!=null) 
	    this.callBackFunctionString = callbackFunctionString;
	else
	    this.callBackFunctionString = null;
	    
	for (var i = 0; i < this.tools.length; i++)
	{
		var toolbarItemName = this.tools[i];
		if (toolbarItemName == "")
			continue;
		var imageTag = this.name + toolbarItemName + "Image";
		var img = document.images[imageTag];
		if (img != null)
			ESRI.ADF.System.setIEPngTransparency(img,img.src,true);
	}
    
	for (var i = 0; i < this.commands.length; i++)
	{
		var toolbarItemName = this.commands[i];
		if (toolbarItemName == "")
			continue;
		var imageTag = this.name + toolbarItemName + "Image";
		var img = document.images[imageTag];
		if (img != null)
		    ESRI.ADF.System.setIEPngTransparency(img,img.src,true);
	}
		
	this.selectTool = function()
	{
		var f = document.forms[docFormID];
		var mode = f.elements[this.currentToolField].value;
		var	selectedStyle = this.selectedStyle;
		var disabledStyle = this.disabledStyle;
		var	style = this.defaultStyle;
		var tools = this.tools;
		var toolbarItemName,imageTag,cell;
		if (tools == null)
			return;
		for (var i = 0; i < tools.length; i++)
		{
			toolbarItemName = tools[i];
			if (toolbarItemName == "")
				continue;
			imageTag = this.name + toolbarItemName + "Image";
			cell = this.name + toolbarItemName;
			var toolbarItem = this.items[toolbarItemName];
			var cellElement = document.getElementById(cell);
			if ( cellElement == null || cellElement.style.display == "none")
			    continue;
			if (mode == toolbarItemName) 
			{ //selected
				cellElement.style.cssText = selectedStyle;
				if (this.toolbarStyle != "TextOnly")
				{
					var img = document.images[imageTag];
					switchImageSourceAndAlphaBlend(img,toolbarItem.selectedImage);
				}
			}
			else if (toolbarItem.disabled)
			{
				cellElement.style.cssText = disabledStyle;
				if (this.toolbarStyle != "TextOnly")
				{
					var img = document.images[imageTag];
					switchImageSourceAndAlphaBlend(img,toolbarItem.disabledImage);
				}
			}
			else
			{//not selected or disabled
				cellElement.style.cssText = style;
				if (this.toolbarStyle != "TextOnly")
				{
					var img = document.images[imageTag];
					switchImageSourceAndAlphaBlend(img,toolbarItem.defaultImage);
				}
			}
		}
	}
	
	this.refreshGroup = function()
	{
		//refresh other toolbars in group
		var group = this.group;
		if (group == null || group == "")
		return;	 
		var toolbarGroup = ToolbarGroups[group];
		if (toolbarGroup == null)
			return;
		var toolbars = toolbarGroup.toolbars;
		if (toolbars == null)
			return;
		for (var x = 0; x < toolbars.length; ++x)
		{
			if (toolbars[x] != this.name)
			{
				Toolbars[toolbars[x]].selectTool();
			}
		}
	}
	
	this.refreshCommands = function()
	{
		var f = document.forms[docFormID];
		var	style = this.defaultStyle;
		var disabledStyle = this.disabledStyle;
		var commands = this.commands;
		var toolbarItemName,imageTag,cell;
		for (var i = 0; i < commands.length; i++)
		{
			toolbarItemName = commands[i];
			imageTag = this.name + toolbarItemName + "Image";
			cell = this.name + toolbarItemName;
			var toolbarItem = this.items[toolbarItemName];
			if (!toolbarItem)
			    continue;
			var cellElement = document.getElementById(cell);
			if ( cellElement == null || cellElement.style.display == "none")
			    continue;
			if (toolbarItem.disabled)
			{
				cellElement.style.cssText = disabledStyle;
				if (this.toolbarStyle != "TextOnly")
				{
					var img = document.images[imageTag];
					switchImageSourceAndAlphaBlend(img,toolbarItem.disabledImage);
				}
			}
			else
			{//not selected or disabled
				cellElement.style.cssText = style;
				if (this.toolbarStyle != "TextOnly")
				{
					var img = document.images[imageTag];
					switchImageSourceAndAlphaBlend(img,toolbarItem.defaultImage);
				}
			}
		}
	}
}

///////////////////////////////////// Object Creation Functions /////////////////////////////////////

///////////////////////////////////// Mouse Action Functions /////////////////////////////////////
function ToolbarMouseDown(toolbarName, toolbarItemName, buttonType, e)
{
	if (buttonType != "DropDownBox" && !isLeftButton(e))
		return;
	var f = document.forms[docFormID];
	var imageTag = toolbarName + toolbarItemName + "Image";
	var cell = toolbarName + toolbarItemName;
	var toolbar = Toolbars[toolbarName];
	var toolbarComp = $find(toolbarName);
	if (toolbar === null || toolbarComp===null) return;
	if (toolbar.items[toolbarItemName].disabled) { return; }

	if (buttonType == "Tool") {
		//change toolbar's selected tool
		f.elements[toolbar.currentToolField].value = toolbarItemName;
		//clientAction for each buddy control
		var clientAction =  toolbar.items[toolbarItemName].clientAction;
		if (clientAction != null) {
			var clientActions = "";
		    if (!toolbar.items[toolbarItemName].isClientActionCustom) {
				var buddies = toolbar.buddyControls;
				if (buddies != null) {
					for (var i = 0; i < buddies.length; i++)
					{
						var modeField = f.elements[buddies[i] + "_mode"];
						if (modeField != null)
							modeField.value = toolbarItemName;
						var cursor = toolbar.items[toolbarItemName].cursor;
						if (cursor != null)
							clientActions = clientActions + clientAction + " ( '" + buddies[i] + "' , '" + toolbarItemName + "', " + toolbar.items[toolbarItemName].showLoading + ",'" + cursor + "'); ";
						else
							clientActions = clientActions + clientAction + " ( '" + buddies[i] + "' , '" + toolbarItemName + "', " + toolbar.items[toolbarItemName].showLoading + "); ";
					}
				}
			}
			else
			{
				clientActions = clientAction;
			}
			//fire onSelect handler if set... fires before clientActions
			var tbObject = $find(toolbarName);
			if (tbObject!=null) {
                var handler = tbObject.get_events().getHandler('onToolSelected');
                if(handler) 
                    handler(tbObject,{"name": toolbarItemName, "tool": toolbar.items[toolbarItemName]});
			}
			if (toolbar.items[toolbarItemName].preExecFunction != null)
				clientActions += toolbar.items[toolbarItemName].preExecFunction;
    
			var clientActionFunction = new Function(clientActions);
			clientActionFunction.call(null);
			//select this tool and unselect others
			Toolbars[toolbarName].selectTool();
			Toolbars[toolbarName].refreshGroup();
		}
	}
	else if (buttonType == "Command")
	{
		if (toolbar.items[toolbarItemName].preExecFunction != null)
			eval(toolbar.items[toolbarItemName].preExecFunction);

		//if (toolbar.items[toolbarItemName].showLoading) showLoading();
		document.body.style.cursor = "wait";
		//reset toolbar images: IE does not refresh toolbar properly if this is not done.
		Toolbars[toolbarName].refreshCommands();
		Toolbars[toolbarName].selectTool();
		var toolbarComp = $find(toolbarName);
		//set selected style and image
		var cellElement = document.getElementById(cell);
		cellElement.style.cssText = toolbar.selectedStyle;
		if (toolbar.toolbarStyle != "TextOnly")
		{
			var img = document.images[imageTag];
			switchImageSourceAndAlphaBlend(img,toolbar.items[toolbarItemName].selectedImage);
		}
		cellElement.focus(); // Allow pending onchange event to fire
		var clientAction =  toolbar.items[toolbarItemName].clientAction;
		if (clientAction != null && clientAction.length>0) {
			esriClientActionFunction = clientAction;
			window.setTimeout("eval(esriClientActionFunction);", 0);
		}
		else {
			var arg = 'eventArg='+toolbarItemName+'&ControlID='+toolbarName+'&ControlType=Toolbar&PageID='+toolbar.pageID;
			toolbarComp.doCallback(arg,toolbarComp);
		}

		document.body.style.cursor = "default";
	}
	else if (buttonType == "DropDownBox")
	{
		var selectDropDown = toolbarName + toolbarItemName + "DropDownBox";
		var selectValueField = toolbarName + toolbarItemName + "Value";
		//f.elements[selectValueField].value = f.elements[selectDropDown].value;
		var arg = 'eventArg='+toolbarItemName+'&ControlID='+toolbarName+'&ControlType=Toolbar&PageID='+toolbar.pageID+'&'+selectValueField+'='+f.elements[selectDropDown].value;
		toolbarComp.doCallback(arg,toolbarComp);
	}
}

function ToolbarMouseOver(toolbarName, toolbarItemName)
{
	var imageTag = toolbarName + toolbarItemName + "Image";
	var cell = toolbarName + toolbarItemName;
	var toolbar = Toolbars[toolbarName];
	if (toolbar == null) return;

	var f = document.forms[docFormID];	
	var cellElement = document.getElementById(cell);
	if (toolbar.items[toolbarItemName].disabled)
		cellElement.style.cssText = toolbar.disabledStyle;
	else
		cellElement.style.cssText = toolbar.hoverStyle;
	
	if (toolbar.toolbarStyle != "TextOnly")
	{
		var img = document.images[imageTag];
		if (toolbar.items[toolbarItemName].disabled)
			switchImageSourceAndAlphaBlend(img,toolbar.items[toolbarItemName].disabledImage);
		else
			switchImageSourceAndAlphaBlend(img,toolbar.items[toolbarItemName].hoverImage);
	}
}

function ToolbarMouseOut(toolbarName, toolbarItemName) 
{
	var toolbar = Toolbars[toolbarName];
	if (toolbar == null) return;
	var control = toolbar.tools[0];
	var f = document.forms[docFormID];
	var mode = f.elements[toolbar.currentToolField].value;
	var imageTag = toolbarName + toolbarItemName + "Image";
	var cell = toolbarName + toolbarItemName;
	
	var style, image;
	if (mode == toolbarItemName) 
	{
		style = toolbar.selectedStyle;
		image = toolbar.items[toolbarItemName].selectedImage;
	}
	else
	{
		style = toolbar.defaultStyle;
		image = toolbar.items[toolbarItemName].defaultImage;
	}
	
	if (toolbar.items[toolbarItemName].disabled)
	{
		style = toolbar.disabledStyle;
		image = toolbar.items[toolbarItemName].disabledImage;
	}

	var cellElement = document.getElementById(cell);
	cellElement.style.cssText = style;
	if (toolbar.toolbarStyle != "TextOnly")
	{
		var img = document.images[imageTag];
		switchImageSourceAndAlphaBlend(img,image);
	}
}



if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
