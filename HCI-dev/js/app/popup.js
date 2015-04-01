myApp.controller("MainController", function ($scope, $rootScope, $http, $location ,$anchorScroll, $modal, $log) {
    /*--Panel Setup--START */ 
    //app views 
    $scope.views = ['startpage.html', 'tasklist.html', 'newtask.html', 'whatsnext.html'];
$scope.tasks;
    //function for switching views
    $scope.current = $scope.views[0];
    $scope.switchView = function(index)
    {
        $scope.current = $scope.views[index];
    };
   //list of courses
   //supported class colors
    $scope.supportedColors = [
      {'background-color': '#555587'}, {'background-color': '#92213A'}, 
      {'background-color': '#0066A4'}, {'background-color': '#56004E'}, 
      {'background-color': '#F89829'}, {'background-color': '#E50278'}, 
      {'background-color': '#435555'}, {'background-color': '#166621'}, 
      {'background-color': '#876655'}, {'background-color': '#6689DD'}
      ];
    //Class code color index mapping
    $scope.checkPassed = function (task)
    {   
      if(new Date() > new Date(task.due_at))
        {
          task.passed = 'past';
          if(!task.checked)
          {
            task.completed = 'missed'
          }
          else
          {
            task.completed = 'complete'
          }
        }
        else
        {
          task.passed = 'future';
          if(!task.checked)
          {
            task.completed = 'todo'
          }
          else
          {
            task.completed = 'complete'
          }
        }
        return new Date() > new Date(task.due_at);
    };

    $scope.checkFuture = function (task) {
        return new Date() < new Date(task.due_at);
    };



    //TEST DATA -- START
    // $scope.tasks =
    // [
    //   {
    //     name: 'Assignment1',
    //     status: 'Not Started',
    //     due_at: '2015-06-01T22:59:00-06:00',
    //     priority: 2,
    //     course_code: 'Class2',
    //     checked: true
    //   },
    //   {
    //     name: 'Assignment2',
    //     status: 'Not Started',
    //     due_at: '2015-03-01T23:19:00-06:00',
    //     priority: 1,
    //     course_code: 'Class2',
    //     checked: false

    //   },
    //   {
    //     name: 'Assignment3',
    //     status: 'Not Started',
    //     due_at: '2015-02-08T13:59:00-06:00',
    //     priority: 4,
    //     course_code: 'Class3',
    //     checked: true

    //   },
    //   {
    //     name: 'Assignment4',
    //     status: 'Not Started',
    //     due_at: '2015-04-01T23:59:00-06:00',
    //     priority: 2,
    //     course_code: 'Class1',
    //     checked: true

    //   },
    //   {
    //     name: 'Assignment5',
    //     status: 'Not Started',
    //     due_at: '2015-03-01T23:59:00-06:00',
    //     priority: 2,
    //     course_code: 'Class4',
    //     checked: false

    //   },
    //   {
    //     name: 'Assignment6',
    //     status: 'Not Started',
    //     due_at: '2015-03-27T23:59:00-06:00',
    //     priority: 4,
    //     course_code: 'Class1',
    //     checked: false

    //   }
    // ];
    
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
  /*--Panel Setup--END */

  /*--Panel Data Linking Setup--START */ 
  //Set simple What's Next
  $scope.findWhatsNext = function()
  {
    var compare = function (a,b) {
      if (new Date(a.due_at) < new Date(b.due_at))
      {   return -1;}
      if (new Date(a.due_at) > new Date(b.due_at))
      {  return 1;}
      return 0;
    };
    $scope.tasks.sort(compare);
    var now = new Date();
    for(var i=0; i<$scope.tasks.length; i++)
    {
      if(new Date($scope.tasks[i].due_at) > now && !$scope.tasks[i].checked)
      {
        var highestPriority = i;
        return $scope.tasks[i];
      }
    }
  };

    //Pull class codes from task list and fill courseList for color mapping
    $scope.pullClasses = function()
    {
/*
      $scope.canvasCourses = [];//pull canvas courses in order to match id with course_code
      var getCourseCode = function(task)
      {
        for(var i = 0; i<canvasCourse.length; i++)
        { if(canvasCourses[i].id = task.course_id)
          {
              return canvasCourses[i].course_code;
          }
        }

      };
*/
     $scope.courseList = [];

      for(var i = 0; i< $scope.tasks.length; i++)
      {
        if($scope.courseList.indexOf($scope.tasks[i].course_code)<0)
        {
          $scope.courseList.push($scope.tasks[i].course_code);
        }
      }
              console.log($scope.courseList);


    };


    //Priority Changes

    //Checked State Changes


  /*--Panel Data Linking Setup --END*/ 

  /*--Pull, save, retrieve, and update data--START */
  function reformatTasks(orig) {
    var local_tasks = [];
    for (var i = 0; i < orig.length; i++) {
      var key = Object.keys(orig[i])[0];
      local_tasks[i] = orig[i][key];
    }
    return local_tasks;
  }
     $scope.initialize = function()
    {
      console.log($scope.tasks);
        chrome.runtime.sendMessage({method: "retrieveAppKey"}, function(response) {
          console.log('g');
          if (response.app_key) {
            console.log(response.app_key);
            $scope.initializeWith(response.app_key);
          }
        });
    };
    $scope.user_obj = {};
    $scope.checkAPIKey = function() {
      console.log('CHECK!!');
      (function ($scope) {
        console.log('aa');
        chrome.runtime.sendMessage({method: "fetchAssignments", key: $scope.user_obj.key_field}, function(response) {
          console.log('bb');
          if (response.error) {
            console.log(response.error);
            $scope.startpageError=response.error;
            return;
          }
          console.log($scope);
          // key is good! save it.
          var save_obj = {};
          save_obj.method = "storeAppKey";
          save_obj.key = response.key;
          // console.log(save_obj.key);
          chrome.runtime.sendMessage(save_obj);
          console.log("check api switch");



          $scope.switchView(1);
          $scope.tasks = reformatTasks(response.stuff);
          $scope.pullClasses();

          $scope.$apply();
          console.log($scope.tasks);
            //pull data from canvas and run update on files
            /*
              $scope.tasks = //read from files 
              $scope.courseColors = //read from file
            */ 
        });
      })($scope);
    }
    $scope.initializeWith = function(app_key) { //app_key could be empty string
        // $scope.switchView(1);
        // console.log("initializeWith switch");
        (function ($scope) {
          chrome.runtime.sendMessage({method: "getAssignments"}, function(response) {
            console.log('Response: '); console.log(response);
            $scope.tasks = reformatTasks(response.stuff);
            $scope.pullClasses();
            $scope.switchView(1);
            $scope.$apply();
          });
        })($scope);
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

    //New Task Creation
    $scope.newTask = {}
    $scope.newTask.priority = 2;
    $scope.validTitle = true;
    $scope.validClassCode = true;
    $scope.validDateTime = true;
        //Properties and functions for time picker
          $scope.grabTime = {};
          $scope.grabTime.due_atTime = new Date();
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

    $scope.createNewTask = function()
    {
      console.log($scope.tasks);
      $scope.validTitle = true;
      $scope.validClassCode = true;
      $scope.validDateTime = true;
      $scope.error = '';

      if($scope.newTask.name==undefined || $scope.newTask.name=='' )
      {
        $scope.validTitle = false;

        $scope.error += '\"Title\" is required.';
      }
      if($scope.newTask.course_code==undefined || $scope.newTask.course_code=='')
      {
        $scope.validClassCode = false;
        $scope.error += '\"Class Code\" is required.';
      }
      if($scope.newTask.due_at ==undefined)
      {
        $scope.validDateTime = false;
        $scope.error += '\"Date & Time Due\" is required.';
      }
      if($scope.error=='')
      {
        //save to file
        $scope.newTask.due_at.setHours($scope.grabTime.due_atTime.getHours());
        $scope.newTask.due_at.setMinutes($scope.grabTime.due_atTime.getMinutes());  
        $scope.newTask.CHANGED = false;
        $scope.newTask.checked = false;
        $scope.checkPassed($scope.newTask);
        $scope.newTask.due_at = $scope.newTask.due_at.toISOString();
        (function ($scope) {
          chrome.runtime.sendMessage({ass: $scope.newTask, method: 'storeNewAssignment'}, function (response_dont_care) {
            // chrome.runtime.sendMessage({method: "getAssignments"}, function(response) {
            //   console.log('Response: '); console.log(response);
            //   $scope.tasks = reformatTasks(response.stuff);
            //   $scope.$apply();
            // });
          });
        })($scope);
        $scope.$emit('refresh', $scope.newTask);
        $scope.newTask =
        {
          priority: 2
        };
              $rootScope.$broadcast('closeModals');

      }

    };
    $scope.saveChecked = function(task) {
        var save_obj = {};
        save_obj['method'] = 'modifyAssignment';
        save_obj['ass'] = task;
        chrome.runtime.sendMessage(save_obj);
    };
    $scope.$on('refresh', function(event, task) { console.log($scope.tasks);if($scope.tasks!=undefined){$scope.tasks.push(task); $scope.$apply();}
    });
    /*--Pull, save, retrieve, and update data--END */ 



});







/*--Helper Controllers & Filters--*/

myApp.controller('ModalCtrl', function ($scope, $modal, $log) {
  $scope.open = function (type, task) {
  console.log(task);

    if(type==0)
    {
      view = 'newtask.html';
    }
    else
    {
      view = 'whatsnext.html';

    }
    var modalInstance = $modal.open({
      templateUrl: view,
      controller: 'ModalInstanceCtrl',
      resolve: {
        task: function () {
          return task;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
myApp.controller('ModalInstanceCtrl', function ($scope, $modalInstance, task) {
  $scope.nextTask = task;
  $scope.$on('closeModals', function(event){$scope.ok() });

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
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
        return false;
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

myApp.controller("RatingCtrl", function ($scope) {
  $scope.rate = 1;
  $scope.max = 4;
  $scope.isReadonly = false;

  $scope.hoveringOver = function(value) {
    $scope.overStar = value;
    $scope.percent = 100 * (value / $scope.max);
  };
  $scope.saveRating = function(task) {
    if (task.priority != $scope.overStar) {
      task.priority = $scope.overStar;
      var save_obj = {};
      save_obj['method'] = 'modifyAssignment';
      save_obj['ass'] = task;
      chrome.runtime.sendMessage(save_obj);
    }
  }

  $scope.ratingStates = [
    {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
    {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
    {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
    {stateOn: 'glyphicon-heart'},
    {stateOff: 'glyphicon-off'}
  ];
});

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
