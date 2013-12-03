using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Security;
using System.Net;
using System.Net.Mail;
using System.Configuration;
using System.Web.Configuration;
using System.Net.Configuration;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;
using System.Text;


public partial class Register : System.Web.UI.Page
{

  protected void Page_Load(object sender, EventArgs e)
  {

  }

  protected void RegisterUser_CreatedUser(object sender, EventArgs e)
  {
    if (Page.User.IsInRole("Admin"))
    {
      SendEmailToRegistrant(RegisterUser.Email);
      //Roles.AddUserToRole(RegisterUser.UserName, "Active");
      Response.Redirect("ManageUsers.aspx", true);
    }
    else
    {
      Roles.AddUserToRole(RegisterUser.UserName, "Inactive");
      NotifyAdminOfRegistration();
      Response.Redirect("Home.aspx", true);
    }
  }

  private void SendEmailToRegistrant(string to)
  {
    MailMessage msg = new MailMessage();
    msg.To.Add(to);
    msg.Subject = "Account created for Garcia River Forest Monitoring site";

    msg.IsBodyHtml = true;
    StringBuilder sb = new StringBuilder();
    sb.Append("<html><body style='font-family:sans-serif'>");
    sb.AppendFormat("Welcome {0}, we have created an account for your use of the Garcia River Forest Monitoring Site.", RegisterUser.UserName);
    sb.AppendFormat("Your login credentials are as follows. Username = {0}, password = {1}.  We recommend you change your password upon first successful login.",
      RegisterUser.UserName, RegisterUser.Password);
    sb.AppendFormat("If you have any questions, please contact <a href='mailto:{0}'>{0}</a>.", ConfigurationManager.AppSettings["EmailAddress"]);
    sb.Append("</body></html>");
    msg.Body = sb.ToString();
    try
    {
      SmtpClient client = new SmtpClient();
      client.EnableSsl = true;
      client.Send(msg);
    }
    catch (Exception ex)
    {
    }
  }

  private void NotifyAdminOfRegistration()
  {
    MailMessage msg = new MailMessage();

    msg.To.Add(ConfigurationManager.AppSettings["AdminEmails"]);
    msg.Subject = "New user registered on Garcia River Forest Monitoring site";

    msg.IsBodyHtml = true;
    msg.Body = "<html><body style=\"font-family: sans-serif;\">";
    msg.Body += "<p>A new user has signed up on the grfmonitoring website.  Below is their information: </p>";
    msg.Body += "<table cellpadding=10 style='font-family:sans-serif'>";

    msg.Body += "<tr><td align=right><b>User Name:</b></td><td>" + RegisterUser.UserName + "</td></tr>";
    msg.Body += "<tr><td align=right><b>Email:</b></td><td>" + RegisterUser.Email + "</td></tr>";

    msg.Body += "</table>";
    string baseUrl = Request.Url.GetLeftPart(UriPartial.Authority);
    string[] segments = Request.Url.Segments;
    for (int i = 1; i < Request.Url.Segments.Count() - 1; ++i)
      baseUrl += Request.Url.Segments[i] + "/";
    msg.Body += string.Format("<p>To activate this user and modify their roles, click <a href=\"{0}{1}\">here</a>.</p>", baseUrl, "ManageUsers.aspx");
    msg.Body += "</body></html>";

    try
    {
      SmtpClient client = new SmtpClient(); 
      client.EnableSsl = true;
      client.Send(msg);
    }
    catch
    {
    }
  }

  protected void RegisterUser_CancelButtonClick(object sender, EventArgs e)
  {
    Response.Redirect("Home.aspx", true);
  }

  protected void RegisterUser_OnSendingEmail(object sender, MailMessageEventArgs e)
  {
    string s = "";
  }
}