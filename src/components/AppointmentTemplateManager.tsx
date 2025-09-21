import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  listAppointmentTemplates,
  createAppointmentTemplate,
  updateAppointmentTemplate,
  deleteAppointmentTemplate,
} from "@/services/appointment-templates";
import { AppointmentTemplate } from "@/types/appointment-templates";
import { AppointmentTemplateSchema } from "@/types/validation/appointment-templates";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AppointmentTemplateManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AppointmentTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["appointment_templates"],
    queryFn: listAppointmentTemplates,
  });

  const createMutation = useMutation({
    mutationFn: createAppointmentTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment_templates"] });
      setDialogOpen(false);
      setEditingTemplate(null);
      toast({ title: "Success", description: "Appointment template created." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AppointmentTemplate> }) =>
      updateAppointmentTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment_templates"] });
      setDialogOpen(false);
      setEditingTemplate(null);
      toast({ title: "Success", description: "Appointment template updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAppointmentTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment_templates"] });
      toast({ title: "Success", description: "Appointment template deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const result = AppointmentTemplateSchema.safeParse(data);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const errorMessages = Object.values(errors).flat().join("\n");
      toast({ title: "Error", description: errorMessages, variant: "destructive" });
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: result.data });
    } else {
      createMutation.mutate(result.data as Omit<AppointmentTemplate, 'id'>);
    }
  };

  return (
    <div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Manage Templates
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editingTemplate?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type" name="type" defaultValue={editingTemplate?.type} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" name="duration" type="number" defaultValue={editingTemplate?.duration} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={editingTemplate?.location} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" defaultValue={editingTemplate?.notes} />
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTemplate ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <p>Loading templates...</p>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span>{template.name} ({template.duration} min)</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(template);
                    setDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(template.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
