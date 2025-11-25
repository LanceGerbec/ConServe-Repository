// ============================================
// Privacy.jsx - Fixed and Enhanced
// ============================================
import { Shield, Lock, Eye, UserCheck, Database, FileCheck, AlertTriangle } from 'lucide-react';

const Privacy = () => {
  const dataTypes = [
    { icon: UserCheck, title: 'Personal Information', desc: 'Name, email address, student/faculty ID number' },
    { icon: FileCheck, title: 'Submission Data', desc: 'Research papers, abstracts, metadata, and related documents' },
    { icon: Eye, title: 'Usage Information', desc: 'Login times, pages viewed, papers accessed, search queries' },
    { icon: Lock, title: 'Security Logs', desc: 'IP addresses, device information, authentication attempts' }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400">Last updated: November 24, 2025</p>
        <div className="inline-block bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-4 py-2 rounded-full mt-4 border border-green-200 dark:border-green-800">
          <span className="font-semibold">✓ Compliant with RA 10173 (Data Privacy Act of 2012)</span>
        </div>
      </div>

      {/* Introduction */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="mr-3 text-navy" size={28} />
          Our Commitment to Privacy
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          ConServe is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, 
          use, store, and protect your information in compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> 
          and its implementing rules and regulations.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          By using ConServe, you acknowledge that you have read and understood this Privacy Policy and consent to the 
          collection and processing of your personal data as described herein.
        </p>
      </div>

      {/* Data We Collect */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Information We Collect</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataTypes.map((type, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <type.icon className="text-navy" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{type.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Note:</strong> We collect only the minimum information necessary to provide our services and comply with legal obligations.
          </p>
        </div>
      </div>

      {/* Purpose of Data Collection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Purpose of Data Collection</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">We collect and process your information for the following purposes:</p>
        <ul className="space-y-3">
          {[
            'Account creation, authentication, and authorization',
            'Processing and managing research paper submissions',
            'Facilitating peer review and feedback processes',
            'Communicating with you about your account and submissions',
            'Monitoring system security and preventing unauthorized access',
            'Generating anonymized analytics to improve service quality',
            'Ensuring compliance with academic integrity policies',
            'Responding to support requests and technical inquiries',
            'Maintaining audit logs for security and compliance'
          ].map((purpose, i) => (
            <li key={i} className="flex items-start">
              <span className="w-2 h-2 bg-navy rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <span className="text-gray-700 dark:text-gray-300">{purpose}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Data Security */}
      <div className="bg-navy text-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-center mb-4">
          <Lock className="mr-3" size={32} />
          <h2 className="text-2xl font-bold">Data Security Measures</h2>
        </div>
        <p className="mb-4">We implement comprehensive security measures to protect your data:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'TLS/SSL encryption for all data transmission',
            'Bcrypt password hashing (industry-standard)',
            'Regular security audits and penetration testing',
            'Role-based access controls (RBAC)',
            'Automated encrypted backup systems',
            'Dynamic watermarking on all viewed content',
            'Comprehensive audit logging and monitoring',
            'Two-factor authentication (2FA) support',
            'Session timeout after 20 minutes inactivity',
            'Account lockout after failed login attempts',
            'IP-based access monitoring',
            'Regular vulnerability assessments'
          ].map((measure, i) => (
            <div key={i} className="flex items-start bg-white/10 rounded-lg p-3">
              <span className="text-green-400 mr-2">✓</span>
              <span className="text-sm">{measure}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sharing */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <AlertTriangle className="mr-3 text-orange-500" size={28} />
          Data Sharing and Disclosure
        </h2>
        <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded mb-4">
          <p className="font-bold text-gray-900 dark:text-white mb-2">We do NOT sell, trade, or rent your personal information.</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Your privacy is our priority. We will never monetize your personal data.
          </p>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Your data may only be shared in these specific circumstances:</p>
        <ul className="space-y-3">
          {[
            'With NEUST administrators for legitimate academic and administrative purposes',
            'When required by law, court order, or government authority',
            'To protect the rights, property, safety, or security of ConServe, NEUST, or users',
            'With your explicit written consent for specific purposes',
            'To trusted third-party service providers bound by confidentiality agreements (e.g., hosting providers)'
          ].map((item, i) => (
            <li key={i} className="flex items-start">
              <span className="text-navy mr-2 font-bold">{i + 1}.</span>
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Your Rights */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Data Privacy Rights (RA 10173)</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Under the Data Privacy Act, you have the following rights:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Right to Access', desc: 'Request copies of your personal data' },
            { title: 'Right to Rectification', desc: 'Correct inaccurate or incomplete data' },
            { title: 'Right to Erasure', desc: 'Request deletion of your data (subject to legal requirements)' },
            { title: 'Right to Object', desc: 'Object to certain processing activities' },
            { title: 'Right to Data Portability', desc: 'Receive your data in a structured format' },
            { title: 'Right to Lodge Complaints', desc: 'File complaints with the National Privacy Commission' }
          ].map((right, i) => (
            <div key={i} className="bg-navy/5 dark:bg-navy/20 p-4 rounded-lg border border-navy/20">
              <h3 className="font-bold text-navy mb-2">{right.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{right.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>To exercise these rights:</strong> Contact our Data Protection Officer at{' '}
            <a href="mailto:conserve2025@gmail.com" className="text-navy font-bold hover:underline">
              conserve2025@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Retention Policy</h2>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p>
            <strong>Account Data:</strong> Retained for as long as your account is active. Upon account closure, 
            personal data is deleted within 30 days, except where retention is required by law.
          </p>
          <p>
            <strong>Research Papers:</strong> Retained permanently as part of the institutional academic archive, 
            even after account deletion. This is necessary for maintaining academic integrity and research continuity.
          </p>
          <p>
            <strong>Usage Logs:</strong> Retained for 12 months for security and audit purposes, then automatically deleted.
          </p>
          <p>
            <strong>Backup Data:</strong> Encrypted backups are retained for 90 days for disaster recovery purposes.
          </p>
        </div>
      </div>

      {/* Cookies */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cookies and Tracking</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          ConServe uses essential cookies and session storage to:
        </p>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Maintain your login session securely</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Remember your theme preferences (dark/light mode)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Protect against security threats</span>
          </li>
        </ul>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          We do not use third-party tracking cookies or advertising cookies.
        </p>
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 text-center shadow-xl">
        <Database size={48} className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
        <p className="mb-6">Contact our Data Protection Officer</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="mailto:conserve2025@gmail.com"
            className="inline-block bg-white text-navy px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300"
          >
            Email: conserve2025@gmail.com
          </a>
        </div>
        <p className="mt-6 text-sm text-blue-100">Response time: Within 48 hours</p>
      </div>

      {/* NPC Information */}
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">National Privacy Commission</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          If you believe your data privacy rights have been violated, you may file a complaint with:
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          National Privacy Commission<br />
          5th Floor, Philippine International Convention Center (PICC)<br />
          Pasay City, Metro Manila, Philippines<br />
          Email: info@privacy.gov.ph | Hotline: (+63 2) 8234-2228
        </p>
      </div>
    </div>
  );
};

export default Privacy;