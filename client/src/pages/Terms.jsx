import { FileText, AlertCircle } from 'lucide-react';

const Terms = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using CONserve (the "Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not use this Service.'
    },
    {
      title: '2. User Eligibility',
      content: 'Access to CONserve is restricted to current students, faculty, and authorized personnel of Nueva Ecija University of Science and Technology (NEUST) College of Nursing. Users must register with a valid email address and receive admin approval before accessing the platform.'
    },
    {
      title: '3. Intellectual Property Rights',
      content: 'All research papers, documents, and content submitted to CONserve remain the intellectual property of their respective authors. By submitting content, authors grant CONserve a non-exclusive license to store, display, and provide access to the content within the platform. CONserve serves solely as a repository and does not claim ownership of submitted materials.'
    },
    {
      title: '4. User Responsibilities',
      content: 'Users are responsible for: (a) Maintaining the confidentiality of their account credentials, (b) All activities that occur under their account, (c) Ensuring submitted content is original and does not infringe on others\' rights, (d) Using the Service in compliance with all applicable laws and regulations, (e) Not sharing access credentials with unauthorized persons.'
    },
    {
      title: '5. Prohibited Conduct',
      content: 'Users must NOT: (a) Engage in plagiarism or submit work that is not their own, (b) Infringe on copyrights, trademarks, or intellectual property rights, (c) Attempt to bypass security measures or access restrictions, (d) Use automated tools to download or scrape content, (e) Share downloaded or accessed content outside the platform, (f) Submit false, misleading, or inappropriate information, (g) Attempt to gain unauthorized access to other users\' accounts.'
    },
    {
      title: '6. Content Submission',
      content: 'When submitting research papers: (a) Content must be in IMRaD format PDF, (b) All submissions undergo admin review and approval, (c) CONserve reserves the right to reject submissions that do not meet quality standards, (d) Authors are responsible for the accuracy and integrity of their submissions, (e) Approved papers become part of the permanent archive.'
    },
    {
      title: '7. Access and Security',
      content: 'CONserve implements security measures including: (a) Dynamic watermarking on all viewed content, (b) Disabled download, copy, and print functions, (c) Login tracking and audit logs, (d) Automatic session timeout after 20 minutes of inactivity, (e) Account lockout after multiple failed login attempts.'
    },
    {
      title: '8. Content Moderation',
      content: 'CONserve administrators reserve the right to: (a) Review all submissions before publication, (b) Request revisions or additional information, (c) Reject content that violates these terms, (d) Remove content that is later found to violate policies, (e) Suspend or terminate accounts for policy violations.'
    },
    {
      title: '9. Disclaimer of Warranties',
      content: 'CONserve is provided "as is" without warranties of any kind. While we strive for accuracy and reliability, we do not guarantee: (a) Uninterrupted or error-free service, (b) Complete accuracy of all content, (c) That the Service will meet all user requirements.'
    },
    {
      title: '10. Limitation of Liability',
      content: 'NEUST and CONserve shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service, including but not limited to damages for loss of data or unauthorized access to your account.'
    },
    {
      title: '11. Changes to Terms',
      content: 'CONserve reserves the right to modify these Terms and Conditions at any time. Users will be notified of significant changes via email. Continued use of the Service after changes constitutes acceptance of the modified terms.'
    },
    {
      title: '12. Termination',
      content: 'CONserve may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the Service will immediately cease.'
    },
    {
      title: '13. Governing Law',
      content: 'These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of Philippine courts.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-navy rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <FileText size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms & Conditions</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: November 23, 2025</p>
      </div>

      {/* Important Notice */}
      <div className="bg-navy/10 border-l-4 border-navy p-4 rounded-lg mb-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-navy flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Important Notice</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Please read these Terms and Conditions carefully before using CONserve. By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these terms.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-4">
        {sections.map((section, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{section.title}</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-6 bg-gradient-to-r from-navy to-accent text-white rounded-xl p-5 text-center shadow-lg">
        <h3 className="text-lg font-bold mb-2">Questions About These Terms?</h3>
        <p className="mb-3 text-blue-100 text-sm">Contact us for clarification or assistance</p>
        <a 
          href="mailto:conserve@neust.edu.ph" 
          className="inline-block bg-white text-navy px-6 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition text-sm"
        >
          conserve2025@gmail.com
        </a>
      </div>

      {/* Legal Footer */}
      <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          By using CONserve, you agree to comply with these Terms and Conditions and the{' '}
          <a href="/privacy" className="text-navy dark:text-accent hover:underline font-semibold">
            Privacy Policy
          </a>
          . For legal inquiries, contact the NEUST Legal Office.
        </p>
      </div>
    </div>
  );
};

export default Terms;