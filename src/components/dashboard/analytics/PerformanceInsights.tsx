import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  Clock, 
  AlertTriangle,
  Users,
  BarChart3
} from "lucide-react";

interface PerformanceMetric {
  value: number;
  change: number;
  trend: "up" | "down";
}

interface PerformanceData {
  productivity: PerformanceMetric;
  efficiency: PerformanceMetric;
  attendance: PerformanceMetric;
  safety: PerformanceMetric;
}

interface PeriodData {
  week: PerformanceData;
  month: PerformanceData;
  quarter: PerformanceData;
}

export const PerformanceInsights = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<keyof PeriodData>("week");

  const performanceData: PeriodData = {
    week: {
      productivity: { value: 87.5, change: 5.2, trend: "up" },
      efficiency: { value: 92.1, change: 2.1, trend: "up" },
      attendance: { value: 94.7, change: -1.2, trend: "down" },
      safety: { value: 98.8, change: 0.5, trend: "up" }
    },
    month: {
      productivity: { value: 85.3, change: 8.7, trend: "up" },
      efficiency: { value: 89.5, change: 4.2, trend: "up" },
      attendance: { value: 93.2, change: 2.1, trend: "up" },
      safety: { value: 97.9, change: 1.8, trend: "up" }
    },
    quarter: {
      productivity: { value: 83.8, change: 12.3, trend: "up" },
      efficiency: { value: 87.2, change: 7.8, trend: "up" },
      attendance: { value: 91.5, change: 5.4, trend: "up" },
      safety: { value: 96.8, change: 3.2, trend: "up" }
    }
  };

  const topPerformers = [
    { id: 1, name: "Ahmed Hassan", role: "Site Supervisor", score: 96.5, projects: 3 },
    { id: 2, name: "Maria Rodriguez", role: "Lead Welder", score: 94.8, projects: 2 },
    { id: 3, name: "David Chen", role: "Crane Operator", score: 93.2, projects: 4 },
    { id: 4, name: "James Smith", role: "Safety Officer", score: 92.7, projects: 5 },
    { id: 5, name: "Lisa Johnson", role: "Project Manager", score: 91.9, projects: 2 }
  ];

  const insights = [
    {
      type: "positive",
      icon: TrendingUp,
      title: "Productivity Surge",
      description: "Worker productivity increased by 12% this quarter",
      action: "Continue current training programs"
    },
    {
      type: "warning",
      icon: AlertTriangle,
      title: "Overtime Alert",
      description: "23% increase in overtime hours this month",
      action: "Consider additional workforce allocation"
    },
    {
      type: "positive",
      icon: Award,
      title: "Safety Excellence",
      description: "Zero incidents for 45 consecutive days",
      action: "Maintain safety protocols"
    },
    {
      type: "neutral",
      icon: Target,
      title: "Efficiency Opportunity",
      description: "Equipment utilization at 78% - room for improvement",
      action: "Optimize equipment scheduling"
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive": return "border-green-200 bg-green-50";
      case "warning": return "border-yellow-200 bg-yellow-50";
      case "negative": return "border-red-200 bg-red-50";
      default: return "border-blue-200 bg-blue-50";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "positive": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "negative": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  const currentData = performanceData[selectedPeriod];

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="quarter">This Quarter</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(currentData) as [keyof PerformanceData, PerformanceMetric][]).map(([key, data]) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground capitalize">{key}</p>
                      <p className="text-2xl font-bold">{data.value}%</p>
                      <div className="flex items-center text-sm">
                        {data.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={data.trend === "up" ? "text-green-500" : "text-red-500"}>
                          {data.change > 0 ? "+" : ""}{data.change}%
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-gray-200 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Automated analysis and recommendations for workforce optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                    <div className="flex items-start space-x-3">
                      <insight.icon className={`h-5 w-5 mt-0.5 ${getIconColor(insight.type)}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        <p className="text-sm font-medium text-gray-800 mt-2">
                          Recommended: {insight.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Top Performers - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
              </CardTitle>
              <CardDescription>
                Recognize and reward outstanding workforce performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{performer.name}</p>
                        <p className="text-sm text-gray-600">{performer.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{performer.projects} projects</Badge>
                        <span className="text-lg font-bold text-green-600">{performer.score}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
