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
            current_productivity,
            target_productivity,
            manhours,
            overtime,
            expense
        } = await req.json();

        if (
            !status ||
            current_productivity === undefined ||
            target_productivity === undefined ||
            manhours === undefined ||
            overtime === undefined ||
            expense === undefined
        ) {
            return new NextResponse(
                JSON.stringify({ message: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = await db.query(
            `UPDATE cost_hvac
             SET status = $1, 
                 current_productivity = $2, 
                 target_productivity = $3, 
                 manhours = $4, 
                 overtime = $5,
                 expense = $6,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $7 
             RETURNING *`,
            [
                status,
                current_productivity,
                target_productivity,
                manhours,
                overtime,
                expense,
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
                message: 'Cost HVAC status updated successfully',
                result: result.rows[0],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error updating cost HVAC status:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Error updating cost HVAC status' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
