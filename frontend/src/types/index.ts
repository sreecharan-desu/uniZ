// Interfaces
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
    mother_phonenumber: string;
    outings_list: Outing[];
    outpasses_list: Outpass[];
    profile_url?: string;
    created_at: string;
    updated_at: string;
}
