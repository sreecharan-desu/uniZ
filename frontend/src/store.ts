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

export const student = atom({
    key : 'Student',
    default : {
        _id: "",
        username: "",
        email: "",
        has_pending_requests: false,
        name : "",
        gender : "",
        is_in_campus: true,
        outings_list:[{
            email : "",
            username : "",
            from_time: "",
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
        outpasses_list:[{
            from_day: "",
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
            _id: ""
        }],
    }
})


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