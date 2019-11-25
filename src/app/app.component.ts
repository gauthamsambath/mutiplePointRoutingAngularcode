import { Component, OnInit, NgZone } from '@angular/core';
import * as map from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as forwardGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as mapboxgl from 'mapbox-gl';
import { RoutingapiserviceService } from './routingapiservice.service';
// const map = require('mapbox-gl')

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Route-Optimizer-Interface';
  addresses = ["koramangala","marathahalli","forum%20mall","indiranagar%20banglore"]
  jsonresponse;
  allcoordinates;
  points=[]
  coordinates=[];
  waypoints:any;

  constructor(private routeapiservice: RoutingapiserviceService, private zone: NgZone) { }

  ngOnInit() {
    // map.accessToken = 'pk.eyJ1IjoiZ2F1dGhhbTk5IiwiYSI6ImNrMzRlMmxrNjE0ZTMzbXBhOWRwdDk1eTcifQ.-ZceQ8jARpf90y0tJnQhoQ';
    // (map as any).accessToken = 'pk.eyJ1IjoiZ2F1dGhhbTk5IiwiYSI6ImNrMzRlMmxrNjE0ZTMzbXBhOWRwdDk1eTcifQ.-ZceQ8jARpf90y0tJnQhoQ'; 


      this.routeapiservice.getLatandLong().subscribe((data) => {
              this.zone.run(()=>{
                this.allcoordinates=data
                this.coordinates=this.updatevalue(data)
                updatepointsonmap(this.coordinates,this.addresses)
                console.log(this.coordinates)
                this.routeapiservice.getGeoJsonLatLOng(this.coordinates).subscribe((data2)=>{
                    this.zone.run(()=>{
                      this.waypoints=data2
                      makegeojsonline(data2,this.addresses.length-1)
                      // temp2.resourceSets[0].resources[0].routePath.line.coordinates
                      // console.log(data2)
                    })
                  })

              
                
                // console.log(data)
              })

      })
  

        //     for(i=0;i<this.addresses.length;i++)
        //     {
        //   var lat = this.allcoordinates[i].resourceSets.resources[0].point.coordinates[1]
        //   var long = this.allcoordinates[i].resourceSets.resources[0].point.coordinates[0]
        //             // console.log(this.jsonresponse[0].resources[0].point.coordinates
        //   var geomarker = new mapboxgl.Marker({
        //     draggable: true,
        //   })
          
        //     .setLngLat([lat, long])
        //     .addTo(mapp);
        // }
 
    // console.log(this.allcoordinates)
    var coordinates = document.getElementById('coordinates');
    Object.getOwnPropertyDescriptor(map, "accessToken").set('pk.eyJ1IjoiZ2F1dGhhbTk5IiwiYSI6ImNrMzRlMmxrNjE0ZTMzbXBhOWRwdDk1eTcifQ.-ZceQ8jARpf90y0tJnQhoQ');
    let mapp = new map.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.50, 40],
      zoom: 9 // starting zoom

    }
    );



    var geomarker = new mapboxgl.Marker({
      draggable: true,
    }).setLngLat([-74.50, 40])
      .addTo(mapp);

    var geocoder = new MapboxGeocoder({
      accessToken: map.accessToken,
      localGeocoder: forwardGeocoder,
      zoom: 14,
      placeholder: "Enter search e.g. Lincoln Park",
      mapboxgl: mapboxgl,
      marker: false,
    });
    console.log(geocoder)
    mapp.addControl(geocoder);
    function onDragEnd() {
      var lngLat = geomarker.getLngLat();
      coordinates.style.display = 'block';
      coordinates.innerHTML = 'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
      // console.log('Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat)
    }
    // function result()
    //   {
    //     var lngLat = MapboxGeocoder.getLngLat();
    //     coordinates.style.display = 'block';
    //     coordinates.innerHTML = 'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
    //     console.log('Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat)
    //   }  
    geomarker.on('dragend', onDragEnd);
    geocoder.on('results', function (result) {
      console.log(result.features[0].center)
      coordinates.style.display = 'block';
      var longitude = result.features[0].center[0];
      var latitude = result.features[0].center[1]
      coordinates.innerHTML = 'Longitude: ' + longitude + '<br />Latitude: ' + latitude;
      geomarker.setLngLat([longitude, latitude]);
    });
    function makegeojsonline(coordinateset,lengthofset)
      {
        mapp.on('load', function (){
          for(var i=0;i<lengthofset;i++)
          {
            // console.log(coordinateset[i].resourceSets[0].resources[0].routePath.line.coordinates)
            var actualcordinates=coordinateset[i].resourceSets[0].resources[0].routePath.line.coordinates
            var revcoordinates=[]
            // console.log(actualcordinates)
            for(var j=0;j<actualcordinates.length;j++)
              {
                revcoordinates[j]=[actualcordinates[j][1],actualcordinates[j][0]]
              }
            console.log(revcoordinates)  
            mapp.addLayer({
              "id": "route"+i,
              "type": "line",
              "source": {
              "type": "geojson",
              "data": {
              "type": "Feature",
              "properties": {},
              "geometry": {
              "type": "LineString",
              "coordinates":revcoordinates
              }
              }
              },
              "layout": {
              "line-join": "round",
              "line-cap": "round"
              },
              "paint": {
              "line-color": "#ff0808",
              "line-width": 5
              }
              });
          }

        })
      

          }
         function updatepointsonmap(coordinates,addresses)
          {
            for(var i=0;i<addresses.length;i++)
            {
              var geomarker = new mapboxgl.Marker({
                draggable: true,
              }).setLngLat([coordinates[i][1],coordinates[i][0]])
                .addTo(mapp);
            } 
          }     
      }
  
  updatevalue(data)
    {
      this.allcoordinates=data;
      for(var i=0;i<this.addresses.length;i++)
        {
          this.coordinates[i]= this.allcoordinates[i].resourceSets[0].resources[0].point.coordinates;
        } 
      // console.log(this.coordinates)
      return this.coordinates
    }

}
