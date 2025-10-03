from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from models import MenuItem, MenuCategory
from typing import List
from pymongo import MongoClient
import os
from datetime import datetime
from router import get_current_user, admin_required
from bson import ObjectId
import shutil
from pathlib import Path
from fastapi import Request
import json
from pydantic import ValidationError

# MongoDB Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "tabserv")
MENU_COLLECTION = "menu"

# Image upload configuration
UPLOAD_DIR = Path("uploads/menu_images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]
menu_collection = db[MENU_COLLECTION]

menu_router = APIRouter()

@menu_router.post("/items", response_model=MenuItem)
async def create_menu_item(
    request: Request,
    admin_user: dict = Depends(admin_required)
):
    try:
        form_data = await request.form()
        
        # Debug logging
        print("Received form data:", dict(form_data))
        print("Form data keys:", form_data.keys())
        print("Form data values:", [form_data.get(key) for key in form_data.keys()])
        
        # Validate required fields
        required_fields = ["name", "price", "category"]
        missing_fields = [field for field in required_fields if not form_data.get(field)]
        if missing_fields:
            print("Missing fields:", missing_fields)
            raise HTTPException(
                status_code=422,
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )

        # Validate price is a valid number
        try:
            price = float(form_data.get("price"))
            if price <= 0:
                raise ValueError("Price must be greater than 0")
        except (ValueError, TypeError) as e:
            print("Price validation error:", str(e))
            raise HTTPException(
                status_code=422,
                detail="Price must be a valid number greater than 0"
            )

        # Create menu item dictionary
        item_dict = {
            "name": form_data.get("name"),
            "price": price,
            "category": form_data.get("category"),
            "description": form_data.get("description", ""),
            "is_available": form_data.get("is_available", "true").lower() == "true",
            "date_created": datetime.utcnow()
        }

        print("Creating menu item with data:", item_dict)  # Debug log

        # Handle image upload if provided
        image = form_data.get("image")
        if image and isinstance(image, UploadFile):
            print("Processing image upload")
            # Generate unique filename
            file_extension = image.filename.split(".")[-1]
            filename = f"{datetime.utcnow().timestamp()}.{file_extension}"
            file_path = UPLOAD_DIR / filename

            # Save the file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            # Store the relative path in the database
            item_dict["image_url"] = f"/uploads/menu_images/{filename}"

        # Insert into database
        result = menu_collection.insert_one(item_dict)
        item_dict["id"] = str(result.inserted_id)
        return item_dict
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating menu item: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

@menu_router.get("/items", response_model=List[MenuItem])
async def get_menu_items():
    items = list(menu_collection.find())
    for item in items:
        item["id"] = str(item["_id"])
    return items

@menu_router.get("/items/{item_id}", response_model=MenuItem)
async def get_menu_item(item_id: str):
    try:
        item = menu_collection.find_one({"_id": ObjectId(item_id)})
        if not item:
            raise HTTPException(status_code=404, detail="Menu item not found")
        item["id"] = str(item["_id"])
        return item
    except:
        raise HTTPException(status_code=400, detail="Invalid item ID format")

@menu_router.put("/items/{item_id}", response_model=MenuItem)
async def update_menu_item(
    item_id: str,
    item: MenuItem,
    admin_user: dict = Depends(admin_required)
):
    try:
        print(f"Received update request for item {item_id}") # Debug log
        print(f"Request data: {item.dict()}") # Debug log
        
        # Create menu item dictionary
        item_dict = {
            "name": item.name,
            "price": item.price,
            "category": item.category,
            "description": item.description,
            "is_available": item.is_available,
            "date_updated": datetime.utcnow()
        }

        print(f"Updating with data: {item_dict}") # Debug log

        # Update the document
        result = menu_collection.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": item_dict}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Menu item not found")

        # Return the updated item
        updated_item = menu_collection.find_one({"_id": ObjectId(item_id)})
        if not updated_item:
            raise HTTPException(status_code=404, detail="Menu item not found after update")
            
        updated_item["id"] = str(updated_item["_id"])
        return updated_item

    except ValidationError as e:
        print(f"Validation error: {str(e)}") # Debug log
        raise HTTPException(
            status_code=422,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error updating menu item: {str(e)}") # Debug log
        raise HTTPException(status_code=500, detail=str(e))

@menu_router.delete("/items/{item_id}")
async def delete_menu_item(item_id: str, admin_user: dict = Depends(admin_required)):
    try:
        print(f"Attempting to delete item with ID: {item_id}")  # Debug log
        object_id = ObjectId(item_id)
        result = menu_collection.delete_one({"_id": object_id})
        print(f"Delete result: {result.deleted_count}")  # Debug log
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Menu item not found")
        return {"status": "success", "message": "Menu item deleted successfully"}
    except Exception as e:
        print(f"Delete error: {str(e)}")  # Debug log
        if "invalid" in str(e).lower():
            raise HTTPException(status_code=400, detail="Invalid item ID format")
        raise HTTPException(status_code=500, detail=str(e))

@menu_router.get("/categories", response_model=List[MenuCategory])
async def get_menu_categories():
    items = list(menu_collection.find())
    categories = {}
    for item in items:
        if item["category"] not in categories:
            categories[item["category"]] = []
        item["id"] = str(item["_id"])
        categories[item["category"]].append(item)
    
    return [{"name": category, "items": items} for category, items in categories.items()] 
