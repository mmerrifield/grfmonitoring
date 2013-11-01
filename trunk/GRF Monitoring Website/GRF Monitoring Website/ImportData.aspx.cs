using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.OleDb;
using Telerik.Web.UI;
using Telerik.Web.UI.Upload;

public partial class ImportData : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

        if (!IsPostBack)
        {
            Master.selectNavButton("data");
            RadProgressArea1.Localization.Uploaded = "Total Progress";
            RadProgressArea1.Localization.UploadedFiles = "Progress";
            RadProgressArea1.Localization.CurrentFileName = "Custom progress in action: ";

            if (Page.User.IsInRole("Admin") == false)
                hlManageSites.Visible = false;
            else
                hlManageSites.Visible = true;
        }
    }

    protected void btnUpload_Click(object sender, EventArgs e)
    {
        string filename, fullFileName = "";

        if (FileUpload1.HasFile)
        {
            filename = FileUpload1.FileName;
            fullFileName = Server.MapPath("Uploads") + "\\" + filename;
            string extension = filename.Substring(filename.Length - 4, 4).ToLower();

            if (extension != ".xls" && extension != "xlsx")
            {
                lblInstructions.Text = "Only Excel spreadsheets can be processed.  Please upload a different file.";
                lblInstructions.ForeColor = System.Drawing.Color.Red;
                lblInstructions.Font.Bold = true;
                return;
            }
            else
            {
                try
                {
                    FileUpload1.SaveAs(fullFileName);
                    lblInstructions.Text = "File successfully uploaded";

                }
                catch (Exception ex)
                {
                    lblInstructions.Text = "Error uploading file: " + ex.Message;
                    lblInstructions.ForeColor = System.Drawing.Color.Black;
                    lblInstructions.Font.Bold = false;
                    return;
                }

            }

            uploadHoboData(fullFileName);

        }
        else
        {
            lblInstructions.Text = "Please select a file for upload.";
            lblInstructions.ForeColor = System.Drawing.Color.Red;
            lblInstructions.Font.Bold = true;
            return;
        }

    }


    /// <summary>
    /// Writes rows to the HOBO table, using a spreadsheet as a data source
    /// </summary>
    private void uploadHoboData(string fileName)
    {
        RadProgressContext progress = RadProgressContext.Current;
        progress.Speed = "N/A";
        progress.PrimaryTotal = 1;
        progress.PrimaryValue = 1;
        progress.PrimaryPercent = 100;

        // first we pull the spreadsheet data into a dataTable
        OleDbConnection cnxn = new OleDbConnection();
        //cnxn.ConnectionString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + fileName + ";Extended Properties=\"Excel 8.0;HDR=Yes;IMEX=1\""; // old Excel format
        cnxn.ConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + fileName + ";Extended Properties=\"Excel 12.0 Xml;HDR=YES\";";
        cnxn.Open();

        OleDbCommand cmd = new OleDbCommand("SELECT * FROM [Sheet1$]", cnxn);
        OleDbDataAdapter da = new OleDbDataAdapter(cmd);
        DataTable dt = new DataTable("HOBO");
        da.Fill(dt);

        cnxn.Close();
        da.Dispose();
        cmd.Dispose();
        cnxn.Dispose();

        int recordCount = dt.Rows.Count;

        DSTableAdapters.HOBOTableAdapter daHobo = new DSTableAdapters.HOBOTableAdapter();

        // STEP 1: Upload HOBO data
        progress.CurrentOperationText = "Uploading HOBO data";
        progress.PrimaryTotal = 5;    
        progress.PrimaryPercent = 0;
        progress.SecondaryTotal = recordCount;

        // put Excel data into a list of HoboRecords
        List<HoboRecord> hoboRecords = new List<HoboRecord>();
        foreach (DataRow dr in dt.Rows)
        {
            if (dr["HOBO_ID"] != DBNull.Value)
            {
                HoboRecord hr = new HoboRecord(dr);
                hoboRecords.Add(hr);
            }
        }

        // get start date and end date for this collection of Hobo records
        DateTime startDate = (from hr in hoboRecords
                              orderby hr.datetime
                              select hr).First().datetime;

        DateTime endDate = (from hr in hoboRecords
                            orderby hr.datetime descending
                            select hr).First().datetime;

        string hoboID = hoboRecords.First().hoboID;
        
        // how do we know if it's air or air_humidity?
        string sensorType = (hoboRecords.First().dewPoint == null ? "Water" : "Air");

        IEnumerable<string> hoboIds = from h in hoboRecords
                                      select h.hoboID;

        // assert that there is only one hoboID in this spreadsheet
        if (hoboIds.Distinct().Count() > 1)
        {
            throw new Exception("You cannot upload data for more than 1 HOBO unit in a single spreadsheet.");
        }

        // delete pre-existing hobo data for this period
        DateTime newStartDate = new DateTime(startDate.Year, 1, 1);
        DateTime newEndDate = new DateTime(startDate.Year, 12, 31);
        daHobo.deleteHoboData(hoboID, newStartDate, newEndDate);

        int currentRow = 0;

        foreach (HoboRecord hr in hoboRecords)
        {
            daHobo.insertRow(hr.hoboID, hr.datetime, hr.temp, hr.dewPoint, hr.absHumidity, hr.relHumidity, DateTime.Now, Page.User.Identity.Name);
            progress.PrimaryPercent = (int)((currentRow * 80) / recordCount);
            progress.SecondaryPercent = (int)((currentRow * 100) / recordCount);
            currentRow++;
        }

        daHobo.Dispose();

        // don't do this for air
        if (sensorType == "Air")
        {
            Master.displayAlert("Done importing HOBO data.  No MWAT or MWMT data were created because data type is 'Air'.");
            return;
        };      

        // STEP 2: Generate Daily Stats (query 10)
        progress.CurrentOperationText = "Generating Daily Stats";

        IEnumerable<DailyStat> ieDailyStats = from h in hoboRecords
                      group h by new  { hoboid = h.hoboID, date = h.datetime.Date}
                          into myGroup
                          orderby myGroup.Key.date
                          where myGroup.Count() > 0
                          
                          select new DailyStat { hoboID = myGroup.Key.hoboid, 
                                                 date = myGroup.Key.date,
                                                 tAvg = myGroup.Average(i => (double)i.temp), 
                                                 tMax = myGroup.Max(i => (double)i.temp), 
                                                 measurementType = "Water", year = myGroup.Key.date.Year.ToString()
                                                 };
        
        List<DailyStat> dailyStats = ieDailyStats.ToList();
        int n = dailyStats.Count;

        // STEP 3: Generate Moving Average of tAvg (query 20)
        progress.CurrentOperationText = "Generating MWAT Data";
        progress.SecondaryTotal = n;
        progress.SecondaryPercent = 0;
        
        for (int i = 6; i < n; i++)
        {
            DailyStat stat = dailyStats[i];
            DateTime dayInQuestion = stat.date;

            // make sure we have all 7 dates populated
            if (   dailyStats[i - 6].date != dayInQuestion.AddDays(-6)
                || dailyStats[i - 5].date != dayInQuestion.AddDays(-5)
                || dailyStats[i - 4].date != dayInQuestion.AddDays(-4)
                || dailyStats[i - 3].date != dayInQuestion.AddDays(-3)
                || dailyStats[i - 2].date != dayInQuestion.AddDays(-2)
                || dailyStats[i - 1].date != dayInQuestion.AddDays(-1))
            {
                stat.movAvgTAvg = 0;
            }
            else
            {
                double summ = dailyStats[i - 6].tAvg + dailyStats[i - 5].tAvg + dailyStats[i - 4].tAvg + dailyStats[i - 3].tAvg + dailyStats[i - 2].tAvg + dailyStats[i - 1].tAvg + stat.tAvg;
                stat.movAvgTAvg = summ / 7;
            }

            progress.PrimaryPercent = 80 + (int)((i * 5) / n);
            progress.SecondaryPercent = (int)((i * 100) / n);
        }


        // STEP 4: Generate Moving Average of tMax (query 21)
        progress.CurrentOperationText = "Generating MWMT Data";
        progress.SecondaryTotal = n;
        progress.SecondaryPercent = 0;

        for (int i = 6; i < n; i++)
        {
            DailyStat stat = dailyStats[i];
            DateTime dayInQuestion = stat.date;

            // make sure we have all 7 dates populated
            if (dailyStats[i - 6].date != dayInQuestion.AddDays(-6)
                || dailyStats[i - 5].date != dayInQuestion.AddDays(-5)
                || dailyStats[i - 4].date != dayInQuestion.AddDays(-4)
                || dailyStats[i - 3].date != dayInQuestion.AddDays(-3)
                || dailyStats[i - 2].date != dayInQuestion.AddDays(-2)
                || dailyStats[i - 1].date != dayInQuestion.AddDays(-1))
            {
                stat.movAvgTMax = 0;
            }
            else
            {
                double summ = dailyStats[i - 6].tMax + dailyStats[i - 5].tMax + dailyStats[i - 4].tMax + dailyStats[i - 3].tMax + dailyStats[i - 2].tMax + dailyStats[i - 1].tMax + stat.tMax;
                stat.movAvgTMax = summ / 7;
            }

            progress.PrimaryPercent = 85 + (int)((i * 5) / n);
            progress.SecondaryPercent = (int)((i * 100) / n);
        }

        // STEP 5: get the max movAvgTavg and max movAvgTMax (queries 30 and 31, respectively)
        double maxMovAvgTAvg = (from s in dailyStats
                                orderby s.movAvgTAvg descending
                                select s).First().movAvgTAvg;

        double maxMovAvgTMax = (from s in dailyStats
                                orderby s.movAvgTMax descending
                                select s).First().movAvgTMax;

        // STEP 6: query 40 and 41 just count the number of days for a particular HOBO unit (and site) in the current season.  
        // already done.  It's n

        // Step 7: Queries 50 and 51 count the number of days the movAvgTAvg (mwat.movAvg) and movAvgTMax(mwmt.movAvg) exceed a threshold
        int numberOfDaysMwatThreshholdExceeded = (from s in dailyStats
                                                where s.movAvgTAvg >= 16.7
                                                select s).Count();

        int numberOfDaysMwmtThreshholdExceeded = (from s in dailyStats
                                                  where s.movAvgTMax > 18
                                                  select s).Count();


        // STEP 8: write an MWATMax and MWMTMax row for this data (also delete pre-existing row, if it exists) (qureies 60 & 61)

        // assert that there is already a Site_X_Hobo row for this year, this Hobo unit
        string year = hoboRecords.First().datetime.Year.ToString();

        SiteXHoboRow drSiteXHobo = DB.getSiteHoboRow(hoboID, year, sensorType);

        DS.SiteInfoRow drSite = DB.getSiteInfoRow(drSiteXHobo.SITE_ID);

        DSTableAdapters.MWATMaxTableAdapter daMWATMax = new DSTableAdapters.MWATMaxTableAdapter();
        daMWATMax.deleteMWATMaxRow(year, hoboID);
        int daysForDivision = n - 6;

        double percentWWAT = ((double)numberOfDaysMwatThreshholdExceeded / daysForDivision);
        daMWATMax.insertMWATMaxRow(year, hoboID, drSite.SITE_NAME, "Water", maxMovAvgTAvg.ToString(), numberOfDaysMwatThreshholdExceeded, percentWWAT, drSiteXHobo.COMMENTS, drSiteXHobo.SITE_ID);
        daMWATMax.Dispose();

        DSTableAdapters.MWMTMaxTableAdapter daMWMTMax = new DSTableAdapters.MWMTMaxTableAdapter();
        daMWMTMax.deleteMWMTMaxRow(year, hoboID);
        double percentMWMT = ((double)numberOfDaysMwmtThreshholdExceeded / daysForDivision);
        daMWMTMax.insertMWMTMaxRow(year, hoboID, drSite.SITE_NAME, "Water", maxMovAvgTMax.ToString(), numberOfDaysMwmtThreshholdExceeded, percentMWMT , drSiteXHobo.COMMENTS, drSiteXHobo.SITE_ID);
        daMWMTMax.Dispose();

        // STEP 8.5: delete any existing finalMWAT and finalMWMT data for this hobo in this date range
        DSTableAdapters.FinalMWATTableAdapter daFinalMWAT = new DSTableAdapters.FinalMWATTableAdapter();
        daFinalMWAT.deleteFinalMWATData(hoboID, newStartDate, newEndDate);

        DSTableAdapters.FinalMWMTTableAdapter daFinalMWMT = new DSTableAdapters.FinalMWMTTableAdapter();
        daFinalMWMT.deleteFinalMWMTData(hoboID, newStartDate, newEndDate);

        // STEP 9: write FinalMWAT and FinalMWMT rows (Qureies 70 & 71)
        progress.CurrentOperationText = "Generating Final MWAT and MWMT Data";
        progress.SecondaryTotal = n;
        progress.SecondaryPercent = 0;

        int j = 0;
        foreach (DailyStat stat in dailyStats)
        {
            daFinalMWAT.insertFinalMWATRow(drSite.SITE_NAME, "Water", hoboID, stat.date, stat.tAvg, stat.movAvgTAvg, "", 16.7M, year.ToString(), maxMovAvgTAvg, drSite.Site_ID);
            daFinalMWMT.insertFinalMWMTRow(drSite.SITE_NAME, "Water", hoboID, stat.date, stat.tMax, stat.movAvgTMax, "", 18M, year.ToString(), maxMovAvgTMax, drSite.Site_ID);
            progress.PrimaryPercent = 90 + (int)((j * 10) / n);
            progress.SecondaryPercent = (int)((j * 100) / n);
            j++;
        }

        daFinalMWAT.Dispose();
        daFinalMWMT.Dispose();

        GarciaSite.clearSites();    // forces a refresh
        DB.clearMWATAndMWMTData();

        // adjust dataStartDate and dataEndDate for this site, if necessary
        if (!drSite.IsDataStartDateNull())
        {
            if (drSite.DataStartDate > startDate)
            {
                drSite.DataStartDate = startDate;
                DB.saveSiteInfoRow(drSite);
            }
        }
        else
        {
            drSite.DataStartDate = startDate;
            DB.saveSiteInfoRow(drSite);
        }

        if (!drSite.IsDataEndDateNull())
        {
            if (drSite.DataEndDate < endDate)
            {
                drSite.DataEndDate = endDate;
                DB.saveSiteInfoRow(drSite);
            }
        }
        else
        {
            drSite.DataEndDate = endDate;
            DB.saveSiteInfoRow(drSite);
        }

        Master.displayAlert("Done importing HOBO data.  MWAT and MWMT data were created automatically.");
    }

    private class HoboRecord
    {
        public string hoboID { get; set; }
        public DateTime datetime { get; set; }
        public double? temp { get; set; }
        public double? dewPoint { get; set; }
        public double? absHumidity { get; set; }
        public double? relHumidity { get; set; }

        public HoboRecord(DataRow dr)
        {
            hoboID = dr["HOBO_ID"].ToString();
            datetime = DateTime.Parse(dr["_DateTime"].ToString());

            if (dr["Temp"] == DBNull.Value)
                temp = null;
            else
                temp = (double)dr["Temp"];

            if (dr["DewPoint"] == DBNull.Value || dr["DewPoint"].ToString() == "")
                dewPoint = null;
            else
                dewPoint = (double)dr["DewPoint"];

            if (dr["AbsHumidity"] == DBNull.Value || dr["AbsHumidity"].ToString() == "")
                absHumidity = null;
            else
                absHumidity = (double)dr["AbsHumidity"];

            if (dr["RH"] == DBNull.Value || dr["RH"].ToString() == "")
                relHumidity = null;
            else
                relHumidity = (double)dr["RH"];
        }
    }
    private class DailyStat
    {
        public DateTime date { get; set; }
        public double tAvg { get; set; }
        public double movAvgTAvg { get; set; }
        public double tMax { get; set; }
        public double movAvgTMax { get; set; }
        public string hoboID { get; set; }
        public string measurementType { get; set; }
        public string year { get; set; }
    }
}