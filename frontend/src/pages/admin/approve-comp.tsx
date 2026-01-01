import { useRecoilValue, useSetRecoilState } from "recoil";
import { useGetOutings } from "../../hooks/getoutings";
import { useGetOutpasses } from "../../hooks/getoutpassess";
import { outings, outpasses } from "../../store";
import { APPROVE_OUTING, APPROVE_OUTPASS, REJECT_OUTING, REJECT_OUTPASS, FORWARD_OUTING, FORWARD_OUTPASS } from "../../api/endpoints";
import { useState } from "react";
import { Button } from "../../components/Button";
import { useIsAuth } from "../../hooks/is_authenticated";
import { calculateDuration, formatDuration, formatRequestTime } from '../../utils/timeUtils';
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, History } from "lucide-react";

type ApproveProps = {
    type: "outing" | "outpass",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function ApproveComp({ type }: ApproveProps) {
    useIsAuth();
    useGetOutings();
    useGetOutpasses();
    const [loading, setloading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const Outings = useRecoilValue(outings) || [];
    const Outpasses = useRecoilValue(outpasses) || [];

    // Filter function for search
    const filterRequests = (items: any[]) => {
        if (!items) return [];
        return items.filter(item =>
            !item.is_expired &&
            (item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.reason.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    };

    const setOutings = useSetRecoilState(outings);
    const setOutpasses = useSetRecoilState(outpasses);

    const approveouting = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        setloading(true);
        try {
            const res = await fetch(APPROVE_OUTING, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success(data.msg);
                setOutings((prev: any[]) => prev.map((item: any) => 
                    item._id === id ? { ...item, is_approved: true, issued_by: "Administration", issued_time: new Date().toISOString() } : item
                ));
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error("Failed to approve outing");
        } finally {
            setloading(false);
        }
    }

    const rejectouting = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const reason = prompt("Enter rejection reason:", "Rejected via Admin Console");
        if (!reason) return;

        setloading(true);
        try {
            const res = await fetch(REJECT_OUTING, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: JSON.stringify({ id, message: reason })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.msg);
                setOutings((prev: any[]) => prev.map((item: any) => 
                    item._id === id ? { ...item, is_rejected: true, rejected_by: "Administration", rejected_time: new Date().toISOString() } : item
                ));
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error("Failed to reject outing");
        } finally {
            setloading(false);
        }
    }

    const forwardouting = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        setloading(true);
        try {
            const res = await fetch(FORWARD_OUTING, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: JSON.stringify({ id })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.msg);
                setOutings((prev: any[]) => prev.filter((item: any) => item._id !== id));
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error("Failed to forward outing");
        } finally {
            setloading(false);
        }
    }

    const approveoutpass = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        setloading(true);
        try {
            const res = await fetch(APPROVE_OUTPASS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: JSON.stringify({ id })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.msg);
                setOutpasses((prev: any[]) => prev.map((item: any) => 
                    item._id === id ? { ...item, is_approved: true, issued_by: "Administration", issued_time: new Date().toISOString() } : item
                ));
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error("Failed to approve outpass");
        } finally {
            setloading(false);
        }
    }

    const rejectoutpass = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const reason = prompt("Enter rejection reason:", "Rejected via Admin Console");
        if (!reason) return;

        setloading(true);
        try {
            const res = await fetch(REJECT_OUTPASS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: JSON.stringify({ id, message: reason })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.msg);
                setOutpasses((prev: any[]) => prev.map((item: any) => 
                    item._id === id ? { ...item, is_rejected: true, rejected_by: "Administration", rejected_time: new Date().toISOString() } : item
                ));
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error("Failed to reject outpass");
        } finally {
            setloading(false);
        }
    }

    const forwardoutpass = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        setloading(true);
        try {
            const res = await fetch(FORWARD_OUTPASS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: JSON.stringify({ id })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.msg);
                setOutpasses((prev: any[]) => prev.filter((item: any) => item._id !== id));
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error("Failed to forward outpass");
        } finally {
            setloading(false);
        }
    }

    const filteredRequests = filterRequests(type === "outing" ? Outings : Outpasses);

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4">
            {/* Search Header */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
            >
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                        <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                            <span className="text-blue-700 font-medium text-sm">Total</span>
                            <span className="ml-2 text-blue-900 font-bold text-lg">
                                {type === "outing" ? Outings.length : Outpasses.length}
                            </span>
                        </div>
                        <div className="px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                            <span className="text-emerald-700 font-medium text-sm">Active</span>
                            <span className="ml-2 text-emerald-900 font-bold text-lg">
                                {filteredRequests.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {type === "outing" ? "Outing" : "Outpass"} Requests
                    </h1>
                    <div className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                        {filteredRequests.length} results
                    </div>
                </div>
            </motion.div>

            {/* Request Cards Grid */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                <AnimatePresence>
                {filteredRequests.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="col-span-2 bg-white/60 backdrop-blur-md rounded-2xl p-12 text-center border-2 border-dashed border-gray-200"
                    >
                        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                        <p className="text-gray-500">All caught up! New requests will appear here.</p>
                    </motion.div>
                ) : (
                    filteredRequests.map((request) => (
                        <motion.div 
                            key={request._id}
                            variants={cardVariants}
                            layout
                            className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border overflow-hidden ${selectedRequest === request._id
                                    ? 'border-blue-500 ring-4 ring-blue-500/10'
                                    : 'border-gray-100'
                                }`}
                            onClick={() => setSelectedRequest(request._id)}
                        >
                            <div className="p-6">
                                {/* Request Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-blue-200 shadow-lg">
                                            {request.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{request.username}</p>
                                            <p className="text-sm text-gray-500">{request.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${request.is_approved ? 'bg-emerald-100 text-emerald-800' :
                                                request.is_rejected ? 'bg-red-100 text-red-800' :
                                                    request.is_expired ? 'bg-gray-100 text-gray-800' :
                                                        'bg-amber-100 text-amber-800'
                                            }`}>
                                            {request.is_approved ? "Approved" :
                                                request.is_rejected ? "Rejected" :
                                                    request.is_expired ? "Expired" :
                                                        "Pending"}
                                        </span>
                                        {request.current_level && !request.is_approved && !request.is_rejected && (
                                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" /> {request.current_level.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Request Details */}
                                <div className="space-y-4">
                                    {/* Reason Section */}
                                    <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reason</h4>
                                        <p className="text-gray-700 leading-relaxed text-sm">{request.reason}</p>
                                    </div>

                                    {/* Time/Date Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                                            <h4 className="text-xs font-medium text-gray-500 mb-1">From</h4>
                                            <p className="font-semibold text-gray-900">
                                                {type === "outing" ? request.from_time : request.from_day}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                                            <h4 className="text-xs font-medium text-gray-500 mb-1">To</h4>
                                            <p className="font-semibold text-gray-900">
                                                {type === "outing" ? request.to_time : request.to_day}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Duration and Request Time */}
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="text-sm">
                                            <span className="text-gray-400 block text-xs">Duration</span>
                                            <span className="font-medium text-blue-600">
                                                {type === "outing"
                                                    ? formatDuration(calculateDuration(request.from_time, request.to_time))
                                                    : formatDuration(calculateDuration(request.from_day, request.to_day))
                                                }
                                            </span>
                                        </div>
                                        <div className="text-right text-sm">
                                             <span className="text-gray-400 block text-xs">Requested</span>
                                            <span className="font-medium text-gray-900">
                                                {formatRequestTime(request.requested_time)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* History Section */}
                                    {request.approval_logs && request.approval_logs.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                                                <History className="w-3 h-3 mr-1" /> History
                                            </h4>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {request.approval_logs.map((log: any, i: number) => (
                                                    <div key={i} className="text-xs text-gray-600 flex justify-between bg-gray-50 p-2 rounded border border-gray-100">
                                                        <span><span className="font-semibold">{log.action.toUpperCase()}</span> by {log.by} ({log.role})</span>
                                                        <span className="text-gray-400">{new Date(log.time).toLocaleDateString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {!request.is_approved && !request.is_rejected && !request.is_expired && (
                                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                                            <Button
                                                onclickFunction={() => type === "outing"
                                                    ? approveouting(request._id)
                                                    : approveoutpass(request._id)
                                                }
                                                value="Approve"
                                                loading={loading}
                                            />
                                            <Button
                                                onclickFunction={() => type === "outing"
                                                    ? rejectouting(request._id)
                                                    : rejectoutpass(request._id)
                                                }
                                                value="Reject"
                                                loading={loading}
                                            />
                                            {request.current_level !== 'dsw' && (
                                                <Button
                                                    onclickFunction={() => type === "outing"
                                                        ? forwardouting(request._id)
                                                        : forwardoutpass(request._id)
                                                    }
                                                    value="Forward"
                                                    loading={loading}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Status Information */}
                                    {(request.is_approved || request.is_rejected) && (
                                        <div className="border-t pt-4 mt-4">
                                            <div className="flex items-center text-sm">
                                                {request.is_approved && (
                                                    <div className="text-emerald-600 flex items-center font-medium">
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Approved by {request.issued_by}
                                                    </div>
                                                )}
                                                {request.is_rejected && (
                                                    <div className="text-red-600 flex items-center font-medium">
                                                       <span className="mr-2">✕</span>
                                                        Rejected by {request.rejected_by}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
