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

namespace ESRITest
{
    public partial class MessageBox : UserControl
    {
        private bool isMouseDown = false;
        private double tableDragXOffset = 0;
        private double tableDragYOffset = 0;


        public MessageBox()
        {
            InitializeComponent();
        }

        public void show(string message, string title)
        {
            beep();
            this.Visibility = Visibility.Visible;
            tbMessage.Text = message;
            tbTitle.Text = title;
            myStoryboard.Begin();
        }

        public void hide()
        {
            this.Visibility = Visibility.Collapsed;
        }

        private void btnDismiss_Click(object sender, RoutedEventArgs e)
        {
            hide();
        }

        #region Dragging

        private void tbTitle_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            tableDragXOffset = e.GetPosition(dialogBox).X;
            tableDragYOffset = e.GetPosition(dialogBox).Y;
            isMouseDown = true;
            tbTitle.CaptureMouse();
        }

        private void tbTitle_MouseMove(object sender, MouseEventArgs e)
        {
            if (isMouseDown)
            {
                double currX = e.GetPosition(null).X - tableDragXOffset;
                double currY = e.GetPosition(null).Y - tableDragYOffset;

                if (currX >= 0 && currX <= 600)
                    dialogBox.SetValue(Canvas.LeftProperty, currX);

                if (currY > 0 && currY <= 250)
                    dialogBox.SetValue(Canvas.TopProperty, currY);
            }

        }

        private void tbTitle_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            isMouseDown = false;
            tbTitle.ReleaseMouseCapture();
        }

        #endregion

        private void beep()
        {
            beepSound.Source = new Uri("beep.mp3", UriKind.Relative);
            beepSound.Volume = 1.0;
            beepSound.Play();
        }

    }
}
