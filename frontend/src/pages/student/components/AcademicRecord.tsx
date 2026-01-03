
import { Grade, Attendance, Student } from '../../../types';
import { BookOpen, GraduationCap, Percent, Award } from 'lucide-react';

interface AcademicRecordProps {
  student: Student;
}

export default function AcademicRecord({ student }: AcademicRecordProps) {
  // Group grades by Semester
  const gradesBySemester = student.grades?.reduce((acc: any, grade) => {
    const semName = grade.semester?.name || 'Unknown';
    if (!acc[semName]) acc[semName] = [];
    acc[semName].push(grade);
    return acc;
  }, {});

  // Group attendance by Semester
  const attendanceBySemester = student.attendance?.reduce((acc: any, att) => {
    const semName = att.semester?.name || 'Unknown';
    if (!acc[semName]) acc[semName] = [];
    acc[semName].push(att);
    return acc;
  }, {});

  const semesters = [...new Set([...Object.keys(gradesBySemester || {}), ...Object.keys(attendanceBySemester || {})])].sort();

  if (semesters.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-12 bg-neutral-50 rounded-2xl border border-neutral-100/50 text-neutral-400 gap-3">
              <GraduationCap className="w-10 h-10 opacity-20" />
              <p className="font-medium text-sm">No academic records found.</p>
          </div>
      )
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {semesters.map((sem) => (
        <div key={sem} className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-1 bg-black rounded-r-full"></div>
             <h2 className="text-xl font-black tracking-tight uppercase">{sem}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Grades Table */}
             {gradesBySemester[sem] && (
                 <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-sm">
                     <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                         <h3 className="font-bold text-sm uppercase flex items-center gap-2 text-neutral-600">
                            <Award className="w-4 h-4" /> Grades
                         </h3>
                         {/* Calculate GPA if needed */}
                         <div className="text-xs font-mono text-neutral-400">CGPA: Calculating...</div>
                     </div>
                     <table className="w-full text-sm text-left">
                         <thead className="bg-white text-neutral-400 border-b border-neutral-50 text-[10px] uppercase tracking-wider font-bold">
                             <tr>
                                 <th className="px-6 py-3 font-bold">Subject</th>
                                 <th className="px-6 py-3 font-bold text-center">Credit</th>
                                 <th className="px-6 py-3 font-bold text-right">Grade</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-neutral-50">
                             {gradesBySemester[sem].map((g: Grade) => (
                                 <tr key={g.id} className="hover:bg-neutral-50/50 transition-colors">
                                     <td className="px-6 py-3 font-medium text-neutral-900">{g.subject.name}</td>
                                     <td className="px-6 py-3 text-center text-neutral-500">{g.subject.credits}</td>
                                     <td className="px-6 py-3 text-right font-bold text-black">{g.grade}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             )}

             {/* Attendance List */}
             {attendanceBySemester[sem] && (
                <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-sm h-fit">
                    <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100">
                         <h3 className="font-bold text-sm uppercase flex items-center gap-2 text-neutral-600">
                            <Percent className="w-4 h-4" /> Attendance
                         </h3>
                    </div>
                    <div className="divide-y divide-neutral-50">
                        {attendanceBySemester[sem].map((att: Attendance) => {
                            const percentage = att.totalClasses > 0 ? ((att.attendedClasses / att.totalClasses) * 100).toFixed(1) : '0.0';
                            const isLow = parseFloat(percentage) < 75;
                            return (
                                <div key={att.id} className="px-6 py-3 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                        <span className="font-medium text-neutral-900">{att.subject.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-bold block ${isLow ? 'text-red-600' : 'text-black'}`}>{percentage}%</span>
                                        <span className="text-[10px] text-neutral-400 font-mono">{att.attendedClasses}/{att.totalClasses} Classes</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             )}

          </div>
        </div>
      ))}
    </div>
  );
}
