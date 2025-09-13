import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from "@/components/ui/dream-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  Moon,
  Sun,
  Camera,
  Save,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Upload,
  Brain,
  Sparkles,
  Star,
  Zap,
  Crown
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  joinDate: string;
  avatar: string;
  dreamStreak: number;
}

interface NotificationSettings {
  dreamReminders: boolean;
  weeklyReports: boolean;
  videoComplete: boolean;
  socialUpdates: boolean;
}

interface PrivacySettings {
  profilePublic: boolean;
  dreamsPublic: boolean;
  analyticsSharing: boolean;
}

export default function Profile() {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { user, loading } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: "Dream Explorer",
    email: "",
    phone: "",
    bio: "Passionate about exploring the mysteries of dreams and the subconscious mind.",
    location: "",
    joinDate: "January 2024",
    avatar: "",
    dreamStreak: 0
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    dreamReminders: true,
    weeklyReports: true,
    videoComplete: true,
    socialUpdates: false
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profilePublic: true,
    dreamsPublic: false,
    analyticsSharing: true
  });

  // Update profile when user data is available
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.display_name || user.email?.split('@')[0] || "Dream Explorer",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        bio: user.user_metadata?.bio || "Passionate about exploring the mysteries of dreams and the subconscious mind.",
        location: user.user_metadata?.location || "",
        joinDate: new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        avatar: user.user_metadata?.avatar_url || "",
        dreamStreak: 0
      });
    }
  }, [user]);


  // NOW WE CAN DO CONDITIONAL LOGIC AFTER ALL HOOKS
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="pt-20 pb-12 min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-80 text-primary-glow">
          <Brain className="w-6 h-6 animate-pulse" />
          Loading your profile...
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User, color: "text-purple-400" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-cyan-400" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "text-yellow-400" },
    { id: "privacy", label: "Privacy", icon: Shield, color: "text-emerald-400" }
  ];

  const achievements = [
    { name: "Dream Starter", description: "Analyzed your first dream", earned: true },
    { name: "Video Creator", description: "Generated your first dream video", earned: true },
    { name: "Dream Streaker", description: "7-day dream analysis streak", earned: true },
    { name: "Explorer", description: "Analyzed 25 dreams", earned: true },
    { name: "Storyteller", description: "Created 10 dream videos", earned: false },
    { name: "Dream Master", description: "Analyzed 100 dreams", earned: false }
  ];

  const handleSave = async () => {
    setIsEditing(false);
    
    if (!user) return;
    
    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: profile.name,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio
      }
    });

    if (error) {
      toast.error("Failed to update profile: " + error.message);
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar: publicUrl }));
      toast.success("Profile photo updated!");
      
    } catch (error: any) {
      toast.error("Failed to upload photo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-dream bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your dream journey settings and preferences
            </p>
          </div>

          {/* Profile Header */}
          <DreamCard className="p-8 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5 border-gradient-cosmic">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
                <Avatar className="w-24 h-24 border-4 border-gradient-cosmic bg-gradient-to-br from-purple-100 to-pink-100 relative z-10">
                  <AvatarImage src={profile.avatar} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full p-2 transition-all disabled:opacity-50 shadow-lg"
                >
                  {uploading ? (
                    <div className="w-4 h-4 opacity-70">⏳</div>
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="text-center md:text-left space-y-2">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  {profile.email}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="cosmic" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-300/30">
                    <Zap className="w-3 h-3 mr-1" />
                    {profile.dreamStreak} Dream Streak
                  </Badge>
                  <Badge variant="outline" className="border-cyan-300/30 text-cyan-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    Joined {profile.joinDate}
                  </Badge>
                </div>
              </div>
            </div>
          </DreamCard>

          {/* Navigation Tabs */}
          <DreamCard className="p-2 bg-gradient-to-r from-purple-500/5 to-cyan-500/5">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "cosmic" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : `hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 ${tab.color}`
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </DreamCard>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DreamCard>
                <DreamCardHeader>
                  <div className="flex items-center justify-between">
                    <DreamCardTitle>Personal Information</DreamCardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                </DreamCardHeader>
                <DreamCardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        disabled={!isEditing}
                        className="bg-input/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled={true}
                          className="pl-10 bg-input/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          disabled={!isEditing}
                          className="pl-10 bg-input/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile({...profile, location: e.target.value})}
                          disabled={!isEditing}
                          className="pl-10 bg-input/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        disabled={!isEditing}
                        className="min-h-20 bg-input/50"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    {isEditing && (
                      <Button onClick={handleSave} variant="cosmic" className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    )}
                  </div>
                </DreamCardContent>
              </DreamCard>

              <DreamCard>
                <DreamCardHeader>
                  <DreamCardTitle>Achievements</DreamCardTitle>
                </DreamCardHeader>
                <DreamCardContent>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                          achievement.earned 
                            ? "bg-gradient-dream/20 border border-primary/20" 
                            : "bg-muted/20 opacity-60"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          achievement.earned ? "bg-gradient-dream" : "bg-muted"
                        }`}>
                          {achievement.earned ? "🏆" : "🔒"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DreamCardContent>
              </DreamCard>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DreamCard>
                <DreamCardHeader>
                  <DreamCardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-cyan-400" />
                    General Settings
                  </DreamCardTitle>
                </DreamCardHeader>
                <DreamCardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Toggle between light and dark themes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-yellow-400" />
                        <Switch 
                          checked={isDarkMode}
                          onCheckedChange={toggleDarkMode}
                        />
                        <Moon className="w-4 h-4 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Save Dreams</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically save dreams after analysis
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Dream Reminders</p>
                        <p className="text-sm text-muted-foreground">
                          Daily reminders to record your dreams
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">High Quality Videos</p>
                        <p className="text-sm text-muted-foreground">
                          Generate videos in higher resolution
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </DreamCardContent>
              </DreamCard>

              <DreamCard>
                <DreamCardHeader>
                  <DreamCardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-pink-400" />
                    Appearance
                  </DreamCardTitle>
                </DreamCardHeader>
                <DreamCardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Theme Color</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        <button className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 ring-2 ring-purple-300 ring-offset-2"></button>
                        <button className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:ring-2 hover:ring-blue-300 hover:ring-offset-2"></button>
                        <button className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:ring-2 hover:ring-green-300 hover:ring-offset-2"></button>
                        <button className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:ring-2 hover:ring-orange-300 hover:ring-offset-2"></button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Animation Level</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="radio" name="animation" id="none" className="text-primary" />
                          <Label htmlFor="none" className="text-sm">None</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="radio" name="animation" id="reduced" className="text-primary" />
                          <Label htmlFor="reduced" className="text-sm">Reduced</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="radio" name="animation" id="full" className="text-primary" defaultChecked />
                          <Label htmlFor="full" className="text-sm">Full</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </DreamCardContent>
              </DreamCard>
            </div>
          )}

          {activeTab === "notifications" && (
            <DreamCard>
              <DreamCardHeader>
                <DreamCardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </DreamCardTitle>
              </DreamCardHeader>
              <DreamCardContent>
                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {key === "dreamReminders" && "Get reminded to log your dreams"}
                          {key === "weeklyReports" && "Receive weekly dream analysis summaries"}
                          {key === "videoComplete" && "Notify when video generation is complete"}
                          {key === "socialUpdates" && "Updates from the dream community"}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setNotifications({...notifications, [key]: checked})
                        }
                      />
                    </div>
                  ))}
                </div>
              </DreamCardContent>
            </DreamCard>
          )}

          {activeTab === "privacy" && (
            <DreamCard>
              <DreamCardHeader>
                <DreamCardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Settings
                </DreamCardTitle>
              </DreamCardHeader>
              <DreamCardContent>
                <div className="space-y-6">
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {key === "profilePublic" && "Make your profile visible to other users"}
                          {key === "dreamsPublic" && "Allow others to view your dream gallery"}
                          {key === "analyticsSharing" && "Share anonymous usage data for improvements"}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setPrivacy({...privacy, [key]: checked})
                        }
                      />
                    </div>
                  ))}
                </div>
              </DreamCardContent>
            </DreamCard>
          )}
        </div>
      </div>
    </div>
  );
};