var http = require('http');
var cheerio =require('cheerio');

function download(url, callback){
	http.get(url, function(res){
		var data = '';
		res.on('data', function(chunk){
			data += chunk; 
		})
		res.on('end', function(){
			if(data){
				callback(data);
			}else{
				console.log('no data');
			}
		})
		res.on('error', function(){
			console.log('error');
		})
	})
}

exports.getMovieList = function(callback){
	var url = 'http://movie.douban.com/';
  download(url, function(data){
		var $ = cheerio.load(data);
		var movies = [];
		$('.ui-slide-item').each(function(i, e){
			if($(e).attr('data-trailer')){
				var movie = {};
	      movie.id = $(e).attr('data-trailer').match(/.*\/subject\/(\d+)\/trailer$/)[1];
	      movie.title = $(e).attr('data-title');
	      movie.img = $(e).find('a img').attr('src');
		    movie.director = $(e).attr('data-director');
				movie.actors = $(e).attr('data-actors');
				movie.time = $(e).attr('data-release');
				movie.region = $(e).attr('data-region');
				movie.star = $(e).attr('data-star');
		    movie.rate = $(e).attr('data-rate');
				movies.push(movie);
			}
    });
    callback(movies);
	})
};

exports.getMovieDetail = function(movieId, callback){
	var url = 'http://api.douban.com/v2/movie/subject/' + movieId;
	download(url, function(data){
		callback(data);
	})
}

exports.getReviewList = function(movieId, callback){
	var url = 'http://movie.douban.com/subject/' + movieId + '/reviews';
	console.log(url);
  download(url, function(data){
		var $ = cheerio.load(data);
		var reviews = [];
		$('.review').each(function(i, e){
				var review = {};
				review.id = $(e).find('.review-hd-expand>a').attr('href').match(/.*\/(\d+)\/$/)[1];
	      review.title = $(e).find('h3 a').last().attr('title');
	      review.content = $(e).find('.review-short>span').text();
	      review.author = $(e).find('.review-hd-info a').text();
	      review.star = $(e).find('.review-hd-info span').attr('class').replace('allstar','');
	      reviews.push(review);
    });
    callback(reviews);
	})
};

exports.getReviewDetail = function(reviewId, callback){
	var url = 'http://movie.douban.com/review/' + reviewId + '/'; //此处必须加'/',否则获取不到影评,浏览器提示重定向,原因不知
	console.log(url);
  download(url, function(data){
		var $ = cheerio.load(data);
		var review = {};
		//console.log($('span[property="v:summary"]').html());
		review.movieId = $('.side-back>a').attr('href').match(/.*\/(\d+)\/$/)[1];
		review.movieTitle = $('.side-back>a').text();
		review.title = $('span[property="v:summary"]').text();
		review.author = $('span[property="v:reviewer"]').text();
		review.star = $('span[property="v:rating"]').text();
		review.content = $('div[property="v:description"]').text().replace(/\r/g,'<br/>').replace(/\s/g,'');
		callback(review);
	})
};