
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useIsAuth } from "../hooks/is_authenticated";
import { Clock, ArrowRight, Zap, ShieldCheck } from "lucide-react";
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
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-black border border-black text-white text-[10px] font-black tracking-[0.2em] uppercase">
                            <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></span>
                            Campus Operating System v2.0
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] uppercase">
                            uni<span className="text-black">Z</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-semibold">
                            The future of academic management is here.
                            <br className="hidden md:inline" /> 
                            Unified. Swift. Intelligent.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                             <Link to="/student/signin">
                                 <Button size="lg" className="rounded-none border-4 border-black px-12 py-8 text-lg w-full sm:w-auto font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-[-4px] hover:translate-y-0">
                                    Launch Hub <ArrowRight className="ml-2 w-6 h-6" />
                                 </Button>
                             </Link>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 hidden lg:block">
                        <div className="absolute inset-0 bg-slate-400 rounded-full blur-[120px] opacity-20 transform scale-90 animate-pulse"></div>
                        <div className="relative z-10 p-8 bg-white border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img 
                                src="/pikachu.png" 
                                alt="UniZ Platform" 
                                className="w-full max-w-sm mx-auto grayscale hover:grayscale-0 transition-all duration-500" 
                            />
                            <div className="mt-4 border-t-2 border-black pt-4 flex justify-between items-center">
                                <span className="font-black uppercase text-xs">System Status</span>
                                <span className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase"><span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Campus Pulse Section */}
            <section className="bg-slate-900 text-white py-24 px-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic">Campus Pulse</h2>
                            <p className="text-slate-400 font-medium">Real-time metrics from across the university.</p>
                        </div>
                        <div className="text-slate-500 font-mono text-xs uppercase tracking-widest">Live Updates Every 30s</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        <StatCard label="Active Students" value="2,482" peak="+12%" />
                        <StatCard label="Approvals Issued" value="142" peak="Today" />
                        <StatCard label="Average Speed" value="140ms" peak="Ultra" />
                        <StatCard label="Security Rank" value="AAA" peak="Safe" />
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section className="bg-white py-24 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                     <FeatureCard 
                        icon={<Clock className="w-8 h-8 text-black"/>}
                        title="Real-time Sync"
                        desc="Instant updates on attendance and approvals. No more waiting in lines."
                     />
                     <FeatureCard 
                        icon={<ShieldCheck className="w-8 h-8 text-black"/>}
                        title="Secure & Reliable"
                        desc="Institutional-grade security for your data. Encrypted and distributed."
                     />
                     <FeatureCard 
                        icon={<Zap className="w-8 h-8 text-black"/>}
                        title="Fast Workflow"
                        desc="Optimized for quick academic tasks. Built for speed and precision."
                     />
                </div>
            </section>

        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-center text-center p-8 rounded-none border-4 border-slate-100 hover:border-black transition-all duration-300">
            <div className="w-16 h-16 rounded-none bg-slate-50 border-2 border-slate-200 flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">{title}</h3>
            <p className="text-base text-slate-500 font-medium leading-relaxed">{desc}</p>
        </div>
    );
}

function StatCard({ label, value, peak }: { label: string, value: string, peak: string }) {
    return (
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-none hover:bg-slate-800 transition-colors group">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 group-hover:text-white transition-colors">{label}</div>
            <div className="text-3xl font-black mb-1">{value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{peak}</div>
        </div>
    );
}