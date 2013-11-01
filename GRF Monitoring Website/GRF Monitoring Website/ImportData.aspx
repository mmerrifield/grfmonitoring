<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="ImportData.aspx.cs" Inherits="ImportData" %>
<%@ MasterType VirtualPath="~/Garcia.master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <asp:ScriptManager runat="server" ID="ScriptManager1"></asp:ScriptManager>

    <div style="background-color: #F2F2F2; padding: 20px; min-height: 440px; margin-top: 5px;">

        <table cellpadding="0" cellspacing="0">
            <tr>
                <td width="700">
                    <span style="font-size: 14pt; font-weight: bold;">Data: </span>
                    <span style="font-size: 12pt; font-weight: bold;">Import / </span>
                    <a href="ExportData.aspx" style="font-weight: bold; font-size: 12pt;">Export</a>
                </td>
                <td width="100" align="right">
                    <asp:HyperLink runat="server" ID="hlManageSites" Text="Manage Sites" NavigateUrl="~/ManageSites.aspx"></asp:HyperLink>
                </td>
            </tr>
        </table>


        <div style="border: 1px solid Gray; background-image:url('Images/GrayVerticalGradient3.jpg'); background-repeat:repeat-x; margin: 20px; padding: 0px 20px 20px 20px;">
            <h3 style="margin-bottom: 0px;">Import HOBO Data</h3>
            <asp:Label runat="server" ID="lblInstructions" style="margin-top: 0px; margin-bottom: 20px;">Use the browse button below to select an Excel file to upload, then click the Upload button</asp:Label><br /><br />
            <asp:FileUpload Width="400" runat="server" ID="FileUpload1"  />
            &nbsp;&nbsp;
            <asp:Button runat="server" ID="btnUpload" Visible="true" Text="Upload" OnClick="btnUpload_Click" />
        </div>

        <table cellpadding="0" cellspacing="0" style="margin-top: 10px; margin-left: 40px;">
            <tr height="280">
                <td width="300" valign="top">
                    <div style="font-size: 12pt; line-height: 1.5em;">
                        <b>Remember</b>: Your HOBO data need to have the following fields: HOBO_ID, Temp, _DateTime. Some sensors may include the following fields as well: DewPoint, AbsHumidity, RH.  
                        <br /><br />
                        The data must be contained in the first worksheet and it should be named Sheet1 (the default).

                    </div>
                </td>
                <td width="60"></td>
                <td width="300" valign="top" align="center">
                    <img src="Images/HOBO_sheet.png" />
                    <div style="font-size: 8pt; text-align:center; margin-top: 5px; margin-bottom: 0px;">
                        Example spreadsheet for upload
                    </div>
                </td>
            </tr>
        </table>

        <asp:GridView runat="server" ID="gvDailyStats"></asp:GridView>

        <div style="position: absolute; top: 160px; left: 360px;">
            <telerik:RadProgressManager ID="RadProgressManager1" Runat="server"></telerik:RadProgressManager> 
            <telerik:RadProgressArea id="RadProgressArea1" runat="server" />
        </div>


    </div>

</asp:Content>
