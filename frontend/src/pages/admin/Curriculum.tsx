/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { BASE_URL } from "../../apis";

type Branch = "CSE" | "ECE" | "EEE" | "CIVIL" | "MECH";
type CurriculumData = Record<
  string,
  Record<string, Record<Branch, { names: string[]; credits: number[] }>>
>;

export default function CurriculumManager() {
  const [data, setData] = useState<CurriculumData>({});
  const [year, setYear] = useState("E1");
  const [sem, setSem] = useState("Sem - 1");
  const [branch, setBranch] = useState<Branch>("CSE");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch curriculum from backend
  const fetchCurriculum = async () => {
    setLoading(true);
    setStatus("");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${BASE_URL}/admin/get-curriculum`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${JSON.parse(token)}` : "",
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.subjectsData || {}); // ✅ Use subjectsData from API
        setStatus("Curriculum loaded successfully.");
        console.log("Fetched curriculum:", json.subjectsData);
      } else {
        setStatus(json.msg || "Failed to fetch curriculum.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error fetching curriculum.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const updateCell = (i: number, field: "name" | "credits", value: string) => {
    const updated = structuredClone(data);
    if (!updated[year]) updated[year] = {};
    if (!updated[year][sem]) {
      updated[year][sem] = {
        CSE: { names: [], credits: [] },
        ECE: { names: [], credits: [] },
        EEE: { names: [], credits: [] },
        CIVIL: { names: [], credits: [] },
        MECH: { names: [], credits: [] },
      };
    }
    if (!updated[year][sem][branch]) updated[year][sem][branch] = { names: [], credits: [] };

    const current = updated[year][sem][branch];

    if (field === "name") current.names[i] = value;
    else current.credits[i] = Number(value);

    setData(updated);
  };

  const addRow = () => {
    const updated = structuredClone(data);
    if (!updated[year]) updated[year] = {};
    if (!updated[year][sem]) {
      updated[year][sem] = {
        CSE: { names: [], credits: [] },
        ECE: { names: [], credits: [] },
        EEE: { names: [], credits: [] },
        CIVIL: { names: [], credits: [] },
        MECH: { names: [], credits: [] },
      };
    }
    if (!updated[year][sem][branch]) updated[year][sem][branch] = { names: [], credits: [] };

    updated[year][sem][branch].names.push("");
    updated[year][sem][branch].credits.push(0);
    setData(updated);
  };

  const removeRow = (i: number) => {
    const updated = structuredClone(data);
    const current = updated[year][sem][branch];
    if (!current) return;
    current.names.splice(i, 1);
    current.credits.splice(i, 1);
    setData(updated);
  };

  const populate = async () => {
    setLoading(true);
    setStatus("");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${BASE_URL}/admin/populate-curriculum`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${JSON.parse(token)}` : "",
        },
        body: JSON.stringify({ subjectsData: data }),
      });
      const json = await res.json();
      setStatus(json.msg || "Curriculum populated successfully.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to populate curriculum");
    } finally {
      setLoading(false);
    }
  };

  const current = data[year]?.[sem]?.[branch] || { names: [], credits: [] };

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-6xl mx-auto bg-white/70 shadow-2xl rounded-2xl p-8 border border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Curriculum Manager</h1>

<div className="flex flex-wrap gap-4 mb-6">
  {/* Year */}
  <select value={year} onChange={(e) => setYear(e.target.value)} className="border border-gray-300 rounded-lg p-2">
    {["E1","E2","E3","E4"].map(y => <option key={y} value={y}>{y}</option>)}
  </select>

  {/* Semester */}
  <select value={sem} onChange={(e) => setSem(e.target.value)} className="border border-gray-300 rounded-lg p-2">
    {["Sem - 1","Sem - 2"].map(s => <option key={s} value={s}>{s}</option>)}
  </select>

  {/* Branch */}
  <select value={branch} onChange={(e) => setBranch(e.target.value as Branch)} className="border border-gray-300 rounded-lg p-2">
    {["CSE","ECE","EEE","CIVIL","MECH"].map(b => <option key={b} value={b}>{b}</option>)}
  </select>
</div>



        {/* Editable Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-xl">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2 text-left">Subject Name</th>
                <th className="px-3 py-2 text-left">Credits</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.names.map((n, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                  <td className="px-3 py-2">
                    <input type="text" value={n} onChange={(e) => updateCell(i, "name", e.target.value)}
                           className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 bg-transparent"/>
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={current.credits[i]} onChange={(e) => updateCell(i, "credits", e.target.value)}
                           className="w-24 p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 bg-transparent"/>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeRow(i)} className="px-3 py-1 text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addRow} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add Subject</button>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          <button onClick={fetchCurriculum} disabled={loading} className={`px-6 py-3 rounded-xl font-semibold ${loading ? "bg-gray-400" : "bg-gray-800 text-white hover:bg-black"}`}>
            Refresh Data
          </button>

          <button onClick={populate} disabled={loading} className={`px-6 py-3 rounded-xl font-semibold ${loading ? "bg-gray-400" : "bg-black text-white hover:bg-gray-800"}`}>
            {loading ? "Processing..." : "Populate Curriculum"}
          </button>
        </div>

        {status && <p className="text-center text-gray-700 mt-6 font-medium">{status}</p>}
      </div>
    </div>
  );
}
