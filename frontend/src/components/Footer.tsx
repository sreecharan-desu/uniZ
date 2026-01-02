
import {  FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export function Footer() {
  const year = new Date().getFullYear();
  const socialLinks = [
    { name: "GitHub", url: "https://github.com/sreecharan-desu", icon: FaGithub },
    { name: "LinkedIn", url: "https://linkedin.com/in/sreecharan-desu", icon: FaLinkedin },
    { name: "X", url: "https://x.com/sr3x0r", icon: FaXTwitter },
    { name: "YouTube", url: "https://www.youtube.com/@mrsreecharan", icon: FaYoutube },
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <div className="flex items-center gap-2">
               <span className="font-bold text-slate-900 text-lg">uniZ</span>
               <span className="text-slate-500 text-sm">© {year}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
             {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-800 transition-colors"
                  aria-label={link.name}
                >
                  <link.icon className="w-4 h-4" />
                </a>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
