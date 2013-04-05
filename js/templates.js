
this.etna = this.etna || {};

this.etna.templates = (function() {
  return {
    townsNavigation: _.template("<ul><span style=\"margin-left: 10px\">Towns:</span>\n<% for ( var town in towns ) { %>\n  <li><a href=\"\" class=\"region-link\" data-region=\"<%= town %>\"><%= towns[town].name %></a></li>\n<% } %>\n</ul>\n<hr>\n<ul class=\"legend\">\n  <li><img src=\"img/plume_icon.png\" width=\"15\" height=\"15\" /> <span>Plume Area</span></li>\n  <li><img src=\"img/explosion_icon.png\" width=\"15\" height=\"15\" /> <span>Explosion</span></li>\n  <li><img src=\"img/ash_icon.png\" width=\"15\" height=\"15\" /> <span>Ashfall</span></li>\n</ul>"),
    regionTeaser: _.template("<div class=\"image\">\n  <img src=\"<%= imageurl %>\" class=\"img-left\" height=\"120\">\n  <i>Population: <%= population %></i>\n</div>\n<div class=\"map-legend-left\">\n  <h3><%= title %></h3>\n  <p>\n    <%= teaser %>\n  </p>\n</div>\n<a class=\"close-map-legend legend-close-link\" href=\"\">x</a>"),
    tooltip: _.template("<div class=\"tooltip\">\n  <span><%= town.date %></span>\n  <h4 class=\"tooltip-title\"><%= town.name %></h4>\n</div>")
  };
})();
