/*
myApp.service('pageInfoService', function() {
    this.getInfo = function(callback) {
        var model = {};

        chrome.tabs.query({'active': true},
        function (tabs) {
            if (tabs.length > 0)
            {
                model.title = tabs[0].title;
                model.url = tabs[0].url;

                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageInfo' }, function (response) {
                    model.pageInfos = response;
                    callback(model);
                });
            }

        });
    };
});
*/
myApp.controller("MainController", function ($scope, $http) {
    $scope.views = ['startpage.html', 'tasklist.html', 'newtask.html'];
    $scope.classColors = [
      {'background-color': '#555587'}, {'background-color': '#92213A'}, 
      {'background-color': '#0066A4'}, {'background-color': '#56004E'}, 
      {'background-color': '#F89829'}, {'background-color': '#E50278'}, 
      {'background-color': '#435555'}, {'background-color': '#166621'}, 
      {'background-color': '#876655'}, {'background-color': '#6689DD'}
      ];

    $scope.classColor = function(index)
    {
      return '{background-color: ' + $scope.colors[index] + ';';
    }
    $scope.current = $scope.views[0];
    $scope.switchView = function(index)
    {
        $scope.current = $scope.views[index];
    };
    $scope.test = function()
    {
//access_token=1016~5fvrhszhwpNo1TtjvbgJ0sJUSnnwDhLV4PIlp3t1QEU1liyprCXOXvN9Bo2UqtIF
        $http.get('https://canvas.instructure.com/api/v1/courses?access_token=1016~EnIw6S4NDs4swhTCNU7p7xsU4nyhjSuGDxMaDLKCYFx6RBe1RriCukfLY8f8zuU2').success(function(response) {
                console.log(response);
            }).error(function(response) {
                $scope.error = response.message;
            });
    }();
});
myApp.controller('PopoverDemoCtrl', function ($scope) {
  $scope.dynamicPopover = 'Hello, World!';
  $scope.dynamicPopoverTitle = 'Title';
});
myApp.controller("DatepickerCtrl", function ($scope, $http) {
    $scope.today = function() {
        var d = new Date();
      };
      $scope.today();

      $scope.clear = function () {
        $scope.dt = null;
      };

      // Disable weekend selection
      $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
      };

      $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
      };
      $scope.toggleMin();

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
      };

      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];
});

myApp.controller("TimepickerCtrl", function ($scope) {

    $scope.mytime = new Date();

    $scope.hstep = 1;
    $scope.mstep = 15;

    $scope.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };

    $scope.ismeridian = true;
    $scope.toggleMode = function() {
        $scope.ismeridian = ! $scope.ismeridian;
    };

    $scope.update = function() {
        var d = new Date();
        d.setHours( 14 );
        d.setMinutes( 0 );
        $scope.mytime = d;
    };


  $scope.changed = function () {
    $log.log('Time changed to: ' + $scope.mytime);
  };

  $scope.clear = function() {
    $scope.mytime = null;
  };

});

myApp.controller("RatingCtrl", function ($scope) {
  $scope.rate = 1;
  $scope.max = 4;
  $scope.isReadonly = false;

  $scope.hoveringOver = function(value) {
    $scope.overStar = value;
    $scope.percent = 100 * (value / $scope.max);
  };

  $scope.ratingStates = [
    {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
    {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
    {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
    {stateOn: 'glyphicon-heart'},
    {stateOff: 'glyphicon-off'}
  ];
});
