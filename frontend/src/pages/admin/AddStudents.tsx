import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Upload,
  FileDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  UserPlus,
} from "lucide-react";
import { BASE_URL } from "../../apis";

export default function AddStudents() {
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [year, setYear] = useState("E1");
  const [sem, setSem] = useState("Sem - 1");
  const [branch, setBranch] = useState("CSE");
  const [_processId, setProcessId] = useState<string | null>(null);
  const [progress, _setProgress] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleFile = async (f: File) => {
    try {
      setFile(f);
      setError(null);
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!json.length) throw new Error("Empty file");
      setHeaders(Object.keys(json[0] as object));
      setRows(json.map((r, i) => ({ id: i + 1, ...(typeof r === "object" && r !== null ? r : {}) })));
    } catch (err: any) {
      setError(err.message);
      setFile(null);
      setRows([]);
    }
  };

  const handleUpload = async () => {
    if (!rows.length) return setError("Select a valid file first");
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/admin/addstudents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token!)}`,
        },
        body: JSON.stringify({
          year,
          SemesterName: sem,
          branch,
          Students: rows.map((r) => ({
            Username: r.Username,
            RollNumber: r.RollNumber,
            FullName: r.FullName,
            Email: r.Email,
          })),
        }),
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
      const res = await fetch(`${BASE_URL}/admin/students/template`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token!)}`,
        },
        body: JSON.stringify({ year, semester: sem, branch }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${year}_${sem}_${branch}_students_template.xlsx`;
      a.click();
      a.remove();
    } catch {
      alert("Error downloading template");
    }
  };

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    return rows.filter((r) =>
      Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-black" />
            Add Students
          </h1>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 border border-black rounded-lg hover:bg-gray-100 transition"
          >
            ← Back
          </button>
        </div>

        {/* Selection */}
        <div className="flex flex-wrap gap-4">
          {["E1", "E2", "E3", "E4"].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                year === y
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {y}
            </button>
          ))}
          <select
            value={sem}
            onChange={(e) => setSem(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
          >
            <option value="Sem - 1">Sem - 1</option>
            <option value="Sem - 2">Sem - 2</option>
          </select>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
          >
            {["CSE", "ECE", "EEE", "CIVIL", "MECH"].map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Upload Box */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/70 shadow-xl rounded-3xl p-8 flex flex-col items-center gap-4 transition-all hover:shadow-2xl">
          <label
            htmlFor="fileInput"
            className="flex flex-col items-center justify-center gap-3 cursor-pointer"
          >
            <Upload className="w-10 h-10 text-gray-700" />
            {file ? (
              <span className="font-medium text-gray-900">{file.name}</span>
            ) : (
              <span className="text-gray-500">Select or Drag & Drop Spreadsheet</span>
            )}
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Search */}
        {rows.length > 0 && (
          <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2">
            <Search className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        )}

        {/* Table */}
        {rows.length > 0 && (
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-inner max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 border-b border-gray-300">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold text-gray-800">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2">
                        <input
                          value={r[h] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRows((prev) =>
                              prev.map((row) =>
                                row.id === r.id ? { ...row, [h]: val } : row
                              )
                            );
                          }}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black outline-none"
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
        <div className="flex justify-end gap-4 flex-wrap">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-5 py-2 border border-black rounded-xl hover:bg-gray-100 transition"
          >
            <FileDown className="w-5 h-5" />
            Download Template
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !rows.length}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white transition ${
              uploading || !rows.length
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
            Upload Students
          </button>
        </div>

        {/* Error / Progress */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
        {progress && (
          <div className="space-y-3 bg-white/70 border border-gray-200 rounded-2xl p-4">
            <div className="flex justify-between text-sm">
              <span>Status: {progress.status}</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-3 ${
                  progress.status === "failed"
                    ? "bg-red-600"
                    : progress.status === "completed"
                    ? "bg-black"
                    : "bg-gray-700"
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            {progress.status === "completed" && (
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle2 className="w-5 h-5" /> All students added successfully
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
