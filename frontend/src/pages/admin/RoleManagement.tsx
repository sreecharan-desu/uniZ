/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../apis";

type AdminUser = {
  id: string;
  username: string;
  role: string;
  permissions: string[];
};

type RolePermissions = Record<string, string[]>;

export default function RoleManagement() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<RolePermissions>({});
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "add" | "permissions">("overview");

  const [newAdmin, setNewAdmin] = useState({ username: "", password: "", role: "dean" });
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [customPerms, setCustomPerms] = useState<string[]>([]);

  const token = localStorage.getItem("admin_token");

  const authHeader = {
    Authorization: `Bearer ${JSON.parse(token || '""')}`,
    "Content-Type": "application/json",
  };

  // 🔹 Fetch Admins and Roles
  const fetchAll = async () => {
    if (!token) return navigate("/admin/login");
    setLoading(true);
    try {
      const [rolesRes, adminsRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/roles`, { headers: authHeader }),
        fetch(`${BASE_URL}/admin/getadmins`, { headers: authHeader }),
      ]);

      const rolesData = await rolesRes.json();
      const adminsData = await adminsRes.json();

      if (rolesData.success) {
        setPermissions(rolesData.roles);
        setRoles(Object.keys(rolesData.roles));
      }
      if (adminsData.success) {
        const arr = adminsData.admins.map((a: any) => ({
          id: a.id,
          username: a.Username,
          role: a.role,
          permissions: rolesData.roles[a.role] || [],
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

  // 🔹 Add Admin
  const addAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) return alert("All fields required");
    try {
      const res = await fetch(`${BASE_URL}/admin/addadmin`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify(newAdmin),
      });
      const data = await res.json();
      alert(data.msg);
      if (data.success) {
        setNewAdmin({ username: "", password: "", role: "dean" });
        fetchAll();
        setTab("overview");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding admin");
    }
  };

  // 🔹 Delete Admin
  const deleteAdmin = async (username: string) => {
    if (!window.confirm(`Are you sure you want to remove ${username}?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/deleteadmin/${username}`, {
        method: "DELETE",
        headers: authHeader,
      });
      const data = await res.json();
      alert(data.msg);
      if (data.success) fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error deleting admin");
    }
  };

  // 🔹 Update Role
  const updateRole = async (username: string, role: string) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/assign-role`, {
        method: "PUT",
        headers: authHeader,
        body: JSON.stringify({ username, role }),
      });
      const data = await res.json();
      alert(data.msg);
      if (data.success) fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error updating role");
    }
  };

  // 🔹 Update Permissions
  const updatePermissions = async () => {
    if (!selectedAdmin) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/${selectedAdmin}/permissions`, {
        method: "PUT",
        headers: authHeader,
        body: JSON.stringify({ permissions: customPerms }),
      });
      const data = await res.json();
      alert(data.msg);
      if (data.success) fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error updating permissions");
    }
  };

  // 🔹 Search Admin
  const searchAdmin = (value: string) => {
    setSearch(value);
    setFiltered(
      admins.filter((a) =>
        a.username.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-white/90 backdrop-blur-xl p-10">
      <div className="max-w-6xl mx-auto bg-white/60 shadow-2xl rounded-3xl p-10 border border-gray-200">
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
          Admin Management
        </h1>

        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b border-gray-200">
          {["overview", "add", "permissions"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`pb-2 font-semibold transition-all ${
                tab === t
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t === "overview"
                ? "Overview"
                : t === "add"
                ? "Add Admin"
                : "Permissions"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div>
            <input
              type="text"
              placeholder="Search admin..."
              value={search}
              onChange={(e) => searchAdmin(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 mb-6 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <table className="w-full text-left border border-gray-200 rounded-xl">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2">Username</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="px-4 py-2">{a.username}</td>
                      <td className="px-4 py-2">
                        <select
                          value={a.role}
                          onChange={(e) =>
                            updateRole(a.username, e.target.value)
                          }
                          className="border border-gray-300 rounded-lg p-2 bg-transparent"
                        >
                          {roles.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => {
                            setSelectedAdmin(a.username);
                            setCustomPerms(a.permissions);
                            setTab("permissions");
                          }}
                          className="text-gray-700 hover:underline mr-4"
                        >
                          Permissions
                        </button>
                        <button
                          onClick={() => deleteAdmin(a.username)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Add Admin Tab */}
        {tab === "add" && (
          <div className="space-y-4 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Username"
              value={newAdmin.username}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, username: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl p-3"
            />
            <input
              type="password"
              placeholder="Password"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, password: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl p-3"
            />
            <select
              value={newAdmin.role}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, role: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl p-3"
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <button
              onClick={addAdmin}
              className="w-full bg-gray-900 text-white rounded-xl py-3 hover:bg-gray-800 transition"
            >
              Add Admin
            </button>
          </div>
        )}

        {/* Permissions Tab */}
        {tab === "permissions" && selectedAdmin && (
          <div className="max-w-lg mx-auto space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {selectedAdmin}'s Permissions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(permissions)
                .flat()
                .filter((p, i, arr) => arr.indexOf(p) === i)
                .map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center space-x-2 text-gray-700"
                  >
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
                      className="accent-gray-800"
                    />
                    <span>{perm}</span>
                  </label>
                ))}
            </div>
            <button
              onClick={updatePermissions}
              className="mt-6 w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800"
            >
              Save Permissions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
