// Utility method to recursively walk a data structure and apply a different function 
// to each of array, object and other (usually a number or character)
// used for data mapping and transformation.
// Public Domain (by AlexBBrown)

// Usage:
//
// structureWalker() // constructor
//   .object(someFn) // optional - defaults to recurse
//   .array(someFn) // optional - defaults to recurse
//   .other(someFn) // optional - defaults to identity
//   (structureToWalk) // go!
//
// Examples
// to count the length of arrays in an object:
// 
// structureWalker().array(_.size)({a: [1,2], b: "alex"})
//   -> {a: 2, b: "alex"}
//
// to map one datastructure into another:
//
// structureWalker().other(function(x){return {a: ["bob",0], b: "cheese"}[x]})(["a", {b: "b"}])
//   -> [["bob",0],{b: "cheese"}]
//

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
  
  // Utility functions:
  // Extract data at a path in an object
  walk.atPath = function(structure){ return function(path) {
    return _.reduce(path,function(structure,member){return structure[member]},structure)
  }}
  
  walk.memberOf = function(thing){ return function(member) {
    return thing[member]
  }}
  
  walk.indexedMemberOf = function(thing,index){ return function(member) {
    return thing[member][index]
  }}

  return walk;
}