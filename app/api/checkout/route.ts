import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, freelancerEmail, freelancerLocalBank } = await request.json();

    // التحقق من المدخلات الأساسية للعملية المالية
    if (!amount || !freelancerEmail || !freelancerLocalBank) {
      return NextResponse.json({ error: 'جميع البيانات مطلوبة لإتمام المعاملة' }, { status: 400 });
    }

    // حساب النسب المئوية أوتوماتيكياً بناءً على عمولة الـ 12% الجديدة
    const totalAmount = parseFloat(amount);
    const platformCommission = totalAmount * 0.12; // سحب نسبتك الـ 12% فوراً عند أي دفعة
    const payoutToFreelancer = totalAmount - platformCommission; // المبلغ الصافي المستحق للمستقل (88%)

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const wiseApiKey = process.env.WISE_API_KEY;

    if (!stripeSecretKey || !wiseApiKey) {
      return NextResponse.json({ error: 'إعدادات بوابات الدفع غير مكتملة على السيرفر' }, { status: 500 });
    }

    // 1. توليد رابط الدفع العالمي الآمن (Stripe Checkout Session) للعميل الأجنبي
    const stripeResponse = await fetch('https://stripe.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'line_items[price_data][currency]': 'usd',
        'line_items[price_data][product_data][name]': 'Freelance Services Payment via PayLink',
        'line_items[price_data][unit_amount]': Math.round(totalAmount * 100).toString(), // القيمة بالسنتات
        'line_items[quantity]': '1',
        'success_url': 'https://vercel.app',
        'cancel_url': 'https://vercel.app',
        'metadata[freelancer_email]': freelancerEmail,
        'metadata[payout_amount]': payoutToFreelancer.toString(),
        'metadata[local_bank]': freelancerLocalBank,
      }),
    });

    if (!stripeResponse.ok) {
      return NextResponse.json({ error: 'فشل إنشاء جلسة الدفع الآمنة' }, { status: 502 });
    }

    const session = await stripeResponse.json();

    return NextResponse.json({ 
      success: true, 
      paymentUrl: session.url, // الرابط الذي سيرسله المستقل لزبونه الأجنبي
      commissionSecured: platformCommission 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
