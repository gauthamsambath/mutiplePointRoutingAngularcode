declare module namespace {

    export interface Point {
        type: string;
        coordinates: number[];
    }

    export interface Address {
        adminDistrict: string;
        adminDistrict2: string;
        countryRegion: string;
        formattedAddress: string;
        locality: string;
        neighborhood: string;
    }

    export interface GeocodePoint {
        type: string;
        coordinates: number[];
        calculationMethod: string;
        usageTypes: string[];
    }

    export interface Resource {
        __type: string;
        bbox: number[];
        name: string;
        point: Point;
        address: Address;
        confidence: string;
        entityType: string;
        geocodePoints: GeocodePoint[];
        matchCodes: string[];
    }

    export interface ResourceSet {
        estimatedTotal: number;
        resources: Resource[];
    }

    export interface RootObject {
        authenticationResultCode: string;
        brandLogoUri: string;
        copyright: string;
        resourceSets: ResourceSet[];
        statusCode: number;
        statusDescription: string;
        traceId: string;
    }

}
