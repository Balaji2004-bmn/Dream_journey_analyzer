import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Scale, 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Mail,
  Gavel,
  UserX,
  CreditCard,
  Eye
} from 'lucide-react';

export default function Terms() {
  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-background to-card dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-highlight">
              Terms of Service
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Please read these terms carefully before using Dream Journey Analyzer
          </p>
          <Badge variant="outline" className="text-sm">
            Last updated: September 2025
          </Badge>
        </div>

        {/* Terms Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Scale className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Fair Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Respectful use of our AI-powered dream analysis service
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Maintain a positive and supportive community environment
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Clear understanding of your rights and responsibilities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Acceptance of Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By accessing and using Dream Journey Analyzer, you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Account Creation</h4>
                  <p className="text-sm text-muted-foreground">You must be 13 years or older to create an account</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Accurate Information</h4>
                  <p className="text-sm text-muted-foreground">You agree to provide accurate and complete information</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Service Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Dream Journey Analyzer is an AI-powered platform that provides dream analysis, interpretation, 
              and video generation services based on your dream descriptions.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">AI Dream Analysis</h4>
                  <p className="text-sm text-muted-foreground">Automated analysis using advanced AI models</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Video Generation</h4>
                  <p className="text-sm text-muted-foreground">Create visual representations of your dreams</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Community Gallery</h4>
                  <p className="text-sm text-muted-foreground">Share dreams publicly or keep them private</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Appropriate Content</h4>
                  <p className="text-sm text-muted-foreground">Share only appropriate dream content, avoiding explicit or harmful material</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Respect Others</h4>
                  <p className="text-sm text-muted-foreground">Maintain respectful interactions in community features</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Prohibited Activities</h4>
                  <p className="text-sm text-muted-foreground">No spam, harassment, or attempts to compromise the service</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Service Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Best Effort Service</h4>
                <p className="text-sm text-muted-foreground">
                  We strive to provide continuous service but cannot guarantee 100% uptime due to maintenance, 
                  updates, or unforeseen circumstances.
                </p>
              </div>
              <div>
                <h4 className="font-medium">AI Service Dependencies</h4>
                <p className="text-sm text-muted-foreground">
                  Our service depends on third-party AI providers. Service interruptions may occur due to 
                  external factors beyond our control.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Your Content</h4>
                <p className="text-sm text-muted-foreground">
                  You retain ownership of your dream descriptions and any content you create. By using our service, 
                  you grant us a license to process and analyze your content to provide our services.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Generated Content</h4>
                <p className="text-sm text-muted-foreground">
                  AI-generated analyses and videos are provided for your personal use. You may share them 
                  but cannot claim exclusive ownership of AI-generated content.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Platform Rights</h4>
                <p className="text-sm text-muted-foreground">
                  The Dream Journey Analyzer platform, including its design, features, and underlying technology, 
                  is our intellectual property.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Educational Purpose</h4>
                <p className="text-sm text-muted-foreground">
                  Dream analyses are for entertainment and educational purposes only. They should not be considered 
                  professional psychological or medical advice.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Service Limitations</h4>
                <p className="text-sm text-muted-foreground">
                  We provide the service "as is" without warranties. We are not liable for any indirect, 
                  incidental, or consequential damages arising from service use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Termination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Account Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge variant="outline">Your Right to Terminate</Badge>
                <p className="text-sm text-muted-foreground">You may delete your account at any time</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Our Right to Terminate</Badge>
                <p className="text-sm text-muted-foreground">We may suspend accounts for terms violations</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Data Retention</Badge>
                <p className="text-sm text-muted-foreground">Account data deleted within 30 days of termination</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Appeal Process</Badge>
                <p className="text-sm text-muted-foreground">Contact support to appeal account actions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of significant 
              changes via email or through the application. Continued use after changes constitutes acceptance 
              of the updated terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Questions About These Terms?
            </CardTitle>
            <CardDescription>
              Contact our legal team for clarification on any terms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><strong>Email:</strong> legal@dreamjourney.com</p>
              <p className="text-sm"><strong>Response Time:</strong> Within 72 hours</p>
              <p className="text-sm text-muted-foreground">
                We're committed to transparency and will clarify any questions about these terms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <AlertTriangle className="w-5 h-5" />
              Governing Law
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              These terms are governed by the laws of the jurisdiction where our company is incorporated. 
              Any disputes will be resolved through binding arbitration in accordance with applicable laws.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
