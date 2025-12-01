import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * PATCH /api/todos/[id]/incomplete
 * Mark a todo as pending/incomplete
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(
      `${API_BASE_URL}/todos/${id}/incomplete`,
      {
        method: 'PATCH',
        headers,
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error marking todo as incomplete:', error);
    return NextResponse.json(
      { error: 'Failed to mark todo as incomplete', success: false },
      { status: 500 }
    );
  }
}
