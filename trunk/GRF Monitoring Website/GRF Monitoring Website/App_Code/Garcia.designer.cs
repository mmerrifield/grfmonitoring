﻿#pragma warning disable 1591
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.17929
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;



[global::System.Data.Linq.Mapping.DatabaseAttribute(Name="Garcia")]
public partial class GarciaDataContext : System.Data.Linq.DataContext
{
	
	private static System.Data.Linq.Mapping.MappingSource mappingSource = new AttributeMappingSource();
	
  #region Extensibility Method Definitions
  partial void OnCreated();
  partial void InsertHOBO(HOBO instance);
  partial void UpdateHOBO(HOBO instance);
  partial void DeleteHOBO(HOBO instance);
  partial void InsertSiteInfo(SiteInfo instance);
  partial void UpdateSiteInfo(SiteInfo instance);
  partial void DeleteSiteInfo(SiteInfo instance);
  partial void InsertSiteHobo(SiteHobo instance);
  partial void UpdateSiteHobo(SiteHobo instance);
  partial void DeleteSiteHobo(SiteHobo instance);
  #endregion
	
	public GarciaDataContext() : 
			base(global::System.Configuration.ConfigurationManager.ConnectionStrings["GarciaConnection"].ConnectionString, mappingSource)
	{
		OnCreated();
	}
	
	public GarciaDataContext(string connection) : 
			base(connection, mappingSource)
	{
		OnCreated();
	}
	
	public GarciaDataContext(System.Data.IDbConnection connection) : 
			base(connection, mappingSource)
	{
		OnCreated();
	}
	
	public GarciaDataContext(string connection, System.Data.Linq.Mapping.MappingSource mappingSource) : 
			base(connection, mappingSource)
	{
		OnCreated();
	}
	
	public GarciaDataContext(System.Data.IDbConnection connection, System.Data.Linq.Mapping.MappingSource mappingSource) : 
			base(connection, mappingSource)
	{
		OnCreated();
	}
	
	public System.Data.Linq.Table<HOBO> HOBOs
	{
		get
		{
			return this.GetTable<HOBO>();
		}
	}
	
	public System.Data.Linq.Table<SITE_INFO> SITE_INFOs
	{
		get
		{
			return this.GetTable<SITE_INFO>();
		}
	}
	
	public System.Data.Linq.Table<SiteXHoboRow> SiteXHoboRows
	{
		get
		{
			return this.GetTable<SiteXHoboRow>();
		}
	}
	
	public System.Data.Linq.Table<SITE> SITEs
	{
		get
		{
			return this.GetTable<SITE>();
		}
	}
	
	public System.Data.Linq.Table<SiteInfo> SiteInfos
	{
		get
		{
			return this.GetTable<SiteInfo>();
		}
	}
	
	public System.Data.Linq.Table<SiteHobo> SiteHobos
	{
		get
		{
			return this.GetTable<SiteHobo>();
		}
	}
	
	public System.Data.Linq.Table<FinalMWAT> FinalMWATs
	{
		get
		{
			return this.GetTable<FinalMWAT>();
		}
	}
	
	public System.Data.Linq.Table<FinalMWMT> FinalMWMTs
	{
		get
		{
			return this.GetTable<FinalMWMT>();
		}
	}
	
	public System.Data.Linq.Table<MWAT> MWATs
	{
		get
		{
			return this.GetTable<MWAT>();
		}
	}
	
	public System.Data.Linq.Table<MWATMax> MWATMaxes
	{
		get
		{
			return this.GetTable<MWATMax>();
		}
	}
	
	public System.Data.Linq.Table<MWMT> MWMTs
	{
		get
		{
			return this.GetTable<MWMT>();
		}
	}
	
	public System.Data.Linq.Table<MWMTMax> MWMTMaxes
	{
		get
		{
			return this.GetTable<MWMTMax>();
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.HOBO")]
public partial class HOBO : INotifyPropertyChanging, INotifyPropertyChanged
{
	
	private static PropertyChangingEventArgs emptyChangingEventArgs = new PropertyChangingEventArgs(String.Empty);
	
	private int _ID;
	
	private string _HOBO_ID;
	
	private System.Nullable<System.DateTime> @__DateTime;
	
	private System.Nullable<double> _Temp;
	
	private System.Nullable<double> _DewPoint;
	
	private System.Nullable<double> _AbsHumidity;
	
	private System.Nullable<double> _RH;
	
	private System.Nullable<System.DateTime> _DateUploaded;
	
	private string _UploadedBy;
	
    #region Extensibility Method Definitions
    partial void OnLoaded();
    partial void OnValidate(System.Data.Linq.ChangeAction action);
    partial void OnCreated();
    partial void OnIDChanging(int value);
    partial void OnIDChanged();
    partial void OnHOBO_IDChanging(string value);
    partial void OnHOBO_IDChanged();
    partial void On_DateTimeChanging(System.Nullable<System.DateTime> value);
    partial void On_DateTimeChanged();
    partial void OnTempChanging(System.Nullable<double> value);
    partial void OnTempChanged();
    partial void OnDewPointChanging(System.Nullable<double> value);
    partial void OnDewPointChanged();
    partial void OnAbsHumidityChanging(System.Nullable<double> value);
    partial void OnAbsHumidityChanged();
    partial void OnRHChanging(System.Nullable<double> value);
    partial void OnRHChanged();
    partial void OnDateUploadedChanging(System.Nullable<System.DateTime> value);
    partial void OnDateUploadedChanged();
    partial void OnUploadedByChanging(string value);
    partial void OnUploadedByChanged();
    #endregion
	
	public HOBO()
	{
		OnCreated();
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_ID", AutoSync=AutoSync.OnInsert, DbType="Int NOT NULL IDENTITY", IsPrimaryKey=true, IsDbGenerated=true)]
	public int ID
	{
		get
		{
			return this._ID;
		}
		set
		{
			if ((this._ID != value))
			{
				this.OnIDChanging(value);
				this.SendPropertyChanging();
				this._ID = value;
				this.SendPropertyChanged("ID");
				this.OnIDChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_HOBO_ID", DbType="VarChar(50)")]
	public string HOBO_ID
	{
		get
		{
			return this._HOBO_ID;
		}
		set
		{
			if ((this._HOBO_ID != value))
			{
				this.OnHOBO_IDChanging(value);
				this.SendPropertyChanging();
				this._HOBO_ID = value;
				this.SendPropertyChanged("HOBO_ID");
				this.OnHOBO_IDChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Name="[_DateTime]", Storage="__DateTime", DbType="DateTime")]
	public System.Nullable<System.DateTime> _DateTime
	{
		get
		{
			return this.@__DateTime;
		}
		set
		{
			if ((this.@__DateTime != value))
			{
				this.On_DateTimeChanging(value);
				this.SendPropertyChanging();
				this.@__DateTime = value;
				this.SendPropertyChanged("_DateTime");
				this.On_DateTimeChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Temp", DbType="Float")]
	public System.Nullable<double> Temp
	{
		get
		{
			return this._Temp;
		}
		set
		{
			if ((this._Temp != value))
			{
				this.OnTempChanging(value);
				this.SendPropertyChanging();
				this._Temp = value;
				this.SendPropertyChanged("Temp");
				this.OnTempChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_DewPoint", DbType="Float")]
	public System.Nullable<double> DewPoint
	{
		get
		{
			return this._DewPoint;
		}
		set
		{
			if ((this._DewPoint != value))
			{
				this.OnDewPointChanging(value);
				this.SendPropertyChanging();
				this._DewPoint = value;
				this.SendPropertyChanged("DewPoint");
				this.OnDewPointChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_AbsHumidity", DbType="Float")]
	public System.Nullable<double> AbsHumidity
	{
		get
		{
			return this._AbsHumidity;
		}
		set
		{
			if ((this._AbsHumidity != value))
			{
				this.OnAbsHumidityChanging(value);
				this.SendPropertyChanging();
				this._AbsHumidity = value;
				this.SendPropertyChanged("AbsHumidity");
				this.OnAbsHumidityChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_RH", DbType="Float")]
	public System.Nullable<double> RH
	{
		get
		{
			return this._RH;
		}
		set
		{
			if ((this._RH != value))
			{
				this.OnRHChanging(value);
				this.SendPropertyChanging();
				this._RH = value;
				this.SendPropertyChanged("RH");
				this.OnRHChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_DateUploaded", DbType="DateTime")]
	public System.Nullable<System.DateTime> DateUploaded
	{
		get
		{
			return this._DateUploaded;
		}
		set
		{
			if ((this._DateUploaded != value))
			{
				this.OnDateUploadedChanging(value);
				this.SendPropertyChanging();
				this._DateUploaded = value;
				this.SendPropertyChanged("DateUploaded");
				this.OnDateUploadedChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_UploadedBy", DbType="VarChar(50)")]
	public string UploadedBy
	{
		get
		{
			return this._UploadedBy;
		}
		set
		{
			if ((this._UploadedBy != value))
			{
				this.OnUploadedByChanging(value);
				this.SendPropertyChanging();
				this._UploadedBy = value;
				this.SendPropertyChanged("UploadedBy");
				this.OnUploadedByChanged();
			}
		}
	}
	
	public event PropertyChangingEventHandler PropertyChanging;
	
	public event PropertyChangedEventHandler PropertyChanged;
	
	protected virtual void SendPropertyChanging()
	{
		if ((this.PropertyChanging != null))
		{
			this.PropertyChanging(this, emptyChangingEventArgs);
		}
	}
	
	protected virtual void SendPropertyChanged(String propertyName)
	{
		if ((this.PropertyChanged != null))
		{
			this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.lut_SITE_INFO")]
public partial class SITE_INFO
{
	
	private int _OBJECTID;
	
	private string _Site_ID;
	
	private string _SITE_NAME;
	
	private string _Directions;
	
	public SITE_INFO()
	{
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_OBJECTID", AutoSync=AutoSync.Always, DbType="Int NOT NULL IDENTITY", IsDbGenerated=true)]
	public int OBJECTID
	{
		get
		{
			return this._OBJECTID;
		}
		set
		{
			if ((this._OBJECTID != value))
			{
				this._OBJECTID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Site_ID", DbType="NVarChar(12)")]
	public string Site_ID
	{
		get
		{
			return this._Site_ID;
		}
		set
		{
			if ((this._Site_ID != value))
			{
				this._Site_ID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SITE_NAME", DbType="NVarChar(150)")]
	public string SITE_NAME
	{
		get
		{
			return this._SITE_NAME;
		}
		set
		{
			if ((this._SITE_NAME != value))
			{
				this._SITE_NAME = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Directions", DbType="NVarChar(MAX)")]
	public string Directions
	{
		get
		{
			return this._Directions;
		}
		set
		{
			if ((this._Directions != value))
			{
				this._Directions = value;
			}
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.lut_SITE_x_HOBO")]
public partial class SiteXHoboRow
{
	
	private int _OBJECTID;
	
	private string _SITE_ID;
	
	private string _HOBO_ID;
	
	private string _YEAR_;
	
	private string _TYPE;
	
	private string _CONTRIBUTOR;
	
	private string _COMMENTS;
	
	public SiteXHoboRow()
	{
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_OBJECTID", AutoSync=AutoSync.Always, DbType="Int NOT NULL IDENTITY", IsDbGenerated=true)]
	public int OBJECTID
	{
		get
		{
			return this._OBJECTID;
		}
		set
		{
			if ((this._OBJECTID != value))
			{
				this._OBJECTID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SITE_ID", DbType="NVarChar(20)")]
	public string SITE_ID
	{
		get
		{
			return this._SITE_ID;
		}
		set
		{
			if ((this._SITE_ID != value))
			{
				this._SITE_ID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_HOBO_ID", DbType="NVarChar(50)")]
	public string HOBO_ID
	{
		get
		{
			return this._HOBO_ID;
		}
		set
		{
			if ((this._HOBO_ID != value))
			{
				this._HOBO_ID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_YEAR_", DbType="NVarChar(50)")]
	public string YEAR_
	{
		get
		{
			return this._YEAR_;
		}
		set
		{
			if ((this._YEAR_ != value))
			{
				this._YEAR_ = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_TYPE", DbType="NVarChar(25)")]
	public string TYPE
	{
		get
		{
			return this._TYPE;
		}
		set
		{
			if ((this._TYPE != value))
			{
				this._TYPE = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_CONTRIBUTOR", DbType="NVarChar(50)")]
	public string CONTRIBUTOR
	{
		get
		{
			return this._CONTRIBUTOR;
		}
		set
		{
			if ((this._CONTRIBUTOR != value))
			{
				this._CONTRIBUTOR = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_COMMENTS", DbType="NVarChar(255)")]
	public string COMMENTS
	{
		get
		{
			return this._COMMENTS;
		}
		set
		{
			if ((this._COMMENTS != value))
			{
				this._COMMENTS = value;
			}
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="sdeloader.SITE")]
public partial class SITE
{
	
	private int _OBJECTID;
	
	private string _Site_ID;
	
	private System.Nullable<int> _Shape;
	
	public SITE()
	{
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_OBJECTID", AutoSync=AutoSync.Always, DbType="Int NOT NULL IDENTITY", IsDbGenerated=true)]
	public int OBJECTID
	{
		get
		{
			return this._OBJECTID;
		}
		set
		{
			if ((this._OBJECTID != value))
			{
				this._OBJECTID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Site_ID", DbType="NVarChar(12)")]
	public string Site_ID
	{
		get
		{
			return this._Site_ID;
		}
		set
		{
			if ((this._Site_ID != value))
			{
				this._Site_ID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Shape", DbType="Int")]
	public System.Nullable<int> Shape
	{
		get
		{
			return this._Shape;
		}
		set
		{
			if ((this._Shape != value))
			{
				this._Shape = value;
			}
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.lut_SITE_INFO")]
public partial class SiteInfo : INotifyPropertyChanging, INotifyPropertyChanged
{
	
	private static PropertyChangingEventArgs emptyChangingEventArgs = new PropertyChangingEventArgs(String.Empty);
	
	private int _OBJECTID;
	
	private string _Site_ID;
	
	private string _SITE_NAME;
	
	private string _Directions;
	
	private string _Color;
	
	private System.Nullable<System.DateTime> _DataStartDate;
	
	private System.Nullable<System.DateTime> _DataEndDate;
	
    #region Extensibility Method Definitions
    partial void OnLoaded();
    partial void OnValidate(System.Data.Linq.ChangeAction action);
    partial void OnCreated();
    partial void OnOBJECTIDChanging(int value);
    partial void OnOBJECTIDChanged();
    partial void OnSite_IDChanging(string value);
    partial void OnSite_IDChanged();
    partial void OnSITE_NAMEChanging(string value);
    partial void OnSITE_NAMEChanged();
    partial void OnDirectionsChanging(string value);
    partial void OnDirectionsChanged();
    partial void OnColorChanging(string value);
    partial void OnColorChanged();
    partial void OnDataStartDateChanging(System.Nullable<System.DateTime> value);
    partial void OnDataStartDateChanged();
    partial void OnDataEndDateChanging(System.Nullable<System.DateTime> value);
    partial void OnDataEndDateChanged();
    #endregion
	
	public SiteInfo()
	{
		OnCreated();
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_OBJECTID", AutoSync=AutoSync.OnInsert, DbType="Int NOT NULL IDENTITY", IsPrimaryKey=true, IsDbGenerated=true)]
	public int OBJECTID
	{
		get
		{
			return this._OBJECTID;
		}
		set
		{
			if ((this._OBJECTID != value))
			{
				this.OnOBJECTIDChanging(value);
				this.SendPropertyChanging();
				this._OBJECTID = value;
				this.SendPropertyChanged("OBJECTID");
				this.OnOBJECTIDChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Site_ID", DbType="NVarChar(12)")]
	public string Site_ID
	{
		get
		{
			return this._Site_ID;
		}
		set
		{
			if ((this._Site_ID != value))
			{
				this.OnSite_IDChanging(value);
				this.SendPropertyChanging();
				this._Site_ID = value;
				this.SendPropertyChanged("Site_ID");
				this.OnSite_IDChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SITE_NAME", DbType="NVarChar(150)")]
	public string SITE_NAME
	{
		get
		{
			return this._SITE_NAME;
		}
		set
		{
			if ((this._SITE_NAME != value))
			{
				this.OnSITE_NAMEChanging(value);
				this.SendPropertyChanging();
				this._SITE_NAME = value;
				this.SendPropertyChanged("SITE_NAME");
				this.OnSITE_NAMEChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Directions", DbType="NVarChar(MAX)")]
	public string Directions
	{
		get
		{
			return this._Directions;
		}
		set
		{
			if ((this._Directions != value))
			{
				this.OnDirectionsChanging(value);
				this.SendPropertyChanging();
				this._Directions = value;
				this.SendPropertyChanged("Directions");
				this.OnDirectionsChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Color", DbType="VarChar(15)")]
	public string Color
	{
		get
		{
			return this._Color;
		}
		set
		{
			if ((this._Color != value))
			{
				this.OnColorChanging(value);
				this.SendPropertyChanging();
				this._Color = value;
				this.SendPropertyChanged("Color");
				this.OnColorChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_DataStartDate", DbType="DateTime")]
	public System.Nullable<System.DateTime> DataStartDate
	{
		get
		{
			return this._DataStartDate;
		}
		set
		{
			if ((this._DataStartDate != value))
			{
				this.OnDataStartDateChanging(value);
				this.SendPropertyChanging();
				this._DataStartDate = value;
				this.SendPropertyChanged("DataStartDate");
				this.OnDataStartDateChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_DataEndDate", DbType="DateTime")]
	public System.Nullable<System.DateTime> DataEndDate
	{
		get
		{
			return this._DataEndDate;
		}
		set
		{
			if ((this._DataEndDate != value))
			{
				this.OnDataEndDateChanging(value);
				this.SendPropertyChanging();
				this._DataEndDate = value;
				this.SendPropertyChanged("DataEndDate");
				this.OnDataEndDateChanged();
			}
		}
	}
	
	public event PropertyChangingEventHandler PropertyChanging;
	
	public event PropertyChangedEventHandler PropertyChanged;
	
	protected virtual void SendPropertyChanging()
	{
		if ((this.PropertyChanging != null))
		{
			this.PropertyChanging(this, emptyChangingEventArgs);
		}
	}
	
	protected virtual void SendPropertyChanged(String propertyName)
	{
		if ((this.PropertyChanged != null))
		{
			this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.lut_SITE_x_HOBO")]
public partial class SiteHobo : INotifyPropertyChanging, INotifyPropertyChanged
{
	
	private static PropertyChangingEventArgs emptyChangingEventArgs = new PropertyChangingEventArgs(String.Empty);
	
	private int _OBJECTID;
	
	private string _SITE_ID;
	
	private string _HOBO_ID;
	
	private string _YEAR_;
	
	private string _TYPE;
	
	private string _CONTRIBUTOR;
	
	private string _COMMENTS;
	
    #region Extensibility Method Definitions
    partial void OnLoaded();
    partial void OnValidate(System.Data.Linq.ChangeAction action);
    partial void OnCreated();
    partial void OnOBJECTIDChanging(int value);
    partial void OnOBJECTIDChanged();
    partial void OnSITE_IDChanging(string value);
    partial void OnSITE_IDChanged();
    partial void OnHOBO_IDChanging(string value);
    partial void OnHOBO_IDChanged();
    partial void OnYEAR_Changing(string value);
    partial void OnYEAR_Changed();
    partial void OnTYPEChanging(string value);
    partial void OnTYPEChanged();
    partial void OnCONTRIBUTORChanging(string value);
    partial void OnCONTRIBUTORChanged();
    partial void OnCOMMENTSChanging(string value);
    partial void OnCOMMENTSChanged();
    #endregion
	
	public SiteHobo()
	{
		OnCreated();
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_OBJECTID", AutoSync=AutoSync.OnInsert, DbType="Int NOT NULL IDENTITY", IsPrimaryKey=true, IsDbGenerated=true)]
	public int OBJECTID
	{
		get
		{
			return this._OBJECTID;
		}
		set
		{
			if ((this._OBJECTID != value))
			{
				this.OnOBJECTIDChanging(value);
				this.SendPropertyChanging();
				this._OBJECTID = value;
				this.SendPropertyChanged("OBJECTID");
				this.OnOBJECTIDChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SITE_ID", DbType="NVarChar(20)")]
	public string SITE_ID
	{
		get
		{
			return this._SITE_ID;
		}
		set
		{
			if ((this._SITE_ID != value))
			{
				this.OnSITE_IDChanging(value);
				this.SendPropertyChanging();
				this._SITE_ID = value;
				this.SendPropertyChanged("SITE_ID");
				this.OnSITE_IDChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_HOBO_ID", DbType="NVarChar(50)")]
	public string HOBO_ID
	{
		get
		{
			return this._HOBO_ID;
		}
		set
		{
			if ((this._HOBO_ID != value))
			{
				this.OnHOBO_IDChanging(value);
				this.SendPropertyChanging();
				this._HOBO_ID = value;
				this.SendPropertyChanged("HOBO_ID");
				this.OnHOBO_IDChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_YEAR_", DbType="NVarChar(50)")]
	public string YEAR_
	{
		get
		{
			return this._YEAR_;
		}
		set
		{
			if ((this._YEAR_ != value))
			{
				this.OnYEAR_Changing(value);
				this.SendPropertyChanging();
				this._YEAR_ = value;
				this.SendPropertyChanged("YEAR_");
				this.OnYEAR_Changed();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_TYPE", DbType="NVarChar(25)")]
	public string TYPE
	{
		get
		{
			return this._TYPE;
		}
		set
		{
			if ((this._TYPE != value))
			{
				this.OnTYPEChanging(value);
				this.SendPropertyChanging();
				this._TYPE = value;
				this.SendPropertyChanged("TYPE");
				this.OnTYPEChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_CONTRIBUTOR", DbType="NVarChar(50)")]
	public string CONTRIBUTOR
	{
		get
		{
			return this._CONTRIBUTOR;
		}
		set
		{
			if ((this._CONTRIBUTOR != value))
			{
				this.OnCONTRIBUTORChanging(value);
				this.SendPropertyChanging();
				this._CONTRIBUTOR = value;
				this.SendPropertyChanged("CONTRIBUTOR");
				this.OnCONTRIBUTORChanged();
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_COMMENTS", DbType="NVarChar(255)")]
	public string COMMENTS
	{
		get
		{
			return this._COMMENTS;
		}
		set
		{
			if ((this._COMMENTS != value))
			{
				this.OnCOMMENTSChanging(value);
				this.SendPropertyChanging();
				this._COMMENTS = value;
				this.SendPropertyChanged("COMMENTS");
				this.OnCOMMENTSChanged();
			}
		}
	}
	
	public event PropertyChangingEventHandler PropertyChanging;
	
	public event PropertyChangedEventHandler PropertyChanged;
	
	protected virtual void SendPropertyChanging()
	{
		if ((this.PropertyChanging != null))
		{
			this.PropertyChanging(this, emptyChangingEventArgs);
		}
	}
	
	protected virtual void SendPropertyChanged(String propertyName)
	{
		if ((this.PropertyChanged != null))
		{
			this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.FinalMWAT")]
public partial class FinalMWAT
{
	
	private string _SITE_NAME;
	
	private string _TYPE;
	
	private string _HOBO_ID;
	
	private System.Nullable<System.DateTime> _Date;
	
	private System.Nullable<double> _tavg;
	
	private System.Nullable<double> _movAvg;
	
	private string _hoboday;
	
	private System.Nullable<decimal> _threshold;
	
	private string _YEAR_;
	
	private System.Nullable<double> _MaxOfmovAvg;
	
	private string _SiteID;
	
	public FinalMWAT()
	{
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SITE_NAME", DbType="NVarChar(150)")]
	public string SITE_NAME
	{
		get
		{
			return this._SITE_NAME;
		}
		set
		{
			if ((this._SITE_NAME != value))
			{
				this._SITE_NAME = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_TYPE", DbType="NVarChar(25)")]
	public string TYPE
	{
		get
		{
			return this._TYPE;
		}
		set
		{
			if ((this._TYPE != value))
			{
				this._TYPE = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_HOBO_ID", DbType="NVarChar(50)")]
	public string HOBO_ID
	{
		get
		{
			return this._HOBO_ID;
		}
		set
		{
			if ((this._HOBO_ID != value))
			{
				this._HOBO_ID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Date", DbType="DateTime")]
	public System.Nullable<System.DateTime> Date
	{
		get
		{
			return this._Date;
		}
		set
		{
			if ((this._Date != value))
			{
				this._Date = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_tavg", DbType="Float")]
	public System.Nullable<double> tavg
	{
		get
		{
			return this._tavg;
		}
		set
		{
			if ((this._tavg != value))
			{
				this._tavg = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_movAvg", DbType="Float")]
	public System.Nullable<double> movAvg
	{
		get
		{
			return this._movAvg;
		}
		set
		{
			if ((this._movAvg != value))
			{
				this._movAvg = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_hoboday", DbType="NVarChar(255)")]
	public string hoboday
	{
		get
		{
			return this._hoboday;
		}
		set
		{
			if ((this._hoboday != value))
			{
				this._hoboday = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_threshold", DbType="Decimal(28,1)")]
	public System.Nullable<decimal> threshold
	{
		get
		{
			return this._threshold;
		}
		set
		{
			if ((this._threshold != value))
			{
				this._threshold = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_YEAR_", DbType="NVarChar(50)")]
	public string YEAR_
	{
		get
		{
			return this._YEAR_;
		}
		set
		{
			if ((this._YEAR_ != value))
			{
				this._YEAR_ = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_MaxOfmovAvg", DbType="Float")]
	public System.Nullable<double> MaxOfmovAvg
	{
		get
		{
			return this._MaxOfmovAvg;
		}
		set
		{
			if ((this._MaxOfmovAvg != value))
			{
				this._MaxOfmovAvg = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SiteID", DbType="NVarChar(12)")]
	public string SiteID
	{
		get
		{
			return this._SiteID;
		}
		set
		{
			if ((this._SiteID != value))
			{
				this._SiteID = value;
			}
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.FinalMWMT")]
public partial class FinalMWMT
{
	
	private string _SiteID;
	
	private string _SITE_NAME;
	
	private string _TYPE;
	
	private string _HOBO_ID;
	
	private System.Nullable<System.DateTime> _Date;
	
	private System.Nullable<double> _tmax;
	
	private System.Nullable<double> _movAvg;
	
	private string _hoboday;
	
	private System.Nullable<decimal> _threshold;
	
	private string _YEAR_;
	
	private System.Nullable<double> _MaxOfmovAvg;
	
	public FinalMWMT()
	{
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SiteID", DbType="NVarChar(12)")]
	public string SiteID
	{
		get
		{
			return this._SiteID;
		}
		set
		{
			if ((this._SiteID != value))
			{
				this._SiteID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SITE_NAME", DbType="NVarChar(150)")]
	public string SITE_NAME
	{
		get
		{
			return this._SITE_NAME;
		}
		set
		{
			if ((this._SITE_NAME != value))
			{
				this._SITE_NAME = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_TYPE", DbType="NVarChar(25)")]
	public string TYPE
	{
		get
		{
			return this._TYPE;
		}
		set
		{
			if ((this._TYPE != value))
			{
				this._TYPE = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_HOBO_ID", DbType="NVarChar(50)")]
	public string HOBO_ID
	{
		get
		{
			return this._HOBO_ID;
		}
		set
		{
			if ((this._HOBO_ID != value))
			{
				this._HOBO_ID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Date", DbType="DateTime")]
	public System.Nullable<System.DateTime> Date
	{
		get
		{
			return this._Date;
		}
		set
		{
			if ((this._Date != value))
			{
				this._Date = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_tmax", DbType="Float")]
	public System.Nullable<double> tmax
	{
		get
		{
			return this._tmax;
		}
		set
		{
			if ((this._tmax != value))
			{
				this._tmax = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_movAvg", DbType="Float")]
	public System.Nullable<double> movAvg
	{
		get
		{
			return this._movAvg;
		}
		set
		{
			if ((this._movAvg != value))
			{
				this._movAvg = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_hoboday", DbType="NVarChar(255)")]
	public string hoboday
	{
		get
		{
			return this._hoboday;
		}
		set
		{
			if ((this._hoboday != value))
			{
				this._hoboday = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_threshold", DbType="Decimal(28,1)")]
	public System.Nullable<decimal> threshold
	{
		get
		{
			return this._threshold;
		}
		set
		{
			if ((this._threshold != value))
			{
				this._threshold = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_YEAR_", DbType="NVarChar(50)")]
	public string YEAR_
	{
		get
		{
			return this._YEAR_;
		}
		set
		{
			if ((this._YEAR_ != value))
			{
				this._YEAR_ = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_MaxOfmovAvg", DbType="Float")]
	public System.Nullable<double> MaxOfmovAvg
	{
		get
		{
			return this._MaxOfmovAvg;
		}
		set
		{
			if ((this._MaxOfmovAvg != value))
			{
				this._MaxOfmovAvg = value;
			}
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.MWAT")]
public partial class MWAT
{
	
	private string _HOBO_ID;
	
	private System.Nullable<System.DateTime> _Date;
	
	private System.Nullable<double> _tavg;
	
	private System.Nullable<double> _movAvg;
	
	private string _hoboday;
	
	public MWAT()
	{
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_HOBO_ID", DbType="NVarChar(50)")]
	public string HOBO_ID
	{
		get
		{
			return this._HOBO_ID;
		}
		set
		{
			if ((this._HOBO_ID != value))
			{
				this._HOBO_ID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Date", DbType="DateTime")]
	public System.Nullable<System.DateTime> Date
	{
		get
		{
			return this._Date;
		}
		set
		{
			if ((this._Date != value))
			{
				this._Date = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_tavg", DbType="Float")]
	public System.Nullable<double> tavg
	{
		get
		{
			return this._tavg;
		}
		set
		{
			if ((this._tavg != value))
			{
				this._tavg = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_movAvg", DbType="Float")]
	public System.Nullable<double> movAvg
	{
		get
		{
			return this._movAvg;
		}
		set
		{
			if ((this._movAvg != value))
			{
				this._movAvg = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_hoboday", DbType="NVarChar(255)")]
	public string hoboday
	{
		get
		{
			return this._hoboday;
		}
		set
		{
			if ((this._hoboday != value))
			{
				this._hoboday = value;
			}
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.MWATMax")]
public partial class MWATMax
{
	
	private string _YEAR_;
	
	private string _HOBO_ID;
	
	private string _SITE_NAME;
	
	private string _TYPE;
	
	private string _MaxMWAT;
	
	private System.Nullable<int> _DaysExceed;
	
	private System.Nullable<double> _Percent;
	
	private string _COMMENTS;
	
	private string _SiteID;
	
	public MWATMax()
	{
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_YEAR_", DbType="NVarChar(50)")]
	public string YEAR_
	{
		get
		{
			return this._YEAR_;
		}
		set
		{
			if ((this._YEAR_ != value))
			{
				this._YEAR_ = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_HOBO_ID", DbType="NVarChar(50)")]
	public string HOBO_ID
	{
		get
		{
			return this._HOBO_ID;
		}
		set
		{
			if ((this._HOBO_ID != value))
			{
				this._HOBO_ID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SITE_NAME", DbType="NVarChar(150)")]
	public string SITE_NAME
	{
		get
		{
			return this._SITE_NAME;
		}
		set
		{
			if ((this._SITE_NAME != value))
			{
				this._SITE_NAME = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_TYPE", DbType="NVarChar(25)")]
	public string TYPE
	{
		get
		{
			return this._TYPE;
		}
		set
		{
			if ((this._TYPE != value))
			{
				this._TYPE = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_MaxMWAT", DbType="NVarChar(255)")]
	public string MaxMWAT
	{
		get
		{
			return this._MaxMWAT;
		}
		set
		{
			if ((this._MaxMWAT != value))
			{
				this._MaxMWAT = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_DaysExceed", DbType="Int")]
	public System.Nullable<int> DaysExceed
	{
		get
		{
			return this._DaysExceed;
		}
		set
		{
			if ((this._DaysExceed != value))
			{
				this._DaysExceed = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Name="[Percent]", Storage="_Percent", DbType="Float")]
	public System.Nullable<double> Percent
	{
		get
		{
			return this._Percent;
		}
		set
		{
			if ((this._Percent != value))
			{
				this._Percent = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_COMMENTS", DbType="NVarChar(255)")]
	public string COMMENTS
	{
		get
		{
			return this._COMMENTS;
		}
		set
		{
			if ((this._COMMENTS != value))
			{
				this._COMMENTS = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SiteID", DbType="NVarChar(12)")]
	public string SiteID
	{
		get
		{
			return this._SiteID;
		}
		set
		{
			if ((this._SiteID != value))
			{
				this._SiteID = value;
			}
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.MWMT")]
public partial class MWMT
{
	
	private string _HOBO_ID;
	
	private System.Nullable<System.DateTime> _Date;
	
	private System.Nullable<double> _tmax;
	
	private System.Nullable<double> _movAvg;
	
	private string _hoboday;
	
	public MWMT()
	{
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_HOBO_ID", DbType="NVarChar(50)")]
	public string HOBO_ID
	{
		get
		{
			return this._HOBO_ID;
		}
		set
		{
			if ((this._HOBO_ID != value))
			{
				this._HOBO_ID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_Date", DbType="DateTime")]
	public System.Nullable<System.DateTime> Date
	{
		get
		{
			return this._Date;
		}
		set
		{
			if ((this._Date != value))
			{
				this._Date = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_tmax", DbType="Float")]
	public System.Nullable<double> tmax
	{
		get
		{
			return this._tmax;
		}
		set
		{
			if ((this._tmax != value))
			{
				this._tmax = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_movAvg", DbType="Float")]
	public System.Nullable<double> movAvg
	{
		get
		{
			return this._movAvg;
		}
		set
		{
			if ((this._movAvg != value))
			{
				this._movAvg = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_hoboday", DbType="NVarChar(255)")]
	public string hoboday
	{
		get
		{
			return this._hoboday;
		}
		set
		{
			if ((this._hoboday != value))
			{
				this._hoboday = value;
			}
		}
	}
}

[global::System.Data.Linq.Mapping.TableAttribute(Name="dbo.MWMTMax")]
public partial class MWMTMax
{
	
	private string _YEAR_;
	
	private string _HOBO_ID;
	
	private string _SITE_NAME;
	
	private string _TYPE;
	
	private string _MaxMWMT;
	
	private System.Nullable<int> _DaysExceed;
	
	private System.Nullable<double> _Percent;
	
	private string _COMMENTS;
	
	private string _SiteID;
	
	public MWMTMax()
	{
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_YEAR_", DbType="NVarChar(50)")]
	public string YEAR_
	{
		get
		{
			return this._YEAR_;
		}
		set
		{
			if ((this._YEAR_ != value))
			{
				this._YEAR_ = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_HOBO_ID", DbType="NVarChar(50)")]
	public string HOBO_ID
	{
		get
		{
			return this._HOBO_ID;
		}
		set
		{
			if ((this._HOBO_ID != value))
			{
				this._HOBO_ID = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SITE_NAME", DbType="NVarChar(150)")]
	public string SITE_NAME
	{
		get
		{
			return this._SITE_NAME;
		}
		set
		{
			if ((this._SITE_NAME != value))
			{
				this._SITE_NAME = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_TYPE", DbType="NVarChar(25)")]
	public string TYPE
	{
		get
		{
			return this._TYPE;
		}
		set
		{
			if ((this._TYPE != value))
			{
				this._TYPE = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_MaxMWMT", DbType="NVarChar(255)")]
	public string MaxMWMT
	{
		get
		{
			return this._MaxMWMT;
		}
		set
		{
			if ((this._MaxMWMT != value))
			{
				this._MaxMWMT = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_DaysExceed", DbType="Int")]
	public System.Nullable<int> DaysExceed
	{
		get
		{
			return this._DaysExceed;
		}
		set
		{
			if ((this._DaysExceed != value))
			{
				this._DaysExceed = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Name="[Percent]", Storage="_Percent", DbType="Float")]
	public System.Nullable<double> Percent
	{
		get
		{
			return this._Percent;
		}
		set
		{
			if ((this._Percent != value))
			{
				this._Percent = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_COMMENTS", DbType="NVarChar(255)")]
	public string COMMENTS
	{
		get
		{
			return this._COMMENTS;
		}
		set
		{
			if ((this._COMMENTS != value))
			{
				this._COMMENTS = value;
			}
		}
	}
	
	[global::System.Data.Linq.Mapping.ColumnAttribute(Storage="_SiteID", DbType="NVarChar(12)")]
	public string SiteID
	{
		get
		{
			return this._SiteID;
		}
		set
		{
			if ((this._SiteID != value))
			{
				this._SiteID = value;
			}
		}
	}
}
#pragma warning restore 1591