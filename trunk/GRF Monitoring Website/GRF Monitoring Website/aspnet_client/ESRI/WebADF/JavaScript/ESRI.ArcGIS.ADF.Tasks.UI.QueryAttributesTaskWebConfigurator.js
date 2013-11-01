// Register the namespace for the control.
Type.registerNamespace('ESRI.ADF.Tasks.UI');

ESRI.ADF.Tasks.UI.QueryAttributesTaskWebConfigurator = function(element) {
    ESRI.ADF.Tasks.UI.QueryAttributesTaskWebConfigurator.initializeBase(this, [element]);                    
    
    this._layerFormatEditorComponent = null;
    this._callbackFunctionString = null;
    this._ids = null;
    this._defaultExpressionLabel = "";
    this._noQueryableLayersLabel = "";
    this._joinUsingOr = false;
    this._newExpressionIndex = 0;
    
    this._layerFormatEditor = null;
    this._titleText = null;
    this._buttonText = null;
    
    this._resourcesDropDown = null; // list of map resources    
    this._layersDropDown = null; // list of layers for current resource
    this._addButton = null; // button to add an expression
    this._removeButton = null; // button to remove selected expression
    this._expressionTable = null; // table containing expression values
    this._joinAndRadioButton = null; // checked to use AND for joining elements of WHERE clause
    this._joinOrRadionButton = null; // checked to use OR for joining elements of WHERE clause
    this._expressionLabelText = null; // label used to identify a query expression
    this._fieldsDropDown = null; // list of fields for current layer
    this._operatorsDropDown = null; // list of SQL operators
    this._typeInCheckBox = null; // checked to input query value in text box
    this._defaultValueText = null; // default query value
    this._showPickListCheckBox = null; // checked to show a list of query values in a drop down
    this._uniqueValuesButton = null; // button to retrieve unique values for current layer/field
    this._defaultValuesText = null; // text input to enter list of unique values
    this._activityIndicator = null; // AJAX activity image when retrieving sample values
    
    this._expressionsDropDown = null; // displayed when expressions have been created
    this._expressionsDisabledContainer = null; // displayed when no expressions have been created
    
    this._emptyValueText = null; // default value text displayed when a new expression is created
    this._emptyValuesText = null; // default values text displayed when a new expression is created
    
    this._maxRecords = null;
    this._groupResultsByLayer = null;
    this._showMapTips = null;
    this._showFieldAttributes = null;
    this._defaultFormatRadioButton = null;
    this._customFormatRadioButton = null;
    
    this._okButton = null;
    
    this._resources = null; // array of available map resources
    this._expressions = []; // array of configured query expressions
    this._expressionIndex = -1; // index of current query expression
    this._resourceIndex = 0; // index of current resource
    this._layerIndex = 0; // index of current layer
}

ESRI.ADF.Tasks.UI.QueryAttributesTaskWebConfigurator.prototype = {
    initialize: function() {
        ESRI.ADF.Tasks.UI.QueryAttributesTaskWebConfigurator.callBaseMethod(this, 'initialize');

        // Get UI elements from their ids
        this._getElements();

        // Set resource layer indices
        this._resourceIndex = this._resourcesDropDown.selectedIndex;
        this._layerIndex = this._layersDropDown.selectedIndex;

        // Create resources object. This object contains an array of service objects which each contains an array
        // of layer objects. The layer objects contain arrays for query expressions and layer fields.
        this._resources = [];
        for (var i = 0; i < this._resourcesDropDown.options.length; ++i) {
            this._resources[i] = {};
            if (i == this._resourceIndex) {
                // Add layers of initial service
                this._resources[i].previousLayerIndex = this._layerIndex;
                this._resources[i].Layers = [];
                var layerOptions = this._layersDropDown.options;
                if (layerOptions.length > 0) {
                    for (var j = 0; j < layerOptions.length; ++j) {
                        var layer = {};
                        this._resources[i].Layers[j] = layer;
                        layer.Name = layerOptions[j].text;
                        layer.Id = layerOptions[j].value;
                        if (j == this._layerIndex) {
                            // Add fields of initial layer
                            var fields = [];
                            layer.Fields = fields;
                            var fieldOptions = this._fieldsDropDown.options;
                            for (var k = 0; k < fieldOptions.length; ++k) {
                                fields[k] = fieldOptions[k].text;
                            }
                        }
                    }
                    this._layersDropDown.disabled = false;
                    this._addButton.disabled = false;
                }
                else {
                    this._layersDropDown.options[0] = new Option(this._noQueryableLayersLabel);
                    this._layersDropDown.disabled = true;
                    this._addButton.disabled = true;
                }
            }
        }

        // disable expression form elements if no expressions set
        // otherwise, add expressions
        var count = this._expressions.length;
        if (count === 0) {
            this._enableElements(this._expressionTable, false);
        }
        else {
            for (var i = 0; i < count; ++i) {
                this._expressionsDropDown.options[i] = new Option(this._expressions[i].labelText);
            }
            this._expressionsDropDown.selectedIndex = 0;
            this._expressionIndex = 0;
            this._enableExpressionForm(true);
            this._updateExpressionForm();
        }
		this._joinOrRadionButton.checked = this._joinUsingOr;

        $addHandler(this._resourcesDropDown, "change", Function.createDelegate(this, this._onResourceChanged));
        $addHandler(this._layersDropDown, "change", Function.createDelegate(this, this._onLayerChanged));
        $addHandler(this._addButton, "click", Function.createDelegate(this, this._onAddButtonClick));
        $addHandler(this._removeButton, "click", Function.createDelegate(this, this._onRemoveButtonClick));
        $addHandler(this._expressionLabelText, "change", Function.createDelegate(this, this._onLabelTextChanged));
        $addHandler(this._expressionsDropDown, "change", Function.createDelegate(this, this._onSelectedExpressionChanged));
        $addHandler(this._fieldsDropDown, "change", Function.createDelegate(this, this._onFieldChanged));
        $addHandler(this._operatorsDropDown, "change", Function.createDelegate(this, this._onOperatorChanged));
        $addHandler(this._typeInCheckBox, "click", Function.createDelegate(this, this._onShowPickListCheckBoxChanged));
        $addHandler(this._defaultValueText, "change", Function.createDelegate(this, this._onDefaultValueTextChanged));
        $addHandler(this._showPickListCheckBox, "click", Function.createDelegate(this, this._onShowPickListCheckBoxChanged));
        $addHandler(this._uniqueValuesButton, "click", Function.createDelegate(this, this._onGetValuesClick));
        $addHandler(this._defaultValuesText, "change", Function.createDelegate(this, this._onDefaultValuesTextChanged));
        $addHandler(this._defaultFormatRadioButton, "click", Function.createDelegate(this, this._onFormatRadioButtonChanged));
        $addHandler(this._customFormatRadioButton, "click", Function.createDelegate(this, this._onFormatRadioButtonChanged));
        $addHandler(this._okButton, "click", Function.createDelegate(this, this._onOkButtonClick));
    },

    dispose: function() {
        $clearHandlers(this._element);
        $clearHandlers(this._layersDropDown);
        $clearHandlers(this._addButton);
        $clearHandlers(this._removeButton);
        $clearHandlers(this._expressionLabelText);
        $clearHandlers(this._expressionsDropDown);
        $clearHandlers(this._fieldsDropDown);
        $clearHandlers(this._operatorsDropDown);
        $clearHandlers(this._typeInCheckBox);
        $clearHandlers(this._defaultValueText);
        $clearHandlers(this._showPickListCheckBox);
        $clearHandlers(this._uniqueValuesButton);
        $clearHandlers(this._defaultValuesText);
        $clearHandlers(this._defaultFormatRadioButton);
        $clearHandlers(this._customFormatRadioButton);
        $clearHandlers(this._okButton);
        ESRI.ADF.Tasks.UI.QueryAttributesTaskWebConfigurator.callBaseMethod(this, 'dispose');
    },

    ///
    /// Event handlers
    ///
    _onOkButtonClick: function(e) {
        // Save the current layer definition 
        this._ensureLayerFormatEditorComponent();
        var taskProperties = this._getTaskPropertiesFromUI();
        var json = Sys.Serialization.JavaScriptSerializer.serialize(taskProperties);

        // Escape literal ampersand characters as they are used as separators in our callback format
        json = ESRI.ADF.System.escapeForCallback(json);

        var argument = 'EventArg=taskConfiguredOk&taskAsJSON=' + json;
        if (this._customFormatRadioButton.checked) {
            var layerDefnJSON = Sys.Serialization.JavaScriptSerializer.serialize(this._layerFormatEditorComponent.get_layerFormat());
            argument += '&layerFormatAsJSON=' + layerDefnJSON;
        }
        var context = null;
        // make a callback to save the task configuration
        eval(this._callbackFunctionString);
    },

    _onAddButtonClick: function() {
        // create new expression
        var expression = {};
        expression.labelText = this._createNewExpressionLabel();
        expression.field = this._getField().text;
        expression.operator = this._getOperator().text;
        expression.showPickList = false;
        expression.defaultValue = this._emptyValueText;
        expression.defaultValues = this._emptyValuesText;

        var index = this._expressions.length;
        this._expressionIndex = index;
        this._expressions[index] = expression;

        // Update expressions list
        this._expressionsDropDown.options[index] = new Option(expression.labelText);
        this._expressionsDropDown.selectedIndex = index;

        if (index === 0) {
            // First expression added, enable expression table
            this._enableExpressionForm(true);
        }

        // Update expression form
        this._updateExpressionForm();
    },

    _onRemoveButtonClick: function() {
        // Remove expression
        Array.removeAt(this._expressions, this._expressionIndex);
        this._expressionsDropDown.remove(this._expressionIndex);

        // Update selected expression
        if (this._expressions.length === 0) {
            this._expressionIndex = -1;
        }
        else {
            // If the last expression was removed, decrement the selected index
            if (this._expressionIndex === this._expressions.length) {
                --this._expressionIndex;
            }
            this._expressionsDropDown.selectedIndex = this._expressionIndex;
        }

        // Update expression form
        this._updateExpressionForm();
    },

    _onLabelTextChanged: function() {
        var labelText = this._expressionLabelText.value;
        this._getExpression().labelText = labelText;
        this._expressionsDropDown.options[this._expressionIndex].text = labelText;
    },

    _onOperatorChanged: function() {
        this._getExpression().operator = this._getOperator().text;
    },

    _onFieldChanged: function() {
        this._getExpression().field = this._getField().text;
    },

    _onShowPickListCheckBoxChanged: function() {
        var showPickList = this._showPickListCheckBox.checked;
        this._getExpression().showPickList = showPickList;
        this._enableQueryValues(showPickList);
    },

    _onFormatRadioButtonChanged: function() {
        this._ensureLayerFormatEditorComponent();
        var layer = this._getLayer();
        if (this._customFormatRadioButton.checked) {
            // Restore existing custom format if one exists, otherwise initialize to default
            var format = layer.customLayerFormat ? layer.customLayerFormat : layer.defaultLayerFormat;
            this._loadLayerFormatEditorWithLayerFormat(format);
            this._layerFormatEditorComponent.show();
        }
        else {
            // changing from custom to default, cache the customized layer format so we can restore
            // if the custom radio button is reselected
            layer.customLayerFormat = this._layerFormatEditorComponent.get_layerFormat();
            this._layerFormatEditorComponent.hide();
        }
    },

    _onDefaultValueTextChanged: function() {
        this._getExpression().defaultValue = this._defaultValueText.value;
    },

    _onDefaultValuesTextChanged: function() {
        this._getExpression().defaultValues = this._defaultValuesText.value;
    },

    _onSelectedExpressionChanged: function() {
        this._expressionIndex = this._expressionsDropDown.selectedIndex;
        this._updateExpressionForm();
    },

    _onResourceChanged: function(e) {
        this._clearExpressions();
        this._hideLayerFormatEditor();

        // Store the last viewed layer of the resource we're leaving
        this._resources[this._resourceIndex].previousLayerIndex = this._layerIndex;

        var index = this._resourcesDropDown.selectedIndex;
        this._resourceIndex = index;

        // If returning to an already viewed resource, go back to the last viewed layer
        this._layerIndex = this._resources[index].previousLayerIndex;
        if (!this._layerIndex)
            this._layerIndex = 0;

        var layers = this._resources[index].Layers;
        if (!layers) {
            var argument = 'EventArg=resourceChanged&index=' + index;
            var context = null;

            // make a callback to update layer format
            eval(this._callbackFunctionString);
        }
        else {
            this._updateLayersDropDown(layers);
        }
    },

    _onLayerChanged: function(e) {
        this._clearExpressions();
        this._hideLayerFormatEditor();

        var index = this._layersDropDown.selectedIndex;
        this._layerIndex = index;

        var resource = this._getResource();
        var fields = resource.Layers[index].Fields;
        if (fields) {
            // We have already cached this layers properties
            this._updateFieldsDropDown();
        }
        else {
            // This is the first time the user has selected this layer
            // We need to get the fields and default layer format for it               
            var argument = 'EventArg=layerChanged&layerIndex=' + index + '&resourceIndex=' + this._resourceIndex;
            var context = null;
            eval(this._callbackFunctionString);
        }
    },

    _onGetValuesClick: function() {
        // Clear old values
        this._defaultValuesText.value = "";

        // Show AJAX activity indicator
        this._activityIndicator.style.display = "";

        // make a callback to update layer format
        var argument = 'EventArg=getSampleValues&resourceIndex=' + this._resourceIndex + '&layerIndex=' + this._layerIndex + '&fieldIndex=' + this._fieldsDropDown.selectedIndex;

        var context = null;
        eval(this._callbackFunctionString);
    },

    //
    // Methods called by server side code
    //

    // sets the resource layer names/Ids for the resource
    // along with fields and default layer format for the initial layer
    _setResource: function(value) {
        var resource = this._getResource();
        if (resource) {
            var layer = null;

            // Create layers collection for this resource
            var layers = [];
            resource.Layers = layers;

            var layerNames = value.LayerNames;
            var layerIds = value.LayerIds;
            if (layerNames.length > 0) {
                for (var i = 0; i < layerNames.length; ++i) {
                    // add a new layer
                    layer = {};
                    layers[i] = layer;
                    layer.Name = layerNames[i];
                    layer.Id = layerIds[i];
                }

                // Add fields to layer
                layers[0].Fields = value.Fields ? value.Fields : [];
                this._updateLayersDropDown(layers);

                // Cache default layer format
                layers[0].defaultLayerFormat = value.defaultLayerFormat;
            }
            else {
                this._updateLayersDropDown(layers);
            }
        }
    },

    // sets the fields for the current layer
    _setFields: function(value) {
        var resource = this._getResource();
        var layer = resource.Layers[this._layerIndex];
        layer.Fields = value.Fields;
        this._updateFieldsDropDown();
    },

    _setDefaultLayerFormat: function(value) {
        var resource = this._getResource();
        var layer = resource.Layers[this._layerIndex];
        if (layer) {
            if (!layer.defaultLayerFormat) {
                layer.defaultLayerFormat = value;
            }
        }
    },

    _setSampleValues: function(value) {
        this._activityIndicator.style.display = "none";
        this._defaultValuesText.value = value.text;
        this._getExpression().defaultValues = value.text;
    },

    /// 
    /// Helper functions
    ///
    _getElements: function() {
        this._titleText = $get(this._ids.titleText);
        this._buttonText = $get(this._ids.buttonText);

        this._addButton = $get(this._ids.addButton);
        this._removeButton = $get(this._ids.removeButton);
        this._joinAndRadioButton = $get(this._ids.joinAndCheckBox);
        this._joinOrRadionButton = $get(this._ids.joinOrCheckBox);
        this._expressionsDropDown = $get(this._ids.expressionsList);
        this._expressionsDisabledContainer = $get(this._ids.expressionsBox);
        this._expressionLabelText = $get(this._ids.expressionLabelText);

        this._resourcesDropDown = $get(this._ids.resourcesDropDown);
        this._layersDropDown = $get(this._ids.layersDropDown);
        this._expressionTable = $get(this._ids.expressionTable);
        this._fieldsDropDown = $get(this._ids.fieldsDropDown);
        this._operatorsDropDown = $get(this._ids.operatorsDropDown);
        this._typeInCheckBox = $get(this._ids.typeInCheckBox);
        this._defaultValueText = $get(this._ids.defaultValueText);
        this._showPickListCheckBox = $get(this._ids.showPickListCheckBox);
        this._uniqueValuesButton = $get(this._ids.uniqueValuesButton);
        this._defaultValuesText = $get(this._ids.defaultValuesText);
        this._activityIndicator = $get(this._ids.activityIndicator);

        this._maxRecords = $get(this._ids.maxRecords);
        this._groupResultsByLayer = $get(this._ids.groupResultsByLayer);
        this._showMapTips = $get(this._ids.showMapTips);
        this._showFieldAttributes = $get(this._ids.showFieldAttributes);
        this._defaultFormatRadioButton = $get(this._ids.defaultFormatRadioButton);
        this._customFormatRadioButton = $get(this._ids.customFormatRadioButton);

        this._okButton = $get(this._ids.okButton);
    },

    _getTaskPropertiesFromUI: function() {
        var taskProps = {};

        taskProps.ResourceIndex = this._resourceIndex;
        taskProps.LayerIndex = this._layerIndex;
        taskProps.JoinUsingOr = this._joinOrRadionButton.checked;
        taskProps.Title = this._titleText.value;
        taskProps.ButtonText = this._buttonText.value;
        taskProps.Expressions = this._expressions;
        taskProps.MaxRecords = this._maxRecords.value;
        taskProps.GroupResultsByTable = this._groupResultsByLayer.checked;
        taskProps.ShowFieldAttributes = this._showFieldAttributes.checked;
        taskProps.ShowMapTips = this._showMapTips.checked;
        taskProps.UseCustomFormat = this._customFormatRadioButton.checked;
        return taskProps;
    },

    // retrieve the currently selected resource
    _getResource: function() {
        return this._resources[this._resourceIndex];
    },

    // retrieve the currently selected layer
    _getLayer: function() {
        return this._resources[this._resourceIndex].Layers[this._layerIndex];
    },

    // retrieve the currently displayed query expression
    _getExpression: function() {
        return this._expressions[this._expressionIndex];
    },

    // retrieve the SQL operator of the currently displayed query expression
    _getOperator: function() {
        return this._operatorsDropDown.options[this._operatorsDropDown.selectedIndex];
    },

    // retrieve the field of the currently displayed query expression
    _getField: function() {
        return this._fieldsDropDown.options[this._fieldsDropDown.selectedIndex];
    },

    _updateLayersDropDown: function(layers) {
        var dropDown = this._layersDropDown;

        if (dropDown) {
            // Clear old options
            var count = dropDown.options.length;
            for (var i = 0; i < count; ++i)
                dropDown.options[0] = null;

            dropDown.options.length = 0;

            // Add new options
            if (layers && layers.length > 0) {
                count = layers.length;
                for (var j = 0; j < count; ++j) {
                    dropDown.options[j] = new Option(layers[j].Name, layers[j].Id);
                }
                dropDown.disabled = false;
                this._addButton.disabled = false;
            }
            else {
                dropDown.options[0] = new Option(this._noQueryableLayersLabel);
                dropDown.disabled = true;
                this._addButton.disabled = true;
            }

            dropDown.selectedIndex = this._layerIndex;

            // When the layer changes, we need to update the fields as well
            this._updateFieldsDropDown();
        }
    },

    _updateFieldsDropDown: function(fields) {
        var dropDown = this._fieldsDropDown;

        if (dropDown) {
            // Clear old options
            var count = dropDown.options.length;
            for (var i = 0; i < count; ++i)
                dropDown.options[0] = null;

            dropDown.options.length = 0;

            // Add new options
            var layer = this._getLayer();
            if (layer != null && layer.Fields != null) {
                var fields = layer.Fields;
                count = fields.length;
                for (var j = 0; j < count; ++j) {
                    dropDown.options[j] = new Option(fields[j]);
                }
            }
        }
    },

    _updateExpressionForm: function() {
        var count = this._expressions.length;
        if (count === 0) {
            // Last expression removed, disable expression table 
            this._clearExpressions();
        }
        else {
            // Update form element values
            var expression = this._getExpression();

            // Label
            this._expressionLabelText.value = expression.labelText;

            // Field
            var options = this._fieldsDropDown.options;
            for (var i = 0; i < options.length; ++i) {
                if (options[i].text == expression.field) {
                    this._fieldsDropDown.selectedIndex = i;
                    break;
                }
            }

            // Operator
            options = this._operatorsDropDown.options;
            for (var i = 0; i < options.length; ++i) {
                if (options[i].text == expression.operator) {
                    this._operatorsDropDown.selectedIndex = i;
                    break;
                }
            }

            // Show pick list
            var showPickList = expression.showPickList;
            this._typeInCheckBox.checked = !showPickList;
            this._showPickListCheckBox.checked = showPickList;
            this._enableQueryValues(showPickList);

            // query values
            this._defaultValueText.value = !expression.defaultValue ? this._emptyValueText : expression.defaultValue;
            this._defaultValuesText.value = !expression.defaultValues ? this._emptyValuesText : expression.defaultValues;
        }
    },

    _enableExpressionForm: function(enable) {
        this._expressionsDropDown.style.display = enable ? "" : "none";
        this._expressionsDisabledContainer.style.display = enable ? "none" : "";
        this._removeButton.disabled = !enable;

        // Enable/disable expression form elements
        this._enableElements(this._expressionTable, enable);

        if (enable) {
            // enable query value input elements
            this._enableQueryValues(this._getExpression().showPickList);
        }
    },

    _enableQueryValues: function(usePickList) {
        // Enable appropriate form elements for inputing query value(s)
        this._defaultValueText.disabled = usePickList;
        this._uniqueValuesButton.disabled = !usePickList;
        this._defaultValuesText.disabled = !usePickList;
    },

    _enableElements: function(node, enable) {
        node.disabled = !enable;

        var children = Sys.Browser.agent == Sys.Browser.Firefox ? node.childNodes : node.children;
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; ++i) {
                this._enableElements(children[i], enable);
            }
        }
    },

    _clearExpressions: function() {
        // Remove expressions and disable form
        this._expressions = [];
        this._enableExpressionForm(false);

        // Clear old options
        var dropDown = this._expressionsDropDown;
        var count = dropDown.options.length;
        for (var i = 0; i < count; ++i) {
            dropDown.options[0] = null;
        }
        dropDown.options.length = 0;

        // Set default expression properties
        this._expressionLabelText.value = "";
        this._fieldsDropDown.selectedIndex = 0;
        this._operatorsDropDown.selectedIndex = 0;
        this._typeInCheckBox.checked = true;
        this._defaultValueText.value = this._emptyValueText;
        this._defaultValuesText.value = this._emptyValuesText;
    },

    _createNewExpressionLabel: function() {
        // Create a default labe for a newly created expression
        var newLabel = this._defaultExpressionLabel + this._newExpressionIndex++;
        var dropDown = this._expressionsDropDown;
        var count = dropDown.options.length;
        if (count > 0) {
            // There are existing expressions, make sure not to create a duplicate label
            var isUnique;
            do {
                isUnique = true;
                for (var i = 0; i < count; ++i) {
                    if (dropDown.options[i].text === newLabel) {
                        // Label already in use, change and try again
                        isUnique = false;
                        newLabel = this._defaultExpressionLabel + this._newExpressionIndex++;
                        break;
                    }
                }
            }
            while (!isUnique);
        }
        return newLabel;
    },

    _ensureLayerFormatEditorComponent: function() {
        // this routine ensures that we have initialzed the reference to the layer format editor correctly/already
        this._layerFormatEditorComponent = (this._layerFormatEditorComponent == null) ? $find(this._ids.layerFormatEditor) : this._layerFormatEditorComponent;
    },

    _loadLayerFormatEditorWithLayerFormat: function(layerFormat) {
        this._ensureLayerFormatEditorComponent();
        this._layerFormatEditorComponent.set_layerFormat(layerFormat);
        this._layerFormatEditorComponent.refresh();
    },

    _hideLayerFormatEditor: function(show) {
        this._ensureLayerFormatEditorComponent();
        this._layerFormatEditorComponent.hide();
        this._defaultFormatRadioButton.checked = true;
        this._customFormatRadioButton.checked = false;
    },

    ///
    /// Script descriptor element/properties
    ///
    get_defaultExpressionLabel: function() {
        return this._defaultExpressionLabel;
    },
    set_defaultExpressionLabel: function(value) {
        this._defaultExpressionLabel = value;
    },
    get_noQueryableLayersLabel: function() {
        return this._noQueryableLayersLabel;
    },
    set_noQueryableLayersLabel: function(value) {
        this._noQueryableLayersLabel = value;
    },
    get_emptyValueText: function() {
        return this._emptyValueText;
    },
    set_emptyValueText: function(value) {
        this._emptyValueText = value;
    },
    get_emptyValuesText: function() {
        return this._emptyValuesText;
    },
    set_emptyValuesText: function(value) {
        this._emptyValuesText = value;
    },
    get_joinUsingOr: function() {
        return this._joinUsingOr;
    },
    set_joinUsingOr: function(value) {
        this._joinUsingOr = value;
    },
    get_ids: function() {
        return this._ids;
    },
    set_ids: function(value) {
        this._ids = value;
    },
    get_expressions: function() {
        return this._expressions;
    },
    set_expressions: function(value) {
        this._expressions = value;
    },
    get_callbackFunctionString: function() {
        return this._callbackFunctionString;
    },
    set_callbackFunctionString: function(value) {
        this._callbackFunctionString = value;
    }
}  

ESRI.ADF.Tasks.UI.QueryAttributesTaskWebConfigurator.registerClass('ESRI.ADF.Tasks.UI.QueryAttributesTaskWebConfigurator', Sys.UI.Control);

if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();

