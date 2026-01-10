'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseWhisperOptions {
    onResult?: (transcript: string) => void;
    onError?: (error: string) => void;
    onProgress?: (progress: number) => void;
}

interface UseWhisperReturn {
    isRecording: boolean;
    isProcessing: boolean;
    isModelLoading: boolean;
    modelLoaded: boolean;
    loadProgress: number;
    transcript: string;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    resetTranscript: () => void;
    setTranscript: (text: string) => void;
    error: string | null;
}

// Worker for Whisper processing
let whisperWorker: Worker | null = null;
let isModelLoadingGlobal = false;
let modelLoadedGlobal = false;

export function useWhisperRecording(options: UseWhisperOptions = {}): UseWhisperReturn {
    const { onResult, onError, onProgress } = options;

    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(isModelLoadingGlobal);
    const [modelLoaded, setModelLoaded] = useState(modelLoadedGlobal);
    const [loadProgress, setLoadProgress] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    // Initialize worker on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && !whisperWorker) {
            try {
                whisperWorker = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), { type: 'module' });

                whisperWorker.onmessage = (event) => {
                    const { type, data } = event.data;

                    switch (type) {
                        case 'loading':
                            isModelLoadingGlobal = true;
                            setIsModelLoading(true);
                            break;
                        case 'progress':
                            setLoadProgress(data.progress);
                            onProgress?.(data.progress);
                            break;
                        case 'ready':
                            isModelLoadingGlobal = false;
                            modelLoadedGlobal = true;
                            setIsModelLoading(false);
                            setModelLoaded(true);
                            break;
                        case 'result':
                            setIsProcessing(false);
                            if (data.text) {
                                setTranscript(prev => {
                                    const newTranscript = prev ? `${prev} ${data.text}` : data.text;
                                    onResult?.(newTranscript);
                                    return newTranscript;
                                });
                            }
                            break;
                        case 'error':
                            setIsProcessing(false);
                            setIsModelLoading(false);
                            setError(data.message);
                            onError?.(data.message);
                            break;
                    }
                };

                // Start loading the model
                whisperWorker.postMessage({ type: 'load' });
            } catch (e) {
                console.error('Failed to create Whisper worker:', e);
                setError('Failed to initialize offline speech recognition');
            }
        }
    }, [onResult, onError, onProgress]);

    const startRecording = useCallback(async () => {
        try {
            setError(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });

            streamRef.current = stream;
            audioChunksRef.current = [];

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg',
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000);
            setIsRecording(true);
        } catch (e: any) {
            const message = e.name === 'NotAllowedError'
                ? 'Microphone access denied. Please allow microphone access.'
                : 'Failed to start recording';
            setError(message);
            onError?.(message);
        }
    }, [onError]);

    const stopRecording = useCallback(async () => {
        if (!mediaRecorderRef.current || !streamRef.current) return;

        return new Promise<void>((resolve) => {
            const mediaRecorder = mediaRecorderRef.current!;

            mediaRecorder.onstop = async () => {
                setIsRecording(false);
                setIsProcessing(true);

                streamRef.current?.getTracks().forEach(track => track.stop());

                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });

                try {
                    // Decode audio in MAIN THREAD (not in worker)
                    const arrayBuffer = await audioBlob.arrayBuffer();
                    const audioContext = new AudioContext({ sampleRate: 16000 });
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                    // Get audio data as Float32Array
                    let audioData = audioBuffer.getChannelData(0);

                    // Resample to 16kHz if needed
                    if (audioBuffer.sampleRate !== 16000) {
                        const ratio = audioBuffer.sampleRate / 16000;
                        const newLength = Math.round(audioBuffer.length / ratio);
                        const resampledData = new Float32Array(newLength);
                        for (let i = 0; i < newLength; i++) {
                            const sourceIndex = Math.floor(i * ratio);
                            resampledData[i] = audioData[sourceIndex] || 0;
                        }
                        audioData = resampledData;
                    }

                    await audioContext.close();

                    // Send Float32Array to worker
                    if (whisperWorker && modelLoadedGlobal) {
                        whisperWorker.postMessage({
                            type: 'transcribe',
                            audio: audioData.buffer
                        }, [audioData.buffer]);
                    } else {
                        setIsProcessing(false);
                        setError('Speech recognition model not loaded yet');
                    }
                } catch (e: any) {
                    setIsProcessing(false);
                    setError(`Audio processing failed: ${e.message}`);
                    onError?.(`Audio processing failed: ${e.message}`);
                }

                resolve();
            };

            mediaRecorder.stop();
        });
    }, [onError]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    const updateTranscript = useCallback((text: string) => {
        setTranscript(text);
    }, []);

    return {
        isRecording,
        isProcessing,
        isModelLoading,
        modelLoaded,
        loadProgress,
        transcript,
        startRecording,
        stopRecording,
        resetTranscript,
        setTranscript: updateTranscript,
        error,
    };
}
