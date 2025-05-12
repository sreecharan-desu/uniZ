import { atom } from "recoil";



export const is_authenticated = atom({
    key : 'is_authenticated',
    default : {
        is_authnticated : false,
        type : ''
    }
})


// interface studentProps {
//     _id: string,
//     username: string,
//     email: string,
//     has_pending_requests: false,
//     name : string,
//     gender : string,
//     is_in_campus: true,
//     outings_list:[{
//         from_time: string,
//         in_time: string,
//         is_approved: true,
//         is_expired:true,
//         is_rejected: false,
//         issued_by: string,
//         issued_time: string,
//         message: string,
//         no_of_days : number,
//         reason:string,
//         rejected_by : string,
//         rejected_time:string,
//         requested_time : string,
//         student_id : string,
//         to_time:string,
//         _id: string
//     }],
//     outpasses_list:[{
//         from_day: string,
//         in_time: string,
//         is_approved: true,
//         is_expired:true,
//         is_rejected: false,
//         issued_by: string,
//         issued_time: string,
//         message: string,
//         no_of_days : number,
//         reason:string,
//         rejected_by : string,
//         rejected_time:string,
//         requested_time : string,
//         student_id : string,
//         to_day:string,
//         _id: string
//     }],
// }




export const Admin = atom({
    key : 'Admin',
    default : {
        Username : '',
    }
})



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


export interface Outing {
  _id: string;
  from_time: string;
  to_time: string;
  in_time: string;
  reason: string;
  requested_time: string;
  is_approved: boolean;
  is_rejected: boolean;
  is_expired: boolean;
  issued_by?: string;
  issued_time?: string;
  rejected_by?: string;
  rejected_time?: string;
  message?: string;
  no_of_days: number;
}

export interface Outpass {
  _id: string;
  from_day: string;
  to_day: string;
  in_time: string;
  reason: string;
  requested_time: string;
  is_approved: boolean;
  is_rejected: boolean;
  is_expired: boolean;
  issued_by?: string;
  issued_time?: string;
  rejected_by?: string;
  rejected_time?: string;
  message?: string;
  no_of_days: number;
}

export interface Grade {
  subject: string;
  credits: number;
  grade: number;
  semester: string;
}

export interface Student {
  mother_phonenumber: string;
  _id: string;
  username: string;
  name: string;
  email: string;
  gender: string;
  year: string;
  branch: string;
  has_pending_requests: boolean;
  is_in_campus: boolean;
  grades: Grade[];
  blood_group: string;
  phone_number: string;
  date_of_birth: string;
  father_name: string;
  father_phonenumber: string;
  mother_name: string;
  outings_list: Outing[];
  outpasses_list: Outpass[];
  created_at: string;
  updated_at: string;
}

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
    has_pending_requests: false,
    is_in_campus: true,
    grades: [],
    blood_group: '',
    phone_number: '',
    date_of_birth: '',
    father_name: '',
    father_phonenumber: '',
    mother_name: '',
    mother_phonenumber: '',
    outings_list: [],
    outpasses_list: [],
    created_at: '',
    updated_at: '',
  },
});