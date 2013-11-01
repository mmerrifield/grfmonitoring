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

/// <reference name="MicrosoftAjax.js"/>
Type.registerNamespace('ESRI.ADF.System');

//
// Mouse wheel event handler
//
ESRI.ADF.System.addMouseWheelHandler = function(element, handler, handlerOwner) {
	/// <summary>
	/// Creates a crossbrowser handler for MouseWheel events on a DOM element
	/// </summary>
	/// <param name="element" type="Sys.UI.DomElement">
	/// Element to listing for MouseWheel event
	/// </param>
	/// <param name="Handler" type="Function">
	/// Handler to call on event. The handler function takes a sender, and an event argument.
	/// </param>
	/// <param name="owner" type="Object">
	/// Context to fire the handler in
	/// </param>
	/// <remarks>
	/// <para>
	/// In addition to the ADF.System Sys.UI.DomEvent properties, the following properties are available in the event arguments that is returned:<br/>
	/// wheelDelta : The direction and amount of scroll<br/>
	/// type : Specifies the type of the event (always "mousewheel").
	/// </para>
	/// </remarks>
	if (typeof(handler) !== 'function') { throw Error.invalidOperation(Sys.Res.cantAddNonFunctionhandler); }
	
	if(handlerOwner) {
		handler = Function.createDelegate(handlerOwner, handler);
	}
	if(Sys.Browser.agent===Sys.Browser.InternetExplorer || Sys.Browser.agent===Sys.Browser.Safari || Sys.Browser.agent===Sys.Browser.Opera) {
		var fnc  = Function.createDelegate(handlerOwner, function (sender) { return handler.call(element, ESRI.ADF.System.addMouseWheelHandler._convertWheelEventIE(sender)); });
		$addHandler(element, "mousewheel",fnc);
	}
	else if(element.addEventListener) {
		var fnc  = Function.createDelegate(handlerOwner, function (sender) { return handler.call(element, ESRI.ADF.System.addMouseWheelHandler._convertWheelEventMozilla(sender)); });
		$addHandler(element, "DOMMouseScroll", fnc);
	}	
}
ESRI.ADF.System.addMouseWheelHandler._convertWheelEventIE = function(sender) {
	// Internal method for converting the Internet Explorer mousewheel event
	sender.type = 'mousewheel';
	sender.wheelDelta = sender.rawEvent.wheelDelta;
	sender.preventDefault();
	sender.stopPropagation();		
	return sender;
};
ESRI.ADF.System.addMouseWheelHandler._convertWheelEventMozilla = function(sender) {
	// Internal method for converting the Mozilla DOMMouseScroll event
	sender.type = 'mousewheel';
	sender.wheelDelta = -sender.rawEvent.detail*40;
	sender.screenX = sender.rawEvent.screenX;
	sender.screenY = sender.rawEvent.screenY;
	sender.clientX = sender.rawEvent.pageX;
	sender.clientY = sender.rawEvent.pageY;
	sender.offsetX = sender.rawEvent.layerX;
	sender.offsetY = sender.rawEvent.layerY;
	sender.preventDefault();
	sender.stopPropagation();		
	return sender;
};
ESRI.ADF.System._makeMouseEventRelativeToElement = function(evt,element,location) {
	//This method will change offset event coordinates and target to another element	
	var e = evt;
	if(e.target && element && element!==e.target)
	{	
		//clone object
		e = {}; 
		for(var idx in evt) e[idx] = evt[idx];
		if(!location) { location = Sys.UI.DomElement.getLocation(element); }
		if(Sys.Browser.agent===Sys.Browser.InternetExplorer) {
			if(e.target.parentNode===document.body) { e.target = document.body; }
			e.offsetX = evt.screenX-window.screenLeft-location.x+document.documentElement.scrollLeft - 2;
			e.offsetY = evt.screenY-window.screenTop-location.y+document.documentElement.scrollTop - 2;
		}
		else {
			var eventLocation = Sys.UI.DomElement.getLocation(e.target);
			var diffX = eventLocation.x-location.x;
			var diffY = eventLocation.y-location.y;
			e.offsetX += diffX;
			e.offsetY += diffY;
		}
		e.target = element;
	}
	return e;
};

//Creating RegExp is expensive. Create these only once
ESRI.ADF.System._templateBinderAttrRegEx = new RegExp("{@.*?}","g")
ESRI.ADF.System._templateBinderEvalRegEx = new RegExp("{eval(.*?)}","g");
	
ESRI.ADF.System.templateBinder = function(dataItem,template) {
	/// <summary>Binds an objects properties to a string.</summary>
	/// <param name="dataItem" type="Object">Object to bind to template.</param>
	/// <param name="template" type="String">
	/// Template to bind to.
	/// {@name} will be replaced by dataItem[name].
	/// {eval({expression)} will be replaced by the evaluated expression.
	/// You can also access the object directly by referencing the name 'dataItem' in the eval expression
	/// Example template:
	/// "Name : {@Name}<br/>Area : {eval(Math.round({@Area}))} acres<br/>Summary: {eval(dataItem.description.substring(0,10))}"
	/// </param>
	/// <returns>databounded string</return>
	if(!template) { return ''; }
	var str = template;
	for(var idx in dataItem){
		var re = new RegExp("{@" + idx + "}","g");
		str = str.replace(re,dataItem[idx]);
	}
	var evalRe = new RegExp("\\{eval\\((.*?)\\)\\}", "g");//"\{eval\((.*?)\)\}","g");
	var myArray = str.match(evalRe);

	if(myArray != null){
		for(var idx=0;idx<myArray.length;idx++){
			var result = eval(myArray[idx].replace(evalRe,"$1"));
			str = str.replace(myArray[idx],result);
		}
	}
	return str;
};
ESRI.ADF.System.arrayTemplateBinder = function(dataItems,itemTemplate,headerTemplate,footerTemplate,separatorTemplate,alternatingItemTemplate) {
	/// <summary>Binds an array of objects to a string.</summary>
	/// <param name="dataItems" type="Object">Objects to bind to template.</param>
	/// <param name="itemTemplate" type="String">Header template</param>
	/// <param name="headerTemplate" type="String" optional="true" mayBeNull="true">Header template</param>
	/// <param name="footerTemplate" type="String" optional="true" mayBeNull="true">Footer template</param>
	/// <param name="separatorTemplate" type="String" optional="true" mayBeNull="true">Seperator template</param>
	/// <param name="alternatingItemTemplate" type="String" optional="true" mayBeNull="true">alternating item template</param>
	/// <returns>databounded string</return>
	/// <remarks><example language="JavaScript">
	/// var headerTemplate = '<table><tr><td>Name</td><td>Area</td></tr>';
	/// var itemTemplate = '<tr style="background-color: white"><td>{@Name}</td><td>{eval(Math.round({@Area}))}</td></tr>';
	/// var alternatingItemTemplate = '<tr style="background-color: gray"><td>{@Name}</td><td>{eval(Math.round({@Area}))}</td></tr>';
	/// var seperatorTemplate = '<tr style="height:1px; background-color:black"><td colspan="2">&nbsp</td></tr>';
	/// var footerTemplate = '</table>';
	/// var objects = [ { Name: "Africa", Area: 10000 }, { Name: "Europe", Area: 5000 }, { Name: "Australia", Area: 8000 } ];
	/// var html = ESRI.ADF.System.arrayTemplateBinder(objects,itemTemplate,headerTemplate,footerTemplate,seperatorTemplate,alternatingItemTemplate);
	/// </example></remarks>	
	var str = '';
	if(headerTemplate) str += headerTemplate;
	for(var idx=0;idx<dataItems.length;idx++) {
		var dataItem = dataItems[idx];
		if(alternatingItemTemplate && idx%2==1)
			str += ESRI.ADF.System.templateBinder(dataItem,alternatingItemTemplate);
		else
			str += ESRI.ADF.System.templateBinder(dataItem,itemTemplate);
		if(separatorTemplate && idx<dataItems.length-1) str += separatorTemplate;
	}
	if(footerTemplate) str += footerTemplate;
	return str;
};

ESRI.ADF.System.setOpacity = function(element,value) {
	if (!element) { return; }
	var filters = null;
	if(element.runtimeStyle) { filters = element.runtimeStyle.filter; }
	if (filters!=null) {
		var createFilter = true;
		if (filters.length !== 0) {
			if(filters.indexOf('progid:DXImageTransform.Microsoft.Alpha')>-1) {
				var filter = element.filters['DXImageTransform.Microsoft.Alpha'];
				if(value===1) {
					var pngFilter = (ESRI.ADF.System.__isIE6?element.filters['progid:DXImageTransform.Microsoft.AlphaImageLoader']:null);
					element.runtimeStyle.filter = '';
					if(pngFilter) {ESRI.ADF.System.setIEPngTransparency(element,pngFilter.src,pngFilter.sizingMethod==='image',element.format);}
				}
				else {
					filter.opacity = value * 100;
					filter.enabled = true;
				}
				createFilter = false;
			}
		}
		if (createFilter && value!==1) {
			element.runtimeStyle.filter += 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + (value * 100) + ')';
		}
	}
	else {
		element.style.opacity = value;
	}
};

ESRI.ADF.System.setIEPngTransparency = function(img,src,noscale,format) {
	if(ESRI.ADF.System.__isIE6 && img && img.tagName==='IMG') {
		var srcLC = (format?'.'+format:src).toLowerCase();
		if(srcLC.endsWith('.gif') || srcLC.endsWith('.jpg') || format && !format.toLowerCase().startsWith('png')) { 
			//disable filter if exists
			if (img.runtimeStyle.filter.indexOf("DXImageTransform.Microsoft.AlphaImageLoader")> -1) {
				var opacityFilter = img.filters['DXImageTransform.Microsoft.Alpha'];
				img.runtimeStyle.filter = '';
				if(opacityFilter) ESRI.ADF.System.setOpacity(img,opacityFilter.opacity/100);
			}
			img.src = src;
		}
		else {
			if (img.runtimeStyle.filter.indexOf("DXImageTransform.Microsoft.AlphaImageLoader")> -1) {
				img.filters['DXImageTransform.Microsoft.AlphaImageLoader'].src = src;
				img.filters['DXImageTransform.Microsoft.AlphaImageLoader'].enabled = true;
				img.filters['DXImageTransform.Microsoft.AlphaImageLoader'].sizingMethod = (noscale?'image':'scale');
				img.format = format;
			}
			else {
				img.runtimeStyle.filter += "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "',sizingMethod='"+(noscale?'image':'scale')+"');";
				img.src = esriBlankImagePath;
			}
		}
	}
};
ESRI.ADF.System.__isIE6 = (Sys.Browser.agent === Sys.Browser.InternetExplorer && Sys.Browser.version<7)

ESRI.ADF.System.ContentAlignment = function() {
    /// <summary>
    /// The ContentAlignment enumeration describes the alignment of an object.
    /// </summary>
    /// <field name="TopLeft" type="Number" integer="true" />
    /// <field name="TopCenter" type="Number" integer="true" />
    /// <field name="TopRight" type="Number" integer="true" />
    /// <field name="MiddleLeft" type="Number" integer="true" />
    /// <field name="MiddleCenter" type="Number" integer="true" />
    /// <field name="MiddleRight" type="Number" integer="true" />
    /// <field name="BottomLeft" type="Number" integer="true" />
    /// <field name="BottomCenter" type="Number" integer="true" />
    /// <field name="BottomRight" type="Number" integer="true" />
    throw Error.invalidOperation();
};
ESRI.ADF.System.ContentAlignment.prototype = {
		TopLeft : 1,
		TopCenter : 2,
		TopRight : 4,
		MiddleLeft : 16,
		MiddleCenter : 32,
		MiddleRight : 64,
		BottomLeft : 256,
		BottomCenter : 512,
		BottomRight : 1024
};
ESRI.ADF.System.ContentAlignment.registerEnum("ESRI.ADF.System.ContentAlignment", false);

/* Callback / Partial postback methods */
__esriDoPostBack = ESRI.ADF.System.__DoPostBack = function(uniqueId, clientId, argument, clientCallback, context) {
	var status = Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack();
	if(status) {
		if(!ESRI.ADF.System._postBackQueue) { ESRI.ADF.System._postBackQueue = []; }
		var fnc = Function.createDelegate(this, function() { ESRI.ADF.System.__DoPostBack(uniqueId, clientId, argument, clientCallback, context) });
		Array.add(ESRI.ADF.System._postBackQueue,fnc);
	}
	else {
		if(clientCallback) {
			var _fncLoading = function(sender, args) {
				Sys.WebForms.PageRequestManager.getInstance().remove_pageLoading(_fncLoading);
				clientCallback(sender, args, clientId, context);
			}
			Sys.WebForms.PageRequestManager.getInstance().add_pageLoading(_fncLoading);
		}
		__doPostBack(uniqueId, argument);
	}
	
};
ESRI.ADF.System._checkQueue = function() {
	if(ESRI.ADF.System._postBackQueue && ESRI.ADF.System._postBackQueue.length>0) {
		var fnc = ESRI.ADF.System._postBackQueue[0];
		Array.removeAt(ESRI.ADF.System._postBackQueue,0);
		fnc();
	}
};
if(Sys.WebForms) {
	Sys.Application.add_init(function() {
		Sys.WebForms.PageRequestManager.getInstance().add_endRequest(ESRI.ADF.System._checkQueue);
	});
};

ESRI.ADF.System.ProcessMSAjaxCallbackResult = function(sender, args, controlId, context) {
	/// <summary>Helper method for processing callbackresults returned from a Microsoft AJAX partial postback</summary>
	var dataItems = args.get_dataItems();
	if(dataItems[controlId])
		ESRI.ADF.System.processCallbackResult(dataItems[controlId],context);
};

ESRI.ADF.System._doCallback = function(callbackFunctionString, uniqueID, id, argument, context) {
	if(ESRI.ADF.System.checkSessionExpired()) return;
	if(callbackFunctionString && !callbackFunctionString.startsWith('__esriDoPostBack'))
	{
		if(callbackFunctionString) {
			window.setTimeout(Function.createDelegate(context,function() { eval(callbackFunctionString) }),0);
		}
	}
	else {
		ESRI.ADF.System.__DoPostBack(uniqueID, id, argument, ESRI.ADF.System.ProcessMSAjaxCallbackResult, context);			
	}
};

ESRI.ADF.System.__epsilon = 1E-12;

processCallbackResult = ESRI.ADF.System.processCallbackResult = function(response, context) {
	/// <summary>Processes the collection of JSON formatted CallbackResults returned from the server after a callback</summary>
	/// <param name="response" type="Array" elementType="Object">Array of callbackresult objects</param>
	/// <param name="context" type="Object" optional="true" mayBeNull="true">The context that javascript actions should happen executed in.</param>
	/// <remarks>
	/// <para>This method is automatically called by the WebADF controls either directly from a callback or from
	/// <see cref="ESRI.ADF.System.ProcessMSAjaxCallbackResult"/> from a partial postback.</para>
	/// <para>
	/// You can call this method from a serverside partial postback invoked by controls outside the WebADF to process the
	/// callbackresults from other controls by registering a ClientScriptBlock:
	/// <example>
	/// <code language="C#">
	///		Map1.Extent = Map1.Extent.Expand(50); //Zoom out
	///		ScriptManager.RegisterClientScriptBlock(Button1,Button1.GetType(),"myCallbackResults",
	///			String.Format("ESRI.ADF.System.processCallbackResult({0},null)", Map1.CallbackResults.ToString()), true);
	/// </code>
	/// </example>	
	/// </para>
	/// <para>
	/// Each CallbackResult object must contain the following fields:<br/>
	///		"action" : Name of the callback action.<br/>
	///		"id" : ID of Control/Element/Component to perform the action against.<br/>
	///		"params" : An array of parameters for performing the action.<br/>
	/// <para>If the control performing the callback implements a 'processCallbackResult' method, this method will be called
	/// if the action parameter is not part of the default actions. This enables you to extend the number of supported actions on a given control.</para>
	/// <para>
	/// Default supported actions:<br/>
	///		'javascript' : Evaluates the javascript provided in the first parameter.<br/>
	///		'content' : Replaces the HTML content of an HTML control, with the html string provided in the first parameter.<br/>
	///		'innercontent': Replaces the inner content of an HTML control, excluding the html control itself, with the html string provided in the first parameter.<br/>
	///		'image': Sets the src of an image control with the url provided in the first parameter.<br/>
	///		'set': Sets the properties of a Sys.Component. First parameter is a propertyname/value pair object. The component must have a setter for the propertyname (componentType.set_[name]).<br/>
	///		'invoke': Invokes a method on a Sys.Component. First parameter is the method name and second an optional object or an array of objects to parse as arguments to the method.<br/>
	/// </para>
	/// </remarks>
	if(!response) { return; }
	var results=[];
	if(response.startsWith('///:::')) { //9.2 callback result format - OBSOLETE
		var pairs = response.split("^^^");
		for (var k=0;k<pairs.length;k++) {
			var item = pairs[k];
			if (item===null || item.length===0) { continue; }		
			var actions = item.split(":::");
			if(actions.length<3) { continue; }
			var type = actions[0].toLowerCase();
			var cntlID = actions[1];
			var actn = actions[2].toLowerCase();
			var pars = [];
			for(var j=3;j<actions.length;j++) {
				Array.add(pars,actions[j]);
			}
			Array.add(results,{"id":cntlID,"type":type,"action":actn,"params":pars});
		}
	}
	else { //JSON formatted callbackresults
		try { results = eval(response); }
		catch(ex) {
			Sys.Debug.trace('Failed to process page response: "' + response + '"');
			return;
		} 
	}
	ESRI.ADF.System.resetSessionLapse();
	var validResponse = false;
	for (var idx=0;idx<results.length;idx++)
	{	
		var result = results[idx];
		var controlID = result.id;
		var controlType = result.type;
		var obj = null;
		if(controlID) { obj = $find(controlID); }
		var action = result.action.toLowerCase();
		var params = result.params;
		//
		// Process generic actions
		//
		if(action==='javascript') {
			var method = function() {
				try { eval(params[0]); }
				catch(ex) { Sys.Debug.trace('CallbackResult[javascript]: Could not evaluate JavaScript: ' + params[0] +'\\n' + ex.name+' (' + ex.number + '):\\n' + ex.message); }
			};
			if(obj || context) {
				//If there is an object or context, perform the javascript in the context of that
				Function.createDelegate(obj?obj:context,method)();
			}
			else { method(); }
			validResponse = true;
			continue;
		}
		else if (action==="content") {
			var o = $get(controlID);
			if (o) { o.outerHTML=params[0]; }
			else { Sys.Debug.trace('CallbackResult[content]: Element "' + controlID + '" not found'); }			
			validResponse = true; 
			continue;
		}
		else if (action==="innercontent") {
			var o2 = $get(controlID);
			if (o2) { o2.innerHTML=params[0]; validResponse = true; }
			else { Sys.Debug.trace('CallbackResult[innercontent]: Element "' + controlID + '" not found'); }
			continue;
		}
		else if (action==="image")
		{
			var o3 = $get(controlID);
			if (o3) { o3.src = params[0]; }
			else { Sys.Debug.trace('CallbackResult[image]: Image element "' + controlID + '" not found'); }
			validResponse = true; 
			continue;
		}
		else if (action==="set")
		{
			if(obj) {
				var properties = params[0];
				if(String.isInstanceOfType(params[0])) {
					properties = eval('('+params[0]+')');
				}
				for(var name in properties) {
					var val = properties[name];
					var setter = obj["set_" + name];
					if (setter && typeof(setter) === 'function') { setter.apply(obj, [val]); }
					else { obj.name = val; }
				}
			}
			else { Sys.Debug.trace('CallbackResult[set]: Component "' + controlID + '" not found'); }
			validResponse = true;
			continue;
		}
		else if (action==='invoke') {
			var method = null;
			var methodname = params[0];
			if(obj) { //Find method on object
				method = obj[methodname];
			}
			else if(!controlID) { //if no object, look for global method
				try { method = eval('('+methodname+')'); }
				catch(ex) { }
			}
			else {
				Sys.Debug.trace('CallbackResult[invoke]: Component "' + controlID + '" not found');
				continue;
			}
			if(method && typeof(method) == 'function') {
				var args = params[1];
				if(args) {
					if(Array.isInstanceOfType(args)) { method.apply(obj,args); }
					else { method.apply(obj,[args]); }
				}
				else { method.apply(obj); }
			}
			else { Sys.Debug.trace('CallbackResult[invoke]: Invalid method "' + (controlID?controlID+'.':'')+methodname + '"'); }
			validResponse = true;
			continue;
		}
		else if (action=='include') {
			var id = params[0];
			var elm = (id?$get(id):null);
			if(elm) { elm.parentNode.removeChild(elm); }
			elm=null;
			var src = params[1];
			var tagname = params[2];
			var type = params[3];
			var language = params[4];
			elm = document.createElement(tagname);
			if(id) { elm.id = id; }
			if(tagname==='link') { elm.href = src; }
			else { elm.src = src; }
			if(type) { 
				elm.type = type;
				if(type==='text/css') { elm.rel = 'stylesheet'; }
			}
			if(language) { elm.language = language; }
			document.getElementsByTagName('head').item(0).appendChild(elm);
			validResponse = true;
			continue;
		}
		//
		// Process control specific actions
		//
		else if(obj && obj.processCallbackResult) {
			//if control has its own handler, use that:
			validResponse = obj.processCallbackResult(result.action,params);
			if (obj._cancelled) {
	            // Cancel remaining actions. This happens fx. on task cancelled
	            obj._cancelled = false;
	            return;
	        }
			continue;
		}
		if(!validResponse) {
			Sys.Debug.trace('CallbackResult action "' + action+ '" couldn\'t be processed.');
		}
	}
	if (validResponse)
	{
		lastResponseReceivedTime=new Date();
	}
};

Type.registerNamespace('ESRI.ADF.UI.__DomEvent');

ESRI.ADF.UI.__DomEvent = function(e) {
	/// <summary>This dom event handler is to circumvent a bug in the MS Ajax framework when
	/// events fire on disabled DOM elements.</summary>
	var target = e.target ? e.target : e.srcElement;
	if ((target !== window) && (target !== document) &&
        !(window.HTMLElement && (target instanceof HTMLElement)) &&
        (typeof(target.nodeName) !== 'string')) {
			e.target = document.body; 
    }
    if(target.parentNode==null) return;
	ESRI.ADF.UI.__DomEvent.initializeBase(this, [e]);
};
ESRI.ADF.UI.__DomEvent.registerClass('ESRI.ADF.UI.__DomEvent',Sys.UI.DomEvent);

ESRI.ADF.UI.__DomEvent.__addHandler = function (element, eventName, handler) {
	/// <summary>This addHandler is to circumvent a bug in the MS Ajax framework when
	/// document events fire on disabled DOM elements.</summary>
	/// <remarks>The code is a copy of the MS Ajax code but using the subclass
	/// ESRI.ADF.UI.__DomEvent instead of Sys.UI.DomEvent when events fire. The map control
	/// uses document events for mousemove and mouseup</remarks>
	/// <param name="element" domElement="true"></param>
	/// <param name="eventName" type="String"></param>
	/// <param name="handler" type="Function"></param>
	if (!element._events) {
		element._events = {};
	}
	var eventCache = element._events[eventName];
	if (!eventCache) {
		element._events[eventName] = eventCache = [];
	}
	var browserHandler;
	if (element.addEventListener) {
		browserHandler = function(e) {
			return handler.call(element, new ESRI.ADF.UI.__DomEvent(e));
		}
		element.addEventListener(eventName, browserHandler, false);
	}
	else if (element.attachEvent) {
		browserHandler = function() {
			return handler.call(element, new ESRI.ADF.UI.__DomEvent(window.event));
		}
		element.attachEvent('on' + eventName, browserHandler);
	}
	eventCache[eventCache.length] = {handler: handler, browserHandler: browserHandler};
};

ESRI.ADF.System.__getAbsoluteMousePosition = function(e) {
	var mouseX = 0;
	var mouseY = 0;
	if(e && typeof(e.pageX)!=='undefined' && typeof(e.pageY)!=='undefined') {
		mouseX=e.pageX;
		mouseY=e.pageY;
	}
	else {
		e = window.event;
		mouseX=event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
		mouseY=event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
	}
	return {"mouseX":mouseX,"mouseY":mouseY};
};

//Timeout handling
ESRI.ADF.System.__lastResponseRecievedTime = new Date();
ESRI.ADF.System.__sessionExpired = false;

ESRI.ADF.System.checkSessionExpired = function() {
	/// <summary>
	/// Checks whether the session has expired no server, and displays an alert if that is the case.
	/// </summary>
	/// <returns type="Boolean">True if the session has expired.</returns>
    var now = new Date();
    var last = ESRI.ADF.System.__lastResponseRecievedTime;
    var diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60));
    if(!ESRI.ADF.System.maximumLapseTime) { return false; } //Undefined/null/0/Negative: Never time out
    var hasExpired = (diff>=ESRI.ADF.System.maximumLapseTime);
    if(hasExpired && !ESRI.ADF.System.__sessionExpired) { 
		ESRI.ADF.System.__sessionExpired = true;
		ESRI.ADF.System.showLapseAlert();
	}
    return hasExpired;
};

ESRI.ADF.System.resetSessionLapse = function () {
    /// <summary>
	/// Resets the session lapse. Should be called on each request back to the page to reset session timeout counter.
	/// </summary>
	/// <return />
    ESRI.ADF.System.__lastResponseRecievedTime = new Date();
};

ESRI.ADF.System.showLapseAlert = function() {
	/// <summary>
	/// Displays an alert indicating session has lapsed. Override this method for displaying a custom alert.
	/// </summary>
    /// <return />
    alert("Session has timed out from extended inactivity. A new session must be started to use this application by closing this browser and reopening.");
};

ESRI.ADF.System.escapeForCallback = function(toEscape) {
	/// <summary>
	/// Replaces all occurences of the '&' character with a place holder '___amp___' value since the '&'
	/// character is used as a seperator between callback arguments.
	/// The corresponding substitution is made server side in 
	/// ESRI.ArcGIS.ADF.Web.UI.WebControls.CallbackUtility.ParseStringIntoNameValueCollection
	/// </summary>    
	/// <param name="toEscape" type="String">The string value to escape</param>
	/// <returns>escaped string</return>
    if (toEscape)   
    {
		toEscape = toEscape.replace(/&/g, "__amp__");	
	}
	return toEscape;
};


if (typeof(Sys) !== 'undefined') { Sys.Application.notifyScriptLoaded(); }