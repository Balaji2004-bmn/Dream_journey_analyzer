import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Database, 
  Mail, 
  Trash2, 
  Download, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Globe,
  Server,
  Key
} from 'lucide-react';

export default function Privacy() {
  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Your privacy and data protection are our top priorities
          </p>
          <Badge variant="outline" className="text-sm">
            Last updated: September 2025
          </Badge>
        </div>

        {/* Privacy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Lock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Secure by Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                End-to-end encryption and secure data handling
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <EyeOff className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Private by Default</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your dreams are private unless you choose to share
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <UserCheck className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <CardTitle className="text-lg">You Control Your Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Full control over your personal information
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              What Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Account Information</h4>
                  <p className="text-sm text-muted-foreground">Email address, display name, and authentication data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Dream Content</h4>
                  <p className="text-sm text-muted-foreground">Dream descriptions, analysis results, and generated videos (only if you choose to save them)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Usage Analytics</h4>
                  <p className="text-sm text-muted-foreground">Anonymized usage patterns to improve our service (no personal dream content)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Your Privacy Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-sm">Private Dreams</h4>
                    <p className="text-xs text-muted-foreground">Only you can access with email verification</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-green-500" />
                  <div>
                    <h4 className="font-medium text-sm">Public Dreams</h4>
                    <p className="text-xs text-muted-foreground">Visible in community gallery (your choice)</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <div>
                    <h4 className="font-medium text-sm">Delete Anytime</h4>
                    <p className="text-xs text-muted-foreground">Permanently remove your dreams and data</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-purple-500" />
                  <div>
                    <h4 className="font-medium text-sm">Export Data</h4>
                    <p className="text-xs text-muted-foreground">Download all your personal data</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              How We Protect Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Encryption</h4>
                  <p className="text-sm text-muted-foreground">All data encrypted in transit and at rest using industry-standard protocols</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Secure Infrastructure</h4>
                  <p className="text-sm text-muted-foreground">Hosted on secure, compliant cloud infrastructure with regular security audits</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Access Controls</h4>
                  <p className="text-sm text-muted-foreground">Strict access controls and authentication for all user data</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third Party Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Third-Party Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">AI Analysis Services</h4>
                <p className="text-sm text-muted-foreground">We use OpenAI's API for dream analysis. Your dreams are processed securely and not stored by OpenAI.</p>
              </div>
              <div>
                <h4 className="font-medium">Video Generation</h4>
                <p className="text-sm text-muted-foreground">Video generation uses RunwayML API. Video prompts are processed but not permanently stored by the service.</p>
              </div>
              <div>
                <h4 className="font-medium">Email Services</h4>
                <p className="text-sm text-muted-foreground">We use secure email services for verification codes and notifications. No dream content is included in emails.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Your Rights (GDPR Compliant)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge variant="outline">Right to Access</Badge>
                <p className="text-sm text-muted-foreground">View all personal data we have about you</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Right to Rectification</Badge>
                <p className="text-sm text-muted-foreground">Correct any inaccurate personal data</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Right to Erasure</Badge>
                <p className="text-sm text-muted-foreground">Delete your account and all associated data</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Right to Portability</Badge>
                <p className="text-sm text-muted-foreground">Export your data in a machine-readable format</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Privacy Questions?
            </CardTitle>
            <CardDescription>
              Contact our privacy team for any questions about your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><strong>Email:</strong> privacy@dreamjourney.com</p>
              <p className="text-sm"><strong>Response Time:</strong> Within 48 hours</p>
              <p className="text-sm text-muted-foreground">
                We're committed to transparency and will always respond to your privacy concerns promptly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-5 h-5" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This privacy policy may be updated from time to time. We will notify you of any significant changes 
              via email or through the application. Your continued use of the service after changes constitutes 
              acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
