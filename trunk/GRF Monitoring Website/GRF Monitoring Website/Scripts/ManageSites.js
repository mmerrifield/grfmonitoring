$(function () {
  $("#sites").jqGrid({
    datatype: function (pdata) {
      getSites(pdata);
    },
    colNames: ['Site Id', 'Site Name', 'Directions', 'Color', 'Data Start Date', 'Data End Date'],
    colModel: [
      { name: 'SiteId', index: 'SiteId', width: '100', editable: true },
      { name: 'SiteName', index: 'SiteName', width: '200', editable: true, edittype: 'textarea', editrules: { required: true }, editoptions: { size: 20 }, cellattr: function () { return 'style="white-space: normal";' } },
      { name: 'Directions', index: 'Comment', editable: true, width: '375', edittype: 'textarea', editrules: { required: false }, editoptions: { size: 20 }, cellattr: function () { return 'style="white-space: normal";' } },
      { name: 'Color', index: 'Color', editable: true, width: '75', editable: true, edittype: 'custom', editoptions: { custom_element: getColorPicker, custom_value: updateColorValue }, formatter: function (cellValue) { return '<div style="width:20px;height:15px;background-color:' + cellValue + '"><input type="hidden" value="' + cellValue + '"></input></div>' } },
      { name: 'DtStart', index: 'DtStart', editable: false, width: '175', align: 'right', formatter: 'date', editoptions: { dataInit: function (el) { setTimeout(function () { $(el).datepicker(); }, 200); } } },
      { name: 'DtEnd', index: 'DtEnd', editable: false, width: '175', align: 'right', formatter: 'date', editoptions: { dataInit: function (el) { setTimeout(function () { $(el).datepicker(); }, 200); } } }
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
  }).navGrid('#navsites', { view: false, edit: true, add: true, del: true, search: false },
    { editCaption: 'Edit Site', afterSubmit: function (response, postdata) {
      $('#loading').hide();
      var v = jQuery.parseJSON(response.responseText);
      msg = v != null ? v.d : '';
      success = msg.length == 0;
      return [success, msg, 0];
    },
      beforeShowForm: function (formid) { $('#SiteId').attr('readonly', 'readonly'); $('#SiteName').attr('readonly', 'readonly'); },
      afterComplete: function (response, formdata, formid) { $('#loading').hide(); }
    },
    { addCaption: 'Add Site', afterSubmit: function (response, postdata) {
      $('#loading').hide();
      var v = jQuery.parseJSON(response.responseText);
      msg = v != null ? v.d : '';
      success = msg.length == 0;
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
  var html = $.parseHTML(value);
  var x = html[0].firstChild.value;
  el.value = x;
  var myPicker = new jscolor.color(el, {});
  myPicker.fromString(x);
  return el;
}

function updateColorValue(elem, operation, value) {
  //alert(operation + ": " + value);
  if (operation === 'get') {
    var html = $.parseHTML(value);
    return html[0].firstChild.value;
    //return value.substring(value.indexOf('#') + 1, 6);
    return $(elem).val(); // change this to get value from color picker
  } else if (operation === 'set') {
    var html = $.parseHTML(value);
    var val = html[0].firstChild.value;
    var picker = new jscolor.color(elem, {});
    picker.fromString(val);
    //$('#cpicker').color.fromString(val);
    //$('input', elem).fromString(val); // val(val);
  }
}