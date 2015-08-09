$( document ).ready(function() {

function ColoradoMap(elementId) {

    this.divId = elementId;
    this.divSelector = '#' + elementId;
    this.tooltip = ''

    this.initMap = function() {


        var map = this;
        var el = document.getElementById(map.divId);

        // Colorado Map Dimensions: 960x1200 (width x height)
        // Use this to scale the map up/down depending on
        // size of map container.
        map.width = el.clientWidth;
        map.height = (700 / 1200) * map.width;

        // map.height = el.clientHeight;
        // map.width = (800 / 1200) * map.height;
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
                });
            });
        });

        $('#all').click(function() {
            map.clear();
            map.drawALL();
        });
        $('#BOCES').click(function() {
            map.clear();
            map.drawBOCES();
            map.animateBOCES();

            d3.select(".active").classed("active", false);
            d3.select(this).classed("active",true);

            d3.select("#ListName").text("List Of BOCES");
            d3.select("#RegionName").text("BOCES");


        });
        $('#districts').click(function() {
            map.clear();
            map.drawDistricts();
            map.animateDistricts();
            d3.select(".active").classed("active", false);
            d3.select(this).classed("active",true);

            d3.select("#ListName").text("Districts");
            d3.select("#RegionName").text("BOCES");

        });

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
        d3.json('mapdata/CoBOCES_goecoded.geojson', function(error, response) {
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
          //   var labeles = map.layer2.selectAll("text")
          //         .data(map.BOCESPoints.features)
          //         .enter()
          //         .append("text")
          //         .attr("x", function(d) {
          //           return map.projection([d.properties['LONGITUDE'],d.properties['LATITUDE'] ])[0]; })
          //         .attr("y", function (d) {
          //           return map.projection([d.properties['LONGITUDE'],d.properties['LATITUDE'] ])[1]; })
          //         .text( function(d) { return d.properties['Name']; })
          //         .attr("class", "BOCES-name")

          // map.arrangeLabels();
    };

    this.animateBOCES = function() {
        map.layer2.selectAll('path').each(function(d, i) {
            map.animate('#BOCES_' + d.properties['OBJECTID']);
        });
    };

    this.getDistricts = function() {
        var deferred = $.Deferred();
        var map = this;
        d3.json('mapdata/CoSchoolDistricts.json', function(error, response) {
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
                return 'district_' + d.properties['OBJECTID'];
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
            map.animate('#district_' + d.properties['OBJECTID']);
        });
    };
    this.centerMapProjection = function(){
        // Since we picked the conicConformal projection, we need to also
        // rotate the map so our map doesn't look funky.
        var centroid = d3.geo.centroid(map.RSA.features[0]);
        var r = [centroid[0] * -1, centroid[1] * -1];
        // Start the projection from defaults (looking at Ohio)
        map.projection.scale(1).translate([0, 0]).rotate(r);

        var b = map.path.bounds(map.RSA),
            s = 0.95 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
            t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];

        map.projection.scale(s).translate(t);
    };
    this.animate = function(selector) {
        // If you want to know more about how this works, check out the
        // css-tricks article at http://css-tricks.com/svg-line-animation-works
        // and then look at http://jakearchibald.com/2013/animated-line-drawing-svg/
        var speed = 3.5; // seconds
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
      $('#region-title-click').text("BOCES: "+d.properties['Name']);
      $('#showme-region').show();
      d3.select(".selected-region").classed("selected-region", false);
      d3.select(this).classed("selected-region",true);      
    };
    this.BOCES_Mouseover = function(d) {
      map.tooltip
            .transition()
            .duration(200)
            .style("opacity",.9);
      map.tooltip
          .html (d.properties['Name'])
          .style("left", (d3.event.pageX + 28) + "px")
          .style("top", (d3.event.pageY - 28 ) + "px");
    };
    this.BOCES_Mouseout= function(d) {
      map.tooltip.transition()        
            .duration(500)      
            .style("opacity", 0);   
    };
    this.district_OnClick = function(d,i) {
      $('#region-title-click').text("School District: "+d.properties['NAME']);
      $('#showme-region').show();
      d3.select(".selected-region").classed("selected-region", false);
      d3.select(this).classed("selected-region",true);      
    };
    this.district_Mouseover = function(d) {
      map.tooltip
            .transition()
            .duration(200)
            .style("opacity",.9);
      map.tooltip
          .html (d.properties['NAME'])
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
      console.log(map.Districts.features);
      var list = d3.select('#regionlist');

      newlist = [];
      for (var i = map.Districts.features.length - 1; i >= 0; i--) {
        newlist.push(
          map.Districts.features[i].properties["NAME"]
          );
      };

      newlist.sort();

      list.selectAll(".checkbox")
          .data(newlist)
        .enter()
          .append("li")
          // .append("div").attr("class","checkbox")
          .append("input")
            .attr("type", "checkbox")
            .attr("id", function(d,i) {return "checkbox" + i; });
      
      list.selectAll("li")
          .data(newlist)
          .append("label")
            .attr("for", function(d,i) {return "checkbox" + i; })
            .text(function(d) { return d});


    }
    


}; // ColoradoMap

    var map = new ColoradoMap('map');
    map.initMap(); 

});
