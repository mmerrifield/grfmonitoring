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

ESRI.ADF.UI.TreeViewPlus = function(element) { 
	/// <summary>
	/// TreeViewPlus is a control for displaying a tree collection of nodes.
	/// </summary>
	this._expandedImage = null;
	this._collapsedImage = null;
    this._callbackFunctionString = null;
    this._contentDivId = null;
    this._showClearAllOption = false;
    this._clearAllId = null;
	
    ESRI.ADF.UI.TreeViewPlus.initializeBase(this, [element]);
};

ESRI.ADF.UI.TreeViewPlus.prototype = {

    initialize : function() {
        /// <summary>
        /// Initialize the control
    	/// </summary>

    	ESRI.ADF.UI.TreeViewPlus.callBaseMethod(this, 'initialize');
    }, 
    dispose : function() {
        /// <summary>
        /// Dispose the control
        /// </summary>
        
        ESRI.ADF.UI.TreeViewPlus.callBaseMethod(this, 'dispose');
    },
    get_expandedImage : function() {
		/// <value name="expandedImage" type="String">The image URL of the expanded image.</value>
        return this._expandedImage;
    },
    set_expandedImage : function(value) {
        this._expandedImage = value;
    },
    get_collapsedImage : function() {
		/// <value name="collapsedImage" type="String">The image URL of the collapsed image.</value>
        return this._collapsedImage;
    },
    set_collapsedImage : function(value) {
        this._collapsedImage = value;
    },
    get_contentDivId : function() {
		/// <value name="contentDivId" type="String">The id of the div containing TreeViewPlus nodes.</value>
        return this._contentsDivId;
    },
    set_contentDivId : function(value) {
        this._contentsDivId = value;
    },
    get_showClearAllOption : function() {
		/// <value name="showClearAllOption" type="Boolean">Gets or sets whether to show a link for clearing all nodes.</value>
        return this._showClearAllOption;
    },
    set_showClearAllOption : function(value) {
        if (this._showClearAllOption !== value){
            this._showClearAllOption = value;
            this.updateClearAllControlVisibility();
        }
    },
    get_clearAllId : function() {
		/// <value name="clearAllId" type="String">Gets or sets the client ID of the link used for clearing all nodes.</value>
        return this._clearAllId;
    },
    set_clearAllId : function(value) {
        this._clearAllId = value;
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
		return false;
	},
	isNodeExpanded: function (nodeID) {
		/// <summary>
		/// Checks if a TreeViewPlusNode is expanded.
		/// </summary>
		/// <param name="nodeID" type="String">The ClientId of the node to check.</param>
		/// <returns type="Boolean">Whether the specified node is expanded</returns>
	    var childrenContainer=document.getElementById(nodeID+'_childrenContainer');
	    return (childrenContainer && childrenContainer.style.display=='none') ? false : true;
	},
	updateClearAllControlVisibility: function()	{
		/// <summary>
		/// Updates the visibility of the "Clear All" link
		/// </summary>
		/// <returns/>    
        var clearAll = $get(this._clearAllId);
        if (clearAll) {
	        if (this._showClearAllOption) {
	            var nodeContainer = document.getElementById(this._contentsDivId);
	            if (nodeContainer && nodeContainer.childNodes && nodeContainer.childNodes.length > 1) {
	                clearAll.style.display = "";
	            }
	            else {
	                clearAll.style.display = "none";
	            }
	        }
	        else {
	            clearAll.style.display = "none";
	        }
	    }
	},
    _toggleNodeState : function (nodeID, fireClickedEvent) {
	    var childrenContainer=document.getElementById(nodeID+'_childrenContainer');
        var argument='nodeID=' + nodeID + '&';
	    var button=document.getElementById(nodeID + '_StateButton');
	    if (childrenContainer===null || button===null) {
	        return;
	    }
	    
	    if (fireClickedEvent===null){
	        fireClickedEvent=false;
	    }
	    
	    var expanded = null;
	    if (childrenContainer.style.display=='none'){	   
	        expanded = true;     
	        argument+='EventArg=expanded&Value=true';
	        if (fireClickedEvent) {argument+='&Action=clicked';}
		    childrenContainer.style.display='';
		    button.src=this._expandedImage;
	    }
	    else {	        
	        expanded = false;
	        argument+='EventArg=expanded&Value=false';
	        if (fireClickedEvent) {argument+='&Action=clicked';}
		    childrenContainer.style.display='none';
		    button.src=this._collapsedImage;
	    }
	    this._raiseEvent('nodeToggled', {"nodeID": nodeID, "expanded":expanded});    	
	    var context = null;
	    eval(this._callbackFunctionString);
    },
    _nodeChecked : function (nodeID)
    {
        var argument='nodeID=' + nodeID + '&';
	    var checkBox=document.getElementById(nodeID + '_CheckBox');
	    if (checkBox===null) {return;}
	    if (checkBox.checked===false)
	    {
	        argument+='EventArg=checked&Value=false';
	        checkBox.value=false;
	    }
	    else
	    {
	        argument+='EventArg=checked&Value=true';
	        checkBox.value=true;
	    }
    	this._raiseEvent('nodeChecked', {"nodeID": nodeID, "checked":checkBox.checked});
	    var context = null;
	    eval(this._callbackFunctionString);
    },
    _nodeClicked : function (nodeID)
    {
        var argument='nodeID=' + nodeID + '&EventArg=nodeClicked';
	    var context = null;
	    this._raiseEvent('nodeClicked', nodeID);
	    eval(this._callbackFunctionString);
    },
    _clearNode : function (nodeID)
    {
        var argument='nodeID=' + nodeID + '&EventArg=clearNode';
	    var context = null;
	    eval(this._callbackFunctionString);
    },
    _nextPage : function (nodeID)
    {
        var argument='nodeID=' + nodeID + '&EventArg=nextPage';
	    var context = null;
	    eval(this._callbackFunctionString);
    },
    _previousPage : function (nodeID)
    {
        var argument='nodeID=' + nodeID + '&EventArg=previousPage';
	    var context = null;
	    eval(this._callbackFunctionString);
    },
    clearAllNodes : function ()
    {
        var argument='EventArg=clearAllNodes';
	    var context = null;
	    eval(this._callbackFunctionString);
    },
    _nodeLegendClicked : function (nodeID)
    {
        var argument='nodeID=' + nodeID + '&EventArg=nodeLegendClicked';
	    var context = null;
	    eval(this._callbackFunctionString);
    },
    _unselectNode : function (nodeID, backColor, hoverColor)
    {
        var node=document.getElementById(nodeID);
        if (node===null) {return;}
        node.style.backgroundColor=backColor;
        node.onmouseover=function(){this.style.backgroundColor=hoverColor;};
        node.onmouseout=function(){this.style.backgroundColor=backColor;};
    },
    
    ///
    /// Client Side Events
    ///
    _raiseEvent : function(name,e) {
		var handler = this.get_events().getHandler(name);
		if (handler) { if(!e) { e = Sys.EventArgs.Empty; } handler(this, e); }
	},        
    add_nodeClicked : function(handler) {
    /// <summary>Fired when a node is clicked.</summary>
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
    /// 				<td>ESRI.ADF.UI.TreeViewPlus</td>
    /// 				<td>The treeview containing the node that was clicked</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs</td>
    /// 				<td>String</td>
    /// 				<td>The ID of the clicked node.  This corresponds to both the ID of the DOM element encapsulating the node and the NodeID of the web tier TreeViewPlusNode.</td>
    /// 			</tr>
    /// 		</tbody>
    /// 	</table>
    /// </remarks>		
        this.get_events().addHandler('nodeClicked', handler);
    },    
    remove_nodeClicked : function(handler) {
        this.get_events().removeHandler('nodeClicked', handler);
    },    
    add_nodeChecked : function(handler) {
    /// <summary>Fired when a node is checked.</summary>
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
    /// 				<td>ESRI.ADF.UI.TreeViewPlus</td>
    /// 				<td>The treeview containing the node that was checked</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs.checked</td>
    /// 				<td>Boolean</td>
    /// 				<td>Whether the toggled node is checked (true) or unchecked (false)</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs.nodeID</td>
    /// 				<td>String</td>
    /// 				<td>The ID of the checked node.  This corresponds to both the ID of the DOM element encapsulating the node and the NodeID of the web tier TreeViewPlusNode.</td>
    /// 			</tr>
    /// 		</tbody>
    /// 	</table>
    /// </remarks>	
        this.get_events().addHandler('nodeChecked', handler);
    },
    remove_nodeChecked : function(handler) {
        this.get_events().removeHandler('nodeChecked', handler);
    },
    add_nodeToggled : function(handler) {
    /// <summary>Fired when a node is expanded or collapsed.</summary>
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
    /// 				<td>ESRI.ADF.UI.TreeViewPlus</td>
    /// 				<td>The treeview containing the node that was toggled</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs.expanded</td>
    /// 				<td>Boolean</td>
    /// 				<td>Whether the toggled node is checked (true) or unchecked (false)</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs.nodeID</td>
    /// 				<td>String</td>
    /// 				<td>The ID of the toggled node.  This corresponds to both the ID of the DOM element encapsulating the node and the NodeID of the web tier TreeViewPlusNode.</td>
    /// 			</tr>
    /// 		</tbody>
    /// 	</table>
    /// </remarks>	
        this.get_events().addHandler('nodeToggled', handler);
    },
    remove_nodeToggled : function(handler) {
        this.get_events().removeHandler('nodeToggled', handler);
    }
};

ESRI.ADF.UI.TreeViewPlus.registerClass('ESRI.ADF.UI.TreeViewPlus', Sys.UI.Control);

if (typeof(Sys) !== 'undefined') { Sys.Application.notifyScriptLoaded(); }