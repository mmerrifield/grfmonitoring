// Register the namespace for the control.
Type.registerNamespace('ESRI.ADF.Tasks.UI');

ESRI.ADF.Tasks.UI.SearchAttributesTaskWebConfigurator = function(element) {
    ESRI.ADF.Tasks.UI.SearchAttributesTaskWebConfigurator.initializeBase(this, [element]);                    
    
    this._layerFormatEditor = null;
    this._SearchAttributesTaskInstance = null;
    this._okButtonID = null;
    
    this._callbackFunctionString = null;
    this._titleTextID = null;
    this._buttonTextID = null;
    this._labelTextID = null;
    this._toolTipTextID = null;    
    
    this._maxRecordsID = null;
    this._groupResultsByLayerID = null;
    this._layersLabelID = null;
    this._layersDropDownID = null;    

    this._showResultAttributesID = null;
    this._showResultsAsMapTipsID = null;
    this._useLayerFormattingID = null;
    this._useCustomFormattingID= null;
    
    this._previousLayerKey = null;
    this._layerFormats = new Object(); // client side datastore/cache of layer formats        
}

ESRI.ADF.Tasks.UI.SearchAttributesTaskWebConfigurator.prototype = {
    initialize : function() {        
    	ESRI.ADF.Tasks.UI.SearchAttributesTaskWebConfigurator.callBaseMethod(this, 'initialize');    	    	    	    	
    	this._populateUIFromTask();    	
    	this._previousLayerKey = this._getCurrentLayerKey();//store current layer key for use on layer change
    	
    	this._showHideLayerFormatEditor();
   	
    	$addHandler($get(this._layersDropDownID), "change", Function.createDelegate(this, this._onLayerChanged));
    	$addHandler($get(this._okButtonID), "click", Function.createDelegate(this, this._onOkButtonClick));
     	$addHandler($get(this._useLayerFormattingID), "click", Function.createDelegate(this, this._onUseLayerFormatClick));
      	$addHandler($get(this._useCustomFormattingID), "click", Function.createDelegate(this, this._onUseCustomFormatClick));
 },    
    
    dispose : function() {                    
        $clearHandlers(this._element);   
        //TODO:- clear handlers for other elements/ sub-components as well       
        ESRI.ADF.Tasks.UI.SearchAttributesTaskWebConfigurator.callBaseMethod(this, 'dispose');
    },    
    
    
    ///
    /// Event handlers
    ///    
    _onOkButtonClick : function(e) {         
        // Save the current layer definition         
       var layerFormatsAsJSON = ""; 
        var useCustomFormat =  $get(this._useCustomFormattingID);
        if (useCustomFormat.checked)
        { 
            var layerKey = this._getCurrentLayerKey();
            if (layerKey !== null)
                this._layerFormats[layerKey] = this._layerFormatEditor.get_layerFormat();                    
            layerFormatsAsJSON = Sys.Serialization.JavaScriptSerializer.serialize(this._layerFormats);
        }
        this._getTaskFromUI();
        var json = Sys.Serialization.JavaScriptSerializer.serialize(this._SearchAttributesTaskInstance);
        
        // Escape literal ampersand characters as they are used as separators in our callback format
        json = ESRI.ADF.System.escapeForCallback(json);
        
        var argument = 'EventArg=taskConfiguredOk&taskAsJSON=' + json + '&layerFormatsAsJSON=' + layerFormatsAsJSON;
        var context = null;
        // make a callback to save the task configuration
        eval(this._callbackFunctionString);
    },
    
    _onLayerChanged : function(e) {                
        
        // Save the previous layer def
        if (this._previousLayerKey !== null )
            this._layerFormats[this._previousLayerKey] = this._layerFormatEditor.get_layerFormat();
        
        // Load the selected layer 
        var layerKey = this._getCurrentLayerKey();
        if (layerKey !== null) 
            this._loadLayerFormatEditor(this._layerFormats[layerKey]);
       
       // Save the current key as the previous key for the next change
       this._previousLayerKey = layerKey;
    },    
    
    _getCurrentLayerKey : function() {
        var dropDown = $get(this._layersDropDownID)        
        var index = dropDown.selectedIndex;
        if (index < 0)
            return null; 
        var layerKey = dropDown.options[index].value;
        return layerKey; 
    },
    
    _onUseLayerFormatClick : function(e) {
       var useCustomFormat =  $get(this._useCustomFormattingID);
       useCustomFormat.checked = false;
       this._showHideLayerFormatEditor();
    },
    
    _onUseCustomFormatClick : function(e) {   
       var useLayerFormat = $get(this._useLayerFormattingID);
       useLayerFormat.checked = false;
        this._showHideLayerFormatEditor();
    },
    
    //
    // Public Methods (called by server side code)
    //    
    
    set_searchFields : function(searchFieldsString) {
        if(this._SearchAttributesTaskInstance != null)
            this._SearchAttributesTaskInstance.SearchFields = searchFieldsString;
    },        
    
    set_layerFormats : function(value) {
        this._layerFormats = value; 
        if (!this._layerFormats)
             this._layerFormats = new Object();
    },    
    
    layerAdded : function(layerName, layerDetails, layerFormatAsJSON) {                
        var dropDown = $get(this._layersDropDownID);
        var found = false;                
        for(var i=0;dropDown && i  < dropDown.options.length; i++)
        {
            if(dropDown.options[i].value == layerDetails) // keys match
            {
                found = true;
                this._layerFormats[layerDetails] = layerFormatAsJSON;
                break;
            }
        }
        if(!found)
        {
            // Add new option
            var len = dropDown.options.length;
            dropDown.options[len] = new Option(layerName, layerDetails);            
            
            this._layerFormats[layerDetails] = layerFormatAsJSON;
    	    
    	    if(len == 0) // first layer being added ?
    	    {
                // we need to explicitly initialize the editor with the first layer definition                
                this._loadLayerFormatEditor(this._layerFormats[layerDetails]);            
    	    }
        } 
    },
    
    layerRemoved : function(layerName, layerDetails) {
        var dropDown = $get(this._layersDropDownID);        
        var requiredOptionIndex = -1;
        
        for(var i=0;dropDown && i  < dropDown.options.length; i++)
        {
            if(dropDown.options[i].value == layerDetails) // keys match
            {
                requiredOptionIndex = i;
                break;
            }
        }
        
       if (dropDown.selectedIndex == requiredOptionIndex)
       { 
            var nextSelectedOptionIndex = requiredOptionIndex - 1;
            if( nextSelectedOptionIndex >= dropDown.options.length)// Last option is to be deleted
                nextSelectedOptionIndex = dropDown.options.length -1;
                
             if (nextSelectedOptionIndex < 0) //First option was deleted
             {
                if (dropDown.options.length > 1) 
                    nextSelectedOptionIndex = 1;//select the second option if available
                else
                    nextSelectedOptionIndex = -1;
             }
            
            if(nextSelectedOptionIndex == -1) // no options/layers in the layer drop down
            {
                this._layerFormatEditor.hide(); // no layer format editor available !!!
            }
           else //set the selected option to something other than the removed option and refresh editor
           {
                dropDown.selectedIndex = nextSelectedOptionIndex;
                var newLayerKey = this._getCurrentLayerKey();
                this._loadLayerFormatEditor(this._layerFormats[newLayerKey]);
           }
       } 
        dropDown.options[requiredOptionIndex] = null; // delete the option            
        this._layerFormats[layerDetails] = null;
        this._showHideLayerFormatEditor();
    },    
    
    /// 
    /// Helper functions
    ///       
     _showHideLayerFormatEditor : function()
    {
        var layerDropDown = $get(this._layersDropDownID); 
        var layerLabel = $get(this._layersLabelID);
        var rdoUseCustomFormat =  $get(this._useCustomFormattingID);
        var useCustomFormat = rdoUseCustomFormat.checked;
        var rdoUseLayerFormat =  $get(this._useLayerFormattingID);
        
       //enable/Disable Layer Format Radio buttons
        if (layerDropDown.options.length > 0 )
       {
            rdoUseCustomFormat.disabled = false;
            rdoUseLayerFormat.disabled = false;
       }
       else
       {
            rdoUseCustomFormat.disabled = true;
            rdoUseLayerFormat.disabled = true;
       }

        if (useCustomFormat && layerDropDown.options.length > 0)
        { 
            this._layerFormatEditor.show();
            layerLabel.style.visibility = 'visible';
            layerDropDown.style.visibility = 'visible';
       } 
        else
        {     
            //save layer format 
            var layerKey = this._getCurrentLayerKey();
            if (layerKey !== null)
                this._layerFormats[layerKey] = this._layerFormatEditor.get_layerFormat();                    

            this._layerFormatEditor.hide();
            layerLabel.style.visibility = 'hidden';
            layerDropDown.style.visibility = 'hidden';
        } 
    },
    _populateUIFromTask : function() {
        var task = this._SearchAttributesTaskInstance;
        $get(this._titleTextID).value = task.Title ? task.Title : "";         
        $get(this._buttonTextID).value = task.ButtonText ? task.ButtonText : "";
        $get(this._labelTextID).value = task.LabelText ? task.LabelText : "";
        $get(this._toolTipTextID).value = task.ToolTip ? task.ToolTip : "";
        
        $get(this._maxRecordsID).value = task.MaxRecords ? task.MaxRecords : "";
        $get(this._groupResultsByLayerID).checked = task.GroupResultsByTable ? task.GroupResultsByTable : false;
        $get(this._showResultAttributesID).checked = task.ShowFieldAttributes ? task.ShowFieldAttributes : false;
        $get(this._showResultsAsMapTipsID).checked = task.ShowResultsAsMapTips ? task.ShowResultsAsMapTips : false;
        $get(this._useLayerFormattingID).checked = task.UseCustomLayerFormat ? false : true;
        $get(this._useCustomFormattingID).checked = task.UseCustomLayerFormat ? task.UseCustomLayerFormat : false;
    
    },     
    
    _getTaskFromUI : function() {
        var task = this._SearchAttributesTaskInstance;
        
        task.Title = $get(this._titleTextID).value; 
        task.ButtonText = $get(this._buttonTextID).value;
        task.LabelText = $get(this._labelTextID).value;
        task.ToolTip = $get(this._toolTipTextID).value;
        
        task.MaxRecords = $get(this._maxRecordsID).value;
        task.GroupResultsByTable = $get(this._groupResultsByLayerID).checked;       
        task.ShowFieldAttributes = $get(this._showResultAttributesID).checked;
        task.ShowResultsAsMapTips = $get(this._showResultsAsMapTipsID).checked;
        task.UseCustomLayerFormat = $get(this._useCustomFormattingID).checked;
 
    },    
        
    _loadLayerFormatEditor : function(layerFormat) {
        this._layerFormatEditor.set_layerFormat(layerFormat);        
        this._layerFormatEditor.refresh();
        this._showHideLayerFormatEditor();
    },
    
    ///
    /// Script descriptor element/properties
    ///
    get_layerFormatEditor : function() {
        return this._layerFormatEditor;
    },
    set_layerFormatEditor : function(value) {
        this._layerFormatEditor = value;    	   	    	
    },
    get_callbackFunctionString : function() {
        return this._callbackFunctionString;
    },
    set_callbackFunctionString : function(value) {
        this._callbackFunctionString = value;
    },
    get_SearchAttributesTaskInstance : function() {
        return this._SearchAttributesTaskInstance;
    },
    set_SearchAttributesTaskInstance : function(value) {
        this._SearchAttributesTaskInstance = value;
    },
    get_layersLabelID : function() {
        return this._layersLabelID;
    },
    set_layersLabelID : function(value) {
        this._layersLabelID = value;
    },
    get_layersDropDownID : function() {
        return this._layersDropDownID;
    },
    set_layersDropDownID : function(value) {
        this._layersDropDownID = value;
    },
    get_buttonTextID : function() {
        return this._buttonTextID;
    },
    set_buttonTextID : function(value)  {
        this._buttonTextID = value;
    },
    get_labelTextID : function() {
        return this._labelTextID;
    },
    set_labelTextID : function(value) {
        this._labelTextID = value;
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
    get_maxRecordsID : function() {
        return this._maxRecordsID;
    },
    set_maxRecordsID : function(value) {
        this._maxRecordsID = value;
    },
    get_groupResultsByLayerID : function() {
        return this._groupResultsByLayerID;
    },
    set_groupResultsByLayerID : function(value) {
        this._groupResultsByLayerID = value;
    },
    get_showResultAttributesID : function() {
        return this._showResultAttributesID;
    },
    set_showResultAttributesID : function(value) {
        this._showResultAttributesID = value;
    },
    get_showResultsAsMapTipsID : function() {
        return this._showResultsAsMapTipsID;
    },
    set_showResultsAsMapTipsID : function(value) {
        this._showResultsAsMapTipsID = value;
    },
    get_useLayerFormattingID : function() {
        return this._useLayerFormattingID;
    },
    set_useLayerFormattingID : function(value) {
        this._useLayerFormattingID = value;
    },
    get_useCustomFormattingID : function() {
        return this._useCustomFormattingID;
    },
    set_useCustomFormattingID : function(value) {
        this._useCustomFormattingID = value;
    },
    get_okButtonID : function() {
        return this._okButtonID;
    },
    set_okButtonID : function(value) {
        this._okButtonID = value;
    }
}  

ESRI.ADF.Tasks.UI.SearchAttributesTaskWebConfigurator.registerClass('ESRI.ADF.Tasks.UI.SearchAttributesTaskWebConfigurator', Sys.UI.Control);

if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();

