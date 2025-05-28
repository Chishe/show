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
            inline_defect, 
            current_mp_skill, 
            target_mp_skill, 
            current_ll_patrol, 
            target_ll_patrol 
        } = await req.json();

        if (
            !status || 
            inline_defect === undefined || 
            current_mp_skill === undefined || 
            target_mp_skill === undefined || 
            current_ll_patrol === undefined || 
            target_ll_patrol === undefined
        ) {
            return new NextResponse(
                JSON.stringify({ message: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = await db.query(
            `UPDATE quality_brs 
             SET status = $1, 
                 inline_defect = $2, 
                 current_mp_skill = $3, 
                 target_mp_skill = $4, 
                 current_ll_patrol = $5, 
                 target_ll_patrol = $6, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $7 
             RETURNING *`,
            [
                status, 
                inline_defect, 
                current_mp_skill, 
                target_mp_skill, 
                current_ll_patrol, 
                target_ll_patrol, 
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
                message: 'Quality BRS status updated successfully',
                result: result.rows[0], 
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error updating quality BRS status:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Error updating quality BRS status' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
