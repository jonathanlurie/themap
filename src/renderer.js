

L.mapbox.accessToken = 'pk.eyJ1Ijoiam9uYXRoYW5sdXJpZSIsImEiOiJjajRuandpdnAwMHpzMnd0Y3FwYXBlNTZ0In0.yZ21xWxBlESJVQib1wJDoA';

//var mapStyle = 'mapbox.streets'


var map = L.mapbox.map('map').setView([0, 0], 2);

var tileLayer = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/{z}/{x}/{y}?access_token=' + L.mapbox.accessToken ).addTo(map);

console.log( tileLayer );

var featureGroup = L.featureGroup().addTo(map);

var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: featureGroup
  },
  draw: {
    polygon: false,
    polyline: false,
    rectangle: true,
    circle: false,
    marker: false
  }
}).addTo(map);

map.on('draw:created', showPolygonArea);
map.on('draw:edited', showPolygonAreaEdited);

function showPolygonAreaEdited(e) {
  e.layers.eachLayer(function(layer) {
    //showPolygonArea({ layer: layer });
    updateWgs84Box( layer.getBounds() )
  });
}
function showPolygonArea(e) {
  featureGroup.clearLayers();
  featureGroup.addLayer(e.layer);
  //e.layer.bindPopup((LGeo.area(e.layer) / 1000000).toFixed(2) + ' km<sup>2</sup>');
  //e.layer.openPopup();

  updateWgs84Box( e.layer.getBounds()  )
}


function updateTileStyle( mapboxUsername, styleId ){
  var osmPattern =  'https://api.mapbox.com/styles/v1/' +
                    mapboxUsername +
                    '/' +
                    styleId +
                    '/tiles/{z}/{x}/{y}?access_token=' +
                    L.mapbox.accessToken
  tileLayer.setUrl( osmPattern )
}

/*
var theButton = document.getElementById("theButton");
theButton.onclick = function(e){
  updateTileStyle('jonathanlurie', 'cj4g48asn0z5e2rn1alrdx14h')
}
*/

function updateWgs84Box( bounds ){
  console.log( bounds );
}
