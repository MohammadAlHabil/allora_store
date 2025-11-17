import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Page not found</h2>
          <p className="mt-2 text-sm text-gray-600">
            {"Sorry, we couldn't find the page you're looking for."}
          </p>
        </div>
        <Link
          href="/"
          className="inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
