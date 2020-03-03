function load_map() {
        let myMap = L.map('mapid').setView([52.406822, -1.519693], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        accessToken: 'pk.eyJ1IjoiYW5lYWJvZ2RhbjEyMyIsImEiOiJjazZ1d2k0bnUwZGRlM2tyam96ajU0YjgyIn0.xV42iki7e4xr3dIHA_i-NA',
        zoomOffset: -1
    }).addTo(myMap);
    // myLayer = L.geoJSON().addTo(myMap);

    return myMap;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}




function request_map(query, myMap) {
    if (firstTime) {
        firstTime = false;
    }
    else
    {
        layerGroup.removeLayer(layerRoute);
        layerGroup.removeLayer(marker);
    }

    var request_map = $.ajax({
        'url': '/getMapData',
        data: {
            "data": query
        },
        dataType: "json"
    }).done(function(response) {

        let coordinates = JSON.parse(response.foo);
        console.log(coordinates);
        console.log(response.location);
        let realAddress = JSON.parse(response.location);
        console.log(realAddress);
        let lastUserPosition = coordinates[coordinates.length-1];
        let distanceTravelled=0;
        for (let i = 0; i<= coordinates.length - 2 ; i++)
        {
            let firstLatitude = coordinates[i][0];
            let firstLongitude = coordinates[i][1];
            let secondLatitude = coordinates[i+1][0];
            let secondLongitude = coordinates[i+1][1];
            distanceTravelled += getDistanceFromLatLonInKm(firstLatitude,firstLongitude,secondLatitude,secondLongitude);
        }

        console.log("Distance travelled:",distanceTravelled);
        let newX = lastUserPosition[1];
        let newY = lastUserPosition[0];
        lastUserPosition = [newX,newY];
        console.log(lastUserPosition);
        console.log("Here");
        console.log(realAddress);

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

    let markerOptions = {
    color: '#ffa500'

        };
      // let markerData = {"Address": realAddress
      //                   "Distance"
      //                   }
      marker = L.circleMarker(lastUserPosition,markerOptions).addTo(myMap);
      marker.bindPopup("Address aproximation:" +  realAddress + "<br>" + "Distance Today: " + distanceTravelled).openPopup();

        layerRoute = L.geoJSON(geojson).addTo(myMap);
        layerGroup.addTo(myMap);
        layerGroup.addLayer(layerRoute);
        layerGroup.addLayer(marker);

        console.log(coordinates.length);
        update_new_map_position(lastUserPosition,myMap);

    });
    request_map.fail(function(jqXHR, textStatus) {
        alert('Request failed: ' + textStatus);
    });
}

function update_new_map_position(lastUserPosition, myMap)
{
        // console.log(newMapPosition);

        myMap.setView(lastUserPosition,13);


}



function request_user_table(query, tableBody) {
    var request_table = $.ajax({
        'url': '/getTableData',
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


    function latest_data_table(tableBody) {

      var request_table = $.ajax({
        'url': '/getLatestTableData',
        data: {
            "data":"empty",
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

    const tableBody = document.querySelector("#table123 > tbody");
    latest_data_table(tableBody);

        var myMap = load_map();
    $('#ajaxcall').on('click', function() {
        var query = document.getElementById("fname").value.toUpperCase();
        request_map(query, myMap);
        request_user_table(query, tableBody);
    });


    setInterval(function(){
        latest_data_table(tableBody);
        console.log("updating table")
        // every 20s
    }, 50000);




















 //
 // $('#latest_data_table').on('click', function() {
 //        // var query = document.getElementById("fname").value;
 //        // request_map(query, myMap);
 //        // const tableBody = document.querySelector("#table123 > tbody")
 //        request_user_table(tableBody);
 //    });



});

var layerGroup = new L.LayerGroup();
var firstTime = true;
var layerRoute;