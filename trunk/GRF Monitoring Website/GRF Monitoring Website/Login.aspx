<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true"
  CodeFile="Login.aspx.cs" Inherits="Login" %>

<%@ Register Src="~/LoginControl.ascx" TagPrefix="uc1" TagName="LoginControl" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
  <table align="center" style="margin-top: 40px;">
    <tr>
      <td>
        <uc1:LoginControl runat="server" ID="Login1" />
      </td>
    </tr>
  </table>
  <script type='text/javascript' language='javascript'>
    $(function () {
      $('#RequestNewPwd').on('click', function () {
        var params = {};
        params.username = $('.uname').val();
        if (params.username.length === 0) {
          alert('Please provide your username before requesting a new password.');
          return;
        }
        $.ajax(
        {
          type: "GET",
          url: 'GRFService.svc/RequestReset',
          datatype: 'json',
          contentType: "application/json; charset=utf-8",
          data: params,
          success: function (resp) {
            if (resp)
              alert("Your reset request was received - you should get an email with a new password within the next 24 hours.");
            else
              alert("The request did not reach the site administrator.  Please try contacting the site point of contact directly.");
          },
          error: function (a, b, c) {
            alert('An error has occured retrieving data!');
          }
        });
      });
    });
  </script>
</asp:Content>
