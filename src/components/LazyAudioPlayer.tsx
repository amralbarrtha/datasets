'use client';

import { useState } from 'react';

export default function LazyAudioPlayer({ src }: { src: string }) {
    const [loaded, setLoaded] = useState(false);

    if (!loaded) {
        return (
            <button
                onClick={() => setLoaded(true)}
                className="flex items-center justify-center rounded-full bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100 transition-colors"
                title="Play Audio"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
            </button>
        );
    }

    return (
        <audio controls autoPlay src={src} className="h-8 w-48" />
    );
}
