import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import axios from 'axios';
import { student } from '../store';

// Define semester options with year and semester mappings
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
const years = Array.from(new Set(semesterOptions.map(opt => opt.year))).sort(); // ['E1', 'E2', 'E3', 'E4']

interface GradeData {
  [subject: string]: string;
}

interface GradeResponse {
  success: boolean;
  year: string;
  semester: string;
  grade_data: GradeData;
  gpa: string | number | null;
  msg?: string;
}

export default function GradeHub() {
  const user = useRecoilValue(student);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [grades, setGrades] = useState<GradeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get available semesters for the selected year
  const availableSemesters = semesterOptions
    .filter(opt => opt.year === selectedYear)
    .map(opt => opt.name)
    .sort();

  // Handle Fetch Grades button click
  const handleFetchGrades = async () => {
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
      opt => opt.year === selectedYear && opt.name === selectedSemester
    );

    if (!semesterOption) {
      setError('Invalid year and semester combination');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
      const response = await axios.post<GradeResponse>(
        'https://uni-z-api.vercel.app/api/v1/student/getgrades',
        {
          username: user.username,
          semesterId: semesterOption.id,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setGrades(response.data);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const pikachuVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        type: 'spring',
        bounce: 0.4,
      },
    },
  };

  // Skeleton Loader Component
  const SkeletonLoader = ({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) => (
    <div className={`bg-gray-300 rounded ${width} ${height} animate-pulse`}></div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-black flex flex-col">
      <main className="flex-grow flex items-center justify-center py-16 px-6">
        {isLoading ? (
          <motion.div
            className="text-center max-w-3xl"
            variants={pikachuVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative mx-auto mb-8">
              <img
                src="/pikachu.png"
                alt="Pikachu"
                className="w-40 h-40 object-contain"
              />
              <motion.div
                className="absolute -top-4 -right-4"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Zap size={24} className="text-black" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold mb-6">
              Pikachu is fetching your results, please hold on ⚡️
            </h2>
          </motion.div>
        ) : (
          <motion.div
            className="text-center max-w-4xl w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-4xl font-bold mb-6 tracking-tight"
              variants={itemVariants}
            >
              Your Grades
            </motion.h2>
            {error && (
              <motion.div
                className="bg-gray-300 border border-gray-400 text-black p-4 rounded-lg mb-6"
                variants={itemVariants}
              >
                {error}
              </motion.div>
            )}
            <motion.div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
              <div>
                <label htmlFor="year" className="block text-lg font-semibold mb-2">
                  Select Year
                </label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedSemester(''); // Reset semester when year changes
                    setGrades(null); // Clear grades
                  }}
                  className="bg-gray-100 text-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="semester" className="block text-lg font-semibold mb-2">
                  Select Semester
                </label>
                <select
                  id="semester"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="bg-gray-100 text-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={!selectedYear}
                >
                  <option value="">Select Semester</option>
                  {availableSemesters.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
            <motion.div className="mb-6" variants={itemVariants}>
              <button
                onClick={handleFetchGrades}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                disabled={!selectedYear || !selectedSemester}
              >
                Fetch Grades
              </button>
            </motion.div>
            {grades && grades.success ? (
              <>
                <motion.div className="mb-6 text-left" variants={itemVariants}>
                  <p className="text-lg">
                    <span className="font-semibold">Semester:</span> {grades.semester}
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold">Year:</span> {grades.year}
                  </p>
                </motion.div>
                <motion.div className="overflow-x-auto" variants={itemVariants}>
                  <table className="w-full bg-gray-200 rounded-lg">
                    <thead>
                      <tr className="border-b border-gray-400">
                        <th className="p-4 text-left font-semibold">Subject</th>
                        <th className="p-4 text-left font-semibold">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(grades.grade_data).map(([subject, grade], index) => (
                        <tr key={index} className="border-b border-gray-400 last:border-b-0">
                          <td className="p-4">{subject}</td>
                          <td className="p-4">{grade || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
                <motion.div className="mt-6 text-lg" variants={itemVariants}>
                  <p className="font-semibold">
                    GPA:{' '}
                    {typeof grades.gpa === 'string'
                      ? grades.gpa
                      : grades.gpa !== null
                      ? grades.gpa.toString()
                      : 'N/A'}
                  </p>
                </motion.div>
              </>
            ) : (
              !error && grades && (
                <motion.p
                  className="text-lg text-gray-600"
                  variants={itemVariants}
                >
                  No grades available for this semester.
                </motion.p>
              )
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}