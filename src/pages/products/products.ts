import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';
import { CategoryService } from '../../providers/service/category-service';
import { Values } from '../../providers/service/values';
import { Functions } from '../../providers/service/functions';
import { ModalController } from 'ionic-angular';
import { CartPage } from '../cart/cart';
import { ProductPage } from '../product/product';
import { Filter } from '../filter/filter';
import { Sort } from '../sort/sort';

@Component({
    selector: 'page-products',
    templateUrl: 'products.html'
})
export class ProductsPage {
    products: any;
    moreProducts: any;
    count: any;
    offset: any;
    category: any;
    filters: any;
    has_more_items: boolean = true;
    listview: boolean = false;
    noProducts: boolean = false;
    status: any;
    options: any;
    pop: any;
    categories: any;
    subCategories: any;
    items: any;
    quantity: any;
    filter: any;
    q: any;
    shouldShowCancel: boolean = true;
    sort: number = 0;
    categoryName: any;
    data: any;

    constructor(public modalCtrl: ModalController, public nav: NavController, public popoverCtrl: PopoverController, public service: CategoryService, params: NavParams, public values: Values, public functions: Functions) {
        this.data = {};
        this.filter = {};
        this.categoryName = params.data.name;
        this.q = "";
        this.filter.category = params.data.id;
        this.filter.page = 1;
        this.filter.status = 'publish';
        this.categories = params.data.categories;
        this.count = 10;
        this.offset = 0;
        this.values.filter = {};
        this.options = [];
        this.subCategories = [];
        this.items = [];
        this.quantity = "1";

        if(params.data.attributeSlug){
             this.filter.attribute = params.data.attributeSlug;
        }
        if(params.data.attributeId){
             this.filter.attribute_term = params.data.attributeId;
        }
        this.service.load(this.filter)
            .then((results) => this.handleProducts(results));
        for (var i = 0; i < this.categories.length; i++) {
            if (this.categories[i].parent == this.filter.category) {
                this.subCategories.push(this.categories[i]);
            }
        }
    }
    handleProducts(results) {
        this.products = results;
    }
    getCategory(id, slug, name) {
        this.items.id = id;
        this.items.slug = slug;
        this.items.name = name;
        this.items.categories = this.categories;
        this.nav.push(ProductsPage, this.items);
    }
    parseText(id, count, offset, obj2) {
        var text = '{';
        text += '"category' + '":"' + id + '"}';
        var obj1 = JSON.parse(text);
        var obj3 = {};
        for (var attrname in obj1) {
            obj3[attrname] = obj1[attrname];
        }
        for (attrname in obj2) {
            obj3[attrname] = obj2[attrname];
        }
        return obj3;
    }
    getProducts(id) {
        this.nav.push(ProductsPage, id);
    }
    getProduct(id) {
        this.nav.push(ProductPage, id);
    }
    getCart() {
        this.nav.push(CartPage);
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
    setListView() {
        this.values.listview = true;
    }
    setGridView() {
        this.values.listview = false;
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
            this.service.addToCart(obj).then((results) => this.updateCart(results));
        }
    }
    updateCart(a) {}
    onInput($event) {
        this.filter = "";
        this.filter = {};
        this.filter.page = 1;
        this.filter.status = 'publish';
        this.filter.search = $event.srcElement.value;
        this.service.search(this.filter).then((results) => this.handleSearchResults(results));
    }
    onCancel($event){
        console.log('canceled');
    }
    handleSearchResults(results) {
        this.products = results;
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
    getFilter() {
        let modal = this.modalCtrl.create(Filter, this.filter);
        modal.onDidDismiss(data => {
            if (this.values.applyFilter) {
                this.filter = this.values.filter;
                this.has_more_items = true;
                this.filter.page = 1;
                this.filter.status = 'publish';
                this.filter.opts = undefined;
                this.filter.component = undefined;
                this.service.load(this.filter).then((results) => this.handleFilterResults(results));
            }
        });
        modal.present();
    }
    getSort() {
        let modal = this.modalCtrl.create(Sort, this.filter);
        modal.onDidDismiss(data => {
            if (this.values.applyFilter) {
                this.filter = this.values.filter;
                this.has_more_items = true;
                this.filter.page = 1;
                this.filter.status = 'publish';
                this.filter.opts = undefined;
                this.filter.component = undefined;
                this.service.load(this.filter).then((results) => this.handleFilterResults(results));
            }
        });
        modal.present();
    }
    handleFilterResults(results) {
        this.products = results;
    }
}
