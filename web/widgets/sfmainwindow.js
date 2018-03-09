function SFMainWindow(O) {
	O=O||this;
	JSQWidget(O);
	O.div().addClass('SFMainWindow');

	this.setSFManager=function(manager) {m_sf_manager=manager; refresh();};

	var m_sf_manager=null;
	O.div().css({overflow:'auto'});

	JSQ.connect(O,'sizeChanged',O,update_layout);
	function update_layout() {
		var W=O.width();
		var H=O.height();
	}

	var dataset_content=$('<span></span>');
	O.div().append(dataset_content);

	O.div().append('<hr />');
	O.div().append('<h1>Results</h1>');

	var display_mode=$('<span>Display mode: </span>');
	O.div().append(display_mode);
	display_mode.append('<span><input id=dm1 name=display_mode type=radio></input> By dataset &nbsp;&nbsp;&nbsp;</span>')
	display_mode.append('<span><input id=dm2 name=display_mode type=radio></input> By algorithm &nbsp;&nbsp;&nbsp;</span>')
	display_mode.append('<span><input id=dm3 name=display_mode type=radio></input> Matrix &nbsp;&nbsp;&nbsp;</span>')
	display_mode.find('#dm1').attr('checked','checked');
	display_mode.find('input').change(function() {
		refresh();
	});
	O.div().append('<hr />');

	var result_content=$('<span></span>');
	O.div().append(result_content);

	function refresh() {
		if (!m_sf_manager) {
			console.error('Error in refresh: no manager has been set.');
			return;
		}		

		dataset_content.empty();
		var dataset_table=$('<table class=table1 />');
		dataset_content.append(dataset_table);
		dataset_table.append('<tr><th>Dataset</th><th>Geometry</th><th>Study</th><th>Files</th><th>Views</th></tr>');
		for (var i=0; i<m_sf_manager.datasetCount(); i++) {
			var ds=m_sf_manager.dataset(i);
			var tr=create_dataset_row(ds);
			dataset_table.append(tr);
		}

		result_content.empty();

		if (display_mode.find('#dm1').is(':checked')) {
			for (var i=0; i<m_sf_manager.datasetCount(); i++) {
				if (i>0) {
					result_content.append('<hr/>'); //divider
				}
				var X=create_dataset_result_element(m_sf_manager.dataset(i));
				result_content.append(X);
			}
		}
		else if (display_mode.find('#dm2').is(':checked')) {
			for (var i=0; i<m_sf_manager.algorithmCount(); i++) {
				if (i>0) {
					result_content.append('<hr/>'); //divider
				}
				var X=create_algorithm_result_element(m_sf_manager.algorithm(i));
				result_content.append(X);
			}
		}
		else if (display_mode.find('#dm3').is(':checked')) {
			var table=$('<table class=table1 />');
			result_content.append(table);
			var tr_header=$('<tr></tr>');
			table.append(tr_header);
			tr_header.append('<th></th>');
			for (var i=0; i<m_sf_manager.datasetCount(); i++) {
				var DS=m_sf_manager.dataset(i);
				tr_header.append('<th>'+DS.id()+'</th>');
			}
			for (var j=0; j<m_sf_manager.algorithmCount(); j++) {
				var ALG=m_sf_manager.algorithm(j);
				var tr=$('<tr></tr>');
				table.append(tr);
				tr.append('<td>'+ALG.name()+'</td>');
				for (var i=0; i<m_sf_manager.datasetCount(); i++) {
					var DS=m_sf_manager.dataset(i);
					//var pct=Math.floor(Math.random()*100);
					//tr.append('<td><a href=#>'+pct+'%</a></td>');
					tr.append('<td><a href=#>Not yet implemented</a></td>');
				}
			}
			var result_table=$('<table class=table1></table>');
			result_table.append(make_result_table_header_row());
			result_content.append('<hr />');
			result_content.append(result_table);
		}
	}

	function create_dataset_row(DS) {
		var dataset_id=DS.id();
		var ret=$('<tr />');
		ret.append('<td>'+dataset_id+'</td>');
		var geom_td=$('<td></td>');
		ret.append(geom_td);
		var study_td=$('<td></td>');
		ret.append(study_td);
		var files_td=$('<td></td>');
		ret.append(files_td);
		var views_td=$('<td></td>');
		ret.append(views_td);

		var geom=DS.file('geom.csv');
		if (geom) {
			geom_td.html('Loading geometry...');
			get_text_from_url(geom.url,function(err,txt) {
				if (err) {
					geom_td.html('Error loading geometry file: '+err);
					return;
				}
				geom_td.html('');
				var W=new GeomWidget();
				W.setGeomText(txt);
				geom_td.append(W.div());
			});
			var aa=create_downloadable_file_element(geom,'geom.csv','geom.csv');
			files_td.append(aa);
		}

		var ds_obj=DS.object();
		if (ds_obj.study) {
			var title0=ds_obj.study.title||'';
			var owner0=ds_obj.study.owner||'';
			var txt=title0+' ('+owner0+')';
			var elmt=$('<span title="'+txt+'">'+title0+' <a href=#>&#x2197;</a></span>');
			elmt.find('a').click(function() {
				window.open('https://mlstudy.herokuapp.com/?owner='+owner0+'&title='+title0,'_blank');
			});
			study_td.append(elmt);
		}
		
		return ret;
	}

	function make_result_table_header_row() {
		var tr=$('<tr />');
		tr.append('<th>Result</th>');
		tr.append('<th>Num. units</th>');
		tr.append('<th>Accuracy</th>');
		tr.append('<th>Files</th>');
		tr.append('<th>Views</th>');
		return tr;
	}

	function create_dataset_result_element(DS) {
		var dataset_id=DS.id();
		var ret=$('<span></span>');
		ret.append('<h2>Dataset: '+dataset_id+'</h2>');
		var table=$('<table class=table1 />');
		table.append(make_result_table_header_row());
		ret.append(table);
		for (var i=0; i<m_sf_manager.algorithmCount(); i++) {
			var alg=m_sf_manager.algorithm(i);
			var result=m_sf_manager.findResult(dataset_id,alg.name());
			if (result) {
				var tr=create_result_row(result);
				table.append(tr);
			}
		}
		return ret;
	}

	function create_algorithm_result_element(ALG) {
		var algorithm_name=ALG.name();
		var ret=$('<span></span>');
		ret.append('<h2>Algorithm: '+algorithm_name+'</h2>');
		var table=$('<table class=table1 />');
		table.append('<tr><th>Result</th><th>Num. units</th><th>Accuracy</th><th></th><th class=td3>Output files</th></tr>')
		ret.append(table);
		for (var i=0; i<m_sf_manager.datasetCount(); i++) {
			var ds=m_sf_manager.dataset(i);
			var result=m_sf_manager.findResult(ds.id(),algorithm_name);
			if (result) {
				var tr=create_result_row(result);
				table.append(tr);
			}
		}
		return ret;
	}

	function create_result_row(result) {
		var dataset_id=result.datasetId();
		var algorithm_name=result.algorithmName();
		var ret=$('<tr></tr>');
		ret.append('<td class=td1><h4>'+dataset_id+' / '+algorithm_name+'</h4></td>');
		ret.append('<td class=td2 id=c1></td>');
		ret.append('<td class=td2 id=c2></td>');
		ret.append('<td class=td3 id=c3></td>');
		ret.append('<td class=td3 id=c4></td>');
		ret.find('#c1').css({"min-width":'60px'});
		ret.find('#c2').css({"min-width":'200px'});
		ret.find('#c3').css({"min-width":'150px'});
		ret.find('#c4').css({"min-width":'150px'});
		
		var obj=result.resultObject();
		var prefix=dataset_id+'_'+algorithm_name;

		opts={
			width:200,
			height:200
		};
		ret.find('#c2').html('loading');
		get_json_from_url(obj.validation_data['validation_stats.json'].url,function(err,validation_stats) {
			if (err) {
				ret.find('#c2').html('Error loading: '+err);
				return;
			}
			ret.find('#c2').html('');
			var accuracies=validation_stats.accuracies;
			create_hist_elmt(accuracies,opts,function(elmt) {
				ret.find('#c2').append(elmt);
			});
		});

		////////////////////////////////////////////////////
		var c3_table=$('<table class=table2></table>');
		ret.find('#c3').append(c3_table);
		var firings=obj['firings.mda']||{};
		var fname=prefix+'_firings.mda';
		var elmt=create_downloadable_file_element(firings,'firings.mda',fname);

		var tr=$('<tr><td></td></tr>'); c3_table.append(tr);
		tr.find('td').append('Sorting output:');
		var tr=$('<tr><td></td></tr>'); c3_table.append(tr);
		tr.find('td').append(elmt);

		if (obj.summary_data) {
			var tr=$('<tr><td></td></tr>'); c3_table.append(tr);
			tr.find('td').append('Summary data:');
			for (var key in obj.summary_data) {
				var fname=prefix+'_'+key;
				var elmt=create_downloadable_file_element(obj.summary_data[key],key,fname);
				var tr=$('<tr><td></td></tr>'); c3_table.append(tr);
				tr.find('td').append(elmt);
			}
		}
		if (obj.validation_data) {
			var tr=$('<tr><td></td></tr>'); c3_table.append(tr);
			tr.find('td').append('Validation data: ');
			for (var key in obj.validation_data) {
				var fname=prefix+'_'+key;
				var elmt=create_downloadable_file_element(obj.validation_data[key],key,fname);
				var tr=$('<tr><td></td></tr>'); c3_table.append(tr);
				tr.find('td').append(elmt);
			}
		}

		////////////////////////////////////////////////////
		var c4_table=$('<table class=table2></table>');
		ret.find('#c4').append(c4_table);
		if (obj.summary_data) {
			if (obj.summary_data['templates.mda']) {
				var elmt=create_templates_view_element(obj.summary_data['templates.mda']);
				var tr=$('<tr><td></td></tr>'); c4_table.append(tr);
				tr.find('td').append(elmt);
			}
			if (obj.summary_data['raw_1sec.mda']) {
				var elmt=create_timeseries_view_element(obj.summary_data['raw_1sec.mda'],'View raw_1sec');
				var tr=$('<tr><td></td></tr>'); c4_table.append(tr);
				tr.find('td').append(elmt);
			}
		}

		return ret;
	}

	function create_templates_view_element(templates) {
		var elmt=$('<span><a href=#>View templates</a>&nbsp;&nbsp;</span>')
		elmt.click(function() {
			var manager=new MLSManager();
			var DSC=new DocStorClient();
			DSC.setDocStorUrl('https://docstor1.herokuapp.com');
			DSC.login({},function() {
				manager.setDocStorClient(DSC);
				popup_widget(manager,{
	    			"type": "widget",
	    			"show": {
	        			"study": {
	            			"owner": "jmagland@flatironinstitute.org",
	            			"title": "mountainsortvis.mls"
	        			},
	        			"script": "standard_views",
	        			"method": "show_templates"
	    			},
	    			"data": {
	        			"url": templates.url
	        		}
	        	});
			});
		});
		return elmt;
	}

	function create_timeseries_view_element(timeseries,label) {
		var elmt=$(`<span><a href=#>${label}</a>&nbsp;&nbsp;</span>`)
		elmt.click(function() {
			var manager=new MLSManager();
			var DSC=new DocStorClient();
			DSC.setDocStorUrl('https://docstor1.herokuapp.com');
			DSC.login({},function() {
				manager.setDocStorClient(DSC);
				popup_widget(manager,{
	    			"type": "widget",
	    			"show": {
	        			"study": {
	            			"owner": "jmagland@flatironinstitute.org",
	            			"title": "mountainsortvis.mls"
	        			},
	        			"script": "standard_views",
	        			"method": "show_timeseries"
	    			},
	    			"data": {
	        			"url": timeseries.url
	        		}
	        	});
			});
		});
		return elmt;
	}

	function get_json_from_url(url,callback) {
		jsu_http_get_json(url,{},function(tmp) {
			if (!tmp.success) {
				callback(tmp.error);
				return;
			}
			callback(null,tmp.object);
		});
	}

	function get_text_from_url(url,callback) {
		jsu_http_get_text(url,{},function(tmp) {
			if (!tmp.success) {
				callback(tmp.error);
				return;
			}
			callback(null,tmp.text);
		});
	}

	function create_downloadable_file_element(file,label,fname) {
		var elmt=$('<span><a href=#></a>&nbsp;&nbsp;</span>');
		if ((!file.prv)&&(!file.url)) label+='.json';
		elmt.find('a').html(label);
		elmt.find('a').click(do_download);
		return elmt;

		function do_download() {
			var kbucket_url=m_sf_manager.kBucketUrl();
			if (file.prv) {
				file.url=kbucket_url+'/download/'+file.prv.original_checksum+'/'+fname;
			}
			if (file.url) {
				download(file.url);
			}
			else {
				download(JSON.stringify(file,null,4),label);
			}			
		}
	}

	update_layout();
}

function round(x) {
	return Math.round(x*1e4)/1e4;
}

function create_hist_elmt(values,opts,callback) {
	var lefts=[];
	var rights=[];
	var centers=[];
	for (var left=0; round(left)<100; left+=10) {
		lefts.push(round(left));
		rights.push(round(left+10));
		centers.push(round(left+5));
	}
	var counts=[];
	var tooltips=[];
	for (var i in lefts) {
		counts.push(0);
		tooltips.push('');
	}
	for (var i in values) {
		var val=values[i];
		var ii=Math.floor(val/0.1);
		if ((0<=ii)&&(ii<lefts.length)) {
			counts[ii]++;
		}
		tooltips[ii]=`Bin: [${lefts[ii]},${rights[ii]}]  Count: ${counts[ii]}`;
	}
	var opts={
		bar_width:9.5,
		width:opts.width,
		height:opts.height,
		tooltips:tooltips,
		xmin:0,
		xmax:100,
		xticks:[0,20,40,60,80,100],
		xlabel:'Accuracy (%)',
		ylabel:'Num. units'
	};
	create_bar_chart(centers,counts,opts,callback);
}

function create_bar_chart(xdata,ydata,opts,callback) {
	$.getScript('https://d3js.org/d3.v4.min.js',function() {
		var data=[];
		for (var i in xdata) {
			var tooltip=(opts.tooltips||[])[i]||'';
			data.push({x:xdata[i],y:ydata[i],tooltip:tooltip});
		}

		var elmt=$('<svg width='+opts.width+' height='+opts.height+'/>');
		$('body').append(elmt);

		var svg = d3.select(elmt[0]);
		var g = svg.append("g");
		
		var xmin=null;
		var xmax=null;
		for (var i in xdata) {
			if ((xmin===null)||(xdata[i]<xmin)) xmin=xdata[i];
			if ((xmax===null)||(xdata[i]>xmax)) xmax=xdata[i];
		}
		xmin-=opts.bar_width/2;
		xmax+=opts.bar_width/2;

		if ('xmin' in opts) xmin=opts.xmin;
		if ('xmax' in opts) xmax=opts.xmax;

		var ymax=null;
		for (var i in ydata) {
			if ((ymax===null)||(ydata[i]>ymax)) ymax=ydata[i];
		}

		var marg_left=35;
		var marg_right=20;
		var marg_bottom=40;
		var marg_top=20;
		var W0=opts.width-marg_left-marg_right;
		var H0=opts.height-marg_bottom-marg_top;

		/*
		svg.append('g')
			.append('line')
			.attr('x1',marg_left)
			.attr('y1',marg+H0)
			.attr('x2',marg+W0)
			.attr('y2',marg+H0)
			.attr('stroke','gray')
			.attr('stroke-width',1);
			*/

        var xScale = d3.scaleLinear()
	        .domain([xmin,xmax])
			.range([marg_left, marg_left+W0]);
		var xAxis = d3.axisBottom()
			.tickSizeOuter(0)
            .scale(xScale);
        if (opts.xticks)
            xAxis.tickValues(opts.xticks);
        svg.append('g')
        	.attr("class", "axis")
        	.attr("transform", "translate("+0+","+(marg_top+H0)+")")
        	.call(xAxis);

        var yScale = d3.scaleLinear()
	        .domain([0,ymax])
			.range([marg_top+H0, marg_top]);
		var yAxis = d3.axisLeft()
			.tickSizeOuter(0)
            .scale(yScale);
        if (opts.yticks)
            yAxis.tickValues(opts.yticks);
        svg.append('g')
        	.attr("class", "axis")
        	.attr("transform", "translate("+marg_left+",0)")
        	.call(yAxis);

        // text label for the x axis
  		svg.append("text")             
	      .attr("transform",
	            "translate(" + (marg_left+W0/2) + " ," + 
	                           (marg_top+H0 + 30) + ")")
	      .attr("class", "axis_label")
	      .style("text-anchor", "middle")
	      .text(opts.xlabel||'');

	    // text label for the y axis
  		svg.append("text")    
  		  .attr("transform", "rotate(-90)")
  		  .attr("x",-marg_top-H0/2).attr("y",marg_left-20)
	      .attr("class", "axis_label")
	      .style("text-anchor", "middle")
	      .text(opts.ylabel||'');

		var bar=g.selectAll(".bar")
	    .data(data)
	    .enter().append("g")

	    bar.append('rect')
	      .attr("class", "bar")
	      .attr("x", function(d) { return marg_left+(d.x-opts.bar_width/2-xmin)/(xmax-xmin)*W0; })
	      .attr("y", function(d) { return marg_top+(H0 - d.y/ymax*H0); })
	      .attr("width", opts.bar_width/(xmax-xmin)*W0)
	      .attr("height", function(d) { return d.y/ymax*H0; })
	      .append('title').html(function(d) {return d.tooltip;});

	    if (false) {
		    bar.append('text')
		    	.attr("x", function(d) { return marg_left+(d.x-xmin)/(xmax-xmin)*W0; })
		        .attr("y", function(d) { return marg_top+(H0 - d.y/ymax*H0 -3); })
		    	.text(function(d) {if (d.y==0) return ''; return d.y;} )
		    	.attr('text-anchor','middle');
		}



		callback(elmt);
	});
}

function GeomWidget(O) {
	O=O||this;
	JSQCanvasWidget(O);
	O.div().addClass('GeomWidget');
	O.setGeometry(0,0,200,40);
	O.div().css({position:'relative'});

	this.setGeomText=function(txt) {setGeomText(txt);};

	var m_geom=[];
	var m_xmin=0, m_xmax=1;
	var m_ymin=0, m_ymax=1;
	var m_mindist=1; //dist between nearby electrodes
	var m_transpose=false;

	O.onPaint(paint);
	function paint(painter) {
		var W=O.width();
		var H=O.height();
		painter.fillRect(0,0,W,H,'rgb(240,240,240)');
			
		var W1=W,H1=H;	
		if (m_transpose) {
			W1=H;
			H1=W;
		}

		var x1=m_xmin-m_mindist,x2=m_xmax+m_mindist;
		var y1=m_ymin-m_mindist,y2=m_ymax+m_mindist;
		var w0=x2-x1, h0=y2-y1;
		var offset,scale;
		if (w0*H1>h0*W1) {
			scale=W1/w0;
			offset=[0-x1*scale,(H1-h0*scale)/2-y1*scale];
		}
		else {
			scale=H1/h0;
			offset=[(W1-w0*scale)/2-x1*scale,0-y1*scale];	
		}
		for (var i in m_geom) {
			var pt0=m_geom[i];
			var x=pt0[0]*scale+offset[0];
			var y=pt0[1]*scale+offset[1];
			var rad=m_mindist*scale/3;
			var x1=x,y1=y;
			if (m_transpose) {
				x1=y;
				y1=x;
			}
			painter.fillEllipse([x1-rad,y1-rad,rad*2,rad*2],'blue');
		}

    }

    function setGeomText(txt) {
    	m_geom=[];
    	var list=txt.split('\n');
    	for (var i in list) {
    		if (list[i].trim()) {
	    		var vals=list[i].trim().split(',');
	    		for (var j in vals) {
	    			vals[j]=Number(vals[j]);
	    		}
	    		while (vals.length<2) vals.push(0);
	    		m_geom.push(vals);
	    	}
    	}

    	var pt0=m_geom[0]||[0,0];
    	var xmin=pt0[0],xmax=pt0[0];
    	var ymin=pt0[1],ymax=pt0[1];
    	for (var i in m_geom) {
    		var pt=m_geom[i];
    		xmin=Math.min(xmin,pt[0]);
    		xmax=Math.max(xmax,pt[0]);
    		ymin=Math.min(ymin,pt[1]);
    		ymax=Math.max(ymax,pt[1]);
    	}
    	if (xmax==xmin) xmax++;
    	if (ymax==ymin) ymax++;

    	m_xmin=xmin; m_xmax=xmax;
    	m_ymin=ymin; m_ymax=ymax;

    	m_transpose=(m_ymax-m_ymin>m_xmax-m_xmin);

    	var mindists=[];
    	for (var i in m_geom) {
    		var pt0=m_geom[i];
    		var mindist=-1;
    		for (var j in m_geom) {
    			var pt1=m_geom[j];
    			var dx=pt1[0]-pt0[0];
    			var dy=pt1[1]-pt0[1];
    			var dist=Math.sqrt(dx*dx+dy*dy);
    			if (dist>0) {
    				if ((dist<mindist)||(mindist<0))
    					mindist=dist;
    			}
    		}
    		if (mindist>0) mindists.push(mindist);
    	}
    	var avg_mindist=compute_average(mindists);
    	if (avg_mindist<=0) avg_mindist=1;
    	m_mindist=avg_mindist;

    	O.update();
    }

    function compute_average(list) {
    	if (list.length==0) return 0;
    	var sum=0;
    	for (var i in list) sum+=list[i];
    	return sum/list.length;
    }
}
