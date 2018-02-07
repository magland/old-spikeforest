function SFManager(O) {
  O=O||this;
  JSQObject(O);

	this.setConfig=function(X) {setConfig(X);};
  this.setKBucketUrl=function(url) {m_kbucket_url=url;};
  this.kBucketUrl=function() {return m_kbucket_url;};
  this.datasetCount=function() {return datasetCount();};
  this.dataset=function(i) {return dataset(i);};
  this.algorithmCount=function() {return algorithmCount();};
  this.algorithm=function(i) {return algorithm(i);};
  this.findResult=function(dataset_id,algorithm_name) {return findResult(dataset_id,algorithm_name);};

  var m_config={};
  var m_kbucket_url='';

  function setConfig(X) {
    if (JSON.stringify(X)==JSON.stringify(m_config)) return;
    m_config=JSQ.clone(X);
    O.emit('changed');
  }

  function datasetCount() {
    var datasets=m_config.datasets||[];
    return datasets.length;
  }
  function dataset(i) {
    var obj=m_config.datasets[i];
    var X=new SFDataset();
    X.setObject(obj);
    return X;
  }
  function algorithmCount() {
    var algorithms=m_config.algorithms||[];
    return algorithms.length;
  }
  function algorithm(i) {
    var obj=m_config.algorithms[i];
    var X=new SFAlgorithm();
    X.setObject(obj);
    return X;
  }
  function findResult(dataset_id,algorithm_name) {
    var results=m_config.results||[];
    for (var i=0; i<results.length; i++) {
      var obj=results[i];
      if ((obj.dataset_id==dataset_id)&&(obj.algorithm_name==algorithm_name)) {
        var X=new SFResult();
        X.setObject(obj);
        return X;
      }
    }
    return null;
  }
}

function SFDataset() {
  var that=this;
  this.setObject=function(obj) {m_object=JSQ.clone(obj);};
  this.object=function() {return JSQ.clone(m_object);};
  this.id=function() {return m_object.id||'';};
  this.files=function() {return JSQ.clone(m_object.files||{});};
  this.file=function(name) {return that.files()[name]||null;};

  var m_object={};
}

function SFAlgorithm() {
  this.setObject=function(obj) {m_object=JSQ.clone(obj);};
  this.object=function() {return JSQ.clone(m_object);};
  this.name=function() {return m_object.name||'';};

  var m_object={};
}

function SFResult() {
  this.setObject=function(obj) {m_object=JSQ.clone(obj);};
  this.object=function() {return JSQ.clone(m_object);};
  this.resultObject=function() {return JSQ.clone(m_object.result||{});};
  this.datasetId=function() {return m_object.dataset_id||'';};
  this.algorithmName=function() {return m_object.algorithm_name||'';};

  var m_object={};
}
