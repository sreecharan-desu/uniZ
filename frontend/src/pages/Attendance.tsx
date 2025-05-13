import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import axios from 'axios';
import { student } from '../store';
import { ChevronDown, Award, AlertCircle, X, UserCheck, CheckCircle } from 'lucide-react';

interface SubjectAttendance {
  totalClasses: number;
  classesAttended: number;
  attendancePercentage: string;
}

interface SemesterAttendance {
  subjects: { [subject: string]: SubjectAttendance };
  totalClasses: number;
  classesAttended: number;
  attendancePercentage: string;
}

interface YearAttendance {
  [semester: string]: SemesterAttendance;
}

interface AttendanceResponse {
  success: boolean;
  attendance_data: {
    [year: string]: YearAttendance;
  };
  msg?: string;
}

// Define semester options with year and semester mappings (same as GradeHub)
const semesterOptions = [
  { id: '2ae9044f-dade-4020-bbb9-0611a8502b2a', name: 'Sem - 1', year: 'E1' },
  { id: '118f9490-c2e2-4013-a508-8d1819c09e1f', name: 'Sem - 2', year: 'E1' },
  { id: '49693fc4-dcbe-4c9d-9033-95e184ce787a', name: 'Sem - 1', year: 'E2' },
  { id: 'f955f237-ceef-4c7f-a6c6-a47b8421adeb', name: 'Sem - 2', year: 'E2' },
  { id: '265e4b17-6d03-4431-924f-3a885d81ba3c', name: 'Sem - 1', year: 'E3' },
  { id: 'b34fa0e3-d88f-494a-94a4-96ece7ecc693', name: 'Sem - 2', year: 'E3' },
  { id: 'f8979cba-3824-4ebd-a384-f333da6a1746', name: 'Sem - 1', year: 'E4' },
  { id: 'ee050aca-1b1b-465c-91b7-2b88cdc8e5b3', name: 'Sem - 2', year: 'E4' },
];

// Unique years
const years = Array.from(new Set(semesterOptions.map(opt => opt.year))).sort();

// Pikachu image URL (same as GradeHub)
const PIKACHU_IMAGE = 'https://img.pokemondb.net/artwork/large/pikachu.jpg';

export default function Attendance() {
  const user = useRecoilValue(student);
  const [selectedYear, setSelectedYear] = useState('E1');
  const [selectedSemester, setSelectedSemester] = useState('Sem - 1');
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultsFetched, setResultsFetched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Pikachu is fetching your attendance!');

  // Get available semesters for the selected year
  const availableSemesters = semesterOptions
    .filter((opt) => opt.year === selectedYear)
    .map((opt) => opt.name)
    .sort();

  // Handle dynamic loading message
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setLoadingMessage('Pikachu is fetching your attendance!');
      timer = setTimeout(() => {
        setLoadingMessage('Pikachu is asking Sreecharan for details...');
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Fetch attendance data
  const handleFetchAttendance = async () => {
    if (!user?.username) {
      setError('Please sign in to view attendance');
      return;
    }

    if (!selectedYear || !selectedSemester) {
      setError('Please select both a year and a semester');
      return;
    }

    // Find the semester ID
    const semesterOption = semesterOptions.find(
      (opt) => opt.year === selectedYear && opt.name === selectedSemester
    );

    if (!semesterOption) {
      setError('Invalid year and semester combination');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
      const response = await axios.post<AttendanceResponse>(
        'https://uni-z-api.vercel.app/api/v1/student/getattendance',
        {
          username: user.username,
          semesterId: semesterOption.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setAttendanceData(response.data);
        setResultsFetched(true);
      } else {
        setError(response.data.msg || 'Failed to fetch attendance');
        setAttendanceData(null);
      }
    } catch (err) {
      setError('An error occurred while fetching attendance');
      setAttendanceData(null);
    }

    setIsLoading(false);
  };

  // Skeleton Loader Component
  return (
    <div className="min-h-screen bg-white font-sans text-black">
<div className="text-center mb-8">
  <h1 className="text-3xl md:text-4xl font-bold text-black flex items-center justify-center space-x-2">
    <UserCheck size={28} className="text-black" />
    <span>RollCall</span>
  </h1>
  <div className="h-1 w-16 bg-black mx-auto mt-3"></div>
</div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Selection Criteria */}
        <div className="mb-12 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-300 flex items-center">
            <CheckCircle className="mr-2" size={22} /> Select Criteria
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <h3 className="text-sm uppercase font-semibold mb-2 text-gray-600">Academic Year</h3>
              <div
                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="font-medium">{selectedYear}</span>
                <ChevronDown size={18} />
              </div>

              {showDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                  {years.map((year) => (
                    <div
                      key={year}
                      className={`p-3 cursor-pointer hover:bg-gray-100 ${
                        selectedYear === year ? 'bg-gray-100 font-medium' : ''
                      }`}
                      onClick={() => {
                        setSelectedYear(year);
                        setSelectedSemester(
                          semesterOptions.filter((opt) => opt.year === year)[0].name
                        );
                        setShowDropdown(false);
                        setResultsFetched(false);
                        setAttendanceData(null);
                      }}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm uppercase font-semibold mb-2 text-gray-600">Semester</h3>
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  setResultsFetched(false);
                  setAttendanceData(null);
                }}
                className="w-full bg-white border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {availableSemesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm uppercase font-semibold mb-2 text-gray-600">Actions</h3>
              <button
                onClick={handleFetchAttendance}
                className={`w-full flex items-center justify-center font-medium p-3 rounded transition-all duration-200 focus:outline-none ${
                  isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
                }`}
                disabled={isLoading || !user?.username}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    Loading . . .
                  </span>
                ) : (
                  <span className="flex items-center">View Attendance</span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded p-3 flex items-start">
              <AlertCircle size={20} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-red-700">{error}</div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <img
              src={PIKACHU_IMAGE}
              alt="Pikachu"
              className="w-24 h-24 mx-auto mb-4 animate-bounce"
            />
            <h3 className="text-xl font-semibold mb-2">Pikachu is on the case!</h3>
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        )}

        {/* Results Section */}
        {resultsFetched && attendanceData && attendanceData.success && !isLoading && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
            {/* Results Header */}
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {selectedYear} / {selectedSemester}
              </h2>
            </div>

            {/* Content */}
            {Object.values(attendanceData.attendance_data[selectedYear]?.[selectedSemester]?.subjects || {}).every(
              (subject: SubjectAttendance) => subject.classesAttended === 0
            ) ? (
              <div className="p-6 text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold mb-2">Attendance Not Available</h3>
                <p className="text-gray-600">
                  These details are not yet updated, please check back shortly...
                </p>
              </div>
            ) : (
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-6 border-b border-gray-300 pb-2">Attendance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="p-3 text-left font-semibold">Subject</th>
                        <th className="p-3 text-center font-semibold">Total Classes</th>
                        <th className="p-3 text-center font-semibold">Classes Attended</th>
                        <th className="p-3 text-center font-semibold">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        attendanceData.attendance_data[selectedYear]?.[selectedSemester]?.subjects || {}
                      ).map(([subject, attendance]: [string, SubjectAttendance], index) => (
                        attendance.classesAttended === 0 ? (
                          <tr
                            key={index}
                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            }`}
                          >
                            <td className="p-3 font-medium" colSpan={4}>
                              Attendance data not yet available for {subject}.
                            </td>
                          </tr>
                        ) : (
                          <tr
                            key={index}
                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            }`}
                          >
                            <td className="p-3 font-medium">{subject}</td>
                            <td className="p-3 text-center">{attendance.totalClasses}</td>
                            <td className="p-3 text-center">{attendance.classesAttended}</td>
                            <td className="p-3 text-center">{attendance.attendancePercentage}%</td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-lg">
                  <p>
                    <span className="font-semibold">Semester Total:</span>{' '}
                    {attendanceData.attendance_data[selectedYear]?.[selectedSemester]?.classesAttended}/
                    {attendanceData.attendance_data[selectedYear]?.[selectedSemester]?.totalClasses} (
                    {attendanceData.attendance_data[selectedYear]?.[selectedSemester]?.attendancePercentage}%)
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setResultsFetched(false);
                  setAttendanceData(null);
                  setError('');
                }}
                className="flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                <X size={18} className="mr-2" /> Close
              </button>
            </div>
          </div>
        )}

        {/* Not Logged In State */}
        {!user?.username && !isLoading && !resultsFetched && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-6">
              Please sign in to view your attendance records.
            </p>
            <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
              Sign In
            </button>
          </div>
        )}

        {/* Empty State */}
        {user?.username && !isLoading && !resultsFetched && !error && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Award size={48} className="mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold mb-2">No Attendance Selected</h3>
            <p className="text-gray-600 mb-4">
              Select a year and semester, then click "View Attendance" to see your records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}