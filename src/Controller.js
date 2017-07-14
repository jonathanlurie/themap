const os = require('os');
const HomeSpace = require("./HomeSpace.js")
const MapManager = require('./MapManager.js');
const dialog = require('electron').remote.dialog;
const OsmPosterMaker = require('./OsmPosterMaker/OsmPosterMaker.js');

class Controller {

  constructor(){
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

    this._initUI();
    this.updateUiWithConfig( config );
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


  /**
  * Add a line in the textarea log
  * @param {String}
  */
  addLog( text ){
    this._uiComponents.logArea.value += "\n" + text;
    this._uiComponents.logArea.scrollTop = this._uiComponents.logArea.scrollHeight;
  }


  cleanLog(){
    this._uiComponents.logArea.value = "";
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


    dialog.showSaveDialog({title:"Save the map", defaultPath: os.homedir() }, function (fileName) {
      console.log( fileName );

      if( fileName === undefined )
        return;

      that._launchMapCapture( fileName );
    });

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
      tileSize: 1024
    }

    var pm = new OsmPosterMaker(
      box,
      zoom,
      HomeSpace.getWorkingDir(),
      outputName,
      mapBoxStyle
    )

    // defining some events

    pm.on( "tileDownloaded", function(index, total){
      that.addLog("DL tile: " + index + "/" + total);
      console.log("DL tile: " + index + "/" + total);
    })

    pm.on( "downloadDone", function(){
      that.addLog("All tiles are downloaded");
      console.log("All tiles are downloaded");
    })

    pm.on( "stripWriten", function(index, total){
      that.addLog("Strip written: " + index + "/" + total);
      console.log("Strip written: " + index + "/" + total);
    })

    pm.on( "successMerge", function( path ){
      that.addLog("Final image ready at: " + path);
      console.log("Final image ready at: " + path);

      var shell = require('electron').remote.shell;
      shell.showItemInFolder(path);
    })




    pm.launch();
  }

}

module.exports = Controller;
