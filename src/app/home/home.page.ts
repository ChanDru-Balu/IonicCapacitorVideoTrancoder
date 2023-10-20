import { Component } from '@angular/core';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import {
  Filesystem,
  Directory,
  Encoding,
  FilesystemDirectory
} from '@capacitor/filesystem';
import { FilePicker ,PickMediaOptions,PickVideosOptions } from '@capawesome/capacitor-file-picker';
import {
  VideoEditor,
  MediaFileResult,
} from '@whiteguru/capacitor-plugin-video-editor';
// import { FilePath } from '@awesome-cordova-plugins/file-path/ngx';
import { MediaCapture, CaptureAudioOptions, CaptureVideoOptions } from '@awesome-cordova-plugins/media-capture';

import { File } from '@awesome-cordova-plugins/file/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  video: any;
  keys: any;
  percentage: any = 0.0
  constructor(
    private platform : Platform,
    private file: File,
    // private filePath: FilePath,
    private loadingController: LoadingController,
    private androidPermissions: AndroidPermissions,
    private alertController: AlertController
  ) {}


  async checkAndRequestExternalStoragePermission() {
    const hasPermission = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
    console.log({hasPermission})
    if (!hasPermission.hasPermission) {
      // Permission is not granted, explain and request permission
      const rationale = 'We need the external storage permission to save files.';
      this.showPermissionExplanation(rationale);
    } else {
      this.recordVideo()
    }
  }
  
  async showPermissionExplanation(rationale: string) {
    const alert = await this.alertController.create({
      header: 'Permission Required',
      message: rationale,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            // Permission denied, handle as needed
            console.log('Permission denied');
          },
        },
        {
          text: 'Grant Permission',
          handler: () => {
            // Request the permission
            this.requestExternalStoragePermission();
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  async requestExternalStoragePermission() {
    try {
      await this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
      console.log(this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE))
      // Permission granted, handle as needed
      console.log('Permission granted');
      this.recordVideo()

    } catch (error) {
      // Handle errors, or user denied permission
      console.error(error);
    }

  }

  public async pickVideo(): Promise<void> {

    const { files } = await FilePicker.pickVideos();
    console.log({ files });

    const loading = await this.loadingController.create({
      message: 'Processing......'+this.percentage,
    });
    await loading.present();
    // Transcode with progress
    const progressListener = await VideoEditor.addListener(
      'transcodeProgress',
      (info) => {console.log('info', info);this.percentage = info;loading.message = `Processing ... ${(info.progress*100).toFixed()}%`;}
    );

    let array : any = files[0].path?.split('/name')
    console.log({ array });
    let pathWithoutContent = 'file://';
    let sourcePath = `${pathWithoutContent}${array[1]}`;
  
    VideoEditor.edit({
      path: sourcePath,
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
        console.log('Result:', mediaFileResult);
        this.copyVideoToPermanentStorage(mediaFileResult);
      },
      async (error) => {
        await this.loadingController.dismiss();
        console.error('error', error);
      }
    )

  } 

  async recordVideo(){
    this.platform.ready().then(async ()=>{
      try {
        const videoOptions: CaptureVideoOptions = { limit: 1, duration: 30 };
    
        // const audioMedia = await MediaCapture.captureAudio(audioOptions);
        const videoMedia = await MediaCapture.captureVideo(videoOptions).then(async (result: any)=>{
          console.log({result})
          console.log(result[0].fullPath)
          const loading = await this.loadingController.create({
            message: 'Processing......'+this.percentage,
          });
          await loading.present();
          // Transcode with progress
          const progressListener = await VideoEditor.addListener(
            'transcodeProgress',
            (info) => {console.log('info', info);this.percentage = info;loading.message = `Processing ... ${(info.progress*100).toFixed()}%`;}
          );
      
          let sourcePath = result[0].fullPath;
        
          VideoEditor.edit({
            path: sourcePath,
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
              console.log('Result:', mediaFileResult);
              this.copyVideoToPermanentStorage(mediaFileResult);
            },
            async (error) => {
              await this.loadingController.dismiss();
              console.error('error', error);
            }
          )

        })  
        // console.log('Captured audio:', audioMedia);
        console.log('Captured video:', videoMedia);
        
        // Handle the captured media as needed
      } catch (error) {
        console.error('Error capturing media:', error);
      }
    })
  }



  async copyVideoToPermanentStorage(mediaFileResult: any) {

    const sourcePath = mediaFileResult.file.path;
    const destinationPath = Directory.Documents+'/chan/' + mediaFileResult.file.name;
    console.log('Destination path:', destinationPath);

    Filesystem.mkdir({
      directory: Directory.Documents,
      path: "/chan",
      recursive: true
    }).then((result) => {
      console.log('Directory created successfully!',result);
    }).catch((error)=>{
      console.log("MkDir Error:",error);
    })
    try {
      // Read the source file
      const sourceFile = await Filesystem.readFile({ path: sourcePath });
      console.log({destinationPath})
      console.log('Directory.Documents:',Directory.Documents)

      // Write the file to the root directory of external storage
      await Filesystem.writeFile({
        path: destinationPath,
        data: sourceFile.data,
        directory:  Directory.ExternalStorage
      }).then(async (wrotePath:any)=>{
        await this.loadingController.dismiss();
        alert(`Processed File Stored in ${wrotePath.uri}`)
      })

  
      // Notify the user or perform any additional actions as needed.
    } catch (error) {
      await this.loadingController.dismiss();

      console.error('Error copying the video to the main external storage directory:', error);
    }
  }


}


// async createParentDirectory(mediaFileResult: any) {
//   // try {
//   // let fileCreated =  await Filesystem.mkdir({
//   //   path: 'app://my_videos', // Specify the parent directory path
//   //   directory: FilesystemDirectory.Data, // Use the appropriate directory type
//   //   recursive: true, // Set to true to create parent directories if they don't exist
//   // });
//   // console.log({fileCreated})
//   // The parent directory has been created.
//   // Now, you can proceed to write the file.
//   this.copyVideoToPermanentStorage(mediaFileResult); // Call your file copy function here
//   // } catch (error) {
//   //   console.error('Error creating parent directory:', error);
//   // }
// }
