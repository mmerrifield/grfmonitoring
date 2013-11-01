//  COPYRIGHT � 2006 ESRI
//
//  TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
//  Unpublished material - all rights reserved under the
//  Copyright Laws of the United States and applicable international
//  laws, treaties, and conventions.
// 
//  For additional information, contact:
//  Environmental Systems Research Institute, Inc.
//  Attn: Contracts and Legal Services Department
//  380 New York Street
//  Redlands, California, 92373
//  USA
// 
//  email: contracts@esri.com

var esriContextMenus={};
var esriContextMenu=null;

function esriContextMenuObject(menuID, callbackFunctionString, htmlContent)
{
    this.id=menuID;
    this.callbackFunctionString=callbackFunctionString;
    this.htmlContent=htmlContent;
    this.controlShowed=null;
    this.contextShowed=null;
    this.tmpDocumentOnMouseDown=null;
    
    if (isIE)
    {
        if (window.addEventListener) window.addEventListener("load",esriRenderContextMenus,false);
        else if (window.attachEvent) window.attachEvent("onload",esriRenderContextMenus);
    }
    else
    {
        esriRenderContextMenu(menuID, htmlContent);
    }
}

function esriRenderContextMenus() {
    var cmName=null;
	for (cmName in esriContextMenus) {
		if (cmName!=null) {
            var cm = esriContextMenus[cmName];
			if (cm!=null && esriContextMenuObject.isInstanceOfType(cm)) {
                esriRenderContextMenu(cm.id,cm.htmlContent);
            }
        }
    }
}

function esriRenderContextMenu(id, htmlContent)
{
    if (document.getElementById(id)==null)
    {
        var menuDiv=document.createElement('div');
        menuDiv.id=id;
        document.body.appendChild(menuDiv);
        menuDiv.outerHTML=htmlContent;
        menuDiv.style.display="none";
    }
}

function esriShowContextMenu(e, menuID, controlShowed, contextShowed)
{
    if (esriContextMenu!=null)esriHideContextMenu();
    var menu=document.getElementById(menuID);
    if (menu==null)return;
    
    esriContextMenu=esriContextMenus[menuID];
    esriContextMenu.controlShowed=controlShowed;
    esriContextMenu.contextShowed=contextShowed;
    var pos = ESRI.ADF.System.__getAbsoluteMousePosition(e);
    menu.style.left=pos.mouseX + "px";
    menu.style.top=pos.mouseY + "px";
    
    if (isNav)
    {
        menu.style.width='';
    }
    
    changeOpacityObject(0,menu);
    menu.style.display="";
    fadeOpacity(menuID,0,100,500);
    
    esriContextMenu.tmpDocumentOnMouseDown=document.onmousedown;
    window.setTimeout("document.onmousedown=esriHideContextMenu;",0);
    return false;
}

function esriHideContextMenu(doCallback)
{
    if (esriContextMenu==null)return;
    var menuDiv=document.getElementById(esriContextMenu.id);
    if (menuDiv!=null)
    {
        menuDiv.style.display='none';
        changeOpacityObject(0,menuDiv);
    }
    
    if (doCallback==true || doCallback==null)
    {
        var argument="EventArg=contextMenuDismissed&control=" + esriContextMenu.controlShowed + "&context=" + esriContextMenu.contextShowed;
        var context=null;
        eval(esriContextMenu.callbackFunctionString);
    }
    
    document.onmousedown=esriContextMenu.tmpDocumentOnMouseDown;
    esriContextMenu=null;
}

function esriContextMenuItemClicked(itemID)
{
    if (esriContextMenu==null)return;
    
    var argument="EventArg=contextMenuItemClicked&control=" + esriContextMenu.controlShowed + "&context=" + esriContextMenu.contextShowed + "&itemID=" + itemID;
    var context=null;
    eval(esriContextMenu.callbackFunctionString);
    
    esriContextMenu.controlShowed=null;
    esriContextMenu.contextShowed=null;
    
    esriHideContextMenu(false);
}

function fadeOpacity(id, opacStart, opacEnd, millisec) { 
    //speed for each frame 
    var speed = Math.round(millisec / 100); 
    var timer = 0; 

    //determine the direction for the blending, if start and end are the same nothing happens 
    if(opacStart > opacEnd) { 
		for(var i = opacStart; i >= opacEnd; i--) {
            setTimeout("changeOpacity(" + i + ",'" + id + "')",(timer * speed)); 
            timer++; 
        } 
    } else if(opacStart < opacEnd) { 
		for(var i = opacStart; i <= opacEnd; i++)
            { 
            setTimeout("changeOpacity(" + i + ",'" + id + "')",(timer * speed)); 
            timer++; 
        } 
    } 
} 

//change the opacity for different browsers 
function changeOpacity(opacity, id)
{ 
    changeOpacityObject(opacity, document.getElementById(id));
}
 
function changeOpacityObject(opacity, object)
{
    object.style.opacity = (opacity / 100); 
    object.style.MozOpacity = (opacity / 100); 
    object.style.KhtmlOpacity = (opacity / 100); 
    object.style.filter = "alpha(opacity=" + opacity + ")"; 
}