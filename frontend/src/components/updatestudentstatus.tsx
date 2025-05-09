/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRecoilValue } from "recoil";
import { useOutsideCampus } from "../customhooks/outsidecampus";
import { offCampus } from "../store";
import { UPDATE_STUDENT_STATUS } from "../apis";
import { Button } from "./button";
import { useState, useEffect } from "react";
import { useIsAuth } from "../customhooks/is_authenticated";
import { toast } from "react-toastify";

// Add a skeleton component at the top
const StudentCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md p-6 space-y-4 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="bg-gray-300 w-12 h-12 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="h-8 bg-gray-300 rounded"></div>
      <div className="h-8 bg-gray-300 rounded"></div>
    </div>
  </div>
);

export default function UpdateStatus() {
  useIsAuth();
  useOutsideCampus();
  const students = useRecoilValue(offCampus);
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
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

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
      toast(data.msg);
      setLoading(false);
      location.href="";
      // Fetch updated student list
      // const res2 = await fetch(STUDENT_OUTSIDE_CAMPUS, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${JSON.parse(token)}`,
      //   },
      // });
      // const data2 = await res2.json();
      // setOffCampus(data2.students);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Students Outside Campus
          </h1>
          <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
            {students ? students.length : '0'} Students
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4 md:mt-0 z-0">
          <input
            type="text"
            placeholder="Search by ID number..."
            className="w-80 h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-300"
            onChange={onChangeHandler}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Display skeletons while loading
          Array.from({ length: 6 }).map((_, index) => (
            <StudentCardSkeleton key={index} />
          ))
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div 
              key={student.username} 
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden
                ${selectedStudent === student._id ? 'ring-2 ring-gray-500 transform scale-[1.02]' : ''}`}
              onClick={() => setSelectedStudent(student._id)}
            >
              {/* Student Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-b from-gray-700 to-gray-900 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{student.name}</h3>
                    <p className="text-gray-500 text-sm">{student.username}</p>
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500">Gender</p>
                    <p className="font-medium capitalize">{student.gender}</p>
                  </div>
                </div>

                {/* Active Requests Section */}
                {student.outings_list.filter(outing => !outing.is_expired && outing.is_approved).length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-700 mb-4">Active Outing</h4>
                    {student.outings_list
                      .filter(outing => !outing.is_expired && outing.is_approved)
                      .map(outing => (
                        <div key={outing._id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">From</span>
                            <span className="font-medium">{outing.from_time}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">To</span>
                            <span className="font-medium">{outing.to_time}</span>
                          </div>
                          <p className="text-sm text-gray-600 italic">Reason : "{outing.reason}"</p>
                          <Button
                            onclickFunction={() => updateStatus(student._id, outing._id)}
                            value="Update Status"
                            loading={loading}
                          />
                        </div>
                    ))}
                  </div>
                )}

                {/* Outpass Section */}
                {student.outpasses_list.filter(outpass => !outpass.is_expired && outpass.is_approved).length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-700 mb-4">Active Outpass</h4>
                    {student.outpasses_list
                      .filter(outpass => !outpass.is_expired && outpass.is_approved)
                      .map(outpass => (
                        <div key={outpass._id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">From</span>
                            <span className="font-medium">{outpass.from_day}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">To</span>
                            <span className="font-medium">{outpass.to_day}</span>
                          </div>
                          <p className="text-sm text-gray-600 italic">Reason : "{outpass.reason}"</p>
                          <Button
                            onclickFunction={() => updateStatus(student._id, outpass._id)}
                            value="Update Status"
                            loading={loading}
                          />
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="w-48 h-48 mb-8">
              <svg className="w-full h-full text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M11 6C13.7614 6 16 8.23858 16 11M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path d="M12 8V14M9 11H15" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-gray-700">No Students Found</h3>
              <p className="text-lg text-gray-500 max-w-md">
                {searchQuery ? (
                  <>
                    No matches found for <span className="font-medium bg-gray-100 px-2 py-1 rounded-md">"{searchQuery}"</span>
                  </>
                ) : (
                  "Looks like everyone's back on campus! 🎉"
                )}
              </p>
              <p className="text-sm text-gray-400">
                Try adjusting your search or check back later
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
