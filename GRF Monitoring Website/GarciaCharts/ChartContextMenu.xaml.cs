using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

namespace GarciaCharts
{
    public partial class ChartContextMenu : UserControl
    {
        public event ChartContextMenuEventHandler chartContextMenuCommandIssued;

        public ChartContextMenu()
        {
            InitializeComponent();
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {

        }

        public void show(Point pt)
        {
            this.Visibility = System.Windows.Visibility.Visible;

            double currX = pt.X;
            double currY = pt.Y;

            this.SetValue(Canvas.LeftProperty, currX);
            this.SetValue(Canvas.TopProperty, currY);
        }

        public void hide()
        {
            this.Visibility = System.Windows.Visibility.Collapsed;
        }

        private void btnClose_Click(object sender, RoutedEventArgs e)
        {
            hide();
        }

        private void rmiRefreshChart_Click(object sender, Telerik.Windows.RadRoutedEventArgs e)
        {
            if (this.chartContextMenuCommandIssued != null)
                chartContextMenuCommandIssued(this, new ChartContextMenuEventArgs("RefreshChart"));
        }

        private void rmiToggleLegend_Click(object sender, Telerik.Windows.RadRoutedEventArgs e)
        {
            if (this.chartContextMenuCommandIssued != null)
                chartContextMenuCommandIssued(this, new ChartContextMenuEventArgs("ToggleLegend"));
        }

        private void rmiFullScreen_Click(object sender, Telerik.Windows.RadRoutedEventArgs e)
        {
            if (this.chartContextMenuCommandIssued != null)
                chartContextMenuCommandIssued(this, new ChartContextMenuEventArgs("FullScreen"));
        }

        private void rmiExportToPng_Click(object sender, Telerik.Windows.RadRoutedEventArgs e)
        {
            if (this.chartContextMenuCommandIssued != null)
                chartContextMenuCommandIssued(this, new ChartContextMenuEventArgs("ExportToPng"));
        }

        private void rmiExportToBmp_Click(object sender, Telerik.Windows.RadRoutedEventArgs e)
        {
            if (this.chartContextMenuCommandIssued != null)
                chartContextMenuCommandIssued(this, new ChartContextMenuEventArgs("ExportToBmp"));
        }

        private void rmiExportToExcel_Click(object sender, Telerik.Windows.RadRoutedEventArgs e)
        {
            if (this.chartContextMenuCommandIssued != null)
                chartContextMenuCommandIssued(this, new ChartContextMenuEventArgs("ExportToExcel"));
        }

        private void rmiExportToXPS_Click(object sender, Telerik.Windows.RadRoutedEventArgs e)
        {
            if (this.chartContextMenuCommandIssued != null)
                chartContextMenuCommandIssued(this, new ChartContextMenuEventArgs("ExportToXps"));
        }


    }

    public delegate void ChartContextMenuEventHandler(object sender, ChartContextMenuEventArgs e);
    public class ChartContextMenuEventArgs : EventArgs
    {
        public string command { get; set; }

        public ChartContextMenuEventArgs(string theCommand)
        {
            command = theCommand;
        }
        
    }
}
