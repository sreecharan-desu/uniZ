
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, BookOpen, User, Building, Mail, Phone, GraduationCap, LayoutGrid } from "lucide-react";
import { clearSession } from "../../utils/security";
import { motion } from "framer-motion";
import { BASE_URL } from "../../api/endpoints";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const username = JSON.parse(localStorage.getItem("username") || `"Professor"`);

  useEffect(() => {
    const token = localStorage.getItem("faculty_token");
    if (!token) {
        navigate("/");
        return;
    }

    const fetchProfile = async () => {
        try {
             // Correct endpoint is /faculty/me
             const res = await fetch(`${BASE_URL}/faculty/me`, {
                 headers: { Authorization: `Bearer ${JSON.parse(token)}` }
             });
             const data = await res.json();
             if (data.success) {
                 setProfile(data.faculty);
             }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const ActionCard = ({ title, subtitle, icon: Icon, onClick }: any) => (
      <button 
        onClick={onClick}
        className="group relative flex flex-col items-start p-6 bg-white border border-neutral-100 rounded-2xl hover:border-black/10 hover:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 text-left w-full h-full overflow-hidden"
      >
         <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
             <Icon className="w-24 h-24" />
         </div>
         <div className="p-3 rounded-xl bg-neutral-50 group-hover:bg-black group-hover:text-white transition-colors duration-300 mb-4 z-10">
            <Icon className="w-6 h-6" />
         </div>
         <div className="z-10">
             <h3 className="text-lg font-bold text-neutral-900 group-hover:translate-x-1 transition-transform">{title}</h3>
             <p className="text-xs font-medium text-neutral-500 mt-1 uppercase tracking-wide group-hover:text-neutral-400">{subtitle}</p>
         </div>
      </button>
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
         <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {profile?.Name?.[0] || "P"}
               </div>
               <div>
                  <h1 className="text-xl font-bold leading-none">
                     {profile?.Name || username}
                  </h1>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">
                     Faculty Dashboard
                  </p>
               </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        
        {/* Actions */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
             <div className="flex items-center gap-2 mb-6 ml-1">
                 <LayoutGrid className="w-5 h-5 text-black" />
                 <h2 className="text-lg font-black tracking-tight uppercase">Quick Actions</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard 
                    title="My Courses" 
                    subtitle="Manage subjects & syllabus" 
                    icon={BookOpen} 
                    onClick={() => {}} 
                />
                <ActionCard 
                    title="Student Attendance" 
                    subtitle="Mark daily attendance" 
                    icon={User} 
                    onClick={() => {}} 
                />
                <ActionCard 
                    title="Research Profile" 
                    subtitle="Update portfolio" 
                    icon={GraduationCap} 
                    onClick={() => {}} 
                />
            </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
             <h2 className="text-lg font-bold text-neutral-900 mb-8 flex items-center gap-2 border-b border-neutral-100 pb-4">
                <span className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center"><User className="w-4 h-4" /></span>
                Account Information
             </h2>
             {loading ? (
                 <div className="animate-pulse space-y-4">
                     <div className="h-5 bg-neutral-100 w-1/4 rounded"></div>
                     <div className="h-5 bg-neutral-100 w-1/2 rounded"></div>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Full Name</label>
                        <p className="font-bold text-neutral-900 text-xl">{profile?.Name}</p>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Email Address</label>
                        <p className="font-medium text-neutral-900 text-lg flex items-center gap-3">
                             <span className="p-1.5 bg-neutral-50 rounded-md"><Mail className="w-3.5 h-3.5" /></span> {profile?.Email}
                        </p>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Academic Info</label>
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-neutral-50 border border-neutral-100 rounded-lg text-sm font-bold flex items-center gap-2">
                                <Building className="w-3.5 h-3.5" /> {profile?.Department}
                            </span>
                             <span className="px-3 py-1 bg-black text-white rounded-lg text-sm font-bold">
                                {profile?.Designation || "Faculty"}
                            </span>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Contact</label>
                        <p className="font-medium text-neutral-900 text-lg flex items-center gap-3">
                             <span className="p-1.5 bg-neutral-50 rounded-md"><Phone className="w-3.5 h-3.5" /></span> {profile?.Contact || "Not provided"}
                        </p>
                     </div>
                 </div>
             )}
        </motion.div>
      </div>
    </div>
  );
}

