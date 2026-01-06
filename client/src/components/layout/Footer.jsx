import { Link } from 'react-router-dom';
import { Mail, MapPin, ArrowUp, Lock } from 'lucide-react';
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
    <footer className="bg-gray-900 text-gray-300 py-4 md:py-6 mt-auto border-t-2 border-navy">
      <div className="container mx-auto px-3 md:px-4 max-w-7xl">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
          
          {/* Logo Section */}
          <div>
            <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
              {/* School Logo */}
              <a href="https://neust.edu.ph/" target="_blank" rel="noopener noreferrer" 
                className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-navy shadow-sm hover:scale-110 transition overflow-hidden bg-white flex items-center justify-center"
                title="NEUST">
                {logos.school?.url ? (
                  <img src={logos.school.url} alt="NEUST" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] md:text-xs font-bold text-gray-500">NU</span>
                )}
              </a>

              {/* College Logo */}
              <a href="https://www.facebook.com/NEUSTCON" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-navy shadow-sm hover:scale-110 transition overflow-hidden bg-white flex items-center justify-center"
                title="College of Nursing">
                {logos.college?.url ? (
                  <img src={logos.college.url} alt="CON" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] md:text-xs font-bold text-gray-500">CN</span>
                )}
              </a>

              {/* ConServe Logo */}
              <Link to="/" 
                className="w-6 h-6 md:w-8 md:h-8 rounded-md border border-accent shadow-sm hover:scale-110 transition overflow-hidden bg-navy flex items-center justify-center"
                title="ConServe">
                {logos.conserve?.url ? (
                  <img src={logos.conserve.url} alt="ConServe" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-xs md:text-sm">C</span>
                )}
              </Link>
            </div>
            
            <h3 className="text-white font-bold text-sm md:text-base mb-0.5 md:mb-1">CONserve</h3>
            <p className="text-[10px] md:text-xs text-gray-400 leading-tight md:leading-relaxed">NEUST College of Nursing Research Repository</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-1.5 md:mb-2 text-xs md:text-sm">Quick Links</h3>
            <div className="space-y-1 md:space-y-1.5 text-[10px] md:text-xs">
              <Link to="/about" className="block hover:text-accent transition">About Us</Link>
              <Link to="/help" className="block hover:text-accent transition">Help Center</Link>
              <Link to="/terms" className="block hover:text-accent transition">Terms & Conditions</Link>
              <Link to="/privacy" className="block hover:text-accent transition">Privacy Policy</Link>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-white font-semibold mb-1.5 md:mb-2 text-xs md:text-sm">Contact & Support</h3>
            <div className="space-y-1 md:space-y-1.5 text-[10px] md:text-xs mb-2 md:mb-3">
              <div className="flex items-start gap-1.5">
                <MapPin size={12} className="mt-0.5 text-accent flex-shrink-0" />
                <span>NEUST - College of Nursing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="text-accent flex-shrink-0" />
                <a href="mailto:conserve2025@gmail.com" className="hover:text-white transition break-all">
                  conserve2025@gmail.com
                </a>
              </div>
            </div>
            <Link to="/help" className="inline-block bg-navy text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-md text-[10px] md:text-xs font-semibold hover:bg-navy-800 shadow-sm transition">
              Get Help
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-2 md:my-3"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-1.5 md:gap-2 text-center md:text-left">
          <p className="text-[10px] md:text-xs text-gray-400">
            © {new Date().getFullYear()} CONserve - NEUST College of Nursing. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2 md:gap-4">
            <p className="text-[9px] md:text-xs text-gray-500 flex items-center gap-1">
              <Lock size={10} className="text-gray-500 hidden md:inline" />
              <span>Secured by RA 10173</span>
            </p>

            <button
              onClick={scrollTop}
              className="p-1.5 md:p-2 bg-navy rounded-full hover:bg-navy-800 shadow-md hover:shadow-lg hover:scale-110 transition-all"
              aria-label="Scroll to top">
              <ArrowUp className="text-white" size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;