var winston;
var LOGGLY_TOKEN=process.env.LOGGLY_TOKEN;
var LOG_MONGODB_URI=process.env.LOG_MONGODB_URI;
if ((LOGGLY_TOKEN)||(LOG_MONGODB_URI)) {
	var winston = require('winston');
	var tags;
	if (process.env.LOG_TAGS||'') tags=process.env.LOG_TAGS.split(',');
	else tags=[];
	tags.push('nodejs');

	if (false) {
		// For now we are disabling because there seems to be a serious bug. See: https://github.com/loggly/winston-loggly-bulk/issues/13
		if (LOGGLY_TOKEN) {
			console.log ('Using winston and LOGGLY');
			//Note: you must install winston-loggly-bulk
			require('winston-loggly-bulk');
			winston.add(winston.transports.Loggly, {
			    token: LOGGLY_TOKEN,
			    subdomain: "magland",
			    tags: tags,
			    json:true
			});	
		}
	}

	if (LOG_MONGODB_URI) {
		console.log ('Using winston-mongodb');
		//Note: you must install winston-mongodb
		require('winston-mongodb');
		var options={
			db:LOG_MONGODB_URI,
			expireAfterSeconds:60*60*24*7,
			name:'magland'
		}
		winston.add(winston.transports.MongoDB, options);
	}

	var os=require('os');
	winston.info('Started process: '+process.argv.join(' '),{os_type:os.type(),os_release:os.release(),hostname:os.hostname(),num_cpu:os.cpus().length,});
	redirect_console(winston);

	var s_meta={};
	s_meta.pid=process.pid;
	s_meta.hostname=require('os').hostname();
	s_meta.tags=tags;
	function meta() {
		return s_meta;
	}

	function redirect_console(logger) {
		function formatArgs(args){
			if ((!args[1])||(typeof(args[1])=='string')) {
	    		return [require('util').format.apply(require('util').format, Array.prototype.slice.call(args)),meta()];
	    	}
	    	else {
	    		var meta0=JSON.parse(JSON.stringify(meta()));
	    		for (key in args[1]) {
	    			if (JSON.stringify(args[1][key]).length<200) {
	    				meta0[key]=args[1][key];
	    			}
	    		}
	    		var ret=[args[0],meta0];
	    		return ret;
	    	}
		}

		//console.log = function() {
		//    logger.info.apply(logger, formatArgs(arguments));
		//};
		console.info = function() {
		    logger.info.apply(logger, formatArgs(arguments));
		};
		console.warn = function() {
		    logger.warn.apply(logger, formatArgs(arguments));
		};
		console.error = function() {
		    logger.error.apply(logger, formatArgs(arguments));
		};
		console.debug = function() {
		    logger.debug.apply(logger, formatArgs(arguments));
		};
	}
}

