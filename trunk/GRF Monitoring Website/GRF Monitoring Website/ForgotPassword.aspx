<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="ForgotPassword.aspx.cs" Inherits="ForgotPassword" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <table align="center" style="margin-top: 40px;">
        <tr>
            <td valign="top">
                <asp:PasswordRecovery ID="PasswordRecovery1" runat="server" OnSendingMail="PasswordRecovery1_SendingMail">
                    <MailDefinition From="PasswordCenter@grfmonitoring.net" Subject="Forgotten Password" Priority="High" />
                </asp:PasswordRecovery>
            </td>
        </tr>
    </table>
</asp:Content>
