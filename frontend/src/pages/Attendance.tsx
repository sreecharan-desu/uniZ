import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { motion } from 'framer-motion';
import axios from 'axios';
import { student } from '../store';

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

export default function Attendance() {
  const user = useRecoilValue(student);
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.username) {
        setError('Please sign in to view attendance');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
        const response = await axios.post<AttendanceResponse>(
          'https://uni-z-api.vercel.app/api/v1/student/getattendance',
          { username: user.username },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          setAttendanceData(response.data);
        } else {
          setError(response.data.msg || 'Failed to fetch attendance');
          setAttendanceData(null);
        }
      } catch (err) {
        setError('An error occurred while fetching attendance');
        setAttendanceData(null);
      }
      setIsLoading(false);
      setIsVisible(true); // Trigger animations after data fetch
    };

    fetchAttendance();
  }, [user]);

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

  // Skeleton Loader Component
  const SkeletonLoader = ({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) => (
    <div className={`bg-gray-300 rounded ${width} ${height} animate-pulse`}></div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
      <motion.div
        className="max-w-5xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        {/* Header */}
        <motion.h1
          className="text-5xl font-bold mb-6 text-center"
          variants={itemVariants}
        >
          Attendance
        </motion.h1>
        <motion.div
          className="h-1 w-24 bg-black mx-auto mb-12"
          variants={itemVariants}
        ></motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-gray-300 border border-gray-400 text-black p-4 rounded-lg mb-6 text-center"
            variants={itemVariants}
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <motion.div className="space-y-8" variants={itemVariants}>
            {['E1', 'E2'].map((year, yearIndex) => (
              <div key={yearIndex}>
                <SkeletonLoader width="w-1/4" height="h-6" />
                <div className="space-y-4 mt-4">
                  {['Sem - 1', 'Sem - 2'].map((semester, semIndex) => (
                    <div key={semIndex} className="space-y-2">
                      <SkeletonLoader width="w-1/3" height="h-5" />
                      <div className="overflow-x-auto">
                        <table className="w-full bg-gray-200 rounded-lg">
                          <thead>
                            <tr className="border-b border-gray-400">
                              <th className="p-4 text-left"><SkeletonLoader width="w-32" height="h-4" /></th>
                              <th className="p-4 text-left"><SkeletonLoader width="w-24" height="h-4" /></th>
                              <th className="p-4 text-left"><SkeletonLoader width="w-24" height="h-4" /></th>
                              <th className="p-4 text-left"><SkeletonLoader width="w-24" height="h-4" /></th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array(5).fill(0).map((_, i) => (
                              <tr key={i} className="border-b border-gray-400">
                                <td className="p-4"><SkeletonLoader width="w-48" height="h-4" /></td>
                                <td className="p-4"><SkeletonLoader width="w-16" height="h-4" /></td>
                                <td className="p-4"><SkeletonLoader width="w-16" height="h-4" /></td>
                                <td className="p-4"><SkeletonLoader width="w-16" height="h-4" /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          /* Attendance Data */
          attendanceData && attendanceData.success ? (
            <motion.div className="space-y-12" variants={itemVariants}>
              {Object.entries(attendanceData.attendance_data).map(([year, semesters]) => (
                <div key={year}>
                  <motion.h2
                    className="text-2xl font-bold mb-4"
                    variants={itemVariants}
                  >
                    {year}
                  </motion.h2>
                  {Object.entries(semesters).map(([semester, data]) => (
                    <motion.div key={semester} className="mb-8" variants={itemVariants}>
                      <h3 className="text-xl font-semibold mb-4">{semester}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full bg-gray-200 rounded-lg">
                          <thead>
                            <tr className="border-b border-gray-400">
                              <th className="p-4 text-left font-semibold">Subject</th>
                              <th className="p-4 text-left font-semibold">Total Classes</th>
                              <th className="p-4 text-left font-semibold">Classes Attended</th>
                              <th className="p-4 text-left font-semibold">Attendance %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(data.subjects).map(([subject, attendance], index) => (
                              <tr key={index} className="border-b border-gray-400 last:border-b-0">
                                <td className="p-4">{subject}</td>
                                <td className="p-4">{attendance.totalClasses}</td>
                                <td className="p-4">{attendance.classesAttended}</td>
                                <td className="p-4">{attendance.attendancePercentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <motion.div className="mt-4 text-lg" variants={itemVariants}>
                        <p>
                          <span className="font-semibold">Semester Total:</span>{' '}
                          {data.classesAttended}/{data.totalClasses} ({data.attendancePercentage}%)
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </motion.div>
          ) : (
            !error && (
              <motion.p
                className="text-lg text-gray-600 text-center"
                variants={itemVariants}
              >
                No attendance data available.
              </motion.p>
            )
          )
        )}
      </motion.div>
    </div>
  );
}