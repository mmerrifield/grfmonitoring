<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="MWAT.aspx.cs" Inherits="MWAT" %>
<%@ MasterType VirtualPath="~/Garcia.master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
    <script type="text/javascript" src="Silverlight.js"></script>
    <script type="text/javascript">
        function onSilverlightError(sender, args) {
            var appSource = "";
            if (sender != null && sender != 0) {
                appSource = sender.getHost().Source;
            }

            var errorType = args.ErrorType;
            var iErrorCode = args.ErrorCode;

            if (errorType == "ImageError" || errorType == "MediaError") {
                return;
            }

            var errMsg = "Unhandled Error in Silverlight Application " + appSource + "\n";

            errMsg += "Code: " + iErrorCode + "    \n";
            errMsg += "Category: " + errorType + "       \n";
            errMsg += "Message: " + args.ErrorMessage + "     \n";

            if (errorType == "ParserError") {
                errMsg += "File: " + args.xamlFile + "     \n";
                errMsg += "Line: " + args.lineNumber + "     \n";
                errMsg += "Position: " + args.charPosition + "     \n";
            }
            else if (errorType == "RuntimeError") {
                if (args.lineNumber != 0) {
                    errMsg += "Line: " + args.lineNumber + "     \n";
                    errMsg += "Position: " + args.charPosition + "     \n";
                }
                errMsg += "MethodName: " + args.methodName + "     \n";
            }

            throw new Error(errMsg);
        }
    </script>

</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">

    <div style="background-color: #F2F2F2; padding: 20px; min-height: 440px; width: 800px; margin-top: 5px;">

        <span style="font-size: 14pt; font-weight: bold;">Reports: </span>
        <span style="font-size: 12pt; font-weight: bold;">MWAT | </span>
        <a href="MWATMax.aspx" style="font-weight: bold; font-size: 12pt;">MWAT max</a>
        <span style="font-size: 12pt; font-weight: bold;">| </span>
        <a href="MWMT.aspx" style="font-weight: bold; font-size: 12pt;">MWMT</a>
        <span style="font-size: 12pt; font-weight: bold;"> | </span>
        <a href="MWMT.aspx" style="font-weight: bold; font-size: 12pt;">MWMT max</a>

        <div id="silverlightControlHost" style="margin-top: 20px; ">
            <object data="data:application/x-silverlight-2," type="application/x-silverlight-2" width="800" height="700">
		      <param name="source" value="ClientBin/GarciaCharts.xap"/>
		      <param name="onError" value="onSilverlightError" />
		      <param name="background" value="white" />
		      <param name="minRuntimeVersion" value="4.0.50401.0" />
		      <param name="autoUpgrade" value="true" />
		      <a href="http://go.microsoft.com/fwlink/?LinkID=149156&v=4.0.50401.0" style="text-decoration:none">
 			      <img src="http://go.microsoft.com/fwlink/?LinkId=161376" alt="Get Microsoft Silverlight" style="border-style:none"/>
		      </a>
	        </object><iframe id="_sl_historyFrame" style="visibility:hidden;height:0px;width:0px;border:0px"></iframe>
        </div>

        

    </div>
 
</asp:Content>


