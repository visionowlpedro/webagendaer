import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform } from 'ionic-angular';
//import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions } from '@ionic-native/google-maps';

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
    myLocation: any = {};
    marker: any;
    //map: GoogleMap;
    @ViewChild('mapCanvas') mapElement: ElementRef;
    constructor(public platform: Platform) {
        this.myLocation.lat = 43.071584;
        this.myLocation.lng = -89.380120;
    }
    ionViewDidLoad() {
        /*let mapOptions: GoogleMapOptions = {
            camera: {
                target: {
                    lat: this.myLocation.lat,
                    lng: this.myLocation.lng
                },
                zoom: 18,
                tilt: 30
            }
        };
        this.map = GoogleMaps.create('map_canvas', mapOptions);
        this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
            console.log('Map is ready!');
            this.map.addMarker({
                    title: 'Monona Terrace Convention Center',
                    animation: 'DROP',
                    draggable: true,
                    position: {
                        lat: this.myLocation.lat,
                        lng: this.myLocation.lng
                    }
                }).then(marker => {
                
            });
        });*/
    }
}