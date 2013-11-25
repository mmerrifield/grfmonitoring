<%@ Page Title="" Language="C#" MasterPageFile="~/GarciaWide.master" AutoEventWireup="true" CodeFile="Reports2.aspx.cs" Inherits="Reports2" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
<script src='Scripts/jquery.multiselect.min.js'></script>
<script src='Scripts/Reports2.js'></script>
<script src='Scripts/highcharts.js'></script>
<script src='Scripts/exporting.js'></script>
  <script type='text/javascript' language='javascript'>
    $(function () {
      $('#aReport')[0].checked = true;
      $('#aReport').button('refresh');
    });
  </script>
  <link rel='Stylesheet' href='Styles/jquery.multiselect.css' />
<div style='margin-top:20px;margin-left:30px;margin-right:30px;padding:10px 10px 10px 10px;' class='PageCtrls'>
From:&nbsp;
        <select id="StartMon" class='Filter Graph'>
        <option value="1" selected="selected">Jan</option>
        <option value="2" >Feb</option>
        <option value="3">Mar</option>
        <option value="4">Apr</option>
        <option value="5">May</option>
        <option value="6">Jun</option>
        <option value="7">Jul</option>
        <option value="8">Aug</option>
        <option value="9">Sep</option>
        <option value="10">Oct</option>
        <option value="11">Nov</option>
        <option value="12">Dec</option>
        </select>
        <select id="StartYr" class='Filter'>
        </select>&nbsp;
        To:&nbsp;
         <select id="EndMon" class='Filter Graph'>
         <option value="1" >Jan</option>
        <option value="2" >Feb</option>
        <option value="3">Mar</option>
        <option value="4">Apr</option>
        <option value="5">May</option>
        <option value="6">Jun</option>
        <option value="7">Jul</option>
        <option value="8">Aug</option>
        <option value="9">Sep</option>
        <option value="10">Oct</option>
        <option value="11">Nov</option>
        <option value="12" selected="selected">Dec</option>
        </select>
        <select id="EndYr" class='Filter'>
       </select>&nbsp;
       <span class='hdrLabel'>Report:</span>&nbsp;
       <select id='ReportType' style='margin-left:30px'>
       <option value='MWAT'>MWAT</option>
       <option value='MaxMWAT'>Max MWAT</option>
       <option value='MWMT'>MWMT</option>
       <option value='MaxMWMT'>Max MWMT</option>
       </select>
       
       <span class='Graph'>&nbsp;Series Format:&nbsp;
       <select id='Series'>
       <option value='TS'>Sequential</option>
       <option value='SS'>Stacked</option>
       </select>
       </span>
       <span class='Graph'>
       &nbsp;Plot Style:&nbsp;
       <select id='ChartStyle'>
        <option value='line'>Line</option>
        <option value='column'>Column</option>
        <option value='area'>Area</option>
        <option value='spline'>Spline</option>
        <option value='areaspline'>Area Spline</option>
      </select>
      &nbsp;Show Markers:&nbsp;
      <select id='ShowMarkers'>
        <option value='false'>No</option>
        <option value='true'>Yes</option>
      </select>
      </span>
       <br />
       <span class='hdrLabel'>Sites:</span>&nbsp;
       <select id='Sites' >
       </select><br />
       <div style='margin-top:5px'>
       <a href='#' id='GenReport'>Generate Report</a>
       </div>
</div>
<div id="container" style="min-width: 310px; height: 500px; margin: 0 30px 0 30px"></div>
<div id='tblcontainer' class='center' style='display:none;text-align:center;width:94%;margin-left:3%;margin-right:3%;margin-top:20px;margin-bottom:20px'>
<table id='tblMax' ></table>
<div id='navTblMax'></div>
</div>
<div id='MWATfootnote' style='display:none' class='footnotes'>
To calculate mean weekly average temperature (MWAT), first daily average temperatures are determined from the raw water temperature data. Then mean weekly average temperatures are calculated by averaging daily mean temperatures for each 7-day period (with a moving 7-day window) after Welsh et al. (2001).
<br />* Welsh, H. H., G. R. Hodgson, B. C. Harvey, and M. F. Roche. 2001. Distribution of juvenile coho salmon (Oncorhynchus kisutch) in relation to water temperature in tributaries of the Mattole River, California. North American Journal of Fisheries Management 21: 464-470.
</div>
<div id='MWATMaxfootnote' style='display:none' class='footnotes'>
To calculate mean weekly average temperature (MWAT), first daily average temperatures are determined from the raw water temperature data. Then mean weekly average temperatures (MWAT) are calculated by averaging daily mean temperatures for each 7-day period (with a moving 7-day window) after Welsh et al. (2001). Additionally, following Welsh et al. (2001), we report the highest average MWAT for the entire summer for each site sampled. Following Maahs and Barber (2001) and Hines and Ambrose (2000), we also report the number of sample periods, and percentage of total sample periods that MWAT exceeds threshold levels at each sample point.  The MWAT threshold follows that determined by Welsh et al. (2001) for coho salmon in the Mattole River in Northern California, and is 16.7°C.
<br />
*Hines, D. and J. Ambrose. 2000. Evaluation of Stream Temperatures Based on Observations of Juvenile Coho Salmon in Northern California Streams. Unpublished cooperative report. Campbell Timberland Management, Inc. and National Marine Fisheries Service.
<br />
*Maahs, M. and T. J. Barber. 2001. The Garcia River Instream Monitoring Project. Final report to California Department of Forestry and Fire Protection. Mendocino County Resources Conservation District. Ukiah, California.
<br />
* Welsh, H. H., G. R. Hodgson, B. C. Harvey, and M. F. Roche. 2001. Distribution of juvenile coho salmon (Oncorhynchus kisutch) in relation to water temperature in tributaries of the Mattole River, California. North American Journal of Fisheries Management 21: 464-470.
</div>
<div id='MWMTfootnote' style='display:none' class='footnotes'>
To calculate mean weekly maximum temperature (MWMT), first daily maximum temperatures are determined from the raw water temperature data. Then maximum weekly maximum temperatures are calculated by averaging daily maximum temperatures for each 7-day period (with a moving 7-day window) after Welsh et al. (2001).
<br />
* Welsh, H. H., G. R. Hodgson, B. C. Harvey, and M. F. Roche. 2001. Distribution of juvenile coho salmon (Oncorhynchus kisutch) in relation to water temperature in tributaries of the Mattole River, California. North American Journal of Fisheries Management 21: 464-470.
</div>
<div id='MWMTMaxfootnote' style='display:none' class='footnotes'>
To calculate mean weekly mscaa temperature (MWAT), first daily average temperatures are determined from the raw water temperature data. Then mean weekly average temperatures (MWAT) are calculated by averaging daily mean temperatures for each 7-day period (with a moving 7-day window) after Welsh et al. (2001). Additionally, following Welsh et al. (2001), we report the highest average MWAT for the entire summer for each site sampled. Following Maahs and Barber (2001) and Hines and Ambrose (2000), we also report the number of sample periods, and percentage of total sample periods that MWAT exceeds threshold levels at each sample point.  The MWAT threshold follows that determined by Welsh et al. (2001) for coho salmon in the Mattole River in Northern California, and is 16.7°C.
<br />
*Hines, D. and J. Ambrose. 2000. Evaluation of Stream Temperatures Based on Observations of Juvenile Coho Salmon in Northern California Streams. Unpublished cooperative report. Campbell Timberland Management, Inc. and National Marine Fisheries Service.
<br />
*Maahs, M. and T. J. Barber. 2001. The Garcia River Instream Monitoring Project. Final report to California Department of Forestry and Fire Protection. Mendocino County Resources Conservation District. Ukiah, California.
<br />
* Welsh, H. H., G. R. Hodgson, B. C. Harvey, and M. F. Roche. 2001. Distribution of juvenile coho salmon (Oncorhynchus kisutch) in relation to water temperature in tributaries of the Mattole River, California. North American Journal of Fisheries Management 21: 464-470.
</div>
</asp:Content>

