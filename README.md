# The Map.
This desktop app is made to export large capture from custom map styles made in [Mapbox Studio](https://www.mapbox.com/studio/).

# First
This app is for Linux and Mac + you need to have [Imagemagick](https://www.imagemagick.org/script/download.php) installed (and visible, aka. in your PATH)

# Install
1. Download the [zip](https://github.com/jonathanlurie/themap/archive/master.zip) or clone this repository.
2. With a terminal, `cd` into the app folder
3. `$ npm install` to install all the dependencies
4. `$ npm start` to launch the app

# Configure it
In the option Menu, you can set the `Mapbox token`. Please, use your own Mapbox token, the one given is just for the example. You can fing when you registered on Mapbox.com (free).

Then, to use your own map styles, you will have to write you `Mapbox user id` and the map `style id`. You can find both when using Mapbox Studio, in the URL:

`https://www.mapbox.com/studio/styles/jonathanlurie/cj61518sb28vf2rltdqx9lgg9/edit/`

Here, the user id is: **jonathanlurie** and the map style id is **cj61518sb28vf2rltdqx9lgg9**.

# Define an area
When the app is ready and your credentials are working fine, it's time to draw the area you want to export! To do so:
1. Use the **black-square** icon on the top left of the app. You are now in area drwaing mode!
2. Click somewhere on the map and drag to enlarge the area as it pleases you
3. If you are not happy with the area you just drew, you can modify or delete if using the **pen** or **trashbin** icon. Don't forget to clisck **save** after!
4. When your selection is ready, open the menu from the **three-bar** icon at the bottom
5. Select your quality (512 will usually give you a good quality for printing, 256 is good for screen and 1024 is unnecessary large, and it will take more time to process. Just go with 512)
6. Launch capture!

Please note that the log area (just under the `launch capture` button) is not refreshed and will display info only when the tiles are done and/or processed. This is a #TODO.

Start with a small test area first, so that you are sure it works.
