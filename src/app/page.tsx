import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#6366f1_100%)] opacity-20"></div>
      <div className="w-full max-w-4xl px-4 text-center">
        <div className="mb-8 flex justify-center">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">Now using TypeScript & Drizzle ORM</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
          <span className="block">Manage your</span>
          <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Dataset Collection</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
          A powerful, professional platform for managing and collecting datasets.
          Upload voice samples, manage transcripts, and build your models with ease.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/dashboard"
            className="rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:scale-105"
          >
            Get Started
          </Link>
          <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1 hover:text-indigo-600 transition-colors">
            Log in <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
