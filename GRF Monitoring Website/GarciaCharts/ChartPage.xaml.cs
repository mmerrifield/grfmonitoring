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
using GarciaCharts.GarciaRef;
using Telerik.Windows.Controls;
using Telerik.Windows.Controls.Charting;
using System.Collections.ObjectModel;
using System.IO;
using System.Windows.Browser;

namespace GarciaCharts
{
    public partial class ChartPage : UserControl
    {
        #region global variables

        private GarciaRef.SLServiceClient client;
        private ObservableCollection<GarciaSite> sites;
        private DateTime startDate;
        private DateTime endDate;
        private SilverlightServiceCallResult sr;
        private string currentReport = "MWAT";
        private bool allSitesAreSelected = false;

        #endregion

        #region Constructor and page load

        public ChartPage()
        {
            InitializeComponent();

            client = new SLServiceClient();
            client.Endpoint.Binding.OpenTimeout = TimeSpan.FromSeconds(600);
            client.Endpoint.Binding.ReceiveTimeout = TimeSpan.FromMinutes(10);


            // Attach Handlers
            this.Loaded += new RoutedEventHandler(MainPage_Loaded);
            client.getMWATDataCompleted += new EventHandler<getMWATDataCompletedEventArgs>(client_getMWATDataCompleted);
            client.getMWMTDataCompleted += new EventHandler<getMWMTDataCompletedEventArgs>(client_getMWMTDataCompleted);
            client.getSitesCompleted += new EventHandler<getSitesCompletedEventArgs>(client_getSitesCompleted);
            client.getMaxMWATDataCompleted += new EventHandler<getMaxMWATDataCompletedEventArgs>(client_getMaxMWATDataCompleted);
            client.getMaxMWMTDataCompleted += new EventHandler<getMaxMWMTDataCompletedEventArgs>(client_getMaxMWMTDataCompleted);
            chartMenu.chartContextMenuCommandIssued += new ChartContextMenuEventHandler(chartMenu_chartContextMenuCommandIssued);

            radChart1.MouseRightButtonDown += new MouseButtonEventHandler(radChart1_MouseRightButtonDown);
            radChart1.MouseLeftButtonUp += new MouseButtonEventHandler(radChart1_MouseLeftButtonUp);

        }

        void MainPage_Loaded(object sender, RoutedEventArgs e)
        {
            cboSites.IsEnabled = false;
            this.Cursor = Cursors.Wait;
            client.getSitesAsync(sr);
        }

        void client_getSitesCompleted(object sender, getSitesCompletedEventArgs e)
        {
            if (e.Error == null)
            {
                if (e.sr.serviceCallResult == ServiceCallResult.Success)
                {
                    this.Cursor = Cursors.Arrow;
                    cboSites.IsEnabled = true;
                    sites = e.Result;
                    populateSitesDropdown(sites);
                }
                else
                {
                    MessageBox.Show(e.sr.message, "Error", MessageBoxButton.OK);
                }
            }
            else
            {
                MessageBox.Show(e.Error.Message, "Network Error", MessageBoxButton.OK);
            }

        }

        #endregion

        #region Seasons, Sites, Report Types

        private void reportType_Click(object sender, RoutedEventArgs e)
        {
            HyperlinkButton btn = sender as HyperlinkButton;

            switch (btn.Name)
            {
                case "hlMWAT":
                    currentReport = "MWAT";
                    tbReportTitle.Text = "MWAT Report";

                    tbFooter.Text = "To calculate mean weekly average temperature (MWAT), first daily average temperatures are determined from the raw water temperature data. Then mean weekly average temperatures are calculated by averaging daily mean temperatures for each 7-day period (with a moving 7-day window) after Welsh et al. (2001)." +
                        "\n\n"
                        + "* Welsh, H. H., G. R. Hodgson, B. C. Harvey, and M. F. Roche. 2001. Distribution of juvenile coho salmon (Oncorhynchus kisutch) in relation to water temperature in tributaries of the Mattole River, California. North American Journal of Fisheries Management 21: 464-470.";

                    break;

                case "hlMWATMax":
                    currentReport = "MWATMax";
                    tbReportTitle.Text = "MWAT Max Report";

                    tbFooter.Text = "To calculate mean weekly average temperature (MWAT), first daily average temperatures are determined from the raw water temperature data. Then mean weekly average temperatures (MWAT) are calculated by averaging daily mean temperatures for each 7-day period (with a moving 7-day window) after Welsh et al. (2001). Additionally, following Welsh et al. (2001), we report the highest average MWAT for the entire summer for each site sampled. Following Maahs and Barber (2001) and Hines and Ambrose (2000), we also report the number of sample periods, and percentage of total sample periods that MWAT exceeds threshold levels at each sample point.  The MWAT threshold follows that determined by Welsh et al. (2001) for coho salmon in the Mattole River in Northern California, and is 16.7°C."
                        + "\n\n"
                        + "*Hines, D. and J. Ambrose. 2000. Evaluation of Stream Temperatures Based on Observations of Juvenile Coho Salmon in Northern California Streams. Unpublished cooperative report. Campbell Timberland Management, Inc. and National Marine Fisheries Service."
                        + "\n\n"
                        + "*Maahs, M. and T. J. Barber. 2001. The Garcia River Instream Monitoring Project. Final report to California Department of Forestry and Fire Protection. Mendocino County Resources Conservation District. Ukiah, California."
                        + "\n\n"
                        + "* Welsh, H. H., G. R. Hodgson, B. C. Harvey, and M. F. Roche. 2001. Distribution of juvenile coho salmon (Oncorhynchus kisutch) in relation to water temperature in tributaries of the Mattole River, California. North American Journal of Fisheries Management 21: 464-470.";


                    break;

                case "hlMWMT":
                    currentReport = "MWMT";
                    tbReportTitle.Text = "MWMT Report";

                    tbFooter.Text = "To calculate mean weekly maximum temperature (MWMT), first daily maximum temperatures are determined from the raw water temperature data. Then maximum weekly maximum temperatures are calculated by averaging daily maximum temperatures for each 7-day period (with a moving 7-day window) after Welsh et al. (2001)." +
                        "\n\n" +
                        "* Welsh, H. H., G. R. Hodgson, B. C. Harvey, and M. F. Roche. 2001. Distribution of juvenile coho salmon (Oncorhynchus kisutch) in relation to water temperature in tributaries of the Mattole River, California. North American Journal of Fisheries Management 21: 464-470.";

                    break;

                case "hlMWMTMax":
                    currentReport = "MWMTMax";
                    tbReportTitle.Text = "MWMT Max Report";

                    tbFooter.Text = "To calculate mean weekly maximum temperature (MWMT), first daily maximum temperatures are determined from the raw water temperature data. Then maximum weekly maximum temperatures are calculated by averaging daily maximum temperatures for each 7-day period (with a moving 7-day window) following Welsh et al. (2001). Additionally, following Welsh et al. (2001), we report the highest average MWMT for the entire summer for each site sampled. Following Maahs and Barber (2001) and Hines and Ambrose (2000), we also report the number of sample periods, and percentage of total sample periods that MWMT exceeds threshold levels at each sample point.  The MWMT threshold follows that determined by Welsh et al. (2001) for coho salmon in the Mattole River in Northern California, and is 18.0°C."
                        + "\n\n"
                        + "*Hines, D. and J. Ambrose. 2000. Evaluation of Stream Temperatures Based on Observations of Juvenile Coho Salmon in Northern California Streams. Unpublished cooperative report. Campbell Timberland Management, Inc. and National Marine Fisheries Service."
                        + "\n\n"
                        + "*Maahs, M. and T. J. Barber. 2001. The Garcia River Instream Monitoring Project. Final report to California Department of Forestry and Fire Protection. Mendocino County Resources Conservation District. Ukiah, California."
                        + "\n\n"
                        + "* Welsh, H. H., G. R. Hodgson, B. C. Harvey, and M. F. Roche. 2001. Distribution of juvenile coho salmon (Oncorhynchus kisutch) in relation to water temperature in tributaries of the Mattole River, California. North American Journal of Fisheries Management 21: 464-470.";


                    break;
            }

            // set all other links to underline
            tbMWATLink.TextDecorations = TextDecorations.Underline;
            tbMWATMaxLink.TextDecorations = TextDecorations.Underline;
            tbMWMTLink.TextDecorations = TextDecorations.Underline;
            tbMWMTMaxLink.TextDecorations = TextDecorations.Underline;

            // un-underline the selected link
            TextBlock block = btn.Content as TextBlock;
            block.TextDecorations = null;

            cboSeason.Focus();  // takes focus away from hyperlink, so it isn't boxed
        }

        private void populateSitesDropdown(IEnumerable<GarciaSite> selectedSites) 
        {
            cboSites.Items.Clear();

            // add 'All Sites' item
            CheckBox box = new CheckBox();
            box.Content = "All Sites";
            box.IsChecked = allSitesAreSelected;
            box.Checked += new RoutedEventHandler(box_Checked);
            box.Unchecked += new RoutedEventHandler(box_Unchecked);
            ComboBoxItem tem = new ComboBoxItem();
            tem.Content = box;
            cboSites.Items.Add(tem);

            foreach (GarciaSite site in selectedSites)
            {
                cboSites.Items.Add(site);
            }
        }

        void box_Unchecked(object sender, RoutedEventArgs e)
        {
            allSitesAreSelected = false;
        }

        void box_Checked(object sender, RoutedEventArgs e)
        {
            allSitesAreSelected = true;
        }

        private void cboSeason_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            ComboBox cbo = sender as ComboBox;
            
            if (cbo == null || cbo.SelectedItem == null)
                return;

            String selectedYear = (cbo.SelectedItem as ComboBoxItem).Content.ToString();

            if (selectedYear == "(Select)")
                return;

            // update the Sites dropdown


            IEnumerable<GarciaSite> filteredSites = from s in sites
                                                    where s.years.Contains(selectedYear)
                                                    select s;
            
            populateSitesDropdown(filteredSites);

        }

        #endregion

        #region Generation of Reports

        private void btnGenerate_Click(object sender, RoutedEventArgs e)
        {
            generateChart();
        }

        void generateChart()
        {
            ObservableCollection<string> strSelectedSites = new ObservableCollection<string>();
            List<GarciaSite> selectedSites = new List<GarciaSite>();

            for (int i = 1; i < cboSites.Items.Count; i++)
            {

                GarciaSite st = cboSites.Items[i] as GarciaSite;
                if (st.isSelected || allSitesAreSelected)
                {
                    selectedSites.Add(st);
                    strSelectedSites.Add(st.siteID);
                }
            }

            if (strSelectedSites.Count == 0)
            {
                MessageBox.Show("Please select one or more Sites", "Error", MessageBoxButton.OK);
                return;
            }

            String selectedYear = (cboSeason.SelectedItem as ComboBoxItem).Content.ToString();

            if (selectedYear == "(Select)")
            {
                MessageBox.Show("Please select a Season", "Error", MessageBoxButton.OK);
                return;
            }

            // update the Sites dropdown
            startDate = DateTime.Parse("1/1/" + selectedYear);
            endDate = DateTime.Parse("12/31/" + selectedYear);


            this.Cursor = Cursors.Wait;

            // render the selected report
            switch (currentReport)
            {
                case "MWAT":
                    client.getMWATDataAsync(startDate, endDate, strSelectedSites, sr, selectedSites);
                    break;

                case "MWMT":
                    client.getMWMTDataAsync(startDate, endDate, strSelectedSites, sr, selectedSites);
                    break;

                case "MWATMax":
                    client.getMaxMWATDataAsync(selectedYear, strSelectedSites, sr);
                    break;

                case "MWMTMax":
                    client.getMaxMWMTDataAsync(selectedYear, strSelectedSites, sr);
                    break;
            }

        }

        void client_getMWATDataCompleted(object sender, getMWATDataCompletedEventArgs e)
        {
            if (e.Error == null)
            {
                if (e.sr.serviceCallResult == ServiceCallResult.Success)
                {
                    List<GarciaSite> selectedSites = e.UserState as List<GarciaSite>;
                    renderChart(e.Result, selectedSites);
                    this.Cursor = Cursors.Arrow;
                }
                else
                {
                    this.Cursor = Cursors.Arrow;
                    MessageBox.Show(e.sr.message, "Error", MessageBoxButton.OK);
                }
            }
            else
            {
                this.Cursor = Cursors.Arrow;
                MessageBox.Show(e.Error.Message, "Network Error", MessageBoxButton.OK);
            }
        }

        void client_getMWMTDataCompleted(object sender, getMWMTDataCompletedEventArgs e)
        {
            if (e.Error == null)
            {
                if (e.sr.serviceCallResult == ServiceCallResult.Success)
                {
                    List<GarciaSite> selectedSites = e.UserState as List<GarciaSite>;
                    renderChart(e.Result, selectedSites);
                    this.Cursor = Cursors.Arrow;
                }
                else
                {
                    this.Cursor = Cursors.Arrow;
                    MessageBox.Show(e.sr.message, "Error", MessageBoxButton.OK);
                }
            }
            else
            {
                this.Cursor = Cursors.Arrow;
                MessageBox.Show(e.Error.Message, "Network Error", MessageBoxButton.OK);
            }
        }

        void renderChart(ObservableCollection<WeeklyTemp> temps, List<GarciaSite> selectedSites)
        {
            //radChart1.Width = 740;

            radChart1.DefaultView.ChartTitle.Content = currentReport + " Garcia River Forest " + (cboSeason.SelectedItem as ComboBoxItem).Content.ToString();
            radChart1.DefaultView.ChartTitle.HorizontalAlignment = HorizontalAlignment.Center;
            radChart1.DefaultView.ChartTitle.Background = null;
            Color color = Color.FromArgb(255, 0, 0, 0);
            SolidColorBrush brush = new SolidColorBrush(color);
            radChart1.DefaultView.ChartTitle.Foreground = brush;
            radChart1.DefaultView.ChartTitle.OuterBorderThickness = new Thickness(0);
            radChart1.DefaultView.ChartTitle.BorderThickness = new Thickness(0);
            radChart1.DefaultView.ChartTitle.FontSize = 14;
            radChart1.DefaultView.ChartLegend.UseAutoGeneratedItems = true;
            //radChart1.DefaultView.ChartArea.Width = 510;
            radChart1.DefaultView.ChartLegend.Width = 200;
            
            radChart1.DefaultView.ChartLegend.Margin = new Thickness(10, 0, 10, 0);
            
            // set Legend Title to "Site(s)" and have it centered horizontally

            radChart1.DefaultView.ChartArea.AxisX.LabelRotationAngle = 300;
            radChart1.DefaultView.ChartArea.AxisX.IsDateTime = true;
            radChart1.DefaultView.ChartArea.AxisX.DefaultLabelFormat = "d";
            radChart1.DefaultView.ChartArea.AxisX.Title = "Date";
            radChart1.DefaultView.ChartArea.AxisY.Title = "TempErature (C)";
            radChart1.DefaultView.ChartArea.AxisX.MajorGridLinesVisibility = Visibility.Visible;
            radChart1.DefaultView.ChartArea.AxisY.MajorGridLinesVisibility = Visibility.Visible;

            radChart1.DefaultView.ChartArea.ZoomScrollSettingsX.ScrollMode = ScrollMode.ScrollAndZoom;
            radChart1.DefaultView.ChartArea.ZoomScrollSettingsY.ScrollMode = ScrollMode.ScrollAndZoom;

            radChart1.DefaultView.ChartArea.ZoomScrollSettingsX.SetSelectionRange(0, 1);
            radChart1.DefaultView.ChartArea.ZoomScrollSettingsY.SetSelectionRange(0, 1);

            List<ObservableCollection<WeeklyTemp>> myCollections = new List<ObservableCollection<WeeklyTemp>>();
            radChart1.SeriesMappings.Clear();

            // generate series mappings, one for each site
            for (int i = 0 ; i < selectedSites.Count; i++)
            {
                GarciaSite site = selectedSites[i];

                ObservableCollection<WeeklyTemp> myCollection = new ObservableCollection<WeeklyTemp>();

                IEnumerable<WeeklyTemp> thisCollectionsTemps = from t in temps
                                                               where t.siteID == site.siteID
                                                               select t;

                foreach (WeeklyTemp t in thisCollectionsTemps)
                {
                    myCollection.Add(t);
                }

                myCollections.Add(myCollection);

                //Series mapping for the collection with index 0
                SeriesMapping seriesMapping = new SeriesMapping();
                seriesMapping.CollectionIndex = i;
                seriesMapping.LegendLabel = site.siteName;
                seriesMapping.SeriesDefinition = new SplineSeriesDefinition();

                seriesMapping.SeriesDefinition.ShowItemLabels = false;
                string siteColor = site.color.Replace("#", "#FF");
                SolidColorBrush theBrush = GetColorFromHexa(siteColor);
                seriesMapping.SeriesDefinition.Appearance.Stroke = theBrush;
                (seriesMapping.SeriesDefinition as SplineSeriesDefinition).ShowPointMarks = false;

                ItemMapping xMapping = new ItemMapping();
                xMapping.DataPointMember = DataPointMember.XValue;
                xMapping.FieldName = "date";
                seriesMapping.ItemMappings.Add(xMapping);

                ItemMapping yMapping = new ItemMapping();
                yMapping.DataPointMember = DataPointMember.YValue;
                yMapping.FieldName = "movAvg";
                seriesMapping.ItemMappings.Add(yMapping);

                radChart1.SeriesMappings.Add(seriesMapping);

            }
            
            radChart1.ItemsSource = myCollections;

            svResults.BorderThickness = new Thickness(1);
            svResults.Visibility = Visibility.Visible;
            spChart.Visibility = Visibility.Visible;
            spGrid.Visibility = Visibility.Collapsed;
        }

        void generateChartSeries(List<GarciaSite> selectedSites, ObservableCollection<WeeklyTemp> temps)
        {
            foreach (GarciaSite site in selectedSites)
            {
                DataSeries lineSeries = new DataSeries();
                lineSeries.LegendLabel = site.siteName;

                LineSeriesDefinition def = new LineSeriesDefinition();
                string siteColor = site.color.Replace("#", "#FF");
                SolidColorBrush theBrush = GetColorFromHexa(siteColor);
                def.Appearance.Stroke = theBrush;
                def.ShowItemLabels = false;
                def.ShowPointMarks = false;
                lineSeries.Definition = def;

                // add data to the series
                var data = from m in temps
                           where m.siteID.Equals(site.siteID)
                           select new { m.date, m.movAvg };

                foreach (var d in data)
                {
                    DataPoint dp = new DataPoint(d.date.ToOADate(), d.movAvg);
                    lineSeries.Add(dp);
                }

                radChart1.DefaultView.ChartArea.DataSeries.Add(lineSeries);

            }

        }

        void radChart1_MouseRightButtonDown(object sender, MouseButtonEventArgs e)
        {
            chartMenu.show(e.GetPosition(null));
            ChartContextMenu mnu = new ChartContextMenu();
            e.Handled = true;
            return;
        }

        void chartMenu_chartContextMenuCommandIssued(object sender, ChartContextMenuEventArgs e)
        {
            switch (e.command)
            {
                case "RefreshChart":
                    radChart1.DefaultView.ChartArea.ZoomScrollSettingsX.SetSelectionRange(0, 1);
                    radChart1.DefaultView.ChartArea.ZoomScrollSettingsY.SetSelectionRange(0, 1);
                    break;

                case "ToggleLegend":
                    toggleChartLegend();
                    break;

                case "FullScreen":
                    toggleFullScreen();
                    break;

                case "ExportToPng":
                    exportChart("PNG");
                    break;

                case "ExportToBmp":
                    exportChart("BMP");
                    break;

                case "ExportToExcel":
                    exportChart("XLSX");
                    break;

                case "ExportToXps":
                    exportChart("XPS");
                    break;

            }
            chartMenu.hide();
        }

        void radChart1_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            chartMenu.hide();
        }

        void toggleChartLegend()
        {
            if (radChart1.DefaultView.ChartLegend.Visibility == System.Windows.Visibility.Visible)
                radChart1.DefaultView.ChartLegend.Visibility = System.Windows.Visibility.Collapsed;
            else
                radChart1.DefaultView.ChartLegend.Visibility = System.Windows.Visibility.Visible;
        }

        void toggleFullScreen()
        {
            spChart.ToggleElementFullScreen();
        }

        void exportChart(string frmt)
        {
            SaveFileDialog dialog = new SaveFileDialog();

            dialog.DefaultExt = frmt.ToLower();
            dialog.Filter = String.Format("{1} File (*.{0}) | *.{0}", frmt.ToLower(), frmt);
            if (!(bool)dialog.ShowDialog())
                return;
            Stream fileStream = dialog.OpenFile();

            switch (frmt)
            {
                case "XLSX":
                    radChart1.ExportToExcelML(fileStream);
                    break;

                case "PNG":
                    radChart1.ExportToImage(fileStream, new Telerik.Windows.Media.Imaging.PngBitmapEncoder());
                    break;

                case "BMP":
                    radChart1.ExportToImage(fileStream, new Telerik.Windows.Media.Imaging.BmpBitmapEncoder());
                    break;

                case "XPS":
                    radChart1.ExportToXps(fileStream);
                    break;

            
            }

            fileStream.Close();
        }

        void client_getMaxMWATDataCompleted(object sender, getMaxMWATDataCompletedEventArgs e)
        {
            if (e.Error == null)
            {
                if (e.sr.serviceCallResult == ServiceCallResult.Success)
                {
                    dgMax.ItemsSource = e.Result;
                    svResults.Visibility = Visibility.Visible;
                    spGrid.Visibility = Visibility.Visible;
                    spChart.Visibility = Visibility.Collapsed;
                    tbMaxTitle.Text = "MWAT Max Garcia River Forest " + (cboSeason.SelectedItem as ComboBoxItem).Content.ToString();
                    svResults.BorderThickness = new Thickness(1);
                    this.Cursor = Cursors.Arrow;
                }
                else
                {
                    this.Cursor = Cursors.Arrow;
                    MessageBox.Show(e.sr.message, "Error", MessageBoxButton.OK);
                }
            }
            else
            {
                this.Cursor = Cursors.Arrow;
                MessageBox.Show(e.Error.Message, "Network Error", MessageBoxButton.OK);
            }
        }

        void client_getMaxMWMTDataCompleted(object sender, getMaxMWMTDataCompletedEventArgs e)
        {
            if (e.Error == null)
            {
                if (e.sr.serviceCallResult == ServiceCallResult.Success)
                {
                    dgMax.ItemsSource = e.Result;
                    svResults.Visibility = Visibility.Visible;
                    spGrid.Visibility = Visibility.Visible;
                    spChart.Visibility = Visibility.Collapsed;
                    tbMaxTitle.Text = "MWMT Max Garcia River Forest " + (cboSeason.SelectedItem as ComboBoxItem).Content.ToString();
                    svResults.BorderThickness = new Thickness(1);
                    this.Cursor = Cursors.Arrow;
                }
                else
                {
                    this.Cursor = Cursors.Arrow;
                    MessageBox.Show(e.sr.message, "Error", MessageBoxButton.OK);
                }
            }
            else
            {
                this.Cursor = Cursors.Arrow;
                MessageBox.Show(e.Error.Message, "Network Error", MessageBoxButton.OK);
            }
        }

        #endregion

        public SolidColorBrush GetColorFromHexa(string hexaColor)
        {
            return new SolidColorBrush(
                Color.FromArgb(
                    Convert.ToByte(hexaColor.Substring(1, 2), 16),
                    Convert.ToByte(hexaColor.Substring(3, 2), 16),
                    Convert.ToByte(hexaColor.Substring(5, 2), 16),
                    Convert.ToByte(hexaColor.Substring(7, 2), 16)
                )
            );
        }



    }
}
