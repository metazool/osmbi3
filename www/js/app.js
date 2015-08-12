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
    enableHighAccuracy: false // may cause errors if true
  };

    $scope.heights = {};  
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
			html = tags['building:levels'];
	            }		

                    var myIcon = L.divIcon(
                                {className: p.id,
                                 html:'<div id="'+p.id+'">'+$scope.heights[p.id]+'</div>'});
	            
                    var marker = L.marker([lat, long], {icon: myIcon}).addTo(map)
		    .on('click',function(e) {
			var way_id = e.originalEvent.srcElement.id;
			$scope.heights[way_id] +=1;
			console.log($scope.heights[way_id]);
			// leaflet got in angular's way :/
			var newIcon = L.divIcon( 
				{className: p.id,
                                 html:'<div id="'+way_id+'">'+$scope.heights[way_id]+'</div>'});
			e.target.setIcon(newIcon);
			//marker.icon.html = $scope.heights[way_id];
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
        auto: true // show a login form if the user is not authenticated and
                // you try to do a call
   });

    $scope.login = function() {
    	auth.xhr({
            method: 'GET',
            path: '/api/0.6/user/details'
    	}, function(err, details) {
            // details is an XML DOM of user details
	    console.log(details);
	    $scope.authed = 1;
    	});
    };

})

.factory('overpassAPI', function($http) {
    return {
	search: function(query) {
	  return $http.get('http://overpass.osm.rambler.ru/cgi/interpreter?data='+query);
	}
    }
});
	

