import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // {
  //   path: 'prescription/view/:prescriptionId',
  //   renderMode: RenderMode.Server
  // },
  // {
  //   path: 'prescription/new/:patientId',
  //   renderMode: RenderMode.Server
  // },
  // {
  //   path: 'prescription/edit/:prescriptionId',
  //   renderMode: RenderMode.Server
  // },
  // {
  //   path: 'prescription/print/:prescriptionId',
  //   renderMode: RenderMode.Server
  // },
   {
    path: 'prescription/**',
    renderMode: RenderMode.Server
  }, 
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
