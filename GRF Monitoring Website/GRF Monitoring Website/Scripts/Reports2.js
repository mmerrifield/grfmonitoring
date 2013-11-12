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
      svc += 'WeeklyMWATData';
      $('#MWATfootnote').show();
      options.title.text = 'MWAT Report';
    }
    else if (reportType == 'MWMT') {
      options.title.text = 'MWMT Report';
      svc += 'WeeklyMWMTData';
      $('#MWMTfootnote').show();
    }
    else if (reportType == 'MaxMWAT') {
      $('#MWATMaxfootnote').show();
      svc += '';
    }
    else if (reportType == 'MaxMWMT') {
      $('#MWMTMaxfootnote').show();
      svc += '';
    }
    options.series.length = 0;
    report.destroy();
    report = new Highcharts.Chart(options);
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
  $('#GenReport').button().on('click', updateChart);
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
    $.each(data.d, function (index, yr) {
      sel1.options[sel1.options.length] = new Option(yr, yr);
      sel2.options[sel2.options.length] = new Option(yr, yr);
    });
  });
}
function clearSites() {
  $('#Sites')[0].options.length = 0;
  $('#Sites').multiselect('refresh');
  options.series.length = 0;
  chart = new Highchart.Chart(options);
}
function getSites() {
  var params = getParams();
  if (params === null)
    return;
  $.get('GRFService.svc/ReportSites', params, function (data) {
    var site = $('#Sites')[0];
    site.options.length = 0;
    $.each(data.d, function (i, s) { site.options[site.options.length] = new Option(s.Name, s.Id) });
    $('#Sites').multiselect('refresh');
    $('#Sites').multiselect('uncheckAll');
  });
}
function getParams(){
  var params = {};
  params.startMon = $('#StartMon').val();
  params.startYr = $('#StartYr').val();
  params.endMon = $('#EndMon').val();
  params.endYr = $('#EndYr').val();
  if (params.startYr === null || params.startYr.length === 0 || params.endYr === null || params.endYr.length === 0) {
    clearSites();
    return null;
  }
  if (parseInt(params.startYr) > parseInt(params.endYr) || (parseInt(params.startYr) == parseInt(params.endYr) && parseInt(params.startMon) > parseInt(params.endMon))) {
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
      labels: { format: '{value:%b %y}', rotation: 90, align: 'bottom' },
      title: { text: 'Date' },
      type: 'datetime'
    },
    yAxis: [{
      labels: {
        formatter: function () { return this.value; } //,
        //style: { color: '#89A54E' }
      },
      title: { text: 'Temperature (C)'/*, style: { color: '#89A54E'} */ }
    }],
    tooltip: {
      formatter: function () {
        return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%e - %b - %Y',
                                              new Date(this.x))
                    + '  <br/>' + this.y.toFixed(2) + ' C.';
      }
    },
    plotOptions: {
      line: { marker: { enabled: false } },
      area: { marker: { enabled: false } },
      spline: { marker: { enabled: false } },
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
function updateChart() {
  var reportType = $('#ReportType').val();

  var params = getParams();
  if (params === null) return;
  params.sites = [];
  $.each($('#Sites').multiselect('getChecked'), function (i, s) { if (params.sites.length > 0) params.sites += ','; params.sites += s.value; });
  if (params.sites.length === 0)
    return;
  $.get(svc, params, function (data) {
    //options.chart.height = $('#container').width() * .5;
    options.series.length = 0;
    $.each(data.d, function (idx, series) {
      series.connectNulls = false;
      series.type = $('#ChartStyle').val();
      options.series.push(series);
      options.series.pointStart = Date.UTC(1970, 0, 0);
    });
    report = new Highcharts.Chart(options);
  });
  $('#container').show();
}