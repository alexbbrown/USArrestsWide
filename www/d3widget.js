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
    var data = new Object();
    var structure = message.structure;

    // transform the column-major data set into column-major
    // structured data
    for (var sKey in structure) {
      // should all be arrays
      data[sKey]=_.object(
        structure[sKey],
        structure[sKey].map(function(sCol){
          return message.table[sCol];
        }))
    }
    return data
  }
  
  // generate a function to
  // walk over an object, creating an object with 
  // the same keys but the value if f(input value)
  var mapObjectF = function(f) { return function(obj, context) {
      return _.object(_.keys(obj), _.map(_.values(obj), f, context));      
  }}
  
  // make a function which:
  // applies a different function to an object or to an array
  var applyObjectArrayOtherF = function(objF, arrayF, otherF) { return function(val) {
    // map context is passed in as this
    return _.isArray(val) ? arrayF(val, this) : 
           _.isObject(val) ? objF(val, this) :
            otherF(val, this);
  }}
  
  // Something like the Y combinator for these functions
  // allows recursion on subobjects.
  var objectRecurse=function(val,f) {
    return f(val,f);
  }
  
  var mapStruct = function(struct, f, context) {
    
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
    
    var T=function(x){return typeof(x)}
    var Q=mapObjectF(applyObjectArrayOtherF(objectRecurse,_.size,function(x){return x}))
    Q(message,Q)
    
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