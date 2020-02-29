function load_map() {
    
    var mymap = L.map('mapid').setView([52.406822, -1.519693], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        accessToken: 'pk.eyJ1IjoiYW5lYWJvZ2RhbjEyMyIsImEiOiJjazZ1d2k0bnUwZGRlM2tyam96ajU0YjgyIn0.xV42iki7e4xr3dIHA_i-NA',
        zoomOffset: -1
    }).addTo(mymap);
    return mymap;
}

function request_map(query, myMap) {
    var request_map = $.ajax({
        'url': '/getData_map',
        data: {
            "data": query
        },
        dataType: "json"
    }).done(function(response) {
        var coordinates = JSON.parse(response.foo);
        var geojson = {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": coordinates
                }
            }]
        };
        L.geoJSON(geojson).addTo(myMap);
    });
    request_map.fail(function(jqXHR, textStatus) {
        alert('Request failed: ' + textStatus);
    });
}

function request_table(query, tableBody) {
    var request_table = $.ajax({
        'url': '/getData_table',
        data: {
            "data": query
        },
        dataType: "json"
    }).done(function(response) {
        var data_table = JSON.parse(response.foo);
        while(tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild); //removes data already loaded
        }
        data_table.forEach((row) => {
            const tr = document.createElement("tr");
            row.forEach((cell) => {
                const td = document.createElement("td");
                td.textContent = cell;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    });
    request_table.fail(function(jqXHR, textStatus) {
        alert('Request failed: ' + textStatus);
    });
}
$(document).ready(function() {
    var myMap = load_map();
    $('#ajaxcall').on('click', function() {
        var query = document.getElementById("fname").value;
        request_map(query, myMap);
        const tableBody = document.querySelector("#table123 > tbody")
        request_table(query, tableBody);
    });
});