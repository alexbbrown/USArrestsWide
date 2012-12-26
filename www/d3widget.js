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
      if (d.depth > maxdepth) { // this does nothing.  why?
        return null
      } else {
        return d.values
      }
    }}
      
    // the height used for y partitioning needs to take into account the
    // values row (which we aren't using, and the All row, which isn't in
    // the origianl aesthetic), hence it's height*(n+2)/(n+1)
    var adjustedHeight = height * (xaesthetic.length+2)/(xaesthetic.length+1)
      
    var partition = d3.layout.partition()
      .value(constantly(1))
      .sort(null)
      .size([width, adjustedHeight])
      .children(maxdepth(xaesthetic.length-1))
      
    // note: x and y of allData are blown away by this.
    return partition.nodes(dataTree)
  }
  
  // Do calculation for stacked bars
  function barStack(allData, groupAesthetic) {

    var barStack=d3.layout.stack()
      .values(function(d) {return d.values})
      .y(function(d) {return d.Y})
      .x(function(d) {
        return d.parent.x
      })
     
    var dnest=d3.nest().key(function(d) {return d[groupAesthetic]; })
      //.key(function(d) { return d.label; })
      .entries(allData)
    // WARNING: the input data needs an x,y array of the same length for each
    // level, otherwise "TypeError: Cannot read property '1' of undefined"
    // i.e. don't drop zeroes. (unless a whole column is 0)
   
    // running mystack calculates the y position, and updates the original data.
    nest_data=barStack(dnest)
  
    return nest_data // but it modifies data, so no worries.
  }
  
  // draw the stacked bars
  function barDraw(svg,bardata,x,y,color) {
 
      var a = svg.selectAll("rect.bar")
         .data(bardata,function(d){
           return d.X + d.group
         })  // metric really
 
       var padding = .05;
 
       a.exit().transition()
        .attr("height", 0)
        .attr("y", y(0))
        .attr("width", 0)
        .remove()
      a.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return d.parent.x + d.parent.dx; })
        .attr("width", function(d) { return d.parent.dx*(1-2*padding); })
        .attr("y", y(0))
        .attr("height",0)
        .style("fill", function(d) { return color(d.group); })
        .append("title");
 
      a.transition()
        .attr("x", function(d) { return d.parent.x + d.parent.dx*(padding); })
        .attr("width", function(d) { return d.parent.dx*(1-2*padding); })
        // negative coordinate heights are a pain
        .attr("y", function(d) { return y(d.y0 + d.y) })
        .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y) })
        .style("fill", function(d) { return color(d.group); })
        .select("title").text( function(d) { return d.X.reduce(function(a,b){return a+"\n"+b})+"\n"+d.group } );
  }

  // draw the hierarchical-x axis
  function hierAxis(plot,axisParts,colorScale,y,height) {
    
    function hasKeyFilter(key) { return function(d) { return _.has(d,key)}}
    
    rect=plot.select(".xaxis")
       .attr("transform", "translate(0," + y + ")")
       .selectAll("g")
       .data(axisParts.filter(hasKeyFilter("key")))
    
    rect
      .enter()
      .append("g")
      .each(function() {
        var s = d3.select(this)
        s.append("rect").attr("class", "haxis")
        s.append("text").attr("class", "haxislabel")
        s.append("title")
      })
      .attr("transform", function(d){
          return "translate(" + d.x + "," + (height-d.y-d.dy) + ")"
        })

    rect
      .transition()
      .attr("transform", function(d){
          return "translate(" + d.x + "," + (height-d.y-d.dy) + ")"
        })
      .select("rect")
        .attr("x", 1 )
        .attr("y", 2 )
        .attr("width", function(d) { return d.dx-2; })
        .attr("height", function(d) { return d.dy-1; })
        .style("fill", function(d) { return colorScale(d.depth); })
     
    rect
      .select("title")
      .text( function(d) { return d.key } );
       
    rect
      .select("text")
      .attr("x", function(d) { return d.dx /2; })
      .attr("y", function(d) { return 7*d.dy/10 ; })
      .style("text-anchor", "middle")
      .style("fill", "white")
     // .attr("visibility",function(d){
      //   return d.dx>80?"visible":"hidden"}
      //   )
    
      .text(function(d) { return d.key; });

    rect.exit()
      .transition()
      .remove()
  }
  
  function updateView(message) {

    var svg = d3.select(".d3io").select("svg")

    var hieraxis_height=100
    var margin = {top: 20, right: 10, bottom: 20+hieraxis_height, left: 40};
    var height=svg.node().clientHeight-margin.bottom-margin.top
    var width=svg.node().clientWidth-margin.left-margin.right

    var plot = svg.append("g")
    plot.append("g").attr("class","xaxis")
    plot.append("g").attr("class","yaxis")
    plot.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    lastMessage = message;
    // generate col major structured records
    lastData = decodeData(message);
    // create records with fields x,y,group from data
    aesData = lastData.map(applyAesthetic(message.aesthetic))
    // derive effective structure of aesthetic
    aesStructure = applyAesthetic(message.aesthetic)(message.structure)
    // build the hierarchic x axis
    h = hierarchX(aesData, aesStructure.X, width, hieraxis_height)
    s = barStack(aesData, "group")
    
    
    // Scales.  X is not a 'proper' scale - needs work
    var x = function(d){
      return d
    }
    // Y is linear including 0, which is appropriate for bars
    var y = d3.scale.linear()
          .range([height, 0])
          .domain(d3.extent(aesData.concat({y:0}), function(d) { return ((d.y0+d.y)||d.y); })).nice();
    var color = d3.scale.category20();
    var hierColor = d3.scale.category10();
    
    // Axes
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
   
    var yAxis = d3.svg.axis()
        .scale(y)
        .tickFormat(d3.format(".2s"))
        .orient("left");
    
    // start drawing
    barDraw(plot,aesData,x,y,color)
    hierAxis(plot,h,hierColor,height,hieraxis_height)

    plot.select(".yaxis")
      .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text( message.aesthetic.Y[1] )
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