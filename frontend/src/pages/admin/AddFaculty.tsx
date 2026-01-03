import { useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useIsAuth } from "../../hooks/is_authenticated";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { UserPlus, User, Mail, Lock, Building, Briefcase, Phone } from "lucide-react";
import { CREATE_FACULTY } from "../../api/endpoints";

export default function AddFaculty() {
  useIsAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    department: "",
    designation: "",
    role: "teacher",
    contact: ""
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.name || !formData.email || !formData.department) {
        toast.error("Please fill all required fields");
        return;
    }

    setLoading(true);
    try {
        const token = localStorage.getItem("admin_token");
        if (!token) return;
        const res = await fetch(CREATE_FACULTY, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${JSON.parse(token)}`
            },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
            toast.success("Faculty created successfully!");
            setFormData({
                username: "", password: "", name: "", email: "", 
                department: "", designation: "", role: "teacher", contact: ""
            });
        } else {
            toast.error(data.msg || "Failed to create faculty");
        }
    } catch (err) {
        toast.error("An error occurred");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-sm rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    <UserPlus className="w-6 h-6" />
                </div>
                <div>
                   <h1 className="text-xl font-bold text-slate-900">Add Faculty Member</h1>
                   <p className="text-sm text-slate-500">Onboard new teaching staff or HODs</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="Staff ID / Username" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        placeholder="e.g. EMP123" 
                        icon={<User className="w-4 h-4"/>} 
                    />
                    <Input 
                        label="Full Name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Dr. John Doe" 
                        icon={<User className="w-4 h-4"/>} 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="Email Address" 
                        name="email" 
                        type="email"
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="john@university.edu" 
                        icon={<Mail className="w-4 h-4"/>} 
                    />
                    <Input 
                        label="Password" 
                        name="password" 
                        type="password"
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder="Strong password" 
                        icon={<Lock className="w-4 h-4"/>} 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Department</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Building className="w-4 h-4" />
                            </div>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none"
                            >
                                <option value="">Select Department</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="CIVIL">CIVIL</option>
                                <option value="MECH">MECH</option>
                                <option value="MME">MME</option>
                                <option value="CHEM">CHEM</option>
                            </select>
                        </div>
                    </div>
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Role</label>
                         <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <UserPlus className="w-4 h-4" />
                            </div>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none"
                            >
                                <option value="teacher">Teacher / Faculty</option>
                                <option value="hod">Head of Department (HOD)</option>
                            </select>
                        </div>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="Designation" 
                        name="designation" 
                        value={formData.designation} 
                        onChange={handleChange} 
                        placeholder="e.g. Assistant Professor" 
                        icon={<Briefcase className="w-4 h-4"/>} 
                    />
                     <Input 
                        label="Contact Number" 
                        name="contact" 
                        value={formData.contact} 
                        onChange={handleChange} 
                        placeholder="+91 9876543210" 
                        icon={<Phone className="w-4 h-4"/>} 
                    />
                </div>

                <div className="pt-4 flex gap-3">
                     <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1"
                        onClick={() => navigate("/admin")}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        className="flex-1"
                        isLoading={loading}
                    >
                        Create Account
                    </Button>
                </div>
            </form>
        </div>
    </div>
  );
}
