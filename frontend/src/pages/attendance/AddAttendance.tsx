import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Upload, FileDown, Loader2, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { BASE_URL } from "../../apis";

export default function AddAttendance() {
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [year, setYear] = useState("E1");
  const [sem, setSem] = useState("Sem - 1");
  const [processId, setProcessId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // --- Poll progress ---
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
        } else {
          setError(data.msg || "Failed to fetch progress");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Progress poll error", err);
        setError("Error fetching progress");
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [processId]);

  // --- File parser ---
  const handleFile = async (f: File) => {
    try {
      setFile(f);
      setError(null);
      setProgress(null); // clear previous progress
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!json.length) throw new Error("Empty file");
      setHeaders(Object.keys(json[0] as object));
      setRows(json.map((r, i) => ({ id: i + 1, ...(typeof r === "object" && r !== null ? r : {}) })));
    } catch (err: any) {
      console.error("Parse error", err);
      setError(err.message || "Failed to parse file");
      setFile(null);
      setRows([]);
      setProgress(null);
    }
  };

  // --- Build payload ---
  const buildPayload = () => {
    const studentsMap: Record<string, { IdNumber: string; Attendance: any[] }> = {};
    rows.forEach((r) => {
      if (!r.IdNumber) return;
      if (!studentsMap[r.IdNumber]) studentsMap[r.IdNumber] = { IdNumber: r.IdNumber, Attendance: [] };
      studentsMap[r.IdNumber].Attendance.push({
        SubjectName: r.SubjectName,
        ClassesHappened: Number(r.ClassesHappened) || 0,
        ClassesAttended: Number(r.ClassesAttended) || 0,
      });
    });
    return {
      SemesterName: `${year} ${sem}`,
      Students: Object.values(studentsMap),
    };
  };

  // --- Upload ---
  const handleUpload = async () => {
    if (!rows.length) return setError("Please select a valid file first");
    setUploading(true);
    setError(null);
    setProgress(null); // clear progress for realtime feel
    setProcessId(null);

    try {
      const payload = buildPayload();
      const res = await fetch(`${BASE_URL}/admin/addattendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token!)}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) setProcessId(data.processId);
      else setError(data.msg || "Upload failed");
    } catch (err: any) {
      console.error("Upload error", err);
      setError("Unexpected error during upload");
    } finally {
      setUploading(false);
    }
  };

  // --- Download template ---
  const downloadTemplate = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/attendance/template`, {
        headers: { Authorization: `Bearer ${JSON.parse(token!)}` },
      });
      if (!res.ok) throw new Error("Failed to download template");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Template download error", err);
      alert("Failed to download template");
    }
  };

  // --- Filter rows ---
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    return rows.filter((r) =>
      Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  // --- Inline edit ---
  const handleEdit = (id: number, field: string, value: string) => {
    setRows((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-300">
        <h1 className="text-2xl font-bold">Attendance Upload Manager</h1>
        <button onClick={() => navigate("/admin")} className="text-sm underline hover:opacity-70">← Back</button>
      </div>

      <div className="flex-1 flex flex-col p-8 space-y-6">
        <p className="text-sm text-gray-700">
          Upload attendance CSV/XLSX. Preview, edit, filter, and search before uploading.
        </p>

        {/* Semester select */}
        <div className="flex items-center gap-4">
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border border-black rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black">
            {["E1","E2","E3","E4"].map((y) => <option key={y}>{y}</option>)}
          </select>
          <select value={sem} onChange={(e) => setSem(e.target.value)} className="border border-black rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black">
            <option>Sem - 1</option>
            <option>Sem - 2</option>
          </select>
        </div>

        {/* File input */}
        <div className="border-2 border-dashed border-black rounded-lg p-8 text-center">
          <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => e.target.files && handleFile(e.target.files[0])} className="hidden" id="attendanceFileInput" />
          <label htmlFor="attendanceFileInput" className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="w-8 h-8" />
            {file ? <span className="font-medium">{file.name}</span> : <span>Select or Drag & Drop Spreadsheet</span>}
          </label>
        </div>

        {/* Search */}
        {rows.length > 0 && (
          <div className="flex items-center gap-2 border border-black rounded px-3 py-2 w-full">
            <Search className="w-5 h-5 text-gray-600" />
            <input type="text" placeholder="Search attendance..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none text-sm bg-transparent" />
          </div>
        )}

        {/* Table */}
        {rows.length > 0 && (
          <div className="flex-1 overflow-auto border border-black rounded">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 sticky top-0 border-b border-black">
                <tr>{headers.map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-300 hover:bg-gray-50">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2">
                        <input value={row[h] || ""} onChange={(e) => handleEdit(row.id, h, e.target.value)} className="w-full border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-4">
          <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 border border-black rounded hover:bg-black hover:text-white transition">
            <FileDown className="w-5 h-5" /> Download Template
          </button>
          <button onClick={handleUpload} disabled={uploading || !rows.length} className={`flex items-center gap-2 px-4 py-2 rounded text-white ${uploading || !rows.length ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}>
            {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
            Upload & Process
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Status: <b className={progress.status === "completed" ? "text-black" : progress.status === "failed" ? "text-red-600" : "text-gray-700"}>{progress.status}</b></span>
              <span>{progress.percentage}% done</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded">
              <div className={`h-3 transition-all duration-300 ${progress.status === "failed" ? "bg-red-600" : progress.status === "completed" ? "bg-black" : "bg-gray-600"}`} style={{ width: `${progress.percentage}%` }} />
            </div>

            {/* Show errors */}
            {progress.errors?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-600" /> Errors ({progress.errors.length})</h3>
                <ul className="list-disc list-inside text-sm mt-1 max-h-40 overflow-y-auto">
                  {progress.errors.map((err: any, idx: number) => (
                    <li key={idx}>{err.recordIndex != null ? `Record ${err.recordIndex}: ` : ""}{err.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {progress.status === "completed" && progress.errors?.length === 0 && (
              <div className="flex items-center gap-2 text-black text-sm"><CheckCircle2 className="w-5 h-5" /> All attendance processed successfully</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
