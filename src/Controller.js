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
  }

  _initUI(){
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

}

module.exports = Controller;
