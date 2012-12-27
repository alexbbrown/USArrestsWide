Shiny+d3: structured R data with aesthetic to D3 bar chart with hierarchical x-axis
=================================================================================

The following plot is a demo of shiny + d3 (hosted at http://glimmer.rstudio.com/alexbbrown/USArrestsWide/) 

It shows how by adding structure metadata to a (melted) data table passed to the client we can start to build a client
which flexibly displays different data.

In this case the data is produced from minimal processing of R data()'s USArrests database, with a little extra from
data()'s states*.

Understanding the code:
======================

This is an RStudio Shiny project, so it follows those conventions.  To support RStudio's glimmer platform, the crucial
javascript client is in the WWW directory.  Here's what the important files do:

 * server.R: prepares and delivers the data set and annotations
 * WWW/d3widget.js: the javascript client, which receives the data and plots the output

Preparing the data
==================

While larger than wide data, long data produced by reshape2's melt function is easier to reason about.

First, form a data.table whose columns are either keys (experimental variables) or values (response variables).

For instance:

    Division, State, Crime, Count
    Pacific, California, Murder, 124
    ...

Then, describe the data structure:

    list(
      Location=list("Division", "State"),
      Crime="Crime",
      Metrics="Count")
  
Then, create one (of many possible) aesthetic mappings to X, Y and Group:
  
    list(
        X="Location",
        Group="Crime",
        Y=c("Metrics","Count"))
        
Here we have indicated that X is a key composed of Location - which is itself always composed of "Division" and "State".

Conversely Y is not composed - but has the value found in "Count", which is in the "Metric" part of the structure.

Uploading
---------

To upload, place the melted data table, the structure and the aesthetic in a single data structure and send using a reactive:

    list(table=...,
         structure=...,
         aesthetic=...)

At some point in the future I will extend this to hold metadata and other tables - for instance where should we put the interesting facts such as the abbreviated state name, and the population of the state?

The Client
==========

The client is a d3 script which takes the uploaded data structure and converts it into a bar graph with a hierarchical X-axis (as described by the Aesthetic.)

It may well be online and working at http://glimmer.rstudio.com/alexbbrown/USArrestsWide/.


Supporting Logic
================

The structureWalker.js file contains the structureWalker function.  This handy tool allows a data structure composed of JS Arrays, Objects and Primitives to be recursively walked in a manner analogous to map, and for each location it can process an Array, Object or Primitive according to a user-supplied function, and produce a new structure from the results of the appications of these functions.

This makes combining and transforming the uploaded data structures almost trivial.

