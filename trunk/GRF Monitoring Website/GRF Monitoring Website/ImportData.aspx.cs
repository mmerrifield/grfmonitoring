﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.OleDb;
using Telerik.Web.UI;
using Telerik.Web.UI.Upload;
using System.Text;

public partial class ImportData : System.Web.UI.Page
{
  protected void Page_Load(object sender, EventArgs e)
  {

    if (!IsPostBack)
    {
      adminSites.Visible = Page.User.IsInRole("Admin");
    }
  }
}