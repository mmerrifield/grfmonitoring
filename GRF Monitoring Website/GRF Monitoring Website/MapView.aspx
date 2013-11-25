<%@ Page Title="" Language="C#" MasterPageFile="~/GarciaWide.master" AutoEventWireup="true" CodeFile="MapView.aspx.cs" Inherits="MapView" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
<div id='MapContainer'>
<label for='Year' style='margin-left:10px'>Year:</label><select id='Year'></select>&nbsp;<input type='checkbox' id='showWatershed' checked='checked' /><label for='showWatershed'>Show Watershed</label>&nbsp;
<input type='checkbox' id='showProject' checked='checked' /><label for='showProject'>Show Project Boundary</label>&nbsp;<input type='checkbox' id='showDataSites' /><label for='showDataSites'>Only show sites with data</label>
</div>
<div id='map-canvas' ></div>
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
<script src='Scripts/MapView.js'></script>
</asp:Content>

