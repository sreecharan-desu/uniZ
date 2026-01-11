import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import axios from 'axios';
import { student } from '../../store';
import { ChevronDown, Award, AlertCircle, X, CheckCircle } from 'lucide-react';
import { GET_ATTENDANCE } from '../../api/endpoints';

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
        GET_ATTENDANCE,
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
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black mb-4">Attendance</h1>
        <p className="text-neutral-500 font-medium text-lg">Track your daily attendance and semester progress.</p>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Selection Criteria */}
        <div className="mb-12 bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg text-white"><CheckCircle size={20} /></div>
            Select Criteria
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 block ml-1">Academic Year</label>
              <div
                className="w-full flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl p-4 cursor-pointer hover:border-black transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="font-bold text-lg">{selectedYear}</span>
                <ChevronDown size={20} className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showDropdown && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {years.map((year) => (
                    <div
                      key={year}
                      className={`p-4 cursor-pointer font-medium hover:bg-neutral-50 transition-colors ${selectedYear === year ? 'bg-black text-white hover:bg-black' : 'text-neutral-600'
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
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 block ml-1">Semester</label>
              <div className="relative">
                <select
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value);
                    setResultsFetched(false);
                    setAttendanceData(null);
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 font-bold text-lg appearance-none focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  {availableSemesters.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" size={20} />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFetchAttendance}
                className={`w-full flex items-center justify-center font-bold text-lg p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ${isLoading ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none' : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                disabled={isLoading || !user?.username}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 text-base">
                    Fetching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">View Attendance</span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-8 bg-black text-white rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="text-white flex-shrink-0" />
              <div className="font-medium">{error}</div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-12 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full p-4 border border-neutral-100 shadow-sm flex items-center justify-center">
              <img
                src={PIKACHU_IMAGE}
                alt="Pikachu"
                className="w-full h-full object-contain animate-bounce"
              />
            </div>
            <h3 className="text-2xl font-black mb-3">Pikachu is on the case!</h3>
            <p className="text-neutral-500 font-medium">{loadingMessage}</p>
          </div>
        )}

        {/* Results Section */}
        {resultsFetched && attendanceData && attendanceData.success && !isLoading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">

            {/* Header */}
            <div className="flex items-end justify-between border-b pb-4 border-neutral-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-1">Results For</span>
                <h2 className="text-4xl font-black tracking-tight">{selectedYear} - {selectedSemester}</h2>
              </div>
            </div>

            {/* Content */}
            {Object.values(attendanceData.attendance_data[selectedYear]?.[selectedSemester]?.subjects || {}).every(
              (subject: SubjectAttendance) => subject.classesAttended === 0
            ) ? (
              <div className="bg-neutral-50 rounded-3xl p-12 text-center border border-neutral-200">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-neutral-100">
                  <AlertCircle size={32} className="text-neutral-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Attendance Not Available</h3>
                <p className="text-neutral-500 font-medium">
                  These details are not yet updated, please check back shortly...
                </p>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl overflow-hidden border border-neutral-200 shadow-sm">

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/50">
                        <th className="p-6 text-left text-xs font-bold uppercase tracking-widest text-neutral-500">Subject</th>
                        <th className="p-6 text-center text-xs font-bold uppercase tracking-widest text-neutral-500">Total Classes</th>
                        <th className="p-6 text-center text-xs font-bold uppercase tracking-widest text-neutral-500">Attended</th>
                        <th className="p-6 text-center text-xs font-bold uppercase tracking-widest text-neutral-500">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {Object.entries(
                        attendanceData.attendance_data[selectedYear]?.[selectedSemester]?.subjects || {}
                      ).map(([subject, attendance]: [string, SubjectAttendance], index) => (
                        attendance.classesAttended === 0 ? (
                          <tr key={index} className="hover:bg-neutral-50 transition-colors">
                            <td className="p-6 font-bold text-neutral-400 text-center" colSpan={4}>
                              Attendance data not yet available for {subject}.
                            </td>
                          </tr>
                        ) : (
                          <tr key={index} className="group hover:bg-neutral-50 transition-colors">
                            <td className="p-6 font-bold text-lg text-neutral-900">{subject}</td>
                            <td className="p-6 text-center text-neutral-600 font-medium">{attendance.totalClasses}</td>
                            <td className="p-6 text-center text-neutral-600 font-medium">{attendance.classesAttended}</td>
                            <td className="p-6 text-center">
                              <span className={`inline-block px-4 py-1.5 rounded-lg text-sm font-bold ${parseFloat(attendance.attendancePercentage) >= 75
                                ? 'bg-black text-white'
                                : parseFloat(attendance.attendancePercentage) >= 65
                                  ? 'bg-neutral-200 text-neutral-700'
                                  : 'bg-neutral-100 text-neutral-400'
                                }`}>
                                {attendance.attendancePercentage}%
                              </span>
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-8 bg-neutral-900 text-white mt-0">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest mb-1">Semester Summary</p>
                      <h3 className="text-2xl font-black">Overall Attendance</h3>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Attended / Total</p>
                        <p className="text-xl font-bold">
                          {attendanceData.attendance_data[selectedYear]?.[selectedSemester]?.classesAttended}
                          <span className="text-neutral-500 mx-1">/</span>
                          {attendanceData.attendance_data[selectedYear]?.[selectedSemester]?.totalClasses}
                        </p>
                      </div>
                      <div className="w-px h-12 bg-neutral-800 hidden md:block"></div>
                      <div className="text-right">
                        <p className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Percentage</p>
                        <p className="text-4xl font-black text-white">
                          {attendanceData.attendance_data[selectedYear]?.[selectedSemester]?.attendancePercentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setResultsFetched(false);
                  setAttendanceData(null);
                  setError('');
                }}
                className="flex items-center px-8 py-4 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <X size={18} className="mr-2" /> Close Results
              </button>
            </div>
          </div>
        )}

        {/* Not Logged In State */}
        {!user?.username && !isLoading && !resultsFetched && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-12 text-center">
            <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-neutral-100">
              <AlertCircle size={40} className="text-black" />
            </div>
            <h3 className="text-2xl font-black mb-3">Sign In Required</h3>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto font-medium">
              Please sign in to your student account to view your attendance records.
            </p>
            <button className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Sign In to Continue
            </button>
          </div>
        )}

        {/* Empty State */}
        {user?.username && !isLoading && !resultsFetched && !error && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-12 text-center">
            <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-neutral-100">
              <Award size={40} className="text-black" />
            </div>
            <h3 className="text-2xl font-black mb-3">No Attendance Selected</h3>
            <p className="text-neutral-500 mb-6 max-w-sm mx-auto font-medium">
              Select an academic year and semester above, then click "View Attendance" to see your complete records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}