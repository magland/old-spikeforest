

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

	var display_mode=$('<span>Display mode: </span>');
	O.div().append(display_mode);
	display_mode.append('<span><input id=dm1 name=display_mode type=radio></input> By dataset &nbsp;&nbsp;&nbsp;</span>')
	display_mode.append('<span><input id=dm2 name=display_mode type=radio></input> By algorithm 2 &nbsp;&nbsp;&nbsp;</span>')
	display_mode.append('<span><input id=dm3 name=display_mode type=radio></input> Matrix &nbsp;&nbsp;&nbsp;</span>')

	display_mode.find('#dm1').attr('checked','checked');
	display_mode.find('input').change(function() {
		refresh();
	});

	var content=$('<span></span>');
	O.div().append(content);

	function refresh() {
		if (!m_sf_manager) {
			console.error('Error in refresh: no manager has been set.');
			return;
		}		
		content.empty();

		

		if (display_mode.find('#dm1').is(':checked')) {
			for (var i=0; i<m_sf_manager.datasetCount(); i++) {
				if (i>0) {
					content.append('<hr/>'); //divider
				}
				var X=create_dataset_element(m_sf_manager.dataset(i));
				content.append(X);
			}
		}
		else if (display_mode.find('#dm2').is(':checked')) {
			for (var i=0; i<m_sf_manager.algorithmCount(); i++) {
				if (i>0) {
					content.append('<hr/>'); //divider
				}
				var X=create_algorithm_element(m_sf_manager.algorithm(i));
				content.append(X);
			}
		}
		else if (display_mode.find('#dm3').is(':checked')) {
			var table=$('<table />');
			content.append(table);
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
					var pct=Math.floor(Math.random()*100);
					tr.append('<td><a href=#>'+pct+'%</a></td>');
				}
			}
			var result_table=$('<table></table>');
			result_table.append('<tr><th>Result</th><th>Num. units</th><th>Accuracy</th><th>Sorting output</th><th>Summary</th><th class=td3>Validation</th></tr>');
			content.append('<hr />');
			content.append(result_table);
		}
	}

	function create_dataset_element(DS) {
		var dataset_id=DS.id();
		var ret=$('<span></span>');
		ret.append('<h2>Dataset: '+dataset_id+'</h2>');
		var table=$('<table />');
		table.append('<tr><th>Result</th><th>Num. units</th><th>Accuracy</th><th>Sorting output</th><th>Summary</th><th class=td3>Validation</th></tr>');
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

	function create_algorithm_element(ALG) {
		var algorithm_name=ALG.name();
		var ret=$('<span></span>');
		ret.append('<h2>Algorithm: '+algorithm_name+'</h2>');
		var table=$('<table />');
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
		ret.append('<td class=td2 id=c3></td>');
		ret.append('<td class=td3 id=c4></td>');
		ret.append('<td class=td3 id=c5></td>');
		ret.find('#c1').css({"min-width":'60px'});
		ret.find('#c2').css({"min-width":'200px'});
		ret.find('#c3').css({"min-width":'100px'});
		ret.find('#c4').css({"min-width":'300px'});
		ret.find('#c5').css({"min-width":'300px'});

		var obj=result.resultObject();
		var prefix=dataset_id+'_'+algorithm_name;

		var firings=obj['firings.mda']||{};
		var fname=prefix+'_firings.mda';
		var elmt=create_downloadable_file_element(firings,'firings.mda',fname);
		ret.find('#c3').append(elmt);

		if (obj.summary_data) {
			for (var key in obj.summary_data) {
				var fname=prefix+'_'+key;
				var elmt=create_downloadable_file_element(obj.summary_data[key],key,fname);
				ret.find('#c4').append(elmt);
			}
		}
		if (obj.validation_data) {
			for (var key in obj.validation_data) {
				var fname=prefix+'_'+key;
				var elmt=create_downloadable_file_element(obj.validation_data[key],key,fname);
				ret.find('#c5').append(elmt);
			}
		}

		opts={
			width:200,
			height:200
		};
		var accuracies=obj.validation_data.validation_stats.accuracies;
		console.log('accuracies: '+JSON.stringify(accuracies));
		create_hist_elmt(accuracies,opts,function(elmt) {
			ret.find('#c2').append(elmt);
		});

		return ret;
	}

	function create_downloadable_file_element(file,label,fname) {
		var elmt=$('<span><a href=#></a>&nbsp;&nbsp;</span>');
		if (!file.prv) label+='.json';
		elmt.find('a').html(label);
		elmt.find('a').click(do_download);
		return elmt;

		function do_download() {
			var kbucket_url=m_sf_manager.kBucketUrl();
			if (file.prv) {
				var url=kbucket_url+'/download/'+file.prv.original_checksum+'/'+fname;
				download(url);
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
	$.getScript('http://d3js.org/d3.v4.min.js',function() {
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
