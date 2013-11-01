// Register the namespace for the control.
Type.registerNamespace('ESRI.ADF');

ESRI.ADF.Validator = function(element) {
    ESRI.ADF.Validator.initializeBase(this, [element]);                    
    
    this._callbackFunctionString = null;
    this._controlToValidate = null;
    this._errorMessage = null;
    this._minValue = null;
    this._maxValue = null;
    this._type = "";
}

ESRI.ADF.Validator.prototype = {
    initialize: function() {
        ESRI.ADF.Validator.callBaseMethod(this, 'initialize');
        $addHandler(this._controlToValidate, "change", Function.createDelegate(this, this._onValidate));
    },

    dispose: function() {
        $clearHandlers(this.get_element());
        $clearHandlers(this._controlToValidate);
        this._controlToValidate = null;
        ESRI.ADF.Validator.callBaseMethod(this, 'dispose');
    },
    
    setValidity: function(isValid){
        if (isValid) {
            this.get_element().style.visibility = "hidden";
        }
        else {
            this._controlToValidate.focus();
            this.get_element().style.visibility = "visible";
            if (this._errorMessage != null)
                alert(this._errorMessage);
        }
    },
    

    ///
    /// Event handlers
    ///        
    _onValidate: function(e) {
        var value = this._controlToValidate.value.trim();
        
        var isValid = false;
        switch(this._type) {
			case 'Double':
			case 'Single':
			    if (value == "NaN")
			        isValid = true;
			    else {
			        var floatVal = parseFloat(value);
			        if (!isNaN(floatVal))
			        {
			            if ( (this._minVal == null || floatVal >= this._minVal) &&
			                (this._maxVal == null || floatVal <= this._maxVal)  &&
			                (floatVal.toString() == value) )
			                isValid = true;
			        }
			    }
			    //set validity after a timeout so that focus can be set back to the input control
			    window.setTimeout("$find('" + this.get_id() +"').setValidity(" + (isValid ? "true" : "false") + ");", 0);
				break;
			case 'Int32':
		    case 'Int16':
		        var iVal = parseInt(value, 10);
		        if (!isNaN(iVal))
		        {
		            if ( (this._minVal == null || iVal >= this._minVal) &&
		                (this._maxVal == null || iVal <= this._maxVal) &&
		                (iVal.toString() == value) )
		                isValid = true;
		        }
			    //set validity after a timeout so that focus can be set back to the input control
			    window.setTimeout("$find('" + this.get_id() +"').setValidity(" + (isValid ? "true" : "false") + ");", 0);
			    break;
		    case 'DateTime':
			default:
                var argument = 'EventArg=validate';
                argument += '&val=' + value;
                var context = null;
                // make a callback to save the task configuration
                eval(this._callbackFunctionString);
			    break;
		}
		
    },

    ///
    /// Script descriptor element/properties
    ///
    get_controlToValidate: function() {
        return this._controlToValidate;
    },
    set_controlToValidate: function(value) {
        this._controlToValidate = value;
    },
    get_errorMessage: function() {
        return this._errorMessage;
    },
    set_errorMessage: function(value) {
        this._errorMessage = value;
    },
    get_minVal: function() {
        return this._minVal;
    },
    set_minVal: function(value) {
        this._minVal = value;
    },
     get_maxVal: function() {
        return this._maxVal;
    },
    set_maxVal: function(value) {
        this._maxVal = value;
    },
   get_type: function() {
        return this._type;
    },
    set_type: function(value) {
        this._type = value;
    },
    get_callbackFunctionString: function() {
        return this._callbackFunctionString;
    },
    set_callbackFunctionString: function(value) {
        this._callbackFunctionString = value;
    }
}  

ESRI.ADF.Validator.registerClass('ESRI.ADF.Validator', Sys.UI.Control);

if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();

