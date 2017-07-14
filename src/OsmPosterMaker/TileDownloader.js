var fs = require('fs');
var http = require('http');
var https = require('https');
var execSync = require('child_process').execSync;

class TileDownloader {

  constructor( tileFileList = null ){
    this._tileFileList = tileFileList;
    this._destFolder = null;
    this._tileDownloadCounter = 0;
    this._allLocalFiles = [];

    this._events = {
      tileDownloaded: null,
      downloadDone: null
    }
  }


  on( eventName, cb ){
    if( eventName in this._events ){
      this._events[ eventName ] = cb;
    }
  }


  /**
  * Set the tile file list. Eqch element of the list must have a "url" and a "xyz" property
  * @param {Array} tl - list of tiles url
  */
  setTileFileList( tl ){
    this._tileFileList = tl;
  }


  /**
  * Define the destination directory, where the tiles will be copied
  * @param {String} folder - the folder path
  */
  setDestinationFolder( folder ){
    try {
      fs.statSync( folder );
      this._destFolder = folder;
    } catch(e) {
      console.error( e );
    }
  }


  downloadSync(){
    if( !this._tileFileList ){
      console.error("The tile file list was not specified");
      return;
    }

    if( !this._tileFileList.length ){
      console.error("The tile file list is empty");
      return;
    }

    if( !this._destFolder ){
      console.error("The destination folder was not specified");
      return;
    }

    for(var i=0; i<this._tileFileList.length; i++){
      this._downloadTileFromIndexSync( i );


      if( this._events.tileDownloaded ){
        this._events.tileDownloaded(i+1 , this._tileFileList.length)
      }

    }

    // calling the event when downlod is done
    if( this._events.downloadDone ){
      this._events.downloadDone()
    }

  }


  _downloadTileFromIndexSync( i ){
    var that = this;
    var localFilePath = this._destFolder +
                        "/" +
                        this._tileFileList[i].xyz.x +
                        "_" +
                        this._tileFileList[i].xyz.y +
                        "_" +
                        this._tileFileList[i].xyz.z +
                        ".png";

    var distantFileUrl = this._tileFileList[i].url;

    var cmd = [
      "wget",
      "-O",
      localFilePath,
      distantFileUrl,
      ">/dev/null 2>&1"
    ].join(" ");

    //console.log( cmd );

    execSync(cmd);
  }


} /* END of class TileDownloader */

module.exports = TileDownloader;
