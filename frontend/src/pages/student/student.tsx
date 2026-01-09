import { useState, useEffect, useCallback } from 'react';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import {
  User, Droplets, Phone, Edit2, GraduationCap, IdCard, DoorOpen, History, Clock, Calendar, MapPin, Mail, Briefcase, Camera
} from 'lucide-react';
import axios from 'axios';
import { student, bannersAtom } from '../../store';
import { useIsAuth } from '../../hooks/is_authenticated';
import { useStudentData } from '../../hooks/student_info';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { BASE_URL, UPDATE_DETAILS, STUDENT_HISTORY } from '../../api/endpoints';
import { motion, AnimatePresence } from 'framer-motion';
import RequestCard from '../../components/RequestCard';
import { toast } from 'react-toastify';
import { Pagination } from '../../components/Pagination';
import { useWebSocket } from '../../hooks/useWebSocket';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { Loader2 } from 'lucide-react';
import { InfoCard } from './components/InfoCard';
import AcademicRecord from './components/AcademicRecord';
import { Student } from '../../types';

export const enableOutingsAndOutpasses = true;

export default function StudentProfilePage() {
  useIsAuth();
  const { refetch } = useStudentData(); 
  const user = useRecoilValue<Student | any>(student);
  const setStudent = useSetRecoilState(student);
  const [bannersState, setBannersState] = useRecoilState(bannersAtom);

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Crop & Image State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Request State
  const [requestType, setRequestType] = useState<'outing' | 'outpass' | null>(null);
  const [requestForm, setRequestForm] = useState({ reason: '', from: '', to: '' });
  const [requestLoading, setRequestLoading] = useState(false);

  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, totalPages: 1 });
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Fields State
  const [fields, setFields] = useState<any>({
    name: '', gender: '', address: '', bloodGroup: '', phoneNumber: '', dateOfBirth: '',
    fatherName: '', motherName: '', fatherOccupation: '', motherOccupation: '',
    fatherEmail: '', motherEmail: '', fatherAddress: '', motherAddress: '',
    fatherPhoneNumber: '', motherPhoneNumber: '',
  });

  // WebSocket
  useWebSocket(undefined, (msg) => {
      if (msg.type === 'REFRESH_REQUESTS' && msg.payload.userId === user?._id) {
          refetch();
          toast.info(`Request updated: ${msg.payload.status}`);
      }
  });

  // Polling
  useEffect(() => {
     const interval = setInterval(() => { if (user?._id) refetch(); }, 30000); 
     return () => clearInterval(interval);
  }, [user]);

  // Fetch Banners
  useEffect(() => {
    if (bannersState.fetched) return;
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/banners?published=true`);
        if (res.data.success) setBannersState({ fetched: true, data: res.data.banners });
      } catch (err) { console.error(err); }
    };
    fetchBanners();
  }, [bannersState.fetched, setBannersState]);

  // Init Data
  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setFields({
        name: user.name || '',
        gender: user.gender || '',
        address: user.address || user.Address || '', // Handle different casing if any
        bloodGroup: user.blood_group || user.BloodGroup || '',
        phoneNumber: user.phone_number || user.PhoneNumber || '',
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

  // Fetch History
  const fetchHistory = async (page = 1) => {
    try {
      setIsHistoryLoading(true);
      const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
      const res = await axios.get(`${STUDENT_HISTORY}?page=${page}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setHistory(res.data.history);
        setHistoryPagination(res.data.pagination);
      }
    } catch (err) { console.error(err); } finally { setIsHistoryLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'permissions') fetchHistory(1);
  }, [activeTab]);

  // Handlers
  const handleFieldChange = useCallback((name: string, value: any) => {
    setFields((prev: any) => ({ ...prev, [name]: value }));
  }, []);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setSelectedImage(reader.result?.toString() || null));
      reader.readAsDataURL(file);
    }
  };

  const uploadCroppedImage = async () => {
    if (!selectedImage || !croppedAreaPixels) return;
    setIsUploadingImage(true);
    try {
      const croppedImageBlob = await getCroppedImg(selectedImage, croppedAreaPixels);
      const formData = new FormData();
      formData.append('file', croppedImageBlob as Blob);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); 
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      const res = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, formData);
      if (res.data.secure_url) {
          const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
          await axios.put(UPDATE_DETAILS, { profileUrl: res.data.secure_url }, { headers: { Authorization: `Bearer ${token}` } });
          setStudent((prev: any) => ({ ...prev, profile_url: res.data.secure_url }));
          toast.success("Profile picture updated!");
          setSelectedImage(null);
      }
    } catch (err) { toast.error("Failed to upload image"); } finally { setIsUploadingImage(false); }
  };

  const handleSubmit = async (e: any) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
      const response = await axios.put(UPDATE_DETAILS, { ...fields }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        await refetch();
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else { toast.error(response.data.msg); }
    } catch (err: any) { toast.error(err.response?.data?.msg || 'Update failed'); }
    setIsSubmitting(false);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType) return;
    setRequestLoading(true);
    try {
        const token = localStorage.getItem('student_token')?.replace(/^"|"$/g, '');
        const endpoint = requestType === 'outpass' ? `${BASE_URL}/student/requestoutpass` : `${BASE_URL}/student/requestouting`;
        const payload: any = { reason: requestForm.reason, userId: user._id };
        
        if (requestType === 'outpass') {
            payload.from_date = requestForm.from;
            payload.to_date = requestForm.to;
        } else {
            payload.from_time = requestForm.from;
            payload.to_time = requestForm.to;
        }

        const res = await axios.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) {
            toast.success(`${requestType} requested successfully!`);
            setRequestType(null);
            setRequestForm({ reason: '', from: '', to: '' });
        } else { toast.error(res.data.msg); }
    } catch (err: any) { toast.error(err.response?.data?.msg || 'Request failed'); } finally { setRequestLoading(false); }
  };

  if (!user && !isLoading) return <div className="flex h-screen items-center justify-center text-neutral-400 font-medium">Loading Student Profile...</div>;

  const personalFields = [
    { icon: <User className="w-4 h-4" />, label: 'Full Name', name: 'name', editable: true },
    { icon: <User className="w-4 h-4" />, label: 'Gender', name: 'gender', editable: true },
    { icon: <MapPin className="w-4 h-4" />, label: 'Address', name: 'address', editable: true, fullWidth: true },
    { icon: <Droplets className="w-4 h-4" />, label: 'Blood Group', name: 'bloodGroup', editable: true },
    { icon: <Phone className="w-4 h-4" />, label: 'Phone', name: 'phoneNumber', editable: true },
    { icon: <Calendar className="w-4 h-4" />, label: 'Date of Birth', name: 'dateOfBirth', editable: true, type: 'date' },
  ];

  const academicFields = [
    { icon: <IdCard className="w-4 h-4" />, label: 'Student ID', name: 'username', value: user?.username },
    { icon: <GraduationCap className="w-4 h-4" />, label: 'Year', name: 'year', value: user?.year },
    { icon: <GraduationCap className="w-4 h-4" />, label: 'Branch', name: 'branch', value: user?.branch },
    { icon: <Briefcase className="w-4 h-4" />, label: 'Section', name: 'section', value: user?.section || 'A' },
    { icon: <DoorOpen className="w-4 h-4" />, label: 'Room No', name: 'roomno', value: user?.roomno || 'N/A' },
  ];

  const sliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 4000, arrows: false };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 pb-20">
      
      {/* Banner Section */}
      <div className="relative">
         {bannersState.data.length > 0 ? (
            <div className="h-48 md:h-64 overflow-hidden">
                <Slider {...sliderSettings}>
                    {bannersState.data.map((b: any) => (
                        <div key={b.id} className="relative h-48 md:h-64 outline-none">
                            <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            {b.title && <div className="absolute bottom-4 left-4 text-white font-bold text-xl">{b.title}</div>}
                        </div>
                    ))}
                </Slider>
            </div>
         ) : (
             <div className="h-32 bg-neutral-900 w-full"></div>
         )}
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-16 relative z-10">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-black shadow-xl overflow-hidden cursor-pointer" onClick={() => isEditing && document.getElementById('profile-upload')?.click()}>
                    {isLoading || isUploadingImage ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"><Loader2 className="w-8 h-8 text-white animate-spin"/></div>
                    ) : null}
                    {user?.profile_url ? (
                        <img src={user.profile_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">{user?.username?.[0]}</div>
                    )}
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white"/>
                        </div>
                    )}
                </div>
                <input type="file" id="profile-upload" className="hidden" accept="image/*" onChange={handleImageSelect} disabled={!isEditing} />
            </div>

            <div className="flex-1 mb-2">
                <h1 className="text-3xl font-black tracking-tight text-neutral-900">{user?.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{user?.username}</span>
                    <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{user?.branch} - {user?.year}</span>
                    {user?.has_pending_requests && (
                         <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 animate-pulse">
                             <Clock className="w-3 h-3"/> Pending Request
                         </span>
                    )}
                </div>
            </div>

            <div className="flex gap-3 mb-2">
                {isEditing ? (
                  <>
                    <button onClick={() => { setIsEditing(false); refetch(); }} className="px-5 py-2 rounded-full bg-white border border-neutral-200 hover:bg-neutral-50 font-medium text-sm transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 rounded-full bg-black text-white hover:bg-neutral-800 font-bold text-sm shadow-lg transition-colors flex items-center gap-2">
                        {isSubmitting && <Loader2 className="w-3 h-3 animate-spin"/>} Save
                    </button>
                  </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-full bg-white border border-neutral-200 hover:border-black hover:bg-black hover:text-white transition-all duration-300 font-bold text-sm flex items-center gap-2 shadow-sm">
                        <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                )}
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-neutral-200 mb-10 overflow-x-auto no-scrollbar">
            <div className="flex gap-10 min-w-max">
                {['personal', 'academic', 'family', enableOutingsAndOutpasses ? 'permissions' : ''].filter(Boolean).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab || 'personal')}
                        className={`pb-4 relative text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                            activeTab === tab ? 'text-black translate-y-[-2px]' : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-black" />}
                    </button>
                ))}
            </div>
        </div>


        {/* Tab Content */}
        <AnimatePresence mode="wait">
             <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
             >
                 {activeTab === 'personal' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {personalFields.map(f => <InfoCard key={f.name} {...f} value={fields[f.name]} isEditing={isEditing} isLoading={isLoading} onValueChange={handleFieldChange} />)}
                     </div>
                 )}

                 {activeTab === 'academic' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-1 space-y-6">
                           <h3 className="text-lg font-bold mb-4">Academic Details</h3>
                           <div className="grid gap-4">
                               {academicFields.map(f => <InfoCard key={f.name} {...f} value={f.value} isEditing={false} isLoading={isLoading} />)}
                           </div>
                       </div>
                       <div className="lg:col-span-2">
                           {/* Using the new AcademicRecord component */}
                           <AcademicRecord student={user} />
                       </div>
                    </div>
                 )}

                 {activeTab === 'family' && (
                     <div className="grid md:grid-cols-2 gap-10">
                         <div className="space-y-6">
                             <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
                                 <h3 className="text-lg font-bold text-neutral-900">Father's Details</h3>
                             </div>
                             <div className="space-y-4">
                                  <InfoCard key="fatherName" label="Name" name="fatherName" icon={<User className="w-4 h-4"/>} value={fields.fatherName} isEditing={isEditing} onValueChange={handleFieldChange} editable />
                                  <InfoCard key="fatherOccupation" label="Occupation" name="fatherOccupation" icon={<Briefcase className="w-4 h-4"/>} value={fields.fatherOccupation} isEditing={isEditing} onValueChange={handleFieldChange} editable />
                                  <InfoCard key="fatherPhoneNumber" label="Phone" name="fatherPhoneNumber" icon={<Phone className="w-4 h-4"/>} value={fields.fatherPhoneNumber} isEditing={isEditing} onValueChange={handleFieldChange} editable />
                                  <InfoCard key="fatherEmail" label="Email" name="fatherEmail" type="email" icon={<Mail className="w-4 h-4"/>} value={fields.fatherEmail} isEditing={isEditing} onValueChange={handleFieldChange} editable />
                             </div>
                         </div>
                         <div className="space-y-6">
                             <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
                                 <h3 className="text-lg font-bold text-neutral-900">Mother's Details</h3>
                             </div>
                             <div className="space-y-4">
                                  <InfoCard key="motherName" label="Name" name="motherName" icon={<User className="w-4 h-4"/>} value={fields.motherName} isEditing={isEditing} onValueChange={handleFieldChange} editable />
                                  <InfoCard key="motherOccupation" label="Occupation" name="motherOccupation" icon={<Briefcase className="w-4 h-4"/>} value={fields.motherOccupation} isEditing={isEditing} onValueChange={handleFieldChange} editable />
                                  <InfoCard key="motherPhoneNumber" label="Phone" name="motherPhoneNumber" icon={<Phone className="w-4 h-4"/>} value={fields.motherPhoneNumber} isEditing={isEditing} onValueChange={handleFieldChange} editable />
                                  <InfoCard key="motherEmail" label="Email" name="motherEmail" type="email" icon={<Mail className="w-4 h-4"/>} value={fields.motherEmail} isEditing={isEditing} onValueChange={handleFieldChange} editable />
                             </div>
                         </div>
                     </div>
                 )}

                 {activeTab === 'permissions' && (
                     <div className="space-y-12">
                         <div className="grid md:grid-cols-2 gap-6">
                             <button 
                                onClick={() => setRequestType('outing')} 
                                disabled={user.has_pending_requests}
                                className="group relative overflow-hidden bg-neutral-50 hover:bg-black rounded-2xl p-8 transition-all duration-300 border border-neutral-100 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 <div className="relative z-10">
                                     <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform"><Clock className="w-6 h-6"/></div>
                                     <h3 className="text-xl font-bold text-black group-hover:text-white mb-1">Request Outing</h3>
                                     <p className="text-sm text-neutral-500 group-hover:text-neutral-400">Short duration leaves (few hours)</p>
                                 </div>
                             </button>
                             <button 
                                onClick={() => setRequestType('outpass')} 
                                disabled={user.has_pending_requests}
                                className="group relative overflow-hidden bg-neutral-50 hover:bg-black rounded-2xl p-8 transition-all duration-300 border border-neutral-100 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 <div className="relative z-10">
                                     <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform"><Calendar className="w-6 h-6"/></div>
                                     <h3 className="text-xl font-bold text-black group-hover:text-white mb-1">Request Outpass</h3>
                                     <p className="text-sm text-neutral-500 group-hover:text-neutral-400">Long duration leaves (overnight/days)</p>
                                 </div>
                             </button>
                         </div>

                         <div>
                             <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><History className="w-5 h-5"/> Request History</h3>
                             <div className="space-y-4">
                                 {isHistoryLoading ? (
                                     <div className="text-center py-10 text-neutral-400 text-sm font-bold uppercase tracking-widest animate-pulse">Loading Records...</div>
                                 ) : history.length > 0 ? (
                                     <>
                                         {history.map(req => <RequestCard key={req._id} request={req} type={req.type} />)}
                                         <Pagination currentPage={historyPagination.page} totalPages={historyPagination.totalPages} onPageChange={p => fetchHistory(p)} className="mt-8" />
                                     </>
                                 ) : (
                                     <div className="text-center py-12 bg-neutral-50 rounded-2xl text-neutral-400 font-medium">No history found.</div>
                                 )}
                             </div>
                         </div>
                     </div>
                 )}
             </motion.div>
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
            {requestType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                     <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                         <h2 className="text-2xl font-black mb-1 capitalize">Request {requestType}</h2>
                         <p className="text-sm text-neutral-500 mb-6 font-medium">Please fill in the details below.</p>
                         <form onSubmit={handleRequestSubmit} className="space-y-4">
                             <div>
                                 <label className="text-xs font-bold uppercase text-neutral-400 mb-1 block">Reason</label>
                                 <textarea className="w-full bg-neutral-50 p-3 rounded-xl border border-neutral-100 focus:border-black focus:outline-none min-h-[100px] font-medium" 
                                           placeholder="State your reason..." value={requestForm.reason} onChange={e => setRequestForm({...requestForm, reason: e.target.value})} required autoFocus />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="text-xs font-bold uppercase text-neutral-400 mb-1 block">From</label>
                                     <input type={requestType === 'outpass' ? 'date' : 'time'} className="w-full bg-neutral-50 p-3 rounded-xl border border-neutral-100 focus:border-black focus:outline-none font-bold" 
                                            value={requestForm.from} onChange={e => setRequestForm({...requestForm, from: e.target.value})} required />
                                 </div>
                                 <div>
                                     <label className="text-xs font-bold uppercase text-neutral-400 mb-1 block">To</label>
                                     <input type={requestType === 'outpass' ? 'date' : 'time'} className="w-full bg-neutral-50 p-3 rounded-xl border border-neutral-100 focus:border-black focus:outline-none font-bold" 
                                            value={requestForm.to} onChange={e => setRequestForm({...requestForm, to: e.target.value})} required />
                                 </div>
                             </div>
                             <button type="submit" disabled={requestLoading} className="w-full py-3.5 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors mt-4 flex items-center justify-center gap-2">
                                 {requestLoading && <Loader2 className="w-4 h-4 animate-spin"/>} Submit Request
                             </button>
                             <button type="button" onClick={() => setRequestType(null)} className="w-full py-3 text-neutral-400 font-bold hover:text-black transition-colors">Cancel</button>
                         </form>
                     </motion.div>
                </div>
            )}

            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-2xl overflow-hidden max-w-lg w-full">
                        <div className="h-96 relative bg-black">
                             <Cropper image={selectedImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                        </div>
                        <div className="p-6">
                             <div className="mb-6"><label className="text-xs font-bold text-neutral-400 uppercase mb-2 block">Zoom</label><input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-black"/></div>
                             <div className="flex gap-4">
                                 <button onClick={() => setSelectedImage(null)} className="flex-1 py-3 rounded-xl bg-neutral-100 font-bold text-neutral-600 hover:bg-neutral-200">Cancel</button>
                                 <button onClick={uploadCroppedImage} disabled={isUploadingImage} className="flex-1 py-3 rounded-xl bg-black text-white font-bold hover:bg-neutral-800 flex items-center justify-center gap-2">
                                     {isUploadingImage && <Loader2 className="w-4 h-4 animate-spin"/>} Save Picture
                                 </button>
                             </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}
