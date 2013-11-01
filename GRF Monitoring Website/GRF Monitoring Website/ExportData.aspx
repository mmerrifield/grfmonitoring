<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="ExportData.aspx.cs" Inherits="ExportData" %>
<%@ MasterType VirtualPath="~/Garcia.master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <asp:ScriptManager runat="server" ID="ScriptManager1" EnablePartialRendering="false"></asp:ScriptManager>
    
    <div style="background-color: #F2F2F2; padding: 20px; min-height: 440px; margin-top: 5px;">

        <table cellpadding="0" cellspacing="0">
            <tr>
                <td style="width: 700px;">
                    <span style="font-size: 14pt; font-weight: bold;">Data: </span>
                    <a href="ImportData.aspx" style="font-weight: bold; font-size: 12pt;">Import</a>
                    <span style="font-size: 12pt; font-weight: bold;"> / Export</span>                
                </td>
                <td style="width: 100px;" align="right">
                    <asp:HyperLink runat="server" ID="hlManageSites" Text="Manage Sites" NavigateUrl="~/ManageSites.aspx"></asp:HyperLink>
                </td>

            </tr>
        </table>
        
        <div style="background-image:url('Images/GrayVerticalGradient3.jpg'); background-repeat:repeat-x; border: 1px solid gray; height: 80px; margin: 20px; padding: 0px 20px 20px 20px;">
            <h3 style="margin-bottom: 0px;">Export HOBO Data</h3>
            <asp:Label runat="server" ID="lblInstructions" style="margin-top: 0px; margin-bottom: 10px;">Choose the date range and site below and click the Export button.</asp:Label><br /><br />
            
            <table style="margin-top: -5px;">
                <tr>

                    <td>
                        <b>Year: </b></br>

                        <telerik:RadComboBox runat="server" ID="cboSeason" Width="70" OnSelectedIndexChanged="updateSites" AutoPostBack="true" AppendDataBoundItems="true">
                            <Items>
                                <telerik:RadComboBoxItem Value="" Text="" />
                            </Items>
                        </telerik:RadComboBox>
                    </td>

                    <td style="width: 5px;"></td>
                    <td>
                        <b>Site: </b><br />
                        <telerik:RadComboBox ID="cboSites" runat="server" AutoPostBack="true" 
                            DataTextField="siteName" DataValueField="siteID" Width="150" DropDownWidth="300" OnSelectedIndexChanged="cboSites_SelectedIndexChanged">
                        </telerik:RadComboBox>
                    </td>

                    <td style="width: 5px;"></td>

                    <td style="width: 70px;">
                        <b>Type:</b><br />

                        <telerik:RadComboBox runat="server" ID="cboType" Width="70" OnSelectedIndexChanged="cboType_SelectedIndexChanged" AutoPostBack="true">
                            <Items>
                                <telerik:RadComboBoxItem Value="Water" Text="Water" />
                                <telerik:RadComboBoxItem Value="Air" Text="Air" />
                            </Items>
                        </telerik:RadComboBox>
                        

                    </td>

                    <td style="width: 5px;"></td>

                    <td style="width: 100px;">
                        <b>Date from: </b><br />
                        <telerik:RadDatePicker runat="server" ID="rdpDateFrom" Width="100"></telerik:RadDatePicker>
                    </td>
                    
                    <td style="width: 5px;"></td>

                    <td style="width: 100px;">
                        <b>Date to: </b><br />
                        <telerik:RadDatePicker runat="server" ID="rdpDateTo" Width="100"></telerik:RadDatePicker>
                    </td>
                        
                
                    <td style="width: 5px;"></td>

                    <td style="width: 160px;">
                        <b>Export to:</b>
                        <br />
                        <telerik:RadComboBox ID="cboExportTo" runat="server" Width="80">
                            <Items>
                                <telerik:RadComboBoxItem Value="Screen" Text="Screen" Selected="true" />
                                <telerik:RadComboBoxItem Value="Excel" Text="Excel" Selected="true" />
                            </Items>
                        </telerik:RadComboBox>
                    </td>
                    
                    <td width="5"></td>

                    <td valign="bottom">
                        <asp:Button runat="server" ID="btnExport" Text="Export" 
                            onclick="btnExport_Click" />
                    </td>
                </tr>
            </table>

        </div>
        <div style="margin-top: 10px; text-align: center;">
            <asp:GridView EnableViewState="false" runat="server" ID="gvHoboData" AutoGenerateColumns="false" CellPadding="5" RowStyle-HorizontalAlign="Left" Width="760">
            <EmptyDataTemplate>
                <h2 style="margin: 40px 0px 40px 0px; text-align: center" >No HOBO Data Found</h2>
            </EmptyDataTemplate>
                <HeaderStyle HorizontalAlign="Center" BackColor="Gray" ForeColor="White" Font-Bold="true" />
                <Columns>
                    <asp:BoundField DataField="ID" HeaderText="ID" />
                    <asp:BoundField DataField="HOBO_ID" HeaderText="HOBO_ID" />
                    <asp:BoundField DataField="siteName" HeaderText="Site" />
                    <asp:BoundField DataField="_DateTime" HeaderText="Date / Time" />
                    <asp:BoundField DataField="Temp" HeaderText="Temp" />
                    <asp:BoundField DataField="DewPoint" HeaderText="DewPoint" />
                    <asp:BoundField DataField="AbsHumidity" HeaderText="AbsHumidity" />
                    <asp:BoundField DataField="RH" HeaderText="RH" />
                    <asp:BoundField DataField="DateUploaded" DataFormatString="{0:d}" HeaderText="Date Uploaded" />
                    <asp:BoundField DataField="UploadedBy" HeaderText="Uploaded By" />
                </Columns>
            </asp:GridView>
        </div>            
    </div>
</asp:Content>
