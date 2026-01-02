
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../api/endpoints";
import {
  UserPlus,
  Users,
  Search,
  Trash2,
  Settings,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { cn } from "../../utils/cn";

type Role = "webmaster" | "dean" | "director";
type Permission =
  | "manage_banners"
  | "send_notifications"
  | "assign_roles"
  | "manage_users"
  | "manage_curriculum"
  | "view_reports";

type AdminUser = {
  id: string;
  username: string;
  role: Role;
};

type RolePermissions = Record<Role, Permission[]>;

export default function RoleManagement() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<RolePermissions>({} as any);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "add" | "permissions">("overview");
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    role: "dean" as Role,
  });
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [customPerms, setCustomPerms] = useState<Permission[]>([]);

  const token = localStorage.getItem("admin_token");
  const headers = {
    Authorization: `Bearer ${JSON.parse(token || '""')}`,
    "Content-Type": "application/json",
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [roleRes, adminRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/roles`, { headers }),
        fetch(`${BASE_URL}/admin/getadmins`, { headers }),
      ]);
      const roleData = await roleRes.json();
      const adminData = await adminRes.json();

      if (roleData.success) {
        setPermissions(roleData.roles);
        setRoles(Object.keys(roleData.roles) as Role[]);
      }
      if (adminData.success) {
        const arr = adminData.admins.map((a: any) => ({
          id: a.id,
          username: a.Username,
          role: a.role,
        }));
        setAdmins(arr);
        setFiltered(arr);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching admins or roles");
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password)
      return alert("All fields required");
    try {
      const res = await fetch(`${BASE_URL}/admin/addadmin`, {
        method: "POST",
        headers,
        body: JSON.stringify(newAdmin),
      });
      const data = await res.json();
      alert(data.msg);
      if (data.success) {
        fetchAll();
        setNewAdmin({ username: "", password: "", role: "dean" });
        setTab("overview");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding admin");
    }
  };

  const deleteAdmin = async (username: string) => {
    if (!window.confirm(`Delete admin ${username}?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/deleteadmin/${username}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      alert(data.msg);
      if (data.success) fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error deleting admin");
    }
  };

  const assignRole = async (username: string, role: Role) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/assign-role`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ username, role }),
      });
      const data = await res.json();
      alert(data.msg);
      if (data.success) fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error assigning role");
    }
  };

  const updateRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      const res = await fetch(
        `${BASE_URL}/admin/roles/${selectedRole}/permissions`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ permissions: customPerms }),
        }
      );
      const data = await res.json();
      alert(data.msg);
      if (data.success) fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error updating permissions");
    }
  };

  const searchAdmin = async (query: string) => {
    setSearch(query);
    if (!query.trim()) return setFiltered(admins);
    try {
      const res = await fetch(
        `${BASE_URL}/admin/searchadmin?q=${encodeURIComponent(query)}`,
        { headers }
      );
      const data = await res.json();
      if (data.success) {
        const arr = data.admins.map((a: any) => ({
          id: a.id,
          username: a.Username,
          role: a.role,
        }));
        setFiltered(arr);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
         <div className="flex flex-col gap-6">
            <button
                onClick={() => navigate("/admin")}
                className="self-start inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Role Management</h1>
                    <p className="text-slate-500 mt-1">Configure admin access and role-based permissions.</p>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200">
             {[
            { key: "overview", label: "Admins Overview", icon: <Users className="w-4 h-4" /> },
            { key: "add", label: "Add New Admin", icon: <UserPlus className="w-4 h-4" /> },
            { key: "permissions", label: "Permission Sets", icon: <Settings className="w-4 h-4" /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={cn(
                  "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all hover:bg-slate-50",
                  tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
            {/* Overview Tab */}
            {tab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <div className="w-full md:w-96">
                        <Input 
                            value={search}
                            onchangeFunction={(e: any) => searchAdmin(e.target.value)}
                            placeholder="Find admin by username..."
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                        {filtered.length} Admins
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Admin User</th>
                            <th className="px-6 py-4">Assigned Role</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {loading ? (
                             [1,2,3].map(i => (
                                 <tr key={i} className="animate-pulse">
                                     <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"/></td>
                                     <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded w-24"/></td>
                                     <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded w-8 ml-auto"/></td>
                                 </tr>
                             ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                    No admins found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((a) => (
                                <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {a.username}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative inline-block w-40">
                                        <select
                                            value={a.role}
                                            onChange={(e) => assignRole(a.username, e.target.value as Role)}
                                            className="appearance-none w-full bg-white border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-sm transition-all hover:border-slate-300"
                                        >
                                            {roles.map((r) => (
                                                <option key={r} value={r} className="capitalize">{r}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => deleteAdmin(a.username)}
                                        className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                        title="Delete Admin"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            {/* Add Admin Tab */}
            {tab === "add" && (
            <div className="max-w-xl mx-auto animate-in fade-in duration-300 pt-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                     <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Create New Admin</h2>
                        <p className="text-slate-500 mt-1">Grant administrative access to a new user.</p>
                     </div>

                     <div className="space-y-5">
                         <Input
                            label="Username"
                            value={newAdmin.username}
                            onchangeFunction={(e: any) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                            placeholder="Choose a username"
                         />
                         <Input
                            label="Password"
                            type="password"
                            value={newAdmin.password}
                            onchangeFunction={(e: any) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                            placeholder="Set a strong password"
                         />
                         
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Initial Role</label>
                             <select
                                value={newAdmin.role}
                                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as Role })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            >
                                {roles.map((r) => (
                                    <option key={r} value={r} className="capitalize">{r}</option>
                                ))}
                            </select>
                         </div>
                         
                         <div className="pt-4">
                             <Button
                                onclickFunction={addAdmin}
                                value="Create Admin Account"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                             />
                         </div>
                     </div>
                </div>
            </div>
            )}

            {/* Permissions Tab */}
            {tab === "permissions" && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Role Selector Sidebar */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 h-fit">
                        <h3 className="font-semibold text-slate-900 px-2 mb-3 text-sm uppercase tracking-wide">Select Role</h3>
                        <div className="space-y-1">
                             <button
                                onClick={() => {
                                    setSelectedRole(null);
                                    setCustomPerms([]);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    !selectedRole ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                                )}
                             >
                                 Select a role...
                             </button>
                             {roles.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => {
                                        setSelectedRole(r);
                                        setCustomPerms(permissions[r] || []);
                                    }}
                                    className={cn(
                                        "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                                        selectedRole === r ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {r}
                                </button>
                             ))}
                        </div>
                    </div>
                    
                    {/* Permissions Editor */}
                    <div className="md:col-span-2">
                         {selectedRole ? (
                             <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase text-lg">
                                        {selectedRole[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 capitalize">{selectedRole} Permissions</h3>
                                        <p className="text-sm text-slate-500">Configure what this role can access.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                     {(
                                        [
                                            "manage_banners",
                                            "send_notifications",
                                            "assign_roles",
                                            "manage_users",
                                            "manage_curriculum",
                                            "view_reports",
                                        ] as Permission[]
                                        ).map((perm) => {
                                           const isChecked = customPerms.includes(perm);
                                           return (
                                            <div 
                                                key={perm}
                                                onClick={() => {
                                                    setCustomPerms((prev) =>
                                                        isChecked ? prev.filter((x) => x !== perm) : [...prev, perm]
                                                    )
                                                }}
                                                className={cn(
                                                    "flex items-center p-4 border rounded-xl cursor-pointer transition-all",
                                                    isChecked ? "border-blue-200 bg-blue-50/50" : "border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 rounded border flex items-center justify-center mr-4 transition-colors",
                                                    isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                                                )}>
                                                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="font-medium text-slate-800 capitalize select-none">
                                                    {perm.replace('_', ' ')}
                                                </span>
                                            </div>
                                           );
                                        })}
                                </div>
                                
                                <div className="pt-8 mt-4 border-t border-slate-100 flex justify-end">
                                    <Button
                                        onclickFunction={updateRolePermissions}
                                        value="Save Changes"
                                        className="bg-slate-900 hover:bg-black"
                                    />
                                </div>
                             </div>
                         ) : (
                             <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                                 <ShieldCheck className="w-12 h-12 mb-4 opacity-50" />
                                 <p className="font-medium text-slate-600">No Role Selected</p>
                                 <p className="text-sm mt-1">Select a role from the sidebar to configure permissions.</p>
                             </div>
                         )}
                    </div>
                </div>
            </div>
            )}
        </div>
    </div>
  );
}
