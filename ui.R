library(shiny)

d3IO <- function(inputoutputID) {
  div(id=inputoutputID,class=inputoutputID,tag("svg",""));
}

# Define UI for shiny d3 chatter application
shinyUI(pageWithSidebar(
  
  # Application title
  headerPanel("D3 Structured Data bar graph demo",
              "Demo of how to generate a bar graph with a hierarchic axis from R data sets"),
  
  sidebarPanel(
    tags$p("Exploration of how to take a table from R, describe its structure, then create a plot that exploits that structure"),
    tags$h3("Server side"),
    tags$p("Builds a map from US region, state to crimes by type then melt it to long format."),
    tags$p("Defines structure object to describe the relationships between the columns, and","defines an aesthetic object to explain to d3 how to plot the data."),
    tags$dl(
      tags$dt("table"),tags$dd("a data table",tags$code('data.frame(Division=,State=,Crime=,Count=)')),
      tags$dt("structure"),tags$code('list(Location=c("Division","State"),
                                           Crime="Crime",Measure=list(Count="Count"))'),
      tags$dt("aesthetic"),tags$code('list(X="Location", Y=list("Measure","Count"), group=list("Crime"))')
      ),
    tags$h3("Client side"),
    tags$p("Receives these 3 in a single message, then calls updateView:"),
    tags$ol(tags$li("rebuilds the table data according to the $structure"),
            tags$li("applies the aesthetic to create records with X, Y, group"),
            tags$li("generates a hierarchical axis from X components division, State"),
            tags$li("plots bars of crimes per state"),
            tags$li("draws the axes and legends")
            ),
    tags$p("The salient point is that the structure and details of the data are controlled by the server, not assumed by the client."),    
    tags$p("The example turned out more complex that I wanted, mainly for aesthetic reasons.  -AlexBBrown")
    ),
  
  mainPanel(
    includeHTML("d3widgetscripts.html"),
    d3IO("d3io")
  )
    ))