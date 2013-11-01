using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Windows.Controls.Primitives;
using System.Collections.Generic;

namespace GarciaCharts
{
    public static class FullScreenHelper
    {
        static Popup _fsPopup;
        static Panel _contentRoot;
        static FSElementController _lastFSController;

        #region FSElementController
        class FSElementController
        {
            double _height = double.NaN;
            double _width = double.NaN;
            int _lastPanelPosition;
            bool _lastPopupIsOpen;
            DependencyObject _parent;
            Thickness? _margin;

            public UIElement Element { get; private set; }

            public FSElementController(UIElement element)
            {
                Element = element;

                FrameworkElement elem = element as FrameworkElement;
                if (elem != null && elem.Parent != null)
                {
                    _parent = elem.Parent;
                }
            }

            public void BringElementToFullScreen()
            {
                TryAction<FrameworkElement>(Element, f =>
                {
                    _height = f.Height;
                    _width = f.Width;

                    f.Height = double.NaN;
                    f.Width = double.NaN;
                });

                TryAction<Control>(Element, f =>
                {
                    _margin = f.Margin;

                    f.Margin = new Thickness(0);
                });

                if (_parent != null)
                {
                    if (!TryAction<Panel>(_parent, p => { _lastPanelPosition = p.Children.IndexOf(Element); p.Children.RemoveAt(_lastPanelPosition); }))
                        if (!TryAction<ContentControl>(_parent, c => c.Content = null))
                            if (!TryAction<UserControl>(_parent, u => u.Content = null))
                                TryAction<Popup>(_parent, p => { _lastPopupIsOpen = p.IsOpen; p.Child = null; });
                }
            }

            public void ReturnElementFromFullScreen()
            {
                TryAction<FrameworkElement>(Element, f =>
                {
                    f.Height = _height;
                    f.Width = _width;
                });

                TryAction<Control>(Element, f =>
                {
                    if (_margin.HasValue)
                    {
                        f.Margin = _margin.Value;
                    }
                });

                if (_parent != null)
                {
                    if (!TryAction<Panel>(_parent, p => p.Children.Insert(_lastPanelPosition, Element)))
                        if (!TryAction<ContentControl>(_parent, c => c.Content = Element))
                            if (!TryAction<UserControl>(_parent, u => u.Content = Element))
                                TryAction<Popup>(_parent, p => { p.Child = Element; p.IsOpen = _lastPopupIsOpen; });
                }
            }

            static bool TryAction<T>(object o, Action<T> action)
                where T : class
            {
                T val = o as T;

                if (val != null)
                {
                    action(val);
                    return true;
                }

                return false;
            }
        }
        #endregion

        #region FSId Attached Property
        static readonly DependencyProperty FSIdProperty = DependencyProperty.RegisterAttached(
           "FSId", typeof(Guid?), typeof(FullScreenHelper), new PropertyMetadata(null));

        static void SetFSId(DependencyObject obj, Guid? value)
        {
            obj.SetValue(FSIdProperty, value);
        }

        static Guid? GetFSId(DependencyObject obj)
        {
            return (Guid?)obj.GetValue(FSIdProperty);
        }
        #endregion

        static FullScreenHelper()
        {
            _contentRoot = new Grid();

            _fsPopup = new Popup
            {
                Child = _contentRoot
            };

            Application.Current.Host.Content.FullScreenChanged += delegate
            {
                if (_lastFSController != null)
                {
                    if (!Application.Current.Host.Content.IsFullScreen)
                    {
                        ReturnElementFromFullScreen();
                    }
                    else
                    {
                        UpdateContentSize();
                    }
                }
            };
        }

        public static void BringElementToFullScreen(this UIElement element)
        {
            if (_lastFSController == null)
            {
                _lastFSController = new FSElementController(element);

                _lastFSController.BringElementToFullScreen();

                _contentRoot.Children.Add(element);
                _fsPopup.IsOpen = true;
            }
        }

        public static void ReturnElementFromFullScreen(this UIElement element)
        {
            ReturnElementFromFullScreen();
        }

        public static void ReturnElementFromFullScreen()
        {
            if (_lastFSController != null)
            {
                _contentRoot.Children.Clear();

                _lastFSController.ReturnElementFromFullScreen();

                _fsPopup.IsOpen = false;
                _lastFSController = null;
            }
        }

        public static void ToggleElementFullScreen(this UIElement element)
        {
            bool newValue = !Application.Current.Host.Content.IsFullScreen;

            bool toggle = false;

            if (newValue)
            {
                if (_lastFSController == null)
                {
                    element.BringElementToFullScreen();
                    toggle = true;
                }
            }
            else
            {
                if (_lastFSController != null && Object.ReferenceEquals(element, _lastFSController.Element))
                {
                    element.ReturnElementFromFullScreen();
                    toggle = true;
                }
            }

            if (toggle)
            {
                ToggleFullScreen();
            }
        }

        public static void ToggleFullScreen()
        {
            Application.Current.Host.Content.IsFullScreen = !Application.Current.Host.Content.IsFullScreen;
        }

        private static void UpdateContentSize()
        {
            if (Application.Current != null && Application.Current.Host != null && Application.Current.Host.Content != null)
            {
                double height = Application.Current.Host.Content.ActualHeight;
                double width = Application.Current.Host.Content.ActualWidth;

                //if (Application.Current.Host.Settings.EnableAutoZoom)
                //{
                //    double zoomFactor = Application.Current.Host.Content.ZoomFactor;
                //    if (zoomFactor != 0.0)
                //    {
                //        height /= zoomFactor;
                //        width /= zoomFactor;
                //    }
                //}

                _contentRoot.Height = height;
                _contentRoot.Width = width;
            }
        }
    }
}
