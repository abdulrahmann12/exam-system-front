export interface Permission {
  permissionId: number;
  code: string;
  description?: string;
  active?: boolean;
  module?: string;
  action?: string;
}

export interface CreatePermissionRequest {
  module: string;
  action: string;
  description: string;
}

export interface UpdatePermissionRequest {
  module?: string;
  action?: string;
  description?: string;
  active?: boolean;
}
