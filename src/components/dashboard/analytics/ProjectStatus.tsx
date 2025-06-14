
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";

export const ProjectStatus = () => {
  const [projects] = useState([
    {
      id: 1,
      name: "Downtown Office Complex",
      client: "Metropolitan Developments",
      status: "active",
      progress: 67,
      assignedWorkers: 28,
      location: "Manhattan, NY",
      startDate: "2024-01-15",
      endDate: "2024-08-30",
      budget: 450000,
      spent: 301500,
      priority: "high",
      milestones: {
        completed: 4,
        total: 6
      }
    },
    {
      id: 2,
      name: "Harbor Port Expansion",
      client: "Port Authority",
      status: "active",
      progress: 43,
      assignedWorkers: 15,
      location: "Brooklyn, NY",
      startDate: "2024-02-01",
      endDate: "2024-12-15",
      budget: 750000,
      spent: 322500,
      priority: "medium",
      milestones: {
        completed: 2,
        total: 5
      }
    },
    {
      id: 3,
      name: "Airport Terminal Renovation",
      client: "Aviation Services Inc",
      status: "planning",
      progress: 12,
      assignedWorkers: 22,
      location: "Queens, NY",
      startDate: "2024-03-10",
      endDate: "2024-11-20",
      budget: 890000,
      spent: 106800,
      priority: "high",
      milestones: {
        completed: 1,
        total: 8
      }
    },
    {
      id: 4,
      name: "Residential Housing Complex",
      client: "Urban Living Corp",
      status: "completed",
      progress: 100,
      assignedWorkers: 0,
      location: "Bronx, NY",
      startDate: "2023-09-01",
      endDate: "2024-02-28",
      budget: 320000,
      spent: 315000,
      priority: "low",
      milestones: {
        completed: 5,
        total: 5
      }
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "planning": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "delayed": return "bg-red-100 text-red-800";
      case "on-hold": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Activity className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "delayed": return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const activeProjects = projects.filter(p => p.status === "active").length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);

  return (
    <div className="space-y-6">
      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{activeProjects}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${(totalBudget / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Utilization</p>
                <p className="text-2xl font-bold">{((totalSpent / totalBudget) * 100).toFixed(1)}%</p>
              </div>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Project Portfolio
          </CardTitle>
          <CardDescription>
            Manage and monitor all active projects and their workforce allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.client}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{project.status}</span>
                    </Badge>
                    <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority} priority
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {project.assignedWorkers} workers
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {project.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${(project.spent / 1000).toFixed(0)}K / ${(project.budget / 1000).toFixed(0)}K
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {project.milestones.completed}/{project.milestones.total} milestones
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    {project.status === "active" && (
                      <Button size="sm">Manage Team</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
