import { useState, useEffect, useCallback, memo } from 'react';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import {
  FaUser, FaVenusMars, FaTint, FaPhone, FaEdit,
  FaGraduationCap, FaIdCard, FaDoorOpen,  FaHistory, FaClock, FaCalendarAlt
} from 'react-icons/fa';
import axios from 'axios';
import { student, bannersAtom } from '../../store';
import { useIsAuth } from '../../hooks/is_authenticated';
import { useStudentData } from '../../hooks/student_info';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { BASE_URL } from '../../api/endpoints';
import { motion, AnimatePresence } from 'framer-motion';
import RequestCard from '../../components/RequestCard';
import { toast } from 'react-toastify';

export const enableOutingsAndOutpasses = true;

// Memoized InfoCard
const InfoCard = memo(({ icon, label, name, value, editable, isEditing, isLoading, onValueChange, type = 'text' }: any) => {
  const handleChange = (e: any) => onValueChange(name, e.target.value);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center space-x-3 mb-3 text-gray-400">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      {isLoading ? (
        <div className="bg-gray-100 rounded w-3/4 h-6 animate-pulse"></div>
      ) : isEditing && editable ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full bg-gray-50 text-black text-lg font-medium rounded-lg p-2 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          autoComplete="off"
        />
      ) : (
        <p className="text-black text-xl font-medium truncate">
          {value || <span className="text-gray-300 font-normal italic text-sm">Not provided</span>}
        </p>
      )}
    </motion.div>
  );
});

// Memoized InputField (For family details)
const InputField = memo(({ label, name, value, isEditing, isLoading, onValueChange, type = 'text' }: any) => {
    const handleChange = (e: any) => onValueChange(name, e.target.value);
  
    return (
      <div className="flex flex-col group">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-black transition-colors">{label}</span>
        {isLoading ? (
          <div className="bg-gray-100 rounded w-full h-8 animate-pulse"></div>
        ) : isEditing ? (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            className="w-full bg-gray-50 text-black rounded-lg p-2 border border-blue-500 focus:border-black focus:outline-none transition-all"
            autoComplete="off"
          />
        ) : (
          <span className="text-black text-lg font-medium border-b border-transparent group-hover:border-gray-100 py-1 transition-all">
             {value || <span className="text-gray-300 text-sm font-normal italic">Not provided</span>}
          </span>
        )}
      </div>
    );
  });

export default function StudentProfilePage() {
  useIsAuth();
  useStudentData();
  const user = useRecoilValue<any>(student);
  const setStudent = useSetRecoilState(student);
  const [bannersState, setBannersState] = useRecoilState(bannersAtom);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Request State
  const [requestType, setRequestType] = useState<'outing' | 'outpass' | null>(null);
  const [requestForm, setRequestForm] = useState({ reason: '', from: '', to: '' });
  const [requestLoading, setRequestLoading] = useState(false);

  // Single fields state
  const [fields, setFields] = useState<any>({
    name: '', gender: '', bloodGroup: '', phoneNumber: '', dateOfBirth: '',
    fatherName: '', motherName: '', fatherOccupation: '', motherOccupation: '',
    fatherEmail: '', motherEmail: '', fatherAddress: '', motherAddress: '',
    fatherPhoneNumber: '', motherPhoneNumber: '',
  });

  // Initialize fields
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
    if (bannersState.fetched) return;

    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/banners?published=true`);
        if (res.data.success) {
            setBannersState({ fetched: true, data: res.data.banners });
        }
      } catch (err) {
        console.error("Error fetching banners", err);
      }
    };
    fetchBanners();
  }, [bannersState.fetched, setBannersState]);

  const sliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 4000 };

  const handleFieldChange = useCallback((name: string, value: any) => {
    setFields((prev: any) => ({ ...prev, [name]: value }));
  }, []);

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

  const validateForm = () => {
    if (!fields.name.trim()) return 'Name is required';
    const cleanPhone = String(fields.phoneNumber || "").replace(/\D/g, "");
    if (cleanPhone.length !== 10) return 'Phone number must be 10 digits';
    if (fields.fatherEmail && !fields.fatherEmail.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) return 'Invalid father email format';
    if (fields.motherEmail && !fields.motherEmail.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) return 'Invalid mother email format';
    return null;
  };

  const getChangedFields = () => {
      const currentDetails: any = {
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
      };

      const changes: any = {};
      Object.keys(fields).forEach(key => {
          if (fields[key] !== currentDetails[key]) {
              changes[key] = fields[key];
          }
      });
      return changes;
  };

  const handleSubmit = async (e: any) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      setIsSubmitting(false);
      return;
    }

    const updates = getChangedFields();
    if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        setIsSubmitting(false);
        return;
    }

    try {
      const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
      if (!token) throw new Error('Authentication token is missing.');

      const response = await axios.put(
        'https://uni-z-api.vercel.app/api/v1/student/updatedetails',
        { ...updates }, // Only send updates
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStudent(prev => ({ ...prev, ...updates }));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.data.msg || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || err.message || 'An error occurred while updating');
    }
    setIsSubmitting(false);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType) return;
    setRequestLoading(true);
    
    try {
        const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
        const endpoint = requestType === 'outpass' 
            ? `${BASE_URL}/student/requestoutpass` 
            : `${BASE_URL}/student/requestouting`;
        
        const payload: any = {
            reason: requestForm.reason,
            userId: user._id
        };

        if (requestType === 'outpass') {
            payload.from_date = requestForm.from;
            payload.to_date = requestForm.to;
        } else {
            payload.from_time = requestForm.from;
            payload.to_time = requestForm.to;
        }

        const res = await axios.post(endpoint, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
            toast.success(`${requestType === 'outpass' ? 'Outpass' : 'Outing'} requested successfully!`);
            setRequestType(null);
            setRequestForm({ reason: '', from: '', to: '' });
        } else {
            toast.error(res.data.msg || 'Request failed');
        }
    } catch (err: any) {
         toast.error(err.response?.data?.msg || 'An error occurred');
    } finally {
        setRequestLoading(false);
    }
  };

  if (!user && !isLoading) return <div className="text-center mt-20 text-gray-400">Loading user profile...</div>;

  const personalFields = [
    { icon: <FaUser />, label: 'Full Name', name: 'name', editable: true },
    { icon: <FaVenusMars />, label: 'Gender', name: 'gender', editable: true },
    { icon: <FaTint />, label: 'Blood Group', name: 'bloodGroup', editable: true },
    { icon: <FaPhone />, label: 'Phone Number', name: 'phoneNumber', editable: true },
  ];

  const academicFields = [
    { icon: <FaIdCard />, label: 'Student ID', name: 'username', editable: false, value: user?.username },
    { icon: <FaGraduationCap />, label: 'Year', name: 'year', editable: false, value: user?.year },
    { icon: <FaGraduationCap />, label: 'Branch', name: 'branch', editable: false, value: user?.branch },
    { icon: <FaGraduationCap />, label: 'Section', name: 'section', editable: false, value: user?.section },
    { icon: <FaDoorOpen />, label: 'Room Number', name: 'roomno', editable: false, value: user?.roomno },
  ];

  const familyFields = {
    father: ['fatherName', 'fatherOccupation', 'fatherEmail', 'fatherPhoneNumber', 'fatherAddress'],
    mother: ['motherName', 'motherOccupation', 'motherEmail', 'motherPhoneNumber', 'motherAddress'],
  };

  const requestHistory = [
      ...(user?.outings_list || []).map((r: any) => ({ ...r, type: 'outing' })),
      ...(user?.outpasses_list || []).map((r: any) => ({ ...r, type: 'outpass' }))
  ].sort((a: any, b: any) => {
      const dateA = new Date(a.requested_time || 0).getTime();
      const dateB = new Date(b.requested_time || 0).getTime();
      return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-black -mt-6">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Banners */}
        {bannersState.data.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 rounded-2xl overflow-hidden shadow-sm md:shadow-md"
          >
            <Slider {...sliderSettings}>
              {bannersState.data.map((b: any) => (
                <div key={b.id} className="relative outline-none">
                  <img src={b.imageUrl} alt={b.title} className="w-full h-48 md:h-64 object-cover" />
                  {b.title && (
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                      <h3 className="text-white font-bold text-xl">{b.title}</h3>
                    </div>
                  )}
                </div>
              ))}
            </Slider>
          </motion.div>
        )}

        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6"
        >
             <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-4xl font-bold shadow-lg ring-4 ring-white">
                    {user?.name?.[0] || user?.username?.[0] || '?'}
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">{user?.name || 'Student'}</h1>
                    <div className="flex gap-3 text-gray-500 text-sm font-medium">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">{user?.username}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">{user?.branch}</span>
                    </div>
                </div>
             </div>

             <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button onClick={() => { setIsEditing(false); resetFields(); }} className="px-6 py-2 rounded-full border border-gray-200 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 font-medium transition-colors shadow-lg shadow-gray-200">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="group flex items-center gap-2 px-6 py-2 rounded-full border border-black/10 hover:border-black hover:bg-black hover:text-white transition-all duration-300">
                        <FaEdit /> <span>Edit Profile</span>
                    </button>
                )}
             </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border-b border-gray-100 mb-8 overflow-x-auto"
        >
            <div className="flex gap-8">
                {['personal', 'academic', 'family', enableOutingsAndOutpasses ? 'permissions' : ''].filter(Boolean).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab || 'personal')}
                        className={`pb-4 relative text-sm font-bold uppercase tracking-wider transition-colors ${
                            activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                            />
                        )}
                    </button>
                ))}
            </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className={activeTab === 'permissions' ? "block" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}
            >
                 {activeTab === 'personal' && personalFields.map(f => (
                     <InfoCard key={f.name} {...f} value={fields[f.name]} isEditing={isEditing} isLoading={isLoading} onValueChange={handleFieldChange} />
                 ))}

                 {activeTab === 'academic' && academicFields.map(f => (
                     <InfoCard key={f.name} {...f} value={f.value || fields[f.name]} isEditing={isEditing} isLoading={isLoading} onValueChange={handleFieldChange} />
                 ))}

                 {activeTab === 'family' && (
                     <div className="col-span-full grid md:grid-cols-2 gap-10">
                         {Object.entries(familyFields).map(([parent, keys]) => (
                             <div key={parent} className="space-y-6">
                                <h3 className="text-xl font-bold capitalize border-b border-gray-100 pb-2">{parent} Details</h3>
                                <div className="grid gap-6">
                                    {keys.map(key => (
                                        <InputField 
                                            key={key} 
                                            label={key.replace(/([A-Z])/g, ' $1').trim()} 
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
                 )}

                 {activeTab === 'permissions' && (
                     <div className="space-y-10">
                         
                         {/* Action Buttons */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <button 
                                onClick={() => setRequestType('outing')}
                                className="group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
                             >
                                 <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                                     <FaClock />
                                 </div>
                                 <div className="text-center">
                                     <h3 className="text-lg font-bold mb-1">Request Outing</h3>
                                     <p className="text-sm text-gray-500 group-hover:text-gray-300">Short duration (Few hours)</p>
                                 </div>
                             </button>

                             <button 
                                onClick={() => setRequestType('outpass')}
                                className="group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
                             >
                                 <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                                     <FaCalendarAlt />
                                 </div>
                                 <div className="text-center">
                                     <h3 className="text-lg font-bold mb-1">Request Outpass</h3>
                                     <p className="text-sm text-gray-500 group-hover:text-gray-300">Long duration (Days/Overnight)</p>
                                 </div>
                             </button>
                         </div>

                         {/* History */}
                         <div>
                             <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                 <FaHistory className="text-gray-400" /> Request History
                             </h3>
                             <div className="grid gap-4">
                                {requestHistory.length > 0 ? requestHistory.map((req: any) => (
                                     <RequestCard key={req._id} request={req} type={req.type} email={user.email} />
                                )) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-400">
                                        No request history found.
                                    </div>
                                )}
                             </div>
                         </div>
                     </div>
                 )}
            </motion.div>
        </AnimatePresence>

        {/* Modal for Requests */}
        <AnimatePresence>
            {requestType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6"
                    >
                        <h2 className="text-2xl font-bold mb-1 capitalize">Request {requestType}</h2>
                        <p className="text-gray-500 text-sm mb-6">Fill in the details for your {requestType}.</p>
                        
                        <form onSubmit={handleRequestSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Reason</label>
                                <textarea 
                                    className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-black focus:outline-none min-h-[100px]"
                                    placeholder="Why do you need to leave?"
                                    value={requestForm.reason}
                                    onChange={e => setRequestForm({...requestForm, reason: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                                        {requestType === 'outpass' ? 'From Date' : 'From Time'}
                                    </label>
                                    <input 
                                        type={requestType === 'outpass' ? 'date' : 'time'}
                                        className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-black focus:outline-none"
                                        value={requestForm.from}
                                        onChange={e => setRequestForm({...requestForm, from: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                                        {requestType === 'outpass' ? 'To Date' : 'To Time'}
                                    </label>
                                    <input 
                                        type={requestType === 'outpass' ? 'date' : 'time'}
                                        className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-black focus:outline-none"
                                        value={requestForm.to}
                                        onChange={e => setRequestForm({...requestForm, to: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => { setRequestType(null); setRequestForm({reason:'', from:'', to:''}); }}
                                    className="flex-1 py-3 rounded-lg border border-gray-200 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={requestLoading}
                                    className="flex-1 py-3 rounded-lg bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {requestLoading ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>


      </div>
    </div>
  );
}
