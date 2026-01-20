'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SampleActionsProps {
    id: string;
    initialText: string;
}

export default function SampleActions({ id, initialText }: SampleActionsProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Edit state
    const [text, setText] = useState(initialText);
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const onDelete = async () => {
        if (!confirm('Are you sure you want to delete this sample? This action cannot be undone.')) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/samples/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to delete sample');
        } finally {
            setDeleting(false);
        }
    };

    const onEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('text', text);
            if (file) {
                formData.append('file', file);
            }

            const res = await fetch(`/api/samples/${id}`, {
                method: 'PATCH',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to update');

            setIsEditing(false);
            setFile(null); // Reset file input
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to update sample');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex justify-end gap-2 items-center">
            {/* Edit Button */}
            <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                title="Edit Sample"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </button>

            {/* Delete Button */}
            <button
                onClick={onDelete}
                disabled={deleting}
                className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete Sample"
            >
                {deleting ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                )}
            </button>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsEditing(false)}></div>

                    {/* Modal Panel */}
                    <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                        <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                            <button
                                type="button"
                                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                onClick={() => setIsEditing(false)}
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="sm:flex sm:items-start">
                            <div className="w-full">
                                <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Edit Sample</h3>
                                <form onSubmit={onEditSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label htmlFor="text" className="block text-sm font-medium leading-6 text-gray-900">Transcript Text</label>
                                        <div className="mt-1">
                                            <textarea
                                                id="text"
                                                rows={3}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="file" className="block text-sm font-medium leading-6 text-gray-900">Replace Audio File (Optional)</label>
                                        <div className="mt-1">
                                            <input
                                                id="file"
                                                type="file"
                                                accept="audio/*"
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
