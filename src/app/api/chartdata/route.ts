import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // หรือ config DB
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { rows } = req.body; // รับมาจาก frontend

    try {
      const client = await pool.connect();

      for (const row of rows) {
        await client.query(
          `INSERT INTO production_plan (
            part_number, model, qty, ct_target, start_time, end_time, stock_part
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            row.partNumber,
            row.model,
            parseInt(row.qty),
            parseInt(row.ctTarget),
            row.startTime,
            row.endTime,
            row.stockPart,
          ]
        );
      }

      client.release();
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Insert error:", error);
      res.status(500).json({ error: "Database insert failed" });
    }
  } else {
    res.status(405).end();
  }
}
