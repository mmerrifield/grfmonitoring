﻿#pragma checksum "C:\Users\aedwards\Documents\Visual Studio 2010\Projects\Garcia4\GarciaCharts\MainPage.xaml" "{406ea660-64cf-4c82-b6f0-42d48172a799}" "2BADFDF4DE9BC379496761D926AD2D0C"
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.1
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using GarciaCharts;
using System;
using System.Windows;
using System.Windows.Automation;
using System.Windows.Automation.Peers;
using System.Windows.Automation.Provider;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Imaging;
using System.Windows.Resources;
using System.Windows.Shapes;
using System.Windows.Threading;


namespace GarciaCharts {
    
    
    public partial class MainPage : System.Windows.Controls.UserControl {
        
        internal System.Windows.Controls.Canvas RealRoot;
        
        internal GarciaCharts.MessageBox messageBox;
        
        internal System.Windows.Controls.StackPanel LayoutRoot;
        
        internal System.Windows.Controls.StackPanel filterPanel;
        
        internal System.Windows.Controls.StackPanel spFilterControls;
        
        internal Telerik.Windows.Controls.RadDatePicker dpStartDate;
        
        internal Telerik.Windows.Controls.RadDatePicker dpEndDate;
        
        internal System.Windows.Controls.ComboBox cboSites;
        
        internal System.Windows.Controls.Button btnGenerate;
        
        internal System.Windows.Controls.StackPanel spChart;
        
        private bool _contentLoaded;
        
        /// <summary>
        /// InitializeComponent
        /// </summary>
        [System.Diagnostics.DebuggerNonUserCodeAttribute()]
        public void InitializeComponent() {
            if (_contentLoaded) {
                return;
            }
            _contentLoaded = true;
            System.Windows.Application.LoadComponent(this, new System.Uri("/GarciaCharts;component/MainPage.xaml", System.UriKind.Relative));
            this.RealRoot = ((System.Windows.Controls.Canvas)(this.FindName("RealRoot")));
            this.messageBox = ((GarciaCharts.MessageBox)(this.FindName("messageBox")));
            this.LayoutRoot = ((System.Windows.Controls.StackPanel)(this.FindName("LayoutRoot")));
            this.filterPanel = ((System.Windows.Controls.StackPanel)(this.FindName("filterPanel")));
            this.spFilterControls = ((System.Windows.Controls.StackPanel)(this.FindName("spFilterControls")));
            this.dpStartDate = ((Telerik.Windows.Controls.RadDatePicker)(this.FindName("dpStartDate")));
            this.dpEndDate = ((Telerik.Windows.Controls.RadDatePicker)(this.FindName("dpEndDate")));
            this.cboSites = ((System.Windows.Controls.ComboBox)(this.FindName("cboSites")));
            this.btnGenerate = ((System.Windows.Controls.Button)(this.FindName("btnGenerate")));
            this.spChart = ((System.Windows.Controls.StackPanel)(this.FindName("spChart")));
        }
    }
}

