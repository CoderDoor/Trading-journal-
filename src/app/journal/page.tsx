'use client';

import { useState, useEffect, useCallback } from 'react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useWhisperRecording } from '@/hooks/useWhisperRecording';
import { parseTradeText } from '@/lib/textParser';
import { JournalFormData, ParsedTradeData } from '@/types/journal';
import { InputStep, FormStep } from '@/components';

const initialFormData: JournalFormData = {
    instrument: '', tradeType: '', timeframe: '', entryPrice: '', stopLoss: '', target: '',
    riskReward: '', outcome: '', tradeReason: '', strategyLogic: '', accountId: '',
    htfBiasAligned: false, liquidityTaken: false, entryAtPOI: false, riskManaged: false,
    bosConfirmed: false, mssConfirmed: false, chochConfirmed: false,
    orderBlockEntry: false, fvgEntry: false, killZoneEntry: false,
    asianSession: false, londonSession: false, nySession: false, londonClose: false,
    emotionState: '', whatWentWell: '', whatWentWrong: '', improvement: '',
    screenshot: '', rawTranscript: '',
};

export default function HomePage() {
    const [mode, setMode] = useState<'voice' | 'text'>('voice');
    const [step, setStep] = useState<'input' | 'form'>('input');
    const [textInput, setTextInput] = useState('');
    const [formData, setFormData] = useState<JournalFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [useOfflineMode, setUseOfflineMode] = useState(false);

    // Web Speech API (online, real-time)
    const webSpeech = useVoiceRecording({ continuous: true, language: 'en-US' });

    // Whisper offline (works offline, processes after recording)
    const whisper = useWhisperRecording({
        onError: (err) => console.log('Whisper error:', err),
    });

    // Check template from sessionStorage
    useEffect(() => {
        const templateData = sessionStorage.getItem('templateData');
        if (templateData) {
            const template = JSON.parse(templateData);
            setFormData(prev => ({
                ...prev,
                instrument: template.instrument || '',
                tradeType: template.tradeType || '',
                timeframe: template.timeframe || '',
                strategyLogic: template.strategyLogic || '',
                htfBiasAligned: template.htfBiasAligned || false,
                liquidityTaken: template.liquidityTaken || false,
                entryAtPOI: template.entryAtPOI || false,
                riskManaged: template.riskManaged || false,
                bosConfirmed: template.bosConfirmed || false,
                mssConfirmed: template.mssConfirmed || false,
                chochConfirmed: template.chochConfirmed || false,
                orderBlockEntry: template.orderBlockEntry || false,
                fvgEntry: template.fvgEntry || false,
                killZoneEntry: template.killZoneEntry || false,
            }));
            sessionStorage.removeItem('templateData');
        }
    }, []);

    // Use either online or offline transcript
    const transcript = useOfflineMode ? whisper.transcript : webSpeech.transcript;
    const setTranscript = useOfflineMode ? whisper.setTranscript : webSpeech.setTranscript;
    const isRecording = useOfflineMode ? whisper.isRecording : webSpeech.isRecording;
    const error = useOfflineMode ? whisper.error : webSpeech.error;

    // Derived states for offline mode
    const isProcessing = useOfflineMode && whisper.isProcessing;
    const isModelLoading = useOfflineMode && whisper.isModelLoading;
    const loadProgress = whisper.loadProgress;

    // Auto-switch to offline if online fails or not supported
    useEffect(() => {
        if (webSpeech.error && webSpeech.error.includes('network')) {
            setUseOfflineMode(true);
        }
        if (!webSpeech.isSupported) {
            setUseOfflineMode(true);
        }
    }, [webSpeech.error, webSpeech.isSupported]);

    // Apply parsed data to form
    const applyParsedData = useCallback((parsed: ParsedTradeData, rawText: string) => {
        setFormData(prev => ({
            ...prev,
            instrument: parsed.instrument || prev.instrument,
            tradeType: parsed.tradeType || prev.tradeType,
            timeframe: parsed.timeframe || prev.timeframe,
            entryPrice: parsed.entryPrice?.toString() || prev.entryPrice,
            stopLoss: parsed.stopLoss?.toString() || prev.stopLoss,
            target: parsed.target?.toString() || prev.target,
            riskReward: parsed.riskReward?.toString() || prev.riskReward,
            strategyLogic: parsed.strategyLogic || prev.strategyLogic,
            tradeReason: parsed.tradeReason || prev.tradeReason,
            rawTranscript: rawText,
        }));
    }, []);

    // Parse transcript when it changes
    useEffect(() => {
        if (transcript) {
            const timer = setTimeout(() => {
                const parsed = parseTradeText(transcript);
                applyParsedData(parsed, transcript);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [transcript, applyParsedData]);

    const handleVoiceToggle = useCallback(async () => {
        if (useOfflineMode) {
            if (whisper.isRecording) {
                await whisper.stopRecording();
            } else {
                await whisper.startRecording();
            }
        } else {
            if (webSpeech.isRecording) {
                webSpeech.stopRecording();
            } else {
                webSpeech.startRecording();
            }
        }
    }, [useOfflineMode, whisper, webSpeech]);

    const handleProceedToForm = useCallback(() => {
        if (mode === 'text' && textInput.trim()) {
            const parsed = parseTradeText(textInput);
            applyParsedData(parsed, textInput);
        }
        setStep('form');
    }, [mode, textInput, applyParsedData]);

    const handleInputChange = useCallback((field: keyof JournalFormData, value: string | boolean) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            if (['entryPrice', 'stopLoss', 'target'].includes(field)) {
                const entry = field === 'entryPrice' ? parseFloat(value as string) : parseFloat(prev.entryPrice);
                const sl = field === 'stopLoss' ? parseFloat(value as string) : parseFloat(prev.stopLoss);
                const tp = field === 'target' ? parseFloat(value as string) : parseFloat(prev.target);
                if (entry && sl && tp) {
                    const risk = Math.abs(entry - sl);
                    const reward = Math.abs(tp - entry);
                    if (risk > 0) updated.riskReward = (Math.round((reward / risk) * 100) / 100).toString();
                }
            }
            return updated;
        });
    }, []);

    // Simple local save - fast and reliable
    const handleSubmit = useCallback(async (brokenRuleIds: string[] = []) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, brokenRuleIds }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.violationsCount > 0) {
                    console.log(`[SUCCESS] Entry saved with ${data.violationsCount} violation(s)`);
                } else {
                    console.log('[SUCCESS] Entry saved locally');
                }
                setIsSubmitting(false);
                setSubmitSuccess(true);
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            console.error('Failed to save:', err);
            setIsSubmitting(false);
            alert('Failed to save entry. Please try again.');
        }
    }, [formData]);

    const handleReset = useCallback(() => {
        setFormData(initialFormData);
        setTextInput('');
        useOfflineMode ? whisper.resetTranscript() : webSpeech.resetTranscript();
        setStep('input');
    }, [useOfflineMode, whisper, webSpeech]);

    // Auto-reset after success
    useEffect(() => {
        if (submitSuccess) {
            const timer = setTimeout(() => {
                setFormData(initialFormData);
                setTextInput('');
                setStep('input');
                setSubmitSuccess(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [submitSuccess]);

    if (submitSuccess) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--color-profit)' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h2>Journal Entry Saved!</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>Go to Sync page to upload to cloud</p>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '2rem' }}>
            {/* Offline Mode Toggle */}
            {step === 'input' && mode === 'voice' && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <div className="mode-toggle" style={{ fontSize: '0.8rem' }}>
                        <button className={`mode-toggle-btn ${!useOfflineMode ? 'active' : ''}`}
                            onClick={() => setUseOfflineMode(false)} disabled={!webSpeech.isSupported}
                            style={{ padding: '0.4rem 0.8rem' }}>
                            Online
                        </button>
                        <button className={`mode-toggle-btn ${useOfflineMode ? 'active' : ''}`}
                            onClick={() => setUseOfflineMode(true)}
                            style={{ padding: '0.4rem 0.8rem' }}>
                            Offline
                        </button>
                    </div>
                </div>
            )}

            {step === 'input' ? (
                <InputStep
                    mode={mode}
                    setMode={setMode}
                    isRecording={isRecording}
                    isProcessing={isProcessing}
                    isModelLoading={isModelLoading}
                    loadProgress={loadProgress}
                    transcript={transcript}
                    setTranscript={setTranscript}
                    textInput={textInput}
                    setTextInput={setTextInput}
                    error={error}
                    onVoiceToggle={handleVoiceToggle}
                    onProceed={handleProceedToForm}
                />
            ) : (
                <FormStep
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}
