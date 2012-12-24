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
  
  // The I combinator
  function identityF() { return function identity(x){return x} }
  
  // Apply a different function depending upon the type of the argument:
  // Object/Array/Other.  Treats this as an argument to pass on.
  // relies on caller invoking returned function using:
  // applyObjectArrayOtherF.call(context,a,b,c) to load this properly
  function applyObjectArrayOtherF(objF, arrayF, otherF) { return function(val) {
    // map context is passed in as this
    return _.isArray(val) ? arrayF(val, this) : 
           _.isObject(val) ? objF(val, this) :
            otherF(val, this);
  }}
  
  // Apply a function to every property of an object and return
  // the object constructed out of the results with the same keys
  // pass a context object too.
  function mapObjectF(f) { return function(obj, context) {
      return _.object(_.keys(obj), _.map(_.values(obj), f, context));      
  }}
  
  function mapArrayF(f) { return function(obj, context) {
    return _.map(obj, f, context);
  }}
  
  var mapValueF = identityF;
  
  function mapAnythingF(f) {
    return applyObjectArrayOtherF(
      mapObjectF(f),
      mapArrayF(f),
      mapValueF(f)
      )
  }
  
  // Something like the Y combinator for these functions
  // allows recursion on subobjects.
  var recurse=function(val,f) {
    return f(val,f);
  }  

  
  // The K combinator
  function constantly(val) { return function() { return val }}
  
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

    var Q=mapObjectF(applyObjectArrayOtherF(recurse,_.size,identityF()))
    Q(message,Q)
    var Q2=mapAnythingF(applyObjectArrayOtherF(recurse,recurse,function(x){return ">"+x}))
    Q2(message,Q2)
    // Q2 breaks because of the behaviour of THIS and how mapAnythingF relies on
    // applyObjectArrayOtherF and it's behaviour wrt this.  need to example carefully.
    var Q3=mapObjectF(applyObjectArrayOtherF(recurse,recurse,function(x){return ">"+x}))
    
    T2=function(D){return mapObjectF(applyObjectArrayOtherF(recurse,recurse,D))}
    T3=function(container){return T2(container,T2)}
    M=function(C){return function(m){return C[m]}}
    T2(M(message.table))(message.structure)
    
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