from fastapi import APIRouter, Depends, HTTPException, status, Body
from router import get_current_user
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId 
from bson.errors import InvalidId
from fastapi.responses import JSONResponse
import os
import traceback
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "tabserv")

# Collection names
ORDER_COLLECTION = "orders"  # Collection for customer orders

client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]
orders_collection = db[ORDER_COLLECTION]  # Collection for orders

# Add index for order status queries
orders_collection.create_index([("_id", 1)])

# Initialize the router
order_router = APIRouter()

# Pydantic models
class OrderItem(BaseModel):
    item_id: str
    type: str  # Starter/Main Course/Dessert/Drinks
    item: str
    quantity: int
    cost: float
    instructions: Optional[str] = None
    status: str
    cook: Optional[str] = None
    addedby: str
    date: datetime
    takeaway: bool

class Order(BaseModel):
    table: Optional[str] = None
    customer_name: str
    phone_number: str
    orders: List[OrderItem]
    order_date_time: datetime
    order_status: str  # ordered/processing/completed/cancelled
    dine_in_takeaway: str  # dine-in/takeaway
    bill_amount: float
    payment_status: str  # paid/unpaid
    payment_mode: Optional[str] = None
    order_by: Optional[dict] = None  # Added automatically based on user
    user_name: Optional[str] = None  # Added automatically based on user

# CRUD Endpoints
@order_router.post("/create", status_code=201)
def create_order(order: Order, user: dict = Depends(get_current_user)):
    """
    Create a new order.
    """
    try:
        # Add order_by and user_name from the current user
        order_dict = order.dict()
        order_dict["order_by"] = {
            "username": user.get("username", "Unknown"),
            "role": user.get("user_type", "Unknown")
        }
        order_dict["user_name"] = user.get("username", None)
        
        # Insert the order
        result = orders_collection.insert_one(order_dict)
        
        # Return the created order with its ID
        order_dict["_id"] = str(result.inserted_id)
        return {"order": order_dict}
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")

#order_id is mongodb collection _id field
@order_router.get("/status/{order_id}")
def get_order_status(order_id: str):
    """
    Get the status of a specific order.
    """
    try:
        # Log MongoDB connection details
        logger.info(f"MongoDB URL: {MONGO_URL}")
        logger.info(f"Database name: {DATABASE_NAME}")
        logger.info(f"Collection name: {ORDER_COLLECTION}")
        
        # Validate order_id format first
        if not ObjectId.is_valid(order_id):
            logger.warning(f"Invalid order ID format: {order_id}")
            raise HTTPException(status_code=400, detail="Invalid order ID format.")

        # Log the query being executed
        logger.info(f"Querying order with ID: {order_id}")
        
        # Use projection to only fetch required fields
        order = orders_collection.find_one(
            {"_id": ObjectId(order_id)},
            {
                "_id": 1,
                "table": 1,
                "customer_name": 1,
                "phone_number": 1,
                "orders": 1,
                "order_date_time": 1,
                "order_status": 1,
                "dine_in_takeaway": 1,
                "bill_amount": 1,
                "payment_status": 1,
                "payment_mode": 1
            }
        )

        if not order:
            logger.warning(f"Order not found with ID: {order_id}")
            raise HTTPException(status_code=404, detail="Order not found.")

        # Log successful order retrieval
        logger.info(f"Successfully retrieved order: {order_id}")

        # Convert ObjectId to string for JSON serialization
        order["_id"] = str(order["_id"])
        
        # Convert datetime objects to strings
        if "order_date_time" in order:
            order["order_date_time"] = order["order_date_time"].isoformat()
        
        # Convert item dates to strings
        for item in order.get("orders", []):
            if "date" in item:
                item["date"] = item["date"].isoformat()

        return {"order": order}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_order_status: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error.")

@order_router.put("/update/{order_id}")
def update_order(order_id: str, updated_order: Order = Body(...), user: dict = Depends(get_current_user)):
    """
    Update an existing order with new data.
    """
    try:
        # Convert string order_id to ObjectId
        order_id_obj = ObjectId(order_id)
        existing_order = orders_collection.find_one({"_id": order_id_obj})
    except Exception as e:
        logger.error(f"Error processing order ID {order_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid order ID format: {order_id}")

    if not existing_order:
        logger.warning(f"Order not found with ID: {order_id}")
        raise HTTPException(status_code=404, detail=f"Order not found with ID: {order_id}")
    
    try:
        # Convert the updated order to a dictionary
        order_dict = updated_order.dict()
        
        # Convert date strings to datetime objects if they are strings
        if isinstance(order_dict.get("order_date_time"), str):
            order_dict["order_date_time"] = datetime.fromisoformat(order_dict["order_date_time"])
        
        # Convert date strings in order items
        for item in order_dict.get("orders", []):
            if isinstance(item.get("date"), str):
                item["date"] = datetime.fromisoformat(item["date"])
        
        # Update the order in the database
        orders_collection.update_one(
            {"_id": order_id_obj},
            {"$set": order_dict}
        )
        logger.info(f"Order {order_id} updated successfully")
        return {"message": "Order updated successfully."}
    except Exception as e:
        logger.error(f"Error updating order {order_id}: {str(e)}")
        logger.error(f"Error traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update order in database: {str(e)}"
        )


@order_router.delete("/cancel/{order_id}")
def cancel_order(order_id: str, user: dict = Depends(get_current_user)):
    """
    Cancel an order. Only allowed if status is 'ordered'.
    """
    try:
        object_id = ObjectId(order_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid order ID format.")

    order = orders_collection.find_one({"_id": object_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    
    if order["order_status"] != "ordered":
        raise HTTPException(
            status_code=400,
            detail="Order cannot be cancelled as it is not in 'ordered' status."
        )

    orders_collection.update_one(
        {"_id": object_id},
        {"$set": {"order_status": "cancelled"}}
    )

    return {"message": "Order cancelled successfully."}
    
@order_router.put("/make_takeaway/{order_id}")
def make_order_takeaway(order_id: str, user: dict = Depends(get_current_user)):
    """
    Convert a dine-in order to takeaway.
    """
    order = orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    
    if order["dine_in_takeaway"] != "dine-in":
        raise HTTPException(
            status_code=400,
            detail="Only dine-in orders can be converted to takeaway."
        )
    
    orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"dine_in_takeaway": "takeaway"}}
    )
    return {"message": "Order converted to takeaway successfully."}


@order_router.get("/all")
def get_all_orders(user: dict = Depends(get_current_user)):
    """
    Get all orders for the logged-in user.
    """
    orders = list(orders_collection.find({"order_by.username": user["username"]}))
    for order in orders:
        order["_id"] = str(order["_id"])  # Convert ObjectId to string for response
    return {"orders": orders}

@order_router.get("/customer/orders")
def get_customer_orders(user: dict = Depends(get_current_user)):
    """
    Get all orders for the current customer.
    """
    try:
        # Find orders where the customer name matches the logged-in user's name
        orders = list(orders_collection.find(
            {"customer_name": user.get("username")},
            {
                "_id": 1,
                "table": 1,
                "customer_name": 1,
                "orders": 1,
                "order_status": 1,
                "order_date_time": 1
            }
        ))

        # Format the response
        formatted_orders = []
        for order in orders:
            formatted_order = {
                "order_id": str(order["_id"]),
                "table": order.get("table", "Unknown"),
                "customer_name": order.get("customer_name", "Unknown"),
                "dishes": [
                    {
                        "dish": item.get("item", "Unknown"),
                        "status": item.get("status", "Unknown")
                    }
                    for item in order.get("orders", [])
                ],
                "order_status": order.get("order_status", "Unknown"),
                "order_date_time": order.get("order_date_time", datetime.utcnow()).isoformat()
            }
            formatted_orders.append(formatted_order)

        return formatted_orders
    except Exception as e:
        print(f"Error fetching customer orders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch customer orders: {str(e)}")

#################################################

@order_router.put("/modify_order_items/{order_id}")
def modify_order_items(
    order_id: str,
    modifications: dict = Body(...),  # Includes instructions for takeaway, cancel, and adding new items
    user: dict = Depends(get_current_user)
):
    """
    Modify items within the 'orders' field of an existing order.
    Access is restricted to the same tab user or users with admin, waiter, or billing privileges.
    """
    # Fetch the existing order
    order = orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    
    # Check user privileges
    if not (user["username"] == order.get("order_by", {}).get("username") or user["privilege"] in ["admin", "waiter", "billing"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    # Extract modifications
    takeaway_items = modifications.get("takeaway_items", [])  # List of item IDs to mark as takeaway
    cancel_items = modifications.get("cancel_items", [])      # List of item IDs to cancel
    new_items = modifications.get("new_items", [])            # List of new items to add
    
    updated_orders = []

    # Step 1: Modify existing items
    for item in order["orders"]:
        if item["item_id"] in takeaway_items:
            item["takeaway"] = True  # Mark as takeaway
        if item["item_id"] in cancel_items:
            if item["status"] != "ordered":
                raise HTTPException(
                    status_code=400,
                    detail=f"Item with ID {item['item_id']} cannot be cancelled as it is not in 'ordered' status.",
                )
            item["status"] = "cancelled"  # Cancel the item
        updated_orders.append(item)

    # Step 2: Add new items
    for new_item in new_items:
        updated_orders.append(new_item)

    # Update the order in the database
    orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"orders": updated_orders}}
    )

    return {
        "message": "Order items updated successfully.",
        "order_id": order_id,
        "updated_orders": updated_orders,
    }

@order_router.put("/mark_takeaway/{order_id}")
def mark_items_takeaway(
    order_id: str,
    item_ids: list = Body(...),  # List of item IDs to mark as takeaway
    user: dict = Depends(get_current_user)
):
    """
    Marks specific items in the 'orders' field of an order as takeaway.
    """
    # Fetch the existing order
    order = orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    updated_orders = []
    for item in order["orders"]:
        if item["item_id"] in item_ids:
            item["takeaway"] = True  # Mark as takeaway
        updated_orders.append(item)

    # Update the order in the database
    orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"orders": updated_orders}}
    )

    return {
        "message": "Items marked as takeaway successfully.",
        "order_id": order_id,
        "updated_orders": updated_orders,
    }

################################################################
# Endpoint for setting up the billing status of the order      #
################################################################

@order_router.put("/set_billing_status/{order_id}/{status}")
def set_billing_status(order_id: str, status: str, user: dict = Depends(get_current_user)):
    """
    Set the billing status of an order to the specified status.
    """
    # Fetch the existing order
    order = orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    # Update the order in the database
    orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"payment_status": status}}
    )

    return {
        "message": "Order billing status updated successfully.",
        "order_id": order_id,
        "payment_status": status,
    }

@order_router.delete("/delete_item/{order_id}/{item_id}")
def delete_order_item(order_id: str, item_id: str, user: dict = Depends(get_current_user)):
    """
    Delete a specific item from an order.
    """
    try:
        # Convert string order_id to ObjectId
        order_id_obj = ObjectId(order_id)
        existing_order = orders_collection.find_one({"_id": order_id_obj})
    except Exception as e:
        logger.error(f"Error processing order ID {order_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid order ID format: {order_id}")

    if not existing_order:
        logger.warning(f"Order not found with ID: {order_id}")
        raise HTTPException(status_code=404, detail=f"Order not found with ID: {order_id}")
    
    try:
        # Filter out the item to be deleted
        updated_orders = [item for item in existing_order["orders"] if item["item_id"] != item_id]
        
        # Update the order in the database
        orders_collection.update_one(
            {"_id": order_id_obj},
            {"$set": {"orders": updated_orders}}
        )
        
        logger.info(f"Item {item_id} deleted from order {order_id} successfully")
        return {"message": "Item deleted successfully."}
    except Exception as e:
        logger.error(f"Error deleting item {item_id} from order {order_id}: {str(e)}")
        logger.error(f"Error traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete item from order: {str(e)}"
        )

