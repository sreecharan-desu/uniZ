
import { calculateDuration, formatDuration } from '../utils/timeUtils';
import { Clock, History, Calendar, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function RequestCard({ request, type, email }: { request: any; type: 'outing' | 'outpass'; email: string }) {
    const isPending = !request.is_approved && !request.is_rejected;
    const isApproved = request.is_approved;
    const isRejected = request.is_rejected;

    const statusBadge = () => {
        if (isApproved) return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-black text-white"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
        if (isRejected) return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-400 text-white"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-white text-black border border-black shadow-sm"><AlertCircle className="w-3.5 h-3.5" /> Pending</span>;
    };

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md bg-slate-100 text-slate-900 border border-slate-200`}>
                        {type === 'outing' ? <Clock className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 capitalize leading-tight">{type} Request</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">#{request._id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    {statusBadge()}
                    {isPending && request.current_level && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white bg-black px-2 py-0.5 rounded">
                             <ArrowRight className="w-3 h-3" />
                             Pending at {request.current_level.replace('_', ' ')}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                     <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Reason</p>
                     <p className="text-slate-800">{request.reason}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Requested On</p>
                    <p className="text-slate-800">{request.requested_time.split(",")[0]}</p>
                </div>
                <div>
                     <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                        {type === 'outing' ? 'Time Window' : 'Duration'}
                     </p>
                     <p className="text-slate-800 font-medium">
                        {type === 'outing' ? `${request.from_time} - ${request.to_time}` : `${request.from_day} - ${request.to_day}`}
                     </p>
                </div>
                <div>
                     <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Duration</p>
                     <p className="text-slate-800 font-medium">
                        {formatDuration(calculateDuration(
                            type === 'outing' ? request.from_time : request.from_day, 
                            type === 'outing' ? request.to_time : request.to_day
                        ))}
                     </p>
                </div>

                {isRejected && request.message && (
                    <div className="col-span-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded text-black text-sm">
                        <span className="font-semibold block mb-1">Rejection Reason:</span>
                        {request.message}
                    </div>
                )}
            </div>

            {/* Approval Logs */}
             {request.approval_logs && request.approval_logs.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                     <h5 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2 mb-3">
                        <History className="w-3.5 h-3.5" /> Activity Log
                     </h5>
                     <div className="space-y-2 pl-4 border-l-2 border-slate-100 ml-1.5">
                        {request.approval_logs.map((log: any, i: number) => (
                            <div key={i} className="text-xs relative">
                                <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                     log.action === 'approve' ? 'bg-black' : 
                                     log.action === 'reject' ? 'bg-slate-400' : 'bg-slate-100'
                                }`}></div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>
                                        <span className="font-semibold text-slate-900 uppercase">{log.action}</span> by {log.role}
                                    </span>
                                    <span className="text-slate-400">{new Date(log.time).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}
            
            <div className="mt-4 pt-4 text-[10px] text-slate-400 font-medium uppercase tracking-wide flex justify-between">
                <span>Ref: {request._id}</span>
                <span>Notified: {email}</span>
            </div>
        </div>
    );
}