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
    <div className="min-h-screen bg-white font-sans text-black ">
            <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black flex items-center justify-center space-x-2">
            <Award size={28} className="text-black" />
            <span>GradeHub</span>
          </h1>
          <div className="h-1 w-16 bg-black mx-auto mt-3"></div>
        </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Selection Criteria */}
        <div className="mb-12 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-300 flex items-center">
            <Award className="mr-2" size={22} /> Select Criteria
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
                }}
                className="w-full bg-white border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {semesterOptions.filter(opt => opt.year === selectedYear).map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm uppercase font-semibold mb-2 text-gray-600">Actions</h3>
              <button
                onClick={handleFetchResults}
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
                  <span className="flex items-center">View Results</span>
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
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
            {/* Results Header */}
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {grades.year} / {grades.semester}
              </h2>
            </div>

            {/* Content */}
            {grades.gpa === null ? (
              <div className="p-6 text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold mb-2">Results Not Available</h3>
                <p className="text-gray-600">
                  These details are not yet updated, please pull back shortly...
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-12">
                  {/* Grades Section */}
                  <div>
                    <h3 className="text-2xl font-bold mb-6 border-b border-gray-300 pb-2">Grades</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-300">
                            <th className="p-3 text-left font-semibold">S.no</th>
                            <th className="p-3 text-left font-semibold">Subjects</th>
                            <th className="p-3 text-center font-semibold">Credits</th>
                            <th className="p-3 text-center font-semibold">Grade</th>
                            <th className="p-3 text-center font-semibold">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grades.calculation_details?.map((item: any, index: any) => (
                            <tr
                              key={index}
                              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                              }`}
                            >
                              <td className="p-3">{index + 1}.</td>
                              <td className="p-3 font-medium">{item.subject}</td>
                              <td className="p-3 text-center">{item.credits}</td>
                              <td className="p-3 text-center">
                                <span
                                  className={`inline-block py-1 px-3 rounded ${
                                    item.grade === 'Ex'
                                      ? 'bg-black text-white'
                                      : item.grade === 'A'
                                      ? 'bg-gray-800 text-white'
                                      : item.grade === 'B'
                                      ? 'bg-gray-600 text-white'
                                      : item.grade === 'C'
                                      ? 'bg-gray-500 text-white'
                                      : item.grade === 'D'
                                      ? 'bg-gray-400 text-black'
                                      : item.grade === 'E'
                                      ? 'bg-gray-300 text-black'
                                      : 'bg-gray-200 text-black'
                                  }`}
                                >
                                  {item.grade}
                                </span>
                              </td>
                              <td className="p-3 text-center font-medium">{item.points}</td>
                            </tr>
                          ))}
                          {!grades.calculation_details &&
                            Object.entries(grades.grade_data).map(
                              ([subject, grade]: any, index) => (
                                <tr
                                  key={index}
                                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                  }`}
                                >
                                  <td className="p-3">{index + 1}.</td>
                                  <td className="p-3 font-medium">{subject}</td>
                                  <td className="p-3 text-center">-</td>
                                  <td className="p-3 text-center">
                                    <span
                                      className={`inline-block py-1 px-3 rounded ${
                                        grade === 'Ex'
                                          ? 'bg-black text-white'
                                          : grade === 'A'
                                          ? 'bg-gray-800 text-white'
                                          : grade === 'B'
                                          ? 'bg-gray-600 text-white'
                                          : grade === 'C'
                                          ? 'bg-gray-500 text-white'
                                          : grade === 'D'
                                          ? 'bg-gray-400 text-black'
                                          : grade === 'E'
                                          ? 'bg-gray-300 text-black'
                                          : 'bg-gray-200 text-black'
                                      }`}
                                    >
                                      {grade}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">-</td>
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
                      <h3 className="text-2xl font-bold mb-6 border-b border-gray-300 pb-2">
                        Charts
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pie Chart */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h4 className="text-lg font-semibold mb-4 text-center">
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
<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
  <h4 className="text-lg font-semibold mb-4 text-center">
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
                      <h3 className="text-2xl font-bold mb-6 border-b border-gray-300 pb-2">
                        Details
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                              <th className="p-3 text-left font-semibold">Subject</th>
                              <th className="p-3 text-center font-semibold">Credits</th>
                              <th className="p-3 text-center font-semibold">Grade</th>
                              <th className="p-3 text-center font-semibold">Points</th>
                              <th className="p-3 text-center font-semibold">Contribution</th>
                            </tr>
                          </thead>
                          <tbody>
                            {grades.calculation_details.map((item: any, index: any) => (
                              <tr
                                key={index}
                                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                }`}
                              >
                                <td className="p-3 font-medium">{item.subject}</td>
                                <td className="p-3 text-center">{item.credits}</td>
                                <td className="p-3 text-center">
                                  <span
                                    className={`inline-block py-1 px-3 rounded ${
                                      item.grade === 'Ex'
                                        ? 'bg-black text-white'
                                        : item.grade === 'A'
                                        ? 'bg-gray-800 text-white'
                                        : item.grade === 'B'
                                        ? 'bg-gray-600 text-white'
                                        : item.grade === 'C'
                                        ? 'bg-gray-500 text-white'
                                        : item.grade === 'D'
                                        ? 'bg-gray-400 text-black'
                                        : item.grade === 'E'
                                        ? 'bg-gray-300 text-black'
                                        : 'bg-gray-200 text-black'
                                    }`}
                                  >
                                    {item.grade}
                                  </span>
                                </td>
                                <td className="p-3 text-center">{item.points}</td>
                                <td className="p-3 text-center font-medium">
                                  {item.contribution}
                                </td>
                              </tr>
                            ))}
                            {/* Total Row */}
                            <tr className="bg-gray-100 font-bold">
                              <td className="p-3">Total</td>
                              <td className="p-3 text-center">
                                {grades.calculation_details
                                  .reduce((sum: any, item: any) => sum + item.credits, 0)
                                  .toFixed(1)}
                              </td>
                              <td className="p-3 text-center">-</td>
                              <td className="p-3 text-center">-</td>
                              <td className="p-3 text-center">
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
<div className="p-6 bg-gray-50 border-t border-gray-200">
  <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
    {/* GPA Card */}
    <div className="bg-black text-white px-6 py-4 rounded-lg shadow-md w-full max-w-sm flex flex-col justify-center">
      <h3 className="text-lg font-bold text-center">GPA</h3>
      <div className="text-4xl font-bold text-center">
        {grades.gpa !== null ? grades.gpa.toFixed(2) : 'N/A'}
      </div>
      {grades.gpa === null && (
        <div className="text-sm text-gray-300 mt-1 text-center">
          Results not yet updated
        </div>
      )}
    </div>

    {/* Motivational Messages Card */}
    {grades.motivational_messages && grades.motivational_messages.length > 0 && (
      <div
        className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm w-full max-w-sm flex flex-col justify-center cursor-pointer min-h-[120px]"
        onClick={cycleMessage}
      >
        {showMessage ? (
          <>
            <p className="italic font-medium text-center line-clamp-2">
              "{grades.motivational_messages[messageIdx]}"
            </p>
            <div className="text-xs text-gray-500 mt-1 text-center">
              Click to see another message
            </div>
          </>
        ) : (
          <div className="text-center py-2">
            <span className="inline-block w-2 h-2 bg-gray-300 rounded-full animate-pulse"></span>
            <span className="inline-block w-2 h-2 bg-gray-300 rounded-full animate-pulse mx-1"></span>
            <span className="inline-block w-2 h-2 bg-gray-300 rounded-full animate-pulse"></span>
          </div>
        )}
      </div>
    )}
  </div>

  {/* GradeLite Branding */}
  {grades.gpa !== null && (
    <div className="mt-4 text-center">
      <p className="text-sm font-medium text-gray-600">
        Grade Calculation by{' '}
        <a
          href="https://sreecharan-desu.github.io/Gradelite/#GradeLite"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline hover:text-gray-800 transition-colors"
          aria-label="Visit GradeLite for grade calculation"
        >
          GradeLite
        </a>
      </p>
    </div>
  )}
</div>
              </>
            )}

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setResultsFetched(false);
                  setGrades(null);
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
              Please sign in to view your academic results.
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
            <h3 className="text-xl font-semibold mb-2">No Results Selected</h3>
            <p className="text-gray-600 mb-4">
              Select a year and semester, then click "View Results" to see your grades.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}