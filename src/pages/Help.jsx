import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  Book, 
  Shield, 
  Heart,
  Brain,
  Video,
  Users,
  Settings,
  Lock,
  Eye,
  Download,
  Trash2,
  Star
} from 'lucide-react';

export default function Help() {
  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-background to-card dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <HelpCircle className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-highlight">
              Help Center
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Get help with Dream Journey Analyzer
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get personalized help from our team</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full" onClick={() => window.open('mailto:bmn636169@gmail.com?subject=Dream Journey Analyzer Support', '_blank')}>
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Book className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <CardTitle>User Guide</CardTitle>
              <CardDescription>Learn how to use all features</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                <Book className="w-4 h-4 mr-2" />
                Read Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <MessageSquare className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <CardTitle>FAQ</CardTitle>
              <CardDescription>Find answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                View FAQ
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Help Sections */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Feature Guides</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dream Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Dream Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline">1</Badge>
                  <p className="text-sm">Enter your dream description in detail</p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">2</Badge>
                  <p className="text-sm">Choose privacy settings (public/private)</p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">3</Badge>
                  <p className="text-sm">Get AI-powered insights and interpretations</p>
                </div>
              </CardContent>
            </Card>

            {/* Video Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-500" />
                  Video Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline">1</Badge>
                  <p className="text-sm">Analyze your dream first</p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">2</Badge>
                  <p className="text-sm">Click "Generate Video" button</p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">3</Badge>
                  <p className="text-sm">Wait for AI to create your dream video</p>
                </div>
              </CardContent>
            </Card>

            {/* Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  Dream Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline">View</Badge>
                  <p className="text-sm">Browse public dreams from community</p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">Like</Badge>
                  <p className="text-sm">Show appreciation for dreams you enjoy</p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">Share</Badge>
                  <p className="text-sm">Email dreams to friends (owners only)</p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">Private dreams require email verification to view</p>
                </div>
                <div className="flex items-start gap-3">
                  <Trash2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">You can delete your dreams anytime</p>
                </div>
                <div className="flex items-start gap-3">
                  <Settings className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">Control your data and privacy settings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Email verification not working?</h4>
              <p className="text-sm text-muted-foreground">Check your spam folder and ensure you're using the correct email address.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Video generation taking too long?</h4>
              <p className="text-sm text-muted-foreground">AI video generation can take 2-5 minutes. Please be patient.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Can't access private dreams?</h4>
              <p className="text-sm text-muted-foreground">Private dreams require email verification. Check your email for the verification code.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Forgot your password?</h4>
              <p className="text-sm text-muted-foreground">Use the "Forgot Password" link on the login page to reset it.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Still Need Help?
            </CardTitle>
            <CardDescription>
              Our support team is here to help you with any questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => window.open('mailto:bmn636169@gmail.com?subject=Dream Journey Analyzer Support', '_blank')}>
              <Mail className="w-4 h-4 mr-2" />
              Contact Support Team
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
