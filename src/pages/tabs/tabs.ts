import { Component } from '@angular/core';
import { Functions } from '../../providers/service/functions';
import { Values } from '../../providers/service/values';
import { Home } from '../home/home';
import { CartPage } from '../cart/cart';
import { Orders } from '../account/orders/orders';
import { Login } from '../account/login/login';
import { MapPage } from '../map/map';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = Home;
  tab2Root = CartPage;
  tab3Root = Orders;
  tab4Root = Login;

  constructor( public values: Values, public functions: Functions) {

  }
}
