import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, BookOpen, Zap, Shield } from 'lucide-react';

const OnboardingModal = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to CONserve! 👋",
      description: "Your research repository hub for NEUST College of Nursing",
      icon: BookOpen,
      features: [
        "Secure document storage with watermark protection",
        "Easy research submission and approval workflow",
        "Advanced search with filters",
        "Faculty review and feedback system"
      ]
    },
    {
      title: "Getting Started",
      icon: Zap,
      description: "Here's what you need to know",
      features: [
        "Browse approved research papers anytime",
        "Submit your own research for review",
        "Bookmark your favorite papers",
        "Track your submissions in the dashboard"
      ]
    },
    {
      title: "Security First 🔒",
      icon: Shield,
      description: "We protect your research",
      features: [
        "Dynamic watermarks on all documents",
        "No downloads or printing allowed",
        "Violation tracking and logging",
        "Session-based access control"
      ]
    },
    {
      title: "You're All Set! 🎉",
      icon: Check,
      description: "Ready to explore CONserve",
      features: [
        "Visit Dashboard to see your stats",
        "Browse Research to explore papers",
        "Check Help Center anytime you need guidance",
        "Look for tooltips (ℹ️) throughout the system"
      ]
    }
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-navy dark:border-accent">
        <div className="bg-gradient-to-r from-navy to-accent text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{current.title}</h2>
                <p className="text-blue-100 text-sm">{current.description}</p>
              </div>
            </div>
            <button onClick={onSkip} className="p-2 hover:bg-white/20 rounded-lg transition">
              <X size={20} />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            {steps.map((_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4 mb-6">
            {current.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => step > 0 ? setStep(step - 1) : onSkip()}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition font-semibold flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              {step === 0 ? 'Skip Tutorial' : 'Back'}
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-8 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 transition font-semibold flex items-center gap-2 shadow-lg"
              >
                Next
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold flex items-center gap-2 shadow-lg"
              >
                Get Started
                <Check size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;