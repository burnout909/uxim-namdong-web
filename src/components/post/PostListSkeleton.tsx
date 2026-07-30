/**
 * 게시판 목록 로딩 스켈레톤.
 *
 * 게시판 페이지는 전부 force-dynamic 이라 Next 가 본문을 미리 가져오지 못한다.
 * loading.tsx 가 없으면 서버 응답이 올 때까지 이전 화면에 그대로 머물러서
 * "클릭했는데 아무 반응이 없다"처럼 느껴진다. 이 스켈레톤이 즉시 대신 뜬다.
 */
export default function PostListSkeleton({
  rows = 10,
  withHeader = true,
}: {
  rows?: number;
  /** 페이지 안에서 Suspense fallback 으로 쓸 때는 제목/여백을 빼고 목록만 그린다 */
  withHeader?: boolean;
}) {
  return (
    <div
      className={withHeader ? "px-2 md:px-6 pb-12" : undefined}
      aria-busy="true"
      aria-live="polite"
    >
      {withHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-40 rounded bg-gray-200 animate-pulse" />
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="col-span-8 md:col-span-6 h-4 w-20 rounded bg-gray-200 animate-pulse" />
          <div className="col-span-4 md:col-span-3 h-4 w-16 rounded bg-gray-200 animate-pulse" />
          <div className="hidden md:block col-span-3 h-4 w-16 justify-self-end rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-12 items-center gap-2 md:gap-4 px-4 md:px-6 py-4"
            >
              <div className="col-span-8 md:col-span-6">
                <div
                  className="h-4 rounded bg-gray-100 animate-pulse"
                  style={{ width: `${65 + ((i * 7) % 30)}%` }}
                />
              </div>
              <div className="col-span-4 md:col-span-3 h-4 w-24 rounded bg-gray-100 animate-pulse" />
              <div className="hidden md:block col-span-3 h-4 w-28 justify-self-center rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-8 rounded bg-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
