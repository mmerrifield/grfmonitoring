var report;
var options;
var svc;
var defaultTheme;
$(function () {
  $('#Sites').multiselect({ selectedText: '# Sites of # Selected' });
  $('#ReportType').multiselect({ header: false, multiple: false, selectedList: 1, height: 'auto', minWidth: 'auto', 'close': function () {
    var reportType = $(this).val();
    svc = 'GRFService.svc/';
    $('.footnotes').hide();
    if (reportType === 'MWAT') {
      $('.Graph').show();
      $('#tblcontainer').hide();
      $('#container').show();
      svc += 'WeeklyMWATData';
      $('#MWATfootnote').show();
      options.title.text = 'MWAT Report';
    }
    else if (reportType == 'MWMT') {
      $('.Graph').show();
      $('#tblcontainer').hide();
      $('#container').show();
      options.title.text = 'MWMT Report';
      svc += 'WeeklyMWMTData';
      $('#MWMTfootnote').show();
    }
    else if (reportType == 'MaxMWAT') {
      $('.Graph').hide();
      $('#container').hide();
      $('#tblcontainer').show();
      $('#MWATMaxfootnote').show();
      $('#tblMax').jqGrid('clearGridData', true);
      $('#tblMax').jqGrid('setCaption', 'Max MWAT');
      svc += 'MaxMWATData';
    }
    else if (reportType == 'MaxMWMT') {
      $('.Graph').hide();
      $('#container').hide();
      $('#tblcontainer').show();
      $('#MWMTMaxfootnote').show();
      $('#tblMax').jqGrid('clearGridData', true);
      $('#tblMax').jqGrid('setCaption', 'Max MWMT');
      svc += 'MaxMWMTData';
    }
    options.series.length = 0;
    if (report !== null && (reportType === 'MWAT' || reportType === 'MWMT')) {
      report.destroy();
      report = new Highcharts.Chart(options);
    }
  }
  });
  $('#ChartStyle').multiselect({ header: false, multiple: false, selectedList: 1, height: 'auto', minWidth: 'auto', 'close': function () {
    if (options.series.length > 0) {
      $.each(options.series, function (i, s) { s.type = $('#ChartStyle').val(); });
      report.destroy();
      report = new Highcharts.Chart(options);
    }
  }
  });
  $('#Series').multiselect({ header: false, multiple: false, selectedList: 1, height: 'auto', minWidth: 'auto', 'close': updateChart });
  $('#ShowMarkers').multiselect({ header: false, multiple: false, selectedList: 1, height: 'auto', minWidth: 'auto', 'close': function () {
    var isEnabled = $(this).val() === 'true';
    options.plotOptions.line.marker.enabled = isEnabled;
    options.plotOptions.area.marker.enabled = isEnabled;
    options.plotOptions.spline.marker.enabled = isEnabled;
    options.plotOptions.areaspline.marker.enabled = isEnabled;
    report.destroy();
    report = new Highcharts.Chart(options);
  }
  });
  $('#Theme').multiselect({ header: false, multiple: false, selectedList: 1, height: 'auto', minWidth: 'auto', 'close': setTheme });
  getYears();
  $('.Filter').on('change', function () { getSites(); options.series.length = 0; report.destroy(); report = new Highcharts.Chart(options); });
  $('#GenReport').button().on('click', updateReport);
  $("#tblMax").jqGrid({
    datatype: function (pdata) {
      getMaxData(pdata);
    },
    colNames: ['Site', 'Year', 'Type', 'Max Temp (C)', 'Days Exceeded', 'Percent', 'Comments'],
    colModel: [
      { name: 'Site', index: 'Site', width: '300', sortable: false },
      { name: 'Year', index: 'Year', width: '75', sortable: false },
      { name: 'Type', index: 'Type', width: '120', sortable: false },
      { name: 'MaxTemp', index: 'MaxTemp', width: '80', align: 'right', sortable: false },
      { name: 'DaysExceeded', index: 'DaysExceeded', width: '80', align: 'right', sortable: false },
      { name: 'Percent', index: 'Percent', width: '80', align: 'right', sortable: false },
      { name: 'Comments', index: 'Comments', width: '90', sortable: false }
    ],
    autowidth: true,
    sortable: false,
    rowNum: 20,
    rowList: [10, 20, 50, 100],
    viewrecords: true,
    gridview: true,
    caption: 'Max MWMT',
    footerrow: false,
    pager: '#navTblMax',
    toolbar: [true, 'top'],
    pgbuttons: true,
    pginput: true
  });
  $("#t_tblMax").append("<input type='button' value='Export to Excel' style='height:20px;font-size:-3;float:right'/>");
  $("input", "#t_tblMax").click(function () {
    var params = getParams(false);
    params.format = $('#ReportType').val();
    params.sites = '';
    $.each($('#Sites').multiselect('getChecked'), function (i, s) {
      if (params.sites.length > 0)
        params.sites += ',';
      params.sites += s.value;
    });
    var urlStr = 'GRFService.svc/ExportReport?format=' + params.format + '&startMon=0&endMon=0&startYr=' + params.startYr + '&endYr=' + params.endYr + '&sites=' + params.sites;
    $('#tblMax').jqGrid('excelExport', { url: urlStr });
  });
  $('#tblMax').setGridHeight('450px');
  initChart();
});
function getYears() {  
  var params = {}
  params.site = ''
  params.type = '';
  $.get('GRFService.svc/Years', params, function (data) {
    var sel1 = $('#StartYr')[0];
    var sel2 = $('#EndYr')[0];
    sel1.options.length = 0;
    sel1.options[0] = new Option('', '');
    sel2.options.length = 0;
    sel2.options[0] = new Option('', '');
    $.each(data, function (index, yr) {
      sel1.options[sel1.options.length] = new Option(yr, yr);
      sel2.options[sel2.options.length] = new Option(yr, yr);
    });
  });
}
function clearSites() {
  $('#Sites')[0].options.length = 0;
  $('#Sites').multiselect('refresh');
  options.series.length = 0;
  chart = new Highcharts.Chart(options);
  $('#tblMax').jqGrid('clearGridData', true);
}
function getSites() {
  var params = getParams(true);
  if (params === null)
    return;
  $.get('GRFService.svc/ReportSites', params, function (data) {
    var site = $('#Sites')[0];
    site.options.length = 0;
    $.each(data, function (i, s) { site.options[site.options.length] = new Option(s.Name, s.Id) });
    $('#Sites').multiselect('refresh');
    $('#Sites').multiselect('uncheckAll');
  });
}
function getParams(clear){
  var params = {};
  params.startMon = $('#StartMon').val();
  params.startYr = $('#StartYr').val();
  params.endMon = $('#EndMon').val();
  params.endYr = $('#EndYr').val();
  params.format = $('#Series').val();
  if (clear && params.startYr === null || params.startYr.length === 0 || params.endYr === null || params.endYr.length === 0) {
    clearSites();
    return null;
  }
  if (clear && parseInt(params.startYr) > parseInt(params.endYr) || (parseInt(params.startYr) == parseInt(params.endYr) && parseInt(params.startMon) > parseInt(params.endMon))) {
    clearSites();
    return null;
  }
  return params;
}
function initChart() {
  options = {
    credits: { enabled: false },
    chart: {
      renderTo: 'container',
      zoomType: 'x'
    },
    title: { text: '' },
    xAxis: {
      labels: { format: '{value:%b %y}', align: 'bottom' },
      title: { text: 'Date' },
      type: 'datetime'
    },
    yAxis: [{
      labels: {
        formatter: function () { return this.value; }
      },
      title: { text: 'Temperature (°C)' }
    }],
    tooltip: {
      formatter: function () {
        if (this.series.name.length >= 9 && this.series.name.substring(0, 9) === 'Threshold')
          return false;
        else if ($('#Series').val() == 'FS') 
          return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%e - %b - %Y',
                                              new Date(this.x))
                    + '  <br/>' + this.y.toFixed(2) + ' °C';
        else
          return '<b>' + this.series.name + '</b><br/>' +
            Highcharts.dateFormat('%e - %b', new Date(this.x))
              + ' <br/>' + this.y.toFixed(2) + ' °C';
      }
    },
    plotOptions: {
      line: { marker: { enabled: false} },
      area: { marker: { enabled: false} },
      spline: { marker: { enabled: false} },
      areaspline: { marker: { enabled: false} }
    },
    series: []
  };
  $('.footnotes').hide();
  svc = 'GRFService.svc/';
  svc += 'WeeklyMWATData';
  $('#MWATfootnote').show();
  options.title.text = 'MWAT Report';
  try {
    report = new Highcharts.Chart(options);
  }
  catch (e) {
    alert(e);
  }
}
function updateReport() {
  var reportType = $('#ReportType').val();
  if (reportType === 'MWAT' || reportType == 'MWMT')
    updateChart(reportType);
  else
    $('#tblMax').trigger('reloadGrid');
}
function updateChart(reportType) {
  if (defaultTheme === null)
    defaultTheme == Highcharts.theme;
  var params = getParams(true);
  if (params === null) return;
  params.sites = [];
  $.each($('#Sites').multiselect('getChecked'), function (i, s) { if (params.sites.length > 0) params.sites += ','; params.sites += s.value; });
  if (params.sites.length === 0)
    return;
  params.addNullPt = true;
  $.get(svc, params, function (data) {
    if ($('#Series').val() === 'SS')
      options.xAxis.labels.format = '{value:%e - %b}';
    else
      options.xAxis.labels.format = '{value:%b %y}';

    options.series.length = 0;
    $.each(data, function (idx, series) {
      series.connectNulls = false;
      if (idx === 0)
        series.type = 'line';
      else
        series.type = $('#ChartStyle').val();
      options.series.push(series);
      options.series.pointStart = Date.UTC(1970, 0, 0);
    });
    report = new Highcharts.Chart(options);
  });
  $('#container').show();
}
function exportData() {
  if (options.series.length === 0) return;
  var params = getParams(false);
  params.format = $('#ReportType').val();
  params.sites = '';
  $.each($('#Sites').multiselect('getChecked'), function (i, s) {
    if (params.sites.length > 0)
      params.sites += ',';
    params.sites += s.value;
  });
  params.addNullPt = false;
  $.get('GRFService.svc/ExportReport', params, function (data) {
    var filename = params.format + '-' + params.startMon + '-' + params.startYr + '_' + params.endMon + '-' + params.endYr + '.xls';
    download(data, filename, 'application/ms-excel;charset=UTF-8');
  });
}
function getMaxData(pdata){
  var grid = $('#tblMax');
  $('#tblMax').jqGrid('clearGridData', true);

  var params = {};
  params.sites = ''
  $.each($('#Sites').multiselect('getChecked'), function (i, s) {
    if (params.sites.length > 0)
      params.sites += ',';
    params.sites += s.value;
  });
  params.startYr = $('#StartYr').val();
  params.endYr = $('#EndYr').val();

  if (params.sites.length === 0 || params.startYr.length === 0 || params.endYr.length === 0)
    return;
  params.pageIndex = pdata.page == null ? grid.jqGrid('getGridParam', 'page') : pdata.page;
  params.pageSize = pdata.rows == null ? grid.jqGrid('getGridParam', 'rowNum') : pdata.rows;

  $.ajax(
  {
    type: "GET",
    url: svc,
    datatype: 'json',
    contentType: "application/json; charset=utf-8",
    data: params,
    success: function (data, textStatus) {
      if (textStatus == "success") {
        var grid = $("#tblMax")[0];
        grid.addJSONData(data);
      }
    },
    error: function (data, textStatus) {
      alert('An error has occured retrieving data!');
    }
  });
}
function download(strData, strFileName, strMimeType) {
  var D = document,
        A = arguments,
        a = D.createElement("a"),
        d = A[0],
        n = A[1],
        t = A[2] || "text/plain";

  //build download link:
  a.href = "data:" + strMimeType + "," + escape(strData);


  if (window.MSBlobBuilder) { // IE10
    var bb = new MSBlobBuilder();
    bb.append(strData);
    return navigator.msSaveBlob(bb, strFileName);
  } /* end if(window.MSBlobBuilder) */



  if ('download' in a) { //FF20, CH19
    a.setAttribute("download", n);
    a.innerHTML = "downloading...";
    D.body.appendChild(a);
    setTimeout(function () {
      var e = D.createEvent("MouseEvents");
      e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      D.body.removeChild(a);
    }, 66);
    return true;
  }; /* end if('download' in a) */



  //do iframe dataURL download: (older W3)
  var f = D.createElement("iframe");
  D.body.appendChild(f);
  f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
  setTimeout(function () {
    D.body.removeChild(f);
  }, 333);
  return true;
}
function setTheme(){
  var theme = $('#Theme').val();
  Highcharts.theme = {
    colors: ['#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970',
        '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
    chart: {
      backgroundColor: '#fff',
      borderWidth: 0,
      plotBackgroundColor: '#fff',
      plotShadow: false,
      plotBorderWidth: 0
    },
    title: {
      style: {
        color: '#274b6d', //#3E576F',
        fontSize: '16px'
      }
    },
    subtitle: {
      style: {
        color: '#4d759e'
      }
    },
    xAxis: {
      gridLineWidth: 0,
      lineColor: '#C0D0E0',
      tickColor: '#C0D0E0',
      labels: {
        style: {
          color: '#666',
          cursor: 'default',
          fontSize: '11px',
          lineHeight: '14px'
        }
      },
      title: {
        style: {
          color: '#4d759e',
          fontWeight: 'bold'
        }
      }
    },
    yAxis: {
      minorTickInterval: null,
      lineColor: '#C0D0E0',
      lineWidth: 1,
      tickWidth: 1,
      tickColor: '#C0D0E0',
      labels: {
        style: {
          color: '#666',
          cursor: 'default',
          fontSize: '11px',
          lineHeight: '14px'
        }
      },
      title: {
        style: {
          color: '#4d759e',
          fontWeight: 'bold'
        }
      }
    },
    legend: {
      itemStyle: {
        color: '#274b6d',
        fontSize: '12px'
      },
      itemHoverStyle: {
        color: '#000'
      },
      itemHiddenStyle: {
        color: '#CCC'
      }
    },
    labels: {
      style: {
        color: '#3E576F'
      }
    },

    navigation: {
      buttonOptions: {
        theme: {
          stroke: '#CCCCCC'
        }
      }
    }
  };
  if (theme == 'Grid') {
    Highcharts.theme = {
      colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
      chart: {
        backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
          stops: [
				[0, 'rgb(255, 255, 255)'],
				[1, 'rgb(240, 240, 255)']
			]
        },
        borderWidth: 2,
        plotBackgroundColor: 'rgba(255, 255, 255, .9)',
        plotShadow: true,
        plotBorderWidth: 1
      },
      title: {
        style: {
          color: '#000',
          font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      subtitle: {
        style: {
          color: '#666666',
          font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      xAxis: {
        gridLineWidth: 1,
        lineColor: '#000',
        tickColor: '#000',
        labels: {
          style: {
            color: '#000',
            font: '11px Trebuchet MS, Verdana, sans-serif'
          }
        },
        title: {
          style: {
            color: '#333',
            fontWeight: 'bold',
            fontSize: '12px',
            fontFamily: 'Trebuchet MS, Verdana, sans-serif'

          }
        }
      },
      yAxis: {
        minorTickInterval: .2, //'auto',
        lineColor: '#000',
        lineWidth: 1,
        tickWidth: 1,
        tickColor: '#000',
        labels: {
          style: {
            color: '#000',
            font: '11px Trebuchet MS, Verdana, sans-serif'
          }
        },
        title: {
          style: {
            color: '#333',
            fontWeight: 'bold',
            fontSize: '12px',
            fontFamily: 'Trebuchet MS, Verdana, sans-serif'
          }
        }
      },
      legend: {
        itemStyle: {
          font: '9pt Trebuchet MS, Verdana, sans-serif',
          color: 'black'

        },
        itemHoverStyle: {
          color: '#039'
        },
        itemHiddenStyle: {
          color: 'gray'
        }
      },
      labels: {
        style: {
          color: '#99b'
        }
      },

      navigation: {
        buttonOptions: {
          theme: {
            stroke: '#CCCCCC'
          }
        }
      }
    };
  }
  else if (theme == 'Gray') {
    Highcharts.theme = {
      colors: ["#DDDF0D", "#7798BF", "#55BF3B", "#DF5353", "#aaeeee", "#ff0066", "#eeaaee",
		"#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
      chart: {
        backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
				[0, 'rgb(96, 96, 96)'],
				[1, 'rgb(16, 16, 16)']
			]
        },
        borderWidth: 0,
        borderRadius: 15,
        plotBackgroundColor: null,
        plotShadow: false,
        plotBorderWidth: 0
      },
      title: {
        style: {
          color: '#FFF',
          font: '16px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
        }
      },
      subtitle: {
        style: {
          color: '#DDD',
          font: '12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
        }
      },
      xAxis: {
        gridLineWidth: 0,
        lineColor: '#999',
        tickColor: '#999',
        labels: {
          style: {
            color: '#999',
            fontWeight: 'bold'
          }
        },
        title: {
          style: {
            color: '#AAA',
            font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
          }
        }
      },
      yAxis: {
        alternateGridColor: null,
        minorTickInterval: null,
        gridLineColor: 'rgba(255, 255, 255, .1)',
        minorGridLineColor: 'rgba(255,255,255,0.07)',
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          style: {
            color: '#999',
            fontWeight: 'bold'
          }
        },
        title: {
          style: {
            color: '#AAA',
            font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
          }
        }
      },
      legend: {
        itemStyle: {
          color: '#CCC'
        },
        itemHoverStyle: {
          color: '#FFF'
        },
        itemHiddenStyle: {
          color: '#333'
        }
      },
      labels: {
        style: {
          color: '#CCC'
        }
      },
      tooltip: {
        backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
				[0, 'rgba(96, 96, 96, .8)'],
				[1, 'rgba(16, 16, 16, .8)']
			]
        },
        borderWidth: 0,
        style: {
          color: '#FFF'
        }
      },
      plotOptions: {
        series: {
          shadow: true
        },
        line: {
          dataLabels: {
            color: '#CCC'
          },
          marker: {
            lineColor: '#333'
          }
        },
        spline: {
          marker: {
            lineColor: '#333'
          }
        },
        scatter: {
          marker: {
            lineColor: '#333'
          }
        },
        candlestick: {
          lineColor: 'white'
        }
      },

      toolbar: {
        itemStyle: {
          color: '#CCC'
        }
      },

      navigation: {
        buttonOptions: {
          symbolStroke: '#DDDDDD',
          hoverSymbolStroke: '#FFFFFF',
          theme: {
            fill: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
						[0.4, '#606060'],
						[0.6, '#333333']
					]
            },
            stroke: '#000000'
          }
        }
      },

      // scroll charts
      rangeSelector: {
        buttonTheme: {
          fill: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
					[0.4, '#888'],
					[0.6, '#555']
				]
          },
          stroke: '#000000',
          style: {
            color: '#CCC',
            fontWeight: 'bold'
          },
          states: {
            hover: {
              fill: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
							[0.4, '#BBB'],
							[0.6, '#888']
						]
              },
              stroke: '#000000',
              style: {
                color: 'white'
              }
            },
            select: {
              fill: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
							[0.1, '#000'],
							[0.3, '#333']
						]
              },
              stroke: '#000000',
              style: {
                color: 'yellow'
              }
            }
          }
        },
        inputStyle: {
          backgroundColor: '#333',
          color: 'silver'
        },
        labelStyle: {
          color: 'silver'
        }
      },

      navigator: {
        handles: {
          backgroundColor: '#666',
          borderColor: '#AAA'
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(16, 16, 16, 0.5)',
        series: {
          color: '#7798BF',
          lineColor: '#A6C7ED'
        }
      },

      scrollbar: {
        barBackgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
					[0.4, '#888'],
					[0.6, '#555']
				]
        },
        barBorderColor: '#CCC',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
					[0.4, '#888'],
					[0.6, '#555']
				]
        },
        buttonBorderColor: '#CCC',
        rifleColor: '#FFF',
        trackBackgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
				[0, '#000'],
				[1, '#333']
			]
        },
        trackBorderColor: '#666'
      },

      // special colors for some of the demo examples
      legendBackgroundColor: 'rgba(48, 48, 48, 0.8)',
      legendBackgroundColorSolid: 'rgb(70, 70, 70)',
      dataLabelsColor: '#444',
      textColor: '#E0E0E0',
      maskColor: 'rgba(255,255,255,0.3)'
    };
  }
  else if (theme == 'DarkBlue') {
    Highcharts.theme = {
      colors: ["#DDDF0D", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
		"#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
      chart: {
        backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
          stops: [
				[0, 'rgb(48, 48, 96)'],
				[1, 'rgb(0, 0, 0)']
			]
        },
        borderColor: '#000000',
        borderWidth: 2,
        className: 'dark-container',
        plotBackgroundColor: 'rgba(255, 255, 255, .1)',
        plotBorderColor: '#CCCCCC',
        plotBorderWidth: 1
      },
      title: {
        style: {
          color: '#C0C0C0',
          font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      subtitle: {
        style: {
          color: '#666666',
          font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      xAxis: {
        gridLineColor: '#333333',
        gridLineWidth: 1,
        labels: {
          style: {
            color: '#A0A0A0'
          }
        },
        lineColor: '#A0A0A0',
        tickColor: '#A0A0A0',
        title: {
          style: {
            color: '#CCC',
            fontWeight: 'bold',
            fontSize: '12px',
            fontFamily: 'Trebuchet MS, Verdana, sans-serif'

          }
        }
      },
      yAxis: {
        gridLineColor: '#333333',
        labels: {
          style: {
            color: '#A0A0A0'
          }
        },
        lineColor: '#A0A0A0',
        minorTickInterval: null,
        tickColor: '#A0A0A0',
        tickWidth: 1,
        title: {
          style: {
            color: '#CCC',
            fontWeight: 'bold',
            fontSize: '12px',
            fontFamily: 'Trebuchet MS, Verdana, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        style: {
          color: '#F0F0F0'
        }
      },
      toolbar: {
        itemStyle: {
          color: 'silver'
        }
      },
      plotOptions: {
        line: {
          dataLabels: {
            color: '#CCC'
          },
          marker: {
            lineColor: '#333'
          }
        },
        spline: {
          marker: {
            lineColor: '#333'
          }
        },
        scatter: {
          marker: {
            lineColor: '#333'
          }
        },
        candlestick: {
          lineColor: 'white'
        }
      },
      legend: {
        itemStyle: {
          font: '9pt Trebuchet MS, Verdana, sans-serif',
          color: '#A0A0A0'
        },
        itemHoverStyle: {
          color: '#FFF'
        },
        itemHiddenStyle: {
          color: '#444'
        }
      },
      credits: {
        style: {
          color: '#666'
        }
      },
      labels: {
        style: {
          color: '#CCC'
        }
      },

      navigation: {
        buttonOptions: {
          symbolStroke: '#DDDDDD',
          hoverSymbolStroke: '#FFFFFF',
          theme: {
            fill: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
						[0.4, '#606060'],
						[0.6, '#333333']
					]
            },
            stroke: '#000000'
          }
        }
      },

      // scroll charts
      rangeSelector: {
        buttonTheme: {
          fill: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
					[0.4, '#888'],
					[0.6, '#555']
				]
          },
          stroke: '#000000',
          style: {
            color: '#CCC',
            fontWeight: 'bold'
          },
          states: {
            hover: {
              fill: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
							[0.4, '#BBB'],
							[0.6, '#888']
						]
              },
              stroke: '#000000',
              style: {
                color: 'white'
              }
            },
            select: {
              fill: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
							[0.1, '#000'],
							[0.3, '#333']
						]
              },
              stroke: '#000000',
              style: {
                color: 'yellow'
              }
            }
          }
        },
        inputStyle: {
          backgroundColor: '#333',
          color: 'silver'
        },
        labelStyle: {
          color: 'silver'
        }
      },

      navigator: {
        handles: {
          backgroundColor: '#666',
          borderColor: '#AAA'
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(16, 16, 16, 0.5)',
        series: {
          color: '#7798BF',
          lineColor: '#A6C7ED'
        }
      },

      scrollbar: {
        barBackgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
					[0.4, '#888'],
					[0.6, '#555']
				]
        },
        barBorderColor: '#CCC',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
					[0.4, '#888'],
					[0.6, '#555']
				]
        },
        buttonBorderColor: '#CCC',
        rifleColor: '#FFF',
        trackBackgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
				[0, '#000'],
				[1, '#333']
			]
        },
        trackBorderColor: '#666'
      },

      // special colors for some of the
      legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
      legendBackgroundColorSolid: 'rgb(35, 35, 70)',
      dataLabelsColor: '#444',
      textColor: '#C0C0C0',
      maskColor: 'rgba(255,255,255,0.3)'
    };
  }
  else if (theme == 'DarkGreen') {
    Highcharts.theme = {
      colors: ["#DDDF0D", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
		"#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
      chart: {
        backgroundColor: {
          linearGradient: [0, 0, 250, 500],
          stops: [
				[0, 'rgb(48, 96, 48)'],
				[1, 'rgb(0, 0, 0)']
			]
        },
        borderColor: '#000000',
        borderWidth: 2,
        className: 'dark-container',
        plotBackgroundColor: 'rgba(255, 255, 255, .1)',
        plotBorderColor: '#CCCCCC',
        plotBorderWidth: 1
      },
      title: {
        style: {
          color: '#C0C0C0',
          font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      subtitle: {
        style: {
          color: '#666666',
          font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      xAxis: {
        gridLineColor: '#333333',
        gridLineWidth: 1,
        labels: {
          style: {
            color: '#A0A0A0'
          }
        },
        lineColor: '#A0A0A0',
        tickColor: '#A0A0A0',
        title: {
          style: {
            color: '#CCC',
            fontWeight: 'bold',
            fontSize: '12px',
            fontFamily: 'Trebuchet MS, Verdana, sans-serif'

          }
        }
      },
      yAxis: {
        gridLineColor: '#333333',
        labels: {
          style: {
            color: '#A0A0A0'
          }
        },
        lineColor: '#A0A0A0',
        minorTickInterval: null,
        tickColor: '#A0A0A0',
        tickWidth: 1,
        title: {
          style: {
            color: '#CCC',
            fontWeight: 'bold',
            fontSize: '12px',
            fontFamily: 'Trebuchet MS, Verdana, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        style: {
          color: '#F0F0F0'
        }
      },
      toolbar: {
        itemStyle: {
          color: 'silver'
        }
      },
      plotOptions: {
        line: {
          dataLabels: {
            color: '#CCC'
          },
          marker: {
            lineColor: '#333'
          }
        },
        spline: {
          marker: {
            lineColor: '#333'
          }
        },
        scatter: {
          marker: {
            lineColor: '#333'
          }
        },
        candlestick: {
          lineColor: 'white'
        }
      },
      legend: {
        itemStyle: {
          font: '9pt Trebuchet MS, Verdana, sans-serif',
          color: '#A0A0A0'
        },
        itemHoverStyle: {
          color: '#FFF'
        },
        itemHiddenStyle: {
          color: '#444'
        }
      },
      credits: {
        style: {
          color: '#666'
        }
      },
      labels: {
        style: {
          color: '#CCC'
        }
      },


      navigation: {
        buttonOptions: {
          symbolStroke: '#DDDDDD',
          hoverSymbolStroke: '#FFFFFF',
          theme: {
            fill: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
						[0.4, '#606060'],
						[0.6, '#333333']
					]
            },
            stroke: '#000000'
          }
        }
      },

      // scroll charts
      rangeSelector: {
        buttonTheme: {
          fill: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
					[0.4, '#888'],
					[0.6, '#555']
				]
          },
          stroke: '#000000',
          style: {
            color: '#CCC',
            fontWeight: 'bold'
          },
          states: {
            hover: {
              fill: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
							[0.4, '#BBB'],
							[0.6, '#888']
						]
              },
              stroke: '#000000',
              style: {
                color: 'white'
              }
            },
            select: {
              fill: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
							[0.1, '#000'],
							[0.3, '#333']
						]
              },
              stroke: '#000000',
              style: {
                color: 'yellow'
              }
            }
          }
        },
        inputStyle: {
          backgroundColor: '#333',
          color: 'silver'
        },
        labelStyle: {
          color: 'silver'
        }
      },

      navigator: {
        handles: {
          backgroundColor: '#666',
          borderColor: '#AAA'
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(16, 16, 16, 0.5)',
        series: {
          color: '#7798BF',
          lineColor: '#A6C7ED'
        }
      },

      scrollbar: {
        barBackgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
					[0.4, '#888'],
					[0.6, '#555']
				]
        },
        barBorderColor: '#CCC',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
					[0.4, '#888'],
					[0.6, '#555']
				]
        },
        buttonBorderColor: '#CCC',
        rifleColor: '#FFF',
        trackBackgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
				[0, '#000'],
				[1, '#333']
			]
        },
        trackBorderColor: '#666'
      },

      // special colors for some of the
      legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
      legendBackgroundColorSolid: 'rgb(35, 35, 70)',
      dataLabelsColor: '#444',
      textColor: '#C0C0C0',
      maskColor: 'rgba(255,255,255,0.3)'
    };
  }
  var highchartsOptions = Highcharts.setOptions(Highcharts.theme);
  report.destroy();
  report = new Highcharts.Chart(options);
}