import { useNavigate } from "react-router";
import { useAdminname } from "../../hooks/adminname";
import { useIsAuth } from "../../hooks/is_authenticated";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Users,
  UserPlus,
  ClipboardX,
  CheckSquare,
  UserCheck,
  Image,
  Mail,
  CheckCircle,
  Zap,
  University,
  LogOut
} from "lucide-react";
import { clearSession } from "../../utils/security";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const QuickActionButton = ({
  onClick,
  title,
  subtitle,
  Icon,
  color = "bg-blue-600"
}: {
  onClick: () => void;
  title: string;
  subtitle: string;
  Icon: any;
  color?: string;
}) => (
  <motion.button
    variants={itemVariants}
    whileHover={{ scale: 1.03, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative group p-6 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left w-full overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-24 opacity-5 ${color} rounded-bl-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700`} />
    
    <div className="relative z-10 flex items-start space-x-4">
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg group-hover:rotate-6 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
      </div>
    </div>
    
    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-gray-400">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
    </div>
  </motion.button>
);

export default function Admin() {
  useIsAuth();
  useAdminname();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const username = JSON.parse(localStorage.getItem("username") || `"Admin"`);

  const handleLogout = () => {
      clearSession();
      navigate("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8 md:py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto space-y-8 relative z-10"
      >

        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Welcome back, {username}
            </h1>
            <p className="text-gray-500 font-medium">Manage your institution efficiently</p>
          </div>
          <div className="flex gap-3">
             <button
              onClick={() => navigate("/admin/settings")}
              className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 transition-colors shadow-sm"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="flex items-center space-x-2 px-2">
            <Zap className="w-5 h-5 text-blue-600 fill-current" />
            <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
          </motion.div>

          {/* High Priority Actions */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <QuickActionButton
              onClick={() => navigate("/admin/approveouting")}
              title="Approve Outings"
              subtitle="Review and process student outing requests"
              Icon={CheckCircle}
              color="bg-emerald-500"
            />
            <QuickActionButton
              onClick={() => navigate("/admin/approveoutpass")}
              title="Approve Outpasses"
              subtitle="Review and process student outpass requests"
              Icon={CheckCircle}
              color="bg-emerald-600"
            />
          </motion.div>

          {/* General Actions */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <QuickActionButton
              onClick={() => navigate("/admin/updatestudentstatus")}
              title="Update Status"
              subtitle="Mark In/Out of Campus"
              Icon={CheckCircle}
              color="bg-indigo-500"
            />
             <QuickActionButton
              onClick={() => navigate("/admin/searchstudents")}
              title="Search Students"
              subtitle="Find student records"
              Icon={Users}
              color="bg-blue-500"
            />
            <QuickActionButton
              onClick={() => navigate("/admin/addstudents")}
              title="Add Students"
              subtitle="Import via CSV"
              Icon={UserPlus}
              color="bg-blue-600"
            />
            <QuickActionButton
              onClick={() => navigate("/admin/addgrades")}
              title="Add Grades"
              subtitle="Academic records"
              Icon={ClipboardX}
              color="bg-violet-500"
            />
            <QuickActionButton
              onClick={() => navigate("/admin/addattendance")}
              title="Add Attendance"
              subtitle="Track presence"
              Icon={CheckSquare}
              color="bg-violet-600"
            />
            <QuickActionButton
              onClick={() => navigate("/admin/roles")}
              title="Manage Roles"
              subtitle="Admin permissions"
              Icon={UserCheck}
              color="bg-orange-500"
            />
             <QuickActionButton
              onClick={() => navigate("/admin/notifications")}
              title="Notifications"
              subtitle="Broadcast messages"
              Icon={Mail}
              color="bg-pink-500"
            />
             <QuickActionButton
              onClick={() => navigate("/admin/banners")}
              title="Banners"
              subtitle="Website alerts"
              Icon={Image}
              color="bg-rose-500"
            />
             <QuickActionButton
              onClick={() => navigate("/admin/curriculum")}
              title="Curriculum"
              subtitle="Course management"
              Icon={University}
              color="bg-cyan-600"
            />
          </motion.div>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-center space-x-3 z-50"
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-white/80 hover:text-white font-bold p-1"
            >
              ×
            </button>
          </motion.div>
        )}
      </motion.div>
    </div >
  );
}
