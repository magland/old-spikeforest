require('dotenv').config();
var express = require('express');

/*
Set the following environment variables
   KBUCKET_URL
*/

require('./log.js');

var m_configurations={};

var app = express();
app.set('port', (process.env.PORT || 5094));
app.use(function(req,resp,next) {
	var url_parts = require('url').parse(req.url,true);
	var host=url_parts.host;
	var path=url_parts.pathname;
	var query=url_parts.query;

	if (!starts_with(path,'/api/')) {
		next();
		return;
	}

	if (req.method == 'OPTIONS') {
		var headers = {};	
		//allow cross-domain requests
		/// TODO refine this
		headers["Access-Control-Allow-Origin"] = "*";
		headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
		headers["Access-Control-Allow-Credentials"] = false;
		headers["Access-Control-Max-Age"] = '86400'; // 24 hours
		headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization";
		resp.writeHead(200, headers);
		resp.end();
	}
	else {
		if (req.method=='GET') {
			var already_sent=false;
			handle_api_request(path,query,req.headers,function(R) {
				if (already_sent) {
					console.error('Problem in docstor GET: already sent json response: '+req.url);
					return;
				}
				already_sent=true;
				send_json_response(resp,R);
			});
			return;
		}
		else if(req.method=='POST') {
			var already_sent=false;
			receive_json_post(req,function(err,obj) {
				if (err) {
					console.error('Problem receiving json post: '+err);
					send_json_response(resp,{success:false,error:'Problem receiving json post: '+err});
					return;
				}
				if (already_sent) {
					console.error('Problem in docstor POST: already sent json response: '+req.url);
					return;
				}
				already_sent=true;
				handle_api_request(path,obj,req.headers,function(R) {
					send_json_response(resp,R);
				});
			});
		}
		else {
			send_json_response(resp,{success:true,error:"Unsuported request method."});
		}
	}
});
app.use(express.static(__dirname+'/web'));

app.listen(app.get('port'), function() {
	console.info('spikeforest is running on port '+app.get('port'), {port:app.get('port')});
});

function handle_api_request(path,query,headers,cb) {
	console.info('handle_api_request: '+path,{query:query});
	if (path=='/api/setConfig') {
		handle_api_set_config(query,function(R) {
			cb(R);
		});
	}
	else if (path=='/api/getConfig') {
		handle_api_get_config(query,function(R) {
			cb(R);
		});
	}
	else if (path=='/api/getKBucketUrl') {
		handle_api_get_kbucket_url(query,function(R) {
			cb(R);
		});
	}
	else {
		cb({success:false,error:'Invalid path.'});
	}

	function handle_api_set_config(query,callback) {
		if (!query.config) {
			callback({success:false,error:'Missing query parameter: config'});
			return;
		}
		var id=make_random_id(10);
		m_configurations[id]={
			timestamp:new Date(),
			id:id,
			config:query.config
		};
		callback({success:true,id:id});
	}
	function handle_api_get_config(query,callback) {
		if (!query.id) {
			callback({success:false,error:'Missing query parameter: id'});
			return;
		}
		if (!m_configurations[query.id]) {
			callback({success:false,error:'Not found (id='+query.id+')'});
			return;
		}
		callback({success:true,config:m_configurations[query.id].config});
	}
	function handle_api_get_kbucket_url(query,callback) {
		var url=process.env.KBUCKET_URL;
		if (!url) {
			callback({success:false,error:'Environment variable not set: KBUCKET_URL'});
			return;
		}
		callback({success:true,kbucket_url:url});
	}
}

function send_json_response(resp,obj) {
	resp.writeHead(200, {"Access-Control-Allow-Origin":"*", "Content-Type":"application/json"});
	resp.end(JSON.stringify(obj));
}

function receive_json_post(REQ,callback_in) {
	var callback=callback_in;

	var max_post_content_length=1024*1024;
	var expected_content_length=REQ.headers['content-length'];
	if (expected_content_length>max_post_content_length) {
		callback('Content of post is too large');
		callback=null;
		return;
	}
	
	var body='';
	REQ.on('data',function(data) {
		body+=data;
		if (body.length>expected_content_length) {
			if (callback) callback('Received larger post than expected '+body.length+' > '+expected_content_length);
			callback=null;
			return;
		}
	});
	REQ.on('error',function() {
		if (callback) callback('Error receiving post');
		callback=null;
	});
	
	REQ.on('end',function() {
		var obj;
		try {
			var obj=JSON.parse(body);
		}
		catch (e) {
			if (callback) callback('Problem parsing json in body of post');
			callback=null;
			return;
		}
		if (callback) callback(null,obj);
		callback=null;
	});
}

function starts_with(str,str2) {
	return (str.slice(0,str2.length)==str2);
}

function try_parse_json(str) {
	try {
		return JSON.parse(str);
	}
	catch(err) {
		return null;
	}
}

function make_random_id(num_chars)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < num_chars; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}