const HomeSpace = require("./HomeSpace.js")
const MapManager = require('./MapManager.js');


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
    }

    this._uiComponents.optionButtonBt.addEventListener("mousedown", this.showModal.bind(this));
    this._uiComponents.backToMapBt.addEventListener("mousedown", this.showMap.bind(this) );

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

}

module.exports = Controller;
