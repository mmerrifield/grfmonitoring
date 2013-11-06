using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Text;
using System.Data;
using System.Data.OleDb;
using System;

namespace GRF
{
  public class FileTransferHandler : IHttpHandler
  {
    private readonly JavaScriptSerializer js = new JavaScriptSerializer();

    private static string FileDirectory = ConfigurationManager.AppSettings["UploadDir"] ?? "Uploads";

    public bool IsReusable { get { return false; } }

    public void ProcessRequest(HttpContext context)
    {
      context.Response.AddHeader("Pragma", "no-cache");
      context.Response.AddHeader("Cache-Control", "private, no-cache");

      HandleMethod(context);
    }

    // Handle request based on method
    private void HandleMethod(HttpContext context)
    {
      switch (context.Request.HttpMethod)
      {
        case "POST":
        case "PUT":
          UploadFile(context);
          break;

        // Only handle post for this case
        case "DELETE":
        case "OPTIONS":
        case "GET":
        default:
          context.Response.ClearHeaders();
          context.Response.StatusCode = 405;
          break;
      }
    }
    
    // Upload file to the server
    protected virtual void UploadFile(HttpContext context)
    {
      //var statuses = new List<FilesStatus>();
      var headers = context.Request.Headers;
      string file = string.Empty;
      if (string.IsNullOrEmpty(headers["X-File-Name"]))
      {
        UploadWholeFile(context);
      }
      else
      {
        UploadPartialFile(headers["X-File-Name"], context);
      }
    }

    // Upload partial file
    private void UploadPartialFile(string fileName, HttpContext context)
    {
      if (context.Request.Files.Count != 1) throw new HttpRequestValidationException("Attempt to upload chunked file containing more than one fragment per request");
      var inputStream = context.Request.Files[0].InputStream;
      var fullName = GetServerPath(context.Server, fileName); 

      using (var fs = new FileStream(fullName, FileMode.Append, FileAccess.Write))
      {
        var buffer = new byte[1024];

        var l = inputStream.Read(buffer, 0, 1024);
        while (l > 0)
        {
          fs.Write(buffer, 0, l);
          l = inputStream.Read(buffer, 0, 1024);
        }
        fs.Flush();
        fs.Close();
      }
    }

    // Upload entire file
    private void UploadWholeFile(HttpContext context)
    {
      if (context.Request.Files.Count > 0)
      {
        var file = context.Request.Files[0];
        file.SaveAs(GetServerPath(context.Server, file.FileName));
      }
    }

    protected string GetServerPath(HttpServerUtility server, string file)
    {
      return System.IO.Path.Combine(server.MapPath(FileDirectory), file);
    }

    protected void WriteJsonIframeSafe(HttpContext context, string msg)
    {
      context.Response.AddHeader("Vary", "Accept");
      try
      {
        if (context.Request["HTTP_ACCEPT"].Contains("application/json"))
          context.Response.ContentType = "application/json";
        else
          context.Response.ContentType = "text/plain";
      }
      catch
      {
        context.Response.ContentType = "text/plain";
      }
      context.Response.Write(string.IsNullOrEmpty(msg) ? "1" : msg);
    }
  }

  public class DeviceFileTransfer : FileTransferHandler
  {
    protected override void UploadFile(HttpContext context)
    {
      if (context.Request.Files.Count == 1)
      {
        base.UploadFile(context);
        string msg;
        UploadHoboDeviceData(GetServerPath(context.Server, context.Request.Files[0].FileName), out msg);
        WriteJsonIframeSafe(context, msg);
      }
      else
        WriteJsonIframeSafe(context, "No file reached the server");
    }

    private bool UploadHoboDeviceData(string fileName, out string msg)
    {
      msg = string.Empty;
      List<SiteHobo> hobos = new List<SiteHobo>();
      int errCt = 0;

      // Read the data in from our Excel workbook.
      using (OleDbConnection cnxn = new OleDbConnection())
      {
        cnxn.ConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + fileName + ";Extended Properties=\"Excel 12.0 Xml;HDR=YES\";";
        cnxn.Open();
        bool chked = false;

        using (OleDbCommand cmd = new OleDbCommand("SELECT * FROM [Sheet1$]", cnxn))
        {
          using (OleDbDataReader reader = cmd.ExecuteReader())
          {
            while (reader.Read())
            {
              // Se if this is in-fact a site-hobo data table.
              if (!chked)
              try
              {
                reader.GetOrdinal("SITE_ID");
                reader.GetOrdinal("TYPE");
                chked = true;
              }
              catch
              {
                msg = "File not in correct format";
                return false;
              }
              try
              {
                hobos.Add(new SiteHobo
                {
                  SITE_ID = reader.GetValue(0).ToString(),
                  HOBO_ID = reader.GetValue(1).ToString(),
                  YEAR_ = reader.GetValue(2).ToString(),
                  TYPE = reader.GetValue(3).ToString(),
                  CONTRIBUTOR = reader.GetValue(4).ToString(),
                  COMMENTS = reader.FieldCount >= 6 ? reader.GetValue(5).ToString() : string.Empty
                });
              }
              catch
              {
                errCt++;
              }
            }
          }
        }
      }

      // Now, add the site hobos back into the database 
      using (var context = new GarciaDataContext())
      {
        int procCt = 0;
        int loadCt = 0;

        foreach (SiteHobo sh in hobos)
        {
          procCt++;
          try
          {
            SiteHobo existingSH = context.SiteHobos.FirstOrDefault(s => s.SITE_ID == sh.SITE_ID && s.HOBO_ID == sh.HOBO_ID);
            if (existingSH == null)
            {
              context.SiteHobos.InsertOnSubmit(sh);
              loadCt++;
            }
          }
          catch (Exception ex)
          {
            msg = ex.Message;
            return true;
          }
        }
        try
        {
          context.SubmitChanges();
        }
        catch (Exception ex)
        {
          msg = ex.Message;
          return true;
        }
        //if (errCt > 0)
        //("<span style='color:red'>ERROR: {0} records could not be successfully retrieved and will be skipped.</span><br/>", errCt);
        msg = string.Format("Loaded {0} of {1} Site Hobo devices in the file<br/>", loadCt, procCt);
        return true;
      }
    }
  }

  /// <summary>
  /// Transfer handler that writes the Hobo data
  /// </summary>
  public class HoboDataFileTransfer : FileTransferHandler
  {
    protected override void UploadFile(HttpContext context)
    {
      if (context.Request.Files.Count == 1)
      {
        base.UploadFile(context);
        string msg;
        UploadHoboData(context, GetServerPath(context.Server, context.Request.Files[0].FileName), out msg);
        WriteJsonIframeSafe(context, msg);
      }
      else
        WriteJsonIframeSafe(context, "No file reached the server");
    }
    /// <summary>
    /// Writes rows to the HOBO table, using a spreadsheet as a data source
    /// </summary>
    private void UploadHoboData(HttpContext http, string fileName, out string msg)
    {
      msg = string.Empty;
      try
      {
        // first we pull the spreadsheet data into a dataTable
        DataTable dt = null;
        using (OleDbConnection cnxn = new OleDbConnection())
        {
          //cnxn.ConnectionString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + fileName + ";Extended Properties=\"Excel 8.0;HDR=Yes;IMEX=1\""; // old Excel format
          cnxn.ConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + fileName + ";Extended Properties=\"Excel 12.0 Xml;HDR=YES\";";
          cnxn.Open();

          using (OleDbCommand cmd = new OleDbCommand("SELECT * FROM [Sheet1$]", cnxn))
          {
            using (OleDbDataAdapter da = new OleDbDataAdapter(cmd))
            {
              dt = new DataTable("HOBO");
              da.Fill(dt);
            }
          }

          var cols = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName.ToLower()).ToList();
          if (!cols.Contains("hobo_id") && !cols.Contains("_datetime") && !cols.Contains("temp")
            && !cols.Contains("dewpoint") && !cols.Contains("rh") && !cols.Contains("abshumidity"))
          {
            msg = "File is not a HOBO data file";
            return;
          }
        }
        int recordCount = dt.Rows.Count;

        List<HoboRecord> hoboRecords = new List<HoboRecord>();
        string hoboID = string.Empty;
        string sensorType = string.Empty;
        DateTime startDate;
        DateTime endDate;
        DateTime newStartDate;
        DateTime newEndDate;

        using (DSTableAdapters.HOBOTableAdapter daHobo = new DSTableAdapters.HOBOTableAdapter())
        {

          // STEP 1: Upload HOBO data

          // put Excel data into a list of HoboRecords
          foreach (DataRow dr in dt.Rows)
          {
            if (dr["HOBO_ID"] != DBNull.Value)
            {
              HoboRecord hr = new HoboRecord(dr);
              hoboRecords.Add(hr);
            }
          }

          // get start date and end date for this collection of Hobo records
          startDate = (from hr in hoboRecords
                       orderby hr.datetime
                       select hr).First().datetime;

          endDate = (from hr in hoboRecords
                     orderby hr.datetime descending
                     select hr).First().datetime;

          hoboID = hoboRecords.First().hoboID;

          // how do we know if it's air or air_humidity?
          sensorType = hoboRecords.First().dewPoint == null ? "Water" : "Air";

          IEnumerable<string> hoboIds = from h in hoboRecords
                                        select h.hoboID;

          // assert that there is only one hoboID in this spreadsheet
          if (hoboIds.Distinct().Count() > 1)
          {
            msg = "<span style='font-color:red'>You cannot upload data for more than 1 HOBO unit in a single spreadsheet.</span>";
            return;
          }

          // delete pre-existing hobo data for this period
          newStartDate = new DateTime(startDate.Year, 1, 1);
          newEndDate = new DateTime(startDate.Year, 12, 31);
          daHobo.deleteHoboData(hoboID, newStartDate, newEndDate);

          int currentRow = 0;

          foreach (HoboRecord hr in hoboRecords)
          {
            daHobo.insertRow(hr.hoboID, hr.datetime, hr.temp, hr.dewPoint, hr.absHumidity, hr.relHumidity, DateTime.Now, http.User.Identity.Name);
            currentRow++;
          }

          // don't do this for air
          if (sensorType == "Air")
          {
            msg = "Importing HOBO data.  No MWAT or MWMT data were created because data type is 'Air'.";
            return;
          };
        }

        // STEP 2: Generate Daily Stats (query 10)
        IEnumerable<DailyStat> ieDailyStats = from h in hoboRecords
                                              group h by new { hoboid = h.hoboID, date = h.datetime.Date }
                                                into myGroup
                                                orderby myGroup.Key.date
                                                where myGroup.Count() > 0

                                                select new DailyStat
                                                {
                                                  hoboID = myGroup.Key.hoboid,
                                                  date = myGroup.Key.date,
                                                  tAvg = myGroup.Average(i => (double)i.temp),
                                                  tMax = myGroup.Max(i => (double)i.temp),
                                                  measurementType = "Water",
                                                  year = myGroup.Key.date.Year.ToString()
                                                };

        List<DailyStat> dailyStats = ieDailyStats.ToList();
        int n = dailyStats.Count;

        // STEP 3: Generate Moving Average of tAvg (query 20)
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
            stat.movAvgTAvg = 0;
          }
          else
          {
            double summ = dailyStats[i - 6].tAvg + dailyStats[i - 5].tAvg + dailyStats[i - 4].tAvg + dailyStats[i - 3].tAvg + dailyStats[i - 2].tAvg + dailyStats[i - 1].tAvg + stat.tAvg;
            stat.movAvgTAvg = summ / 7;
          }
        }


        // STEP 4: Generate Moving Average of tMax (query 21)
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
        daMWMTMax.insertMWMTMaxRow(year, hoboID, drSite.SITE_NAME, "Water", maxMovAvgTMax.ToString(), numberOfDaysMwmtThreshholdExceeded, percentMWMT, drSiteXHobo.COMMENTS, drSiteXHobo.SITE_ID);
        daMWMTMax.Dispose();

        // STEP 8.5: delete any existing finalMWAT and finalMWMT data for this hobo in this date range
        DSTableAdapters.FinalMWATTableAdapter daFinalMWAT = new DSTableAdapters.FinalMWATTableAdapter();
        daFinalMWAT.deleteFinalMWATData(hoboID, newStartDate, newEndDate);

        DSTableAdapters.FinalMWMTTableAdapter daFinalMWMT = new DSTableAdapters.FinalMWMTTableAdapter();
        daFinalMWMT.deleteFinalMWMTData(hoboID, newStartDate, newEndDate);

        // STEP 9: write FinalMWAT and FinalMWMT rows (Qureies 70 & 71)
        int j = 0;
        foreach (DailyStat stat in dailyStats)
        {
          daFinalMWAT.insertFinalMWATRow(drSite.SITE_NAME, "Water", hoboID, stat.date, stat.tAvg, stat.movAvgTAvg, "", 16.7M, year.ToString(), maxMovAvgTAvg, drSite.Site_ID);
          daFinalMWMT.insertFinalMWMTRow(drSite.SITE_NAME, "Water", hoboID, stat.date, stat.tMax, stat.movAvgTMax, "", 18M, year.ToString(), maxMovAvgTMax, drSite.Site_ID);
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
      }
      catch (Exception ex)
      {
        msg = string.Format("<span style='font-color:red'>Error writing {0} to database: {1}</span><br/>", fileName, ex.Message);
      }
      msg = "Completed import of HOBO data";
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
}
