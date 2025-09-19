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
  FaHome,
  FaUsers,
} from 'react-icons/fa';
import axios from 'axios';
import { student } from '../../store';
import { useIsAuth } from '../../customhooks/is_authenticated';
import { useStudentData } from '../../customhooks/student_info';

export const enableOutingsAndOutpasses = false;

// Create individual field components with their own state
const InputField = memo(({ 
  label, 
  initialValue = '', 
  editable = true, 
  type = 'text', 
  isEditing, 
  isLoading,
  name,
  onValueChange 
}:any) => {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isEditing]);
  
  const handleChange = (e:any) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange(name, newValue);
  };
  
  return (
    <div className="flex flex-col">
      <span className="text-gray-600">{label}</span>
      {isLoading ? (
        <div className="bg-gray-100 rounded w-full h-6 animate-pulse"></div>
      ) : isEditing && editable ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full bg-white text-black rounded-lg p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          aria-label={label}
          autoComplete="off"
        />
      ) : (
        <span className="text-black text-lg font-medium">
          {value || (
            <span className="bg-gray-400 italic px-4 rounded-full text-xs font-bold py-0">
              Will be updated soon
            </span>
          )}
        </span>
      )}
    </div>
  );
});

// InfoCard component with individual state
const InfoCard = memo(({
  icon,
  label,
  initialValue = '',
  editable = true,
  name,
  type = 'text',
  isEditing,
  isLoading,
  onValueChange
}:any) => {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isEditing]);
  
  const handleChange = (e:any) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange(name, newValue);
  };
  
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
          aria-label={label}
          required={name === 'name' || name === 'phone_number'}
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
  
  // Individual field states
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [fatherEmail, setFatherEmail] = useState('');
  const [motherEmail, setMotherEmail] = useState('');
  const [fatherAddress, setFatherAddress] = useState('');
  const [motherAddress, setMotherAddress] = useState('');
  const [fatherPhoneNumber, setFatherPhoneNumber] = useState('');
  const [motherPhoneNumber, setMotherPhoneNumber] = useState('');

  // Initialize field values from user data
  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setName(user.name || '');
      setGender(user.gender || '');
      setBloodGroup(user.blood_group || '');
      setPhoneNumber(user.phone_number || '');
      setDateOfBirth(user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '');
      setFatherName(user.father_name || '');
      setMotherName(user.mother_name || '');
      setFatherOccupation(user.father_occupation || '');
      setMotherOccupation(user.mother_occupation || '');
      setFatherEmail(user.father_email || '');
      setMotherEmail(user.mother_email || '');
      setFatherAddress(user.father_address || '');
      setMotherAddress(user.mother_address || '');
      setFatherPhoneNumber(user.father_phonenumber || '');
      setMotherPhoneNumber(user.mother_phonenumber || '');
      setIsLoading(false);
    }
  }, [user]);
  
  // Handle field value changes
  const handleFieldChange = useCallback((field:any, value:any) => {
    switch(field) {
      case 'name': setName(value); break;
      case 'gender': setGender(value); break;
      case 'blood_group': setBloodGroup(value); break;
      case 'phone_number': setPhoneNumber(value); break;
      case 'date_of_birth': setDateOfBirth(value); break;
      case 'fatherName': setFatherName(value); break;
      case 'motherName': setMotherName(value); break;
      case 'fatherOccupation': setFatherOccupation(value); break;
      case 'motherOccupation': setMotherOccupation(value); break;
      case 'fatherEmail': setFatherEmail(value); break;
      case 'motherEmail': setMotherEmail(value); break;
      case 'fatherAddress': setFatherAddress(value); break;
      case 'motherAddress': setMotherAddress(value); break;
      case 'fatherPhoneNumber': setFatherPhoneNumber(value); break;
      case 'motherPhoneNumber': setMotherPhoneNumber(value); break;
      default: break;
    }
  }, []);

  // Reset fields to original values
  const resetFields = useCallback(() => {
    setName(user.name || '');
    setGender(user.gender || '');
    setBloodGroup(user.blood_group || '');
    setPhoneNumber(user.phone_number || '');
    setDateOfBirth(user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '');
    setFatherName(user.father_name || '');
    setMotherName(user.mother_name || '');
    setFatherOccupation(user.father_occupation || '');
    setMotherOccupation(user.mother_occupation || '');
    setFatherEmail(user.father_email || '');
    setMotherEmail(user.mother_email || '');
    setFatherAddress(user.father_address || '');
    setMotherAddress(user.mother_address || '');
    setFatherPhoneNumber(user.father_phonenumber || '');
    setMotherPhoneNumber(user.mother_phonenumber || '');
  }, [user]);

  const validateForm = () => {
    if (!name.trim()) return 'Name is required';
    if (!phoneNumber.match(/^\d{10}$/)) return 'Phone number must be 10 digits';
    if (fatherEmail && !fatherEmail.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return 'Invalid father email format';
    }
    if (motherEmail && !motherEmail.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return 'Invalid mother email format';
    }
    return null;
  };

  const handleSubmit = async (e:any) => {
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
        {
          username: user.username,
          name,
          gender,
          bloodGroup,
          phoneNumber,
          dateOfBirth,
          fatherName,
          motherName,
          fatherOccupation,
          motherOccupation,
          fatherEmail,
          motherEmail,
          fatherAddress,
          motherAddress,
          fatherPhoneNumber,
          motherPhoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStudent((prev) => ({
          ...prev,
          username: response.data.student.username,
          email: response.data.student.email,
          name,
          gender,
          blood_group: bloodGroup,
          phone_number: phoneNumber,
          date_of_birth: dateOfBirth,
          father_name: fatherName,
          mother_name: motherName,
          father_occupation: fatherOccupation,
          mother_occupation: motherOccupation,
          father_email: fatherEmail,
          mother_email: motherEmail,
          father_address: fatherAddress,
          mother_address: motherAddress,
          father_phonenumber: fatherPhoneNumber,
          mother_phonenumber: motherPhoneNumber,
        }));
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.msg || 'Update failed');
      }
    } catch (err:any) {
      setError(err.response?.data?.msg || 'An error occurred while updating');
    }
    
    setIsSubmitting(false);
  };

  // const formatDate = (isoDate) => {
  //   if (!isoDate || isoDate.includes('1899') || isoDate === '') return 'Not set';
  //   const date = new Date(isoDate);
  //   if (isNaN(date.getTime())) return 'Not set';
  //   return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  // };

  if (!user && !isLoading) {
    return <div className="text-center text-red-600">Error: User data not available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-black -mt-10">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-black text-white p-4">
            <h1 className="text-2xl font-bold">Student Profile</h1>
          </div>
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-black rounded-full border-4 border-gray-200 flex items-center justify-center text-white">
                {isLoading ? (
                  <div className="bg-gray-100 rounded w-16 h-16 animate-pulse"></div>
                ) : (
                  <span className="text-5xl font-bold">{user.name?.[0] || ''}</span>
                )}
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
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center">
                      <FaIdCard className="mr-2" /> {user.username || 'N/A'}
                    </span>
                    <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center">
                      <FaGraduationCap className="mr-2" /> {user.year || 'N/A'} - {user.branch || 'N/A'}
                    </span>
                    {user.section && (
                      <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <FaUsers className="mr-2" /> Section {user.section}
                      </span>
                    )}
                    {user.roomno && (
                      <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <FaDoorOpen className="mr-2" /> Room {user.roomno}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{user.email || 'N/A'}</p>
                </>
              )}
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                disabled={isLoading}
              >
                <FaEdit /> <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isLoading}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      <FaCheck /> <span>Save</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    resetFields();
                  }}
                  className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                  disabled={isLoading}
                >
                  <FaTimes /> <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mx-6 mb-4 flex items-start">
              <div>{success}</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mx-6 mb-4 flex items-start">
              <div>{error}</div>
            </div>
          )}

          <div className="border-t border-gray-200 mt-4">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-3 font-medium flex items-center ${
                  activeTab === 'personal' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <FaUser className="mr-2" /> Personal
              </button>
              <button
                onClick={() => setActiveTab('academic')}
                className={`px-6 py-3 font-medium flex items-center ${
                  activeTab === 'academic' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <FaGraduationCap className="mr-2" /> Academic
              </button>
              <button
                onClick={() => setActiveTab('family')}
                className={`px-6 py-3 font-medium flex items-center ${
                  activeTab === 'family' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <FaHome className="mr-2" /> Family
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md">
            {activeTab === 'personal' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-black border-b border-gray-300 pb-2">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <InfoCard
                    icon={<FaUser className="text-black" />}
                    label="Full Name"
                    initialValue={name}
                    editable={true}
                    name="name"
                    onValueChange={handleFieldChange}
                    isEditing={isEditing}
                    isLoading={isLoading}
                  />
                  <InfoCard
                    icon={<FaVenusMars className="text-black" />}
                    label="Gender"
                    initialValue={gender}
                    editable={true}
                    name="gender"
                    onValueChange={handleFieldChange}
                    isEditing={isEditing}
                    isLoading={isLoading}
                  />
                  {/* <InfoCard
                    icon={<FaCalendarAlt className="text-black" />}
                    label="Date of Birth"
                    initialValue={dateOfBirth}
                    editable={true}
                    name="date_of_birth"
                    onValueChange={handleFieldChange}
                    type="date"
                    isEditing={isEditing}
                    isLoading={isLoading}
                  /> */}
                  <InfoCard
                    icon={<FaTint className="text-black" />}
                    label="Blood Group"
                    initialValue={bloodGroup}
                    editable={true}
                    name="blood_group"
                    onValueChange={handleFieldChange}
                    isEditing={isEditing}
                    isLoading={isLoading}
                  />
                  <InfoCard
                    icon={<FaPhone className="text-black" />}
                    label="Phone Number"
                    initialValue={phoneNumber}
                    editable={true}
                    name="phone_number"
                    onValueChange={handleFieldChange}
                    isEditing={isEditing}
                    isLoading={isLoading}
                  />
                  {/* <InfoCard
                    icon={<FaEnvelope className="text-black" />}
                    label="Email"
                    initialValue={user.email}
                    editable={false}
                    name="email"
                    onValueChange={() => {}}
                    isEditing={isEditing}
                    isLoading={isLoading}
                  /> */}
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-black border-b border-gray-300 pb-2">Academic Information</h2>
                {isEditing ?   <div className="bg-red-50  mb-10 border-red-200 text-red-700 p-4 rounded-lg flex items-center space-x-2">
        <svg
          className="w-5 h-5 text-red-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="font-medium">Academic Information can only be edited by Administration</span>
      </div> : <></>}
                <div className="grid md:grid-cols-2 gap-6">
                  <InfoCard
                    icon={<FaIdCard className="text-black" />}
                    label="Student ID"
                    initialValue={user.username}
                    editable={false}
                    name="username"
                    onValueChange={() => {}}
                    isEditing={isEditing}
                    isLoading={isLoading}
                  />
                  <InfoCard
                    icon={<FaGraduationCap className="text-black" />}
                    label="Year"
                    initialValue={user.year}
                    editable={false}
                    name="year"
                    onValueChange={() => {}}
                    isEditing={isEditing}
                    isLoading={isLoading}
                  />
                  <InfoCard
                    icon={<FaGraduationCap className="text-black" />}
                    label="Branch"
                    initialValue={user.branch}
                    editable={false}
                    name="branch"
                    onValueChange={() => {}}
                    isEditing={isEditing}
                    isLoading={isLoading}
                  />
                  <InfoCard
                    icon={<FaGraduationCap className="text-black" />}
                    label="Section"
                    initialValue={user.section}
                    editable={false}
                    name="section"
                    onValueChange={() => {}}
                    isEditing={isEditing}
                    isLoading={isLoading}
                  />
                  <InfoCard
                    icon={<FaDoorOpen className="text-black" />}
                    label="Room Number"
                    initialValue={user.roomno}
                    editable={false}
                    name="roomno"
                    onValueChange={() => {}}
                    isEditing={isEditing}
                    isLoading={isLoading}
                  />
                </div>

                {/* <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-bold mb-4 text-black">Academic Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                      <div className="text-3xl font-bold text-black">
                        {isLoading ? <div className="bg-gray-100 rounded h-8 animate-pulse"></div> : user.count?.grades || 0}
                      </div>
                      <div className="text-gray-600">Total Subjects</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                      <div className="text-3xl font-bold text-black">
                        {isLoading ? <div className="bg-gray-100 rounded h-8 animate-pulse"></div> : user.count?.attendance || 0}
                      </div>
                      <div className="text-gray-600">Attendance Records</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                      <div className="text-3xl font-bold text-black">
                        {isLoading ? <div className="bg-gray-100 rounded h-8 animate-pulse"></div> : user.count?.Outpass || 0}
                      </div>
                      <div className="text-gray-600">Outpasses</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                      <div className="text-3xl font-bold text-black">
                        {isLoading ? <div className="bg-gray-100 rounded h-8 animate-pulse"></div> : user.count?.Outing || 0}
                      </div>
                      <div className="text-gray-600">Outings</div>
                    </div>
                  </div>
                </div> */}
                
              </div>
            )}

            {activeTab === 'family' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-black border-b border-gray-300 pb-2">Family Information</h2>
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-black">Father's Information</h3>
                  <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                    <InputField
                      label="Name"
                      initialValue={fatherName}
                      name="fatherName"
                      onValueChange={handleFieldChange}
                      isEditing={isEditing}
                      isLoading={isLoading}
                    />
                    <InputField
                      label="Occupation"
                      initialValue={fatherOccupation}
                      name="fatherOccupation"
                      onValueChange={handleFieldChange}
                      isEditing={isEditing}
                      isLoading={isLoading}
                    />
                    <InputField
                      label="Email"
                      initialValue={fatherEmail}
                      name="fatherEmail"
                      type="email"
                      onValueChange={handleFieldChange}
                      isEditing={isEditing}
                      isLoading={isLoading}
                    />
                    <InputField
                      label="Phone Number"
                      initialValue={fatherPhoneNumber}
                      name="fatherPhoneNumber"
                      onValueChange={handleFieldChange}
                      isEditing={isEditing}
                      isLoading={isLoading}
                    />
                    <InputField
                      label="Address"
                      initialValue={fatherAddress}
                      name="fatherAddress"
                      onValueChange={handleFieldChange}
                      isEditing={isEditing}
                      isLoading={isLoading}
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-black">Mother's Information</h3>
                  <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                    <InputField
                      label="Name"
                      initialValue={motherName}
                      name="motherName"
                                            onValueChange={handleFieldChange}
                      isEditing={isEditing}
                      isLoading={isLoading}
                    />
                    <InputField
                      label="Occupation"
                      initialValue={motherOccupation}
                      name="motherOccupation"
                      onValueChange={handleFieldChange}
                      isEditing={isEditing}
                      isLoading={isLoading}
                    />
                    <InputField
                      label="Email"
                      initialValue={motherEmail}
                      name="motherEmail"
                      type="email"
                      onValueChange={handleFieldChange}
                      isEditing={isEditing}
                      isLoading={isLoading}
                    />
                    <InputField
                      label="Phone Number"
                      initialValue={motherPhoneNumber}
                      name="motherPhoneNumber"
                      onValueChange={handleFieldChange}
                      isEditing={isEditing}
                      isLoading={isLoading}
                    />
                    <InputField
                      label="Address"
                      initialValue={motherAddress}
                      name="motherAddress"
                      onValueChange={handleFieldChange}
                      isEditing={isEditing}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <FaCheck /> <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  resetFields();
                }}
                className="bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                disabled={isLoading}
              >
                <FaTimes /> <span>Cancel</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}