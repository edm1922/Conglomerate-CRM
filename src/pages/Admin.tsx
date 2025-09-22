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
import { Upload, Download, FileSpreadsheet, AlertTriangle, Database, Users, Crown, User, Calendar, CheckCircle } from "lucide-react";
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
    <div className="admin-console p-6">
      {/* Admin Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[hsl(var(--professional-blue))] rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="admin-header">Admin Control Panel</h1>
            <p className="admin-subheader">Manage users, data, and system configurations</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="user-management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm rounded-lg p-1">
          <TabsTrigger value="user-management" className="flex items-center gap-2"><Users className="w-4 h-4" />Users</TabsTrigger>
          <TabsTrigger value="data-management" className="flex items-center gap-2"><Database className="w-4 h-4" />Data</TabsTrigger>
          <TabsTrigger value="document-templates" className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" />Docs</TabsTrigger>
          <TabsTrigger value="appointment-templates" className="flex items-center gap-2"><Calendar className="w-4 h-4" />Appointments</TabsTrigger>
          <TabsTrigger value="task-assignment" className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Tasks</TabsTrigger>
          <TabsTrigger value="task-templates" className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" />Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="user-management" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create User Card - More Prominent */}
            <div className="lg:col-span-1">
              <Card className="admin-card">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-[hsl(var(--professional-blue))] rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">Create New User</CardTitle>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Add a new agent to the system</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-professional"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-professional"
                      placeholder="Enter secure password"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-[hsl(var(--professional-green))]">{success}</AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    className="w-full btn-primary" 
                    onClick={submit} 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating User...
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        Create User
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* User List - Enhanced */}
            <div className="lg:col-span-2">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-[hsl(var(--professional-blue))]" />
                    <div>
                      <h3 className="text-xl font-bold">Current Users</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] font-normal">Manage system users and their roles</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profilesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-[hsl(var(--professional-blue))] border-t-transparent rounded-full animate-spin" />
                      <span className="ml-3 text-[hsl(var(--muted-foreground))]">Loading users...</span>
                    </div>
                  ) : profiles.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                      <p className="text-[hsl(var(--muted-foreground))]">No users found in the system.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profiles.map((profile) => (
                        <div key={profile.id} className="flex items-center justify-between p-4 border border-[hsl(var(--border))] rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[hsl(var(--professional-blue))]/10 rounded-full flex items-center justify-center">
                              {profile.role === 'admin' ? <Crown className="w-5 h-5 text-[hsl(var(--professional-blue))]" /> : <User className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />}
                            </div>
                            <div>
                              <p className="font-medium text-[hsl(var(--foreground))]">{profile.email}</p>
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                Created: {formatDate(profile.created_at)}
                              </p>
                            </div>
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
          </div>
        </TabsContent>
        <TabsContent value="data-management" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Export */}
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Download className="w-6 h-6 text-[hsl(var(--professional-green))]" />
                  <div>
                    <h3 className="text-lg font-bold">Data Export & Backup</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] font-normal">Export all CRM data as backup</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Export all CRM data as a JSON backup file. This includes leads, clients, lots, payments, appointments, and tasks.
                </p>
                <Button 
                  onClick={handleExportData} 
                  disabled={exporting}
                  className="w-full btn-success gap-2"
                  size="lg"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? "Exporting..." : "Export All Data"}
                </Button>
              </CardContent>
            </Card>

            {/* Data Import */}
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-[hsl(var(--professional-blue))]" />
                  <div>
                    <h3 className="text-lg font-bold">Data Import & Restore</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] font-normal">Import backup files</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> Importing data will overwrite existing data. Make sure to backup your current data first.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backup-import" className="text-sm font-medium">Import JSON Backup</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        id="backup-import"
                        type="file" 
                        accept=".json"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        className="input-professional"
                      />
                      <Button 
                        onClick={handleImportData} 
                        disabled={!importFile || importing}
                        variant="outline"
                        className="btn-secondary"
                      >
                        {importing ? "Importing..." : "Import"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CSV Bulk Import */}
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-[hsl(var(--professional-blue))]" />
                <div>
                  <h3 className="text-lg font-bold">CSV Bulk Import</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] font-normal">Import data from CSV files</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Import data from CSV files. Supported formats: Leads, Clients, and Lots.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
                    <h4 className="font-medium text-[hsl(var(--foreground))] mb-2">Import Leads CSV</h4>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
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
                      className="input-professional"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
                    <h4 className="font-medium text-[hsl(var(--foreground))] mb-2">Import Clients CSV</h4>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
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
                      className="input-professional"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
                    <h4 className="font-medium text-[hsl(var(--foreground))] mb-2">Import Lots CSV</h4>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
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
                      className="input-professional"
                    />
                  </div>
                </div>
              </div>
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
