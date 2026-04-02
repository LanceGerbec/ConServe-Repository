import { HelpCircle, Mail, Upload, Search, Shield, ChevronDown, BookOpen, FileText, MessageSquare, Lock, Bell, Users, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [imradOpen, setImradOpen] = useState(false);

  const quickLinks = [
    { icon: Upload, title: 'Submit Research', desc: 'Upload your paper', link: '/dashboard' },
    { icon: Search, title: 'Search Papers', desc: 'Find research quickly', link: '/explore' },
    { icon: Shield, title: 'Security', desc: 'Account protection', link: '#security' },
    { icon: FileText, title: 'IMRaD Guidelines', desc: 'Submission format rules', link: '#imrad' }
  ];

  const guides = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      steps: ['Register with valid Student/Faculty ID', 'Wait 24-48 hours for approval', 'Check email for approval notification', 'Login and explore repository']
    },
    {
      title: 'Submit Research',
      icon: Upload,
      steps: ['Prepare PDF in IMRaD format', 'Login to your dashboard', 'Click "Submit Research" button', 'Fill all required metadata', 'Upload PDF (max 10MB)', 'Review and submit for approval']
    },
    {
      title: 'Search Papers',
      icon: Search,
      steps: ['Use main search bar', 'Apply category filters', 'Try advanced search options', 'Bookmark favorite papers', 'Generate citations easily']
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
    { id: 'citations', name: 'Citations', icon: FileText },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  const faqs = [
    { q: 'How do I submit research?', a: 'Login → Dashboard → Submit Research → Upload IMRaD-format PDF (max 10MB) → Fill metadata → Review → Submit. Admin reviews in 24-48 hours.', category: 'getting-started' },
    { q: 'How long does approval take?', a: 'Account approval: 24-48 hours. Research paper approval: 24-48 hours after submission. You\'ll receive email notifications for both.', category: 'getting-started' },
    { q: 'What roles are available in CONserve?', a: 'Three roles exist: Student (submit & view papers), Faculty (submit, review, upload on behalf), and Admin (approve users, manage papers, full system access).', category: 'getting-started' },
    { q: 'Why was my account not approved?', a: 'Common reasons: Invalid Student/Faculty ID, incomplete registration, or duplicate account. Contact conserve2025@gmail.com with your ID proof for assistance.', category: 'getting-started' },
    { q: 'Can I change my account information?', a: 'Email conserve2025@gmail.com to request changes to your name, ID, or role. For password changes, use "Forgot Password" on the login page.', category: 'getting-started' },
    { q: 'What are valid Student/Faculty IDs?', a: 'Only pre-registered IDs work. If yours doesn\'t work, contact conserve2025@gmail.com with proof of enrollment/employment for manual verification.', category: 'getting-started' },
    { q: 'What is IMRaD format?', a: 'IMRaD stands for Introduction, Methods, Results, and Discussion. Your PDF must follow this academic structure for nursing research papers. See the IMRaD Guide section above for detailed requirements.', category: 'submission' },
    { q: 'Can I edit after submission?', a: 'Yes, before admin approval via your dashboard. After approval, email conserve2025@gmail.com to request changes with justification.', category: 'submission' },
    { q: 'What file format is required?', a: 'PDF only, max 10MB, in IMRaD format. No password protection. Must include title, abstract, authors, and keywords.', category: 'submission' },
    { q: 'What metadata is required for submission?', a: 'Required: Title, Authors, Abstract (100+ chars), Category, Subject Area, Year Completed. Optional: Co-authors, Keywords (3-8 recommended).', category: 'submission' },
    { q: 'Can I submit multiple papers at once?', a: 'No, submit one paper at a time. Each requires individual metadata entry and review.', category: 'submission' },
    { q: 'What happens if my paper is rejected?', a: 'You\'ll receive email with rejection reason and revision notes. You can edit metadata/PDF via Dashboard and resubmit for another review.', category: 'submission' },
    { q: 'Can I withdraw my submission?', a: 'Before approval: Contact conserve2025@gmail.com to withdraw. After approval: Papers cannot be withdrawn as they\'re published in the repository.', category: 'submission' },
    { q: 'What are the quality standards for papers?', a: 'Must follow IMRaD format, have clear title/abstract, proper citations, nursing relevance, and meet academic writing standards.', category: 'submission' },
    { q: 'What happens after approval?', a: 'Your paper is published in the repository, searchable by all users, and you receive email notification. Faculty can then provide optional reviews.', category: 'submission' },
    { q: 'Can I see my submission history?', a: 'Yes. Dashboard → "My Submissions" shows all your papers with status (pending/approved/rejected), view counts, and submission dates.', category: 'submission' },
    { q: 'How to use Advanced Search properly?', a: 'BOOLEAN: Use AND (both terms), OR (either term), NOT (exclude). FIELD SEARCH: title:therapy, author:Smith, year:2024, keyword:pain. PHRASES: "evidence-based practice" (exact match). SEMANTIC: Enable AI-powered relevance ranking.', category: 'search' },
    { q: 'What\'s the difference between Search and Browse?', a: 'SEARCH: Boolean operators, field-specific queries, semantic ranking for precise results. BROWSE: Simple filters by category/year/subject for casual discovery.', category: 'search' },
    { q: 'How does semantic search work?', a: 'AI analyzes the meaning of your query and ranks papers by conceptual relevance. Best for finding similar research even if exact terms differ. Toggle in Advanced Search.', category: 'search' },
    { q: 'Can I save my search queries?', a: 'Not currently. Write down complex queries or bookmark the browser tab. Feature may be added in future updates.', category: 'search' },
    { q: 'How do I find papers by topic?', a: 'Use Subject Area filter or search by keywords. Example: subject:Pediatric or keyword:diabetes. View "Similar Papers" section on any paper for related research.', category: 'search' },
    { q: 'Who can access papers?', a: 'All approved users can view abstracts and metadata. Full PDFs are viewable online with watermark protection (no downloads).', category: 'search' },
    { q: 'Why can\'t I download PDFs?', a: 'Papers have watermark protection to preserve intellectual property. View online only with your account info embedded in watermarks.', category: 'security' },
    { q: 'What triggers a violation warning?', a: 'Screenshot attempts (PrintScreen, Cmd+Shift+3/4, share dialogs), DevTools opening, or suspicious activity. 3 violations = viewer closes. All logged with your IP/email.', category: 'security' },
    { q: 'Can I print papers for personal use?', a: 'Printing is disabled to protect copyright. View online only. For legitimate academic use requiring prints, contact conserve2025@gmail.com with justification.', category: 'security' },
    { q: 'How long are viewing sessions?', a: '30 minutes per session. You\'ll see warnings at 5min, 2min, 1min remaining. Viewer closes automatically at 30min. Simply reopen to continue.', category: 'security' },
    { q: 'How secure is my research?', a: 'Papers have digital watermarks, no-download protection, print-blocking, and all access is logged with IP/user info. Screenshot attempts are blocked and reported.', category: 'security' },
    { q: 'What does "Upload on Behalf" mean?', a: 'Faculty and authorized users can submit papers for authors without accounts. The uploader is recorded separately from actual authors. Check the box during submission.', category: 'faculty' },
    { q: 'Are faculty reviews mandatory?', a: 'No. Faculty reviews are optional and advisory. Admin makes final approval decisions. Your feedback helps ensure quality but doesn\'t block publication.', category: 'faculty' },
    { q: 'How do I provide faculty feedback?', a: 'View any approved paper → "Submit Review" button → Rate (methodology, clarity, contribution, overall) → Add comments → Submit. Author gets notified automatically.', category: 'faculty' },
    { q: 'Why won\'t my PDF upload?', a: 'Check: File is PDF (not DOC/DOCX), under 10MB, not password-protected. Try different browser (Chrome/Edge recommended). Clear browser cache. Check internet connection.', category: 'technical' },
    { q: 'The PDF viewer isn\'t loading - help?', a: 'Use Chrome/Edge/Safari (latest version). Disable browser extensions (especially ad blockers). Clear cache. Check internet speed. Try incognito/private mode.', category: 'technical' },
    { q: 'I\'m getting logged out too quickly', a: '20-minute inactivity timeout for security. Activity = mouse move, click, keyboard. You\'ll see warnings at 5min, 2min, 1min. Stay active to maintain session.', category: 'technical' },
    { q: 'Can I use CONserve on mobile?', a: 'Yes! Fully optimized for mobile/tablet. PDF viewer has touch controls (pinch zoom, double-tap). All features work on iOS/Android browsers.', category: 'technical' },
    { q: 'How do I reset my password?', a: 'Click "Forgot Password" on login page → Enter your email → Check inbox for reset link (expires in 1 hour) → Create new password (12+ chars, uppercase, lowercase, number, symbol).', category: 'technical' },
    { q: 'How do I cite a paper?', a: 'View any paper → Click "Generate Citation" → Choose style (APA, MLA, Chicago, Harvard) → Copy to clipboard. Auto-formatted with all metadata.', category: 'citations' },
    { q: 'How accurate are auto-generated citations?', a: 'Highly accurate based on metadata. However, always verify format against your institution\'s style guide before submission.', category: 'citations' },
    { q: 'Can I export citations to reference managers?', a: 'Currently copy/paste only. Future updates may support Zotero/Mendeley/EndNote export.', category: 'citations' },
    { q: 'How do I manage my notifications?', a: 'Click bell icon (top right) → Mark individual as read → "Mark All Read" for bulk → Delete individual notifications → "Clear Read" to remove all read notifications.', category: 'notifications' },
    { q: 'Why didn\'t I receive an email notification?', a: 'Check spam/junk folder. Verify email in your profile. Whitelist conserve2025@gmail.com. Emails sent for: account approval, paper status, faculty reviews.', category: 'notifications' },
    { q: 'Can I turn off certain notification types?', a: 'Not currently. All critical notifications (approvals, reviews, system updates) are enabled by default.', category: 'notifications' },
    { q: 'How do notifications work?', a: 'Bell icon (top right) shows real-time alerts for: account approval, paper status, faculty reviews, system updates. Email notifications sent simultaneously.', category: 'notifications' }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' ||
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-navy dark:bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <HelpCircle size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Help Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Find answers and learn how to use CONserve</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickLinks.map((link, i) => (
          <a key={i} href={link.link} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition group text-center">
            <div className="w-10 h-10 bg-navy/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition">
              <link.icon className="text-navy dark:text-blue-400" size={20} />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{link.title}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">{link.desc}</p>
          </a>
        ))}
      </div>

      {/* ─── IMRaD Guide ─── */}
      <div id="imrad" className="mb-8 scroll-mt-24">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-amber-300 dark:border-amber-700 overflow-hidden">
          <button
            onClick={() => setImradOpen(!imradOpen)}
            className="w-full flex items-center gap-4 p-5 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition text-left"
          >
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <FileText size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">IMRaD Format Requirements</h2>
              <p className="text-sm text-amber-600 dark:text-amber-400">Required format for all paper submissions — click to expand</p>
            </div>
            <ChevronDown
              className={`text-amber-500 transition-transform flex-shrink-0 ${imradOpen ? 'rotate-180' : ''}`}
              size={22}
            />
          </button>

          {imradOpen && (
            <div className="border-t border-amber-200 dark:border-amber-800 px-5 pb-5 pt-4 space-y-4 animate-slide-up">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded-lg flex items-start gap-2">
                <AlertTriangle size={15} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Papers not following IMRaD format may be <strong>rejected</strong> during review. Please ensure your paper complies before submitting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Format */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-500 rounded text-white text-xs flex items-center justify-center font-black">F</span>
                    Format Technicalities
                  </h3>
                  <ul className="space-y-2">
                    {[
                      ['Font', 'Times New Roman, Size 12'],
                      ['Spacing', 'Single Spacing, Justified'],
                      ['Margins', '1" all sides'],
                      ['Main Headings', 'Capitalized, bold, left-justified, double-spaced above/below — no colon'],
                      ['Subheadings', 'Capitalized, bold italics OR underlined'],
                      ['Citation', 'Author-date system (in-text)'],
                      ['Pagination', 'Bottom of page, right side'],
                      ['Tables / Figures', 'Recommended: 5 each'],
                      ['Page Count', '15–25 pages (excluding appendices)'],
                    ].map(([label, value], i) => (
                      <li key={i} className="text-xs">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{label}: </span>
                        <span className="text-gray-600 dark:text-gray-400">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sections */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-black">S</span>
                    Required Sections
                  </h3>
                  <ul className="space-y-2">
                    {[
                      ['Title', 'Centered, capitals, bold, 8–15 words'],
                      ['Author/s', 'Based on contribution'],
                      ['Abstract', '250–300 words'],
                      ['Keywords', '≤5 words, italicized'],
                      ['Introduction', '1,500–3,000 words'],
                      ['Materials & Method / Methodology', '500–1,000 words'],
                      ['Results and Discussion', '1,500–3,000 words'],
                      ['Conclusion & Recommendations', '250–500 words'],
                      ['References', 'APA format/style'],
                    ].map(([section, detail], i) => (
                      <li key={i} className="text-xs">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{section}: </span>
                        <span className="text-gray-600 dark:text-gray-400">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1">
                A reminder of these requirements will also appear each time you click Submit Research.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* ─── End IMRaD Guide ─── */}

      {/* Quick Guides */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guides.map((guide, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-navy dark:bg-blue-600 rounded-lg flex items-center justify-center">
                  <guide.icon className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{guide.title}</h3>
              </div>
              <ol className="space-y-2">
                {guide.steps.map((step, j) => (
                  <li key={j} className="flex items-start text-sm">
                    <span className="flex items-center justify-center w-5 h-5 bg-navy dark:bg-blue-600 text-white rounded-full text-xs font-bold mr-2 flex-shrink-0 mt-0.5">{j + 1}</span>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All FAQs</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{filteredFaqs.length} results</span>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">×</button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition text-sm ${
                activeCategory === cat.id
                  ? 'bg-navy dark:bg-blue-600 text-white shadow-lg'
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
            <MessageSquare size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">No FAQs match "{searchTerm}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`text-navy dark:text-blue-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} size={18} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-gray-700 dark:text-gray-300 text-sm animate-slide-up border-t border-gray-100 dark:border-gray-700 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-r from-navy to-accent dark:from-blue-700 dark:to-blue-900 text-white rounded-xl p-6 text-center shadow-lg">
        <Mail size={40} className="mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Still Need Help?</h2>
        <p className="mb-5 text-blue-100 dark:text-blue-200">Our support team is ready to assist</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="mailto:conserve2025@gmail.com" className="inline-block bg-white text-navy dark:text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">Email Support</a>
          <a href="tel:+639123456789" className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-bold hover:bg-white/30 transition">Call Us</a>
        </div>
        <p className="mt-4 text-sm text-blue-100 dark:text-blue-200">Response time: Within 24 hours</p>
      </div>
    </div>
  );
};

export default Help;