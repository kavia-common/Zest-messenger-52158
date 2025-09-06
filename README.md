
# Zest Messenger - Firebase Setup Guide

This guide provides the necessary steps to integrate Zest with a Firebase backend. The current version of the app uses mock data, but it is structured to easily connect to Firebase services.

## Prerequisites

1.  A Google Account.
2.  `node` and `npm` installed on your machine.
3.  A working React project (this codebase).

## Step 1: Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click on **"Add project"**.
3.  Give your project a name (e.g., "ZestMessenger") and follow the on-screen instructions.
4.  Once the project is created, you will be redirected to the project dashboard.

## Step 2: Set Up Firebase for a Web App

1.  On your project dashboard, click the Web icon (`</>`) to add a web app to your project.
2.  Register your app with a nickname (e.g., "Zest Web App").
3.  Firebase will provide you with a configuration object. Copy this object.

## Step 3: Integrate Firebase SDK into the React App

1.  **Install the Firebase SDK:**
    ```bash
    npm install firebase
    ```

2.  **Create a Firebase configuration file:**
    Create a new directory `firebase` in the root of your project and add a file named `config.ts` (`firebase/config.ts`).

3.  **Add your Firebase config to `firebase/config.ts`:**
    Paste the configuration object you copied earlier into this file and initialize Firebase.

    ```typescript
    // firebase/config.ts
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";
    import { getStorage } from "firebase/storage";

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Export Firebase services
    export const auth = getAuth(app);
    export const db = getFirestore(app);
    export const storage = getStorage(app);
    ```
    **IMPORTANT:** Replace the placeholder values with your actual Firebase config. For security, use environment variables to store these keys in a production app.

## Step 4: Set Up Firebase Services

### A. Authentication

1.  In the Firebase Console, go to **Authentication** from the left-hand menu.
2.  Click the **"Get started"** button.
3.  On the **Sign-in method** tab, enable the providers you want to use (e.g., **Email/Password**, **Phone**).

### B. Firestore Database

1.  In the Firebase Console, go to **Firestore Database**.
2.  Click **"Create database"**.
3.  Start in **test mode** for initial development. This allows open read/write access.
    **WARNING:** Test mode is insecure. You **must** configure security rules before launching your app.
4.  Choose a location for your database.

    **Data Structures:**
    You'll need to create collections for `users`, `chats`, and `stories`.
    -   `users/{userId}`: Stores user profile information.
    -   `chats/{chatId}`: Stores chat metadata.
    -   `chats/{chatId}/messages/{messageId}`: A subcollection for messages within a chat.
    -   `stories/{storyId}`: Stores story information.

### C. Firebase Storage

1.  In the Firebase Console, go to **Storage**.
2.  Click **"Get started"**.
3.  Follow the setup wizard, using the default security rules for development.
    **WARNING:** Like Firestore, you **must** configure proper security rules for production to protect user files.

## Step 5: Replace Mock Data with Firebase Calls

Now you can go through the application and replace the mock data hooks (`hooks/useMockData.ts`) with real-time Firebase calls.

-   Use `onSnapshot` from Firestore for real-time updates on chats and messages.
-   Use Firebase Storage `uploadBytes` and `getDownloadURL` for handling image uploads for messages and stories.
-   Use Firebase Authentication functions (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, etc.) for user management.

This setup provides a solid foundation for building a fully functional, real-time messaging app with Zest.
