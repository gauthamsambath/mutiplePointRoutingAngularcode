import { Component, OnInit, NgZone } from '@angular/core';
import * as map from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as forwardGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as mapboxgl from 'mapbox-gl';
import { RoutingapiserviceService } from './routingapiservice.service';
import { GeoJSONSource } from 'mapbox-gl';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Route-Optimizer-Interface';
  // addresses = ["koramangala", "marathahalli", "forum%20mall", "indiranagar%20banglore", "mahadeveapura%20banglore","whitefield%20banglore","jayantinagara%20banglore","koramangala"]
  // addresses = ["stackroute koramangala", "marathahalli", "forum mall", "indiranagar banglore", "mahadevapura banglore","whitefield banglore","jayantinagara banglore","koramangala"]
  addresses=[]
  jsonresponse;
  vehicleNumbers=["22","343"]
  vehiclenumber=this.vehicleNumbers[0];
  allcoordinates;
  points = []
  coordinates = [];
  waypoints: any;
  checkforbranching = "this is to see if branching and updation have happened or not"
  constructor(private routeapiservice: RoutingapiserviceService, private zone: NgZone) { }
  ngOnInit() {
    this.resetMap()
  }

  updatevalue(data) {
    this.allcoordinates = data;
    for (var i = 0; i < this.addresses.length; i++) {
      this.coordinates[i] = this.allcoordinates[i].resourceSets[0].resources[0].point.coordinates;
    }
    // console.log(this.coordinates)
    return this.coordinates
  }
  makeArrayOfRoutes(data)
    {
      var addresses=[]
      for(var i=0;i<data.length;i++)
        {
          addresses[i]=data[i].customerAddress
        }
        return addresses
    }
  dropDownChangeEvent(number)
    {
      console.log(number+" was selected ")
      this.vehiclenumber=number
      this.resetMap();
    }  

  resetMap(){
    this.routeapiservice.getRoutes(this.vehiclenumber).subscribe((routes)=>{
      this.zone.run(()=>{
        console.log(routes)
        this.addresses=this.makeArrayOfRoutes(routes)
        console.log(this.addresses)
        this.routeapiservice.getLatandLong(this.addresses).subscribe((data) => {
          this.zone.run(() => {
            this.allcoordinates = data
            this.coordinates = this.updatevalue(data)
            updatepointsonmap(this.coordinates.slice(1), this.addresses.slice(1),"http://localhost:4202/assets/images/box.png","box")
            updatepointsonmap([this.coordinates[0]], [this.addresses[0]],"http://localhost:4202/assets/images/warehouse.png","warehouse")
            updatecenter(this.coordinates)
            this.routeapiservice.getGeoJsonLatLOng(this.coordinates, this.addresses).subscribe((data2) => {
              this.zone.run(() => {
                this.waypoints = data2
                makegeojsonline(data2, this.addresses.length - 1)
                // realtimedata(data2,this.addresses.length-1)
              })
            })
          })
        })
      })
    })

    var coordinates = document.getElementById('coordinates');
    Object.getOwnPropertyDescriptor(map, "accessToken").set('pk.eyJ1IjoiZ2F1dGhhbTk5IiwiYSI6ImNrMzRlMmxrNjE0ZTMzbXBhOWRwdDk1eTcifQ.-ZceQ8jARpf90y0tJnQhoQ');
    let mapp = new mapboxgl.Map(
      {
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [77.65542724609375, 12.940049667358398],
        zoom: 11
      });


    var geomarker = new mapboxgl.Marker(
      {
        draggable: true,
        color: "orange"
      })
      .setLngLat([77.65542724609375, 12.940049667358398])
      .addTo(mapp);

    var geocoder = new MapboxGeocoder(
      {
        accessToken: map.accessToken,
        localGeocoder: forwardGeocoder,
        zoom: 14,
        placeholder: "Enter search e.g. Lincoln Park",
        mapboxgl: mapboxgl,
        marker: false,
      });
    // console.log(geocoder)
    mapp.addControl(geocoder);
    function onDragEnd() {
      var lngLat = geomarker.getLngLat();
      coordinates.style.display = 'block';
      coordinates.innerHTML = 'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
    }

    geomarker.on('dragend', onDragEnd);
    geocoder.on('results', function (result) {
      // console.log(result.features[0].center)
      coordinates.style.display = 'block';
      var longitude = result.features[0].center[0];
      var latitude = result.features[0].center[1]
      coordinates.innerHTML = 'Longitude: ' + longitude + '<br />Latitude: ' + latitude;
      geomarker.setLngLat([longitude, latitude]);
    });
    function makegeojsonline(coordinateset, lengthofset) {
      mapp.on('load', function () {
        for (var i = 0; i < lengthofset; i++) {
          var actualcordinates = coordinateset[i].resourceSets[0].resources[0].routePath.line.coordinates
          var revcoordinates = []
          for (var j = 0; j < actualcordinates.length; j++) {
            revcoordinates[j] = [actualcordinates[j][1], actualcordinates[j][0]]
          }
          // console.log(revcoordinates)
          mapp.addLayer(
            {
              "id": "route" + i,
              "type": "line",
              "source":
              {
                "type": "geojson",
                "data":
                {
                  "type": "Feature",
                  "properties": {},
                  "geometry":
                  {
                    "type": "LineString",
                    "coordinates": revcoordinates
                  }
                }
              },
              "layout":
              {
                "line-join": "round",
                "line-cap": "round"
              },
              "paint":
              {
                "line-color": "#65A1F8",
                "line-width": 4
              }
            });
        }
      })
    }
    function updatepointsonmap(coordinates, addresses,urladdress,iconname) {
      // console.log(addresses)
      mapp.on('load', function () {
        mapp.loadImage(urladdress,
        function(error, image) {
          if (error) throw error;
          mapp.addImage(iconname, image);

        for(var i=0;i<addresses.length;i++)
          {
            mapp.addLayer(
              {
                "id": "points"+"_"+iconname+"_"+i,
                "type": "symbol",
                "source": 
                  {
                    "type": "geojson",
                    "data": 
                      {
                        "type": "FeatureCollection",
                        "features": [
                          {
                            // feature for Mapbox DC
                            "type": "Feature",
                            "geometry": 
                              {
                                "type": "Point",
                                "coordinates": [coordinates[i][1], coordinates[i][0]]
                              },
                            "properties": 
                              {
                                "title": addresses[i],
                                // "icon": "monument"
                              }
                          }]
                      }
                  },
                "layout": 
                  {
                    // get the icon name from the source's "icon" property
                    // concatenate the name to get an icon from the style's sprite sheet
                    "icon-image": iconname,
                    "icon-size": 0.5,
                    // get the title name from the source's "title" property
                    "text-field": ["get", "title"],
                    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                    "text-offset": [0, 0.6],
                    "text-anchor": "top"
                  }
              });
            // });
          }   
          
         });  
        });
      // for (var i = 0; i < addresses.length; i++) {
      //   var geomarker = new mapboxgl.Marker(
      //     {
      //       draggable: true,
      //     })
      //     .setLngLat([coordinates[i][1], coordinates[i][0]])
      //     .addTo(mapp);
      // }

    }
    function updatecenter(coordinates)
      {
        var midlat=0
        var midlong=0
        for(var i=0;i<coordinates.length;i++)
          {
            midlong+=coordinates[i][1]
            midlat+=coordinates[i][0]
          }
        midlat=midlat/coordinates.length
        midlong=midlong/coordinates.length  
        // console.log([midlong,midlat])
        geomarker.setLngLat([midlong,midlat])
        mapp.setCenter([midlong,midlat])
      }
    // function realtimedata(coordinateset, lengthofset)
    //   {
    //     var url = 'https://wanderdrone.appspot.com/';
    //     mapp.on('load', function () {
    //       for (var i = 0; i < lengthofset; i++) {
    //         var actualcordinates = coordinateset[i].resourceSets[0].resources[0].routePath.line.coordinates
    //         var revcoordinates = []
    //         for (var j = 0; j < actualcordinates.length; j++) {
    //           revcoordinates[j] = [actualcordinates[j][1], actualcordinates[j][0]]
    //         }
    //         var k=0
    //         var l=0
    //         while(k<revcoordinates.length)
    //           {
    //             console.log(k+"hi"+i)

    //             window.setInterval(function() {
    //               (
    //                 mapp.getSource('drone') as GeoJSONSource).setData({"geometry": {"type": "Point", "coordinates": revcoordinates[k++]}, "type": "Feature", "properties": {}});
    //               }, 2000);
      
    //               mapp.addSource('drone', { type: 'geojson', data: {"geometry": {"type": "Point", "coordinates": revcoordinates[k]}, "type": "Feature", "properties": {}} });
    //               console.log(k)
    //               mapp.addLayer({
    //               "id": "drone"+l,
    //               "type": "symbol",
    //               "source": "drone",
    //               "layout": {
    //               "icon-image": "rocket-15"
    //               }
    //               });
              
    //           }
    //         // console.log(revcoordinates)

    //       }


    //     });
    //   }
    mapp.addControl(new map.GeolocateControl({
      positionOptions: {
      enableHighAccuracy: true
      },
      trackUserLocation: true
      }));  
  }  


}
