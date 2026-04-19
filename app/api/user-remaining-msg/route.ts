import { aj } from "@/config/ArcjetConfig";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    const token = body.token || 1;
    const userId = user?.primaryEmailAddress?.emailAddress ?? "anonymous";

    const decision = await aj.protect(req, {
      userId: userId,
      requested: Number(token),
    });

    let remainingToken = 0;
    if (decision.reason.isRateLimit()) {
      remainingToken = decision.reason.remaining;
    }

    if (decision.isDenied()) {
      return NextResponse.json(
        {
          error: "Limit tugadi",
          remainingToken: 0,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      allowed: true,
      remainingToken: remainingToken,
    });
  } catch (error) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
