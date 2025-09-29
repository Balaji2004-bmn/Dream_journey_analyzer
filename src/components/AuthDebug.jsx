// import { useAuth } from '@/contexts/AuthContext';

// export default function AuthDebug() {
//   const { user, session, checkAdminAccess } = useAuth();

//   const handleCheckAdmin = async () => {
//     const result = await checkAdminAccess();
//     console.log('Admin check result:', result);
//     alert(`Admin Access: ${result.isAdmin ? 'GRANTED' : 'DENIED'}\nReason: ${result.error || 'Success'}`);
//   };

//   const handleClearAuth = () => {
//     localStorage.removeItem('dreamjourney_user');
//     localStorage.removeItem('dreamjourney_session');
//     localStorage.removeItem('dreamjourney_users');
//     window.location.reload();
//   };

//   return (
//     <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm z-50">
//       <h3 className="font-bold mb-2 text-green-600">🔧 Auth Debug</h3>
//       <div className="text-sm space-y-1">
//         <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
//         <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
//         <p><strong>Is Admin:</strong> {user?.isAdmin ? '✅ Yes' : '❌ No'}</p>
//         <p><strong>Email Confirmed:</strong> {user?.emailConfirmed ? '✅ Yes' : '❌ No'}</p>
//         <p><strong>Session Token:</strong> {session?.access_token ? '✅ Present' : '❌ None'}</p>
//         <p><strong>Token Type:</strong> {session?.access_token?.includes('demo') ? '🎭 Demo' : '🔐 Real'}</p>
//         <div className="flex gap-1 mt-2">
//           <button 
//             onClick={handleCheckAdmin}
//             className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
//           >
//             Test Admin
//           </button>
//           <button 
//             onClick={handleClearAuth}
//             className="px-2 py-1 bg-red-500 text-white rounded text-xs"
//           >
//             Clear Auth
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
