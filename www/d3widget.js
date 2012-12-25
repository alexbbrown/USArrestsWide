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
    data = 
      structureWalker()
        .other(tableMember)
        (structure)
  }
  
  
  // Walk a structure composed of objects arrays and elements, and apply
  // one of the functions on each type.  Specify recurse to continue walking into
  // the object.
  function structureWalker() {
    // The I combinator
    function identityF() { return function identity(x){return x} }
    
    // utility for consumers of structureWalker
    identity = identityF();
    
    // Apply a different function depending upon the type of the argument:
    // Object/Array/Other.  Treats this as an argument to pass on.
    // relies on caller invoking returned function using:
    // applyObjectArrayOtherF.call(context,a,b,c) to load this properly
    function applyObjectArrayOtherF(objF, arrayF, otherF) { 
      return function applyObjectArrayOther(val) {
      // map context is passed in as this
      return ((_.isArray(val) ? arrayF: 
                 _.isObject(val) ? objF:
                   otherF).call(this, val, this));
    }}
    
    // Apply a function to every property of an object and return
    // the object constructed out of the results with the same keys
    // pass a context object too.
    function mapObjectF(f) { return function mapObject(obj, context) {
        return _.object(_.keys(obj), _.map(_.values(obj), f, context));      
    }}
    
    function mapArrayF(f) { return function mapArray(obj, context) {
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
    // allows recursion on subobjects.  The default behaviour
    // for arrays and objects.
    function recurse(val,f) {
      return f.call(f,val,f);
    }  
  
    // The K combinator.  Probably want to export this.
    function constantlyF(val) { return function constantly() { return val }}
    
    // generator for object member extractor
    member = function member(anObject){return function(m){return anObject[m]}}
    
    var objectFn = recurse,
        arrayFn = recurse,
        otherFn = identity;
    
    function walk(structure) {
        return recurse(structure,
          mapAnythingF(
            applyObjectArrayOtherF(
              objectFn,arrayFn,otherFn)));
    }
    
    walk.object = function(newObjectFn) {
      objectFn = newObjectFn;
      return walk;
    }
    
    walk.array = function(newArrayFn) {
      arrayFn = newArrayFn;
      return walk;
    }
    
    walk.other = function(newOtherFn) {
      otherFn = newOtherFn;
      return walk;
    }
    
    return walk;
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