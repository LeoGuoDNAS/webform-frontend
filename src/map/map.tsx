// YourMapComponent.tsx
import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';

const Pin = (_props: any) => { 
    return <div>
        <i className="fa-solid fa-location-dot fa-fade fa-xl" style={{color: "#d05400"}}></i>
    </div>;
    
}

export const MapComponent: React.FC<{ latitude: number, longitude: number }> = ({latitude, longitude}) => {
    const [center, setCenter] = useState({ lat: 40.728331390509545, lng : -73.69377750670284 });
    const [zoom, setZoom] = useState(16);

    useEffect(() => {
        setCenter({
            lat: latitude,
            lng: longitude
        });
    }, [latitude, longitude]);

    // function renderMarkers(map, maps, center) {
    //     let marker = new maps.Marker({
    //         position: [center.lat, center.lng],
    //         map,
    //         title: 'Hello World!'
    //     });
    // }

    return (
        <div style={{ height: '25em', width: '100%', marginTop: '50px' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.REACT_APP_GCP_MAPS_KEY! }}
                center ={center}
                defaultZoom={zoom}
                options={{
                    panControl: false,
                    // zoomControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    // maxZoom: zoom,
                    // minZoom: zoom,
                    "gestureHandling": 'greedy',
                    scrollwheel: false,
                    draggable: false
                }}
            >
                <Pin lat={latitude} lng={longitude} />
            </GoogleMapReact>
        </div>
    );
}

export default MapComponent;
