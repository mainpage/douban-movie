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
	console.log('get movies');
	handler.getMovieList(function(data){
		res.send(data);
	})
});
app.get('/movie/:id', function (req, res){
	var movieId = req.params.id;
	console.log(movieId);
	handler.getMovieDetail(movieId, function (data){
		res.send(data);
	})
});
app.get('/movie/:id/reviews', function (req, res){
	var movieId = req.params.id;
	handler.getReviewList(movieId, function (data){
		res.send(data);
	})
});
app.get('/review/:id', function (req, res){
	var reviewId = req.params.id;
	handler.getReviewDetail(reviewId, function (data){
		res.send(data);
	})
});
// 其他任何未定义的路由情况都默认输出 index.html 页面
app.get('*', function (req, res){
  console.log('file not found');
});