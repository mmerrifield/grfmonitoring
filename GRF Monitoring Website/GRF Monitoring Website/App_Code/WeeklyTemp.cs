using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;


[DataContract()]
public class WeeklyTemp
{

    #region Members

    [DataMember()]
    public string siteID { get; set; }

    [DataMember()]
    public string siteName { get; set; }

    [DataMember()]
    public DateTime date { get; set; }

    [DataMember()]
    public string dateString { get; set; }

    [DataMember()]
    public double movAvg { get; set; }

    #endregion

    #region Constructors

    public WeeklyTemp()
    {
    }

    public WeeklyTemp(DS.FinalMWATRow dr)
	  {
        siteID = dr.SiteID;
        siteName = dr.SITE_NAME;
        date = dr.Date;
        dateString = date.ToShortDateString();
        movAvg = dr.movAvg;
    }

    public WeeklyTemp(DS.FinalMWMTRow dr)
    {
        siteID = dr.SiteID;
        siteName = dr.SITE_NAME;
        date = dr.Date;
        dateString = date.ToShortDateString();
        movAvg = dr.movAvg;
    }

    #endregion

    #region static methods

    public static List<WeeklyTemp> getMWATData(DateTime startDate, DateTime endDate, List<string> sites)
    {
        List<WeeklyTemp> temps = new List<WeeklyTemp>();

        List<DS.FinalMWATRow> drMWAT = DB.getMWATData(startDate, endDate, sites);
        foreach (DS.FinalMWATRow dr in drMWAT)
            temps.Add(new WeeklyTemp(dr));

        return temps;
    }

    public static List<WeeklyTemp> getMWMTData(DateTime startDate, DateTime endDate, List<string> sites)
    {
        List<WeeklyTemp> temps = new List<WeeklyTemp>();

        List<DS.FinalMWMTRow> drMWMT = DB.getMWMTData(startDate, endDate, sites);
        foreach (DS.FinalMWMTRow dr in drMWMT)
            temps.Add(new WeeklyTemp(dr));

        return temps;
    }

    #endregion
}

