export const environment = {
    production: false,
    firebase: {
      apiKey: process.env['FIREBASE_API_KEY'] || '',
      authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || '',
      projectId: process.env['FIREBASE_PROJECT_ID'] || '',
      storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || '',
      messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || '',
      appId: process.env['FIREBASE_APP_ID'] || '',
      measurementId: process.env['FIREBASE_MEASUREMENT_ID'] || ''
    }
  };




  // export const environment = {
  //   production: false,
  //   firebase: {
  //     apiKey: import.meta.env.FIREBASE_API_KEY,
  //     authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  //     projectId: import.meta.env.FIREBASE_PROJECT_ID,
  //     storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
  //     messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  //     appId: import.meta.env.FIREBASE_APP_ID,
  //     measurementId: import.meta.env.FIREBASE_MEASUREMENT_ID,
  //   }
  // };

  
