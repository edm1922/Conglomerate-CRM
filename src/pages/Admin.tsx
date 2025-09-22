import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signUpWithEmail, listProfiles } from "@/services/auth";
import DocumentTemplates from "@/components/DocumentTemplates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentTemplateManager from "@/components/AppointmentTemplateManager";
import TaskAssignment from "@/components/TaskAssignment";
import TaskTemplateManager from "@/components/TaskTemplateManager";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet, AlertTriangle, Database, Users, Crown, User } from "lucide-react";
import { exportData, importData } from "@/services/storage";
import { createLead } from "@/services/leads";
import { createClient } from "@/services/clients";
import { createLot } from "@/services/lots";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Profile } from "@/types/entities";

// Helper functions
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const getRoleBadge = (role: string) => {
  if (role === 'admin') {
    return (
      <Badge variant="default" className="gap-1">
        <Crown className="w-3 h-3" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <User className="w-3 h-3" />
      Agent
    </Badge>
  );
};

export default function Admin() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch user profiles
  const { data: profiles = [], isLoading: profilesLoading, refetch: refetchProfiles } = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: listProfiles,
  });

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await signUpWithEmail(email, password);
      setSuccess(`User with email ${email} created successfully.`);
      setEmail("");
      setPassword("");
      // Refresh the profiles list
      refetchProfiles();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      setExporting(true);
      const backupData = exportData();
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Data exported successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = async () => {
    if (!importFile) {
      toast({ title: "Error", description: "Please select a file to import", variant: "destructive" });
      return;
    }

    try {
      setImporting(true);
      const text = await importFile.text();
      const success = importData(text);
      
      if (success) {
        toast({ title: "Success", description: "Data imported successfully" });
        setImportFile(null);
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        throw new Error('Invalid backup format');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleCSVImport = async (file: File, entityType: string) => {
    try {
      setImporting(true);
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const dataRows = lines.slice(1);
      
      let imported = 0;
      let errors = 0;

      for (const row of dataRows) {
        const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const record: any = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });

        try {
          if (entityType === 'leads') {
            await createLead({
              name: record.name || record.Name,
              email: record.email || record.Email,
              phone: record.phone || record.Phone,
              source: record.source || record.Source || 'Import',
              status: record.status || record.Status || 'new',
              notes: record.notes || record.Notes || ''
            });
          } else if (entityType === 'clients') {
            await createClient({
              name: record.name || record.Name,
              email: record.email || record.Email,
              phone: record.phone || record.Phone,
              address: record.address || record.Address || ''
            });
          } else if (entityType === 'lots') {
            await createLot({
              block_number: record.block_number || record['Block Number'] || '',
              lot_number: record.lot_number || record['Lot Number'] || '',
              size: parseFloat(record.size || record.Size || '0'),
              price: parseFloat(record.price || record.Price || '0'),
              location: record.location || record.Location || '',
              description: record.description || record.Description || '',
              status: record.status || record.Status || 'available'
            });
          }
          imported++;
        } catch (error) {
          errors++;
          console.error(`Error importing row:`, error);
        }
      }

      toast({ 
        title: "Import Complete", 
        description: `Imported ${imported} records. ${errors} errors.` 
      });
      
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <Tabs defaultValue="user-management">
        <TabsList>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="data-management">Data Import/Export</TabsTrigger>
          <TabsTrigger value="document-templates">Document Templates</TabsTrigger>
          <TabsTrigger value="appointment-templates">Appointment Templates</TabsTrigger>
          <TabsTrigger value="task-assignment">Task Assignment</TabsTrigger>
          <TabsTrigger value="task-templates">Task Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="user-management">
          <div className="space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Current Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                ) : profiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users found.</p>
                ) : (
                  <div className="space-y-3">
                    {profiles.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{profile.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Created: {formatDate(profile.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRoleBadge(profile.role)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="data-management">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Export & Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export all CRM data as a JSON backup file. This includes leads, clients, lots, payments, appointments, and tasks.
                </p>
                <Button 
                  onClick={handleExportData} 
                  disabled={exporting}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? "Exporting..." : "Export All Data"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Data Import & Restore
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> Importing data will overwrite existing data. Make sure to backup your current data first.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backup-import">Import JSON Backup</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        id="backup-import"
                        type="file" 
                        accept=".json"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      />
                      <Button 
                        onClick={handleImportData} 
                        disabled={!importFile || importing}
                        variant="outline"
                      >
                        {importing ? "Importing..." : "Import"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  CSV Bulk Import
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Import data from CSV files. Supported formats: Leads, Clients, and Lots.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Import Leads CSV</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Required columns: name, email, phone, source, status, notes
                    </p>
                    <Input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCSVImport(file, 'leads');
                      }}
                      disabled={importing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Import Clients CSV</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Required columns: name, email, phone, address
                    </p>
                    <Input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCSVImport(file, 'clients');
                      }}
                      disabled={importing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Import Lots CSV</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Required columns: block_number, lot_number, size, price, location, description, status
                    </p>
                    <Input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCSVImport(file, 'lots');
                      }}
                      disabled={importing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
