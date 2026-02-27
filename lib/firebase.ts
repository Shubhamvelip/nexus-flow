import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    Firestore,
    Timestamp,
    query,
    orderBy,
    where,
    updateDoc,
} from 'firebase/firestore';

// ── Firebase config ─────────────────────────────────────────────────────────

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton initialisation — safe for Next.js hot-reload
let app: FirebaseApp;
let db: Firestore;

function getFirebaseApp(): FirebaseApp {
    if (!app) {
        console.log("Firebase Config Initialization:", {
            ...firebaseConfig,
            apiKey: firebaseConfig.apiKey ? "[HIDDEN]" : undefined
        });

        if (!firebaseConfig.apiKey) {
            throw new Error("Firebase API key is undefined. Check NEXT_PUBLIC_FIREBASE_API_KEY.");
        }

        app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    }
    return app;
}

export function getDb(): Firestore {
    if (!db) {
        db = getFirestore(getFirebaseApp());
    }
    return db;
}

let auth: Auth;

export function getFirebaseAuth(): Auth {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
    }
    return auth;
}

// ── Policy schema ────────────────────────────────────────────────────────────

export interface PolicyWorkflowStep {
    step: string;
    description: string;
}

export interface PolicyDecisionTree {
    question: string;
    yes: PolicyDecisionTree | { action: string };
    no: PolicyDecisionTree | { action: string };
}

export interface PolicyChecklistItem {
    id: string;
    title: string;
    completed: boolean;
}

export interface PolicyDocument {
    id?: string;
    title: string;
    input_text: string;
    workflow: PolicyWorkflowStep[];
    decision_tree: PolicyDecisionTree;
    checklist: PolicyChecklistItem[];
    created_at: Timestamp | Date;
    userId: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const COLLECTION = 'policies';

/**
 * Create a new policy document in Firestore.
 */
export async function createPolicy(
    data: Omit<PolicyDocument, 'id' | 'created_at'>
): Promise<PolicyDocument> {
    const db = getDb();
    const payload = {
        ...data,
        created_at: Timestamp.now(),
    };

    console.log("Attempting DB write");
    try {
        const docRef = await addDoc(collection(db, COLLECTION), payload);
        console.log("DB write success");
        return {
            id: docRef.id,
            ...payload,
        };
    } catch (error) {
        console.error("DB write failed:", error);
        return {
            id: `temp-${Date.now()}`,
            ...payload,
        };
    }
}

/**
 * Fetch all policies, ordered by newest first.
 */
export async function getPolicies(userId?: string): Promise<PolicyDocument[]> {
    const db = getDb();
    let q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));

    if (userId) {
        q = query(collection(db, COLLECTION), where('userId', '==', userId), orderBy('created_at', 'desc'));
    }

    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<PolicyDocument, 'id'>),
        }));
    } catch (error) {
        console.error("Firestore read failed (getPolicies):", error);
        return [];
    }
}

/**
 * Fetch a single policy by Firestore document ID.
 */
export async function getPolicyById(id: string): Promise<PolicyDocument | null> {
    const db = getDb();
    const docRef = doc(db, COLLECTION, id);

    try {
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) return null;

        return {
            id: snapshot.id,
            ...(snapshot.data() as Omit<PolicyDocument, 'id'>),
        };
    } catch (error) {
        console.error("Firestore read failed (getPolicyById):", error);
        return null; // Return null if fetching fails
    }
}

/**
 * Update the checklist for a given policy document.
 */
export async function updatePolicyChecklist(policyId: string, checklist: PolicyChecklistItem[]): Promise<void> {
    const db = getDb();
    const docRef = doc(db, COLLECTION, policyId);
    try {
        await updateDoc(docRef, { checklist });
    } catch (error) {
        console.error("Failed to update checklist in Firestore:", error);
        throw error;
    }
}
