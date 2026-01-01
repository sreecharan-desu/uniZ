import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useIsAuth } from "../hooks/is_authenticated";
import { Award, Clock, UserCheck, ArrowRight } from "lucide-react";

export default function Home() {
    useIsAuth();
    const navigate = useNavigate();

    // Secret Admin Access
    useEffect(() => {
        let keyBuffer = '';
        const targetSequence = 'admin';
        const handleKeyPress = (event: KeyboardEvent) => {
            keyBuffer += event.key.toLowerCase();
            if (keyBuffer.length > targetSequence.length) keyBuffer = keyBuffer.slice(1);
            if (keyBuffer === targetSequence) {
                navigate('/admin/signin');
                keyBuffer = '';
            }
        };
        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [navigate]);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            
            {/* Hero Section */}
            <motion.section 
                initial="hidden" 
                animate="visible" 
                variants={stagger}
                className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 text-center overflow-hidden"
            >
                {/* Minimal Background Element */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                
                <motion.div variants={fadeInUp} className="mb-6">
                     <span className="px-4 py-1.5 rounded-full border border-gray-200 text-xs font-medium bg-gray-50 text-gray-600 tracking-wide uppercase hover:bg-gray-100 transition-colors cursor-default">
                        Campus Reimagined
                     </span>
                </motion.div>

                <motion.h1 
                    variants={fadeInUp} 
                    className="text-7xl md:text-9xl font-black tracking-tighter mb-6"
                >
                    uni<span className="relative inline-block">Z<span className="absolute -top-2 -right-3 w-4 h-4 bg-blue-600 rounded-full animate-pulse"></span></span>
                </motion.h1>

                <motion.p 
                    variants={fadeInUp} 
                    className="text-lg md:text-2xl text-gray-500 font-light max-w-2xl leading-relaxed mb-10"
                >
                    The operating system for your academic life. <br className="hidden md:block"/>
                    <span className="text-black font-normal">Simple. Fast. Professional.</span>
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 items-center">
                    <Link 
                        to="/student/signin" 
                        className="group relative px-8 py-4 bg-black text-white rounded-full font-medium overflow-hidden shadow-lg hover:shadow-xl transition-all"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover:scale-x-110 transition-transform origin-left duration-300" />
                    </Link>
                </motion.div>

                {/* Decorative Bottom Gradient */}
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </motion.section>

            {/* Features Minimal Grid */}
            <section className="py-24 px-6 max-w-7xl mx-auto border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                     {[
                        { icon: <Clock className="w-6 h-6"/>, title: "Real-time Sync", desc: "Instant updates on your attendance, grades, and approvals. Never miss a beat." },
                        { icon: <UserCheck className="w-6 h-6"/>, title: "Student Centric", desc: "Built specifically for RGUKT students, tailored to your exact workflow and needs." },
                        { icon: <Award className="w-6 h-6"/>, title: "Academic Proof", desc: "Secure, verifiable, and permanent academic records at your fingertips." },
                     ].map((f, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="group p-8 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all duration-300 hover:shadow-sm"
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-black group-hover:text-white">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-black">{f.title}</h3>
                            <p className="text-gray-500 font-light leading-relaxed">{f.desc}</p>
                        </motion.div>
                     ))}
                </div>
            </section>

             {/* Footer Simple */}
            <footer className="py-10 text-center text-gray-400 text-sm border-t border-gray-100 bg-gray-50/30">
                <p>&copy; {new Date().getFullYear()} UniZ. Built for RGUKT.</p>
            </footer>

        </div>
    );
}