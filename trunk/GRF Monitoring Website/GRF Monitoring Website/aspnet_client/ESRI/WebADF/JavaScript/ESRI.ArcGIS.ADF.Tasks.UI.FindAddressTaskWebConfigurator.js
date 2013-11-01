// Register the namespace for the control.
Type.registerNamespace('ESRI.ADF.Tasks.UI');

ESRI.ADF.Tasks.UI.FindAddressTaskWebConfigurator = function(element) {
    ESRI.ADF.Tasks.UI.FindAddressTaskWebConfigurator.initializeBase(this, [element]);                    
    
    this._layerSymbolEditorID = null;
    this._layerSymbolEditorComponent = null;
    this._FindAddressTaskInstance = null;
    this._okButtonID = null;
    
    this._callbackFunctionString = null;
    this._titleTextID = null;
    this._buttonTextID = null;
    this._labelTextID = null;
    this._toolTipTextID = null; 
    this._mapTipCheckboxID = null;       
    
    this._geocodeResourcesDropDownID = null;    
}

ESRI.ADF.Tasks.UI.FindAddressTaskWebConfigurator.prototype = {
    initialize : function() {        
    	ESRI.ADF.Tasks.UI.FindAddressTaskWebConfigurator.callBaseMethod(this, 'initialize');    	    	    	    	
    	this._populateUIFromTask();
    	$addHandler($get(this._okButtonID), "click", Function.createDelegate(this, this._onOkButtonClick));
    },    
    
    dispose : function() {                    
        $clearHandlers(this._element);   
        //TODO:- clear handlers for other elements as well       
        ESRI.ADF.Tasks.UI.FindAddressTaskWebConfigurator.callBaseMethod(this, 'dispose');
    },        
    
    ///
    /// Event handlers
    ///    
    _onOkButtonClick : function(e) {                
        this._ensureSymbolsEditor();
        var defaultRenderer = this._layerSymbolEditorComponent.get_defaultRenderer();
        var highlightRenderer = this._layerSymbolEditorComponent.get_highlightRenderer();
        var defaultRendererJSON = Sys.Serialization.JavaScriptSerializer.serialize(defaultRenderer);
        var highlightRendererJSON = Sys.Serialization.JavaScriptSerializer.serialize(highlightRenderer);
        
        // Update task instance object
        this._getTaskFromUI();
        var json = Sys.Serialization.JavaScriptSerializer.serialize(this._FindAddressTaskInstance);

        // Escape literal ampersand characters as they are used as separators in our callback format
        json = ESRI.ADF.System.escapeForCallback(json);

        var argument = 'EventArg=taskConfiguredOk&taskAsJSON=' + json + '&defaultRendererJSON=' + defaultRendererJSON + '&highlightRendererJSON=' + highlightRendererJSON;
        var context = null;
        // make a callback to save the task configuration
        eval(this._callbackFunctionString);
    },    
    
    //
    // Public Methods (called by server side code or client side)
    //    
    _setRenderers : function(defaultRenderer, highlightRenderer) {
        this._layerSymbolEditorComponent = (this._layerSymbolEditorComponent == null) ? $find(this._layerSymbolEditorID) : this._layerSymbolEditorComponent;
        if(this._layerSymbolEditorComponent)
        {
            this._layerSymbolEditorComponent.set_defaultRenderer(defaultRenderer);
            this._layerSymbolEditorComponent.set_highlightRenderer(highlightRenderer);
        }
    },
    
    /// 
    /// Helper functions
    ///           
    _populateUIFromTask : function() {
        var task = this._FindAddressTaskInstance;
        $get(this._titleTextID).value = task.Title ? task.Title : "";         
        $get(this._buttonTextID).value = task.ButtonText ? task.ButtonText : "";        
        $get(this._toolTipTextID).value = task.ToolTip ? task.ToolTip : "";
        $get(this._mapTipCheckboxID).checked = task.MapTip;
        
        var dropdown = $get(this._geocodeResourcesDropDownID);
        for(var i=0;dropdown && i < dropdown.options.length; i++)        
        {
            if(dropdown.options[i].value == task.GeocodeResource)
            {
                dropdown.selectedIndex = i;
                break;
            }            
        }
    },     
    
    _getTaskFromUI : function() {
        var task = this._FindAddressTaskInstance;
        
        task.Title = $get(this._titleTextID).value; 
        task.ButtonText = $get(this._buttonTextID).value;        
        task.ToolTip = $get(this._toolTipTextID).value; 
        task.MapTip = $get(this._mapTipCheckboxID).checked;

        var dropdown = $get(this._geocodeResourcesDropDownID);
        task.GeocodeResource = dropdown.value;
    },    
    
    _ensureSymbolsEditor : function() {
        this._layerSymbolEditorComponent = (this._layerSymbolEditorComponent == null) ? $find(this._layerSymbolEditorID) : this._layerSymbolEditorComponent;
    },
    
    ///
    /// Script descriptor element/properties
    ///
    get_layerSymbolEditorID : function() {
        return this._layerSymbolEditorID;
    },
    set_layerSymbolEditorID : function(value) {
        this._layerSymbolEditorID = value;
    },
    get_callbackFunctionString : function() {
        return this._callbackFunctionString;
    },
    set_callbackFunctionString : function(value) {
        this._callbackFunctionString = value;
    },
    get_FindAddressTaskInstance : function() {
        return this._FindAddressTaskInstance;
    },
    set_FindAddressTaskInstance : function(value) {
        this._FindAddressTaskInstance = value;
    },
    get_geocodeResourcesDropDownID : function() {
        return this._geocodeResourcesDropDownID;
    },
    set_geocodeResourcesDropDownID : function(value) {
        this._geocodeResourcesDropDownID = value;
    },
    get_buttonTextID : function() {
        return this._buttonTextID;
    },
    set_buttonTextID : function(value)  {
        this._buttonTextID = value;
    },    
    get_titleTextID : function() {
        return this._titleTextID;
    },
    set_titleTextID : function(value) {
        this._titleTextID = value;
    },
    get_toolTipTextID : function() {
        return this._toolTipTextID;
    },
    set_toolTipTextID : function(value) {
        this._toolTipTextID = value;
    },    
    get_mapTipCheckboxID : function() {
        return this._mapTipCheckboxID;
    },
    set_mapTipCheckboxID : function(value) {
        this._mapTipCheckboxID = value;
    },    
    get_okButtonID : function() {
        return this._okButtonID;
    },
    set_okButtonID : function(value) {
        this._okButtonID = value;
    }
}  

ESRI.ADF.Tasks.UI.FindAddressTaskWebConfigurator.registerClass('ESRI.ADF.Tasks.UI.FindAddressTaskWebConfigurator', Sys.UI.Control);

if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();

