import { useState } from "react";
import { parseCSV } from "../../utils/csvUtils";
import { pollProgress } from "../../utils/polling";
import { BASE_URL } from "../../apis";

interface CSVUploaderProps {
  title: string;
  uploadUrl: string;
  schema?: string[]; // optional validation
  transformData?: (rows: any[], extra?: any) => any; // optional transform
  extraInputs?: React.ReactNode; // UI for extra inputs (year/sem etc.)
}


export default function CSVUploader({
  title,
  uploadUrl,
  schema,
  transformData,
  extraInputs,
}: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [status, setStatus] = useState<{ error?: string; success?: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [extraData, _setExtraData] = useState<any>({}); // for year/sem etc.

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.name.endsWith(".csv")) return setStatus({ error: "File must be CSV" });
    if (f.size > 5 * 1024 * 1024) return setStatus({ error: "Max 5MB allowed" });

    setFile(f);
    try {
      const rows = await parseCSV<any>(f);
      setPreview(rows.slice(0, 5));
      setHeaders(Object.keys(rows[0] || {}));
    } catch {
      setStatus({ error: "Failed to parse CSV" });
    }
  };

  const validateSchema = (rows: any[]): boolean => {
    if (!schema || !schema.length) return true;
    return schema.every((field) => Object.keys(rows[0] || {}).includes(field));
  };

  const upload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatus({});
    try {
      const rows = await parseCSV<any>(file);
      if (!validateSchema(rows)) {
        setStatus({ error: `CSV schema invalid. Required: ${schema?.join(", ")}` });
        setIsUploading(false);
        return;
      }

      const token = localStorage.getItem("admin_token");
      const body = transformData ? transformData(rows, extraData) : { Students: rows };

      const res = await fetch(`${BASE_URL}${uploadUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token!)}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setStatus({ success: "Processing started..." });
        pollProgress(
          `${BASE_URL}/admin/updatestudents-progress?processId=${data.processId}`,
          token!,
          setProgress,
          () => setIsUploading(false)
        );
      } else {
        setStatus({ error: data.msg });
        setIsUploading(false);
      }
    } catch {
      setStatus({ error: "Upload failed." });
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <h1 className="text-3xl font-extrabold mb-4">{title}</h1>

      {status.error && <p className="text-red-600 mb-2">{status.error}</p>}
      {status.success && <p className="text-green-600 mb-2">{status.success}</p>}

      <div className="space-y-4">
        {extraInputs && <div>{extraInputs}</div>}

        <input type="file" accept=".csv" onChange={handleFileChange} />

        {preview.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {headers.map((h) => <td key={h}>{row[h]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          disabled={!file || isUploading}
          onClick={upload}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {progress && (
        <div className="mt-6">
          <p>Status: {progress.status}</p>
          <p>Progress: {progress.percentage}%</p>
        </div>
      )}
    </div>
  );
}
