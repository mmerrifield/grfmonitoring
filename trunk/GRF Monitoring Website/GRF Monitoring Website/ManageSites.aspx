<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true"
  CodeFile="ManageSites.aspx.cs" Inherits="ManageSites" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="Server">
  <div class='DataMgmtActions' style='margin-top:10px;margin-bottom:10px'>
      <a href='ImportData.aspx'>Import Data</a> | <a href='ExportData.aspx'>Export Data</a>
      | Manage Sites</div>
  <table id="sites">
    <tr>
      <td />
    </tr>
  </table>
  <div id='navsites'>
  </div>
  <script src='Scripts/jscolor.js'></script>
  <script src='Scripts/ManageSites.js'></script>
</asp:Content>
