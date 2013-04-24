
this.etna = this.etna || {};

this.etna.templates = (function() {
  return {
    townsNavigation: _.template("<h4>Towns around Mount Etna</h4>\n<p>Select a town to get more details and use the eruption selection on the map to see what happened there.</p>\n<ul>\n<% for ( var town in towns ) { %>\n  <li><a href=\"\" class=\"region-link\" data-region=\"<%= town %>\"><%= towns[town].name %></a></li>\n<% } %>\n</ul>"),
    regionTeaser: _.template("<a href=\"\" id=\"back-to-towns\">«&nbsp;Back to all towns</a>\n<div class=\"image\">\n  <img src=\"<%= imageurl %>\" class=\"img-left\" height=\"120\">\n</div>\n<div class=\"town-description\">\n  <h3><%= title %></h3>\n  <i style=\"font-size: 0.8em\">Population (today: <%= population %>)</i>\n  <div id=\"vis\"></div>\n  <p>\n    <%= teaser %>\n  </p>\n</div>"),
    tooltip: _.template("<div class=\"tooltip\">\n  <span><%= town.date %></span>\n  <h4 class=\"tooltip-title\"><%= town.name %></h4>\n</div>")
  };
})();
