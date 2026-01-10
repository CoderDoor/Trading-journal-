'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceTextInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    isVoiceSupported: boolean;
}

export function VoiceTextInput({ label, placeholder, value, onChange, isVoiceSupported }: VoiceTextInputProps) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const shouldContinueRef = useRef(false);
    const valueRef = useRef(value);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const startListening = () => {
        if (!isVoiceSupported || typeof window === 'undefined') return;

        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) return;

        const rec = new SpeechRecognitionAPI();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onstart = () => setIsListening(true);

        rec.onresult = (event: any) => {
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript + ' ';
                }
            }
            if (final) {
                onChange(valueRef.current + final);
            }
        };

        rec.onend = () => {
            if (shouldContinueRef.current && recognitionRef.current) {
                try {
                    setTimeout(() => {
                        if (shouldContinueRef.current && recognitionRef.current) {
                            recognitionRef.current.start();
                        } else {
                            setIsListening(false);
                        }
                    }, 100);
                } catch (e) {
                    setIsListening(false);
                }
            } else {
                setIsListening(false);
            }
        };

        rec.onerror = () => {
            setIsListening(false);
            shouldContinueRef.current = false;
        };

        recognitionRef.current = rec;
        shouldContinueRef.current = true;

        try {
            rec.start();
        } catch (e) {
            setIsListening(false);
            shouldContinueRef.current = false;
        }
    };

    const stopListening = () => {
        shouldContinueRef.current = false;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                recognitionRef.current.abort();
            } catch (e) { }
            recognitionRef.current = null;
        }
        setIsListening(false);
    };

    const toggleListening = () => {
        isListening ? stopListening() : startListening();
    };

    return (
        <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>{label}</label>
                {isVoiceSupported && (
                    <button
                        type="button"
                        onClick={toggleListening}
                        style={{
                            background: isListening ? 'var(--color-loss)' : 'var(--color-accent)',
                            border: 'none',
                            borderRadius: 'var(--radius-full)',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            animation: isListening ? 'pulse 1.5s infinite' : 'none',
                        }}
                        title={isListening ? 'Stop recording' : 'Record voice input'}
                    >
                        {isListening ? '⏹️' : '🎙️'}
                    </button>
                )}
            </div>
            <textarea
                className="input-field"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    minHeight: '80px',
                    borderColor: isListening ? 'var(--color-accent)' : undefined,
                    boxShadow: isListening ? '0 0 0 3px var(--color-accent-glow)' : undefined,
                }}
            />
        </div>
    );
}
