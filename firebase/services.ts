
// FIX: Import firebase v8 compat library for FieldValue.
// FIX: Corrected firebase import to use compat version.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { auth, db, googleProvider } from './config';
// FIX: Corrected import from local types file. SignUpData and LoginData were added.
import type { User, FriendRequest, SignUpData, LoginData } from '../types';

// --- AUTHENTICATION SERVICES ---

export const handleSignUp = async ({ name, email, password }: SignUpData): Promise<void> => {
  try {
    // FIX: Use v8 `auth.createUserWithEmailAndPassword` method.
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    if (!user) throw new Error("User creation failed.");

    // Create a corresponding user document in Firestore
    // FIX: Use v8 `db.collection().doc()` and `.set()` syntax.
    const userDocRef = db.collection('users').doc(user.uid);
    await userDocRef.set({
      id: user.uid,
      name,
      email,
      avatarUrl: `https://picsum.photos/seed/${user.uid}/200`, // Default avatar
      bio: `Hi, I'm ${name}!`,
      online: true,
      friends: [],
      friendRequestsSent: [],
      friendRequestsReceived: [],
    });
  } catch (error: any) {
    console.error("Error signing up:", error);
    alert(error.message);
    throw error;
  }
};

export const handleLogin = async ({ email, password }: LoginData): Promise<void> => {
  try {
    // FIX: Use v8 `auth.signInWithEmailAndPassword` method.
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error: any) {
    console.error("Error logging in:", error);
    alert(error.message);
    throw error;
  }
};

export const handleGoogleSignIn = async (): Promise<void> => {
    try {
        // FIX: Use v8 `auth.signInWithPopup` method.
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        if (!user) throw new Error("Google Sign-In failed.");

        // Check if user already exists in Firestore
        // FIX: Use v8 `db.collection().doc()` and `.get()` syntax.
        const userDocRef = db.collection('users').doc(user.uid);
        const docSnap = await userDocRef.get();

        // FIX: In v8, `exists` is a property.
        if (!docSnap.exists) {
            // If new user, create their document in Firestore
            // FIX: Use v8 `.set()` method.
            await userDocRef.set({
                id: user.uid,
                name: user.displayName || 'Google User',
                email: user.email,
                avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200`,
                bio: `Hi! I'm new here.`,
                online: true,
                friends: [],
                friendRequestsSent: [],
                friendRequestsReceived: [],
            });
        }
    } catch (error: any) {
        console.error("Error with Google sign-in:", error);
        alert(error.message);
        throw error;
    }
};

export const handleLogout = async (): Promise<void> => {
  try {
    // FIX: Use v8 `auth.signOut` method.
    await auth.signOut();
  } catch (error: any) {
    console.error("Error logging out:", error);
    alert(error.message);
  }
};


// --- FIRESTORE USER & SOCIAL SERVICES ---

export const getUserById = async (userId: string): Promise<User | null> => {
    // FIX: Use v8 `db.collection().doc()` and `.get()` syntax.
    const userDocRef = db.collection("users").doc(userId);
    const docSnap = await userDocRef.get();
    // FIX: In v8, `exists` is a property.
    if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
};

export const searchUsersByName = async (name: string, currentUserId: string): Promise<User[]> => {
    if (!name.trim()) return [];
    // FIX: Use v8 `db.collection()` and chained query methods.
    const usersRef = db.collection("users");
    const q = usersRef 
        .orderBy("name") 
        .startAt(name) 
        .endAt(name + '\uf8ff') 
        .limit(10);
    
    // FIX: Use v8 `.get()` on the query.
    const querySnapshot = await q.get();
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
        if(doc.id !== currentUserId) { // Exclude current user from search results
            users.push({ id: doc.id, ...doc.data() } as User);
        }
    });
    return users;
}

export const handleSendFriendRequest = async (fromId: string, toId: string) => {
    // FIX: Use v8 `db.batch()` for batch writes.
    const batch = db.batch();
    
    // Update sender's sent requests
    const fromDocRef = db.collection('users').doc(fromId);
    // FIX: Use v8 `update` and `firebase.firestore.FieldValue.arrayUnion`.
    batch.update(fromDocRef, { friendRequestsSent: firebase.firestore.FieldValue.arrayUnion(toId) });

    // Update receiver's received requests
    const toDocRef = db.collection('users').doc(toId);
    batch.update(toDocRef, { friendRequestsReceived: firebase.firestore.FieldValue.arrayUnion(fromId) });

    await batch.commit();
}

export const getFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
    const user = await getUserById(userId);
    if (!user || !user.friendRequestsReceived || user.friendRequestsReceived.length === 0) {
        return [];
    }
    
    // Fetch user profiles for each request
    const userPromises = user.friendRequestsReceived.map(id => getUserById(id));
    const users = await Promise.all(userPromises);

    return user.friendRequestsReceived.map((fromId, index) => ({
        id: fromId, // Use the sender's ID as the request ID for simplicity
        fromId,
        toId: userId,
        status: 'pending',
        fromUser: users[index] || undefined,
    }));
}


export const handleAcceptFriendRequest = async (currentUserId: string, requesterId: string) => {
    // FIX: Use v8 `db.batch()`.
    const batch = db.batch();

    // Add to each other's friends list
    const currentUserRef = db.collection('users').doc(currentUserId);
    // FIX: Use `firebase.firestore.FieldValue.arrayUnion`.
    batch.update(currentUserRef, { friends: firebase.firestore.FieldValue.arrayUnion(requesterId) });
    const requesterRef = db.collection('users').doc(requesterId);
    batch.update(requesterRef, { friends: firebase.firestore.FieldValue.arrayUnion(currentUserId) });

    // Remove from requests lists
    // FIX: Use `firebase.firestore.FieldValue.arrayRemove`.
    batch.update(currentUserRef, { friendRequestsReceived: firebase.firestore.FieldValue.arrayRemove(requesterId) });
    batch.update(requesterRef, { friendRequestsSent: firebase.firestore.FieldValue.arrayRemove(currentUserId) });
    
    // Create a new chat for them
    // FIX: Use v8 `db.collection()` and `.add()`.
    const chatRef = db.collection("chats");
    await chatRef.add({
        userIds: [currentUserId, requesterId],
        messages: [],
        unreadCount: 0,
    });
    
    await batch.commit();
}

export const handleDeclineFriendRequest = async (currentUserId: string, requesterId: string) => {
    // FIX: Use v8 `db.batch()`.
    const batch = db.batch();

    // Remove from requests lists
    const currentUserRef = db.collection('users').doc(currentUserId);
    // FIX: Use `firebase.firestore.FieldValue.arrayRemove`.
    batch.update(currentUserRef, { friendRequestsReceived: firebase.firestore.FieldValue.arrayRemove(requesterId) });
    const requesterRef = db.collection('users').doc(requesterId);
    batch.update(requesterRef, { friendRequestsSent: firebase.firestore.FieldValue.arrayRemove(currentUserId) });

    await batch.commit();
}
