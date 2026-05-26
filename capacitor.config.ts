import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.countdhikr.app.beta',
  appName: 'CountDhikr Beta',
  webDir: 'dist',
  
  // Development server for live reload
  // ⚠️ IMPORTANT: Comment out or remove this block before building production APK!
  /*
  server: {
    url: 'https://2d684afd-2394-4667-ab2b-42c63ccdd662.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
  */
};

export default config;
