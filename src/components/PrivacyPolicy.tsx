import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="p-6 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-3 bg-slate-100 text-slate-600 rounded-2xl active:scale-90 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
      </header>

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 flex flex-col items-center text-center">
           <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
              <ShieldCheck size={48} strokeWidth={2.5} />
           </div>
           <h2 className="text-2xl font-black text-emerald-900 mb-2">We protect your data</h2>
           <p className="text-emerald-700 font-medium opacity-80">Last updated: April 18, 2026</p>
        </div>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">1. Information We Collect</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            We collect information you provide directly to us when you create an account, such as your email address and name. We also track your learning progress, including diamonds earned, exercises completed, and usage time.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">2. How We Use Information</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            We use the information to personalize your learning experience, maintain the global leaderboard, and provide the AI Homework Assistant functionality. Your email is used for authentication purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">3. Camera Access</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            The AI Homework Assistant requires camera access to scan and solve homework problems. We do not store these images permanently on our servers unless necessary for processing.
          </p>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-8 mt-12">
          <p className="text-slate-400 text-sm text-center">
            By using LinguaMaster AI, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>
      </div>
    </div>
  );
}
