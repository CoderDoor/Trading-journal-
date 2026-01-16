'use client';

import { useState, useEffect } from 'react';

interface TradingAccount {
    id: string;
    name: string;
    broker?: string;
    accountType: string;
    accountSize?: number;
    currency: string;
    status: string;
    notes?: string;
    createdAt: string;
}

const accountTypes = [
    { value: 'PERSONAL', label: '👤 Personal', color: '#3b82f6' },
    { value: 'PROP_FIRM', label: '🏢 Prop Firm', color: '#8b5cf6' },
    { value: 'DEMO', label: '📝 Demo', color: '#6b7280' },
    { value: 'CHALLENGE', label: '🎯 Challenge', color: '#f59e0b' },
];

const accountStatuses = [
    { value: 'ACTIVE', label: 'Active', color: '#22c55e' },
    { value: 'PASSED', label: 'Passed', color: '#3b82f6' },
    { value: 'FAILED', label: 'Failed', color: '#ef4444' },
    { value: 'INACTIVE', label: 'Inactive', color: '#6b7280' },
];

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<TradingAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        broker: '',
        accountType: 'PERSONAL',
        accountSize: '',
        currency: 'USD',
        status: 'ACTIVE',
        notes: '',
    });

    // Fetch accounts
    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/accounts');
            const data = await res.json();
            setAccounts(data.accounts || []);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingAccount ? 'PUT' : 'POST';
            const body = editingAccount ? { ...formData, id: editingAccount.id } : formData;

            const res = await fetch('/api/accounts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                fetchAccounts();
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save account:', error);
        }
    };

    const handleEdit = (account: TradingAccount) => {
        setEditingAccount(account);
        setFormData({
            name: account.name,
            broker: account.broker || '',
            accountType: account.accountType,
            accountSize: account.accountSize?.toString() || '',
            currency: account.currency,
            status: account.status,
            notes: account.notes || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this account? Trades linked to it will be unlinked.')) return;
        try {
            await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
            fetchAccounts();
        } catch (error) {
            console.error('Failed to delete account:', error);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingAccount(null);
        setFormData({
            name: '',
            broker: '',
            accountType: 'PERSONAL',
            accountSize: '',
            currency: 'USD',
            status: 'ACTIVE',
            notes: '',
        });
    };

    const getTypeInfo = (type: string) => accountTypes.find(t => t.value === type) || accountTypes[0];
    const getStatusInfo = (status: string) => accountStatuses.find(s => s.value === status) || accountStatuses[0];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        🏦 Trading Accounts
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Manage your personal, prop firm, and demo accounts
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    + Add Account
                </button>
            </div>

            {/* Account Form Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem',
                }} onClick={resetForm}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        width: '100%',
                        maxWidth: '500px',
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                            {editingAccount ? '✏️ Edit Account' : '➕ New Account'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                        Account Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., FTMO $100K, Personal IC Markets"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            background: 'var(--color-bg-tertiary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '10px',
                                            color: 'var(--color-text)',
                                            fontSize: '1rem',
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                            Account Type *
                                        </label>
                                        <select
                                            value={formData.accountType}
                                            onChange={e => setFormData({ ...formData, accountType: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'var(--color-bg-tertiary)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '10px',
                                                color: 'var(--color-text)',
                                                fontSize: '1rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {accountTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'var(--color-bg-tertiary)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '10px',
                                                color: 'var(--color-text)',
                                                fontSize: '1rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {accountStatuses.map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                            Broker
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.broker}
                                            onChange={e => setFormData({ ...formData, broker: e.target.value })}
                                            placeholder="e.g., FTMO, IC Markets"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'var(--color-bg-tertiary)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '10px',
                                                color: 'var(--color-text)',
                                                fontSize: '1rem',
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                            Account Size
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.accountSize}
                                            onChange={e => setFormData({ ...formData, accountSize: e.target.value })}
                                            placeholder="e.g., 100000"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'var(--color-bg-tertiary)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '10px',
                                                color: 'var(--color-text)',
                                                fontSize: '1rem',
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Any notes about this account..."
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            background: 'var(--color-bg-tertiary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '10px',
                                            color: 'var(--color-text)',
                                            fontSize: '1rem',
                                            resize: 'vertical',
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            background: 'var(--color-bg-tertiary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '10px',
                                            color: 'var(--color-text)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            color: 'white',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {editingAccount ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Accounts List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    Loading accounts...
                </div>
            ) : accounts.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏦</div>
                    <h3 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>No accounts yet</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                        Add your trading accounts to track performance separately
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            padding: '0.75rem 2rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        + Add First Account
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {accounts.map(account => {
                        const typeInfo = getTypeInfo(account.accountType);
                        const statusInfo = getStatusInfo(account.status);
                        return (
                            <div
                                key={account.id}
                                style={{
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: `${typeInfo.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                    }}>
                                        {account.accountType === 'PERSONAL' ? '👤' :
                                            account.accountType === 'PROP_FIRM' ? '🏢' :
                                                account.accountType === 'DEMO' ? '📝' : '🎯'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                                            {account.name}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span style={{
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: `${typeInfo.color}20`,
                                                color: typeInfo.color,
                                            }}>
                                                {typeInfo.label}
                                            </span>
                                            <span style={{
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: `${statusInfo.color}20`,
                                                color: statusInfo.color,
                                            }}>
                                                {statusInfo.label}
                                            </span>
                                            {account.broker && (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                    • {account.broker}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    {account.accountSize && (
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Account Size</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                                                ${account.accountSize.toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEdit(account)}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                background: 'var(--color-bg-tertiary)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '8px',
                                                color: 'var(--color-text)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                            }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(account.id)}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '8px',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
