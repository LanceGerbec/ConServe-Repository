import { Link } from 'react-router-dom';
import { Mail, MapPin, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const Footer = () => {
  const [logos, setLogos] = useState({ school: null, college: null, conserve: null });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/settings`)
      .then(r => r.json())
      .then(d => d.settings?.logos && setLogos(d.settings.logos))
      .catch(e => console.error('Logo fetch failed:', e));
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto border-t-4 border-navy">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Logo Section with ConServe */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              {/* School Logo */}
              <a href="https://neust.edu.ph/" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full border-2 border-navy shadow-md hover:scale-110 transition overflow-hidden bg-white flex items-center justify-center"
                title="NEUST">
                {logos.school?.url ? (
                  <img src={logos.school.url} alt="NEUST" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-gray-500">NU</span>
                )}
              </a>

              {/* College Logo */}
              <a href="https://www.facebook.com/NEUSTCON" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-navy shadow-md hover:scale-110 transition overflow-hidden bg-white flex items-center justify-center"
                title="College of Nursing">
                {logos.college?.url ? (
                  <img src={logos.college.url} alt="CON" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-gray-500">CN</span>
                )}
              </a>

              {/* ConServe Logo - NEW */}
              <Link to="/" 
                className="w-10 h-10 rounded-lg border-2 border-accent shadow-md hover:scale-110 transition overflow-hidden bg-navy flex items-center justify-center"
                title="ConServe">
                {logos.conserve?.url ? (
                  <img src={logos.conserve.url} alt="ConServe" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">C</span>
                )}
              </Link>
            </div>
            
            <h3 className="text-white font-bold text-lg mb-2">CONserve</h3>
            <p className="text-sm text-gray-400">NEUST College of Nursing Research Repository - Preserving academic excellence.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-3">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/about" className="block hover:text-accent transition">About Us</Link>
              <Link to="/help" className="block hover:text-accent transition">Help Center</Link>
              <Link to="/terms" className="block hover:text-accent transition">Terms & Conditions</Link>
              <Link to="/privacy" className="block hover:text-accent transition">Privacy Policy</Link>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-white font-bold mb-3">Contact & Support</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-accent flex-shrink-0" />
                <span>NEUST - College of Nursing</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-accent flex-shrink-0" />
                <a href="mailto:conserve2025@gmail.com" className="hover:text-white transition break-all">
                  conserve2025@gmail.com
                </a>
              </div>
            </div>
            <Link to="/help" className="inline-block bg-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-navy-800 shadow-md transition">
              Get Help
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-6"></div>

        {/* Bottom Section - Centered */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} CONserve - NEUST College of Nursing. All rights reserved.
          </p>
          
          <p className="text-xs text-gray-500">
            🔒 Secured by RA 10173 Data Privacy Act | All research papers are protected
          </p>

          <button
            onClick={scrollTop}
            className="inline-flex p-3 bg-navy rounded-full hover:bg-navy-800 shadow-lg hover:shadow-xl hover:scale-110 transition-all"
            aria-label="Scroll to top">
            <ArrowUp className="text-white" size={20} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;