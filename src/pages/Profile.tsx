import { useState, useRef } from "react";
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
  Upload
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
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: "Dream Explorer",
    email: "explorer@dreamjourney.com",
    phone: "+1 (555) 123-4567",
    bio: "Passionate about exploring the mysteries of dreams and the subconscious mind. I love creating visual stories from my dream experiences.",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b293?w=150&h=150&fit=crop&crop=face",
    dreamStreak: 47
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

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield }
  ];

  const achievements = [
    { name: "Dream Starter", description: "Analyzed your first dream", earned: true },
    { name: "Video Creator", description: "Generated your first dream video", earned: true },
    { name: "Dream Streaker", description: "7-day dream analysis streak", earned: true },
    { name: "Explorer", description: "Analyzed 25 dreams", earned: true },
    { name: "Storyteller", description: "Created 10 dream videos", earned: false },
    { name: "Dream Master", description: "Analyzed 100 dreams", earned: false }
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
    console.log("Profile saved:", profile);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfile(prev => ({ ...prev, avatar: e.target?.result as string }));
          toast.success("Profile photo updated!");
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please select a valid image file");
      }
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
          <DreamCard className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={profile.avatar} alt="Profile" />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-primary hover:bg-primary/90 rounded-full p-2 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-primary-foreground" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="text-center md:text-left space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="cosmic">
                    {profile.dreamStreak} Dream Streak
                  </Badge>
                  <Badge variant="outline">
                    Joined {profile.joinDate}
                  </Badge>
                </div>
              </div>
            </div>
          </DreamCard>

          {/* Navigation Tabs */}
          <DreamCard className="p-2">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "cosmic" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
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
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          disabled={!isEditing}
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
}