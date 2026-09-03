import { useAuth } from '../context/AuthContext';

// Usage: <RoleGate allowedRoles={['ADMIN', 'FACULTY']}><DeleteButton /></RoleGate>
function RoleGate({ allowedRoles, children }) {
  const { user } = useAuth();

  // If no user, or user's role is not in the allowed list, render nothing
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  // Otherwise, render the children (buttons, links, etc.)
  return children;
}

export default RoleGate;