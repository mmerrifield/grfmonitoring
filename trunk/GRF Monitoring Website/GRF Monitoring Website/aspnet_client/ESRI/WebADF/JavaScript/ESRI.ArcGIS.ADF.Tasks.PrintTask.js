// Register the namespace for the control.
Type.registerNamespace('ESRI.ArcGIS.ADF.Tasks');

ESRI.ArcGIS.ADF.Tasks.PrintTask = function(element) {
    ESRI.ArcGIS.ADF.Tasks.PrintTask.initializeBase(this, [element]);
    this._submitButtonID = null;
    this._callbackFunctionString = null;
    this._errorMessage = null;
    this._printLayoutTemplateUrl = null;
    this._widthSettings = null;
    this._widthDropDownListID = null;
    this._txtTitleID = null;
    this._legendSettings = null;
    this._continueString = null;
    this._legendNodes = null;
    this._taskResultsTables = null;
    this._taskResultNodeInfos = null;
    this._printWin = null;
    this._mapImageUrl = null;
    this._popUpBlockerMsg = null;
    this._mapCopyrightTextID = null;
    this._resultsOnly = false;
    this._copyrightHtml = '';
    this._windowOptions = "menubar=yes,location=no,toolbar=yes,width=700,height=600,top=100,left=200,scrollbars=yes,resizable=yes";
    this._isBusy = false;
};

ESRI.ArcGIS.ADF.Tasks.PrintTask.prototype = {
    initialize: function() {
        ESRI.ArcGIS.ADF.Tasks.PrintTask.callBaseMethod(this, 'initialize');
        $addHandler($get(this._submitButtonID), "click", Function.createDelegate(this, this._onSubmitButtonClick));
    },

    dispose: function() {
        $clearHandlers(this.get_element());
        this._printWin = null;
        this._legendNodes = null;
        this._taskResultsTables = null;
        ESRI.ArcGIS.ADF.Tasks.PrintTask.callBaseMethod(this, 'dispose');
    },

    ///
    /// Event handlers
    ///
    _onSubmitButtonClick: function(e) {
        e.preventDefault();
        this._printWin = window.open(this._printLayoutTemplateUrl, "_blank", this._windowOptions);
        if (!this._printWin) {
            alert(this._popUpBlockerMsg);
            return false;
        }
        var lastUnderscore = this._submitButtonID.lastIndexOf("_");
        var pre = this._submitButtonID.substring(0, lastUnderscore);
        var argument = "";
        var gotOutput = false;

        // Results only checkbox
        var printMap = $get(pre + "_resultsOnly");
        if (printMap !== null) {
            argument = this._addArgument(argument, "resultsOnly", printMap.checked);
            this._resultsOnly = printMap.checked;
            if (printMap.checked === false) {
                gotOutput = true;
            }
        }

        // Task Results. If the map is not to be printed, then check to make sure at least one task result
        // has been checked for printing.
        if (!gotOutput) {
            var cblResults = $get(pre + "_pnlResults_cblResults");
            if (cblResults !== null) {
                var checkBoxes = cblResults.getElementsByTagName('input');
                if (checkBoxes !== null && checkBoxes.length > 0) {
                    for (var i = 0; i < checkBoxes.length; ++i) {
                        if (checkBoxes[i].type === "checkbox" && checkBoxes[i].checked) {
                            gotOutput = true;
                            break;
                        }
                    }
                }
            }
        }

        // If no map and no results are to be printed, inform the user and abort
        if (gotOutput === false) {
            alert(this._decode(this._errorMessage));
            return false;
        }

        // Map Title
        var printTitle = "";
        var printBox = $get(pre + "_mapTitle");
        if (printBox !== null) {
            // replace "&"
            printTitle = printBox.value;
            printTitle = ESRI.ADF.System.escapeForCallback(printTitle);
            argument = this._addArgument(argument, "mapTitle", printTitle);
        }

        // Size drop down list
        var printWidth = $get(pre + "_width");
        if (printWidth !== null) {
            argument = this._addArgument(argument, "width", printWidth.selectedIndex);
        }

        // Quality drop down list
        var printQuality = $get(pre + "_quality");
        if (printQuality !== null) {
            argument = this._addArgument(argument, "quality", printQuality.selectedIndex);
        }

        // Include ScaleBar checkbox
        var printScaleBar = $get(pre + "_includeScaleBar");
        if (printScaleBar !== null) {
            argument = this._addArgument(argument, "includeScaleBar", printScaleBar.checked);
        }

        // Include North Arrow checkbox
        var printNorthArrow = $get(pre + "_includeNorthArrow");
        if (printNorthArrow !== null) {
            argument = this._addArgument(argument, "includeNorthArrow", printNorthArrow.checked);
        }

        // Include Legend checkbox
        var printLegend = $get(pre + "_includeLegend");
        if (printLegend !== null) {
            argument = this._addArgument(argument, "includeLegend", printLegend.checked);
        }

        var context = null;
        this._isBusy = true;
        this._doHourglass();
        executeTask(argument, this._callbackFunctionString);
        return false;
    },
    _printTaskOnComplete: function(mapImageUrl, errorMessage, legendNodes, taskResultsTables, tableCaptions, taskResultNodeInfos) {
        this._undoHourglass();
        if (errorMessage && errorMessage.length > 0) {
            alert(errorMessage);
            return;
        }
        if (tableCaptions) {
            for (var i = 0; i < tableCaptions.length; i++) {
                if (taskResultsTables[i]) {
                    taskResultsTables[i].caption = tableCaptions[i];
                }
            }
        }
        this._legendNodes = legendNodes;
        this._taskResultsTables = taskResultsTables;
        this._mapImageUrl = mapImageUrl;
        this._taskResultNodeInfos = taskResultNodeInfos;
        if (Sys.Browser.agent === Sys.Browser.InternetExplorer) {
            this._printToPopup();
        }
        else {
            window.setTimeout(Function.createDelegate(this, this._printToPopup), 0);
        }
    },
    _printToPopup: function() {
        if (this._printWin === null) { return; }
        if (document.dir === "rtl") {
            this._printWin.document.dir = "rtl";
        }
        var url = this._normalizeUrlForMime(this._mapImageUrl);
        var ddlMapWidth = $get(this._widthDropDownListID);
        var selIndex = ddlMapWidth ? ddlMapWidth.selectedIndex : this._widthSettings.DefaultValue;
        var width = this._widthSettings.WidthList[selIndex].WidthInInches;
        var height = this._widthSettings.WidthList[selIndex].HeightInInches;

        var map = this._printWin.document.getElementById('mapImage');
        if (map) {
            if (this._resultsOnly) {
                map.style.display = 'none';
            }
            else {
                map.style.display = '';
                map.src = url;
            }

            map.style.width = width + 'in';
            map.style.height = height + 'in';
        }
        if (this._printWin.setMapImage) {
            this._printWin.setMapImage(this, { "url": url, "width": width, "height": height });
        }
        var titleHeader = $get(this._txtTitleID).value;
        this._printWin.document.title = titleHeader;
        var printHeader = this._printWin.document.getElementById('mapTitle');
        if (printHeader) {
            printHeader.innerHTML = titleHeader;
        }
        if (this._printWin.setTitleHeader) {
            this._printWin.setTitleHeader(this, { "title": titleHeader });
        }

        var legendSection = this._printWin.document.getElementById('legendSection');
        if (legendSection) {
            if (!this._resultsOnly) {
                this._renderLegend(this._printWin.document, legendSection, this._legendNodes, this._legendSettings.Columns,
                     this._legendSettings.ColumnThreshold, this._legendSettings.Condensed, 10, 7.5);
            }
        }
        if (this._printWin.setLegend) {
            this._printWin.setLegend(this, { "nodes": this._legendNodes, "settings": this._legendSettings });
        }

        this._renderTaskResults();
        var mapCopyright = $find(this._mapCopyrightTextID);
        var titleText = null;
        var copyrightText = null;
        if (mapCopyright) {
            var elem = this._printWin.document.getElementById('mapCopyrightText');
            if (elem) {
                if (!this._resultsOnly) {
                    copyrightText = mapCopyright.get_copyrightText();
                    elem.innerHTML = copyrightText
                }
            }
            elem = this._printWin.document.getElementById('mapCopyrightTitle');
            if (elem && copyrightText != null && copyrightText.length > 0) {
                if (!this._resultsOnly) {
                    titleText = mapCopyright.get_calloutWindowTitleText();
                    if (titleText != null && titleText.length > 0) {
                        elem.innerHTML = titleText;
                    }
                }
            }
            if (this._printWin.setMapCopyrightText) {
                this._printWin.setMapCopyrightText(this, { "title": titleText, "copyright": copyrightText });
            }
        }
        if (this._printWin.document.cookie && this._printWin.document.cookie.length > 0) {
            var val = ('_printTaskParent=' + this.get_id() + ';') + this._printWin.document.cookie;
            this._printWin.document.cookie = val;
        }
        else {
            this._printWin.document.cookie = '_printTaskParent=' + this.get_id();
        }
        this._isBusy = false;
    },
    _renderTaskResults: function() {
        var doc = this._printWin.document;
        var container = doc.createElement('div');
        var taskResultsSection = this._printWin.document.getElementById('taskResultsSection');
        if (taskResultsSection) {
            for (var i = 0; i < this._taskResultsTables.length; i++) {
                var dt = this._taskResultsTables[i];
                if (this._taskResultNodeInfos[i]) {
                    var div = doc.createElement('div');
                    div.className = 'taskResultHeader';
                    div.innerHTML = this._taskResultNodeInfos[i].nodeText;
                    container.appendChild(div);
                }

                var table = doc.createElement('table');
                table.className = 'taskResultsTable';
                container.appendChild(table);
                table.cellSpacing = 0;

                var caption = table.createCaption();
                caption.className = 'taskResultsTableCaption';
                caption.innerHTML = dt.caption;

                var thead = table.appendChild(doc.createElement('thead'));
                var tbody = table.appendChild(doc.createElement('tbody'));

                var colNames = dt.columnNames.split(',');
                var cols = colNames != null ? colNames.length : 0;
                if (colNames) {
                    var tr = thead.appendChild(doc.createElement('tr'));
                    for (var c = 0; c < cols; c++) {
                        var th = tr.appendChild(doc.createElement('th'));
                        th.className = 'resultCellHeader';
                        th.innerHTML = colNames[c];
                    }
                }

                for (var j = 0; j < dt.rows.length; j++) {
                    var row = dt.rows[j];
                    var tr = table.insertRow(-1)
                    var td = null;
                    for (var k = 0; k < cols; k++) {
                        td = tr.insertCell(-1);
                        td.className = 'resultCell';
                        td.innerHTML = row[colNames[k]];
                    }
                }
            }
            taskResultsSection.appendChild(container);
        }
        if (this._printWin.setTaskResults) {
            this._printWin.setTaskResults(this, { "tables": this._taskResultsTables, "taskResultNodeInfos": this._taskResultNodeInfos });
        }
    },
    _renderLegend: function(doc, legendSection, nodes, columns, columnThreshold, condensed, legendFontSize, legendPageSize) {
        if (!nodes || nodes.length === 0) {
            return;
        }

        var fmt = this._parseNodesIntoBlocks(nodes);
        var cols = Math.floor(this._formatBlocks(fmt, nodes.length, columns, columnThreshold));
        var colWidthPct = Math.floor(100 / cols);

        var table = doc.createElement('table');
        if (columns > 1) {
            table.style.width = (legendPageSize - (legendPageSize * 0.04)) + 'in';
        }
        //table.style.fontSize = legendFontSize + "px";

        var tables = new Array();
        var row = table.insertRow(-1);
        var cell = null;
        var lbl = null;
        for (var colIdx = 0; colIdx < cols; colIdx++) {
            tables[colIdx] = doc.createElement('table');
            table.className = 'legendSectionTable';
            //tables[colIdx].style.fontSize = legendFontSize + "px";
            cell = row.insertCell(-1);
            cell.style.width = colWidthPct + '%';
            cell.vAlign = "top";

            cell.appendChild(tables[colIdx]);
        }

        var len = fmt.length;
        for (var i = 0; i < len; i++) {
            var bi = fmt[i];
            if (bi.continuation && bi.rootIndex != -1) {
                row = tables[bi.columnIndex].insertRow(-1);

                cell = row.insertCell(-1);
                cell.Width = colWidthPct + '%';

                if (nodes[bi.rootIndex].depth > 1) {
                    var padding = (nodes[bi.rootIndex].depth - 1) * (condensed ? 20 : 10);
                    cell.style.paddingLeft = padding + "px";
                }

                lbl = doc.createElement('span');
                lbl.className = 'legendLabel';
                lbl.innerHTML = String.format("{0} {1}", nodes[bi.rootIndex].label, this._continueString);
                cell.appendChild(lbl);
            }

            for (var nodeIdx = bi.begIndex; nodeIdx <= bi.endIndex; nodeIdx++) {
                row = tables[bi.columnIndex].insertRow(-1);

                cell = row.insertCell(-1);
                cell.style.width = colWidthPct + '%';

                if (nodes[nodeIdx].depth > 1) {
                    var padding = (nodes[nodeIdx].depth - 1) * (condensed ? 20 : 10);
                    cell.style.paddingLeft = padding + "px";
                }

                var prnt = null;
                // Add an image control for the swatch
                if (nodes[nodeIdx].imageURL !== null && (nodes[nodeIdx].imageURL.length > 0)) {
                    var url = this._normalizeUrlForMime(nodes[nodeIdx].imageURL);
                    if (ESRI.ADF.System.__isIE6) {
                        // IE6 seems to have timing issues with assigning src attribute directly to img tags
                        // and will show broken swatches. So to avoid that, wrap in a div tag and assign the innerHTML
                        var div = doc.createElement('div');
                        cell.appendChild(div);
                        prnt = div;
                        div.innerHTML = '<img valign="middle" src="' + url + '" />';
                    }
                    else {
                        var swatch = doc.createElement('img');
                        swatch.vAlign = "middle";
                        swatch.src = url;
                        cell.appendChild(swatch);
                        prnt = cell;
                    }
                }

                // Add a label control for the text
                if (nodes[nodeIdx].label !== null && (nodes[nodeIdx].label.length > 0)) {
                    lbl = doc.createElement('span');
                    lbl.className = 'legendLabel';
                    lbl.innerHTML = nodes[nodeIdx].label;
                    lbl.vAlign = "middle";
                    if (prnt) { prnt.appendChild(lbl); }
                    else { cell.appendChild(lbl); }

                }
            }
        }
        legendSection.appendChild(table);
    },
    _normalizeUrlForMime: function(mimeUrl) {
        var url = '';
        if (mimeUrl && (mimeUrl.indexOf('ESRI.ArcGIS.ADF.Web.MimeImage.ashx') > -1 || mimeUrl.indexOf('WebResource.axd') > -1)) { // using MIME or an embedded resource
            url = this._appPath + '/' + mimeUrl;
            if (ESRI.ADF.System.__isIE6) {
                url = url.replace('kc=1', 'kc=2');
            }
        }
        else {
            url = mimeUrl;
        }
        return url;
    },
    _parseNodesIntoBlocks: function(nodes) {
        var blocks = [];

        var begIdx = 0;
        var backTrack;
        var wantSwatch = true;
        var hasSwatch = false;
        for (var nodIdx = 1; nodIdx < nodes.length; nodIdx++) {
            var node = nodes[nodIdx];
            hasSwatch = node.imageURL != null && (node.imageURL.length > 0);

            if (wantSwatch === hasSwatch) {
                if (wantSwatch) {
                    backTrack = 2;
                }
                else {
                    backTrack = 1;
                }

                blocks.push(new ESRI.ArcGIS.ADF.Tasks._BlockInfo(begIdx, nodIdx - backTrack));
                begIdx = nodIdx - (backTrack - 1);

                wantSwatch = !wantSwatch;
            }
        }

        blocks.push(new ESRI.ArcGIS.ADF.Tasks._BlockInfo(begIdx, nodes.length - 1));

        return blocks;
    },
    _formatBlocks: function(blocks, nodeCount, columns, rowBreakThreshold) {
        var rows = Math.floor(nodeCount / columns);
        if ((nodeCount % columns) > 0)
        { rows++; }

        var colIdx = 0;
        var rowCnt = 0;
        var blk = null;
        for (var blkIdx = 0; blkIdx < blocks.length; blkIdx++) {
            blk = blocks[blkIdx];
            blk.columnIndex = colIdx;

            if ((rowCnt + blk.get_Count()) > rows) {
                if (blk.get_ChildCount() >= (rowBreakThreshold * 2)) {
                    var copyCnt = rows - rowCnt;

                    if (copyCnt < (rowBreakThreshold + 1))
                    { copyCnt = (rowBreakThreshold + 1); }
                    else {
                        if (copyCnt > (blk.get_Count() - rowBreakThreshold))
                            copyCnt = (blk.get_Count() - rowBreakThreshold);
                    }

                    if (blk.rootIndex == -1)
                    { blk.rootIndex = blk.begIndex; }
                    else
                    { --copyCnt; }

                    var insert = new ESRI.ArcGIS.ADF.Tasks._BlockInfo(blk.begIndex + copyCnt, blk.endIndex);
                    insert.rootIndex = blk.rootIndex;
                    insert.continuation = true;
                    Array.insert(blocks, blkIdx + 1, insert);

                    blk.endIndex = blk.begIndex + (copyCnt - 1);
                }
                colIdx++;
                rowCnt = 0;
            }
            else {
                rowCnt += blk.get_Count();

                if (rowCnt == rows) {
                    colIdx++;
                    rowCnt = 0;
                }
            }
        }

        // Return the number of columns actually needed to render all blocks
        return colIdx + (rowCnt > 0 ? 1 : 0);
    },
    isRenderingContent: function() {
        return this._isBusy;
    },
    _doHourglass: function() {
        document.body.style.cursor = 'wait';
    },
    _undoHourglass: function() {
        document.body.style.cursor = 'default';
    },
    _addArgument: function(output, name, value) {
        if (output !== "") {
            output += "&";
        }
        output += name + "=" + value;
        return output;
    },
    _decode: function(entityString) {
        var conversionMap = {
            "amp": "&",
            "lt": "<",
            "gt": ">",
            "apos": "'",
            "quot": '"'
        };
        return entityString.replace(/&(\w+);/g, function(m, g) {
            return conversionMap[g] || m;
        });
    },
    get_submitButtonID: function() {
        return this._submitButtonID;
    },
    set_submitButtonID: function(value) {
        this._submitButtonID = value;
    },
    get_errorMessage: function() {
        return this._errorMessage;
    },
    set_errorMessage: function(value) {
        this._errorMessage = value;
    },
    get_callbackFunctionString: function() {
        return this._callbackFunctionString;
    },
    set_callbackFunctionString: function(value) {
        this._callbackFunctionString = value;
    },
    get_printLayoutTemplateUrl: function() {
        return this._printLayoutTemplateUrl;
    },
    set_printLayoutTemplateUrl: function(value) {
        this._printLayoutTemplateUrl = value;
    },
    get_widthSettings: function() {
        return this._widthSettings;
    },
    set_widthSettings: function(value) {
        this._widthSettings = value;
    },
    get_widthDropDownListID: function() {
        return this._widthDropDownListID;
    },
    set_widthDropDownListID: function(value) {
        this._widthDropDownListID = value;
    },
    get_txtTitleID: function() {
        return this._txtTitleID;
    },
    set_txtTitleID: function(value) {
        this._txtTitleID = value;
    },
    get_appPath: function() {
        return this._appPath;
    },
    set_appPath: function(value) {
        this._appPath = value;
    },
    get_legendSettings: function() {
        return this._legendSettings;
    },
    set_legendSettings: function(value) {
        this._legendSettings = value;
    },
    get_continueString: function() {
        return this._continueString;
    },
    set_continueString: function(value) {
        this._continueString = value;
    },
    get_popUpBlockerMsg: function() {
        return this._popUpBlockerMsg;
    },
    set_popUpBlockerMsg: function(value) {
        this._popUpBlockerMsg = value;
    },
    get_mapCopyrightTextID: function() {
        return this._mapCopyrightTextID;
    },
    set_mapCopyrightTextID: function(value) {
        this._mapCopyrightTextID = value;
    },
    get_windowOptions: function() {
        return this._windowOptions;
    },
    set_windowOptions: function(value) {
        this._windowOptions = value;
    }
};

ESRI.ArcGIS.ADF.Tasks.PrintTask.registerClass('ESRI.ArcGIS.ADF.Tasks.PrintTask', Sys.UI.Control);

ESRI.ArcGIS.ADF.Tasks._BlockInfo = function(beg, end) {
    this.continuation = false;
    this.begIndex = beg;
    this.endIndex = end;
    this.columnIndex = -1;
    this.rootIndex = -1;
};
ESRI.ArcGIS.ADF.Tasks._BlockInfo.prototype = {
    get_Count: function() {
        var diff = ((this.endIndex - this.begIndex) + 1);

        if (this.continuation && this.rootIndex != -1)
        { diff++; }

        return diff;
    },
    get_ChildCount: function() {
        return this.get_Count() - 1;
    }
};
ESRI.ArcGIS.ADF.Tasks._BlockInfo.registerClass('ESRI.ArcGIS.ADF.Tasks._BlockInfo');

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
