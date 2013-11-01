/*
COPYRIGHT 1995-2003 ESRI

TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
Unpublished material - all rights reserved under the 
Copyright Laws of the United States.

For additional information, contact:
Environmental Systems Research Institute, Inc.
Attn: Contracts Dept
380 New York Street
Redlands, California, USA 92373

email: contracts@esri.com
*/
///////////////////////////////////// Common Functions /////////////////////////////////////
function ToolbarCreation(name, toolbarStyle, defaultStyle, selectedStyle, hoverStyle, disabledStyle, tools, commands, buddyControls, itemArray, group, currentToolField)
{
	this.Name = name;
	this.ToolbarStyle = toolbarStyle;
	this.DefaultStyle = defaultStyle;
	this.SelectedStyle = selectedStyle;
	this.HoverStyle = hoverStyle;
	this.DisabledStyle = disabledStyle;
	this.Tools = 	tools.split(",");
	this.Commands = commands.split(",");
	if (buddyControls != "")
		this.BuddyControls = buddyControls.split(",");
	else
		this.BuddyControls = null;
	this.Items = itemArray;
	this.Group = group;
	this.CurrentToolField = currentToolField;
}

function ToolbarGroupCreation(name, toolbars)
{
	this.Name = name;
	this.Toolbars = toolbars.split(",");;
}

function ToolbarItemCreation(name, defaultImage, selectedImage, hoverImage, disabledImage, clientToolAction, isClientToolActionCustom, showLoading, disabled)
{
	this.Name = name;
	this.DefaultImage = defaultImage;
	this.SelectedImage = selectedImage;
	this.HoverImage = hoverImage;
	this.DisabledImage = disabledImage;
	this.ClientToolAction = clientToolAction;
	this.IsClientToolActionCustom = isClientToolActionCustom;
	this.ShowLoading = showLoading;
	this.Disabled = disabled;
}
///////////////////////////////////// Common Functions /////////////////////////////////////

///////////////////////////////////// Mouse Action Functions /////////////////////////////////////
function ToolbarMouseDown(toolbarName, toolbarItemName, buttonType, e)
{
	 if (!isLeftButton(e))
			return;
		
	var f = document.forms[docFormID];
	var imageTag = toolbarName + toolbarItemName + "Image";
	var cell = toolbarName + toolbarItemName;
	var toolbar = Toolbars[toolbarName];
	var isTool = (buttonType == "Tool");
	if (isTool)
	{
	  //change toolbar's selected tool
		f.elements[toolbar.CurrentToolField].value = toolbarItemName;
		//ClientToolAction for each buddy control
		var clientAction =  toolbar.Items[toolbarItemName].ClientToolAction;
		if (clientAction != null)
		{
			var clientActions = "";
		  if (!toolbar.Items[toolbarItemName].IsClientToolActionCustom)
		  {
				var buddies = toolbar.BuddyControls;
				if (buddies != null)
				{
					for (var i = 0; i < buddies.length; i++)
					{
						var modeField = buddies[i] + "_mode";
						f.elements[modeField].value = toolbarItemName;
						clientActions = clientActions + clientAction + " ( '" + buddies[i] + "' , '" + toolbarItemName + "', " + toolbar.Items[toolbarItemName].ShowLoading + "); ";
					}
				}
			}
			else
			{
				clientActions = clientAction;
			}
			var clientActionFunction = new Function(clientActions);
			clientActionFunction.call(null);
			//select this tool and unselect others
			toolbarSelectTool(toolbarName);
			toolbarRefreshGroup(toolbarName);
		}
	}
	else
	{
		//Postback to Toolbar so that it can call the CommandClick event handler
		__doPostBack(toolbarName, toolbarItemName);
		if (toolbar.Items[toolbarItemName].ShowLoading) ShowLoading();
		document.body.style.cursor = "wait";
		//reset toolbar images: IE does not refresh toolbar properly if this is not done.
		toolbarRefreshCommands(toolbarName);
		toolbarSelectTool(toolbarName);
		//set selected style and image
		var cellElement = document.getElementById(cell);
		cellElement.style.cssText = toolbar.SelectedStyle;
		if (toolbar.ToolbarStyle != "TextOnly")
		{
			var img = document.images[imageTag];
			if (img != null) img.src = toolbar.Items[toolbarItemName].SelectedImage;
		}
	}
}

function ToolbarMouseOver(toolbarName, toolbarItemName)
{	
	var imageTag = toolbarName + toolbarItemName + "Image";
	var cell = toolbarName + toolbarItemName;
	var toolbar = Toolbars[toolbarName];				
	var f = document.forms[docFormID];	
  var cellElement = document.getElementById(cell);
	cellElement.style.cssText = toolbar.HoverStyle;
	if (toolbar.ToolbarStyle != "TextOnly")
	{
		var img = document.images[imageTag];
		if (img != null) img.src = toolbar.Items[toolbarItemName].HoverImage;
	}
}

function ToolbarMouseOut(toolbarName, toolbarItemName) 
{
	var toolbar = Toolbars[toolbarName];
	var control = toolbar.Tools[0];
	var f = document.forms[docFormID];
	var mode = f.elements[toolbar.CurrentToolField].value;
	var imageTag = toolbarName + toolbarItemName + "Image";
	var cell = toolbarName + toolbarItemName;
	
	var style, image;
	if (mode == toolbarItemName) 
	{
		style = toolbar.SelectedStyle;
		image = toolbar.Items[toolbarItemName].SelectedImage;
	}
	else
	{
	style = toolbar.DefaultStyle;
	image = toolbar.Items[toolbarItemName].DefaultImage;
	}
	
	var cellElement = document.getElementById(cell);
	cellElement.style.cssText = style;
	if (toolbar.ToolbarStyle != "TextOnly")
	{
		var img = document.images[imageTag];
		if (img != null) img.src = image;
	}
}

function toolbarSelectTool(toolbarName)
{
	var f = document.forms[docFormID];
 	var toolbar = Toolbars[toolbarName];
	var mode = f.elements[toolbar.CurrentToolField].value;
	var	selectedStyle = toolbar.SelectedStyle;
	var disabledStyle = toolbar.DisabledStyle;
	var	style = toolbar.DefaultStyle;
	var tools = toolbar.Tools;
	var toolbarItemName,imageTag,cell;
	if (tools == null)
	  return;
	for (var i = 0; i < tools.length; i++)
	{
		toolbarItemName = tools[i];
		if (toolbarItemName == "")
			continue;
		imageTag = toolbarName + toolbarItemName + "Image";
		cell = toolbarName + toolbarItemName;
		var toolbarItem = toolbar.Items[toolbarItemName];
		var cellElement = document.getElementById(cell);
		if (mode == toolbarItemName) 
		{ //selected
			cellElement.style.cssText = selectedStyle;
			if (toolbar.ToolbarStyle != "TextOnly")
			{
				var img = document.images[imageTag];
				if (img != null) img.src = toolbarItem.SelectedImage;
			}
		}
		else if (toolbarItem.Disabled)
		{
			cellElement.style.cssText = disabledStyle;
			if (toolbar.ToolbarStyle != "TextOnly")
			{
				var img = document.images[imageTag];
				if (img != null) img.src = toolbarItem.DisabledImage;
			}
		}
		else
		{//not selected or disabled
			cellElement.style.cssText = style;
			if (toolbar.ToolbarStyle != "TextOnly")
			{
				var img = document.images[imageTag];
				if (img != null) img.src = toolbarItem.DefaultImage;
			}
		}
	}
}

function toolbarRefreshGroup(toolbarName)
{
 	var toolbar = Toolbars[toolbarName];
	//refresh other toolbars in group
	var group = toolbar.Group;
	if (group == null || group == "")
	 return;	 
	var toolbarGroup = ToolbarGroups[group];
	if (toolbarGroup == null)
		return;
	var toolbars = toolbarGroup.Toolbars;
	if (toolbars == null)
		return;
	for (var x = 0; x < toolbars.length; ++x)
	{
		if (toolbars[x] != toolbarName)
		{
		 toolbarSelectTool(toolbars[x]);
		 }
	}
}

function toolbarRefreshCommands(toolbarName)
{
	var f = document.forms[docFormID];
 	var toolbar = Toolbars[toolbarName];
	var	style = toolbar.DefaultStyle;
	var disabledStyle = toolbar.DisabledStyle;
	var commands = toolbar.Commands;
	var toolbarItemName,imageTag,cell;
	for (var i = 0; i < commands.length; i++)
	{
		toolbarItemName = commands[i];
		imageTag = toolbarName + toolbarItemName + "Image";
		cell = toolbarName + toolbarItemName;
		var toolbarItem = toolbar.Items[toolbarItemName];
		var cellElement = document.getElementById(cell);
		if (toolbarItem.Disabled)
		{
			cellElement.style.cssText = disabledStyle;
			if (toolbar.ToolbarStyle != "TextOnly")
			{
				var img = document.images[imageTag];
				if (img != null) img.src = toolbarItem.DisabledImage;
			}
		}
		else
		{//not selected or disabled
			cellElement.style.cssText = style;
			if (toolbar.ToolbarStyle != "TextOnly")
			{
				var img = document.images[imageTag];
				if (img != null) img.src = toolbarItem.DefaultImage;
			}
		}
	}
}
///////////////////////////////////// Mouse Action Functions /////////////////////////////////////

