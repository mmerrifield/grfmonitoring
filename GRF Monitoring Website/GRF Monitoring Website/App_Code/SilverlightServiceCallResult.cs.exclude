using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

[DataContract()]
public class SilverlightServiceCallResult
{
    [DataMember()]
    public string message { get; set; }

    [DataMember()]
    public ServiceCallResult serviceCallResult;

    public SilverlightServiceCallResult(Exception e)
    {
        serviceCallResult = ServiceCallResult.Error;
        message = e.Message;
    }

    public SilverlightServiceCallResult(string msg)
    {
        serviceCallResult = ServiceCallResult.Success;
        message = msg;
    }


}

[DataContract()]
public enum ServiceCallResult
{
    [EnumMember]
    Success = 1,

    [EnumMember]
    Error = 0
}
