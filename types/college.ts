export interface College {
  collegeId: number;
  collegeName: string;
}

export interface CreateCollegeRequest {
  collegeName: string;
}

export interface UpdateCollegeRequest {
  collegeName: string;
}
