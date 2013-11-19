<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true"
  CodeFile="ManageSites.aspx.cs" Inherits="ManageSites" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="Server">
    <div id='databtns' style='text-align:right;margin-right:210px;margin-top:-15px;margin-bottom:10px'>
      <input type='radio' id='aImport' name='radio2' class='dataBtn' /><label for='aImport'>Import</label>
      <input type='radio' id='aExport' name='radio2' class='dataBtn' /><label for='aExport'>Export</label>
      <input type='radio' id='aManage' name='radio2' class='dataBtn' /><label for='aManage' id='lManage'>Manage</label>
    </div>
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
