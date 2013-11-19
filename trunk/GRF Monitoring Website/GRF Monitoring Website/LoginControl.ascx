<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LoginControl.ascx.cs" Inherits="LoginControl" %>
  <script type="text/javascript" language='javascript'>
    $(function () {
      $('#btns').hide();
    });
  </script>
    <div style=" background-image:url(Images/GrayVerticalGradient1.jpg); background-repeat:repeat-x; border: 1px solid black; width: 240px; 
        padding: 5px 10px 10px 10px;">

        <asp:Login runat="server" ID="Login1" TitleText="Login to Continue">                   
            <LayoutTemplate>
                
                <table style="margin-left: 10px; margin-top: 10px;" border="0">
                <tr>
                    <td style="font-size: 14pt; font-weight: bold;">
                        <asp:Label runat="server" ID="lblInstructions">Login</asp:Label>
                    </td>
                    <td>
                        <asp:Label Font-Size="8" runat="server" ID="FailureText" ForeColor="Red" Font-Bold="true" />
                    </td>
                </tr>
                <tr>
                    <td width="100" class="labl">user name &nbsp;</td>
                    <td width="140">
                        <asp:TextBox runat="server" ID="UserName" MaxLength="50" CssClass="textbox" Width="120"></asp:TextBox>
                    </td>
                </tr>
                <tr>
                    <td class="labl">password &nbsp;</td>
                    <td>
                        <asp:TextBox runat="server" ID="Password" TextMode="Password" CssClass="textbox" Width="120"></asp:TextBox>
                    </td>
                </tr>

                <tr height="5"><td></td></tr>

                <tr>
                    <td colspan="2">
                        <asp:CheckBox runat="server" ID="RememberMe" Text="Remember me next time" />
                    </td>
                </tr>
                <tr height="5"><td></td></tr>
                <tr>
                    <td colspan="2" align="right">
                        <asp:Button runat="server" ID="Login" CommandName="Login" Text="Submit" BackColor="ButtonFace" 
                        style="margin-right: 0px;" />
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <a href="Register.aspx">Register as a new user</a><br />
                        <a href="ForgotPassword.aspx">Forgot password</a>
                    </td>
                </tr>
            </table>
            </LayoutTemplate>
        </asp:Login>
    
        <asp:Panel runat="server" ID="pnlLoggedIn" Visible="false">
            <h1 style="margin-top: 0px; margin-bottom: 0px;">
                Logged in
            </h1>
            <div style="margin-top: 30px; text-align: right;">
                <asp:Label runat="server" ID="lblWelcome"></asp:Label>                
            </div>
            <div style="margin-top: 30px; margin-left: 10px; line-height: 1.5em; font-size: 10pt;">
                <asp:LinkButton runat="server" ID="lbLogout" OnClick="lbLogout_Click">Logout</asp:LinkButton><br />
                <a href="ChangePassword.aspx">Change Password</a>
            </div>
        </asp:Panel>

    </div>
