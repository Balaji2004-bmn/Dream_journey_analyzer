import { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  UserCheck, 
  UserX, 
  Crown, 
  Ban, 
  Mail,
  AlertTriangle,
  Eye,
  MessageSquare,
  TrendingUp,
  Brain,
  Heart,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  EyeOff,
  FileText,
  Activity,
  PieChart,
  BarChart,
  Lock,
  Unlock,
  Flag,
  UserPlus
} from 'lucide-react';
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, session, loading: authLoading, checkAdminAccess } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [insights, setInsights] = useState(null);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [privacyStats, setPrivacyStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [consentedDreams, setConsentedDreams] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(null);

  // Helper: resolve first reachable admin base URL
  const getAdminBaseCandidates = () => [
    // Prefer dedicated admin server first (separate port)
    import.meta.env.VITE_ADMIN_BACKEND_URL,
    import.meta.env.VITE_BACKEND_URL,
    'http://localhost:3001',
  ].filter(Boolean);

  const chooseAdminBase = async (token) => {
    const headers = { 'Authorization': `Bearer ${token}` };
    for (const base of getAdminBaseCandidates()) {
      try {
        const ping = await fetch(`${base}/api/admin/users?page=1&limit=1`, { headers });
        if (ping.ok) return base;
      } catch (_) {
        // try next
      }
    }
    // As a last resort, return the first candidate; downstream fetches will error and be surfaced to the UI
    return getAdminBaseCandidates()[0] || 'http://localhost:3001';
  };

  // Helper: perform admin fetch, trying all bases and tokens to avoid CORS/preflight failures
  const fetchAdmin = async (path, init = {}) => {
    const tokens = [session?.access_token].filter(Boolean);
    if (import.meta.env.MODE !== 'production') tokens.push('demo-admin-token');

    const bases = getAdminBaseCandidates();
    let lastError = null;
    let lastResponse = null;

    for (const token of tokens) {
      for (const base of bases) {
        try {
          const headers = {
            ...(init.headers || {}),
            'Authorization': `Bearer ${token}`,
          };
          const res = await fetch(`${base}${path}`, { ...init, headers });
          if (res.ok) return res;
          // On 401/403 in dev, try the next token/base combination
          if ((res.status === 401 || res.status === 403) && import.meta.env.MODE !== 'production') {
            lastResponse = res;
            continue;
          }
          // Non-auth failure; keep to return after trying other bases
          lastResponse = res;
          continue;
        } catch (err) {
          lastError = err;
          // CORS/network failure: try next base
          continue;
        }
      }
    }
    if (lastResponse) return lastResponse;
    if (lastError) throw lastError;
    throw new Error('Admin request failed');
  };

  useEffect(() => {
    if (user) {
      verifyAdminAccess();
    }
  }, [user, session]);

  const verifyAdminAccess = async () => {
    setLoading(true);
    // Rely on the session object first, which is populated on sign-in
    if (session?.isAdmin) {
      setIsAdmin(true);
      fetchDashboardData();
      return;
    }

    // As a fallback, explicitly check with the backend
    const { isAdmin: hasAdminAccess, error } = await checkAdminAccess();
    if (hasAdminAccess) {
      setIsAdmin(true);
      fetchDashboardData();
    } else {
      console.warn('Admin access denied:', error);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    setDashboardError(null);
    try {
      const [usersRes, statsRes, flaggedRes, consentedRes, sentimentRes, auditRes] = await Promise.all([
        fetchAdmin('/api/admin/users?page=1&limit=50'),
        fetchAdmin('/api/admin/insights/stats'),
        fetchAdmin('/api/admin/content/dreams/flagged?status=pending'),
        fetchAdmin('/api/admin/content/dreams/consented?consent_type=research'),
        fetchAdmin('/api/admin/insights/sentiment?timeframe=30d'),
        fetchAdmin('/api/admin/content/audit/dream-access')
      ]);

      if (!usersRes.ok) throw new Error('Failed to fetch users');
      if (!statsRes.ok) throw new Error('Failed to fetch insights');
      // The following endpoints are optional in some setups; handle soft-fail
      const [usersData, insightsData] = await Promise.all([
        usersRes.json(),
        statsRes.json()
      ]);

      let flaggedData = { flagged_dreams: [] };
      try { flaggedData = await flaggedRes.json(); } catch(_) {}

      let consentedData = { dreams: [] };
      try { consentedData = await consentedRes.json(); } catch(_) {}

      let sentimentData = { sentiment: {} };
      try { sentimentData = await sentimentRes.json(); } catch(_) {}

      let auditData = { audit_logs: [] };
      try { auditData = await auditRes.json(); } catch(_) {}

      setUsers(usersData.users || []);
      setInsights(insightsData.stats);

      // Populate optional datasets with safe defaults
      setFlaggedContent(flaggedData.flagged_dreams || []);
      setConsentedDreams(consentedData.dreams || []);
      // Normalize sentiment into a simple emotion->count map for the UI
      const emotionPairs = (sentimentData?.sentiment?.top_emotions || []).map(e => [e.emotion, e.count]);
      setPrivacyStats({ sentiment: Object.fromEntries(emotionPairs) });
      const mappedAudit = (auditData.audit_logs || []).map(log => ({
        ...log,
        target_user: log.details?.path || 'N/A',
        ip_address: log.details?.ip || 'N/A'
      }));
      setAuditLogs(mappedAudit);
      setFeedback([]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
      setDashboardError(error.message);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      const token = session?.access_token || 'demo-admin-token';

      let endpoint = '';
      let method = 'PATCH';
      let body = {};

      switch (action) {
        case 'activate':
        case 'deactivate':
          endpoint = `/api/admin/users/${userId}/status`;
          body = { is_active: action === 'activate', reason: data.reason };
          break;
        case 'ban':
        case 'unban':
          endpoint = `/api/admin/users/${userId}/ban`;
          body = { 
            unban: action === 'unban',
            ban_duration_days: data.duration || 7,
            reason: data.reason 
          };
          break;
        case 'change_role':
          endpoint = `/api/admin/users/${userId}/role`;
          body = { role: data.role, reason: data.reason };
          break;
        case 'reset_password':
          endpoint = `/api/admin/users/${userId}/reset-password`;
          method = 'POST';
          body = {};
          break;
      }

      // Optimistic UI update
      setUsers(prev => prev.map(u => {
        if (u.id !== userId) return u;
        switch (action) {
          case 'activate':
            return { ...u, is_active: true };
          case 'deactivate':
            return { ...u, is_active: false };
          case 'ban': {
            const days = data.duration || 7;
            const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
            return { ...u, is_banned: true, banned_until: until };
          }
          case 'unban':
            return { ...u, is_banned: false, banned_until: null };
          case 'change_role':
            return { ...u, role: data.role };
          default:
            return u;
        }
      }));

      let response = await fetchAdmin(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(`User ${action} successful`);
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${action} user`);
        // Revert optimistic update on failure
        setUsers(prev => prev.map(u => {
          if (u.id !== userId) return u;
          // Force refetch to get true state
          return u;
        }));
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleContentReview = async (flagId, action, reason) => {
    try {
      const response = await fetchAdmin(`/api/admin/content/dreams/flagged/${flagId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });

      if (response.ok) {
        toast.success(`Content ${action} successful`);
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${action} content`);
      }
    } catch (error) {
      console.error(`Error reviewing content:`, error);
      toast.error('Failed to review content');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.display_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === 'all' || 
                         (userFilter === 'active' && user.is_active) ||
                         (userFilter === 'inactive' && !user.is_active) ||
                         (userFilter === 'banned' && user.is_banned) ||
                         (userFilter === 'admins' && ['admin', 'super_admin', 'moderator'].includes(user.role));
    return matchesSearch && matchesFilter;
  });

  // Auth guards
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading || authLoading) {
    return (
      <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-80 text-purple-600 dark:text-purple-400">
          <Shield className="w-6 h-6 animate-pulse" />
          Loading admin dashboard...
          <Settings className="w-6 h-6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have admin permissions to access this dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-background to-card dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-highlight">
              Admin Dashboard
            </h1>
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-xl text-muted-foreground">
            Manage users, monitor insights, and moderate content
          </p>
          {dashboardError && (
            <Card className="bg-red-500/10 border-red-500/30 text-red-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <p><strong>Error:</strong> {dashboardError}</p>
                </div>
                <Button onClick={() => fetchDashboardData()} variant="destructive" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Overview Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.users?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {insights.users?.confirmation_rate || 0}% confirmed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Dreams</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.dreams?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {insights.dreams?.public_rate || 0}% public
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">
                  Admin users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Online</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="insights">Analytics</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedback.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.subject}</p>
                          <p className="text-xs text-muted-foreground">{item.user_email}</p>
                        </div>
                        <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Popular Dream Themes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights?.keywords?.slice(0, 8).map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{keyword.keyword}</span>
                        <Badge variant="outline">{keyword.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search users by email or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                      <SelectItem value="admins">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={fetchDashboardData} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {/* Users Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 font-medium">User</th>
                          <th className="text-left p-3 font-medium">Role</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Dreams</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isRefreshing ? (
                          [...Array(5)].map((_, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-3" colSpan="5">
                                <div className="flex items-center space-x-4">
                                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                                  <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-8 text-muted-foreground">
                              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No users found matching your criteria.</p>
                            </td>
                          </tr>
                        ) : (filteredUsers.map((user) => (
                          <tr key={user.id} className="border-t">
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{user.display_name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant={user.role === 'user' ? 'secondary' : 'default'}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {user.is_active ? (
                                  <Badge variant="default" className="bg-green-500">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Inactive
                                  </Badge>
                                )}
                                {user.is_banned && (
                                  <Badge variant="destructive">
                                    <Ban className="w-3 h-3 mr-1" />
                                    Banned
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-3">{user.total_dreams}</td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                                      <Settings className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Manage User: {user.display_name}</DialogTitle>
                                      <DialogDescription>
                                        Perform administrative actions on this user account
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-2">
                                        <Button
                                          onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                                          variant={user.is_active ? 'destructive' : 'default'}
                                        >
                                          {user.is_active ? <UserX className="w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                                          {user.is_active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button
                                          onClick={() => handleUserAction(user.id, user.is_banned ? 'unban' : 'ban', { duration: 7, reason: 'Policy violation' })}
                                          variant={user.is_banned ? 'default' : 'destructive'}
                                        >
                                          <Ban className="w-4 h-4 mr-2" />
                                          {user.is_banned ? 'Unban' : 'Ban'}
                                        </Button>
                                        <Button
                                          onClick={() => handleUserAction(user.id, 'reset_password')}
                                          variant="outline"
                                        >
                                          <Mail className="w-4 h-4 mr-2" />
                                          Reset Password
                                        </Button>
                                        <Button
                                          onClick={() => handleUserAction(user.id, 'change_role', { role: user.role === 'user' ? 'moderator' : 'user' })}
                                          variant="outline"
                                        >
                                          <Crown className="w-4 h-4 mr-2" />
                                          Change Role
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </td>
                          </tr>
                        )))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Content Moderation
                </CardTitle>
                <CardDescription>
                  Review flagged content and manage user reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flaggedContent.map((flag) => (
                    <div key={flag.flag_id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{flag.dream_title}</h4>
                          <p className="text-sm text-muted-foreground">by {flag.user_display_name}</p>
                        </div>
                        <Badge variant="destructive">{flag.flag_reason.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm bg-muted/50 p-3 rounded">{flag.dream_content}</p>
                      {flag.flag_description && (
                        <p className="text-sm"><strong>Report reason:</strong> {flag.flag_description}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleContentReview(flag.flag_id, 'approve', 'Content approved after review')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleContentReview(flag.flag_id, 'remove', 'Content removed for policy violation')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContentReview(flag.flag_id, 'warn', 'User warned about content policy')}
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Warn User
                        </Button>
                      </div>
                    </div>
                  ))}
                  {isRefreshing ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                      <p>Loading content...</p>
                    </div>
                  ) : flaggedContent.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-500" />
                      <p>No flagged content to review. All clear!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aggregated Dream Themes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Popular Dream Themes
                  </CardTitle>
                  <CardDescription>
                    🔒 Aggregated data - no individual dreams exposed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights?.keywords?.slice(0, 10).map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm font-medium">{keyword.keyword}</span>
                        <Badge variant="outline">{keyword.count} dreams</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Sentiment Trends
                  </CardTitle>
                  <CardDescription>
                    🔒 Anonymized emotional patterns across all users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {privacyStats?.sentiment && (
                    <div className="space-y-3">
                      {Object.entries(privacyStats.sentiment).map(([emotion, count]) => (
                        <div key={emotion} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{emotion}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{width: `${(count / Math.max(...Object.values(privacyStats.sentiment))) * 100}%`}}
                              />
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Demographics (Anonymized) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Platform Demographics
                  </CardTitle>
                  <CardDescription>
                    🔒 Anonymized user statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {insights && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Active Users</span>
                        <Badge variant="outline">{insights.users?.confirmed || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Dream Sharing Rate</span>
                        <Badge variant="outline">{insights.dreams?.public_rate || 0}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Privacy-Conscious Users</span>
                        <Badge variant="outline">{100 - (insights.dreams?.public_rate || 0)}%</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Usage Patterns
                  </CardTitle>
                  <CardDescription>
                    🔒 Platform-wide trends (no personal data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Dreams Analyzed</span>
                      <Badge variant="outline">{insights?.dreams?.total || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Public Dreams</span>
                      <Badge variant="outline">{insights?.dreams?.public || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Research Consented</span>
                      <Badge variant="outline">{consentedDreams.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Dashboard */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Privacy Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Privacy Safeguards
                  </CardTitle>
                  <CardDescription>
                    Admin access boundaries and user privacy protection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Active Protections</span>
                    </div>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Only basic user info visible (no private dreams)</li>
                      <li>• All data aggregated and anonymized</li>
                      <li>• Dream access requires explicit user consent</li>
                      <li>• All admin actions are logged and auditable</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <EyeOff className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Private Dreams</p>
                      <p className="text-xs text-muted-foreground">Never accessible</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium">User Control</p>
                      <p className="text-xs text-muted-foreground">Always maintained</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Consented Research Dreams */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Unlock className="w-5 h-5" />
                    Research Consented Dreams
                  </CardTitle>
                  <CardDescription>
                    Dreams users have explicitly shared for research
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {consentedDreams.map((dream) => (
                      <div key={dream.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{dream.title}</span>
                          <Badge variant="outline">Consented</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          User: {dream.user_email} • {new Date(dream.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm bg-muted/50 p-2 rounded">{dream.content.substring(0, 100)}...</p>
                      </div>
                    ))}
                    {consentedDreams.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No dreams consented for research</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Trail */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Admin Action Audit Trail
                </CardTitle>
                <CardDescription>
                  Transparent log of all administrative actions for accountability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{log.action.replace('_', ' ')}</span>
                        </div>
                        <Badge variant="outline">{new Date(log.timestamp).toLocaleString()}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Admin:</strong> {log.admin_email}</p>
                        <p><strong>Target:</strong> {log.target_user || log.target_content || 'System'}</p>
                        {log.reason && <p><strong>Reason:</strong> {log.reason}</p>}
                        <p><strong>IP:</strong> {log.ip_address}</p>
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No admin actions logged yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
