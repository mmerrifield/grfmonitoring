<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="PrepareReportData.aspx.cs" Inherits="PrepareReportData" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
    <script type="text/javascript">

        var hfMessage

        function pageLoad(sender, args) {
            hfMessage = document.getElementById("<%=hfMessage.ClientID %>");

            if (hfMessage.value != "") {
                alert(hfMessage.value);
                hfMessage.value = "";
            }
        }

    </script>

</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <asp:ScriptManager runat="server" ID="ScriptManager1" AsyncPostBackTimeout="6000"></asp:ScriptManager>
    
    <h2 align="center" style="margin-top: 20px;">Prepare Reports Data</h2>
    
    <p>Select the date range, and the type of data (MWAT, MWMT or both) you would like to prepare, and click the 'Process' button below.</p>
        <asp:UpdatePanel runat="server" ID="UpdatePanel1">
            <ContentTemplate>
                <asp:HiddenField runat="server" ID="hfMessage" Value="" />
                <table cellpadding="0" cellspacing="0" style="margin-top: 20px;" align="center">
                    <tr>
                        <td valign="top">
                            <div style="width: 300px; height: 134px; background-color: #A3BC79; ">
                                <div style="background-color: #617A2C; font-weight: bold; padding: 5px; color: Black; border: 1px solid black;">
                                    Enter date range:
                                </div>
                                <table cellpadding="5" cellspacing="0" align="center" style="margin: 10px;">
                                    <tr>
                                        <td class="labl">Year:</td>
                                        <td>
                                            <telerik:RadComboBox runat="server" ID="cboYear" Width="142" AutoPostBack="true" AppendDataBoundItems="true" OnSelectedIndexChanged="cboYear_SelectedIndexChanged">
                                                <Items>
                                                    <telerik:RadComboBoxItem Text="(Select)" Value="" />
                                                </Items>
                                            </telerik:RadComboBox>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="labl">Start Date:</td>
                                        <td>
                                            <telerik:RadDatePicker runat="server" Width="148" ID="rdpStartDate"></telerik:RadDatePicker>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="labl">End Date:</td>
                                        <td>
                                            <telerik:RadDatePicker runat="server" Width="148" ID="rdpEndDate"></telerik:RadDatePicker>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                        <td width="30"></td>
                        <td valign="top">
                            <div style="width: 300px; height: 134px; background-color: #A3BC79; ">
                                <div style="background-color: #617A2C; font-weight: bold; padding: 5px; color: Black; border: 1px solid black;">
                                    Select type of data:
                                </div>
                                <div style="margin: 10px 10px 10px 40px;">
                                    <asp:RadioButtonList runat="server" ID="rblDataType">
                                        <asp:ListItem>MWAT</asp:ListItem>
                                        <asp:ListItem>MWMT</asp:ListItem>
                                        <asp:ListItem Selected="True">Both</asp:ListItem>
                                    </asp:RadioButtonList>
                                </div>
                            </div>
                
                        </td>
                    </tr>
                    <tr height="20"><td></td></tr>
                    <tr>
                        <td colspan="3" align="center">
                            <asp:Button runat="server" ID="btnProcess" Text="Process" Enabled="false" OnClick="btnProcess_Click" />
                        </td>
                    </tr>
                </table>
            
            </ContentTemplate>
        </asp:UpdatePanel>

</asp:Content>

