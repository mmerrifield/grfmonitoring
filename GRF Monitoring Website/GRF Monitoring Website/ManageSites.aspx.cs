using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Telerik.Web.UI;

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
      ((Garcia)Master).selectNavButton("data");
        if (Page.User.IsInRole("Admin") == false)
            Response.Redirect("NotAuthorized.aspx");
      /*
        if (!IsPostBack)
        {
            bindSites();
        }*/
    }

  /*
    private void bindSites()
    {
        IEnumerable<GarciaSite> sites = GarciaSite.getSites();

        if (currentSortExpression == "")
            currentSortExpression = "siteID";

        switch (currentSortExpression)
        {
            case "siteID":
                if (currentSortDirection == SortDirection.Ascending)
                    sites = from s in sites orderby s.siteID ascending select s;
                else
                    sites = from s in sites orderby s.siteID descending select s;
                break;

            case "siteName":
                if (currentSortDirection == SortDirection.Ascending)
                    sites = from s in sites orderby s.siteName ascending select s;
                else
                    sites = from s in sites orderby s.siteName descending select s;
                break;

            case "directions":
                if (currentSortDirection == SortDirection.Ascending)
                    sites = from s in sites orderby s.directions ascending select s;
                else
                    sites = from s in sites orderby s.directions descending select s;
                break;

            case "dataStartDate":
                if (currentSortDirection == SortDirection.Ascending)
                    sites = from s in sites orderby s.dataStartDate ascending select s;
                else
                    sites = from s in sites orderby s.dataStartDate descending select s;
                break;

            case "dataEndDate":
                if (currentSortDirection == SortDirection.Ascending)
                    sites = from s in sites orderby s.dataEndDate ascending select s;
                else
                    sites = from s in sites orderby s.dataEndDate descending select s;
                break;
                
        }


        gvSites.DataSource = sites.ToList();
        gvSites.DataBind();
    }

    protected void gvSites_Sorting(object sender, GridViewSortEventArgs e)
    {
        string oldSortExpression = currentSortExpression;
        if (oldSortExpression != e.SortExpression)
        {
            currentSortDirection = SortDirection.Ascending; 
        }
        else
        {
            if (currentSortDirection == SortDirection.Ascending)
                currentSortDirection = SortDirection.Descending;
            else
                currentSortDirection = SortDirection.Ascending;
        }

        currentSortExpression = e.SortExpression;

        bindSites();
    }


    protected void gvSites_RowEditing(object sender, GridViewEditEventArgs e)
    {
        gvSites.EditIndex = e.NewEditIndex;
        bindSites();
        btnNewSite.Enabled = false;
    }

    protected void gvSites_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
    {
        gvSites.EditIndex = -1;
        btnNewSite.Enabled = true;

        // if it's a cancellation of an insert (site is blank), then delete the site
        int id = (int)gvSites.DataKeys[e.RowIndex].Value;
        GarciaSite site = GarciaSite.getSite(id);

        if (site.siteID == "" && site.siteName == "* New Site *")
            site.delete();

        bindSites();
    }

    protected void gvSites_RowUpdating(object sender, GridViewUpdateEventArgs e)
    {
        GridViewRow gvr = gvSites.Rows[e.RowIndex];
        if (gvr != null)
        {
            string siteID = (gvr.FindControl("tbSiteID") as TextBox).Text;
            string siteName = (gvr.FindControl("tbSiteName") as TextBox).Text;
            string directions = (gvr.FindControl("tbDirections") as TextBox).Text;
            System.Drawing.Color color = (gvr.FindControl("rcpColor") as RadColorPicker).SelectedColor;
            string theColor = color.Name;
            if (theColor == "0")
                theColor = "00000000";
            theColor = "#" + theColor.Substring(2);
            DateTime? dataStartDate = (gvr.FindControl("rdpStartDate") as RadDatePicker).SelectedDate;
            DateTime? dataEndDate = (gvr.FindControl("rdpEndDate") as RadDatePicker).SelectedDate;

            int id = (int)gvSites.DataKeys[e.RowIndex].Value;
            GarciaSite site = GarciaSite.getSite(id);
            site.siteID = siteID;
            site.siteName = siteName;
            site.directions = directions;
            site.color = theColor;

            site.dataStartDate = dataStartDate;
            site.dataEndDate = dataEndDate;

            site.save();

            gvSites.EditIndex = -1;
            bindSites();
            btnNewSite.Enabled = true;

        }
    }

    protected void gvSites_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
            int id = (int)gvSites.DataKeys[e.RowIndex].Value;
            GarciaSite site = GarciaSite.getSite(id);
            site.delete();
            bindSites();
    }

    protected void btnNewSite_Click(object sender, EventArgs e)
    {
        GarciaSite site = GarciaSite.newSite("", "* New Site *");

        gvSites.EditIndex = 0;
        bindSites();
        btnNewSite.Enabled = false;
    }*/
}