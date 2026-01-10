'use client';

interface InputStepProps {
    mode: 'voice' | 'text';
    setMode: (mode: 'voice' | 'text') => void;
    isRecording: boolean;
    isProcessing?: boolean;
    isModelLoading?: boolean;
    loadProgress?: number;
    transcript: string;
    setTranscript: (text: string) => void;
    textInput: string;
    setTextInput: (text: string) => void;
    error: string | null;
    onVoiceToggle: () => void;
    onProceed: () => void;
}

export function InputStep({
    mode, setMode, isRecording, isProcessing, isModelLoading, loadProgress,
    transcript, setTranscript, textInput, setTextInput, error, onVoiceToggle, onProceed,
}: InputStepProps) {
    const hasContent = mode === 'voice' ? transcript.length > 0 : textInput.trim().length > 0;

    return (
        <div className="premium-input-step">
            {/* Hero Section */}
            <div style={{
                textAlign: 'center',
                marginBottom: '2.5rem',
                padding: '2rem 0',
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    marginBottom: '0.75rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.03em',
                }}>
                    Record Your Trade
                </h1>
                <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '1.1rem',
                    maxWidth: '500px',
                    margin: '0 auto',
                }}>
                    Speak naturally or type to capture your trading insights
                </p>
            </div>

            {/* Mode Toggle - Premium Pill Style */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2.5rem',
            }}>
                <div style={{
                    display: 'flex',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '100px',
                    padding: '6px',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-md)',
                }}>
                    <button
                        onClick={() => setMode('voice')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '100px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: mode === 'voice'
                                ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                                : 'transparent',
                            color: mode === 'voice' ? 'white' : 'var(--color-text-muted)',
                            boxShadow: mode === 'voice' ? '0 4px 15px rgba(139, 92, 246, 0.4)' : 'none',
                        }}
                    >
                        🎙️ Voice
                    </button>
                    <button
                        onClick={() => setMode('text')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '100px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: mode === 'text'
                                ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                                : 'transparent',
                            color: mode === 'text' ? 'white' : 'var(--color-text-muted)',
                            boxShadow: mode === 'text' ? '0 4px 15px rgba(139, 92, 246, 0.4)' : 'none',
                        }}
                    >
                        ⌨️ Type
                    </button>
                </div>
            </div>

            {/* Voice Mode */}
            {mode === 'voice' && (
                <div style={{ textAlign: 'center' }}>
                    {/* Recording Button - Premium Animated */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '2rem',
                    }}>
                        <button
                            onClick={onVoiceToggle}
                            disabled={isProcessing || isModelLoading}
                            style={{
                                width: '140px',
                                height: '140px',
                                borderRadius: '50%',
                                border: 'none',
                                cursor: isProcessing || isModelLoading ? 'wait' : 'pointer',
                                fontSize: '3rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                background: isRecording
                                    ? 'linear-gradient(135deg, #f43f5e 0%, #ef4444 100%)'
                                    : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                boxShadow: isRecording
                                    ? '0 0 0 0 rgba(244, 63, 94, 0.4), 0 20px 40px rgba(244, 63, 94, 0.3)'
                                    : '0 20px 40px rgba(139, 92, 246, 0.3)',
                                animation: isRecording ? 'pulse-ring 1.5s ease-out infinite' : 'none',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {isProcessing ? '⏳' : isRecording ? '⏹️' : '🎙️'}
                        </button>
                    </div>

                    {/* Status Text */}
                    <p style={{
                        color: isRecording ? 'var(--color-loss)' : 'var(--color-text-secondary)',
                        fontSize: '1rem',
                        fontWeight: isRecording ? 600 : 400,
                        marginBottom: '2rem',
                    }}>
                        {isModelLoading && `Loading AI model... ${loadProgress || 0}%`}
                        {isProcessing && 'Processing audio...'}
                        {!isProcessing && !isModelLoading && (
                            isRecording ? '🔴 Recording... Tap to stop' : 'Tap the microphone to start'
                        )}
                    </p>

                    {/* Error Display */}
                    {error && (
                        <div style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                            maxWidth: '500px',
                            margin: '0 auto 1.5rem',
                        }}>
                            <p style={{ color: 'var(--color-loss)', margin: 0 }}>{error}</p>
                            <button
                                onClick={() => setMode('text')}
                                style={{
                                    marginTop: '0.75rem',
                                    background: 'transparent',
                                    border: '1px solid var(--color-loss)',
                                    color: 'var(--color-loss)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                }}
                            >
                                Switch to Text Mode
                            </button>
                        </div>
                    )}

                    {/* Transcript Box - Premium Card */}
                    <div style={{
                        background: 'var(--gradient-card)',
                        backdropFilter: 'blur(20px)',
                        border: isRecording ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        boxShadow: isRecording
                            ? '0 0 30px rgba(139, 92, 246, 0.2), var(--shadow-card)'
                            : 'var(--shadow-card)',
                        transition: 'all 0.3s ease',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                        }}>
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: 'var(--color-accent)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                ✨ Transcription
                            </span>
                            {transcript && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--color-text-muted)',
                                    background: 'var(--color-bg-tertiary)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '100px',
                                }}>
                                    {transcript.split(' ').length} words
                                </span>
                            )}
                        </div>
                        <textarea
                            placeholder="Your words will appear here... Speak naturally about your trade."
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                padding: '1rem',
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                lineHeight: 1.6,
                                resize: 'vertical',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Text Mode */}
            {mode === 'text' && (
                <div style={{
                    background: 'var(--gradient-card)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-card)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.25rem',
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>📝</span>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                            Type Your Trade Journal
                        </h3>
                    </div>
                    <textarea
                        placeholder="Example: I took a long trade on EURUSD at 1.0850 with stop loss at 1.0820 targeting 1.0920. Entry was based on a bullish order block after CHoCH on the 15-minute chart during London session..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '1.25rem',
                            background: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            color: 'var(--color-text)',
                            fontSize: '1rem',
                            lineHeight: 1.7,
                            resize: 'vertical',
                            fontFamily: 'inherit',
                        }}
                    />
                    <p style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.85rem',
                        marginTop: '0.75rem',
                    }}>
                        💡 Tip: Include instrument, entry/exit prices, stop loss, and reasoning
                    </p>
                </div>
            )}

            {/* Proceed Button - Premium Gradient */}
            {hasContent && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '2.5rem',
                }}>
                    <button
                        onClick={onProceed}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: '100px',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: 'white',
                            boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Continue to Journal Entry
                        <span style={{ fontSize: '1.25rem' }}>→</span>
                    </button>
                </div>
            )}

            <style jsx>{`
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4), 0 20px 40px rgba(244, 63, 94, 0.3); }
                    70% { box-shadow: 0 0 0 20px rgba(244, 63, 94, 0), 0 20px 40px rgba(244, 63, 94, 0.3); }
                    100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0), 0 20px 40px rgba(244, 63, 94, 0.3); }
                }
            `}</style>
        </div>
    );
}
