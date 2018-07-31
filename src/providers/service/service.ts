import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { LoadingController } from 'ionic-angular';
import { Config } from './config';
import { Values } from './values';
import { URLSearchParams } from '@angular/http';
import { NativeStorage } from '@ionic-native/native-storage';
import 'rxjs/add/operator/map';

@Injectable()
export class Service {
    data: any;
    url: any;
    categories: any;
    banners: any;
    orders: any;
    order: any;
    isloggedIn: any;
    status: any;
    address: any;
    headers: any;
    products: any;
    product: any;
    cart: any;
    configuration: any;
    loader: any;
    loginStatus: any;
    mainCategories: any;
    country: any;
    user: any;
    login_nonce: any;
    dir: any = 'left';
    filter: any = {};
    attributes: any;
    orderFilter: any = {};
    options: any = {};

    constructor(private http: Http, private config: Config, private values: Values, public loadingCtrl: LoadingController, private nativeStorage: NativeStorage) {

    }
    load() {
        return new Promise(resolve => {
            this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-keys', this.config.options).map(res => res.json()).subscribe(data => {
                this.values.currency = data.currency;
                this.login_nonce = data.login_nonce;
                this.banners = data.banners;
                this.values.max_price = data.max_price;
                this.values.price.upper = data.max_price;
                if (data.user.data != undefined) {
                    this.values.isLoggedIn = data.user.data.status;
                    this.values.customerId = data.user.data.ID;
                    this.values.customerName = data.user.data.display_name;
                    this.values.logoutUrl = this.encodeUrl(data.user.data.url);
                    this.nativeStorage.getItem('avatar').then(data => {
                        this.values.avatar = data
                    }, error => console.error(error));
                }
                this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/products/categories?', {per_page: 100}), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                    this.categories = data;
                    this.mainCategories = [];
                    for (var i = 0; i < this.categories.length; i++) {
                        if (this.categories[i].parent == '0') {
                            this.mainCategories.push(this.categories[i]);
                        }
                    }
                    this.nativeStorage.getItem('loginData').then(data => this.login(data), error => console.error(error));
                    this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart', this.config.options).map(res => res.json()).subscribe(data => {
                        this.cart = data;
                        this.values.cartItems = data;
                        this.values.updateCart(this.cart);
                    });
                    if (this.values.isLoggedIn) {
                        this.filter = {};
                        this.filter.customer = this.values.customerId.toString();
                        this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/orders?', this.filter), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                            this.values.orders = data;
                            resolve(this.orders);
                        });
                    }
                    this.loadCart();
                    resolve(this.categories);
                });
            });
        });
    }
    getNonce() {
        return new Promise(resolve => {
            this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-nonce', this.config.options).map(res => res.json()).subscribe(data => {
                resolve(data);
            });
        });
    }
    login(loginData) {
        var params = new URLSearchParams();
        params.append("username", loginData.username);
        params.append("password", loginData.password);
        params.append("_wpnonce", this.login_nonce);
        params.append("login", 'Login');
        params.append("redirect", this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-userdata');
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-login', params, this.config.options).map(res => res.json()).subscribe(data => {
                if (!data.errors) {
                    this.values.isLoggedIn = data.data.status;
                    this.values.customerName = data.data.user_nicename;
                    this.values.customerId = data.data.ID;
                    this.values.logoutUrl = this.encodeUrl(data.data.url);
                    params = new URLSearchParams();
                    params.append("customer_id", this.values.customerId.toString());
                    this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-get_wishlist', params, this.config.options).map(res => res.json()).subscribe(data => {
                        for (let item in data) {
                            this.values.wishlistId[data[item].id] = data[item].id;
                        }
                    });
                    //this.values.avatar = data.data.avatar;
                    this.orderFilter.page = 0;
                    this.getOrders();
                    this.nativeStorage.setItem('loginData', {
                        username: loginData.username,
                        password: loginData.password
                    }).then(data => console.log('Login Details Stored'), error => console.error(error));
                }
                resolve(data);
            }, err => {
                resolve(JSON.parse(err._body));
                console.log(err._body)
            });
        });
    }
    encodeUrl(href) {
        return href.replace(/&amp;/g, '&')
    }
    logout() {
        return new Promise(resolve => {
            this.values.customerName = "";
            this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-logout', this.config.options).subscribe(data => {
                this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart', this.config.options).map(res => res.json()).subscribe(data => {
                    this.cart = data;
                    this.values.cartItems = data;
                    this.values.updateCart(this.cart);
                    resolve(data);
                });
            });
        });
    }
    passwordreset(email, nonce, url) {
        var params = new URLSearchParams();
        params.append("user_login", email);
        params.append("wc_reset_password", "true");
        params.append("_wpnonce", nonce);
        params.append("_wp_http_referer", '/my-account/lost-password/');
        return new Promise(resolve => {
            this.http.post(this.config.url + '/my-account/lost-password/', params).subscribe(status => {
                resolve(status);
            });
        });
    }
    passwordResetNonce() {
        return new Promise(resolve => {
            this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-passwordreset', this.config.options).map(res => res.json()).subscribe(data => {
                resolve(data);
            });
        });
    }
    getAddress() {
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/customers/' + this.values.customerId + '?', false), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                this.address = data;
                resolve(this.address);
            });
        });
    }
    saveAddress(address) {
        var params = address;
        return new Promise(resolve => {
            this.http.put(this.config.setUrl('PUT', '/wp-json/wc/v2/customers/' + this.values.customerId + '?', false), params, {withCredentials: false}).map(res => res.json()).subscribe(data => {
                resolve(data.data);
            }, err => {
                resolve(JSON.parse(err._body));
            });
        });
    }
    pushNotification(notification) {
        var params = new URLSearchParams();
        params.append("device_id", notification.device_id);
        params.append("platform", notification.platform);
        params.append("email", notification.email);
        params.append("city", notification.city);
        params.append("state", notification.state);
        params.append("country", notification.country);
        params.append("pincode", notification.pincode);
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-user-subcribe-notify', params, this.config.options).map(res => res.json()).subscribe(data => {
                this.status = data;
                resolve(this.status);
            });
        });
    }
    pushNotify(deviceId, platform) {
        var params = new URLSearchParams();
        params.append("device_id", deviceId);
        params.append("platform", platform);
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-user-subcribe-notify', params, this.config.options).map(res => res.json()).subscribe(data => {
                this.status = data;
                resolve(this.status);
            });
        });
    }
    getOrder(id) {
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/orders/' + id + '?', false), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                this.order = data;
                resolve(this.order);
            });
        });
    }
    getCountry() {
        return new Promise(resolve => {
            this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-get_country', this.config.options).map(res => res.json()).subscribe(data => {
                this.country = data;
                resolve(this.country);
            });
        });
    }
    registerCustomer(customer) {
        var params = customer;
        return new Promise(resolve => {
            this.http.post(this.config.setUrl('POST', '/wp-json/wc/v2/customers?', false), params, {withCredentials: false}).map(res => res.json()).subscribe(data => {
                this.user = data;
                resolve(this.user);
            }, err => {
                resolve(JSON.parse(err._body));
            });
        });
    }
    getOrders() {
        if (this.values.isLoggedIn) {
            this.orderFilter.page = 1;
            this.orderFilter.customer = this.values.customerId.toString();
            return new Promise(resolve => {
                this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/orders?', this.orderFilter), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                    if (this.orderFilter.page == 1) {
                        this.values.orders = data;
                    }
                    resolve(data);
                });
            });
        } else {
            return Promise.resolve(false);
        }
    }
    getMoreOrders() {
        if (this.values.isLoggedIn) {
            this.orderFilter.page += 1;
            this.orderFilter.customer = this.values.customerId.toString();
            return new Promise(resolve => {
                this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/orders?', this.orderFilter), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                    if (this.orderFilter.page == 1) {
                        this.values.orders = data;
                    }
                    resolve(data);
                });
            });
        } else {
            return Promise.resolve(false);
        }
    }
    getOrderSummary(id) {
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/orders/' + id + '?', false), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                this.orderFilter.page = 0;
                this.getOrders();
                resolve(data);
            });
        });
    }
    updateOrder(data, id) {
        return new Promise(resolve => {
            this.http.put(this.config.setUrl('PUT', '/wp-json/wc/v2/orders/' + id + '?', false), data, {withCredentials: false}).map(res => res.json()).subscribe(data => {
                this.status = data;
                resolve(this.status);
            }, err => {
                resolve(JSON.parse(err._body));
            });
        });
    }
    presentLoading(text) {
        this.loader = this.loadingCtrl.create({
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
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-add_wishlist', params, this.config.options).map(res => res.json()).subscribe(data => {
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
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-remove_wishlist', params, this.config.options).map(res => res.json()).subscribe(data => {
                resolve(data);
            });
        });
    }
    getProducts(params) {
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/products/?', params), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                this.products = data;
                resolve(this.products);
            });
        });
    }
    loadMore(filter) {
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/products/?', filter), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                this.products = data;
                resolve(this.products);
            });
        });
    }
    sendToken(token) {
        var params = new URLSearchParams();
        params.append("access_token", token);
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-facebook_connect', params, this.config.options).map(res => res.json()).subscribe(data => {
                if (data.status) {
                    this.values.isLoggedIn = true;
                    this.values.setNavigation = true;
                    this.values.customerName = data.last_name;
                    this.values.customerId = data.user_id;
                    this.values.avatar = data.avatar;
                    this.values.logoutUrl = this.encodeUrl(data.logout_url);
                    this.nativeStorage.setItem('avatar', data.avatar).then(data => console.log('Avatar Stored'), error => console.error(error));
                    resolve(data);
                    // this.values.avatar = data.avatar; 
                }
            });
        });
    }
    googleLogin(res) {
        var params = new URLSearchParams();
        params.append("access_token", res.userId);
        params.append("email", res.email);
        params.append("first_name", res.displayName);
        params.append("last_name", res.displayName);
        this.nativeStorage.setItem('avatar', res.imageurl).then(data => console.log('Avatar Stored'), error => console.error(error));
        return new Promise(resolve => {
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-google_connect', params, this.config.options).map(res => res.json()).subscribe(data => {
                if (data.status) {
                    this.values.isLoggedIn = true;
                    this.values.setNavigation = true;
                    this.values.customerName = res.displayName;
                    this.values.customerId = data.user_id;
                    this.values.logoutUrl = this.encodeUrl(data.logout_url);
                    resolve(data);
                    // this.values.avatar = data.avatar; 
                }
                //this.status = data;
            });
        });
    }
    loadCart() {
        this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart', this.config.options).map(res => res.json()).subscribe(data => {
            this.cart = data;
            this.values.cartItems = data;
            this.values.cartNonce = data.cart_nonce;
            this.values.updateCart(this.cart);
        });
    }
    addToCart(params) {
        return new Promise(resolve => {
            var searchParams = new URLSearchParams();
            for (let param in params) {
                searchParams.set(param, params[param]);
            }
            this.http.post(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-add_to_cart', searchParams, this.config.options).map(res => res.json()).subscribe(data => {
                this.status = data.cart;
                this.values.cartNonce = data.cart_nonce;
                this.values.updateCartTwo(this.status);
                this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart', this.config.options).map(res => res.json()).subscribe(data => {
                    this.values.cartItems = data;
                    this.values.updateCart(data);
                });
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
                } else {
                    this.values.cartItem[key].quantity -= 1
                };
                if (this.values.cart[id] != undefined && this.values.cart[id] == 0) {
                    this.values.cart[id] = 0
                } else {
                    this.values.cart[id] -= 1
                };
                params.set('cart[' + key + '][qty]', this.values.cartItem[key].quantity);
            }
        }
        params.set('_wpnonce', this.values.cartNonce);
        params.set('update_cart', 'Update Cart');
        return new Promise(resolve => {
            this.http.post(this.config.url + '/cart/', params, this.config.options).subscribe(data => {
                this.status = data;
                this.loadCart();
                resolve(this.status);
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
                } else {
                    this.values.cartItem[key].quantity += 1
                };
                if (this.values.cart[id] != undefined && this.values.cart[id] == 0) {
                    this.values.cart[id] = 0
                } else {
                    this.values.cart[id] += 1
                };
                params.set('cart[' + key + '][qty]', this.values.cartItem[key].quantity);
            }
        }
        params.set('_wpnonce', this.values.cartNonce);
        params.set('update_cart', 'Update Cart');
        return new Promise(resolve => {
            this.http.post(this.config.url + '/cart/', params, this.config.options).subscribe(data => {
                this.status = data;
                this.loadCart();
                resolve(this.status);
            });
        });
    }
    getAttributes() {
        if (this.values.attributes) {
            return Promise.resolve(this.values.attributes);
        }
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/products/attributes?', false), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                this.values.attributes = data;
                if(this.values.attributes[0]){
                this.values.attributes[0].selected = true;
                this.values.selectedFilter = this.values.attributes[0];
                this.values.filter.attribute = this.values.attributes[0].id;
                }
                resolve(this.values.attributes);
            });
        });
    }
    attributeTerms(id) {
        if (this.values.attributeTerms[id]) {
            return Promise.resolve(this.values.attributeTerms[id]);
        }
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/products/attributes/' + id + '/terms?', false), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                this.values.attributeTerms[id] = data;
                resolve(this.values.attributeTerms[id]);
            });
        });
    }
    getHomeProducts(params) {
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/products?', params), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                this.products = data;
                resolve(this.products);
            });
        });
    }
    getRecentPosts(page: any, tag: any) {
        return new Promise(resolve => {
            console.log(this.config.url);
            this.http.get(this.config.url + '/api/core/get_tag_posts/?' + 'page=' + page + '&count=50&slug=' + tag, this.config.options).map(res => res.json()).subscribe(data => {
                resolve(data);
            }, error => {});
        });
    }
    getPost(id: any) {
        return new Promise(resolve => {
            this.http.get(this.config.url + '/api/core/get_post/?' + 'id=' + id, this.config.options).map(res => res.json()).subscribe(data => {
                resolve(data);
            });
        });
    }
    emptyCart() {
        return new Promise(resolve => {
            this.http.get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-empty_cart', this.config.options).map(res => res.json()).subscribe(data => {
                resolve(data);
            });
        });
    }
    getSearch(filter) {
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wp-json/wc/v2/products?', filter), this.config.optionstwo).map(res => res.json()).subscribe(data => {
                this.products = data;
                resolve(this.products);
            });
        });
    }

}