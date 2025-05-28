import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
  
    if (!id) {
        return new NextResponse(
            JSON.stringify({ message: 'Missing node ID' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  
    try {
        const { 
            status, 
            shipping_status, 
            current_mp_skill, 
            safety_stock, 
        } = await req.json();
        if (
            !status || 
            shipping_status === undefined || 
            current_mp_skill === undefined || 
            safety_stock === undefined
        ) {
            return new NextResponse(
                JSON.stringify({ message: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = await db.query(
            `UPDATE delivery_hvac 
             SET status = $1, 
                 shipping_status = $2, 
                 current_mp_skill = $3, 
                 safety_stock = $4, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $5 
             RETURNING *`,
            [
                status, 
                shipping_status, 
                current_mp_skill, 
                safety_stock, 
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
                message: 'Delivery HVAC status updated successfully',
                result: result.rows[0], 
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error updating delivery HVAC status:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Error updating delivery HVAC status' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
