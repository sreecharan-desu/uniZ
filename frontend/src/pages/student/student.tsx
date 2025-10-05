import { useState, useEffect, useCallback, memo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  FaUser,
  FaVenusMars,
  FaTint,
  FaPhone,
  FaEdit,
  FaCheck,
  FaTimes,
  FaGraduationCap,
  FaIdCard,
  FaDoorOpen,
} from 'react-icons/fa';
import axios from 'axios';
import { student } from '../../store';
import { useIsAuth } from '../../customhooks/is_authenticated';
import { useStudentData } from '../../customhooks/student_info';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { BASE_URL } from '../../apis';

export const enableOutingsAndOutpasses = false;

// Memoized InfoCard
const InfoCard = memo(({ icon, label, name, value, editable, isEditing, isLoading, onValueChange, type = 'text' }: any) => {
  const handleChange = (e: any) => onValueChange(name, e.target.value);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center space-x-3 mb-2">
        {icon}
        <span className="text-gray-600 font-semibold">{label}</span>
      </div>
      {isLoading ? (
        <div className="bg-gray-100 rounded w-full h-6 animate-pulse"></div>
      ) : isEditing && editable ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full bg-white text-black rounded-lg p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          autoComplete="off"
        />
      ) : (
        <p className="text-black text-lg font-medium">
          {value || (
            <span className="bg-gray-400 italic px-4 rounded-full text-xs font-bold py-0">
              Will be updated soon
            </span>
          )}
        </p>
      )}
    </div>
  );
});

// Memoized InputField
const InputField = memo(({ label, name, value, isEditing, isLoading, onValueChange, type = 'text' }: any) => {
  const handleChange = (e: any) => onValueChange(name, e.target.value);

  return (
    <div className="flex flex-col">
      <span className="text-gray-600">{label}</span>
      {isLoading ? (
        <div className="bg-gray-100 rounded w-full h-6 animate-pulse"></div>
      ) : isEditing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full bg-white text-black rounded-lg p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          autoComplete="off"
        />
      ) : (
        <span className="text-black text-lg font-medium">{value || <span className="bg-gray-400 italic px-4 rounded-full text-xs font-bold py-0">Will be updated soon</span>}</span>
      )}
    </div>
  );
});

export default function StudentProfilePage() {
  useIsAuth();
  useStudentData();
  const user = useRecoilValue<any>(student);
  const setStudent = useSetRecoilState(student);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Banner states
  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  // Single fields state
  const [fields, setFields] = useState<any>({
    name: '',
    gender: '',
    bloodGroup: '',
    phoneNumber: '',
    dateOfBirth: '',
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    fatherEmail: '',
    motherEmail: '',
    fatherAddress: '',
    motherAddress: '',
    fatherPhoneNumber: '',
    motherPhoneNumber: '',
  });

  // Initialize fields from user
  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setFields({
        name: user.name || '',
        gender: user.gender || '',
        bloodGroup: user.blood_group || '',
        phoneNumber: user.phone_number || '',
        dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
        fatherName: user.father_name || '',
        motherName: user.mother_name || '',
        fatherOccupation: user.father_occupation || '',
        motherOccupation: user.mother_occupation || '',
        fatherEmail: user.father_email || '',
        motherEmail: user.mother_email || '',
        fatherAddress: user.father_address || '',
        motherAddress: user.mother_address || '',
        fatherPhoneNumber: user.father_phonenumber || '',
        motherPhoneNumber: user.mother_phonenumber || '',
      });
      setIsLoading(false);
    }
  }, [user]);

  // Banner fetch
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/banners?published=true`);
        if (res.data.success) setBanners(res.data.banners);
      } catch (err) {
        console.error("Error fetching banners", err);
      } finally {
        setLoadingBanners(false);
      }
    };
    fetchBanners();
  }, []);

  const sliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 4000 };

  // Field change handler
  const handleFieldChange = useCallback((name: string, value: any) => {
    setFields((prev: any) => ({ ...prev, [name]: value }));
  }, []);

  // Reset fields
  const resetFields = useCallback(() => {
    if (user) {
      setFields({
        name: user.name || '',
        gender: user.gender || '',
        bloodGroup: user.blood_group || '',
        phoneNumber: user.phone_number || '',
        dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
        fatherName: user.father_name || '',
        motherName: user.mother_name || '',
        fatherOccupation: user.father_occupation || '',
        motherOccupation: user.mother_occupation || '',
        fatherEmail: user.father_email || '',
        motherEmail: user.mother_email || '',
        fatherAddress: user.father_address || '',
        motherAddress: user.mother_address || '',
        fatherPhoneNumber: user.father_phonenumber || '',
        motherPhoneNumber: user.mother_phonenumber || '',
      });
    }
  }, [user]);

  // Validation
  const validateForm = () => {
    if (!fields.name.trim()) return 'Name is required';
    if (!fields.phoneNumber.match(/^\d{10}$/)) return 'Phone number must be 10 digits';
    if (fields.fatherEmail && !fields.fatherEmail.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) return 'Invalid father email format';
    if (fields.motherEmail && !fields.motherEmail.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) return 'Invalid mother email format';
    return null;
  };

  const handleSubmit = async (e: any) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.put(
        'https://uni-z-api.vercel.app/api/v1/student/updatedetails',
        { username: user.username, ...fields },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStudent(prev => ({ ...prev, ...fields }));
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.msg || 'Update failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'An error occurred while updating');
    }

    setIsSubmitting(false);
  };

  if (!user && !isLoading) return <div className="text-center text-red-600">Error: User data not available</div>;

  // Fields definitions for dynamic rendering
  const personalFields = [
    { icon: <FaUser className="text-black" />, label: 'Full Name', name: 'name', editable: true },
    { icon: <FaVenusMars className="text-black" />, label: 'Gender', name: 'gender', editable: true },
    { icon: <FaTint className="text-black" />, label: 'Blood Group', name: 'bloodGroup', editable: true },
    { icon: <FaPhone className="text-black" />, label: 'Phone Number', name: 'phoneNumber', editable: true },
  ];

  const academicFields = [
    { icon: <FaIdCard className="text-black" />, label: 'Student ID', name: 'username', editable: false, value: user?.username },
    { icon: <FaGraduationCap className="text-black" />, label: 'Year', name: 'year', editable: false, value: user?.year },
    { icon: <FaGraduationCap className="text-black" />, label: 'Branch', name: 'branch', editable: false, value: user?.branch },
    { icon: <FaGraduationCap className="text-black" />, label: 'Section', name: 'section', editable: false, value: user?.section },
    { icon: <FaDoorOpen className="text-black" />, label: 'Room Number', name: 'roomno', editable: false, value: user?.roomno },
  ];

  const familyFields = {
    father: ['fatherName', 'fatherOccupation', 'fatherEmail', 'fatherPhoneNumber', 'fatherAddress'],
    mother: ['motherName', 'motherOccupation', 'motherEmail', 'motherPhoneNumber', 'motherAddress'],
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-black -mt-10">
      <div className="container mx-auto px-4 py-8">

        {/* Banners */}
       {/* Banners */}
{banners.length > 0 && !loadingBanners && (
  <div className="mb-8">
    <Slider {...sliderSettings} className="rounded-lg overflow-hidden">
      {banners.map(b => (
        <div key={b.id} className="relative">
          <img src={b.imageUrl} alt={b.title} className="w-full h-64 md:h-80 object-cover rounded-lg" />
          {b.title && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              {b.title}
            </div>
          )}
        </div>
      ))}
    </Slider>
  </div>
)}


        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-black text-white p-4">
            <h1 className="text-2xl font-bold">Student Profile</h1>
          </div>
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-black rounded-full border-4 border-gray-200 flex items-center justify-center text-white">
                {isLoading ? <div className="bg-gray-100 rounded w-16 h-16 animate-pulse"></div> : <span className="text-5xl font-bold">{user.name?.[0] || ''}</span>}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              {isLoading ? (
                <>
                  <div className="bg-gray-100 rounded w-3/4 h-8 animate-pulse"></div>
                  <div className="bg-gray-100 rounded w-1/2 h-4 animate-pulse"></div>
                  <div className="bg-gray-100 rounded w-1/3 h-4 animate-pulse"></div>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold mb-2 text-black">{user.name || 'N/A'}</h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center"><FaIdCard className="mr-2" /> {user.username || 'N/A'}</span>
                    <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center"><FaGraduationCap className="mr-2" /> {user.branch || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Edit Buttons */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                    <FaCheck className="inline mr-1" /> Save
                  </button>
                  <button onClick={() => { setIsEditing(false); resetFields(); }} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                    <FaTimes className="inline mr-1" /> Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  <FaEdit className="inline mr-1" /> Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex border-b border-gray-200">
          {['personal', 'academic', 'family'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 -mb-px font-semibold text-black ${activeTab === tab ? 'border-b-2 border-black' : 'text-gray-500'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === 'personal' &&
            personalFields.map(f => (
              <InfoCard
                key={f.name}
                icon={f.icon}
                label={f.label}
                name={f.name}
                value={fields[f.name]}
                editable={f.editable}
                isEditing={isEditing}
                isLoading={isLoading}
                onValueChange={handleFieldChange}
              />
            ))}

          {activeTab === 'academic' &&
            academicFields.map(f => (
              <InfoCard
                key={f.name}
                icon={f.icon}
                label={f.label}
                name={f.name}
                value={f.value || fields[f.name]}
                editable={f.editable}
                isEditing={isEditing}
                isLoading={isLoading}
                onValueChange={handleFieldChange}
              />
            ))}

          {activeTab === 'family' &&
            Object.entries(familyFields).map(([parent, keys]) => (
              <div key={parent} className="col-span-1 md:col-span-2">
                <h2 className="text-xl font-bold mb-4 text-black">{parent.charAt(0).toUpperCase() + parent.slice(1)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keys.map(key => (
                    <InputField
                      key={key}
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      name={key}
                      value={fields[key]}
                      isEditing={isEditing}
                      isLoading={isLoading}
                      onValueChange={handleFieldChange}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Error / Success */}
        {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
        {success && <div className="mt-4 text-green-600 font-semibold">{success}</div>}
      </div>
    </div>
  );
}
