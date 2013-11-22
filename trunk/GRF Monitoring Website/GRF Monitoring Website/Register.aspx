<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="Register.aspx.cs" Inherits="Register" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
  <script type='text/javascript' language='javascript'>
    $(function () {
      $('#btns').hide();
    });
  </script>
    <table align="center" style="margin-top: 40px;">
        <tr>
            <td valign="top">
                <asp:CreateUserWizard ID="RegisterUser" runat="server" 
                  OnCreatedUser="RegisterUser_CreatedUser" 
                  OnSendingMail="RegisterUser_SendingEmail" DisplayCancelButton="True" 
                  oncancelbuttonclick="RegisterUser_CancelButtonClick">
                    <TitleTextStyle Font-Bold="true" Font-Names="Verdana" />
                    <WizardSteps>
                        <asp:CreateUserWizardStep ID="CreateUserWizardStep1" runat="server"></asp:CreateUserWizardStep>
                        <asp:CompleteWizardStep ID="CompleteWizardStep1" runat="server"></asp:CompleteWizardStep>
                    </WizardSteps>
                </asp:CreateUserWizard>
            </td>
        </tr>
    </table>
</asp:Content>
