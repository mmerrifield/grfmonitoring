var Export;
$(function () {
  Export = {};
  Export.initing = false;

  $("#export").jqGrid({
    datatype: function (pdata) {
      getData(pdata);
    },
    colNames: ['Id', 'HOBO Id', 'Site', 'Date/Time', 'Temp', 'Dew Point', 'Abs Humidity', 'RH', 'Date Uploaded', 'Uploaded By'],
    colModel: [
      { name: 'Id', index: 'Id', width: '60' },
      { name: 'HoboId', index: 'HoboId', width: '75' },
      { name: 'Site', index: 'Site', width: '300' },
      { name: 'DateTime', index: 'DateTime', width: '120' },
      { name: 'Temp', index: 'Temp', width: '80', align: 'right' },
      { name: 'DewPoint', index: 'DewPoint', width: '80', align: 'right' },
      { name: 'AbsHumidity', index: 'AbsHumidity', width: '80', align: 'right' },
      { name: 'RH', index: 'RH', width: '80', align: 'right' },
      { name: 'DateUploaded', index: 'DateUploaded', width: '120' },
      { name: 'UploadedBy', index: 'UploadedBy', width: '90' }
    ],
    autowidth: true,
    sortname: 'Id',
    sortorder: 'asc',
    rowNum: 100,
    rowList: [100, 200, 500],
    viewrecords: true,
    gridview: true,
    caption: 'Garcia HOBO Data',
    footerrow: false,
    pager: '#navexport',
    toolbar: [true, 'top'],
    pgbuttons: true,
    pginput: true
  });
  $("#t_export").append("<input type='button' value='Export to Excel' style='height:20px;font-size:-3;float:right'/>");
  $("input", "#t_export").click(function () {
    var urlStr = 'GRFService.svc/DownloadData?year='+ $('#Year').val() + '&site=' + $('#Site').val() + '&type=' + $('#Type').val() + '&from=' + $('#FromDate').val() + '&to=' + $('#ToDate').val();
    $('#export').jqGrid('excelExport', { url: urlStr });
  });
  $('#export').setGridHeight('600px');
  $('#Year').on('change', function () { if (!Export.initing) { Export.initing = true; clearData(); updateDates(); getSites(); getTypes(); Export.initing = false; } });
  $('#Site').on('change', function () { if (!Export.initing) { Export.initing = true; clearData(); updateDates(); getYears(); getTypes(); Export.initing = false; } });
  $('#Type').on('change', function () { if (!Export.initing) { Export.initing = true; clearData(); getYears(), getSites(); Export.initing = false; } });
  $('#btnExport').on('click', function () {
    if (!dataValid()) {
      alert("Please provide values for all search fields.");
      return;
    }
    $('#export').trigger('reloadGrid');
  });
  $('#FromDate').datepicker({ dateFormat: 'mm-dd-yy' });
  $('#ToDate').datepicker({ dateFormat: 'mm-dd-yy' });
  getYears();
  updateDates();
});
function getData(pdata) {
  var grid = $('#export');
  clearData();
  if (!dataValid()) return;

  var params = {};
  params.site = $('#Site').val();
  params.year = $('#Year').val();
  params.type = $('#Type').val();
  params.from = $('#FromDate').val();
  params.to = $('#ToDate').val();
  params.pageIndex = pdata.page == null ? grid.jqGrid('getGridParam', 'page') : pdata.page;
  params.pageSize = pdata.rows == null ? grid.jqGrid('getGridParam', 'rowNum') : pdata.rows;
  params.sortIndex = pdata.sidx == null ? grid.jqGrid('getGridParam', 'sortname') : pdata.sidx;
  params.sortDirection = pdata.sord == null ? grid.jqGrid('getGridParam', 'sortorder') : pdata.sord;

  $.ajax(
  {
    type: "GET",
    url: 'GRFService.svc/SiteExport',
    datatype: 'json',
    contentType: "application/json; charset=utf-8",
    data: params,
    success: function (data, textStatus) {
      if (textStatus == "success") {
        var grid = $("#export")[0];
        grid.addJSONData(data.d.Data);
        if (data.d.IsWater) {
          $(grid).hideCol('DewPoint');
          $(grid).hideCol('AbsHumidity');
          $(grid).hideCol('RH');
        }
        else {
          $(grid).showCol('DewPoint');
          $(grid).showCol('AbsHumidity');
          $(grid).showCol('RH');
        }
      }
    },
    error: function (data, textStatus) {
      alert('An error has occured retrieving data!');
    }
  });
}
function dataValid(){
  var site = $('#Site').val();
  var year = $('#Year').val();
  var type = $('#Type').val();
  var from = $('#FromDate').val();
  var to = $('#ToDate').val();
  if (site === null || site.length === 0 
    || year === null || year.length === 0
    || type === null || type.length === 0 
    || from === null || from.length === 0
    || to === null || to.length === 0)
    return false;
  return true;
}
function clearData() {
  $('#export').jqGrid('clearGridData', true);
}
function getYears() {
  var curVal = $('#Year').val();
  var params = {}
  params.site = $('#Site').val();
  params.type = $('#Type').val();
  $.get('GRFService.svc/Years', params, function (data) {
    var sel = $('#Year').get(0);
    sel.options.length = 0;
    sel.options[0] = new Option('', '');
    $.each(data.d, function (index, yr) {
      sel.options[sel.options.length] = new Option(yr, yr);
    });
    $(sel).find('option[value="' + curVal + '"]').attr('selected', true);
  });
}
function updateDates() {
  var params = {};
  params.year = $('#Year').val();
  params.site = $('#Site').val();
  $.get('GRFService.svc/DateRange', params, function (data) {
    if (data.d.length === 0) {
      $('#FromDate').attr('disabled', 'disabled');
      $('#ToDate').attr('disabled', 'disabled');
    } else {
      $('#FromDate').removeAttr('disabled');
      $('#ToDate').removeAttr('disabled');
      $('#FromDate').datepicker('option', 'minDate', new Date(data.d[0]));
      $('#FromDate').datepicker('option', 'maxDate', new Date(data.d[1]));
      $('#ToDate').datepicker('option', 'minDate', new Date(data.d[0]));
      $('#ToDate').datepicker('option', 'maxDate', new Date(data.d[1]));
    }
  });
}
function getSites() {
  var curVal = $('#Site').val();
  var params = {}
  params.year = $('#Year').val();
  params.type = $('#Type').val();
  $.get('GRFService.svc/AvailSites', params, function (data) {
    var sel = $('#Site').get(0);
    sel.options.length = 0;
    sel.options[0] = new Option('', '');
    $.each(data.d, function (index, site) {
      sel.options[sel.options.length] = new Option(site.SITE_NAME, site.Site_ID);
    });
    $(sel).find('option[value="' + curVal + '"]').attr('selected', true);
  });
}
function getTypes() {
  var curVal = $('#Type').val();
  var params = {}
  params.year = $('#Year').val();
  params.site = $('#Site').val();
  $.get('GRFService.svc/SensorTypes', params, function (data) {
    var sel = $('#Type').get(0);
    sel.options.length = 0;
    sel.options[0] = new Option('', '');
    $.each(data.d, function (index, t) {
      sel.options[sel.options.length] = new Option(t, t);
    });
    $(sel).find('option[value="' + curVal + '"]').attr('selected', true);
  });
}
