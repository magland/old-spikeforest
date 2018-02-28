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
var fs=require('fs');

function jsqmake(opts) {
	var html_text=read_text_file(__dirname+'/jsqmake.template.html');
	if (!html_text) {
		console.error('Unable to read jsqmake.template.html');
		return false;
	}
	var include_text=get_include_text(opts);
	if (!include_text) {
		console.error('Unable to get include text');
		return false;
	}
	html_text=strreplace(html_text,'$INCLUDES$',include_text);
	var target_path=opts.PROJECTPATH+'/'+opts.TARGET;
	if (!write_text_file(target_path,html_text)) {
		console.error('Unable to write target: '+target_path);
		return false;
	}
	console.log ('Wrote target: '+target_path);
	return true;

	function get_include_text(opts) {
		opts.SCRIPTS=opts.SCRIPTS||[];
		opts.STYLESHEETS=opts.STYLESHEETS||[];
		opts.HTML_SNIPPETS=opts.HTML_SNIPPETS||[];
		var ret='';
		for (var i=0; i<opts.SCRIPTS.length; i++) {
			var src_fname=find_source_file_path_rel_to_target(opts,opts.SCRIPTS[i]);
			if (!src_fname) {
				console.error('Unable to find source file: '+opts.SCRIPTS[i]);
				return '';
			}
			var line='<script src="$1$"></script>';
			line=strreplace(line,'$1$',src_fname);
			ret+=line+'\n';
		}
		for (var i=0; i<opts.STYLESHEETS.length; i++) {
			var src_fname=find_source_file_path_rel_to_target(opts,opts.STYLESHEETS[i]);
			if (!src_fname) {
				console.error('Unable to find source file: '+opts.STYLESHEETS[i]);
				return '';
			}
			var line='<link rel="stylesheet" type="text/css" href="$1$">';
			line=strreplace(line,'$1$',src_fname);
			ret+=line+'\n';
		}
		ret+='<script>\n';
		ret+='var _jsq_html_snippet_urls=[];\n'
		for (var i=0; i<opts.HTML_SNIPPETS.length; i++) {
			var src_fname=find_source_file_path_rel_to_target(opts,opts.HTML_SNIPPETS[i]);
			if (!src_fname) {
				console.error('Unable to find source file: '+opts.HTML_SNIPPETS[i]);
				return '';
			}
			ret+=`_jsq_html_snippet_urls.push('${src_fname}');\n`;
		}
		ret+='</script>\n';
		return ret;
	}
	function find_source_file_path_rel_to_target(opts,source_fname) {
		for (var i=0; i<opts.SOURCEPATH.length; i++) {
			var path=opts.PROJECTPATH+'/'+opts.SOURCEPATH[i]+'/'+source_fname;
			if (fs.existsSync(path)) return opts.SOURCEPATH[i]+'/'+source_fname;
		}
		return '';
	}
	function read_text_file(fname) {
		try {
			var txt=fs.readFileSync(fname,'utf8');
			return txt;
		}
		catch(e) {
			console.error('Problem reading file: '+fname);
			return '';
		}
	}
	function write_text_file(fname,txt) {
		try {
			fs.writeFileSync(fname,txt,'utf8');
			return true;
		}
		catch(e) {
			console.error('Problem writing file: '+fname);
			return false;
		}	
	}
	function strreplace(str,substr,repl) {
		return str.split(substr).join(repl);
	}
}

module.exports.jsqmake = jsqmake;