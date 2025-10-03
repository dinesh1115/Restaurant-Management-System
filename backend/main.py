# main.py
from fastapi import FastAPI
from router import user_router
from routers.order import order_router
from routers.tab_router import tab_router
from routers.cook_router import cook_router
from routers.menu import menu_router
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# FastAPI instance
app = FastAPI()
# List of origins allowed to access your API
origins = [
    "http://localhost:8081",  # React Native Web
    "http://localhost:8080",  # React app
    "http://localhost:3000",  # React app
    "http://10.8.0.2:8000",  # Backend
    "http://10.8.0.2:8081",  # React Native Web on network
    "http://10.8.0.2:8080",  # React app on network
    "http://10.8.0.2:3000",  # React app on network
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
# Include user routes
app.include_router(user_router, prefix="/user", tags=["User Management"])
app.include_router(order_router, prefix="/order", tags=["Order Management"])
app.include_router(tab_router, prefix="/tabs", tags=["Tabs"])
app.include_router(cook_router, prefix="/cook", tags=["Cook Management"])
app.include_router(menu_router, prefix="/menu", tags=["Menu Management"])

@app.get("/")
def root():
    return {"message": "Welcome Uniqtx!"}

 
