import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.69b4fe665020486fb3da624f19843e79',
  appName: 'vet-care-infinity',
  webDir: 'dist',
  server: {
    url: 'https://69b4fe66-5020-486f-b3da-624f19843e79.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'Camera is required to scan QR codes'
      }
    }
  }
};

export default config;