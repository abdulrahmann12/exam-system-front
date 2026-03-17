export interface Role {
  roleId: number;
  roleName: string;
  permissionIds?: number[];
  permissions?: { permissionId: number; code: string }[];
}

export interface CreateRoleRequest {
  roleName: string;
  permissionIds: number[];
}

export interface UpdateRoleRequest {
  roleName: string;
  permissionIds: number[];
}
