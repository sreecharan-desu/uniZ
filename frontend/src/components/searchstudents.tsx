/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useDebounce } from '../customhooks/useDebounce';
import { useIsAuth } from '../customhooks/is_authenticated';

const SEARCH_STUDENTS = 'https://uni-z-api.vercel.app/api/v1/admin/searchstudent';

import { useNavigate } from 'react-router-dom';

// Inside the SearchStudents component, add the back button:



// StudentCardSkeleton Component
const StudentCardSkeleton = () => (
  <div className="animate-pulse m-5 p-5 bg-gray-100 shadow-lg rounded-lg">
    <div className="flex items-center space-x-4 mb-4">
      <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-4 bg-gray-300 rounded w-full"></div>
      ))}
    </div>
  </div>
);

interface StudentProps {
  _id: string;
  username: string;
  name: string;
  gender: string;
  email: string;
  year: string;
  branch: string;
  section: string;
  roomno: string;
  has_pending_requests: boolean;
  is_in_campus: boolean;
  blood_group: string;
  phone_number: string;
  count: {
    Outpass: number;
    Outing: number;
    grades: number;
    attendance: number;
  };
  created_at: string;
  date_of_birth: string;
  updated_at: string;
  father_address: string;
  father_name: string;
  father_phonenumber: string;
  mother_address: string;
  mother_name: string;
  mother_phonenumber: string;
  father_email: string;
  mother_email: string;
  father_occupation: string;
  mother_occupation: string;
  is_disabled: boolean;
}

export default function SearchStudents() {
  useIsAuth();
  const [string, setString] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState<StudentProps | null>(null);
  const debouncedValue = useDebounce(string, 500);
  const navigate = useNavigate();

  const getDetails = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('admin_token');

    // Check if input is empty
    if (!debouncedValue) {
      setError('Please enter a student ID');
      setIsLoading(false);
      return;
    }

    // Check if input starts with 'o' (case insensitive)
    if (!debouncedValue.toLowerCase().match(/^o/)) {
      setError("Student ID must start with 'o'");
      setIsLoading(false);
      return;
    }

    // Check if token exists
    if (!token) {
      setError('Authentication token not found');
      setIsLoading(false);
      return;
    }

    try {
      const cleanToken = token.replace(/^["'](.+(?=["']$))["']$/, '$1');
      const bodyData = JSON.stringify({ username: debouncedValue.toLowerCase() });
      const res = await fetch(SEARCH_STUDENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanToken}`,
        },
        body: bodyData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) {
        setError(data.msg || 'Failed to fetch student details');
        setStudent(null);
        return;
      }

      setStudent(data.student);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError('Failed to fetch student details. Please try again.');
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
      <button
  onClick={() => navigate('/admin')}
  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
>
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 19l-7-7 7-7"
    />
  </svg>
  Back
</button>
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Student Search Portal</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Search for detailed student information including personal details, grades, and attendance records
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter student ID (e.g., o210008)"
              className="w-full h-12 pl-5 pr-12 text-lg border-2 border-gray-300 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-300"
              onChange={(e) => {
                setString(e.target.value);
                setError('');
              }}
            />
            <button
              onClick={getDetails}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
        </div>
      </div>

      {/* Results Section */}
      {isLoading ? (
        <StudentCardSkeleton />
      ) : student ? (
        <div className="space-y-8">
          {/* Student Info Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                  {student.name.charAt(0)}
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{student.name}</h2>
                  <p className="text-gray-100">{student.username}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{student.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p className="font-medium capitalize">{student.gender}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Year</label>
                  <p className="font-medium">{student.year}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Branch</label>
                  <p className="font-medium">{student.branch}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Blood Group</label>
                  <p className="font-medium">{student.blood_group}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone Number</label>
                  <p className="font-medium">{student.phone_number}</p>
                </div>

    
                <div>
                  <label className="text-sm text-gray-500">Father's Name</label>
                  <p className="font-medium">{student.father_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Father's Phone</label>
                  <p className="font-medium">{student.father_phonenumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Father's Email</label>
                  <p className="font-medium">{student.father_email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Father's Occupation</label>
                  <p className="font-medium">{student.father_occupation}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Father's Address</label>
                  <p className="font-medium">{student.father_address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mother's Name</label>
                  <p className="font-medium">{student.mother_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mother's Phone</label>
                  <p className="font-medium">{student.mother_phonenumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mother's Email</label>
                  <p className="font-medium">{student.mother_email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mother's Occupation</label>
                  <p className="font-medium">{student.mother_occupation}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mother's Address</label>
                  <p className="font-medium">{student.mother_address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Disability Status</label>
                  <p className="font-medium">{student.is_disabled ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

   
        </div>
      ) : null}
    </div>
  );
}