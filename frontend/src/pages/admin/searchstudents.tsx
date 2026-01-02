import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAuth } from "../../hooks/is_authenticated";
import { useDebounce } from "../../hooks/useDebounce";
import { ArrowLeft, Search, User, AlertCircle, MapPin, Filter, BookOpen, History, Info, ChevronRight, GraduationCap } from "lucide-react";
import { SEARCH_STUDENTS, ADMIN_STUDENT_HISTORY } from "../../api/endpoints";
import { Input } from "../../components/Input";
import { Pagination } from "../../components/Pagination";
import { cn } from "../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";

interface StudentProps {
  id: string;
  _id: string;
  username: string;
  name: string;
  email: string;
  gender: string;
  branch: string;
  year: string;
  section?: string;
  roomno?: string;
  blood_group?: string;
  phone_number?: string;
  profile_url?: string;
  isPresentInCampus: boolean;
  isApplicationPending: boolean;
  father_name: string;
  father_phonenumber: string;
  mother_name: string;
  address: string;
  grades?: any[];
  attendance?: any[];
  outings_list?: any[];
  outpasses_list?: any[];
  approval_logs?: any[];
  current_level?: string;
  created_at?: string;
  updated_at?: string;
}

const Detail = ({ label, value }: { label: string; value?: any }) => (
    <div className="group">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block group-hover:text-slate-500 transition-colors">{label}</label>
        <p className="text-sm font-semibold text-slate-700">{value || "—"}</p>
    </div>
);

const Section = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
                <Icon className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    </div>
);

export default function SearchStudents() {
  useIsAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<StudentProps[]>([]);
  const [results, setResults] = useState<StudentProps[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [selectedStudent, setSelectedStudent] = useState<StudentProps | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Advanced Filters
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("");
  const [isPending, setIsPending] = useState<boolean | undefined>(undefined);
  const [isOutside, setIsOutside] = useState<boolean | undefined>(undefined);

  // Paginated History State
  const [history, setHistory] = useState<any[]>([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, totalPages: 1 });
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  const fetchStudents = async (q: string, page = 1) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      setIsLoading(page === 1);
      setError("");
      const cleanToken = token.replace(/^["'](.+(?=["']$))["']$/, "$1");
      
      const res = await fetch(SEARCH_STUDENTS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify({
          username: q,
          branch: branch || undefined,
          year: year || undefined,
          gender: gender || undefined,
          isPending,
          isOutside,
          page,
          limit: 10
        }),
      });

      const data = await res.json();
      if (!data.success) {
        if (page === 1) {
            setResults([]);
            setSuggestions([]);
        }
        return;
      }

      if (data.students) {
        setResults(data.students);
        setPagination(data.pagination);
        setSuggestions([]);
      } else {
        setSuggestions(data.suggestions || []);
        if (data.student) {
           setSelectedStudent(data.student);
           setSuggestions([]);
           setResults([]);
        }
      }
    } catch (err) {
      setError("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(debouncedQuery, 1);
  }, [debouncedQuery, branch, year, gender, isPending, isOutside]);

  const fetchHistory = async (studentId: string, page = 1) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      setIsHistoryLoading(true);
      const cleanToken = token.replace(/^["'](.+(?=["']$))["']$/, "$1");
      const res = await fetch(`${ADMIN_STUDENT_HISTORY(studentId)}?page=${page}&limit=5`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
        setHistoryPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchHistory(selectedStudent.id || selectedStudent._id, 1);
    }
  }, [selectedStudent]);

  const handleSelectStudent = (student: StudentProps) => {
    setSelectedStudent(student);
    setResults([]);
    setSuggestions([]);
    setQuery("");
  };

  const getAcademicStatus = () => {
    if (!selectedStudent || !selectedStudent.grades) return null;
    const gpas = selectedStudent.grades.map(g => g.grade);
    const hasFail = gpas.some(g => g < 5);
    const avg = gpas.length ? (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2) : "0.00";
    
    return {
        avg,
        status: hasFail ? "Remedial" : Number(avg) >= 8.5 ? "Excellent" : Number(avg) >= 7 ? "Pass" : "Good",
        color: hasFail ? "text-white bg-black" : "text-slate-900 bg-slate-100"
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Header & Search */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <button
                onClick={() => navigate("/admin")}
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
            </button>
            <div className="flex items-center gap-3">
                {selectedStudent && (
                    <button 
                        onClick={() => setSelectedStudent(null)}
                        className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-black text-xs uppercase"
                    >
                        Close Profile
                    </button>
                )}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border shadow-sm",
                        showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                >
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Search Directory</h1>
                    <p className="text-slate-500 text-sm font-medium italic">Find students, view academic performance and request history.</p>
                </div>
                <div className="w-full md:w-[400px] relative">
                    <Input 
                        placeholder="Search by ID or Name..."
                        value={query}
                        onchangeFunction={(e: any) => setQuery(e.target.value)}
                        icon={<Search className="w-5 h-5 text-slate-400" />}
                        className="h-14 bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 transition-all rounded-2xl"
                    />
                    
                    <AnimatePresence>
                        {suggestions.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100"
                            >
                                {suggestions.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSelectStudent(s)}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold overflow-hidden ring-2 ring-slate-50">
                                                {s.profile_url ? <img src={s.profile_url} className="w-full h-full object-cover" /> : s.name[0]}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-black transition-colors">{s.name}</p>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{s.username} • {s.branch} {s.year}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
             </div>

             <AnimatePresence>
                {showFilters && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Branch</label>
                                <select 
                                    value={branch} onChange={(e) => setBranch(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-slate-900/5 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">All Branches</option>
                                    {["CSE", "ECE", "EEE", "CIVIL", "MECH"].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Year</label>
                                <select 
                                    value={year} onChange={(e) => setYear(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-slate-900/5 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">All Years</option>
                                    {["P1", "P2", "E1", "E2", "E3", "E4"].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Type Filter</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setIsPending(isPending === true ? undefined : true)}
                                        className={cn(
                                            "flex-1 h-11 rounded-xl text-[10px] font-black uppercase border shadow-sm transition-all",
                                            isPending ? "bg-slate-900 border-slate-900 text-white shadow-slate-200" : "bg-white border-slate-200 text-slate-600"
                                        )}
                                    >Pending</button>
                                    <button 
                                        onClick={() => setIsOutside(isOutside === true ? undefined : true)}
                                        className={cn(
                                            "flex-1 h-11 rounded-xl text-[10px] font-black uppercase border shadow-sm transition-all",
                                            isOutside ? "bg-black border-black text-white" : "bg-white border-slate-200 text-slate-600"
                                        )}
                                    >Outside</button>
                                </div>
                            </div>
                            <div className="flex items-end lg:col-span-2">
                                <button
                                    onClick={() => { setBranch(""); setYear(""); setGender(""); setIsPending(undefined); setIsOutside(undefined); setQuery(""); }}
                                    className="w-full h-11 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-all"
                                >Reset All Application Filters</button>
                            </div>
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>
        </div>
      </div>

      {error && (
        <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 shadow-sm"
        >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-bold uppercase tracking-wider">{error}</p>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="space-y-8">
          {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                  <p className="text-slate-400 font-bold text-sm animate-pulse">Scanning database...</p>
              </div>
          ) : results.length > 0 ? (
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.map(student => (
                          <button
                            key={student.id}
                            onClick={() => handleSelectStudent(student)}
                            className="text-left bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                          >
                              <div className="flex items-center gap-4 mb-4">
                                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black overflow-hidden shadow-lg">
                                      {student.profile_url ? <img src={student.profile_url} className="w-full h-full object-cover" /> : student.name[0]}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-black transition-colors">{student.name}</h4>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.username}</p>
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-slate-50 rounded-2xl">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Branch</p>
                                      <p className="text-sm font-bold text-slate-700">{student.branch}</p>
                                  </div>
                                  <div className="p-3 bg-slate-50 rounded-2xl">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Year</p>
                                      <p className="text-sm font-bold text-slate-700">{student.year}</p>
                                  </div>
                              </div>
                          </button>
                      ))}
                  </div>
                  <Pagination 
                      currentPage={pagination.page} 
                      totalPages={pagination.totalPages} 
                      onPageChange={(p) => fetchStudents(query, p)} 
                  />
              </div>
          ) : selectedStudent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                  {/* Student Header Card */}
                   <div className="bg-white rounded-[2rem] p-8 md:p-12 relative overflow-hidden border-4 border-black shadow-2xl transition-all">
                    
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                             <div className="relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2rem] p-1 shadow-xl ring-4 ring-black/5 group overflow-hidden">
                                    {selectedStudent.profile_url ? (
                                        <img src={selectedStudent.profile_url} className="w-full h-full object-cover rounded-[1.8rem]" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-900 text-4xl font-black rounded-[1.8rem]">
                                            {selectedStudent.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className={cn(
                                    "absolute -bottom-2 -right-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border-2 border-black bg-white text-black"
                                )}>
                                    {selectedStudent.isApplicationPending ? "Action Required" : "Identity Verified"}
                                </div>
                            </div>

                            <div className="text-center md:text-left space-y-4">
                                <div>
                                    <h2 className="text-4xl font-black text-black tracking-tighter uppercase">{selectedStudent.name}</h2>
                                    <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-xs mt-2">{selectedStudent.username} • {selectedStudent.branch} {selectedStudent.year}</p>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <span className="px-4 py-2 bg-slate-50 rounded-xl text-black text-xs font-black border border-slate-200 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" /> ROOM {selectedStudent.roomno || "N/A"}
                                    </span>
                                    {getAcademicStatus() && (
                                        <span className={cn("px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border-2 border-black", getAcademicStatus()?.color)}>
                                            <GraduationCap className="w-3.5 h-3.5" /> GPA: {getAcademicStatus()?.avg} ({getAcademicStatus()?.status})
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Integrated QR Code */}
                        <div className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
                             <QRCode 
                                value={JSON.stringify({
                                    id: selectedStudent.id,
                                    name: selectedStudent.name,
                                    branch: selectedStudent.branch,
                                    year: selectedStudent.year,
                                    parent: selectedStudent.father_name,
                                    contact: selectedStudent.phone_number
                                })}
                                size={120}
                                fgColor="#000000"
                            />
                            <p className="text-[10px] text-center font-black text-slate-400 mt-2 tracking-widest uppercase">Scan Identity</p>
                        </div>
                    </div>
                  </div>



                  {/* Single Page Content - All sections stacked */}
                  <div className="space-y-12">
                       {/* Overview Section */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Section icon={Info} title="Personal Details">
                                <Detail label="Gender" value={selectedStudent.gender} />
                                <Detail label="Blood Group" value={selectedStudent.blood_group} />
                                <Detail label="Contact" value={selectedStudent.phone_number} />
                                <Detail label="Section" value={selectedStudent.section} />
                                <Detail label="Created" value={new Date(selectedStudent.created_at || "").toLocaleDateString()} />
                            </Section>
                            <Section icon={User} title="Parent Information">
                                <Detail label="Father's Name" value={selectedStudent.father_name} />
                                <Detail label="Father's Phone" value={selectedStudent.father_phonenumber} />
                                <Detail label="Mother's Name" value={selectedStudent.mother_name} />
                                <Detail label="Resident Address" value={selectedStudent.address} />
                            </Section>
                        </div>

                        {/* Academics Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Section icon={GraduationCap} title="Grade Records">
                                {selectedStudent.grades?.length ? selectedStudent.grades.map((g, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{g.subject}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{g.semester}</p>
                                        </div>
                                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black", g.grade < 5 ? "bg-black text-white" : "bg-white text-black border border-slate-200 shadow-sm")}>
                                             {g.grade}
                                         </div>
                                     </div>
                                )) : <p className="text-slate-400 font-bold italic py-4">No academic records found</p>}
                            </Section>
                            <Section icon={BookOpen} title="Attendance Metrics">
                                {selectedStudent.attendance?.length ? selectedStudent.attendance.map((a, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-transparent hover:border-slate-200 hover:bg-white transition-all">
                                         <div className="flex justify-between items-center">
                                             <p className="text-sm font-bold text-slate-900">{a.subject}</p>
                                             <span className="text-black font-black text-xs">{((a.attendedClasses / a.totalClasses) * 100).toFixed(1)}%</span>
                                         </div>
                                         <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                             <div className="h-full bg-black rounded-full" style={{ width: `${(a.attendedClasses / a.totalClasses) * 100}%` }} />
                                         </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{a.attendedClasses} / {a.totalClasses} Lectures</p>
                                    </div>
                                )) : <p className="text-slate-400 font-bold italic py-4">No attendance records found</p>}
                            </Section>
                        </div>

                        {/* History Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-4">
                                <History className="w-5 h-5 text-black" />
                                <h3 className="font-black text-black uppercase tracking-widest text-lg">Request History</h3>
                            </div>
                            
                            {isHistoryLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-8 h-8 border-3 border-slate-200 border-t-black rounded-full animate-spin" />
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Compiling history...</p>
                                </div>
                            ) : history.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        {history.map((req, i) => (
                                            <div key={i} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:border-black transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                                                <div className="flex items-center gap-6">
                                                     <div className={cn(
                                                         "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform",
                                                         req.is_approved ? "bg-black text-white" : req.is_rejected ? "bg-slate-400 text-white" : "bg-white border-4 border-black text-black"
                                                     )}>
                                                         <History className="w-6 h-6" />
                                                     </div>
                                                     <div>
                                                         <div className="flex items-center gap-3 mb-1">
                                                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{req.type}</span>
                                                             <span className={cn("w-1.5 h-1.5 rounded-full", req.is_approved ? "bg-black" : req.is_rejected ? "bg-slate-400" : "bg-black animate-pulse")} />
                                                             <span className="text-xs font-black uppercase tracking-widest">{req.is_approved ? "Granted" : req.is_rejected ? "Rejected" : "Pending"}</span>
                                                         </div>
                                                        <p className="font-bold text-black text-lg">"{req.reason}"</p>
                                                        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">{new Date(req.requested_time).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-end gap-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway Status</p>
                                                    <p className="text-sm font-black text-black uppercase tracking-tighter">{req.current_level?.replace('_', ' ') || "Finalized"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Pagination 
                                        currentPage={historyPagination.page} 
                                        totalPages={historyPagination.totalPages} 
                                        onPageChange={(p) => fetchHistory(selectedStudent?.id || selectedStudent?._id || "", p)} 
                                        className="mt-8"
                                    />
                                </div>
                            ) : (
                                <div className="bg-slate-50 border-4 border-slate-100 border-dashed rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center gap-4">
                                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300">
                                        <History className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-black font-black text-lg uppercase tracking-widest">No Request History</p>
                                        <p className="text-slate-400 text-sm font-medium italic">Empty historical record for this student identifier.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                  </div>
              </motion.div>
          ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <Search className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Ready to search</h3>
                    <p className="text-slate-400 max-w-sm font-medium italic">Use the search bar above to look up specific students or use the filters for advanced discovery.</p>
                </div>
              </div>
          )}
      </div>


    </div>
  );
}
