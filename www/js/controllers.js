angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope, $ionicLoading, leaflyService) {
  $scope.menuView = false;

  $scope.mapCreated = function(map) {
    var mapOptions = {
          center: new google.maps.LatLng(43.07493,-89.381388),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var input = /** @type {HTMLInputElement} */(document.getElementById('pac-input'));

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
          map: map,
          anchorPoint: new google.maps.Point(0, -29)
        });

    marker.setPosition(mapOptions.center);
    marker.setVisible(true);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      infowindow.close();
      marker.setVisible(false);
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);  // Why 17? Because it looks good.
      }
      
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      infowindow.open(map, marker);
    });

    $scope.map = map;
  };

  $scope.centerOnMe = function () {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log('Got pos', pos);
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();
    }, function (error) {
      alert('Unable to get location: ' + error.message);
      $scope.loading.hide();
    });
  };

  $scope.toggleMenu = function () {
    $scope.menuView = !$scope.menuView;
  };

  leaflyService.getStrains().then(function(response){
    console.log("service success");
  });

  leaflyService.getLocations().then(function (response) {
    console.log("get locations");
  });
})

.factory('leaflyService', function($http) {
  $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
  $http.defaults.headers.post["app_id"] = "32488d31";
  $http.defaults.headers.post["app_key"] = "514c317ccb2edfd531acaa8b2c220dcd";
  return {
    getStrains: function () {
      return $http.post('http://data.leafly.com/strains', {
        "Page":0,
        "Take":10
      })
    },

    getLocations: function () {
      return $http.post('http://data.leafly.com/locations', {
        "page":0, 
        "take":10, 
        "latitude": 33.749,
        "longitude": -117.874,
        "delivery":"true",
        "veterandiscount":"true"
      })
    }
  }
});