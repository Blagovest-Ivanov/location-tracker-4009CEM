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


function request_map(query, myMap) {
    if (firstTime) {
        firstTime = false;
    }
    else
    {
        layerGroup.removeLayer(layerRoute);
    }

    var request_map = $.ajax({
        'url': '/getMapData',
        data: {
            "data": query
        },
        dataType: "json"
    }).done(function(response) {

        var coordinates = JSON.parse(response.foo);
        lastUserPosition = coordinates[coordinates.length-1];
        console.log(lastUserPosition);
        console.log("Here");

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
        layerRoute = L.geoJSON(geojson).addTo(myMap);
        layerGroup.addTo(myMap);
        layerGroup.addLayer(layerRoute);
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
        let newX = lastUserPosition[1];
        let newY = lastUserPosition[0];
        myMap.setView([newX,newY],18);

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



function latest_data_table(query, tableBody) {
    var request_table = $.ajax({
        'url': '/getLatestTableData',
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

    const tableBody = document.querySelector("#table123 > tbody");
    latest_data_table(tableBody);

        var myMap = load_map();
    $('#ajaxcall').on('click', function() {
        var query = document.getElementById("fname").value;
        request_map(query, myMap);
        request_user_table(query, tableBody);
    });


    setInterval(function(){

        latest_data_table(tableBody);
    //code goes here that will be run every 5 seconds.
}, 10000);









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