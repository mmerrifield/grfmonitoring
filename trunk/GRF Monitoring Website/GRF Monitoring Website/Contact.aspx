<%@ Page Title="Contact" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="Contact.aspx.cs" Inherits="Contact" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
  <script type='text/javascript' language='javascript'>
    $(function () {
      $('#aContact')[0].checked = true;
      $('#aContact').button('refresh');
    });
  </script>    <table align="center" style="margin-top: 30px; font-size: 11pt;">
        <tr>
            <td>
            <h3 align="center">Contact Information</h3>
            <asp:Literal ID='POC' runat='server'></asp:Literal><br />
            <asp:Literal ID='JobTitle' runat='server'></asp:Literal><br />
            <asp:Literal ID='Region' runat='server'></asp:Literal><br />
            <a id='EmailLink' runat='server'></a>
            </td>
        </tr>
    </table>
</asp:Content>