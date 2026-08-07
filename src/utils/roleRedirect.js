import { ROUTES } from '../constants/routes.js';
import { USER_ROLES } from '../constants/userRoles.js';

export function getHomeRouteByRole(role) {
  if (role === USER_ROLES.VETERINARIAN) return ROUTES.VET.DASHBOARD;
  if (role === USER_ROLES.ADMIN) return ROUTES.ADMIN.VETERINARIANS;
  return ROUTES.CLIENT.PETS;
}
