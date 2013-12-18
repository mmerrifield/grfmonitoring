<%@ Page Title="" Language="C#" MasterPageFile="~/GarciaWide.master" AutoEventWireup="true" CodeFile="MapView.aspx.cs" Inherits="MapView" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
<div id='MapContainer'>
<label for='Year' style='margin-left:10px'>Year:</label><select id='Year'></select>&nbsp;Pin Data:<select id='PinFormat'><option value='MWAT'>MWAT</option><option value='MWMT'>MWMT</option></select><input type='checkbox' id='showWatershed' checked='checked' /><label for='showWatershed'>Show Watershed</label>&nbsp;
<input type='checkbox' id='showProject' checked='checked' /><label for='showProject'>Show Project Boundary</label>&nbsp;
<input type='checkbox' id='showStreams' checked='checked' /><label for='showStreams'>Show Streams</label>&nbsp;
<input type='checkbox' id='showDataSites' /><label for='showDataSites'>Only show sites with data</label>&nbsp;
</div>

<div id='map-canvas' ></div>
<div onclick='printMap();'>Print Map</div>
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
<script src='Scripts/MapView.js'></script>
<style type='text/css' media='print'>
.gmnoprint {display: inline }
</style>
</asp:Content>

