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


public partial class Register : System.Web.UI.Page
{

  protected void Page_Load(object sender, EventArgs e)
  {

  }

  protected void RegisterUser_CreatedUser(object sender, EventArgs e)
  {
    // add new user to "Inactive" role
    string newUserName = RegisterUser.UserName;
    Roles.AddUserToRole(newUserName, "Inactive");
  }

  protected void RegisterUser_SendingEmail(object sender, System.Web.UI.WebControls.MailMessageEventArgs e)
  {
    // send the email using SSL

    MailMessage msg = new MailMessage();
    string fromEmail = ConfigurationManager.AppSettings["AdminEmail"];
    string fromName = ConfigurationManager.AppSettings["AdminUsername"];
    msg.From = new MailAddress(fromEmail, fromName);

    msg.To.Clear();
    msg.To.Add(new MailAddress(fromEmail, fromName));
    msg.Subject = "New user registered on Garcia River Forest Monitoring site";

    msg.IsBodyHtml = true;
    msg.Body = "<html><body style=\"font-family: sans-serif;\">";
    msg.Body += "<p>A new user has signed up on the grfmonitoring website.  Below is their information: </p>";
    msg.Body += "<table cellpadding=10>";

    msg.Body += "<tr><td align=right><b>User Name:</b></td><td>" + RegisterUser.UserName + "</td></tr>";
    msg.Body += "<tr><td align=right><b>Email:</b></td><td>" + RegisterUser.Email + "</td></tr>";

    msg.Body += "</table>";
    msg.Body += "<p>To activate this user and modify their roles, click <a href=\"http://www.grfmonitoring.net/ManageUsers.aspx\">here</a>.</p>";
    msg.Body += "</body></html>";

    try
    {
      //Configuration config = WebConfigurationManager.OpenWebConfiguration(HttpContext.Current.Request.ApplicationPath);
      MailSettingsSectionGroup settings = (MailSettingsSectionGroup)ConfigurationManager.GetSection("system.net/mailSettings");

      SmtpClient client = new SmtpClient(settings.Smtp.Network.Host, settings.Smtp.Network.Port);
      client.Credentials = new NetworkCredential(settings.Smtp.Network.UserName, settings.Smtp.Network.Password);
      client.EnableSsl = true;
      ServicePointManager.ServerCertificateValidationCallback = delegate(object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) { return true; };
      client.Send(msg);
    }
    catch
    {
      e.Cancel = true;
    }
  }
}