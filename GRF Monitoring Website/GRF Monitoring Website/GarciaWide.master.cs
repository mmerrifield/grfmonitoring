using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;

public partial class GarciaWide : System.Web.UI.MasterPage
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }

    public void selectNavButton(string whichButton)
    {
      HtmlImage img = FindControl(whichButton) as HtmlImage;
      img.Src = "Images/" + whichButton + "Button_selected.jpg";
    }
}
