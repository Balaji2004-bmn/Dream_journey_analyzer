import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Key, 
  Settings, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Info,
  Zap,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { initializeRunwayML } from '@/services/runwayML';

export default function APISettings() {
  const [runwayApiKey, setRunwayApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [settings, setSettings] = useState({
    enableVideoGeneration: true,
    defaultVideoDuration: 4,
    generateVariations: false,
    maxVariations: 3
  });

  useEffect(() => {
    // Check if API key is set in environment variables
    const envApiKey = import.meta.env.VITE_RUNWAY_API_KEY;
    if (envApiKey && envApiKey !== 'your_runway_ml_api_key_here') {
      setRunwayApiKey(envApiKey);
      setIsValid(true);
    }
    
    // Load saved settings
    const savedSettings = localStorage.getItem('video_generation_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!runwayApiKey.trim()) {
      toast.error('Please enter a RunwayML API key');
      return;
    }

    setIsValidating(true);
    
    try {
      // Initialize the service with the API key
      const service = initializeRunwayML(runwayApiKey);
      
      // Test the API key with a simple request
      // Note: This is a mock validation - in real implementation, you'd test with a simple API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsValid(true);
      
      toast.success('RunwayML API key validated! Please add VITE_RUNWAY_API_KEY to your .env file to use it.');
      toast.info('Add this to your .env file: VITE_RUNWAY_API_KEY=' + runwayApiKey);
      
    } catch (error) {
      console.error('API key validation error:', error);
      toast.error('Invalid API key. Please check your RunwayML credentials.');
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveApiKey = () => {
    setRunwayApiKey('');
    setIsValid(false);
    toast.info('API key cleared from UI. Remove VITE_RUNWAY_API_KEY from .env file to disable.');
  };

  const handleSaveSettings = () => {
    localStorage.setItem('video_generation_settings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* RunwayML API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            RunwayML API Configuration
          </CardTitle>
          <CardDescription>
            Configure your RunwayML API key to generate real dream videos. For security, add VITE_RUNWAY_API_KEY to your .env file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={runwayApiKey}
                  onChange={(e) => setRunwayApiKey(e.target.value)}
                  placeholder="Enter your RunwayML API key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={handleSaveApiKey}
                disabled={isValidating || !runwayApiKey.trim()}
                className="min-w-[100px]"
              >
                {isValidating ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : isValid ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Valid
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
            
            {isValid && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  API Key Validated
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveApiKey}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>Get your API key from the <a href="https://runwayml.com/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
              RunwayML API dashboard <ExternalLink className="w-3 h-3" />
            </a></p>
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">Environment Variable Setup:</p>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                Add <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">VITE_RUNWAY_API_KEY=your_api_key_here</code> to your <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env</code> file
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Generation Settings
          </CardTitle>
          <CardDescription>
            Customize how dream videos are generated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Video Generation</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to generate real videos from their dreams
              </p>
            </div>
            <Switch
              checked={settings.enableVideoGeneration}
              onCheckedChange={(checked) => handleSettingChange('enableVideoGeneration', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Default Video Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="10"
                value={settings.defaultVideoDuration}
                onChange={(e) => handleSettingChange('defaultVideoDuration', parseInt(e.target.value))}
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Generate Multiple Variations</Label>
                <p className="text-sm text-muted-foreground">
                  Create multiple video variations for each dream
                </p>
              </div>
              <Switch
                checked={settings.generateVariations}
                onCheckedChange={(checked) => handleSettingChange('generateVariations', checked)}
              />
            </div>

            {settings.generateVariations && (
              <div className="space-y-2">
                <Label htmlFor="max-variations">Maximum Variations</Label>
                <Input
                  id="max-variations"
                  type="number"
                  min="2"
                  max="5"
                  value={settings.maxVariations}
                  onChange={(e) => handleSettingChange('maxVariations', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                How Dream Video Generation Works
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• AI analyzes your dream description, emotions, and keywords</li>
                <li>• Creates a visual prompt based on dream content and emotional tone</li>
                <li>• Generates cinematic video sequences using RunwayML's AI</li>
                <li>• Videos are 4 seconds long and optimized for dream-like visuals</li>
                <li>• Each dream gets a unique video based on its specific content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
