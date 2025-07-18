'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: number;
  email: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  idea: string;
  mvpPlan: string | null;
  status: string;
  createdAt: string;
  taskCount: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ideaTopic, setIdeaTopic] = useState('');
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [isGeneratingMVP, setIsGeneratingMVP] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchProjects(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    }
  }, [router]);

  const fetchProjects = async (token: string) => {
    try {
      const res = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateIdea = async () => {
    if (!ideaTopic.trim()) {
      setError('Please enter a topic or interest');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setIsGeneratingIdea(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/ai/idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ topic: ideaTopic }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to generate idea');
      } else {
        setSuccess('Idea generated successfully!');
        setIdeaTopic('');
        fetchProjects(token);
        setSelectedProject(data.project);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  const handleGenerateMVP = async (projectId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setIsGeneratingMVP(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/ai/mvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to generate MVP plan');
      } else {
        setSuccess('MVP plan generated successfully!');
        fetchProjects(token);
        setSelectedProject(data.project);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsGeneratingMVP(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-8 rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-foreground">AutoFounder X</h1>
            <span className="text-muted-foreground">Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Your Startup Hub
          </h2>
          <p className="text-lg text-muted-foreground">
            Generate ideas, plan your MVP, and manage your startup journey with AI assistance.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <Alert className="mb-4 border-destructive">
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500">
            <AlertDescription className="text-green-600">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {projects.length === 0 ? 'No projects yet' : 'Active projects'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    AI Ideas Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.filter(p => p.idea).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Ideas created with AI
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    MVP Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.filter(p => p.mvpPlan).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Plans generated
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* AI Idea Generator */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Idea Generator</CardTitle>
                  <CardDescription>
                    Generate unique startup ideas based on your interests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Enter your interest or topic</Label>
                      <Input
                        id="topic"
                        value={ideaTopic}
                        onChange={(e) => setIdeaTopic(e.target.value)}
                        placeholder="e.g., sustainable fashion, fintech, health tech"
                        disabled={isGeneratingIdea}
                      />
                    </div>
                    <Button 
                      onClick={handleGenerateIdea} 
                      disabled={isGeneratingIdea || !ideaTopic.trim()}
                      className="w-full"
                    >
                      {isGeneratingIdea ? 'Generating...' : 'Generate Idea'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* MVP Plan Generator */}
              <Card>
                <CardHeader>
                  <CardTitle>MVP Plan Generator</CardTitle>
                  <CardDescription>
                    Create comprehensive development plans for your ideas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {projects.filter(p => p.idea && !p.mvpPlan).length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Select a project to generate an MVP plan:
                      </p>
                      <div className="space-y-2">
                        {projects.filter(p => p.idea && !p.mvpPlan).map(project => (
                          <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{project.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {project.idea.substring(0, 50)}...
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleGenerateMVP(project.id)}
                              disabled={isGeneratingMVP}
                            >
                              {isGeneratingMVP ? 'Generating...' : 'Generate MVP'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        {projects.length === 0 
                          ? 'Generate an idea first to create an MVP plan' 
                          : 'All projects have MVP plans'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Display Generated Content */}
            {selectedProject && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Content</CardTitle>
                  <CardDescription>
                    Latest generated idea and MVP plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Startup Idea</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedProject.idea}</p>
                    </div>
                  </div>
                  
                  {selectedProject.mvpPlan && (
                    <div>
                      <h4 className="font-semibold mb-2">MVP Development Plan</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedProject.mvpPlan}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>
                  All your generated startup ideas and MVP plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map(project => (
                      <Card key={project.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{project.title}</h4>
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {project.idea}
                        </p>
                        {project.mvpPlan && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">MVP Plan:</p>
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {project.mvpPlan}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          <span>{project.taskCount} tasks</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No projects yet. Start by generating your first idea!
                    </p>
                    <Button onClick={() => document.querySelector('[data-value="ai-tools"]')?.click()}>
                      Go to AI Tools
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  Manage tasks for your startup projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Task management coming soon!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This feature will allow you to break down your MVP plans into actionable tasks.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Track your startup journey progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Analytics dashboard coming soon!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Detailed insights and progress tracking will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
