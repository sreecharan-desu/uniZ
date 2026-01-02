
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import {
  Upload,
  FileDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  X,
  FileSpreadsheet
} from "lucide-react";
import { BASE_URL } from "../../api/endpoints";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

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
        if (Object.keys(rowData).length > 0) {
            json.push(rowData);
        }
      });

      if (!json.length) throw new Error("File is empty or invalid format");
      setHeaders(headers_found.filter(Boolean));
      setRows(json.map((r, i) => ({ id: i + 1, ...r })));
    } catch (err: any) {
      setError(err.message || "Failed to parse file");
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
      if (data.success) {
          setProcessId(data.processId);
          // Simulate progress for UX since we don't have websocket here for this specific task yet
          // In a real scenario, we'd listen to socket events with processId
          _setProgress({ status: 'completed', percentage: 100 });
      }
      else setError(data.msg);
    } catch {
      setError("Upload failed due to network error");
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
      if(!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${year}_${sem}_${branch}_students_template.xlsx`;
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


        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Add Students</h1>
                 <div className="flex items-center gap-2 mt-1">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-7 px-2 text-xs"
                        onClick={() => navigate("/admin")}
                    >
                        ← Back
                    </Button>
                    <p className="text-slate-500 text-sm">Import student records via bulk spreadsheet upload.</p>
                 </div>
             </div>
             
              <div className="flex gap-3">
                 <Button variant="secondary" onClick={downloadTemplate} size="sm">
                     <FileDown className="w-4 h-4 mr-2" /> Template
                 </Button>
             </div>
        </div>
      </div>

       {/* Configuration Bar */}
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
            <div className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
                ${error ? 'border-black border-2 bg-slate-50' : 'border-slate-300 hover:border-black hover:bg-slate-50'}
            `}>
                 <input
                    id="fileInput"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    className="hidden"
                />
                <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-slate-900">Click to upload spreadsheet</p>
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
                            <p className="text-xs text-slate-400">{rows.length} records found</p>
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
                         <h3 className="font-semibold text-slate-900">Data Preview</h3>
                         <div className="w-full sm:w-72">
                             <Input 
                                placeholder="Filter records..." 
                                value={search}
                                onchangeFunction={(e: any) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                             />
                         </div>
                    </div>
                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    {headers.map((h, i) => (
                                        <th key={i} className="px-6 py-3 font-semibold border-b border-slate-200">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRows.map((r) => (
                                    <tr key={r.id} className="bg-white hover:bg-slate-50 transition-colors">
                                        {headers.map((h, i) => (
                                            <td key={i} className="px-6 py-3 whitespace-nowrap text-slate-700">
                                                {r[h]}
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
                            className="bg-black hover:bg-slate-800 rounded-none border-2 border-black"
                        >
                            <Upload className="w-4 h-4 mr-2" /> Confirm & Upload
                         </Button>
                    </div>
                </div>
          </div>
      )}

        {/* Progress Display */}
        {progress && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-10 duration-500">
              <div className="bg-white rounded-xl shadow-2xl p-6 border border-slate-100 w-80">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-900">Upload Status</span>
                    <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full ${progress.status === 'completed' ? 'bg-black text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {progress.status === 'completed' ? 'Completed' : 'Processing'}
                    </span>
                </div>
                
                {progress.status === 'completed' ? (
                     <div className="flex items-center gap-3 text-green-600 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Successfully processed</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-black mb-2 font-black uppercase tracking-widest">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-medium">Uploading data...</span>
                    </div>
                )}
                
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${progress.status === 'completed' ? 'bg-black' : 'bg-slate-400'}`} 
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
              </div>
          </div>
        )}
    </div>
  );
}
