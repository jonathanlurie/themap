
/**
* Lists all the tiles necessary index for a given GPS box
*/
class TileLister {
  constructor(){

    // centered on Null Island
    this._wgs84box = {
      n: 1,
      s: -1,
      e: 1,
      w: -1
    }

    this._zoom = 0;

    // used to validate the WGS84 box
    this._boundaries = {
      latitude: {
        min: -89,
        max: 89
      },
      longitude: {
        min: -180,
        max: 180
      },
      zoom: {
        min: 0,
        max: 20
      }
    }

    this._tileIndexList = [];

    this._tileRange = {
      x: {
        min: 0,
        max: 0
      },
      y: {
        min: 0,
        max: 0
      }
    }
  }


  /**
  * Define the north south east west box using WGS84/GPS coordinates
  * @param {Object} box - must be of the form {n: Number, s: Number, e: Number, w: Number}
  */
  setWGS84Box( box ){
    if( !this.isBoxValid(box) )
      return;

    this._wgs84box.n = box.n;
    this._wgs84box.s = box.s;
    this._wgs84box.e = box.e;
    this._wgs84box.w = box.w;
  }


  setZoomLevel( z ){
    if(z < this._boundaries.zoom.min || z > this._boundaries.zoom.max){
      console.error("The zoom level is out of bound.");
      return;
    }

    this._zoom = z;
  }


  /**
  * Verify if a WGS84/GPS box is valid.
  * @param {Object} box - must be of the form {n: Number, s: Number, e: Number, w: Number}
  * @return {Boolean} true is the box is valid, false if not
  */
  isBoxValid( box ){
    // Are the nsew properties present in the box?
    if( !("n" in box) || !("s" in box) || !("e" in box) || !("w" in box) ){
      console.error("The WGS84 box must contain the properties 'n', 's', 'e' and 'w'.");
      return false;
    }

    // Are they numbers?
    if( typeof box.n !== "number" || typeof box.s !== "number" ||
        typeof box.e !== "number" || typeof box.w !== "number")
    {
      console.error("The WGS84 box properties 'n', 's', 'e' and 'w' must be numbers.");
      return false;
    }

    // must be in bounds
    if( box.n < this._boundaries.latitude.min || box.n > this._boundaries.latitude.max ||
        box.s < this._boundaries.latitude.min || box.s > this._boundaries.latitude.max ||
        box.e < this._boundaries.longitude.min || box.e > this._boundaries.longitude.max ||
        box.w < this._boundaries.longitude.min || box.w > this._boundaries.longitude.max
    ){
      console.error("The WGS84 box properties 'n', 's', 'e' and 'w' are out of bounds.");
      return false;
    }

    // s must be lower than n and e lower than w
    if( box.n < box.s || box.e < box.w){
      console.error("The north value must be higher than the south value and the east value must be higher than the west value.");
      return false;
    }

    return true;
  }



  _long2tile(lon,zoom) {
      return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
  }


  _lat2tile(lat,zoom)  {
      return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
  }


  buildTileIndexList(){
    var xRange = [ this._long2tile(this._wgs84box.w, this._zoom), this._long2tile(this._wgs84box.e, this._zoom) ];
    var yRange = [ this._lat2tile(this._wgs84box.n, this._zoom), this._lat2tile(this._wgs84box.s, this._zoom) ];

    this._tileRange.x.min = xRange[0];
    this._tileRange.x.max = xRange[1];
    this._tileRange.y.min = yRange[0];
    this._tileRange.y.max = yRange[1];

    // reinit the list
    this._tileIndexList.length = 0;

    for(var x=xRange[0]; x<=xRange[1]; x++){
      for(var y=yRange[0]; y<=yRange[1]; y++){
        this._tileIndexList.push(
          {
            x: x,
            y: y,
            z: this._zoom
          }
        )
      }
    }
    //console.log(this._tileIndexList);
  }


  getTileIndexList(){
    return this._tileIndexList;
  }


  /**
  * Build a list of tile files based on a OSM url pattern
  * @param {String} tileUrlPattern - osm tile pattern containing {x} {y} and {z}
  * @return {Array} of tile url with their respective x y andz
  */
  buildFileListFromOsmPattern( tileUrlPattern ){
    if( !this._tileIndexList.length ){
      this.buildTileIndexList();
    }

    var fileList = new Array( this._tileIndexList.length );

    for(var i=0; i<fileList.length; i++){
      var x = this._tileIndexList[i].x;
      var y = this._tileIndexList[i].y;
      var z = this._tileIndexList[i].z;

      fileList[i] = {};
      fileList[i].xyz = {x: x, y: y, z: z};
      fileList[i].url = tileUrlPattern.replace("{x}", x)
                                      .replace("{y}", y)
                                      .replace("{z}", z);
    }

    return fileList;
  }


  /**
  * Get a copy of the tilerange object
  */
  getTileRange(){
    return JSON.parse( JSON.stringify(this._tileRange) );
  }

} /* END of class TileLister */


//export { TileLister }
module.exports = TileLister;
