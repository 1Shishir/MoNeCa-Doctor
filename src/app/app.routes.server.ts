// import { RenderMode, ServerRoute } from '@angular/ssr';

// export const serverRoutes: ServerRoute[] = [
//   {
//     path: 'prescription/new/:patientId',
//     renderMode: RenderMode.Server
//   },
//   {
//     path: 'prescription/edit/:prescriptionId',
//     renderMode: RenderMode.Server
//   },
//   {
//     path: 'prescription/view/:prescriptionId',
//     renderMode: RenderMode.Server
//   },
//   {
//     path: 'prescription/print/:prescriptionId',
//     renderMode: RenderMode.Server
//   },
//   {
//     path: 'prescription/templates',
//     renderMode: RenderMode.Client
//   },
//   {
//     path: 'booking/schedule',
//     renderMode: RenderMode.Client
//   },

//   {
//     path: 'prescription/**',
//     renderMode: RenderMode.Client
//   },
//   {
//     path: 'booking/**',
//     renderMode: RenderMode.Client
//   },
//   {
//     path: '**',
//     renderMode: RenderMode.Prerender
//   }
// ];
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Authentication Routes (Server Rendered)
  {
    path: 'auth/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'patient-signup/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Server
  },

  // Dashboard Routes (Server Rendered for Initial Load)
  {
    path: 'patients/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'patient-details/**',
    renderMode: RenderMode.Server
  },

  {
    path: 'admin/upload',
    renderMode: RenderMode.Server
  },

  // Prescription Routes with Specific Rendering Strategies
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
    renderMode: RenderMode.Server
  },

 
  {
    path: 'prescription/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'booking/**',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];