import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border/70 bg-background py-10 text-sm text-muted-foreground dark:border-border/40 dark:bg-background/95">
      <div className="page-container grid grid-cols-1 gap-8 md:grid-cols-3">
        
        {/* Column 1: Platform Info */}
        <div>
          <h3 className="font-bold text-foreground text-base mb-3">VidyaAI</h3>
          <p className="text-muted-foreground leading-relaxed dark:text-neutral-400">
            Voice-first educational platform for underprivileged students.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="font-bold text-foreground text-base mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-primary transition-colors dark:hover:text-indigo-400">About Our Mission</a></li>
            <li><a href="#" className="hover:text-primary transition-colors dark:hover:text-indigo-400">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors dark:hover:text-indigo-400">Terms of Service</a></li>
          </ul>
        </div>

        {/* Column 3: Contact Details */}
        <div>
          <h3 className="font-bold text-foreground text-base mb-3">Contact Us</h3>
          <ul className="space-y-2 text-muted-foreground dark:text-neutral-400">
            <li className="flex items-center gap-2">
              <span>📧</span> 
              <a href="mailto:support@vidyaai.org" className="text-foreground hover:text-primary transition-colors dark:text-neutral-200 dark:hover:text-indigo-400">
                support@vidyaai.org
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span> 
              <span className="text-foreground dark:text-neutral-200">+91 xxxxx xxxxx</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright Section */}
      <div className="page-container mt-8 border-t border-border/70 pt-6 text-center text-muted-foreground/70 dark:border-border/40 dark:text-neutral-500">
        <p>&copy; {new Date().getFullYear()} VidyaAI. Thank you for being a part of our journey!</p>
      </div>
    </footer>
  );
}