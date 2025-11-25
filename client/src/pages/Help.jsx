import { HelpCircle, Mail, FileText, BookOpen, Upload, Search, Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const quickLinks = [
    { icon: Upload, title: 'How to Submit', desc: 'Learn how to upload your research', link: '#submit' },
    { icon: Search, title: 'Search Papers', desc: 'Find research quickly', link: '#search' },
    { icon: Shield, title: 'Account Security', desc: 'Protect your account', link: '#security' },
    { icon: FileText, title: 'Guidelines', desc: 'Submission requirements', link: '#guidelines' }
  ];

  const faqs = [
    {
      q: 'How do I submit a research paper?',
      a: 'To submit a research paper: 1) Log in to your account, 2) Navigate to your dashboard, 3) Click "Submit Research", 4) Follow the guided wizard to upload your IMRaD format PDF, 5) Fill in all required metadata (title, authors, abstract, keywords), 6) Review and submit. Your submission will be sent to the admin for approval.'
    },
    {
      q: 'How long does the approval process take?',
      a: 'The approval process typically takes 3-5 business days. You will receive an email notification once your submission has been reviewed. If revisions are needed, you\'ll receive specific feedback from the reviewer.'
    },
    {
      q: 'Can I edit my submission after uploading?',
      a: 'Yes, you can edit your submission before admin approval. Once your submission is approved and published, you cannot make direct changes. However, you can contact the administrator at conserve@neust.edu.ph to request modifications with a valid reason.'
    },
    {
      q: 'What file format should I use?',
      a: 'All research papers must be submitted in PDF format following the IMRaD structure (Introduction, Methods, Results, and Discussion). The maximum file size is 10MB. Ensure your PDF is not password-protected.'
    },
    {
      q: 'Who can access the research papers?',
      a: 'Only authenticated NEUST College of Nursing students and faculty can access full research papers. Published abstracts and titles are visible to all logged-in users, but full paper access requires login with an approved account.'
    },
    {
      q: 'How do I reset my password?',
      a: 'Click on "Forgot Password" on the login page, enter your NEUST email address, and follow the instructions sent to your email. For security reasons, password reset links expire after 1 hour.'
    },
    {
      q: 'Can I download research papers?',
      a: 'No, direct downloads are disabled for security reasons. You can view papers online within the platform. All viewed papers are watermarked with your username and timestamp for security tracking.'
    },
    {
      q: 'How do I cite a paper from ConServe?',
      a: 'Each paper has a "Cite" button that provides formatted citations in APA, MLA, Chicago, and Harvard styles. Simply click the citation style you need and copy the generated reference.'
    }
  ];

  const guides = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      steps: [
        'Create an account with your NEUST email',
        'Wait for admin approval (you\'ll receive an email)',
        'Log in with your credentials',
        'Explore the research repository'
      ]
    },
    {
      title: 'Submitting Research',
      icon: Upload,
      steps: [
        'Prepare your research in IMRaD format PDF',
        'Log in to your dashboard',
        'Click "Submit Research" and follow the wizard',
        'Fill in all required metadata accurately',
        'Review and submit for approval'
      ]
    },
    {
      title: 'Searching Papers',
      icon: Search,
      steps: [
        'Use the search bar in the navigation',
        'Apply filters (author, date, subject)',
        'Use advanced search for specific criteria',
        'Save papers to your favorites for later'
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Help Center</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Find answers and learn how to use ConServe
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {quickLinks.map((link, i) => (
          <a
            key={i}
            href={link.link}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <link.icon className="text-navy" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{link.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{link.desc}</p>
          </a>
        ))}
      </div>

      {/* Step-by-Step Guides */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Step-by-Step Guides</h2>
        <div className="space-y-6">
          {guides.map((guide, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mr-4">
                  <guide.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{guide.title}</h3>
              </div>
              <ol className="space-y-2 ml-16">
                {guide.steps.map((step, j) => (
                  <li key={j} className="flex items-start">
                    <span className="flex items-center justify-center w-6 h-6 bg-navy text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
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

      {/* FAQs */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white text-left">{faq.q}</span>
                <ChevronDown 
                  className={`text-navy transition-transform ${openFaq === i ? 'rotate-180' : ''}`} 
                  size={20} 
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-gray-700 dark:text-gray-300 animate-slide-up">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 text-center shadow-xl">
        <Mail size={48} className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
        <p className="mb-6">Our support team is ready to assist you</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="mailto:conserve@neust.edu.ph"
            className="inline-block bg-white text-navy px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300"
          >
            Email Support
          </a>
          <a 
            href="tel:+631234567890"
            className="inline-block bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/30 transition-all duration-300"
          >
            Call Us
          </a>
        </div>
        <p className="mt-6 text-sm">Response time: Within 24 hours</p>
      </div>
    </div>
  );
};

export default Help;