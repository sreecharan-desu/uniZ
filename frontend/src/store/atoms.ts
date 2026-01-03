import { atom } from "recoil";
import { Student } from "../types";

export const is_authenticated = atom({
    key : 'is_authenticated',
    default : {
        is_authnticated : false,
        type : ''
    }
})

export const adminUsername = atom<string | null>({
    key: 'adminUsername',
    default: null
});

export const outpasses = atom({
    key : 'outpassess',
    default : [{       
        username : '',
        email : '',     
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
        _id: ""}]
})

export const outings = atom({
    key : 'outings',
    default : [{
        username : '',
        email : '',  
        from_time: '',
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
        _id: ""
    }]
})

export const offCampus = atom({
    key : 'offCampus',
    default :[
    {
        name : 'SreeCharan',
        gender : 'M',
        email: "",
        has_pending_requests: false,
        is_in_campus: false,
        outings_list: [{
            from_time: '',
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
            _id: ""
        }],
        outpasses_list: [{            from_day: '',
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
            _id: ""}],
        username: "",
        _id: ""
    }
]
}) 

export const student = atom<Student>({
  key: 'Student',
  default: {
    _id: '',
    username: '',
    name: '',
    email: '',
    gender: '',
    year: '',
    branch: '',
    section: '',
    roomno: '',
    has_pending_requests: false,
    is_in_campus: true,
    grades: [],
    attendance: [],
    blood_group: '',
    phone_number: '',
    date_of_birth: '',
    father_name: '',
    father_phonenumber: '',
    mother_name: '',
    mother_phonenumber: '',
    outings_list: [],
    outpasses_list: [],
    profile_url: '',
    created_at: '',
    updated_at: '',
  },
});

export const bannersAtom = atom({
    key: 'bannersAtom',
    default: {
        fetched: false,
        data: [] as any[]
    }
});
