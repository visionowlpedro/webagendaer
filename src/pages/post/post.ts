import { Component } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';
import { NavController, FabContainer, LoadingController, NavParams } from 'ionic-angular';
import {Service} from '../../providers/service/service';

@Component({
  templateUrl: 'post.html'
})
export class Post {

  id: any;
  post: any;
  relatedPostsLoader : boolean = false;
  relatedPosts: any;
  item: any;
  form: any;
  status: any;
  message: any;
  name: any;
  url: any;
  image: any;

  constructor(
    public nav: NavController,
    public loadingCtrl: LoadingController,
    public service: Service,
    public params: NavParams,
    private socialSharing: SocialSharing
    ) {
    this.form = [];
    this.post = params.data;
    this.id = params.data.id;
    this.service.getPost(this.id)
       .then((results) => this.handlePostResults(results));
  }
  handlePostResults(results) {
      this.post = results;
      results.post.newdate = results.post.date.replace(/ /g, "T");
      this.relatedPostsLoader = false;
  }
  getPost(id, name) {
      this.item = [];
      this.item.id = id;
      this.item.name = name;
      this.nav.push(Post, this.item);
  }
  shareWithFb(post, network: string, fab: FabContainer) {
      // this is the complete list of currently supported params you can pass to the plugin (all optional)
      this.message = post.title; // not supported on some apps (Facebook, Instagram)
      this.image = post.thumbnail; // fi. for email
      // files: ['', ''], // an array of filenames either locally or remotely
      this.url = post.url;
      // chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
      let loading = this.loadingCtrl.create({
          content: `Posting to ${network}`,
          duration: (Math.random() * 1000) + 500
      });
      loading.present();
      loading.onWillDismiss(() => {
          fab.close();
      });
      this.socialSharing.shareViaFacebook(this.message, this.image, this.url);
  }
  shareWithTw(post, network: string, fab: FabContainer) {
      // this is the complete list of currently supported params you can pass to the plugin (all optional)
      this.message = post.title; // not supported on some apps (Facebook, Instagram)
      this.image = post.thumbnail; // fi. for email
      // files: ['', ''], // an array of filenames either locally or remotely
      this.url = post.url;
      // chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
      let loading = this.loadingCtrl.create({
          content: `Posting to ${network}`,
          duration: (Math.random() * 1000) + 500
      });
      loading.present();
      loading.onWillDismiss(() => {
          fab.close();
      });
      this.socialSharing.shareViaTwitter(this.message, this.image, this.url);
  }
  shareWithGmail(post) {
      // this is the complete list of currently supported params you can pass to the plugin (all optional)
      this.message = post.title; // not supported on some apps (Facebook, Instagram)
      this.image = post.thumbnail; // fi. for email
      // files: ['', ''], // an array of filenames either locally or remotely
      this.url = post.url;
      // chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
      this.socialSharing.shareViaEmail(this.url, this.message, [this.image]);
  }
  shareWithWhatsapp(post, network: string, fab: FabContainer) {
      // this is the complete list of currently supported params you can pass to the plugin (all optional)
      this.message = post.title; // not supported on some apps (Facebook, Instagram)
      this.image = post.thumbnail; // fi. for email
      // files: ['', ''], // an array of filenames either locally or remotely
      this.url = post.url;
      // chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
      let loading = this.loadingCtrl.create({
          content: `Posting to ${network}`,
          duration: (Math.random() * 1000) + 500
      });
      loading.onWillDismiss(() => {
          fab.close();
      });
      loading.present();
      this.socialSharing.shareViaWhatsApp(this.message, this.image, this.url);
  }
}
