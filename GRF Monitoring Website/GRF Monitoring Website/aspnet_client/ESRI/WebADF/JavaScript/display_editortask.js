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

ESRI.ADF.Editor = function()
{
	this._map = null;
    this._snapTip = null;
    this._uniqueID = null;
    this._callbackFunctionString = null;
    this._msgs = {};
    ESRI.ADF.Editor.initializeBase(this);
}

ESRI.ADF.Editor.prototype = {
    initialize : function() {
        ESRI.ADF.Editor.callBaseMethod(this, 'initialize');
        this._map.add_onServerRequest(onMapRequest);
    },
    get_map : function() {
        /// <value type="ESRI.ADF.UI.MapBase">
        /// Map javascript object used by Editor.
        /// </value>
	    return this._map;
	},
	set_map : function(value) {
	    if(this.get_isInitialized()) {
	        throw Error.invalidOperation("You can't do that now!");
	    }
	    this._map = value;
	},
    get_snapTip : function() {
        /// <value type="ESRI.ADF.SnapTip">
        /// SnapTip javascript object used by Editor.
        /// </value>
	    return this._snapTip;
	},
    set_snapTip : function(value) {
	    this._snapTip = value;
	},
    get_msgs : function() {
        /// <value type="Array">
        /// Localized messages used by Editor.
        /// </value>
        return this._msgs;
    },
    set_msgs : function(value) {
        this._msgs = value;
    },
    _enableSnapTips: function() {
        if (this._snapTip != null)
            this._snapTip.enable();        
    },
    _disableSnapTips: function() {
        if (this._snapTip != null)
            this._snapTip.disable();
    },
    _showSnapCircle: function(show, callbackFunctionString) {
        if (this._snapTip != null)
            this._snapTip.set_showCircle(show);

        var argument = "EventArg=ShowCircle&show=" + show;
        var context = null;
        eval(callbackFunctionString);
    },
    _addMapPoint : function (panelID, last) {
        var ge = this._map.graphicsEditor;
        if (ge) {
            var x = document.getElementById('editor_xvalue').value;
            var y = document.getElementById('editor_yvalue').value;
            
            if (x != null && y != null)
            {
                // use javascript decimal delimiter
                var xjs = x;
                var yjs = y;
                
                if (esriJavaScriptDecimalDelimiter != esriSystemDecimalDelimiter)
                {
                    xjs = xjs.replace(esriSystemDecimalDelimiter, esriJavaScriptDecimalDelimiter);
                    yjs = yjs.replace(esriSystemDecimalDelimiter, esriJavaScriptDecimalDelimiter);
                }
                
                var panel = document.getElementById(panelID);
                panel.disabled = true;
                
                // remove commas and parse
                var regEx = /,/g;
                xjs = xjs.replace(regEx,''); xjs = parseFloat(xjs);
                yjs = yjs.replace(regEx,''); yjs = parseFloat(yjs);
                
                if (isNaN(xjs) == false && isNaN(yjs) == false) {
                    ge.__addPoint(new ESRI.ADF.Geometries.Point(xjs,yjs));
                    if (last) {
                        try {ge.__completeEditing();}
                        catch (err) {}
                        hideFloatingPanel(panelID,false);
                    }
                }
                else {
                    alert(this._msgs.badCoords);
                }
                
                panel.disabled = false;
            }        
        }
        else {
            alert(this._msgs.noActiveTool);
        }     
    },
    _stopEditing : function() {
        this._disableSnapTips();
        editorStopEditing(this._map.get_id());
    },
    doCallback : function(argument, context) {
		/// <summary>
		/// Performs a callback or partial postback depending on it's postback mode
		/// </summary>
		/// <param name="argument" type="String">The argument parsed back to the server control</param>
		/// <param name="context" type="string">The context of this callback</param>
		/// <returns />   
		ESRI.ADF.System._doCallback(this._callbackFunctionString, this.get_uniqueID(), this.get_id(), argument, context);
    },
	processCallbackResult : function(action, params) {
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
		return this._snapTip.processCallbackResult(action, params);
	},
	get_uniqueID : function() {
		/// <value name="uniqueID" type="String">Gets or sets the unique ID used to identify the control serverside</value>
		return this._uniqueID;
	},
	set_uniqueID : function(value) {
		this._uniqueID = value;
	},
	get_callbackFunctionString : function() {
		/// <value name="callbackFunctionString" type="String">Gets or sets the callback function string used to call back to the serverside control.</value>
		/// <remarks>
		/// Executing the callbackfunctionstring will either generate a partial postback or a callback to the server, depending on the current AJAX mode.
		/// To perform a call to the servercontrol, use the <see cref="doCallback"/> method of this instance.
		/// </remarks>
		return this._callbackFunctionString;
	},
	set_callbackFunctionString : function(value) {
		this._callbackFunctionString = value;
	},    
    dispose: function() {
   		ESRI.ADF.Editor.callBaseMethod(this, 'dispose');
   	}
}

ESRI.ADF.Editor.registerClass('ESRI.ADF.Editor', Sys.Component);

var EditorToolbars = {};
var EditorState = {shapeType:"",selCount:0,undos:false,redos:false,edits:false};
var EdMainTB = null;

function EditorTool(name, shapeType, minSel, preExec)
{
    this.name = name;
    this.shapeType = shapeType;
    this.minSel = minSel;
    this.state = "enabled";
    this.preExec = preExec;
    this.initialized = false;
}

function EditorToolbar(name, mapID)
{
    this.name = name;
    this.mapID = mapID;
    this.tools = {};
    this.hasNonEdTool = false;
}

function CreateEditorToolbar(name, mapID)
{
    var toolbar = new EditorToolbar(name, mapID);
    EditorToolbars[name] = toolbar;
       
    // Add tools
    var a = arguments;
    for (var i = 2; i < a.length; )
    {
        var tool = new EditorTool(a[i++], a[i++], a[i++], a[i++]);
        toolbar.tools[tool.name] = tool;
        
        if (tool.name == "SaveEdits")
            EdMainTB = toolbar;
    }
}

function refreshToolbars(mapID, shapeType, selCount, layerChanged, undos, redos, edits)
{
    var map = Maps[mapID];
    if (map != null)
    {
        var tool = map.__activeToolMode;
        if (tool == "CreateFeature")
        {
            if (layerChanged)
            {
                // Deselect tool
                editorTaskselectedSwatch = "";

                // Set pan tool    
                MapDragImage(mapID, 'Pan', false);
                
                DisableSnapTips(mapID);
            }
        }
        
        if (EdMainTB != null)
        {
            if (undos != EditorState.undos)
            {
                EditorState.undos = undos;
                if (undos) EnableTool(EdMainTB,EdMainTB.tools["Undo"]);
                else DisableTool(EdMainTB,EdMainTB.tools["Undo"]);
            } 
            if (redos != EditorState.redos)
            {
                EditorState.redos = redos;
                if (redos) EnableTool(EdMainTB,EdMainTB.tools["Redo"]);
                else DisableTool(EdMainTB,EdMainTB.tools["Redo"]);
            } 
            if (edits != EditorState.edits)
            {
                EditorState.edits = edits;
                if (edits) EnableTool(EdMainTB,EdMainTB.tools["SaveEdits"]);
                else DisableTool(EdMainTB,EdMainTB.tools["SaveEdits"]);
            } 
        }
                
        EditorState.shapeType = shapeType;
        EditorState.selCount = selCount;
        
        for (prop in EditorToolbars)
        {
            var visible = false;
            
            var tb = EditorToolbars[prop];
            for (prop2 in tb.tools)
            {
                var t = tb.tools[prop2];
                if (t.shapeType != 'None')
                {
                    if ( (t.shapeType != 'All' && t.shapeType.indexOf(EditorState.shapeType) == -1))
                    {
                        HideTool(tb, t);
                    }
                    else if (EditorState.selCount < t.minSel)
                    {
                        DisableTool(tb, t);
                        visible = true;
                    }
                    else
                    {
                        EnableTool(tb, t);
                        visible = true;
                    }
                }
                else
                {
                    visible = true;
                }
                if (t.name == tool)
                {
                    if (t.state != "enabled")
                        TurnOffTool(tb.mapID, tb.name, t.name);
                }
            }
            
            if (!tb.hasNonEdTool)
            {
                var el = document.getElementById(prop);
                el.style.display = visible ? "" : "none";
            }
        }
    }
}

function InitToolbar(tbname)
{
    // Standard toolbar collection
    var toolbar = Toolbars[tbname];
    if (toolbar == null)
        return;

    // Editor toolbars
    var tb = EditorToolbars[tbname];
    var visible = false;
    
    for (prop in tb.tools)
    {
        // Standard tool item
        var toolbarItem = toolbar.items[prop];
        if (toolbarItem == null){
            visible = true;
            tb.hasNonEdTool = true;
            continue;
        }
                    
        // Editor tool item
        var t = tb.tools[prop];
        toolbarItem.preExecFunction = t.preExec;

        if (t.name == "Undo"){
            if (EditorState.undos){EnableTool(tb,t);}
            else {DisableTool(tb,t)};
            visible = true;
        }
        else if (t.name == "Redo"){
            if (EditorState.redos){EnableTool(tb,t);}
            else {DisableTool(tb,t)};
            visible = true;
        }
        else if (t.name == "SaveEdits"){
            if (EditorState.edits){EnableTool(tb,t);}
            else {DisableTool(tb,t)};
            visible = true;
        }
        else if (t.shapeType != 'None'){
            if ( (t.shapeType != 'All' && t.shapeType.indexOf(EditorState.shapeType) == -1)){
                HideTool(tb,t);
            }
            else if (EditorState.selCount < t.minSel){
                DisableTool(tb,t);
                visible = true;
            }
            else{
                EnableTool(tb,t);
                visible = true;
            }
        }
    }
    tb.initialized = true;  
    
    if (!tb.hasNonEdTool){
        var el = document.getElementById(tbname);
        el.style.display = visible ? "" : "none";
    }
}

function TurnOffTool(mapID, toolbarname, toolname)
{
    // Deselect tool
    var toolbar = Toolbars[toolbarname];
    if (toolbar != null)
    {
        var toolbarItem = toolbar.items[toolname];
        toolbarItem.disabled = true;
        var f = document.forms[docFormID];
        f.elements[toolbar.currentToolField].value = "";
    
        // Swap imap
        var imageTag = toolbarname + toolname + "Image";
        var img = document.images[imageTag];
	    switchImageSourceAndAlphaBlend(img,toolbarItem.defaultImage);
	}

    // Set pan tool    
    MapDragImage(mapID, 'Pan', false);
    
    // Turn off snapping if enabled    
    DisableSnapTips(mapID);
}

function DisableSnapTips(mapID)
{
}

// Hide
function HideTool(tb,t)
{
    t.state = "hidden";
    var toolbar = Toolbars[tb.name];
    if (toolbar != null)
    {
  	    var cell = tb.name + t.name;
        var cellElement = document.getElementById(cell);
        if (cellElement)
            cellElement.style.display = "none";
    }
}

// Disable
function DisableTool(tb,t)
{
    t.state = "disabled";
    var toolbar = Toolbars[tb.name];
    if (toolbar != null)
    {
        toolbar.items[t.name].disabled = true;        
        var cell = tb.name + t.name;
        var cellElement = document.getElementById(cell);
        if (cellElement)
            cellElement.style.display = "";
    }
}

// Enable
function EnableTool(tb,t)
{
    t.state = "enabled";
    var toolbar = Toolbars[tb.name];
    if (toolbar != null)
    {
        toolbar.items[t.name].disabled = false;        
        
        var cell = tb.name + t.name;
        var cellElement = document.getElementById(cell);
        if (cellElement)
            cellElement.style.display = "";
    }
}
var ExecFunctions = [];
function setPME(mapID,toolid)
{
    if(!ExecFunctions[mapID]) { ExecFunctions[mapID] = []; }
    ExecFunctions[mapID][toolid] = 'showEditorAjaxIndicator();'
}

function onMapRequest(map,args) {
	var argument = args.argument;
    var actions = ExecFunctions[map.get_id()];
    if(actions && argument) {
        var argname = '&'+map.get_id()+'_mode=';
        var pos = argument.indexOf(argname);
        if(pos>-1) {
            var start = pos+argname.length;
            var end = argument.indexOf('&',start);
            if(end<0) { end = argument.length; }
            var toolname = argument.substring(start,end);
            var action = actions[toolname];
            if(action) {
                try {
                    eval(action);
                }
                catch(ex) {
                    Sys.Debug.trace('Error executing action: ' + action);
                }
            }
        }
    }
}


function editorStopEditing(mapID)
{
    editorTaskselectedSwatch = "";

    var map = Maps[mapID];
    if (map != null)
    {
        // Clear editor tool if active
        for (prop in EditorToolbars)
        {
            var tb = EditorToolbars[prop];
            for (prop2 in tb.tools)
            {
                var t = tb.tools[prop2];
                if (map.__activeToolMode == t.name)
                {
                    TurnOffTool(mapID, prop, t.name);
                    return;
                }
            }
        }
    }  
    clearSwatchTool();  
}

//
// Create feature related
//
var editorTaskselectedSwatch = null;

function clearSwatchTool()
{
    //unhighlight create feature swatch tool if one was selected
    if(editorTaskselectedSwatch != null)
    {
        if(editorTaskselectedSwatch != "")
        {                
            var previousElement = document.getElementById(editorTaskselectedSwatch);
            if (previousElement != null)
            {
                previousElement.src = previousElement.getAttribute('imgSrcOff');
            }
            
            editorTaskselectedSwatch = "";
        }
    }
}

function swatchMouseDown(thisElement, mapID, callbackFunctionString)
{
    //unhighlight the old selected node
    if(editorTaskselectedSwatch != null)
    {
        if(editorTaskselectedSwatch != "" && editorTaskselectedSwatch != thisElement.id)
        {                
            var previousElement = document.getElementById(editorTaskselectedSwatch);
            if (previousElement != null)
            {
                previousElement.src = previousElement.getAttribute('imgSrcOff');
            }
        }
    }

    editorTaskselectedSwatch = thisElement.id;

    // set to on image
    thisElement.src = thisElement.getAttribute('imgSrcOn');
    
    // ready ajax indicator
    setPME(mapID,'CreateFeature');
                    
    var argument = "EventArg=NewFeatureSwatchClicked&swatch=" + thisElement.alt;
    var context = null;
    eval(callbackFunctionString);
}

function swatchMouseOut(thisElement)
{
    //unhighlight the swatch
    if(editorTaskselectedSwatch != null && editorTaskselectedSwatch != "" && editorTaskselectedSwatch == thisElement.id)
    {
        // set to on image
        thisElement.src = thisElement.getAttribute('imgSrcOn');            
    }      
    else
    {
        // Set to off image
        thisElement.src = thisElement.getAttribute('imgSrcOff');      
    }
}

function editField(thisElement, callbackFunctionString)
{
    var argument = "EventArg=EditField&fieldName=" + thisElement.getAttribute('fieldName') + "&newValue=" + ESRI.ADF.System.escapeForCallback(thisElement.value);
    var context = null;
    eval(callbackFunctionString);
}

function validatedEditField(thisElement, callbackFunctionString, editorID)
{
    var min = parseFloat(thisElement.getAttribute('min'));
    var max = parseFloat(thisElement.getAttribute('max'));
        
    if ( isNaN(min) == false && isNaN(max) == false && thisElement.value >= min && thisElement.value <= max )
    {
        thisElement.setAttribute('origValue', thisElement.value);
        editField(thisElement, callbackFunctionString);
    }
    else
    {
        var s = $find(editorID).get_msgs().outOfRange;
        alert(String.format(s, thisElement.getAttribute('fieldName'), min, max));
        thisElement.value = thisElement.getAttribute('origValue');
    }                
}

function updateIntField(thisElement, hiddenFieldID, eventArg, callbackFunctionString)
{
    var hiddenField = document.getElementById(hiddenFieldID);
    var value = parseInt(thisElement.value);
    if ( isNaN(value) || value < 1 )
    {
        thisElement.value = hiddenField.value;
        return;
    }
    
    hiddenField.value = value;
    thisElement.value = value; // in case parsed value differs from actual value
    
    var argument = "EventArg=" + eventArg + "&value=" + thisElement.value;
    var context = null;
    eval(callbackFunctionString);
}

function SnapTolChange(thisElement, hiddenFieldID, editorID)
{
    // If tol is empty, set back to previous value
    var hiddenField = document.getElementById(hiddenFieldID);
    var value = parseInt(thisElement.value);
    if (isNaN(value) || value < 1){
        thisElement.value = hiddenField.value;
        return;
    }
}

function SnapTolKeyDown(e)
{
    // only allow backspace, delete, left, right and numbers
    var domEvent = new Sys.UI.DomEvent(e);
    var key = domEvent.keyCode;
    if (key != Sys.UI.Key.backspace && key != Sys.UI.Key.del && key != Sys.UI.Key.left && key != Sys.UI.Key.right){
        var keychar = String.fromCharCode(key);
        var numcheck = /\d/;
        return numcheck.test(keychar);
    }
    return true;
}

function SnapTolKeyUp(thisElement, hiddenFieldID, editorID, callbackFunctionString)
{
    var hiddenField = document.getElementById(hiddenFieldID);
    var value = parseInt(thisElement.value);
    if (isNaN(value) || value < 1) {
        // allow clearing value to set a new value
        return;
    }    
    else if (hiddenField.value == value){
        return;
    }
    
    hiddenField.value = value;
    
    var editor = $find(editorID);
    if (editor != null){
        editor.get_snapTip().set_snapRadius(thisElement.value);
    }
    
    var argument = "EventArg=SetSnapTolerance&snapTol=" + thisElement.value;
    var context = null;
    eval(callbackFunctionString);
}

var edVersionText;
function editorSetVersion(version, panel, callbackFunctionString)
{
    panel.style.cursor = 'wait';
    panel.setAttribute('disabled','disabled');
    panel.innerHTML = edVersionText.replace("{0}", version);
    var argument='EventArg=SetVersion&version=' + version; 
    var context=null; 
    eval(callbackFunctionString);
}

var edPromptToSave;
function PromptToSaveEdits(taskID, msg, callbackFunctionString)
{         
    edPromptToSave = {'taskID':taskID,'msg':msg,'cbfs':callbackFunctionString};
    setTimeout('PromptToSaveEdits2()',0);
}

function PromptToSaveEdits2()
{    
    if (confirm(edPromptToSave.msg))
    {
        var argument = "EventArg=stopEditing";
        var context = null;
        eval(edPromptToSave.cbfs);
    }    
    else
    {
        showFloatingPanel(edPromptToSave.taskID,false);
        resetAllTitleBarBackgroundImages(); 
    }
}

// Create unsaved edits warning element and ajax indicator
function createTitleEls(taskID, ueID, ueText, ajaxID, ajaxSrc)
{
    var el = document.getElementById(taskID);
    if (el != null)
    {
        var title = el.innerHTML;
        el.innerHTML = title + '<span id="' + ueID + '" style="display: none">' + ueText + '</span>';

        var cell = el.parentNode.cells[1];
        var innerHTML = cell.innerHTML;
        cell.innerHTML = '<img id="' + ajaxID + '" style="visibility: hidden;" src="' + ajaxSrc + '" />' + innerHTML;
    }
}

// 
// turn on/off unsaved edits warning
//
function showEditorElement(show, elementID, useDisplay)
{
    var el = document.getElementById(elementID);
    
    if ( el != null )
    {
        if (useDisplay)
        {
            if ( show )
                el.style.display = "";
            else
                el.style.display = "none";
        }
        else
        {
            if ( show )
                el.style.visibility = "visible";
            else
                el.style.visibility = "hidden";
        }
    }
}

function showEditorAjaxIndicator()
{
    showEditorElement(true, 'ajaxActivityID');
    window.setTimeout('monitorIndicator()', 500);
}

function monitorIndicator()
{
    if (__synchronousCallBackIndex == -1)
        showEditorElement(false, 'ajaxActivityID');
    else
        window.setTimeout('monitorIndicator()', 500);
}


//
// Feature selection color
//

// configured color
var theColor;
var edColorCallback;

function updateColorDiv()
{
    var div = document.getElementById('colorDiv');
    div.style.backgroundColor = theColor;
}

function showColorOptions(show, id)
{
    var options = document.getElementById(id);
    if ( show )
    {
        document.getElementById(id+'Button').disabled = true;
        options.style.display = '';
    }
    else
    {
       document.getElementById(id+'Button').disabled = false;
       options.style.display = 'none';
    }
}

function setClrOp(color,id)
{
    showColorOptions(false,id);
    
    var colorDiv = document.getElementById(id+'colorDiv');
    if (colorDiv != null)
    {
        colorDiv.style.backgroundColor = color;
    }
        
    var argument = "EventArg=SetColor&color=" + color + "&id=" + id;
    var context = null;
    eval(edColorCallback);    
}

function ShowHighlight(show, callbackFunctionString)
{
    var el = document.getElementById("hlClrRow");
    el.style.display = show ? "" : "none";
    if (!show)
    {
        el = document.getElementById("hlClr");
        el.style.display = "none";
        el = document.getElementById("hlClrButton");
        el.disabled = false;
    }

    if (callbackFunctionString != null)
    {
        var argument = "EventArg=ShowHighlight&show=" + show;
        var context = null;
        eval(callbackFunctionString);
    }
}

//
// Configuration
//

function setTab(tab)
{
    var gen = document.getElementById('generalTab');
    var set = document.getElementById('settingsTab');
    
    if ( tab == 'General' )
    {
        if ( gen.className == 'active' )
            return;
            
        gen.className = 'active';
        set.className = '';
    }
    else
    {
        if ( set.className == 'active' )
            return;
            
        set.className = 'active';
        gen.className = '';
    }
}

if (typeof(Sys) !== "undefined") Sys.Application.notifyScriptLoaded();