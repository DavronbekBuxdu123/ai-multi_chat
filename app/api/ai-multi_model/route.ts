import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { model, msg, parentModel } = await req.json();

  const response = await axios.post(
    "https://kravixstudio.com/api/v1/chat",
    {
      message: [{ role: "user", content: "Hi" }],
      aiModel: model,
      outputType: msg,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.KRAVIX_API_KEY}`,
      },
    }
  );

  console.log(response.data);

  return NextResponse.json({ ...response.data, model: parentModel });
}
