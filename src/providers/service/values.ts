import { Injectable } from '@angular/core';

@Injectable()
export class Values {

  count: number = null;
  isLoggedIn: boolean = false;
  customerName: string = "";
  customerId: number = null;
  listview: boolean = false;
  cart: Array<number> = [];
  filterUpdate: boolean = false;
  lan: any;
  logoutUrl: any;
  cartItem: any = [];
  cartItems: any = [];
  cartNonce: any;
  avatar: any;
  currency: any = "USD";
  data: any;
  dir: any = 'left';
  deviceId: any;
  platform: any;
  wishlistId: any = [];
  quantity: number = 2;
  max_price: any;
  orders: any = [];
  attributes: any;
  attributeTerms: any = [];
  setNavigation: boolean = false;
  form: any = {};
  filter: any;
  applyFilter: boolean = false;
  selectedFilter: any = {};
  price: any = {lower: 1, upper: 1000};
  sortType: any;

  constructor() {
    this.data = {};
    this.sortType = 0;
    this.logoutUrl = "";
    this.avatar = "assets/image/shop-icon.jpg";
  }
  updateCart(crt) {
     this.cartItem = crt.cart_contents;
     this.cart = [];
     this.count = null;
     for (let item in crt.cart_contents) {
         if(crt.cart_contents[item].variation_id != undefined) this.cart[crt.cart_contents[item].variation_id] = parseInt(crt.cart_contents[item].quantity);
         else this.cart[crt.cart_contents[item].product_id] = parseInt(crt.cart_contents[item].quantity);
         this.count += parseInt(crt.cart_contents[item].quantity);
     }
 }
 updateCartTwo(crt) {
     this.cart = [];
     this.count = null;
     this.cartItem = crt;
     for (let item in crt) {
        if(crt[item].variation_id != undefined) this.cart[crt[item].variation_id] = parseInt(crt[item].quantity);
        else this.cart[crt[item].product_id] = parseInt(crt[item].quantity);
        this.count += parseInt(crt[item].quantity);
     }
 }
 }