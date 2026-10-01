'use client';

import { useState } from 'react';

export default function Home() {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [bank, setBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [commissionInfo, setCommissionInfo] = useState<{ secured: number; freelancer: number } | null>(null);
  const [error, setError] = useState('');

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setCommissionInfo({
        secured: num * 0.12, // حساب عمولة الموقع الـ 12% أمام عين المستخدم
        freelancer: num * 0.88, // المبلغ الذي سيصله
      });
    } else {
      setCommissionInfo(null);
    }
  };

  const generateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPaymentUrl('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          freelancerEmail: email,
          freelancerLocalBank: bank,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'فشل في إنشاء الرابط');

      if (data.success && data.paymentUrl) {
        setPaymentUrl(data.paymentUrl);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="p-6 border-b border-indigo-500/20 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center direction-rtl">
          <h1 className="text-2xl font-black text-indigo-400 tracking-wider">PayLink 💸</h1>
          <span className="bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1.5 rounded-full border border-indigo-500/20 font-medium">بوابة دفع المستقلين البديلة</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg w-full mx-auto p-6 flex flex-col justify-center">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">اصنع رابط دفعك العالمي</h2>
            <p className="text-slate-400 text-sm">استقبل أموالك بالفيزا من أي مكان في العالم، واسحبها محلياً</p>
          </div>

          <form onSubmit={generateLink} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-right">المبلغ المطلوب (بالدولار الأمريكي USD)</label>
              <input
                type="number"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-700"
              />
            </div>

            {commissionInfo && (
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 text-sm space-y-2 direction-rtl">
                <div className="flex justify-between text-slate-400">
                  <span>رسوم تشغيل المنصة (12%):</span>
                  <span className="font-bold text-rose-400">-{commissionInfo.secured.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
                  <span>صافي المبلغ المستلم محلياً (88%):</span>
                  <span className="text-emerald-400">+{commissionInfo.freelancer.toFixed(2)} $</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-right">بريدك الإلكتروني (لتلقي إشعارات الدفع)</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-right">معلومات حسابك البنكي أو المحفظة المحلية</label>
              <textarea
                required
                rows={2}
                placeholder="مثال: بريد الجزائر CCB: 0012345678 / أو رقم المحفظة الرقمية"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-700 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-bold py-4.5 rounded-2xl shadow-lg shadow-indigo-500/20 transform active:scale-[0.98] transition-all disabled:opacity-50 text-base"
            >
              {loading ? 'جاري تهيئة خوادم الدفع الآمنة...' : 'توليد رابط الدفع السريع ⚡'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm text-center">
              {error}
            </div>
          )}

          {paymentUrl && (
            <div className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl space-y-4">
              <div className="text-center">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full">جاهز للإرسال 🚀</span>
                <p className="text-slate-300 text-sm mt-3">قم بنسخ هذا الرابط وأرسله لزبونك الأجنبي ليدفع لك فوراً بالفيزا:</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={paymentUrl}
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-indigo-300 select-all focus:outline-none"
                />
                <button 
                  onClick={() => { navigator.clipboard.writeText(paymentUrl); alert('تم نسخ رابط الدفع بنجاح!'); }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 rounded-xl text-xs transition-colors"
                >
                  نسخ
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-600 border-t border-slate-900/60">
        <p>© 2026 PayLink Platform. جميع المعاملات مشفرة ومؤمنة بالكامل.</p>
      </footer>
    </div>
  );
}
