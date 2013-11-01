// Register the namespace for the control.
Type.registerNamespace('ESRI.ADF.Tasks.UI');

ESRI.ADF.Tasks.UI.FindPlaceTaskWebConfigurator = function(element) {
    ESRI.ADF.Tasks.UI.FindPlaceTaskWebConfigurator.initializeBase(this, [element]);                    
    
    this._layerSymbolEditorID = null;
    this._layerSymbolEditorComponent = null;
    this._FindPlaceTaskInstance = null;
    this._okButtonID = null;
    this._connectButtonID = null;
    this._imageProgressBarID = null;
    
    this._callbackFunctionString = null;
    this._titleTextID = null;
    this._buttonTextID = null;
    this._labelTextID = null;
    this._toolTipTextID = null; 
    this._maxRecordsTextID = null;
    this._mapTipCheckboxID = null;       
    
    this._dataSourceID = null;
    this._availablePlacesID = null;
    this._searchPlacesID = null;
    this._addButtonID = null;
    this._addAllButtonID = null;
    this._removeButtonID = null;
    this._removeAllButtonID = null;
    this._searchTypeID = null;

    this._ArcWebPlaceFinderInfo = null;
    this._ArcWebDataSourceInfo = null;
    
}

ESRI.ADF.Tasks.UI.FindPlaceTaskWebConfigurator.prototype = {
    initialize : function() {        
    	ESRI.ADF.Tasks.UI.FindPlaceTaskWebConfigurator.callBaseMethod(this, 'initialize');    	    	    	    	
    	this._populateUIFromTask();
    	$addHandler($get(this._okButtonID), "click", Function.createDelegate(this, this._onOkButtonClick));
    	$addHandler($get(this._connectButtonID), "click", Function.createDelegate(this, this._onConnectButtonClick));
    	$addHandler($get(this._dataSourceID), "change", Function.createDelegate(this, this._onDataSourceChange));
    	$addHandler($get(this._addButtonID), "click", Function.createDelegate(this, this._onAddButtonClick));
    	$addHandler($get(this._addAllButtonID), "click", Function.createDelegate(this, this._onAddAllButtonClick));
    	$addHandler($get(this._removeButtonID), "click", Function.createDelegate(this, this._onRemoveButtonClick));
    	$addHandler($get(this._removeAllButtonID), "click", Function.createDelegate(this, this._onRemoveAllButtonClick));
		this._hideProgressBar("");
    },    
    
    dispose : function() {                    
        $clearHandlers(this._element);   
        //TODO:- clear handlers for other elements as well       
        ESRI.ADF.Tasks.UI.FindPlaceTaskWebConfigurator.callBaseMethod(this, 'dispose');
    },        
    
    ///
    /// Event handlers
    ///    
    _onDataSourceChange : function(e) {
		var ddlDataSource = $get(this._dataSourceID);
		var selectedIndex = ddlDataSource.selectedIndex;
        var listboxAvailable = $get(this._availablePlacesID);
        var listboxSearch = $get(this._searchPlacesID);

        this._clearPlaces();

		// Populate Available and Search places.
        for (var i=0; i < this._ArcWebPlaceFinderInfo[selectedIndex].types.length; i++)
        {
			listboxAvailable.options[i] = new Option(this._ArcWebPlaceFinderInfo[selectedIndex].types[i].value, this._ArcWebPlaceFinderInfo[selectedIndex].types[i].key);
			listboxSearch.options[i]    = new Option(this._ArcWebPlaceFinderInfo[selectedIndex].types[i].value, this._ArcWebPlaceFinderInfo[selectedIndex].types[i].key);
        }
    },
  
    _onOkButtonClick : function(e) {                
        this._ensureSymbolsEditor();
        var defaultRenderer = this._layerSymbolEditorComponent.get_defaultRenderer();
        var highlightRenderer = this._layerSymbolEditorComponent.get_highlightRenderer();
        var defaultRendererJSON = Sys.Serialization.JavaScriptSerializer.serialize(defaultRenderer);
        var highlightRendererJSON = Sys.Serialization.JavaScriptSerializer.serialize(highlightRenderer);
        
		var ddlDataSource = $get(this._dataSourceID);
		var selectedIndex = ddlDataSource.selectedIndex;
        var listboxAvailable = $get(this._availablePlacesID);
        var listboxSearch = $get(this._searchPlacesID);
        var ddlSearchType = $get(this._searchTypeID);
        var txtBoxLabelText = $get(this._labelTextID);
        var txtBoxToolTipText = $get(this._toolTipTextID);
        var txtBoxMaxRecordsText = $get(this._maxRecordsTextID);
        var checkBoxMapTipShow = $get(this._mapTipCheckboxID);
        var SearchType = "";
        var SearchPlaces = "";
		var dataSourceValue = "";
		if (ddlSearchType.options.length > 0)
		{
			SearchType = ddlSearchType.options[ddlSearchType.selectedIndex].value;
		}
		if (selectedIndex >= 0)
		{
			dataSourceValue = this._ArcWebPlaceFinderInfo[selectedIndex].dataSource;
        }
        
        // Get Search Places -- If Available and Search equal, use empty string.
        if (listboxAvailable.options.length != listboxSearch.options.length)
        {
			for (var i=0; i < listboxSearch.options.length; i++)
			{
				if (i > 0)
					SearchPlaces = SearchPlaces + ",";
				SearchPlaces = SearchPlaces + listboxSearch.options[i].value;
			}
        }

        // Update task instance object
        this._getTaskFromUI();
        var json = Sys.Serialization.JavaScriptSerializer.serialize(this._FindPlaceTaskInstance);

        // Escape literal ampersand characters as they are used as separators in our callback format
        json = ESRI.ADF.System.escapeForCallback(json);

        var argument = 'EventArg=taskConfiguredOk&taskAsJSON=' + json + '&defaultRendererJSON=' + defaultRendererJSON + '&highlightRendererJSON=' + highlightRendererJSON +
					   '&LabelText=' + ESRI.ADF.System.escapeForCallback(txtBoxLabelText.value) + '&ToolTipText=' + ESRI.ADF.System.escapeForCallback(txtBoxToolTipText.value)  +  '&MaxRecordsText=' + txtBoxMaxRecordsText.value + '&MapTipShow=' + checkBoxMapTipShow.checked + '&DataSource=' + dataSourceValue + '&SearchPlaces=' + SearchPlaces  + '&SearchType=' + SearchType;
        var context = null;
        // make a callback to save the task configuration
        eval(this._callbackFunctionString);
    },    
    
    _onConnectButtonClick : function(e) {
		this._showProgressBar();
	},
	
    _onAddButtonClick : function(e) {            
        var listboxAvailable = $get(this._availablePlacesID);
        var listboxSearch = $get(this._searchPlacesID);
		var selectedIndex = listboxAvailable.selectedIndex;

   		if (selectedIndex >= 0)
   		{	// Item selected to add
   			var selectedValue = listboxAvailable.options[selectedIndex].value;

			// check if already exist.
			var exist = "false";
			for (var i=0; i < listboxSearch.options.length; i++)
			{
				if (selectedValue == listboxSearch.options[i].value)
				{
					exist = "true";
				}
			}
			// add if doesn't exist
			if (exist == "false")
			{
				listboxSearch.options[listboxSearch.options.length] = new Option(listboxAvailable.options[selectedIndex].text, listboxAvailable.options[selectedIndex].value);
			}
		}
	},

    _onAddAllButtonClick : function(e) {                
        var listboxAvailable = $get(this._availablePlacesID);
        var listboxSearch = $get(this._searchPlacesID);

		//remove all from Search listbox.
		var searchLength = listboxSearch.options.length;
		for (var y=0; y < searchLength; y++)
		{
			listboxSearch.options[0] = null;
		}
		listboxSearch.options.length = 0;

        //add all available items.
        for (var i=0; i < listboxAvailable.options.length; i++)
        {
			listboxSearch.options[i] = new Option(listboxAvailable.options[i].text, listboxAvailable.options[i].value);
        }
	},

    _onRemoveButtonClick : function(e) {                
        var listboxSearch = $get(this._searchPlacesID);
		var selectedIndex = listboxSearch.selectedIndex;

		if (selectedIndex >= 0)
		{
   			var selectedValue = listboxSearch.options[selectedIndex].value;

			for (var i=0; i < listboxSearch.options.length; i++)
			{
				if (selectedValue == listboxSearch.options[i].value)
				{
					listboxSearch.options[i] = null;
				}
			}
		}
	},

    _onRemoveAllButtonClick : function(e) {                
        var listboxSearch = $get(this._searchPlacesID);

		var searchLength = listboxSearch.options.length;
		for (var y=0; y < searchLength; y++)
		{
			listboxSearch.options[0] = null;
		}
		listboxSearch.options.length = 0;
	},

    _clearPlaces : function() {
        var listboxAvailable = $get(this._availablePlacesID);
        var listboxSearch = $get(this._searchPlacesID);

		var availableLength = listboxAvailable.options.length;
		for (var x=0; x < availableLength; x++)
		{
			listboxAvailable.options[0] = null;
		}
		listboxAvailable.options.length = 0;

		var searchLength = listboxSearch.options.length;
		for (var y=0; y < searchLength; y++)
		{
			listboxSearch.options[0] = null;
		}
		listboxSearch.options.length = 0;
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
        var task = this._FindPlaceTaskInstance;
        $get(this._titleTextID).value = task.Title ? task.Title : "";         
        $get(this._buttonTextID).value = task.ButtonText ? task.ButtonText : "";        
        $get(this._labelTextID).value = task.LabelText ? task.LabelText : "";        
        $get(this._toolTipTextID).value = task.ToolTip ? task.ToolTip : "";
        $get(this._maxRecordsTextID).value = task.MaxRecords ? task.MaxRecords : "50";
        $get(this._mapTipCheckboxID).checked = task.MapTip;
    },     
    
    _getTaskFromUI : function() {
        var task = this._FindPlaceTaskInstance;
        task.Title = $get(this._titleTextID).value; 
        task.ButtonText = $get(this._buttonTextID).value;
        task.LabelText = $get(this._labelTextID).value;
        task.ToolTip = $get(this._toolTipTextID).value; 
        task.MaxRecords = $get(this._maxRecordsTextID).value; 
        task.MapTip = $get(this._mapTipCheckboxID).checked;
    },    
    
    _ensureSymbolsEditor : function() {
        this._layerSymbolEditorComponent = (this._layerSymbolEditorComponent == null) ? $find(this._layerSymbolEditorID) : this._layerSymbolEditorComponent;
    },
    
    ///
    /// Methods called from server
    ///
    _onPopulateFindPlace : function(dataSourceData, findData) {
		this._ArcWebDataSourceInfo = dataSourceData;
		this._ArcWebPlaceFinderInfo = findData;		
		// Populate listboxes and select it using the data
        var dropdown = $get(this._dataSourceID);
        var listboxAvailable = $get(this._availablePlacesID);
        var listboxSearch = $get(this._searchPlacesID);

		// Clear listboxes
        this._clearPlaces();
        
        // Remove existing Data Source items.
        var dataLength = dropdown.options.length;
        for (var x=0; x < dataLength; x++)
        {// delete item.
			dropdown.options[0] = null;
        }
        dropdown.options.length = 0;
        
        // Populate Data source items.
        for (var i=0; i < this._ArcWebDataSourceInfo.length; i++)
        {
			dropdown.options[i] = new Option(this._ArcWebDataSourceInfo[i].title, this._ArcWebDataSourceInfo[i].name);
        }
        dropdown.options[0].selected = true;

		// default - Populate places with first data source item.
        for (var i=0; i < this._ArcWebPlaceFinderInfo[0].types.length; i++)
        {
			listboxAvailable.options[i] = new Option(this._ArcWebPlaceFinderInfo[0].types[i].value, this._ArcWebPlaceFinderInfo[0].types[i].key);
			listboxSearch.options[i]    = new Option(this._ArcWebPlaceFinderInfo[0].types[i].value, this._ArcWebPlaceFinderInfo[0].types[i].key);
        }
		this._hideProgressBar("");
    },
    
    _showProgressBar : function() {
        var img = $get(this._imageProgressBarID)
        if(img)
            img.style.display = '';
    },
    
    _hideProgressBar : function(message) {
        var img = $get(this._imageProgressBarID)
        if(img)
            img.style.display = 'none';
            
        if (message.length > 0)
			alert(message);
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
    get_FindPlaceTaskInstance : function() {
        return this._FindPlaceTaskInstance;
    },
    set_FindPlaceTaskInstance : function(value) {
        this._FindPlaceTaskInstance = value;
    },
    get_DataSourceID : function() {
        return this._dataSourceID;
    },
    set_DataSourceID : function(value) {
        this._dataSourceID = value;
    },
    get_AvailablePlacesID : function() {
        return this._availablePlacesID;
    },
    set_AvailablePlacesID : function(value) {
        this._availablePlacesID = value;
    },
    get_SearchPlacesID : function() {
        return this._searchPlacesID;
    },
    set_SearchPlacesID : function(value) {
        this._searchPlacesID = value;
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
    get_maxRecordsTextID : function() {
        return this._maxRecordsTextID;
    },
    set_maxRecordsTextID : function(value) {
        this._maxRecordsTextID = value;
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
    },
    get_connectButtonID : function() {
        return this._connectButtonID;
    },
    set_connectButtonID : function(value) {
        this._connectButtonID = value;
    },
    get_imageProgressBarID : function() {
        return this._imageProgressBarID;
    },
    set_imageProgressBarID : function(value) {
        this._imageProgressBarID = value;
    },
	get_addButtonID : function() {
		return this._addButtonID;
	},
	set_addButtonID : function(value) {
		this._addButtonID = value;
	},
	get_addAllButtonID : function() {
		return this._addAllButtonID;
	},
	set_addAllButtonID : function(value) {
		this._addAllButtonID = value;
	},
	get_removeButtonID : function() {
		return this._removeButtonID;
	},
	set_removeButtonID : function(value) {
		this._removeButtonID = value;
	},
	get_removeAllButtonID : function() {
		return this._removeAllButtonID;
	},
	set_removeAllButtonID : function(value) {
		this._removeAllButtonID = value;
	},
	get_labelTextID : function() {
		return this._labelTextID;
	},
	set_labelTextID : function(value) {
		this._labelTextID = value;
	},
	get_searchTypeID : function() {
		return this._searchTypeID;
	},
	set_searchTypeID : function(value) {
		this._searchTypeID = value;
	},
	get_ArcWebPlaceFinderInfo : function() {
		return this._ArcWebPlaceFinderInfo;
	},
	set_ArcWebPlaceFinderInfo : function(value) {
		this._ArcWebPlaceFinderInfo = value;
	},
	get_ArcWebDataSourceInfo : function() {
		return this._ArcWebDataSourceInfo;
	},
	set_ArcWebDataSourceInfo : function(value) {
		this._ArcWebDataSourceInfo = value;
	}
}  

ESRI.ADF.Tasks.UI.FindPlaceTaskWebConfigurator.registerClass('ESRI.ADF.Tasks.UI.FindPlaceTaskWebConfigurator', Sys.UI.Control);

if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();

