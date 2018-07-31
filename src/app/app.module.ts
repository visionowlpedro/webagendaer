import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

/*------------------------PAGES----------------------------------*/

import { Sort } from '../pages/sort/sort';
import { Post } from '../pages/post/post';
import { Home } from '../pages/home/home';
import { KeysPipe } from '../pipes/pipe';
import { Blog } from '../pages/blog/blog';
import { MapPage } from '../pages/map/map';
import { TabsPage } from '../pages/tabs/tabs';
import { CartPage } from '../pages/cart/cart';
import { Filter } from '../pages/filter/filter';
import { Login } from '../pages/account/login/login';
import { SearchPage } from '../pages/search/search';
import { ReviewPage } from '../pages/reviews/reviews';
import { ProductPage } from '../pages/product/product';
import { Orders } from '../pages/account/orders/orders';
import { AboutPage } from '../pages/account/about/about';
import { ProductsPage } from '../pages/products/products';
import { Address } from '../pages/account/address/address';
import { WishlistPage } from '../pages/account/wishlist/wishlist';
import { AccountForgotten } from '../pages/account/forgotten/forgotten';
import { OrderDetails } from '../pages/account/order-details/order-details';
import { OrderSummary } from '../pages/checkout/order-summary/order-summary';
import { TermsCondition } from '../pages/checkout/terms-condition/terms-condition';
import { ChangeAddressForm } from '../pages/checkout/change-address/change-address-form';
import { EditAddressForm } from '../pages/account/edit-address-form/edit-address-form';
import { BillingAddressForm } from '../pages/checkout/billing-address-form/billing-address-form';

/*------------------------Providers----------------------------------*/

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NativeStorage } from '@ionic-native/native-storage';
import { BrowserModule } from '@angular/platform-browser';
import { CartService } from '../providers/service/cart-service';
import { WishlistService } from '../providers/service/wishlist-service';
import { CategoryService } from '../providers/service/category-service';
import { CheckoutService } from '../providers/service/checkout-service';
import { Config } from '../providers/service/config';
import { Functions } from '../providers/service/functions';
import { ProductService } from '../providers/service/product-service';
import { SearchService } from '../providers/service/search-service';
import { Service } from '../providers/service/service';
import { Values } from '../providers/service/values';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
//import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SocialSharing } from '@ionic-native/social-sharing';
import { OneSignal } from '@ionic-native/onesignal';
import { Network } from '@ionic-native/network';
import { HTTP } from '@ionic-native/http';
import { AppRate } from '@ionic-native/app-rate';
import { EmailComposer } from '@ionic-native/email-composer';

// import { Facebook } from '@ionic-native/facebook';
//import { GooglePlus } from '@ionic-native/google-plus';



export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    KeysPipe,
    MyApp,
    Sort,
    Post,
    Home,
    Blog,
    MapPage,
    TabsPage,
    CartPage,
    Filter,
    Login,
    SearchPage,
    ReviewPage,
    ProductPage,
    Orders,
    AboutPage,
    ProductsPage,
    Address,
    WishlistPage,
    OrderSummary,
    AccountForgotten,
    TermsCondition,
    OrderDetails,
    ChangeAddressForm,
    EditAddressForm,
    BillingAddressForm

  ],

  imports: [
    BrowserModule,
   // LazyLoadImageModule,
    HttpClientModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Sort,
    Post,
    Home,
    Blog,
    MapPage,
    TabsPage,
    CartPage,
    Filter,
    Login,
    SearchPage,
    ReviewPage,
    ProductPage,
    Orders,
    AboutPage,
    ProductsPage,
    Address,
    WishlistPage,
    OrderSummary,
    AccountForgotten,
    TermsCondition,
    OrderDetails,
    ChangeAddressForm,
    EditAddressForm,
    BillingAddressForm

  ],


  providers: [
  CartService,
  WishlistService,
  CategoryService,
  CheckoutService,
  Config,
  Functions,
  ProductService,
  SearchService,
  Service,
  Values,
  //GooglePlus,
  // Facebook,
  StatusBar,
  SplashScreen,
  InAppBrowser,
  NativeStorage,
  SocialSharing,
  OneSignal,
  AppRate,
  EmailComposer,
  Network,
  HTTP,
  {provide: ErrorHandler, useClass: IonicErrorHandler}

  ]
})
export class AppModule {}
