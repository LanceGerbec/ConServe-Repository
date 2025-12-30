import { HelpCircle, Mail, Upload, Search, Shield, ChevronDown, BookOpen, FileText, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const quickLinks = [
    { icon: Upload, title: 'Submit Research', desc: 'Upload your paper', link: '/dashboard' },
    { icon: Search, title: 'Search Papers', desc: 'Find research quickly', link: '/browse' },
    { icon: Shield, title: 'Security', desc: 'Account protection', link: '#security' },
    { icon: FileText, title: 'Guidelines', desc: 'Submission rules', link: '#guidelines' }
  ];

  const guides = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      steps: [
        'Register with valid email',
        'Wait for admin approval',
        'Login with credentials',
        'Explore repository'
      ]
    },
    {
      title: 'Submit Research',
      icon: Upload,
      steps: [
        'Prepare IMRaD format PDF',
        'Go to dashboard',
        'Click "Submit Research"',
        'Fill metadata accurately',
        'Review and submit'
      ]
    },
    {
      title: 'Search Papers',
      icon: Search,
      steps: [
        'Use search bar',
        'Apply filters',
        'Use advanced search',
        'Save to favorites'
      ]
    }
  ];

  const faqs = [
    {
      q: 'How do I submit research?',
      a: 'Login → Dashboard → Submit Research → Upload IMRaD PDF → Fill metadata → Review → Submit. Admin approval takes 3-5 days.',
      tags: ['submit', 'upload', 'research']
    },
    {
      q: 'How long is approval?',
      a: 'Typically 3-5 business days. You\'ll get email notification once reviewed.',
      tags: ['approval', 'time', 'review']
    },
    {
      q: 'Can I edit after upload?',
      a: 'Yes, before admin approval. After approval, email conserve@neust.edu.ph to request changes.',
      tags: ['edit', 'modify', 'change']
    },
    {
      q: 'What file format?',
      a: 'PDF in IMRaD format. Max 10MB. No password protection.',
      tags: ['format', 'pdf', 'file']
    },
    {
      q: 'Who can access papers?',
      a: 'All logged-in users can view abstracts. Full papers require approved account.',
      tags: ['access', 'view', 'permission']
    },
    {
      q: 'How to reset password?',
      a: 'Click "Forgot Password" on login → Enter email → Follow link (expires in 1 hour).',
      tags: ['password', 'reset', 'login']
    },
    {
      q: 'Can I download papers?',
      a: 'No direct downloads. View online with watermark protection.',
      tags: ['download', 'save', 'watermark']
    },
    {
      q: 'How to cite?',
      a: 'Click "Cite" button on any paper → Choose style (APA, MLA, Chicago, Harvard) → Copy.',
      tags: ['cite', 'citation', 'reference']
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    searchTerm === '' || 
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.tags.some(tag => tag.includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-navy rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <HelpCircle size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Help Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Find answers and learn how to use ConServe</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickLinks.map((link, i) => (
          
          <a  key={i}
          href={link.link}
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

      {/* Step-by-Step Guides */}
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

      {/* FAQs with Search */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">FAQs</h2>
          <span className="text-sm text-gray-500">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {/* Search */}
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
              <ChevronDown size={18} className="rotate-45" />
            </button>
          )}
        </div>

        {/* FAQ List */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">No FAQs match "{searchTerm}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div 
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  <ChevronDown 
                    className={`text-navy transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} 
                    size={18} 
                  />
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

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-xl p-6 text-center shadow-lg">
        <Mail size={40} className="mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Still Need Help?</h2>
        <p className="mb-5 text-blue-100">Our support team is ready to assist</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href="mailto:conserve@neust.edu.ph"
            className="inline-block bg-white text-navy px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Email Support
          </a>
          <a 
            href="tel:+631234567890"
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