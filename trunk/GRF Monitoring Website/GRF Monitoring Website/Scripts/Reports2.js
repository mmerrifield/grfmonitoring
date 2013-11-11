var report;
var options;
$(function () {
  $('#Sites').multiselect({ selectedText: '# Sites of # Selected' });
  $('#ReportType').multiselect({ header: false, multiple: false, selectedList: 1, height: 'auto', minWidth: 'auto' });
  getYears();
  $('.Filter').on('change', getSites);
  $('#GenReport').on('click', updateChart);
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
    title: { text: 'Title' },
    xAxis: {
      labels: { format: '{value:%b %y}',  rotation: 90, align: 'bottom' },
      title: { text: 'Date' },
      type: 'datetime'
    },
    yAxis: [{ // Primary yAxis
      labels: {
        formatter: function () { return this.value; },
        style: { color: '#89A54E' }
      },
      title: { text: 'Temperature (C)', style: { color: '#89A54E'} }
    }],
    tooltip: {
      formatter: function () {
        return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%e - %b - %Y',
                                              new Date(this.x))
                    + '  <br/>' + this.y.toFixed(2) + ' C.';
      }
    },
    series: []
  };
  try {
    report = new Highcharts.Chart(options);
  }
  catch (e) {
    alert(e);
  }
}
function updateChart() {
  var reportType = $('#ReportType').val();
  var svc = 'GRFService.svc/';
  if (reportType === 'MWAT')
    svc += 'WeeklyMWATData';
  else if (reportType == 'MWMT')
    svc += 'WeeklyMWMTData';
  else if (reportType == 'MaxMWAT')
    svc += '';
  else if (reportType == 'MaxMWMT')
    svc += '';
  var params = getParams();
  if (params === null) return;
  options.title.text = "Updated title";
  params.sites = [];
  $.each($('#Sites').multiselect('getChecked'), function (i, s) { if (params.sites.length > 0) params.sites += ','; params.sites += s.value; });
  if (params.sites.length === 0)
    return;
  $.get(svc, params, function (data) {
    options.series.length = 0;
    $.each(data.d, function (idx, series) { options.series.push(series); options.series.pointStart = Date.UTC(1970, 0, 1); });
    report = new Highcharts.Chart(options);
  });
}