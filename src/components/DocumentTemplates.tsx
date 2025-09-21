
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

interface DocumentTemplate {
  id: string;
  name: string;
  content: string;
}

const DocumentTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });

  const handleCreateTemplate = () => {
    if (newTemplate.name && newTemplate.content) {
      setTemplates([...templates, { ...newTemplate, id: Date.now().toString() }]);
      setNewTemplate({ name: '', content: '' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Create New Template</h3>
          <div className="space-y-2">
            <Input
              placeholder="Template Name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            />
            <Textarea
              placeholder="Template Content"
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
            />
            <Button onClick={handleCreateTemplate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Existing Templates</h3>
          <div className="space-y-2">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-md">
                <h4 className="font-semibold">{template.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{template.content}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentTemplates;
