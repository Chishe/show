import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM edges_brs");
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response("Error fetching data", { status: 500 });
  }
}
