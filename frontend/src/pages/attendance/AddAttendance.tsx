
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import {
  Upload,
  FileDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowLeft,
  X,
  FileSpreadsheet
} from "lucide-react";
import { BASE_URL } from "../../api/endpoints";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { cn } from "../../utils/cn";

export default function AddAttendance() {
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [year, setYear] = useState("E1");
  const [sem, setSem] = useState("Sem - 1");
  const [branch, setBranch] = useState("CSE");
  const [processId, setProcessId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!processId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}/admin/progress?processId=${processId}`, {
          headers: { Authorization: `Bearer ${JSON.parse(token!)}` },
        });
        const data = await res.json();
        if (data.success) {
          setProgress(data);
          if (["completed", "failed"].includes(data.status)) clearInterval(interval);
        } else clearInterval(interval);
      } catch {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [processId]);

  const handleFile = async (f: File) => {
    try {
      setFile(f);
      setError(null);
      const buffer = await f.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);

      const json: any[] = [];
      const headerRow = worksheet?.getRow(1);
      const headers_found: string[] = [];
      
      headerRow?.eachCell((cell, colNumber) => {
        headers_found[colNumber] = cell.text;
      });

      worksheet?.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = headers_found[colNumber];
          if (header) rowData[header] = cell.text;
        });
        if (Object.keys(rowData).length > 0) json.push(rowData);
      });

      if (!json.length) throw new Error("Empty file or invalid format");
      setHeaders(headers_found.filter(Boolean));
      setRows(json.map((r, i) => ({ id: i + 1, ...r })));
    } catch (err: any) {
      setError(err.message);
      setFile(null);
      setRows([]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setRows([]);
    setHeaders([]);
    setError(null);
  };

  const buildPayload = () => {
    const studentsMap: Record<string, { Username: string; Attendance: any[] }> = {};
    rows.forEach((r) => {
      if (!r.Username) return;
      if (!studentsMap[r.Username])
        studentsMap[r.Username] = { Username: r.Username, Attendance: [] };
      studentsMap[r.Username].Attendance.push({
        SubjectName: r.SubjectName,
        ClassesHappened: Number(r.ClassesHappened) || 0,
        ClassesAttended: Number(r.ClassesAttended) || 0,
      });
    });
    return { year, SemesterName: sem, branch, Students: Object.values(studentsMap) };
  };

  const handleUpload = async () => {
    if (!rows.length) return setError("Select a valid file first");
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/admin/addattendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token!)}`,
        },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (data.success) setProcessId(data.processId);
      else setError(data.msg);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/attendance/template`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token!)}`,
        },
        body: JSON.stringify({ year, semester: sem, branch }),
      });
       if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${year}_${sem}_${branch}_attendance_template.xlsx`;
      a.click();
      a.remove();
    } catch {
      setError("Error downloading template");
    }
  };

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    return rows.filter((r) =>
      Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

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
                    <h1 className="text-2xl font-bold text-slate-900">Wait, Add Attendance?</h1>
                    <p className="text-slate-500 mt-1">Bulk upload attendance records.</p>
                </div>
                 <div className="flex gap-3">
                     <Button variant="secondary" onClick={downloadTemplate} size="sm">
                         <FileDown className="w-4 h-4 mr-2" /> Template
                     </Button>
                 </div>
            </div>
        </div>

        {/* Configuration */}
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
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  >
                  {["CSE", "ECE", "EEE", "CIVIL", "MECH"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  </select>
            </div>
        </div>

        {/* Upload Area */}
        {!rows.length ? (
            <div className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200",
                error ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
            )}>
                 <input
                    id="fileInput"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                    className="hidden"
                />
                <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-slate-900">Click to upload attendance sheet</p>
                        <p className="text-slate-500 text-sm mt-1">Supports .xlsx, .xls, .csv</p>
                    </div>
                </label>
                {error && <p className="text-red-600 font-medium mt-4 flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4"/> {error}</p>}
            </div>
      ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* File Info Bar */}
               <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-800 rounded-lg">
                            <FileSpreadsheet className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="font-semibold">{file?.name}</p>
                            <p className="text-xs text-slate-400">{rows.length} records loaded</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={clearFile}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Remove File"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
               </div>

                {/* Table Preview */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                         <h3 className="font-semibold text-slate-900">Review Data</h3>
                         <div className="w-full sm:w-72">
                             <Input 
                                placeholder="Search rows..." 
                                value={search}
                                onchangeFunction={(e: any) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                             />
                         </div>
                    </div>
                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 w-full">
                                <tr>
                                    {headers.map((h, i) => (
                                        <th key={i} className="px-6 py-3 font-semibold border-b border-slate-200 min-w-[150px]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRows.map((r) => (
                                    <tr key={r.id} className="bg-white hover:bg-slate-50 transition-colors">
                                        {headers.map((h, i) => (
                                            <td key={i} className="px-6 py-3 whitespace-nowrap text-slate-700">
                                                 <input
                                                    value={r[h] || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setRows((prev) => prev.map((row) => row.id === r.id ? { ...row, [h]: val } : row));
                                                    }}
                                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-700"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                         <Button 
                            onClick={handleUpload} 
                            isLoading={uploading}
                            disabled={uploading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Upload className="w-4 h-4 mr-2" /> Process Attendance
                         </Button>
                    </div>
                </div>
          </div>
      )}

      {/* Progress & Errors */}
      {progress && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-10 duration-500 w-96">
              <div className="bg-white rounded-xl shadow-2xl p-6 border border-slate-100 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                         <span className="font-bold text-slate-900 block">Processing Upload</span>
                         <span className={cn("text-xs font-semibold uppercase", 
                            progress.status === 'completed' ? 'text-green-600' : 
                            progress.status === 'failed' ? 'text-red-600' : 'text-blue-600'
                         )}>
                            {progress.status}
                         </span>
                    </div>
                    <span className="text-sm font-bold text-slate-500">{progress.percentage}%</span>
                </div>
                
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                        className={cn("h-full rounded-full transition-all duration-500", 
                            progress.status === 'completed' ? 'bg-green-500' : 
                            progress.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                        )} 
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
                
                {progress.status === 'completed' && (
                     <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Success! Attendance updated.
                    </div>
                )}
              </div>
          </div>
        )}
    </div>
  );
}
