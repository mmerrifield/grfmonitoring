// Register the namespace for the control.
Type.registerNamespace('ESRI.ADF.UI');

ESRI.ADF.UI.ColorPicker = function(element) {
    ESRI.ADF.UI.ColorPicker.initializeBase(this, [element]);
    this._palette = null;
    this._onColorPickedClient = null;
    this._chosenColorCellID = null;
}

ESRI.ADF.UI.ColorPicker.prototype = {
    initialize: function() {
        ESRI.ADF.UI.ColorPicker.callBaseMethod(this, 'initialize');
        $addHandler(this.get_element(), "click", Function.createDelegate(this, this._OnClicked));
        this._palette.add_colorPicked(Function.createDelegate(this, this._OnColorChanged));
    },
    dispose: function() {
        $clearHandlers(this.get_element());
        ESRI.ADF.UI.ColorPicker.callBaseMethod(this, 'dispose');
    },
    _OnClicked: function(e) {
        if (!this._palette)
        { return; }
        if (!this._palette.isVisible()) {
            this._palette.show();
            e.cancelBubble = true;
            if (e.stopPropagation)
            { e.stopPropagation(); }
            return false;
        }
    },

    _OnColorChanged: function(sender, args) {
        if (typeof (this._onColorPickedClient) == "function") {
            // for backwards compat
            this._onColorPickedClient(sender, args);
        }
        var elem = $get(this._chosenColorCellID);
        if (elem) {
            // update the background color and the tooltip
            elem.style.backgroundColor = args;
            elem.setAttribute('title', args);
        }
        this._raiseEvent('colorChanged', args);
        // Send callback to server
        var argument = 'EventArg=colorPicked&color=' + args;
        var context = null;
        eval(this._callbackFunctionString);
    },

    //
    // Events
    //
    _raiseEvent: function(name, e) {
        var handler = this.get_events().getHandler(name);
        if (handler) { if (!e) { e = Sys.EventArgs.Empty; } handler(this, e); }
    },
    add_colorChanged: function(handler) {
    /// <summary>The colorChanged event is fired when the color is picked from the palette.</summary>
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
    /// 				<td>ESRI.ADF.UI.ColorPicker</td>
    /// 				<td>The ColorPicker used to select a new color</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs</td>
    /// 				<td>String</td>
    /// 				<td>The name of the color picked</td>
    /// 			</tr>
    /// 		</tbody>
    /// 	</table>
    /// </remarks>
        this.get_events().addHandler('colorChanged', handler);
    },
    remove_colorChanged: function(handler) {
        this.get_events().removeHandler('colorChanged', handler);
    },

    get_palette: function() {
        /// <value type="ESRI.ADF.UI.ColorPalette">Gets the underlying color palette object.</value>
        return this._palette;
    },
    set_palette: function(value) {
        this._palette = value;
    },
    get_onColorPickedClient: function() {        
        return this._onColorPickedClient;
    },
    set_onColorPickedClient: function(value) {
        this._onColorPickedClient = eval(value);
    },
    get_chosenColorCellID: function() {
        return this._chosenColorCellID;
    },
    set_chosenColorCellID: function(value) {
        this._chosenColorCellID = value;
    },
    get_callbackFunctionString: function() {
        return this._callbackFunctionString;
    },
    set_callbackFunctionString: function(value) {
        this._callbackFunctionString = value;
    }
}

ESRI.ADF.UI.ColorPicker.registerClass('ESRI.ADF.UI.ColorPicker', Sys.UI.Control);

if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();