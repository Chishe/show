import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
  
    if (!id) {
        return new NextResponse(
            JSON.stringify({ message: 'Missing node ID' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  
    try {
        const { 
            line_number, 
            part_number, 
            process_name, 
            category, 
            location, 
            operating_rate,
            line_status,
            product,
            problem,
            action,
            pic,
        } = await req.json();

        if (
            !line_number || 
            part_number === undefined || 
            process_name === undefined || 
            category === undefined || 
            location === undefined || 
            operating_rate === undefined ||
            line_status === undefined ||
            product === undefined ||
            problem === undefined ||
            action === undefined ||
            pic === undefined
        ) {
            return new NextResponse(
                JSON.stringify({ message: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = await db.query(
            `UPDATE production_status_brs 
             SET line_number = $1, 
                 part_number = $2, 
                 process_name = $3, 
                 category = $4, 
                 location = $5, 
                 operating_rate = $6, 
                 line_status = $7,
                 product = $8,
                 problem = $9,
                 action = $10,
                 pic = $11,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $12 
             RETURNING *`,
            [
                line_number, 
                part_number, 
                process_name, 
                category, 
                location, 
                operating_rate,
                line_status,
                product,
                problem,
                action,
                pic,
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
                message: 'Product BRS status updated successfully',
                result: result.rows[0], 
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error updating product BRS status:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Error updating product BRS status' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
