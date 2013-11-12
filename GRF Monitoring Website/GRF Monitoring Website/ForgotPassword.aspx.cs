using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Net;
using System.Net.Mail;
using System.Configuration;
using System.Web.Configuration;
using System.Net.Configuration;

public partial class ForgotPassword : System.Web.UI.Page
{
  protected void Page_Load(object sender, EventArgs e)
  {

  }

  protected void PasswordRecovery1_SendingMail(object sender, System.Web.UI.WebControls.MailMessageEventArgs e)
  {
    try
    {
      MailMessage msg = new MailMessage();
      string fromEmail = ConfigurationManager.AppSettings["RecoveryEmail"];
      string fromName = ConfigurationManager.AppSettings["RecoveryEmailUsername"];
      msg.From = new MailAddress(fromEmail, fromName);

      msg.To.Clear();
      msg.To.Add(e.Message.To.ElementAt(0));
      msg.Subject = "Password Reminder";

      msg.IsBodyHtml = true;
      msg.Body = e.Message.Body;

      Configuration config = WebConfigurationManager.OpenWebConfiguration(HttpContext.Current.Request.ApplicationPath);
      MailSettingsSectionGroup settings = (MailSettingsSectionGroup)config.GetSectionGroup("system.net/mailSettings");

      SmtpClient client = new SmtpClient(settings.Smtp.Network.Host, settings.Smtp.Network.Port);
      client.Credentials = new NetworkCredential(settings.Smtp.Network.UserName, settings.Smtp.Network.Password);
      client.EnableSsl = true;
      client.Send(msg);
    }
    catch
    {
      e.Cancel = true;
    }
  }
}