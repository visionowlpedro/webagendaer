import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { CheckoutService } from '../../../providers/service/checkout-service';
import { Functions } from '../../../providers/service/functions';
import { Values } from '../../../providers/service/values';
import { ModalController } from 'ionic-angular';
import { OrderSummary } from '../order-summary/order-summary';
import { TermsCondition } from '../terms-condition/terms-condition';
import { ChangeAddressForm } from '../change-address/change-address-form';

@Component({
    templateUrl: 'billing-address-form.html'
})
export class BillingAddressForm {
    billingAddressForm: any;
    billing: any;
    regions: any;
    status: any;
    errorMessage: any;
    address: any;
    form: any;
    states: any;
    OrderReview: any;
    loginData: any;
    id: any;
    couponStatus: any;
    showCreateAccont: boolean = false;
    buttonSubmit: boolean = false;
    buttonSubmitLogin: boolean = false;
    PlaceOrder: any;
    buttonText1: any;
    LogIn: any;
    mydate: any;
    time: any;
    date: any;
    selectedDate: any;
    shipping: any;
    order: any;
    buttonText : any;
    chosen_shipping: any;
    hour: any;
    showPasswordEnable: boolean = false;
    constructor(public modalCtrl: ModalController, public iab: InAppBrowser, public nav: NavController, public service: CheckoutService, params: NavParams, public functions: Functions, public values: Values) {
        this.PlaceOrder = "Fazer o pedido";
        this.buttonText1 = "Aplicar";
        this.LogIn = "LogIn";
        this.loginData = [];
        this.form = params.data;
        this.billing = {};
        this.billing.save_in_address_book = true;
        this.form.shipping = true;
        this.shipping = {};
        this.shipping.save_in_address_book = true;
        this.getRegion(this.form.billing_country);
        this.hour = new Date().getHours();
        this.hour = this.hour + 1;
        this.validateAddressForm();
    }
    getRegion(countryId) {
        this.states = this.form.state[countryId];
        this.service.updateOrderReview(this.form)
            .then((results) => this.handleOrderReviews(results));
    }
    handleOrderReviews(results){
      this.OrderReview = results;
      this.form.chosen_shipping = this.OrderReview.chosen_shipping;
    }
    changeRegion(countryId) {
        this.form.billing_state = "";
        this.states = this.form.state[countryId];
    }
    checkout() {
        this.buttonSubmit = true;
        this.PlaceOrder = "Faça o pedido";
        if (this.form.shipping) {
            this.form.shipping_first_name = this.form.billing_first_name;
            this.form.shipping_last_name = this.form.billing_last_name;
            this.form.shipping_company = this.form.billing_company;
            this.form.shipping_address_1 = this.form.billing_address_1;
            this.form.shipping_address_2 = this.form.billing_address_2;
            this.form.shipping_city = this.form.billing_city;
            this.form.shipping_country = this.form.billing_country;
            this.form.shipping_state = this.form.billing_state;
            this.form.shipping_postcode = this.form.billing_postcode;
        }
        if (this.form.payment_method == 'bacs' || this.form.payment_method == 'cheque' || this.form.payment_method == 'cod') {
            this.service.checkout(this.form)
                .then((results) => this.handleBilling(results));
        }
        else if (this.form.payment_method == 'stripe') {
            this.service.getStripeToken(this.form)
                .then((results) => this.handleStripeToken(results));
        }
        else {
            this.service.checkout(this.form)
                .then((results) => this.handlePayment(results));
        }
    }
    handlePayment(results) {
        if (results.result == 'success') {
            var options = "location=no,hidden=yes,toolbar=yes";
            let browser = this.iab.create(results.redirect, '_blank', options);
            browser.show();
            browser.on('loadstart').subscribe(data => {
                if (data.url.indexOf('order-received') != -1 && data.url.indexOf('return=') == -1) {
                    this.values.cart = [];
                    this.values.count = 0;
                    var str = data.url;
                    var pos1 = str.lastIndexOf("/order-received/");
                    var pos2 = str.lastIndexOf("/?key=wc_order");
                    var pos3 = pos2 - (pos1 + 16);
                    var order_id = str.substr(pos1 + 16, pos3);
                    this.nav.push(OrderSummary, order_id);
                    browser.hide();
                }
                else if (data.url.indexOf('cancel_order=true') != -1 || data.url.indexOf('cancelled=1') != -1 || data.url.indexOf('cancelled') != -1) {
                    browser.close();
                    this.buttonSubmit = false;
                }
            });
            browser.on('exit').subscribe(data => {
                this.buttonSubmit = false;
            });
        }
        else if (results.result == 'failure') {
            this.functions.showAlert("STATUS", results.messages);
            this.buttonSubmit = false;
        }
    }
    checkoutStripe() {
        this.buttonSubmit = true;
        this.PlaceOrder = "Fazendo o pedido";
        this.service.getStripeToken(this.form)
            .then((results) => this.handleStripeToken(results));
    }
    handleStripeToken(results) {
        if (results.error) {
            this.buttonSubmit = false;
            this.PlaceOrder = "Place Order";
            this.functions.showAlert("ERROR", results.error.message);
        }
        else {
            this.service.stripePlaceOrder(this.form, results)
                .then((results) => this.handleBilling(results));
                this.buttonSubmit = false;
        }
    }
    handleBilling(results) {
        if (results.result == "success") {
            var str = results.redirect;
            var pos1 = str.lastIndexOf("order-received/");
            var pos2 = str.lastIndexOf("?key=wc_order");
            var pos3 = pos2 - (pos1 + 15);
            var order_id = str.substr(pos1 + 15, pos3);
            this.nav.push(OrderSummary, order_id);
        }
        else if (results.result == "failure") {
            this.functions.showAlert("ERROR", results.messages);
        }
        this.buttonSubmit = false;
        this.PlaceOrder = "Fazer o pedido";
    }
    login() {
        if (this.validateForm()) {
            this.buttonSubmitLogin = true;
            this.LogIn = "Por favor, espere";
            this.service.login(this.form)
                .then((results) => this.handleResults(results));
        }
    }
    validateForm() {
        if (this.form.username == undefined || this.form.username == "") {
            return false
        }
        if (this.form.password == undefined || this.form.password == "") {
            return false
        }
        else {
            return true
        }
    }
    handleResults(results) {
        this.buttonSubmitLogin = false;
        this.LogIn = "LogIn";
        this.form.shipping = true;
        if (results.user_logged) {
            this.form = results;
            this.states = this.form.state[this.form.billing_country];
            this.values.isLoggedIn = results.user_logged;
            this.values.customerName = results.billing_first_name;
            this.values.customerId = results.user_id;
            this.values.logoutUrl = results.logout_url;
        }
        else {
            this.functions.showAlert("Erro", 'Nome de usuário ou senha inválidos. tente novamente');
        }
    }
    createAccount() {
        this.showCreateAccont = true;
    }
    changePayment() {
        this.form.payment_instructions = this.form.payment[this.form.payment_method].description;
        this.buttonSubmit = false;
        this.buttonText = "Continue com " + this.form.payment[this.form.payment_method].method_title;
    }

    terms(){
        this.nav.push(TermsCondition, this.form.terms_content);
    }
    updateShipping() {
        this.service.updateShipping(this.chosen_shipping)
            .then((results) => this.handleChanegShipping());
    }
    handleChanegShipping(){
        this.service.updateOrderReview(this.form)
            .then((results) => this.handleOrderReviews(results));
    }
    changeAddress(){
        let modal = this.modalCtrl.create(ChangeAddressForm, this.form);
            modal.onDidDismiss(data => {
             this.form = this.values.form;
             this.service.updateOrderReview(this.form)
                .then((results) => this.handleOrderReviews(results));
            });
        modal.present();
    }
    showPassword(){
        this.showPasswordEnable = true;
    }
    hidePassword(){
        this.showPasswordEnable = false;
    }
    validateAddressForm(){
        if(!this.form.billing_first_name || !this.form.billing_last_name || !this.form.billing_address_1 || !this.form.billing_city || !this.form.billing_postcode)
        this.changeAddress();
    }
    updateOrderReview() {
        this.service.updateOrderReview(this.form)
            .then((results) => this.handleOrderReviews(results));
    }
}
