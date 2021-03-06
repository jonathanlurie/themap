const os = require('os');
const HomeSpace = require("./HomeSpace.js")
const MapManager = require('./MapManager.js');
const dialog = require('electron').remote.dialog;
const OsmPosterMaker = require('./OsmPosterMaker/OsmPosterMaker.js');
const {shell} = require('electron');

class Controller {

  constructor(){
    var that = this;
    // clean the working dir
    HomeSpace.cleanWorkingDir();

    var config = HomeSpace.getConfig();

    this._mapManager = new MapManager(
      "map",
      config.lastPosition,
      config.lastZoom,
      config.token,
      config.username,
      config.mapStyle
    );

    this._destinationFile = null;
    this._logString = "";
    this._initUI();
    this.updateUiWithConfig( config );
    //this._initLogInterval();

    this._decal = 0;
  }

  _initUI(){

    var that = this;

    this._uiComponents = {
      modal: document.getElementById("modal"),
      username: document.getElementById("username"),
      style: document.getElementById("styleId"),
      token: document.getElementById("token"),
      reloadDefaultBt: document.getElementById("reloadDefault"),
      validateMapboxDataBt: document.getElementById("validateMapboxData"),
      launchCaptureBt: document.getElementById("launchCapture"),
      backToMapBt: document.getElementById("backToMap"),
      linkToHelpBt: document.getElementById("linkToHelp"),
      linkToGithubBt: document.getElementById("linkToGithub"),
      optionButtonBt: document.getElementById("optionButton"),
      logArea: document.getElementById("logArea"),
    }

    this._uiComponents.optionButtonBt.addEventListener("mousedown", this.showModal.bind(this));
    this._uiComponents.backToMapBt.addEventListener("mousedown", this.showMap.bind(this) );
    this._uiComponents.launchCaptureBt.addEventListener("mousedown", this._openSaveDialog.bind(this) );

    this._uiComponents.linkToHelpBt.addEventListener("mouseup", function(e){
      shell.openExternal('https://github.com/jonathanlurie/themap/tree/master/help')
    });

    this._uiComponents.linkToGithubBt.addEventListener("mouseup", function(e){
      shell.openExternal('https://github.com/jonathanlurie/themap')
    });

    // relead default button
    this._uiComponents.reloadDefaultBt.addEventListener(
      "mousedown",
      function(e){
        HomeSpace.initHomeSpace();
        var config = HomeSpace.getConfig();

        // just text fields updates
        that.updateUiWithConfig( config );

        that._mapManager.updateMapboxConfig({
          username: config.username,
          style: config.mapStyle,
          token: config.token
        });

        that._mapManager.setMapCenter( config.lastPosition )

        that._mapManager.setMapZoom( config.lastZoom );
      }
    );


    // validate button
    this._uiComponents.validateMapboxDataBt.addEventListener(
      "mousedown",
      function(e){
        if( !that._uiComponents.username.value.length ){
          console.warn("The field 'username' is missing");
          return;
        }

        if( !that._uiComponents.token.value.length ){
          console.warn("The field 'token' is missing");
          return;
        }

        if( !that._uiComponents.style.value.length ){
          console.warn("The field 'style' is missing");
          return;
        }

        HomeSpace.updateConfig({
          username: that._uiComponents.username.value,
          token: that._uiComponents.token.value,
          mapStyle: that._uiComponents.style.value
        })

        var config = HomeSpace.getConfig();

        that._mapManager.updateMapboxConfig({
          username: config.username,
          style: config.mapStyle,
          token: config.token
        });

      }
    );


    this._mapManager.on( "zoomend", function(e){
      HomeSpace.updateConfig({
        lastZoom: that._mapManager.getMapZoom()
      })

      document.title = "The Map. (" + that._mapManager.getMapZoom() + ")";
    })


    this._mapManager.on( "moveend", function(e){
      HomeSpace.updateConfig({
        lastPosition: that._mapManager.getMapCenter()
      })
    })


    this.showMap();



  }


  /**
  * Show the map and hide the modal
  */
  showMap(){
    this._uiComponents.modal.style.display = "none";
    this._uiComponents.optionButtonBt.style.display = "initial";
    document.title = "The Map. (" + this._mapManager.getMapZoom() + ")";
  }


  /**
  * Show the modal over the map
  */
  showModal(){
    this._uiComponents.modal.style.display = "initial";
    this._uiComponents.optionButtonBt.style.display = "none";
  }

  updateUiWithConfig( config ){
    this._uiComponents.username.value = config.username;
    this._uiComponents.token.value = config.token;
    this._uiComponents.style.value = config.mapStyle;
  }


  _initLogInterval(){
    var that = this;

    /*
    setInterval(function() {
      console.log( "refresh log");
      that._uiComponents.logArea.value = that._logString;
      that._uiComponents.logArea.scrollTop = that._uiComponents.logArea.scrollHeight;
    },
    100); // ms
    */

    var delay = 300; // ms

    function timeoutLoop() {
      console.log( "refresh log");
      that._uiComponents.logArea.value = that._logString;
      that._uiComponents.logArea.scrollTop = that._uiComponents.logArea.scrollHeight;
      setTimeout(timeoutLoop, delay);
   }

   setTimeout(timeoutLoop, delay);

  }

  /**
  * Add a line in the textarea log
  * @param {String}
  */
  addLog( text ){
    document.title = "The Map. ( " + text + " )";
    console.log( text );
    this._logString += "\n" + text;
    this._refreshLogArea();
  }


  cleanLog(){
    document.title = "The Map.";
    this._logString = "";
    this._refreshLogArea();
  }


  _refreshLogArea(){
    this._uiComponents.logArea.value = this._logString;
    this._uiComponents.logArea.scrollTop = this._uiComponents.logArea.scrollHeight;
  }

  _openSaveDialog(e){
    var that = this;

    console.log( OsmPosterMaker );

    // if no box
    if( !this._mapManager.getWgs84box() ){
      dialog.showMessageBox({
        type: "warning",
        title: "The Map",
        message: "You must select an area before exporting"
      })
      return;
    }


    dialog.showSaveDialog({title:"Save the map", defaultPath: os.homedir() + "/output.png" }, function (fileName) {
      console.log( fileName );

      if( fileName === undefined )
        return;

      that._launchMapCapture( fileName );
    });

  }


  _getTileSize(){
    var tileSizeSelector = document.getElementById("tileSizeSelector");
    return tileSizeSelector.options[tileSizeSelector.selectedIndex].value;
  }


  _launchMapCapture( outputName ){
    var that = this;

    this.cleanLog();

    var config = HomeSpace.getConfig();
    var leafletBox = this._mapManager.getWgs84box();

    var box = {
      n: leafletBox.getNorth(),
      s: leafletBox.getSouth(),
      e: leafletBox.getEast(),
      w: leafletBox.getWest()
    }

    var zoom = this._mapManager.getMapZoom();

    var mapBoxStyle = {
      username: config.username,
      mapStyleID: config.mapStyle,
      token: config.token,
      tileSize: this._getTileSize()
    }

    console.log( mapBoxStyle );

    var pm = new OsmPosterMaker(
      box,
      zoom,
      HomeSpace.getWorkingDir(),
      outputName,
      mapBoxStyle
    )

    // defining some events

    pm.on( "tileDownloaded", function(index, total){
      that.addLog( "downloading tile: " + index + "/" + total );
    })

    pm.on( "downloadDone", function(){
      that.addLog("all tiles are downloaded");
    })

    pm.on( "stripWriten", function(index, total){
      that.addLog("strip written: " + index + "/" + total);

      if( index == total ){
        that.addLog("merging final image...");
      }
    })

    pm.on( "successMerge", function( path ){
      that.addLog("final image ready at: " + path);

      var shell = require('electron').remote.shell;
      shell.showItemInFolder(path);

      // clean the working dir
      HomeSpace.cleanWorkingDir();
    })

    pm.launch();
  }

}

module.exports = Controller;
