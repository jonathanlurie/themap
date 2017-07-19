const os = require('os');
//const fs = require('fs');
const execSync = require('child_process').execSync;
const fs_sync = require('fs-sync');
const jsonfile = require('jsonfile')
jsonfile.spaces = 2;

const _homeSpaceDir = os.homedir() + "/.themap";
const _workingDir = "working"
const _configDefaultFilename = "config.default.json";
const _configFilename = "config.json";

var _localConfig = null;

/**
* HomeSpace deals with storing a temporary config in the home directory,
* under the folder ".cartographer"
* This folders has:
* - a config file named "config.json", that is (at first) a copy of "config.default.json"
* - a folder names "work" used to store temporary files (like tiles and strips)
*/
class HomeSpace {

  /**
  * Init (force) the homespace in the home dir + copy the default config file
  */
  static initHomeSpace(){
    fs_sync.mkdir( _homeSpaceDir );
    fs_sync.mkdir( _homeSpaceDir + "/" + _workingDir );
    fs_sync.copy( __dirname + "/" + _configDefaultFilename , _homeSpaceDir + "/" + _configFilename, { force: true } );

    try{
      //config = fs_sync.readJSON( _homeSpaceDir + "/" + _configFilename )
      _localConfig = jsonfile.readFileSync( _homeSpaceDir + "/" + _configFilename )
    }catch(e){
      _localConfig = jsonfile.readFileSync( __dirname + "/" + _configDefaultFilename )
    }
  }


  /**
  * Get the config as an object
  * @return {Object} the json config as a JS object
  */
  static getConfig( forceRead = false ){
    if( _localConfig && !forceRead ){
      return _localConfig;
    }

    // if the config does not exist, we init the home space
    if( !fs_sync.exists( _homeSpaceDir + "/" + _configFilename )  ){
      HomeSpace.initHomeSpace();
    }

    try{
      //config = fs_sync.readJSON( _homeSpaceDir + "/" + _configFilename )
      _localConfig = jsonfile.readFileSync( _homeSpaceDir + "/" + _configFilename )
    }catch(e){
      _localConfig = jsonfile.readFileSync( __dirname + "/" + _configDefaultFilename )
    }

    return _localConfig;
  }


  /**
  * Update some fields in the config object.
  * @param {Object} config - contains the config fields to update
  */
  static updateConfig( config ){
    var currentConfig = HomeSpace.getConfig();

    // replace the fields
    for( var configProp in config ){
      currentConfig[ configProp ] = config[ configProp ];
    }

    jsonfile.writeFileSync( _homeSpaceDir + "/" + _configFilename, currentConfig );

    // reload in the local object
    HomeSpace.getConfig();
  }


  /**
  * Get the path to the working directory. Creates it if not existing
  * @return {Stirng} the path to working dir
  */
  static getWorkingDir(){
    if( !fs_sync.exists( _homeSpaceDir + "/" + _workingDir ) ){
      HomeSpace.initHomeSpace();
    }

    return _homeSpaceDir + "/" + _workingDir
  }


  static cleanWorkingDir(){
    execSync("rm " + _homeSpaceDir + "/" + _workingDir + "/*");
  }

}


module.exports = HomeSpace;
