import { NextResponse } from 'next/server';

export async function GET() {
  const data = [
    { title: "Tube", value: "120/100"},
    { title: "Inner Fin", value: "120/100" },
    { title: "Outer Fin", value: "220/200" },
    { title: "Seperator", value: "220/200" },
    { title: "Plate Header", value: "200/200" },
    { title: "Tank Header", value: "200/200"},
    // { title: "Tank Header", value: "200/200", additional: "Est. Shortage 17m 34s" },
  ];

  return NextResponse.json(data);
}
