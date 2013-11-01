﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Telerik.Web.UI;

public partial class PrepareReportData : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            // populate Year dropdown
            int currentYear = DateTime.Today.Year;

            for (int i = 2007; i <= currentYear; i++)
            {
                cboYear.Items.Add(new RadComboBoxItem(i.ToString()));
            }

            cboYear.Focus();
        }
    }

    protected void cboYear_SelectedIndexChanged(object sender, EventArgs e)
    {
        // from the selected year, attempt to get the min/max daily Stats dates
        if (cboYear.SelectedItem.Text == "")
        {
            rdpStartDate.SelectedDate = null;
            rdpEndDate.SelectedDate = null;
            btnProcess.Enabled = false;
        }
        else
        {
            int year = int.Parse(cboYear.SelectedItem.Text);
            rdpStartDate.SelectedDate = DB.getHoboStartDateByYear(year);
            rdpEndDate.SelectedDate = DB.getHoboEndDateByYear(year);

            if (rdpStartDate.SelectedDate == null && rdpEndDate.SelectedDate == null)
            {
                hfMessage.Value = "No HOBO data exist for the selected year";
                btnProcess.Enabled = false;
            }
            else
            {
                btnProcess.Enabled = true;
            }
        }
    }

    protected void btnProcess_Click(object sender, EventArgs e)
    {
        if (!Page.IsValid || rdpStartDate.SelectedDate == null || rdpEndDate.SelectedDate == null)
        {
            hfMessage.Value = "Please provide a valid start date and end date";
            return;
        }

        // get daily stats data for the selected date range
        
    }

}