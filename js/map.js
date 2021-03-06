
this.etna = this.etna || {};

this.etna.map = (function() {
  var regionZoom, templates;
  templates = this.etna.templates;
  regionZoom = false;
  return {
    towns: {},
    eruptions: {},
    init: function(townsData, eruptionData) {
      var layer,
        _this = this;
      etna.towns = townsData.towns;
      etna.eruptions = eruptionData;
      layer = mapbox.layer().id('gabriel-hase.map-25owz48z');
      this.map = mapbox.map('map', layer, null, [MM.DragHandler(), MM.DoubleClickHandler()]);
      this.map.ui.zoomer.add();
      this.map.setZoomRange(8, 16);
      this.map.setPanLimits([
        {
          lat: 36.8,
          lon: 13.5
        }, {
          lat: 39.5,
          lon: 16.5
        }
      ]);
      this.map.addCallback("zoomed", function(map, zoomOffset) {
        if (regionZoom === true) {
          return regionZoom = false;
        } else {
          return _this.hideLegend();
        }
      });
      this.map.addCallback("panned", function(map, zoomOffset) {
        return _this.hideLegend();
      });
      this.map.centerzoom({
        lat: 37.734,
        lon: 15.004
      }, 10);
      this.teaserHtml = $("#map-legend").html();
      this.initEvents();
      this.townsLayer = mapbox.markers.layer();
      this.map.addLayer(this.townsLayer);
      this.markerLayer = mapbox.markers.layer();
      this.map.addLayer(this.markerLayer);
      this.initD3Layer();
      this.initLavaLayer();
      etna.eruptionsChart.init(etna.eruptions, this.map, this.circleLayer, this.markerLayer, this.lavaLayer);
      return etna.eruptionsChart.drawBarchart(etna.eruptions);
    },
    initLavaLayer: function() {
      var lavaDrawDiv, lavaDrawGroup, lavaDrawSvg;
      lavaDrawDiv = d3.select(document.body).append('div').attr('class', 'lava-vec');
      lavaDrawSvg = lavaDrawDiv.append('svg');
      lavaDrawGroup = lavaDrawSvg.append('g');
      this.lavaLayer = etna.lavaLayer(this.map, lavaDrawSvg, lavaDrawGroup);
      this.lavaLayer.parent = lavaDrawDiv.node();
      return this.map.addLayer(this.lavaLayer);
    },
    initD3Layer: function() {
      var mapDrawDiv, mapDrawGroup, mapDrawSvg;
      mapDrawDiv = d3.select(document.body).append('div').attr('class', 'd3-vec');
      mapDrawSvg = mapDrawDiv.append('svg');
      mapDrawGroup = mapDrawSvg.append('g');
      this.circleLayer = etna.d3layer(this.map, mapDrawSvg, mapDrawGroup);
      this.circleLayer.parent = mapDrawDiv.node();
      return this.map.addLayer(this.circleLayer);
    },
    initEvents: function() {
      var _this = this;
      $("#map").click(function(event) {
        return _this.hideLegend();
      });
      $("#map-legend").delegate(".close-map-legend", "click", function(event) {
        event.preventDefault();
        return _this.toggleLegend();
      });
      $(".open-map-legend").click(function(event) {
        event.preventDefault();
        return _this.toggleLegend();
      });
      $(".home-link").click(function(event) {
        event.preventDefault();
        return _this.resetInitialState();
      });
      return $("#map-regions").delegate(".toggle-legend", "click", function(event) {
        var $elem;
        event.preventDefault();
        if ($(".legend").is(':visible')) {
          $elem = $(event.currentTarget);
          $(".legend").hide();
          $elem.children("i").removeClass("icon-minus-sign");
          return $elem.children("i").addClass("icon-plus-sign");
        } else {
          $elem = $(event.currentTarget);
          $(".legend").show();
          $elem.children("i").removeClass("icon-plus-sign");
          return $elem.children("i").addClass("icon-minus-sign");
        }
      });
    },
    getMap: function() {
      return this.map;
    },
    toggleLegend: function() {
      if (!$("#map-legend").is(":visible")) {
        $("#map-legend").html(this.teaserHtml);
        etna.eruptionsChart.drawBarchart(etna.eruptions);
      }
      $("#map-legend").slideToggle();
      return $("#map-legend-teaser").slideToggle();
    },
    hideLegend: function() {
      if ($("#map-legend").is(":visible")) {
        $("#map-legend").slideUp();
        return $("#map-legend-teaser").slideDown();
      }
    },
    resetInitialState: function() {
      var _this = this;
      return this.map.ease.location({
        lat: 37.734,
        lon: 15.004
      }).zoom(10).optimal(0.9, 1.42, function() {
        $("#map-legend").html(_this.teaserHtml);
        etna.eruptionsChart.drawBarchart(etna.eruptions);
        return _this.toggleLegend();
      });
    },
    showRegion: function(region) {
      var location, zoom;
      location = etna.towns[region].location;
      zoom = 11;
      if (zoom !== this.map.zoom()) {
        regionZoom = true;
      }
      return this.map.ease.location(location).zoom(zoom).optimal();
    }
  };
})();
