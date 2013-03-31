@etna = @etna || {}

@etna.templates = do ->
  
  townsNavigation: _.template(
    """
    <ul><span style="margin-left: 10px">Towns:</span>
    <% for ( var town in towns ) { %>
      <li><a href="" class="region-link" data-region="<%= town %>"><%= towns[town].name %></a></li>
    <% } %>
    </ul>
    """
  )

  regionTeaser: _.template(
    """
    <div class="image">
      <img src="<%= imageurl %>" class="img-left" height="120">
      <i>Population: <%= population %></i>
    </div>
    <div class="map-legend-left">
      <h3><%= title %></h3>
      <p>
        <%= teaser %>
      </p>
    </div>
    <a class="close-map-legend legend-close-link" href="">x</a>
    """
  )
  
  tooltip: _.template(
    """
    <div class="tooltip">
      <span><%= town.date %></span>
      <h4 class="tooltip-title"><%= town.name %></h4> 
    </div>  
    """
  )