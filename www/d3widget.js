(function(){
  // Probably not idiomatic javascript.

  this.countValue=42;
  this.lastMessage=undefined;
  this.lastData=undefined;
  
  // decode an input data set from a message
  var decodeData = function(message) {
    // check it's the right format
    if (undefined == message ||
        undefined == message.table ||
        undefined == message.structure ||
        undefined == message.aesthetic) {
        console.log("bad message format");
        return undefined;
      }
    var structure = message.structure;

    // transform the column-major data set into column-major
    // structured data.
    function tableMember(x){return message.table[x]};
    //data = 
    //  structureWalker()
    //    .other(tableMember)
    //    (structure)
    
    // a function which takes an object of arrays and an index
    // and returns a function which takes an array and returns
    // the element at that index
    function arrayIndex(structure,index){return function(array){return structure[array][index]}}
    // transform the column-major data set (object of arrays)
    // and returns a set of structured records according to structure
    // for a particular index:
    recordWalker=structureWalker()
    function buildRecord(index){ 
      return recordWalker.other(arrayIndex(message.table,index))(structure);
    }
    // the number of records:
    var recordCount = _.values(message.table)[0].length
    var records = d3.range(0,recordCount).map(buildRecord)
    
    return records;
  }
  
  

  
  // Convert column major structure to row major
  var zipStruct = function(data) {
    
  }
  
  // comprehend a data set using an aesthetic
  var aestheticData = function(data, aesthetic) {
    // aesthetic is like structure, but it queries structure?
  }
  
  var updateView = function(message) {
    
    lastMessage = message;
    lastData = decodeData(message);
    // rowfiy?
    //plotData = aestheticData(lastData,message$aesthetic)
    
    
    
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