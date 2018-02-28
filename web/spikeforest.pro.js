#!/usr/bin/env nodejs
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

//////////////////////////////////////////////////////////////////////
var opts={PROJECTPATH:__dirname, SOURCEPATH:['.'], SCRIPTS:[], STYLESHEETS:[], HTML_SNIPPETS:[]};

//////////////////////////////////////////////////////////////////////
//require('../../jsqcore/jsqcore.pri').load(opts);
opts.SOURCEPATH.push('jsq/src/jsqcore');
opts.SCRIPTS.push(
	'jquery.min.js','jsq.js','jsqobject.js','jsqwidget.js','jsqcanvaswidget.js','jquery-ui.min.js'
);
opts.STYLESHEETS.push(
	'jsq.css','jquery-ui.min.css'
);

//////////////////////////////////////////////////////////////////////
//require('jsq/jsqwidgets/jsqwidgets.pri').load(opts);
opts.SOURCEPATH.push('jsq/src/jsqwidgets')
opts.SCRIPTS.push(
	'jsqcanvaswidget.js','jsqtabwidget.js'
);

//////////////////////////////////////////////////////////////////////
opts.SOURCEPATH.push('jsutils')
opts.SCRIPTS.push(
	'jsutils.js','fileuploader.js','localstorage.js','url4text.js'
);
opts.SOURCEPATH.push('jsutils/3rdparty')
opts.SCRIPTS.push(
	'download.js','sha1.js'
);

//////////////////////////////////////////////////////////////////////
opts.TARGET = 'index.html';
opts.SCRIPTS.push(
	'spikeforest_main.js','mda.js'
);
//opts.STYLESHEETS.push('create.css');

opts.SOURCEPATH.push('widgets')
opts.SCRIPTS.push(
	'sfmainwindow.js'
);
opts.STYLESHEETS.push(
	'sfmainwindow.css'
);

opts.SOURCEPATH.push('managers')
opts.SCRIPTS.push(
	'sfmanager.js'
);

//////////////////////////////////////////////////////////
opts.SOURCEPATH.push('mlstudy/web');
opts.SCRIPTS.push('mlutils.js');

opts.SOURCEPATH.push('mlstudy/web/widgets');
opts.SCRIPTS.push('altmlsbatchscriptresultswidget.js');
opts.HTML_SNIPPETS.push('altmlswebmodulewidget.html');

opts.SOURCEPATH.push('mlstudy/web/managers');
opts.SCRIPTS.push('mlsmanager.js','batchjob.js');

opts.SOURCEPATH.push('mlstudy/web/mlpipeline');
opts.SCRIPTS.push('mlplogwidget.js');

opts.SOURCEPATH.push('mlstudy/web/clients');
opts.SCRIPTS.push('docstorclient.js','kbucketclient.js','lariclient.js');

//////////////////////////////////////////////////////////////////////
require(__dirname+'/jsq/jsqmake/jsqmake.js').jsqmake(opts);
