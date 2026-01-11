import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import axios from 'axios';
import { student } from '../../store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { ChevronDown, Award, AlertCircle, X } from 'lucide-react';
import { GET_GRADES, GET_SEMESTERS } from '../../api/endpoints';

// Grade colors for visualizations (in grayscale for B&W theme)
const GRADE_COLORS: any = {
  Ex: '#000000',
  A: '#333333',
  B: '#555555',
  C: '#777777',
  D: '#999999',
  E: '#BBBBBB',
  R: '#DDDDDD',
};

// Helper function to truncate long text
const truncateText = (text: any, maxLength = 25) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 shadow-lg p-3 rounded">
        <p className="font-bold">
          {payload[0].payload.fullSubject}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};
// Pikachu image URL (you can replace with a local asset)
const PIKACHU_IMAGE = '/pikachu.png';

export default function GradeHub() {
  const user = useRecoilValue(student);
  const [semesterOptions, setSemesterOptions] = useState<{ id: string; name: string; year: string }[]>([]);
  const [selectedYear, setSelectedYear] = useState('E1');
  const [selectedSemester, setSelectedSemester] = useState('Sem - 1');
  const [grades, setGrades] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultsFetched, setResultsFetched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageIdx, setMessageIdx] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Pikachu is fetching your records!');

  // Unique years
  const years = Array.from(new Set(semesterOptions.map(opt => opt.year))).sort();

  // Fetch Semester Options on Mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await axios.get(GET_SEMESTERS);
        if (response.data.success) {
          setSemesterOptions(response.data.semesters);
        }
      } catch (err) {
        console.error('Failed to fetch semester options', err);
        setError('Could not load semester options. Please refresh.');
      }
    };
    fetchSemesters();
  }, []);

  // Handle dynamic loading message
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setLoadingMessage('Pikachu is fetching your records!');
      timer = setTimeout(() => {
        setLoadingMessage('Pikachu is asking Sreecharan for details...');
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Handle Fetch Results button click
  const handleFetchResults = async () => {
    if (!user?.username) {
      setError('Please sign in to view grades');
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
      const response = await axios.post(
        GET_GRADES,
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
        setGrades(response.data);
        setResultsFetched(true);
        // Show motivational message with delay only if GPA is not null
        if (response.data.gpa !== null) {
          setTimeout(() => {
            setShowMessage(true);
          }, 800);
        }
      } else {
        setError(response.data.msg || 'Failed to fetch grades');
        setGrades(null);
      }
    } catch (err) {
      setError('An error occurred while fetching grades');
      setGrades(null);
    }

    setIsLoading(false);
  };

  // Prepare data for pie chart
  const preparePieChartData = () => {
    if (!grades?.visualization_data?.pieChart) return [];

    return grades.visualization_data.pieChart.labels
      .map((label: any, index: any) => ({
        name: label,
        value: grades.visualization_data.pieChart.data[index],
      }))
      .filter((item: any) => item.value > 0);
  };

  const prepareBarChartData = () => {
    if (!grades?.visualization_data?.barChart) return [];
    return grades.visualization_data.barChart.map((item: any) => ({
      subject: truncateText(
        item.subject,
        15
      ),
      fullSubject: item.subject, // Add full subject name for tooltip
      points: item.points,
    }));
  };

  // Function to cycle through motivational messages
  const cycleMessage = () => {
    if (grades?.motivational_messages) {
      setMessageIdx((messageIdx + 1) % grades.motivational_messages.length);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black mb-4">Results</h1>
          <p className="text-neutral-500 font-medium text-lg">Track your academic performance across semesters.</p>
        </div>

        {/* Selection Criteria */}
        <div className="mb-12 bg-white p-8 rounded-3xl border border-neutral-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-black text-white p-2 rounded-lg">
              <Award size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Select Criteria</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Academic Year</label>
              <div
                className="w-full flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl p-4 cursor-pointer hover:border-black transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="font-bold text-lg">{selectedYear}</span>
                <ChevronDown size={20} className="text-neutral-400 group-hover:text-black transition-colors" />
              </div>

              {showDropdown && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
                  {years.map((year) => (
                    <div
                      key={year}
                      className={`p-4 cursor-pointer font-medium transition-colors ${selectedYear === year ? 'bg-black text-white' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      onClick={() => {
                        setSelectedYear(year);
                        setSelectedSemester(
                          semesterOptions.filter((opt) => opt.year === year)[0].name
                        );
                        setShowDropdown(false);
                        setResultsFetched(false);
                      }}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Semester</label>
              <div className="relative">
                <select
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value);
                    setResultsFetched(false);
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 font-bold text-lg appearance-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                >
                  {semesterOptions.filter(opt => opt.year === selectedYear).map((opt) => (
                    <option key={opt.name} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Actions</label>
              <button
                onClick={handleFetchResults}
                className={`w-full h-[62px] flex items-center justify-center font-bold text-lg rounded-xl transition-all duration-300 ${isLoading ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-black text-white hover:bg-neutral-800 shadow-lg hover:shadow-xl hover:-translate-y-1'
                  }`}
                disabled={isLoading || !user?.username}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    Loading...
                  </span>
                ) : (
                  <span>View Results</span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-8 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600 font-medium">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </div>

        {/* Loading State in Display Section */}
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
        {resultsFetched && grades && grades.success && !isLoading && (
          <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden">
            {/* Results Header */}
            <div className="bg-white border-b border-neutral-100 p-8 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-1">Results For</span>
                <h2 className="text-3xl font-black text-black">
                  {grades.year} <span className="text-neutral-300">/</span> {grades.semester}
                </h2>
              </div>
            </div>

            {/* Content */}
            {grades.gpa === null ? (
              <div className="p-12 text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-neutral-300" />
                <h3 className="text-xl font-bold mb-2">Results Not Available</h3>
                <p className="text-neutral-500">
                  These details are not yet updated, please check back shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="p-8 space-y-16">
                  {/* Grades Section */}
                  <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><div className="w-1 h-6 bg-black"></div> Grades</h3>
                    <div className="overflow-hidden rounded-2xl border border-neutral-200">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200">
                            <th className="p-4 text-left font-bold text-xs uppercase tracking-widest text-neutral-500">S.no</th>
                            <th className="p-4 text-left font-bold text-xs uppercase tracking-widest text-neutral-500">Subjects</th>
                            <th className="p-4 text-center font-bold text-xs uppercase tracking-widest text-neutral-500">Credits</th>
                            <th className="p-4 text-center font-bold text-xs uppercase tracking-widest text-neutral-500">Grade</th>
                            <th className="p-4 text-center font-bold text-xs uppercase tracking-widest text-neutral-500">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grades.calculation_details?.map((item: any, index: any) => (
                            <tr
                              key={index}
                              className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors last:border-0"
                            >
                              <td className="p-4 text-neutral-400 font-medium">{index + 1}</td>
                              <td className="p-4 font-bold text-neutral-800">{item.subject}</td>
                              <td className="p-4 text-center text-neutral-600 font-medium">{item.credits}</td>
                              <td className="p-4 text-center">
                                <span
                                  className={`inline-block w-10 h-8 leading-8 rounded-lg font-bold text-sm ${item.grade === 'Ex'
                                    ? 'bg-black text-white'
                                    : 'bg-neutral-100 text-neutral-800'
                                    }`}
                                >
                                  {item.grade}
                                </span>
                              </td>
                              <td className="p-4 text-center font-bold text-neutral-800">{item.points}</td>
                            </tr>
                          ))}
                          {!grades.calculation_details &&
                            Object.entries(grades.grade_data).map(
                              ([subject, grade]: any, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors last:border-0"
                                >
                                  <td className="p-4 text-neutral-400 font-medium">{index + 1}</td>
                                  <td className="p-4 font-bold text-neutral-800">{subject}</td>
                                  <td className="p-4 text-center text-neutral-400">-</td>
                                  <td className="p-4 text-center">
                                    <span
                                      className={`inline-block w-10 h-8 leading-8 rounded-lg font-bold text-sm ${grade === 'Ex'
                                        ? 'bg-black text-white'
                                        : 'bg-neutral-100 text-neutral-800'
                                        }`}
                                    >
                                      {grade}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center text-neutral-400">-</td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Charts Section */}
                  {grades.visualization_data && (
                    <div>
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><div className="w-1 h-6 bg-black"></div> Performance Visualization</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pie Chart */}
                        <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 text-center">
                            Grade Distribution
                          </h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={preparePieChartData()}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  nameKey="name"
                                  labelLine={false}
                                  label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                  }
                                >
                                  {preparePieChartData().map((entry: any, index: any) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={GRADE_COLORS[entry.name]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 text-center">
                            Points by Subject
                          </h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={prepareBarChartData()}>
                                <XAxis
                                  dataKey="subject"
                                  angle={-35}
                                  textAnchor="end"
                                  height={70}
                                />
                                <YAxis domain={[0, 10]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="points" fill="#000000" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Calculation Details Section */}
                  {grades.calculation_details && (
                    <div>
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><div className="w-1 h-6 bg-black"></div> Details Breakdown</h3>
                      <div className="overflow-hidden rounded-2xl border border-neutral-200">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                              <th className="p-4 text-left font-bold text-xs uppercase tracking-widest text-neutral-500">Subject</th>
                              <th className="p-4 text-center font-bold text-xs uppercase tracking-widest text-neutral-500">Credits</th>
                              <th className="p-4 text-center font-bold text-xs uppercase tracking-widest text-neutral-500">Grade</th>
                              <th className="p-4 text-center font-bold text-xs uppercase tracking-widest text-neutral-500">Points</th>
                              <th className="p-4 text-center font-bold text-xs uppercase tracking-widest text-neutral-500">Contribution</th>
                            </tr>
                          </thead>
                          <tbody>
                            {grades.calculation_details.map((item: any, index: any) => (
                              <tr
                                key={index}
                                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors last:border-0"
                              >
                                <td className="p-4 font-bold text-neutral-800">{item.subject}</td>
                                <td className="p-4 text-center text-neutral-600 font-medium">{item.credits}</td>
                                <td className="p-4 text-center">
                                  <span
                                    className={`inline-block w-10 h-8 leading-8 rounded-lg font-bold text-sm ${item.grade === 'Ex'
                                      ? 'bg-black text-white'
                                      : 'bg-neutral-100 text-neutral-800'
                                      }`}
                                  >
                                    {item.grade}
                                  </span>
                                </td>
                                <td className="p-4 text-center font-bold text-neutral-800">{item.points}</td>
                                <td className="p-4 text-center font-medium text-neutral-600">
                                  {item.contribution}
                                </td>
                              </tr>
                            ))}
                            {/* Total Row */}
                            <tr className="bg-black text-white font-bold">
                              <td className="p-4">Total</td>
                              <td className="p-4 text-center">
                                {grades.calculation_details
                                  .reduce((sum: any, item: any) => sum + item.credits, 0)
                                  .toFixed(1)}
                              </td>
                              <td className="p-4 text-center">-</td>
                              <td className="p-4 text-center">-</td>
                              <td className="p-4 text-center">
                                {grades.calculation_details
                                  .reduce(
                                    (sum: any, item: any) => sum + item.contribution,
                                    0
                                  )
                                  .toFixed(1)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* GPA and Motivational Message */}
                <div className="p-8 bg-neutral-50 border-t border-neutral-100">
                  <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
                    {/* GPA Card */}
                    <div className="bg-black text-white p-8 rounded-3xl shadow-xl w-full max-w-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-800 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity translate-x-1/3 -translate-y-1/3"></div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-2">Semester GPA</h3>
                      <div className="text-6xl font-black tracking-tighter mb-2">
                        {grades.gpa !== null ? grades.gpa.toFixed(2) : 'N/A'}
                      </div>
                      {grades.gpa === null && (
                        <div className="text-sm text-neutral-400">
                          Results not formatted yet
                        </div>
                      )}
                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                        <Award size={14} /> Official Grade
                      </div>
                    </div>

                    {/* Motivational Messages Card */}
                    {grades.motivational_messages && grades.motivational_messages.length > 0 && (
                      <div
                        className="bg-white p-8 border border-neutral-200 rounded-3xl w-full flex flex-col justify-center cursor-pointer hover:border-black transition-colors relative group"
                        onClick={cycleMessage}
                      >
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 absolute top-6 left-8">Daily Motivation</h3>
                        {showMessage ? (
                          <div className="mt-4">
                            <p className="font-bold text-2xl text-black leading-tight">
                              "{grades.motivational_messages[messageIdx]}"
                            </p>
                            <div className="flex items-center gap-2 mt-4 text-neutral-400 text-sm font-medium group-hover:text-black transition-colors">
                              <span>Tap for more</span> <ChevronDown size={14} className="-rotate-90" />
                            </div>
                          </div>
                        ) : (
                          <div className="py-2">
                            <div className="flex gap-2">
                              <span className="inline-block w-2.5 h-2.5 bg-black rounded-full animate-bounce"></span>
                              <span className="inline-block w-2.5 h-2.5 bg-black rounded-full animate-bounce [animation-delay:0.1s]"></span>
                              <span className="inline-block w-2.5 h-2.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* GradeLite Branding */}
                  {grades.gpa !== null && (
                    <div className="mt-8 text-center bg-white border border-neutral-100 rounded-2xl p-4 max-w-md mx-auto">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        Powered by{' '}
                        <a
                          href="https://sreecharan-desu.github.io/Gradelite/#GradeLite"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black hover:underline ml-1"
                          aria-label="Visit GradeLite"
                        >
                          GradeLite Algorithm
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Action Buttons */}
            {/* Action Buttons */}
            <div className="p-8 border-t border-neutral-100 flex justify-end space-x-3 bg-neutral-50">
              <button
                onClick={() => {
                  setResultsFetched(false);
                  setGrades(null);
                  setError('');
                }}
                className="flex items-center px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300"
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
              Please sign in to your student account to access your academic performance records and grades.
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

            <h3 className="text-2xl font-black mb-3">No Results Selected</h3>
            <p className="text-neutral-500 mb-6 max-w-sm mx-auto font-medium">
              Select an academic year and semester above, then click "View Results" to see your grades.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}