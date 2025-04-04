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
 
  {
    path: 'auth/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'patient-signup/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Client
  },


  {
    path: 'patients/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'patient-details/**',
    renderMode: RenderMode.Client
  },

  {
    path: 'admin/upload',
    renderMode: RenderMode.Client
  },


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
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];