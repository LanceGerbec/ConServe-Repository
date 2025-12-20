import { Link } from 'react-router-dom';
import { Mail, MapPin, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto border-t-4 border-navy">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">C</span>
              </div>
              <h3 className="text-white font-bold text-xl">ConServe</h3>
            </div>
            <p className="text-sm text-gray-400">
              NEUST College of Nursing Research Repository - Preserving academic excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm hover:text-navy transition-colors">
                About Us
              </Link>
              <Link to="/help" className="block text-sm hover:text-navy transition-colors">
                Help Center
              </Link>
              <Link to="/terms" className="block text-sm hover:text-navy transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="block text-sm hover:text-navy transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-navy" />
                <div>
                  <p>NEUST - College of Nursing</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={18} className="text-navy" />
                <a href="mailto:conserve2025@gmail.com" className="hover:text-white transition-colors">
                  conserve2025@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <p className="text-sm text-gray-400 mb-4">
              Need help? Our support team is here for you.
            </p>
            <Link
              to="/help"
              className="inline-block bg-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-navy-800 shadow-md hover:shadow-lg transition-all duration-300"
            >
              Get Help
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} ConServe - NEUST College of Nursing. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="mt-4 md:mt-0 p-3 bg-navy rounded-full hover:bg-navy-800 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp className="text-white" size={20} />
          </button>
        </div>

        {/* Security & Privacy Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secured by RA 10173 Data Privacy Act | All research papers are protected
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;