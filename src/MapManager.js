

class MapManager {

  constructor( div, position, zoom, token, username, style ){
    var that = this;

    this._mapboxConfig = {
      token: token,
      username: username,
      style: style
    }

    L.mapbox.accessToken = token;

    this._map = L.mapbox.map( div ).setView( position, zoom );
    this._tileLayer = L.tileLayer( this._buildOsmPattern() ).addTo( this._map );
    this._featureGroup = L.featureGroup().addTo( this._map );
    this._wgs84box = null;

    this._events = {
      zoomend: null,
      moveend: null
    };

    this._initDrawControl();

    // init events
    this._map.on("zoomend", function(e){
      that._events.zoomend( e );
    })

    this._map.on("moveend", function(e){
      that._events.moveend( e );
    })

  }


  _initDrawControl(){
    var that = this;
    var drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this._featureGroup
      },
      draw: {
        polygon: false,
        polyline: false,
        rectangle: true,
        circle: false,
        marker: false
      }
    }).addTo( this._map );

    this._map.on('draw:created', this._showPolygonArea.bind( this ));
    this._map.on('draw:edited', this._showPolygonAreaEdited.bind( this ));
    this._map.on('draw:deleted', function(e){
      that._wgs84box = null;
    });
  }


  _showPolygonAreaEdited(e) {
    var that = this;
    e.layers.eachLayer(function(layer) {
      //showPolygonArea({ layer: layer });
      that._updateWgs84Box( layer.getBounds() )
    });
  }


  _showPolygonArea(e) {
    var that = this;
    this._featureGroup.clearLayers();
    this._featureGroup.addLayer(e.layer);
    //e.layer.bindPopup((LGeo.area(e.layer) / 1000000).toFixed(2) + ' km<sup>2</sup>');
    //e.layer.openPopup();

    that._updateWgs84Box( e.layer.getBounds()  )
  }


  /**
  * Build the OSM pattern based on the _mapboxConfig
  * @return {String} - the OSM pattern
  */
  _buildOsmPattern(){
    var osmPattern =  'https://api.mapbox.com/styles/v1/' +
                      this._mapboxConfig.username +
                      '/' +
                      this._mapboxConfig.style +
                      '/tiles/{z}/{x}/{y}?access_token=' +
                      this._mapboxConfig.token

    return osmPattern;
  }


  _updateWgs84Box( b ){
    if(b){
      this._wgs84box = b;
    }
  }

  /**
  * Update the map/layer based on a new config
  */
  updateMapboxConfig( config ){

    for( var configProp in config ){
      this._mapboxConfig[ configProp ] = config[ configProp ];
    }

    this._tileLayer.setUrl( this._buildOsmPattern() );
  }


  getWgs84box(){
    return this._wgs84box;
  }

  getMapCenter(){
    this._map.getCenter()
    return this._map.getCenter();
  }

  setMapCenter( latLon ){
    this._map.panTo( latLon )
  }

  setMapZoom( z ){
    this._map.setZoom( z )
  }

  getMapZoom( ){
    return this._map.getZoom( )
  }

  on( eventName, cb ){
    if( eventName in this._events ){
      this._events[ eventName ] = cb
    }
  }

}

module.exports = MapManager;
