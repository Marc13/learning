export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            It Works! 🎉
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Your Next.js app with Tailwind CSS is up and running perfectly.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="px-6 py-3 bg-green-100 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
            <span className="text-green-800 dark:text-green-200 font-medium">
              ✅ Next.js Ready
            </span>
          </div>
          <div className="px-6 py-3 bg-blue-100 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              ✅ Tailwind CSS Active
            </span>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Start building by editing{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
              src/app/page.tsx
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
