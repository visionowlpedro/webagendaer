import { Injectable } from '@angular/core';
import { Http, Headers  } from '@angular/http';
import { LoadingController } from 'ionic-angular';
import { Config } from './config';
import { Values } from './values';
import { URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

var headers = new Headers();
headers.append('Content-Type', 'application/x-www-form-urlencoded');

@Injectable()
export class CartService {
    data: any;
    url: any;
    cart: any;
    status: any;
    billing: any;
    headers: any;
    paymentMethods: any;
    loader: any;
    constructor(private http: Http, private config: Config, private values: Values, private loadingController: LoadingController) {

    }
    loadCart() {
        return new Promise(resolve => {
            this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart', this.config.options).map(res => res.json()).subscribe(data => {
                this.cart = data;
                this.values.cartItems = data;
                this.values.cartNonce = data.cart_nonce;
                this.values.updateCart(this.cart);
                resolve(this.cart);
            });
        });
    }
    deleteItem(item_key) {
        return new Promise(resolve => {
            this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-remove_cart_item&item_key=' + item_key, this.config.options).map(res => res.json()).subscribe(data => {
                this.cart = data;
                this.values.updateCart(this.cart);
                this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart', this.config.options).map(res => res.json()).subscribe(data => {
                    this.values.cartItems = data;
                });
                resolve(this.cart);
            });
        });
    }
    checkout() {
        return new Promise(resolve => {
            this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-get_checkout_form', this.config.options).map(res => res.json()).subscribe(data => {
                this.billing = data;
                resolve(this.billing);
            });
        });
    }
    addToCart(id, key) {
        var params = new URLSearchParams();
        if (this.values.cartItem[key].quantity != undefined && this.values.cartItem[key].quantity == 0) {
            this.values.cartItem[key].quantity = 0
        } else {
            this.values.cartItem[key].quantity += 1;
        };
        if (this.values.cart[id] != undefined && this.values.cart[id] == 0) {
            this.values.cart[id] = 0
        } else {
            this.values.cart[id] += 1
        };
        var qty = this.values.cartItem[key].quantity;
        params.set('cart[' + key + '][qty]', qty.toString());
        params.set('_wpnonce', this.values.cartNonce);
        params.set('_wp_http_referer', this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart');
        params.set('update_cart', 'Update Cart');
        return new Promise(resolve => {
            this.http.post(this.config.url + '/cart/', params, this.config.options).map(res => res.json()).subscribe(data => {
                this.cart = data;
                this.values.cartItems = data;
                this.values.updateCart(this.cart);
                resolve(this.cart);
            });
        });
    }
    deleteFromCart(id, key) {
        var params = new URLSearchParams();
        if (this.values.cartItem[key].quantity != undefined && this.values.cartItem[key].quantity == 0) {
            this.values.cartItem[key].quantity = 0;
        } else {
            this.values.cartItem[key].quantity -= 1;
        };
        if (this.values.cart[id] != undefined && this.values.cart[id] == 0) {
            this.values.cart[id] = 0
        } else {
            this.values.cart[id] -= 1
        };
        var qty = this.values.cartItem[key].quantity;
        params.set('cart[' + key + '][qty]', qty.toString());
        params.set('_wpnonce', this.values.cartNonce);
        params.set('_wp_http_referer', this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart');
        params.set('update_cart', 'Update Cart');
        return new Promise(resolve => {
            this.http.post(this.config.url + '/cart/', params, this.config.options).map(res => res.json()).subscribe(data => {
                this.cart = data;
                this.values.cartItems = data;
                this.values.updateCart(this.cart);
                resolve(this.cart);
            });
        });
    }
    submitCoupon(coupon) {
        var params = new URLSearchParams()
        params.append("coupon_code", coupon);
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-apply_coupon', params, this.config.options).subscribe(data => {
                resolve(data);
            });
        });
    }
    removeCoupon(coupon) {
        var params = new URLSearchParams()
        params.append("coupon", coupon);
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-remove_coupon', params, this.config.options).subscribe(data => {
                resolve(data);
            });
        });
    }
    updateShipping(method) {
        var params = new URLSearchParams()
        params.append("shipping_method[0]", method);
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-update_shipping_method', params, this.config.options).map(res => res.json()).subscribe(data => {
                this.cart = data;
                this.values.cartItems = data;
                this.values.cartNonce = data.cart_nonce;
                this.values.updateCart(this.cart);
                resolve(this.cart);
            });
        });
    }
    presentLoading(text) {
        this.loader = this.loadingController.create({
            content: text,
        });
        this.loader.present();
    }
    dismissLoading() {
        this.loader.dismiss();
    }
}