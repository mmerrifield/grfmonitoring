$(function () {
  $('#databtns').buttonset();
  $('.dataBtn').on('click', function () {
  });
  $('#aData')[0].checked = true;
  $('#aData').button('refresh');
  $('#aManage')[0].checked = true;
  $('#aManage').button('refresh');

  var colorPicker;
  $("#sites").jqGrid({
    datatype: function (pdata) {
      getSites(pdata);
    },
    colNames: ['Site Id', 'Site Name', 'Directions', 'Color', 'Data Start Date', 'Data End Date', 'Latitude', 'Longitude'],
    colModel: [
      { name: 'SiteId', index: 'SiteId', width: '100', editable: true },
      { name: 'SiteName', index: 'SiteName', width: '200', editable: true, edittype: 'textarea', editrules: { required: true }, editoptions: { 'rows': '2', 'cols': '40' }, cellattr: function () { return 'style="white-space: normal";' } },
      { name: 'Directions', index: 'Comment', editable: true, width: '375', edittype: 'textarea', editrules: { required: false }, editoptions: { 'rows': '5', 'cols': '40' }, cellattr: function () { return 'style="white-space: normal";' } },
      { name: 'Color', index: 'Color', editable: true, width: '75', editable: true, edittype: 'custom', editoptions: { custom_element: getColorPicker, custom_value: updateColorValue }, formatter: function (cellValue) { return '<div style="width:20px;height:15px;background-color:' + cellValue + '"><input type="hidden" value="' + cellValue + '"></input></div>' } },
      { name: 'DtStart', index: 'DtStart', editable: false, width: '175', align: 'right', formatter: 'date', editoptions: { dataInit: function (el) { setTimeout(function () { $(el).datepicker(); }, 200); } } },
      { name: 'DtEnd', index: 'DtEnd', editable: false, width: '175', align: 'right', formatter: 'date', editoptions: { dataInit: function (el) { setTimeout(function () { $(el).datepicker(); }, 200); } } },
      { name: 'Lat', index: 'Lat', editable: true, width: '100', align: 'right', sortable: false, formatter: 'number', formatoptions: { decimalPlaces: 4 }, editor: 'number', editoptions: { decimalPlaces: 4} },
      { name: 'Lng', index: 'Lng', editable: true, width: '100', align: 'right', sortable: false, formatter: 'number', formatoptions: { decimalPlaces: 4 }, editor: 'number', editoptions: { decimalPlaces: 4} }
    ],
    editurl: 'GRFService.svc/UpdateSite',
    autowidth: true,
    sortname: 'SiteId',
    sortorder: 'asc',
    rowNum: 20,
    rowList: [20, 50, 100],
    viewrecords: true,
    gridview: true,
    caption: 'Garcia HOBO Sites',
    footerrow: false,
    pager: '#navsites',
    pgbuttons: true,
    pginput: true,
    subGrid: true,
    subgridtype: getHobos,
    subGridModel: [
      {
        name: ['Hobo Id', 'Year', 'Type', 'Contributor', 'Comments'],
        width: [75, 60, 75, 100, 300],
        align: ['left', 'center', 'left', 'left', 'left'],
        params: ['SiteId']
      }
    ]
  }).navGrid('#navsites', { view: false, edit: true, add: true, del: false, search: false },
    { editCaption: 'Edit Site', width: 380, afterSubmit: function (response, postdata) {
      $('#loading').hide();
      var v = jQuery.parseJSON(response.responseText);
      msg = v !== null ? v.d : '';
      success = msg === null || msg.length === 0;
      return [success, msg, 0];
    },
      beforeShowForm: function (formid) { $('#SiteId').attr('readonly', 'readonly'); $('#SiteName').attr('readonly', 'readonly'); },
      afterComplete: function (response, formdata, formid) { $('#loading').hide(); }
    },
    { addCaption: 'Add Site', width: 380, afterSubmit: function (response, postdata) {
      $('#loading').hide();
      var v = jQuery.parseJSON(response.responseText);
      msg = v !== null ? v.d : '';
      success = msg === null || msg.length === 0;
      return [success, msg, 0];
    },
      beforeShowForm: function (formid) { $('#SiteId').removeAttr('readonly'); $('#SiteName').removeAttr('readonly'); },
      afterComplete: function (response, formdata, formid) { $('#loading').hide(); }
    }
    );
  $('#sites').setGridHeight('500px');
});
function getSites(pdata) {
  var grid = $('#sites');
  var params = {};
  params.pageIndex = pdata.page == null ? grid.jqGrid('getGridParam', 'page') : pdata.page;
  params.pageSize = pdata.rows == null ? grid.jqGrid('getGridParam', 'rowNum') : pdata.rows;
  params.sortIndex = pdata.sidx == null ? grid.jqGrid('getGridParam', 'sortname') : pdata.sidx;
  params.sortDirection = pdata.sord == null ? grid.jqGrid('getGridParam', 'sortorder') : pdata.sord;

  $.ajax(
  {
    type: "GET",
    url: 'GRFService.svc/Sites',
    datatype: 'json',
    contentType: "application/json; charset=utf-8",
    data: params,
    success: function (data, textStatus) {
      if (textStatus == "success") {
        var grid = $("#sites")[0];
        grid.addJSONData(data.d);
      }
    },
    error: function (data, textStatus) {
      alert('An error has occured retrieving data!');
    }
  });
}
function getHobos(rowidprm) {
  var grid = $('#sites')[0];
  var params = {};
  params.siteId = rowidprm.SiteId;

  $.ajax(
  {
    type: "GET",
    url: 'GRFService.svc/SiteHobos',
    datatype: 'json',
    contentType: "application/json; charset=utf-8",
    data: params,
    success: function (data, textStatus) {
      if (textStatus == "success") {
        var grid = $("#sites")[0];
        grid.subGridJson(data.d, rowidprm.id);
      }
    },
    error: function (data, textStatus) {
      alert('An error has occured retrieving data!');
    }
  });
}
function getColorPicker(value, options) {
  var el = document.createElement("input");
  el.type = "text";
  var x = '0';
  if (value !== null && value.length !== 0) {
    html = $.parseHTML(value);
    var x = html[0].firstChild.value !== null ? html[0].firstChild.value : '0';
  }
  el.value = x;
  colorPicker = new jscolor.color(el, {required:false});
  colorPicker.fromString(x);
  return el;
}

function updateColorValue(elem, operation, value) {
  if (operation === 'set') {
    var color = '000000';
    if (value !== null && value.length > 0) {
      var html = $.parseHTML(value);
      if (html[0].firstChild.value !== null)
        color = html[0].firstChild.value;
      if (color === 'null' || color.length === 0)
        color = null;
    }
    if (color !== null)
      colorPicker.fromString(color);
    else
      colorPicker.clear();
  }
  else if (operation === 'get') {
    return $(elem).val();
  }
}