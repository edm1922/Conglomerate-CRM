import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const DataDeletion: React.FC = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/data-deletion-instructions.md')
      .then(response => response.text())
      .then(text => {
        // Simple markdown to HTML conversion for headers and lists
        let html = text
          .replace(/^# (.*$)/gim, '<h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem;">$1</h1>')
          .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;">$1</h2>')
          .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem;">$1</h3>')
          .replace(/^\* (.*$)/gim, '<li style="margin-left: 1.5rem; list-style-type: disc;">$1</li>')
          .replace(/^\- (.*$)/gim, '<li style="margin-left: 1.5rem; list-style-type: disc;">$1</li>')
          .replace(/<li/g, '<ul style="margin-bottom: 1rem;"><li')
          .replace(/<\/li>/g, '</li></ul>')
          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*)\*/gim, '<em>$1</em>')
          .replace(/\[(.*)\]\((.*)\)/gim, '<a href="$2" style="color: #3b82f6; text-decoration: underline;">$1</a>')
          .replace(/\n\n/gim, '<br /><br />');
        
        setContent(html);
      })
      .catch(error => {
        console.error('Error loading data deletion instructions:', error);
        setContent('<p>Error loading data deletion instructions. Please try again later.</p>');
      });
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', lineHeight: 1.6, color: '#333', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Data Deletion Instructions</h1>
          <Link to="/" style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', textDecoration: 'none', color: '#374151', backgroundColor: 'white' }}>
            Back to Home
          </Link>
        </div>
        
        <div 
          style={{ fontSize: '1.125rem' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default DataDeletion;