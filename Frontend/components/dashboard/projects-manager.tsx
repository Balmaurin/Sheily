"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Project = {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed';
  progress: number;
  tokens: number;
};

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'p1',
      name: 'Generador Semántico',
      description: 'Modelo de IA para generación de contenido semántico en español',
      status: 'in_progress',
      progress: 65,
      tokens: 750
    },
    {
      id: 'p2',
      name: 'Clasificador de Intenciones',
      description: 'Modelo para identificar intenciones en conversaciones de usuario',
      status: 'planning',
      progress: 20,
      tokens: 250
    }
  ]);

  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  const createProject = () => {
    if (!newProject.name || !newProject.description) return;

    const project: Project = {
      id: `p${projects.length + 1}`,
      name: newProject.name,
      description: newProject.description,
      status: 'planning',
      progress: 0,
      tokens: 100
    };

    setProjects(prev => [...prev, project]);
    setNewProject({ name: '', description: '' });
  };

  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { ...project, status, progress: status === 'completed' ? 100 : project.progress }
          : project
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-card/40 p-4 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Crear Nuevo Proyecto</h3>
        <div className="space-y-3">
          <input 
            type="text"
            value={newProject.name}
            onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre del Proyecto"
            className="w-full bg-bg/50 border border-border rounded-xl px-3 py-2 text-fg"
          />
          <textarea 
            value={newProject.description}
            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción del Proyecto"
            className="w-full bg-bg/50 border border-border rounded-xl px-3 py-2 text-fg h-24"
          />
          <Button 
            onClick={createProject}
            disabled={!newProject.name || !newProject.description}
            className="w-full"
          >
            Crear Proyecto
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Proyectos Actuales</h3>
        {projects.map((project) => (
          <Card key={project.id} className="bg-card/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{project.name}</CardTitle>
              <div 
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'planning' ? 'bg-yellow-500/20 text-yellow-500' :
                  project.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-green-500/20 text-green-500'
                }`}
              >
                {project.status === 'planning' ? 'Planificación' : 
                 project.status === 'in_progress' ? 'En Progreso' : 
                 'Completado'}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 mb-4">{project.description}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Progreso</span>
                <span className="text-sm text-primary">{project.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{width: `${project.progress}%`}}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/60">Tokens:</span>
                  <span className="text-primary font-bold">{project.tokens}</span>
                </div>
                <div className="space-x-2">
                  {project.status === 'planning' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateProjectStatus(project.id, 'in_progress')}
                    >
                      Iniciar
                    </Button>
                  )}
                  {project.status === 'in_progress' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateProjectStatus(project.id, 'completed')}
                    >
                      Completar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
