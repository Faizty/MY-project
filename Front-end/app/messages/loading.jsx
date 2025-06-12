export default function MessagesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Conversations List Loading */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>

          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="flex-1">
                  <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="mb-1 h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="mb-1 h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="h-2 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Detail Loading */}
        <div className="col-span-1 h-[600px] rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:col-span-2">
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800"></div>
              <div>
                <div className="mb-1 h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <div className="flex max-w-[80%] items-start gap-2">
                    {i % 2 === 0 && (
                      <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    )}
                    <div>
                      <div className="h-20 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
                      <div className="mt-1 h-2 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
