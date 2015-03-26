myApp.controller("MainController", function ($scope, $http) {
    //app views 
    $scope.views = ['startpage.html', 'tasklist.html', 'newtask.html'];
    //function for switching views
    $scope.current = $scope.views[0];
    $scope.switchView = function(index)
    {
        $scope.current = $scope.views[index];
    };

   //supported class colors
    $scope.supportedColors = [
      {'background-color': '#555587'}, {'background-color': '#92213A'}, 
      {'background-color': '#0066A4'}, {'background-color': '#56004E'}, 
      {'background-color': '#F89829'}, {'background-color': '#E50278'}, 
      {'background-color': '#435555'}, {'background-color': '#166621'}, 
      {'background-color': '#876655'}, {'background-color': '#6689DD'}
      ];
    $scope.courseColors = [];
 
    $scope.checkPassed = function (task)
    {
      if(task.checked)
      {
        return false;
      }
      else
      {
        return new Date() > new Date(task.due_at);
      }
    };
    //TEST DATA -- START
    $scope.courseColors['Class1'] = 0;
    $scope.courseColors['Class2'] = 1;
    $scope.courseColors['Class3'] = 2;
    $scope.courseColors['Class4'] = 3;
    $scope.tasks =
    [
      {
        name: 'Assignment1',
        status: 'Not Started',
        due_at: '2015-06-01T22:59:00-06:00',
        priority: 2,
        course: 'Class2',
        checked: true

      },
      {
        name: 'Assignment2',
        status: 'Not Started',
        due_at: '2015-03-01T23:19:00-06:00',
        priority: 1,
        course: 'Class2',
        checked: false

      },
      {
        name: 'Assignment3',
        status: 'Not Started',
        due_at: '2015-02-08T13:59:00-06:00',
        priority: 4,
        course: 'Class3',
        checked: true

      },
      {
        name: 'Assignment4',
        status: 'Not Started',
        due_at: '2015-04-01T23:59:00-06:00',
        priority: 2,
        course: 'Class1',
        checked: true

      },
      {
        name: 'Assignment5',
        status: 'Not Started',
        due_at: '2015-03-01T23:59:00-06:00',
        priority: 2,
        course: 'Class4',
        checked: false

      },
      {
        name: 'Assignment6',
        status: 'Not Started',
        due_at: '2015-03-27T23:59:00-06:00',
        priority: 4,
        course: 'Class1',
        checked: false

      }
    ];
  //TEST DATA -- END

/*   
  $scope.test = function()
    {
  //access_token=1016~5fvrhszhwpNo1TtjvbgJ0sJUSnnwDhLV4PIlp3t1QEU1liyprCXOXvN9Bo2UqtIF
        $http.get('https://canvas.instructure.com/api/v1/courses?access_token=1016~EnIw6S4NDs4swhTCNU7p7xsU4nyhjSuGDxMaDLKCYFx6RBe1RriCukfLY8f8zuU2').success(function(response) {
            console.log(response);
        }).error(function(response) {
            $scope.error = response.message;
        });
    }();
*/
    $scope.initialize = function()
    {
  //    if(/*api key not saved*/)
        {
          //pull data and save to file
          /*
            var courses = //get array of course name Strings
            for(var i=0, var len = courses.length; i<len; i++)
            {
              if(i<10)
              {
                //needed for mapping course id to a supportedColors index
                $scope.courseColors[courseNameString] = i;
              }
            }
            //save $scope.courseColors to file
          */
        }
  //      else if(/*api key saved*/)
        {
          //pull data from canvas and run update on files
          /*
            $scope.tasks = //read from files 
            $scope.courseColors = //read from file
          */ 


        }
    };
});



//StackOverflow Resource; edited to work with dates only
myApp.filter('groupBy', function(){
    return function(list, group_by) {

    var filtered = [];
    var prev_item = null;
    var group_changed = false;
    // this is a new field which is added to each item where we append "_CHANGED"
    // to indicate a field change in the list
    var new_field = 'CHANGED';

    // loop through each item in the list
    angular.forEach(list, function(item) {

      group_changed = false;

      // if not the first item
            if (prev_item !== null){ 
        // check if the group by field changed
                console.log(new Date(prev_item[group_by]).toLocaleDateString());
                if (new Date(prev_item[group_by]).toLocaleDateString() !== new Date(item[group_by]).toLocaleDateString()) {
          group_changed = true;
        }

      // otherwise we have the first item in the list which is new
      } else {
        group_changed = true;
      }

      // if the group changed, then add a new field to the item
      // to indicate this
      if (group_changed) {
        item[new_field] = true;
      } else {
        item[new_field] = false;
      }

      filtered.push(item);
      prev_item = item;

    });

    return filtered;
    };

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
