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

var esriTaskResultsCancelledJobs = {};

function esriTaskResultsCancelJob(jobID, nodeID, treeViewPlusID)
{
	esriTaskResultsCancelledJobs[jobID]="cancelled";

	var node=document.getElementById(nodeID);
	if (node!==null)
	{
		node.parentNode.removeChild(node);
		
		// Update visibility of ShowClearAll control
		var tvp = $find(treeViewPlusID);
		if (tvp){
			tvp.updateClearAllControlVisibility();
		}

		window.setTimeout("$find('" + treeViewPlusID + "')._clearNode('" + nodeID + "');",0);
	}
}

// Register the namespace for the control.
Type.registerNamespace('ESRI.ADF.UI');
ESRI.ADF.UI.TaskResults = function(element) { 
	/// <summary>
	/// TaskResults is a control for managing task results.
	/// </summary>

	this._hoverColor = "";
	this._map = null;

	ESRI.ADF.UI.TaskResults.initializeBase(this, [element]);
};

ESRI.ADF.UI.TaskResults.prototype = {
	initialize : function() {
		/// <summary>
		/// Initialize the control
		/// </summary>
		ESRI.ADF.UI.TaskResults.callBaseMethod(this, 'initialize');
	}, 
	dispose : function() {
		/// <summary>
		/// Dispose the control
		/// </summary>
	    
		ESRI.ADF.UI.TaskResults.callBaseMethod(this, 'dispose');
	},
	get_map : function() {
		/// <value name="map" type="ESRI.ADF.UI.Map" mayBeNull="false">
		/// The map control to which the TaskResults control is a buddy.
		/// </field>
		return this._map;
	},
	set_map : function(value) {
		this._map = value;
	},
	get_hoverColor : function() {
		/// <value name="hoverColor" type="String">The color used for node highlighting.</value>
		return this._hoverColor;
	},
	set_hoverColor : function(value) {
		this._hoverColor = value;
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
		if (action == "insertTaskResultNode") {
			this._insert(params[0], params[1], params[2], params[3]);
			return true;
		}
		else if (action == "removeTaskResultNode") {
			this._remove(params[0]);
			return true;
		}
		else if (action == "replaceTaskResultNode") {
			this._replace(params[0], params[1], params[2], params[3]);
			return true;
		}
		else if (action == "refresh") {
		    this._refresh();
		    return true;
		}
		
		return ESRI.ADF.UI.TaskResults.callBaseMethod(this, 'processCallbackResult', [action, params]);
	},
		
	_insert : function(nodeContent, index, taskJobId, nodeID) {  
		if (taskJobId && esriTaskResultsCancelledJobs[taskJobId]) {
			// Cancelled task result, remove server node
			window.setTimeout("$find('" + this.get_id() + "')._clearNode('" + nodeID + "');",0);
			
			// Ignore graphics
			this._cancelled = true;
		}
		else {
			var taskContainer = document.getElementById(this.get_contentDivId());
	        
	       nodeContent = ESRI.ADF.System.templateBinder(null, nodeContent);
            
			// if a node with this ID already exists, remove it
			var oldNode = $get(nodeID);
			if (oldNode) {
				oldNode.innerHTML = nodeContent;
			}
			else {           
				var temp = document.createElement('div');
				temp.innerHTML = nodeContent;
	            
				if (index !== null && index >= taskContainer.childNodes.length){
					taskContainer.appendChild(temp.firstChild);
				}
				else {
					var sibling = taskContainer.childNodes[index];
					taskContainer.insertBefore(temp.firstChild, sibling);
				}
			}
	        
			// Update visibility of ShowClearAll control
			this.updateClearAllControlVisibility();
	        
			// insertion event... call handler, if set 
			var handler = this.get_events().getHandler('taskResultNodeInserted');
			if(handler){
				handler(this,Sys.EventArgs.Empty);
			}
		}
	},
	_remove : function(nodeId) {
		var taskContainer = document.getElementById(this.get_contentDivId());
		var node = $get(nodeId);
		if (node) {
			node.parentNode.removeChild(node);
             
			// Update visibility of ShowClearAll control
			this.updateClearAllControlVisibility();
    
			 // removal event... call handler, if set 
			var handler = this.get_events().getHandler('taskResultNodeRemoved');
			if(handler) {
				handler(this,Sys.EventArgs.Empty);
			}
		}
	},
	_replace : function(nodeContent, taskJobId, nodeID, newNodeID) {    
		if (taskJobId && esriTaskResultsCancelledJobs[taskJobId]) {
			// Cancelled task result, remove server node
			window.setTimeout("$find('" + this.get_id() + "').clearNode('" + nodeID + "');",0);
			
			// Ignore graphics
			this._cancelled = true;
		}
		else {           
			var oldNode = $get(nodeID);
			if (oldNode) {
				oldNode.innerHTML = nodeContent;
				oldNode.ID = newNodeID;
			}
		}
	},
	_refresh : function() {
        var taskContainer = document.getElementById(this.get_contentDivId());    
        for(var i=0;i<taskContainer.childNodes.length;++i){
            var node = taskContainer.childNodes[i];
            node.innerHTML =  ESRI.ADF.System.templateBinder(null, node.innerHTML);
        }
	},
    _rerunTask : function(taskJobId) {
		// To prevent script duration warnings, run as separate callback
		window.setTimeout("$find('" + this.get_id() + "')._rerunTask2('" + taskJobId + "');",0);
	},    
	_rerunTask2 : function(taskJobId) {
		var argument='taskJobId=' + taskJobId+ '&EventArg=rerunTask';
		var context = null;
		eval(this._callbackFunctionString);
	},
	_getNode : function(graphicId) {
		var taskContainer = document.getElementById(this.get_contentDivId());
		if (taskContainer) {
			var nodes = taskContainer.getElementsByTagName('DIV');
			for (var i = 0; i < nodes.length; ++i) {
				if (nodes[i].getAttribute("graphicId") == graphicId){
					return nodes[i];
				}
			}
			return null;
		}
	},  
	add_taskResultNodeInserted : function(handler) {
		/// <summary>
		/// Fired when a node insertion event occurs
	/// </summary>
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
	/// 				<td>ESRI.ADF.UI.TaskResults</td>
	/// 				<td>The TaskResults to which a node was inserted</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('taskResultNodeInserted', handler);
	},
	remove_taskResultNodeInserted : function(handler) {
		this.get_events().removeHandler('taskResultNodeInserted', handler);
	},
	add_taskResultNodeRemoved : function(handler) {
		/// <summary>
		/// Fired when a node removal event occurs
	/// </summary>
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
	/// 				<td>ESRI.ADF.UI.TaskResults</td>
	/// 				<td>The TaskResults from which a node was removed</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('taskResultNodeRemoved', handler);
	},
	remove_taskResultNodeRemoved : function(handler) {
		this.get_events().removeHandler('taskResultNodeRemoved', handler);
	},
	add_mouseOverNode : function(handler) {
		/// <summary>
		/// Fired when the cursor enters a feature node
	/// </summary>
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
	/// 				<td>ESRI.ADF.UI.TaskResults</td>
	/// 				<td>The task results control containing the moused over node</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.element</td>
	/// 				<td>DOM element</td>
	/// 				<td>The DOM element encapsulating the moused over node</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.graphicId</td>
	/// 				<td>String</td>
	/// 				<td>The AJAX component ID of the graphic feature associated with the moused over node</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('mouseOverNode', handler);
	},
	remove_mouseOverNode : function(handler) {
		this.get_events().removeHandler('mouseOverNode', handler);
	},
	add_mouseOutNode : function(handler) {
		/// <summary>
		/// Fired when the cursor leaves a feature node
	/// </summary>
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
	/// 				<td>ESRI.ADF.UI.TaskResults</td>
	/// 				<td>The task results control containing the moused out node</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.element</td>
	/// 				<td>DOM element</td>
	/// 				<td>The DOM element encapsulating the node that the mouse was moved away from</td>
	/// 			</tr>
	/// 			<tr>
	/// 				<td>eventArgs.graphicId</td>
	/// 				<td>String</td>
	/// 				<td>The AJAX component ID of the graphic feature associated with the node that the mouse was moved away from</td>
	/// 			</tr>
	/// 		</tbody>
	/// 	</table>
	/// </remarks>
		this.get_events().addHandler('mouseOutNode', handler);
	},
	remove_mouseOutNode : function(handler) {
		this.get_events().removeHandler('mouseOutNode', handler);
	},
	_mouseOverNode : function(element)
	{        
		// call handler, if set 
		var handler = this.get_events().getHandler('mouseOverNode');
		if(handler) {
			// get layer and row Ids
			var graphicId = element.getAttribute('graphicId');
	        
			handler(this, {"element":element, "graphicId":graphicId});
		}
	},
	_mouseOutNode : function(element)
	{
		// call handler, if set 
		var handler = this.get_events().getHandler('mouseOutNode');
		if(handler) {
			// get layer and row Ids
			var graphicId = element.getAttribute('graphicId');
			handler(this, {"element":element, "graphicId":graphicId});
		}
	}
};

ESRI.ADF.UI.TaskResults.registerClass('ESRI.ADF.UI.TaskResults', ESRI.ADF.UI.TreeViewPlus);

//
// HighlightTaskResults
//

ESRI.ADF.HighlightTaskResults = function() {

	ESRI.ADF.HighlightTaskResults.initializeBase(this);
	   
	// The TaskResults javascript control to bind event handlers to
	this._taskResults = null;

	// Color to use when highlighting feature nodes.
	this._hoverColor = "";

	// highlighted node from maptip shown
	this._maptipNode = null;

	// expand task result node when a maptip is shown
	this._expandOnMaptipShown = false;
}

ESRI.ADF.HighlightTaskResults.prototype = {

	initialize : function() {
		ESRI.ADF.HighlightTaskResults.callBaseMethod(this, 'initialize');

		if (this._taskResults != null)	
		{
			this._onMouseOverNodeHandler = Function.createDelegate(this, this._onMouseOverNode);
			this._taskResults.add_mouseOverNode(this._onMouseOverNodeHandler);
			this._onMouseOutNodeHandler = Function.createDelegate(this, this._onMouseOutNode);
			this._taskResults.add_mouseOutNode(this._onMouseOutNodeHandler);
		    
			var map = this._taskResults.get_map();
			if (map) {
				this._onMaptipShown = Function.createDelegate(this, this._onMaptipShown);
				map.__add_mapTipEvent(this._onMaptipShown);
			}		    
		}
	},
	get_hoverColor : function()
	{
		/// <value type="string">
		/// The color to use for highlighting nodes of the TaskResults.
		/// </value>
		return this._hoverColor;
	},
	set_hoverColor : function(value)
	{
		if (this._hoverColor != value) {
			this._hoverColor = value;
			this.raisePropertyChanged('hoverColor');
		}
	},
	get_expandOnMaptipShown : function()
	{
		/// <value type="bool">
		/// Indicates whether the task result node should expand when a maptip is displayed.
		/// The default is false.
		/// </value>
		return this._expandOnMaptipShown;
	},
	set_expandOnMaptipShown : function(value)
	{
		if (this._expandOnMaptipShown != value) {
			this._expandOnMaptipShown = value;
			this.raisePropertyChanged('expandOnMaptipShown');
		}
	},
	get_taskResults : function()
	{
    	/// <value type="ESRI.ADF.UI.TaskResults">
    	/// Defines the TaskResults object on which results will be highlighted. 
    	/// </value>
		return this._taskResults;
	},
	set_taskResults : function(value)
	{
		this._taskResults = value;
	},
	dispose : function() {
		if (this._taskResults != null) {
			this._taskResults.remove_mouseOverNode(this._onMouseOverNode);
			this._taskResults.remove_mouseOutNode(this._onMouseOverNode);
		}
	    
		if (this._onMaptipShown) {
			var map = this._taskResults.get_map();
			if (map) {
				map.__remove_mapTipEvent(this._onMaptipShown);
			}
		}
		    
		ESRI.ADF.HighlightTaskResults.callBaseMethod(this, 'dispose');
	},
	_onMouseOverNode : function(sender, args)
	{
		args.element.style.backgroundColor = this._hoverColor;
		this._highlightFeature(args.graphicId, true);
	},
	_onMouseOutNode : function(sender, args)
	{
		args.element.style.backgroundColor = "";
		this._highlightFeature(args.graphicId, false);
	},
	_onMaptipShown : function(sender, args)
	{
		if (args.action == "show") {
			var maptip = args.maptip;
			if (maptip && maptip.get_isExpanded())
				this._highlightElementNode(args.element);
		}
		else if (args.action == "expand")
			this._highlightElementNode(args.element);
		else if (args.action == "hide" && this._maptipNode) {
			this._maptipNode.style.backgroundColor = "";
			this._maptipNode = null;
		}
	},
	_highlightElementNode : function(element) {
		// First unhighlight the previous highlighted node if any
		if (this._maptipNode) {
			this._maptipNode.style.backgroundColor = "";
			this._maptipNode = null;
		}
		if (element) {
			var map = this._taskResults.get_map();
			var node = this._taskResults._getNode(element.get_id());
			if (node) {
				node.style.backgroundColor = this._hoverColor;
				this._maptipNode= node;
				// Expand node if required
				if (this._expandOnMaptipShown && !this._taskResults.isNodeExpanded(node.id))
					this._taskResults._toggleNodeState(node.id);
			}
		}
	},
	_highlightFeature : function(graphicId, highlight)
	{
		var graphic = $find(graphicId);
		if (graphic)
			graphic.set_highlight(highlight);
	}
}

ESRI.ADF.HighlightTaskResults.registerClass('ESRI.ADF.HighlightTaskResults', Sys.Component);

if (typeof(Sys) !== 'undefined') { Sys.Application.notifyScriptLoaded(); }