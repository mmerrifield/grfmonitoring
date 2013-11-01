<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="ManageSites.aspx.cs" Inherits="ManageSites" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <div style="font-size: 14pt; font-weight: bold; margin: 20px;" align="center">Manage Sites</div>
       
    <asp:ScriptManager runat="server" ID="ScriptManager1" />

        <script type="text/javascript" language="javascript">
            Sys.WebForms.PageRequestManager.getInstance().add_endRequest(EndRequestHandler);
            function EndRequestHandler(sender, args) {
                if (args.get_error() != undefined) {
                    var errorMessage = args.get_error().message;
                    errorMessage = errorMessage.replace("Sys.WebForms.PageRequestManagerServerErrorException: ", "");

                    // keep FireFox from throwing an error here due to a cookie issue.
                    if (errorMessage.indexOf('was: 0') == -1) {
                        alert(errorMessage);
                    }

                    args.set_errorHandled(true);
                }
            }
        </script>

    <asp:UpdatePanel runat="server" ID="UpdatePanel1">
        <ContentTemplate>
            <table cellpadding="0" cellspacing="0" align="center">
                <tr>
                    <td valign="top">
                        <asp:GridView runat="server" ID="gvSites" AutoGenerateColumns="False" 
                            CellPadding="5" RowStyle-HorizontalAlign="Left" DataKeyNames="objectID"
                            OnRowEditing="gvSites_RowEditing" OnRowCancelingEdit="gvSites_RowCancelingEdit"
                            OnRowUpdating="gvSites_RowUpdating" OnRowDeleting="gvSites_RowDeleting" AllowSorting="true" OnSorting="gvSites_Sorting"
                            >
                            <HeaderStyle HorizontalAlign="Center" BackColor="Gray" ForeColor="White" Font-Bold="true" />
                            <Columns>
                
                                <asp:TemplateField ShowHeader="False" HeaderStyle-Width="80" ItemStyle-Width="80" ItemStyle-HorizontalAlign="Center">
                                    <EditItemTemplate>
                                        <div style="width: 80px;">
                                            <asp:LinkButton ID="LinkButton1" runat="server" CausesValidation="True" CommandName="Update" Text="Save"></asp:LinkButton>&nbsp;
                                            <asp:LinkButton ID="LinkButton2" runat="server" CausesValidation="False" CommandName="Cancel" Text="Cancel"></asp:LinkButton>
                                            </div>
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:LinkButton ID="LinkButton1" runat="server" CausesValidation="False" 
                                            CommandName="Edit" Text="Edit"></asp:LinkButton>
                                        &nbsp;<asp:LinkButton ID="LinkButton2" runat="server" CausesValidation="False" 
                                            CommandName="Delete" Text="Delete" OnClientClick="return confirm('Permanently delete this site?  WARNING: Any HOBO data associated with this site will be unusable.');"></asp:LinkButton>
                                    </ItemTemplate>
                                </asp:TemplateField>

                                <asp:TemplateField HeaderText="Site ID" ItemStyle-Width="45" ControlStyle-Width="41" SortExpression="siteID">
                                    <EditItemTemplate>
                                        <asp:TextBox ID="tbSiteID" MaxLength="12" runat="server" Text='<%# Bind("siteID") %>'></asp:TextBox>
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:Label ID="Label1" runat="server" Text='<%# Bind("siteID") %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>

                                <asp:TemplateField HeaderText="Site Name" ItemStyle-Width="120" ControlStyle-Width="116" SortExpression="siteName">
                                    <EditItemTemplate>
                                        <asp:TextBox ID="tbSiteName" MaxLength="150" runat="server" Text='<%# Bind("siteName") %>'></asp:TextBox>
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:Label ID="Label2" runat="server" Text='<%# Bind("siteName") %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>
                
                                <asp:TemplateField HeaderText="Directions" ItemStyle-Width="210" SortExpression="directions">
                                    <EditItemTemplate>
                                        <asp:TextBox ID="tbDirections" Width="204" Height="60" TextMode="MultiLine" runat="server" Text='<%# Bind("directions") %>'></asp:TextBox>
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:Label ID="Label3" runat="server" Text='<%# Bind("directions") %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>
                
                                <asp:TemplateField HeaderText="Color" ItemStyle-HorizontalAlign="Center" ItemStyle-VerticalAlign="Middle">
                                    <ItemTemplate>
                                        <asp:Panel runat="server" ID="pnlColor" Width="20" Height="15" BackColor='<%# System.Drawing.Color.FromName(DataBinder.Eval(Container.DataItem, "color").ToString())%>'></asp:Panel>
                                    </ItemTemplate>
                                    <EditItemTemplate>
                                        <telerik:RadColorPicker ID="rcpColor" ShowEmptyColor="false" PaletteModes="All" runat="server" SelectedColor='<%# System.Drawing.Color.FromName(DataBinder.Eval(Container.DataItem, "color").ToString())%>' ShowIcon="true">
                                        </telerik:RadColorPicker>                    
                                    </EditItemTemplate>

                                    <ItemStyle HorizontalAlign="Center" VerticalAlign="Middle"></ItemStyle>
                                </asp:TemplateField>
                
                                <asp:TemplateField HeaderText="Data Start Date" ItemStyle-Width="94" SortExpression="dataStartDate">
                                    <EditItemTemplate>
                                        <telerik:RadDatePicker runat="server" ID="rdpStartDate" Width="90" SelectedDate='<%# Bind("dataStartDate")%>' />
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:Label ID="Label4" runat="server" 
                                            Text='<%# Bind("dataStartDate", "{0:d}") %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>
                                <asp:TemplateField HeaderText="Data End Date" ItemStyle-Width="94" SortExpression="dataEndDate"> 
                                    <EditItemTemplate>
                                        <telerik:RadDatePicker runat="server" ID="rdpEndDate" Width="90" SelectedDate='<%# Bind("dataEndDate")%>' />
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:Label ID="Label5" runat="server" 
                                            Text='<%# Bind("dataEndDate", "{0:d}") %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>
                            </Columns>

                <RowStyle HorizontalAlign="Left"></RowStyle>
                        </asp:GridView>
                    </td>
                    <td width="10">&nbsp;</td>
                    <td valign="top">
                        <asp:Button runat="server" ID="btnNewSite" Text="New Site" BackColor="ButtonFace" OnClick="btnNewSite_Click" />
                    </td>
                </tr>
            </table>
        
        </ContentTemplate>
    </asp:UpdatePanel>

</asp:Content>

