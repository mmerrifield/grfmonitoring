var canEdit = false;
$(function () {
  $('#databtns').buttonset();
  $('.dataBtn').on('click', function () {
  });
  $('#aData')[0].checked = true;
  $('#aData').button('refresh');
  $('#aManage')[0].checked = true;
  $('#aManage').button('refresh');
  $.ajax({
    type: "GET",
    url: 'GRFService.svc/IsAdmin',
    dataType: 'json',
    contentType: "application/json; charset=utf-8;",
    data: {},
    success: function (data) {
      canEdit = data;
      completePage();
    }
  });
  var colorPicker;
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
    dataType: 'json',
    contentType: "application/json; charset=utf-8;",
    data: params,
    success: function (data, textStatus) {
      if (textStatus == "success") {
        var grid = $("#sites")[0];
        grid.addJSONData(data);
      }
    },
    error: function (a, b, c) {
      alert('An error has occured retrieving data!');
    }
  });
}
function completePage() {
  $("#sites").jqGrid({
    datatype: function (pdata) {
      getSites(pdata);
    },
    colNames: ['Site Id', 'Site Name', 'Directions', 'Color', 'Data Start Date', 'Data End Date', 'Latitude', 'Longitude', 'Hide'],
    colModel: [
      { name: 'SiteId', index: 'SiteId', width: '100', editable: true },
      { name: 'SiteName', index: 'SiteName', width: '200', editable: true, edittype: 'textarea', editrules: { required: true }, editoptions: { 'rows': '2', 'cols': '40' }, cellattr: function () { return 'style="white-space: normal";' } },
      { name: 'Directions', index: 'Comment', editable: true, width: '375', edittype: 'textarea', editrules: { required: false }, editoptions: { 'rows': '5', 'cols': '40' }, cellattr: function () { return 'style="white-space: normal";' } },
      { name: 'Color', index: 'Color', editable: true, width: '75', editable: true, edittype: 'custom', editoptions: { custom_element: getColorPicker, custom_value: updateColorValue }, formatter: function (cellValue) { return '<div style="width:20px;height:15px;background-color:' + cellValue + '"><input type="hidden" value="' + cellValue + '"></input></div>' } },
      { name: 'DtStart', index: 'DtStart', editable: false, width: '175', align: 'right' /*,formatter: 'date', editoptions: { dataInit: function (el) { setTimeout(function () { $(el).datepicker(); }, 200); } }*/ },
      { name: 'DtEnd', index: 'DtEnd', editable: false, width: '175', align: 'right' /*, formatter: 'date', editoptions: { dataInit: function (el) { setTimeout(function () { $(el).datepicker(); }, 200); } }*/ },
      { name: 'Lat', index: 'Lat', editable: true, width: '100', align: 'right', sortable: false, formatter: 'number', formatoptions: { decimalPlaces: 4 }, editor: 'number', editoptions: { decimalPlaces: 4} },
      { name: 'Lng', index: 'Lng', editable: true, width: '100', align: 'right', sortable: false, formatter: 'number', formatoptions: { decimalPlaces: 4 }, editor: 'number', editoptions: { decimalPlaces: 4} },
      { name: 'HideSite', index: 'HideSite', editable: true, width: '75', align: 'center', sortable: false, edittype: 'checkbox', formatter: 'checkbox', align: 'center', editoptions: { value: 'true:false'} }
    ],
    editurl: 'GRFService.svc/UpdateSite',
    ajaxGridOptions: {cache: false},
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
  }).navGrid('#navsites', { view: false, edit: canEdit, add: canEdit, del: false, search: false },
    { editCaption: 'Edit Site', width: 380, reloadAfterSubmit: true,
      beforeShowForm: function (formid) { $('#SiteId').attr('readonly', 'readonly'); $('#SiteName').attr('readonly', 'readonly'); }
    },
    { addCaption: 'Add Site', width: 380, reloadAfterSubmit: true,
      beforeShowForm: function (formid) { $('#SiteId').removeAttr('readonly'); $('#SiteName').removeAttr('readonly'); }
    }
    );
  $('#sites').setGridHeight('500px');
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
        grid.subGridJson(data, rowidprm.id);
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