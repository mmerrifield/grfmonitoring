var useswf = false;
$(function () {
  $('#databtns').buttonset();
  $('.dataBtn').on('click', function () {
  });
  $('#aData')[0].checked = true;
  $('#aData').button('refresh');
  $('#aImport')[0].checked = true;
  $('#aImport').button('refresh');
  $('#btnUploadDevices').button().on('click', function () { if (useswf) $('#hobo_swf').uploadify('upload', '*'); else $('#hobo_upload').uploadifive('upload'); });
  $('#btnUploadData').button().on('click', function () { if (useswf) $('#data_swf').uploadify('upload', '*'); else $('#data_upload').uploadifive('upload'); });
  $('#data_upload').uploadifive({
    multi: true,
    auto: false,
    dnd: true,
    buttonText: 'Select Files',
    fileType: ["application\/excel", "application\/vnd.ms-excel", "application\/x-excel", "application\/x-msexcel", "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    uploadScript: 'HoboDataFileTransfer.ashx',
    onUploadComplete: function (file, data) {
      if (data !== '1')
        $(file.queueItem[0]).find('.fileinfo').html(' - ' + data);
    },
    onFallback: function () {
      $('#data_upload').hide();
      $('#data_swf').show();
      useswf = true;
      $('#data_swf').uploadify({
        multi: true,
        auto: false,
        buttonText: 'Select Files',
        fileTypeExts: '*.xls;*.xlsx',
        swf: 'Scripts/uploadify.swf',
        uploader: 'HoboDataFileTransfer.ashx',
        onUploadSuccess: function (file, data) {
          var id = '#' + file.id;
          var msg = $(id).text() + " - " + data;
          $(id).text(msg);
        }
      });
    }
  });
  $('#hobo_upload').uploadifive({
    multi: true,
    auto: false,
    dnd: true,
    buttonText: 'Select Files',
    removeCompleted: true,
    fileType: ["application\/excel", "application\/vnd.ms-excel", "application\/x-excel", "application\/x-msexcel", "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    uploadScript: 'HoboDeviceFileTransfer.ashx',
    onUploadComplete: function (file, data) {
      if (data !== '1')
        $(file.queueItem[0]).find('.fileinfo').html(' - ' + data);
    },
    onError: function (a, b, c, d) {
    },
    onFallback: function () {
      $('#hobo_upload').hide();
      $('#hobo_swf').show();
      useswf = true;
      $('#hobo_swf').uploadify({
        multi: true,
        auto: false,
        buttonText: 'Select Files',
        swf: 'Scripts/uploadify.swf',
        fileTypeExts: '*.xls;*.xlsx',
        uploader: 'HoboDeviceFileTransfer.ashx',
        onUploadSuccess: function (file, data) {
          var id = "#" + file.id;
          var msg = $(id).text() + " - " + data;
          $(id).text(msg);
        }
      });
    }
  });
});