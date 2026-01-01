import { calculateDuration, formatDuration } from '../utils/timeUtils';
import { motion } from 'framer-motion';
import { Clock, History, Calendar, CheckCircle, XCircle, AlertCircle, User, ArrowRight } from 'lucide-react';

export default function RequestCard({ request, type, email }: { request: any; type: 'outing' | 'outpass'; email: string }) {
    const isPending = !request.is_approved && !request.is_rejected;
    const statusColor = request.is_approved ? 'text-green-600 bg-green-50 border-green-200' : 
                        request.is_rejected ? 'text-red-600 bg-red-50 border-red-200' : 
                        'text-amber-600 bg-amber-50 border-amber-200';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${type === 'outing' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {type === 'outing' ? <Clock className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 capitalize">{type} Request</h3>
                        <p className="text-xs text-gray-400 font-medium">ID: {request._id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusColor}`}>
                        {request.is_approved && <CheckCircle className="w-3 h-3" />}
                        {request.is_rejected && <XCircle className="w-3 h-3" />}
                        {isPending && <AlertCircle className="w-3 h-3" />}
                        {request.is_approved ? "APPROVED" : request.is_rejected ? "REJECTED" : "PENDING"}
                    </span>
                    
                    {isPending && request.current_level && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" />
                            {request.current_level.toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 py-4 border-t border-b border-gray-50">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Reason</p>
                    <p className="text-gray-700 font-medium leading-relaxed">{request.reason}</p>
                </div>
                
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Requested</p>
                    <p className="text-gray-700 font-medium">{request.requested_time.split(",")[0]}</p>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {type === 'outing' ? 'Time Window' : 'Date Range'}
                    </p>
                    <p className="text-gray-900 font-medium">
                        {type === 'outing' ? `${request.from_time} - ${request.to_time}` : `${request.from_day} - ${request.to_day}`}
                    </p>
                </div>

                <div className="space-y-1">
                     <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Duration</p>
                     <p className="text-gray-900 font-medium badge inline-block">
                        {formatDuration(calculateDuration(
                            type === 'outing' ? request.from_time : request.from_day, 
                            type === 'outing' ? request.to_time : request.to_day
                        ))}
                     </p>
                </div>
                
                {request.is_rejected && request.message && (
                     <div className="col-span-full bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                        <p className="text-xs font-bold text-red-800 uppercase mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-700">{request.message}</p>
                     </div>
                )}
            </div>

            {/* History / Logs */}
            {request.approval_logs && request.approval_logs.length > 0 && (
                <div className="mt-4">
                    <button className="text-xs font-bold text-gray-400 flex items-center gap-1 mb-3">
                        <History className="w-3 h-3" /> ACTIVITY LOG
                    </button>
                    <div className="space-y-3 relative pl-2">
                        {/* Vertical line */}
                        <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                        {request.approval_logs.map((log: any, i: number) => (
                            <div key={i} className="relative flex items-center gap-3 text-xs">
                                <div className={`w-2.5 h-2.5 rounded-full z-10 border-2 border-white ${
                                    log.action === 'approve' ? 'bg-green-500' : 
                                    log.action === 'reject' ? 'bg-red-500' : 'bg-blue-400'
                                }`}></div>
                                <div className="flex-1 flex justify-between items-center text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
                                    <span className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-800 uppercase">{log.action}</span>
                                        <span className="text-gray-400">by</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <User className="w-3 h-3" /> {log.role}
                                        </span>
                                    </span>
                                    <span className="text-gray-400 tabular-nums">{new Date(log.time).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                <span>Updates sent to {email}</span>
            </div>
        </motion.div>
    );
}