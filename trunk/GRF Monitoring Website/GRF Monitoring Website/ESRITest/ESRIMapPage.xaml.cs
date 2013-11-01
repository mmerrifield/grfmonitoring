using System;   
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Collections.Specialized;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using ESRI.ArcGIS.Client;
using ESRI.ArcGIS.Client.Symbols;
using System.Windows.Data;
using ESRITest.SLServiceReference;
using ESRI.ArcGIS.Client.Geometry;
using System.Collections.ObjectModel;
using System.Windows.Interactivity;
using ESRI.ArcGIS.Client.Tasks;


namespace ESRITest
{
    public partial class ESRIMapPage : UserControl
    {

        #region Global Variables

        private SLServiceReference.SLServiceClient client;
        private static ObservableCollection<GarciaSite> sites;
        private SilverlightServiceCallResult sr;

        #endregion

        public ESRIMapPage()
        {
            InitializeComponent();

            // Attach Handlers
            Loaded += new RoutedEventHandler(ESRIMapPage_Loaded);
            client = new SLServiceClient();
            client.Endpoint.Binding.OpenTimeout = TimeSpan.FromSeconds(600);
            client.getSitesCompleted += new EventHandler<getSitesCompletedEventArgs>(client_getSitesCompleted);
            Application.Current.Host.Content.FullScreenChanged += new EventHandler(Content_FullScreenChanged);
        }

        void Content_FullScreenChanged(object sender, EventArgs e)
        {
            if (Application.Current.Host.Content.IsFullScreen)
            {
                //spFullscreenLink.Visibility = System.Windows.Visibility.Collapsed;
                
            }
            else
            {
                //spFullscreenLink.Visibility = System.Windows.Visibility.Visible;
            }
        }

        void ESRIMapPage_Loaded(object sender, RoutedEventArgs e)
        {
            client.getSitesAsync(sr);
        }

        void client_getSitesCompleted(object sender, getSitesCompletedEventArgs e)
        {
            if (e.Error == null)
            {
                if (e.sr.serviceCallResult == ServiceCallResult.Success)
                {
                    sites = e.Result as ObservableCollection<GarciaSite>;
                    cboSites.ItemsSource = sites;
                }
                else
                {
                    int i = 0;
                }
            }
        }

        private void sitesLayer_UpdateCompleted(object sender, EventArgs e)
        {
            // Todo: this would be cool if (1) we weren't already zoomed in, and (2) if this didn't zoom us in too far.
            MyMap.ZoomTo((sender as FeatureLayer).FullExtent);
        }

        private void hlFullScreen_Click(object sender, RoutedEventArgs e)
        {
            if (Application.Current.Host.Content.IsFullScreen == true)
                Application.Current.Host.Content.IsFullScreen = false;
            else
                Application.Current.Host.Content.IsFullScreen = true;
        }

        public static string getSiteName(string siteID)
        {
            if (sites == null)
                return "Site list populating.  Please wait a few seconds.";

            IEnumerable<GarciaSite> results = from s in sites
                                              where s.siteID == siteID
                                              select s;

            if (results.Count() == 0)
                return "Unknown";
            else
                return results.First().siteName;
        }

        public static string getSiteDataRange(string siteID)
        {
            if (sites == null)
                return "Site list populating.  Please wait a few seconds.";

            IEnumerable<GarciaSite> results = from s in sites
                                              where s.siteID == siteID
                                              select s;

            if (results.Count() == 0)
                return "Unknown";
            else
                return results.First().dataDateRange;
        }

        private void cboLayers_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (MyMap == null) return;

            if ((sender as ComboBox).SelectedIndex == 0)
            {
                MyMap.Layers[0].Visible = true;
                MyMap.Layers[1].Visible = false;
            }
            else
            {
                MyMap.Layers[0].Visible = false;
                MyMap.Layers[1].Visible = true;
            }
        }

        private void cboSites_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {

            // simply try to select the graphic
            GarciaSite selectedSite = cboSites.SelectedItem as GarciaSite;
            FeatureLayer siteLayer = MyMap.Layers[3] as FeatureLayer;

            // deselect previous selection
            foreach (Graphic g in siteLayer.Graphics)
                g.Selected = false;

            IEnumerable<Graphic> results = from g in siteLayer.Graphics
                                           where g.Attributes["Site_ID"] != null
                                           && g.Attributes["Site_ID"].Equals(selectedSite.siteID)
                                           select g;

            if (results.Count() > 0)
            {
                Graphic g = results.First();
                g.Selected = true;

                MyMap.PanTo(g.Geometry);

            }
        }

        private void zoomSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
        }


    }

    public class SiteNameConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            if (value == null) return "Error: site ID cannot be null";
            return ESRIMapPage.getSiteName(value.ToString());
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            throw new NotImplementedException("This method will not be called for one-way binding");
        }

    }

    public class DataRangeConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            if (value == null) return "Error: site ID cannot be null";
            return ESRIMapPage.getSiteDataRange(value.ToString());
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            throw new NotImplementedException("This method will not be called for one-way binding");
        }

    }

    public class PositionMapTip : Behavior<Map>
    {
        private Point _mousePos; // Track the position of the mouse on the Map

        /// Distance between the MapTip and the boundary of the map
        public double Margin { get; set; }

        // Called after the behavior is attached to an AssociatedObject.
        // Override this to hook up functionality to the AssociatedObject.
        protected override void OnAttached()
        {
            base.OnAttached();

            if (this.AssociatedObject == null || this.AssociatedObject.Layers == null)
                return;

            // Wire layer collection changed handler to monitor adding/removal of GraphicsLayers
            this.AssociatedObject.Layers.CollectionChanged += Layers_CollectionChanged;

            foreach (Layer layer in this.AssociatedObject.Layers)
                wireHandlers(layer as GraphicsLayer);
        }

        // Called when the behavior is being detached from its AssociatedObject, but before it has actually occurred.
        // Override this to unhook functionality from the AssociatedObject.
        protected override void OnDetaching()
        {
            base.OnDetaching();

            if (this.AssociatedObject == null || this.AssociatedObject.Layers == null)
                return;

            foreach (Layer layer in this.AssociatedObject.Layers)
                removeHandlers(layer as GraphicsLayer);
        }

        // Add/remove MapTip positioning handlers for added/removed GraphicsLayers
        void Layers_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            if (e.NewItems != null)
                foreach (Layer layer in e.NewItems)
                    wireHandlers(layer as GraphicsLayer);

            if (e.OldItems != null)
                foreach (Layer layer in e.OldItems)
                    removeHandlers(layer as GraphicsLayer);
        }

        // Add MapTip positioning handlers
        private void wireHandlers(GraphicsLayer graphicsLayer)
        {
            if (graphicsLayer == null) return;

            // Add handlers to get the position of the mouse on the map
            graphicsLayer.MouseEnter += GraphicsLayer_MouseEnterOrMove;
            graphicsLayer.MouseMove += GraphicsLayer_MouseEnterOrMove;

            if (graphicsLayer.MapTip != null)
                graphicsLayer.MapTip.SizeChanged += MapTip_SizeChanged;
        }

        // Remove MapTip positioning handlers
        private void removeHandlers(GraphicsLayer graphicsLayer)
        {
            if (graphicsLayer == null) return;
            graphicsLayer.MouseEnter -= GraphicsLayer_MouseEnterOrMove;
            graphicsLayer.MouseMove -= GraphicsLayer_MouseEnterOrMove;

            if (graphicsLayer.MapTip != null)
                graphicsLayer.MapTip.SizeChanged -= MapTip_SizeChanged;
        }

        // Get mouse position
        void GraphicsLayer_MouseEnterOrMove(object sender, GraphicMouseEventArgs args)
        {
            _mousePos = args.GetPosition(AssociatedObject);
        }

        // Position and size MapTip
        void MapTip_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            if (AssociatedObject == null)
                return;

            FrameworkElement mapTip = sender as FrameworkElement;
            if (mapTip == null)
                return;

            // Determine what quadrant of the Map the mouse is in
            bool upper = _mousePos.Y < AssociatedObject.ActualHeight / 2;
            bool right = _mousePos.X > AssociatedObject.ActualWidth / 2;

            if (mapTip.ActualHeight > 0)
            {
                double maxHeight;
                double maxWidth;
                double horizontalOffset;
                double verticalOffset;

                // Calculate max dimensions
                maxHeight = upper ? AssociatedObject.ActualHeight - _mousePos.Y - Margin :
                    _mousePos.Y - Margin;
                maxWidth = right ? _mousePos.X - Margin : AssociatedObject.ActualWidth
                    - _mousePos.X - Margin;

                // Apply dimensions and offsets.  MapTip should not extend outside the map.  
                mapTip.MaxHeight = maxHeight;
                mapTip.MaxWidth = maxWidth;

                //Calculate offsets for MapTip
                verticalOffset = upper ? 0 : (int)(0 - mapTip.ActualHeight);
                horizontalOffset = right ? (int)(0 - mapTip.ActualWidth) : 0;

                // Set horizontal and vertical offset dependency properties on the MapTip
                mapTip.SetValue(GraphicsLayer.MapTipHorizontalOffsetProperty, horizontalOffset);
                mapTip.SetValue(GraphicsLayer.MapTipVerticalOffsetProperty, verticalOffset);
            }
        }
    }

}
