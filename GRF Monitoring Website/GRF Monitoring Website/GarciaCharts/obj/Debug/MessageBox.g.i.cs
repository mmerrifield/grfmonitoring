﻿#pragma checksum "C:\Users\aedwards\Documents\Visual Studio 2010\Projects\Garcia4\GarciaCharts\MessageBox.xaml" "{406ea660-64cf-4c82-b6f0-42d48172a799}" "9EA8C38DB03A4BBB62FE895A48BC4D1B"
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.1
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

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
    
    
    public partial class MyMessageBox : System.Windows.Controls.UserControl {
        
        internal System.Windows.Media.Animation.Storyboard myStoryboard;
        
        internal System.Windows.Controls.Canvas LayoutRoot;
        
        internal System.Windows.Controls.MediaElement beepSound;
        
        internal System.Windows.Controls.Border dialogBox;
        
        internal System.Windows.Controls.TextBlock tbTitle;
        
        internal System.Windows.Controls.TextBlock tbMessage;
        
        internal System.Windows.Controls.Button btnDismiss;
        
        internal System.Windows.Media.ScaleTransform scaleTransform;
        
        internal System.Windows.Media.RotateTransform rotateTransform;
        
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
            System.Windows.Application.LoadComponent(this, new System.Uri("/GarciaCharts;component/MessageBox.xaml", System.UriKind.Relative));
            this.myStoryboard = ((System.Windows.Media.Animation.Storyboard)(this.FindName("myStoryboard")));
            this.LayoutRoot = ((System.Windows.Controls.Canvas)(this.FindName("LayoutRoot")));
            this.beepSound = ((System.Windows.Controls.MediaElement)(this.FindName("beepSound")));
            this.dialogBox = ((System.Windows.Controls.Border)(this.FindName("dialogBox")));
            this.tbTitle = ((System.Windows.Controls.TextBlock)(this.FindName("tbTitle")));
            this.tbMessage = ((System.Windows.Controls.TextBlock)(this.FindName("tbMessage")));
            this.btnDismiss = ((System.Windows.Controls.Button)(this.FindName("btnDismiss")));
            this.scaleTransform = ((System.Windows.Media.ScaleTransform)(this.FindName("scaleTransform")));
            this.rotateTransform = ((System.Windows.Media.RotateTransform)(this.FindName("rotateTransform")));
        }
    }
}
