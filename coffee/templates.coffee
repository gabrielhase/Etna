@etna = @etna || {}

@etna.templates = do ->

  townsNavigation: _.template(
    """
    <h4>Towns around Mount Etna</h4>
    <p>Select a town to get more details and use the eruption selection on the map to see what happened there.</p>
    <ul>
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
    </div>
    <div class="town-description">
      <h3><%= title %></h3>
      <i style="font-size: 0.8em">Population (today: <%= population %>)</i>
      <div id="vis"></div>
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