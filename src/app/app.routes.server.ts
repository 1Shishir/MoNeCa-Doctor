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
    path: 'auth/login',
    renderMode: RenderMode.Server
  },
  {
    path: 'auth/signup',
    renderMode: RenderMode.Server
  },
  {
    path: 'auth/forgot-password',
    renderMode: RenderMode.Server
  },

  // Dashboard Routes (Server Rendered for Initial Load)
  {
    path: 'dashboard',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/overview',
    renderMode: RenderMode.Server
  },

  // Patient Management Routes (Server Rendered)
  {
    path: 'patients',
    renderMode: RenderMode.Server
  },
  {
    path: 'patient-details/:patientId',
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

  // Booking Routes
  {
    path: 'booking/schedule',
    renderMode: RenderMode.Server
  },
  {
    path: 'booking/create',
    renderMode: RenderMode.Server
  },

  // Health Data Routes
  {
    path: 'detailed-health-data/:patientId',
    renderMode: RenderMode.Server
  },

  // Admin Routes
  {
    path: 'admin/upload',
    renderMode: RenderMode.Server
  },

  // Catch-all Routes
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