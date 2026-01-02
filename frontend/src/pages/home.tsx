
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useIsAuth } from "../hooks/is_authenticated";
import { Award, Clock, UserCheck, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { Button } from "../components/Button";

export default function Home() {
    useIsAuth();
    const navigate = useNavigate();

    // Secret Admin Access (Easter Egg)
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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
            
            {/* Hero Section */}
            <section className="flex-1 flex flex-col justify-center px-4 md:px-6 relative overflow-hidden">
                <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20 lg:py-0">
                    
                    {/* Content */}
                    <div className="space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase">
                            <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                            Campus Operating System
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
                            uni<span className="text-blue-600">Z</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            A unified platform for academic management.
                            <br className="hidden md:inline" /> 
                            Streamline your campus life with speed and precision.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                             <Link to="/student/signin">
                                 <Button size="lg" className="rounded-full px-8 w-full sm:w-auto">
                                    Student Login <ArrowRight className="ml-2 w-4 h-4" />
                                 </Button>
                             </Link>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 hidden lg:block">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-slate-50 rounded-full blur-3xl opacity-60 transform scale-90"></div>
                        <img 
                            src="/pikachu.png" 
                            alt="UniZ Platform" 
                            className="relative z-10 w-full max-w-sm mx-auto drop-shadow-xl hover:scale-105 transition-transform duration-500" 
                        />
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section className="bg-white border-t border-slate-200 py-16 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                     <FeatureCard 
                        icon={<Clock className="w-6 h-6 text-blue-600"/>}
                        title="Real-time Sync"
                        desc="Instant updates on attendance and approvals."
                     />
                     <FeatureCard 
                        icon={<ShieldCheck className="w-6 h-6 text-purple-600"/>}
                        title="Secure & Reliable"
                        desc="Institutional-grade security for your data."
                     />
                     <FeatureCard 
                        icon={<Zap className="w-6 h-6 text-amber-500"/>}
                        title="Fast Workflow"
                        desc="Optimized for quick academic tasks."
                     />
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
    );
}