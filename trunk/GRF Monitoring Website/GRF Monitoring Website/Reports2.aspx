<%@ Page Title="" Language="C#" MasterPageFile="~/GarciaWide.master" AutoEventWireup="true" CodeFile="Reports2.aspx.cs" Inherits="Reports2" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
<script src='Scripts/jquery.multiselect.min.js'></script>
<script src='Scripts/Reports2.js'></script>
<script src='Scripts/highcharts.js'></script>
<script src='Scripts/exporting.js'></script>
<link rel='Stylesheet' href='Styles/jquery.multiselect.css' />
<div style='margin-top:20px;margin-left:40px'>
From:&nbsp;
        <select id="StartMon" class='Filter'>
        <option value="1" selected="selected">Jan</option>
        <option value="2" >Feb</option>
        <option value="3">Mar</option>
        <option value="4">Apr</option>
        <option value="5">May</option>
        <option value="6">Jun</option>
        <option value="7">Jul</option>
        <option value="8">Aug</option>
        <option value="9">Sep</option>
        <option value="10">Oct</option>
        <option value="11">Nov</option>
        <option value="12">Dec</option>
        </select>
        <select id="StartYr" class='Filter'>
        </select>&nbsp;
        To:&nbsp;
         <select id="EndMon" class='Filter'>
         <option value="1" >Jan</option>
        <option value="2" >Feb</option>
        <option value="3">Mar</option>
        <option value="4">Apr</option>
        <option value="5">May</option>
        <option value="6">Jun</option>
        <option value="7">Jul</option>
        <option value="8">Aug</option>
        <option value="9">Sep</option>
        <option value="10">Oct</option>
        <option value="11">Nov</option>
        <option value="12" selected="selected">Dec</option>
        </select>
        <select id="EndYr" class='Filter'>
       </select>&nbsp;
       <span class='hdrLabel'>Report:</span>&nbsp;
       <select id='ReportType' style='margin-left:30px'>
       <option value='MWAT'>MWAT</option>
       <option value='MaxMWAT'>Max MWAT</option>
       <option value='MWMT'>MWMT</option>
       <option value='MaxMWMT'>Max MWMT</option>
       </select><br />
       <span class='hdrLabel'>Sites:</span>&nbsp;
       <select id='Sites' >
       </select><br />
       <a href='#' id='GenReport'>Generate Report</a>
</div>
<div id="container" style="min-width: 310px; height: 400px; margin: 0 auto"></div>
</asp:Content>

