

class MapboxUrlBuilder {

  static checkObjectIntegrity( obj ){
    return ("username" in obj) && ("mapStyleID" in obj) && ("token" in obj)
  }

  /**
  * Build a tile url list based on Mapbox tile style and account credential
  * @param {String} username - Mapbox username
  * @param {String} mapStyleID - the ID of the style
  * @param {String} token - Mapbox token
  * @param {Number} tileSize - the size of the tile (256, 512 or 1024)
  * @return {Array} of tile url with their respective x y andz
  */
  static build(username, mapStyleID, token, tileSize = 512){
    var mapboxPattern = "https://api.mapbox.com/styles/v1/" +
                        username +
                        "/" +
                        mapStyleID +
                        "/tiles/" +
                        (tileSize == 256 ? "256" : "512") +
                        "/{z}/{x}/{y}" +
                        (tileSize == 1024 ? "@2x" : "") +
                        "?access_token=" +
                        token;

    return mapboxPattern;
  }

}

module.exports = MapboxUrlBuilder;
