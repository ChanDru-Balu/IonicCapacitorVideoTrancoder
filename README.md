# IonicCapacitorVideoTrancoder

This code currently performs video transcoding with static height, width, trim start time, and trim end time values. 
For future development, all these values will be dynamically adjustable based on user input. 
This implementation is in an Ionic 7 app using Capacitor 5, utilizing the 'filePicker'(Capactitor) plugin for file selection, 
'media capture'(Cordova) plugin for video capturing and 'video transcoder'(Capactitor) for video transcoding on Android devices.

Done:
1. File Picker from gallery
2. Meida Capturing using Camera record
3. Transcode and Trimming the video for Static Values

To DO:
1. Play the video which is selecting or recording,
2. Choose the transcode quality ,
3. Choose the start time or end Time
4. paly the transcoded or trimmed video
