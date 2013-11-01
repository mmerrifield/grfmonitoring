using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

[DataContract()]
public class MaxTemp
{
    #region Members

    [DataMember()]
    public string year { get; set; }

    [DataMember()]
    public string hoboID { get; set; }

    [DataMember()]
    public string siteName { get; set; }

    [DataMember()]
    public string type { get; set; }

    [DataMember()]
    public string max { get; set; }

    [DataMember()]
    public int daysExceed { get; set; }

    [DataMember()]
    public double percent { get; set; }

    [DataMember()]
    public string percentString { get; set; }

    [DataMember()]
    public string comments { get; set; }

    [DataMember()]
    public string siteID { get; set; }

    #endregion

    #region Constructors

    public MaxTemp(DS.MWATMaxRow dr)
    {
        year = dr.YEAR_;
        hoboID = dr.HOBO_ID;
        siteName = dr.SITE_NAME;
        type = dr.TYPE;
        double maxMWat = double.Parse(dr.MaxMWAT);
        max = maxMWat.ToString("F2");
        daysExceed = dr.DaysExceed;
        percent = dr.Percent;
        percentString = percent.ToString("P2");
        comments = dr.COMMENTS;
        siteID = dr.SiteID;
    }

    public MaxTemp(DS.MWMTMaxRow dr)
    {
        year = dr.YEAR_;
        hoboID = dr.HOBO_ID;
        siteName = dr.SITE_NAME;
        type = dr.TYPE;
        double maxMWMT = double.Parse(dr.MaxMWMT);
        max = maxMWMT.ToString("F2");
        daysExceed = dr.DaysExceed;
        percent = dr.Percent;
        percentString = percent.ToString("P2");
        comments = dr.COMMENTS;
        siteID = dr.SiteID;
    }

    #endregion

    #region static methods

    public static List<MaxTemp> getMaxMWATData(string year, List<string> sites)
    {
        List<MaxTemp> temps = new List<MaxTemp>();

        List<DS.MWATMaxRow> drMWAT = DB.getMaxMWATData(year, sites);
        foreach (DS.MWATMaxRow dr in drMWAT)
            temps.Add(new MaxTemp(dr));

        return temps;
    }

    public static List<MaxTemp> getMaxMWMTData(string year, List<string> sites)
    {
        List<MaxTemp> temps = new List<MaxTemp>();

        List<DS.MWMTMaxRow> drMWMT = DB.getMaxMWMTData(year, sites);
        foreach (DS.MWMTMaxRow dr in drMWMT)
            temps.Add(new MaxTemp(dr));

        return temps;
    }

    #endregion

}