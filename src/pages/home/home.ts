import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Service} from '../../providers/service/service';
import { Values } from '../../providers/service/values';
import { Functions } from '../../providers/service/functions';
import { ModalController } from 'ionic-angular';
import { CartPage } from '../cart/cart';
import { SearchPage } from '../search/search';
import { ProductPage } from '../product/product';
import { ProductsPage } from '../products/products';
import { Filter } from '../filter/filter';
import { Network } from '@ionic-native/network';

@Component({
    templateUrl: 'home.html'
})
export class Home {
    status: any;
    items: any;
    product: any;
    products: any;
    filter: any;
    options: any;
    id: any;
    variationID: any;
    time: any;
    allProducts: any;
    has_more_items: boolean = true;
    quantity: any;
    defaultImage: any;
    image: any;
    offset: any;
    defaultbanner: any;
    loaded: boolean = false;
    offerProducts: any;

    constructor(public modalCtrl: ModalController, public nav: NavController, public service: Service, public values: Values, public functions: Functions, private network: Network) {
        this.items = [];
        this.options = [];
        this.filter = {};
        this.filter.page = 1;
        this.filter.status = 'publish';
        this.options = [];
        this.quantity = "1";
        this.defaultImage = 'assets/image/600x300.png';
        this.offset = 10;
        this.onConnect();

        this.service.load()
         .then((results) => this.handleService(results));
    }
    onConnect(){
        this.network.onConnect().subscribe(() => {
            this.service.load()
              .then((results) => this.handleService(results));
        });
    }
    handleService(results) {
        var param = {'on_sale': true, 'status': 'publish'};
        this.service.getHomeProducts(param).then((results) => this.offerProducts = results);
        this.service.getProducts({'status': 'publish'}).then((results) => this.products = results);
    }
    getCategory(id, slug, name) {
        this.items.id = id;
        this.items.name = name;
        this.items.slug = slug;
        this.items.categories = this.service.categories;
        this.nav.push(ProductsPage, this.items);
    }
    getCart() {
        this.nav.push(CartPage);
    }
    getSearch() {
        this.nav.push(SearchPage);
    }
    mySlideOptions = {
        initialSlide: 1,
        loop: true,
        autoplay: 5800,
        pager: true
    }
    getProduct(id) {
        this.nav.push(ProductPage, id);
    }
    getId() {
        var i;
        if (this.options.length >= 1) var resa = this.options[0].split(":");
        if (this.options.length >= 2) var resb = this.options[1].split(":");
        if (this.options.length >= 1)
            for (i = 0; i < this.product.product.variations.length; i++) {
                if (this.product.product.variations[i].attributes[0].option == resa[1]) {
                    if (this.options.length == 1) {
                        break;
                    } else if (this.product.product.variations[i].attributes[1].option == resb[1]) {
                        break;
                    }
                }
            }
    }
    addToWishlist(id) {
        if (this.values.isLoggedIn) {
            this.values.wishlistId[id] = true;
            this.service.addToWishlist(id).then((results) => this.update(results, id));
        } else {
            this.functions.showAlert("Warning", "You must login to add product to wishlist");
        }
    }
    update(results, id) {
        if (results.success == "Success") {
            this.values.wishlistId[id] = true;
        } else {}
    }
    removeFromWishlist(id) {
        this.values.wishlistId[id] = false;
        this.service.deleteItem(id).then((results) => this.updateWish(results, id));
    }
    updateWish(results, id) {
        if (results.status == "success") {
            this.values.wishlistId[id] = false;
        }
    }
    doInfinite(infiniteScroll) {
        this.filter.page += 1;
        this.service.loadMore(this.filter).then((results) => this.handleMore(results, infiniteScroll));
    }
    handleMore(results, infiniteScroll) {
        if (results != undefined) {
            for (var i = 0; i < results.length; i++) {
                this.products.push(results[i]);
            };
        }
        if (results.length == 0) {
            this.has_more_items = false;
        }
        infiniteScroll.complete();
    }
    deleteFromCart(id) {
        this.service.deleteFromCart(id).then((results) => this.status = results);
    }
    updateToCart(id) {
        this.service.updateToCart(id).then((results) => this.status = results);
    }
    addToCart(id, type) {
        if (type == 'variable') {
            this.nav.push(ProductPage, id);
        } else {
            var text = '{';
            var i;
            for (i = 0; i < this.options.length; i++) {
                var res = this.options[i].split(":");
                text += '"' + res[0] + '":"' + res[1] + '",';
            }
            text += '"product_id":"' + id + '",';
            text += '"quantity":"' + this.quantity + '"}';
            var obj = JSON.parse(text);
            this.service.addToCart(obj).then((results) => console.log(results));
        }
    }
    getFilter() {
        console.log(this.filter);
        let modal = this.modalCtrl.create(Filter, this.filter);
        modal.onDidDismiss(data => {
            if (this.values.applyFilter) {
                this.filter = this.values.filter;
                this.has_more_items = true;
                this.filter.page = 1;
                this.products = null;
                this.filter.opts = undefined;
                this.filter.component = undefined;
                console.log(this.filter);
                this.service.getHomeProducts(this.filter).then((results) => this.products = results);
            }
        });
        modal.present();
    }
    onInput($event) {
        this.filter.page = 1;
        this.filter.search = $event.srcElement.value;
        this.service.getSearch(this.filter)
            .then((results) => this.products = results);
    }
    onCancel($event){
        console.log('canceled');
    }
}