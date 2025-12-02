import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://backend:8080/api/v1';

/**
 * PATCH /api/todos/[id]/complete
 * Mark a todo as completed
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
      `${API_BASE_URL}/todos/${id}/complete`,
      {
        method: 'PATCH',
        headers,
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error completing todo:', error);
    return NextResponse.json(
      { error: 'Failed to complete todo', success: false },
      { status: 500 }
    );
  }
}
