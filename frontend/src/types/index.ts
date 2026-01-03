// Interfaces

export interface Subject {
    id: string;
    name: string;
    credits: number;
}

export interface Semester {
    id: string;
    name: string;
    year: string;
}

export interface Grade {
    id: string;
    subjectId: string;
    grade: number;
    subject: Subject;
    semester: Semester;
}

export interface Attendance {
    id: string;
    subjectId: string;
    totalClasses: number;
    attendedClasses: number;
    subject: Subject;
    semester: Semester;
}

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

export interface Student {
    _id: string; // usually the username/id
    username: string;
    name: string;
    email: string;
    gender: string;
    year: string;
    branch: string;
    section: string;
    roomno: string;
    has_pending_requests: boolean;
    is_in_campus: boolean;
    
    // Academic
    grades: Grade[];
    attendance: Attendance[];
    
    // Personal
    blood_group: string;
    phone_number: string;
    date_of_birth: string;
    address?: string;

    // Parents
    father_name: string;
    father_phonenumber: string;
    father_email?: string;
    mother_name: string;
    mother_phonenumber: string;
    mother_email?: string;
    
    // History
    outings_list: Outing[];
    outpasses_list: Outpass[];
    
    profile_url?: string;
    
    created_at: string;
    updated_at: string;
}

export interface Faculty {
    id: string;
    Username: string;
    Name: string;
    Email: string;
    Department: string;
    Designation: string;
    Role: 'teacher' | 'hod';
    Contact: string;
    ProfileUrl?: string;
    subjects?: {
        subject: Subject
    }[];
}
