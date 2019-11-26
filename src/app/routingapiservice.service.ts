import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';  // RxJS 6 syntax

@Injectable({
  providedIn: 'root'
})
export class RoutingapiserviceService {
  API_KEY='Am645nTS2rVqgDNr8UDKqZPdOL-X2_Z94sS5-GqjNBcoMfSOi_dVC6KTDGxL_jDb'
  responses=[];
  waypoints=[]
  constructor(private httpclient:HttpClient) { }
  public getLatandLong(addresses):Observable<any>
    {
      for(var i=0;i<addresses.length;i++)
        {
          this.responses[i]=this.httpclient.get('http://dev.virtualearth.net/REST/v1/Locations?query='+addresses[i]+'&includeNeighborhood=1&include=1&maxResults=5&key='+this.API_KEY);
        }
        return forkJoin(this.responses)
    }
  public getGeoJsonLatLOng(coordinates,addresses)
    {
      for(var i=0;i<addresses.length-1;i++)
      {
        this.waypoints[i]=this.httpclient.get('http://dev.virtualearth.net/REST/V1/Routes?wp.0='+coordinates[i][0]+', '+coordinates[i][1]+'&wp.1='+coordinates[i+1][0]+','+ coordinates[i+1][1]+'&optmz=distance&routeAttributes=routePath&key=Am645nTS2rVqgDNr8UDKqZPdOL-X2_Z94sS5-GqjNBcoMfSOi_dVC6KTDGxL_jDb') 
      }
      return forkJoin(this.waypoints)
    }  
}
