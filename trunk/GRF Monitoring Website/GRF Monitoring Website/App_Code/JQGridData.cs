using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for JQGridData
/// </summary>
/// <summary>
/// Class used to return the data as JSON to a jqGrid
/// </summary>
public class JQGridData
{
  public JQGridData()
  {
    rows = new List<Row>();
  }
  public int total { get; set; }
  public int page { get; set; }
  public int records { get; set; }
  public List<Row> rows { get; set; }

  public class Row
  {
    public Row()
    {
      cell = new List<string>();
    }
    public string id { get; set; }
    public List<string> cell { get; set; }
  }
}

public class HOBOExport
{
  public bool IsWater { get; set; }
  public JQGridData Data { get; set; }
}