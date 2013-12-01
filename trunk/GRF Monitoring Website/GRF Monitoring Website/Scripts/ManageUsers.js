$(function () {
  $("#users").jqGrid({
    datatype: function (pdata)
    {
      getData(pdata);
    },
    colNames: ['User Name', 'Email', 'Active', 'Admin', 'Reset Pwd'],
    colModel: [
      { name: 'UserName', index: 'Username', width: 200, editable: true, editrules: { required: true} },
      { name: 'Email', index: 'Email', width: '280', editable: true, editrules: { required: true, email: true} },
      { name: 'Active', index: 'Active', editable: true, width: '75', edittype: 'checkbox', formatter: 'checkbox', align: 'center', editoptions: { value: 'true:false' }, sortable: false },
      { name: 'Admin', index: 'Admin', editable: true, width: '75', edittype: 'checkbox', formatter: 'checkbox', align: 'center', editoptions: { value: 'true:false' }, sortable: false },
      { name: 'ResetPwd', index: 'ResetPwd', editable: true, width: '75', edittype: 'checkbox', formatter: 'checkbox', align: 'center', editoptions: { value: 'true:false' }, visible: false, sortable: false }
    ],
    editurl: 'GRFService.svc/UpdateUser',
    autowidth: true,
    sortname: 'UserName',
    sortorder: 'asc',
    rowNum: 10,
    rowList: [10, 20, 50],
    viewrecords: true,
    gridview: true,
    caption: 'GRF Site Users',
    footerrow: false,
    pager: '#navusers',
    pgbuttons: true,
    pginput: true
  }).navGrid('#navusers', { view: false, edit: true, add: true, del: true, search: false },
    { editCaption: 'Edit Selected User' },
    { addCaption: 'Add User to Site' }
    );
  $('#users').setGridHeight('300px');

});
function getData(pdata)
{
  var grid = $('#users');
  var params = new Object();
  params.pageIndex = pdata.page == null ? grid.jqGrid('getGridParam', 'page') : pdata.page;
  params.pageSize = pdata.rows == null ? grid.jqGrid('getGridParam', 'rowNum') : pdata.rows;
  params.sortIndex = pdata.sidx == null ? grid.jqGrid('getGridParam', 'sortname') : pdata.sidx;
  params.sortDirection = pdata.sord == null ? grid.jqGrid('getGridParam', 'sortorder') : pdata.sord;

  $.ajax(
  {
    type: "GET",
    url: 'GRFService.svc/SiteUsers',
    datatype: 'json',
    contentType: "application/json; charset=utf-8",
    data: params,
    success: function (data, textStatus)
    {
      if (textStatus == "success")
      {
        var grid = $("#users")[0];
        grid.addJSONData(data);
      }
    },
    error: function (data, textStatus)
    {
      alert('An error has occured retrieving data!');
    }
  });
}
