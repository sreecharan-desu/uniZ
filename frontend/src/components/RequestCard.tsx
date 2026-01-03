
import { calculateDuration, formatDuration } from '../utils/timeUtils';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, ArrowRight, History } from 'lucide-react';

export default function RequestCard({ request, type }: { request: any; type: 'outing' | 'outpass' }) {
    const isApproved = request.is_approved;
    const isRejected = request.is_rejected;
    const isPending = !isApproved && !isRejected;

    const StatusBadge = () => {
        if (isApproved) return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black text-white"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
        if (isRejected) return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-neutral-200 text-neutral-900"><AlertCircle className="w-3.5 h-3.5" /> Pending</span>;
    };

    return (
        <div className="group bg-white border border-neutral-100 hover:border-black/10 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-b border-neutral-50 pb-5">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-neutral-50 text-neutral-900">
                        {type === 'outing' ? <Clock className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-900 capitalize text-lg">{type} Request</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-neutral-400">ID: {request._id.slice(-6).toUpperCase()}</span>
                            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                            <span className="text-xs text-neutral-500">{new Date(request.requested_time).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <StatusBadge />
                    {isPending && request.current_level && (
                        <div className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 flex items-center gap-1">
                             Pending at {request.current_level.replace(/_/g, ' ')} <ArrowRight className="w-3 h-3" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm mb-6">
                <div className="col-span-1 md:col-span-2">
                     <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Reason</p>
                     <p className="text-neutral-900 font-medium leading-relaxed">{request.reason}</p>
                </div>
                <div>
                     <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                        {type === 'outing' ? 'Time Window' : 'Duration'}
                     </p>
                     <p className="text-xl font-bold text-neutral-900 tracking-tight">
                        {type === 'outing' ? `${request.from_time} - ${request.to_time}` : `${new Date(request.from_day).toLocaleDateString()} - ${new Date(request.to_day).toLocaleDateString()}`}
                     </p>
                </div>
                <div>
                     <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Total Time</p>
                     <div className="inline-flex items-center px-3 py-1 rounded-md bg-neutral-50 text-neutral-900 font-bold border border-neutral-100">
                        {formatDuration(calculateDuration(
                            type === 'outing' ? request.from_time : request.from_day, 
                            type === 'outing' ? request.to_time : request.to_day
                        ))}
                     </div>
                </div>

                {isRejected && request.message && (
                    <div className="col-span-full p-4 bg-red-50/50 border border-red-100 rounded-lg text-red-900 text-sm">
                        <span className="font-bold block mb-1 flex items-center gap-2"><XCircle className="w-4 h-4"/> Rejection Reason</span>
                        {request.message}
                    </div>
                )}
            </div>

            {/* Logs Accordion (Simplified) */}
             {request.approval_logs && request.approval_logs.length > 0 && (
                <div className="pt-5 border-t border-neutral-50">
                     <div className="flex items-center gap-2 mb-4">
                        <History className="w-3.5 h-3.5 text-neutral-400" /> 
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Activity Log</span>
                     </div>
                     <div className="relative pl-4 space-y-4 border-l border-neutral-100 ml-1.5">
                        {request.approval_logs.map((log: any, i: number) => (
                            <div key={i} className="text-xs relative">
                                <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ring-1 ring-neutral-100 ${
                                     log.action === 'approve' ? 'bg-black' : 
                                     log.action === 'reject' ? 'bg-red-500' : 'bg-neutral-200'
                                }`}></span>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <span className="text-neutral-700">
                                        <span className="font-bold uppercase text-neutral-900">{log.action}</span> by {log.role}
                                    </span>
                                    <span className="text-neutral-400 font-mono text-[10px]">{new Date(log.time).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
}