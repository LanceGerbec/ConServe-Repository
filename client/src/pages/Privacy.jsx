import { Shield, Lock, Eye, UserCheck, Database, FileCheck, AlertTriangle } from 'lucide-react';

const Privacy = () => {
  const dataTypes = [
    { icon: UserCheck, title: 'Personal Info', desc: 'Name, email, ID number' },
    { icon: FileCheck, title: 'Submissions', desc: 'Research papers & metadata' },
    { icon: Eye, title: 'Usage', desc: 'Login times, views, searches' },
    { icon: Lock, title: 'Security Logs', desc: 'IP, device, auth attempts' }
  ];

  const purposes = [
    'Account authentication',
    'Research submission processing',
    'Peer review & feedback',
    'Communication about account',
    'Security monitoring',
    'Analytics for improvement',
    'Academic integrity compliance',
    'Support requests',
    'Audit logs maintenance'
  ];

  const security = [
    'TLS/SSL encryption',
    'Bcrypt password hashing',
    'Regular security audits',
    'Role-based access (RBAC)',
    'Automated encrypted backups',
    'Dynamic watermarking',
    'Audit logging',
    '2FA support',
    '20-min session timeout',
    'Account lockout protection',
    'IP monitoring',
    'Vulnerability assessments'
  ];

  const rights = [
    { title: 'Access', desc: 'Request copies of your data' },
    { title: 'Rectification', desc: 'Correct inaccurate data' },
    { title: 'Erasure', desc: 'Request data deletion' },
    { title: 'Object', desc: 'Object to processing' },
    { title: 'Portability', desc: 'Receive data in structured format' },
    { title: 'Complaints', desc: 'File with Privacy Commission' }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-navy dark:bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Shield size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: November 24, 2025</p>
        <div className="inline-block bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-4 py-2 rounded-full mt-3 border border-green-200 dark:border-green-800 text-xs font-semibold">
          ✓ Compliant with RA 10173 (Data Privacy Act of 2012)
        </div>
      </div>

      {/* Introduction */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Shield className="text-navy dark:text-blue-400" size={24} />
          Our Commitment
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          CONserve is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your information in compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>.
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          By using CONserve, you acknowledge that you have read and understood this Privacy Policy and consent to the collection and processing of your personal data as described herein.
        </p>
      </div>

      {/* Data We Collect */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dataTypes.map((type, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-navy/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <type.icon className="text-navy dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{type.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{type.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-600 p-3 rounded">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <strong>Note:</strong> We collect only the minimum information necessary to provide our services.
          </p>
        </div>
      </div>

      {/* Purpose */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Purpose of Data Collection</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">We collect and process your information for:</p>
        <ul className="space-y-2">
          {purposes.map((purpose, i) => (
            <li key={i} className="flex items-start text-sm">
              <span className="w-1.5 h-1.5 bg-navy dark:bg-blue-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
              <span className="text-gray-700 dark:text-gray-300">{purpose}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Security */}
      <div className="bg-navy dark:bg-gray-800 text-white rounded-xl p-5 shadow-lg mb-5 border-2 border-navy dark:border-blue-600">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={24} className="text-white dark:text-blue-400" />
          <h2 className="text-xl font-bold">Data Security Measures</h2>
        </div>
        <p className="text-sm mb-3 text-blue-100 dark:text-gray-300">We implement comprehensive security measures:</p>
        <div className="grid grid-cols-2 gap-2">
          {security.map((measure, i) => (
            <div key={i} className="flex items-start bg-white/10 dark:bg-blue-900/20 rounded-lg p-2">
              <span className="text-green-400 mr-2 text-sm">✓</span>
              <span className="text-xs text-white dark:text-gray-300">{measure}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sharing */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="text-orange-500 dark:text-orange-400" size={24} />
          Data Sharing
        </h2>
        <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 dark:border-orange-600 p-3 rounded mb-3">
          <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">We do NOT sell, trade, or rent your information.</p>
          <p className="text-xs text-gray-700 dark:text-gray-300">Your privacy is our priority.</p>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Data may only be shared:</p>
        <ul className="space-y-2">
          {[
            'With administrators for legitimate purposes',
            'When required by law or court order',
            'To protect rights, property, or safety',
            'With your explicit written consent',
            'To trusted service providers (e.g., hosting)'
          ].map((item, i) => (
            <li key={i} className="flex items-start text-sm">
              <span className="text-navy dark:text-blue-400 mr-2 font-bold">{i + 1}.</span>
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Your Rights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Your Rights (RA 10173)</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Under the Data Privacy Act, you have:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rights.map((right, i) => (
            <div key={i} className="bg-navy/5 dark:bg-blue-900/20 p-3 rounded-lg border border-navy/20 dark:border-blue-700">
              <h3 className="font-bold text-navy dark:text-blue-400 text-sm mb-1">{right.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{right.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 p-3 rounded">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <strong>To exercise these rights:</strong> Contact our Data Protection Officer at{' '}
            <a href="mailto:conserve2025@gmail.com" className="text-navy dark:text-blue-400 font-bold hover:underline">
              conserve2025@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Retention */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Data Retention</h2>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>Account Data:</strong> Retained while active. Deleted within 30 days after closure (except legal requirements).</p>
          <p><strong>Research Papers:</strong> Retained permanently as institutional archive (even after account deletion).</p>
          <p><strong>Usage Logs:</strong> Retained for 12 months, then automatically deleted.</p>
          <p><strong>Backups:</strong> Encrypted backups retained for 90 days.</p>
        </div>
      </div>

      {/* Cookies */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Cookies & Tracking</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">CONserve uses essential cookies to:</p>
        <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 mb-3">
          <li className="flex items-start"><span className="mr-2">•</span>Maintain secure login sessions</li>
          <li className="flex items-start"><span className="mr-2">•</span>Remember theme preferences</li>
          <li className="flex items-start"><span className="mr-2">•</span>Protect against security threats</li>
        </ul>
        <p className="text-xs text-gray-600 dark:text-gray-400">We do not use third-party tracking or advertising cookies.</p>
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-r from-navy to-accent dark:from-blue-700 dark:to-blue-900 text-white rounded-xl p-6 text-center shadow-lg mb-5">
        <Database size={40} className="mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Questions About Privacy?</h2>
        <p className="mb-4 text-blue-100 dark:text-blue-200 text-sm">Contact our Data Protection Officer</p>
        <a href="mailto:conserve2025@gmail.com" className="inline-block bg-white text-navy dark:text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
          conserve2025@gmail.com
        </a>
        <p className="mt-3 text-xs text-blue-100 dark:text-blue-200">Response time: Within 48 hours</p>
      </div>

      {/* NPC Info */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">National Privacy Commission</h3>
        <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
          If you believe your data privacy rights have been violated, you may file a complaint with:
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
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