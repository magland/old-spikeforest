/*
 * Copyright 2016-2017 Flatiron Institute, Simons Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function KBucketUploadDialog(O) {
	O=O||this;
	JSQObject(O);

	this.setKBucketUrl=function(url) {m_kbucket_url=url;};
	this.setKBucketAuthToken=function(token) {m_kbucket_auth_token=token;};
	this.show=function() {show();};
	//this.close=function() {m_dialog.dialog('close');};
	this.onFinished=function(handler) {JSQ.connect(O,'finished',O,function(sender,args) {handler(args);});}

	var m_dialog=null;
	var m_kbucket_url='https://missing-kbucket-url';
	var m_kbucket_auth_token='missing-kbucket-auth-token';
	var m_label='Upload file(s) to KBucket';

	function show() {
		var elmt=$('#template-KBucketUploadDialog').children().first().clone();
		$('body').append(elmt);
		elmt.modal({show:true,focus:true});

		m_dialog=elmt;

		initialize_resumable();
	}

	function initialize_resumable() {
		var r = new Resumable({
		  //target: '/upload'+document.location.search,
		  target: m_kbucket_url+'/upload?auth='+m_kbucket_auth_token,
		  method: 'octet',
		  chunkSize: 8*1024*1024,
		  simultaneousUploads: 4,
		  testChunks: false,
		  maxFileSize: 1024*1024*1024*100,
		  maxFiles: undefined,
		  maxChunkRetries: 3
		});

		if (!r.support)
		  throw Error('resumable not supported');

		var button = m_dialog.find('#upload')[0];
		var list = m_dialog.find('#list')[0];
		var file_records={};

		r.assignBrowse(button);
		r.assignDrop(button);

		r.on('fileAdded', function (file) {
			var f=$('<li />');
			f[0].id = 'file-' + file.uniqueIdentifier;
			f.addClass('file');
			f.append(file.fileName + " (" + file.size + " bytes) <span id=status>Uploading (please wait)...</span>");
			list.append(f[0]);
			file_records[file.uniqueIdentifier]={file:file,element:f};
			if (ends_with(file.fileName,'.prv')) {
				file.cancel();
				read_as_text(file.file,function(txt) {
					var prv0=try_parse_json(txt);
					if (!prv0) {
						alert('Error parsing JSON of prv file.');
						throw Error("Error parsing JSON of prv file.");
						return;
					}
					var a=create_prv_link(file.fileName,prv0);	
					f.append(a);
					f.addClass('complete');
					f.addClass('success');
					file_records[file.uniqueIdentifier].finished=true;
					file_records[file.uniqueIdentifier].prv=prv0;
					file_records[file.uniqueIdentifier].prv_file_name=file.fileName;
					file_records[file.uniqueIdentifier].file_name=file.fileName.slice(0,file.fileName.length-('.prv').length);
					f.find('#status').html('Done');
					setTimeout(function() {
						check_finished();
					},200);
				});
				return;
			}
			else {
				file_records[file.uniqueIdentifier].prv_file_name=file.fileName+'.prv';
				file_records[file.uniqueIdentifier].file_name=file.fileName;
				r.upload();
			}
		});
		r.on('progress', function (file) {
		  var str = 'Uploading ('+format_progress(r.progress())+')';
		  m_dialog.find('#progress').html(str);
		});
		r.on('complete', function () {
		  //m_dialog.find('#progress').html('Finalizing...');
		});

		function fileError(file, msg) {
		  var f = m_dialog.find('#file-' + file.uniqueIdentifier);
		  f.addClass('error');
		  f.find('#status').html((msg || 'unknown error'));
		  m_dialog.find('#progress').html((msg || 'unknown error'));
		}

		r.on('fileError', function (file, msg) {
		  	try {
		  		msg=JSON.parse(msg);
		  		msg=msg.message||msg;
		  	}
		  	catch(err) {

		  	}
		  fileError(file, msg);
		});
		r.on('fileSuccess', function (file) {
		  var xhr = new XMLHttpRequest();
		  var uri = m_kbucket_url+'/upload' + (document.location.search ? document.location.search + '&' : '?') + encodeQuery({
		    'resumableIdentifier': file.uniqueIdentifier,
		    'resumableFileName': file.fileName,
		    'resumableTotalSize': file.size,
		    'resumableDone': true
		  });
		  xhr.open('POST', uri, true);
		  xhr.responseType = 'json';
		  xhr.onload = function() {
		    var f = m_dialog.find('#file-'+file.uniqueIdentifier);
		    f.addClass('complete');
		    var r;
		    try {
		      r = xhr.response;
		      if (typeof(r) != 'object')
		        r = JSON.parse(r);
		    } catch (e) {
		      r = undefined;
		    }
		    if (r && r.prv) {
		      var a=create_prv_link(file.fileName+'.prv',r.prv);
		      f.find('#status').html('Finished uploading.');
		      f.append('&nbsp;');
		      f.append(a);
		      f.append('&nbsp;');
		      f.addClass('success');
		      file_records[file.uniqueIdentifier].finished=true;
		      file_records[file.uniqueIdentifier].prv=r.prv;
		      check_finished();
		    }
		    else {
		    	f.append('&nbsp;(Error in upload)');
		    }
		  };
		  xhr.onerror = function(msg) {
		  	fileError(file, msg);
		  };
		  xhr.send();
		});

		function ends_with(str,str2) {
			return (str.slice(str.length-str2.length)==str2);
		}

		function try_parse_json(txt) {
			try {
				return JSON.parse(txt);
			}
			catch(err) {
				return null;
			}
		}

		function read_as_text(html5_file,callback) {
			var reader = new FileReader();
			reader.onload = function(e) {
			  var text = reader.result;
			  callback(text);
			}
			reader.readAsText(html5_file);
		}

		function create_prv_link(file_name,prv) {
			var a = $('<a>'+file_name+'</a>');
			a[0].download = file_name;
			a[0].href = 'data:application/json,' + encodeURIComponent(JSON.stringify(prv,null,4));
			a.css({color:'#337ab7!'});
			return a;
		}

		function format_progress(p) {
			var val=Math.floor((p*100)*10)/10;
			return val+'%';
		}

		function check_finished() {
			var ok=true;
			for (var unique_id in file_records) {
				if (!file_records[unique_id].finished)
					ok=false;
			}
			if (ok) {
				var files0=[];
				for (var unique_id in file_records) {
					files0.push({prv:file_records[unique_id].prv,prv_file_name:file_records[unique_id].prv_file_name,file_name:file_records[unique_id].file_name});
				}
				var args={files:files0};
				O.emit('finished',args);
				m_dialog.find('#progress').html('Complete.');
			}
		}
	}

	function encodeQuery(q) {
	  var l = [];
	  for (var v in q)
	    l.push(v + '=' + encodeURIComponent(q[v]));
	  return l.join('&');
	}
}