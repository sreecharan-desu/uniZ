import { useNavigate } from "react-router-dom";
import CSVUploader from "./CSVUploader";

export default function AddStudents() {
  const navigate = useNavigate();

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
          title="Add Students"
          uploadUrl="/admin/updatestudents"
          schema={["Username", "Name", "Branch", "Year", "Email"]}
        />
      </div>
    </div>
  );
}
