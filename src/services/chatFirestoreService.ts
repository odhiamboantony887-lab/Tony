/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { ChatMessage, Conversation, PersonaConfig } from '../utils/chatUtils.ts';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: number;
  updatedAt?: number;
}

/**
 * Creates or updates user profile in Firestore
 */
export async function saveUserProfile(uid: string, email: string, displayName: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const existing = await getDoc(userDocRef);
    const now = Date.now();

    if (!existing.exists()) {
      await setDoc(userDocRef, {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        createdAt: now,
        updatedAt: now
      });
    } else {
      await setDoc(userDocRef, {
        displayName: displayName || existing.data()?.displayName || email.split('@')[0],
        updatedAt: now
      }, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Loads user conversations from Firestore
 */
export async function loadUserConversations(userId: string): Promise<Conversation[]> {
  const path = 'conversations';
  try {
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);

    const conversations: Conversation[] = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      // Load messages subcollection
      const messagesPath = `conversations/${docSnap.id}/messages`;
      const messagesQ = query(
        collection(db, 'conversations', docSnap.id, 'messages'),
        orderBy('timestamp', 'asc')
      );
      const messagesSnap = await getDocs(messagesQ);

      const messages: ChatMessage[] = messagesSnap.docs.map(mDoc => {
        const mData = mDoc.data();
        return {
          id: mData.id || mDoc.id,
          role: mData.role,
          content: mData.content,
          timestamp: mData.timestamp,
          language: mData.language,
          tokensUsed: mData.tokensUsed
        };
      });

      conversations.push({
        id: data.id || docSnap.id,
        title: data.title || 'Conversation',
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
        messages: messages.length > 0 ? messages : [],
        tone: data.tone || 'balanced'
      });
    }

    // Sort client-side by updatedAt descending
    return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Saves a conversation and its messages to Firestore
 */
export async function saveConversationToFirestore(
  userId: string,
  conv: Conversation
): Promise<void> {
  const convPath = `conversations/${conv.id}`;
  try {
    const convRef = doc(db, 'conversations', conv.id);
    await setDoc(convRef, {
      id: conv.id,
      userId,
      title: conv.title,
      tone: conv.tone,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt
    }, { merge: true });

    // Save latest messages
    for (const msg of conv.messages) {
      const msgPath = `conversations/${conv.id}/messages/${msg.id}`;
      const msgRef = doc(db, 'conversations', conv.id, 'messages', msg.id);
      await setDoc(msgRef, {
        id: msg.id,
        conversationId: conv.id,
        userId,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        language: msg.language || 'en',
        tokensUsed: msg.tokensUsed || 0
      }, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, convPath);
  }
}

/**
 * Deletes a conversation from Firestore
 */
export async function deleteConversationFromFirestore(convId: string): Promise<void> {
  const path = `conversations/${convId}`;
  try {
    await deleteDoc(doc(db, 'conversations', convId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Loads custom training items for user
 */
export async function loadUserTrainings(userId: string): Promise<any[]> {
  const path = `users/${userId}/trainings`;
  try {
    const q = collection(db, 'users', userId, 'trainings');
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Saves a training item in Firestore under users/{userId}/trainings/{trainingId}
 */
export async function saveTrainingItemToFirestore(userId: string, item: any): Promise<void> {
  const path = `users/${userId}/trainings/${item.id}`;
  try {
    const itemRef = doc(db, 'users', userId, 'trainings', item.id);
    await setDoc(itemRef, {
      id: item.id,
      userId,
      type: item.type,
      title: item.title,
      prompt: item.prompt,
      response: item.response,
      enabled: Boolean(item.enabled),
      createdAt: item.createdAt || Date.now(),
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Deletes a training item from Firestore
 */
export async function deleteTrainingItemFromFirestore(userId: string, itemId: string): Promise<void> {
  const path = `users/${userId}/trainings/${itemId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'trainings', itemId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

