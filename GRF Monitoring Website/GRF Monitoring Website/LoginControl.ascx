<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LoginControl.ascx.cs" Inherits="LoginControl" %>
  <style type="text/css">
    .style1
    {
      width: 100px;
    }
  </style>
  <script type="text/javascript" language='javascript'>
    $(function () {
      $('#btns').hide();
    });
  </script>
    <div style="border: 1px solid black; width: 240px; 
        padding: 5px 10px 10px 10px;">

        <asp:Login runat="server" ID="Login1" TitleText="Login to Continue" 
          BorderColor="#000066" BorderStyle="Inset" BorderWidth="3px" 
          DestinationPageUrl="Home.aspx">                   
            <LayoutTemplate>
                
                <table style="margin-left: 10px; margin-top: 10px;" border="0">
                <tr>
                    <td style="font-size: 14pt; font-weight: bold;" class="style1">
                        <asp:Label runat="server" ID="lblInstructions">Login</asp:Label>
                    </td>
                    <td>
                        <asp:Label Font-Size="8" runat="server" ID="FailureText" ForeColor="Red" Font-Bold="true" />
                    </td>
                </tr>
                <tr>
                    <td class="style1">user name &nbsp;</td>
                    <td width="140">
                        <asp:TextBox runat="server" ID="UserName" MaxLength="50" CssClass="uname" Width="120"></asp:TextBox>
                    </td>
                </tr>
                <tr>
                    <td class="style1">password &nbsp;</td>
                    <td>
                        <asp:TextBox runat="server" ID="Password" TextMode="Password" CssClass="textbox" Width="120"></asp:TextBox>
                    </td>
                </tr>

                <tr height="5"><td class="style1"></td></tr>

                <tr>
                    <td colspan="2">
                        <asp:CheckBox runat="server" ID="RememberMe" Text="Remember me next time" />
                    </td>
                </tr>
                <tr>
                    <td colspan="2" align="right">
                        <asp:Button runat="server" ID="Login" CommandName="Login" Text="Submit" BackColor="ButtonFace" 
                        style="margin-right: 0px;" />
                    </td>
                </tr>
            </table>
            </LayoutTemplate>
        </asp:Login>
        <p>If you forgot your password <asp:HyperLink ID="requestNewPwd" runat='server' Text='click here' NavigateUrl='http://www.motoringfile.com'></asp:HyperLink></p>
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
