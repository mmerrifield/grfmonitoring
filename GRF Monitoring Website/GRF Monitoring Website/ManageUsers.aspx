<%@ Page Title="" Language="C#" MasterPageFile="~/Garcia.master" AutoEventWireup="true" CodeFile="ManageUsers.aspx.cs" Inherits="ManageUsers" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <asp:ScriptManager runat="server" ID="ScriptManager1" AsyncPostBackTimeout="6000" />
    <asp:UpdatePanel runat="server" ID="UpdatePanel1">
        <ContentTemplate>
            <h2 align="center" style="margin-top: 40px;">Users</h2>
            <table cellpadding="0" cellspacing="0" align="center" style="margin-top: 20px;">
                <tr>
                    <td>
                        <asp:GridView runat="server" ID="gvUsers" AutoGenerateColumns="False"  
                            DataKeyNames="username" CellPadding="5" OnRowEditing="gvUsers_RowEditing" OnRowCancelingEdit="gvUsers_RowCancelingEdit"
                            OnRowUpdating="gvUsers_RowUpdating" OnRowDeleting="gvUsers_RowDeleting" 
                            >
                            <HeaderStyle HorizontalAlign="Center" BackColor="#01743B" ForeColor="White" Font-Bold="true" />
                            <Columns>
                                <asp:TemplateField ShowHeader="False" ItemStyle-Width="120">
                                    <EditItemTemplate>
                                        <asp:LinkButton ID="LinkButton1" runat="server" CausesValidation="True" 
                                            CommandName="Update" Text="Update"></asp:LinkButton>
                                        &nbsp;<asp:LinkButton ID="LinkButton2" runat="server" CausesValidation="False" 
                                            CommandName="Cancel" Text="Cancel"></asp:LinkButton>
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:LinkButton ID="LinkButton1" runat="server" CausesValidation="False" 
                                            CommandName="Edit" Text="Edit"></asp:LinkButton>
                                        &nbsp;<asp:LinkButton ID="LinkButton2" runat="server" CausesValidation="False" 
                                            CommandName="Delete" OnClientClick="return confirm('PERMANENTLY delete this User?');" Text="Delete"></asp:LinkButton>
                                    </ItemTemplate>
                                </asp:TemplateField>
                                <asp:TemplateField HeaderText="User Name" ItemStyle-Width="120" ControlStyle-Width="116">
                                    <EditItemTemplate>
                                        <asp:Label ID="Label1" runat="server" Text='<%# Bind("username") %>'></asp:Label>
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:Label ID="Label1" runat="server" Text='<%# Bind("username") %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>
                                <asp:TemplateField HeaderText="Email" ItemStyle-Width="210" ControlStyle-Width="206">
                                    <EditItemTemplate>
                                        <asp:TextBox ID="tbEmail" runat="server" Text='<%# Bind("email") %>'></asp:TextBox>
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:Label ID="Label2" runat="server" Text='<%# Bind("email") %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>
                                <asp:TemplateField HeaderText="Active" ItemStyle-Width="80">
                                    <EditItemTemplate>
                                        <asp:CheckBox ID="cbActive" runat="server" Checked='<%# Bind("isActive") %>' />
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:CheckBox ID="CheckBox1" runat="server" Checked='<%# Bind("isActive") %>' 
                                            Enabled="false" />
                                    </ItemTemplate>
                                    <ItemStyle HorizontalAlign="Center" />
                                </asp:TemplateField>
                                <asp:TemplateField HeaderText="Admin" ItemStyle-Width="80">
                                    <EditItemTemplate>
                                        <asp:CheckBox ID="cbAdmin" runat="server" Checked='<%# Bind("isAdmin") %>' />
                                    </EditItemTemplate>
                                    <ItemTemplate>
                                        <asp:CheckBox ID="CheckBox2" runat="server" Checked='<%# Bind("isAdmin") %>' 
                                            Enabled="false" />
                                    </ItemTemplate>
                                    <ItemStyle HorizontalAlign="Center" />
                                </asp:TemplateField>
                            </Columns>
                        </asp:GridView>
                        <div align="center" style="margin-top: 20px;">
                            <asp:Button runat="server" ID="btnNewUser" BackColor="ButtonFace" Text="New User" OnClick="btnNewUser_Click" />
                        </div>
                    </td>
                </tr>
            </table>
        
        </ContentTemplate>
    </asp:UpdatePanel>    

</asp:Content>

