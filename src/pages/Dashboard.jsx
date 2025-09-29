import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from "@/components/ui/dream-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Video,
  Heart,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  Star,
  Plus,
  BarChart3,
  Activity,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// TypeScript interfaces removed - using JavaScript objects

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const navigate = useNavigate();

  const getStatsForTimeRange = (range) => {
    switch (range) {
      case "week":
        return {
          totalDreams: 7,
          videosGenerated: 4,
          totalViews: 156,
          averageRating: 4.3,
          streakDays: 12,
          weeklyGoal: 5,
          weeklyProgress: 3
        };
      case "month":
        return {
          totalDreams: 23,
          videosGenerated: 15,
          totalViews: 687,
          averageRating: 4.1,
          streakDays: 12,
          weeklyGoal: 5,
          weeklyProgress: 3
        };
      case "year":
        return {
          totalDreams: 147,
          videosGenerated: 89,
          totalViews: 4523,
          averageRating: 4.2,
          streakDays: 12,
          weeklyGoal: 5,
          weeklyProgress: 3
        };
      default:
        return {
          totalDreams: 47,
          videosGenerated: 23,
          totalViews: 1247,
          averageRating: 4.2,
          streakDays: 12,
          weeklyGoal: 5,
          weeklyProgress: 3
        };
    }
  };

  const stats = getStatsForTimeRange(timeRange);

  const recentActivity = [
    {
      id: "1",
      type: "video",
      title: "Flying Over Ocean Dreams",
      timestamp: "2 hours ago",
      details: "Video generation completed"
    },
    {
      id: "2", 
      type: "dream",
      title: "Mystical Forest Adventure",
      timestamp: "1 day ago",
      details: "Dream analysis completed"
    },
    {
      id: "3",
      type: "like",
      title: "Cosmic Journey to Stars",
      timestamp: "2 days ago",
      details: "Received 5 new likes"
    },
    {
      id: "4",
      type: "view",
      title: "Underwater Palace Dreams", 
      timestamp: "3 days ago",
      details: "Reached 100 views"
    }
  ];

  const getEmotionalTrendsForTimeRange = (range) => {
    switch (range) {
      case "week":
        return [
          { emotion: "Joy", percentage: 42, color: "bg-yellow-500" },
          { emotion: "Wonder", percentage: 31, color: "bg-purple-500" },
          { emotion: "Peace", percentage: 18, color: "bg-blue-500" },
          { emotion: "Adventure", percentage: 9, color: "bg-green-500" }
        ];
      case "month":
        return [
          { emotion: "Wonder", percentage: 38, color: "bg-purple-500" },
          { emotion: "Joy", percentage: 29, color: "bg-yellow-500" },
          { emotion: "Adventure", percentage: 21, color: "bg-green-500" },
          { emotion: "Peace", percentage: 12, color: "bg-blue-500" }
        ];
      case "year":
        return [
          { emotion: "Joy", percentage: 35, color: "bg-yellow-500" },
          { emotion: "Wonder", percentage: 28, color: "bg-purple-500" },
          { emotion: "Peace", percentage: 20, color: "bg-blue-500" },
          { emotion: "Adventure", percentage: 17, color: "bg-green-500" }
        ];
      default:
        return [
          { emotion: "Joy", percentage: 35, color: "bg-yellow-500" },
          { emotion: "Wonder", percentage: 28, color: "bg-purple-500" },
          { emotion: "Peace", percentage: 20, color: "bg-blue-500" },
          { emotion: "Adventure", percentage: 17, color: "bg-green-500" }
        ];
    }
  };

  const emotionalTrends = getEmotionalTrendsForTimeRange(timeRange);

  const getActivityIcon = (type) => {
    switch (type) {
      case "dream": return <Brain className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "view": return <Activity className="w-4 h-4" />;
      case "like": return <Heart className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  // Auth guard
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-80 text-purple-600 dark:text-purple-400">
          <Brain className="w-6 h-6 animate-pulse" />
          Loading your dashboard...
          <Star className="w-6 h-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dream Dashboard
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Track your dream journey and insights
              </p>
            </div>
            <div className="flex gap-2">
              {["week", "month", "year"].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "cosmic" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="capitalize"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DreamCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Dreams</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalDreams}</p>
                </div>
                <Brain className="w-8 h-8 text-primary-glow animate-gentle-pulse" />
              </div>
            </DreamCard>

            <DreamCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Videos Created</p>
                  <p className="text-3xl font-bold text-foreground">{stats.videosGenerated}</p>
                </div>
                <Video className="w-8 h-8 text-accent animate-gentle-pulse" />
              </div>
            </DreamCard>

            <DreamCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary animate-gentle-pulse" />
              </div>
            </DreamCard>

            <DreamCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dream Streak</p>
                  <p className="text-3xl font-bold text-foreground">{stats.streakDays} days</p>
                </div>
                <Zap className="w-8 h-8 text-primary-glow animate-gentle-pulse" />
              </div>
            </DreamCard>
          </div>

          {/* Weekly Goal Progress */}
          <DreamCard className="p-6">
            <DreamCardHeader>
              <div className="flex items-center justify-between">
                <DreamCardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Weekly Dream Goal
                </DreamCardTitle>
                <Badge variant="cosmic">
                  {stats.weeklyProgress}/{stats.weeklyGoal} Dreams
                </Badge>
              </div>
            </DreamCardHeader>
            <DreamCardContent>
              <div className="space-y-2">
                <Progress 
                  value={(stats.weeklyProgress / stats.weeklyGoal) * 100} 
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground">
                  {stats.weeklyGoal - stats.weeklyProgress} more dreams to reach your weekly goal
                </p>
              </div>
            </DreamCardContent>
          </DreamCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotional Trends */}
            <DreamCard>
              <DreamCardHeader>
                <DreamCardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  Emotional Trends
                </DreamCardTitle>
              </DreamCardHeader>
              <DreamCardContent>
                <div className="space-y-4">
                  {emotionalTrends.map((trend, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{trend.emotion}</span>
                        <span className="text-muted-foreground">{trend.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${trend.color} transition-all duration-300`}
                          style={{ width: `${trend.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </DreamCardContent>
            </DreamCard>

            {/* Recent Activity */}
            <DreamCard>
              <DreamCardHeader>
                <DreamCardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Recent Activity
                </DreamCardTitle>
              </DreamCardHeader>
              <DreamCardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-dream flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DreamCardContent>
            </DreamCard>
          </div>

          {/* Quick Actions */}
          <DreamCard className="p-6">
            <DreamCardHeader>
              <DreamCardTitle>Quick Actions</DreamCardTitle>
            </DreamCardHeader>
            <DreamCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="cosmic" className="h-20 flex-col gap-2" onClick={() => navigate('/')}>
                  <Plus className="w-6 h-6" />
                  New Dream Analysis
                </Button>
                <Button variant="nebula" className="h-20 flex-col gap-2" onClick={() => navigate('/gallery')}>
                  <Video className="w-6 h-6" />
                  View Gallery
                </Button>
                <Button variant="ghost" className="h-20 flex-col gap-2 border border-border/20 hover:bg-accent/10" onClick={() => navigate('/')}>
                  <Calendar className="w-6 h-6" />
                  Dream Analyzer
                </Button>
              </div>
            </DreamCardContent>
          </DreamCard>
        </div>
      </div>
    </div>
  );
}
