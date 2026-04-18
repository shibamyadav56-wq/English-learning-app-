import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="p-6 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-3 bg-slate-100 text-slate-600 rounded-2xl active:scale-90 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
      </header>

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        <div className="bg-blue-50 p-8 rounded-[40px] border border-blue-100 flex flex-col items-center text-center">
           <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10">
              <FileText size={48} strokeWidth={2.5} />
           </div>
           <h2 className="text-2xl font-black text-blue-900 mb-2">App Usage Rules</h2>
           <p className="text-blue-700 font-medium opacity-80">Last updated: April 18, 2026</p>
        </div>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">1. Acceptance of Terms</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            By accessing or using LinguaMaster AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">2. User Accounts</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">3. Reward System</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            Diamonds and rewards earned within the app have no real-world monetary value and cannot be exchanged for cash or other offline goods. Any attempt to exploit or "cheat" the reward system may result in account suspension.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-900">4. Modifications</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            We reserve the right to modify or replace these terms at any time. Your continued use of the app after any changes signifies your acceptance of the new terms.
          </p>
        </section>
      </div>
    </div>
  );
}
