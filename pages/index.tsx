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
); }
