import { useAppSelector } from '../app/hooks';
import { UserRole } from '../types';

export const usePermissions = () => {
    const user = useAppSelector((state) => state.auth.user);
    const role = user?.role;

    return {
        // Only OWNER can delete
        canDelete: role === UserRole.OWNER,

        // OWNER and MANAGER can create/edit
        canCreateEdit: role === UserRole.OWNER || role === UserRole.MANAGER,

        // OWNER and MANAGER can manage (general management tasks)
        canManage: role === UserRole.OWNER || role === UserRole.MANAGER,

        // Role checks
        isStaff: role === UserRole.STAFF,
        isManager: role === UserRole.MANAGER,
        isOwner: role === UserRole.OWNER,

        // Raw role value
        role,
    };
};
