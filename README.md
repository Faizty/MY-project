# E-commerce

Brief description of your Spring Boot + React/Next.js application with WebSocket messaging.

## Project Structure
```
project/
├── backend/           # Spring Boot API
├── frontend/          # React/Next.js application
├── websocket-server.js # Node.js WebSocket server
└── README.md
```

## Prerequisites
- Node.js and npm
- Java 11+ and Maven
- PostgreSQL database
- IntelliJ IDEA or Eclipse IDE
- VS Code (recommended for frontend)

## Setup Instructions

### 1. Frontend Setup (React/Next.js)

1. Open the frontend project in VS Code
2. Open terminal and run these commands in order:
   ```bash
   npm install --legacy-peer-deps
   npm uninstall react react-dom --legacy-peer-deps
   npm install react@18 react-dom@18
   ```

### 2. Backend Setup (Spring Boot)

1. Move the backend folder to your IntelliJ IDEA or Eclipse workspace
2. Open the project in your Java IDE
3. Configure the database in `application.properties`:
   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:postgresql://localhost:5432/your-database-name
   spring.datasource.username=your-username
   spring.datasource.password=your-password
   ```
4. (Optional) Adjust JWT token lifespan in the same file if needed

### 3. WebSocket Messaging System

The project includes a Node.js WebSocket server for real-time messaging. The WebSocket client is integrated into the frontend application.

## Running the Application

Follow these steps in order:

### Step 1: Start the Backend
1. Run the Spring Boot application using the run button in your IDE
2. Wait for the application to start completely

### Step 2: Start the WebSocket Server
1. Open a new terminal (or Command Prompt)
2. Navigate to the project root directory
3. Run the WebSocket server:
   ```bash
   node websocket-server.js
   ```
4. Verify the WebSocket server is running

### Step 3: Start the Frontend
1. Open VS Code terminal in the frontend directory
2. Start the development server:
   ```bash
   npm run dev
   ```

## Features
- Spring Boot REST API
- React/Next.js frontend
- Real-time messaging with WebSocket
- PostgreSQL database integration
- JWT authentication

## API Endpoints
- Add your main API endpoints here

## Technologies Used
- **Backend:** Spring Boot, Java, PostgreSQL
- **Frontend:** React 18, Next.js
- **Messaging:** Node.js WebSocket
- **Authentication:** JWT

## Troubleshooting

### Common Issues
- **Database connection errors:** Check your PostgreSQL service and database credentials
- **Port conflicts:** Ensure ports 3000 (frontend), 8080 (backend), and WebSocket port are available
- **Dependency issues:** Run `npm install --legacy-peer-deps` if you encounter peer dependency warnings

### Development Tips
- Backend runs on: `http://localhost:8080`
- Frontend runs on: `http://localhost:3000`
- Check browser console for frontend errors
- Check IDE console for backend errors

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request