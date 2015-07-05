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
}]);

/* 每个路由对应的控制器 */
// 电影列表页控制器
app.controller('movieListCtrl', ['$scope', '$http','$timeout', function($scope, $http, $timeout){   // 注入$Http服务
  $scope.hasLoad = false;
  $scope.show = true;
  $scope.$on('changePage', function (event, data){
    if(data == 'movieList'){
      $scope.show = true;
      if($scope.hasLoad == false){
        $scope.$parent.showLoading = true;
        $http.get('/movies').success(function (data){
          $scope.movies = data; // 将获得的数据保存到NG的数据模型
          //$scope.$emit('loadComplete');
          $scope.$parent.showLoading = false;
        });
      }else{
        $scope.hasLoad = false;
      }
    }else{
      $scope.show = false;
    }
  })
}]);
// 电影详情页控制器
app.controller('movieDetailCtrl', ['$scope', '$http', '$location', function($scope, $http, $location){
  $scope.movie = {};
  $scope.movie.title = '豆瓣电影';
  $scope.hasLoad = false;
  $scope.loadReviews = function (){ //加载影评
    $scope.isLoadingReview = true;
    $http.get($location.$$path + '/reviews').success(function (data){
      $scope.reviews = data;
      $scope.isLoadingReview = false;
      $scope.hasLoadReview = true;
    })
  }   
  $scope.$on('changePage', function (event, data){
    $scope.isLoadingReview = false;
    if(data == 'movieDetail'){
      if($scope.hasLoad == false){
        $scope.show = 'left-show';
        $scope.movie.title = '豆瓣电影';
        $scope.scrollTop = 0;
        $scope.$parent.showLoading = true; 
        $http.get($location.$$path).success(function (data){
          $scope.movie = data; 
          $scope.$parent.showLoading = false;
          $scope.hasLoadReview = false;
        });
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
  $scope.$parent.showLoading = false;
  $scope.review = {};
  $scope.review.movieTitle = '豆瓣电影';
  $scope.$on('changePage', function (event, data){
    if(data == 'reviewDetail'){
      $scope.show = true;
      $scope.$parent.showLoading = true;
      $http.get($location.$$path).success(function (data){
        $scope.review = data; 
        $scope.movieId = data.movieId;   
        $scope.$parent.showLoading = false;
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
        scope.$parent.hasLoad = true; //不明白为什么controller的scope是directive的parent，按文档说法应该是同一个作用域   可能是ng-repeat创建了新的作用域
        scope.$parent.scrollTop = document.body.scrollTop;  //保存scrollTop值，用于返回时定位
        element.addClass('item-active');
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

app.directive('backtolist', function (){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){
      element.bind('click', function (){
        scope.hasLoadReview = false;
        window.location.hash = '/';
      })
    }
  }
});

app.directive('scrolltoload', function (){
  return{
    restrict: 'A',
    link: function (scope, element, attrs){
      var count = 0;
      window.addEventListener('scroll', function (){
        if(window.location.hash.indexOf("/movie") > -1 && scope.hasLoadReview == false){
          console.log(document.querySelector('.movie-detail').offsetHeight+','+window.screen.height+','+document.body.scrollTop);
          if(document.querySelector('.movie-detail').offsetHeight - window.screen.height - document.body.scrollTop < 10){
            count++;
            if(count>1){
              scope.loadReviews();
            }
          }
        }
      })
    }
  }
});

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