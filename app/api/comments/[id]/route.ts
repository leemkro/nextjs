import { NextResponse } from 'next/server';
import { deleteComment, comments } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const comment = comments.find(c => c.id === id);

  if (!comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    );
  }

  if (comment.authorId !== user.id) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  deleteComment(id);

  return NextResponse.json({ message: 'Comment deleted successfully' });
}
