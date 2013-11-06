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

[ServiceContract(Namespace = "")]
[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
public class GRFService
{

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
      if (data.total % pageSize != 0)
        data.total++;
    }
    return data;
  }

  [OperationContract]
  public void UpdateSite(Stream contents)
  {
    var formData = ParseContents(contents);
    string op = formData["oper"];
    string siteId = formData["SiteId"];
    string siteName = formData["SiteName"];
    string directions = formData["Directions"];
    string color = formData["Color"];
    DateTime dtStart, dtEnd;
    bool validStart = DateTime.TryParse(formData["DtStart"], out dtStart);
    bool validEnd = DateTime.TryParse(formData["DtEnd"], out dtEnd);

    if (op == "add")
    {
    }
    else if (op == "edit")
    {
    }
    else if (op == "del" && !string.IsNullOrEmpty(siteId))
    {
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
}
