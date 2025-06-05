mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    //New Delhi coordinates 
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 8 // starting zoom
});

// Create a default Marker and add it to the map.
// const marker1 = new mapboxgl.Marker({ color: 'red' })
//     .setLngLat(listing.geometry.coordinates)    //Listing.geometry.coordinates
//     .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
//         `<h3>${listing.title}</h3><p>Exact location will be provided after booking!</p>`))
//     .addTo(map);


map.on('load', () => {
    // Load an image from an external URL.
    map.loadImage(
        '/image/home.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.addImage('home', image);

            // Add a data source containing one point feature.
            map.addSource('point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': listing.geometry.coordinates
                            }
                        }
                    ]
                }
            });

            // Add a layer to use the image to represent the data.
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'point', // reference the data source
                'layout': {
                    'icon-image': 'home', // reference the image
                    'icon-size': 0.07
                }
            });

            //Popup on icon
            map.on('click', 'points', (e) => {
                const coords = e.features[0].geometry.coordinates;
                const title = e.features[0].properties.title;
                new mapboxgl.Popup()
                    .setLngLat(coords)
                    .setHTML(`<h3>${listing.title}</h3><p>Exact location will be provided after booking!</p>`)
                    .addTo(map);
            });
        }
    );
});