
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { BASE_URL } from "../../api/endpoints";
import { ArrowLeft, BookOpen, Save, RefreshCw, Plus, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { cn } from "../../utils/cn";

type Branch = "CSE" | "ECE" | "EEE" | "CIVIL" | "MECH";
type CurriculumData = Record<
  string,
  Record<string, Record<Branch, { names: string[]; credits: number[] }>>
>;

export default function CurriculumManager() {
  const navigate = useNavigate();
  const [data, setData] = useState<CurriculumData>({});
  const [year, setYear] = useState("E1");
  const [sem, setSem] = useState("Sem - 1");
  const [branch, setBranch] = useState<Branch>("CSE");
  const [status, setStatus] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCurriculum = async () => {
    setLoading(true);
    setStatus(null);
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
        setData(json.subjectsData || {});
        // setStatus({ msg: "Curriculum loaded successfully.", type: 'success' });
      } else {
        setStatus({ msg: json.msg || "Failed to fetch curriculum.", type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ msg: "Error fetching curriculum.", type: 'error' });
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
    // Ensure structure exists
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
    setStatus(null);
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
      setStatus({ msg: json.msg || "Curriculum saved successfully.", type: json.success ? 'success' : 'error' });
    } catch (err) {
      console.error(err);
      setStatus({ msg: "Failed to populate curriculum", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const current = data[year]?.[sem]?.[branch] || { names: [], credits: [] };

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
                    <h1 className="text-2xl font-bold text-slate-900">Curriculum Management</h1>
                    <p className="text-slate-500 mt-1">Configure academic subjects and credits.</p>
                </div>
                 <div className="flex gap-3">
                     <Button variant="secondary" onClick={fetchCurriculum} size="sm" loading={loading && !status}>
                         <RefreshCw className={cn("w-4 h-4 mr-2", loading && !status && "animate-spin")} /> Refresh
                     </Button>
                     <Button onClick={populate} size="sm" loading={loading} className="bg-slate-900 hover:bg-black">
                         <Save className="w-4 h-4 mr-2" /> Save Changes
                     </Button>
                 </div>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Year</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                      {["E1", "E2", "E3", "E4"].map((y) => (
                        <button
                          key={y}
                          onClick={() => setYear(y)}
                          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                            year === y
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                  </div>
            </div>

            <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Semester</label>
                 <select
                  value={sem}
                  onChange={(e) => setSem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  >
                  <option value="Sem - 1">Semester 1</option>
                  <option value="Sem - 2">Semester 2</option>
                  </select>
            </div>

            <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Branch</label>
                 <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as Branch)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  >
                  {["CSE", "ECE", "EEE", "CIVIL", "MECH"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  </select>
            </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
             <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                 <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-slate-500" />
                      <h3 className="font-semibold text-slate-900">
                           {year} - {sem} - {branch} Subjects
                      </h3>
                 </div>
                 {status && (
                     <div className={cn("text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5", 
                        status.type === 'success' ? "bg-emerald-100 text-emerald-700" :
                        status.type === 'error' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                     )}>
                         {status.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                          status.type === 'error' ? <AlertTriangle className="w-3.5 h-3.5" /> : null}
                         {status.msg}
                     </div>
                 )}
             </div>

             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-16 text-center">#</th>
                            <th className="px-6 py-4">Subject Name</th>
                            <th className="px-6 py-4 w-32">Credits</th>
                            <th className="px-6 py-4 w-24 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {current.names.map((n, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-3 text-center text-slate-400 font-mono text-xs">{i + 1}</td>
                                <td className="px-6 py-3">
                                    <Input
                                        value={n}
                                        onchangeFunction={(e: any) => updateCell(i, "name", e.target.value)}
                                        placeholder="Subject Name"
                                        className="bg-transparent border-transparent hover:border-slate-300 focus:bg-white transition-all h-9 text-sm"
                                    />
                                </td>
                                <td className="px-6 py-3">
                                     <Input
                                        type="number"
                                        value={current.credits[i]}
                                        onchangeFunction={(e: any) => updateCell(i, "credits", e.target.value)}
                                        placeholder="0"
                                        className="bg-transparent border-transparent hover:border-slate-300 focus:bg-white transition-all h-9 text-sm w-20"
                                    />
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button 
                                        onClick={() => removeRow(i)}
                                        className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
                 
                 {current.names.length === 0 && (
                     <div className="py-12 text-center text-slate-400">
                         <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
                         <p>No subjects configured for this semester yet.</p>
                     </div>
                 )}

                 <div className="p-4 bg-slate-50 border-t border-slate-200">
                     <button
                        onClick={addRow}
                        className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                     >
                         <Plus className="w-4 h-4" /> Add Subject
                     </button>
                 </div>
             </div>
        </div>
    </div>
  );
}
