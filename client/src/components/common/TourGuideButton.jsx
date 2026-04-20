import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import OnboardingModal from '../onboarding/OnboardingModal';
import { useAuth } from '../../context/AuthContext';

export default function TourGuideButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Tooltip */}
      {showTip && !open && (
        <div className="fixed bottom-20 right-5 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-40 whitespace-nowrap animate-fade-in">
          Take the tour guide
          <div className="absolute bottom-[-4px] right-5 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 bg-navy dark:bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
        aria-label="Open tour guide"
      >
        <HelpCircle size={22} />
      </button>

      {open && (
        <OnboardingModal
          onComplete={() => setOpen(false)}
          onSkip={() => setOpen(false)}
        />
      )}
    </>
  );
}