var express = require('express');
var handler = require('./handler');

var app = express();
app.use(express.static(__dirname + '/view'));	// 设置静态目录路径
// 启动服务
var port = process.env.PORT || 4000;
app.listen(port, function(){
	console.log('server start on port ' + port);
});

app.get('/', function (req, res){
	res.sendfile('view/tpl/index.html');
});
app.get('/movies', function (req, res){
	var tic =  new Date();
	handler.getMovieList(function(data){
		res.send(data);
		var toc =  new Date();
		var timeCost = toc.getTime() - tic.getTime();
		console.log('get movies, costs ' + timeCost + 'ms');
	})
});
app.get('/top100/:start', function (req, res){
	var start = req.params.start;
	var tic =  new Date();
	handler.getTop100(start, 10, function(data){
		res.send(data);
		var toc =  new Date();
		var timeCost = toc.getTime() - tic.getTime();
		console.log('get top100, costs ' + timeCost + 'ms');
	})
});
app.get('/movie/:id', function (req, res){
	var movieId = req.params.id;
	var tic =  new Date();
	handler.getMovieDetail(movieId, function (data){
		res.send(data);
		var toc =  new Date();
		var timeCost = toc.getTime() - tic.getTime();
		console.log('get movie ' + movieId + ', costs ' + timeCost + 'ms');
	})
});
app.get('/movie/:id/reviews', function (req, res){
	var movieId = req.params.id;
	var tic =  new Date();
	handler.getReviewList(movieId, function (data){
		res.send(data);
		var toc =  new Date();
		var timeCost = toc.getTime() - tic.getTime();
		console.log('get reviews, costs ' + timeCost + 'ms');
	})
});
app.get('/review/:id', function (req, res){
	var reviewId = req.params.id;
	var tic =  new Date();
	handler.getReviewDetail(reviewId, function (data){
		res.send(data);
		var toc =  new Date();
		var timeCost = toc.getTime() - tic.getTime();
		console.log('get review ' + reviewId + ', costs ' + timeCost + 'ms');
	})
});
app.put('/movie/:id/isMarked/:isMarked', function (req, res){
	console.log('catch put request');
	var movieId = req.params.id,
	    isMarked = req.params.isMarked;
	handler.updateMark(movieId, isMarked, function (data){
		res.send(data);
	});
});
// 其他任何未定义的路由情况都默认输出 index.html 页面
app.get('*', function (req, res){
  console.log('file not found, params are: ' + req.params);
});