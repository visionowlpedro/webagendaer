import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Config } from './config';
import { Values } from './values';
import { URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { LoadingController } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
@Injectable()
export class ProductService {
    data: any;
    url: any;
    product: any;
    gallery: any;
    status: any;
    headers: any;
    wishlist: any;
    reviews: any;
    related: any;
    reviewForm: any;
    cart: any;
    code: any;
    loader: any;
    upsell: any;
    crossSell: any;
    options: any = {};

    constructor(private reqhttp: HTTP, private http: Http, private config: Config, private values: Values, private loadingController: LoadingController) {
        this.reqhttp.setHeader(this.config.url, 'withCredentials', 'false');
    }
    getProduct(id) {
        return new Promise(resolve => {
            this.reqhttp.clearCookies();
            this.reqhttp.get(this.config.setUrl('GET', '/wp-json/wc/v2/products/' + id + '?', false), {}, {})
                .then(data => {
                    this.product = JSON.parse(data.data);
                     resolve(this.product);                    
                });
        });
    }
    getReviews(id) {
        return new Promise(resolve => {
            this.reqhttp.clearCookies();
            this.reqhttp.get(this.config.setUrl('GET', '/wp-json/wc/v2/products/' + id + '/reviews/' + '?', false), {}, {})
                .then(data => {
                    this.reviews = JSON.parse(data.data);
                    resolve(this.reviews);
                });
        });
    }
    getVariationProducts(id) {
        this.reqhttp.clearCookies();
        return new Promise(resolve => {
            this.reqhttp.get(this.config.setUrl('GET', '/wp-json/wc/v2/products/' + id + '/variations' + '?', false ), {}, {})
                .then(data => {
                    resolve(JSON.parse(data.data));
                });
        });
    } 
    getRelatedProducts(relatedProducts) {
        var searchParams = new URLSearchParams();
        searchParams.set('related_ids', relatedProducts);
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-related_products', searchParams, this.options).map(res => res.json()).subscribe(data => {
                this.related = data;
                resolve(this.related);
            });
        });
    }
    getUpsellProducts(upsellProducts) {
        var searchParams = new URLSearchParams();
        searchParams.set('upsell_ids', upsellProducts);
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-upsell_products', searchParams, this.options).map(res => res.json()).subscribe(data => {
                this.upsell = data;
                resolve(this.upsell);
            });
        });
    }
    getCrossSellProducts(crossSellProducts) {
        var searchParams = new URLSearchParams();
        searchParams.set('cross_sell_ids', crossSellProducts);
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cross_sell_products', searchParams, this.options).map(res => res.json()).subscribe(data => {
                this.crossSell = data;
                resolve(this.crossSell);
            });
        });
    }
    addToCart(params) {
        return new Promise(resolve => {
            var searchParams = new URLSearchParams();
            for (let param in params) {
                searchParams.set(param, params[param]);
            }
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-add_to_cart', searchParams, this.options).map(res => res.json()).subscribe(data => {
                this.status = data.cart;
                this.values.cartNonce = data.cart_nonce;
                this.values.updateCartTwo(this.status);
                this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart', this.options).map(res => res.json()).subscribe(data => {
                    this.values.cartItems = data;
                    this.values.updateCart(data);
                });
                resolve(this.status);
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
    addToWishlist(id) {
        return new Promise(resolve => {
            var params = new URLSearchParams();
            params.append("product_id", id);
            params.append("customer_id", this.values.customerId.toString());
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-add_wishlist', params, this.options).map(res => res.json()).subscribe(data => {
                this.status = data;
                resolve(this.status);
            });
        });
    }
    deleteItem(id) {
        var params = new URLSearchParams();
        params.append("product_id", id);
        params.append("customer_id", this.values.customerId.toString());
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-remove_wishlist', params, this.options).map(res => res.json()).subscribe(data => {
                resolve(data);
            });
        });
    }
    submitComment(form) {
        var params = new URLSearchParams();
        params.append("rating", form.rating);
        params.append("comment", form.comment);
        if (!this.values.isLoggedIn) {
            params.append("author", form.author);
            params.append("email", form.email);
        }
        params.append("comment_post_ID", form.id);
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-comments-post.php', params).subscribe(data => {
                resolve(true);
            });
        });
    }
    updateToCart(id) {
        var params = new URLSearchParams();
        for (let key in this.values.cartItem) {
            if (this.values.cartItem[key].product_id == id) {
                this.values.count += 1;
                if (this.values.cartItem[key].quantity != undefined && this.values.cartItem[key].quantity == 0) {
                    this.values.cartItem[key].quantity = 0
                }
                else {
                    this.values.cartItem[key].quantity += 1
                };
                if (this.values.cart[id] != undefined && this.values.cart[id] == 0) {
                    this.values.cart[id] = 0
                }
                else {
                    this.values.cart[id] += 1
                };
                params.set('cart[' + key + '][qty]', this.values.cartItem[key].quantity);
            }
        }
        params.set('_wpnonce', this.values.cartNonce);
        params.set('_wp_http_referer', this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart');
        params.set('update_cart', 'Update Cart');
        return new Promise(resolve => {
            this.http.post(this.config.url + '/cart/', params, this.config.options)
                .subscribe(data => {
                    this.status = data;

                    resolve(this.status);
                });
        });
    }
    deleteFromCart(id) {
        var params = new URLSearchParams();
        for (let key in this.values.cartItem) {
            if (this.values.cartItem[key].product_id == id) {
                this.values.count -= 1;
                if (this.values.cartItem[key].quantity != undefined && this.values.cartItem[key].quantity == 0) {
                    this.values.cartItem[key].quantity = 0
                }
                else {
                    this.values.cartItem[key].quantity -= 1
                };
                if (this.values.cart[id] != undefined && this.values.cart[id] == 0) {
                    this.values.cart[id] = 0
                }
                else {
                    this.values.cart[id] -= 1
                };
                params.set('cart[' + key + '][qty]', this.values.cartItem[key].quantity);
            }
        }
        params.set('_wpnonce', this.values.cartNonce);
        params.set('_wp_http_referer', this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart');
        params.set('update_cart', 'Update Cart');
        return new Promise(resolve => {
            this.http.post(this.config.url + '/cart/', params, this.config.options)
                .subscribe(data => {
                    this.status = data;
                    resolve(this.status);
                });
        });
    }
}