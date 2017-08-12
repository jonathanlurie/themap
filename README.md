# The Map.
This desktop app is made to export large capture from custom map styles made in [Mapbox Studio](https://www.mapbox.com/studio/).

# Install
## On a Mac
You can download the [released version for Mac](https://github.com/jonathanlurie/themap/releases/download/v1.0.0/The_Map_mac10.11.zip). It comes as a *zip* file containing a *dmg*. Then launch it like any other app [but first, make sure you allowed unsigned apps to run on your mac](https://kb.wisc.edu/helpdesk/page.php?id=25443).

## On Linux
### First
This app is for Linux and Mac + you need to have [Imagemagick](https://www.imagemagick.org/script/download.php) installed (and visible, aka. in your PATH)

### Dependencies and launching
1. Download the [zip](https://github.com/jonathanlurie/themap/archive/master.zip) or clone this repository.
2. With a terminal, `cd` into the app folder
3. `$ npm install` to install all the dependencies
4. `$ npm start` to launch the app

## On Windows
Not sure about this one. With a bit of luck you can easily access Imagemagick from you `PATH`environment variable and then it should be pretty similar to the Linux way. Good luck!

# Use The Map
## Configure it
In the option Menu, you can set the `Mapbox token`. Please, use your own Mapbox token, the one given is just for the example. You can fing when you registered on Mapbox.com (free).

Then, to use your own map styles, you will have to write you `Mapbox user id` and the map `style id`. You can find both when using Mapbox Studio, in the URL:

`https://www.mapbox.com/studio/styles/jonathanlurie/cj61518sb28vf2rltdqx9lgg9/edit/`

Here, the user id is: **jonathanlurie** and the map style id is **cj61518sb28vf2rltdqx9lgg9**.

## Define an area
When the app is ready and your credentials are working fine, it's time to draw the area you want to export! To do so:
1. Browse the map in quest of a nice crop to export
2. Adjust your **zoom level** using the `+/-` button on the top left. The zoom level is between 0 and 22 and show on the title bar of the app.
3. Use the **black-square** icon on the top left of the app. You are now in area drawing mode!
4. Click somewhere on the map and drag to enlarge the area as it pleases you
5. If you are not happy with the area you just drew, you can modify or delete if using the **pen** or **trashbin** icon. Don't forget to clisck **save** after!
6. When your selection is ready, open the menu from the **three-bar** icon at the bottom
7. Select your quality (512 will usually give you a good quality for printing, 256 is good for screen and 1024 is unnecessary large, and it will take more time to process. Just go with 512)

## Capture
Now that you have a nice area, you are *almost* ready to export your map, Just click on **launch capture**!  

You also need to know the **zoom level** of the final image is the one you where using in the app when you clicked on the **launch capture** button.

While **The Map** is at work, a live status of things is updated in the title bar, on the top of the app. Here is how it goes:  
1. Downloading every map tiles (512x512 or 1024x1024 images, depending on the option chosen)
2. Merging some tiles together to get horizontal strips
3. Merging all the horizontal strip together to get the full image
4. Opening the folder where your final image is

Start with a small test area first, so that you are sure it works.

## Good to know
**The Map** need to store temporary data on your local storage while working. This happens in your home directory, in a (hidden) folder called `.themap`.  
This folder contains:  
- an important config file: `config.json`, that remembers the last position you used, the last zoom level, the last map style and your Mapbox credential. Only things you already know but are very convenient to have automatically pre-filed.
- a folder: `working`, this is where all the temporary tiles and strips are downloaded and exported. This folder is flushed at every launch of the app and again after every successful map building.

If you decide to remove this folder, it will be recreated the next time you launch **The Map** but you will have to rewrite your credential, your map style and your last position will be lost.
