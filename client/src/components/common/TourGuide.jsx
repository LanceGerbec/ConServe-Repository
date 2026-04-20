// client/src/components/common/TourGuide.jsx
import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, BookOpen, LayoutDashboard, Search, Bell, HelpCircle, Upload, Bookmark, Award, Shield } from 'lucide-react';

const TOURS = {
  student: [
    { title: 'Welcome to CONserve!', desc: 'This quick tour will show you how to navigate the platform. You can restart it anytime from the Help button in the header.', icon: BookOpen, target: null, placement: 'center' },
    { title: 'Navigation Bar', desc: 'Use the top nav to access Home, Explore papers, About, Help, and your Dashboard.', icon: LayoutDashboard, target: '[data-tour="nav"]', placement: 'bottom' },
    { title: 'Explore Research', desc: 'Browse and search thousands of nursing research papers. Filter by subject area, year, category, and more.', icon: Search, target: '[data-tour="explore-link"]', placement: 'bottom' },
    { title: 'Your Dashboard', desc: 'Track your submissions, view bookmarked papers, and monitor your activity all in one place.', icon: LayoutDashboard, target: '[data-tour="dashboard-link"]', placement: 'bottom' },
    { title: 'Submit Research', desc: 'Have a paper to share? Use the Submit Research button in your dashboard or homepage. Papers follow IMRaD format and require admin approval.', icon: Upload, target: null, placement: 'center' },
    { title: 'Bookmarks', desc: 'Save papers you love by clicking the Bookmark icon on any research paper. Access them anytime from your Dashboard.', icon: Bookmark, target: null, placement: 'center' },
    { title: 'Notifications', desc: 'The bell icon shows updates on your submissions, approvals, and reviews.', icon: Bell, target: '[data-tour="notif-bell"]', placement: 'bottom' },
    { title: "You're all set!", desc: "Start by exploring research papers or submitting your own. Click Help anytime to restart this tour.", icon: BookOpen, target: null, placement: 'center' },
  ],
  faculty: [
    { title: 'Welcome, Faculty!', desc: "This tour will walk you through the key features available to you as a faculty member.", icon: BookOpen, target: null, placement: 'center' },
    { title: 'Navigation Bar', desc: 'Access all sections from the top navigation bar including Home, Explore, Dashboard, and Notifications.', icon: LayoutDashboard, target: '[data-tour="nav"]', placement: 'bottom' },
    { title: 'Explore & Review', desc: 'Browse approved papers. As faculty, you can also submit advisory reviews on any approved paper.', icon: Search, target: '[data-tour="explore-link"]', placement: 'bottom' },
    { title: 'Faculty Dashboard', desc: 'Your dashboard shows papers pending review, your submitted reviews, your own research submissions, and bookmarks.', icon: LayoutDashboard, target: '[data-tour="dashboard-link"]', placement: 'bottom' },
    { title: 'Submit on Behalf', desc: 'You can upload research papers on behalf of students or authors who lack accounts.', icon: Upload, target: null, placement: 'center' },
    { title: 'Notifications', desc: 'Get notified when papers are approved, when you receive review requests, and more.', icon: Bell, target: '[data-tour="notif-bell"]', placement: 'bottom' },
    { title: "You're ready!", desc: "Explore the repository and share your expertise through faculty reviews.", icon: Award, target: null, placement: 'center' },
  ],
  admin: [
    { title: 'Admin Overview', desc: "Welcome to the Admin Dashboard. This tour covers key administrative features.", icon: Shield, target: null, placement: 'center' },
    { title: 'Navigation Bar', desc: 'Access all sections from the top navigation including your admin-specific controls.', icon: LayoutDashboard, target: '[data-tour="nav"]', placement: 'bottom' },
    { title: 'Admin Dashboard', desc: 'Approve users, review submitted papers, manage valid IDs, view analytics, and configure settings — all here.', icon: LayoutDashboard, target: '[data-tour="dashboard-link"]', placement: 'bottom' },
    { title: 'Notifications', desc: 'Admins receive real-time alerts for new registrations, paper submissions, and security violations.', icon: Bell, target: '[data-tour="notif-bell"]', placement: 'bottom' },
    { title: "You're all set!", desc: "Manage the platform from your Dashboard. Use Settings to configure logos, banners, and system features.", icon: Shield, target: null, placement: 'center' },
  ],
};

const GUEST_TOUR = [
  { title: 'Welcome to CONserve!', desc: 'CONserve is the official research repository of NEUST College of Nursing. Discover peer-reviewed nursing research.', icon: BookOpen, target: null, placement: 'center' },
  { title: 'Navigation Bar', desc: 'Use the top navigation to explore research, learn about us, or get help.', icon: LayoutDashboard, target: '[data-tour="nav"]', placement: 'bottom' },
  { title: 'Explore Research', desc: 'Browse and search research papers. Sign in or register to access full content and submit your own work.', icon: Search, target: '[data-tour="explore-link"]', placement: 'bottom' },
  { title: 'Register or Login', desc: 'Create an account to submit papers, bookmark research, and get personalized recommendations. Your student/faculty ID is required.', icon: BookOpen, target: null, placement: 'center' },
];

const Overlay = ({ targetRect, onClose }) => {
  if (!targetRect) return <div className="fixed inset-0 bg-black/50 z-[1000]" onClick={onClose} />;
  const pad = 6;
  return (
    <div className="fixed inset-0 z-[1000]" onClick={onClose}>
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - pad}
              y={targetRect.top - pad}
              width={targetRect.width + pad * 2}
              height={targetRect.height + pad * 2}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#tour-mask)" />
      </svg>
    </div>
  );
};

const TourGuide = ({ isOpen, onClose, role }) => {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' });
  const tooltipRef = useRef(null);

  const steps = role ? (TOURS[role] || TOURS.student) : GUEST_TOUR;
  const current = steps[step];

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !current) return;
    if (!current.target) {
      setTargetRect(null);
      setTooltipPos({ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', position: 'fixed' });
      return;
    }
    const el = document.querySelector(current.target);
    if (!el) {
      setTargetRect(null);
      setTooltipPos({ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', position: 'fixed' });
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      const tw = tooltipRef.current?.offsetWidth || 320;
      const th = tooltipRef.current?.offsetHeight || 160;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let top, left;
      if (current.placement === 'bottom') {
        top = rect.bottom + 12;
        left = rect.left + rect.width / 2 - tw / 2;
        if (top + th > vh - 20) top = rect.top - th - 12;
      } else {
        top = rect.top - th - 12;
        left = rect.left + rect.width / 2 - tw / 2;
        if (top < 20) top = rect.bottom + 12;
      }
      left = Math.max(12, Math.min(left, vw - tw - 12));
      top = Math.max(12, Math.min(top, vh - th - 12));
      setTooltipPos({ top, left, position: 'fixed' });
    }, 400);
  }, [step, isOpen, current]);

  if (!isOpen) return null;

  const Icon = current.icon;
  const isCenter = !current.target;
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  const tooltipStyle = isCenter
    ? { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1002, width: '90%', maxWidth: 380 }
    : { ...tooltipPos, zIndex: 1002, width: '90%', maxWidth: 360 };

  return (
    <>
      <Overlay targetRect={targetRect} onClose={onClose} />
      {targetRect && (
        <div
          className="fixed z-[1001] border-2 border-blue-400 rounded-xl pointer-events-none"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: '0 0 0 4px rgba(96,165,250,0.3)',
            transition: 'all 0.3s ease',
          }}
        />
      )}
      <div ref={tooltipRef} style={tooltipStyle} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <div className="h-full bg-gradient-to-r from-navy to-accent transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-navy/10 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-navy dark:text-accent" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{step + 1} / {steps.length}</p>
                <h3 className="font-black text-gray-900 dark:text-white text-sm leading-tight">{current.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex-shrink-0 ml-2">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{current.desc}</p>
          {/* Dots */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <button key={i} onClick={() => setStep(i)} className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-navy dark:bg-accent' : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'}`} />
              ))}
            </div>
            <div className="flex gap-2">
              {!isFirst && (
                <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <ChevronLeft size={14} />Back
                </button>
              )}
              {isLast ? (
                <button onClick={onClose} className="flex items-center gap-1 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition shadow">
                  Done!
                </button>
              ) : (
                <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-1 px-4 py-1.5 bg-navy dark:bg-blue-600 hover:opacity-90 text-white rounded-xl font-bold text-xs transition shadow">
                  Next<ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourGuide;