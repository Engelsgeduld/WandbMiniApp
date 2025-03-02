# **WandbBot – Telegram Mini App for API Key and Project Management**  

## **Overview**  
WandbBot is a **Telegram Mini App** built with **React (frontend) and Flask (backend)**, designed to manage API keys and track project runs. It enables users to store, validate, and manage API keys, select projects, and view detailed execution metrics with interactive charts.  

## **Key Features**  

### 🔑 **API Key Management**  
- Add, validate, and store API keys securely.  
- View a scrollable list of saved API keys.  
- Delete API keys when no longer needed.  

### 📁 **Project Selection**  
- Enter or select an existing project.  
- Fetch and display user-specific projects from the server.  
- Navigate seamlessly between projects and their details.  

### 🚀 **Run Monitoring**  
- Display all runs within a selected project.  
- Search for specific runs by name.  
- View detailed charts for selected runs.  

### 📊 **Metric Visualization**  
- Users can choose which metrics to display.  
- Interactive charts visualize key performance indicators.  
- Adaptable to different screen sizes for optimal mobile experience.  

## **Technology Stack**  

### **Frontend (React + Telegram Web API)**  
- **React.js**: UI rendering and state management.  
- **React Router**: Navigation between pages.  
- **Telegram Web API**: Native integration with Telegram’s Mini Apps environment.  
- **Tailwind CSS**: Styled UI components for a clean Telegram-native look.  

### **Backend (Flask + PostgreSQL)**  
- **Flask**: Handles API requests and user authentication.  
- **PostgreSQL**: Stores user API keys securely.  
- **psycopg2**: Connects Flask to the PostgreSQL database.

This **WandbBot** mini app makes it easier for users to **manage API keys and track project performance** directly within **Telegram**, offering a seamless and intuitive experience.
