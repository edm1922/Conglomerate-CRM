import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const DataDeletion: React.FC = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/data-deletion-instructions.md')
      .then(response => response.text())
      .then(text => {
        // Simple markdown to HTML conversion for headers and lists
        let html = text
          .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
          .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
          .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
          .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
          .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
          .replace(/<li/g, '<ul class="mb-4"><li')
          .replace(/<\/li>/g, '</li></ul>')
          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*)\*/gim, '<em>$1</em>')
          .replace(/\[(.*)\]\((.*)\)/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
          .replace(/\n\n/gim, '<br /><br />');
        
        setContent(html);
      })
      .catch(error => {
        console.error('Error loading data deletion instructions:', error);
        setContent('<p>Error loading data deletion instructions. Please try again later.</p>');
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Deletion Instructions</h1>
        <Link to="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
      
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default DataDeletion;