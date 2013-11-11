using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;

/// <summary>
/// Summary description for DataLayer
/// </summary>
public abstract class DB
{
    #region Connections and Commands

    public static SqlConnection getConnection()
    {
        SqlConnection cnxn = new SqlConnection();
        cnxn.ConnectionString = System.Configuration.ConfigurationManager.ConnectionStrings["GarciaConnection"].ConnectionString;
        cnxn.Open();
        return cnxn;
    }

    public static SqlCommand getCommend(SqlConnection cnxn)
    {
        SqlCommand cmd = new SqlCommand("", cnxn);
        return cmd;
    }

    #endregion

    #region The Data

    private static List<string> years { get; set; }

    private static DS.SiteInfoDataTable itsSiteInfo;
    private static DS.SiteInfoDataTable dtSiteInfo
    {
        get
        {
            if (itsSiteInfo == null)
            {
                DSTableAdapters.SiteInfoTableAdapter da = new DSTableAdapters.SiteInfoTableAdapter();
                itsSiteInfo = da.getSiteInfo();
                da.Dispose();
            }
            return itsSiteInfo;
        }
    }

    private static DS.FinalMWATDataTable itsMWAT;
    private static DS.FinalMWATDataTable dtMWAT
    {
        get
        {
            if (itsMWAT == null)
            {
                DSTableAdapters.FinalMWATTableAdapter da = new DSTableAdapters.FinalMWATTableAdapter();
                itsMWAT = da.getMWATData();
                da.Dispose();
            }
            return itsMWAT;
        }
    }

    private static DS.FinalMWMTDataTable itsMWMT;
    private static DS.FinalMWMTDataTable dtMWMT
    {
        get
        {
            if (itsMWMT == null)
            {
                DSTableAdapters.FinalMWMTTableAdapter da = new DSTableAdapters.FinalMWMTTableAdapter();
                itsMWMT = da.getMWMTData();
                da.Dispose();
            }
            return itsMWMT;
        }
    }

    private static DS.MWATMaxDataTable itsMWATMax;
    private static DS.MWATMaxDataTable dtMWATMax
    {
        get
        {
            if (itsMWATMax == null)
            {
                DSTableAdapters.MWATMaxTableAdapter da = new DSTableAdapters.MWATMaxTableAdapter();
                itsMWATMax = da.getMWATMaxData();
                da.Dispose();
            }
            return itsMWATMax;
        }
    }

    private static DS.MWMTMaxDataTable itsMWMTMax;
    private static DS.MWMTMaxDataTable dtMWMTMax
    {
        get
        {
            if (itsMWMTMax == null)
            {
                DSTableAdapters.MWMTMaxTableAdapter da = new DSTableAdapters.MWMTMaxTableAdapter();
                itsMWMTMax = da.getMWMTMaxData();
                da.Dispose();
            }
            return itsMWMTMax;
        }
    }

    private static DS.lut_SITE_x_HOBODataTable tSiteHoboTbl;
    private static DS.lut_SITE_x_HOBODataTable lutSiteHoboTbl
    {
      get
      {
        if (tSiteHoboTbl == null)
        {
          DSTableAdapters.lut_SITE_x_HOBOTableAdapter da = new DSTableAdapters.lut_SITE_x_HOBOTableAdapter();
          tSiteHoboTbl = da.getSiteXHoboData();
          da.Dispose();
        }
        return tSiteHoboTbl;
      }
    }
    #endregion

    #region Sites

    public static bool hoboExists(string hoboId)
    {
      return lutSiteHoboTbl.Where(t => t.HOBO_ID == hoboId).Count() > 0;
    }

    public static List<DS.SiteInfoRow> getSiteInfo()
    {
        IEnumerable<DS.SiteInfoRow> results = from s in dtSiteInfo
                                              orderby s.SITE_NAME
                                              select s;

        return results.ToList();
    }

    public static DS.SiteInfoRow getSiteInfoRow(string siteID)
    {
        IEnumerable<DS.SiteInfoRow> results = from s in dtSiteInfo
                                              where s.Site_ID == siteID
                                              select s;

        if (results.Count() > 0)
            return results.First();
        else
            return null;
    }

    public static DS.SiteInfoRow getSiteInfoRow(int objectID)
    {
        IEnumerable<DS.SiteInfoRow> results = from s in dtSiteInfo
                                              where s.OBJECTID == objectID
                                              select s;

        if (results.Count() > 0)
            return results.First();
        else
            return null;
    }

    public static DS.SiteInfoRow newSite(string siteID, string siteName)
    {
        DS.SiteInfoRow dr = dtSiteInfo.NewSiteInfoRow();
        dr.Site_ID = siteID;
        dr.SITE_NAME = siteName;
        dtSiteInfo.Rows.Add(dr);
        saveSiteInfoRow(dr);
        return dr;
    }

    public static void saveSiteInfoRow(DS.SiteInfoRow dr) 
    {
        DSTableAdapters.SiteInfoTableAdapter da = new DSTableAdapters.SiteInfoTableAdapter();
        da.Update(dr);
        da.Dispose();
    }

    public static string getSiteColor(string siteID)
    {
        DS.SiteInfoRow[] drSites = dtSiteInfo.Select("SITE_ID='" + siteID + "'") as DS.SiteInfoRow[];

        if (drSites.Length > 0)
        {
            DS.SiteInfoRow dr = drSites.First();
            if (dr.Color != "")
                return dr.Color;
            else
                return "#000000";
        }

        else
            return "#000000";
    }

    public static List<SiteXHoboRow> getSiteHobo(string siteID, string sensorType)
    {

        DSTableAdapters.HOBOTableAdapter da = new DSTableAdapters.HOBOTableAdapter();

        List<SiteXHoboRow> siteHobo = new List<SiteXHoboRow>();

        using (GarciaDataContext db = new GarciaDataContext())
        {
            IEnumerable<SiteXHoboRow> results = from s in db.SiteXHoboRows
                                                where s.SITE_ID == siteID
                                                && s.TYPE == sensorType
                                                orderby s.YEAR_
                                                select s;

            foreach (SiteXHoboRow dr in results)
            {
                DateTime yearStart = DateTime.Parse("1/1/" + dr.YEAR_);
                DateTime yearEnd = DateTime.Parse("12/31/" + dr.YEAR_);
                DS.HOBODataTable drHobo = da.getAnyHoboRowInYear(dr.HOBO_ID, yearStart, yearEnd);
                if (drHobo.Rows.Count > 0)
                    siteHobo.Add(dr);

            }

            da.Dispose();
        }

        return siteHobo;
    }

    public static SiteXHoboRow getSiteHoboRow(string hoboID, string year, string sensorType)
    {

        using (GarciaDataContext db = new GarciaDataContext()) 
        {
            IEnumerable<SiteXHoboRow> results = from s in db.SiteXHoboRows
                                                where s.HOBO_ID == hoboID
                                                && s.YEAR_ == year
                                                && s.TYPE == sensorType
                                                select s;
            if (results.Count() == 0)
                return null;
            else
                return results.First();

        }

    }

    public static List<string> getYears()
    {
        if (years == null)
        {
            using (var db = new GarciaDataContext())
            {
                IEnumerable<string> results = (from s in db.SiteXHoboRows
                                               select s.YEAR_).Distinct();

                years = results.ToList();
            }
        }
        return years;
    }

    #endregion

    #region MWAT/MWMT

    public static DateTime? getHoboStartDateByYear(int year)
    {
        DSTableAdapters.HOBOTableAdapter da = new DSTableAdapters.HOBOTableAdapter();
        DateTime yearStart = new DateTime(year, 1,1);
        DateTime yearEnd = new DateTime(year, 12, 31);
        DateTime? result = da.getFirstDateByYear(yearStart, yearEnd);
        da.Dispose();
        return result;
    }

    public static DateTime? getHoboStartDateByYearAndSite(int year, string siteID, string sensorType)
    {
        DSTableAdapters.HOBOTableAdapter da = new DSTableAdapters.HOBOTableAdapter();
        DateTime yearStart = new DateTime(year, 1, 1);
        DateTime yearEnd = new DateTime(year, 12, 31);
        DateTime? result = da.getStartDateByYearAndSite(yearStart, yearEnd, sensorType, siteID, year.ToString()) as DateTime?;
        da.Dispose();
        return result;
    }

    public static DateTime? getHoboEndDateByYearAndSite(int year, string siteID, string sensorType)
    {
        DSTableAdapters.HOBOTableAdapter da = new DSTableAdapters.HOBOTableAdapter();
        DateTime yearStart = new DateTime(year, 1, 1);
        DateTime yearEnd = new DateTime(year, 12, 31);
        DateTime? result = da.getEndDateByYearAndSite(yearStart, yearEnd, sensorType, siteID, year.ToString()) as DateTime?;
        da.Dispose();
        return result;
    }

    public static DateTime? getHoboEndDateByYear(int year)
    {
        DSTableAdapters.HOBOTableAdapter da = new DSTableAdapters.HOBOTableAdapter();
        DateTime yearStart = new DateTime(year, 1, 1);
        DateTime yearEnd = new DateTime(year, 12, 31);

        DateTime? result = da.getLastDateByYear(yearStart, yearEnd);
        da.Dispose();
        return result;
    }

    public static List<DS.FinalMWATRow> getMWATData(DateTime startDate, DateTime endDate, List<String> sites)
    {
        IEnumerable<DS.FinalMWATRow> results = from m in dtMWAT
                                               where m.Date >= startDate
                                               && m.Date <= endDate
                                               && sites.Contains(m.SiteID)
                                               orderby m.SiteID, m.Date
                                               select m;

        return results.ToList();
    }

    public static List<DS.MWATMaxRow> getMaxMWATData(string year, List<String> sites)
    {
        IEnumerable<DS.MWATMaxRow> results = from m in dtMWATMax
                                             where m.YEAR_ == year
                                             && sites.Contains(m.SiteID)
                                             orderby m.SITE_NAME
                                             select m;

        return results.ToList();
    }

    public static List<DS.FinalMWMTRow> getMWMTData(DateTime startDate, DateTime endDate, List<String> sites)
    {
        IEnumerable<DS.FinalMWMTRow> results = from m in dtMWMT
                                               where m.Date >= startDate
                                               && m.Date <= endDate
                                               && sites.Contains(m.SiteID)
                                               orderby m.SiteID, m.Date
                                               select m;
        return results.ToList();
    }

    public static List<DS.MWMTMaxRow> getMaxMWMTData(string year, List<String> sites)
    {
        IEnumerable<DS.MWMTMaxRow> results = from m in dtMWMTMax
                                             where m.YEAR_ == year
                                             && sites.Contains(m.SiteID)
                                             orderby m.SITE_NAME
                                             select m;

        return results.ToList();
    }

    public static void clearMWATAndMWMTData()
    {
        itsMWAT = null;
        itsMWATMax = null;
        itsMWMT = null;
        itsMWMTMax = null;
    }

    #endregion
}
