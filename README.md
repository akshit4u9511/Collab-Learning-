Collab-Learning

Collab-Learning is a community-driven platform built to support collaborative learning and peer-to-peer skill exchange. The goal of this project is to allow users to connect, share knowledge, and grow together through practical interaction.

Project Structure

Collab-Learning/
  Frontend/
  Backend/

Requirements

Before running the project, make sure you have Node.js installed on your system. npm is included automatically when you install Node.js.

Installing Dependencies

First, install the dependencies for both the frontend and backend.

For the frontend:
1. Open a terminal.
2. Navigate to the Frontend folder:
   cd Frontend
3. Install the required packages:
   npm install

For the backend:
1. Open a separate terminal.
2. Navigate to the Backend folder:
   cd Backend
3. Install the required packages:
   npm install

Running the Project

You need to run the frontend and backend in two separate terminals.

To run the frontend:
cd Frontend
npm run dev

To run the backend:
cd Backend
npm run dev

Environment Variables (Backend)

Inside the Backend folder, create a file named .env and add the following:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret

Make sure to replace these values with your actual configuration details.

Default Ports

By default, the frontend runs on:
http://localhost:5173

The backend runs on:
http://localhost:5000

Notes

Both the frontend and backend must be running at the same time for the application to work properly. Always run npm install before using npm run dev, especially after cloning the project. Do not upload node_modules or the .env file to GitHub.

Author: Akshit Sharma
