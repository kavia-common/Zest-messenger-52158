# Zest Messenger - MongoDB Backend Guide

This guide explains the app's current architecture, which uses a **simulated backend** to mimic a Node.js/Express server connected to a MongoDB Atlas database. This setup removes the dependency on Firebase and allows for development without a live backend.

## Realtime (Mock WebSocket Layer)

This SPA now includes a lightweight **WebSocket-like realtime layer** that works entirely in the browser (no external services).

- Transport: `BroadcastChannel` (multi-tab capable)
- Purpose: Simulate server push for events such as:
  - `MessageCreated`
  - `FriendRequestCreated`
  - `FriendRequestUpdated`
  - `ChatUpdated`
  - `NotificationCountUpdated`
  - `StoryUpdated` (placeholder for future work)

### Enable / Disable

Realtime is guarded by a Vite feature flag:

- `VITE_ENABLE_REALTIME=true` enables realtime behavior
- If disabled, the app continues to function with the existing “refetch on navigation / action” patterns.

The code reads this via `import.meta.env.VITE_ENABLE_REALTIME` (no secrets involved).

### How it works (High level)

- `src/realtime/wsClient.ts` exposes a small WebSocket-like API:
  - `connect()`, `subscribe()`, `unsubscribe()`, `emit()`
- Under the hood it uses `BroadcastChannel`, so opening two tabs simulates two clients.
- The simulated backend (`backend/services.ts`) emits events *after* successful mock mutations:
  - sending a message
  - sending / accepting / declining friend requests
- Pages and contexts subscribe to events and do lightweight refetches:
  - `ChatPage` appends incoming messages for the active chat
  - `NotificationsPage` refreshes requests list
  - `HomePage` refreshes chats/stories summaries
  - `AuthContext` refreshes current user so the bottom-nav badge stays accurate across tabs

### Extending to a real backend later

To replace the mock hub with a real server:
- Keep the event types in `src/realtime/events.ts`
- Swap `BroadcastChannel` transport in `src/realtime/wsClient.ts` with:
  - native `WebSocket` (`ws://...`) OR
  - Socket.IO client
- Update server to broadcast the same event names/payloads when data changes.

## Current Architecture: Simulated Backend

The application currently operates entirely on the client-side. All backend logic and data storage are handled by a mock service located at `backend/services.ts`.

-   **Data:** The "database" is a set of in-memory JavaScript arrays that are initialized when the app loads. This data is not persistent and will reset on page refresh.
-   **API Calls:** All functions in `backend/services.ts` (e.g., `handleLogin`, `getChatsForUser`) are `async` and use a simulated delay to mimic real network requests.
-   **Authentication:** User sessions are managed using the browser's `localStorage`. When a user logs in, their user ID is stored, and on subsequent visits, this ID is used to "authenticate" them against the mock user database.

## Step 1: Build a Real Node.js Backend

To connect this frontend to a real database, you need to build a backend server. A popular choice is the MERN stack (MongoDB, Express, React, Node.js).

### A. Set Up a MongoDB Atlas Cluster

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2.  Create a new project and build a new cluster (the M0 free tier is sufficient for development).
3.  Follow the instructions to create a database user and whitelist your IP address.
4.  Get your connection string (select "Connect your application"). You will need this for your Node.js server.

### B. Create a Node.js/Express Server

You will need to create API endpoints for all the functionalities currently in `backend/services.ts`.

1.  **Project Setup:**
    ```bash
    mkdir zest-server
    cd zest-server
    npm init -y
    npm install express mongoose cors dotenv bcryptjs jsonwebtoken
    ```

2.  **Server Structure:**
    Create endpoints for authentication, users, chats, etc. For example, a login endpoint might look like this:

    ```javascript
    // server.js (simplified example)
    const express = require('express');
    const mongoose = require('mongoose');
    require('dotenv').config();

    const app = express();
    app.use(express.json());

    // Connect to MongoDB Atlas
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log('MongoDB connected'))
      .catch(err => console.log(err));

    // --- Define Mongoose Schemas (User, Chat, etc.) ---
    // --- Define API Routes (app.post('/api/auth/login', ...), etc.) ---
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    ```

## Step 2: Connect the React Frontend to Your Backend

Once your backend is running, you can replace the mock service calls with real `fetch` or `axios` requests.

1.  **Replace Service Logic:**
    Go into `backend/services.ts` and replace the mock logic with actual HTTP requests to your server.

    **Before (Mock):**
    ```typescript
    // backend/services.ts
    export const handleLogin = async (loginData: LoginData): Promise<User> => {
      // ... mock logic finding user in an array
    };
    ```

    **After (Real API Call):**
    ```typescript
    // backend/services.ts
    const API_URL = 'http://localhost:5000/api'; // Your server URL

    export const handleLogin = async (loginData: LoginData): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to log in');
      }

      const { user, token } = await response.json();
      // Store the token (e.g., in localStorage) for subsequent requests
      localStorage.setItem('authToken', token);
      return user;
    };
    ```

2.  **Handle Real-Time Updates (Optional):**
    The original app used Firestore's real-time listeners. To replicate this with a MongoDB backend, you would need to implement WebSockets using a library like `socket.io`.
    -   Your server would emit events when new messages are created.
    -   Your React client would listen for these events and update the UI accordingly.

This setup provides a clear path from a client-only prototype to a full-stack, production-ready application.