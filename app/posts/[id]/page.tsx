'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getCurrentUser } from '@/lib/authStore';
import { Post, Comment } from '@/lib/types';
import Link from 'next/link';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = getCurrentUser();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPostAndComments();
  }, []);

  const loadPostAndComments = async () => {
    try {
      const [postData, commentsData] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/posts/${id}/comments`)
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      console.error('Failed to load post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/posts/${id}`);
      router.push('/');
    } catch (err) {
      alert('삭제에 실패했습니다');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    try {
      const newComment = await api.post(`/posts/${id}/comments`, {
        content: commentContent
      });
      setComments([...comments, newComment]);
      setCommentContent('');
    } catch (err) {
      alert('댓글 작성에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert('댓글 삭제에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">게시글을 찾을 수 없습니다</div>
      </div>
    );
  }

  const isAuthor = user && post.authorId === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 목록으로
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>
                <span className="mr-4">{post.author}</span>
                <span>{new Date(post.createdAt).toLocaleString('ko-KR')}</span>
              </div>
              {isAuthor && (
                <div className="flex gap-2">
                  <Link
                    href={`/posts/${id}/edit`}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="prose max-w-none whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold mb-4">
            댓글 ({comments.length})
          </h2>

          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="댓글을 입력하세요"
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {submitting ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </form>
          )}

          {!user && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
              <Link href="/login" className="text-blue-600 hover:underline">
                로그인
              </Link>
              하여 댓글을 작성하세요
            </div>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                댓글이 없습니다
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-900">
                        {comment.author}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(comment.createdAt).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    {user && comment.authorId === user.id && (
                      <button
                        onClick={() => handleCommentDelete(comment.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
