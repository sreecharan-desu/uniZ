import { FaDiscord, FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export function Footer() {
  const year = new Date().getFullYear();
  const socialLinks = [
    { name: "GitHub", url: "https://github.com/sreecharan-desu", icon: FaGithub },
    { name: "LinkedIn", url: "https://linkedin.com/in/sreecharan-desu", icon: FaLinkedin },
    { name: "X", url: "https://x.com/sr3x0r", icon: FaXTwitter },
    { name: "YouTube", url: "https://www.youtube.com/@mrsreecharan", icon: FaYoutube },
    { name: "Discord", url: "https://discord.com/users/1370022259606945792", icon: FaDiscord },
  ];

  return (
    <footer className="bg-black py-4 z-10 w-full text-center m-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col justify-center place-content-center md:flex-row md:justify-between md:items-center">
          {/* Logo and Copyright */}

          <div className="flex justify-center items-center space-x-2">
            <span className="font-bold text-white text-center text-xl sm:text-2xl">Schat</span>
            <span className="text-gray-400 text-sm mt-1">© {year}</span>
          </div>


          {/* Creator Credit and Social Links */}
          <div className="flex flex-col mt-4 md:mt-0 justify-center place-content-center items-center">
            {/* Creator Credit */}
            <div className="text-gray-400 text-sm flex items-center">
              <span>Made with</span>
              <span className="text-red-500 text-xl animate-pulse ml-1 transform hover:scale-125 transition-transform duration-300 cursor-default inline-block">
                ♥
              </span>
              <a
                href="https://sr3x0r.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 font-medium hover:text-white transition-colors group relative"
              >
                by SreeCharan
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transform hover:scale-110 transition-all duration-200"
                  aria-label={link.name}
                  title={link.name}
                >
                  <link.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="sr-only">{link.name}</span>
                </a>
              ))}
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
}
