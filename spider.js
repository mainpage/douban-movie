var http = require('http'),
 		cheerio =require('cheerio'),
	  mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/doubanMovie', function(){
	//console.log(mongoose.connection.collections);
	mongoose.connection.collections['movies'].drop(function (err){
		if(err){
			console.log('Fail to drop collection')
		}else{
			console.log('Drop collection movies success');
		}
	});
}); //数据库不存在的话会自动创建


// 建立电影schema
var movieSchema = new Schema({
	id: Number,
  title: String,
  directors: Array,
  casts: Array,
  rating: Array,
  year: Number,
  images: Object,
  genres: Array
});

// 建立电影model
var MovieModel = mongoose.model('movie', movieSchema); //数据库会自动生成名为movies的collection,且不区分大小写

function download (url, callback){
	http.get(url, function (res){
		var data = '';
		res.on('data', function (chunk){
			data += chunk; 
		})
		res.on('end', function (){
			if(data){
				callback(data);
			}else{
				console.log('no data');
			}
		})
		res.on('error', function (){
			console.log('error');
		})
	})
}

(function getMovies(){
	var url = 'http://api.douban.com/v2/movie/top250?count=250'; //只能获取100条数据，原因未知
  download(url, function(data){
  	var movies = JSON.parse(data).subjects;
    for(i in movies){
    	var tempMovie = new MovieModel(movies[i]);
    	tempMovie.save(function (err, doc){
    		//
    	});
    }
    console.log(movies.length);
		console.log('insert success');
	})
})();



