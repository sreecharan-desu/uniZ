export default function RequestCard({ request, type,email }: { request: any; type: 'outing' | 'outpass';email : string}) {
    return (
        <div className="shadow-lg p-4 border border-gray-600 rounded-lg bg-white m-5">
            <p className="font-semibold text-lg text-gray-800">{request._id}</p>
            <p className="my-2">
                <span className="font-semibold">Reason:</span> {request.reason}
            </p>
            <p className="my-2">
                <span className="font-semibold">Requested on :</span> {request.requested_time.split(",")[0]}
            </p>
            {type === 'outing' ? (
                <>
                    <p className="my-2">
                        <span className="font-semibold">Duration:</span> {request.from_time} to {request.to_time}
                    </p>
                </>
            ) : (
                <>
                    <p className="my-2">
                        <span className="font-semibold">No_of_days:</span> {request.no_of_days+1}
                    </p>
                    <p className="my-2">
                        <span className="font-semibold">Duration:</span> {request.from_day} to {request.to_day}
                    </p>
                </>
            )}
            <p className="my-2">
                <span className="font-semibold">Status:</span> {request.is_approved ? "Approved ✅" : request.is_rejected ? "Rejected ❌" : "Pending ⏳"}
            </p>
            {request.is_approved ? (
                <>
                    <p className="my-2">
                        <span className="font-semibold">Approved by : </span> {request.issued_by} 
                    </p>
                    <p className="my-2">
                        <span className="font-semibold">Message from {request.issued_by} : </span> You should return by {request.to_time ? request.to_time : request.to_day}
                    </p>
                </>
            ) : request.is_rejected ? (
                <>
                    <p className="my-2">
                        <span className="font-semibold">Rejected by:</span> {request.rejected_by}
                    </p>
                </>
            ) : null}
            <p className="mt-4 text-sm text-gray-600">
                **An email will be sent to your college email-id <b className="font-bold text-black">{email}</b> regarding your {type} confirmation!
            </p>
        </div>
    );
}