export default function RequestCard({ request, type, email }: { request: any; type: 'outing' | 'outpass'; email: string }) {
    return (
        <div className="shadow-lg p-6 border border-gray-200 rounded-lg bg-white m-5 transition-transform transform hover:scale-105 hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <p className="font-semibold text-lg text-gray-800">{request._id}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.is_approved ? 'bg-green-100 text-green-800' :
                    request.is_rejected ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {request.is_approved ? "Approved ✅" : request.is_rejected ? "Rejected ❌" : "Pending ⏳"}
                </span>
            </div>
            <div className="space-y-2">
                <p>
                    <span className="font-semibold">Reason:</span> {request.reason}
                </p>
                <p>
                    <span className="font-semibold">Requested on:</span> {request.requested_time.split(",")[0]}
                </p>
                {type === 'outing' ? (
                    <p>
                        <span className="font-semibold">Duration:</span> {request.from_time} to {request.to_time}
                    </p>
                ) : (
                    <>
                        <p>
                            <span className="font-semibold">No. of days:</span> {request.no_of_days + 1}
                        </p>
                        <p>
                            <span className="font-semibold">Duration:</span> {request.from_day} to {request.to_day}
                        </p>
                    </>
                )}
                {request.is_approved && (
                    <>
                        <p>
                            <span className="font-semibold">Approved by:</span> {request.issued_by}
                        </p>
                        <p>
                            <span className="font-semibold">Message from {request.issued_by}:</span> You should return by {request.to_time ? request.to_time : request.to_day}
                        </p>
                    </>
                )}
                {request.is_rejected && (
                    <p>
                        <span className="font-semibold">Rejected by:</span> {request.rejected_by}
                    </p>
                )}
            </div>
            <p className="mt-4 text-sm text-gray-600">
                **An email will be sent to your college email-id <b className="font-bold text-black">{email}</b> regarding your {type} confirmation & updates!
            </p>
        </div>
    );
}