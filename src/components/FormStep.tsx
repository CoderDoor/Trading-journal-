'use client';

import { useState, useEffect } from 'react';
import { JournalFormData } from '@/types/journal';
import { VoiceTextInput } from './VoiceTextInput';
import { ScreenshotUpload } from './ScreenshotUpload';

interface TradingRule {
    id: string;
    name: string;
    description: string | null;
    severity: string;
    category: string;
}

interface FormStepProps {
    formData: JournalFormData;
    onInputChange: (field: keyof JournalFormData, value: string | boolean) => void;
    onSubmit: (brokenRuleIds: string[]) => void;
    onBack?: () => void;
    onReset: () => void;
    isSubmitting: boolean;
    isVoiceSupported?: boolean;
}

// Polished SVG Icons with improved styling
const ChartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
);
const TargetIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);
const ShieldIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-profit)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const DropletIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
);
const TrendUpIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-profit)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
);
const RefreshIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" />
    </svg>
);
const BoxIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    </svg>
);
const ClockIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const SearchIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);
const LightbulbIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" />
    </svg>
);
const CheckIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-profit)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const BrainIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
    </svg>
);
const CameraIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
    </svg>
);
const SaveIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
);
const GapIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h14" /><path d="M5 16h14" /><path d="M7 12h10" strokeDasharray="2 2" />
    </svg>
);
const ArrowReturnIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
    </svg>
);

const preTradeChecklist = [
    { key: 'htfBiasAligned', label: 'HTF Bias Aligned', icon: <ChartIcon /> },
    { key: 'liquidityTaken', label: 'Liquidity Taken', icon: <DropletIcon /> },
    { key: 'entryAtPOI', label: 'Entry at POI', icon: <TargetIcon /> },
    { key: 'riskManaged', label: 'Risk Managed', icon: <ShieldIcon /> },
] as const;

const ictChecklist = [
    { key: 'bosConfirmed', label: 'BOS', icon: <TrendUpIcon /> },
    { key: 'mssConfirmed', label: 'MSS', icon: <RefreshIcon /> },
    { key: 'chochConfirmed', label: 'CHoCH', icon: <ArrowReturnIcon /> },
    { key: 'orderBlockEntry', label: 'Order Block', icon: <BoxIcon /> },
    { key: 'fvgEntry', label: 'FVG Entry', icon: <GapIcon /> },
    { key: 'killZoneEntry', label: 'Kill Zone', icon: <ClockIcon /> },
] as const;

const sessionChecklist = [
    { key: 'asianSession', label: 'Asian', icon: <span style={{ fontSize: '1rem' }}>AS</span> },
    { key: 'londonSession', label: 'London', icon: <span style={{ fontSize: '1rem' }}>LD</span> },
    { key: 'nySession', label: 'New York', icon: <span style={{ fontSize: '1rem' }}>NY</span> },
    { key: 'londonClose', label: 'London Close', icon: <span style={{ fontSize: '1rem' }}>LC</span> },
] as const;

const emotions = [
    { key: 'CALM', label: 'Calm', icon: 'Calm', color: '#10b981' },
    { key: 'FEAR', label: 'Fear', icon: 'Fear', color: '#f59e0b' },
    { key: 'FOMO', label: 'FOMO', icon: 'FOMO', color: '#f97316' },
    { key: 'REVENGE', label: 'Revenge', icon: 'Revenge', color: '#ef4444' },
] as const;

// Premium Card Component
const PremiumCard = ({ children, title, icon }: { children: React.ReactNode; title: string; icon: React.ReactNode }) => (
    <div style={{
        background: 'var(--gradient-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--color-border)',
        borderRadius: '20px',
        padding: '1.75rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-card)',
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--color-border)',
        }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{title}</h3>
        </div>
        {children}
    </div>
);

// Premium Input Component
const PremiumInput = ({ label, type = 'text', placeholder, value, onChange, readOnly = false }: {
    label: string; type?: string; placeholder?: string; value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; readOnly?: boolean;
}) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            marginBottom: '0.5rem',
        }}>{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: readOnly ? 'var(--color-bg-primary)' : 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
            }}
        />
    </div>
);

// Premium Select Component
const PremiumSelect = ({ label, value, onChange, options }: {
    label: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
}) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            marginBottom: '0.5rem',
        }}>{label}</label>
        <select
            value={value}
            onChange={onChange}
            style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                cursor: 'pointer',
            }}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

// Premium Checkbox Chip
const CheckboxChip = ({ label, icon, checked, onClick }: {
    label: string; icon: React.ReactNode; checked: boolean; onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: checked
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)'
                : 'var(--color-bg-tertiary)',
            border: checked ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: checked ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            fontWeight: checked ? 600 : 400,
            fontSize: '0.9rem',
        }}
    >
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
        {label}
        {checked && <span style={{ marginLeft: 'auto' }}>✓</span>}
    </button>
);

// Warning Icon for Rules Violated section
const WarningIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

interface TradingAccountOption {
    id: string;
    name: string;
    accountType: string;
}

export function FormStep({ formData, onInputChange, onSubmit, onBack, onReset, isSubmitting, isVoiceSupported = true }: FormStepProps) {
    const [rules, setRules] = useState<TradingRule[]>([]);
    const [brokenRules, setBrokenRules] = useState<Set<string>>(new Set());
    const [accounts, setAccounts] = useState<TradingAccountOption[]>([]);

    // Fetch rules and accounts on mount
    useEffect(() => {
        const fetchRules = async () => {
            try {
                const res = await fetch('/api/rulebook');
                const data = await res.json();
                setRules(data.rules || []);
            } catch (error) {
                console.error('Failed to fetch rules:', error);
            }
        };
        const fetchAccounts = async () => {
            try {
                const res = await fetch('/api/accounts');
                const data = await res.json();
                setAccounts(data.accounts || []);
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            }
        };
        fetchRules();
        fetchAccounts();
    }, []);

    const toggleRule = (ruleId: string) => {
        setBrokenRules(prev => {
            const next = new Set(prev);
            if (next.has(ruleId)) {
                next.delete(ruleId);
            } else {
                next.add(ruleId);
            }
            return next;
        });
    };

    const handleSubmit = () => {
        onSubmit(Array.from(brokenRules));
    };

    return (
        <div className="premium-form-step">
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '1rem 0',
                borderBottom: '1px solid var(--color-border)',
            }}>
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        background: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                    }}
                >
                    ← Back
                </button>
                <h2 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Journal Entry
                </h2>
                <button
                    onClick={onReset}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        background: 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <RefreshIcon /> Reset
                </button>
            </div>

            {/* Trade Details */}
            <PremiumCard title="Trade Details" icon={<ChartIcon />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <PremiumInput
                        label="Instrument"
                        placeholder="EURUSD, BTC, NIFTY..."
                        value={formData.instrument}
                        onChange={(e) => onInputChange('instrument', e.target.value)}
                    />
                    <PremiumSelect
                        label="Trade Type"
                        value={formData.tradeType}
                        onChange={(e) => onInputChange('tradeType', e.target.value)}
                        options={[
                            { value: '', label: 'Select...' },
                            { value: 'BUY', label: 'Buy / Long' },
                            { value: 'SELL', label: 'Sell / Short' },
                        ]}
                    />
                    <PremiumSelect
                        label="Timeframe"
                        value={formData.timeframe}
                        onChange={(e) => onInputChange('timeframe', e.target.value)}
                        options={[
                            { value: '', label: 'Select...' },
                            { value: '1M', label: '1 Min' },
                            { value: '5M', label: '5 Min' },
                            { value: '15M', label: '15 Min' },
                            { value: '1H', label: '1 Hour' },
                            { value: '4H', label: '4 Hours' },
                            { value: 'D', label: 'Daily' },
                        ]}
                    />
                    <PremiumSelect
                        label="Trading Account"
                        value={formData.accountId}
                        onChange={(e) => onInputChange('accountId', e.target.value)}
                        options={[
                            { value: '', label: 'No Account' },
                            ...accounts.map(a => ({ value: a.id, label: `${a.accountType === 'PROP_FIRM' ? '🏢' : a.accountType === 'PERSONAL' ? '👤' : a.accountType === 'DEMO' ? '📝' : '🎯'} ${a.name}` }))
                        ]}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
                    <PremiumInput label="Entry Price" type="number" placeholder="1.0850" value={formData.entryPrice}
                        onChange={(e) => onInputChange('entryPrice', e.target.value)} />
                    <PremiumInput label="Stop Loss" type="number" placeholder="1.0820" value={formData.stopLoss}
                        onChange={(e) => onInputChange('stopLoss', e.target.value)} />
                    <PremiumInput label="Target" type="number" placeholder="1.0920" value={formData.target}
                        onChange={(e) => onInputChange('target', e.target.value)} />
                    <PremiumInput label="R:R Ratio" readOnly value={formData.riskReward ? `1:${formData.riskReward}` : '-'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
                    <PremiumSelect
                        label="Outcome"
                        value={formData.outcome}
                        onChange={(e) => onInputChange('outcome', e.target.value)}
                        options={[
                            { value: '', label: 'Select...' },
                            { value: 'WIN', label: 'Win' },
                            { value: 'LOSS', label: 'Loss' },
                            { value: 'BE', label: 'Breakeven' },
                            { value: 'RUNNING', label: 'Running' },
                        ]}
                    />
                    <PremiumInput label="Strategy Logic" placeholder="Order Block, FVG, BOS..."
                        value={formData.strategyLogic} onChange={(e) => onInputChange('strategyLogic', e.target.value)} />
                </div>
            </PremiumCard>

            {/* Trade Reason */}
            <PremiumCard title="Why I Took This Trade" icon={<LightbulbIcon />}>
                <textarea
                    placeholder="Describe your reasoning..."
                    value={formData.tradeReason}
                    onChange={(e) => onInputChange('tradeReason', e.target.value)}
                    style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '1rem',
                        background: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        color: 'var(--color-text)',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        resize: 'vertical',
                    }}
                />
            </PremiumCard>

            {/* Pre-Trade Checklist */}
            <PremiumCard title="Pre-Trade Checklist" icon={<CheckIcon />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {preTradeChecklist.map(({ key, label, icon }) => (
                        <CheckboxChip key={key} label={label} icon={icon}
                            checked={formData[key] as boolean} onClick={() => onInputChange(key, !formData[key])} />
                    ))}
                </div>
            </PremiumCard>

            {/* ICT Checklist */}
            <PremiumCard title="ICT Strategy Checklist" icon={<TrendUpIcon />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {ictChecklist.map(({ key, label, icon }) => (
                        <CheckboxChip key={key} label={label} icon={icon}
                            checked={formData[key] as boolean} onClick={() => onInputChange(key, !formData[key])} />
                    ))}
                </div>
            </PremiumCard>

            {/* Trading Session */}
            <PremiumCard title="Trading Session" icon={<ClockIcon />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {sessionChecklist.map(({ key, label, icon }) => (
                        <CheckboxChip key={key} label={label} icon={icon}
                            checked={formData[key] as boolean} onClick={() => onInputChange(key, !formData[key])} />
                    ))}
                </div>
            </PremiumCard>

            {/* Emotional State */}
            <PremiumCard title="Emotional State" icon={<BrainIcon />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {emotions.map(({ key, label, color }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onInputChange('emotionState', formData.emotionState === key ? '' : key)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem',
                                background: formData.emotionState === key
                                    ? `${color}20` : 'var(--color-bg-tertiary)',
                                border: formData.emotionState === key
                                    ? `2px solid ${color}` : '1px solid var(--color-border)',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <span style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: formData.emotionState === key ? color : 'var(--color-text-secondary)',
                            }}>{label}</span>
                        </button>
                    ))}
                </div>
            </PremiumCard>

            {/* Post-Trade Reflection */}
            <PremiumCard title="Post-Trade Reflection" icon={<SearchIcon />}>
                <VoiceTextInput label="What I Did Well" placeholder="Positive aspects..."
                    value={formData.whatWentWell} onChange={(val) => onInputChange('whatWentWell', val)} isVoiceSupported={isVoiceSupported} />
                <VoiceTextInput label="What I Did Wrong" placeholder="Areas for improvement..."
                    value={formData.whatWentWrong} onChange={(val) => onInputChange('whatWentWrong', val)} isVoiceSupported={isVoiceSupported} />
                <VoiceTextInput label="What I Will Improve" placeholder="Action items..."
                    value={formData.improvement} onChange={(val) => onInputChange('improvement', val)} isVoiceSupported={isVoiceSupported} />
            </PremiumCard>

            {/* Rules Violated Section - Only show if user has rules */}
            {rules.length > 0 && (
                <PremiumCard title="Rules Violated (Check if broken)" icon={<WarningIcon />}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        marginBottom: '1rem',
                        marginTop: '-0.5rem'
                    }}>
                        ⚠️ Check the rules you violated during this trade. Punishments will be assigned.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {rules.map(rule => {
                            const isChecked = brokenRules.has(rule.id);
                            const severityColor =
                                rule.severity === 'CRITICAL' ? '#dc2626' :
                                    rule.severity === 'HIGH' ? '#ef4444' :
                                        rule.severity === 'MEDIUM' ? '#f59e0b' : '#10b981';
                            return (
                                <button
                                    key={rule.id}
                                    type="button"
                                    onClick={() => toggleRule(rule.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.875rem 1rem',
                                        background: isChecked
                                            ? 'rgba(239, 68, 68, 0.15)'
                                            : 'var(--color-bg-tertiary)',
                                        border: isChecked
                                            ? '2px solid #ef4444'
                                            : '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'left',
                                    }}
                                >
                                    <span style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '4px',
                                        border: isChecked ? '2px solid #ef4444' : '2px solid var(--color-border)',
                                        background: isChecked ? '#ef4444' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}>
                                        {isChecked && '✓'}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            color: isChecked ? '#ef4444' : 'var(--color-text)',
                                        }}>
                                            {rule.name}
                                        </div>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '0.15rem 0.5rem',
                                            background: `${severityColor}20`,
                                            color: severityColor,
                                            borderRadius: '4px',
                                            fontWeight: 600,
                                        }}>
                                            {rule.severity}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {brokenRules.size > 0 && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            color: '#ef4444',
                        }}>
                            ⚠️ You will receive {brokenRules.size} punishment{brokenRules.size > 1 ? 's' : ''} for these violations.
                        </div>
                    )}
                </PremiumCard>
            )}

            {/* Screenshot Upload - Drag & Drop with Multiple Files */}
            <PremiumCard title="Trade Screenshots" icon={<CameraIcon />}>
                <ScreenshotUpload
                    screenshots={formData.screenshot ? formData.screenshot.split('|||') : []}
                    onChange={(screenshots) => onInputChange('screenshot', screenshots.join('|||'))}
                    maxFiles={5}
                />
            </PremiumCard>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1.25rem 3rem',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '100px',
                        cursor: isSubmitting ? 'wait' : 'pointer',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        color: 'white',
                        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                        transition: 'all 0.3s ease',
                        opacity: isSubmitting ? 0.7 : 1,
                    }}
                >
                    <SaveIcon />
                    {isSubmitting ? 'Saving...' : 'Save Journal Entry'}
                </button>
            </div>
        </div>
    );
}
