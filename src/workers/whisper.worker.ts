/// <reference lib="webworker" />

import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js for browser/electron
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber: any = null;

// Handle messages from main thread
self.onmessage = async (event) => {
    const { type, audio } = event.data;

    switch (type) {
        case 'load':
            await loadModel();
            break;
        case 'transcribe':
            await transcribe(audio);
            break;
    }
};

async function loadModel() {
    try {
        self.postMessage({ type: 'loading' });

        // Use whisper-tiny for faster loading and inference (~50MB)
        transcriber = await pipeline(
            'automatic-speech-recognition',
            'Xenova/whisper-tiny.en',
            {
                progress_callback: (progress: any) => {
                    if (progress.status === 'progress' && progress.progress) {
                        self.postMessage({
                            type: 'progress',
                            data: { progress: Math.round(progress.progress) }
                        });
                    }
                },
            }
        );

        self.postMessage({ type: 'ready' });
    } catch (error: any) {
        self.postMessage({
            type: 'error',
            data: { message: `Failed to load model: ${error.message}` }
        });
    }
}

async function transcribe(audioBuffer: ArrayBuffer) {
    if (!transcriber) {
        self.postMessage({
            type: 'error',
            data: { message: 'Model not loaded' }
        });
        return;
    }

    try {
        // Audio is already decoded as Float32Array from main thread
        const audioData = new Float32Array(audioBuffer);

        // Run transcription
        const result = await transcriber(audioData, {
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: false,
        });

        self.postMessage({
            type: 'result',
            data: { text: result.text?.trim() || '' }
        });
    } catch (error: any) {
        self.postMessage({
            type: 'error',
            data: { message: `Transcription failed: ${error.message}` }
        });
    }
}

export { };
