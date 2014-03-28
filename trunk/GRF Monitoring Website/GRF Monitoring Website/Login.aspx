<%@ Page Title="" Language="C#" MasterPageFile="~/Login.master" AutoEventWireup="true"
  CodeFile="Login.aspx.cs" Inherits="Login" %>

<%@ Register Src="~/LoginControl.ascx" TagPrefix="uc1" TagName="LoginControl" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">

  <table align="center" style="margin-top: 40px;width:603px; margin-left: 0px;">
    <tr>
      <td><div id='PageTitle'>Garcia River Forest Monitoring Database</div>
</td>
    </tr>
    <tr>
      <td>
        <uc1:LoginControl runat="server" ID="Login1" />
      </td>
    </tr>
  </table>
</asp:Content>
