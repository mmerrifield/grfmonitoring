using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


public abstract class Util
{

}

public class asyncError : Exception
{
    public asyncError(string msg) : base(msg) { }
}