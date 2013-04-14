@etna = @etna || {}

@etna.templates = do ->

  townsNavigation: _.template(
    """
    <ul><span>Towns:</span>
    <% for ( var town in towns ) { %>
      <li><a href="" class="region-link" data-region="<%= town %>"><%= towns[town].name %></a></li>
    <% } %>
    </ul>
    """
  )

  regionTeaser: _.template(
    """
    <a href="" id="back-to-towns">«&nbsp;Back to all towns</a>
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