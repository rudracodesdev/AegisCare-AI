import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, passcode, role, memberName } = await req.json();

    if (!passcode || passcode.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Care Circle Passcode (e.g. CARE26)." },
        { status: 400 }
      );
    }

    const secretKey =
      process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";

    // Allow demo-bypass-token if local network blocks external captcha script
    if (token && token !== "demo-bypass-token") {
      const formData = new FormData();
      formData.append("secret", secretKey);
      formData.append("response", token);

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData,
        }
      );

      const verifyData = await verifyRes.json();
      if (!verifyData.success && process.env.TURNSTILE_SECRET_KEY) {
        return NextResponse.json(
          { success: false, error: "Cloudflare Turnstile verification failed." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        passcode: passcode.toUpperCase(),
        role,
        memberName: memberName || "Authorized Member",
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication server error" },
      { status: 500 }
    );
  }
}