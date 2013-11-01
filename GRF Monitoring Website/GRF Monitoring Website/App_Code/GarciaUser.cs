using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;

public class GarciaUser
{
    #region Members

    public string username { get; set; }
    public string email { get; set; }
    public bool isActive { get; set; }
    public bool isAdmin { get; set; }

    #endregion

    #region Constructor

    public GarciaUser(MembershipUser usr)
    {
        username = usr.UserName;
        email = usr.Email;

        if (Roles.IsUserInRole(username, "Inactive"))
            isActive = false;
        else
            isActive = true;

        if (Roles.IsUserInRole(username, "Admin"))
            isAdmin = true;
        else
            isAdmin = false;
        
    }

    #endregion

    #region Instance Methods

    public void save()
    {
        // first update user fields
        MembershipUser usr = Membership.GetUser(username);
        usr.Email = email;
        Membership.UpdateUser(usr);

        // now update user's roles
        if (isActive)
        {
            if (Roles.IsUserInRole(username, "Inactive"))
                Roles.RemoveUserFromRole(username, "Inactive");
        }
        else
        {
            if (!Roles.IsUserInRole(username, "Inactive"))
                Roles.AddUserToRole(username, "Inactive");
        }

        if (isAdmin)
        {
            if (!Roles.IsUserInRole(username, "Admin"))
                Roles.AddUserToRole(username, "Admin");
        }
        else
        {
            if (Roles.IsUserInRole(username, "Admin"))
                Roles.RemoveUserFromRole(username, "Admin");
        }

    }

    public void delete()
    {
        Membership.DeleteUser(this.username, true);
    }

    #endregion

    #region Static Methods

    public static GarciaUser getUser(string uName)
    {
        MembershipUser usr = Membership.GetUser(uName);
        if (usr != null)
            return new GarciaUser(usr);
        else
            return null;
    }

    public static List<GarciaUser> getUsers()
    {
        List<GarciaUser> garciaUsers = new List<GarciaUser>();
        MembershipUserCollection users = Membership.GetAllUsers();
        foreach (MembershipUser usr in users)
        {
            garciaUsers.Add(new GarciaUser(usr));
        }

        return garciaUsers;
    }

    #endregion
}
