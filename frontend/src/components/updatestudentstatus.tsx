import { useRecoilState } from "recoil";
import { useOutsideCampus } from "../customhooks/outsidecampus";
import { offCampus } from "../store";
import { STUDENT_OUTSIDE_CAMPUS, UPDATE_STUDENT_STATUS } from "../apis";

export function UpdateStatus() {
  useOutsideCampus();
  const [students, setOffCampus] = useRecoilState(offCampus);
  const updateStatus = async (userId: string, id: string) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
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
      console.log(data);
      alert(data.msg);
      const res2 = await fetch(STUDENT_OUTSIDE_CAMPUS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(token)}`,
        },
      });
      const data2 = await res2.json();
      setOffCampus(data2.students);
    }
  };

  return (
    <>
      <h1 className="m-5 text-xl font-bold">
        Students Outside Campus ({students.length})
      </h1>
      {students.map((student) => (
        <div
          key={student.username}
          className="m-5 p-5 bg-gray-100 shadow-lg rounded-lg max-w-full font-sans"
        >
          <div className="flex flex-col text-left">
            <div className="m-2">
              <b className="text-gray-800">Name:</b> {student.name}
            </div>
            <div className="m-2">
              <b className="text-gray-800">Email:</b> {student.email}
            </div>
            <div className="m-2">
              <b className="text-gray-800">Id Number:</b> {student.username}
            </div>
            <div className="m-2">
              <b className="text-gray-800">Gender:</b> {student.gender}
            </div>
            <div className="m-2">
              <b className="text-gray-800">Present in Campus:</b> {student.is_in_campus ? "Yes" : "No"}
            </div>
          </div>
          {student.outings_list.filter((outing) => !outing.is_expired && outing.is_approved).length > 0
            ? student.outings_list
                .filter((outing) => !outing.is_expired)
                .map((outing) => (
                  <div
                    key={outing._id}
                    className="mt-5 p-4 border border-gray-300 rounded-lg bg-white"
                  >
                    <div>
                      <b>Went on:</b> {outing.from_time}
                    </div>
                    <div>
                      <b>Requested timings:</b> {outing.from_time} to {outing.to_time}
                    </div>
                    <div>
                      <b>Reason:</b> {outing.reason}
                    </div>
                    <div>
                      <b>Approved by:</b> {outing.issued_by}
                    </div>
                    <div>
                      <b>Approved at:</b> {outing.issued_time}
                    </div>
                    <button
                      onClick={() => updateStatus(student._id, outing._id)}
                      className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                      Update Student Status
                    </button>
                  </div>
                ))
            : student.outpasses_list
                .filter((outpass) => !outpass.is_expired && outpass.is_approved)
                .map((outpass) => (
                  <div
                    key={outpass._id}
                    className="mt-5 p-4 border border-gray-300 rounded-lg bg-white"
                  >
                    <div className="grid grid-cols-3 gap-2 items-center text-left">
                      <b className="underline col-span-3 text-gray-800">
                        Request Type: Outpass
                      </b>

                      <div>
                        <b>Went on:</b> {outpass.from_day}
                      </div>
                      <div>
                        <b>Requested timings:</b> {outpass.from_day} to {outpass.to_day}
                      </div>
                      <div>
                        <b>Reason:</b> {outpass.reason}
                      </div>

                      <div>
                        <b>Approved by:</b> {outpass.issued_by}
                      </div>
                      <div>
                        <b>Approved at:</b> {outpass.issued_time}
                      </div>
                    </div>
                    <button
                      onClick={() => updateStatus(student._id, outpass._id)}
                      className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                      Update Student Status
                    </button>
                  </div>
                ))}
        </div>
      ))}
    </>
  );
}
