$(document).ready(function(){function t(t){this.divId=t,this.divSelector="#"+t,this.tooltip="",this.initMap=function(){var t=this,e=document.getElementById(t.divId);t.width=e.clientWidth,t.height=700/1200*t.width,console.log("Making map size: "+t.width+"x"+t.height),t.projection=d3.geo.conicConformal(),t.path=d3.geo.path().projection(t.projection),t.svg=d3.select(t.divSelector).append("svg").attr("width",t.width).attr("height",t.height),t.layer1=t.svg.append("g"),t.layer2=t.svg.append("g"),t.getRSA().then(function(){t.getDistricts().then(function(){t.getBOCESPoints().then(function(){t.centerMapProjection(),t.drawDistricts(),t.animateDistricts(),t.addDistrictList()})})}),$("#all").click(function(){t.clear(),t.drawALL()}),$("#BOCES").click(function(){t.clear(),t.drawBOCES(),t.animateBOCES(),d3.select(".active").classed("active",!1),d3.select(this).classed("active",!0),d3.select("#ListName").text("List Of BOCES"),d3.select("#RegionName").text("BOCES")}),$("#districts").click(function(){t.clear(),t.drawDistricts(),t.animateDistricts(),d3.select(".active").classed("active",!1),d3.select(this).classed("active",!0),d3.select("#ListName").text("Districts"),d3.select("#RegionName").text("BOCES")}),t.initTooltip()},this.clear=function(){this.layer1.html(""),this.layer2.html("")},this.drawALL=function(){var t=this;t.centerMapProjection(),t.drawDistricts(),t.animateDistricts(),setTimeout(function(){t.drawBOCES(),t.animateBOCES()},3e3)},this.getRSA=function(){var t=$.Deferred(),e=this;return d3.json("mapdata/BOCES.json",function(i,s){e.RSA=s,t.resolve()}),t.promise()},this.getBOCESPoints=function(){var t=$.Deferred(),e=this;return d3.json("mapdata/CoBOCES_goecoded.geojson",function(i,s){e.BOCESPoints=s,t.resolve()}),t.promise()},this.drawBOCES=function(){var t=this,e=t.layer2.selectAll("path").data(t.RSA.features).enter().append("path").attr("id",function(t,e){return"BOCES_"+t.properties.OBJECTID}).attr("class","RSA").attr({stroke:"#999","stroke-width":3,d:t.path}),i=t.layer2.selectAll("circle").data(t.BOCESPoints.features).enter().append("circle").attr("cx",function(e){return-5+t.projection([e.properties.LONGITUDE,e.properties.LATITUDE])[0]}).attr("cy",function(e){return-8+t.projection([e.properties.LONGITUDE,e.properties.LATITUDE])[1]}).attr("r","10px").attr("class","BOCES").on("mouseover",t.BOCES_Mouseover).on("click",t.BOCES_OnClick)},this.animateBOCES=function(){e.layer2.selectAll("path").each(function(t,i){e.animate("#BOCES_"+t.properties.OBJECTID)})},this.getDistricts=function(){var t=$.Deferred(),e=this;return d3.json("mapdata/CoSchoolDistricts.json",function(i,s){e.Districts=s,t.resolve()}),t.promise()},this.drawDistricts=function(){var t=this;t.layer1.selectAll("path").data(t.Districts.features).enter().append("path").attr("id",function(t,e){return"district_"+t.properties.OBJECTID}).attr("class","district").attr({stroke:"#999","stroke-width":1,d:t.path}).on("mouseover",t.district_Mouseover).on("click",t.district_OnClick).on("mouseout",t.district_Mouseout)},this.animateDistricts=function(){e.layer1.selectAll("path").each(function(t,i){e.animate("#district_"+t.properties.OBJECTID)})},this.centerMapProjection=function(){var t=d3.geo.centroid(e.RSA.features[0]),i=[-1*t[0],-1*t[1]];e.projection.scale(1).translate([0,0]).rotate(i);var s=e.path.bounds(e.RSA),n=.95/Math.max((s[1][0]-s[0][0])/e.width,(s[1][1]-s[0][1])/e.height),r=[(e.width-n*(s[1][0]+s[0][0]))/2,(e.height-n*(s[1][1]+s[0][1]))/2];e.projection.scale(n).translate(r)},this.animate=function(t){var e=3.5,i=document.querySelector(t),s=i.getTotalLength();i.style.strokeDasharray=s+" "+s,i.style.strokeDashoffset=s,i.style.transition=i.style.WebkitTransition="none",i.getBoundingClientRect(),i.style.transition=i.style.WebkitTransition="stroke-dashoffset "+e+"s ease",i.style.strokeDashoffset="0"},this.arrangeLabels=function(){for(var t=this,e=1;e>0;)e=0,t.layer2.selectAll(".BOCES-name").each(function(){var i=this,s=this.getBoundingClientRect();t.layer2.selectAll(".BOCES-name").each(function(){if(this!=i){var t=this.getBoundingClientRect();if(2*Math.abs(s.left-t.left)<s.width+t.width&&2*Math.abs(s.top-t.top)<s.height+t.height){var n=.01*(Math.max(0,s.right-t.left)+Math.min(0,s.left-t.right)),r=.08*(Math.max(0,s.bottom-t.top)+Math.min(0,s.top-t.bottom)),a=d3.transform(d3.select(this).attr("transform")),o=d3.transform(d3.select(i).attr("transform"));e+=Math.abs(n)+Math.abs(r),o.translate=[o.translate[0]+n,o.translate[1]+r],a.translate=[a.translate[0]-n,a.translate[1]-r],d3.select(this).attr("transform","translate("+a.translate+")"),d3.select(i).attr("transform","translate("+o.translate+")"),s=this.getBoundingClientRect()}}})})},this.initTooltip=function(){e.tooltip=d3.select("body").append("div").attr("class","tooltip").style("opacity",0)},this.BOCES_OnClick=function(t,e){$("#region-title-click").text("BOCES: "+t.properties.Name),$("#showme-region").show(),d3.select(".selected-region").classed("selected-region",!1),d3.select(this).classed("selected-region",!0)},this.BOCES_Mouseover=function(t){e.tooltip.transition().duration(200).style("opacity",.9),e.tooltip.html(t.properties.Name).style("left",d3.event.pageX+28+"px").style("top",d3.event.pageY-28+"px")},this.BOCES_Mouseout=function(t){e.tooltip.transition().duration(500).style("opacity",0)},this.district_OnClick=function(t,e){$("#region-title-click").text("School District: "+t.properties.NAME),$("#showme-region").show(),d3.select(".selected-region").classed("selected-region",!1),d3.select(this).classed("selected-region",!0)},this.district_Mouseover=function(t){e.tooltip.transition().duration(200).style("opacity",.9),e.tooltip.html(t.properties.NAME).style("left",d3.event.pageX+28+"px").style("top",d3.event.pageY-28+"px")},this.district_Mouseout=function(t){e.tooltip.transition().duration(500).style("opacity",0)},this.addDistrictList=function(){console.log(e.Districts.features);var t=d3.select("#regionlist");newlist=[];for(var i=e.Districts.features.length-1;i>=0;i--)newlist.push(e.Districts.features[i].properties.NAME);newlist.sort(),t.selectAll(".checkbox").data(newlist).enter().append("li").append("input").attr("type","checkbox").attr("id",function(t,e){return"checkbox"+e}),t.selectAll("li").data(newlist).append("label").attr("for",function(t,e){return"checkbox"+e}).text(function(t){return t})}}var e=new t("map");e.initMap()});