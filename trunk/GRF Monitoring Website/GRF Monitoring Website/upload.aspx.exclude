<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Upload.aspx.cs" Inherits="Upload" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <link href='Styles/uploadifive.css' rel="Stylesheet" />
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script src='Scripts/jquery.uploadifive.min.js'></script>
</head>
<body>
    <h1>UploadiFive Demo</h1>
    <form >
        <input id="file_upload" name="file_upload" type="file" multiple="true"><br />
<a href="javascript:$('#file_upload').uploadifive('upload')">Upload Files</a>
    </form>

    <script type="text/javascript">
      $(function () {
        $('#file_upload').uploadifive({
          'multi': true,
          'auto': false,
          'height': 20,
          'width': 100,
          'fileType': ["application\/excel", "application\/vnd.ms-excel", "application\/x-excel", "application\/x-msexcel", "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
          'uploadScript': 'FileTransferHandler.ashx',
          'onUploadComplete': function (file, data) {
            if (data !== '1')
              $(file.queueItem[0]).find('.fileinfo').html(' - ' + data);
          }
        });
      });
    </script>
</body>
</html>
