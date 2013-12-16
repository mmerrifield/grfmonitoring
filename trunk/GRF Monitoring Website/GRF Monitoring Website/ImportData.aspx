<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true"
  CodeFile="ImportData.aspx.cs" Inherits="ImportData" %>

<%@ MasterType VirtualPath="~/Garcia.master" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
  <div id='ImportContainer'>
    <div id='databtns' style='text-align:right;margin-right:190px;margin-top:-15px;margin-bottom:10px'>
      <input type='radio' id='aImport' name='radio2' class='dataBtn' /><label for='aImport' id='lImport'>Import</label>
      <input type='radio' id='aExport' name='radio2' class='dataBtn' /><label for='aExport'>Export</label>
      <input type='radio' id='aManage' name='radio2' class='dataBtn' /><label for='aManage' id='lManage'>Manage</label>
    </div>    <div class='PageCtrls'>
      <div id='ImportDeviceContainer'>
        <h3>
          Import Site/HOBO Lookup</h3>
        <input id="hobo_upload" name="hobo_upload" type="file" multiple="true" />
        <input id='hobo_swf' name='hobo_swf' type='file' multiple='true' style='display:none'/>
        <div style='margin-top: 10px'>
          <a href='#' id='btnUploadDevices' style='margin-left: 100px'>Import Lookup</a></div>
      </div>
      <div id='ImportDataContainer'>
        <h3>
          Import HOBO Data</h3>
        <input id="data_upload" name="data_upload" type="file" multiple="true" />
        <input id='data_swf' name='data_swf' type='file' multiple='true' style='display:none'/>
        <div style='margin-top: 10px'>
          <a href="#" id='btnUploadData' style='margin-left: 110px'>Import Data</a>
        </div>
      </div>
      <div style='clear: both'>
      </div>
    </div>
    <div>
      <div id='ImportNotes'>
        <b>Remember</b>: Each year that data is collected, it’s necessary to first upload the lookup table that relates HOBO IDs to SITE IDs, and then upload the raw HOBO data.  The lookup table must contain fields exactly as are displayed in the Site/HOBO template; please download the template using the link in lower right corner.  After uploading the Site/HOBO lookup, you can then upload your HOBO data.  HOBO data must have the fields HOBO_ID, Temp, _DateTime.  Some sensors may also include the fields DewPoint, AbsHumidity, RH. Temp and Dew Point should be in Celsius, and RH should be a %. The HOBO data must be contained in the first worksheet and it should be named Sheet1 (this is the default).  A template for HOBO data is also available for download in lower right corner.
      </div>
      <div id='ImportImageContainer'>
        <img src="Images/HOBO_sheet.png" style='display: block; margin: auto' />
        <div style="font-size: 8pt; text-align: center; margin-top: 5px; margin-bottom: 0px;"><br />
          <a href='Site_hobo_template.xlsx'>Download empty Site/HOBO Excel template</a><br /><br />
          <a href='Garcia_template.xlsx'>Download empty HOBO data Excel template</a>
        </div>
      </div>
      <div style='clear: both'>
      </div>
    </div>
  </div>
  <link rel="Stylesheet" href="Styles/uploadifive.css" />
  <link rel='Stylesheet' href='Styles/uploadify.css' />
  <script src="Scripts/jquery.uploadifive.min.js"></script>
  <script src='Scripts/jquery.uploadify.min.js'></script>
  <script src="Scripts/ImportData.js"></script>
</asp:Content>
