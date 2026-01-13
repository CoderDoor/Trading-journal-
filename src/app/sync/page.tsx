'use client';

import { useState, useEffect } from 'react';
import {
    signInWithGoogle,
    signOutUser,
    onAuthChange,
    syncEntriesToCloud,
    downloadEntriesFromCloud,
    syncRulesToCloud,
    downloadRulesFromCloud,
    syncViolationsToCloud,
    downloadViolationsFromCloud,
    syncScreenshotsToCloud,
    CloudEntry,
    CloudRule,
    CloudViolation
} from '@/lib/firebase';
import { User } from 'firebase/auth';

export default function SyncPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [localCount, setLocalCount] = useState(0);
    const [cloudCount, setCloudCount] = useState(0);
    const [localRulesCount, setLocalRulesCount] = useState(0);
    const [cloudRulesCount, setCloudRulesCount] = useState(0);
    const [localViolationsCount, setLocalViolationsCount] = useState(0);
    const [cloudViolationsCount, setCloudViolationsCount] = useState(0);
    const [message, setMessage] = useState('');
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                loadCounts(user.uid);
                // Check last sync time
                const stored = localStorage.getItem('lastSyncTime');
                if (stored) setLastSync(stored);
            }
        });
        return () => unsubscribe();
    }, []);

    const loadCounts = async (userId: string) => {
        // Load local entries
        try {
            const res = await fetch('/api/journal');
            const data = await res.json();
            setLocalCount(data.entries?.length || 0);
        } catch (e) {
            console.error('Error loading local entries:', e);
        }

        // Load local rules
        try {
            const res = await fetch('/api/rulebook');
            const data = await res.json();
            setLocalRulesCount(data.rules?.length || 0);
        } catch (e) {
            console.error('Error loading local rules:', e);
        }

        // Load local violations
        try {
            const res = await fetch('/api/violations');
            const data = await res.json();
            setLocalViolationsCount(data.violations?.length || 0);
        } catch (e) {
            console.error('Error loading local violations:', e);
        }

        // Load cloud counts
        try {
            const entries = await downloadEntriesFromCloud(userId);
            setCloudCount(entries.length);
            const rules = await downloadRulesFromCloud(userId);
            setCloudRulesCount(rules.length);
            const violations = await downloadViolationsFromCloud(userId);
            setCloudViolationsCount(violations.length);
        } catch (e) {
            console.error('Error loading cloud data:', e);
        }
    };

    const handleSignIn = async () => {
        setLoading(true);
        await signInWithGoogle();
        setLoading(false);
    };

    const handleSignOut = async () => {
        await signOutUser();
        setCloudCount(0);
        setLastSync(null);
        localStorage.removeItem('lastSyncTime');
    };

    const handleSync = async () => {
        if (!user) return;

        setSyncing(true);
        setMessage('');

        try {
            // Sync Journal Entries
            const res = await fetch('/api/journal');
            const data = await res.json();
            const localEntries = data.entries || [];

            const uploadedEntries = await syncEntriesToCloud(
                user.uid,
                localEntries.map((e: any) => ({
                    id: e.id,
                    instrument: e.instrument,
                    tradeType: e.tradeType,
                    timeframe: e.timeframe,
                    entryPrice: e.entryPrice,
                    stopLoss: e.stopLoss,
                    target: e.target,
                    riskReward: e.riskReward,
                    outcome: e.outcome,
                    tradeReason: e.tradeReason,
                    strategyLogic: e.strategyLogic,
                    htfBiasAligned: e.htfBiasAligned,
                    liquidityTaken: e.liquidityTaken,
                    entryAtPOI: e.entryAtPOI,
                    riskManaged: e.riskManaged,
                    bosConfirmed: e.bosConfirmed,
                    mssConfirmed: e.mssConfirmed,
                    chochConfirmed: e.chochConfirmed,
                    orderBlockEntry: e.orderBlockEntry,
                    fvgEntry: e.fvgEntry,
                    killZoneEntry: e.killZoneEntry,
                    asianSession: e.asianSession,
                    londonSession: e.londonSession,
                    nySession: e.nySession,
                    londonClose: e.londonClose,
                    emotionState: e.emotionState,
                    whatWentWell: e.whatWentWell,
                    whatWentWrong: e.whatWentWrong,
                    improvement: e.improvement,
                    rawTranscript: e.rawTranscript,
                    // Note: Screenshots excluded from cloud sync (too large for Firestore 1MB limit)
                    createdAt: e.createdAt,
                    updatedAt: e.updatedAt,
                }))
            );

            // Sync Rules
            const rulesRes = await fetch('/api/rulebook');
            const rulesData = await rulesRes.json();
            const localRules = rulesData.rules || [];

            const uploadedRules = await syncRulesToCloud(
                user.uid,
                localRules.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    description: r.description,
                    category: r.category,
                    condition: r.condition,
                    severity: r.severity,
                    isActive: r.isActive,
                    createdAt: r.createdAt,
                    updatedAt: r.updatedAt,
                }))
            );

            // Sync Violations
            const violationsRes = await fetch('/api/violations');
            const violationsData = await violationsRes.json();
            const localViolations = violationsData.violations || [];

            const uploadedViolations = await syncViolationsToCloud(
                user.uid,
                localViolations.map((v: any) => ({
                    id: v.id,
                    ruleId: v.ruleId,
                    ruleName: v.ruleName,
                    journalEntryId: v.journalEntryId,
                    punishment: v.punishment,
                    punishmentType: v.punishmentType,
                    severity: v.severity,
                    status: v.status,
                    completedAt: v.completedAt,
                    dueDate: v.dueDate,
                    notes: v.notes,
                    createdAt: v.createdAt,
                }))
            );

            // NOTE: Screenshot sync requires CORS configuration on Firebase Storage bucket
            // To enable: Create cors.json and run: gsutil cors set cors.json gs://trading-journal-21e69.firebasestorage.app
            // For now, screenshots are stored locally only
            /*
            setMessage('📸 Uploading screenshots to cloud storage...');
            const entriesWithScreenshots = localEntries
                .filter((e: any) => e.screenshot)
                .map((e: any) => ({ id: e.id, screenshot: e.screenshot }));
            const uploadedScreenshots = await syncScreenshotsToCloud(user.uid, entriesWithScreenshots);
            */

            // Save last sync time
            const syncTime = new Date().toLocaleString();
            setLastSync(syncTime);
            localStorage.setItem('lastSyncTime', syncTime);

            await loadCounts(user.uid);
            setMessage(`✅ Synced! ${uploadedEntries} trades, ${uploadedRules} rules, ${uploadedViolations} violations.`);
        } catch (e) {
            console.error('Sync error:', e);
            setMessage('❌ Sync failed. Please try again.');
        }

        setSyncing(false);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1>👤 Profile & Sync</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Manage your account and sync trades across devices</p>
            </div>

            {/* Profile Card */}
            <div className="card" style={{
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%)',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Decorative gradient bar */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, var(--color-accent), var(--color-profit))'
                }} />

                <div style={{ padding: '2rem' }}>
                    {user ? (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || ''}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            border: '3px solid var(--color-accent)',
                                            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-profit))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        color: 'white'
                                    }}>
                                        {user.displayName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{user.displayName}</h2>
                                    <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.25rem 0.75rem',
                                            background: 'var(--color-profit-glow)',
                                            color: 'var(--color-profit)',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            ✓ Connected
                                        </span>
                                        {lastSync && (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.25rem 0.75rem',
                                                background: 'var(--color-accent-glow)',
                                                color: 'var(--color-accent)',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                            }}>
                                                🕐 Last sync: {lastSync}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="btn btn-outline"
                                    style={{ padding: '0.5rem 1rem' }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div style={{
                                width: 100,
                                height: 100,
                                margin: '0 auto 1.5rem',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem'
                            }}>
                                ☁️
                            </div>
                            <h2 style={{ marginBottom: '0.5rem' }}>Sign in to sync your trades</h2>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                                Connect your Google account to sync trades between web and mobile app
                            </p>
                            <button
                                onClick={handleSignIn}
                                className="btn"
                                style={{
                                    background: 'white',
                                    color: '#333',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                }}
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
                                Sign in with Google
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {user && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
                        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-accent)' }}>
                                {localCount} / {cloudCount}
                            </div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                📊 Trades (Local / Cloud)
                            </div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-profit)' }}>
                                {localRulesCount} / {cloudRulesCount}
                            </div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                📋 Rules (Local / Cloud)
                            </div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-loss)' }}>
                                {localViolationsCount} / {cloudViolationsCount}
                            </div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                ⚠️ Violations (Local / Cloud)
                            </div>
                        </div>
                    </div>

                    {/* Sync Section */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: '12px',
                                background: 'var(--color-accent-glow)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                🔄
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>Cloud Sync</h3>
                                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                    Sync your trades to access them on any device
                                </p>
                            </div>
                        </div>

                        {message && (
                            <div style={{
                                padding: '1rem',
                                marginBottom: '1rem',
                                background: message.includes('✅') ? 'var(--color-profit-glow)' : 'var(--color-loss-glow)',
                                color: message.includes('✅') ? 'var(--color-profit)' : 'var(--color-loss)',
                                borderRadius: '10px',
                                fontSize: '0.9rem'
                            }}>
                                {message}
                            </div>
                        )}

                        <div style={{
                            background: 'var(--color-bg-tertiary)',
                            padding: '1rem',
                            borderRadius: '10px',
                            marginBottom: '1rem'
                        }}>
                            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>📱 How sync works:</h4>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: '1.8' }}>
                                <li>Click "Sync Now" to upload all local trades to cloud</li>
                                <li>Your mobile app will download these trades when you sign in</li>
                                <li>Trades from mobile will appear here after syncing</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {syncing ? (
                                <>
                                    <span className="loading-spinner" style={{ width: 20, height: 20 }}></span>
                                    Syncing...
                                </>
                            ) : (
                                <>☁️ Sync All Trades</>
                            )}
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                        <div className="grid grid-2" style={{ gap: '1rem' }}>
                            <a href="/history" className="card" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'transform 0.2s'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>📚</span>
                                <div>
                                    <div style={{ fontWeight: '600' }}>View History</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Browse all your trades</div>
                                </div>
                            </a>
                            <a href="/analytics" className="card" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'transform 0.2s'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>📊</span>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Analytics</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>View performance stats</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
