import { aj } from "@/config/ArcjetConfig";
import { currentUser } from "@clerk/nextjs/server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = currentUser();
  const { token } = await req.json();
  console.log(token);
  if (token) {
    const decision = await aj.protect(req, {
      userId: user?.primaryEmailAddress?.emailAddress,
      requested: token,
    });
    if (decision.isDenied()) {
      return NextResponse.json({
        error: "Juda ko'p urinish",
        remainingToken: decision.reason.remaining,
      });
    }
    return NextResponse.json({
      allowed: true,
      remainingToken: decision.reason.remaining,
    });
  } else {
    const decision = await aj.protect(req, {
      userId: user?.primaryEmailAddress?.emailAddress,
      requested: 0,
    });
    console.log("Arcjet decision", decision);
    const remainingToken = decision.reason.remaining;

    return NextResponse.json({ remainingToken: remainingToken });
  }
}
