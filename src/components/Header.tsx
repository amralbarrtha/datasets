'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Header() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isActive = (path: string) => pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-md transition-all">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent hover:to-indigo-500 transition-colors">
                                Dataset Collection
                            </Link>
                        </div>
                        <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                            <Link
                                href="/dashboard"
                                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${isActive('/dashboard')
                                    ? 'border-indigo-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900'
                                    }`}
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {session ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-700">
                                    {session.user?.name}
                                </span>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all hover:shadow-md"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:shadow-md"
                            >
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
