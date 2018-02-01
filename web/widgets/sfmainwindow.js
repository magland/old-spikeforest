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
		ret.find('#c2').css({"min-width":'60px'});
		ret.find('#c3').css({"min-width":'100px'});
		ret.find('#c4').css({"min-width":'300px'});
		ret.find('#c5').css({"min-width":'300px'});

		var obj=result.resultObject();
		var prefix=dataset_id+'_'+algorithm_name;

		var firings=obj.firings||{};
		var fname=prefix+'_firings.mda';
		var elmt=create_downloadable_file_element(firings,'firings.mda',fname);
		ret.find('#c3').append(elmt);

		if (obj.summary_data) {
			for (var key in obj.summary_data) {
				var fname=prefix+'_'+key+'.mda';
				var elmt=create_downloadable_file_element(obj.summary_data[key],key+'.mda',fname);
				ret.find('#c4').append(elmt);
			}
		}
		if (obj.validation_data) {
			for (var key in obj.validation_data) {
				var fname=prefix+'_'+key+'.mda';
				var elmt=create_downloadable_file_element(obj.validation_data[key],key+'.mda',fname);
				ret.find('#c5').append(elmt);
			}
		}

		return ret;
	}

	function create_downloadable_file_element(file,label,fname) {
		var elmt=$('<span><a href=#></a></span>');
		elmt.find('a').html(label);
		elmt.find('a').click(do_download);
		return elmt;

		function do_download() {
			var kbucket_url=m_sf_manager.kBucketUrl();
			if (!file.prv) {
				alert('Not a prv object.');
				return;
			}
			var url=kbucket_url+'/download/'+file.prv.original_checksum+'/'+fname;
			console.log(url);
			download(url);
		}
	}

	update_layout();
}

