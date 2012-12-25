(function(){
  // Probably not idiomatic javascript.

  this.countValue=42;
  this.lastMessage=undefined;
  this.lastData=undefined;
  
  // decode an input data set from a message
  function decodeData(message) {
    // check it's the right format
    if (undefined == message ||
        undefined == message.table ||
        undefined == message.structure ||
        undefined == message.aesthetic) {
        console.log("bad message format");
        return undefined;
      }
    var structure = message.structure;
    var recordWalker=structureWalker(); // a new walker

    // transform the column-major data set (object of arrays)
    // and returns a set of structured records according to structure
    // for a particular index:
    function buildRecord(index){ 
      return recordWalker.other(
        // for each string S in structure, pull out the indexed element
        // of the array named S in data.
        recordWalker.indexedMemberOf(message.table,index))(structure);
    }
    // the number of records:
    var recordCount = _.values(message.table)[0].length
    // use the walker to map the structure onto the data
    var records = d3.range(0,recordCount).map(buildRecord)
    
    return records;
  }
  
   function applyAesthetic(aesthetic) { return function(record) {
    // aesthetic is like structure, but it queries structure?
    aesWalker = structureWalker()
     
    return aesWalker.array(
      // for each aesthetic, find the corresponding data item by 
      // dereference path in the data.
      aesWalker.atPath(record)
      )
      .other(
      // for simple strings, the path is simple:
      aesWalker.memberOf(record)
      )(aesthetic)
  }}
  
  // build x position as a hierarchy diagram with size
  // width, height
  function hierarchX(allData,xaesthetic,width,height) {
    var nester = d3.nest()
    // load the nester with the xaesthetic keys.
    // if xaesthetic is 
    var dataTree = {key:"All", values:
      _.keys(xaesthetic).reduce(
        function(nest,xkey){
          return nest.key(
            function(data){
              return data["X"][xkey]
      })},nester).entries(allData)
    }
    
    function constantly(value) { return function() { return value } }
    function maxdepth(maxdepth) { return function(d) { 
      if (d.depth > maxdepth) {
        return null
      } else {
        return d.values
      }
    }}
  
    var partition = d3.layout.partition()
      .value(constantly(1))
      .sort(null)
      .size([width, height])
      .children(maxdepth(xaesthetic.length-1))
      
    // note: x and y of allData are blown away by this.
    return partition.nodes(dataTree)
  }
  
  function updateView(message) {
    
    lastMessage = message;
    // generate col major structured records
    lastData = decodeData(message);
    // create records with fields x,y,group from data
    aesData = lastData.map(applyAesthetic(message.aesthetic))
    // derive effective structure of aesthetic
    aesStructure = applyAesthetic(message.aesthetic)(message.structure)
    // build the hierarchic x axis
    h = hierarchX(aesData, aesStructure.X, 100, 100)
    
    var svg = d3.select(".d3io").select("svg")

    svg.append("text")
      .transition()
      .attr("x",message[0])
      .attr("y",message[1])
      .text(countValue)
      .each("end",function(){
        countValue+=1;
        $(".d3io").trigger("change");
      })
  }
  
  var d3OutputBinding = new Shiny.OutputBinding();
  $.extend(d3OutputBinding, {
    find: function(scope) {
      return $(scope).find(".d3io");
    },
    renderError: function(el,error) {
      console.log("Foe");
    },
    renderValue: function(el,data) {
      updateView(data);
      console.log("Friend");
      
    }
  });
  Shiny.outputBindings.register(d3OutputBinding);
  
  var d3InputBinding = new Shiny.InputBinding();
  $.extend(d3InputBinding, {
    find: function(scope) {
      return $(scope).find(".d3io");
    },
    getValue: function(el) {
      return countValue;
    },
    subscribe: function(el, callback) {
      $(el).on("change.d3InputBinding", function(e) {
        callback();
      });
    }
  });
  Shiny.inputBindings.register(d3InputBinding);

  
})()