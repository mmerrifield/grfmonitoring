<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true"
  CodeFile="ImportData.aspx.cs" Inherits="ImportData" %>

<%@ MasterType VirtualPath="~/Garcia.master" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
  <div id='ImportContainer'>
    <div class='DataMgmtActions'>
      Import Data | <a href='ExportData.aspx'>Export Data</a> <span id='adminSites' runat='server'>
        | <a href='ManageSites.aspx'>Manage Sites</a></span></div>
    <div class='PageCtrls'>
      <div id='ImportDeviceContainer'>
        <h3>
          Import HOBO Devices</h3>
        <input id="hobo_upload" name="hobo_upload" type="file" multiple="true" />
        <div style='margin-top:10px'>
        <a href='#' id='btnUploadDevices' style='margin-left:100px'>Upload Device Files</a></div>
      </div>
      <div id='ImportDataContainer'>
        <h3>
          Import HOBO Data</h3>
        <input id="data_upload" name="data_upload" type="file" multiple="true" />
        <div style='margin-top:10px'>
        <a href="#" id='btnUploadData' style='margin-left:110px'>Upload Data Files</a>
        </div>
      </div>
      <div style='clear: both'>
      </div>
    </div>
    <div>
      <div id='ImportNotes'>
        <b>Remember</b>: You need to upload HOBO device information prior to loading the HOBO data.
        <br /><br />
        Your HOBO data need to have the following fields: HOBO_ID, Temp, _DateTime. Some
        sensors may include the following fields as well: DewPoint, AbsHumidity, RH.
        <br />
        <br />
        The data must be contained in the first worksheet and it should be named Sheet1
        (the default).
      </div>
      <div id='ImportImageContainer'>
        <img src="Images/HOBO_sheet.png" style='display: block; margin: auto' />
        <div style="font-size: 8pt; text-align: center; margin-top: 5px; margin-bottom: 0px;">
          <a href='Garcia_template.xlsx'>Download empty Excel workbook template.</a>
        </div>
      </div>
      <div style='clear:both'></div>
    </div>
  </div>
  <link rel="Stylesheet" href="Styles/uploadifive.css" />
  <script src="Scripts/jquery.uploadifive.min.js"></script>
  <script src="Scripts/ImportData.js"></script>
</asp:Content>
