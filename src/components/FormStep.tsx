'use client';

import { JournalFormData } from '@/types/journal';
import { VoiceTextInput } from './VoiceTextInput';
import { ScreenshotUpload } from './ScreenshotUpload';

interface FormStepProps {
    formData: JournalFormData;
    onInputChange: (field: keyof JournalFormData, value: string | boolean) => void;
    onSubmit: () => void;
    onBack?: () => void;
    onReset: () => void;
    isSubmitting: boolean;
    isVoiceSupported?: boolean;
}

const preTradeChecklist = [
    { key: 'htfBiasAligned', label: 'HTF Bias Aligned', icon: '📊' },
    { key: 'liquidityTaken', label: 'Liquidity Taken', icon: '💧' },
    { key: 'entryAtPOI', label: 'Entry at POI', icon: '🎯' },
    { key: 'riskManaged', label: 'Risk Managed', icon: '🛡️' },
] as const;

const ictChecklist = [
    { key: 'bosConfirmed', label: 'BOS', icon: '📈' },
    { key: 'mssConfirmed', label: 'MSS', icon: '🔄' },
    { key: 'chochConfirmed', label: 'CHoCH', icon: '↩️' },
    { key: 'orderBlockEntry', label: 'Order Block', icon: '📦' },
    { key: 'fvgEntry', label: 'FVG Entry', icon: '🕳️' },
    { key: 'killZoneEntry', label: 'Kill Zone', icon: '⏰' },
] as const;

const sessionChecklist = [
    { key: 'asianSession', label: 'Asian', icon: '🌏' },
    { key: 'londonSession', label: 'London', icon: '🇬🇧' },
    { key: 'nySession', label: 'New York', icon: '🇺🇸' },
    { key: 'londonClose', label: 'London Close', icon: '🌅' },
] as const;

const emotions = [
    { key: 'CALM', label: 'Calm', icon: '😌', color: '#10b981' },
    { key: 'FEAR', label: 'Fear', icon: '😰', color: '#f59e0b' },
    { key: 'FOMO', label: 'FOMO', icon: '😬', color: '#f97316' },
    { key: 'REVENGE', label: 'Revenge', icon: '😤', color: '#ef4444' },
] as const;

// Premium Card Component
const PremiumCard = ({ children, title, icon }: { children: React.ReactNode; title: string; icon: string }) => (
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
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
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
    label: string; icon: string; checked: boolean; onClick: () => void;
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
        <span>{icon}</span>
        {label}
        {checked && <span style={{ marginLeft: 'auto' }}>✓</span>}
    </button>
);

export function FormStep({ formData, onInputChange, onSubmit, onBack, onReset, isSubmitting, isVoiceSupported = true }: FormStepProps) {
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
                    🔄 Reset
                </button>
            </div>

            {/* Trade Details */}
            <PremiumCard title="Trade Details" icon="📊">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
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
                            { value: 'BUY', label: '📈 Buy / Long' },
                            { value: 'SELL', label: '📉 Sell / Short' },
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
                            { value: 'WIN', label: '✅ Win' },
                            { value: 'LOSS', label: '❌ Loss' },
                            { value: 'BE', label: '➖ Breakeven' },
                            { value: 'RUNNING', label: '🔵 Running' },
                        ]}
                    />
                    <PremiumInput label="Strategy Logic" placeholder="Order Block, FVG, BOS..."
                        value={formData.strategyLogic} onChange={(e) => onInputChange('strategyLogic', e.target.value)} />
                </div>
            </PremiumCard>

            {/* Trade Reason */}
            <PremiumCard title="Why I Took This Trade" icon="💡">
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
            <PremiumCard title="Pre-Trade Checklist" icon="✅">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {preTradeChecklist.map(({ key, label, icon }) => (
                        <CheckboxChip key={key} label={label} icon={icon}
                            checked={formData[key] as boolean} onClick={() => onInputChange(key, !formData[key])} />
                    ))}
                </div>
            </PremiumCard>

            {/* ICT Checklist */}
            <PremiumCard title="ICT Strategy Checklist" icon="📈">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {ictChecklist.map(({ key, label, icon }) => (
                        <CheckboxChip key={key} label={label} icon={icon}
                            checked={formData[key] as boolean} onClick={() => onInputChange(key, !formData[key])} />
                    ))}
                </div>
            </PremiumCard>

            {/* Trading Session */}
            <PremiumCard title="Trading Session" icon="🕐">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {sessionChecklist.map(({ key, label, icon }) => (
                        <CheckboxChip key={key} label={label} icon={icon}
                            checked={formData[key] as boolean} onClick={() => onInputChange(key, !formData[key])} />
                    ))}
                </div>
            </PremiumCard>

            {/* Emotional State */}
            <PremiumCard title="Emotional State" icon="🧠">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {emotions.map(({ key, label, icon, color }) => (
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
                            <span style={{ fontSize: '2rem' }}>{icon}</span>
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: formData.emotionState === key ? color : 'var(--color-text-secondary)',
                            }}>{label}</span>
                        </button>
                    ))}
                </div>
            </PremiumCard>

            {/* Post-Trade Reflection */}
            <PremiumCard title="Post-Trade Reflection" icon="🔍">
                <VoiceTextInput label="What I Did Well" placeholder="Positive aspects..."
                    value={formData.whatWentWell} onChange={(val) => onInputChange('whatWentWell', val)} isVoiceSupported={isVoiceSupported} />
                <VoiceTextInput label="What I Did Wrong" placeholder="Areas for improvement..."
                    value={formData.whatWentWrong} onChange={(val) => onInputChange('whatWentWrong', val)} isVoiceSupported={isVoiceSupported} />
                <VoiceTextInput label="What I Will Improve" placeholder="Action items..."
                    value={formData.improvement} onChange={(val) => onInputChange('improvement', val)} isVoiceSupported={isVoiceSupported} />
            </PremiumCard>

            {/* Screenshot Upload - Drag & Drop with Multiple Files */}
            <PremiumCard title="Trade Screenshots" icon="📷">
                <ScreenshotUpload
                    screenshots={formData.screenshot ? formData.screenshot.split('|||') : []}
                    onChange={(screenshots) => onInputChange('screenshot', screenshots.join('|||'))}
                    maxFiles={5}
                />
            </PremiumCard>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button
                    onClick={onSubmit}
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
                    {isSubmitting ? '💾 Saving...' : '💾 Save Journal Entry'}
                </button>
            </div>
        </div>
    );
}
