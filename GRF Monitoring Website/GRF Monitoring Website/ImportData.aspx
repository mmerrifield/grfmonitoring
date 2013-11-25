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
        <div style='margin-top: 10px'>
          <a href='#' id='btnUploadDevices' style='margin-left: 100px'>Import Site/HOBO Lookup</a></div>
      </div>
      <div id='ImportDataContainer'>
        <h3>
          Import HOBO Data</h3>
        <input id="data_upload" name="data_upload" type="file" multiple="true" />
        <div style='margin-top: 10px'>
          <a href="#" id='btnUploadData' style='margin-left: 110px'>Upload Lookup</a>
        </div>
      </div>
      <div style='clear: both'>
      </div>
    </div>
    <div>
      <div id='ImportNotes'>
        <b>Remember</b>: Each year that new data is uploaded, you need to upload the lookup table that relates HOBO IDs to SITE IDs. This lookup table must have the following fields: SITE_ID, HOBO_ID, YEAR_, TYPE (eg. “Water”, “Air_Humidity”, or “Air”), and CONTRIBUTOR. Your HOBO data need to have the following fields: HOBO_ID, Temp, _DateTime. Some sensors may include the following fields as well: DewPoint, AbsHumidity, RH. Temp and Dew Point should be in Celsius, and RH should be a %. The data must be contained in the first worksheet and it should be named Sheet1 (the default).
      </div>
      <div id='ImportImageContainer'>
        <img src="Images/HOBO_sheet.png" style='display: block; margin: auto' />
        <div style="font-size: 8pt; text-align: center; margin-top: 5px; margin-bottom: 0px;">
          <a href='Garcia_template.xlsx'>Download empty Excel workbook template.</a>
        </div>
      </div>
      <div style='clear: both'>
      </div>
    </div>
  </div>
  <link rel="Stylesheet" href="Styles/uploadifive.css" />
  <script src="Scripts/jquery.uploadifive.min.js"></script>
  <script src="Scripts/ImportData.js"></script>
</asp:Content>
