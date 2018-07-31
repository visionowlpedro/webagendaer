import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Service } from '../../../providers/service/service';
import { Functions } from '../../../providers/service/functions';
import { Values } from '../../../providers/service/values';

@Component({
    templateUrl: 'order-summary.html'
})
export class OrderSummary {
    orderSummary: any;
    status: any;
    payment: any;
    id: any;
    constructor(public nav: NavController, public service: Service, public params: NavParams, public functions: Functions, public values: Values) {
        this.id = params.data;
        this.values.cartItems.cart_contents = [];
        this.values.cart = [];
        this.values.count = null;
    }
    ionViewDidEnter() {
        this.service.emptyCart()
            .then((results) => console.log(results));
        this.service.getOrderSummary(this.id)
            .then((results) => this.orderSummary = results);
    }
    Continue() {
        this.nav.pop();
        this.nav.pop();
        this.nav.parent.select(0);

    }
}
