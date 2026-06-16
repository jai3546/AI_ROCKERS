import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-10 text-gray-600 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Platform Info */}
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-3">VidyaAI</h3>
          <p className="text-gray-500 leading-relaxed">
            Voice-first educational platform for underprivileged students.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-indigo-600 transition-colors">About Our Mission</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Column 3: Contact Details */}
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-3">Contact Us</h3>
          <ul className="space-y-2 text-gray-500">
            <li className="flex items-center gap-2">
              <span>📧</span> 
              <a href="mailto:support@vidyaai.org" className="hover:text-indigo-600 transition-colors">
                support@vidyaai.org
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span> 
              <span>+91xxxxxxxxxx</span>
            </li>
            <li className="flex items-center gap-2">
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright Section */}
      <div className="max-w-7xl mx-auto px-6 border-t border-gray-100 mt-8 pt-6 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} VidyaAI. Thank you for being a part of our journey!</p>
      </div>
    </footer>
  );
}