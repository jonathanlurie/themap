/*
const imagemagickPath = __dirname + "/../../bin/darwin/imagemagick"
const libpngPath = __dirname + "/../../bin/darwin/libpng";

// Use a custom libpng
process.env['DYLD_LIBRARY_PATH'] = libpngPath + "/lib:"

// Use a custom Imagamagick
process.env['MAGICK_HOME'] = imagemagickPath;
process.env['PATH'] = imagemagickPath + "/bin:" + process.env['PATH'];
process.env['DYLD_LIBRARY_PATH'] = imagemagickPath + "/lib:"
*/

var gm = require('gm').subClass({ imageMagick: true });

class TileMerger {
  constructor(zoom, tileRange , tileFolder, outputFilename  ){
    this._zoom = zoom;
    this._tileRange = tileRange;
    this._tileFolder = tileFolder;
    this._outputFilename = outputFilename;
    this._stripNames = [];
    this._nbStripsSuccesfullyWritten = 0;

    this._events = {
      stripWriten: null, // args: (index, total)
      successMerge: null // args: ( path final image )
    }
  }


  on( eventName, cb ){
    if( eventName in this._events ){
      this._events[ eventName ] = cb;
    }
  }


  build(){
    var that = this;
    var nbTileWidth = this._tileRange.x.max - this._tileRange.x.min + 1;
    var nbTileHeight = this._tileRange.y.max - this._tileRange.y.min + 1;

    // reinint the stripname list
    this._stripNames.length = 0;
    this._nbStripsSuccesfullyWritten = 0;

    for(var y=this._tileRange.y.min; y<=this._tileRange.y.max; y++){
      var currentStripGm = gm();

      for(var x=this._tileRange.x.min; x<=this._tileRange.x.max; x++){
        var toBeMerged = this._tileFolder +
                         "/" +
                         x +
                         "_" +
                         y +
                         "_" +
                         this._zoom +
                         ".png";

        currentStripGm.append( toBeMerged , true)
      }

      var currentStripName = this._tileFolder + "/strip_" + this._stripNames.length + ".png";
      this._stripNames.push( currentStripName )

      currentStripGm.write(
        currentStripName,
        function (err) {
          if( err ){
            console.error( err );
          }else{
            //console.log("success strip: " + that._nbStripsSuccesfullyWritten);
            that._nbStripsSuccesfullyWritten++;

            if( that._events.stripWriten ){
              that._events.stripWriten( that._nbStripsSuccesfullyWritten, nbTileHeight )
            }

            if( nbTileHeight == that._nbStripsSuccesfullyWritten){
              //console.log( "wrote all stripes!" );
              that._mergeStrips();
            }

          }
        }
      );
    }

  } // end build


  _mergeStrips(){
    var that = this;
    var allStrips = gm();

    allStrips.append(this._stripNames, false)

    allStrips.write(
      this._outputFilename,
      function (err) {
        if( err ){
          console.error( err );
        }else{
          if( that._events.successMerge ){
            that._events.successMerge( that._outputFilename )
          }

        }
      }
    );
  }

}

module.exports = TileMerger;
