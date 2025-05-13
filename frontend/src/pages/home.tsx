import { useEffect, useRef, useState } from "react";
import { useIsAuth } from "../customhooks/is_authenticated";
import { Award, BookOpen, Clock, GraduationCap, Lightbulb, MousePointerClick, PartyPopper, UserCheck } from "lucide-react";
import { useNavigate } from "react-router";


export default function Home() {
    useIsAuth();
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef:any = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
    let keyBuffer = '';
    const targetSequence = 'admin';
    
    const handleKeyPress = (event:any) => {
      // Add pressed key to buffer
      keyBuffer += event.key.toLowerCase();
      
      // Keep buffer length equal to target sequence length
      if (keyBuffer.length > targetSequence.length) {
        keyBuffer = keyBuffer.slice(1);
      }
      
      // Check if buffer matches target sequence
      if (keyBuffer === targetSequence) {
        navigate('/admin/signin');
        keyBuffer = ''; // Reset buffer after navigation
      }
    };
    
    // Add event listener
    window.addEventListener('keypress', handleKeyPress);
    
    // Cleanup
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [navigate]);

    // Handle scroll effect for elements to appear on scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 300);
        
        const handleMouseMove = (e:any) => {
            if (!heroRef.current) return;
            const rect:any = heroRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        };
        
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("mousemove", handleMouseMove);
        
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(timer);
        };
    }, []);



    // Feature data
    const features = [
        {
            icon: <Award className="text-black" size={28} />,
            title: "GradeHub",
            description: "Comprehensive grade tracking with detailed analytics and progress visualization."
        },
        {
            icon: <BookOpen className="text-black" size={28} />,
            title: "Study Space",
            description: "Form study groups, share resources, and collaborate seamlessly with classmates."
        },
        {
            icon: <PartyPopper className="text-black" size={28} />,
            title: "CampusHub",
            description: "Discover and engage with campus events tailored to your interests and schedule."
        },
        {
            icon: <UserCheck className="text-black" size={28} />,
            title: "RollCall",
            description: "Track attendance records with precision across all your academic commitments."
        },
        {
            icon: <Clock className="text-black" size={28} />,
            title: "Email updates",
            description: "Never miss important academic deadlines with smart reminders and calendar integration."
        },
        {
            icon: <MousePointerClick className="text-black" size={28} />,
            title: "OneClick Access",
            description: "Access all your university resources and platforms through a unified dashboard."
        }
    ];

    return (
        <div className="min-h-screen bg-white text-black">
            {/* Hero Section */}
            <div 
                ref={heroRef}
                className={`relative min-h-screen flex flex-col justify-center items-center px-6 transition-opacity duration-1000 overflow-hidden ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Abstract SVG Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0)_80%)]" />
                
                {/* Animated Grid Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                
                {/* Animated Floating Elements */}
                <div 
                    className="absolute w-24 h-24 rounded-full border border-gray-200"
                    style={{
                        top: `${Math.sin(scrollY * 0.01) * 100 + 100}px`,
                        left: `${Math.cos(scrollY * 0.01) * 100 + 100}px`,
                        transition: 'all 0.5s ease',
                        opacity: 0.2
                    }}
                />
                <div 
                    className="absolute w-40 h-40 rounded-full border border-gray-200"
                    style={{
                        bottom: `${Math.cos(scrollY * 0.02) * 120 + 150}px`,
                        right: `${Math.sin(scrollY * 0.02) * 120 + 150}px`,
                        transition: 'all 0.7s ease',
                        opacity: 0.2
                    }}
                />
                
                {/* Animated SVG Icons */}
                <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <g className="opacity-10">
                            {/* Graduation Cap */}
                            <g style={{
                                transform: `translate(${80 + Math.sin(scrollY * 0.01) * 20}px, ${120 + Math.cos(scrollY * 0.02) * 20}px)`,
                                transition: 'transform 0.5s ease'
                            }}>
                                <path d="M12 3L1 9L12 15L23 9L12 3Z" stroke="black" fill="none" strokeWidth="1" />
                                <path d="M19 13V9L12 15L5 9V13L12 19L19 13Z" stroke="black" fill="none" strokeWidth="1" />
                                <path d="M5 9V19" stroke="black" fill="none" strokeWidth="1" />
                            </g>
                            
                            {/* Book */}
                            <g style={{
                                transform: `translate(${window.innerWidth - 120 + Math.cos(scrollY * 0.015) * 30}px, ${window.innerHeight - 150 + Math.sin(scrollY * 0.025) * 30}px)`,
                                transition: 'transform 0.6s ease'
                            }}>
                                <path d="M4 19.5V5C4 3.89543 4.89543 3 6 3H20L20 19.5C20 19.5 19 19.5 18 19.5C17 19.5 16 20 16 20H8C8 20 7 19.5 6 19.5C5 19.5 4 19.5 4 19.5Z" stroke="black" fill="none" strokeWidth="1" />
                                <path d="M12 3V12L15 10L18 12V3" stroke="black" fill="none" strokeWidth="1" />
                            </g>
                            
                            {/* Calendar */}
                            <g style={{
                                transform: `translate(${120 + Math.sin(scrollY * 0.02) * 25}px, ${window.innerHeight - 100 + Math.cos(scrollY * 0.015) * 25}px)`,
                                transition: 'transform 0.7s ease'
                            }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="black" fill="none" strokeWidth="1" />
                                <line x1="16" y1="2" x2="16" y2="6" stroke="black" strokeWidth="1" />
                                <line x1="8" y1="2" x2="8" y2="6" stroke="black" strokeWidth="1" />
                                <line x1="3" y1="10" x2="21" y2="10" stroke="black" strokeWidth="1" />
                            </g>
                            
                            {/* User Group */}
                            <g style={{
                                transform: `translate(${window.innerWidth - 100 + Math.cos(scrollY * 0.01) * 15}px, ${100 + Math.sin(scrollY * 0.02) * 15}px)`,
                                transition: 'transform 0.5s ease'
                            }}>
                                <circle cx="9" cy="7" r="4" stroke="black" fill="none" strokeWidth="1" />
                                <path d="M3 21V17C3 15.8954 3.89543 15 5 15H13C14.1046 15 15 15.8954 15 17V21" stroke="black" fill="none" strokeWidth="1" />
                                <circle cx="17" cy="9" r="3" stroke="black" fill="none" strokeWidth="1" />
                                <path d="M13 21V18C13 16.8954 13.8954 16 15 16H19C20.1046 16 21 16.8954 21 18V21" stroke="black" fill="none" strokeWidth="1" />
                            </g>
                        </g>
                    </svg>
                </div>
                
                {/* Interactive Mouse Movement Background Effect */}
                <div 
                    className="absolute w-full h-full opacity-10 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0,0,0,0.2) 0%, transparent 50%)`,
                        transition: 'background 0.2s ease'
                    }}
                />
                
                <div className="max-w-4xl text-center z-10 space-y-8">
                    <div className="flex items-center justify-center">
                        <div className="relative inline-block">
                            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter">
                                uni<span className="relative">Z
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full" />
                                </span>
                            </h1>
                            <svg className="absolute -right-12 -top-8 w-12 h-12 stroke-gray-200 animate-pulse opacity-60">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="none" strokeWidth="1" />
                            </svg>
                            <svg className="absolute -left-12 top-6 w-8 h-8 stroke-gray-300 animate-pulse opacity-40" style={{ animationDelay: '0.5s' }}>
                                <circle cx="12" cy="12" r="10" strokeWidth="1" fill="none" />
                                <path d="M12 8V12L15 15" strokeWidth="1" fill="none" />
                            </svg>
                        </div>
                    </div>
                    
                    <p className="text-lg md:text-xl font-light text-gray-700 max-w-2xl mx-auto leading-relaxed relative">
                        <svg className="absolute -left-10 top-0 w-6 h-6 stroke-gray-300 animate-spin opacity-30" style={{ animationDuration: '8s' }}>
                            <circle cx="12" cy="12" r="10" strokeWidth="1" fill="none" />
                            <path d="M12 6V12L16 14" strokeWidth="1" fill="none" />
                        </svg>
                        The minimalist platform reimagining how students navigate their academic journey.
                        <svg className="absolute -right-10 -bottom-2 w-6 h-6 stroke-gray-300 animate-spin opacity-30" style={{ animationDuration: '10s', animationDirection: 'reverse' }}>
                            <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1" fill="none" />
                            <line x1="12" y1="4" x2="12" y2="20" strokeWidth="1" />
                            <line x1="4" y1="12" x2="20" y2="12" strokeWidth="1" />
                        </svg>
                    </p>
                    
                    <div className="relative flex justify-center space-x-4 pt-6">
                        <div className="absolute -left-16 top-0 transition-transform duration-300 transform translate-y-0 hover:translate-y-1 opacity-20">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M22 2L11 13" />
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                            </svg>
                        </div>
                        <a 
                            href="/student/signin" 
                            className="group relative px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-900 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
                        >
                            <span className="relative z-10">Get Started</span>
                            <span className="absolute inset-0 bg-black z-0 group-hover:scale-x-110 transition-transform duration-300"></span>
                            <span className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black opacity-0 group-hover:opacity-100 z-0 transition-opacity duration-700"></span>
                        </a>
     
                        <div className="absolute -right-16 bottom-0 transition-transform duration-300 transform translate-y-0 hover:-translate-y-1 opacity-20">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-3 mt-4">
                        <span className="inline-flex items-center text-sm text-gray-500 font-light">
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span className="font-medium">6,000+</span> students
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        <span className="inline-flex items-center text-sm text-gray-500 font-light">
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Especially built for <span className="font-medium">&nbsp; RGUKT-ONG </span> 
                        </span>
                    </div>
                </div>
                
                <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                    <div className="animate-bounce cursor-pointer group">
                        <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="transition-transform group-hover:translate-y-1"
                        >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                        </svg>
                    </div>
                </div>
            </div>
            
            {/* Features Section */}
            <div className="py-24 px-6 bg-gray-50 relative overflow-hidden">
                {/* Background SVG pattern */}
                <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="diagonalLines" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="10" style={{ stroke: 'black', strokeWidth: 0.5 }} />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#diagonalLines)" />
                    </svg>
                </div>
                
                <div className="max-w-7xl mx-auto relative">
                    <div className="text-center mb-16 relative">
                        <svg className="absolute -top-12 -left-4 w-8 h-8 text-gray-300 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                            <line x1="9" y1="9" x2="9.01" y2="9" />
                            <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                        
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight inline-flex items-center justify-center">
                            <span className="relative">
                                All You Need
                                <svg className="absolute -top-1 -right-6 w-5 h-5 text-black animate-pulse" style={{ animationDuration: '3s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </span>
                            <span className="mx-3 inline-block w-1 h-8 bg-gray-300"></span>
                            <span>Nothing You Don't</span>
                        </h2>
                        
                        <div className="mt-2 h-1 w-16 bg-black mx-auto"></div>
                        <p className="mt-4 text-gray-600 max-w-2xl mx-auto relative">
                            Designed with intention, built for focus.
                            <svg className="absolute -right-12 -bottom-6 w-10 h-10 text-gray-200 opacity-30 animate-spin" style={{ animationDuration: '15s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                                <circle cx="12" cy="12" r="2" />
                            </svg>
                        </p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className={`bg-white p-8 rounded-lg shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-md transform relative group ${scrollY > 300 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {/* Animated hover effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                                
                                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-5 relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                                    <div className="absolute inset-0 bg-gray-100 scale-0 group-hover:scale-100 rounded-full transition-transform duration-300" />
                                    <div className="relative z-10">
                                        {feature.icon}
                                    </div>
                                </div>
                                
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                                
                                <h3 className="text-xl font-semibold mb-3 relative">{feature.title}
                                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black group-hover:w-10 transition-all duration-300" />
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed relative z-10">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Testimonials Section */}
            <div className="py-24 px-6 relative overflow-hidden">
                {/* Abstract Decorative SVG Elements */}
                <div className="absolute left-0 top-0 w-64 h-64 opacity-5">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="none" stroke="black" strokeWidth="1" 
                            d="M48.8,-57.2C61.9,-46.9,70.1,-31,73.4,-14.2C76.7,2.7,75.1,20.5,66.9,34.1C58.7,47.6,44,56.9,28.4,62.5C12.9,68.1,-3.5,70,-19.7,66.5C-35.9,62.9,-51.8,54,-63.3,40C-74.8,26,-81.8,6.9,-78.8,-10.2C-75.7,-27.2,-62.6,-42.1,-47.8,-52.7C-33,-63.3,-16.5,-69.4,0.4,-69.9C17.3,-70.4,35.7,-67.4,48.8,-57.2Z" 
                            transform="translate(100 100)"
                            className="animate-pulse"
                            style={{ animationDuration: '20s' }}
                        />
                    </svg>
                </div>
                
                <div className="absolute right-0 bottom-0 w-96 h-96 opacity-5">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="none" stroke="black" strokeWidth="1" 
                            d="M42.7,-51.4C53.9,-41.7,60.8,-27.5,63.6,-12.3C66.4,2.9,65.1,19.1,57.5,30.7C50,42.3,36.3,49.2,22.1,54.1C7.9,59,-6.8,61.9,-22.4,59.3C-38,56.7,-54.6,48.5,-64.1,35C-73.6,21.5,-76,2.6,-71.2,-13.8C-66.4,-30.2,-54.4,-44.2,-40.6,-53.3C-26.8,-62.4,-11.2,-66.5,2.5,-69.5C16.3,-72.5,31.6,-61.2,42.7,-51.4Z" 
                            transform="translate(100 100)"
                            className="animate-pulse"
                            style={{ animationDuration: '25s', animationDelay: '2s' }}
                        />
                    </svg>
                </div>
                
                
           
            </div>
            
            {/* Final CTA Section */}
            <div className="py-24 px-6 bg-black text-white text-center relative overflow-hidden">
                {/* Abstract SVG Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="10" cy="10" r="1" fill="white" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dots)" />
                    </svg>
                </div>
                
                {/* Animated SVG Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <svg className="absolute left-10 top-10 opacity-20" width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="60" cy="60" r="40" stroke="white" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDuration: '7s' }} />
                        <circle cx="60" cy="60" r="30" stroke="white" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDuration: '5s' }} />
                        <circle cx="60" cy="60" r="20" stroke="white" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDuration: '3s' }} />
                    </svg>
                    
                    <svg className="absolute right-10 bottom-10 opacity-20" width="150" height="150" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="10" width="80" height="80" stroke="white" strokeWidth="1" fill="none" transform="rotate(45 50 50)" className="animate-pulse" style={{ animationDuration: '8s' }} />
                        <rect x="20" y="20" width="60" height="60" stroke="white" strokeWidth="1" fill="none" transform="rotate(45 50 50)" className="animate-pulse" style={{ animationDuration: '6s' }} />
                        <rect x="30" y="30" width="40" height="40" stroke="white" strokeWidth="1" fill="none" transform="rotate(45 50 50)" className="animate-pulse" style={{ animationDuration: '4s' }} />
                    </svg>
                    
                    <div className="absolute left-1/4 bottom-0 w-px h-1/3 bg-gradient-to-b from-transparent to-gray-500 opacity-30"></div>
                    <div className="absolute right-1/4 top-0 w-px h-1/3 bg-gradient-to-t from-transparent to-gray-500 opacity-30"></div>
                </div>
                
                <div className="max-w-3xl mx-auto relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <svg className="w-16 h-16 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" />
                            <path d="M12 16V12M12 8H12.01" />
                        </svg>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 relative inline-block">
                        You are here ? Then you are in the right place
                        <div className="absolute -right-16 top-0">
                            <svg className="w-12 h-12 text-gray-700 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M14.5 3.5C14.5 3.5 14.5 5.5 12 5.5C9.5 5.5 9.5 3.5 9.5 3.5M16.5 20.5H7.5C6 18 7 12.5 12 12.5C17 12.5 18 18 16.5 20.5ZM16.5 9.5C16.5 11.5 15 12 15 12C15 12 16.5 12.5 16.5 14.5M7.5 9.5C7.5 11.5 9 12 9 12C9 12 7.5 12.5 7.5 14.5" />
                            </svg>
                        </div>
                    </h2>
                    
                    <p className="text-gray-300 mb-8 relative">
                        <span className="relative inline-block">
Then join us now                            <svg className="absolute -left-8 -bottom-4 w-6 h-6 text-gray-700 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M18 2L22 6L18 10" />
                                <path d="M2 12H22" />
                                <path d="M6 22L2 18L6 14" />
                            </svg>
                        </span>
                    </p>
                    
                    <a 
                        href="/student/signin" 
                        className="inline-block px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md relative group overflow-hidden"
                    >
                        <span className="absolute inset-0 w-0 bg-gray-200 transition-all duration-300 ease-out group-hover:w-full"></span>
                        <span className="absolute inset-0 w-full text-right text-black pr-4 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-10">Z</span>
                        <span className="relative flex items-center justify-center">
                            Start Your Journey
                            <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </span>
                    </a>
                    
                    <div className="mt-12 flex justify-center space-x-6 opacity-70">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center mb-2">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <p className="text-xs">Academic Excellence</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center mb-2">
                                <UserCheck className="w-5 h-5" />
                            </div>
                            <p className="text-xs">Student Success</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center mb-2">
                                <Lightbulb className="w-5 h-5" />
                            </div>
                            <p className="text-xs">Innovation</p>
                        </div>
                    </div>
                </div>
            </div>
            
          
        </div>
    );
}