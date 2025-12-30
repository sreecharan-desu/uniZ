import { useNavigate } from "react-router";
import { useAdminname } from "../../hooks/adminname";
import { useIsAuth } from "../../hooks/is_authenticated";
import { useState } from "react";
import {
  Settings,
  Users,
  UserPlus,
  ClipboardX,
  CheckSquare,
  UserCheck,
  Image,
  Mail,
  Zap,
  University,
} from "lucide-react";

// Elegant Quick Action Button
const QuickActionButton = ({
  onClick,
  title,
  subtitle,
  Icon,
}: {
  onClick: () => void;
  title: string;
  subtitle: string;
  Icon: typeof Users; // Lucide icon type
}) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between p-5 bg-white bg-opacity-90 backdrop-blur-sm border border-gray-300 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
  >
    <div className="flex items-center">
      <div className="bg-black p-3 rounded-full flex items-center justify-center shadow-sm">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <span className="font-semibold block text-gray-900">{title}</span>
        <span className="text-sm text-gray-500">{subtitle}</span>
      </div>
    </div>
    <div className="text-gray-400 transition-colors">→</div>
  </button>
);

export default function Admin() {
  useIsAuth();
  useAdminname();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const username = JSON.parse(localStorage.getItem("username") || `"Admin"`);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Welcome */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {username}</h1>
          <button
            onClick={() => navigate("/admin/settings")}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow"
            title="Settings"
          >
            <Settings className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl rounded-3xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-gray-900" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionButton
              onClick={() => navigate("/admin/searchstudents")}
              title="Search Students"
              subtitle="Access student records"
              Icon={Users}
            />
            <QuickActionButton
              onClick={() => navigate("/admin/addstudents")}
              title="Add Students"
              subtitle="Upload via CSV"
              Icon={UserPlus}
            />
            <QuickActionButton
              onClick={() => navigate("/admin/addgrades")}
              title="Add Grades"
              subtitle="Upload via CSV"
              Icon={ClipboardX}
            />
            <QuickActionButton
              onClick={() => navigate("/admin/addattendance")}
              title="Add Attendance"
              subtitle="Upload via CSV"
              Icon={CheckSquare}
            />
            <QuickActionButton
              onClick={() => navigate("/admin/roles")}
              title="Manage Roles"
              subtitle="Assign roles to admins"
              Icon={UserCheck}
            />
            <QuickActionButton
              onClick={() => navigate("/admin/banners")}
              title="Manage Banners"
              subtitle="Website alerts & images"
              Icon={Image}
            />
            <QuickActionButton
              onClick={() => navigate("/admin/notifications")}
              title="Send Notifications"
              subtitle="Email students easily"
              Icon={Mail}
            />
            <QuickActionButton
              onClick={() => navigate("/admin/curriculum")}
              title="Manage Curriculum"
              subtitle="Edit course content"
              Icon={University}
            />
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-xl shadow-lg flex items-center space-x-3 animate-fade-in">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-white hover:text-gray-300 font-bold"
              title="Close"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
