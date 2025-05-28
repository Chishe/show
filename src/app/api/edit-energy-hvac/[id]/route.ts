import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest,  context: { params: Promise<Record<string, string>> }
) {
  const { id } = await context.params;

    if (!id) {
        return new NextResponse(
            JSON.stringify({ message: 'Missing node ID' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const {
            status,
            current_energy,
            target_energy,
            dekidaka,
        } = await req.json();

        if (
            !status ||
            current_energy === undefined ||
            target_energy === undefined ||
            dekidaka === undefined
        ) {
            return new NextResponse(
                JSON.stringify({ message: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = await db.query(
            `UPDATE cost_hvac
             SET status = $1, 
                 current_energy = $2, 
                 target_energy = $3, 
                 dekidaka = $4, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $5 
             RETURNING *`,
            [
                status,
                current_energy,
                target_energy,
                dekidaka,
                id
            ]
        );

        if (result.rowCount === 0) {
            return new NextResponse(
                JSON.stringify({ message: 'Record not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new NextResponse(
            JSON.stringify({
                message: 'Energy HVAC status updated successfully',
                result: result.rows[0],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error updating energy HVAC status:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Error updating energy HVAC status' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
