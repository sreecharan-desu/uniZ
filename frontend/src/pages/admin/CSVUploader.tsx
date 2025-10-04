import { useState } from "react";
import * as XLSX from "xlsx";
import { BASE_URL } from "../../apis";

interface Props {
  title: string;
  uploadUrl: string;
  schema: string[]; // required headers
}

export default function SpreadsheetUploader({ title, uploadUrl, schema }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("admin_token");

  // Handle file select + parse
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);

    try {
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      // Always take first sheet
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!json.length) throw new Error("Empty file");

      // Validate headers
      const fileHeaders = Object.keys(json[0] as object);
      for (const required of schema) {
        if (!fileHeaders.includes(required)) {
          throw new Error(`Missing required column: ${required}`);
        }
      }

      setData(json as any[]);
    } catch (err: any) {
      console.error("Parse error:", err);
      setError(err.message || "Failed to parse file");
      setFile(null);
    }
  };

  // Upload to backend
  const handleUpload = async () => {
    if (!data.length) return alert("No data to upload");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}${uploadUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token!)}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.msg || "Upload failed");

      alert(`✅ ${result.msg}`);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {file && (
        <p className="text-sm text-gray-600 mb-2">
          Selected: <strong>{file.name}</strong> ({data.length} records)
        </p>
      )}

      {error && (
        <div className="text-red-600 font-medium mb-3">
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !data.length}
        className={`px-4 py-2 rounded-lg text-white ${
          loading ? "bg-gray-500" : "bg-black hover:bg-gray-800"
        }`}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
