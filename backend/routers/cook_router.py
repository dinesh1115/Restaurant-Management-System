from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient, ASCENDING
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from router import get_current_user
import os
import logging

# MongoDB connection (adjust as needed)
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "tabserv")

# Collection name
ORDER_COLLECTION = "orders"  # Collection for customer orders

client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]
orders_collection = db[ORDER_COLLECTION]  # Collection for orders

# Ensure index exists for optimization
orders_collection.create_index([("orders.status", ASCENDING)])

# Logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI router
cook_router = APIRouter()

# Models
class OrderUpdate(BaseModel):
    status: str
    cook: str
    updated_at: datetime = datetime.utcnow()

# Endpoints
@cook_router.get("/list_pending_dishes", status_code=200)
def list_pending_dishes(user: dict = Depends(get_current_user), skip: int = 0, limit: int = 10):
    """
    List all pending dishes from the `orders` collection with full order details.
    Supports pagination with `skip` and `limit`.
    Accessible to all authenticated users.
    """
    try:
        # Find orders with pending or cooking items
        pending_orders = orders_collection.find(
            {"orders.status": {"$in": ["pending", "cooking"]}}
        ).skip(skip).limit(limit)

        result = []
        for order in pending_orders:
            # Transform the order to match frontend interface
            transformed_order = {
                "_id": str(order.get("_id")),
                "table": order.get("table", None),
                "customer_name": order.get("customer_name", ""),
                "phone_number": order.get("phone_number", ""),
                "orders": [
                    {
                        "item_id": item.get("item_id", ""),
                        "type": item.get("type", ""),
                        "item": item.get("item", ""),
                        "quantity": item.get("quantity", 0),
                        "cost": item.get("cost", 0),
                        "status": item.get("status", "pending"),
                        "cook": item.get("cook", None),
                        "instructions": item.get("instructions", None),
                        "addedby": item.get("addedby", ""),
                        "date": item.get("date", ""),
                        "takeaway": item.get("takeaway", False)
                    }
                    for item in order.get("orders", [])
                    if item.get("status") in ["pending", "cooking"]
                ],
                "order_date_time": order.get("order_date_time", ""),
                "order_status": order.get("order_status", "pending"),
                "dine_in_takeaway": order.get("dine_in_takeaway", ""),
                "bill_amount": order.get("bill_amount", 0),
                "payment_status": order.get("payment_status", ""),
                "payment_mode": order.get("payment_mode", ""),
                "order_by": {
                    "username": order.get("order_by", {}).get("username", ""),
                    "role": order.get("order_by", {}).get("role", "")
                },
                "user_name": order.get("user_name", None)
            }
            result.append(transformed_order)

        return result
    except Exception as e:
        logger.error(f"Error fetching pending dishes: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")

@cook_router.put("/update_order_status/{order_id}", status_code=200)
def update_order_status(order_id: str, update_data: OrderUpdate, user: dict = Depends(get_current_user)):
    """
    Modify the parameters of an order's `orders` field.
    Updates: status, cook, and updated_at.
    Only accessible to Cook users.
    Valid status values: pending, cooking, ready
    """
    if user.get("user_type") != "Cook":
        logger.warning(f"Unauthorized update attempt: {user.get('username', 'Unknown')} (Role: {user.get('user_type', 'Unknown')})")
        raise HTTPException(status_code=403, detail="Only cooks can update orders.")
    
    try:
        # Validate status
        valid_statuses = ['pending', 'cooking', 'ready']
        if update_data.status not in valid_statuses:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )

        order = orders_collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found.")

        # Update the order status
        updated = orders_collection.update_one(
            {"_id": ObjectId(order_id), "orders.status": {"$in": ["pending", "cooking"]}},
            {"$set": {
                "orders.$.status": update_data.status,
                "orders.$.cook": update_data.cook,
                "orders.$.updated_at": update_data.updated_at,
            }}
        )
        
        if updated.matched_count == 0:
            raise HTTPException(
                status_code=400,
                detail="No matching orders to update. Order must be in 'pending' or 'cooking' state."
            )
        
        return {"message": "Order updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
