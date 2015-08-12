OSM Building Information and Zombies
====================================

Introduction
------------

This is a simple mobile app that finds buildings near a phone's location. 
I hope to build editing into it, to simply add building height metadata.

It is developed using the Ionic Framework for Apache Cordova.

There were a few things I had to search for and tweak, so I am documenting them here.

SDK versions
------------

To build the package successfully for Android 2.3 I had to set the minimum SDK version to lower than the ionic framework has it by default in the config.xml. At version 16, I got a generic 'package failed to parse' error.

ngCordova
---------

I had to alter the source of ng-cordova so that the javascript would run on the Android OS version 2.3. This is a problem documented here: https://github.com/driftyco/ng-cordova/issues/624 and basically involved changing every reference of ".finally" to "['finally']".

 $ cordova plugin add cordova-plugin-geolocation

  
Now that I have a custom ng-cordova it makes sense to add to it, so I have added an OpenStreetMap OAuth provider.

CORS Requests
-------------

Overpass is set up to accept cross-origin script requests but I had to explicitly tell my ionic app to send the right headers. These lines in the .config section of the Angular module.

   $httpProvider.defaults.useXDomain = true;
   delete $httpProvider.defaults.headers.common['X-Requested-With'];



USB Debugging
-------------

I had to enable USB debugging on my phone in order to install apps on it via the command line. In Android 2.3 there is a Settings ... Application ... Development menu. In Android 4 it is hidden away, you have to visit the 'About Phone' screen and click on the build number 7 times, no joke. I probably need a shiny new phone.

I also found I had to switch between the system wide ADB and the one that came with the Android SDK, which lives in platform-tools. If one adb didn't detect the device, the other would.

 $ adb devices
 $ adb install -r osmbi3.apk
 $ adb logcat

The logcat command gives a terrifying spew of data at first, then slows down so you can watch your app's activity. This is how I spotted the ng-cordova problem.


Credits
=======

This app was written by Jo Walsh during the London OSM Hack Weekend in 2015.

Thanks to Nick Whitelegg for help with cordova and getting me out of SDK hell. 

Thanks to Serge Wroclawski for walking me through the React model.


