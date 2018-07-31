import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Values } from '../../../providers/service/values';
import { Config } from '../../../providers/service/config';
import { Service } from '../../../providers/service/service';
import { Functions } from '../../../providers/service/functions';
import { OneSignal } from '@ionic-native/onesignal';
import { Platform } from 'ionic-angular';
import { Blog } from '../../blog/blog';
import { MapPage } from '../../map/map';
import { Address } from '../address/address';
import { TermsCondition } from '../../checkout/terms-condition/terms-condition';
import { WishlistPage } from '../wishlist/wishlist';
import { AccountForgotten } from '../forgotten/forgotten';
import { AppRate } from '@ionic-native/app-rate';
import { SocialSharing } from '@ionic-native/social-sharing';
import { EmailComposer } from '@ionic-native/email-composer';
// import { Facebook } from '@ionic-native/facebook';
//import { GooglePlus } from '@ionic-native/google-plus';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class Login {
    loginData: any;
    LogIn: any;
    account: any;
    form: any;
    showLogin: boolean = false;
    registerData: any;
    loadRegister: any;
    errors: any;
    loginStatus: any;
    country: any;
    billing_states: any;
    shipping_states: any;
    Register: any;
    countries: any;
    status: any;
    disableSubmit: boolean = false;
    error: any;
    facebookSpinner: boolean = false;
    googleSpinner: boolean = false;
    segment = 'Login';
    showPasswordEnable: boolean = false;
    constructor(public platform: Platform, public nav: NavController, public values: Values, public config: Config, private oneSignal: OneSignal, public service: Service, public functions: Functions, public translateService: TranslateService, private emailComposer: EmailComposer, private appRate: AppRate, private socialSharing: SocialSharing/*, private googlePlus: GooglePlus,, private fb: Facebook*/ ) {
        this.loginData = [];
        this.LogIn = "LogIn";
        this.account = "loginSegment";
        this.form = {};
        this.Register = "Register Account";
        this.registerData = {};
        this.countries = {};
        this.registerData.billing = {};
        this.registerData.shipping = {};
        this.service.getNonce().then((results) => this.handleServiceResults(results));
    }
    handleServiceResults(results) {
        this.countries = results;
    }
    login() {
        if (this.validateForm()) {
            this.disableSubmit = true;
            this.LogIn = "Logging In";
            this.service.login(this.loginData).then((results) => this.handleResults(results));
        }
    }
    validateForm() {
        if (this.loginData.username == undefined || this.loginData.username == "") {
            return false
        }
        if (this.loginData.password == undefined || this.loginData.password == "") {
            return false
        } else {
            return true
        }
    }
    handleResults(results) {
        this.disableSubmit = false;
        this.LogIn = "LogIn";
        if (!results.errors) {
            this.functions.showAlert('successo', 'Você fez login com sucesso');
        } else if (results.errors) {
            this.functions.showAlert('erro', 'nome de usuário/senha inválidos');
        }
    }
    orders() {
        this.nav.parent.select(2);
    }
    address() {
        this.nav.push(Address);
    }
    aboutUs() {
        this.nav.push(MapPage);
    }
    terms() {
        this.nav.push(TermsCondition);
    }
    blog(data) {
        this.nav.push(Blog, data);
    }
    logout() {
        this.values.isLoggedIn = false;
        this.service.logout();
    }
    wishlist() {
        this.nav.push(WishlistPage);
    }
    forgotten(loginData) {
        this.nav.push(AccountForgotten);
    }
    getBillingRegion(countryId) {
        this.billing_states = this.countries.state[countryId];
    }
    getShippingRegion(countryId) {
        this.shipping_states = this.countries.state[countryId];
    }
    validateRegisterForm() {
        if (this.registerData.first_name == undefined || this.registerData.firstname == "") {
            this.functions.showAlert("ERRO", "Por favor, digite o nome completo");
            return false
        }
        if (this.registerData.email == undefined || this.registerData.email == "") {
            this.functions.showAlert("ERRO", "Por favor insira o ID do email");
            return false
        }
        if (this.registerData.password == undefined || this.registerData.password == "") {
            this.functions.showAlert("ERRO", "Por favor digite a senha");
            return false
        }
        this.registerData.username = this.registerData.first_name;
        this.registerData.billing.email = this.registerData.email;
        this.registerData.billing.first_name = this.registerData.first_name;
        this.registerData.shipping.first_name = this.registerData.first_name;
        return true;
    }
    registerCustomer() {
        if (this.validateRegisterForm()) {
            this.disableSubmit = true;
            this.Register = "Registrando...";
            this.service.registerCustomer(this.registerData).then((results) => this.handleRegister(results));
        }
    }
    handleRegister(results) {
        if (!results.code) {
            this.Register = "Logando...";
            this.countries.checkout_login;
            this.service.login(this.registerData).then((results) => {
                this.loginStatus = results;
                this.disableSubmit = false;
            });
            if (this.platform.is('cordova')) {
                this.oneSignal.sendTags({
                    email: this.registerData.email,
                    pincode: this.registerData.billing_address.postcode,
                    city: this.registerData.billing_address.city
                });
            }
            this.nav.setRoot(Login);
        } else if (results.code) {
            this.disableSubmit = false;
            this.functions.showAlert("ERROR", results.message);
        }
    }
    // facebookLogin() {
    //     this.facebookSpinner = true;
    //     this.fb.login(['email']).then((response) => {
    //         console.log(response.authResponse.accessToken);
    //         this.service.sendToken(response.authResponse.accessToken).then((results) => {
    //             this.facebookSpinner = false;
    //             //this.functions.showAlert('success', 'Logged in sus');
    //             //this.nav.pop();
    //         });
    //     }).catch((err) => {
    //         console.error(err)
    //         this.facebookSpinner = false;
    //         this.functions.showAlert('Error', err);
    //     });
    // }
  /*  gmailLogin() {
        this.googleSpinner = true;
        this.googlePlus.login({
            'scopes': '',
            'webClientId': this.config.webClientId,
            'offline': true
        }).then((res) => {
            //this.functions.showAlert("er", res);
            this.googleSpinner = false;
            this.values.avatar = res.imageUrl;
            this.service.googleLogin(res).then((results) => {
                //this.functions.showAlert('success', 'Logged in sus');
                //this.nav.pop();
            });
            console.log(res);
        }).catch((err) => {
            this.error = err;
            this.googleSpinner = false;
            console.error(err);
        });
    }*/
    updateSchedule() {
        if (this.showLogin) {
            this.showLogin = false;
        } else {
            this.showLogin = true;
        }
    }
    showPassword() {
        this.showPasswordEnable = true;
    }
    hidePassword() {
        this.showPasswordEnable = false;
    }
    rateApp() {
        this.appRate.preferences.storeAppURL = {
            ios: this.config.appRateIosAppId,
            android: this.config.appRateAndroidLink,
            windows: 'ms-windows-store://review/?ProductId=' + this.config.appRateWindowsId
        };
        this.appRate.promptForRating(true);
    }
    shareApp() {
        var options = {
            message: this.config.shareAppMessage,
            subject: this.config.shareAppSubject,
            files: ['', ''],
            url: this.config.shareAppURL,
            chooserTitle: this.config.shareAppChooserTitle
        }
        this.socialSharing.shareWithOptions(options);
    }
    contact() {
        let email = {
            to: this.config.supportEmail,
            subject: '',
            body: '',
            isHtml: true
        };
        this.emailComposer.open(email);
    }
}
