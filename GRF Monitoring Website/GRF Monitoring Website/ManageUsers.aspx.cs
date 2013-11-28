using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class ManageUsers : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
      /*
        if (!IsPostBack)
        {
            bindUsersGrid();
        }*/
    }
  /*
    private void bindUsersGrid()
    {
        List<GarciaUser> users = GarciaUser.getUsers();
        gvUsers.DataSource = users;
        gvUsers.DataBind();
    }

    protected void gvUsers_RowEditing(object sender, GridViewEditEventArgs e)
    {
        gvUsers.EditIndex = e.NewEditIndex;
        bindUsersGrid();
        btnNewUser.Enabled = false;
    }

    protected void gvUsers_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
    {
        gvUsers.EditIndex = -1;
        bindUsersGrid();
        btnNewUser.Enabled = true;

        // check to see if a blank new user has been left?
    }

    protected void gvUsers_RowUpdating(object sender, GridViewUpdateEventArgs e)
    {
        GridViewRow gvr = gvUsers.Rows[e.RowIndex];
        if (gvr != null)
        {
            string id = gvUsers.DataKeys[e.RowIndex].Value as string;
            GarciaUser theUser = GarciaUser.getUser(id);

            string newEmail = (gvr.FindControl("tbEmail") as TextBox).Text;
            bool newIsActive = (gvr.FindControl("cbActive") as CheckBox).Checked;
            bool newIsAdmin = (gvr.FindControl("cbAdmin") as CheckBox).Checked;

            theUser.email = newEmail;
            theUser.isActive = newIsActive;
            theUser.isAdmin = newIsAdmin;

            theUser.save();
            gvUsers.EditIndex = -1;
            bindUsersGrid();
            btnNewUser.Enabled = true;
        }
    }

    protected void gvUsers_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
        string id = gvUsers.DataKeys[e.RowIndex].Value as string;
        GarciaUser theUser = GarciaUser.getUser(id);
        theUser.delete();
        bindUsersGrid();
    }

    protected void btnNewUser_Click(object sender, EventArgs e)
    {
        Response.Redirect("Register.aspx");
    }
   * */
}