this.etna = this.etna || {};

this.etna.sentimentChart = (function() {
  /* Private module properties and functions */

  //Width and height
  var w = 500,
    h = 50,
    divX;

  //Data
  var colorscheme = ["red", "yellow", "green"];
  var colors2 = ["grey", "blue", "black"];
  var colors = ["red", "yellow", "green"];
  var thr = 0.3;
  var count_;
  var dataset;
  var filteredData;
  var timer1;
  var svg;
  var filter = "";
  var wordlist = ['mount', 'sicily', 'eruption', 'italy', 'lava', 'ash', 'video', 'vulcano', 'me', 'volcano', 'with', '2012'];
  wordlist = wordlist.sort();

  var amount;

  animation = function(target) {
    jQuery("#neutral").animate({
        left: target
    }, 1500 );

    jQuery("#neutral_nr").animate({
        left: target
    }, 1500 );
  };

  hideTT = function() {
    clearTimeout(timer1);
    document.getElementById('tooltip').className="Invisible";
  };

  showTT = function() {
    var tt = document.getElementById("tooltip");
    tt.className = "Visible";
    tt.style.position = "absolute";
    tt.style.left =(window.lastX+10) +"px";
    tt.style.top =(window.lastY+10) +"px";
  };

  createDropDown = function(list){
    var menu ='<select id="filter">\n<option value="">no filter\n';
    for (var e in list){
      menu+='<option value="'+list[e]+'">'+list[e]+'\n';
    }
    menu+='</select>';
    return menu;
  };

  filterData = function(filter) {
    filteredData = etna.tweets.filter(function(obj) { return obj[3].indexOf(filter)!==-1; });
    count_ = [0,0,0];
    for (var tweet in filteredData) {
      if(filteredData[tweet][2]<(-thr)) {
        count_[0]+=1;
      } else if(filteredData[tweet][2]>thr) {
        count_[2]+=1;
      } else {
        count_[1]+=1;
      }
    }
    amount = count_;
    for (var e in count_) {
      count_[e] = count_[e]/(filteredData.length/100);
    }
    dataset = count_;
  };

  // draws the rects for the pos, neutr., and neg. tweets
  drawChart = function() {
    var position = [0, dataset[0], (dataset[0]+dataset[1])];
    //Create SVG element
    svg = d3.select("#svgContainer")
          .append("svg")
          .attr("width", w)
          .attr("height", h);
    var rects = svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
          .attr("x", function(d, i) {
            return w/(100/position[i]);
          })
          .attr("y", 0)
          .attr("height", h)
          .attr("width", function(d) {
            return w/(100/d);
          })
          .attr("fill", function(d, i) {
            return colors[i];
          });
  };

  updateData = function (dataSet, colorscheme){
    var colorscheme = colorscheme;
    var dataset = dataSet;
    var position = [0, dataset[0], dataset[0]+dataset[1]];
    var rects = svg.selectAll("rect")
        .data(dataset)
          .transition()
             .duration(1000)
             .delay(0)
             .attr("x", function(d, i) {
                 return w/(100/position[i]);
             })
            .attr("y", 0)
            .attr("height", h)
            .attr("width", function(d) {
                 return w/(100/d);
            })
            .attr("fill", function(d, i){ return colorscheme[i]; });

     document.getElementById('negative').innerHTML ='<strong>'+dataset[0].toFixed(1)+'%</strong>';
     document.getElementById('neutral').innerHTML ='<strong>'+dataset[1].toFixed(1)+'%</strong>';
     document.getElementById('positive').innerHTML ='<strong>'+dataset[2].toFixed(1)+'%</strong>';

     document.getElementById('negative_nr').innerHTML ='<strong>'+Math.floor((filteredData.length/100)*dataset[0])+'</strong>';
     document.getElementById('neutral_nr').innerHTML ='<strong>'+Math.floor((filteredData.length/100)*dataset[1])+'</strong>';
     document.getElementById('positive_nr').innerHTML ='<strong>'+Math.floor((filteredData.length/100)*dataset[2])+'</strong>';

     animation((500*dataSet[1]/100)+(500*dataSet[0]/100)-((500*dataSet[1]/100)/2)+"px");
  };

  // public properties of etna.sentimentChart
  return {
    init: function() {
      // margins
      divX = document.getElementById('sentiment').offsetLeft;

      // init data and svg
      filterData("");
      drawChart();

      // labels
      document.getElementById('scale').innerHTML ='<div id="nr"><strong>% of tweets: </strong></div><div id="negative"><strong>'+count_[0].toFixed(1)+'%</strong></div>'+'<div id="neutral"><strong>'+count_[1].toFixed(1)+'%</strong></div>'+'<div id="positive"><strong>'+count_[2].toFixed(1)+'%</strong></div>';
      document.getElementById('scale_nr').innerHTML ='<div id="nr"><strong>nr of tweets: </strong></div><div id="negative_nr"><strong>'+Math.floor((filteredData.length/100)*count_[0])+'</strong></div>'+'<div id="neutral_nr"><strong>'+Math.floor((filteredData.length/100)*count_[1])+'</strong></div>'+'<div id="positive_nr"><strong>'+Math.floor((filteredData.length/100)*count_[2])+'</strong></div>';
      document.getElementById('neutral').style.left = (500*count_[1]/100)+(500*count_[0]/100)-((500*count_[1]/100)/2)+"px";
      document.getElementById('neutral_nr').style.left = (500*count_[1]/100)+(500*count_[0]/100)-((500*count_[1]/100)/2)+"px";

      // filter dropdown
      document.getElementById("drpdwn").innerHTML =createDropDown(wordlist);

      // events
      etna.sentimentChart.initEvents();
    },

    initEvents: function() {
      $("#chkbx").click(function() {
        if($(this).is(':checked')){
          colorscheme = ["#1b9e77", "#d95f02", "#7570b3"];
          document.getElementById('neg_legend').style.background = "#1b9e77";
          document.getElementById('neu_legend').style.background = "#d95f02";
          document.getElementById('pos_legend').style.background = "#7570b3";
        } else {
          colorscheme =["red", "yellow", "green"];
          document.getElementById('neg_legend').style.background = "red";
          document.getElementById('neu_legend').style.background = "yellow";
          document.getElementById('pos_legend').style.background = "green";
        }

        updateData(count_, colorscheme);
      });

      $("#filter").change(function() {
        filterData(jQuery(this).val());
        updateData(dataset, colorscheme);
      });
    },

    myMM: function(e) {
      document.getElementById('tooltip').innerHTML = "<strong>tweet:</strong>"+filteredData[Math.floor( filteredData.length/w*(e.pageX -divX))][1]+"<br><strong>sentiment:</strong>"+filteredData[Math.floor(filteredData.length/w*(e.pageX-divX))][2];
      window.lastX = e.pageX;
      window.lastY = e.pageY;
      hideTT();
      timer1 = setTimeout("showTT();", 1*1000);
    },

    hideTooltip: function() {
      hideTT();
    }
  };
})();