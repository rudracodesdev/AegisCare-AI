import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, itemName } = await req.json();
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret && keySecret !== "your_razorpay_secret") {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: Math.round((amount || 499) * 100), // in paise
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        return NextResponse.json({
          success: true,
          mode: "RAZORPAY_LIVE",
          orderId: orderData.id,
          amount: orderData.amount,
          currency: orderData.currency,
          keyId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      mode: "DEMO_INSTANT",
      orderId: `order_demo_${Date.now()}`,
      amount: (amount || 499) * 100,
      currency: "INR",
      itemName,
    });
  } catch {
    return NextResponse.json({
      success: true,
      mode: "DEMO_INSTANT",
      orderId: `order_demo_${Date.now()}`,
      amount: 49900,
      currency: "INR",
    });
  }
}