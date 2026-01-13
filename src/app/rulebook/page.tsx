'use client';

import { useState, useEffect } from 'react';

// Types
interface TradingRule {
    id: string;
    name: string;
    description: string | null;
    category: string;
    condition: string;
    severity: string;
    isActive: boolean;
    createdAt: string;
}

interface RuleViolation {
    id: string;
    ruleId: string;
    ruleName: string;
    punishment: string;
    punishmentType: string;
    severity: string;
    status: string;
    dueDate: string | null;
    createdAt: string;
}

// Icons
const BookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
);

const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const AlertIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const CATEGORIES = ['ENTRY', 'EXIT', 'RISK', 'PSYCHOLOGY', 'GENERAL'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// Trade fields that can be checked for auto-detection
const CONDITION_FIELDS = [
    { value: '', label: '-- Manual check only --' },
    { value: 'riskReward', label: 'Risk/Reward Ratio' },
    { value: 'htfBiasAligned', label: 'HTF Bias Aligned' },
    { value: 'killZoneEntry', label: 'Kill Zone Entry' },
    { value: 'riskManaged', label: 'Risk Managed' },
    { value: 'entryAtPOI', label: 'Entry at POI' },
    { value: 'liquidityTaken', label: 'Liquidity Taken' },
    { value: 'bosConfirmed', label: 'BOS Confirmed' },
    { value: 'emotionState', label: 'Emotional State' },
    { value: 'orderBlockEntry', label: 'Order Block Entry' },
    { value: 'fvgEntry', label: 'FVG Entry' },
];

const OPERATORS = [
    { value: 'lt', label: 'Less than (<)' },
    { value: 'lte', label: 'Less than or equal (<=)' },
    { value: 'gt', label: 'Greater than (>)' },
    { value: 'gte', label: 'Greater than or equal (>=)' },
    { value: 'eq', label: 'Equals (=)' },
    { value: 'neq', label: 'Not equals (!=)' },
    { value: 'is_false', label: 'Is FALSE (unchecked)' },
    { value: 'is_true', label: 'Is TRUE (checked)' },
];

export default function RulebookPage() {
    const [rules, setRules] = useState<TradingRule[]>([]);
    const [violations, setViolations] = useState<RuleViolation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newRule, setNewRule] = useState({
        name: '',
        description: '',
        category: 'GENERAL',
        severity: 'MEDIUM',
        conditionField: '',
        conditionOperator: 'is_false',
        conditionValue: '',
    });

    useEffect(() => {
        fetchRules();
        fetchViolations();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await fetch('/api/rulebook');
            const data = await res.json();
            setRules(data.rules || []);
        } catch (error) {
            console.error('Failed to fetch rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchViolations = async () => {
        try {
            const res = await fetch('/api/violations?status=PENDING');
            const data = await res.json();
            setViolations(data.violations || []);
        } catch (error) {
            console.error('Failed to fetch violations:', error);
        }
    };

    const handleAddRule = async () => {
        try {
            // Build condition object for auto-detection
            const condition = newRule.conditionField ? {
                field: newRule.conditionField,
                operator: newRule.conditionOperator,
                value: newRule.conditionOperator.startsWith('is_') ? null :
                    isNaN(Number(newRule.conditionValue)) ? newRule.conditionValue : Number(newRule.conditionValue),
            } : {};

            const res = await fetch('/api/rulebook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newRule.name,
                    description: newRule.description,
                    category: newRule.category,
                    severity: newRule.severity,
                    condition,
                }),
            });

            if (res.ok) {
                fetchRules();
                setShowAddModal(false);
                setNewRule({
                    name: '',
                    description: '',
                    category: 'GENERAL',
                    severity: 'MEDIUM',
                    conditionField: '',
                    conditionOperator: 'is_false',
                    conditionValue: '',
                });
            }
        } catch (error) {
            console.error('Failed to add rule:', error);
        }
    };

    const handleDeleteRule = async (id: string) => {
        try {
            await fetch(`/api/rulebook/${id}`, { method: 'DELETE' });
            setRules(rules.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to delete rule:', error);
        }
    };

    const handleCompleteViolation = async (id: string) => {
        try {
            await fetch('/api/violations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'COMPLETED' }),
            });
            setViolations(violations.filter(v => v.id !== id));
        } catch (error) {
            console.error('Failed to complete violation:', error);
        }
    };

    const pendingViolations = violations.filter(v => v.status === 'PENDING');

    const getSeverityStyle = (severity: string) => {
        switch (severity) {
            case 'LOW': return { bg: 'var(--color-profit)', bgFaded: 'rgba(72, 229, 183, 0.15)' };
            case 'MEDIUM': return { bg: 'var(--color-neutral)', bgFaded: 'rgba(255, 201, 60, 0.15)' };
            case 'HIGH': return { bg: 'var(--color-loss)', bgFaded: 'rgba(255, 107, 138, 0.15)' };
            case 'CRITICAL': return { bg: '#dc2626', bgFaded: 'rgba(220, 38, 38, 0.15)' };
            default: return { bg: 'var(--color-text-muted)', bgFaded: 'rgba(160, 160, 176, 0.15)' };
        }
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                    }}>
                        <BookIcon />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                            Trading Rulebook
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
                            Define your rules • Stay disciplined • Grow as a trader
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <PlusIcon /> Add Rule
                </button>
            </div>

            {/* Pending Violations Banner */}
            {pendingViolations.length > 0 && (
                <div className="card" style={{
                    background: 'var(--color-loss-glow)',
                    borderColor: 'var(--color-loss)',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--color-loss)' }}><AlertIcon /></span>
                        <span style={{ fontWeight: 600, color: 'var(--color-loss)' }}>
                            ⚠️ {pendingViolations.length} Pending Punishment{pendingViolations.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {pendingViolations.map(v => (
                            <div key={v.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem 1rem',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                        {v.punishment}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        Violated: {v.ruleName}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCompleteViolation(v.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.5rem 1rem',
                                        background: 'var(--color-profit)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    <CheckIcon /> Done
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rules Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1rem'
            }}>
                {loading ? (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                        <div className="skeleton" style={{ height: '100px', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--color-text-muted)' }}>Loading rules...</p>
                    </div>
                ) : rules.length === 0 ? (
                    <div className="card" style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '3rem',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            color: 'var(--color-text-muted)',
                            opacity: 0.5
                        }}>
                            <BookIcon />
                        </div>
                        <h3 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>No Rules Yet</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Click "Add Rule" to create your first trading rule
                        </p>
                    </div>
                ) : (
                    rules.map(rule => {
                        const severityStyle = getSeverityStyle(rule.severity);
                        return (
                            <div
                                key={rule.id}
                                className="card"
                                style={{
                                    opacity: rule.isActive ? 1 : 0.6,
                                    transition: 'all var(--transition-normal)',
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.75rem'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            margin: 0,
                                            color: 'var(--color-text)',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {rule.name}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.2rem 0.6rem',
                                                background: severityStyle.bgFaded,
                                                color: severityStyle.bg,
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                            }}>
                                                {rule.severity}
                                            </span>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.2rem 0.6rem',
                                                background: 'var(--color-bg-tertiary)',
                                                color: 'var(--color-text-muted)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.7rem',
                                            }}>
                                                {rule.category}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteRule(rule.id)}
                                        style={{
                                            padding: '0.5rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--color-text-muted)',
                                            cursor: 'pointer',
                                            borderRadius: 'var(--radius-sm)',
                                            transition: 'all var(--transition-fast)',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-loss)'}
                                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                                {rule.description && (
                                    <p style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--color-text-secondary)',
                                        margin: 0,
                                        lineHeight: 1.5
                                    }}>
                                        {rule.description}
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Rule Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div
                        className="modal-content"
                        style={{
                            background: 'var(--color-bg-secondary)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '2rem',
                            width: '500px',
                            maxWidth: '90vw',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            border: '1px solid var(--color-border)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                            ✏️ Add New Rule
                        </h2>

                        <div className="input-group">
                            <label className="input-label">Rule Name *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={newRule.name}
                                onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                placeholder="e.g., Never trade with RR < 2"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Description (Why is this rule important?)</label>
                            <textarea
                                className="input-field"
                                value={newRule.description}
                                onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                                placeholder="Explain why following this rule is critical for your trading..."
                                rows={3}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label">Category</label>
                                <select
                                    className="input-field select-field"
                                    value={newRule.category}
                                    onChange={e => setNewRule({ ...newRule, category: e.target.value })}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Severity</label>
                                <select
                                    className="input-field select-field"
                                    value={newRule.severity}
                                    onChange={e => setNewRule({ ...newRule, severity: e.target.value })}
                                >
                                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Auto-Detection Section */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                        }}>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                marginBottom: '0.75rem',
                                color: 'var(--color-text)'
                            }}>
                                🤖 Auto-Detection (Optional)
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                                Set a condition to automatically detect when this rule is violated
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label" style={{ fontSize: '0.75rem' }}>Check Field</label>
                                    <select
                                        className="input-field select-field"
                                        value={newRule.conditionField}
                                        onChange={e => setNewRule({ ...newRule, conditionField: e.target.value })}
                                    >
                                        {CONDITION_FIELDS.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label" style={{ fontSize: '0.75rem' }}>Condition</label>
                                    <select
                                        className="input-field select-field"
                                        value={newRule.conditionOperator}
                                        onChange={e => setNewRule({ ...newRule, conditionOperator: e.target.value })}
                                        disabled={!newRule.conditionField}
                                    >
                                        {OPERATORS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {newRule.conditionField && !newRule.conditionOperator.startsWith('is_') && (
                                <div className="input-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                                    <label className="input-label" style={{ fontSize: '0.75rem' }}>Value</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={newRule.conditionValue}
                                        onChange={e => setNewRule({ ...newRule, conditionValue: e.target.value })}
                                        placeholder={newRule.conditionField === 'riskReward' ? 'e.g., 2' : 'Enter value...'}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-secondary)'
                        }}>
                            <strong>💡 Punishment Preview:</strong>
                            <br />
                            {newRule.severity === 'LOW' && '• Write 3 reasons why this rule exists'}
                            {newRule.severity === 'MEDIUM' && '• No trading for 24 hours + Review 5 past trades'}
                            {newRule.severity === 'HIGH' && '• Paper trade only 3 days + Write journal entry'}
                            {newRule.severity === 'CRITICAL' && '• No trading for 1 week + Full strategy review'}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddRule}
                                disabled={!newRule.name}
                                className="btn btn-primary"
                                style={{
                                    flex: 1,
                                    opacity: newRule.name ? 1 : 0.5,
                                    cursor: newRule.name ? 'pointer' : 'not-allowed',
                                }}
                            >
                                Add Rule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
