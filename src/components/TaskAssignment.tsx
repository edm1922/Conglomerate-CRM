import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createTask, listTasks, updateTask } from "@/services/tasks";
import { listProfiles } from "@/services/auth";
import { Task, Profile } from "@/types/entities";

export default function TaskAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({ queryKey: ["tasks"], queryFn: listTasks });
  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery<Profile[]>({ queryKey: ["profiles"], queryFn: listProfiles });

  const createMutation = useMutation({ mutationFn: createTask, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); setDialogOpen(false); setEditingTask(null); toast({ title: "Success", description: "Task created." }); }, onError: (error: Error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => updateTask(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); setDialogOpen(false); setEditingTask(null); toast({ title: "Success", description: "Task updated." }); }, onError: (error: Error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); } });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>Create Task</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={editingTask?.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select name="assigned_to" defaultValue={editingTask?.assigned_to}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTask ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mt-4 space-y-2">
        {isLoadingTasks ? (
          <p>Loading tasks...</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
              <span>{task.title} - {task.profiles?.full_name ?? "Unassigned"}</span>
              <Button variant="outline" size="sm" onClick={() => { setEditingTask(task); setDialogOpen(true); }}>Edit</Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
