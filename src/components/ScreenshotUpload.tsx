'use client';

import { useState, useRef, useCallback } from 'react';

interface ScreenshotUploadProps {
    screenshots: string[];
    onChange: (screenshots: string[]) => void;
    maxFiles?: number;
}

export function ScreenshotUpload({ screenshots, onChange, maxFiles = 5 }: ScreenshotUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;

        const remainingSlots = maxFiles - screenshots.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                onChange([...screenshots, base64]);
            };
            reader.readAsDataURL(file);
        });
    }, [screenshots, onChange, maxFiles]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeScreenshot = (index: number) => {
        const updated = screenshots.filter((_, i) => i !== index);
        onChange(updated);
    };

    return (
        <div>
            {/* Drop Zone */}
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    padding: '2rem',
                    border: isDragging ? '2px dashed var(--color-accent)' : '2px dashed var(--color-border)',
                    borderRadius: '16px',
                    background: isDragging ? 'rgba(183, 148, 246, 0.1)' : 'var(--color-bg-tertiary)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    marginBottom: screenshots.length > 0 ? '1rem' : 0,
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                />
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📸</div>
                <p style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {isDragging ? 'Drop images here' : 'Drag & drop screenshots'}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    or click to browse • Max {maxFiles} images
                </p>
            </div>

            {/* Preview Grid */}
            {screenshots.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '0.75rem',
                }}>
                    {screenshots.map((src, index) => (
                        <div key={index} style={{
                            position: 'relative',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-secondary)',
                        }}>
                            <img
                                src={src}
                                alt={`Screenshot ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    objectFit: 'cover',
                                }}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeScreenshot(index);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.7)',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
