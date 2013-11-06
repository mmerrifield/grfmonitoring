﻿using System;
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

[ServiceContract(Namespace = "")]
[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
public class GRFService
{
  #region -- Site Management --
  /// <summary>
  /// Returns the collection of sites to display in a paged table.
  /// </summary>
  /// <param name="pageIndex"></param>
  /// <param name="pageSize"></param>
  /// <param name="sortIndex"></param>
  /// <param name="sortDirection"></param>
  /// <returns></returns>
  [WebGet]
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
        data.rows.Add(row);
      }
      data.page = pageIndex;
      data.total = data.records / pageSize;
      if (data.total % pageSize != 0 || data.total == 0)
        data.total++;
    }
    return data;
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
              Color = color
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
          if (si != null && string.Compare(si.Directions, directions) != 0 || string.Compare(si.Color, color) != 0)
          {
            si.Directions = directions;
            si.Color = color;
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
  [WebGet]
  [OperationContract]
  public JQGridData SiteHobos(string siteId)
  {
    JQGridData data = new JQGridData();
    using (var context = new GarciaDataContext())
    {
      var hobos = context.SiteHobos.OrderByDescending(h => h.YEAR_).ThenBy(h => h.TYPE).ThenBy(h => h.HOBO_ID);
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
  [WebGet]
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
  [WebGet]
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
  [WebGet]
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
  [WebGet]
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
  [WebGet]
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
}
