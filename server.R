library(shiny)
library(reshape2)
options(max.print=20)

# Goals:
# demonstrate construction of description of data
# convert from wide to long in d3
# map from keys and response to x and y in d3
# show how structured keys might work
# demonstrate delayed loading of detail data. (not this version)

# Prepare sample data
data(USArrests)

# Join state data together
myArrests <- USArrests
myArrests$State <- row.names(myArrests)
# with extra information about the state (key)
stateInfo <- data.frame(Division=state.division,State=state.name)
myArrests.merged <- merge(myArrests,stateInfo)
# discard unwanted columns:
myArrests.merged$UrbanPop <- NULL

# start to build the data and metadata to upload
uploadData=list()
# melt the data to build the correct set of keys
# sadly this makes the uploaded data larger, but it's 
# unavoidable if we want to simplify the model.  We may 
# want to transmit factors as factors and do rle on the
# data numeric data thus sent.
# note also that this makes a structure indistinguishable 
# from a 'sparse' matrix (even though it isn't)
uploadData$table <- melt(myArrests.merged, measure.vars=c("Murder", "Assault", "Rape"),
                         variable.name="Crime",value.name="Count")

# categorise the columns into key and response variables.
# in general there will be multiple sets of independent keys,
# but here I have arranged for ONE nested key
# we could also view these are being partitions of data - 
# location is hierarchical, crime is flat.
uploadData$structure <- list(Location=list("Division", "State"),
     Crime=list("Crime"), # only one hierarchy level, so simple.
     Measure=list("Count")) # for completeness

# build an aesthetic mapping from the data structure to x, y, etc.
# Note that the aesthetic only applies to one view of the data - it's likely there will
# be multiple sensible ones, possibly multiple in the same graph.
# group here is going to mean ggplot's group, position="stack".
uploadData$aesthetic <- list(x="Location", y="Count", group="Crime")

browser();

# I guess we could do some 'compression' here - by representing the data as a cube
# for non-sparse data, or transmitting the factors in a representation closer to 
# R factors (key map plus numeric vector)
 
# Define server logic required to respond to d3 requests
shinyServer(function(input, output) {
  
  # Generate a plot of the requested variable against mpg and only 
  # include outliers if requested
  output$d3io <- reactive(function() {
    # input$d3io is ignored for now    
    uploadData
    
  })
})