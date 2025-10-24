// src/components/post/PostList.tsx
import { Post } from "@/services/postService";
import PostListHeader from "./PostListHeader";
import PostListItem from "./PostListItem";

type PostListProps = {
  posts: Post[];
  basePath?: string;
};

export default function PostList({ posts, basePath }: PostListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <PostListHeader />
      <div className="divide-y divide-gray-100">
        {posts.length === 0 ? (
          <div className="text-center text-body-medium py-12 text-gray-500">
            등록된 게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => (
            <PostListItem key={post.id} {...post} basePath={basePath} />
          ))
        )}
      </div>
    </div>
  );
}
