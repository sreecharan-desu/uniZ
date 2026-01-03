import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { is_authenticated } from "../../store/atoms";
import { useNavigate } from "react-router-dom";
import { LogOut, BookOpen, User, Briefcase, Building, Mail, Phone, GraduationCap } from "lucide-react";
import { clearSession } from "../../utils/security";
import { PageTransition } from "../../components/Transition";

export default function FacultyDashboard() {
  const [authState] = useRecoilState(is_authenticated);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const username = JSON.parse(localStorage.getItem("username") || `"Professor"`);

  useEffect(() => {
    // Fetch profile
    const token = localStorage.getItem("faculty_token");
    if (!token) {
        navigate("/");
        return;
    }

    const fetchProfile = async () => {
        try {
             // We can use a simplified endpoint or the /me endpoint
             // For now, let's just use the localStorage data or fetch real data
             // Assuming /api/v1/faculty/me exists and works
             const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/faculty/me`, {
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

  const ActionCard = ({ title, subtitle, icon: Icon, color, onClick }: any) => (
      <button 
        onClick={onClick}
        className="group flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-slate-300 transition-all text-left w-full h-full"
      >
         <div className={`p-3 rounded-lg mb-4 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
         </div>
         <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{title}</h3>
         <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xl font-bold">
                 {profile?.Name?.[0] || "P"}
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-slate-900">
                    Hello, {profile?.Name || username}
                 </h1>
                 <p className="text-slate-500">
                    {profile?.Designation || "Faculty Member"} • {profile?.Department || "General"}
                 </p>
              </div>
           </div>
           <button
             onClick={handleLogout}
             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium transition-colors"
           >
             <LogOut className="w-4 h-4" /> Sign Out
           </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard 
                title="My Courses" 
                subtitle="Manage subjects and curriculum" 
                icon={BookOpen} 
                color="bg-indigo-500" 
            />
            <ActionCard 
                title="Student Attendance" 
                subtitle="Mark and review attendance" 
                icon={User} 
                color="bg-emerald-500" 
            />
             <ActionCard 
                title="Research Profile" 
                subtitle="Update your academic portfolio" 
                icon={GraduationCap} 
                color="bg-violet-500" 
            />
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-slate-400" /> Account Details
             </h2>
             {loading ? (
                 <div className="animate-pulse space-y-4">
                     <div className="h-4 bg-slate-100 w-1/4 rounded"></div>
                     <div className="h-4 bg-slate-100 w-1/2 rounded"></div>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                        <p className="font-medium text-slate-900 text-lg">{profile?.Name}</p>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <p className="font-medium text-slate-900 text-lg flex items-center gap-2">
                             <Mail className="w-4 h-4 text-slate-400" /> {profile?.Email}
                        </p>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
                        <p className="font-medium text-slate-900 text-lg flex items-center gap-2">
                             <Building className="w-4 h-4 text-slate-400" /> {profile?.Department}
                        </p>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</label>
                        <p className="font-medium text-slate-900 text-lg flex items-center gap-2">
                             <Phone className="w-4 h-4 text-slate-400" /> {profile?.Contact || "Not provided"}
                        </p>
                     </div>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
}
