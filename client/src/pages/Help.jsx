import { HelpCircle, Mail, Upload, Search, Shield, ChevronDown, BookOpen, FileText, MessageSquare, Award, Lock, Bell, Users } from 'lucide-react';
import { useState } from 'react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const quickLinks = [
    { icon: Upload, title: 'Submit Research', desc: 'Upload your paper', link: '/dashboard' },
    { icon: Search, title: 'Search Papers', desc: 'Find research quickly', link: '/explore' },
    { icon: Shield, title: 'Security', desc: 'Account protection', link: '#security' },
    { icon: FileText, title: 'Guidelines', desc: 'Submission rules', link: '#guidelines' }
  ];

  const guides = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      steps: [
        'Register with valid Student/Faculty ID',
        'Wait 24-48 hours for approval',
        'Check email for approval notification',
        'Login and explore repository'
      ]
    },
    {
      title: 'Submit Research',
      icon: Upload,
      steps: [
        'Prepare PDF in IMRaD format',
        'Login to your dashboard',
        'Click "Submit Research" button',
        'Fill all required metadata',
        'Upload PDF (max 10MB)',
        'Review and submit for approval'
      ]
    },
    {
      title: 'Search Papers',
      icon: Search,
      steps: [
        'Use main search bar',
        'Apply category filters',
        'Try advanced search options',
        'Bookmark favorite papers',
        'Generate citations easily'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All FAQs', icon: MessageSquare },
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen },
    { id: 'submission', name: 'Research Submission', icon: Upload },
    { id: 'search', name: 'Searching & Discovery', icon: Search },
    { id: 'security', name: 'Security & Protection', icon: Shield },
    { id: 'faculty', name: 'Faculty Features', icon: Users },
    { id: 'technical', name: 'Technical Issues', icon: FileText },
    { id: 'citations', name: 'Citations', icon: Award },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  const faqs = [
    // Getting Started
    { q: 'How do I submit research?', a: 'Login → Dashboard → Submit Research → Upload IMRaD-format PDF (max 10MB) → Fill metadata (title, authors, keywords, etc.) → Review → Submit. Admin reviews in 24-48 hours.', tags: ['submit', 'upload', 'research', 'pdf'], category: 'getting-started', popular: true },
    { q: 'How long does approval take?', a: 'Account approval: 24-48 hours. Research paper approval: 24-48 hours after submission. You\'ll receive email notifications for both.', tags: ['approval', 'time', 'review', 'wait'], category: 'getting-started', popular: true },
    { q: 'What roles are available in CONserve?', a: 'Three roles exist: Student (submit & view papers), Faculty (submit, review, upload on behalf), and Admin (approve users, manage papers, full system access).', tags: ['roles', 'permissions', 'access'], category: 'getting-started' },
    { q: 'Why was my account not approved?', a: 'Common reasons: Invalid Student/Faculty ID, incomplete registration, or duplicate account. Contact conserve2025@gmail.com with your ID proof for assistance.', tags: ['approval', 'rejected', 'denied'], category: 'getting-started' },
    { q: 'Can I change my account information?', a: 'Email conserve2025@gmail.com to request changes to your name, ID, or role. For password changes, use "Forgot Password" on the login page.', tags: ['profile', 'update', 'change'], category: 'getting-started' },

    // Research Submission
    { q: 'What is IMRaD format?', a: 'IMRaD stands for Introduction, Methods, Results, and Discussion. Your PDF must follow this academic structure for nursing research papers.', tags: ['imrad', 'format', 'structure', 'pdf'], category: 'submission', popular: true },
    { q: 'Can I edit after submission?', a: 'Yes, before admin approval via your dashboard. After approval, email conserve2025@gmail.com to request changes with justification.', tags: ['edit', 'modify', 'change', 'update'], category: 'submission' },
    { q: 'What file format is required?', a: 'PDF only, max 10MB, in IMRaD format. No password protection. Must include title, abstract, authors, and keywords.', tags: ['format', 'pdf', 'file', 'size'], category: 'submission', popular: true },
    { q: 'What metadata is required for submission?', a: 'Required: Title, Authors, Abstract (100+ chars), Category, Subject Area, Year Completed. Optional: Co-authors, Keywords (3-8 recommended).', tags: ['metadata', 'required', 'fields'], category: 'submission' },
    { q: 'Can I submit multiple papers at once?', a: 'No, submit one paper at a time. Each requires individual metadata entry and review. You can submit your next paper immediately after the first.', tags: ['multiple', 'bulk', 'batch'], category: 'submission' },
    { q: 'What happens if my paper is rejected?', a: 'You\'ll receive email with rejection reason and revision notes. You can edit metadata/PDF via Dashboard and resubmit for another review.', tags: ['rejected', 'revision', 'resubmit'], category: 'submission' },
    { q: 'Can I withdraw my submission?', a: 'Before approval: Contact conserve2025@gmail.com to withdraw. After approval: Papers cannot be withdrawn as they\'re published in the repository.', tags: ['withdraw', 'remove', 'delete'], category: 'submission' },
    { q: 'What are the quality standards for papers?', a: 'Must follow IMRaD format, have clear title/abstract, proper citations, nursing relevance, and meet academic writing standards. Admin reviews for quality.', tags: ['quality', 'standards', 'requirements'], category: 'submission' },

    // Searching & Discovery
    { q: 'How to use Advanced Search properly?', a: 'BOOLEAN: Use AND (both terms), OR (either term), NOT (exclude). FIELD SEARCH: title:therapy, author:Smith, year:2024, keyword:pain, subject:Pediatric. PHRASES: "evidence-based practice" (exact match). COMBINE: title:"pain management" AND author:Garcia. SEMANTIC: Enable AI-powered relevance ranking for conceptual matches. FILTERS: Category, year, subject, author dropdowns. EXAMPLE: (diabetes OR hypertension) AND management NOT medication', tags: ['advanced', 'search', 'boolean', 'operators'], category: 'search', popular: true },
    { q: 'What\'s the difference between Search and Browse?', a: 'SEARCH (Advanced): Boolean operators, field-specific queries, semantic ranking for precise results. BROWSE (Explore): Simple filters by category/year/subject for casual discovery. Use Search for specific research, Browse for exploration.', tags: ['search', 'browse', 'difference'], category: 'search', popular: true },
    { q: 'How does semantic search work?', a: 'AI analyzes the meaning of your query (not just keywords) and ranks papers by conceptual relevance. Best for finding similar research even if exact terms differ. Toggle in Advanced Search.', tags: ['semantic', 'ai', 'relevance'], category: 'search' },
    { q: 'Can I save my search queries?', a: 'Not currently. Write down complex queries or bookmark the browser tab. Feature may be added in future updates.', tags: ['save', 'bookmark', 'queries'], category: 'search' },
    { q: 'How do I find papers by topic?', a: 'Use Subject Area filter (Browse/Search) or search by keywords. Example: subject:Pediatric or keyword:diabetes. View "Similar Papers" section on any paper for related research.', tags: ['topic', 'subject', 'filter'], category: 'search' },
    { q: 'Who can access papers?', a: 'All approved users can view abstracts and metadata. Full PDFs are viewable online with watermark protection (no downloads).', tags: ['access', 'view', 'permission', 'watermark'], category: 'search' },

    // Security & Protection
    { q: 'Why can\'t I download PDFs?', a: 'Papers have watermark protection to preserve intellectual property. View online only with your account info embedded in watermarks.', tags: ['download', 'save', 'watermark', 'pdf'], category: 'security', popular: true },
    { q: 'What triggers a violation warning?', a: 'Screenshot attempts (PrintScreen, Cmd+Shift+3/4, share dialogs), DevTools opening, or suspicious activity. 3 violations = viewer closes. All logged with your IP/email.', tags: ['violation', 'screenshot', 'warning'], category: 'security' },
    { q: 'Can I print papers for personal use?', a: 'Printing is disabled to protect copyright. View online only. For legitimate academic use requiring prints, contact conserve2025@gmail.com with justification.', tags: ['print', 'copyright', 'protection'], category: 'security' },
    { q: 'How long are viewing sessions?', a: '30 minutes per session. You\'ll see warnings at 5min, 2min, 1min remaining. Viewer closes automatically at 30min. Simply reopen to continue.', tags: ['session', 'timeout', 'limit'], category: 'security' },
    { q: 'How secure is my research?', a: 'Papers have digital watermarks, no-download protection, print-blocking, and all access is logged with IP/user info. Screenshot attempts are blocked and reported.', tags: ['security', 'protection', 'watermark', 'ip'], category: 'security' },

    // Faculty Features
    { q: 'What does "Upload on Behalf" mean?', a: 'Faculty and authorized users can submit papers for authors without accounts. The uploader is recorded separately from actual authors. Check the box during submission.', tags: ['upload', 'behalf', 'faculty', 'author'], category: 'faculty', popular: true },
    { q: 'Are faculty reviews mandatory?', a: 'No. Faculty reviews are optional and advisory. Admin makes final approval decisions. Your feedback helps ensure quality but doesn\'t block publication.', tags: ['faculty', 'review', 'optional'], category: 'faculty' },
    { q: 'How do I provide faculty feedback?', a: 'View any approved paper → "Submit Review" button → Rate (methodology, clarity, contribution, overall) → Add comments → Submit. Author gets notified automatically.', tags: ['feedback', 'review', 'faculty'], category: 'faculty' },

    // Technical Issues
    { q: 'Why won\'t my PDF upload?', a: 'Check: File is PDF (not DOC/DOCX), under 10MB, not password-protected. Try different browser (Chrome/Edge recommended). Clear browser cache. Check internet connection.', tags: ['upload', 'error', 'pdf', 'fail'], category: 'technical', popular: true },
    { q: 'The PDF viewer isn\'t loading - help?', a: 'Use Chrome/Edge/Safari (latest version). Disable browser extensions (especially ad blockers). Clear cache. Check internet speed. Try incognito/private mode.', tags: ['viewer', 'loading', 'error', 'pdf'], category: 'technical' },
    { q: 'I\'m getting logged out too quickly', a: '20-minute inactivity timeout for security. Activity = mouse move, click, keyboard. You\'ll see warnings at 5min, 2min, 1min. Stay active to maintain session.', tags: ['logout', 'timeout', 'session'], category: 'technical' },
    { q: 'Can I use CONserve on mobile?', a: 'Yes! Fully optimized for mobile/tablet. PDF viewer has touch controls (pinch zoom, double-tap). All features work on iOS/Android browsers.', tags: ['mobile', 'phone', 'tablet', 'responsive'], category: 'technical' },
    { q: 'How do I reset my password?', a: 'Click "Forgot Password" on login page → Enter your email → Check inbox for reset link (expires in 1 hour) → Create new password (12+ chars, uppercase, lowercase, number, symbol).', tags: ['password', 'reset', 'login', 'forgot'], category: 'technical' },

    // Citations & References
    { q: 'How do I cite a paper?', a: 'View any paper → Click "Generate Citation" → Choose style (APA, MLA, Chicago, Harvard) → Copy to clipboard. Auto-formatted with all metadata.', tags: ['cite', 'citation', 'reference', 'apa', 'mla'], category: 'citations', popular: true },
    { q: 'How accurate are auto-generated citations?', a: 'Highly accurate based on metadata. However, always verify format against your institution\'s style guide. We recommend double-checking before submission.', tags: ['accuracy', 'citation', 'verify'], category: 'citations' },
    { q: 'Can I export citations to reference managers?', a: 'Currently copy/paste only. Future updates may support Zotero/Mendeley/EndNote export. For now, use "Generate Citation" → Copy → Paste into your manager.', tags: ['export', 'citation', 'manager', 'zotero'], category: 'citations' },

    // Notifications
    { q: 'How do I manage my notifications?', a: 'Click bell icon (top right) → Mark individual as read → "Mark All Read" for bulk → Delete individual notifications → "Clear Read" to remove all read notifications.', tags: ['notifications', 'manage', 'bell'], category: 'notifications' },
    { q: 'Why didn\'t I receive an email notification?', a: 'Check spam/junk folder. Verify email in your profile. Whitelist conserve2025@gmail.com. Emails sent for: account approval, paper status, faculty reviews.', tags: ['email', 'missing', 'spam'], category: 'notifications' },
    { q: 'Can I turn off certain notification types?', a: 'Not currently. All critical notifications (approvals, reviews, system updates) are enabled by default. Feature customization may come in future updates.', tags: ['disable', 'turn off', 'notifications'], category: 'notifications' },
    
    // Additional
    { q: 'What are valid Student/Faculty IDs?', a: 'Only pre-registered IDs work. If yours doesn\'t work, contact conserve2025@gmail.com with proof of enrollment/employment for manual verification.', tags: ['id', 'student', 'faculty', 'registration'], category: 'getting-started' },
    { q: 'What happens after approval?', a: 'Your paper is published in the repository, searchable by all users, and you receive email notification. Faculty can then provide optional reviews.', tags: ['approved', 'published', 'notification'], category: 'submission' },
    { q: 'Can I see my submission history?', a: 'Yes. Dashboard → "My Submissions" shows all your papers with status (pending/approved/rejected), view counts, and submission dates.', tags: ['history', 'submissions', 'dashboard', 'status'], category: 'submission' },
    { q: 'How do notifications work?', a: 'Bell icon (top right) shows real-time alerts for: account approval, paper status, faculty reviews, system updates. Email notifications sent simultaneously.', tags: ['notifications', 'alerts', 'bell', 'email'], category: 'notifications' }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const popularFaqs = faqs.filter(f => f.popular);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-navy rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <HelpCircle size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Help Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Find answers and learn how to use CONserve</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickLinks.map((link, i) => (
          <a key={i} href={link.link}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition group text-center"
          >
            <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition">
              <link.icon className="text-navy" size={20} />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{link.title}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">{link.desc}</p>
          </a>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guides.map((guide, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
                  <guide.icon className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{guide.title}</h3>
              </div>
              <ol className="space-y-2">
                {guide.steps.map((step, j) => (
                  <li key={j} className="flex items-start text-sm">
                    <span className="flex items-center justify-center w-5 h-5 bg-navy text-white rounded-full text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                      {j + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* Popular FAQs */}
      {activeCategory === 'all' && searchTerm === '' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" size={24} />
            Most Popular Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularFaqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(faqs.indexOf(faq))}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 hover:shadow-md transition text-left"
              >
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{faq.q}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All FAQs</h2>
          <span className="text-sm text-gray-500">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition text-sm ${
                activeCategory === cat.id
                  ? 'bg-navy text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <cat.icon size={16} />
              {cat.name}
            </button>
          ))}
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">No FAQs match "{searchTerm}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => {
              const originalIndex = faqs.indexOf(faq);
              return (
                <div key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === originalIndex ? null : originalIndex)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition text-left"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {faq.popular && <Award size={16} className="text-yellow-500 flex-shrink-0" />}
                      <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                    </div>
                    <ChevronDown 
                      className={`text-navy transition-transform flex-shrink-0 ${openFaq === originalIndex ? 'rotate-180' : ''}`} 
                      size={18} 
                    />
                  </button>
                  {openFaq === originalIndex && (
                    <div className="px-5 pb-4 text-gray-700 dark:text-gray-300 text-sm animate-slide-up border-t border-gray-100 dark:border-gray-700 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-xl p-6 text-center shadow-lg">
        <Mail size={40} className="mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Still Need Help?</h2>
        <p className="mb-5 text-blue-100">Our support team is ready to assist</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href="mailto:conserve2025@gmail.com"
            className="inline-block bg-white text-navy px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Email Support
          </a>
          <a 
            href="tel:+639123456789"
            className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-bold hover:bg-white/30 transition"
          >
            Call Us
          </a>
        </div>
        <p className="mt-4 text-sm text-blue-100">Response time: Within 24 hours</p>
      </div>
    </div>
  );
};

export default Help;