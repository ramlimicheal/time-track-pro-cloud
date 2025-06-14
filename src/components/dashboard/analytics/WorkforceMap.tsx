
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Navigation } from "lucide-react";

export const WorkforceMap = () => {
  const [workforceData, setWorkforceData] = useState([
    {
      id: 1,
      location: "Downtown Construction Site",
      activeWorkers: 28,
      project: "Office Complex Phase 2",
      status: "active",
      coordinates: { lat: 40.7128, lng: -74.0060 },
      checkInTime: "07:30 AM"
    },
    {
      id: 2,
      location: "Harbor Industrial Zone",
      activeWorkers: 15,
      project: "Port Expansion",
      status: "active",
      coordinates: { lat: 40.6892, lng: -74.0445 },
      checkInTime: "06:00 AM"
    },
    {
      id: 3,
      location: "Airport Terminal",
      activeWorkers: 22,
      project: "Terminal Renovation",
      status: "break",
      coordinates: { lat: 40.6413, lng: -73.7781 },
      checkInTime: "08:00 AM"
    },
    {
      id: 4,
      location: "Residential Complex",
      activeWorkers: 12,
      project: "Housing Development",
      status: "active",
      coordinates: { lat: 40.7831, lng: -73.9712 },
      checkInTime: "07:45 AM"
    }
  ]);

  const [selectedSite, setSelectedSite] = useState(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "break": return "bg-yellow-100 text-yellow-800";
      case "offline": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalActiveWorkers = workforceData.reduce((sum, site) => sum + site.activeWorkers, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Live Workforce Distribution
          </CardTitle>
          <CardDescription>
            Real-time tracking of {totalActiveWorkers} active workers across {workforceData.length} sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Map Placeholder - In a real app, this would be an interactive map */}
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-64 mb-6 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3">
              <div className="text-sm font-medium text-gray-700">Live Tracking</div>
              <div className="text-xs text-gray-500">Updated 2 min ago</div>
            </div>
            
            {/* Site markers */}
            {workforceData.map((site, index) => (
              <div
                key={site.id}
                className={`absolute w-3 h-3 rounded-full cursor-pointer transition-all duration-200 ${
                  site.status === 'active' ? 'bg-green-500 animate-pulse' : 
                  site.status === 'break' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{
                  top: `${20 + index * 15}%`,
                  left: `${15 + index * 20}%`,
                }}
                onClick={() => setSelectedSite(site)}
              >
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-current opacity-30 animate-ping"></div>
              </div>
            ))}
          </div>

          {/* Sites List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workforceData.map((site) => (
              <div 
                key={site.id} 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedSite(site)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{site.location}</h4>
                    <p className="text-sm text-gray-600">{site.project}</p>
                  </div>
                  <Badge className={getStatusColor(site.status)}>
                    {site.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {site.activeWorkers} workers
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {site.checkInTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-16 flex flex-col">
          <Navigation className="h-5 w-5 mb-1" />
          Track Employee
        </Button>
        <Button variant="outline" className="h-16 flex flex-col">
          <MapPin className="h-5 w-5 mb-1" />
          Add New Site
        </Button>
        <Button variant="outline" className="h-16 flex flex-col">
          <Users className="h-5 w-5 mb-1" />
          Workforce Report
        </Button>
      </div>
    </div>
  );
};
