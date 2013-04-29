**Project**

This data story was developed as final project for the course CS171 at Harvard.

All code is Open-Source an available on: https://github.com/gabrielhase/Etna

**Structure**

The relevant code for the grading are in the folders:
  - js
  - js-sebastian
  - data
  - css
  - img
  - etna-screencast.m4v
  - index.html
  - scrapers

These folders/files are sufficient to run the code locally using the simple python server as described in the project spec. Since I (Gabriel) worked with coffeescript we separated the javascript into the two folders js and js-sebastian in order to make sure that no javascript files are accidentally overwritten by the coffeescript compiler.

The whole map part of the visualization is written in coffeescript. If you want to see the respective source refer to the folder "coffee". At the end of this readme I am describing my pipeline setup for coffeescript development with Guard. This is of course optional, you can use whatever compilation method  you like.

**Running**

To run the website a simple python server has to be started at the root of this project like this:

```
python -m SimpleHTTPServer 8888
```

After this the page is available at: http://localhost:8888

**Data**

The data was retrieved by scrapers. The scrapers can be found in the subfolder 'scrapers'. For information on how the scrapers work refer to the process book or directly to the code.

The data for the map visualization is in external json files in the 'data' folder(thus the need for the simple python server).

**Code**

index.html is the only HTML file containing all visualizations and the story.

External libraries are placed in the folder 'js/vendor'

All modules are namespaced under the name etna in order to only have one injection in the global namespace. The map.js file contains the basic map setup functionality through the etna.map.init method. The towns.js file contains the code that generates the towns explorer in the right hand side of the visualization. vega-line-chart.js is a template for the line chart that is drawn on every towns detail page (the data is injected at runtime). eruptions.js contains the code to draw the barchart with the eruptions history and the brushing capability. d3layer.js contains the code to draw an svg layer with circles representing the plume area over the map. lavaLayer.js contains the code to draw an svg layer with paths for the lava flows at different eruptions. templates.js contains underscore templates that are used in various places.

The folder js-sebastian contains the code for the twitter visualization. Tweets.js contains all tweets and sentiment.js the code for the visualization.

**Deployment**

Deployment of the app works over heroku and a local git repository. To host the page on heroku I implemented a little node.js server that does nothing else than just serve static files. The setup for the heroku drone is in Procfile.

NOTE: In order to run the code locally none of this is needed! (just see the description above for running locally)

The visualization CAN NOT be hosted on GDrive. I've written about this on Piazza and agreed with Alex to provide a redirect page for the classes GDrive that redirects to the app on heroku.
The problem is that GDrive only runs over https. The tiles that the map uses are fetched over http though. The security policies of the browser do not allow a page that is hosted on https to fetch data from a non-ssl source. It would work if one were to turn off the security policies, but this is really ugly. Since data visualizations are prone to use external web services I think it isn't a good idea for this course to use GDrive (or any other service that only supports https). The setup with heroku for example is really easy and also free.

As a sidenote: The map service I am using (mapbox.com) has a private beta program for ssl API calls. The cost is though min. $150/month and one has to apply for the program. I didn't bother with this.

**Guard**

To use guard for coffee compilation you need ruby and bundler installed.
To guard coffee and scss files, run:

```
bundle install
```

and then:

```
bundle exec guard
```

which will automatically compile coffee script to js.