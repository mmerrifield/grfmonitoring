/// <reference name="MicrosoftAjax.js" />
/// <reference assembly="ESRI.ArcGIS.ADF.Web.UI.WebControls" name="ESRI.ArcGIS.ADF.Web.UI.WebControls.Runtime.JavaScript.ESRI.ADF.UI.Map.js"/>

Type.registerNamespace('ESRI.ADF.UI');

ESRI.ADF.UI._ScaleBarUnits = function() {
    /// <summary>Private unit type class</summary>
};

ESRI.ADF.UI._ScaleBarUnits.prototype = {
    DecimalDegrees: { "unitsPerMeter": -1, "DisplayName": '&deg;' },
    Inches: { "unitsPerMeter": 0.0254, "DisplayName": 'Inches' },
    Feet: { "unitsPerMeter": 0.3048, "DisplayName": 'Feet' },
    Yards: { "unitsPerMeter": 0.9144, "DisplayName": 'Yards' },
    Miles: { "unitsPerMeter": 1609.344, "DisplayName": 'Miles' },
    NauticalMiles: { "unitsPerMeter": 1852, "DisplayName": 'Nautical Miles' },
    Millimeters: { "unitsPerMeter": 0.001, "DisplayName": 'Millimeters' },
    Centimeters: { "unitsPerMeter": 0.01, "DisplayName": 'Centimeters' },
    Decimeters: { "unitsPerMeter": 0.1, "DisplayName": 'Decimeters' },
    Meters: { "unitsPerMeter": 1, "DisplayName": 'Meters' },
    Kilometers: { "unitsPerMeter": 1000, "DisplayName": 'Kilometers' },
    Unknown: { "unitsPerMeter": 1, "DisplayName": '' },
    convert: function(value, from, to) {
        /// <summary>Converts a unit to another unit</summary>
        /// <param name="value" type="Number">Value to convert</param>
        /// <param name="from" type="Object">Unit of value (type of ESRI.ADF.UI.Scalebar.Units.*)</param>
        /// <param name="to" type="Object">Unit to convert to (type of ESRI.ADF.UI.Scalebar.Units.*)</param>
        /// <returns type="Number">Converted value</returns>
        if (from === ESRI.ADF.UI.ScaleBarUnits.DecimalDegrees) { throw Error.argument("Cannot convert from geographic", "from"); }
        if (to === ESRI.ADF.UI.ScaleBarUnits.DecimalDegrees) { throw Error.argument("Cannot convert to geographic", "to"); }
        return value * from.unitsPerMeter / to.unitsPerMeter;
    },
    switchUnit: function(from, unitGroup) {
        /// <summary>Switches a unit to a lower unit. Eg:- Miles becomes yards, Yards becomes feet</summary>
        /// <param name="from" type="Object">Unit to switch</param>
        /// <param name="unitGroup" type="ESRI.ADF.UI.ScaleBarUnitConversionGroup" mayBeNull="true">Conversion group to use</param>
        /// <returns type="Object">New Unit of larger scale</returns>        
        var to = null;
        if (unitGroup !== null) {
            switch (unitGroup) {
                case ESRI.ADF.UI.ScaleBarUnitConversionGroup.MilesFeet:
                    return from === ESRI.ADF.UI.ScaleBarUnits.Miles ? ESRI.ADF.UI.ScaleBarUnits.Feet : null;
                    break;
                case ESRI.ADF.UI.ScaleBarUnitConversionGroup.KilometersMeters:
                    return from === ESRI.ADF.UI.ScaleBarUnits.Kilometers ? ESRI.ADF.UI.ScaleBarUnits.Meters : null;
                    break;
            }
        }
        if (to === null) {
            switch (from) {
                case ESRI.ADF.UI.ScaleBarUnits.Miles:
                    to = ESRI.ADF.UI.ScaleBarUnits.Yards;
                    break;
                case ESRI.ADF.UI.ScaleBarUnits.Yards:
                    to = ESRI.ADF.UI.ScaleBarUnits.Feet;
                    break;
                case ESRI.ADF.UI.ScaleBarUnits.Feet:
                    to = ESRI.ADF.UI.ScaleBarUnits.Inches;
                    break;
                case ESRI.ADF.UI.ScaleBarUnits.Kilometers:
                    to = ESRI.ADF.UI.ScaleBarUnits.Meters;
                    break;
                case ESRI.ADF.UI.ScaleBarUnits.Meters:
                    to = ESRI.ADF.UI.ScaleBarUnits.Decimeters;
                    break;
                case ESRI.ADF.UI.ScaleBarUnits.Decimeters:
                    to = ESRI.ADF.UI.ScaleBarUnits.Centimeters;
                    break;
                case ESRI.ADF.UI.ScaleBarUnits.Centimeters:
                    to = ESRI.ADF.UI.ScaleBarUnits.Millimeters;
                    break;
            }
        }
        return to;
    }
};
ESRI.ADF.UI.ScaleBarUnits = new ESRI.ADF.UI._ScaleBarUnits(); //Static public instance

ESRI.ADF.UI.ScaleBarStyle = function() {
    /// <summary>
    /// Options for styling the scalebar.         
    /// </summary>
};
ESRI.ADF.UI.ScaleBarStyle.prototype = { Alternating: 0, DoubleAlternating: 1, SingleDivision: 2, ScaleLine: 3 };
ESRI.ADF.UI.ScaleBarStyle.registerEnum("ESRI.ADF.UI.ScaleBarStyle");

ESRI.ADF.UI.ScaleBarUnitConversionGroup = function() {
    /// <summary>
    /// Options for setting the position of the numbers w.r.t the bar.         
    /// </summary>
};
ESRI.ADF.UI.ScaleBarUnitConversionGroup.prototype = { MilesFeet: 0, USUnits: 1, KilometersMeters: 2, MetricUnits: 3 };
ESRI.ADF.UI.ScaleBarUnitConversionGroup.registerEnum("ESRI.ADF.UI.ScaleBarUnitConversionGroup");

ESRI.ADF.UI.ScaleBarNumberPosition = function() {
    /// <summary>
    /// Options for setting the position of the numbers w.r.t the bar.         
    /// </summary>
};
ESRI.ADF.UI.ScaleBarNumberPosition.prototype = { Above: 0, Below: 1 };
ESRI.ADF.UI.ScaleBarNumberPosition.registerEnum("ESRI.ADF.UI.ScaleBarNumberPosition");


ESRI.ADF.UI._IScaleBarRenderer = function() { };
ESRI.ADF.UI._IScaleBarRenderer.prototype = {
    create: function(containerDiv) { },
    onExtentChanged: function(sender, args) { },
    dispose: function() { }
};
ESRI.ADF.UI._IScaleBarRenderer.registerInterface('ESRI.ADF.UI._IScaleBarRenderer');

ESRI.ADF.UI._ScaleBarRendererBase = function(props) {
    this._textbars = null;
    this._mapUnit = props ? props.mapUnit : null;
    this._displayUnit = props ? props.displayUnit : null;
    this._significantDigits = props ? props.significantDigits : -1;
    this._numberOfDivisions = props ? props.numberOfDivisions : false;
    this._scaleBarNumberPosition = props ? props.scaleBarNumberPosition : ESRI.ADF.UI.ScaleBarNumberPosition.Above;
    this._scaleBarUnitConversionGroup = props ? props.scaleBarUnitConversionGroup : ESRI.ADF.UI.ScaleBarUnitConversionGroup.MilesFeet;
    this._barHeight = props ? props.barHeight : 8;
    this._barFontSize = props ? props.barFontSize : 16;
    this._foreColor = props ? props.foreColor : 'black';
    this._barColor = props ? props.barColor : 'black';
    this._useDoubleAlternatingStyle = props ? props.useDoubleAlternatingStyle : false;
    this._labelText = props ? props.labelText : '';
    this._labels = this._labelText.split(';');
    this._containerDiv = null;
    this._marksDiv = null;
    this._currentPixelSize = null;
    //Set default values
    this._earthRadius = 6378137; //Earth radius in meters (defaults to WGS84 / GRS80
    this._toRadians = Math.PI / 180;
    this._degreeDist = this._earthRadius * this._toRadians; // distance of 1 degree at equator in meters    
};
ESRI.ADF.UI._ScaleBarRendererBase.prototype = {
    _create: function(containerDiv) {
        this._containerDiv = containerDiv;
        this._createTextPlaceHolders(containerDiv, this._scaleBarNumberPosition, this._barHeight, this._barFontSize, this._foreColor);
        this._marksDiv = this._createTopBar(containerDiv, this._scaleBarNumberPosition, this._barHeight, this._barFontSize, this._barColor);
        if (this._useDoubleAlternatingStyle) {
            this._createBottomBar(this._marksDiv, this._scaleBarNumberPosition, this._barHeight, this._barFontSize, this._barColor);
        }
        containerDiv.appendChild(this._marksDiv);
    },
    _onExtentChanged: function(sender, args) {
        var extent = args.extent;
        var pixelSize = args.pixelSize;
        var maxWidth = args.maxWidth;

        var unit = this._displayUnit;
        if (this._mapUnit === ESRI.ADF.UI.ScaleBarUnits.Unknown) { unit = ESRI.ADF.UI.ScaleBarUnits.Unknown; }

        var stepwidth = maxWidth / this._numberOfDivisions; //width of one sub-bar        
        var val = 0;
        var originalPixelSize = pixelSize;
        while (val < 0.5) {
            pixelSize = originalPixelSize;
            if (this._mapUnit === ESRI.ADF.UI.ScaleBarUnits.DecimalDegrees) {
                pixelSize = this._getScaleForGeographic(extent, pixelSize);
                pixelSize = ESRI.ADF.UI.ScaleBarUnits.convert(pixelSize, ESRI.ADF.UI.ScaleBarUnits.Meters, unit);
            }
            else if (this._mapUnit !== ESRI.ADF.UI.ScaleBarUnits.Unknown) { pixelSize = ESRI.ADF.UI.ScaleBarUnits.convert(pixelSize, this._mapUnit, unit); }

            var val = stepwidth * pixelSize;
            val = this._roundToSignificant(val, pixelSize);
            if (val < 0.5) {
                // Automatically switch unit to a lower one
                var newUnit = ESRI.ADF.UI.ScaleBarUnits.switchUnit(unit, this._scaleBarUnitConversionGroup);
                if (newUnit === null) { break; } //no lower unit
                unit = newUnit;
            }
        }

        this._marksDiv.style.display = pixelSize === 0 ? 'none' : '';
        if (this._currentPixelSize === pixelSize) {
            return;
        }
        this._currentPixelSize = pixelSize;

        if (val < 1) {
            //create nice fractions
            var tmp = Math.ceil(1 / val);
            if (tmp < 5) { val = 1 / tmp; }
            else if (tmp < 4) { val = 0.2; }
            else if (tmp < 2) { val = 0.25; }
            else if (tmp <= 1) { val = 0.5; }
        }
        else {
            val = Math.floor(stepwidth * pixelSize); //rounded width in map units
        }

        var vals = (this._numberOfDivisions === 8) ? [1, 2, 4, 6, 8] : [1];
        var label = this._getLabelText(unit, this._scaleBarUnitConversionGroup);
        Array.forEach(vals, function(item, j) {
            var rounded = val * item;
            var elm = this._textbars[j + 1];
            if (rounded < 1 && j < 4) {
                if (rounded == 0.5) { rounded = '&frac12;'; }
                else if (rounded == 0.25) { rounded = '&frac14;'; }
                else if (rounded == 0.75) { rounded = '&frac34;'; }
                else if (rounded.toString().length > 4) { rounded = Math.round(rounded * Math.pow(10, j)) / Math.pow(10, j); }
            }
            else if (rounded.toString().length > 4) { rounded = Math.round(rounded * Math.pow(10, j)) / Math.pow(10, j); } //add more digits to last values
            if (rounded === 0) { elm.innerHTML = ''; }
            else {
                var dotPos = rounded.toString().lastIndexOf('.');
                if (dotPos > -1) {
                    if (this._significantDigits > 0) { rounded = rounded.localeFormat('N' + this._significantDigits.toString()); }
                    else if (this._significantDigits === 0) { rounded = rounded.toString().substring(0, dotPos); }
                }
                if (j === 4) { elm.innerHTML = '<nobr>' + rounded + ' ' + label + '</nobr>'; }
                else { elm.innerHTML = rounded; }
            }
        }, this);

        var width = (val / pixelSize * this._numberOfDivisions);
        if (width > 0) { this._containerDiv.style.width = (Math.round(width) + 'px'); }
        else { this._containerDiv.style.width = maxWidth + 'px'; }
        return width;  // return the total bar width
    },
    _dispose: function() {
        this._currentPixelSize = null;
        this._containerDiv = null;
        this._textbars = null;
        this._marksDiv = null;
    },
    _roundToSignificant: function(value, resolution) {
        var round = Math.floor(-Math.log(resolution));
        if (round > 0) {
            round = Math.pow(10, round);
            return Math.round(value * round) / round;
        }
        else { return Math.round(value); }
    },
    _getBestEstimateOfValue: function(extent, pixelSize, maxWidth) {
        var unit = this._displayUnit;
        if (this._mapUnit === ESRI.ADF.UI.ScaleBarUnits.Unknown) { unit = ESRI.ADF.UI.ScaleBarUnits.Unknown; }
        var rounded = 0;
        var originalPixelSize = pixelSize;
        while (rounded < 0.5) {
            pixelSize = originalPixelSize;
            if (this._mapUnit === ESRI.ADF.UI.ScaleBarUnits.DecimalDegrees) {
                pixelSize = this._getScaleForGeographic(extent, pixelSize);
                pixelSize = ESRI.ADF.UI.ScaleBarUnits.convert(pixelSize, ESRI.ADF.UI.ScaleBarUnits.Meters, unit);
            }
            else if (this._mapUnit !== ESRI.ADF.UI.ScaleBarUnits.Unknown) { pixelSize = ESRI.ADF.UI.ScaleBarUnits.convert(pixelSize, this._mapUnit, unit); }

            var val = maxWidth * pixelSize;
            val = this._roundToSignificant(val, pixelSize);
            var noFrac = Math.round(val); // to get rid of the fraction
            if (val < 0.5) {
                // Automatically switch unit to a lower one
                var newUnit = ESRI.ADF.UI.ScaleBarUnits.switchUnit(unit, this._scaleBarUnitConversionGroup);
                if (newUnit == null) { break; } //no lower unit
                unit = newUnit;
            }
            else if (noFrac > 1) {
                rounded = noFrac;
                var len = noFrac.toString().length;
                if (len <= 2) {
                    // single/double digits ... make it a multiple of 5 ..or 1,2,3,4
                    if (noFrac > 5) {
                        rounded -= noFrac % 5;
                    }
                    while (rounded > 1 && (rounded / pixelSize) > maxWidth) {
                        // exceeded maxWidth .. decrement by 1 or by 5
                        var decr = noFrac > 5 ? 5 : 1;
                        rounded = rounded - decr;
                    }
                }
                else if (len > 2) {
                    rounded = Math.round(noFrac / Math.pow(10, len - 1)) * Math.pow(10, len - 1);
                    if ((rounded / pixelSize) > maxWidth) {
                        // exceeded maxWidth .. use the lower bound instead
                        rounded = Math.floor(noFrac / Math.pow(10, len - 1)) * Math.pow(10, len - 1);
                    }
                }
            }
            else { // anything between 0.5 and 1
                rounded = Math.floor(val);
                if (rounded == 0) {
                    //val >= 0.5 but < 1 so round up
                    rounded = (val == 0.5) ? 0.5 : 1;
                    if ((rounded / pixelSize) > maxWidth) {
                        // exceeded maxWidth .. re-try by switching to lower unit 
                        rounded = 0;
                        var newUnit = ESRI.ADF.UI.ScaleBarUnits.switchUnit(unit, this._scaleBarUnitConversionGroup);
                        if (newUnit == null) { break; } //no lower unit
                        unit = newUnit;
                    }
                }
            }
        }
        return { "rounded": rounded, "unit": unit, "pixelSize": pixelSize };
    },
    _setLabelText: function(elm, rounded, u) {
        if (rounded == 0.5) { elm.innerHTML = '&frac12;'; }
        if (rounded === 0) { elm.innerHTML = '0'; }
        else {
            var label = this._getLabelText(u, this._scaleBarUnitConversionGroup);
            var dotPos = rounded.toString().lastIndexOf('.');
            if (dotPos > -1) {
                if (this._significantDigits > 0) { rounded = rounded.localeFormat('N' + this._significantDigits.toString()); }
                else if (this._significantDigits === 0) { rounded = rounded.toString().substring(0, dotPos); }
            }
            elm.innerHTML = '<nobr>' + rounded + ' ' + label + '</nobr>';
        }
    },
    _getLabelText: function(unit, unitGroup) {
        if (!unit) { unit = ESRI.ADF.UI.ScaleBarUnits.Unknown; }
        if (this._labelText && this._labelText.length > 0) {
            var idx = this._getIndexOfUnitInGroup(unit, unitGroup);
            if (idx > -1 && idx < this._labels.length) {
                return this._labels[idx];
            }
        }
        return unit.DisplayName;
    },
    _getIndexOfUnitInGroup: function(unit, unitGroup) {
        switch (unitGroup) {
            case ESRI.ADF.UI.ScaleBarUnitConversionGroup.MilesFeet:
                if (unit === ESRI.ADF.UI.ScaleBarUnits.Miles) { return 0; }
                else if (unit === ESRI.ADF.UI.ScaleBarUnits.Feet) { return 1; }
                break;
            case ESRI.ADF.UI.ScaleBarUnitConversionGroup.KilometersMeters:
                if (unit === ESRI.ADF.UI.ScaleBarUnits.Kilometers) { return 0; }
                else if (unit === ESRI.ADF.UI.ScaleBarUnits.Meters) { return 1; }
                break;
            case ESRI.ADF.UI.ScaleBarUnitConversionGroup.USUnits:
                switch (unit) {
                    case ESRI.ADF.UI.ScaleBarUnits.Miles:
                        return 0;
                    case ESRI.ADF.UI.ScaleBarUnits.Yards:
                        return 1;
                    case ESRI.ADF.UI.ScaleBarUnits.Feet:
                        return 2;
                }
                break;
            case ESRI.ADF.UI.ScaleBarUnitConversionGroup.MetricUnits:
                switch (unit) {
                    case ESRI.ADF.UI.ScaleBarUnits.Kilometers:
                        return 0;
                    case ESRI.ADF.UI.ScaleBarUnits.Meters:
                        return 1;
                    case ESRI.ADF.UI.ScaleBarUnits.Decimeters:
                        return 2;
                    case ESRI.ADF.UI.ScaleBarUnits.Centimeters:
                        return 3;
                    case ESRI.ADF.UI.ScaleBarUnits.Millimeters:
                        return 4;
                }
                break;
        }
        return -1;
    },
    _createTextPlaceHolders: function(containerDiv, scaleBarNumberPosition, barHeight, barFontSize, foreColor) {
        var textbar = document.createElement('div');
        textbar.style.width = '100%';
        textbar.style.position = 'absolute';
        textbar.style.left = '-2px';
        textbar.style.fontSize = barFontSize + 'px';
        textbar.style.color = foreColor;
        var top = (scaleBarNumberPosition === ESRI.ADF.UI.ScaleBarNumberPosition.Above) ? '0px' : ((barHeight + 4) + 'px');
        textbar.style.top = top;
        var arr = (this._numberOfDivisions === 8) ? [0, 12.5, 25, 50, 75, 100] : [0];
        this._textbars = [];

        Array.forEach(arr, function(val, idx) {
            var bar = document.createElement('div');
            bar.style.position = 'absolute';
            bar.style.left = val + '%';
            textbar.appendChild(bar);
            this._textbars[idx] = bar;
        }, this);

        this._textbars[0].innerHTML = '0';
        containerDiv.appendChild(textbar);
    },
    _createTopBar: function(containerDiv, scaleBarNumberPosition, barHeight, barFontSize, barColor) {
        var arr = (this._numberOfDivisions === 8) ? [6.25, 6.25, 6.25, 6.25, 25, 25, 25] : [100];
        var marks = document.createElement('div');
        marks.style.width = '100%';
        marks.style.padding = '0';
        marks.style.margin = '0';
        marks.style.fontSize = '0';
        //Top half
        var top = document.createElement('div');
        var height = Math.ceil(barHeight / 2);
        top.style.width = '100%';
        top.style.height = height + 'px';
        top.style.position = 'relative';
        top.style.overflow = 'hidden';
        top.style.border = '1px solid black';
        if (this._useDoubleAlternatingStyle) {
            top.style.borderBottom = '0px';
        }
        if (scaleBarNumberPosition === ESRI.ADF.UI.ScaleBarNumberPosition.Above) {
            top.style.position = 'absolute';
            top.style.top = (parseInt(barFontSize) + 2) + 'px';
        }
        var left = 0;
        Array.forEach(arr, function(val, idx) {
            var bar = document.createElement('div');
            bar.style.width = val + '%';
            var borderHeight = this._useDoubleAlternatingStyle ? 1 : 0;
            bar.style.height = (height - borderHeight) + 'px';
            bar.style.position = 'absolute';
            bar.style.left = left + '%';
            if (this._useDoubleAlternatingStyle) {
                bar.style.borderBottom = '1px solid black';
            }
            left += val;
            if (idx % 2 === 0) { bar.style.backgroundColor = barColor; } //alternate background
            top.appendChild(bar);
        }, this);
        marks.appendChild(top);
        return marks;
    },
    _createBottomBar: function(div, scaleBarNumberPosition, barHeight, barFontSize, barColor) {
        var bottom = document.createElement('div');
        bottom.style.width = '100%';
        var height = Math.ceil(barHeight / 2);
        bottom.style.height = height + 'px';
        bottom.style.overflow = 'hidden';
        bottom.style.border = '1px solid black';
        bottom.style.borderTop = '0px';
        if (scaleBarNumberPosition === ESRI.ADF.UI.ScaleBarNumberPosition.Above) {
            bottom.style.position = 'absolute';
            bottom.style.top = (parseInt(height) + parseInt(barFontSize) + 2) + 'px';
        }
        var left = 0;
        var arr = (this._numberOfDivisions === 8) ? [6.25, 6.25, 6.25, 6.25, 25, 25, 25] : [100];
        Array.forEach(arr, function(val, idx) {
            var bar = document.createElement('div');
            bar.style.width = val + '%';
            bar.style.height = (height - 1) + 'px';
            bar.style.borderTop = '1px solid black';
            bar.style.position = 'absolute';
            bar.style.left = left + '%';
            left += val;
            if (idx % 2 == 1) { bar.style.backgroundColor = barColor; } //alternate background
            bottom.appendChild(bar);
        }, this);
        div.appendChild(bottom);
    },
    _getScaleForGeographic: function(extent, pxSize) {
        /// <summary>
        /// Calculates horizontal scale at center of extent
        /// for geographic / Plate Carre projection.
        /// Horizontal scale is 0 at the poles.
        /// </summary>
        var center = extent.get_center();
        var y = center.get_y();
        if (Math.abs(y) > 90) { return 0; }
        var ps = Math.cos(y * this._toRadians) * pxSize * this._degreeDist;
        return ps;
    }
};
ESRI.ADF.UI._ScaleBarRendererBase.registerClass('ESRI.ADF.UI._ScaleBarRendererBase');

ESRI.ADF.UI._AlternatingStyleRenderer = function(props) {
    ESRI.ADF.UI._AlternatingStyleRenderer.initializeBase(this, [props]);
};
ESRI.ADF.UI._AlternatingStyleRenderer.prototype = {
    create: function(containerDiv) {
        ESRI.ADF.UI._AlternatingStyleRenderer.callBaseMethod(this, '_create', [containerDiv]);
    },
    onExtentChanged: function(sender, args) {
        return ESRI.ADF.UI._AlternatingStyleRenderer.callBaseMethod(this, '_onExtentChanged', [sender, args]);
    },
    dispose: function() {
        ESRI.ADF.UI._AlternatingStyleRenderer.callBaseMethod(this, '_dispose');
    }
};
ESRI.ADF.UI._AlternatingStyleRenderer.registerClass('ESRI.ADF.UI._AlternatingStyleRenderer', ESRI.ADF.UI._ScaleBarRendererBase, ESRI.ADF.UI._IScaleBarRenderer);

ESRI.ADF.UI._DoubleAlternatingStyleRenderer = function(props) {
    ESRI.ADF.UI._DoubleAlternatingStyleRenderer.initializeBase(this, [props]);
};
ESRI.ADF.UI._DoubleAlternatingStyleRenderer.prototype = {
    create: function(containerDiv) {
        ESRI.ADF.UI._DoubleAlternatingStyleRenderer.callBaseMethod(this, '_create', [containerDiv]);
    },
    onExtentChanged: function(sender, args) {
        return ESRI.ADF.UI._DoubleAlternatingStyleRenderer.callBaseMethod(this, '_onExtentChanged', [sender, args]);
    },
    dispose: function() {
        ESRI.ADF.UI._DoubleAlternatingStyleRenderer.callBaseMethod(this, '_dispose');
    }
};
ESRI.ADF.UI._DoubleAlternatingStyleRenderer.registerClass('ESRI.ADF.UI._DoubleAlternatingStyleRenderer', ESRI.ADF.UI._ScaleBarRendererBase, ESRI.ADF.UI._IScaleBarRenderer);

ESRI.ADF.UI._SingleDivisionStyleRenderer = function(props) {
    ESRI.ADF.UI._SingleDivisionStyleRenderer.initializeBase(this, [props]);
}
ESRI.ADF.UI._SingleDivisionStyleRenderer.prototype = {
    create: function(containerDiv) {
        ESRI.ADF.UI._SingleDivisionStyleRenderer.callBaseMethod(this, '_create', [containerDiv]);
    },
    onExtentChanged: function(sender, args) {
        var extent = args.extent;
        var pixelSize = args.pixelSize;
        var maxWidth = args.maxWidth;
        var val = ESRI.ADF.UI._SingleDivisionStyleRenderer.callBaseMethod(this, '_getBestEstimateOfValue', [extent, pixelSize, maxWidth]);
        this._marksDiv.style.display = val.rounded === 0 ? 'none' : '';
        if (this._currentPixelSize === val.pixelSize) {
            return;
        }
        this._currentPixelSize = val.pixelSize;
        ESRI.ADF.UI._SingleDivisionStyleRenderer.callBaseMethod(this, '_setLabelText', [this._textbars[0], val.rounded, val.unit]);

        var width = val.rounded / val.pixelSize;
        if (width > 0) { this._containerDiv.style.width = (Math.round(width) + 'px'); }
        else { this._containerDiv.style.width = maxWidth + 'px'; }

        return width;
    },
    dispose: function() {
        ESRI.ADF.UI._SingleDivisionStyleRenderer.callBaseMethod(this, '_dispose');
    }
};
ESRI.ADF.UI._SingleDivisionStyleRenderer.registerClass('ESRI.ADF.UI._SingleDivisionStyleRenderer', ESRI.ADF.UI._ScaleBarRendererBase, ESRI.ADF.UI._IScaleBarRenderer);


ESRI.ADF.UI._ScaleLineStyleRenderer = function(props) {
    this._barDiv = null;
    this._leftDiv = null;
    this._rightDiv = null;
    this._scaleLineWidth = 2;
    ESRI.ADF.UI._ScaleLineStyleRenderer.initializeBase(this, [props]);
};
ESRI.ADF.UI._ScaleLineStyleRenderer.prototype = {
    create: function(containerDiv) {
        this._containerDiv = containerDiv;

        // Left notch
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = '0px';
        div.style.width = this._scaleLineWidth + 'px';
        div.style.top = '0px';
        div.style.height = (this._barFontSize + this._scaleLineWidth + 2) + 'px';
        div.style.backgroundColor = this._barColor;
        if (ESRI.ADF.System.__isIE6) {
            div.style.overflow = 'hidden';
        }
        this._leftDiv = div;
        containerDiv.appendChild(div);

        // Horizontal bar
        div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = this._scaleLineWidth + 'px';
        div.style.height = this._scaleLineWidth + 'px';
        div.style.width = '100%';
        div.style.top = this._scaleBarNumberPosition == ESRI.ADF.UI.ScaleBarNumberPosition.Above ? (this._barFontSize + 2) + 'px' : '0px';
        div.style.backgroundColor = this._barColor;
        if (ESRI.ADF.System.__isIE6) {
            div.style.overflow = 'hidden';
        }
        this._barDiv = div;
        containerDiv.appendChild(div);

        // Textbox/label
        div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = '10px';
        div.style.height = '4px'; // ??????
        div.style.width = '100%';
        div.style.top = this._scaleBarNumberPosition == ESRI.ADF.UI.ScaleBarNumberPosition.Above ? '0px' : '6px';
        div.style.color = this._foreColor;
        div.style.fontSize = this._barFontSize + 'px';
        this._textbars = [];
        this._textbars[0] = div;
        containerDiv.appendChild(div);

        // Right notch
        div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = '5px';
        div.style.width = this._scaleLineWidth + 'px';
        div.style.top = '0px';
        div.style.height = (this._barFontSize + this._scaleLineWidth + 2) + 'px';
        div.style.backgroundColor = this._barColor;
        if (ESRI.ADF.System.__isIE6) {
            div.style.overflow = 'hidden';
        }
        this._rightDiv = div;
        containerDiv.appendChild(div);
    },
    onExtentChanged: function(sender, args) {
        var extent = args.extent;
        var pixelSize = args.pixelSize;
        var maxWidth = args.maxWidth;
        var val = ESRI.ADF.UI._ScaleLineStyleRenderer.callBaseMethod(this, '_getBestEstimateOfValue', [extent, pixelSize, maxWidth]);
        this._barDiv.style.display = this._rightDiv.style.display = this._leftDiv.style.display = val.rounded === 0 ? 'none' : '';
        if (this._currentPixelSize === val.pixelSize) {
            return;
        }
        this._currentPixelSize = val.pixelSize;
        ESRI.ADF.UI._ScaleLineStyleRenderer.callBaseMethod(this, '_setLabelText', [this._textbars[0], val.rounded, val.unit]);

        var width = val.rounded / val.pixelSize;
        if (width > 0) {
            this._barDiv.style.width = Math.round(width) + 'px';
            this._rightDiv.style.left = Math.round(width) + 'px';
        }
        else { this._containerDiv.style.width = maxWidth + 'px'; }

        return width;
    },
    dispose: function() {
        this._leftDiv = null;
        this._rightDiv = null;
        this._barDiv = null;
        ESRI.ADF.UI._ScaleLineStyleRenderer.callBaseMethod(this, '_dispose');
    }
};
ESRI.ADF.UI._ScaleLineStyleRenderer.registerClass('ESRI.ADF.UI._ScaleLineStyleRenderer', ESRI.ADF.UI._ScaleBarRendererBase, ESRI.ADF.UI._IScaleBarRenderer);



ESRI.ADF.UI.ScaleBar = function(element) {
    /// <summary>
    /// Creates a scale bar using dynamic HTML to adjust its size
    /// </summary>
    ESRI.ADF.UI.ScaleBar.initializeBase(this, [element]);
    //Set default values
    this._earthRadius = 6378137; //Earth radius in meters (defaults to WGS84 / GRS80
    this._width = null;
    this._map = null;
    this._mainbar = null;
    this._containerDiv = null;
    this._displayUnit = ESRI.ADF.UI.ScaleBarUnits.Kilometers;
    this._mapUnit = null;
    this._height = null;
    this._serverWidth = null; // width of the control as set on the server tag
    this._backColor = null;
    this._barColor = 'black';
    this._foreColor = 'black';
    this._currentBarWidth = null;
    this._barHeight = null;
    this._scaleBarStyle = ESRI.ADF.UI.ScaleBarStyle.Alternating;
    this._scaleBarRenderer = new ESRI.ADF.UI._AlternatingStyleRenderer();
    this._scaleBarNumberPosition = ESRI.ADF.UI.ScaleBarNumberPosition.Above;
    this._scaleBarUnitConversionGroup = ESRI.ADF.UI.ScaleBarUnitConversionGroup.MilesFeet;
    this._barFontSize = 10;
    this._significantDigits = -1;
    this._labelText = '';
};
ESRI.ADF.UI.ScaleBar.prototype = {
    initialize: function() {
        /// <summary>Initialization. Creates the bar and hooks up event listeners</summary>
        ESRI.ADF.UI.ScaleBar.callBaseMethod(this, 'initialize');
        //Map and map units must be set
        if (this._map === null) { throw Error.argumentNull('map'); }
        if (this._mapUnit === null) { throw Error.argumentNull('mapUnit'); }
        if (this._width === null) {
            this._width = (this._serverWidth === null) ? parseInt(this.get_element().clientWidth, 10) : this._serverWidth;
        }
        if (this._height === null) {
            var tmp = this.get_element().style.fontSize;
            this.get_element().style.fontSize = '0'; //measure height without font affecting it
            this._height = parseInt(this.get_element().clientHeight, 10);
            if (this._height % 2 === 1) { this._height++; } //we need the height as a multiple of 2 to look good
            this.get_element().style.fontSize = tmp;
        }
        var props = { "scaleBarNumberPosition": this._scaleBarNumberPosition, "foreColor": this._foreColor, "barColor": this._barColor, "barHeight": this._barHeight, "barFontSize": this._barFontSize, "labelText": this._labelText, "mapUnit": this._mapUnit, "displayUnit": this._displayUnit, "significantDigits": this._significantDigits, "scaleBarUnitConversionGroup": this._scaleBarUnitConversionGroup, "labelText": this._labelText };
        switch (this._scaleBarStyle) {
            case ESRI.ADF.UI.ScaleBarStyle.Alternating:
                props.numberOfDivisions = 8;
                props.useDoubleAlternatingStyle = false;
                this._scaleBarRenderer = new ESRI.ADF.UI._AlternatingStyleRenderer(props);
                break;
            case ESRI.ADF.UI.ScaleBarStyle.DoubleAlternating:
                props.numberOfDivisions = 8;
                props.useDoubleAlternatingStyle = true;
                this._scaleBarRenderer = new ESRI.ADF.UI._DoubleAlternatingStyleRenderer(props);
                break;
            case ESRI.ADF.UI.ScaleBarStyle.SingleDivision:
                props.numberOfDivisions = 1;
                props.useDoubleAlternatingStyle = false;
                this._scaleBarRenderer = new ESRI.ADF.UI._SingleDivisionStyleRenderer(props);
                break;
            case ESRI.ADF.UI.ScaleBarStyle.ScaleLine:
                props.numberOfDivisions = 1;
                this._scaleBarRenderer = new ESRI.ADF.UI._ScaleLineStyleRenderer(props);
                break;
        }
        this._createScaleBar();
        // Create and hook up event listeners to the map
        this._extentChangedHandler = Function.createDelegate(this, this._updateScaleBar);
        this._map.add_extentChanging(this._extentChangedHandler); //Add listener for when the map is animating its extent
        this._map.add_extentChanged(this._extentChangedHandler); //Add listener for when the map has changed its extent        
        this._updateScaleBar(this._map); //Update the scalebar now
    },
    dispose: function() {
        /// <summary>Clean up</summary>
        if (this._extentChangedHandler && this._map) {
            this._map.remove_extentChanging(this._extentChangedHandler);
            this._map.remove_extentChanged(this._extentChangedHandler);
        }
        this._extentChangedHandler = null;
        this._map = null;
        this._mainbar = null;
        this._containerDiv = null;
        this.get_element().innerHTML = '';
        if (this._scaleBarRenderer != null) {
            this._scaleBarRenderer.dispose();
            this._scaleBarRenderer = null;
        }
        ESRI.ADF.UI.ScaleBar.callBaseMethod(this, 'dispose');
    },
    _createScaleBar: function() {
        /// <summary>
        /// This method renders the divs used to represent the bar and its and tick marks.
        /// Basically we just create a set of divs with alternating color, and some text placeholders
        /// for the scale values. Everything is positioned and scaled using percentages, so changing the
        /// element size will automatically resize and reposition all the divs.
        /// </summary>
        if (Sys.Browser.agent !== Sys.Browser.InternetExplorer) {
            //IE uses a slightly different overflow behavior than FireFox
            this.get_element().style.overflow = 'visible';
        }
        this.get_element().style.width = this._serverWidth + 'px';
        if (this._backColor) {
            this.get_element().style.backgroundColor = this._backColor;
        }

        this._containerDiv = document.createElement('div');
        this._containerDiv.style.width = this._width + 'px';
        this._containerDiv.style.position = 'relative';

        // Create the bars and text in the scalebar using a set of divs and spans
        this._mainbar = document.createElement('div'); //Holds all contents
        this._mainbar.style.width = '100%';
        this._mainbar.style.position = 'relative';
        this._mainbar.fontSize = '10px';

        this._scaleBarRenderer.create(this._mainbar);
        this._containerDiv.appendChild(this._mainbar);
        this.get_element().appendChild(this._containerDiv);
    },

    _updateScaleBar: function(sender) {
        /// <summary>
        /// This method is called every time the map changes its extent and will update
        /// the scale bar width and values if necessary.
        /// </summary>        
        if (!sender) { return; } //The sender will be the map
        var extent = null;
        if (this._mapUnit === ESRI.ADF.UI.ScaleBarUnits.DecimalDegrees) {
            // extent is needed only for this use case where we might need to re-calculate pixelSize
            extent = sender.get_extent();
        }
        var maxWidth = this._width - 10; //10px for the padding on right-left side        
        this._currentBarWidth = this._scaleBarRenderer.onExtentChanged(this, { "extent": extent, "pixelSize": sender.get_pixelSize(), "maxWidth": maxWidth });

        var handler = this.get_events().getHandler('scaleChanged');
        if (handler) { handler(this, this._currentBarWidth); }
    },
    __refresh: function() {
        if (this._scaleBarRenderer) {
            this._scaleBarRenderer.dispose();
        }
        this.get_element().removeChild(this._containerDiv);
        this._createScaleBar();
        if (this._map) { this._updateScaleBar(this._map); }
    },
    get_scaleBarWidth: function() {
        /// <value type="Number">Gets the current width of the scale bar in the current map unit.</value>
        return this._currentBarWidth;
    },
    get_map: function() {
        /// <value type="ESRI.ADF.UI.MapBase">Gets or sets the map used for the scalebar.</value>
        /// <remarks>This value must be set prior to initialization.</remarks>
        return this._map;
    },
    set_map: function(value) { this._map = value; },
    get_mapUnit: function() {
        /// <value type="ESRI.ADF.UI.Scalebar.Units">Gets or sets the unit of the coordinate system used by the map.</value>
        return this._mapUnit;
    },
    set_mapUnit: function(value) {
        if (typeof (value) === 'string') { value = eval(value); }
        this._mapUnit = value;
        if (this._scaleBarRenderer != null) {
            this._scaleBarRenderer._mapUnit = value;
        }
    },
    get_displayUnit: function() {
        /// <value type="ESRI.ADF.UI.Scalebar.Units">Gets or sets the display unit for the scalebar.</value>	
        /// <remarks>The display unit cannot be DecimalDegrees.</remarks>
        return this._displayUnit;
    },
    set_displayUnit: function(value) {
        if (typeof (value) === 'string') { value = eval(value); }
        if (this._displayUnit != value) {
            if (value === ESRI.ADF.UI.ScaleBarUnits.DecimalDegrees) {
                throw Error.argument("displayUnit", "DecimalDegrees is not a valid display unit");
            }
            this._displayUnit = value;
            if (this._scaleBarRenderer != null) {
                this._scaleBarRenderer._displayUnit = value;
            }
            if (this._map) { this._updateScaleBar(this._map); }
        }
    },
    get_earthRadius: function() {
        /// <value type="Number" integer="false">
        /// Gets or sets the earth radius used for converting geographic coordinates
        /// to distances.</value>	
        /// <remarks>Defaults to 6378137 meters (WGS84 / GRS1980).</remarks>
        return this._earthRadius;
    },
    set_earthRadius: function(value) {
        this._earthRadius = value;
        if (this._scaleBarRenderer != null) {
            this._scaleBarRenderer._earthRadius = value;
            this._scaleBarRenderer._degreeDist = value * this._toRadians;
        }
    },
    get_barColor: function() {
        /// <value type="String">Gets or sets the color of the scalebar.</value>	
        /// <remarks>This value must be set prior to initialization to have any effect.</remarks>
        return this._barColor;
    },
    set_barColor: function(value) { this._barColor = value; },
    get_scaleBarStyle: function() {
        /// <value type="ESRI.ADF.UI.ScaleBarStyle">Gets or sets the style of the scalebar.</value>
        /// <remarks>This value must be set prior to initialization to have any effect.</remarks>
        return this._scaleBarStyle;
    },
    set_scaleBarStyle: function(value) {
        if (typeof (value) === 'string') { value = eval(value); }
        this._scaleBarStyle = value;
    },
    get_scaleBarNumberPosition: function() {
        /// <value type="ESRI.ADF.UI.ScaleBarNumberPosition">Gets or sets the positioning of the numbers above/below the scalebar.</value>
        /// <remarks>This value must be set prior to initialization to have any effect.</remarks>
        return this._scaleBarNumberPosition;
    },
    set_scaleBarNumberPosition: function(value) {
        if (typeof (value) === 'string') { value = eval(value); }
        this._scaleBarNumberPosition = value;
    },
    get_barFontSize: function() {
        return this._barFontSize;
    },
    set_barFontSize: function(value) {
        this._barFontSize = parseFloat(value);
    },
    get_foreColor: function() {
        return this._foreColor;
    },
    set_foreColor: function(value) {
        this._foreColor = value;
    },
    get_serverWidth: function() {
        return this._serverWidth;
    },
    set_serverWidth: function(value) {
        this._serverWidth = parseInt(value);
    },
    get_backColor: function() {
        return this._backColor;
    },
    set_backColor: function(value) {
        this._backColor = value;
    },
    get_barHeight: function() {
        return this._barHeight;
    },
    set_barHeight: function(value) {
        this._barHeight = value;
    },
    get_significantDigits: function() {
        return this._significantDigits;
    },
    set_significantDigits: function(value) {
        this._significantDigits = value;
    },
    get_scaleBarUnitConversionGroup: function() {
        return this._scaleBarUnitConversionGroup;
    },
    set_scaleBarUnitConversionGroup: function(value) {
        if (typeof (value) === 'string') { value = eval(value); }
        this._scaleBarUnitConversionGroup = value;
    },
    get_labelText: function() {
        return this._labelText;
    },
    set_labelText: function(value) {
        this._labelText = value;
    },
    add_scaleChanged: function(handler) {
    /// <summary>Event raised when the scalebar value changed.</summary>
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
    /// 				<td>ESRI.ADF.UI.ScaleBar</td>
    /// 				<td>The ScaleBar that was updated when the map's extent was changed</td>
    /// 			</tr>
    /// 			<tr>
    /// 				<td>eventArgs</td>
    /// 				<td>Number</td>
    /// 				<td>The new width of the ScaleBar, in pixels</td>
    /// 			</tr>
    /// 		</tbody>
    /// 	</table>
    /// </remarks>
        this.get_events().addHandler('scaleChanged', handler);
    },
    remove_scaleChanged: function(handler) { this.get_events().removeHandler('scaleChanged', handler); }
};

ESRI.ADF.UI.ScaleBar.registerClass('ESRI.ADF.UI.ScaleBar', Sys.UI.Control);
	