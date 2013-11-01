﻿#pragma checksum "C:\GRF Monitoring Website\ESRITest\ESRIMapPage.xaml" "{406ea660-64cf-4c82-b6f0-42d48172a799}" "0166E4759B13234508844DECB1F35E81"
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.1
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using ESRI.ArcGIS.Client.Symbols;
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


namespace ESRITest {
    
    
    public partial class ESRIMapPage : System.Windows.Controls.UserControl {
        
        internal System.Windows.Controls.Grid LayoutRoot;
        
        internal ESRI.ArcGIS.Client.Symbols.SimpleFillSymbol ResultsFillSymbol;
        
        internal System.Windows.Controls.RowDefinition fullscreenLinkRow;
        
        internal System.Windows.Controls.Grid gridTools;
        
        internal System.Windows.Controls.Grid gridFullscreenLink;
        
        internal System.Windows.Controls.ComboBox cboSites;
        
        internal System.Windows.Controls.ComboBox cboLayers;
        
        internal System.Windows.Controls.HyperlinkButton hlFullScreen;
        
        internal ESRI.ArcGIS.Client.Map MyMap;
        
        internal ESRI.ArcGIS.Client.ArcGISTiledMapServiceLayer TopoLayer;
        
        internal ESRI.ArcGIS.Client.ArcGISTiledMapServiceLayer ImageLayer;
        
        internal ESRI.ArcGIS.Client.FeatureLayer sitesLayer;
        
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
            System.Windows.Application.LoadComponent(this, new System.Uri("/ESRITest;component/ESRIMapPage.xaml", System.UriKind.Relative));
            this.LayoutRoot = ((System.Windows.Controls.Grid)(this.FindName("LayoutRoot")));
            this.ResultsFillSymbol = ((ESRI.ArcGIS.Client.Symbols.SimpleFillSymbol)(this.FindName("ResultsFillSymbol")));
            this.fullscreenLinkRow = ((System.Windows.Controls.RowDefinition)(this.FindName("fullscreenLinkRow")));
            this.gridTools = ((System.Windows.Controls.Grid)(this.FindName("gridTools")));
            this.gridFullscreenLink = ((System.Windows.Controls.Grid)(this.FindName("gridFullscreenLink")));
            this.cboSites = ((System.Windows.Controls.ComboBox)(this.FindName("cboSites")));
            this.cboLayers = ((System.Windows.Controls.ComboBox)(this.FindName("cboLayers")));
            this.hlFullScreen = ((System.Windows.Controls.HyperlinkButton)(this.FindName("hlFullScreen")));
            this.MyMap = ((ESRI.ArcGIS.Client.Map)(this.FindName("MyMap")));
            this.TopoLayer = ((ESRI.ArcGIS.Client.ArcGISTiledMapServiceLayer)(this.FindName("TopoLayer")));
            this.ImageLayer = ((ESRI.ArcGIS.Client.ArcGISTiledMapServiceLayer)(this.FindName("ImageLayer")));
            this.sitesLayer = ((ESRI.ArcGIS.Client.FeatureLayer)(this.FindName("sitesLayer")));
        }
    }
}
