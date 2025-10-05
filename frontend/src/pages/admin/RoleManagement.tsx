/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../apis";
import {
  UserPlus,
  Users,
  Loader2,
  Search,
  Trash2,
  Settings,
  ShieldCheck,
} from "lucide-react";

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

  const Skeleton = () => (
    <tr className="animate-pulse border-t border-gray-100">
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-black" />
            Role & Permissions Management
          </h1>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-10 mb-8 border-b border-gray-200">
          {[
            { key: "overview", label: "Overview", icon: <Users className="w-5 h-5" /> },
            { key: "add", label: "Add Admin", icon: <UserPlus className="w-5 h-5" /> },
            { key: "permissions", label: "Role Permissions", icon: <Settings className="w-5 h-5" /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`pb-3 flex items-center gap-2 font-semibold ${
                tab === t.key
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search admin..."
                value={search}
                onChange={(e) => searchAdmin(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 p-3 focus:ring-2 focus:ring-gray-200 outline-none"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Username</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
                    : filtered.map((a) => (
                        <tr
                          key={a.id}
                          className="border-t border-gray-100 hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3">{a.username}</td>
                          <td className="px-4 py-3">
                            <select
                              value={a.role}
                              onChange={(e) =>
                                assignRole(a.username, e.target.value as Role)
                              }
                              className="border border-gray-300 rounded-lg px-2 py-1 bg-transparent"
                            >
                              {roles.map((r) => (
                                <option key={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 flex items-center gap-3">
                            <button
                              onClick={() => deleteAdmin(a.username)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
              {loading && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                </div>
              )}
            </div>
          </>
        )}

        {/* Add Admin Tab */}
        {tab === "add" && (
          <div className="max-w-md mx-auto bg-white bg-opacity-90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl p-8">
            <input
              type="text"
              placeholder="Username"
              value={newAdmin.username}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, username: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-gray-200 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, password: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-gray-200 outline-none"
            />
            <select
              value={newAdmin.role}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, role: e.target.value as Role })
              }
              className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-gray-200 outline-none"
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <button
              onClick={addAdmin}
              className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Add Admin
            </button>
          </div>
        )}

        {/* Permissions Tab */}
        {tab === "permissions" && (
          <div className="max-w-lg mx-auto bg-white bg-opacity-90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
              Manage Role Permissions
            </h2>
            <select
              value={selectedRole || ""}
              onChange={(e) => {
                const role = e.target.value as Role;
                setSelectedRole(role);
                setCustomPerms(permissions[role] || []);
              }}
              className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-gray-200 outline-none"
            >
              <option value="">Select a role</option>
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            {selectedRole && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(
                    [
                      "manage_banners",
                      "send_notifications",
                      "assign_roles",
                      "manage_users",
                      "manage_curriculum",
                      "view_reports",
                    ] as Permission[]
                  ).map((perm) => (
                    <label key={perm} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={customPerms.includes(perm)}
                        onChange={(e) =>
                          setCustomPerms((prev) =>
                            e.target.checked
                              ? [...prev, perm]
                              : prev.filter((x) => x !== perm)
                          )
                        }
                        className="accent-black"
                      />
                      <span className="text-gray-700">{perm}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={updateRolePermissions}
                  className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition"
                >
                  Save Permissions
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
