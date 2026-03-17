export interface Subject {
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  departmentId?: number;
  collegeId?: number;
  departmentName?: string;
  collegeName?: string;
}

export interface CreateSubjectRequest {
  subjectName: string;
  subjectCode: string;
  departmentId: number;
  collegeId: number;
}

export interface UpdateSubjectRequest extends CreateSubjectRequest {}
