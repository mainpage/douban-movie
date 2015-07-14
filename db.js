var http = require('http'),
 		cheerio =require('cheerio'),
	  mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//mongoose.connect('mongodb://localhost/doubanMovie', function (){
mongoose.connect('mongodb://sch:1123917lj@ds045252.mongolab.com:45252/doubanmovie', function (){
	//console.log(mongoose.connection.collections);
	/*mongoose.connection.collections['movies'].drop(function (err){
		if(err){
			console.log('Fail to drop collection');
		}else{
			console.log('Drop collection movies success');
			saveTop100ToDb();
		}
	})*/
}); //数据库不存在的话会自动创建


// 建立电影schema
var movieSchema = new Schema({
	id: Number,
  title: String,
  directors: Array,
  casts: Array,
  rating: String,
  star: Number,
  year: Number,
  images: Object,
  genres: Array,
  isMarked: {type: Boolean, default: false}
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

function saveTop100ToDb (){
	var url = 'http://api.douban.com/v2/movie/top250?count=100'; //只能获取100条数据，原因未知
  download(url, function(data){
  	var movies = JSON.parse(data).subjects;
    for(i in movies){
    	var tempMovie = movies[i];
    	var casts = [];
    	for(var i=0;i<tempMovie.casts.length;i++){
    		casts.push(tempMovie.casts[i].name);
    	}
    	tempMovie.casts = casts;
    	var directors = [];
    	for(var i=0;i<tempMovie.directors.length;i++){
    		directors.push(tempMovie.directors[i].name);
    	}
    	tempMovie.directors = directors;
    	tempMovie.star = tempMovie.rating.stars;
    	tempMovie.rating = tempMovie.rating.average;
    	var movieModel = new MovieModel(tempMovie);
    	movieModel.save(function (){
				//
    	});
    }
	})
};

exports.getTop100FromDb = function (start, count, callback){
	MovieModel.find({}).skip(start).limit(count).exec(function (err, docs) {
    callback(docs);
  });
}

exports.updateMarkToDb = function (movieId, isMarked, callback){
  MovieModel.update({id:movieId}, {isMarked:isMarked}, function (){
    callback('success');
  })
}



