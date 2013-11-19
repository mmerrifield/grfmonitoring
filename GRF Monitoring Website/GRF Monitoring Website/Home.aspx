<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true"
  CodeFile="Home.aspx.cs" Inherits="Home" %>
<%@ MasterType VirtualPath="~/Garcia.master" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
  <script type='text/javascript' language='javascript'>
    $(function () {
      $('#btns').buttonset();
      $('#aHome')[0].checked = true;
      $('#aHome').button('refresh');
    });
  </script>
  <div style="margin-top: 5px;">
    <table summary="Outer Table" cellpadding="0" cellspacing="0">
      <tr>
        <td width="800" valign="top" style="background-image: url('Images/Riverbed2.jpg');
          background-repeat: no-repeat; height: 258px;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin-left: 30px; margin-top: 30px;">
            <tr>
              <td valign="top" style="" width="260">
              </td>
              <td width="40">
              </td>
              <td valign="top" style="font-size: 8pt; line-height: 1.8em; font-weight: normal;
                padding-right: 35px;">
                Welcome to the Garcia River Forest (GRF) monitoring data portal. The 23,780-acre
                GRF property was protected by The Conservation Fund in 2004 in partnership with
                The Nature Conservancy, the Wildlife Conservation Board, and the State Coastal Conservancy.
                Monitoring the health of the Garcia watershed provides data to measure progress
                towards meeting goals of restoring forests and streams, and inform future restoration
                and management efforts. This data portal houses some of that monitoring data - the
                available water temperature data for the watershed - and allows for automated data
                upload, data access and data reporting. In the future this portal will also house
                water flow, and stream habitat assessment data.
              </td>
            </tr>
            <tr>
              <td colspan="2">
              </td>
              <td valign="top" align="right" style="padding-top: 10px; padding-right: 24px; font-size: 7pt;
                color: White; font-weight: bold;">
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color: #A6A6A6; height: 200px; padding: 10px;" valign="top">
          <table cellpadding="0" cellspacing="0" style="margin-left: 20px;">
            <tr>
              <td width="230">
                <a class="bigWhiteLink" href="ImportData.aspx">
                  <h2 style="color: White; margin-bottom: 8px;">
                    Data</h2>
                </a>
                <div style="background-image: url(Images/GrayVerticalGradient2.jpg); background-repeat: repeat-x;
                  height: 155px; width: 230px;">
                  <table cellpadding="0" cellspacing="0" style="">
                    <tr height="40">
                      <td>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <a href="ImportData.aspx">
                          <img style="margin-left: 10px;" src="Images/Arrows.png" />
                        </a>
                      </td>
                      <td width="5">
                      </td>
                      <td style="line-height: 1.4em;">
                        Import HOBO sensor data. Select and export HOBO data for your site
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
              <td width="25">
              </td>
              <td width="230">
                <a class="bigWhiteLink" href="Reports.aspx">
                  <h2 style="color: White; margin-bottom: 8px;">
                    Reports</h2>
                </a>
                <div style="background-image: url(Images/GrayVerticalGradient2.jpg); background-repeat: repeat-x;
                  height: 155px; width: 230px;">
                  <table cellpadding="0" cellspacing="0" style="">
                    <tr height="40">
                      <td>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <a href='Reports2.aspx'>
                          <img style="margin-left: 10px;" src="Images/BarGraph.png" />
                        </a>
                      </td>
                      <td width="5">
                      </td>
                      <td style="line-height: 1.4em;">
                        Run reports like maximum weekly average temperature (MWAT)
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
              <td width="25">
              </td>
              <td width="230">
                <a href="ViewMap.aspx" class="bigWhiteLink">
                  <h2 style="color: White; margin-bottom: 8px;">
                    Maps</h2>
                </a>
                <div style="background-image: url(Images/GrayVerticalGradient2.jpg); background-repeat: repeat-x;
                  height: 155px; width: 230px;">
                  <table cellpadding="0" cellspacing="0" style="">
                    <tr>
                      <td>
                        <a href="ViewMap.aspx">
                          <img style="margin: 15px 10px 10px 10px;" src="Images/Map1.png" />
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</asp:Content>
