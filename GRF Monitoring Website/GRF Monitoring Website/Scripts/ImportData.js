﻿$(function () {
  $('#btnUploadDevices').on('click', function () { $('#hobo_upload').uploadifive('upload'); });
  $('#btnUploadData').on('click', function () { $('#data_upload').uploadifive('upload'); });
  $(function () {
    $('#data_upload').uploadifive({
      'multi': true,
      'auto': false,
      'fileType': ["application\/excel", "application\/vnd.ms-excel", "application\/x-excel", "application\/x-msexcel", "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      'uploadScript': 'HoboDataFileTransfer.ashx',
      'onUploadComplete': function (file, data) {
        if (data !== '1')
          $(file.queueItem[0]).find('.fileinfo').html(' - ' + data);
      }
    });
  });
  $(function () {
    $('#hobo_upload').uploadifive({
      'multi': true,
      'auto': false,
      'fileType': ["application\/excel", "application\/vnd.ms-excel", "application\/x-excel", "application\/x-msexcel", "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      'uploadScript': 'HoboDeviceFileTransfer.ashx',
      'onUploadComplete': function (file, data) {
        if (data !== '1')
          $(file.queueItem[0]).find('.fileinfo').html(' - ' + data);
      }
    });
  });
});