import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, BookOpen, Zap, Shield, Search, BarChart3, FileText, Users, Star, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STEPS_BASE = [
  {
    title: "Welcome to CONserve",
    desc: "Your research repository for NEUST College of Nursing",
    icon: BookOpen,
    color: "from-navy to-blue-600",
    features: [
      "Browse peer-reviewed nursing research papers",
      "Submit your own research for admin review",
      "Bookmark & cite papers with one click",
      "Secure IP protection under RA 10173"
    ]
  },
  {
    title: "Exploring Research",
    desc: "Find papers quickly with powerful search tools",
    icon: Search,
    color: "from-purple-600 to-indigo-600",
    features: [
      "Use Simple Search for quick keyword lookups",
      "Advanced/Boolean search: diabetes AND management",
      "Filter by subject area, year, category, or author",
      "Enable AI Semantic Search for concept-based results",
      "Click subject area pills to instantly filter papers"
    ]
  },
  {
    title: "Engaging with Papers",
    desc: "Interact with research you find valuable",
    icon: Star,
    color: "from-rose-500 to-pink-600",
    features: [
      "Like papers to show appreciation",
      "Bookmark papers to save for later access",
      "Copy citations in APA, MLA, Chicago, or Harvard",
      "View protected PDFs — watermarked for security",
      "Share and explore similar papers"
    ]
  },
  {
    title: "Document Security",
    desc: "How CONserve protects research integrity",
    icon: Shield,
    color: "from-orange-500 to-red-500",
    features: [
      "All PDFs are watermarked with your identity",
      "Screenshots, printing & copying are disabled",
      "All access and violations are logged",
      "Documents protected under RA 10173",
      "Session-based access control enforced"
    ]
  }
];

const FACULTY_STEP = {
  title: "Faculty Features",
  desc: "Your tools for reviewing and mentoring",
  icon: Users,
  color: "from-teal-500 to-cyan-600",
  features: [
    "Review approved papers and provide structured feedback",
    "Rate papers on Methodology, Clarity & Contribution",
    "Your reviews notify authors automatically via email",
    "Access the Faculty Review queue from your dashboard",
    "Upload research on behalf of authors without accounts"
  ]
};

const ADMIN_STEP = {
  title: "Admin Controls",
  desc: "Manage users, content and the platform",
  icon: BarChart3,
  color: "from-gray-700 to-gray-900",
  features: [
    "Approve or reject user registrations & papers",
    "Manage valid Student and Faculty ID lists",
    "View real-time analytics, login trends & reports",
    "Add awards to outstanding research papers",
    "Manage team members, logos, banners & site settings"
  ]
};

const STUDENT_SUBMIT_STEP = {
  title: "Submitting Research",
  desc: "Share your work with the CONserve community",
  icon: FileText,
  color: "from-green-500 to-emerald-600",
  features: [
    "Submit IMRaD-formatted PDF research papers",
    "Fill in title, authors, abstract, and keywords",
    "Track your submission status in the dashboard",
    "Revise and resubmit if revision is requested",
    "Get notified by email when your paper is reviewed"
  ]
};

const FINAL_STEP = {
  title: "You're All Set!",
  desc: "Start exploring CONserve now",
  icon: Zap,
  color: "from-yellow-500 to-amber-500",
  features: [
    "Visit Dashboard to track your activity & stats",
    "Browse Explore to discover research papers",
    "Check Help Center (?) button anytime for this guide",
    "Look for tooltips (ℹ️) throughout the system",
    "Contact conserve2025@gmail.com for support"
  ]
};

export default function OnboardingModal({ onComplete, onSkip }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  const steps = (() => {
    const base = [...STEPS_BASE];
    if (user?.role === 'faculty') base.splice(2, 0, FACULTY_STEP);
    else if (user?.role === 'admin') base.splice(2, 0, ADMIN_STEP);
    else base.splice(2, 0, STUDENT_SUBMIT_STEP);
    base.push(FINAL_STEP);
    return base;
  })();

  const cur = steps[step];
  const Icon = cur.icon;
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  useEffect(() => { setStep(0); }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in">

        {/* Header */}
        <div className={`bg-gradient-to-r ${cur.color} text-white p-6 relative transition-all duration-500`}>
          <button onClick={onSkip} className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition" title="Close tour">
            <X size={18} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{cur.title}</h2>
              <p className="text-white/80 text-sm">{cur.desc}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-right text-xs text-white/60 mt-1">{step + 1} / {steps.length}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            {cur.features.map((f, i) => (
              <li key={i} className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{f}</p>
              </li>
            ))}
          </ul>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {steps.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-navy dark:bg-accent' : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : onSkip()}
              className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition font-semibold flex items-center gap-1.5 text-sm"
            >
              <ChevronLeft size={16} />
              {step === 0 ? 'Close' : 'Back'}
            </button>

            {isLast ? (
              <button onClick={onComplete}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center gap-2 text-sm shadow-md transition">
                <Check size={16} /> Get Started
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)}
                className="px-6 py-2.5 bg-navy dark:bg-blue-600 hover:bg-navy-800 dark:hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 text-sm shadow-md transition">
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}