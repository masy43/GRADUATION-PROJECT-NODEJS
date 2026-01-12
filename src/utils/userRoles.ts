export const userRoles = {
  ADMIN: "ADMIN",
  USER: "USER",
  PRODUCT_MANAGER: "PRODUCT_MANAGER",
} as const;

export type UserRole = (typeof userRoles)[keyof typeof userRoles];

export default userRoles;
