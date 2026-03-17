export interface StudentRegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  collegeId: number;
  departmentId: number;
  studentCode: string;
  academicYear: number;
}

export interface StudentProfile {
  studentId: number;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  studentCode: string;
  academicYear: number;
  isActive: boolean;
  collegeId?: number;
  departmentId?: number;
  collegeName?: string;
  departmentName?: string;
}

export interface UpdateStudentProfileRequest {
  studentCode?: string;
  academicYear?: number;
}
