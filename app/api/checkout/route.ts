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
    const nowpaymentsApiKey = process.env.NOWPAYMENTS_API_KEY;

    // التحقق من وجود مفاتيح الربط البرمجية على السيرفر
    if (!stripeSecretKey || !nowpaymentsApiKey) {
      return NextResponse.json({ error: 'إعدادات بوابات الدفع والعملات الرقمية غير مكتملة على السيرفر' }, { status: 500 });
    }

    // 1. استدعاء بوابة NOWPayments لتوليد فاتورة دفع بالعملات الرقمية (USDT) للعميل
    const cryptoResponse = await fetch('https://nowpayments.io', {
      method: 'POST',
      headers: {
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: totalAmount,
        price_currency: 'usd',
        pay_currency: 'usdttrc20', // استخدام USDT على شبكة TRON لرسوم شبكة شبه معدومة
        order_id: `pay_${Date.now()}`,
        order_description: 'Freelance Services Payment via PayLink Crypto',
        success_url: 'https://vercel.app',
        cancel_url: 'https://vercel.app',
      }),
    });

    if (!cryptoResponse.ok) {
      // إذا فشل نظام الكريبتو، يحاول التطبيق تلقائياً تشغيل بوابة Stripe Checkout كخطة بديلة للفيزا
      const stripeResponse = await fetch('https://stripe.com', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'line_items[price_data][currency]': 'usd',
          'line_items[price_data][product_data][name]': 'Freelance Services Payment via PayLink (Card)',
          'line_items[price_data][unit_amount]': Math.round(totalAmount * 100).toString(),
          'line_items[quantity]': '1',
          'success_url': 'https://vercel.app',
          'cancel_url': 'https://vercel.app',
          'metadata[freelancer_email]': freelancerEmail,
          'metadata[payout_amount]': payoutToFreelancer.toString(),
          'metadata[local_bank]': freelancerLocalBank,
        }),
      });

      if (!stripeResponse.ok) {
        return NextResponse.json({ error: 'فشل إنشاء جلسة الدفع الآمنة بجميع البوابات' }, { status: 502 });
      }

      const stripeSession = await stripeResponse.json();
      return NextResponse.json({ 
        success: true, 
        paymentUrl: stripeSession.url, // العميل سيدفع بالفيزا العادية
        commissionSecured: platformCommission,
        type: 'stripe'
      });
    }

    const cryptoSession = await cryptoResponse.json();

    return NextResponse.json({ 
      success: true, 
      paymentUrl: cryptoSession.invoice_url || cryptoSession.checkout_url, // رابط الفاتورة المشفرة بـ USDT
      commissionSecured: platformCommission,
      type: 'crypto'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
