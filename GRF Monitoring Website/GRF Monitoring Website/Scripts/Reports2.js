var report;
var options;
var svc;
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
} /* end download() */