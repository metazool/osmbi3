angular.module('osmbi', ['ionic','ngCordova'])

.config(function($stateProvider,$httpProvider,$urlRouterProvider) {

   $httpProvider.defaults.useXDomain = true;
   delete $httpProvider.defaults.headers.common['X-Requested-With'];

   // states not working, no navigation tabs
   $stateProvider

   .state('map', {
	url: "/map",
	templateUrl: "templates/map.html",
	controller: 'mapController'
      }
    )
   .state('auth', {
	url: "/auth",
	templateUrl: "templates/login.html",
	controller: 'authController'
       }
    );
    $urlRouterProvider.otherwise('/map');

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


    function initMap(x,y,zoom) {

	map = L.map('map');

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		   }).addTo(map);
	map.setView([x, y], zoom);
	map.on('click', function(event) {
		console.log(event);
	})
   } 
   initMap(51.5237278,-0.1048208, 20);

   var watchOptions = {
    frequency : 1000,
    timeout : 3000,
    enableHighAccuracy: true // may cause errors if true
  };

    $scope.heights = {};  
    $scope.augment = function(way_id) {
	scope.heights[way_id] +=1;
    }
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
		// console.log(p);
		var html = 0;
                lat = p.center.lat;
                long = p.center.lon;
		$scope.heights[p.id] = html;		
                tags = p.tags;
                if (tags && tags.hasOwnProperty("building")) {
		    if (tags.hasOwnProperty("building:levels")) {
			$scope.heights[p.id] = tags['building:levels'];
	            }		
		    
                    var myIcon = L.divIcon(
                                {className: 'my-div-icon',
				 iconSize: [30,30],
                                 html:'<div ontouchstart="augment('+p.id+')"on-touch="augment('+p.id+')" id="'+p.id+'">'+$scope.heights[p.id]+'</div>'});
	            
                    var marker = L.marker([lat, long], {icon: myIcon}).addTo(map)
		    .on('click',function(e) {
			var way_id = e.originalEvent.srcElement.id;
			console.log(way_id);
			$scope.heights[way_id] +=1;
			console.log($scope.heights[way_id]);
			// leaflet got in angular's way :/
			var newIcon = L.divIcon( 
				{className: 'my-div-icon',
				 iconSize:[30,30],
                                 html:'<div id="'+way_id+'">'+$scope.heights[way_id]+'</div>'});
			e.target.setIcon(newIcon);
		    });
		    
                }
		$scope.heights[p.id] = html;
            }
        },
        function(err) {
                console.log(err);
        });
	
     });

     // this belongs in its own controller, see below 

    var auth = osmAuth({
        oauth_consumer_key: 'RhPXthrBJX2kpRhj9h9LZrrrMgb38m4KMQ2vtXaX',
        oauth_secret: '7qAeSPIcF6UHtoO6IaR9dKd9qcmtNRq2h7kuJGeG',
 	singlepage: true,
	auto: true
   });

   $scope.login = function() {
	var client_id = 'c27e3a1d9eaed5ff7f95'
	var client_secret = '9c9d23dd46749808b5a1e93ba1b8ded37eddc463'
        $cordovaOauth.openstreetmap(client_id,client_secret).then(function(result) {
            console.log(JSON.stringify(result));
        }, function(error) {
            console.log(error);
        });
    }  
})

.factory('overpassAPI', function($http) {
    return {
	search: function(query) {
	  return $http.get('http://overpass.osm.rambler.ru/cgi/interpreter?data='+query);
	}
    }
});
	

