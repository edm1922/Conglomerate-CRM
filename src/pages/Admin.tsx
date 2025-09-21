import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signUpWithEmail } from "@/services/auth";
import DocumentTemplates from "@/components/DocumentTemplates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentTemplateManager from "@/components/AppointmentTemplateManager";
import TaskAssignment from "@/components/TaskAssignment";
import TaskTemplateManager from "@/components/TaskTemplateManager";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await signUpWithEmail(email, password);
      setSuccess(`User with email ${email} created successfully.`);
      setEmail("");
      setPassword("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <Tabs defaultValue="user-management">
        <TabsList>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="document-templates">Document Templates</TabsTrigger>
          <TabsTrigger value="appointment-templates">Appointment Templates</TabsTrigger>
          <TabsTrigger value="task-assignment">Task Assignment</TabsTrigger>
          <TabsTrigger value="task-templates">Task Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="user-management">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}
              <Button className="w-full" onClick={submit} disabled={loading}>
                {loading ? "Creating user..." : "Create User"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="document-templates">
          <DocumentTemplates />
        </TabsContent>
        <TabsContent value="appointment-templates">
          <AppointmentTemplateManager />
        </TabsContent>
        <TabsContent value="task-assignment">
          <TaskAssignment />
        </TabsContent>
        <TabsContent value="task-templates">
          <TaskTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
