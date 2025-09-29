// AuthContext.jsx - Compatibility layer for the new authentication system.
// This file ensures that all existing components using `useAuth` will now use the new, unified `NewAuthContext`.

import { NewAuthProvider, useNewAuth } from './NewAuthContext';

// Export the NewAuthProvider as AuthProvider for app-wide usage in App.jsx
export const AuthProvider = NewAuthProvider;

// Export the useNewAuth hook as useAuth for compatibility with existing components
export const useAuth = useNewAuth;

// Default export for convenience
export default {
  AuthProvider,
  useAuth,
};
