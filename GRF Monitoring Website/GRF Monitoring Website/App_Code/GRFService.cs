using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Text;
using System.IO;
using System.Collections.Specialized;
using System.Web;
using System.Web.Script.Serialization;

[ServiceContract(Namespace = "")]
[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
[ServiceBehavior(IncludeExceptionDetailInFaults = true)]
public class GRFService
{
  #region -- Site Management --
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  [OperationContract]
  public bool Admin()
  {
    var isAdmin = HttpContext.Current.User != null && HttpContext.Current.User.IsInRole("Admin");
    return isAdmin;
  }

  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  [OperationContract]
  public bool Auth()
  {
    return HttpContext.Current.User != null;
  }

  /// <summary>
  /// Returns the collection of sites to display in a paged table.
  /// </summary>
  /// <param name="pageIndex"></param>
  /// <param name="pageSize"></param>
  /// <param name="sortIndex"></param>
  /// <param name="sortDirection"></param>
  /// <returns></returns>
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  [OperationContract]
  public JQGridData Sites(int pageIndex, int pageSize, string sortIndex, string sortDirection)
  {
    JQGridData data = new JQGridData();
    using (var context = new GarciaDataContext())
    {
      IEnumerable<SiteInfo> sites = context.SiteInfos;
      //IEnumerable<GarciaSite> sites = GarciaSite.getSites();
      data.records = sites.Count();

      // Order our data
      bool asc = sortDirection.ToLower() == "asc";
      if (sortIndex == "SiteId")
        sites = asc ? sites.OrderBy(s => s.Site_ID) : sites.OrderByDescending(s => s.Site_ID);
      else if (sortIndex == "SiteName")
        sites = asc ? sites.OrderBy(s => s.SITE_NAME) : sites.OrderByDescending(s => s.SITE_NAME);
      else if (sortIndex == "Directions")
        sites = asc ? sites.OrderBy(s => s.Directions) : sites.OrderByDescending(s => s.Directions);
      else if (sortIndex == "DtStart")
        sites = asc ? sites.OrderBy(s => s.DataStartDate) : sites.OrderByDescending(s => s.DataStartDate);
      else if (sortIndex == "DtEnd")
        sites = asc ? sites.OrderBy(s => s.DataEndDate) : sites.OrderByDescending(s => s.DataEndDate);

      foreach (SiteInfo si in sites.Skip((pageIndex - 1) * pageSize).Take(pageSize))
      {
        JQGridData.Row row = new JQGridData.Row();
        row.id = si.OBJECTID.ToString();
        row.cell.Add(si.Site_ID);
        row.cell.Add(si.SITE_NAME);
        row.cell.Add(si.Directions);
        row.cell.Add(si.Color);
        row.cell.Add(si.DataStartDate.HasValue ? si.DataStartDate.Value.ToShortDateString() : string.Empty);
        row.cell.Add(si.DataEndDate.HasValue ? si.DataEndDate.Value.ToShortDateString() : string.Empty);
        row.cell.Add(si.Lat.HasValue ? si.Lat.Value.ToString() : string.Empty);
        row.cell.Add(si.Lng.HasValue ? si.Lng.Value.ToString() : string.Empty);
        data.rows.Add(row);
      }
      data.page = pageIndex;
      data.total = data.records / pageSize;
      if (data.total % pageSize != 0 || data.total == 0)
        data.total++;
    }
    return data;
  }

  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public List<ReportSite> ReportSites(int startMon, int startYr, int endMon, int endYr)
  {
    using (var context = new GarciaDataContext())
    {
      try
      {
        DateTime startDate = new DateTime(startYr, startMon, 1);
        DateTime endDate = new DateTime(endYr, endMon, DateTime.DaysInMonth(endYr, endMon));
        return context.FinalMWATs.Where(s => s.Date <= endDate && s.Date >= startDate)
          .Select(s => new ReportSite { Id = s.SiteID, Name = s.SITE_NAME })
          .Distinct()
          .OrderBy(s => s.Name).ToList();
      }
      catch
      {
        return new List<ReportSite>();
      }
    }
  }

  /// <summary>
  /// Method called when a user add or edits a site definition.
  /// </summary>
  /// <param name="contents"></param>
  /// <returns></returns>
  [OperationContract]
  public string UpdateSite(Stream contents)
  {
    try{
      var formData = ParseContents(contents);
      int id = 0;
      int.TryParse(formData["id"], out id);
      string op = formData["oper"];
      string siteId = formData["SiteId"];
      string siteName = formData["SiteName"];
      string directions = formData["Directions"];
      string color = formData["Color"];
      decimal? lat = null;
      if (!string.IsNullOrEmpty(formData["Lat"]))
        lat = decimal.Parse(formData["Lat"]);
      decimal? lng = null;
      if (!string.IsNullOrEmpty(formData["Lng"]))
        lng = decimal.Parse(formData["Lng"]);
      if (!string.IsNullOrEmpty(color) && color[0] != '#')
        color = "#" + color;
      if (string.IsNullOrEmpty(color))
        color = null;

      using (var context = new GarciaDataContext())
      {
        if (op == "add")
        {
          SiteInfo si = context.SiteInfos.FirstOrDefault(s => s.Site_ID == siteId);
          if (si == null)
          {
            si = new SiteInfo
            {
              Site_ID = siteId,
              SITE_NAME = siteName,
              Directions = directions,
              Color = color,
              Lat = lat,
              Lng = lng
            };
            context.SiteInfos.InsertOnSubmit(si);
            context.SubmitChanges();
          }
          else
            return "Site already exists";
        }
        else if (op == "edit")
        {
          SiteInfo si = context.SiteInfos.FirstOrDefault(s => s.OBJECTID == id);
          if (si != null) 
          {
            si.Directions = directions;
            si.Color = color;
            si.Lat = lat;
            si.Lng = lng;
            context.SubmitChanges();
          }
          else
            return "Unable to save site changes";
        }
        else if (op == "del" && !string.IsNullOrEmpty(siteId))
        {
        }
        return string.Empty;
      }
    }
    catch(Exception ex)
    {
      return ex.Message;
    }
  }

  /// <summary>
  /// Returns the ordered list of Hobos for a given site.
  /// </summary>
  /// <param name="siteId"></param>
  /// <param name="pageIndex"></param>
  /// <param name="pageSize"></param>
  /// <param name="sortIndex"></param>
  /// <param name="sortDirection"></param>
  /// <returns></returns>
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  [OperationContract]
  public JQGridData SiteHobos(string siteId)
  {
    JQGridData data = new JQGridData();
    using (var context = new GarciaDataContext())
    {
      var hobos = context.SiteHobos.Where(h => h.SITE_ID == siteId).OrderByDescending(h => h.YEAR_).ThenBy(h => h.TYPE).ThenBy(h => h.HOBO_ID);
      data.records = hobos.Count();
      foreach (SiteHobo hobo in hobos)
      {
        JQGridData.Row row = new JQGridData.Row();
        row.id = hobo.OBJECTID.ToString();
        row.cell.Add(hobo.HOBO_ID);
        row.cell.Add(hobo.YEAR_);
        row.cell.Add(hobo.TYPE);
        row.cell.Add(hobo.CONTRIBUTOR);
        row.cell.Add(hobo.COMMENTS);
        data.rows.Add(row);
      }
      data.page = 1;
      data.total = data.records;
    }
    return data;
  }

  /// <summary>
  /// Helper method that extracts data from the memory stream into a set of key-value pairs.
  /// </summary>
  /// <param name="contents"></param>
  /// <returns></returns>
  private NameValueCollection ParseContents(Stream contents)
  {
    NameValueCollection form = new NameValueCollection();
    string input = new StreamReader(contents).ReadToEnd();
    string[] prs = input.Split('&');
    foreach (string pr in prs)
    {
      string[] keyval = pr.Split('=');
      form.Add(keyval[0], HttpUtility.UrlDecode(keyval[1]));
    }
    return form;
  }
  #endregion

  #region -- Export Data --
  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public List<string> Years(string type, string site)
  {
    using (var context = new GarciaDataContext())
    {
      if (string.IsNullOrEmpty(type) && string.IsNullOrEmpty(site))
        return context.SiteHobos.Select(h => h.YEAR_).Distinct().OrderBy(y => y).ToList();
      else if (!string.IsNullOrEmpty(type) && string.IsNullOrEmpty(site))
        return context.SiteHobos.Where(h => h.TYPE == type).Select(h => h.YEAR_).Distinct().OrderBy(y => y).ToList();
      else if (!string.IsNullOrEmpty(site) && string.IsNullOrEmpty(type))
        return context.SiteHobos.Where(h => h.SITE_ID == site).Select(h => h.YEAR_).Distinct().OrderBy(y => y).ToList();
      else
        return context.SiteHobos.Where(h => h.TYPE == type && h.SITE_ID == site).Select(h => h.YEAR_).Distinct().OrderBy(y => y).ToList();
    }
  }

  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public List<string> SensorTypes(string year, string site)
  {
    using (var context = new GarciaDataContext())
    {
      if (string.IsNullOrEmpty(year) && string.IsNullOrEmpty(site))
        return context.SiteHobos.Select(h => h.TYPE).Distinct().OrderBy(t => t).ToList();
      else if (!string.IsNullOrEmpty(year) && string.IsNullOrEmpty(site))
        return context.SiteHobos.Where(h => h.YEAR_ == year).Select(h => h.TYPE).Distinct().OrderBy(t => t).ToList();
      else if (!string.IsNullOrEmpty(site) && string.IsNullOrEmpty(year))
        return context.SiteHobos.Where(h => h.SITE_ID == site).Select(h => h.TYPE).Distinct().OrderBy(t => t).ToList();
      else
        return context.SiteHobos.Where(H => H.SITE_ID == site && H.YEAR_ == year).Select(h => h.TYPE).Distinct().OrderBy(t => t).ToList();
    }
  }

  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public List<SiteInfo> AvailSites(string year, string type)
  {
    using (var context = new GarciaDataContext())
    {
      IEnumerable<string> siteIds = null;
      if (string.IsNullOrEmpty(year) && string.IsNullOrEmpty(type))
        siteIds = context.SiteHobos.Select(h => h.SITE_ID).Distinct();
      else if (!string.IsNullOrEmpty(year) && string.IsNullOrEmpty(type))
        siteIds = context.SiteHobos.Where(h => h.YEAR_ == year).Select(h => h.SITE_ID).Distinct();
      else if (!string.IsNullOrEmpty(type) && string.IsNullOrEmpty(year))
        siteIds = context.SiteHobos.Where(h => h.TYPE == type).Select(h => h.SITE_ID).Distinct();
      else
        siteIds = context.SiteHobos.Where(h => h.TYPE == type && h.YEAR_ == year).Select(h => h.SITE_ID).Distinct();
      return context.SiteInfos.Where(si => siteIds.Contains(si.Site_ID)).OrderBy(si => si.SITE_NAME).ToList();
    }
  }

  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public List<string> DateRange(string year, string site)
  {
    using (var context = new GarciaDataContext())
    {
      int currYr = DateTime.Now.Year;
      int.TryParse(year, out currYr);

      if (string.IsNullOrEmpty(year))
      {
        var yrs = context.SiteHobos.Select(s => s.YEAR_).Distinct().OrderBy(y => y).ToList();
        return new List<string>() { string.Format("01-01-{0}", yrs[0]), string.Format("12-31-{0}", yrs[yrs.Count-1]) };
      }
      else if (!string.IsNullOrEmpty(year) && string.IsNullOrEmpty(site))
      {
        var dates = context.HOBOs.Where(h => h._DateTime.HasValue && h._DateTime.Value.Year == currYr).Select(h => h._DateTime).Distinct().OrderBy(d => d).ToList();
        return new List<string>() { dates[0].Value.ToShortDateString(), dates[dates.Count-1].Value.ToShortDateString() };
      }
      else if (!string.IsNullOrEmpty(site) && string.IsNullOrEmpty(year))
      {
        List<string> hoboIds = context.SiteHobos.Where(h => h.SITE_ID == site).Select(h => h.HOBO_ID).ToList();
        if (hoboIds.Count == 0)
          return new List<string>(); // { string.Format("01-01-{0}", currYr), string.Format("01-01-{0}", currYr) };
        var dates = context.HOBOs.Where(h => h._DateTime.HasValue && hoboIds.Contains(h.HOBO_ID)).Select(h => h._DateTime).Distinct().OrderBy(d => d).ToList();
        if (dates.Count == 0)
          return new List<string>(); // { string.Format("01-01-{0}", currYr), string.Format("01-01-{0}", currYr) };
        return new List<string>() { dates[0].Value.ToShortDateString(), dates[dates.Count - 1].Value.ToShortDateString() };
      }
      else
      {
        List<string> hoboIds = context.SiteHobos.Where(h => h.SITE_ID == site && h.YEAR_ == year).Select(h => h.HOBO_ID).ToList();
        if (hoboIds.Count == 0)
          return new List<string>(); // { string.Format("01-01-{0}", currYr), string.Format("01-01-{0}", currYr) };
        var dates = context.HOBOs.Where(h => h._DateTime.HasValue && h._DateTime.Value.Year == currYr && hoboIds.Contains(h.HOBO_ID)).Select(h => h._DateTime).Distinct().OrderBy(d => d).ToList();
        if (dates.Count == 0)
          return new List<string>(); // { string.Format("01-01-{0}", currYr), string.Format("01-01-{0}", currYr) };
        return new List<string>() { dates[0].Value.ToShortDateString(), dates[dates.Count - 1].Value.ToShortDateString() };
      }
    }
  }

  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public Stream DownloadData(string year, string site, string type, string from, string to)
  {
    using (var context = new GarciaDataContext())
    {
      bool isWater = string.Compare(type,"water",true) == 0;
      DateTime fromDate, toDate;
      DateTime.TryParse(from, out fromDate);
      DateTime.TryParse(to, out toDate);
      fromDate = new DateTime(fromDate.Year, fromDate.Month, fromDate.Day, 0, 0, 0);
      toDate = new DateTime(toDate.Year, toDate.Month, toDate.Day, 23, 59, 59);

      var siteInfo = context.SiteInfos.FirstOrDefault(s => s.Site_ID == site);
      var hoboIds = context.SiteHobos.Where(sh => sh.YEAR_ == year && sh.TYPE == type && sh.SITE_ID == site).Select(sh => sh.HOBO_ID).ToList();
      var results = context.HOBOs.Where(h => hoboIds.Contains(h.HOBO_ID) && h._DateTime.HasValue && h._DateTime.Value >= fromDate && h._DateTime.Value <= toDate);

      StringBuilder sb = new StringBuilder();
      sb.Append("<table>");
      if (isWater)
        sb.Append("<tr><td>Id</td><td>Hobo Id</td><td>Site</td><td>Date-Time</td><td>Temp</td><td>Date Uploaded</td><td>Uploaded By</td></tr>");
      else
        sb.Append("<tr><td>Id</td><td>Hobo Id</td><td>Site</td><td>Date-Time</td><td>Temp</td><td>Dew Point</td><td>Abs Humidity</td><td>RH</td><td>Date Uploaded</td><td>Uploaded By</td></tr>");
      foreach (var hobo in results)
      {
        if (isWater)
          sb.AppendFormat("<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td><td>{5}</td><td>{6}</td></tr>",
          hobo.ID.ToString(),
          hobo.HOBO_ID,
          siteInfo != null ? siteInfo.SITE_NAME : string.Empty,
          hobo._DateTime.ToString(),
          hobo.Temp.HasValue ? hobo.Temp.Value.ToString("0.00") : string.Empty,
          hobo.DateUploaded.HasValue ? hobo.DateUploaded.Value.ToString() : string.Empty,
          hobo.UploadedBy);
        else
          sb.AppendFormat("<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td><td>{5}</td><td>{6}</td><td>{7}</td><td>{8}</td><td>{9}</td></tr>",
          hobo.ID.ToString(),
          hobo.HOBO_ID,
          siteInfo != null ? siteInfo.SITE_NAME : string.Empty,
          hobo._DateTime.ToString(),
          hobo.Temp.HasValue ? hobo.Temp.Value.ToString("0.00") : string.Empty,
          hobo.DewPoint.HasValue ? hobo.DewPoint.Value.ToString("0.00") : string.Empty,
          hobo.AbsHumidity.HasValue ? hobo.AbsHumidity.Value.ToString("0.00") : string.Empty,
          hobo.RH.HasValue ? hobo.RH.Value.ToString("0.00") : string.Empty,
          hobo.DateUploaded.HasValue ? hobo.DateUploaded.Value.ToString() : string.Empty,
          hobo.UploadedBy);
      }
      sb.Append("</table>");

      WebOperationContext.Current.OutgoingResponse.ContentType = "application/ms-excel";
      string filename = "filename=HOBOExport.xls";
      WebOperationContext.Current.OutgoingResponse.Headers.Add("Content-Disposition", "attachment; " + filename);

      System.Text.ASCIIEncoding encoding = new ASCIIEncoding();
      Byte[] bytes = encoding.GetBytes(sb.ToString());
      return new MemoryStream(bytes);
    }
  }


  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public HOBOExport SiteExport(string year, string site, string type, string from, string to,
    int pageIndex, int pageSize, string sortIndex, string sortDirection)
  {
    HOBOExport exp = new HOBOExport();
    exp.Data = new JQGridData();
    using (var context = new GarciaDataContext())
    {
      DateTime fromDate, toDate;
      DateTime.TryParse(from, out fromDate);
      DateTime.TryParse(to, out toDate);
      fromDate = new DateTime(fromDate.Year, fromDate.Month, fromDate.Day, 0, 0, 0);
      toDate = new DateTime(toDate.Year, toDate.Month, toDate.Day, 23, 59, 59);

      var siteInfo = context.SiteInfos.FirstOrDefault(s => s.Site_ID == site);
      var hoboIds = context.SiteHobos.Where(sh => sh.YEAR_ == year && sh.TYPE == type && sh.SITE_ID == site).Select(sh => sh.HOBO_ID).ToList();
      var results = context.HOBOs.Where(h => hoboIds.Contains(h.HOBO_ID) && h._DateTime.HasValue && h._DateTime.Value >= fromDate && h._DateTime.Value <= toDate);
      
      // Order the results
      bool asc = sortDirection == "asc";
      if (sortIndex == "ID")
        results = asc ? results.OrderBy(h => h.ID) : results.OrderByDescending(h => h.ID);
      else if (sortIndex == "HoboId")
        results = asc ? results.OrderBy(h => h.HOBO_ID) : results.OrderByDescending(h => h.HOBO_ID);
      else if (sortIndex == "DateTime")
        results = asc ? results.OrderBy(h => h._DateTime) : results.OrderByDescending(h => h._DateTime);
      else if (sortIndex == "Temp")
        results = asc ? results.OrderBy(h => h.Temp) : results.OrderByDescending(h => h.Temp);

      exp.Data.records = results.Count();
      foreach (var hobo in results.Skip((pageIndex-1) * pageSize).Take(pageSize))
      {
        JQGridData.Row row = new JQGridData.Row();
        row.id = hobo.ID.ToString();
        row.cell.Add(hobo.ID.ToString());
        row.cell.Add(hobo.HOBO_ID);
        row.cell.Add(siteInfo != null ? siteInfo.SITE_NAME : string.Empty);
        row.cell.Add(hobo._DateTime.ToString());
        row.cell.Add(hobo.Temp.HasValue ? hobo.Temp.Value.ToString("0.00") : string.Empty);
        row.cell.Add(hobo.DewPoint.HasValue ? hobo.DewPoint.Value.ToString("0.00") : string.Empty);
        row.cell.Add(hobo.AbsHumidity.HasValue ? hobo.AbsHumidity.Value.ToString("0.00") : string.Empty);
        row.cell.Add(hobo.RH.HasValue ? hobo.RH.Value.ToString("0.00") : string.Empty);
        row.cell.Add(hobo.DateUploaded.HasValue ? hobo.DateUploaded.Value.ToString() : string.Empty);
        row.cell.Add(hobo.UploadedBy);
        exp.Data.rows.Add(row);
      }
    }
    exp.Data.page = pageIndex;
    exp.Data.total = exp.Data.records / pageSize;
    if (exp.Data.total % pageSize != 0 || exp.Data.total == 0)
      exp.Data.total++;
    exp.IsWater = string.Compare(type, "water", true) == 0;
    return exp;
  }
  #endregion

  #region -- Reporting Support --
  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public List<ChartSeries> WeeklyMWATData(int startMon, int startYr, int endMon, int endYr, string sites)
  {
    try
    {
      DateTime startDate = new DateTime(startYr, startMon, 1);
      DateTime endDate = new DateTime(endYr, endMon, DateTime.DaysInMonth(endYr,endMon));
      List<ChartSeries> series = new List<ChartSeries>();
      IEnumerable<WeeklyData> datapts = null;
      List<decimal> thresholds = new List<decimal>();

      using (var context = new GarciaDataContext())
      {
        foreach (var id in sites.Split(new string[]{","}, StringSplitOptions.RemoveEmptyEntries))
        {
          datapts = context.FinalMWATs.Where(s => s.SiteID == id && s.Date >= startDate && s.Date <= endDate)
            .Select(s => new WeeklyData { Name = s.SITE_NAME, SiteId = s.SiteID, Date = s.Date.Value, MovAvg = s.movAvg.Value, Threshold = s.threshold.Value }).OrderBy(s => s.Date);
          if (datapts.Count() == 0) continue;
          foreach (decimal thresh in datapts.Select(s => s.Threshold).Distinct())
          {
            if (!thresholds.Contains(thresh))
              thresholds.Add(thresh);
          }
          string color = context.SiteInfos.First(s => s.Site_ID == id).Color;
          series.Add(GetChartSeries(datapts, color));
        }
        AddThresholdLines(series, thresholds);

        return series;
      }
    }
    catch 
    {
      return null;
    }
  }

  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public List<ChartSeries> WeeklyMWMTData(int startMon, int startYr, int endMon, int endYr, string sites)
  {
    try
    {
      DateTime startDate = new DateTime(startYr, startMon, 1);
      DateTime endDate = new DateTime(endYr, endMon, DateTime.DaysInMonth(endYr, endMon));
      List<ChartSeries> series = new List<ChartSeries>();
      IEnumerable<WeeklyData> datapts = null;
      List<decimal> thresholds = new List<decimal>();

      using (var context = new GarciaDataContext())
      {
        foreach (var id in sites.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries))
        {
          datapts = context.FinalMWMTs.Where(s => s.SiteID == id && s.Date >= startDate && s.Date <= endDate)
            .Select(s => new WeeklyData { Name = s.SITE_NAME, SiteId = s.SiteID, Date = s.Date.Value, MovAvg = s.movAvg.Value, Threshold = s.threshold.Value }).OrderBy(s => s.Date);
          if (datapts.Count() == 0) continue;
          foreach (decimal thresh in datapts.Select(s => s.Threshold).Distinct())
          {
            if (!thresholds.Contains(thresh))
              thresholds.Add(thresh);
          }
          string color = context.SiteInfos.First(s => s.Site_ID == id).Color;
          series.Add(GetChartSeries(datapts, color));
        }
        AddThresholdLines(series, thresholds);

        return series;
      }
    }
    catch
    {
      return null;
    }
  }

  private ChartSeries GetChartSeries(IEnumerable<WeeklyData> datapts, string color)
  {
    ChartSeries cs = new ChartSeries();

    cs.name = datapts.First().Name;
    if (!string.IsNullOrEmpty(color))
      cs.color = color;
    double nullSpan = new TimeSpan(3, 0, 0, 0).TotalMilliseconds;
    DateTime refDate = new DateTime(1970, 1, 1);
    DataPoint prevPt = null;
    foreach (var pt in datapts)
    {
      if (pt.MovAvg != 0.0)
      {
        DataPoint newPt = new DataPoint { x = (pt.Date - refDate).TotalMilliseconds, y = pt.MovAvg };
        if (prevPt != null && newPt.x - prevPt.x >= nullSpan)
          cs.data.Add(new DataPoint { x = prevPt.x + 1, y = null });
        cs.data.Add(newPt);
        prevPt = newPt;
      }
    }
    return cs;
  }

  private void AddThresholdLines(List<ChartSeries> series, List<decimal> thresholds)
  {
    double minX = double.MaxValue;
    double maxX = double.MinValue;
    foreach (ChartSeries cs in series)
    {
      if (cs.data.Count > 0)
      {
        minX = Math.Min(minX, cs.data.First().x);
        maxX = Math.Max(maxX, cs.data.Last().x);
      }
    }
    // Add threshold lines
    foreach (decimal thresh in thresholds)
    {
      ChartSeries cs = new ChartSeries();
      cs.name = "Threshold";
      cs.type = "line";
      cs.connectNulls = true;
      cs.dashStyle = "dash";
      cs.color = "#cccccc";
      cs.data.Add(new DataPoint { x = minX, y = (double)thresh });
      cs.data.Add(new DataPoint { x = maxX, y = (double)thresh });
      series.Add(cs);
    }
  }


  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public Stream ExportReport(string format, int startMon, int startYr, int endMon, int endYr, string sites)
  {
    List<ChartSeries> series = null;
    JQGridData maxData = null;
    if (format == "MWAT")
      series = WeeklyMWATData(startMon, startYr, endMon, endYr, sites);
    else if (format == "MWMT")
      series = WeeklyMWMTData(startMon, startYr, endMon, endYr, sites);
    else if (format == "MaxMWAT")
      maxData = MaxMWATData(startYr, endYr, sites, 1, int.MaxValue);
    else if (format == "MaxMWMT")
      maxData = MaxMWMTData(startYr, endYr, sites, 1, int.MaxValue);

    if (series != null)
      return StreamChartData(series, format, startMon, startYr, endMon, endYr);
    else if (maxData != null)
      return StreamTableData(maxData, format, startYr, endYr);
    return null;
  }

  /// <summary>
  /// Writes the jqgrid data to a stream
  /// </summary>
  /// <param name="data"></param>
  /// <param name="format"></param>
  /// <param name="startYr"></param>
  /// <param name="endYr"></param>
  /// <returns></returns>
  private Stream StreamTableData(JQGridData data, string format, int startYr, int endYr)
  {
    StringBuilder sb = new StringBuilder();
    sb.AppendLine("Site\tYear\tType\tMax Temp\tDays Exceeded\tPercent\tComments");
    foreach (var row in data.rows)
    {
      StringBuilder line = new StringBuilder();
      foreach (var cell in row.cell)
      {
        if (line.Length > 0)
          line.Append("\t");
        line.Append(cell);
      }
      sb.AppendLine(line.ToString());
    }
    // Lastly, stream data back to the user.
    WebOperationContext.Current.OutgoingResponse.ContentType = "application/ms-excel";
    string filename = string.Format("filename={0}_{1}-{2}.xls", format, startYr, endYr);
    WebOperationContext.Current.OutgoingResponse.Headers.Add("Content-Disposition", "attachment; " + filename);

    System.Text.ASCIIEncoding encoding = new ASCIIEncoding();
    Byte[] bytes = encoding.GetBytes(sb.ToString());
    return new MemoryStream(bytes);
  }

  private Stream StreamChartData(IList<ChartSeries> series, string format, int startMon, int startYr, int endMon, int endYr)
  {
    StringBuilder sb = new StringBuilder();
    StringBuilder line = new StringBuilder();

    // Write Header Row
    line.Append("Date");
    foreach (var cs in series)
    {
      line.Append("\t");
      line.Append(cs.name);
    }
    sb.AppendLine(line.ToString());

    // Now, get the union of all dates, order those, then write out a row for each data point
    DateTime refDate = new DateTime(1970, 1, 1);
    List<double> dates = new List<double>();
    foreach (var set in series)
    {
      dates = dates.Union(set.data.Select(d => d.x)).ToList();
    }

    // Process each possible row of data.
    double threshold = 0.0;
    foreach (var x in dates.OrderBy(d => d))
    {
      //double thresh = 0.0;
      line = new StringBuilder();
      line.Append(refDate.AddMilliseconds(x).ToString() + "\t");
      foreach (var set in series)
      {
        var pt = set.data.FirstOrDefault(p => p.x == x);
        if (string.Compare(set.name, "threshold", true) == 0)
        {
          if (pt != null && threshold != pt.y.Value)
            threshold = pt.y.Value;
          line.Append(threshold);
        }
        else
          line.AppendFormat("{0}\t", pt != null ? pt.y : null);
      }
      sb.AppendLine(line.ToString());
    }

    // Lastly, stream data back to the user.
    WebOperationContext.Current.OutgoingResponse.ContentType = "application/ms-excel";
    string filename = string.Format("filename={0}-{1}-{2}_{3}-{4}.xls", format, startMon, startYr, endMon, endYr);
    WebOperationContext.Current.OutgoingResponse.Headers.Add("Content-Disposition", "attachment; " + filename);

    System.Text.ASCIIEncoding encoding = new ASCIIEncoding();
    Byte[] bytes = encoding.GetBytes(sb.ToString());
    return new MemoryStream(bytes);
  }

  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public JQGridData MaxMWATData(int startYr, int endYr, string sites, int pageIndex, int pageSize)
  {
    JQGridData data = new JQGridData();
    List<string> years = new List<string>();
    for (int yr = startYr; yr <= endYr; ++yr)
      years.Add(yr.ToString());
    List<string> siteIds = sites.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries).ToList();
    int rowCt = 0;
    using (var context = new GarciaDataContext())
    {
      var records = context.MWATMaxes.Where(m => years.Contains(m.YEAR_) && siteIds.Contains(m.SiteID)).OrderBy(m => m.SITE_NAME).ThenBy(m => m.YEAR_);
      data.records = records.Count();
      foreach (var rec in records.Skip((pageIndex - 1)* pageSize).Take(pageSize) )
      {
        JQGridData.Row row = new JQGridData.Row();
        row.id = rowCt.ToString();
        rowCt++;
        row.cell.Add(rec.SITE_NAME);
        row.cell.Add(rec.YEAR_);
        row.cell.Add(rec.TYPE);
        row.cell.Add(double.Parse(rec.MaxMWAT).ToString("0.00"));
        row.cell.Add(rec.DaysExceed.HasValue ? rec.DaysExceed.Value.ToString("0.00") : string.Empty);
        row.cell.Add(rec.Percent.HasValue ? rec.Percent.Value.ToString("0.00%") : string.Empty);
        row.cell.Add(rec.COMMENTS);
        data.rows.Add(row);
      }
    }
    data.page = pageIndex;
    data.total = data.records / pageSize;
    if (data.total % pageSize != 0 || data.total == 0)
      data.total++;
    return data;
  }

  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public JQGridData MaxMWMTData(int startYr, int endYr, string sites, int pageIndex, int pageSize)
  {
    JQGridData data = new JQGridData();
    List<string> years = new List<string>();
    for (int yr = startYr; yr <= endYr; ++yr)
      years.Add(yr.ToString());
    List<string> siteIds = sites.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries).ToList();
    int rowCt = 0;
    using (var context = new GarciaDataContext())
    {
      var records = context.MWMTMaxes.Where(m => years.Contains(m.YEAR_) && siteIds.Contains(m.SiteID)).OrderBy(m => m.SITE_NAME).ThenBy(m => m.YEAR_);
      data.records = records.Count();
      foreach (var rec in records.Skip((pageIndex - 1) * pageSize).Take(pageSize))
      {
        JQGridData.Row row = new JQGridData.Row();
        row.id = rowCt.ToString();
        rowCt++;
        row.cell.Add(rec.SITE_NAME);
        row.cell.Add(rec.YEAR_);
        row.cell.Add(rec.TYPE);
        row.cell.Add(double.Parse(rec.MaxMWMT).ToString("0.00"));
        row.cell.Add(rec.DaysExceed.HasValue ? rec.DaysExceed.Value.ToString("0.00") : string.Empty);
        row.cell.Add(rec.Percent.HasValue ? rec.Percent.Value.ToString("0.00%") : string.Empty);
        row.cell.Add(rec.COMMENTS);
        data.rows.Add(row);
      }
    }
    data.page = pageIndex;
    data.total = data.records / pageSize;
    if (data.total % pageSize != 0 || data.total == 0)
      data.total++;
    return data;
  }
  #endregion

  #region -- Mapping Functions --
  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public BoundaryData Boundaries()
  {
    BoundaryData data = new BoundaryData();
    data.Watershed.Add(new LatLngPoint { Lat = 37.3333, Lng = -121.9 });
    data.Watershed.Add(new LatLngPoint { Lat = 36.6, Lng = -121.9 });
    data.Watershed.Add(new LatLngPoint { Lat = 37.3, Lng = -120.4833 });
    data.Watershed.Add(new LatLngPoint { Lat = 37.3333, Lng = -121.9 });

    data.Project.Add(new LatLngPoint { Lat = 37, Lng = -121.9 });
    data.Project.Add(new LatLngPoint { Lat = 36, Lng = -120.5 });
    data.Project.Add(new LatLngPoint { Lat = 36.6, Lng = -119.9 });
    data.Project.Add(new LatLngPoint { Lat = 37, Lng = -121.9 });
    return data;
  }

  /// <summary>
  /// Returns data used to draw information on a map.
  /// </summary>
  /// <param name="year">Year the data applies.</param>
  /// <param name="infographic">Name of the data type to return.</param>
  /// <returns></returns>
  [OperationContract]
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  public List<MapMarker> Markers(int year, string infographic)
  {
    // TODO: based on infographic and configuration options, generate the appropriate marker information.
    List<MapMarker> markers = new List<MapMarker>();
    markers.Add(new MapMarker{Lat = 37.333, Lng = -121.9, 
      Color = "#00FFAA", 
      Radius = 40000, 
      ShowInfographic = !string.IsNullOrEmpty(infographic),
      Tooltip = "This would be the text that is displayed for the marker",
      InfoText = "<div><b>HELLO</b> world.  Why don't you resize in a manner that makes the data fit?  Perhaps you are expecting a much longer set of text?</div><br/>"
    });
    return markers;
  }
  #endregion
}

public class ReportSite
{
  public string Id { get; set; }
  public string Name { get; set; }
}

public class ChartSeries
{
  public ChartSeries()
  {
    data = new List<DataPoint>();
    dashStyle = "solid";
    connectNulls = false;
    type = "line";
  }
  public string name { get; set; }
  public string type { get; set; }
  public string dashStyle { get; set; }
  public string color { get; set; }
  public bool connectNulls { get; set; }
  public List<DataPoint> data { get; set; }
}

public class DataPoint
{
  public double x { get; set; }
  public double? y { get; set; }
}

public class WeeklyData
{
  public DateTime Date { get; set; }
  public string SiteId { get; set; }
  public string Name { get; set; }
  public double MovAvg { get; set; }
  public decimal Threshold { get; set; }
}

public class BoundaryData
{
  public BoundaryData()
  {
    Watershed = new List<LatLngPoint>();
    Project = new List<LatLngPoint>();
  }

  public List<LatLngPoint> Watershed { get; set; }
  public List<LatLngPoint> Project { get; set; }
}

public class LatLngPoint
{
  public double Lat { get; set; }
  public double Lng { get; set; }
}

public class MapMarker
{
  public double Lat { get; set; }
  public double Lng { get; set; }
  public string Color { get; set; }
  public double Radius { get; set; }
  public bool HasData { get; set; }
  public bool ShowInfographic { get; set; }
  public string Tooltip { get; set; }
  public string InfoText { get; set; }
}