import { Component , ViewChild, ElementRef } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import {
  Filesystem,
  Directory,
  Encoding,
  FilesystemDirectory,
} from '@capacitor/filesystem';
import {
  FilePicker,
  PickMediaOptions,
  PickVideosOptions,
} from '@capawesome/capacitor-file-picker';
import {
  VideoEditor,
  MediaFileResult,
} from '@whiteguru/capacitor-plugin-video-editor';
// import { FilePath } from '@awesome-cordova-plugins/file-path/ngx';
import {
  MediaCapture,
  CaptureAudioOptions,
  CaptureVideoOptions,
} from '@awesome-cordova-plugins/media-capture';

import { File } from '@awesome-cordova-plugins/file/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
// import { Media, MediaPlugin } from '@capacitor-community/media';
import { Plugins } from '@capacitor/core';
const { Media } = Plugins;


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // @ViewChild('myVideo', { static: false }) videoElement: ElementRef | any;
  @ViewChild('myVideo') videoElement: ElementRef|any;
  video: any;
  keys: any;
  percentage: any = 0.0;
  videoPath: any;
  videoDetails: any;
  recordedVideoDetails: any ={width: 720 , height: 480 };
  width: any;
  height: any;
  end: any;
  start: any;
  type: any = 'pick';
  trim : boolean = false;
  transcode : boolean = false;
  recordedVideoTrim : boolean = false;
  recordedVideoTranscode : boolean = false;
  sourcePath: any;
  recordedSourcePath: any;
  recordedVideoPath: any;
  vidElement: HTMLVideoElement | any;
  recordVideoWidth: any = 480;
  recordVideoHeight: any = 720;
  recordVideoEnd: any;
  recordVideoStart : any = 0;
  recordVideoEndChanged: boolean = false;

  constructor(
    private platform: Platform,
    private file: File,
    // private filePath: FilePath,
    private loadingController: LoadingController,
    private androidPermissions: AndroidPermissions,
    private alertController: AlertController
  ) {
    
  }

  async checkAndRequestExternalStoragePermission() {
    const hasPermission = await this.androidPermissions.checkPermission(
      this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
    );
    console.log({ hasPermission });
    if (!hasPermission.hasPermission) {
      // Permission is not granted, explain and request permission
      const rationale =
        'We need the external storage permission to save files.';
      this.showPermissionExplanation(rationale);
    } else {
      this.recordVideo();
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
      await this.androidPermissions.requestPermission(
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
      );
      console.log(
        this.androidPermissions.checkPermission(
          this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        )
      );
      // Permission granted, handle as needed
      console.log('Permission granted');
      this.recordVideo();
    } catch (error) {
      // Handle errors, or user denied permission
      console.error(error);
    }
  }

  transcodeValue(ev:any){
    console.log("Trans:",{ev})
    this.transcode = ev.detail.checked
  }

  trimValue(ev:any){
    console.log("Trim:",{ev})
    this.trim = ev.detail.checked
  }

  transcodeValueRecord(ev:any){
    console.log("Trans:",{ev})
    this.recordedVideoTranscode = ev.detail.checked
  }

  trimValueRecord(ev:any){
    console.log("Trim:",{ev})
    this.recordedVideoTrim = ev.detail.checked
  }

  public async pickVideo(): Promise<void> {
    const { files } = await FilePicker.pickVideos();
    console.log({ files });



    let array: any = files[0].path?.split('/name');
    this.videoDetails = files[0];
    this.width = this.videoDetails.width;
    this.height = this.videoDetails.height;
    this.end = this.videoDetails.end;
    this.start = 0;
    console.log({ array });
    let pathWithoutContent = 'file://';
    let sourcePath = `${pathWithoutContent}${array[1]}`;
    console.log({ sourcePath });
    this.sourcePath = sourcePath;
    this.videoPath = Capacitor.convertFileSrc(sourcePath); 
  

  }

  getVideoLength() {
    const video: HTMLVideoElement = this.videoElement.nativeElement;
    console.log({video})
    this.recordVideoEnd  = video.duration

    console.log(this.recordVideoWidth)
    console.log(this.recordVideoHeight)
    console.log(this.recordVideoEnd)
    this.recordVideoEndChanged = true
  }

  accordionGroupChange(ev:any){
    console.log({ev});
    if(!this.recordVideoEndChanged) return this.getVideoLength()
  }

  async recordVideo() {
    this.platform.ready().then(async () => {
      try {
        console.log("Record Video Details:",this.recordedVideoDetails)
        this.recordedVideoDetails['width'] = 720;
        this.recordedVideoDetails['height'] = 480;
        const videoOptions: CaptureVideoOptions = { limit: 1  };

        // const audioMedia = await MediaCapture.captureAudio(audioOptions);
        const videoMedia = await MediaCapture.captureVideo(videoOptions).then(
          async (result: any) => {
            console.log({ result });
            console.log(result[0].fullPath);

            // const loading = await this.loadingController.create({
            //   message: 'Processing......' + this.percentage,
            // });
            // await loading.present();
            // // Transcode with progress
            // const progressListener = await VideoEditor.addListener(
            //   'transcodeProgress',
            //   (info) => {
            //     console.log('info', info);
            //     this.percentage = info;
            //     loading.message = `Processing ... ${(
            //       info.progress * 100
            //     ).toFixed()}%`;
            //   }
            // );

            let sourcePath = result[0].fullPath;
            this.recordedSourcePath = sourcePath;
            this.recordedVideoPath = Capacitor.convertFileSrc(sourcePath); 

            // const video: HTMLVideoElement = this.videoElement.nativeElement;
            // console.log({video})
            // alert(video.duration);
          
            // this.getVideoLength()
            // VideoEditor.edit({
            //   path: sourcePath,
            //   transcode: {
            //     width: this.videoDetails.width,
            //     height: this.videoDetails.height ,
            //     keepAspectRatio: true,
            //   },
            //   trim: {
            //     startsAt: 3 * 1000, // from 00:03
            //     endsAt: 10 * 1000, // to 00:10
            //   },
            // }).then(
            //   async (mediaFileResult: MediaFileResult) => {
            //     progressListener.remove();
            //     console.log('mediaPath', mediaFileResult.file.path);
            //     console.log('Result:', mediaFileResult);
            //     this.copyVideoToPermanentStorage(mediaFileResult);
            //   },
            //   async (error) => {
            //     await this.loadingController.dismiss();
            //     console.error('error', error);
            //   }
            // );
          }
        );
        // console.log('Captured audio:', audioMedia);
        console.log('Captured video:', videoMedia);

        // Handle the captured media as needed
      } catch (error) {
        console.error('Error capturing media:', error);
      }
    });
  }


  async process(){

    console.log("Trim and transcode:",this.trim,this.transcode)

    if(this.trim && this.transcode){
   const loading = await this.loadingController.create({
      message: 'Processing......' + this.percentage,
    });
    await loading.present();
    // Transcode with progress
    const progressListener = await VideoEditor.addListener(
      'transcodeProgress',
      (info) => {
        console.log('info', info);
        this.percentage = info;
        loading.message = `Processing ... ${(info.progress * 100).toFixed()}%`;
      }
    );

    VideoEditor.edit({
      path: this.sourcePath,
      transcode: {
        width: this.width,
        height: this.height,
        keepAspectRatio: true,
      },
      trim: {
        startsAt: this.start * 1000, // from 00:03
        endsAt: this.end * 1000, // to 00:10
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

    if(this.trim && !this.transcode){
       const loading = await this.loadingController.create({
      message: 'Processing......' + this.percentage,
    });
    await loading.present();
    // Transcode with progress
    const progressListener = await VideoEditor.addListener(
      'transcodeProgress',
      (info) => {
        console.log('info', info);
        this.percentage = info;
        loading.message = `Processing ... ${(info.progress * 100).toFixed()}%`;
      }
    );

    VideoEditor.edit({
      path: this.sourcePath,
      trim: {
        startsAt: this.start * 1000, // from 00:03
        endsAt: this.end * 1000, // to 00:10
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

    if(!this.trim && this.transcode){
       const loading = await this.loadingController.create({
      message: 'Processing......' + this.percentage,
    });
    await loading.present();
    // Transcode with progress
    const progressListener = await VideoEditor.addListener(
      'transcodeProgress',
      (info) => {
        console.log('info', info);
        this.percentage = info;
        loading.message = `Processing ... ${(info.progress * 100).toFixed()}%`;
      }
    );

    VideoEditor.edit({
      path: this.sourcePath,
      transcode: {
        width: this.width,
        height: this.height,
        keepAspectRatio: true,
      }
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

 
  }

  async recordProcess(){

    console.log("Trim and transcode:",this.recordedVideoTrim,this.recordedVideoTranscode)

    if(this.recordedVideoTrim && this.recordedVideoTranscode){
   const loading = await this.loadingController.create({
      message: 'Processing......' + this.percentage,
    });
    await loading.present();
    // Transcode with progress
    const progressListener = await VideoEditor.addListener(
      'transcodeProgress',
      (info) => {
        console.log('info', info);
        this.percentage = info;
        loading.message = `Processing ... ${(info.progress * 100).toFixed()}%`;
      }
    );

    VideoEditor.edit({
      path: this.recordedSourcePath,
      transcode: {
        width: this.recordVideoWidth,
        height: this.recordVideoHeight,
        keepAspectRatio: true,
      },
      trim: {
        startsAt: this.recordVideoStart * 1000, // from 00:03
        endsAt: this.recordVideoEnd * 1000, // to 00:10
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

    if(this.recordedVideoTrim && !this.recordedVideoTranscode){
       const loading = await this.loadingController.create({
      message: 'Processing......' + this.percentage,
    });
    await loading.present();
    // Transcode with progress
    const progressListener = await VideoEditor.addListener(
      'transcodeProgress',
      (info) => {
        console.log('info', info);
        this.percentage = info;
        loading.message = `Processing ... ${(info.progress * 100).toFixed()}%`;
      }
    );

    VideoEditor.edit({
      path: this.recordedSourcePath,
      trim: {
        startsAt: this.recordVideoStart * 1000, // from 00:03
        endsAt: this.recordVideoEnd * 1000, // to 00:10
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

    if(!this.recordedVideoTrim && this.recordedVideoTranscode){
       const loading = await this.loadingController.create({
      message: 'Processing......' + this.percentage,
    });
    await loading.present();
    // Transcode with progress
    const progressListener = await VideoEditor.addListener(
      'transcodeProgress',
      (info) => {
        console.log('info', info);
        this.percentage = info;
        loading.message = `Processing ... ${(info.progress * 100).toFixed()}%`;
      }
    );

    VideoEditor.edit({
      path: this.recordedSourcePath,
      transcode: {
        width: this.recordVideoWidth,
        height: this.recordVideoHeight,
        keepAspectRatio: true,
      }
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

 
  }

  async copyVideoToPermanentStorage(mediaFileResult: any) {
    const sourcePath = mediaFileResult.file.path;
    const destinationPath =
      Directory.Documents + '/chan/' + mediaFileResult.file.name;
    console.log('Destination path:', destinationPath);

    Filesystem.mkdir({
      directory: Directory.Documents,
      path: '/chan',
      recursive: true,
    })
      .then((result) => {
        console.log('Directory created successfully!', result);
      })
      .catch((error) => {
        console.log('MkDir Error:', error);
      });
    try {
      // Read the source file
      const sourceFile = await Filesystem.readFile({ path: sourcePath });
      console.log({ destinationPath });
      console.log('Directory.Documents:', Directory.Documents);

      // Write the file to the root directory of external storage
      await Filesystem.writeFile({
        path: destinationPath,
        data: sourceFile.data,
        directory: Directory.ExternalStorage,
      }).then(async (wrotePath: any) => {
        await this.loadingController.dismiss();
        alert(`Processed File Stored in ${wrotePath.uri}`);
      });

      // Notify the user or perform any additional actions as needed.
    } catch (error) {
      await this.loadingController.dismiss();

      console.error(
        'Error copying the video to the main external storage directory:',
        error
      );
    }
  }
}


