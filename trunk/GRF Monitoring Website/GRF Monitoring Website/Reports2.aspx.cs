﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;
using System.Text;

public partial class Reports2 : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
      ((GarciaWide)Master).selectNavButton("Reports");
    }
}