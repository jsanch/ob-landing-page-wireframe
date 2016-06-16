$( document ).ready(function() {

function MichiganMap(elementId) {

    this.divId = elementId;
    this.divSelector = '#' + elementId;
    this.tooltip = '';
    this.regionList = d3.select('#regionlist');

    this.initMap = function() {
        var map = this;
        var el = document.getElementById(map.divId);

        // Map Dimensions: 960x1200 (width x height)
        // Use this to scale the map up/down depending on
        // size of map container.
        map.width = el.clientWidth;
        map.height = (900 / 1200) * map.width;

        console.log('Making map size: ' + map.width + 'x' + map.height);

        map.projection = d3.geo.conicConformal();
        map.path = d3.geo.path().projection(map.projection);

        map.svg = d3.select(map.divSelector).append('svg')
            .attr('width', map.width)
            .attr('height', map.height)

        // Group tags for foreground and background. SVG layers things in
        // the order they are drawn.
        map.layer1 = map.svg.append('g');
        map.layer2 = map.svg.append('g');

        map.getCounties().then(function() {
                map.centerMapProjection();
                map.drawCounties();
                map.animateCounties();
                map.addCountyList();
        });
        map.initTooltip();

    };

    this.clear = function() {
        // Clear out the svg data from the foreground and
        // background group elements
        this.layer1.html('');
        this.layer2.html('');
    };
    this.drawALL = function() {
        var map = this;
        map.centerMapProjection();
        map.drawCounties();
        map.animateCounties();
    };

    this.getCounties = function() {
        var deferred = $.Deferred();
        var map = this;
        d3.json('mapdata/michigan.geojson', function(error, response) {
            map.Counties = response;
            deferred.resolve();
        });
        return deferred.promise();
    };
    this.drawCounties = function() {
        var map = this;
        map.layer1.selectAll('path')
            .data(map.Counties.features)
            .enter().append('path')
            .attr('id', function(d, i) {
                return 'county_' + d.properties.geoid;
            })
            .attr('class', 'county')
            .attr({
                'stroke': '#999',
                'stroke-width': 1,
                'd': map.path
            })
            .on('mouseover', map.county_Mouseover)
            .on('click', map.county_OnClick)
            .on('mouseout', map.county_Mouseout)
    };
    this.animateCounties = function() {
        map.layer1.selectAll('path').each(function(d, i) {
            map.animate('#county_' + d.properties.geoid);
        });
    };
    this.centerMapProjection = function(){
        // Since we picked the conicConformal projection, we need to also
        // rotate the map so our map doesn't look funky.
        var centroid = d3.geo.centroid(map.Counties.features[0]);
        var r = [centroid[0] * -1, centroid[1] * -1];
        // Start the projection from defaults (looking at Ohio)
        map.projection.scale(1).translate([0, 0]).rotate(r);

        var b = map.path.bounds(map.Counties),
            s = 0.95 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
            t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];

        map.projection.scale(s).translate(t);
    };
    this.animate = function(selector) {
        // If you want to know more about how this works, check out the
        // css-tricks article at http://css-tricks.com/svg-line-animation-works
        // and then look at http://jakearchibald.com/2013/animated-line-drawing-svg/
        var speed = 1.5; // seconds
        var path = document.querySelector(selector);
        var length = path.getTotalLength();

        path.style.strokeDasharray = length + ' ' + length;
        path.style.strokeDashoffset = length;
        path.style.transition = path.style.WebkitTransition = 'none';

        path.getBoundingClientRect();
        path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + speed + 's ease';
        path.style.strokeDashoffset = '0';
    };

    // MOUSE EVENTS
    this.initTooltip = function () {
      map.tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    };
    this.county_OnClick = function(d,i) {
        console.log(d.properties.name);
        console.log(i);
        s = "Salt Lake County, UT"
      d3.select(".selected-region").classed("selected-region", false);
        d3.select(this).classed("selected-region",true);


      $("#subregion-links .snippet").hide();

      // Populate the show me panel

      d3.select("#subregion-links").selectAll("ul").remove();
        $('#showme-region').hide();
      if (d.properties.name == "Marquette") {
        $('#region-title').text(" County: "+d.properties.name);
        $("#subregion-links .snippet").show();
        $('#showme-region').show();
        d3.select("#region-link1").html(
            "<a href="+ d.properties.revenue_budget_link +
            " target=\"_blank\"> District's Revenue Data </a>");

      } else {
        $('#showme-region').hide();
      }
    };
    this.county_Mouseover = function(d) {
      map.tooltip
            .transition()
            .duration(200)
            .style("opacity",.9);
      map.tooltip
          .html (d.properties.name)
          .style("left", (d3.event.pageX + 28) + "px")
          .style("top", (d3.event.pageY - 28 ) + "px");
    };
    this.county_Mouseout= function(d) {
      map.tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    };
    // County list
    this.addCountyList = function() {
      newlist = [];
      for (var i = map.Counties.features.length - 1; i >= 0; i--) {
        newlist.push(
          map.Counties.features[i].properties.name
          );
      };

      newlist.sort();

      map.regionList.selectAll(".checkbox")
          .data(newlist)
        .enter()
          .append("li")
          // .append("input")
            // .attr("type", "checkbox")
            .attr("id", function(d,i) {return "checkbox" + i; });

      map.regionList.selectAll("li")
          .data(newlist)
          .append("label")
            .attr("for", function(d,i) {return "checkbox" + i; })
            .text(function(d) { return d});
    };
    };

    var map = new MichiganMap('map');
    map.initMap();
});
    $('#showme-region').hide();

d3.json('https://sheetsu.com/apis/0c7f8c07', function(error, response) {
    var myList = response.result;

});


// Builds the HTML Table out of myList json data from Ivy restful service.
 function buildHtmlTable() {
    d3.json('https://sheetsu.com/apis/0c7f8c07', function(error, response) {
    var myList = response.result;
    console.log(myList);

     var columns = addAllColumnHeaders(myList);

     for (var i = 0 ; i < myList.length ; i++) {
         var row$ = $('<tr/>');
         for (var colIndex = 0 ; colIndex < columns.length ; colIndex++) {
             var cellValue = myList[i][columns[colIndex]];

             if (cellValue == null) { cellValue = ""; }

             row$.append($('<td/>').html(cellValue));
         }
         $("#excelDataTable").append(row$);
     }
     });
 }

 // Adds a header row to the table and returns the set of columns.
 // Need to do union of keys from all records as some records may not contain
 // all records
 function addAllColumnHeaders(myList)
 {
     var columnSet = [];
     var headerTr$ = $('<tr/>');

     for (var i = 0 ; i < myList.length ; i++) {
         var rowHash = myList[i];
         for (var key in rowHash) {
             if ($.inArray(key, columnSet) == -1){
                 columnSet.push(key);
                 headerTr$.append($('<th/>').html(key));
             }
         }
     }
     $("#excelDataTable").append(headerTr$);

     return columnSet;
 }