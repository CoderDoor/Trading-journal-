'use client';

import { useState, useCallback, useRef } from 'react';

interface UseVoiceRecordingOptions {
    continuous?: boolean;
    language?: string;
    onResult?: (transcript: string) => void;
    onError?: (error: string) => void;
}

interface UseVoiceRecordingReturn {
    isRecording: boolean;
    isSupported: boolean;
    transcript: string;
    interimTranscript: string;
    startRecording: () => void;
    stopRecording: () => void;
    resetTranscript: () => void;
    setTranscript: (text: string) => void;
    error: string | null;
}

export function useVoiceRecording(options: UseVoiceRecordingOptions = {}): UseVoiceRecordingReturn {
    const {
        continuous = true,
        language = 'en-US',
        onResult,
        onError,
    } = options;

    const [isRecording, setIsRecording] = useState(false);
    const [isSupported] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
    });
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const shouldContinueRef = useRef(false);
    const finalTranscriptRef = useRef('');

    const createRecognition = useCallback(() => {
        if (typeof window === 'undefined') return null;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsRecording(true);
            setError(null);
        };

        recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript + ' ';
                } else {
                    interim += result[0].transcript;
                }
            }

            if (final) {
                finalTranscriptRef.current += final;
                setTranscript(finalTranscriptRef.current.trim());
                onResult?.(finalTranscriptRef.current.trim());
            }

            setInterimTranscript(interim);
        };

        recognition.onerror = (event: any) => {
            const errorMessage = `Speech recognition error: ${event.error}`;
            setError(errorMessage);
            onError?.(errorMessage);
            setIsRecording(false);
            shouldContinueRef.current = false;
        };

        recognition.onend = () => {
            setInterimTranscript('');

            // Only auto-restart if we should continue (not manually stopped)
            if (shouldContinueRef.current && recognitionRef.current) {
                try {
                    setTimeout(() => {
                        if (shouldContinueRef.current && recognitionRef.current) {
                            recognitionRef.current.start();
                        } else {
                            setIsRecording(false);
                        }
                    }, 100);
                } catch (e) {
                    setIsRecording(false);
                    shouldContinueRef.current = false;
                }
            } else {
                setIsRecording(false);
            }
        };

        return recognition;
    }, [continuous, language, onResult, onError]);

    const startRecording = useCallback(() => {
        if (!isSupported) return;

        try {
            // Create new recognition instance
            recognitionRef.current = createRecognition();
            if (!recognitionRef.current) return;

            // Keep existing transcript
            finalTranscriptRef.current = transcript;
            shouldContinueRef.current = true;

            recognitionRef.current.start();
        } catch (e) {
            setError('Failed to start speech recognition');
            shouldContinueRef.current = false;
        }
    }, [isSupported, transcript, createRecognition]);

    const stopRecording = useCallback(() => {
        // Prevent auto-restart
        shouldContinueRef.current = false;

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                recognitionRef.current.abort();
            } catch (e) {
                // Ignore errors when stopping
            }
            recognitionRef.current = null;
        }

        setIsRecording(false);
        setInterimTranscript('');
    }, []);

    const resetTranscript = useCallback(() => {
        finalTranscriptRef.current = '';
        setTranscript('');
        setInterimTranscript('');
    }, []);

    const updateTranscript = useCallback((text: string) => {
        finalTranscriptRef.current = text;
        setTranscript(text);
    }, []);

    return {
        isRecording,
        isSupported,
        transcript,
        interimTranscript,
        startRecording,
        stopRecording,
        resetTranscript,
        setTranscript: updateTranscript,
        error,
    };
}

// Type declarations for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
