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

.controller('mapController',function($scope,$http,$cordovaGeolocation,$cordovaNetwork,$cordovaOauth,overpassAPI) {

//.controller('mapController',function($scope,$http,overpassAPI) {

    function initMap(x,y,zoom) {

	map = L.map('map');

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		   }).addTo(map);
	map.setView([x, y], zoom);
   } 
   initMap(51.5237278,-0.1048208, 20);

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
	   overpassAPI.search('[bbox][out:json];way;out center;&bbox='+map.getBounds().toBBoxString()).then(function(data) {
            var places = data.data.elements;
            for (i = 0, len = places.length; i < len; i++) {
                p = places[i];
                lat = p.center.lat;
                long = p.center.lon;
                tags = p.tags;
                if (tags && tags.hasOwnProperty("building")) {

                var myIcon = L.divIcon(
                                {className: 'my-div-icon',
                                 html:"yes!"});
                L.marker([lat, long], {icon: myIcon}).addTo(map);                   
                }
                }
        },
        function(err) {
                console.log(err);
        });
	
     });

    $scope.login = function() {
	var client_id = 'c27e3a1d9eaed5ff7f95'
	var client_secret = '9c9d23dd46749808b5a1e93ba1b8ded37eddc463'
        $cordovaOauth.github(client_id,client_secret).then(function(result) {
            console.log(JSON.stringify(result));
        }, function(error) {
            console.log(error);
        });
    }  
  //var t = $cordovaNetwork.getNetwork();
})

.factory('overpassAPI', function($http) {
    return {
	search: function(query) {
	  return $http.get('http://overpass.osm.rambler.ru/cgi/interpreter?data='+query);
	}
    }
});
	

