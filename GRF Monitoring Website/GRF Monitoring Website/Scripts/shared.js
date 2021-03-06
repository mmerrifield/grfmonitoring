﻿$(function () {
  $('#btns').buttonset();
  $.ajaxSetup({cache: false});
  $.get('GRFService.svc/Auth', {}, function (resp) {
    if (!resp || resp.length > 10)
      $('#btns').hide();
  });
  $.get('GRFService.svc/IsAdmin', {}, function (resp) {
    if (!resp) {
      $('#aUsers').remove();
      $('#lUsers').remove();
    }
  });
  $('.navBtn').on('click', function () {
    var id = $(this).attr('id');
    if (id === 'aHome')
      window.location.href = 'Home.aspx';
    else if (id === 'aData')
      window.location.href = 'ExportData.aspx';
    else if (id === 'aReport')
      window.location.href = 'Reports2.aspx';
    else if (id === 'aMap')
      window.location.href = 'MapView.aspx';
    else if (id === 'aContact')
      window.location.href = 'Contact.aspx';
    else if (id === 'aUsers')
      window.location.href = 'ManageUsers.aspx';
  });
  $('.dataBtn').on('click', function () {
    var id = $(this).attr('id');
    if (id == 'aImport')
      window.location.href = 'ImportData.aspx';
    else if (id == 'aExport')
      window.location.href = 'ExportData.aspx';
    else if (id == 'aManage')
      window.location.href = 'ManageSites.aspx';
  });
});