
this.etna = this.etna || {};

this.etna.townsExplorer = (function() {
  var templates, townsData;
  templates = this.etna.templates;
  townsData = void 0;
  return {
    init: function(townsDataIn, chartComponent) {
      townsData = townsDataIn;
      etna.towns = townsDataIn.towns;
      this.chartComponent = chartComponent;
      return this.initEvents();
    },
    initEvents: function() {
      return this.initRegionLinks();
    },
    initRegionLinks: function() {
      var _this = this;
      return $(".region-link").click(function(event) {
        var $this;
        event.preventDefault();
        $this = $(event.currentTarget);
        _this.showTown($this);
        return _this.initBackButton();
      });
    },
    initBackButton: function() {
      var _this = this;
      return $("#back-to-towns").click(function(event) {
        event.preventDefault();
        $("#towns-explorer").html(templates.townsNavigation(townsData));
        return _this.initRegionLinks();
      });
    },
    showTown: function($townElement) {
      var region, regionContent, regionData;
      region = $townElement.data("region");
      etna.map.showRegion(region);
      regionData = etna.towns[region];
      regionContent = templates.regionTeaser({
        title: regionData.name,
        teaser: regionData.text,
        imageurl: regionData.imageurl,
        population: regionData.population
      });
      $("#towns-explorer").html(regionContent);
      return this.drawTownsPopulationChart(region);
    },
    drawTownsPopulationChart: function(region) {
      var data, population, regionData, year, _ref;
      regionData = etna.towns[region];
      data = {};
      data["table"] = [];
      _ref = regionData['census'];
      for (year in _ref) {
        population = _ref[year];
        data["table"].push({
          "year": year,
          "population": population
        });
      }
      return this.chartComponent({
        el: "#vis",
        data: data,
        renderer: "svg"
      }).update();
    }
  };
})();
