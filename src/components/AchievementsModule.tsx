import React from 'react';
import { UserProfile } from '../types/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { missions, Mission } from '../lib/missions';
import { Trophy, Star, ShieldCheck, Share2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface AchievementsModuleProps {
  userProfile: UserProfile;
}

const AchievementsModule: React.FC<AchievementsModuleProps> = ({ userProfile }) => {
  const { xp, level, dailyStreak, missionProgress } = userProfile;

  const getMissionsByCategory = (category: string) => {
    return missions.filter(m => m.category === category);
  };

  const renderMission = (mission: Mission) => {
    const progress = missionProgress[mission.id] || 0;
    const isCompleted = progress >= mission.goal;
    const progressPercentage = Math.min((progress / mission.goal) * 100, 100);

    return (
      <div key={mission.id} className={`p-4 rounded-lg mb-3 transition-all duration-300 ${isCompleted ? 'bg-green-500/10 border border-green-500/20' : 'bg-card border border-border'}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`font-bold ${isCompleted ? 'text-green-600' : 'text-foreground'}`}>{mission.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{mission.description}</p>
          </div>
          <div className="text-right ml-4 flex-shrink-0">
            <p className={`font-bold text-lg ${isCompleted ? 'text-green-600' : 'text-yellow-500'}`}>{mission.xp} XP</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span className="font-medium">{progress} / {mission.goal}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const renderMissionCategory = (title: string, category: string) => {
    const categoryMissions = getMissionsByCategory(category);
    if (categoryMissions.length === 0) return null;

    return (
      <div className="mt-6">
        {categoryMissions.map(renderMission)}
      </div>
    );
  };

  return (
    <div className="flex-1 p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-8">Achievements</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {level}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{xp} XP</div>
            {level < 50 ? (
              <p className="text-xs text-muted-foreground">{(level + 1) * 100 - xp} to next level</p>
            ) : (
              <p className="text-xs text-muted-foreground">Max level reached!</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStreak} Days</div>
            <p className="text-xs text-muted-foreground">Login tomorrow to continue!</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-2xl font-bold">Missions</h2>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Share2 className="w-4 h-4 mr-2" />
          Share with Friends
        </button>
      </div>
      <Tabs defaultValue="notes">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="todos">To-Dos</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        <TabsContent value="notes">
          {renderMissionCategory('Notes', 'notes')}
        </TabsContent>
        <TabsContent value="todos">
          {renderMissionCategory('To-Dos', 'todos')}
        </TabsContent>
        <TabsContent value="daily">
          {renderMissionCategory('Daily', 'daily')}
        </TabsContent>
        <TabsContent value="general">
          {renderMissionCategory('General', 'general')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementsModule;
