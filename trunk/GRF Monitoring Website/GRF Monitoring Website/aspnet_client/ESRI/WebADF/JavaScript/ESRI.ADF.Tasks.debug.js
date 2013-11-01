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

Type.registerNamespace('ESRI.ADF');

ESRI.ADF._Tasks = function() {
	ESRI.ADF._Tasks.initializeBase(this);
	ESRI.ADF._taskJobIDCounter;
};
ESRI.ADF._Tasks.prototype = {
	executeTask : function(callbackArguments, callbackFunctionString, taskJobID) {
		/// <summary>Executes a task.</summary>
		/// <param name="callbackArguments" type="String">argument string to pass back to the server</param>
		/// <param name="callbackFunctionString" type="String">Callback function string used call the server control task.</param>
		/// <param name="taskJobID" type="String" optional="true">Task job ID</param>
		if (taskJobID == null) {
			if (!ESRI.ADF._taskJobIDCounter){
				ESRI.ADF._taskJobIDCounter = new Date().getTime();
			}
			taskJobID = ++ESRI.ADF._taskJobIDCounter;		
		}
		this.startActivityIndicator(callbackArguments, callbackFunctionString, taskJobID);
		var fnc = Function.createDelegate(this,function() { this.startJob(callbackArguments,callbackFunctionString,taskJobID); });
		window.setTimeout(fnc,1000);
	},
	startActivityIndicator : function(callbackArguments, callbackFunctionString, taskJobID) {   
		/// <summary>Starts the activity indicator.</summary>
		/// <param name="callbackArguments" type="String">argument string to pass back to the server</param>
		/// <param name="callbackFunctionString" type="String">Callback function string used call the server control task.</param>
		/// <param name="taskJobID" type="String" optional="true">Task job ID</param>
		var argument = "EventArg=startTaskActivityIndicator&taskJobID=" + taskJobID;
		if (callbackArguments.length > 0) argument += "&" + callbackArguments;
		var context = null;
		eval(callbackFunctionString);
	},
	startJob : function (callbackArguments, callbackFunctionString, taskJobID) {
		/// <summary>Starts processing a task.</summary>
		/// <param name="callbackArguments" type="String">argument string to pass back to the server</param>
		/// <param name="callbackFunctionString" type="String">Callback function string used call the server control task.</param>
		/// <param name="taskJobID" type="String" optional="true">Task job ID</param>
		var argument = "EventArg=executeTask&taskJobID=" + taskJobID;
		if (callbackArguments.length > 0) argument += "&" + callbackArguments;
		var context = null;
		eval(callbackFunctionString);
	}
};
ESRI.ADF._Tasks.registerClass('ESRI.ADF._Tasks');
ESRI.ADF.Tasks = new ESRI.ADF._Tasks(); //Create singleton instance
//Obsolete methods (9.2 compatibility):
executeTask = ESRI.ADF.Tasks.executeTask;
startActivityIndicator = ESRI.ADF.Tasks.startActivityIndicator;
startJob = ESRI.ADF.Tasks.startJob;