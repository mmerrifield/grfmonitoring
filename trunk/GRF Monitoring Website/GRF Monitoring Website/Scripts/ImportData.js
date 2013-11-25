$(function () {
  $('#databtns').buttonset();
  $('.dataBtn').on('click', function () {
  });
  $('#aData')[0].checked = true;
  $('#aData').button('refresh');
  $('#aImport')[0].checked = true;
  $('#aImport').button('refresh');
  $('#btnUploadDevices').button().on('click', function () { $('#hobo_upload').uploadifive('upload'); });
  $('#btnUploadData').button().on('click', function () { $('#data_upload').uploadifive('upload'); });
  $('#data_upload').uploadifive({
    'multi': true,
    'auto': false,
    'dnd': true,
    'buttonText': 'Select Files',
    'fileType': ["application\/excel", "application\/vnd.ms-excel", "application\/x-excel", "application\/x-msexcel", "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    'uploadScript': 'HoboDataFileTransfer.ashx',
    'onUploadComplete': function (file, data) {
      if (data !== '1')
        $(file.queueItem[0]).find('.fileinfo').html(' - ' + data);
    }
  });
  $('#hobo_upload').uploadifive({
    'multi': true,
    'auto': false,
    'dnd': true,
    'buttonText': 'Select Files',
    'fileType': ["application\/excel", "application\/vnd.ms-excel", "application\/x-excel", "application\/x-msexcel", "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    'uploadScript': 'HoboDeviceFileTransfer.ashx',
    'onUploadComplete': function (file, data) {
      if (data !== '1')
        $(file.queueItem[0]).find('.fileinfo').html(' - ' + data);
    }
  });
});