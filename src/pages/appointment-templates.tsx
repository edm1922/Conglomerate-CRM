import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAppointmentTemplateSchema, UpdateAppointmentTemplateSchema, AppointmentTemplate } from "@/types/validation";
import { listAppointmentTemplates, createAppointmentTemplate, updateAppointmentTemplate, deleteAppointmentTemplate, onAppointmentTemplatesChange } from "@/services/appointmentTemplates";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export default function AppointmentTemplatesPage() {
  const [templates, setTemplates] = useState<AppointmentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AppointmentTemplate | null>(null);

  const form = useForm<AppointmentTemplate>({
    resolver: zodResolver(selectedTemplate ? UpdateAppointmentTemplateSchema : CreateAppointmentTemplateSchema),
    defaultValues: selectedTemplate || { template_name: "", title: "", type: "", duration: 60, location: "", notes: "" },
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      const templates = await listAppointmentTemplates();
      setTemplates(templates);
    };
    fetchTemplates();

    const subscription = onAppointmentTemplatesChange((payload) => {
      if (payload.eventType === "INSERT") {
        setTemplates((prev) => [...prev, payload.new]);
      } else if (payload.eventType === "UPDATE") {
        setTemplates((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)));
      } else if (payload.eventType === "DELETE") {
        setTemplates((prev) => prev.filter((t) => t.id !== payload.old.id));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    form.reset(selectedTemplate || { template_name: "", title: "", type: "", duration: 60, location: "", notes: "" });
  }, [selectedTemplate, form]);

  const onSubmit: SubmitHandler<AppointmentTemplate> = async (data) => {
    if (selectedTemplate) {
      await updateAppointmentTemplate(selectedTemplate.id, data);
    } else {
      await createAppointmentTemplate(data);
    }
    form.reset();
    setSelectedTemplate(null);
  };

  const handleDelete = async (id: string) => {
    await deleteAppointmentTemplate(id);
  };

  const handleSelectTemplate = (template: AppointmentTemplate) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{selectedTemplate ? "Edit" : "Create"} Appointment Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="template_name" render={({ field }) => <FormItem><FormLabel>Template Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="type" render={({ field }) => <FormItem><FormLabel>Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="duration" render={({ field }) => <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="notes" render={({ field }) => <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
              <Button type="submit">{selectedTemplate ? "Update" : "Create"}</Button>
              {selectedTemplate && <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Cancel</Button>}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {templates.map((template) => (
              <li key={template.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <div>{template.template_name}</div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleSelectTemplate(template)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(template.id)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
