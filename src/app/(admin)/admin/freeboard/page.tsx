import { getAllFreePosts } from "@/services/postService";
import PostRow from "./PostRow";

export const dynamic = "force-dynamic";

export default async function AdminFreeBoardPage() {
    const { adminPosts, userPosts } = await getAllFreePosts();

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    자유게시판 관리
                </h1>

                {/* 관리자 작성 글 */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">
                        관리자 작성 글
                    </h2>
                    {adminPosts.length > 0 ? (
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">제목</th>
                                        <th className="px-6 py-3">작성자</th>
                                        <th className="px-6 py-3">작성일</th>
                                        <th className="px-6 py-3 text-center">공개 여부</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminPosts.map((post) => (
                                        <PostRow
                                            key={post.id}
                                            post={post}
                                            author="관리자"
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">관리자 작성 글이 없습니다.</p>
                    )}
                </section>

                {/* 사용자 작성 글 */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">
                        사용자 작성 글
                    </h2>
                    {userPosts.length > 0 ? (
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">제목</th>
                                        <th className="px-6 py-3">작성자</th>
                                        <th className="px-6 py-3">작성일</th>
                                        <th className="px-6 py-3 text-center">공개 여부</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userPosts.map((post) => (
                                        <PostRow
                                            key={post.id}
                                            post={post}
                                            author="익명"
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">사용자 작성 글이 없습니다.</p>
                    )}
                </section>
            </div>
        </main>
    );
}
