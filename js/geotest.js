$( document ).ready(function() {

function ColoradoMap(elementId) {

    this.divId = elementId;
    this.divSelector = '#' + elementId;
    this.tooltip = '';
    this.regionList = d3.select('#regionlist');

    this.initMap = function() {
        var map = this;
        var el = document.getElementById(map.divId);

        // Colorado Map Dimensions: 960x1200 (width x height)
        // Use this to scale the map up/down depending on
        // size of map container.
        map.width = el.clientWidth;
        map.height = (900 / 1200) * map.width;
        // map.height = el.clientHeight * map.width;

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

        map.getRSA().then(function() {
            map.getDistricts().then(function() {
                map.getBOCESPoints().then(function(){
                    map.centerMapProjection();

                    map.drawDistricts();
                    map.animateDistricts();

                    map.addDistrictList();

                   // $("#checkbox158").click(function() {
                   //    d3.select(".selected-region").classed("selected-region", false);
                   //    d3.select("#district_70").classed("selected-region",true);

                   //    $("#subregion-links .snippet").hide();
                   //    // Populate the show me panel
                   //    $('#region-title').text("School District: Thunder Mountain");
                   //    d3.select("#subregion-links").selectAll("ul").remove();

                   //    $("#subregion-links .snippet").show();
                   //    var schools = ["Falmouth School","Harker School","Menlo School","Pittsfield School","Thunder Mountain School District","West Colorado School"];
                   //    d3.select("#subregion-links")
                   //      .append("ul").selectAll("li")
                   //     .data(schools)
                   //    .enter()
                   //      .append("li")
                   //      .text(function (d) {return d;})
                   //    d3.select("#region-link1").html("<a href=\"http://finance.cdefinancialtransparency.com/#!/year/default/revenue/0/district_name/Thunder+Mountain/0/loc_title\" target=\"_blank\"> District's Revenue Data </a>");
                   //    d3.select("#region-link2").html("<a href=\"http://finance.cdefinancialtransparency.com/#!/year/default/operating/0/district_name/Thunder+Mountain/0/loc_title\" target=\"_blank\">  District's Expenditure Data</a>");
                   //    d3.select("#region-link3").html("<a href=\"http://dev.munetrix.com/sections/charts_sd/chhowallocates.php?AnnualDataID=25094&Orientation=Function&FundCode=1\" target=\"_blank\"> How Thunder Mountain Compares to the Regional Average Expenditure </a>");
                   //      $('#showme-region').show();
                   //  });
                });
            });
        });

        $('#BOCES').click(function() {
            map.clear();
            map.drawBOCES();
            map.animateBOCES();

            d3.select(".active").classed("active", false);
            d3.select(this).classed("active",true);

            d3.select("#ListName").text("List Of BOCES");
            d3.select("#RegionName").text("BOCES");

            map.regionList.selectAll("li").remove();
            map.addBOCESList();

              $('#showme-region').hide();
                    $("#subregion-links .snippet").hide();
        });
        $('#districts').click(function() {
            map.clear();
            map.drawDistricts();
            map.animateDistricts();
            d3.select(".active").classed("active", false);
            d3.select(this).classed("active",true);

            d3.select("#ListName").text("List of Districts");
            d3.select("#RegionName").text("Districts");

            // Remove previous list, add new one.
            map.regionList.selectAll("li").remove();
            map.addDistrictList();

              $('#showme-region').hide();
                    $("#subregion-links .snippet").hide();
        });
        $('#showme-region').hide();
        map.initTooltip();

    }; // initMap
    this.clear = function() {
        // Clear out the svg data from the foreground and
        // background group elements
        this.layer1.html('');
        this.layer2.html('');
    };
    this.drawALL = function() {
        var map = this;
        map.centerMapProjection();

        map.drawDistricts();
        map.animateDistricts();

        setTimeout(function (){
            map.drawBOCES();
            map.animateBOCES();
        }, 3000);
    };
    this.getRSA = function() {
        var deferred = $.Deferred();
        var map = this;
        d3.json('mapdata/BOCES.json', function(error, response) {
            map.RSA = response;
            deferred.resolve();
        });
        return deferred.promise();
    };
    this.getBOCESPoints = function () {
        var deferred = $.Deferred();
        var map = this;
        d3.json('mapdata/michigan4.geojson', function(error, response) {
            map.BOCESPoints = response;
            deferred.resolve();
        });
        return deferred.promise();
    };
    this.drawBOCES = function() {
        var map = this;
        var rsa =  map.layer2.selectAll('path')
              .data(map.RSA.features)
              .enter().append('path')
              .attr('id', function(d, i) {
                  return 'BOCES_' + d.properties['OBJECTID'];
              })
              .attr('class','RSA')
              .attr({
                  'stroke': '#999',
                  'stroke-width': 3,
                  'd': map.path
              })
        var circle = map.layer2.selectAll('circle')
              .data(map.BOCESPoints.features)
              .enter()
              .append('circle')
              .attr("cx", function(d) {
                return -5 + map.projection([d.properties['LONGITUDE'],d.properties['LATITUDE'] ])[0]; })
              .attr("cy", function (d) {
                return -8 + map.projection([d.properties['LONGITUDE'],d.properties['LATITUDE'] ])[1]; })
              .attr("r", "10px")
              .attr('class','BOCES')
              .on('mouseover',map.BOCES_Mouseover)
              .on('click', map.BOCES_OnClick)
    };
    this.animateBOCES = function() {
        map.layer2.selectAll('path').each(function(d, i) {
            map.animate('#BOCES_' + d.properties['OBJECTID']);
        });
    };
    this.getDistricts = function() {
        var deferred = $.Deferred();
        var map = this;
        d3.json('mapdata/michigan4.geojson', function(error, response) {
            map.Districts = response;
            deferred.resolve();
        });
        return deferred.promise();
    };
    this.drawDistricts = function() {
        var map = this;

        map.layer1.selectAll('path')
            .data(map.Districts.features)
            .enter().append('path')
            .attr('id', function(d, i) {
                return 'district_' + d.properties.geoid;
            })
            .attr('class', 'district')
            .attr({
                'stroke': '#999',
                'stroke-width': 1,
                'd': map.path
            })
            .on('mouseover', map.district_Mouseover)
            .on('click', map.district_OnClick)
            .on('mouseout', map.district_Mouseout)
    };
    this.animateDistricts = function() {
        map.layer1.selectAll('path').each(function(d, i) {
            map.animate('#district_' + d.properties.geoid);
        });
    };
    this.centerMapProjection = function(){
        // Since we picked the conicConformal projection, we need to also
        // rotate the map so our map doesn't look funky.
        var centroid = d3.geo.centroid(map.Districts.features[0]);
        var r = [centroid[0] * -1, centroid[1] * -1];
        // Start the projection from defaults (looking at Ohio)
        map.projection.scale(1).translate([0, 0]).rotate(r);

        var b = map.path.bounds(map.Districts),
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
    this.arrangeLabels = function() {
      var map  = this;
      var move = 1;
      while(move > 0) {
        move = 0;
        map.layer2.selectAll(".BOCES-name")
           .each(function() {
             var that = this,
                 a = this.getBoundingClientRect();
             map.layer2.selectAll(".BOCES-name")
                .each(function() {
                  if(this != that) {
                    var b = this.getBoundingClientRect();
                    if((Math.abs(a.left - b.left) * 2 < (a.width + b.width)) &&
                       (Math.abs(a.top - b.top) * 2 < (a.height + b.height))) {
                      // overlap, move labels
                      var dx = (Math.max(0, a.right - b.left) +
                               Math.min(0, a.left - b.right)) * 0.01,
                          dy = (Math.max(0, a.bottom - b.top) +
                               Math.min(0, a.top - b.bottom)) * 0.08,
                          tt = d3.transform(d3.select(this).attr("transform")),
                          to = d3.transform(d3.select(that).attr("transform"));
                      move += Math.abs(dx) + Math.abs(dy);

                      to.translate = [ to.translate[0] + dx, to.translate[1] + dy ];
                      tt.translate = [ tt.translate[0] - dx, tt.translate[1] - dy ];
                      d3.select(this).attr("transform", "translate(" + tt.translate + ")");
                      d3.select(that).attr("transform", "translate(" + to.translate + ")");
                      a = this.getBoundingClientRect();
                    }
                  }
                });
           });
      }
    };
    // MOUSE EVENTS
    this.initTooltip = function () {
      map.tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    };
    this.BOCES_OnClick = function(d,i) {
        d3.select("#subregion-links").selectAll("ul").remove();
        $('#region-title').text("BOCES: "+d.properties.name);
        $('#showme-region').hide();
        d3.select(".selected-region").classed("selected-region", false);
        d3.select(this).classed("selected-region",true);
    };
    this.BOCES_Mouseover = function(d) {
      map.tooltip
            .transition()
            .duration(200)
            .style("opacity",.9);
      map.tooltip
          .html (d.properties.name)
          .style("left", (d3.event.pageX + 28) + "px")
          .style("top", (d3.event.pageY - 28 ) + "px");
    };
    this.BOCES_Mouseout= function(d) {
      map.tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    };
    this.district_OnClick = function(d,i) {
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

      // if (d.properties.name == undefined) {
      //   console.log( "No school data");
      //    $('#showme-region').hide();

      // } else {

        // $("#subregion-links .snippet").show();
        // d3.select("#subregion-links")
        //   .append("ul").selectAll("li")
        //  .data(d.properties.schools.sort())
        // .enter()
        //   .append("li")
        //   .text(function (d) {return d;})

        // d3.select("#region-link1").html("<a href="+ d.properties.revenue_budget_link +
        //             " target=\"_blank\"> District's Revenue Data </a>");
        // d3.select("#region-link2").html("<a href="+ d.properties.expenditure_budget_link +
        //            " target=\"_blank\">  District's Expenditure Data</a>");
        // d3.select("#region-link3").html("<a href="+ d.properties.expenditure_munetrix_link +
        //            " target=\"_blank\"> How " + d.properties.name + " Compares to the Regional Average Expenditure </a>");

      //     $('#showme-region').show();
      // }
    };
    this.district_Mouseover = function(d) {
      map.tooltip
            .transition()
            .duration(200)
            .style("opacity",.9);
      map.tooltip
          .html (d.properties.name)
          .style("left", (d3.event.pageX + 28) + "px")
          .style("top", (d3.event.pageY - 28 ) + "px");
    };
    this.district_Mouseout= function(d) {
      map.tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    };
    // District / BOSE / School List
    this.addDistrictList = function() {
      newlist = [];
      for (var i = map.Districts.features.length - 1; i >= 0; i--) {
        newlist.push(
          map.Districts.features[i].properties.name
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
    this.addBOCESList = function() {
      newlist = [];
      for (var i = map.BOCESPoints.features.length - 1; i >= 0; i--) {
        newlist.push(
          map.BOCESPoints.features[i].properties["Name"]
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
}; // ColoradoMap
    var map = new ColoradoMap('map');
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