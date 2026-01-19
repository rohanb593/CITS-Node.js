**Status:** ✅ Completed

# Corporate IT Solutions - Node.js Application

This is a full-stack web application built with Node.js, Express, and MySQL for managing corporate IT inventory, user authentication, and media file uploads.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Features Details](#features-details)
- [Troubleshooting](#troubleshooting)

## 🚀 Features

### Authentication System
- User registration and login
- Session-based authentication
- Password hashing with bcrypt
- City-based location selection
- Secure session management with MySQL session store

### Inventory Management
- Real-time inventory display
- Server-Sent Events (SSE) for live updates
- Automatic totals calculation (items, discounts, prices)
- Responsive inventory interface

### Media Upload System
- Image and video file uploads
- Separate storage for images and videos
- Support for multiple file uploads
- Bulk deletion functionality
- Video upload limit (max 5 videos per upload)
- File size limit: 50MB per file
- User-specific media management

### User Interface
- Modern, responsive design
- Multiple theme support
- Intuitive navigation
- Real-time data updates

## 🛠 Technology Stack

- **Backend Framework**: Express.js 5.1.0
- **Database**: MySQL (mysql2 3.14.1)
- **Session Management**: express-session with MySQL store
- **File Upload**: Multer 2.0.1
- **Password Hashing**: bcryptjs 3.0.2
- **Environment Variables**: dotenv 17.0.1
- **CORS**: cors 2.8.5
- **Body Parser**: body-parser 2.2.0

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **MySQL** (v8.0 or higher)
- **Git** (for cloning the repository)

## 🔧 Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd CITS-Node.js
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install nodemon globally** (optional, for development)
   ```bash
   npm install -g nodemon
   ```

## ⚙️ Configuration

1. **Create a `.env` file** in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=Corporate IT Solutions

   # Session Configuration
   SESSION_SECRET=your-secret-key-here-change-in-production

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:8080
   ```

2. **Update the configuration values** according to your environment:
   - Replace `your_mysql_password` with your MySQL root password
   - Change `SESSION_SECRET` to a strong, random string for production
   - Adjust `PORT` if port 3000 is already in use
   - Update `FRONTEND_URL` to match your frontend application URL

## 🗄️ Database Setup

1. **Create the MySQL database**:
   ```sql
   CREATE DATABASE `Corporate IT Solutions`;
   ```

2. **Required Database Tables**:
   
   The application expects the following tables:
   
   - **USERS2**: Stores user credentials
     ```sql
     CREATE TABLE USERS2 (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```
   
   - **zambian_cities**: Stores city information for login
     ```sql
     CREATE TABLE zambian_cities (
       id INT AUTO_INCREMENT PRIMARY KEY,
       city_name VARCHAR(255) NOT NULL
     );
     ```
   
   - **HD_DISPLAY**: Inventory items table
     ```sql
     CREATE TABLE HD_DISPLAY (
       id INT AUTO_INCREMENT PRIMARY KEY,
       NU_QTY DECIMAL(10,2),
       NU_DISCOUNT DECIMAL(10,2),
       NU_ITEM_PRICE DECIMAL(10,2),
       NU_LINE_TOTAL DECIMAL(10,2),
       NU_VAT_AMOUNT DECIMAL(10,2),
       -- Add other inventory fields as needed
     );
     ```
   
   - **uploaded_media**: Stores media file metadata
     ```sql
     CREATE TABLE uploaded_media (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       file_name VARCHAR(255) NOT NULL,
       file_type VARCHAR(100) NOT NULL,
       file_size BIGINT NOT NULL,
       file_path VARCHAR(500) NOT NULL,
       uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES USERS2(id)
     );
     ```
   
   - **sessions**: Automatically created by express-mysql-session for session storage

3. **Insert sample city data** (optional):
   ```sql
   INSERT INTO zambian_cities (city_name) VALUES 
   ('Lusaka'),
   ('Kitwe'),
   ('Ndola'),
   ('Kabwe'),
   ('Livingstone');
   ```

## 🏃 Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

### Access the Application

- **Login Page**: `http://localhost:3000/auth/login`
- **Signup Page**: `http://localhost:3000/auth/signup`
- **Home Page**: `http://localhost:3000/home` (requires authentication)
- **Inventory Page**: `http://localhost:3000/inventory` (requires authentication)
- **Upload Page**: `http://localhost:3000/upload` (requires authentication)

## 📁 Project Structure

```
CITS-Node.js/
├── app.js                      # Main application entry point
├── package.json                # Dependencies and scripts
├── .env                        # Environment variables (create this)
├── controllers/                # Business logic controllers
│   ├── authController.js       # Authentication logic
│   ├── inventoryController.js  # Inventory management logic
│   └── uploadController.js     # File upload logic
├── models/                     # Database models
│   └── db.js                   # MySQL connection pool
├── routes/                     # API routes
│   ├── auth.js                 # Authentication routes
│   ├── home.js                 # Home page routes
│   ├── inventory.js            # Inventory routes
│   └── upload.js               # Upload routes
└── public/                     # Static files and views
    ├── css/                    # Stylesheets
    │   ├── homePage.css
    │   ├── itemSorter.css
    │   ├── login.css
    │   ├── theme.css
    │   └── uploadPage.css
    ├── js/                     # Client-side JavaScript
    │   └── loginDisplay.js
    ├── views/                  # HTML views
    │   ├── home.html
    │   ├── inventory.html
    │   ├── login.html
    │   ├── signup.html
    │   └── upload.html
    └── uploads/                # Uploaded media files
        ├── images/             # Image uploads
        └── videos/             # Video uploads
```

## 🔌 API Endpoints

### Authentication Endpoints

- `GET /auth/login` - Render login page
- `POST /auth/login` - Authenticate user
  ```json
  {
    "username": "string",
    "password": "string",
    "city": "string"
  }
  ```

- `GET /auth/signup` - Render signup page
- `POST /auth/signup` - Register new user
  ```json
  {
    "username": "string",
    "password": "string",
    "confirmPassword": "string"
  }
  ```

- `GET /auth/logout` - Logout user

### Inventory Endpoints

- `GET /inventory` - Render inventory page (protected)
- `GET /inventory/api` - Get inventory data (protected)
- `GET /inventory/api/sse` - SSE stream for real-time updates (protected)

### Upload Endpoints

- `GET /upload` - Render upload page (protected)
- `GET /upload/media` - Get user's uploaded media (protected)
- `POST /upload` - Upload files (protected, multipart/form-data)
- `DELETE /upload/:id` - Delete single file (protected)
- `DELETE /upload/bulk-delete` - Bulk delete files (protected)
  ```json
  {
    "ids": [1, 2, 3]
  }
  ```

### Home Endpoint

- `GET /home` - Render home page (protected)

## 📝 Features Details

### Session Management
- Sessions are stored in MySQL database
- Session duration: 24 hours
- Automatic session cleanup on logout
- Secure HTTP-only cookies

### File Upload System
- **Supported Types**: Images (image/*) and Videos (video/*)
- **File Size Limit**: 50MB per file
- **Video Limit**: Maximum 5 videos per upload
- **Storage**: Files stored in `public/uploads/images/` and `public/uploads/videos/`
- **Temporary Storage**: Files initially stored in `temp_uploads/` before being moved to permanent location

### Real-time Updates
- Inventory page uses Server-Sent Events (SSE) for live updates
- Updates automatically every 2 seconds
- No page refresh required

### Security Features
- Password hashing with bcrypt (10 salt rounds)
- Session-based authentication
- Protected routes require valid session
- CORS configuration for cross-origin requests
- File type validation on upload

## 🐛 Troubleshooting

### Common Issues

1. **Cannot connect to database**
   - Verify MySQL is running: `mysql -u root -p`
   - Check `.env` file has correct database credentials
   - Ensure database exists: `CREATE DATABASE \`Corporate IT Solutions\`;`

2. **Session not persisting**
   - Verify sessions table exists (auto-created by express-mysql-session)
   - Check SESSION_SECRET in `.env`
   - Clear browser cookies and try again

3. **File upload fails**
   - Ensure `public/uploads/images/` and `public/uploads/videos/` directories exist
   - Check file size is under 50MB
   - Verify file type is image or video
   - Check user is authenticated (session exists)

4. **Port already in use**
   - Change PORT in `.env` file
   - Or kill the process using port 3000:
     ```bash
     # On macOS/Linux
     lsof -ti:3000 | xargs kill
     ```

5. **Module not found errors**
   - Run `npm install` to install all dependencies
   - Verify `node_modules/` directory exists

## 📄 License

ISC

## 👤 Author

Corporate IT Solutions Team

## 📞 Support

For issues and questions, please create an issue in the repository or contact the development team.

---

**Status: ✅ Complete** - The application is fully functional and ready for use.
