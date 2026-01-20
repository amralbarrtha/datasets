'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { use as useAsync } from 'react';

export default function EditDatasetPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = useAsync(params);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Fetch dataset details
        fetch(`/api/datasets/${id}`) // We need to create this GET endpoint or fetch from server component? 
            // Actually, for edit pages, it's better to fetch client side or just pass data?
            // Let's assume we can fetch it. Wait, we don't have a GET /api/datasets/[id] yet?
            // We have DELETE /api/datasets/[id].
            // Let's create GET /api/datasets/[id] as well to support this.
            .then(res => {
                if (!res.ok) throw new Error('Failed to load');
                return res.json();
            })
            .then(data => {
                setName(data.name);
                setDescription(data.description || '');
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                // Handle error layout?
                setLoading(false);
            });
    }, [id]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/datasets/${id}`, {
                method: 'PATCH', // Update
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description }),
            });

            if (!res.ok) {
                throw new Error('Something went wrong');
            }

            router.refresh();
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to update dataset');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Edit Dataset</h1>
            <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        disabled={saving}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={saving}
                    />
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={saving}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
