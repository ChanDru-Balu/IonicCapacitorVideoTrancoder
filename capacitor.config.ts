import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'chan.sandbox.i7mediaRec',
  appName: 'Media Recorder',
  webDir: 'www',
  server: {
    "url": "http://192.168.153.100:8100",
    "cleartext": true
   }
};

export default config;
