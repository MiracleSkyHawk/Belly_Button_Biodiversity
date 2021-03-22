function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("data/samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("data/samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("data/samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var sampleArray = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var resultArray = sampleArray.filter((element) => element.id == sample);
    //  5. Create a variable that holds the first sample in the array.
    var result = resultArray[0];

    console.log(data);
    var metadata = data.metadata;
    var desriedMetadata = metadata.filter((element) => element.id == sample);
    var desiredData = desriedMetadata[0];
    var wfreq = parseFloat(desiredData.wfreq);

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = result.otu_ids;
    var otu_labels = result.otu_labels;
    var sample_values = result.sample_values;
    console.log(result);
    var resultSorted = [];
    for (var i=0; i<otu_ids.length; i++) {
      x = {
        otu_ids: otu_ids[i],
        otu_labels: otu_labels[i],
        sample_values: sample_values[i]
      };
      resultSorted.push(x);
    }

    console.log(resultSorted);
    resultSorted = resultSorted.sort((a,b) => b.sample_values - a.sample_values);
    var resultTop10 = resultSorted.slice(0,10).reverse();
    var yticks = resultTop10.map((element) => "OTU " + element.otu_ids);

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 


    // 8. Create the trace for the bar chart. 
    var barData = [
      {
        x: resultTop10.map((element) => element.sample_values),
        y: yticks,
        type: "bar",
        text: resultTop10.map((element) => element.otu_labels),
        orientation: "h"
      }
      
    ];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found"
    };

    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);
    


    var bubbleData = [
      {
        x: resultSorted.map((element) => element.otu_ids),
        y: resultSorted.map((element) => element.sample_values),
        hovertemplate: '(%{x}, %{y})' +
                       '<br>%{text}',
        text: resultSorted.map((element) => element.otu_labels),
        mode: "markers",
        marker: {
          color: resultSorted.map((element) => element.otu_ids),
          colorscale: 'Earth',
          size: resultSorted.map((element) => element.sample_values)
        }
      }
   
    ];
    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteroa Cultures Per Sample",
      xaxis: {title: "OTU ID"},
      hovermode: "closet",
      margin: {
        l: 100,
        r: 100,
        t: 50,
        b: 100
      }
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    // 4. Create the trace for the gauge chart.
    var gaugeData = [
      {
        value: wfreq,
        title: { text: '<b>Belly Button Washing Frequency</b><br>Scrubs per Week'},
        gauge: {
          axis: { range: [null, 10], tickmode: 'auton', ticks: 5},
          bar: { color: "black"},
          bgcolor: "silver",
          steps: [
            { range: [0,2], color: 'red'},
            { range: [2,4], color: 'darkorange'},
            { range: [4,6], color: 'yellow'},
            { range: [6,8], color: 'yellowgreen'},
            { range: [8,10], color: 'green'}
          ]},
        type: "indicator",
        mode: "gauge+number"
        
        }
      
    ];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      margin: { t: 0, b: 0 },
      plot_bgcolor:"silver"
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}
