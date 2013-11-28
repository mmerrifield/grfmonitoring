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

      msg.To.Add(e.Message.To.ElementAt(0));
      msg.Subject = "Password Reminder";

      msg.IsBodyHtml = true;
      msg.Body = e.Message.Body;

      SmtpClient client = new SmtpClient(); //settings.Smtp.Network.Host, settings.Smtp.Network.Port);
      client.EnableSsl = true;
      client.Send(msg);
    }
    catch (Exception ex)
    {
      e.Cancel = true;
    }
  }

}