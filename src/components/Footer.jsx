import { Heart, Github, Twitter, Mail, Moon, Sparkles, Brain, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-t from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Moon className="w-8 h-8 text-blue-400" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Dream Journey
                </h3>
                <p className="text-sm text-slate-400">AI-Powered Dream Analysis</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Transform your dreams into beautiful AI-generated videos and gain deep insights into your subconscious mind.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Features</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-400" />
                AI Dream Analysis
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Video Generation
              </li>
              <li className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-cyan-400" />
                Personal Gallery
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                Emotional Insights
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Support</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li><a href="/help" className="hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="/subscription" className="hover:text-blue-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Connect</h4>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-blue-400 hover:bg-slate-800"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-blue-400 hover:bg-slate-800"
                onClick={() => window.open('https://twitter.com', '_blank')}
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-blue-400 hover:bg-slate-800"
                onClick={() => window.open('https://www.linkedin.com/in/balaji-nidavanche-a31363294', '_blank')}
              >
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-blue-400 hover:bg-slate-800"
                onClick={() => window.open('mailto:support@dreamjourney.com', '_blank')}
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-slate-400 text-sm">
              Have questions? Reach out to our support team.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} Dream Journey Analyzer. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>for dreamers worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}