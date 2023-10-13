import { Component } from '@angular/core';
import { File } from '@awesome-cordova-plugins/file/ngx';

import { Filesystem, Directory, Encoding, FilesystemDirectory } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { VideoEditor, MediaFileResult } from '@whiteguru/capacitor-plugin-video-editor';
import { FilePath } from '@awesome-cordova-plugins/file-path/ngx';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  video: any;
  keys : any;

  constructor(
    private file :File ,
    private filePath : FilePath
  ) {}

    public async recordVideo(): Promise<void> {
      // const multiple = this.formGroup.get('multiple')?.value || false;
      // const readData = this.formGroup.get('readData')?.value || false;
      const { files } = await FilePicker.pickMedia();
      console.log({files})
    //   let contentPath : any = files[0].path ;
    //   console.log({contentPath})
    //   this.filePath.resolveNativePath(contentPath)
    //   .then(nativeFilePath => {
    //      console.log({nativeFilePath})
    //    // now do what you want with the filePath
    //   })
    // .catch(e => console.error("File Path error;",e));
      
      // Transcode with progress
const progressListener = await VideoEditor.addListener(
  'transcodeProgress',
  (info) => console.log('info', info)
);
      let array =  files[0].path?.split('/name') ? files[0].path?.split('/name') : 'file:///storage/emulated/0/Movies/Telegram/VID_20230819_223418_155.mp4'
      console.log({array})
      let pathWithoutContent  = 'file://'
      let sourcePath = `${pathWithoutContent}${array[1]}`
      VideoEditor.edit({
        path: sourcePath ,
        // path: 'file:///storage/emulated/0/Movies/Telegram/VID_20230819_223418_155.mp4',
        transcode: {
          width: 720,
          height: 480,
          keepAspectRatio: true,
        },
        trim: {
          startsAt: 3 * 1000, // from 00:03
          endsAt: 10 * 1000, // to 00:10
        },
      }).then(
        async (mediaFileResult: MediaFileResult) => {
          progressListener.remove();
      
          console.log('mediaPath', mediaFileResult.file.path);
          console.log("Result:",mediaFileResult)
          this.createParentDirectory(mediaFileResult)
        },
        (error) => {
          console.error('error', error);
        }
      );
      // this.files = files;
    }

    async  createParentDirectory(mediaFileResult:any) {
      // try {
        // await Filesystem.mkdir({
        //   path: 'app://my_videos', // Specify the parent directory path
        //   directory: FilesystemDirectory.Data, // Use the appropriate directory type
        //   recursive: true, // Set to true to create parent directories if they don't exist
        // });
    
        // The parent directory has been created.
        // Now, you can proceed to write the file.
        this.copyVideoToPermanentStorage(mediaFileResult); // Call your file copy function here
      // } catch (error) {
      //   console.error('Error creating parent directory:', error);
      // }
    }

    async copyVideoToPermanentStorage(mediaFileResult:any) {
      
      const sourcePath = mediaFileResult.file.path;
      const destinationPath = FilesystemDirectory.External+mediaFileResult.file.name; // Specify your desired location
      console.log('FilesystemDirectory.Data:',FilesystemDirectory.ExternalStorage)
      try {
        const sourceFile = await Filesystem.readFile({ path: sourcePath });
        await Filesystem.writeFile({ path: destinationPath, data: sourceFile.data, directory: FilesystemDirectory.External }); // Use the appropriate directory, e.g., Data, External, etc.
        
        // Notify the user or perform any additional actions as needed.
      } catch (error) {
        console.error('Error copying the video to permanent storage:', error);
      }
    }
    

}
