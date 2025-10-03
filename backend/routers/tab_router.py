from fastapi import APIRouter, HTTPException, Depends, Body, Request
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from router import get_current_user
import os

# MongoDB connection (adjust as needed)
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hotel_db")
COLLECTION_NAME = "tabs"
client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]
orders_collection = db[COLLECTION_NAME]
tabs_collection = db[COLLECTION_NAME]

tab_router = APIRouter()

# Models
class TabBase(BaseModel):
    id: Optional[str]
    name: str
    user: Optional[str] = None
    table: Optional[int] = None
    waiter_request: Optional[bool] = False
    waiter_text: Optional[str] = ""
    support_request: Optional[bool] = False
    support_text: Optional[str] = ""
    user_type: Optional[str] = None  # Manager/Customer/Waiter/Billing/Table

# Admin endpoints
@tab_router.post("/add_tab", status_code=201)
async def add_tab(tab: TabBase, request: Request, current_user: dict = Depends(get_current_user)):
    """
    Add a new tab. Only Admin/Manager users are allowed.
    """
    try:
        # Get user information from the current_user
        user = current_user.get("username")
        user_type = current_user.get("user_type")  # Get user_type from token
        
        if not user_type:
            raise HTTPException(status_code=403, detail="User type not found in token")
        
        # Check if the user is an Admin or Manager
        if user_type not in ["admin", "Manager"]:
            raise HTTPException(status_code=403, detail="Only admins and managers can add tabs.")
        
        # Check if tab name already exists
        if tabs_collection.find_one({"name": tab.name}):
            raise HTTPException(status_code=400, detail="Tab name already exists.")
        
        # Create tab document
        tab_dict = {
            "name": tab.name,
            "user": user,
            "user_type": user_type,
            "table": tab.table,
            "waiter_request": tab.waiter_request,
            "waiter_text": tab.waiter_text,
            "support_request": tab.support_request,
            "support_text": tab.support_text
        }
        
        # Insert the tab
        result = tabs_collection.insert_one(tab_dict)
        
        if result.inserted_id:
            # Create a clean response without ObjectId
            response_data = {
                "message": "Tab added successfully",
                "tab": {
                    "name": tab.name,
                    "user": user,
                    "user_type": user_type,
                    "table": tab.table,
                    "waiter_request": tab.waiter_request,
                    "waiter_text": tab.waiter_text,
                    "support_request": tab.support_request,
                    "support_text": tab.support_text
                }
            }
            return response_data
        else:
            raise HTTPException(status_code=500, detail="Failed to add tab")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add tab: {str(e)}")

@tab_router.delete("/delete_tab/{tab_name}", status_code=200)
async def delete_tab(tab_name: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a tab by name. Only Admin/Manager users are allowed.
    """
    try:
        # Get user information from the current_user
        user_type = current_user.get("user_type")  # FIXED: changed from "privilege"

        # Check if the user is an Admin or Manager
        if user_type not in ["admin", "Manager"]:
            raise HTTPException(status_code=403, detail="Only admins and managers can delete tabs.")
        
        # Delete the tab
        result = tabs_collection.delete_one({"name": tab_name})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Tab not found.")
        
        return {"message": "Tab deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete tab: {str(e)}")


@tab_router.put("/update_tab_name/{old_name}", status_code=200)
async def update_tab_name(old_name: str, request: Request, current_user: dict = Depends(get_current_user)):
    """
    Update the name of a tab. Only Admin/Manager users are allowed.
    """
    # Get the request body
    body = await request.json()
    
    # Extract new_name from the request body
    new_name = body.get("new_name")
    if not new_name:
        raise HTTPException(status_code=400, detail="New name is required")
    
    # Extract user information from the request body
    user = body.get("user")
    user_type = body.get("user_type")
    
    # If user information is not in the request body, use the current_user from the token
    if not user or not user_type:
        user = current_user.get("username")
        user_type = current_user.get("privilege")  # Changed from user_type to privilege
    
    # Check if the user is an Admin or Manager
    if user_type not in ["admin", "Manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can update tabs.")
    
    if tabs_collection.find_one({"name": new_name}):
        raise HTTPException(status_code=400, detail="New tab name already exists.")
    
    result = tabs_collection.update_one({"name": old_name}, {"$set": {"name": new_name}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tab not found.")
    
    return {"message": "Tab name updated successfully"}

# Update table number
@tab_router.put("/update_table/{tab_name}", status_code=200)
async def update_table(tab_name: str, table: int, request: Request, current_user: dict = Depends(get_current_user)):
    """
    Update the table number for a tab.
    """
    # Get the request body
    body = await request.json()
    
    # Extract user information from the request body
    user = body.get("user")
    user_type = body.get("user_type")
    
    # If user information is not in the request body, use the current_user from the token
    if not user or not user_type:
        user = current_user.get("username")
        user_type = current_user.get("privilege")  # Changed from user_type to privilege
    
    tab = tabs_collection.find_one({"name": tab_name})
    if not tab:
        raise HTTPException(status_code=404, detail="Tab not found.")
    
    tabs_collection.update_one(
        {"name": tab_name},
        {"$set": {"table": table, "user": user, "user_type": user_type}}
    )
    return {"message": "Table number updated successfully"}

# Query all tabs
@tab_router.get("/list_tabs", response_model=List[TabBase])
def list_tabs(current_user: dict = Depends(get_current_user)):
    """
    List all tabs.
    """
    tabs = list(tabs_collection.find())
    return tabs

# Call waiter with text
@tab_router.put("/call_waiter/{tab_name}", status_code=200)
def call_waiter(tab_name: str, waiter_text: str, user: dict = Depends(get_current_user)):
    """
    Call a waiter with a text message.
    """
    tab = tabs_collection.find_one({"name": tab_name})
    if not tab:
        raise HTTPException(status_code=404, detail="Tab not found.")
    
    tabs_collection.update_one(
        {"name": tab_name},
        {"$set": {"waiter_request": True, "waiter_text": waiter_text}}
    )
    return {"message": "Waiter called successfully"}

# Clear waiter request
@tab_router.put("/clear_waiter/{tab_name}", status_code=200)
def clear_waiter(tab_name: str, user: dict = Depends(get_current_user)):
    """
    Clear waiter request and text.
    """
    tab = tabs_collection.find_one({"name": tab_name})
    if not tab:
        raise HTTPException(status_code=404, detail="Tab not found.")
    
    tabs_collection.update_one(
        {"name": tab_name},
        {"$set": {"waiter_request": False, "waiter_text": ""}}
    )
    return {"message": "Waiter request cleared successfully"}

# Call support with text
@tab_router.put("/call_support/{tab_name}", status_code=200)
def call_support(tab_name: str, support_text: str, user: dict = Depends(get_current_user)):
    """
    Call support with a text message.
    """
    tab = tabs_collection.find_one({"name": tab_name})
    if not tab:
        raise HTTPException(status_code=404, detail="Tab not found.")
    
    tabs_collection.update_one(
        {"name": tab_name},
        {"$set": {"support_request": True, "support_text": support_text}}
    )
    return {"message": "Support called successfully"}

# Clear support request
@tab_router.put("/clear_support/{tab_name}", status_code=200)
def clear_support(tab_name: str, user: dict = Depends(get_current_user)):
    """
    Clear support request and text.
    """
    tab = tabs_collection.find_one({"name": tab_name})
    if not tab:
        raise HTTPException(status_code=404, detail="Tab not found.")
    
    tabs_collection.update_one(
        {"name": tab_name},
        {"$set": {"support_request": False, "support_text": ""}}
    )
    return {"message": "Support request cleared successfully"}
