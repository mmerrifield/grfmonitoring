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
    multi: true,
    auto: false,
    dnd: true,
    buttonText: 'Select Files',
    fileType: ["application\/excel", "application\/vnd.ms-excel", "application\/x-excel", "application\/x-msexcel", "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    uploadScript: 'HoboDataFileTransfer.ashx',
    onUploadComplete: function (file, data) {
      if (data !== '1')
        $(file.queueItem[0]).find('.fileinfo').html(' - ' + data);
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
    }
  });

  var _pretest = {
    onFallback: function () {
      $('#hobo_upload').hide();
      $('#data_upload').hide();
      $('#hobo_swf').show();
      $('#data_swf').show();
      $("#hobo_swf").uploadify({
        multi: true,
        auto: false,
        buttonText: 'Select Files',
        swf: 'Scripts/uploadify.swf',
        uploader: 'HoboDeviceFileTransfer.ashx',
        onUploadComplete: function (file, data) {
          if (data !== '1')
            $(file.queueItem[0]).find('.fileinfo').html(' - ' + data);
        }
      }); // browser has failed the test, lets use Uploadify instead
      $('#data_swf').uploadify({
        multi: true,
        auto: false,
        buttonText: 'Select Files',
        swf: 'Scripts/uploadify.swf',
        uploader: 'HoboDataFileTransfer.ashx',
        onUploadComplete: function (file, data) {
          if (data !== '1')
            $(file.queueItem[0]).find('.fileinfo').html(' - ' + data);
        }
      });
    }
  }
  $("#hobo_upload").uploadifive(_pretest); // do the pre-test
  $("#hobo_upload").uploadifive(_optionsUploadifive); // HTML5 enabled browsers will pass the pretest and fire this instead
});