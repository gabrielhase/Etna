
this.etna = this.etna || {};

this.etna.lineChart = (function() {
  return {
    chart: {
      "width": 200,
      "height": 100,
      "padding": {
        "top": 5,
        "left": 40,
        "bottom": 20,
        "right": 5
      },
      "data": [
        {
          "name": "table",
          "values": []
        }
      ],
      "scales": [
        {
          "name": "x",
          "type": "ordinal",
          "range": "width",
          "domain": {
            "data": "table",
            "field": "data.year"
          }
        }, {
          "name": "y",
          "type": "linear",
          "range": "height",
          "domain": {
            "data": "table",
            "field": "data.population"
          }
        }
      ],
      "axes": [
        {
          "type": "x",
          "scale": "x",
          "values": ["1850", "1900", "1950", "2000"],
          "properties": {
            "labels": {
              "fontSize": {
                "value": 2
              }
            }
          }
        }, {
          "type": "y",
          "scale": "y"
        }
      ],
      "marks": [
        {
          "type": "line",
          "from": {
            "data": "table"
          },
          "properties": {
            "enter": {
              "x": {
                "scale": "x",
                "field": "data.year"
              },
              "y": {
                "scale": "y",
                "field": "data.population"
              },
              "interpolate": "linear",
              "stroke": {
                "value": "blue"
              },
              "strokeWidth": {
                "value": 1
              }
            }
          }
        }
      ]
    }
  };
})();
