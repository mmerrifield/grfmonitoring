using System;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.Collections.Generic;

[ServiceContract(Namespace = "")]
[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
public class SLService
{

    [OperationContract]
    public List<string> getYears(ref SilverlightServiceCallResult sr)
    {
        try
        {
            sr = new SilverlightServiceCallResult("OK");
            return DB.getYears();
        }
        catch (Exception ex) 
        {
            sr = new SilverlightServiceCallResult(ex);
            return null;
        }
    }

    [OperationContract]
    public List<WeeklyTemp> getMWATData(DateTime startDate, DateTime endDate, List<string> sites, ref SilverlightServiceCallResult sr)
    {
        try
        {
            sr = new SilverlightServiceCallResult("OK");
            List<WeeklyTemp> temps = WeeklyTemp.getMWATData(startDate, endDate, sites);
            return temps;

        }
        catch (Exception e)
        {
            sr = new SilverlightServiceCallResult(e);
            return null;
        }
    }

    [OperationContract()]
    public List<MaxTemp> getMaxMWATData(string year, List<String> sites, ref SilverlightServiceCallResult sr)
    {
        try
        {
            sr = new SilverlightServiceCallResult("OK");
            List<MaxTemp> temps = MaxTemp.getMaxMWATData(year, sites);
            return temps;
        }
        catch (Exception e)
        {
            sr = new SilverlightServiceCallResult(e);
            return null;
        }
    }

    [OperationContract]
    public List<WeeklyTemp> getMWMTData(DateTime startDate, DateTime endDate, List<String> sites, ref SilverlightServiceCallResult sr)
    {
        try
        {
            sr = new SilverlightServiceCallResult("OK");
            List<WeeklyTemp> temps = WeeklyTemp.getMWMTData(startDate, endDate, sites);
            return temps;
        }
        catch (Exception e)
        {
            sr = new SilverlightServiceCallResult(e);
            return null;
        }
        
    }

    [OperationContract()]
    public List<MaxTemp> getMaxMWMTData(string year, List<String> sites, ref SilverlightServiceCallResult sr)
    {
        try
        {
            sr = new SilverlightServiceCallResult("OK");
            List<MaxTemp> temps = MaxTemp.getMaxMWMTData(year, sites);
            return temps;
        }
        catch (Exception e)
        {
            sr = new SilverlightServiceCallResult(e);
            return null;
        }
    }

    [OperationContract]
    public List<GarciaSite> getSites(ref SilverlightServiceCallResult sr)
    {
        try
        {
            sr = new SilverlightServiceCallResult("OK");
            return GarciaSite.getSites();
        }
        catch (Exception e)
        {
            sr = new SilverlightServiceCallResult(e);
            return null;
        }
    }
}
