import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'prescription/new/:patientId',
    renderMode: RenderMode.Server
  },
  {
    path: 'prescription/edit/:prescriptionId',
    renderMode: RenderMode.Server
  },
  {
    path: 'prescription/view/:prescriptionId',
    renderMode: RenderMode.Server
  },
  {
    path: 'prescription/print/:prescriptionId',
    renderMode: RenderMode.Server
  },
  {
    path: 'prescription/templates',
    renderMode: RenderMode.Client
  },
  {
    path: 'booking/schedule',
    renderMode: RenderMode.Client
  },

  {
    path: 'prescription/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'booking/**',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
