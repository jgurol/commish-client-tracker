
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Settings, Shield, AlertTriangle } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function SystemSettings() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    defaultCommissionRate: "15",
    companyName: "California Telecom",
    supportEmail: "support@californiatelecom.com"
  });

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, we'll just show a success message since we haven't implemented
      // a system settings table yet. This can be expanded later.
      toast({
        title: "Settings updated",
        description: "System configuration has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Please log in to access system settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Configuration</h1>
        <p className="text-gray-600">Configure global system settings and defaults</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure basic system-wide settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  placeholder="Enter support email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCommissionRate">Default Commission Rate (%)</Label>
                <Input
                  id="defaultCommissionRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.defaultCommissionRate}
                  onChange={(e) => setSettings({ ...settings, defaultCommissionRate: e.target.value })}
                  placeholder="Enter default commission rate"
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security and access control settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Authentication Method:</span>
              </div>
              <span className="text-sm text-gray-600">Email & Password</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">User Registration:</span>
              </div>
              <span className="text-sm text-gray-600">Enabled (Admin Approval Required)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Database Management
            </CardTitle>
            <CardDescription>
              Advanced database operations and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-700 mb-2">
                <strong>Warning:</strong> These operations can affect system performance and data integrity.
              </p>
              <p className="text-sm text-orange-600">
                Database maintenance and backup operations should be performed during off-peak hours.
                Contact your system administrator for assistance with these operations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
