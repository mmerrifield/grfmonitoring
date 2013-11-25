using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
//using Telerik.Web.UI;

public partial class ManageSites : System.Web.UI.Page
{
    #region Properties

    private string currentSortExpression 
    {
        get
        {
            return (string)ViewState["currentSortExpression"];
        }
        set
        {
            ViewState["currentSortExpression"] = value;
        }
    }

    private SortDirection currentSortDirection
    {
        get
        {
            return (SortDirection)ViewState["currentSortDirection"];
        }
        set
        {
            ViewState["currentSortDirection"] = value;
        }
    }

    #endregion

    protected void Page_Load(object sender, EventArgs e)
    {
    }
}