$( document ).ready(function() {

function ColoradoMap(elementId) {

    this.divId = elementId;
    this.divSelector = '#' + elementId;

    this.initMap = function() {


        var map = this;
        var el = document.getElementById(map.divId);

        console.log(el.clientHeight);
        // Colorado Map Dimensions: 960x1200 (width x height)
        // Use this to scale the map up/down depending on
        // size of map container.
        map.height = el.clientHeight;
        map.width = (800 / 1200) * map.height;
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
                    map.drawBOCES();
                    map.animateBOCES();
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
        });
        $('#districts').click(function() {
            map.clear();
            map.drawDistricts();
            map.animateDistricts();
        });


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
              .on('mouseover',function(d) {
                $('#name').text("BOCES: " + d.properties['Name']);
              })
              .on('click', map.BOCES_OnClick)
        
        var text = map.layer2.selectAll("text")
              .data(map.BOCESPoints.features)
              .enter()
              .append("text")
              .attr("x", function(d) {
                return map.projection([d.properties['LONGITUDE'],d.properties['LATITUDE'] ])[0]; })
              .attr("y", function (d) {
                return map.projection([d.properties['LONGITUDE'],d.properties['LATITUDE'] ])[1]; })
              .text( function(d) { return d.properties['Name']; })
              .attr("class", "BOCES-name")

      map.arrangeLabels();
   

    //    var modals = d3.select('body').selectAll("div")
    //           .data(map.BOCESPoints.features)
    //           .enter()
    //           .append("div")
    //           .attr("id", function (d) { return d.properties['Zip'];})
    //           .attr("class", "modal")
    //           .append("p").text("RANDOm");

    // var modals_activators = d3.select('body').selectAll("a")
    //           .data(map.BOCESPoints.features)
    //           .enter()
    //           .append("a")
    //           .attr("id", "go")
    //           .attr("rel", "leanModal")
    //           .attr("name", "test")
    //           .attr("href", function (d) { return "#" + d.properties['Zip']; })
    //           .text("a");


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
            .on('mouseover', function(d) {
              $('#name').text("School District: " + d.properties['NAME']);
            })
            .on('click', map.district_OnClick)
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
        var speed = 2.5; // seconds
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
    }

    this.BOCES_OnClick = function(d) {
      console.log(d);
      $('#80731').click();
    }
    this.district_OnClick = function(d) {
      console.log("Schools: " + d.properties.schools);
    }

}; // ColoradoMap

    var map = new ColoradoMap('map');
    map.initMap(); 
    console.log("eh, why");

});
