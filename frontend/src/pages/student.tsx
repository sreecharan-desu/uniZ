import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { FaUser, FaVenusMars, FaTint, FaPhone, FaEnvelope, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { student } from '../store';
import { useIsAuth } from '../customhooks/is_authenticated';
import { useStudentData } from '../customhooks/student_info';
export const enableOutingsAndOutpasses = false;

interface StudentDetailsProps {
  label: string;
  value: string | boolean;
  icon: React.ReactNode;
  editable?: boolean;
  type?: string;
}

export default function StudentProfilePage() {
  useIsAuth();
  useStudentData();
  const user = useRecoilValue(student);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    blood_group: '',
    phone_number: '',
    date_of_birth: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update formData when user data is loaded
  useEffect(() => {
    if (user?.name) {
      setFormData({
        name: user.name || '',
        gender: user.gender || '',
        blood_group: user.blood_group || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
        email: user.email || '',
      });
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
      const response = await axios.put('https://uni-z-api.vercel.app/api/v1/student/updatedetails', 
        {
          username: user.username,
          name: formData.name,
          gender: formData.gender,
          bloodGroup: formData.blood_group,
          phoneNumber: formData.phone_number,
          dateOfBirth: formData.date_of_birth,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setIsEditing(false);
      } else {
        setError(response.data.msg || 'Update failed');
      }
    } catch (err) {
      setError('An error occurred while updating');
    }
    setIsSubmitting(false);
  };

  const personalDetails: StudentDetailsProps[] = [
    { 
      label: 'Name', 
      value: formData.name, 
      icon: <FaUser className="text-black" />,
      editable: true
    },
    { 
      label: 'Gender', 
      value: formData.gender, 
      icon: <FaVenusMars className="text-black" />,
      editable: true
    },
    { 
      label: 'Blood Group', 
      value: formData.blood_group, 
      icon: <FaTint className="text-black" />,
      editable: true
    },
    { 
      label: 'Phone Number', 
      value: formData.phone_number, 
      icon: <FaPhone className="text-black" />,
      editable: true
    },
    { 
      label: 'Email', 
      value: formData.email, 
      icon: <FaEnvelope className="text-black" />,
      editable: false
    }
  ];

  // Skeleton Loader Component
  const SkeletonLoader = ({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) => (
    <div className={`bg-gray-300 rounded ${width} ${height} animate-pulse`}></div>
  );

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="bg-gray-200 rounded-lg p-8 mb-8 relative -mt-20 shadow-lg">
          <div className="flex items-center space-x-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-gray-400 flex items-center justify-center">
                {isLoading ? (
                  <SkeletonLoader width="w-16" height="h-16" />
                ) : (
                  <span className="text-5xl font-bold text-black">
                    {user.name?.[0] || ''}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1">
              {isLoading ? (
                <>
                  <SkeletonLoader width="w-3/4" height="h-8" />
                  <SkeletonLoader width="w-1/2" height="h-4" />
                  <SkeletonLoader width="w-1/3" height="h-4" />
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-2">
                    {user.name || 'N/A'}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {user.year && user.branch ? `${user.year} - ${user.branch}` : 'N/A'}
                  </p>
                  <p className="text-gray-600 mt-1">{user.username || 'N/A'}</p>
                </>
              )}
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-6 right-4 bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors flex items-center space-x-2"
                disabled={isLoading}
              >
                <FaEdit /> <span className="hidden md:inline">Edit Profile</span>
              </button>
            ) : (
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || isLoading}
                  className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <FaCheck /> <span className="hidden md:inline">Save</span>
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name || '',
                      gender: user.gender || '',
                      blood_group: user.blood_group || '',
                      phone_number: user.phone_number || '',
                      date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
                      email: user.email || '',
                    });
                  }}
                  className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  disabled={isLoading}
                >
                  <FaTimes /> <span className="hidden md:inline">Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-gray-200 rounded-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold mb-6 text-black">Personal Details</h2>
          {error && (
            <div className="bg-gray-300 border border-gray-400 text-black p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {personalDetails.map((detail, index) => (
              <div 
                key={index} 
                className="bg-gray-300 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3 mb-2">
                  {detail.icon}
                  <span className="text-gray-600 font-semibold">{detail.label}</span>
                </div>
                {isLoading ? (
                  <SkeletonLoader width="w-full" height="h-6" />
                ) : isEditing && detail.editable ? (
                  <input
                    type={detail.type || 'text'}
                    name={detail.label.toLowerCase().replace(' ', '_')}
                    value={formData[detail.label.toLowerCase().replace(' ', '_') as keyof typeof formData] as string}
                    onChange={handleInputChange}
                    className="w-full bg-gray-100 text-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-black text-lg font-bold">
                    {typeof detail.value === 'boolean' 
                      ? (detail.value ? 'Yes' : 'No') 
                      : detail.value || 'N/A'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Parent Information */}
        <div className="bg-gray-200 rounded-lg p-8 mt-8 space-y-6">
          <h2 className="text-2xl font-bold mb-6 text-black">Parent Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Father's Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-black">Father</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaUser className="text-black" />
                  <span className="font-semibold text-gray-600">Name:</span>
                  {isLoading ? (
                    <SkeletonLoader width="w-1/2" height="h-4" />
                  ) : (
                    <span className="text-black">{user.father_name || 'N/A'}</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-black" />
                  <span className="font-semibold text-gray-600">Phone:</span>
                  {isLoading ? (
                    <SkeletonLoader width="w-1/2" height="h-4" />
                  ) : (
                    <span className="text-black">{user.father_phonenumber || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mother's Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-black">Mother</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaUser className="text-black" />
                  <span className="font-semibold text-gray-600">Name:</span>
                  {isLoading ? (
                    <SkeletonLoader width="w-1/2" height="h-4" />
                  ) : (
                    <span className="text-black">{user.mother_name || 'N/A'}</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-black" />
                  <span className="font-semibold text-gray-600">Phone:</span>
                  {isLoading ? (
                    <SkeletonLoader width="w-1/2" height="h-4" />
                  ) : (
                    <span className="text-black">{user.mother_phonenumber || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}