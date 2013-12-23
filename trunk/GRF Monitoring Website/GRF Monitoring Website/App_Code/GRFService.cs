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
using System.Configuration;
using System.Net.Mail;
using System.Web.Security;
using System.Net;

[ServiceContract(Namespace = "")]
[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
[ServiceBehavior(IncludeExceptionDetailInFaults = true)]
public class GRFService
{
  private static Dictionary<double, string> MarkerMapping;

  private static string[] DashStyle = null;


  #region -- Site Management --
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  [OperationContract]
  public bool Admin()
  {
    return HttpContext.Current.User != null && HttpContext.Current.User.IsInRole("Admin");
  }

  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  [OperationContract]
  public bool Auth()
  {
    return HttpContext.Current.User != null;
  }

  /*
  [WebGet(ResponseFormat=WebMessageFormat.Json)]
  [OperationContract]
  public bool RequestReset(string username)
  {
    MailMessage msg = new MailMessage();
    msg.To.Add(ConfigurationManager.AppSettings["AdminEmails"]);
    msg.From = new MailAddress( "resetrequest@grfmonitoring.net");
    msg.IsBodyHtml = true;
    msg.BodyEncoding = Encoding.ASCII;
    msg.Subject = "GRFMonitoring.net Password Reset Request";
    StringBuilder sb = new StringBuilder();
    sb.AppendFormat("<p style='margin:10px'>User {0} has requested that their password be reset.</p>", username);
    msg.Body = sb.ToString();
    try
    {
      SmtpClient smtpServer = new SmtpClient();
      smtpServer.Send(msg);
      return true;
    }
    catch
    {
      return false;
    }
  }
  */

  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  [OperationContract]
  public JQGridData SiteUsers(int pageIndex, int pageSize, string sortIndex, string sortDirection)
  {
    if (!Admin())
      return null;

    using (var context = new GarciaDataContext())
    {
      JQGridData data = new JQGridData();
      List<User> users = new List<User>();
      if (sortIndex == "UserName")
        users = sortDirection == "asc" ? context.Users.OrderBy(u => u.UserName).ToList() : context.Users.OrderByDescending(u => u.UserName).ToList();
      else
        users = sortDirection == "asc" ? context.Users.OrderBy(u => u.Membership.Email).ToList() : context.Users.OrderByDescending(u => u.Membership.Email).ToList();

      data.records = users.Count;
      foreach (var user in users.Skip((pageIndex - 1) * pageSize).Take(pageSize))
      {
        JQGridData.Row row = new JQGridData.Row();
        row.id = user.UserId.ToString();
        row.cell.Add(user.UserName);
        row.cell.Add(user.Membership.Email);
        row.cell.Add((!user.Membership.IsLockedOut).ToString());
        row.cell.Add(user.UserRoles.FirstOrDefault(ur => ur.Role.RoleName == "Admin") != null ? "true" : "false");
        row.cell.Add("false");
        data.rows.Add(row);
      }
      data.page = pageIndex;
      data.total = data.records / pageSize;
      if (data.total == 0 || pageSize * data.total < data.records)
        data.total++;
      return data;
    }
  }

  [OperationContract]
  [WebInvoke(Method="POST",ResponseFormat=WebMessageFormat.Json)]
  public UserInfo UpdateUser(Stream contents)
  {
    UserInfo ui = new UserInfo();

    if (!Admin())
      return ui;

    try
    {
      var formData = ParseContents(contents);
      Guid id = Guid.Empty;

      string op = formData["oper"];
      Guid.TryParse(formData["id"], out id);
      string username = string.Empty;
      string email = string.Empty;
      bool active = false;
      bool admin = false;
      bool resetPwd = false;


      if (op != "del")
      {
        username = formData["UserName"];
        email = formData["Email"];
        active = bool.Parse(formData["Active"]);
        admin = bool.Parse(formData["Admin"]);
        resetPwd = bool.Parse(formData["ResetPwd"]);
        ui.Email = email;
      }

      if (op == "add")
      {
        string pwd = System.Web.Security.Membership.GeneratePassword(8, 2);
        MembershipCreateStatus status;
        MembershipUser mu = System.Web.Security.Membership.CreateUser(username, pwd, email, "Username", username, active, out status);
        if (status == MembershipCreateStatus.Success)
        {
          UpdateUserRole(mu.UserName, admin, "Admin");
          // Send the password to the user
          GetRegistrationEmail(username, pwd, ui);
          using (var context = new GarciaDataContext())
          {
            User u = context.Users.FirstOrDefault(ur => ur.UserName == mu.UserName);
            if (u != null)
              ui.UserId = u.UserId.ToString();
          }
        }
      }
      else if (op == "edit")
      {
        MembershipUser mu = System.Web.Security.Membership.GetUser(username);
        mu.Email = email;
        mu.IsApproved = active;
        if (mu.IsLockedOut && active)
          mu.UnlockUser();
        if (resetPwd)
        {
          try
          {
            string pwd = mu.ResetPassword();
            GetResetPasswordEmail(username, pwd, ui);
          }
          catch (Exception ex)
          {
            string msg = ex.Message;
          }
        }
        System.Web.Security.Membership.UpdateUser(mu);
        UpdateUserRole(mu.UserName, admin, "Admin");
      }
      else if (op == "del" && id != Guid.Empty)
      {
        MembershipUser mu = System.Web.Security.Membership.GetUser(id);
        if (mu != null)
        {
          bool del = System.Web.Security.Membership.DeleteUser(mu.UserName, true);
        }
      }
    }
    catch (Exception ex)
    {
      string msg = ex.Message;
    }
    return ui;
  }

  private void UpdateUserRole(string username, bool addToRole, string role)
  {
    if (addToRole)
    {
      if (!Roles.IsUserInRole(username, role))
        Roles.AddUserToRole(username, role);
    }
    else
    {
      if (Roles.IsUserInRole(username, role))
        Roles.RemoveUserFromRole(username, role);
    }
  }

  /// <summary>
  /// Sends an email to the newly registered user.
  /// </summary>
  /// <param name="email"></param>
  /// <param name="pwd"></param>
  private void GetRegistrationEmail(string username, string pwd, UserInfo ui)
  {
    ui.Subject = "GRFMonitoring.net Login Credentials";

    string site = ConfigurationManager.AppSettings["SiteUrl"] ?? "GRFMonitoring.net";
    StringBuilder sb = new StringBuilder();
    sb.AppendFormat("You have been given an account to the {0} website. ", site);
    sb.AppendFormat("Using this account, you can log in to manage site data, view reports and export data.");
    sb.AppendLine(" ");
    sb.AppendFormat(" Use the following username: {0} and password: {1} to access the site.", username, pwd);
    sb.AppendLine("");
    sb.AppendLine("We recommend you change your password after logging in to the site for the first time.");
    ui.Body = sb.ToString();
  }

  /// <summary>
  /// Sends an email to a user with their new, temporary password
  /// </summary>
  /// <param name="email"></param>
  /// <param name="username"></param>
  /// <param name="pwd"></param>
  private void GetResetPasswordEmail(string username, string pwd, UserInfo ui)
  {
    ui.Subject = "GRFMonitoring.net Password Reset";
    StringBuilder sb = new StringBuilder();
    sb.Append("Your password has been reset on the GRF Monitoring site. ");
    sb.Append("Use the following username and password to log in to the site. ");
    sb.AppendFormat("UserName: {0} Password: {1}", username, pwd);
    sb.AppendLine(" ");
    sb.AppendLine(" We recommend you change your password after logging in to the site.");
    ui.Body = sb.ToString();
  }

  /// <summary>
  /// Returns the collection of sites to display in a paged table.
  /// </summary>
  /// <param name="pageIndex"></param>
  /// <param name="pageSize"></param>
  /// <param name="sortIndex"></param>
  /// <param name="sortDirection"></param>
  /// <returns></returns>
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  [OperationContract]
  public JQGridData Sites(int pageIndex, int pageSize, string sortIndex, string sortDirection)
  {
    JQGridData data = new JQGridData();
    using (var context = new GarciaDataContext())
    {
      IEnumerable<SiteInfo> sites = context.SiteInfos;
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
        row.cell.Add(si.HideSite ? "true" : "false");
        data.rows.Add(row);
      }
      data.page = pageIndex;
      data.total = data.records / pageSize;
      if (data.total == 0 || data.total * pageSize < data.records)
        data.total++;
    }
    return data;
  }

  [OperationContract]
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  public List<ReportSite> ReportSites(int startMon, int startYr, int endMon, int endYr)
  {
    using (var context = new GarciaDataContext())
    {
      try
      {
        //List<string> siteIds = context.SiteInfos.Where(s => !s.HideSite).Select(s => s.Site_ID).ToList();
        List<string> siteIds = context.SiteInfos.Select(s => s.Site_ID).ToList();
        DateTime startDate = new DateTime(startYr, startMon, 1);
        DateTime endDate = new DateTime(endYr, endMon, DateTime.DaysInMonth(endYr, endMon));
        return context.FinalMWATs.Where(s => s.Date <= endDate && s.Date >= startDate && siteIds.Contains(s.SiteID))
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
    try
    {
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
      bool hideSite = string.Compare(formData["HideSite"], "true", true) == 0;

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
            if (hideSite && context.SiteHobos.Where(s => s.SITE_ID == siteId).Count() == 0)
            {
              context.SiteInfos.DeleteOnSubmit(si);
            }
            else
            {
              si.Directions = directions;
              si.Color = color;
              si.Lat = lat;
              si.Lng = lng;
              si.HideSite = hideSite;
            }
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
    catch (Exception ex)
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
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
      //return context.SiteInfos.Where(si => siteIds.Contains(si.Site_ID) && !si.HideSite).OrderBy(si => si.SITE_NAME).ToList();
    }
  }

  [OperationContract]
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  public List<string> DateRange(string year, string site)
  {
    using (var context = new GarciaDataContext())
    {
      int currYr = DateTime.Now.Year;
      int.TryParse(year, out currYr);

      if (string.IsNullOrEmpty(year))
      {
        var yrs = context.SiteHobos.Select(s => s.YEAR_).Distinct().OrderBy(y => y).ToList();
        return new List<string>() { string.Format("01-01-{0}", yrs[0]), string.Format("12-31-{0}", yrs[yrs.Count - 1]) };
      }
      else if (!string.IsNullOrEmpty(year) && string.IsNullOrEmpty(site))
      {
        var dates = context.HOBOs.Where(h => h._DateTime.HasValue && h._DateTime.Value.Year == currYr).Select(h => h._DateTime).Distinct().OrderBy(d => d).ToList();
        return new List<string>() { dates[0].Value.ToShortDateString(), dates[dates.Count - 1].Value.ToShortDateString() };
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  public Stream DownloadData(string year, string site, string type, string from, string to)
  {
    using (var context = new GarciaDataContext())
    {
      bool isWater = string.Compare(type, "water", true) == 0;
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
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
      foreach (var hobo in results.Skip((pageIndex - 1) * pageSize).Take(pageSize))
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  public List<ChartSeries> WeeklyMWATData(int startMon, int startYr, int endMon, int endYr, string sites, string format, bool addNullPt)
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
        int colorNdx = 0;
        foreach (var id in sites.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries))
        {
          datapts = context.FinalMWATs.Where(s => s.SiteID == id && s.Date >= startDate && s.Date <= endDate)
            .Select(s => new WeeklyData { Name = s.SITE_NAME, SiteId = s.SiteID, Date = s.Date.Value, MovAvg = s.movAvg.Value, Threshold = s.threshold.Value }).OrderBy(s => s.Date);
          if (datapts.Count() == 0) continue;
          foreach (decimal thresh in datapts.Select(s => s.Threshold).Distinct())
          {
            if (!thresholds.Contains(thresh))
              thresholds.Add(thresh);
          }
          string[] Colors = ConfigurationManager.AppSettings["ChartColors"].Split(',');
          string color = context.SiteInfos.First(s => s.Site_ID == id).Color;
          if (string.IsNullOrEmpty(color))
          {
            color = Colors[colorNdx++];
            if (colorNdx > Colors.Length)
              colorNdx = 0;
          }
          series.AddRange(GetChartSeries(datapts, color, format, startMon, endMon, addNullPt));
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  public List<ChartSeries> WeeklyMWMTData(int startMon, int startYr, int endMon, int endYr, string sites, string format, bool addNullPt)
  {
    try
    {
      List<ChartSeries> series = new List<ChartSeries>();
      DateTime startDate = new DateTime(startYr, startMon, 1);
      DateTime endDate = new DateTime(endYr, endMon, DateTime.DaysInMonth(endYr, endMon));
      IEnumerable<WeeklyData> datapts = null;
      List<decimal> thresholds = new List<decimal>();

      using (var context = new GarciaDataContext())
      {
        int colorNdx = 0;
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
          string[] Colors = ConfigurationManager.AppSettings["ChartColores"].Split(',');
          string color = context.SiteInfos.First(s => s.Site_ID == id).Color;
          if (string.IsNullOrEmpty(color))
          {
            color = Colors[colorNdx++];
            if (colorNdx > Colors.Length)
              colorNdx = 0;
          }
          series.AddRange(GetChartSeries(datapts, color, format, startMon, endMon, addNullPt));
        }
        AddThresholdLines(series, thresholds);
      }
      return series;
    }
    catch
    {
      return null;
    }
  }

  private IEnumerable<ChartSeries> GetChartSeries(IEnumerable<WeeklyData> datapts, string color, string format, int startMon, int endMon, bool addNullPt)
  {
    List<ChartSeries> series = new List<ChartSeries>();
    ChartSeries cs = new ChartSeries();
    if (format == "TS")
    {
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
          if (prevPt != null && newPt.x - prevPt.x >= nullSpan && addNullPt)
            cs.data.Add(new DataPoint { x = prevPt.x + 1, y = null });
          cs.data.Add(newPt);
          prevPt = newPt;
        }
      }
      series.Add(cs);
    }
    else
    {
      if (DashStyle == null)
        DashStyle = ConfigurationManager.AppSettings["DashStyles"].Split(',');

      int dashNdx = 0;

      foreach (int yr in datapts.Select(d => d.Date.Year).Distinct().OrderBy(y => y))
      {
        cs = new ChartSeries();
        var yearPts = datapts.Where(p => p.Date.Year == yr && p.Date.Month >= startMon && p.Date.Month <= endMon).OrderBy(p => p.Date);
        cs.name = string.Format("{0} ({1})", datapts.First().Name, yr);
        if (!string.IsNullOrEmpty(color))
          cs.color = color;

        cs.dashStyle = DashStyle[dashNdx++];
        if (dashNdx > DashStyle.Count())
          dashNdx = 0;

        double nullSpan = new TimeSpan(3, 0, 0, 0).TotalMilliseconds;
        DateTime refDate = new DateTime(1970, 1, 1);
        DataPoint prevPt = null;
        foreach (var pt in yearPts)
        {
          if (pt.MovAvg != 0.0)
          {
            DateTime relDate = new DateTime(1970, pt.Date.Month, pt.Date.Day, pt.Date.Hour, pt.Date.Minute, pt.Date.Second);
            DataPoint newPt = new DataPoint { x = (relDate - refDate).TotalMilliseconds, y = pt.MovAvg };
            if (prevPt != null && newPt.x - prevPt.x >= nullSpan && addNullPt)
              cs.data.Add(new DataPoint { x = prevPt.x + 1, y = null });
            cs.data.Add(newPt);
            prevPt = newPt;
          }
        }
        series.Add(cs);
      }
    }
    return series;
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
      cs.name = string.Format("Threshold ({0} C)", thresh);
      cs.type = "line";
      cs.connectNulls = true;
      cs.dashStyle = "dash";
      cs.color = "#cccccc";
      cs.data.Add(new DataPoint { x = minX, y = (double)thresh });
      cs.data.Add(new DataPoint { x = maxX, y = (double)thresh });
      series.Insert(0, cs);
      //series.Add(cs);
    }
  }


  [OperationContract]
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  public Stream ExportReport(string format, int startMon, int startYr, int endMon, int endYr, string sites)
  {
    List<ChartSeries> series = null;
    JQGridData maxData = null;
    if (format == "MWAT")
      series = WeeklyMWATData(startMon, startYr, endMon, endYr, sites, "FS", false);
    else if (format == "MWMT")
      series = WeeklyMWMTData(startMon, startYr, endMon, endYr, sites, "FS", false);
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
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
      foreach (var rec in records.Skip((pageIndex - 1) * pageSize).Take(pageSize))
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
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
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  public List<string> Boundaries()
  {
    List<string> urls = new List<string>();
    string url = ConfigurationManager.AppSettings["WatershedUrl"];
    if (!string.IsNullOrEmpty(url))
      urls.Add(string.Format("Watershed={0}", url));
    url = ConfigurationManager.AppSettings["PropertyUrl"];
    if (!string.IsNullOrEmpty(url))
      urls.Add(string.Format("Property={0}",url));
    url = ConfigurationManager.AppSettings["StreamsUrl"];
    if (!string.IsNullOrEmpty(url))
      urls.Add(string.Format("Streams={0}",url));
    return urls;
  }

  /// <summary>
  /// Returns the marker data for the map.
  /// </summary>
  /// <param name="year">The year to display</param>
  /// <param name="showData">If true, only markers that have valid data are returned</param>
  /// <param name="format">The format (MWAT or MWMT) for data returned</param>
  /// <returns></returns>
  [OperationContract]
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  public List<MapMarker> Markers(int year, bool showData, string format)
  {
    using (var context = new GarciaDataContext())
    {
      // Get our color mapping 
      if (MarkerMapping == null)
      {
        string[] pctColors = ConfigurationManager.AppSettings["Thresholds"].Split(',');
        MarkerMapping = new Dictionary<double, string>();
        foreach (string s in pctColors)
        {
          string[] tokens = s.Split(':');
          if (tokens.Length == 2)
          {
            double pct = 0.0;
            if (double.TryParse(tokens[0], out pct))
            {
              MarkerMapping.Add(pct, tokens[1]);
            }
          }
        }
      }

      List<MapMarker> markers = new List<MapMarker>();
      if (format == "MWAT")
      {
        var records = context.MWATMaxes.Where(m => m.YEAR_ == year.ToString()).OrderBy(m => m.SITE_NAME).ToList();
        foreach (var site in context.SiteInfos) 
        {
          // Find our data to display
          var maxMWAT = records.FirstOrDefault(r => r.SiteID == site.Site_ID);
          if (maxMWAT == null && showData) continue;

          // Build out our tooltip
          string tipText = site.SITE_NAME;
          if (maxMWAT != null)
            tipText = string.Format("{0}\r\nMWAT Days Exceeding Threshold: {1} ({2})", site.SITE_NAME, maxMWAT.DaysExceed, maxMWAT.Percent.Value.ToString("0.00%"));

          // Determine our marker color
          string marker = string.Format("Images/{0}.png", MarkerMapping[-1]); // NOTE use -1 to denote a case with no value
          if (maxMWAT != null)
          {
            foreach (double pct in MarkerMapping.Keys.OrderBy(d => d))
            {
              if (maxMWAT.Percent.Value <= pct)
              {
                marker = string.Format("Images/{0}.png", MarkerMapping[pct]);
                break;
              }
            }
          }

          // Add the marker data to return 
          if (site.Lat.HasValue && site.Lng.HasValue)
          {
            markers.Add(new MapMarker
            {
              Lat = (double)site.Lat.Value,
              Lng = (double)site.Lng.Value,
              Marker = marker,
              Radius = 0.0,
              Tooltip = tipText,
              InfoText = string.Empty
            });
          }
        }
      }
      else
      {
        var records = context.MWMTMaxes.Where(m => m.YEAR_ == year.ToString()).OrderBy(m => m.SITE_NAME).ToList();
        foreach (var site in context.SiteInfos) 
        {
          // Find our data to display
          var maxMWMT = records.FirstOrDefault(r => r.SiteID == site.Site_ID);
          if (maxMWMT == null && showData) continue;

          // Build out our tooltip
          string tipText = site.SITE_NAME;
          if (maxMWMT != null)
            tipText = string.Format("{0}\r\nMWMT Days Exceeding Threshold: {1} ({2})", site.SITE_NAME, maxMWMT.DaysExceed, maxMWMT.Percent.Value.ToString("0.00%"));

          // Determine our marker color
          string marker = string.Format("Images/{0}.png", MarkerMapping[-1]); // NOTE use -1 to denote a case with no value
          if (maxMWMT != null)
          {
            foreach (double pct in MarkerMapping.Keys.OrderBy(d => d))
            {
              if (maxMWMT.Percent.Value <= pct)
              {
                marker = string.Format("Images/{0}.png", MarkerMapping[pct]);
                break;
              }
            }
          }

          // Add the marker data to return 
          if (site.Lat.HasValue && site.Lng.HasValue)
          {
            markers.Add(new MapMarker
            {
              Lat = (double)site.Lat.Value,
              Lng = (double)site.Lng.Value,
              Marker = marker,
              Radius = 0.0,
              Tooltip = tipText,
              InfoText = string.Empty
            });
          }
        }
      }
      return markers;
    }
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
  public string Marker { get; set; }
  public double Radius { get; set; }
  public string Color { get; set; }
  public string Tooltip { get; set; }
  public string InfoText { get; set; }
}

public class UserInfo
{
  public string Email { get; set; }
  public string Subject { get; set; }
  public string Body { get; set; }
  public string UserId { get; set; }
}