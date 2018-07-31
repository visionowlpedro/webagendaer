import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Service } from '../../../providers/service/service';
import { Values } from '../../../providers/service/values';
import { Functions } from '../../../providers/service/functions';
import { OrderDetails } from '../order-details/order-details';

@Component({
    templateUrl: 'orders.html',
})
export class Orders {
    has_more_items: boolean = true;
    quantity: any;
    page: number = 1;
    id: any;
    status: any;
    constructor(public nav: NavController, public service: Service, public values: Values, public functions: Functions) {

        this.service.getOrders()
            .then((results) => this.values.orders = results);

    }
    doInfinite(infiniteScroll) {
        this.service.getMoreOrders()
            .then((results) => this.handleMore(results, infiniteScroll));
    }
    handleMore(results, infiniteScroll) {
        if (results != undefined) {
            for (var i = 0; i < results.length; i++) {
                this.values.orders.push(results[i]);
            };
        }
        if (results.length == 0) {
            this.has_more_items = false;
        }
        infiniteScroll.complete();
    }
    getOrderDetails(id) {
        this.nav.push(OrderDetails, id);
    }
    cancelOrder(item) {
        this.service.updateOrder({

                    "status": "cancelled"

            }, item.id)
            .then((results) => {this.handleCancelOrder(results); item.status = 'cancelled'});
    }
    handleCancelOrder(results) {
        this.functions.showAlert("successo", "o pedido foi cancelado");
    }
    reOrder(item) {
        this.service.updateOrder({

                    "status": "pending"

            }, item.id)
            .then((results) => {this.handleReOrder(results); item.status = 'pending'});
    }
    handleReOrder(results) {
        this.functions.showAlert("successo", "ordem foi colocada com sucesso");
    }

    Login(){
        this.nav.parent.select(3);
    }
}
