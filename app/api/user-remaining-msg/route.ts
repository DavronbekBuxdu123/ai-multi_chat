import { aj } from "@/config/ArcjetConfig";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
// Arcjet'ning rasmiy turini import qilamiz
import { ArcjetRateLimitReason } from "@arcjet/next";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const token = body.token;
    const userId = user?.primaryEmailAddress?.emailAddress ?? "anonymous";
    const getRemaining = (decision: any): number => {
      if (decision.reason.isRateLimit()) {
        return (decision.reason as ArcjetRateLimitReason).remaining;
      }
      return 0;
    };

    const decision = await aj.protect(req, {
      userId: userId,
      requested: token ? Number(token) : 0,
    });

    const remainingToken = getRemaining(decision);

    if (decision.isDenied()) {
      return NextResponse.json(
        {
          error: "Juda ko'p urinish",
          remainingToken,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      allowed: true,
      remainingToken,
    });
  } catch (error) {
    console.error("Build Error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
