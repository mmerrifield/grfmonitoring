using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

[DataContract()]
public class GarciaSite
{
    #region Members

    public int objectID { get; set; }

    [DataMember()]
    public string siteID { get; set; }

    [DataMember()]
    public string siteName { get; set; }

    public string directions { get; set; }

    [DataMember()]
    public string color { get; set; }

    [DataMember()]
    public DateTime? dataStartDate { get; set; }

    [DataMember()]
    public DateTime? dataEndDate { get; set; }

    [DataMember()]
    public string dataDateRange { get; set; }

    [DataMember()]
    public List<String> waterYears { get; set; }

    [DataMember()]
    public List<String> airYears { get; set; }

    [DataMember()]
    public bool isSelected { get; set; }

    #endregion

    #region Constructors

    public GarciaSite(DS.SiteInfoRow dr)
    {
        this.objectID = dr.OBJECTID;
        this.siteID = dr.Site_ID;
        this.siteName = dr.SITE_NAME;
        this.directions = dr.Directions;
        color = DB.getSiteColor(siteID);

        if (dr.IsDataStartDateNull())
            dataStartDate = null;
        else
            dataStartDate = dr.DataStartDate;

        if (dr.IsDataEndDateNull())
            dataEndDate = null;
        else
            dataEndDate = dr.DataEndDate;

        setDataRange();
        setSiteYears();

        isSelected = false;
    }

    #endregion

    #region Instance Methods

    private void setDataRange()
    {

        if (dataStartDate == null && dataEndDate == null)
            dataDateRange = "none";
        else if (dataStartDate == null && dataEndDate != null)
            dataDateRange = "Unknown - " + ((DateTime)dataEndDate).ToShortDateString();
        else if (dataStartDate != null && dataEndDate == null)
            dataDateRange = ((DateTime)dataStartDate).ToShortDateString() + "Unknown";
        else
            dataDateRange = ((DateTime)dataStartDate).ToShortDateString() + " - " + ((DateTime)dataEndDate).ToShortDateString();
    }

    private void setSiteYears()
    {
        IEnumerable<string> theWaterYears = from s in DB.getSiteHobo(siteID, "Water")
                                        select s.YEAR_;

        waterYears = theWaterYears.ToList();

        IEnumerable<string> theAirYears = from s in DB.getSiteHobo(siteID, "Air")
                                            select s.YEAR_;

        // union with Air Humidity Years

        IEnumerable<string> theAirHumidityYears = from s in DB.getSiteHobo(siteID, "Air_Humidity")
                                                  select s.YEAR_;

        IEnumerable<string> unionAirYears = theAirYears.Union(theAirHumidityYears);

        airYears = unionAirYears.ToList();
    }

    public Tuple<DateTime?, DateTime?> getHoboDateRangeByYear(string year, string sensorType)
    {
        int yr = int.Parse(year);
        DateTime? st = DB.getHoboStartDateByYearAndSite(yr, siteID, sensorType);
        DateTime? nd = DB.getHoboEndDateByYearAndSite(yr, siteID, sensorType);
        return new Tuple<DateTime?, DateTime?>(st, nd);
    }

    public void save()
    {
        // validate
        if (siteID == "")
            throw new asyncError("Site ID required");

        if (siteName == "")
            throw new asyncError("Site Name required");

        DS.SiteInfoRow dr = DB.getSiteInfoRow(objectID);
                
        dr.Site_ID = siteID;
        dr.SITE_NAME = siteName;

        if (directions == "")
            dr.SetDirectionsNull();
        else
            dr.Directions = directions;

        if (color == "")
            dr.SetColorNull();
        else
            dr.Color = color;

        if (dataStartDate == null)
            dr.SetDataStartDateNull();
        else
            dr.DataStartDate = (DateTime)dataStartDate;

        if (dataEndDate == null)
            dr.SetDataEndDateNull();
        else
            dr.DataEndDate = (DateTime)dataEndDate;
        
        DB.saveSiteInfoRow(dr);
    }

    public void delete()
    {
        DS.SiteInfoRow dr = DB.getSiteInfoRow(siteID);
        dr.Delete();
        DB.saveSiteInfoRow(dr);
        allSites.Remove(this);
    }

    #endregion

    #region static methods

    public static List<GarciaSite> itsSites;
    public static List<GarciaSite> allSites
    {
        get
        {
            if (itsSites == null)
            {
                itsSites = new List<GarciaSite>();
                List<DS.SiteInfoRow> drSites = DB.getSiteInfo();

                foreach (DS.SiteInfoRow dr in drSites)
                    itsSites.Add(new GarciaSite(dr));
            }
            return itsSites;
        }
    }

    public static List<GarciaSite> getSites()
    {
        return allSites;
    }

    public static GarciaSite getSite(string siteID) 
    {
        IEnumerable<GarciaSite> results = from s in allSites
                                          where s.siteID == siteID
                                          select s;

        if (results.Count() > 0)
            return results.First();
        else
            return null;
    }

    public static GarciaSite getSite(int objectID)
    {
        IEnumerable<GarciaSite> results = from s in allSites
                                          where s.objectID == objectID
                                          select s;

        if (results.Count() > 0)
            return results.First();
        else
            return null;

    }

    public static void clearSites()
    {
        itsSites = null;
    }

    public static GarciaSite newSite(string siteID, string siteName)
    {
        DS.SiteInfoRow dr = DB.newSite(siteID, siteName);
        GarciaSite newSite = new GarciaSite(dr);
        allSites.Insert(0, newSite);
        return newSite;
    }

    #endregion

}
