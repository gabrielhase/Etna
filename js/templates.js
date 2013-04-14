
this.etna = this.etna || {};

this.etna.templates = (function() {
  return {
    townsNavigation: _.template("<ul><span>Towns:</span>\n<% for ( var town in towns ) { %>\n  <li><a href=\"\" class=\"region-link\" data-region=\"<%= town %>\"><%= towns[town].name %></a></li>\n<% } %>\n</ul>"),
    regionTeaser: _.template("<a href=\"\" id=\"back-to-towns\">«&nbsp;Back to all towns</a>\n<div class=\"image\">\n  <img src=\"<%= imageurl %>\" class=\"img-left\" height=\"120\">\n  <i>Population: <%= population %></i>\n</div>\n<div class=\"map-legend-left\">\n  <h3><%= title %></h3>\n  <p>\n    <%= teaser %>\n  </p>\n</div>"),
    tooltip: _.template("<div class=\"tooltip\">\n  <span><%= town.date %></span>\n  <h4 class=\"tooltip-title\"><%= town.name %></h4>\n</div>")
  };
})();
