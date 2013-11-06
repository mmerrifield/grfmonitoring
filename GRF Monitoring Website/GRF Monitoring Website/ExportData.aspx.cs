using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Telerik.Web.UI;

public partial class ExportData : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            Master.selectNavButton("data");
            adminSites.Visible = Page.User.IsInRole("Admin");
        }
    }

  /*
    private void addNullToDropdown()
    {
        RadComboBoxItem tem = new RadComboBoxItem("", "");
        cboSites.Items.Insert(0, tem);
    }

    protected void updateSites(object sender, EventArgs e)
    {
        if (cboSeason.SelectedValue == "")
            return;

        string selectedYear = cboSeason.SelectedValue;

        IEnumerable<GarciaSite> filteredSites = from s in GarciaSite.getSites()
                                                where s.waterYears.Contains(selectedYear)
                                                || s.airYears.Contains(selectedYear)
                                                select s;

        // remember previously selected site and try to reselect it if it still exists
        string selectedSite = cboSites.SelectedValue;

        cboSites.Items.Clear();
        cboSites.DataSource = filteredSites;
        cboSites.DataBind();

        addNullToDropdown();

        try
        {
            cboSites.SelectedValue = selectedSite;
        }
        catch (Exception ex)
        {
            cboSites.SelectedIndex = 0;
        }

        rdpDateFrom.SelectedDate = null;
        rdpDateTo.SelectedDate = null;
        calculateDateRange();
    }

    protected void cboSites_SelectedIndexChanged(object sender, EventArgs e)
    {
        calculateDateRange();
    }

    protected void cboType_SelectedIndexChanged(object sender, EventArgs e)
    {
        calculateDateRange();
    }

    protected void calculateDateRange()
    {
        if (cboSeason.SelectedValue == "" || cboSites.SelectedValue == "")
            return;

        string siteID = cboSites.SelectedValue;
        GarciaSite site = GarciaSite.getSite(siteID);

        string sensorType = cboType.SelectedValue;
        Tuple<DateTime?, DateTime?> dateRange = null;

        if (sensorType == "Water")
        {
            dateRange = site.getHoboDateRangeByYear(cboSeason.SelectedValue, "Water");
        }
        else
        {
            Tuple<DateTime?, DateTime?> dateRangeAir = site.getHoboDateRangeByYear(cboSeason.SelectedValue, "Air");
            Tuple<DateTime?, DateTime?> dateRangeAirHumidity = site.getHoboDateRangeByYear(cboSeason.SelectedValue, "Air_Humidity");
            
            DateTime? fromAir = dateRangeAir.Item1;
            DateTime? toAir = dateRangeAir.Item2;
            DateTime? fromHum = dateRangeAirHumidity.Item1;
            DateTime? toHum = dateRangeAirHumidity.Item2;

            DateTime? fromFinal = null, toFinal = null;

            if (fromAir == null && fromHum != null)
                fromFinal = fromHum;
            else if (fromAir != null && fromHum == null)
                fromFinal = fromAir;

            if (toAir == null && toHum != null)
                toFinal = toHum;
            else if (toAir != null && toHum == null)
                toFinal = toAir;

            if (fromAir != null && fromHum != null)
                fromFinal = (fromAir < fromHum ? fromAir : fromHum);

            if (toAir != null && toHum != null)
                toFinal = (toAir > toHum ? toAir : toHum);

            dateRange = new Tuple<DateTime?, DateTime?>(fromFinal, toFinal);
        }

        rdpDateFrom.SelectedDate = null;
        rdpDateTo.SelectedDate = null;

        if (dateRange.Item1 != null)
        {
            rdpDateFrom.MinDate = (DateTime)dateRange.Item1;
            rdpDateTo.MinDate = (DateTime)dateRange.Item1;
        }
        else
        {
            rdpDateFrom.MinDate = new DateTime(1994, 1, 1);
            rdpDateTo.MinDate = new DateTime(1994, 1, 1);
        }

        if (dateRange.Item2 != null)
        {
            rdpDateFrom.MaxDate = (DateTime)dateRange.Item2;
            rdpDateTo.MaxDate = (DateTime)dateRange.Item2;
        }
        else
        {
            rdpDateFrom.MaxDate = new DateTime(2020, 12, 31);
            rdpDateTo.MaxDate = new DateTime(2020, 12, 31);
        }

        if (dateRange.Item1 == null && dateRange.Item2 == null)
        {
            Master.displayAlert("No HOBO data available for that sensor type.");
        }
        else
        {
            rdpDateFrom.SelectedDate = dateRange.Item1;
            rdpDateTo.SelectedDate = dateRange.Item2;
        }

    }

    protected void btnExport_Click(object sender, EventArgs e)
    {
        if (cboSites.SelectedValue == "")
        {
            Master.displayAlert("Please select a Site");
            return;
        }

        if (cboSeason.SelectedValue == "")
        {
            Master.displayAlert("Please select a Season");
            return;
        }

        if (rdpDateFrom.SelectedDate == null)
        {
            Master.displayAlert("Please select a start date");
            return;
        }

        if (rdpDateTo.SelectedDate == null)
        {
            Master.displayAlert("Please select an end date");
            return;
        }

        DateTime fromDate = (DateTime)rdpDateFrom.SelectedDate;
        DateTime toDate = (DateTime)rdpDateTo.SelectedDate;
        toDate = toDate.AddDays(1); // used to make sure whole day is included
        string siteID = cboSites.SelectedValue;
        string siteName = cboSites.SelectedItem.Text;
        string sensorType = cboType.SelectedValue;

        // Todo: pull this DB logic out of form and put into a HOBO class

        GarciaDataContext db = new GarciaDataContext();

        var results = from h in db.HOBOs
                      join s in db.SiteXHoboRows on h.HOBO_ID equals s.HOBO_ID
                      where s.SITE_ID == siteID
                      && h._DateTime >= fromDate
                      && h._DateTime < toDate
                      && s.TYPE == sensorType
                      && s.YEAR_ == fromDate.Year.ToString()
                      select new { h.ID, h.HOBO_ID, siteName, h._DateTime, h.Temp, h.RH, h.DewPoint, h.AbsHumidity, h.DateUploaded, h.UploadedBy };

        foreach (var row in results)
        {
            double? abh = row.AbsHumidity;
        }

        gvHoboData.DataSource = results;
        gvHoboData.DataBind();

        if (sensorType == "Air")
        {
            gvHoboData.Columns[5].Visible = true;
            gvHoboData.Columns[6].Visible = true;
            gvHoboData.Columns[7].Visible = true;
        }
        else
        {
            gvHoboData.Columns[5].Visible = false;
            gvHoboData.Columns[6].Visible = false;
            gvHoboData.Columns[7].Visible = false;

        }

        if (cboExportTo.SelectedValue == "Excel")
        {
            Response.Clear();
            Response.Buffer = true;

            string strFileName = "HoboExport.xls";

            Response.AddHeader("content-disposition", "attachment;filename=" + strFileName);
            Response.ContentType = "application/ms-excel";

            System.IO.StringWriter oStringWriter;
            HtmlTextWriter oHtmlTextWriter;

            oStringWriter = new System.IO.StringWriter();
            oHtmlTextWriter = new System.Web.UI.HtmlTextWriter(oStringWriter);
            gvHoboData.RenderControl(oHtmlTextWriter);

            Response.Output.Write(oStringWriter.ToString());
            Response.Flush();
            Response.End();

        }

    }

    public override void VerifyRenderingInServerForm(Control control)
    {

    }
  */
}