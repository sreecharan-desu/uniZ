import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAuth } from "../../hooks/is_authenticated";
import { useDebounce } from "../../hooks/useDebounce";
import { ArrowLeft, Search, User, AlertCircle, MapPin, Filter, QrCode, X, BookOpen, History, Info, ChevronRight, GraduationCap } from "lucide-react";
import { SEARCH_STUDENTS, ADMIN_STUDENT_HISTORY } from "../../api/endpoints";
import { Input } from "../../components/Input";
import { Pagination } from "../../components/Pagination";
import { cn } from "../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { Modal } from "../../components/Modal";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);
  const [showQR, setShowQR] = useState(false);

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
    if (selectedStudent && activeTab === "history") {
      fetchHistory(selectedStudent.id || selectedStudent._id, 1);
    }
  }, [selectedStudent, activeTab]);

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
        color: hasFail ? "text-red-600 bg-red-50" : Number(avg) >= 8.5 ? "text-emerald-600 bg-emerald-50" : "text-blue-600 bg-blue-50"
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
                        onClick={() => setShowQR(true)}
                        className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
                        title="Display QR"
                    >
                        <QrCode className="w-5 h-5 text-slate-600" />
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
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.name}</p>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{s.username} • {s.branch} {s.year}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
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
                                            isPending ? "bg-amber-500 border-amber-500 text-white shadow-amber-200" : "bg-white border-slate-200 text-slate-600"
                                        )}
                                    >Pending</button>
                                    <button 
                                        onClick={() => setIsOutside(isOutside === true ? undefined : true)}
                                        className={cn(
                                            "flex-1 h-11 rounded-xl text-[10px] font-black uppercase border shadow-sm transition-all",
                                            isOutside ? "bg-blue-600 border-blue-600 text-white shadow-blue-200" : "bg-white border-slate-200 text-slate-600"
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
                                      <h4 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{student.name}</h4>
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
                  <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-20 -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-10 -ml-32 -mb-32" />
                    
                    <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2rem] p-1 shadow-2xl ring-4 ring-white/10 group overflow-hidden">
                                {selectedStudent.profile_url ? (
                                    <img src={selectedStudent.profile_url} className="w-full h-full object-cover rounded-[1.8rem]" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-900 text-4xl font-black rounded-[1.8rem]">
                                        {selectedStudent.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className={cn(
                                "absolute -bottom-2 -right-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border-2 border-slate-900",
                                selectedStudent.isApplicationPending ? "bg-amber-400 text-slate-900" : "bg-emerald-500 text-white"
                            )}>
                                {selectedStudent.isApplicationPending ? "Action Required" : "Up to Date"}
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-4">
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tight">{selectedStudent.name}</h2>
                                <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-xs mt-2">{selectedStudent.username} • {selectedStudent.branch} {selectedStudent.year}</p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="px-4 py-2 bg-white/5 rounded-xl text-white text-xs font-bold border border-white/10 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Room {selectedStudent.roomno || "N/A"}
                                </span>
                                {getAcademicStatus() && (
                                    <span className={cn("px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border border-transparent", getAcademicStatus()?.color)}>
                                        <GraduationCap className="w-3.5 h-3.5" /> GPA: {getAcademicStatus()?.avg} ({getAcademicStatus()?.status})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit mx-auto border border-slate-200">
                      {['overview', 'academics', 'history'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-8 py-3 rounded-[0.9rem] text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "hover:bg-white/50 text-slate-400"
                            )}
                          >
                            {tab}
                          </button>
                      ))}
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[400px]">
                      {activeTab === 'overview' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <Section icon={Info} title="Personal Details">
                                  <Detail label="Gender" value={selectedStudent.gender} />
                                  <Detail label="Blood Group" value={selectedStudent.blood_group} />
                                  <Detail label="Contact" value={selectedStudent.phone_number} />
                                  <Detail label="Section" value={selectedStudent.section} />
                                  <Detail label="Created" value={new Date(selectedStudent.created_at || "").toLocaleDateString()} />
                                  <Detail label="Last Update" value={new Date(selectedStudent.updated_at || "").toLocaleDateString()} />
                              </Section>
                              <Section icon={User} title="Parent Information">
                                  <Detail label="Father's Name" value={selectedStudent.father_name} />
                                  <Detail label="Father's Phone" value={selectedStudent.father_phonenumber} />
                                  <Detail label="Mother's Name" value={selectedStudent.mother_name} />
                                  <Detail label="Resident Address" value={selectedStudent.address} />
                              </Section>
                          </motion.div>
                      )}

                      {activeTab === 'academics' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                  <Section icon={GraduationCap} title="Grade Records">
                                      {selectedStudent.grades?.length ? selectedStudent.grades.map((g, i) => (
                                          <div key={i} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                                              <div>
                                                  <p className="text-sm font-bold text-slate-900">{g.subject}</p>
                                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{g.semester}</p>
                                              </div>
                                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black", g.grade < 5 ? "bg-red-50 text-red-600" : "bg-white text-slate-900 shadow-sm")}>
                                                  {g.grade}
                                              </div>
                                          </div>
                                      )) : <p className="text-slate-400 font-bold italic py-4">No records found</p>}
                                  </Section>
                                  <Section icon={BookOpen} title="Attendance Metrics">
                                      {selectedStudent.attendance?.length ? selectedStudent.attendance.map((a, i) => (
                                          <div key={i} className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-transparent hover:border-slate-200 hover:bg-white transition-all">
                                              <div className="flex justify-between items-center">
                                                  <p className="text-sm font-bold text-slate-900">{a.subject}</p>
                                                  <span className="text-blue-600 font-black text-xs">{((a.attendedClasses / a.totalClasses) * 100).toFixed(1)}%</span>
                                              </div>
                                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(a.attendedClasses / a.totalClasses) * 100}%` }} />
                                              </div>
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.attendedClasses} / {a.totalClasses} Lectures</p>
                                          </div>
                                      )) : <p className="text-slate-400 font-bold italic py-4">No records found</p>}
                                  </Section>
                              </div>
                          </motion.div>
                      )}

                      {activeTab === 'history' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                              {isHistoryLoading ? (
                                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                                      <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Compiling history...</p>
                                  </div>
                              ) : history.length > 0 ? (
                                  <div className="space-y-4">
                                      <div className="grid grid-cols-1 gap-4">
                                          {history.map((req, i) => (
                                              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                                                  <div className="flex items-center gap-6">
                                                      <div className={cn(
                                                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform",
                                                          req.is_approved ? "bg-emerald-500 text-white shadow-emerald-200" : req.is_rejected ? "bg-red-500 text-white shadow-red-200" : "bg-amber-400 text-slate-900 shadow-amber-100"
                                                      )}>
                                                          <History className="w-6 h-6" />
                                                      </div>
                                                      <div>
                                                          <div className="flex items-center gap-3 mb-1">
                                                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{req.type}</span>
                                                              <span className={cn("w-1.5 h-1.5 rounded-full", req.is_approved ? "bg-emerald-500" : req.is_rejected ? "bg-red-500" : "bg-amber-400 animat-pulse")} />
                                                              <span className="text-xs font-bold text-slate-700">{req.is_approved ? "Granted" : req.is_rejected ? "Rejected" : "Pending"}</span>
                                                          </div>
                                                          <p className="font-bold text-slate-900 text-lg">"{req.reason}"</p>
                                                          <p className="text-xs font-semibold text-slate-400 mt-1">{new Date(req.requested_time).toLocaleString()}</p>
                                                      </div>
                                                  </div>
                                                  <div className="w-full md:w-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-end gap-1">
                                                      <p className="text-[10px] font-black text-slate-400 uppercase">Gateway Info</p>
                                                      <p className="text-sm font-bold text-slate-700 capitalize">{req.current_level?.replace('_', ' ') || "Completed"}</p>
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
                                  <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center gap-4">
                                      <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300">
                                          <History className="w-8 h-8" />
                                      </div>
                                      <div className="space-y-1">
                                          <p className="text-slate-900 font-black text-lg">No Request History</p>
                                          <p className="text-slate-400 text-sm font-medium">This student hasn't submitted any outing/outpass requests yet.</p>
                                      </div>
                                  </div>
                              )}
                          </motion.div>
                      )}
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

      <Modal isOpen={showQR} onClose={() => setShowQR(false)}>
          <div className="p-8 flex flex-col items-center text-center gap-8 relative">
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 transition-colors"
              >
                  <X className="w-5 h-5" />
              </button>
              <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Digital Identity QR</h3>
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">{selectedStudent?.name}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2.5rem] shadow-inner border-4 border-slate-100">
                  {selectedStudent && (
                      <QRCode 
                        value={JSON.stringify({
                            id: selectedStudent.id,
                            name: selectedStudent.name,
                            branch: selectedStudent.branch,
                            year: selectedStudent.year,
                            parent: selectedStudent.father_name,
                            contact: selectedStudent.phone_number
                        })}
                        size={240}
                        fgColor="#0f172a"
                      />
                  )}
              </div>
              <p className="text-xs text-slate-400 font-medium italic max-w-[240px]">This code contains essential student and parent contact information for verified verification.</p>
              <button 
                onClick={() => setShowQR(false)}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                  Close Securely
              </button>
          </div>
      </Modal>
    </div>
  );
}
