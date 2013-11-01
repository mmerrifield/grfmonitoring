<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="Register.aspx.cs" Inherits="Register" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <table align="center" style="margin-top: 40px;">
        <tr>
            <td valign="top">
                <asp:CreateUserWizard ID="RegisterUser" runat="server" OnCreatedUser="RegisterUser_CreatedUser" OnSendingMail="RegisterUser_SendingEmail">
                    <TitleTextStyle Font-Bold="true" Font-Names="Verdana" />
                    <WizardSteps>
                        <asp:CreateUserWizardStep ID="CreateUserWizardStep1" runat="server"></asp:CreateUserWizardStep>
                        <asp:CompleteWizardStep ID="CompleteWizardStep1" runat="server"></asp:CompleteWizardStep>
                    </WizardSteps>

                    <MailDefinition CC="aedwards@datasushi.net" IsBodyHtml="True"
                        Subject="New user registered!">
                    </MailDefinition>

                </asp:CreateUserWizard>
            </td>
        </tr>
    </table>
</asp:Content>
