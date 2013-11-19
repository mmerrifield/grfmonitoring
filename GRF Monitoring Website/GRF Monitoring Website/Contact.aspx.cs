using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;

public partial class Contact : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
      POC.Text = ConfigurationManager.AppSettings["POC"];
      JobTitle.Text = ConfigurationManager.AppSettings["Title"];
      Region.Text = ConfigurationManager.AppSettings["Region"];
      string email = ConfigurationManager.AppSettings["Email"];
      EmailLink.HRef = string.Format("mailto:{0}", email);
      EmailLink.InnerText = email;
    }
}