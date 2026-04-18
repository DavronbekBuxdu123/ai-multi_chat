import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { model, msg, parentModel } = await req.json();
    const userMessages = Array.isArray(msg)
      ? msg
      : [{ role: "user", content: msg }];

    const messagesWithInstruction = [
      {
        role: "system",
        content:
          "You are a helpful assistant. Respond in the same language the user uses. If the user speaks Uzbek, reply in Uzbek. If English, reply in English.",
      },
      ...userMessages,
    ];

    const response = await axios.post(
      "https://kravixstudio.com/api/v1/chat",
      {
        message: messagesWithInstruction,
        aiModel: model,

        outputType: "text",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.KRAVIX_API_KEY}`,
        },
      }
    );

    return NextResponse.json({
      ...response.data,
      model: parentModel,
    });
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "AI modelidan javob olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
