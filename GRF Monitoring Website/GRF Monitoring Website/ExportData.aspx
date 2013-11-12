<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true"
  CodeFile="ExportData.aspx.cs" Inherits="ExportData" %>

<%@ MasterType VirtualPath="~/Garcia.master" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
  <div style="background-color: #F2F2F2; padding: 20px; min-height: 440px; margin-top: 5px;">
    <div class='DataMgmtActions'>
      <a href='ImportData.aspx'>Import Data</a> | Export Data <span id='adminSites' runat='server'>
        | <a href='ManageSites.aspx'>Manage Sites</a></span></div>
    <div id='ExportContainer'>
      <div class='PageCtrls'>
        <p>
          Choose the date range and site below and click the Export button.</p>
        <table width='98%'>
          <tr>
            <th>
              Year
            </th>
            <th>
              Site
            </th>
            <th>
              Type
            </th>
            <th>
              From
            </th>
            <th>
              To
            </th>
            <th>
            </th>
          </tr>
          <tr>
            <td>
              <select id='Year'>
              </select>
            </td>
            <td>
              <select id='Site' style='width:380px'>
              </select>
            </td>
            <td>
              <select id='Type'>
              </select>
            </td>
            <td>
              <input type='text' id='FromDate' style='width: 100px' />
            </td>
            <td>
              <input type='text' id='ToDate' style='width: 100px' />
            </td>
            <td><a href='#' id='btnClear'>Clear</a></td>
            <td>
              <a href='#' id='btnExport' style='width:80px'>Get Data</a>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <center>
    <table id="export">
      <tr>
        <td />
      </tr>
    </table>
    <div id='navexport'>
    </div></center>
    <script src='Scripts/ExportData.js'></script>
  </div>
</asp:Content>
