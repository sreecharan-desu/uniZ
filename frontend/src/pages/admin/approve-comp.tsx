
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useGetOutings } from "../../hooks/getoutings";
import { useGetOutpasses } from "../../hooks/getoutpassess";
import { outings, outpasses } from "../../store";
import { APPROVE_OUTING, APPROVE_OUTPASS, REJECT_OUTING, REJECT_OUTPASS, FORWARD_OUTING, FORWARD_OUTPASS } from "../../api/endpoints";
import { useState, useMemo } from "react";
import { Button } from "../../components/Button";
import { useIsAuth } from "../../hooks/is_authenticated";
import { calculateDuration, formatDuration, formatRequestTime } from '../../utils/timeUtils';
import { toast } from "react-toastify";
import { CheckCircle, Search, Ban, Forward, Inbox } from "lucide-react";
import { Input } from "../../components/Input";
import { cn } from "../../utils/cn";

type ApproveProps = {
    type: "outing" | "outpass",
}

export default function ApproveComp({ type }: ApproveProps) {
    useIsAuth();
    useGetOutings();
    useGetOutpasses();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const Outings = useRecoilValue(outings) || [];
    const Outpasses = useRecoilValue(outpasses) || [];

    const setOutings = useSetRecoilState(outings);
    const setOutpasses = useSetRecoilState(outpasses);

    const requests = type === "outing" ? Outings : Outpasses;

    // Filter logic
    const filteredRequests = useMemo(() => {
        if (!requests) return [];
        return requests.filter((item: any) =>
            !item.is_expired &&
            (item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.reason.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [requests, searchQuery]);

    const handleAction = async (action: 'approve' | 'reject' | 'forward', id: string) => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        let endpoint = '';
        const body: any = { id };

        if (action === 'reject') {
            const reason = prompt("Enter rejection reason:", "Rejected via Admin Console");
            if (!reason) return;
            body.message = reason;
        }

        if (type === 'outing') {
             if (action === 'approve') endpoint = APPROVE_OUTING;
             else if (action === 'reject') endpoint = REJECT_OUTING;
             else endpoint = FORWARD_OUTING;
        } else {
             if (action === 'approve') endpoint = APPROVE_OUTPASS;
             else if (action === 'reject') endpoint = REJECT_OUTPASS;
             else endpoint = FORWARD_OUTPASS;
        }

        setLoadingId(id);
        
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success(data.msg);
                
                // Optimistic UI Update
                const updateState = (prev: any[]) => {
                     if (action === 'forward') return prev.filter(item => item._id !== id);
                     
                     return prev.map(item => {
                        if (item._id !== id) return item;
                        return {
                            ...item,
                            is_approved: action === 'approve',
                            is_rejected: action === 'reject',
                            issued_by: action === 'approve' ? "Administration" : item.issued_by,
                            rejected_by: action === 'reject' ? "Administration" : item.rejected_by,
                            message: action === 'reject' ? body.message : item.message
                        };
                     });
                };

                if (type === 'outing') setOutings(updateState);
                else setOutpasses(updateState);
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error(`Failed to ${action} request`);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header / Filter */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                     <h2 className="text-2xl font-bold text-slate-900 capitalize">{type} Approvals</h2>
                     <div className="flex items-center gap-2 mt-1">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 px-2 text-xs"
                            onClick={() => window.history.back()}
                        >
                            ← Back
                        </Button>
                        <p className="text-slate-500 text-sm">Manage pending student requests</p>
                     </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full sm:w-80">
                         <Input
                            placeholder="Search by ID, Name or Reason..."
                            value={searchQuery}
                            onchangeFunction={(e: any) => setSearchQuery(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                         />
                    </div>
                    <div className="hidden sm:flex items-center justify-center px-4 bg-slate-100 rounded-lg text-slate-600 font-medium text-sm whitespace-nowrap border border-slate-200">
                        {filteredRequests.length} Pending
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRequests.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                             <Inbox className="w-8 h-8" />
                         </div>
                         <h3 className="text-lg font-semibold text-slate-900">No pending requests found</h3>
                         <p className="text-slate-500 max-w-sm mt-2">
                            Good job! You've cleared the queue. Check back later for new {type} requests.
                         </p>
                    </div>
                ) : (
                    filteredRequests.map((request: any) => (
                         <div 
                            key={request._id} 
                            className={cn(
                                "bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm transition-all hover:shadow-md",
                                request.is_approved && "border-emerald-200 bg-emerald-50/10",
                                request.is_rejected && "border-red-200 bg-red-50/10"
                            )}
                        >
                            <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg">
                                         {request.username?.[0]?.toUpperCase()}
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-slate-900 text-lg leading-none">{request.username}</h3>
                                         <p className="text-sm text-slate-500 mt-1">{request.email}</p>
                                     </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                                        request.is_approved ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                                        request.is_rejected ? "bg-red-100 text-red-800 border-red-200" :
                                        "bg-amber-100 text-amber-800 border-amber-200"
                                    )}>
                                        {request.is_approved ? "Approved" : request.is_rejected ? "Rejected" : "Pending"}
                                    </div>
                                    {!request.is_approved && !request.is_rejected && request.current_level && (
                                         <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                            <Forward className="w-3 h-3" /> {request.current_level.toUpperCase()}
                                         </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-5 flex-1">
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                     <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reason</h4>
                                     <p className="text-slate-700 text-sm leading-relaxed font-medium">"{request.reason}"</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-semibold mb-1">From</p>
                                        <p className="text-slate-900 font-medium">
                                             {type === "outing" ? request.from_time : request.from_day}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-semibold mb-1">To</p>
                                        <p className="text-slate-900 font-medium">
                                             {type === "outing" ? request.to_time : request.to_day}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm pt-2">
                                     <div>
                                         <span className="text-slate-400 text-xs uppercase font-semibold">Duration</span> <br/>
                                         <span className="font-medium text-slate-700">
                                            {formatDuration(calculateDuration(
                                                type === "outing" ? request.from_time : request.from_day,
                                                type === "outing" ? request.to_time : request.to_day
                                            ))}
                                         </span>
                                     </div>
                                     <div className="text-right">
                                         <span className="text-slate-400 text-xs uppercase font-semibold">Submitted</span> <br/>
                                         <span className="font-medium text-slate-700">{formatRequestTime(request.requested_time)}</span>
                                     </div>
                                </div>
                            </div>

                             {/* Actions */}
                            {!request.is_approved && !request.is_rejected && !request.is_expired && (
                                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 border-emerald-700"
                                        onClick={() => handleAction('approve', request._id)}
                                        isLoading={loadingId === request._id}
                                    >
                                        <CheckCircle className="w-4 h-4 lg:mr-2" /> <span className="hidden lg:inline">Approve</span>
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleAction('reject', request._id)}
                                        isLoading={loadingId === request._id}
                                    >
                                        <Ban className="w-4 h-4 lg:mr-2" /> <span className="hidden lg:inline">Reject</span>
                                    </Button>
                                    {request.current_level !== 'dsw' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleAction('forward', request._id)}
                                            isLoading={loadingId === request._id}
                                        >
                                            <Forward className="w-4 h-4 lg:mr-2" /> <span className="hidden lg:inline">Forward</span>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
