var fs = require('fs');

var TileLister = require('./TileLister.js');
var TileDownloader = require('./TileDownloader.js');
var TileMerger = require('./TileMerger.js');
var MapboxUrlBuilder = require('./MapboxUrlBuilder.js');

class OsmPosterMaker {

  constructor( wgs84Box, zoom, workingFolder, outputFile, mapStyleData ){
    this._wgs84Box = wgs84Box;
    this._zoom = zoom;
    this._outputFile = outputFile;
    this._workingFolder = workingFolder;

    // create the working dir if donnot exist
    if (!fs.existsSync(this._workingFolder)){
      fs.mkdirSync(this._workingFolder);
    }

    this._tileLister = new TileLister();
    this._tileLister.setWGS84Box( wgs84Box );
    this._tileLister.setZoomLevel( zoom );
    this.osmUrlPattern = null;

    this._events = {
      tileDownloaded: null, // args: (index, total)
      downloadDone: null, // no args
      stripWriten: null, // args: (index, total)
      successMerge: null // args: ( path final image )
    }

    // getting the OSM url pattern
    if("osmPattern" in mapStyleData && typeof mapStyleData.osmPattern == "string" ){
      this.osmUrlPattern = mapStyleData.osmPattern;
    }else if( MapboxUrlBuilder.checkObjectIntegrity( mapStyleData ) ){
      var tileSize = "tileSize" in mapStyleData ? mapStyleData.tileSize : 512;
      this.osmUrlPattern = MapboxUrlBuilder.build(
        mapStyleData.username,
        mapStyleData.mapStyleID,
        mapStyleData.token,
        tileSize
      )
    }
  }


  launch(){
    var that = this;
    var tileFileList = this._tileLister.buildFileListFromOsmPattern( this.osmUrlPattern )
    var tileRange = this._tileLister.getTileRange();
    var td = new TileDownloader( tileFileList );

    td.on( "tileDownloaded", function( index, total ){
      if( that._events.tileDownloaded ){
        that._events.tileDownloaded( index, total )
      }
    })

    td.on( "downloadDone", function(){
      if( that._events.downloadDone ){
        that._events.downloadDone()
      }

      var tm = new TileMerger(that._zoom, tileRange , that._workingFolder, that._outputFile )
      tm.on( "stripWriten", that._events.stripWriten )
      tm.on( "successMerge", that._events.successMerge )
      tm.build();
    })

    td.setDestinationFolder( this._workingFolder );
    td.downloadSync();
  }


  /**
  * Add an event of the following:
  *   "tileDownloaded" called with args args: (index, total)
  *   "downloadDone" called with no args
  *   "stripWriten" called with args: (index, total)
  *   "successMerge" called with args: ( path final image )
  *
  */
  on( eventName, cb ){
    if( eventName in this._events ){
      this._events[ eventName ] = cb;
    }
  }

} /* END of class OsmPosterMaker */

module.exports = OsmPosterMaker;
