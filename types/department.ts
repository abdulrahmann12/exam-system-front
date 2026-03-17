export interface Department {
  departmentId: number;
  departmentName: string;
  collegeId?: number;
  collegeName?: string;
}

export interface CreateDepartmentRequest {
  departmentName: string;
  collegeId: number;
}

export interface UpdateDepartmentRequest {
  departmentName: string;
  collegeId: number;
}
