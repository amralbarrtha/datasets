import { db } from "@/db";
import { datasets, voiceSamples } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { use as useAsync } from 'react';
import SampleActions from "@/components/SampleActions";
import LazyAudioPlayer from "@/components/LazyAudioPlayer";
import { notFound, redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function DatasetDetailsPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { page } = await searchParams;

    // Validate UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        notFound();
    }

    const currentPage = Number(page) || 1;
    const pageSize = 10;
    const offset = (currentPage - 1) * pageSize;

    const dataset = await db.query.datasets.findFirst({
        where: eq(datasets.id, id),
    });

    if (!dataset) {
        notFound();
    }

    // Get total count for pagination
    // Note: drizzle with `count()` is a bit verbose, doing a separate query usually
    // For simplicity with relations, fetching all ID would be heavy, lets keep it simple first
    // Or simpler: fetch one page + 1 to check if there is more?

    const samples = await db.query.voiceSamples.findMany({
        where: eq(voiceSamples.datasetId, id),
        orderBy: [desc(voiceSamples.createdAt)],
        limit: pageSize,
        offset: offset,
        with: {
            user: true, // Fetch uploader
        },
    });

    // Check if there are likely more items (simple check: if we got full page, assume maybe more)
    // To be precise we should count, but count query with drizzle query builder is distinct
    // Let's do a raw count for precision
    // const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(voiceSamples).where(eq(voiceSamples.datasetId, id));
    // Implementation of sql import needed. Let's stick to basic pagination logic for now.

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{dataset.name}</h1>
                    <p className="mt-2 text-lg text-gray-600 max-w-3xl">
                        {dataset.description || "No description provided."}
                    </p>
                </div>
                <div className="mt-6 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                        href={`/dashboard/${id}/upload`}
                        className="block rounded-lg bg-indigo-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:shadow-md"
                    >
                        Upload Sample
                    </Link>
                </div>
            </div>

            <div className="mt-10 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pl-6">
                                            Audio
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            File ID
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Original Name
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Transcript
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Uploaded By
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Uploaded At
                                        </th>
                                        <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {samples.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-sm text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className="mb-2 text-3xl">🎤</span>
                                                    <p>No voice samples uploaded yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        samples.map((sample) => (
                                            <tr key={sample.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    <LazyAudioPlayer src={sample.audioPath} />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-400 font-mono">
                                                    {sample.id.split('-')[0]}...
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 max-w-[150px] truncate" title={sample.originalFileName || ''}>
                                                    {sample.originalFileName || '-'}
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-600 max-w-xs truncate" title={sample.text}>
                                                    {sample.text}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {sample.user?.email || <span className="text-gray-400 italic">Unknown</span>}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {sample.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <SampleActions id={sample.id} initialText={sample.text} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex w-0 flex-1 justify-start">
                    {currentPage > 1 && (
                        <Link
                            href={`/dashboard/${id}?page=${currentPage - 1}`}
                            className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        >
                            <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z" clipRule="evenodd" />
                            </svg>
                            Previous
                        </Link>
                    )}
                </div>
                <div className="hidden md:flex">
                    <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span>
                    </p>
                </div>
                <div className="flex w-0 flex-1 justify-end">
                    {samples.length === pageSize && (
                        <Link
                            href={`/dashboard/${id}?page=${currentPage + 1}`}
                            className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        >
                            Next
                            <svg className="ml-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
