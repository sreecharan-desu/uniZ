
import { useRecoilValue, useSetRecoilState } from "recoil";
import { offCampus } from "../store";
import { UPDATE_STUDENT_STATUS } from "../api/endpoints";
import { Button } from "./Button";
import { useState, useEffect } from "react";
import { useIsAuth } from "../hooks/is_authenticated";
import { toast } from "react-toastify";
import { useOutsideCampus } from "../hooks/useOutsideCampus";
import { Search, UserCircle2, Clock, CalendarDays, RefreshCcw } from "lucide-react";
import { Input } from "./Input";

const StudentCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="bg-slate-100 rounded-full h-10 w-10" />
      <div className="flex-1 space-y-2">
        <div className="bg-slate-100 h-4 w-32 rounded" />
        <div className="bg-slate-100 h-3 w-20 rounded" />
      </div>
    </div>
    <div className="space-y-2 py-2">
      <div className="bg-slate-100 h-3 w-full rounded" />
      <div className="bg-slate-100 h-3 w-4/5 rounded" />
    </div>
    <div className="h-9 bg-slate-100 rounded w-full" />
  </div>
);

export default function UpdateStatus() {
  useIsAuth();
  useOutsideCampus();
  const students = useRecoilValue(offCampus) || [];
  const setOffCampus = useSetRecoilState(offCampus);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, _setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (students) {
       if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const filtered = students.filter((student: any) => 
            student.username.toLowerCase().includes(query) || 
            student.name.toLowerCase().includes(query)
        );
        setFilteredStudents(filtered);
      } else {
        setFilteredStudents(students);
      }
    }
  }, [searchQuery, students]);

  const updateStatus = async (userId: string, id: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setUpdatingId(id);
    try {
      const bodyData = JSON.stringify({ userId, id });
      const res = await fetch(UPDATE_STUDENT_STATUS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: bodyData,
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.msg);
        setOffCampus((prev: any[]) => prev.filter((s: any) => s._id !== userId));
      } else {
        toast.error(data.msg);
      }
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Off-Campus Students
          </h1>
          <p className="text-slate-500 mt-1">
             Manage students currently marked as outside the campus.
          </p>
        </div>
        
        <div className="w-full md:w-72">
            <Input 
                placeholder="Search by name or ID..."
                value={searchQuery}
                onchangeFunction={(e: any) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
            />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             Array.from({ length: 6 }).map((_, i) => <StudentCardSkeleton key={i} />)
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student: any) => (
             <div 
                key={student._id} 
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col h-full"
             >
                <div className="flex items-start gap-4 mb-4 pb-4 border-b border-slate-100">
                     <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                         <UserCircle2 className="w-6 h-6" />
                     </div>
                     <div>
                         <h3 className="font-semibold text-slate-900 leading-tight">{student.name}</h3>
                         <p className="text-sm text-slate-500 font-mono">{student.username}</p>
                     </div>
                </div>

                <div className="flex-1 space-y-4">
                    {/* Outings */}
                    {student.outings_list
                      .filter((o: any) => !o.is_expired && o.is_approved)
                      .map((outing: any) => (
                        <div key={outing._id} className="bg-blue-50/50 rounded-md p-3 border border-blue-100">
                             <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase mb-2">
                                <Clock className="w-3.5 h-3.5" /> Outing
                             </div>
                             <div className="flex justify-between text-sm mb-1">
                                 <span className="text-slate-500">From: <span className="text-slate-900 font-medium">{outing.from_time}</span></span>
                                 <span className="text-slate-500">To: <span className="text-slate-900 font-medium">{outing.to_time}</span></span>
                             </div>
                             <p className="text-xs text-slate-500 italic mb-3">"{outing.reason}"</p>
                             <Button 
                                size="sm" 
                                className="w-full"
                                isLoading={updatingId === outing._id}
                                onClick={() => updateStatus(student._id, outing._id)}
                             >
                                Mark as Returned
                             </Button>
                        </div>
                    ))}

                    {/* Outpasses */}
                    {student.outpasses_list
                      .filter((o: any) => !o.is_expired && o.is_approved)
                      .map((outpass: any) => (
                         <div key={outpass._id} className="bg-purple-50/50 rounded-md p-3 border border-purple-100">
                             <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase mb-2">
                                <CalendarDays className="w-3.5 h-3.5" /> Outpass
                             </div>
                             <div className="flex justify-between text-sm mb-1">
                                 <span className="text-slate-500">From: <span className="text-slate-900 font-medium">{outpass.from_day}</span></span>
                                 <span className="text-slate-500">To: <span className="text-slate-900 font-medium">{outpass.to_day}</span></span>
                             </div>
                             <p className="text-xs text-slate-500 italic mb-3">"{outpass.reason}"</p>
                             <Button 
                                size="sm" 
                                className="w-full"
                                isLoading={updatingId === outpass._id}
                                onClick={() => updateStatus(student._id, outpass._id)}
                             >
                                Mark as Returned
                             </Button>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                    <span>{student.email}</span>
                    <span className="capitalize">{student.gender}</span>
                </div>
             </div>
          ))
        ) : (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                 <div className="bg-slate-50 p-4 rounded-full mb-4">
                     <RefreshCcw className="w-8 h-8 text-slate-300" />
                 </div>
                 <h3 className="text-lg font-medium text-slate-900">No active students outside</h3>
                 <p className="text-slate-500 max-w-sm mx-auto mt-1">
                    {searchQuery ? `No results for "${searchQuery}"` : "All students are currently marked as present in campus."}
                 </p>
             </div>
        )}
      </div>
    </div>
  );
}
