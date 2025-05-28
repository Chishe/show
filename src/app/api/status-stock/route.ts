import pool from '@/lib/db';

type StockRow = {
  part_no: string;
  total_quantity: number;
};

type JudgementRow = {
  part_no: string;
  qty: number;
};

export async function GET() {
  try {
    const stockResult1 = await pool.query(`
      SELECT part_no, SUM(quantity::INTEGER) AS total_quantity
      FROM log_data_stock_1
      WHERE quantity != '0'
      GROUP BY part_no
    `);

    const judgementResult1 = await pool.query(`
      SELECT part_no, qty::INTEGER 
      FROM judgement_line1
    `);

    const stockResult2 = await pool.query(`
      SELECT part_no, SUM(quantity::INTEGER) AS total_quantity
      FROM log_data_stock_2
      WHERE quantity != '0'
      GROUP BY part_no
    `);

    const judgementResult2 = await pool.query(`
      SELECT part_no, qty::INTEGER 
      FROM judgement_line2
    `);

    const checkResult = (stockRows: StockRow[], judgementRows: JudgementRow[]): number => {
      const stockMap: Record<string, number> = {};
      stockRows.forEach(row => {
        stockMap[row.part_no] = row.total_quantity;
      });

      let hasOne = false;
      judgementRows.forEach(row => {
        if ((stockMap[row.part_no] || 0) > row.qty) {
          hasOne = true;
        }
      });

      return hasOne ? 1 : 0;
    };

    const pressResult = checkResult(stockResult1.rows, judgementResult1.rows);
    const subResult = checkResult(stockResult2.rows, judgementResult2.rows);

    const result = [
      { label: "Press", result: pressResult },
      { label: "Sub", result: subResult }
    ];

    return Response.json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response('Error fetching data', { status: 500 });
  }
}
