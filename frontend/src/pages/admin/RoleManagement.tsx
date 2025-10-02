import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../apis";

type AdminUser = {
  _id: string;
  username: string;
  role: string;
  permissions: string[];
};

export default function RoleManagement() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

const token = localStorage.getItem("admin_token");

const fetchAdminsAndRoles = async () => {
  if (!token) {
    navigate("/admin/login");
    return;
  }
  setLoading(true);
  try {
    // Fetch roles
    const rolesRes = await fetch(`${BASE_URL}/admin/roles`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`, // no JSON.parse
      },
    });
    const rolesData = await rolesRes.json();
    if (rolesData.success) setRoles(Object.keys(rolesData.roles));

    // Fetch admins
    const adminsRes = await fetch(`${BASE_URL}/admin/getadmins`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`,
      },
    });
    const adminsData = await adminsRes.json();
    if (adminsData.success) setAdmins(
      adminsData.admins.map((a:any) => ({
        _id: a.id,
        username: a.Username,
        role: a.role,
        permissions: rolesData.roles[a.role] || [],
      }))
    );
    else setError(adminsData.msg);
  } catch (err) {
    console.error(err);
    setError("Error fetching roles/admins.");
  } finally {
    setLoading(false);
  }
};


  const updateRole = async (username: string, role: string) => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/admin/assign-role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: JSON.stringify({ username, role }),
      });
      const data = await res.json();
      if (data.success) fetchAdminsAndRoles();
      else alert(data.msg || "Failed to update role");
    } catch (err) {
      console.error(err);
      alert("Error updating role.");
    }
  };

  useEffect(() => {
    fetchAdminsAndRoles();
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>

        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Role Management</h1>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id} className="border-b">
                    <td className="px-4 py-2">{admin.username}</td>
                    <td className="px-4 py-2">{admin.role}</td>
                    <td className="px-4 py-2">
                      <select
                        defaultValue={admin.role}
                        onChange={(e) => updateRole(admin.username, e.target.value)}
                        className="border border-gray-300 rounded-lg p-2"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
