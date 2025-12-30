/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useIsAuth } from "../../hooks/is_authenticated";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, AlertCircle } from "lucide-react";
import { SEARCH_STUDENTS } from "../../api/endpoints";

const StudentCardSkeleton = () => (
  <div className="animate-pulse m-5 p-6 bg-gray-50 rounded-2xl shadow-md border border-gray-200">
    <div className="flex items-center space-x-4 mb-6">
      <div className="h-14 w-14 bg-gray-300 rounded-full" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-3 bg-gray-300 rounded w-full" />
      ))}
    </div>
  </div>
);

interface StudentProps {
  _id: string;
  username: string;
  name: string;
  gender?: string;
  email?: string;
  year?: string;
  branch?: string;
  section?: string;
  roomno?: string;
  has_pending_requests?: boolean;
  is_in_campus?: boolean;
  blood_group?: string;
  phone_number?: string;
  count?: { Outpass: number; Outing: number; grades: number; attendance: number };
  father_address?: string;
  father_name?: string;
  father_phonenumber?: string;
  mother_address?: string;
  mother_name?: string;
  mother_phonenumber?: string;
  father_email?: string;
  mother_email?: string;
  father_occupation?: string;
  mother_occupation?: string;
  is_disabled?: boolean;
}

export default function SearchStudents() {
  useIsAuth();
  const [string, setString] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<StudentProps[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProps | null>(null);
  const debouncedValue = useDebounce(string, 500);
  const navigate = useNavigate();

  const fetchStudents = async (query: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return setError("Authentication token not found");

    try {
      setIsLoading(true);
      setError("");
      const cleanToken = token.replace(/^["'](.+(?=["']$))["']$/, "$1");
      const res = await fetch(SEARCH_STUDENTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify({ username: query.toLowerCase() }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.msg || "Failed to fetch students");
        setSuggestions([]);
        setSelectedStudent(null);
        return;
      }

      const suggs = data.suggestions || [];
      setSuggestions(suggs);

      if (suggs.length === 1 || data.student) {
        setSelectedStudent(data.student || suggs[0]);
        setSuggestions([]);
      } else setSelectedStudent(null);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching students. Please try again.");
      setSuggestions([]);
      setSelectedStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!debouncedValue) {
      setSuggestions([]);
      setSelectedStudent(null);
      setError("");
      return;
    }
    if (!debouncedValue.toLowerCase().startsWith("o")) {
      setSuggestions([]);
      setSelectedStudent(null);
      setError("Student ID must start with 'o'");
      return;
    }
    fetchStudents(debouncedValue);
  }, [debouncedValue]);

  const handleSelectSuggestion = (username: string) => {
    setString(username);
    fetchStudents(username);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-16 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin")}
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 hover:bg-gray-50 transition-all"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Search Portal</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Search detailed student information including personal details, grades, and attendance records.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md mx-auto relative">
        <input
          type="text"
          placeholder="Enter student ID (e.g., o210008)"
          className="w-full h-12 pl-5 pr-12 text-lg border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
          onChange={(e) => {
            setString(e.target.value);
            setError("");
            setSelectedStudent(null);
          }}
          value={string}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-6 h-6" />
        </div>

        {error && (
          <div className="mt-3 flex items-center text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && !selectedStudent && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg animate-fade-in">
            {suggestions.map((s) => (
              <div
                key={s._id}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSelectSuggestion(s.username)}
              >
                <User className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading && <StudentCardSkeleton />}

      {!isLoading && !selectedStudent && !error && string && suggestions.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No matching students found.</p>
      )}

      {selectedStudent && !isLoading && (
        <div className="bg-white bg-opacity-90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden mt-8 border border-gray-200">
          <div className="bg-gray-800 px-6 py-4 flex items-center space-x-4">
            <div className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow">
              {selectedStudent.name.charAt(0)}
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
              <p className="text-gray-300">{selectedStudent.username}</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-800">
            {[
              ["Email", selectedStudent.email],
              ["Gender", selectedStudent.gender],
              ["Year", selectedStudent.year],
              ["Branch", selectedStudent.branch],
              ["Blood Group", selectedStudent.blood_group],
              ["Phone Number", selectedStudent.phone_number],
              ["Father's Name", selectedStudent.father_name],
              ["Father's Phone", selectedStudent.father_phonenumber],
              ["Father's Email", selectedStudent.father_email],
              ["Father's Occupation", selectedStudent.father_occupation],
              ["Father's Address", selectedStudent.father_address],
              ["Mother's Name", selectedStudent.mother_name],
              ["Mother's Phone", selectedStudent.mother_phonenumber],
              ["Mother's Email", selectedStudent.mother_email],
              ["Mother's Occupation", selectedStudent.mother_occupation],
              ["Mother's Address", selectedStudent.mother_address],
              ["Disability Status", selectedStudent.is_disabled ? "Yes" : "No"],
            ].map(([label, value]) => (
              <div key={label}>
                <label className="text-sm text-gray-500">{label}</label>
                <p className="font-medium">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
