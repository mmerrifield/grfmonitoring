using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ConsoleApplication1.SLService;

namespace ConsoleApplication1
{
  class Program
  {
    static void Main(string[] args)
    {
      using (var context = new SLService.SLServiceClient())
      {
        SLService.SilverlightServiceCallResult sr = new SLService.SilverlightServiceCallResult();
        var yrs = context.getYears(ref sr);
      }
    }
  }
}