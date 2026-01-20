'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { use as useAsync } from 'react';

export default function UploadSamplePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = useAsync(params);

    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !text) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('text', text);

        try {
            const res = await fetch(`/api/datasets/${id}/samples`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Something went wrong');
            }

            router.refresh();
            router.push(`/dashboard/${id}`);
        } catch (error) {
            console.error(error);
            alert('Failed to upload sample');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Upload Voice Sample</h1>
            <form onSubmit={onSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Voice File (Audio)
                    </label>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
                        required
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Transcript / Text
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter the text spoken in the audio..."
                        required
                        disabled={loading}
                    />
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </form>
        </div>
    );
}
