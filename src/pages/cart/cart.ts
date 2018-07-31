import { Component } from '@angular/core';
import { NavController, NavParams  } from 'ionic-angular';
import { CartService } from '../../providers/service/cart-service';
import { Values } from '../../providers/service/values';
import { Functions } from '../../providers/service/functions';
import { ProductPage } from '../product/product';
import { BillingAddressForm } from '../checkout/billing-address-form/billing-address-form';
import { ToastController } from 'ionic-angular';

@Component({
    templateUrl: 'cart.html'
})
export class CartPage {
    cart: any;
    status: any;
    obj: any;
    quantity: number;
    update: any;
    options: any;
    number: any;
    addProduct: boolean = true;
    coupon: any;
    a: any;
    disableSubmit: boolean = false;
    buttonCoupon: boolean = false;
    disableSubmitCoupon: boolean = false;
    chosen_shipping: any;
    shipping: any;
    Apply: any;
    Checkout: any;
    constructor(public nav: NavController, public service: CartService, public values: Values, public params: NavParams, public functions: Functions,private toastCtrl: ToastController) {
        this.Apply = "Aplicar";
        this.Checkout = "Finalizar Compra";
        this.quantity = 1;
        this.options = [];
        this.obj = params.data;
        this.service.loadCart()
            .then((results) => this.handleCartInit(results));
    }
    handleCartInit(results) {
        this.cart = results;
        this.values.cartItems = results;
        this.shipping = results.zone_shipping;
        this.chosen_shipping = results.chosen_shipping;
    }
    handleCart(results) {
        this.cart = results;
        this.values.cartItems = results;
    }
    delete(key) {
        this.service.deleteItem(key)
            .then((results) => this.handleCart(results));
        this.presentToast();

    }
    checkout() {
        this.disableSubmit = true;
        this.Checkout = "Por favor, espere";
        this.service.checkout()
            .then((results) => this.handleBilling(results));

    }
    handleBilling(results) {
        this.nav.push(BillingAddressForm, results);
        this.disableSubmit = false;
        this.Checkout = "Finalizar Compra";
    }
    presentToast() {
        let toast = this.toastCtrl.create({
          message: 'Removido com sucesso!',
          duration: 1500,
          position: 'bottom'
        });
        toast.present();
    }
    deleteFromCart(id, key, qty) {
        if(1 == qty){
            this.delete(key)
        }
        else
        this.service.deleteFromCart(id, key)
            .then((results) => this.handleCart(results));
        this.presentToast();
        
    }
    addToCart(id, key) {
        this.service.addToCart(id, key)
            .then((results) => this.handleCart(results));
    }
    updateCart(results) {
        this.service.loadCart()
            .then((results) => this.handleCart(results));
    }
    submitCoupon() {
        if (this.values.cartItems.coupon != undefined) {
            this.disableSubmitCoupon = true;
            this.Apply = "Apply";
            this.service.submitCoupon(this.values.cartItems.coupon)
                .then((results) => this.handleCoupon(results));
        }
    }
    removeCoupon() {
        this.service.removeCoupon(this.values.cartItems.applied_coupons)
            .then((results) => this.handleCoupon(results));
    }
    handleCoupon(results) {
        console.log(results);
        this.disableSubmitCoupon = false;
        this.Apply = "Aplicar";
        this.functions.showAlert("STATUS", results._body);
        this.service.loadCart()
            .then((results) => this.handleCart(results));
    }
    handleResults(res) {
        if (res.message.status == 'success') {
            this.functions.showAlert(res.message.status, res.message.text);
        }
        else {
            this.functions.showAlert(res.message.status, res.message.text);
        }
    }
    updateShipping(method) {
        this.chosen_shipping = method;
        this.service.updateShipping(method)
            .then((results) => this.handleShipping(results));
    }
    handleShipping(results) {
        this.cart = results;
        this.values.cartItems = results;
    }
    gohome(){
        this.nav.parent.select(0);
    }

    getProduct(id){
    this.nav.push(ProductPage, id);
    }

}
