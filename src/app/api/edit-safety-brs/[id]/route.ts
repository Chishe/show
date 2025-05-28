import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest, context: { params: Promise<Record<string, string>> }
) {
  const { id } = await context.params;

  if (!id) {
    return new NextResponse(
      JSON.stringify({ message: 'Missing node ID' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { status, current_mp, target_mp, safety_devices, construction } = await req.json();

    if (!status || current_mp === undefined || target_mp === undefined || safety_devices === undefined || construction === undefined) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await db.query(
      'UPDATE safety_brs SET status = $1, current_mp = $2, target_mp = $3, safety_devices = $4, construction = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [status, current_mp, target_mp, safety_devices, construction, id]
    );

    if (result.rowCount === 0) {
      return new NextResponse(
        JSON.stringify({ message: 'Record not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: 'Safety status updated successfully',
        result: result.rows[0],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating safety status:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error updating safety status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
