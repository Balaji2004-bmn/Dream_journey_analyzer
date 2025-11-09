import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  HelpCircle, 
  MessageSquare, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Bug,
  Lightbulb,
  Settings,
  User,
  FileText,
  RefreshCw
} from 'lucide-react';
import { toast } from "sonner";

export default function HelpCenter() {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState('submit');
  const [feedbackForm, setFeedbackForm] = useState({
    type: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'history') {
      fetchMyFeedback();
    }
  }, [user, activeTab]);

  const fetchMyFeedback = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com/api';
      const response = await fetch(`${backendUrl}/help/feedback/my`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyFeedback(data.feedback || []);
      } else {
        toast.error('Failed to load feedback history');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to submit feedback');
      return;
    }

    if (!feedbackForm.type || !feedbackForm.subject || !feedbackForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com/api';
      const response = await fetch(`${backendUrl}/help/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(feedbackForm)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Feedback submitted successfully! We\'ll get back to you soon.');
        setFeedbackForm({
          type: '',
          subject: '',
          message: '',
          priority: 'medium'
        });
        
        // Refresh feedback history if on that tab
        if (activeTab === 'history') {
          fetchMyFeedback();
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportContent = async (dreamId, reason, description) => {
    if (!user) {
      toast.error('Please sign in to report content');
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com/api';
      const response = await fetch(`${backendUrl}/help/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          dream_id: dreamId,
          reason,
          description
        })
      });

      if (response.ok) {
        toast.success('Content reported successfully. Our team will review it shortly.');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to report content');
      }
    } catch (error) {
      console.error('Error reporting content:', error);
      toast.error('Failed to report content');
    }
  };

  const feedbackTypes = [
    { value: 'bug_report', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
    { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-500' },
    { value: 'general_feedback', label: 'General Feedback', icon: MessageSquare, color: 'text-blue-500' },
    { value: 'technical_support', label: 'Technical Support', icon: Settings, color: 'text-purple-500' },
    { value: 'account_issue', label: 'Account Issue', icon: User, color: 'text-green-500' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-primary';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Help Center
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Get help, report issues, or share feedback with our team
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={activeTab === 'submit' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('submit')}
            className="rounded-md"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className="rounded-md"
          >
            <FileText className="w-4 h-4 mr-2" />
            My Feedback
          </Button>
        </div>
      </div>

      {/* Submit Feedback Tab */}
      {activeTab === 'submit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Submit Feedback or Report Issue
            </CardTitle>
            <CardDescription>
              Help us improve Dream Journey Analyzer by sharing your feedback or reporting issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              {/* Feedback Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type of Feedback *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {feedbackTypes.map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={feedbackForm.type === type.value ? 'default' : 'outline'}
                      onClick={() => setFeedbackForm(prev => ({ ...prev, type: type.value }))}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <type.icon className={`w-6 h-6 ${type.color}`} />
                      <span className="text-sm">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject *</label>
                <Input
                  placeholder="Brief description of your feedback or issue"
                  value={feedbackForm.subject}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={feedbackForm.priority}
                  onValueChange={(value) => setFeedbackForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low - General feedback</SelectItem>
                    <SelectItem value="medium">🟡 Medium - Minor issue</SelectItem>
                    <SelectItem value="high">🟠 High - Significant problem</SelectItem>
                    <SelectItem value="urgent">🔴 Urgent - Critical issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Detailed Description *</label>
                <Textarea
                  placeholder="Please provide as much detail as possible about your feedback or issue. Include steps to reproduce if reporting a bug."
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || !user}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>

              {!user && (
                <p className="text-sm text-muted-foreground text-center">
                  Please sign in to submit feedback
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Feedback History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  My Feedback History
                </CardTitle>
                <CardDescription>
                  Track the status of your submitted feedback and responses
                </CardDescription>
              </div>
              <Button onClick={fetchMyFeedback} variant="outline" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading feedback history...
              </div>
            ) : myFeedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No feedback submitted yet</p>
                <p className="text-sm">Submit your first feedback to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myFeedback.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{feedback.subject}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {feedback.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={`text-xs text-white ${getPriorityColor(feedback.priority)}`}>
                            {feedback.priority}
                          </Badge>
                          <Badge className={`text-xs text-white ${getStatusColor(feedback.status)}`}>
                            {feedback.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded text-sm">
                      {feedback.message}
                    </div>

                    {feedback.admin_response && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Admin Response
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(feedback.responded_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {feedback.admin_response}
                        </p>
                      </div>
                    )}

                    {feedback.status === 'open' && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Waiting for admin response...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <span>Report Inappropriate Content</span>
                  <span className="text-xs text-muted-foreground">Flag content that violates our policies</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Content</DialogTitle>
                  <DialogDescription>
                    Help us maintain a safe community by reporting inappropriate content
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To report specific content, please use the report button on the dream card in the Gallery.
                    This helps us identify the exact content you're concerned about.
                  </p>
                  <Button
                    onClick={() => setActiveTab('submit')}
                    className="w-full"
                  >
                    Submit General Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => {
                setActiveTab('submit');
                setFeedbackForm(prev => ({ ...prev, type: 'feature_request' }));
              }}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <span>Suggest a Feature</span>
              <span className="text-xs text-muted-foreground">Share your ideas for improvements</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
