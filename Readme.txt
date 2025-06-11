Installation Guide	
TABSERVE - Installation Guide
This document will guide you through setting up both the backend (tabserve) and frontend (tabserve-ui) of the Tabserve application.

About TabServe
TabServe is a comprehensive restaurant management system that includes:
- Menu management with categories and image support
- Order management for dine-in and takeaway
- Table/Tab management system
- Kitchen display system for cooks
- User role management (Admin, Waiter, Cook, Customer)
- Real-time order tracking
- Receipt management with tax and parcel charge settings
- System reporting with revenue and order statistics

Prerequisites
1. Python 3.8 or higher
2. Node.js 16 or higher
3. npm (Node Package Manager)
4. MongoDB installed and running
5. Git (for cloning the repository)







Backend Setup (tabserve)
1. Navigate to the tabserve directory:
   cd tabserve
2. Create a Python virtual environment:
   python -m venv venv
3. Activate the virtual environment:
   - On Windows:
     venv\Scripts\activate
   - On macOS/Linux:
     source venv/bin/activate
4. Install the required Python packages:
   pip install -r requirements.txt
This will install:  FastAPI, Uvicorn, PyMongo, Python-Jose, Passlib, Pydantic,                         python-  dotenv
5. Create a .env file in the tabserve directory with the following settings:
   MONGODB_URL=mongodb://localhost:27017/
   DATABASE_NAME=tabserv
   SECRET_KEY=your_secret_key_for_jwt
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
6. Create required directories:
   mkdir -p uploads/menu_images
7. Start the backend server:
   uvicorn main:app --reload

The backend server will start running on http://localhost:8000



Frontend Setup (tabserve-ui)
1. Navigate to the tabserve-ui directory:
   cd tabserve-ui
2. Install the required npm packages:
   npm install
   Key frontend features include:
   - React Native/Expo for cross-platform support
   - React Navigation for app navigation
   - Async Storage for local data persistence
   - Image upload capabilities
   - Real-time updates using API integration
   - Toast messages for notifications
   - Responsive design for various screen sizes
3. Configure the API endpoint:
   - Open src/services/constants.js
   - Update the API_BASE_URL to match your backend URL

4. Start the frontend application:
   npm start / npx expo start
   This will open Expo Developer Tools in your browser.

5. Running the app:
   - To run on Android: Press 'a' in the terminal or click "Run on Android device/emulator"
   - To run on iOS: Press 'i' in the terminal or click "Run in iOS simulator" (Mac only)
   - To run on web: Press 'w' in the terminal or click "Run in web browser"




API Endpoints Reference
1. User Management (/user):
   - POST /register - Create new users (admin only)
   - POST /login - User authentication
   - GET /me - Get current user details
   - GET /list - List all users (admin only)
   - DELETE /delete/{username} - Delete user (admin only)
   - PUT /update/{username} - Update user details
   - GET /settings/receipt - Get receipt settings
   - POST /settings/receipt - Update receipt settings (admin only)
2. Menu Management (/menu):
   - POST /items - Add new menu item
   - GET /items - List all menu items
   - GET /items/{item_id} - Get specific item
   - PUT /items/{item_id} - Update menu item
   - DELETE /items/{item_id} - Delete menu item
   - GET /categories - List menu categories
3. Order Management (/order):
   - POST / - Create new order
   - GET /{order_id} - Get order details
   - PUT /{order_id} - Update order
   - GET /status/{order_id} - Check order status
4. Tab Management (/tabs):
   - POST /add_tab - Create new tab
   - GET /list - List all tabs
   - PUT /{tab_name} - Update tab
   - DELETE /delete_tab/{tab_name} - Delete tab
   - POST /{tab_name}/waiter - Request waiter
   - POST /{tab_name}/support - Request support
5. Kitchen Management (/cook):
   - GET /list_pending_dishes - View pending orders
   - PUT /update_status - Update dish status

User Roles and Permissions
1. Admin:
   - Full system access
   - User management
   - Menu management
   - Receipt settings
   - System reports
   - Tab management
2. Cook:
   - View pending orders
   - Update order status
   - Access kitchen display system
   - Mark dishes as prepared
3. Waiter:
   - View assigned tables
   - Take orders
   - Update order status
   - Respond to customer requests
4. Customer:
   - View menu
   - Place orders
   - Request waiter assistance
   - View order status


Advanced Configuration
1. Database Collections:
   - users: User accounts and authentication
   - menu: Menu items and categories
   - orders: Order tracking and history
   - tabs: Table management
   - receipt_settings: Tax and parcel charge config

2. Environment Variables:
   Backend (.env):
   ```
   MONGODB_URL=mongodb://localhost:27017/
   DATABASE_NAME=tabserv
   SECRET_KEY=your_secret_key_for_jwt
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

   Frontend (src/services/constants.js):
   ```
   API_BASE_URL=http://localhost:8000
   ```

3. Image Upload Configuration:
   - Supported formats: JPEG, PNG, GIF
   - Upload directory: /uploads/menu_images
   - Image URL format: /uploads/menu_images/{filename}

4. Network Configuration:
   Allowed CORS origins:
   - http://localhost:8081 (React Native Web)
   - http://localhost:8080 (React app)
   - http://localhost:3000 (React app)
   - Custom network URLs (configure in main.py)

Initial Setup After Installation
1. Create an admin user:
   - Use the /user/register endpoint with privilege="admin"
   - This first admin can create other users

2. Configure receipt settings:
   - Login as admin
   - Set up default tax percentage and parcel charges

3. Set up menu categories:
   - Create basic menu categories (e.g., Starters, Main Course, Desserts, Drinks)
   - Add menu items with images, prices, and availability

4. Set up tables:
   - Configure table numbers in the system
   - Assign table-specific users if needed

Testing the Installation
1. Backend Health Check:
   ```
   GET http://localhost:8000/
   Expected response: {"message": "Welcome Uniqtx!"}
   ```

2. Database Verification:
   - MongoDB running: mongodb://localhost:27017/
   - Database created: tabserv
   - Collections initialized: users, menu, orders, tabs

3. User Authentication:
   - Create admin user
   - Test login endpoint
   - Verify JWT token generation

4. Frontend Integration:
   - Verify API connectivity
   - Test image uploads
   - Check real-time updates
   - Validate order flow

Troubleshooting
1. If you encounter any MongoDB connection issues:
   - Make sure MongoDB is running on your system
   - Check if the connection string in .env is correct
   - Verify the database name matches DATABASE_NAME in .env
2. If npm install fails:
   - Clear npm cache: npm cache clean --force
   - Delete node_modules folder and package-lock.json
   - Run npm install again
3. For Expo issues:
   - Make sure you have the latest version of Expo CLI
   - Try clearing Expo cache: expo r -c
4. For image upload issues:
   - Ensure the uploads/menu_images directory exists and has write permissions
   - Check if the image file size is within limits
   - Verify supported image formats (JPEG, PNG, GIF)

Monitoring and Maintenance
1. System Reports:
   - Access /system-report endpoint (admin only)
   - Monitor order statistics
   - Track revenue metrics
   - View menu performance
2. Backup Procedures:
   - Regular MongoDB backups
   - Image uploads backup
   - Environment configuration backup
   - User data export
3. Performance Optimization:
   - MongoDB indexing
   - API request caching
   - Image optimization
   - Connection pooling
4. Security Maintenance:
   - Regular security updates
   - Token rotation
   - Access log monitoring
   - SSL/TLS certificate renewal



Common Operations
1. Adding Menu Items:
   - Upload item image
   - Set price and category
   - Configure tax and parcel charges
   - Set availability status
2. User Management:
   - Create user accounts
   - Assign roles
   - Reset passwords
   - Manage permissions
3. Order Processing:
   - Order creation
   - Status updates
   - Kitchen notifications
   - Payment processing
4. Table Management:
   - Tab creation
   - Waiter assignment
   - Status monitoring
   - Table turnover









Security Notes
1. Always change the default SECRET_KEY in production
2. Use strong passwords for admin accounts
3. Configure proper CORS settings in production
4. Set up proper MongoDB authentication
5. Use HTTPS in production

For additional help or issues, please refer to:
- FastAPI documentation: https://fastapi.tiangolo.com/
- Expo documentation: https://docs.expo.dev/
- React Native documentation: https://reactnative.dev/docs/getting-started
- MongoDB documentation: https://docs.mongodb.com/
