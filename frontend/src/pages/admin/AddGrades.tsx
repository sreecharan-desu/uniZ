import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CSVUploader from "./CSVUploader";

export default function AddGrades() {
  const navigate = useNavigate();
  const [year, setYear] = useState("E1");
  const [sem, setSem] = useState("Sem - 1");

  const transformData = (rows: any[]) => ({
    SemesterName: `${year}*${sem}`,
    Students: rows.map((s) => ({
      Username: s.Username,
      Grades: Object.entries(s)
        .filter(([k]) => k.startsWith("Grades/"))
        .map(([key, val]) => {
          const [, , prop] = key.split("/");
          return { [prop]: val };
        }),
    })),
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
        <CSVUploader
          title="Add Grades"
          uploadUrl="/admin/addgrades"
          transformData={transformData}
          extraInputs={
            <div className="flex space-x-4">
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {["E1", "E2", "E3", "E4"].map((y) => <option key={y}>{y}</option>)}
              </select>
              <select value={sem} onChange={(e) => setSem(e.target.value)}>
                <option>Sem - 1</option>
                <option>Sem - 2</option>
              </select>
            </div>
          }
        />
      </div>
    </div>
  );
}
