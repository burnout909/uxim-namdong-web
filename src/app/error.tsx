'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
            <h1 className="text-2xl font-semibold text-red-600 mb-2">Something went wrong</h1>
            <p className="text-gray-700 mb-4">{error.message}</p>
            <button
                onClick={reset}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
                Try Again
            </button>
        </div>
    );
}
