import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Service } from '../providers/service/service';
import { Values } from '../providers/service/values';
import { Config}  from '../providers/service/config';
import { TranslateService } from '@ngx-translate/core';
import { TabsPage } from '../pages/tabs/tabs';
import { ProductsPage } from '../pages/products/products';
import { ProductPage } from '../pages/product/product';
import { OneSignal } from '@ionic-native/onesignal';
import { Network } from '@ionic-native/network';
import { Post } from '../pages/post/post';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage:any = TabsPage;
  status: any;
  configuration: any;
  items: any = {};
  constructor(statusBar: StatusBar, splashScreen: SplashScreen, private oneSignal: OneSignal, public config: Config, private network: Network, public alertCtrl: AlertController, public platform: Platform, public service: Service, public values: Values, public translateService: TranslateService) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
      // statusBar.overlaysWebView(true);
      statusBar.backgroundColorByHexString('#ffffff');

      if(this.config.appDir == 'rtl')
      this.platform.setDir('rtl', true);
      this.translateService.setDefaultLang(this.config.language);

      if(platform.is('cordova')){
            this.oneSignal.startInit(this.config.oneSignalAppId, this.config.googleProjectId);
            this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
            this.oneSignal.handleNotificationReceived().subscribe(result => {
             console.log(result);
            });
            this.oneSignal.handleNotificationOpened().subscribe(result => {
                if(result.notification.payload.additionalData.category){
                  this.items.id = result.notification.payload.additionalData.category;
                  this.nav.push(ProductsPage, this.items);
                }
                else if(result.notification.payload.additionalData.product){
                  this.items.id = result.notification.payload.additionalData.product;
                  this.nav.push(ProductPage, this.items.id);
                } else if (result.notification.payload.additionalData.post) {
                    this.items.id = result.notification.payload.additionalData.post;
                    this.nav.push(Post, {id: this.items.id});
                }
            });
            this.oneSignal.endInit();
      }
      this.network.onDisconnect().subscribe(() => {
          console.log('network was disconnected :-(');
          let alert = this.alertCtrl.create({
              title: 'Sem internet!',
              subTitle: 'Não há conexão de internet funcionando.',
              buttons: ['OK']
          });
          alert.present();
      });
      this.network.onConnect().subscribe(() => {
          this.service.load()
              .then((results) => this.configuration = results);
      });
    });
  }
}
