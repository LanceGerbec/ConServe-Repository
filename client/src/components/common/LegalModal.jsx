// client/src/components/common/LegalModal.jsx
import { useState } from 'react';
import { X, FileText, Shield } from 'lucide-react';

const LegalModal = ({ isOpen, onClose, defaultTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (!isOpen) return null;

  const termsContent = (
    <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">1. Account Usage</h3>
        <p>By creating an account, you agree to provide accurate information and maintain the security of your credentials. Your account is personal and non-transferable.</p>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">2. Research Repository Access</h3>
        <p>Access to research papers is for <strong>educational and academic purposes only</strong>. Redistribution, commercial use, or unauthorized sharing is prohibited.</p>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">3. Intellectual Property</h3>
        <p>All research papers remain the property of their respective authors. Users must respect copyright laws and proper citation requirements when referencing materials.</p>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">4. Prohibited Actions</h3>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Attempting to bypass PDF protection mechanisms</li>
          <li>Sharing login credentials with unauthorized users</li>
          <li>Submitting plagiarized or fraudulent research</li>
          <li>Harassing or impersonating other users</li>
          <li>Automated scraping or data extraction</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">5. Account Suspension</h3>
        <p>Violation of these terms may result in immediate account suspension or termination without prior notice. Repeated violations may lead to permanent ban.</p>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">6. Content Submission</h3>
        <p>By submitting research, you grant ConServe a non-exclusive license to display, store, and distribute your work within the platform. You retain all ownership rights.</p>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">7. System Security</h3>
        <p>Users must not attempt to compromise system security, access unauthorized areas, or interfere with platform operations. All activities are logged for security purposes.</p>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">8. Changes to Terms</h3>
        <p>ConServe reserves the right to modify these terms at any time. Continued use after changes constitutes acceptance of updated terms.</p>
      </section>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Last Updated:</strong> January 2026 | <strong>Contact:</strong> conserve2025@gmail.com
        </p>
      </div>
    </div>
  );

  const privacyContent = (
    <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">1. Information We Collect</h3>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Personal Data:</strong> Name, email, student/faculty ID</li>
          <li><strong>Activity Data:</strong> Login times, research views, downloads</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device info</li>
          <li><strong>Security Logs:</strong> PDF protection violations, access attempts</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">2. How We Use Your Data</h3>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Authenticate and manage your account</li>
          <li>Provide access to research repository</li>
          <li>Monitor security and prevent misuse</li>
          <li>Send important notifications and updates</li>
          <li>Generate analytics for platform improvement</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">3. Data Security</h3>
        <p>We implement industry-standard security measures including password hashing (bcrypt), encrypted connections (HTTPS), and secure cloud storage. Your data is protected against unauthorized access.</p>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">4. Data Sharing</h3>
        <p><strong>We do NOT sell your personal information.</strong> Data may be shared only with:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>NEUST-CON administrators for account verification</li>
          <li>Faculty reviewers (limited to academic context)</li>
          <li>Law enforcement if legally required</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">5. Cookies & Tracking</h3>
        <p>We use essential cookies for authentication and session management. No third-party advertising or tracking cookies are used.</p>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">6. Your Rights</h3>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Access:</strong> Request a copy of your stored data</li>
          <li><strong>Correction:</strong> Update inaccurate information</li>
          <li><strong>Deletion:</strong> Request account deletion (subject to legal retention)</li>
          <li><strong>Opt-out:</strong> Unsubscribe from non-essential emails</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">7. Data Retention</h3>
        <p>Active accounts: Data retained indefinitely. Deleted accounts: Personal data removed within 30 days, except audit logs retained for 1 year for security purposes.</p>
      </section>

      <section>
        <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">8. Contact for Privacy Concerns</h3>
        <p>For data access requests or privacy questions, email: <strong>conserve2025@gmail.com</strong></p>
      </section>

      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
        <p className="text-xs text-green-800 dark:text-green-300">
          <strong>🔒 Your Privacy Matters:</strong> We are committed to protecting your personal information and complying with data protection regulations.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border-2 border-gray-200 dark:border-gray-700 animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            {activeTab === 'terms' ? (
              <FileText className="text-navy dark:text-blue-500" size={24} />
            ) : (
              <Shield className="text-green-600 dark:text-green-500" size={24} />
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 pt-2 px-3 sm:px-4 text-sm sm:text-base font-semibold border-b-2 transition ${
              activeTab === 'terms'
                ? 'border-navy dark:border-blue-500 text-navy dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Terms
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 pt-2 px-3 sm:px-4 text-sm sm:text-base font-semibold border-b-2 transition ${
              activeTab === 'privacy'
                ? 'border-navy dark:border-blue-500 text-navy dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Privacy
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'terms' ? termsContent : privacyContent}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-navy dark:bg-blue-600 hover:bg-navy-800 dark:hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;