using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Security;

public partial class LoginControl : System.Web.UI.UserControl
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (Page.User.Identity.IsAuthenticated)
        {
            Login1.Visible = false;
            pnlLoggedIn.Visible = true;

            string username = Page.User.Identity.Name;
            lblWelcome.Text = "You are logged in as: " + username;
        }
        else
        {
            Login1.Visible = true;
            pnlLoggedIn.Visible = false;
        }
    }

    public override void Focus()
    {
        Login1.Focus();
    }

    protected void lbLogout_Click(object sender, EventArgs e)
    {
        FormsAuthentication.SignOut();
        Response.Redirect("Home.aspx", true);
        //Login1.Visible = true;
        //pnlLoggedIn.Visible = false;
    }
}