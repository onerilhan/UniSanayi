import React from 'react';
import { Project } from '../types/Project';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div style={{ 
      background: '#fff', 
      border: '1px solid #e5e7eb', 
      borderRadius: 16, 
      padding: 16,
      marginBottom: 16
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{project.title}</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>{project.companyName}</div>
        </div>
        <span style={{ 
          fontSize: 12, 
          padding: '4px 8px', 
          borderRadius: 999, 
          background: '#ecfdf5', 
          color: '#065f46', 
          border: '1px solid #d1fae5' 
        }}>
          Aktif
        </span>
      </div>
      
      <p style={{ color: '#334155', margin: '8px 0 12px' }}>
        {project.projectType} — {project.durationDays} gün
      </p>
      
      <div style={{ display: 'flex', gap: 16, color: '#475569', fontSize: 14 }}>
        <span>📍 {project.locationCity || 'Belirtilmemiş'}</span>
        <span>💰 {project.budgetAmount?.toLocaleString('tr-TR') || 'Belirtilmemiş'} {project.currency || 'TL'}</span>
        <span>👁️ {project.viewCount} görüntülenme</span>
      </div>
      
      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <button style={{ 
          padding: '10px 14px', 
          borderRadius: 12, 
          border: 'none', 
          background: '#1e293b', 
          color: '#fff', 
          fontWeight: 700, 
          cursor: 'pointer' 
        }}>
          Detay Gör
        </button>
      </div>
    </div>
  );
}