import { db } from "@/db";
import { datasets } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import DatasetActions from "@/components/DatasetActions";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const allDatasets = await db.query.datasets.findMany({
        orderBy: [desc(datasets.createdAt)],
        with: {
            user: true, // Fetch user relation
        },
    });

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Datasets</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your collection of datasets, descriptions, and creation dates.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                        href="/dashboard/create"
                        className="block rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:shadow-md"
                    >
                        + Add Dataset
                    </Link>
                </div>
            </div>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pl-6">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Description
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Created By
                                        </th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Created At
                                        </th>
                                        <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr >
                                </thead >
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {allDatasets.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className="mb-2 text-2xl">📂</span>
                                                    No datasets found. Create your first one above!
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        allDatasets.map((dataset) => (
                                            <tr key={dataset.id} className="group hover:bg-gray-50/80 transition-colors">
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    <Link href={`/dashboard/${dataset.id}`} className="text-indigo-600 hover:text-indigo-900 font-semibold group-hover:underline">
                                                        {dataset.name}
                                                    </Link>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                                                    {dataset.description || <span className="text-gray-400 italic">No description</span>}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {dataset.user?.email || <span className="text-gray-400 italic">Unknown</span>}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                                                    {dataset.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <DatasetActions id={dataset.id} name={dataset.name} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table >
                        </div >
                    </div >
                </div >
            </div >
        </div >
    );
}
