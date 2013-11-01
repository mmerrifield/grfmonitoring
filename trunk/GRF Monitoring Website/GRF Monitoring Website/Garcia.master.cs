using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;

public partial class Garcia : System.Web.UI.MasterPage
{
    protected void Page_Load(object sender, EventArgs e)
    {
            Type cstype = this.GetType();
            ClientScriptManager cs = Page.ClientScript;
            string theScript = "function displayMessage() {var hf = document.getElementById('" + hfMessage.ClientID + "');if (hf.value != '') {alert(hf.value);hf.value = '';}}";
            cs.RegisterStartupScript(cstype, "displayScript", theScript, true);
    }

    public void selectNavButton(string whichButton)
    {
        HtmlImage img = FindControl(whichButton) as HtmlImage;
        img.Src = "Images/" + whichButton + "Button_selected.jpg";
    }

    public void displayAlert(string message)
    {
        hfMessage.Value = message;
    }

}
