// 声明模块
var app = angular.module('douban-movie', ['ngSanitize']); // 在模块中注入ngRoute（路由）模块

app.service('myRouter', ['$rootScope', '$location', function ($rootScope){  //必须注入$location才能绑定$locationChangeStart事件
  return{
    route: function() {
      var pageInfo;
      $rootScope.$on('$locationChangeStart', function (event, next, current) {
        if(next.indexOf('/movie') > -1){
          pageInfo = "movieDetail";
        }else if(next.indexOf('/review') > -1){
          pageInfo = "reviewDetail";
        }else if(next.indexOf('/top100') > -1){
          pageInfo = "top100";
        }else{
          pageInfo = "movieList";
        }
        $rootScope.$broadcast('changePage', pageInfo);
      })
    }
  }
}]);

app.run(['$rootScope', 'myRouter', function ($rootScope, myRouter){
  myRouter.route();
}]);

app.controller('rootController', ['$scope', function($scope){
  $scope.showLoading = true;
  $scope.showWrapper = true;
}]);

/* 每个路由对应的控制器 */
// 电影列表页控制器
app.controller('movieListCtrl', ['$scope', '$http','$location', function($scope, $http, $location){   // 注入$Http服务
  $scope.hasLoad = false;
  $scope.show = true;
  $scope.showSidebar = false;
  $scope.savedData = []; 
  $scope.$on('changePage', function (event, data){
    if(data == 'movieList' || data == 'top100'){
      $scope.show = true;
      $scope.pageInfo = {};
      $scope.pageInfo[data] = 'active';
      if($scope.hasLoad == false){
        $scope.movies = {};
        $scope.$parent.showLoading = true;
        $scope.$parent.showWrapper = true;
        if(data == 'movieList'){
          $http.get('/movies').success(function (data){
            if(data.length == 0){
              console.log('no data');
            }else{
              $scope.movies = data; // 将获得的数据保存到NG的数据模型
              console.log($scope.movies);
              //$scope.$emit('loadComplete');
              $scope.$parent.showLoading = false;
              $scope.$parent.showWrapper = false;
            }
          });
        }else{
          $scope.start = 0;
          console.log('showLoading='+$scope.$parent.showLoading);
          $http.get('/top100/'+ $scope.start).success(function (data){
            if(data.length == 0){
              console.log('no data');
            }else{
              $scope.savedData = data;
              $scope.movies = data; // 将获得的数据保存到NG的数据模型
              //$scope.$emit('loadComplete');
              $scope.$parent.showLoading = false;
              $scope.$parent.showWrapper = false;
            }
          });
        }
      }else{
        console.log('showLoading='+$scope.$parent.showLoading);
        $scope.hasLoad = false;
      }
    }else{
      $scope.show = false;
    }
  })
}]);
// 电影详情页控制器
app.controller('movieDetailCtrl', ['$scope', '$http', '$location', '$q', function($scope, $http, $location, $q){
  $scope.movie = {};
  $scope.movie.title = '豆瓣电影';
  $scope.hasLoad = false;   
  $scope.$on('changePage', function (event, data){
    //$scope.$parent.showLoading = false;
    if(data == 'movieDetail'){
      if($scope.hasLoad == false){
        $scope.movie = {};
        $scope.reviews = {};
        $scope.show = 'left-show';
        $scope.movie.title = '豆瓣电影';
        $scope.scrollTop = 0;
        $scope.$parent.showLoading = true;
        $scope.$parent.showWrapper = true; 
        $scope.hasLoadReview = false;
        $scope.canceler = $q.defer();
        $http.get($location.$$path, {timeout: $scope.canceler.promise}).success(function (data){
          $scope.movie = data; 
          $scope.$parent.showLoading = false;
          $scope.$parent.showWrapper = false;
        });
        $scope.cancel = function() {
          $scope.canceler.resolve("user cancelled");
          $scope.$parent.showLoading = false;
          $scope.$parent.showWrapper = false;
        };
        /*$http.get($location.$$path).success(function (data){
          $scope.movie = data; 
          $scope.$parent.showLoading = false; 
        });*/
      }else{
        $scope.show = 'stay-show';
        $scope.hasLoad = false;
      }
    }else{
      if($scope.hasLoad == true){
        $scope.show = 'stay-hide';
      }else{
        $scope.show = 'right-hide'; 
      }
    }
  })
}]);
// 影评详情页控制器
app.controller('reviewDetailCtrl', ['$scope', '$http', '$location', function($scope, $http, $location){
  $scope.review = {};
  $scope.review.movieTitle = '豆瓣电影';
  $scope.$on('changePage', function (event, data){
    if(data == 'reviewDetail'){
      $scope.review = {};
      $scope.review.movieTitle = '豆瓣电影';
      console.log($scope.review);
      $scope.show = true;
      $scope.$parent.showLoading = true;
      $scope.$parent.showWrapper = true;
      $http.get($location.$$path).success(function (data){
        $scope.review = data; 
        $scope.movieId = data.movieId;   
        $scope.$parent.showLoading = false;
        $scope.$parent.showWrapper = false;
      });
    }else{
      $scope.show = false;
    }
  })
}]);

app.directive('movielist', function (){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){
      scope.$watch('show', function (){  //首个参数必须写成表达式(引号形式)，不能为scope.show
        if(scope.show == true){
          element.css('display', 'block');
          setTimeout(function (){
            document.body.scrollTop = scope.scrollTop;
          }, 200);
        }else{
          setTimeout(function (){
            element.css('display', 'none');
          }, 500);
        }
      })
    }
  }
});

app.directive('movieitem', ['$location', function($location){
  return {
    restrict: 'A',
    link: function (scope, element, attrs){
      element.bind('click', function (){
        console.log(scope.movie);
        scope.$parent.hasLoad = true; //不明白为什么controller的scope是directive的parent，按文档说法应该是同一个作用域   应该是ng-repeat创建了新的作用域
        scope.$parent.scrollTop = document.body.scrollTop;  //保存scrollTop值，用于返回时定位
        element.addClass('item-active');
        document.querySelector('.movie-detail .arrow-left').setAttribute('backurl', window.location.hash);
        setTimeout(function(){
          element.removeClass('item-active');
          document.body.scrollTop = 0;
          //$location.path(attrs.href);   //$location.path不会马上更新window.location。相反，$location服务会知道scope生命周期以及合并多个$location变化为一个，并在scope的$digest阶段一并提交到window.location对象中
          window.location.hash = attrs.href;
        }, 100);
      })
    }
  };
}]);

app.directive('mark', ['$http', '$location', function ($http){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){ 
      element.on('click', function (e){
        e.stopPropagation();
        scope.movie.isMarked = !scope.movie.isMarked;
        scope.$digest();
        if(window.location.hash.indexOf("/top100") > -1){
          $http.put('movie/' + scope.movie.id + '/isMarked/' + scope.movie.isMarked).success(function (data){
            //
          })
        }
      })
    }
  }
}]);

app.directive('topnav', function (){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){
      scope.$watch('showSidebar', function (){
        var sidebar = document.querySelector('.movie-list .sidebar');
        if(scope.showSidebar == true){
          sidebar.style.left = '0px';
        }else{
          sidebar.style.left = '-240px';
        }
      })
      element.bind('click', function (){
        console.log(scope.showSidebar);
        scope.showSidebar = !scope.showSidebar;
        scope.$digest();//立即检测数据变化并更新dom
      })
    }
  }
})

app.directive('sidemenu', function (){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){
      element.bind('click', function (){
        scope.showSidebar = false;
        scope.hasLoad = false;
        scope.$digest();//立即检测数据变化并更新dom
        document.querySelector('.sidebar li.active').setAttribute('class','');
        element.addClass('active');
        setTimeout(function (){
          window.location.hash = attrs.href;
        }, 50);
      })
    }
  }
})

app.directive('moviedetail', function (){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){
      scope.$watch('show', function (){ 
        console.log(scope.show);
        if(scope.show == 'left-show'){
          element.css('display', 'block'); 
          setTimeout(function (){
            element.css('left', '0px');
          })
          document.body.scrollTop = scope.scrollTop;
        }else if(scope.show == 'stay-show'){
          element.css('display', 'block');
          document.body.scrollTop = scope.scrollTop;
        }else if(scope.show == 'stay-hide'){
          setTimeout(function (){
            element.css('display', 'none');
          }, 500);
        }else if(scope.show == 'right-hide'){
          element.css('left', '100%');
          setTimeout(function (){
            element.css('display', 'none');
          }, 500);
        }
      })
    }
  }
});

app.directive('backtolist', function (){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){
      element.bind('click', function (){
        scope.cancel();
        scope.hasLoadReview = false;
        //scope.movie.images.large = '';
        setTimeout(function (){
          document.querySelector('.movie-detail .cover img').setAttribute('src', '');
        },500);
        window.location.hash = element.attr('backurl');
      })
    }
  }
});

app.directive('scrolltoload', ['$http', '$location', function ($http, $location){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){ 
      var isLoadingMore = false;
      var count = 0;
      window.addEventListener('scroll', function (){
        if(window.location.hash.indexOf("/top100") > -1){
          console.log(document.body.offsetHeight+','+window.screen.height+','+document.body.scrollTop);
          if(document.body.offsetHeight - window.screen.height - document.body.scrollTop <= 200 && isLoadingMore == false){
            isLoadingMore = true;
            scope.$parent.showLoading = true;
            $http.get($location.$$path + '/' + (scope.start + 10)).success(function (data){
              scope.$parent.showLoading = false;
              isLoadingMore = false;
              if(data.length == 0){
                console.log('no more');
              }else{
                console.log(scope.movies);
                console.log(scope.savedData);
                scope.savedData = scope.savedData.concat(data);
                scope.movies = scope.savedData;
                console.log(scope.movies);
                scope.start += 10;
              }
            })
          }
        }else if(window.location.hash.indexOf("/movie") > -1 && scope.hasLoadReview == false){
          console.log(document.querySelector('.movie-detail').offsetHeight+','+window.screen.height+','+document.body.scrollTop);
          if(document.querySelector('.movie-detail').offsetHeight - window.screen.height - document.body.scrollTop < 10 && isLoadingMore == false){
            count ++;
            if(count>1){
              isLoadingMore = true;
              scope.$parent.showLoading = true;
              $http.get($location.$$path + '/reviews').success(function (data){
                scope.$parent.showLoading = false;
                scope.hasLoadReview = true;
                isLoadingMore = false;
                if(data.length == 0){
                  console.log('no reviews');
                }else{
                  scope.reviews = data;
                }
              })
            }
          }
        }
      })
    }
  }
}]);

app.directive('reviewitem', function (){
  return {
    restrict: 'A',
    link: function (scope, element, attrs){
      element.bind('click', function (){
        scope.$parent.hasLoad = true; 
        scope.$parent.scrollTop = document.body.scrollTop;  //保存scrollTop值，用于返回时定位
        element.addClass('review-item-active');
        setTimeout(function(){
          element.removeClass('review-item-active');
          document.body.scrollTop = 0;
          window.location.hash = attrs.href;
        }, 100);
      })
    }
  };
});

app.directive('reviewdetail', function (){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){
      scope.$watch('show', function (){ 
        if(scope.show == true){
          element.css('display', 'block'); 
          setTimeout(function (){
            element.css('left', '0px');
          })
        }else if(scope.show == false){
          element.css('left', '100%');
          setTimeout(function (){
            element.css('display', 'none');
          }, 500);
        }
      })
    }
  }
});

app.directive('backtomovie', function (){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){
      element.bind('click', function (){
        window.location.hash = '/movie/' + scope.movieId;
      })
    }
  }
});