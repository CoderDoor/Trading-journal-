import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, listAll } from 'firebase/storage';

// Firebase configuration - uses environment variables for security
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};


// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        return null;
    }
};

export const signOutUser = async (): Promise<void> => {
    await signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Firestore sync functions
export interface CloudEntry {
    id: string;
    instrument?: string | null;
    tradeType?: string | null;
    timeframe?: string | null;
    entryPrice?: number | null;
    stopLoss?: number | null;
    target?: number | null;
    riskReward?: number | null;
    outcome?: string | null;
    tradeReason?: string | null;
    strategyLogic?: string | null;
    htfBiasAligned?: boolean;
    liquidityTaken?: boolean;
    entryAtPOI?: boolean;
    riskManaged?: boolean;
    bosConfirmed?: boolean;
    mssConfirmed?: boolean;
    chochConfirmed?: boolean;
    orderBlockEntry?: boolean;
    fvgEntry?: boolean;
    killZoneEntry?: boolean;
    asianSession?: boolean;
    londonSession?: boolean;
    nySession?: boolean;
    londonClose?: boolean;
    emotionState?: string | null;
    whatWentWell?: string | null;
    whatWentWrong?: string | null;
    improvement?: string | null;
    rawTranscript?: string;
    createdAt: string;
    updatedAt: string;
}

export const uploadEntryToCloud = async (userId: string, entry: CloudEntry): Promise<void> => {
    console.log('📤 Uploading entry:', entry.id);
    try {
        const entryRef = doc(db, 'users', userId, 'entries', entry.id);
        await setDoc(entryRef, entry, { merge: true });
        console.log('✅ Entry uploaded:', entry.id);
    } catch (error) {
        console.error('❌ Failed to upload entry:', entry.id, error);
        throw error;
    }
};

export const downloadEntriesFromCloud = async (userId: string): Promise<CloudEntry[]> => {
    console.log('📥 Downloading entries for user:', userId);
    try {
        const entriesRef = collection(db, 'users', userId, 'entries');
        const snapshot = await getDocs(entriesRef);
        console.log('✅ Downloaded', snapshot.docs.length, 'entries from cloud');
        return snapshot.docs.map(doc => doc.data() as CloudEntry);
    } catch (error) {
        console.error('❌ Failed to download entries:', error);
        return [];
    }
};

export const deleteEntryFromCloud = async (userId: string, entryId: string): Promise<void> => {
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(entryRef);
};

// Batch sync - much faster than individual writes!
export const syncEntriesToCloud = async (userId: string, entries: CloudEntry[]): Promise<number> => {
    console.log('🔄 Starting batch sync for', entries.length, 'entries');
    console.log('👤 User ID:', userId);

    if (entries.length === 0) return 0;

    try {
        // Clean entries - remove undefined values which Firestore rejects
        const cleanedEntries = entries.map(entry => {
            const cleaned: Record<string, any> = {};
            for (const [key, value] of Object.entries(entry)) {
                // Only include defined, non-undefined values
                if (value !== undefined) {
                    cleaned[key] = value;
                }
            }
            return cleaned as CloudEntry;
        });

        console.log('📦 First entry to sync:', JSON.stringify(cleanedEntries[0], null, 2));

        // Firestore batch writes (max 500 per batch)
        const batchSize = 500;
        let totalSynced = 0;

        for (let i = 0; i < cleanedEntries.length; i += batchSize) {
            const batch = writeBatch(db);
            const chunk = cleanedEntries.slice(i, i + batchSize);

            for (const entry of chunk) {
                const entryRef = doc(db, 'users', userId, 'entries', entry.id);
                console.log('📝 Adding to batch:', entry.id);
                batch.set(entryRef, entry, { merge: true });
            }

            console.log('⏳ Committing batch...');
            await batch.commit();
            totalSynced += chunk.length;
            console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} committed: ${chunk.length} entries`);
        }

        // Verify the write worked by reading back
        console.log('🔍 Verifying sync by reading back...');
        const verifyRef = collection(db, 'users', userId, 'entries');
        const verifySnapshot = await getDocs(verifyRef);
        console.log('✅ Verification: Found', verifySnapshot.docs.length, 'entries in cloud');

        console.log('✅ Sync complete:', totalSynced, 'entries synced');
        return totalSynced;
    } catch (error: any) {
        console.error('❌ Batch sync failed:', error);
        console.error('❌ Error code:', error?.code);
        console.error('❌ Error message:', error?.message);

        // If batch fails, try individual writes
        console.log('🔄 Attempting individual writes as fallback...');
        let successCount = 0;
        for (const entry of entries) {
            try {
                await uploadEntryToCloud(userId, entry);
                successCount++;
            } catch (e) {
                console.error('❌ Failed to upload entry:', entry.id, e);
            }
        }
        console.log('✅ Fallback complete:', successCount, 'entries synced');
        return successCount;
    }
};

// ============================================
// RULES SYNC
// ============================================

export interface CloudRule {
    id: string;
    name: string;
    description?: string | null;
    category: string;
    condition?: string | null;
    severity: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const syncRulesToCloud = async (userId: string, rules: CloudRule[]): Promise<number> => {
    console.log('🔄 Syncing', rules.length, 'rules to cloud');
    if (rules.length === 0) return 0;

    try {
        const batch = writeBatch(db);
        for (const rule of rules) {
            const ruleRef = doc(db, 'users', userId, 'rules', rule.id);
            const cleaned: Record<string, any> = {};
            for (const [key, value] of Object.entries(rule)) {
                if (value !== undefined) cleaned[key] = value;
            }
            batch.set(ruleRef, cleaned, { merge: true });
        }
        await batch.commit();
        console.log('✅ Rules synced:', rules.length);
        return rules.length;
    } catch (error) {
        console.error('❌ Failed to sync rules:', error);
        return 0;
    }
};

export const downloadRulesFromCloud = async (userId: string): Promise<CloudRule[]> => {
    console.log('📥 Downloading rules from cloud');
    try {
        const rulesRef = collection(db, 'users', userId, 'rules');
        const snapshot = await getDocs(rulesRef);
        console.log('✅ Downloaded', snapshot.docs.length, 'rules');
        return snapshot.docs.map(doc => doc.data() as CloudRule);
    } catch (error) {
        console.error('❌ Failed to download rules:', error);
        return [];
    }
};

// ============================================
// VIOLATIONS SYNC
// ============================================

export interface CloudViolation {
    id: string;
    ruleId: string;
    ruleName: string;
    journalEntryId?: string | null;
    punishment: string;
    punishmentType: string;
    severity: string;
    status: string;
    completedAt?: string | null;
    dueDate?: string | null;
    notes?: string | null;
    createdAt: string;
}

export const syncViolationsToCloud = async (userId: string, violations: CloudViolation[]): Promise<number> => {
    console.log('🔄 Syncing', violations.length, 'violations to cloud');
    if (violations.length === 0) return 0;

    try {
        const batch = writeBatch(db);
        for (const violation of violations) {
            const violationRef = doc(db, 'users', userId, 'violations', violation.id);
            const cleaned: Record<string, any> = {};
            for (const [key, value] of Object.entries(violation)) {
                if (value !== undefined) cleaned[key] = value;
            }
            batch.set(violationRef, cleaned, { merge: true });
        }
        await batch.commit();
        console.log('✅ Violations synced:', violations.length);
        return violations.length;
    } catch (error) {
        console.error('❌ Failed to sync violations:', error);
        return 0;
    }
};

export const downloadViolationsFromCloud = async (userId: string): Promise<CloudViolation[]> => {
    console.log('📥 Downloading violations from cloud');
    try {
        const violationsRef = collection(db, 'users', userId, 'violations');
        const snapshot = await getDocs(violationsRef);
        console.log('✅ Downloaded', snapshot.docs.length, 'violations');
        return snapshot.docs.map(doc => doc.data() as CloudViolation);
    } catch (error) {
        console.error('❌ Failed to download violations:', error);
        return [];
    }
};

// ============================================
// SCREENSHOT STORAGE (Firebase Storage)
// ============================================

export const uploadScreenshotToStorage = async (
    userId: string,
    entryId: string,
    screenshotBase64: string,
    index: number
): Promise<string | null> => {
    try {
        // Create a unique path for the screenshot
        const screenshotRef = ref(storage, `users/${userId}/screenshots/${entryId}_${index}.jpg`);

        // Upload the base64 string (data URL format)
        await uploadString(screenshotRef, screenshotBase64, 'data_url');

        // Get the download URL
        const downloadURL = await getDownloadURL(screenshotRef);
        console.log('📸 Screenshot uploaded:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('❌ Failed to upload screenshot:', error);
        return null;
    }
};

export const uploadEntryScreenshots = async (
    userId: string,
    entryId: string,
    screenshotString: string | null
): Promise<string[]> => {
    if (!screenshotString) return [];

    const screenshots = screenshotString.split('|||').filter(s => s.startsWith('data:image'));
    const uploadedUrls: string[] = [];

    console.log(`📸 Uploading ${screenshots.length} screenshots for entry ${entryId}`);

    for (let i = 0; i < screenshots.length; i++) {
        const url = await uploadScreenshotToStorage(userId, entryId, screenshots[i], i);
        if (url) {
            uploadedUrls.push(url);
        }
    }

    return uploadedUrls;
};

export const syncScreenshotsToCloud = async (
    userId: string,
    entries: Array<{ id: string; screenshot: string | null }>
): Promise<number> => {
    console.log('🔄 Syncing screenshots to Firebase Storage');
    let totalUploaded = 0;

    for (const entry of entries) {
        if (entry.screenshot) {
            const urls = await uploadEntryScreenshots(userId, entry.id, entry.screenshot);

            // Store the URLs in Firestore for quick access
            if (urls.length > 0) {
                const entryRef = doc(db, 'users', userId, 'entries', entry.id);
                await setDoc(entryRef, { screenshotUrls: urls }, { merge: true });
                totalUploaded += urls.length;
            }
        }
    }

    console.log('✅ Screenshots synced:', totalUploaded);
    return totalUploaded;
};
