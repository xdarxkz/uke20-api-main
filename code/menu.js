document.addEventListener("DOMContentLoaded", function() {
    const attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    let map = L.map('map1').setView([39.8283, -98.5795], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution }).addTo(map);
    let markersLayer = L.layerGroup().addTo(map);

    async function showBreweries() {
        const state = document.getElementById('searchbar').value.trim();
        const api_url = `https://api.openbrewerydb.org/v1/breweries?by_state=${state}&per_page=50`;

        try {
            const response = await fetch(api_url);
            const data = await response.json();

            console.log('API Response:', data); 

         
            markersLayer.clearLayers();
            const breweriesList = document.getElementById('breweriesList');
            breweriesList.innerHTML = '';

        
            if (Array.isArray(data) && data.length > 0) {
             
                data.forEach((element, index) => {
                    if (element.latitude && element.longitude) {
                        console.log(`Adding marker for: ${element.name} at [${element.latitude}, ${element.longitude}]`);
                        const beerIcon = L.icon({
                            iconUrl: 'beer.png',
                            iconSize: [32, 32],
                            iconAnchor: [16, 32],
                            popupAnchor: [0, -32]
                        });
                        const marker = L.marker([parseFloat(element.latitude), parseFloat(element.longitude)], { icon: beerIcon }).addTo(markersLayer);
                        marker.bindPopup(`
                            <div class="popup-content">
                                <h3>${element.name}</h3>
                                <p><strong>Address:</strong> ${element.street}, ${element.city}, ${element.state}</p>
                                <p><strong>Phone:</strong> ${element.phone ? element.phone : 'Not available'}</p>
                                <p><strong>Location:</strong> Lat: ${element.latitude}, Lng: ${element.longitude}</p>
                                <p><strong>Website:</strong> <a href="${element.website_url}" target="_blank">${element.website_url}</a></p>
                            </div>
                        `);

                        if (index < 3) {
                            const listItem = document.createElement('li');
                            listItem.innerHTML = `${index + 1}. ${element.name}`;
                            listItem.addEventListener('click', () => {
                                map.setView([parseFloat(element.latitude), parseFloat(element.longitude)], 10);
                                marker.openPopup();
                            });
                            breweriesList.appendChild(listItem);
                        }
                    } else {
                        console.log('Invalid latitude or longitude for element:', element);
                    }
                });

             
                const latlngs = data.filter(el => el.latitude && el.longitude).map(el => [parseFloat(el.latitude), parseFloat(el.longitude)]);
                if (latlngs.length > 0) {
                    const bounds = L.latLngBounds(latlngs);
                    map.fitBounds(bounds);
                } else {
                    console.log('No valid coordinates to adjust map bounds');
                }
            } else {
                console.log('No data or empty data array returned from API');
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    document.querySelector('button[type="submit"]').addEventListener('click', showBreweries);

  
    const mapImage = document.getElementById('mapImage');
    mapImage.addEventListener('click', function() {
        mapImage.style.display = 'none';
        document.getElementById('map1').style.display = 'block'; 
        map.invalidateSize(); 
    });
});
