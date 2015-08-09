angular.module('osmbi', ['ionic','ngCordova'])

.config(function($httpProvider) {
   $httpProvider.defaults.useXDomain = true;
   delete $httpProvider.defaults.headers.common['X-Requested-With'];
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('mapController',function($scope,$http,$cordovaGeolocation,$cordovaNetwork,$cordovaOAuth,overpassAPI) {

//.controller('mapController',function($scope,$http,overpassAPI) {

    function initMap(x,y,zoom) {

	map = L.map('map');

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
	map.setView([x, y], zoom);
	overpassAPI.search('[bbox][out:json];way[building=yes];out;&bbox='+map.getBounds().toBBoxString()).then(function(data) {
		console.log(data);
	},
	function(err) {
		console.log(err);
	});
   } 
   initMap(51.505,-0.09, 20);

   var watchOptions = {
    frequency : 1000,
    timeout : 3000,
    enableHighAccuracy: false // may cause errors if true
  };

  var watch = $cordovaGeolocation.watchPosition(watchOptions);
  watch.then(
    null,
    function(err) {
      // error
	alert(err.message);
    },
    function(position) {
      $scope.lat  = position.coords.latitude
      $scope.long = position.coords.longitude
      map.setView([$scope.lat, $scope.long],20);
  });

  
  //var t = $cordovaNetwork.getNetwork();
})

.factory('overpassAPI', function($http) {
    return {
	search: function(query) {
	  return $http.get('http://overpass.osm.rambler.ru/cgi/interpreter?data='+query);
	}
    }
});
	

