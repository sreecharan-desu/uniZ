
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useIsAuth } from "../../hooks/is_authenticated";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, AlertCircle, MapPin } from "lucide-react";
import { SEARCH_STUDENTS } from "../../api/endpoints";
import { Input } from "../../components/Input";

const StudentCardSkeleton = () => (
  <div className="animate-pulse p-6 bg-white rounded-xl border border-slate-200">
    <div className="flex items-center space-x-4 mb-6">
      <div className="h-14 w-14 bg-slate-100 rounded-full" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-2">
            <div className="h-3 bg-slate-100 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-full" />
        </div>
      ))}
    </div>
  </div>
);

interface StudentProps {
  _id: string;
  username: string;
  name: string;
  gender?: string;
  email?: string;
  year?: string;
  branch?: string;
  section?: string;
  roomno?: string;
  has_pending_requests?: boolean;
  is_in_campus?: boolean;
  blood_group?: string;
  phone_number?: string;
  father_address?: string;
  father_name?: string;
  father_phonenumber?: string;
  mother_address?: string;
  mother_name?: string;
  mother_phonenumber?: string;
  father_email?: string;
  mother_email?: string;
  father_occupation?: string;
  mother_occupation?: string;
  is_disabled?: boolean;
  profile_url?: string;
  grades?: { subject: string; credits: number; grade: number; semester: string }[];
  outings_list?: any[];
  outpasses_list?: any[];
  approval_logs?: { by: string; role: string; time: string; action: string }[];
  current_level?: string;
}

export default function SearchStudents() {
  useIsAuth();
  const [string, setString] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<StudentProps[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProps | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const debouncedValue = useDebounce(string, 500);
  const navigate = useNavigate();

  const fetchStudents = async (query: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return setError("Authentication token not found");

    try {
      setIsLoading(true);
      setError("");
      const cleanToken = token.replace(/^["'](.+(?=["']$))["']$/, "$1");
      const res = await fetch(SEARCH_STUDENTS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify({ username: query.toLowerCase() }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.msg || "Failed to fetch students");
        setSuggestions([]);
        setSelectedStudent(null);
        return;
      }

      const suggs = data.suggestions || [];
      setSuggestions(suggs);

      if (suggs.length === 1 || data.student) {
        setSelectedStudent(data.student || suggs[0]);
        setSuggestions([]);
      } else setSelectedStudent(null);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching students. Please try again.");
      setSuggestions([]);
      setSelectedStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!debouncedValue) {
      setSuggestions([]);
      setSelectedStudent(null);
      setError("");
      return;
    }
    fetchStudents(debouncedValue);
  }, [debouncedValue]);

  const handleSelectSuggestion = (username: string) => {
    setString(username);
    fetchStudents(username);
  };

  const getHistory = () => {
      if (!selectedStudent) return [];
      const history = [
          ...(selectedStudent.outings_list || []).map(r => ({ ...r, type: 'Outing' })),
          ...(selectedStudent.outpasses_list || []).map(r => ({ ...r, type: 'Outpass' }))
      ];
      return history.sort((a, b) => new Date(b.requested_time).getTime() - new Date(a.requested_time).getTime());
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <button
            onClick={() => navigate("/admin")}
            className="self-start inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
                <p className="text-slate-500 mt-1">Search and view comprehensive student profiles.</p>
             </div>
             
             <div className="w-full md:w-96 relative">
                 <Input 
                    placeholder="Enter ID (e.g., o210008) or Name"
                    value={string}
                    onchangeFunction={(e: any) => {
                        setString(e.target.value);
                        setError("");
                        setSelectedStudent(null);
                    }}
                    icon={<Search className="w-4 h-4" />}
                 />
                 
                 {suggestions.length > 0 && !selectedStudent && (
                    <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
                        {suggestions.map((s) => (
                        <div
                            key={s._id}
                            className="flex items-center px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                            onClick={() => handleSelectSuggestion(s.username)}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500 overflow-hidden">
                                {s.profile_url ? <img src={s.profile_url} alt="" className="w-full h-full object-cover"/> : <User className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 text-sm">{s.name}</p>
                                <p className="text-xs text-slate-500">{s.username}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
             </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm">
           <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {isLoading && <StudentCardSkeleton />}

      {!isLoading && !selectedStudent && !error && string && suggestions.length === 0 && (
         <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
             <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3 text-slate-400">
                 <Search className="w-6 h-6" />
             </div>
             <p className="text-slate-900 font-medium">No students found</p>
             <p className="text-slate-500 text-sm">Try searching with a different ID or name.</p>
         </div>
      )}

      {selectedStudent && !isLoading && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
           <div className="bg-slate-900 px-8 py-8 flex flex-col md:flex-row items-center md:items-start gap-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
              <div className="h-28 w-28 bg-white rounded-full flex items-center justify-center text-slate-900 text-3xl font-bold ring-4 ring-white/20 overflow-hidden shadow-2xl">
                  {selectedStudent.profile_url ? (
                      <img src={selectedStudent.profile_url} alt={selectedStudent.name} className="w-full h-full object-cover" />
                  ) : (
                       selectedStudent.gender?.toLowerCase() === 'female' ? 
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Annie" alt="Female Avatar" /> :
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Male Avatar" />
                  )}
              </div>
              <div className="flex-1 text-white text-center md:text-left">
                  <h2 className="text-3xl font-bold">{selectedStudent.name}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                      <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">{selectedStudent.username}</span>
                      <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">{selectedStudent.branch} - {selectedStudent.year}</span>
                      {selectedStudent.has_pending_requests && (
                          <span className="bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-amber-500/30 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3"/> Pending Request
                          </span>
                      )}
                  </div>
              </div>
           </div>

           {/* Tabs */}
           <div className="border-b border-slate-200 px-8">
               <div className="flex gap-8">
                   {['overview', 'academics', 'history'].map(tab => (
                       <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${
                               activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
                           }`}
                       >
                           {tab}
                       </button>
                   ))}
               </div>
           </div>

           <div className="p-8">
               {activeTab === 'overview' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12 animate-in fade-in duration-300">
                       <Section title="Academic Info">
                           <Detail label="Year" value={selectedStudent.year} />
                           <Detail label="Branch" value={selectedStudent.branch} />
                           <Detail label="Section" value={selectedStudent.section} />
                           <Detail label="Room No" value={selectedStudent.roomno} />
                       </Section>

                       <Section title="Personal Info">
                           <Detail label="Gender" value={selectedStudent.gender} />
                           <Detail label="Blood Group" value={selectedStudent.blood_group} />
                           <Detail label="Disability Status" value={selectedStudent.is_disabled ? "Yes" : "No"} />
                       </Section>

                       <Section title="Parental Info (Father)">
                            <Detail label="Name" value={selectedStudent.father_name} />
                            <Detail label="Occupation" value={selectedStudent.father_occupation} />
                            <Detail label="Phone" value={selectedStudent.father_phonenumber} />
                       </Section>

                       <Section title="Parental Info (Mother)">
                            <Detail label="Name" value={selectedStudent.mother_name} />
                            <Detail label="Occupation" value={selectedStudent.mother_occupation} />
                            <Detail label="Phone" value={selectedStudent.mother_phonenumber} />
                       </Section>

                       <Section title="Contact & Addresses" className="col-span-full">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase">Father's Address</label>
                                    <p className="text-sm font-medium text-slate-700 mt-1 flex gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        {selectedStudent.father_address || "—"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase">Mother's Address</label>
                                    <p className="text-sm font-medium text-slate-700 mt-1 flex gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        {selectedStudent.mother_address || "—"}
                                    </p>
                                </div>
                            </div>
                       </Section>
                   </div>
               )}

               {activeTab === 'academics' && (
                   <div className="space-y-6 animate-in fade-in duration-300">
                       <h3 className="text-lg font-bold text-slate-900 mb-4">Grade History</h3>
                       {selectedStudent.grades && selectedStudent.grades.length > 0 ? (
                           <div className="overflow-x-auto border border-slate-200 rounded-lg">
                               <table className="w-full text-sm text-left">
                                   <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                                       <tr>
                                           <th className="px-6 py-3">Subject</th>
                                           <th className="px-6 py-3">Semester</th>
                                           <th className="px-6 py-3">Credits</th>
                                           <th className="px-6 py-3">Grade</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100">
                                       {selectedStudent.grades.map((g, idx) => (
                                           <tr key={idx} className="hover:bg-slate-50/50">
                                               <td className="px-6 py-3 font-medium text-slate-900">{g.subject}</td>
                                               <td className="px-6 py-3 text-slate-500">{g.semester}</td>
                                               <td className="px-6 py-3 text-slate-500">{g.credits}</td>
                                               <td className="px-6 py-3 font-bold text-slate-900">{g.grade}</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           </div>
                       ) : (
                           <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400">
                               No academic records found for this student.
                           </div>
                       )}
                   </div>
               )}

               {activeTab === 'history' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Request History</h3>
                            <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">
                                Total: {getHistory().length}
                            </span>
                        </div>
                        
                        {getHistory().length > 0 ? (
                            <div className="space-y-4">
                                {getHistory().map((req, idx) => (
                                    <div key={idx} className="border border-slate-200 rounded-lg p-5 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${
                                                    req.is_approved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    req.is_rejected ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                    {req.is_approved ? 'Approved' : req.is_rejected ? 'Rejected' : 'Pending'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 uppercase">{req.type}</span>
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">{new Date(req.requested_time).toLocaleString()}</span>
                                        </div>
                                        <p className="text-slate-900 font-medium text-sm mb-3">"{req.reason}"</p>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                                            <div>
                                                <span className="uppercase font-semibold text-slate-400 block mb-0.5">Duration</span>
                                                {req.type === 'Outing' 
                                                    ? `${req.from_time} - ${req.to_time}` 
                                                    : `${req.from_day} - ${req.to_day}`
                                                }
                                            </div>
                                            <div>
                                                <span className="uppercase font-semibold text-slate-400 block mb-0.5">Current Status</span>
                                                <span className="capitalize">{req.current_level?.replace('_', ' ') || 'Completed'}</span>
                                            </div>
                                        </div>

                                        {/* Approval Timeline */}
                                        {req.approval_logs && req.approval_logs.length > 0 && (
                                            <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Process Log</h4>
                                                <div className="space-y-3 relative before:absolute before:left-1.5 before:top-1 before:h-full before:w-px before:bg-slate-200">
                                                    {req.approval_logs.map((log: any, i: number) => (
                                                        <div key={i} className="relative pl-5 text-xs">
                                                            <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white ${
                                                                log.action === 'approve' ? 'bg-emerald-500' : 
                                                                log.action === 'reject' ? 'bg-red-500' : 
                                                                'bg-blue-500'
                                                            }`} />
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-semibold text-slate-700 capitalize">{log.action}d by {log.role}</span>
                                                                <span className="text-[10px] text-slate-400">{new Date(log.time).toLocaleString()}</span>
                                                            </div>
                                                            <p className="text-slate-500 text-[10px]">{log.by}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400">
                                No history found.
                            </div>
                        )}
                    </div>
               )}
           </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) {
    return (
        <div className={className}>
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wide">
                {title}
            </h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

function Detail({ label, value }: { label: string, value?: string }) {
    return (
        <div>
            <label className="text-xs font-medium text-slate-500 block mb-0.5">{label}</label>
            <p className="text-sm font-medium text-slate-900">{value || "—"}</p>
        </div>
    );
}
