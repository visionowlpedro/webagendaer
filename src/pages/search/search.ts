import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';
import { SearchService } from '../../providers/service/search-service';
import { Values } from '../../providers/service/values';
import { Functions } from '../../providers/service/functions';
import { CartPage } from '../cart/cart';
import { ProductPage } from '../product/product';

@Component({
    templateUrl: 'search.html'
})
export class SearchPage {
    search: any;
    slug: any;
    id: any;
    categories: any;
    searchKey: any;
    count: any;
    offset: any;
    has_more_items: boolean = true;
    options: any;
    status: any;
    products: any;
    moreProducts: any;
    quantity: any;
    page: number = 1;
    filter: any;
    myInput: any;
    shouldShowCancel: boolean = true;
    subCategories: any;
    constructor(public nav: NavController, public popoverCtrl: PopoverController, public service: SearchService, public values: Values, params: NavParams, public functions: Functions) {
        this.filter = {};
        this.count = 10;
        this.offset = 0;
        this.values.filter = {};
        this.options = [];
        this.quantity = "1";
        this.myInput = "";
        this.filter.page = 1;
        this.filter.status = 'publish';
    }
    getCart() {
        this.nav.push(CartPage);
    }
    onInput($event) {
        this.filter.search = $event.srcElement.value;
        this.values.filter = {};
        this.service.getSearch(this.filter).then((results) => this.products = results);
    }
    onCancel($event) {
        console.log('cancelled');
    }
    getProduct(id) {
        this.nav.push(ProductPage, id);
    }
    doInfinite(infiniteScroll) {
        this.filter.page += 1;
        this.service.getSearch(this.filter).then((results) => this.handleMore(results, infiniteScroll));
    }
    handleMore(results, infiniteScroll) {
        if (results != undefined) {
            for (var i = 0; i < results.length; i++) {
                this.products.push(results[i]);
            };
        }
        if (results == 0) {
            this.has_more_items = false;
        }
        infiniteScroll.complete();
    }
    deleteFromCart(id) {
        this.service.deleteFromCart(id).then((results) => this.status = results);
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
            this.service.addToCart(obj).then((results) => this.updateCart(results));
        }
    }
    updateCart(a) {}
    setListView() {
        this.values.listview = true;
    }
    setGridView() {
        this.values.listview = false;
    }
    addToWishlist(id) {
        if (this.values.isLoggedIn) {
            this.values.wishlistId[id] = true;
            this.service.addToWishlist(id).then((results) => this.update(results, id));
        } else {
            this.functions.showAlert("Atenção", "Você deve logar-se para adicionar produtos à lista de desejos");
        }
    }
    update(results, id) {
        if (results.success == "Success") {
            //this.functions.showAlert(a.success, a.message);
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
}
