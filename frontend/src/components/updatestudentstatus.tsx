/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRecoilState } from "recoil";
import { useOutsideCampus } from "../customhooks/outsidecampus";
import { offCampus } from "../store";
import { STUDENT_OUTSIDE_CAMPUS, UPDATE_STUDENT_STATUS } from "../apis";
import { Button } from "./button";
import { useState, useEffect } from "react";

export function UpdateStatus() {
  useOutsideCampus();
  const [students, setOffCampus] = useRecoilState(offCampus);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([{_id :'',username : '',name : '',email : '',gender : '',is_in_campus : false,outings_list : [{        from_time: '',
    in_time: "",
    is_approved: true,
    is_expired:true,
    is_rejected: false,
    issued_by: "",
    issued_time: "",
    message: "",
    no_of_days : 0,
    reason:"",
    rejected_by : "",
    rejected_time:"",
    requested_time : "",
    student_id : "",
    to_time:"",
    _id: ""}],outpasses_list : [{  
      from_day: '',
      in_time: "",
      is_approved: true,
      is_expired:true,
      is_rejected: false,
      issued_by: "",
      issued_time: "",
      message: "",
      no_of_days : 0,
      reason:"",
      rejected_by : "",
      rejected_time:"",
      requested_time : "",
      student_id : "",
      to_day:"",
      _id: ""}]}]);
  const [loading, setLoading] = useState(false);

  // Fetch students based on search input
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = students.filter(student => student.username.includes(searchQuery));
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const onChangeHandler = (event: any) => {
    setSearchQuery(event.target.value);
  };

  const updateStatus = async (userId: string, id: string) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setLoading(true);
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
      alert(data.msg);
      setLoading(false);
      
      // Fetch updated student list
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
      <h1 className="text-xl font-bold mb-4">Search students by Id number</h1>
      <div className="flex justify-center items-center">
        <div className="relative inline-block">
          <input
            type="text"
            placeholder="Search..."
            className="w-72 h-10 pl-4 pr-10 border-2 border-gray-300 rounded-full text-lg transition-colors duration-300 ease-in-out"
            onChange={onChangeHandler}
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 border-none bg-transparent cursor-pointer"
            onClick={() => setSearchQuery(searchQuery)}
          >
            🔍
          </button>
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        filteredStudents.map((student) => (
          <div key={student.username} className="m-5 p-5 bg-gray-100 shadow-lg rounded-lg max-w-full font-sans">
            <div className="m-2"><b>Name:</b> {student.name}</div>
            <div className="m-2"><b>Email:</b> {student.email}</div>
            <div className="m-2"><b>Id Number:</b> {student.username}</div>
            <div className="m-2"><b>Gender:</b> {student.gender}</div>
            <div className="m-2"><b>Present in Campus:</b> {student.is_in_campus ? "Yes" : "No"}</div>

            {/* Outing details */}
            {student.outings_list.filter(outing => !outing.is_expired && outing.is_approved).length > 0 ? (
              student.outings_list.reverse().filter(outing => !outing.is_expired && outing.is_approved).map(outing => (
                <div key={outing._id} className="mt-5 p-4 border border-gray-300 rounded-lg bg-white">
                  <div><b>Went on:</b> {outing.from_time}</div>
                  <div><b>Requested timings:</b> {outing.from_time} to {outing.to_time}</div>
                  <div><b>Reason:</b> {outing.reason}</div>
                  <div><b>Approved by:</b> {outing.issued_by}</div>
                  <div><b>Approved at:</b> {outing.issued_time.split(",")[0]}</div>
                  <div className="m-3">
                    <Button
                      onclickFunction={() => updateStatus(student._id, outing._id)}
                      value="Update Student Status"
                      loading={loading}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No active outings found.</p>
            )}
          </div>
        ))
      ) : (
        <p className="text-center m-5">
          Found 0 results for ID number <b className="bg-gray-300 rounded">`{searchQuery}`</b>
        </p>
      )}
    </>
  );
}
