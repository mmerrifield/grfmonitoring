<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="ChangePassword.aspx.cs" Inherits="ChangePassword" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <table align="center" style="margin-top: 40px;">
        <tr>
            <td valign="top">
                <asp:ChangePassword runat="server" ID="ChangePassword1" BorderStyle="Groove" 
                    ContinueDestinationPageUrl="Home.aspx" 
                  OnSendingMail="ChangePassword1_SendingMail" 
                  oncancelbuttonclick="ChangePassword1_CancelButtonClick">
                    <TitleTextStyle Font-Bold="true"  />
                </asp:ChangePassword>
            </td>
        </tr>
    </table>

</asp:Content>
