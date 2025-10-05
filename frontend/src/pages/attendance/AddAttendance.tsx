/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Upload,
  FileDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowLeft,
} from "lucide-react";
import { BASE_URL } from "../../apis";

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

  // Poll progress
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
      } catch {
        setError("Error fetching progress");
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [processId]);

  // Parse file
  const handleFile = async (f: File) => {
    try {
      setFile(f);
      setError(null);
      setProgress(null);
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!json.length) throw new Error("Empty file");
      setHeaders(Object.keys(json[0] as object));
      setRows(json.map((r, i) => ({ id: i + 1, ...(r as object) })));
    } catch (err: any) {
      setError(err.message || "Failed to parse file");
      setFile(null);
      setRows([]);
    }
  };

  // Build payload
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

  // Upload
  const handleUpload = async () => {
    if (!rows.length) return setError("Please select a valid file first");
    setUploading(true);
    setError(null);
    setProgress(null);
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
    } catch {
      setError("Unexpected error during upload");
    } finally {
      setUploading(false);
    }
  };

  // Download template
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
      if (!res.ok) {
        let errorMsg = "Failed to download template";
        try {
          const errorData = await res.json();
          errorMsg = errorData.msg || errorMsg;
        } catch {
          // ignore JSON parse error, use default message
        }
        throw new Error(errorMsg);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${year}_${sem}_${branch}_attendance_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Error downloading template");
    }
  };

  // Filter
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    return rows.filter((r) =>
      Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  // Inline edit
  const handleEdit = (id: number, field: string, value: string) => {
    setRows((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 flex flex-col items-center justify-start relative overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-2xl bg-white/30" />
      <div className="relative w-full max-w-6xl mt-10 mb-16 rounded-3xl bg-white/40 shadow-2xl border border-white/40 backdrop-blur-lg p-10 space-y-6 text-gray-900">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 rounded-full hover:bg-white/30 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold tracking-tight">
              Attendance Upload Manager
            </h1>
          </div>
        </div>

        <p className="text-sm text-gray-700">
          Upload or download attendance templates for any{" "}
          <b>Year, Semester, and Branch</b>. You can{" "}
          <b>preview, search, and edit</b> before uploading.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <select value={year} onChange={(e) => setYear(e.target.value)} className="glass-select">
            {["E1", "E2", "E3", "E4"].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
          <select value={sem} onChange={(e) => setSem(e.target.value)} className="glass-select">
            <option value="Sem - 1">Sem - 1</option>
            <option value="Sem - 2">Sem - 2</option>
          </select>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="glass-select">
            {["CSE", "ECE", "EEE", "CIVIL", "MECH"].map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* File Input */}
        <div className="glass-card border-dashed text-center py-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            className="hidden"
            id="attendanceFileInput"
          />
          <label htmlFor="attendanceFileInput" className="flex flex-col items-center gap-3 cursor-pointer">
            <Upload className="w-10 h-10 text-gray-700" />
            {file ? (
              <span className="font-semibold">{file.name}</span>
            ) : (
              <span className="text-gray-700 font-medium">
                Select or Drag & Drop Spreadsheet
              </span>
            )}
          </label>
        </div>

        {/* Search */}
        {rows.length > 0 && (
          <div className="glass-input flex items-center gap-2 px-3 py-2">
            <Search className="w-5 h-5 text-gray-700" />
            <input
              type="text"
              placeholder="Search attendance..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        )}

        {/* Table */}
        {rows.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-white/50 shadow-inner backdrop-blur-sm max-h-96 overflow-y-auto">
            <table className="w-full text-sm text-left text-gray-900">
              <thead className="sticky top-0 bg-white/70 backdrop-blur-md border-b border-gray-300">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-200 hover:bg-white/50">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2">
                        <input
                          value={row[h] || ""}
                          onChange={(e) => handleEdit(row.id, h, e.target.value)}
                          className="w-full bg-white/60 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 flex-wrap justify-end">
          <button onClick={downloadTemplate} className="glass-btn flex items-center gap-2">
            <FileDown className="w-5 h-5" /> Download Template
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !rows.length}
            className={`glass-btn flex items-center gap-2 ${
              uploading || !rows.length ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
            Upload & Process
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50/60 border border-red-300 rounded-lg p-3">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div className="space-y-3 bg-white/40 p-4 rounded-xl border border-white/60 backdrop-blur-sm">
            <div className="flex justify-between text-sm">
              <span>
                Status:{" "}
                <b
                  className={
                    progress.status === "completed"
                      ? "text-black"
                      : progress.status === "failed"
                      ? "text-red-600"
                      : "text-gray-700"
                  }
                >
                  {progress.status}
                </b>
              </span>
              <span>{progress.percentage}% done</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-3 transition-all duration-500 ${
                  progress.status === "failed"
                    ? "bg-red-600"
                    : progress.status === "completed"
                    ? "bg-black"
                    : "bg-gray-700"
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            {progress.errors?.length > 0 && (
              <div className="mt-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" /> Errors (
                  {progress.errors.length})
                </h3>
                <ul className="list-disc list-inside text-sm max-h-32 overflow-y-auto">
                  {progress.errors.map((err: any, idx: number) => (
                    <li key={idx}>
                      {err.recordIndex != null ? `Record ${err.recordIndex}: ` : ""}
                      {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {progress.status === "completed" && progress.errors?.length === 0 && (
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle2 className="w-5 h-5" /> All attendance processed successfully
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Tailwind Glass Styles ---------- */
const styles = `
.glass-card {
  @apply border border-white/50 rounded-2xl bg-white/30 backdrop-blur-lg shadow-lg;
}
.glass-select {
  @apply bg-white/40 backdrop-blur-md border border-white/50 rounded-xl px-3 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-black focus:outline-none;
}
.glass-input {
  @apply border border-white/50 bg-white/40 rounded-xl shadow-sm backdrop-blur-md;
}
.glass-btn {
  @apply bg-white/30 border border-white/50 rounded-xl px-4 py-2 font-medium hover:bg-white/60 backdrop-blur-md transition shadow-sm;
}
`;

if (typeof document !== "undefined" && !document.getElementById("glass-style-att")) {
  const style = document.createElement("style");
  style.id = "glass-style-att";
  style.innerHTML = styles;
  document.head.appendChild(style);
}
/* ---------- End of Tailwind Glass Styles ---------- */