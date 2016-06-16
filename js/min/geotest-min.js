function buildHtmlTable(){d3.json("https://sheetsu.com/apis/0c7f8c07",function(t,e){var n=e.result;console.log(n);for(var i=addAllColumnHeaders(n),o=0;o<n.length;o++){for(var s=$("<tr/>"),a=0;a<i.length;a++){var r=n[o][i[a]];null==r&&(r=""),s.append($("<td/>").html(r))}$("#excelDataTable").append(s)}})}function addAllColumnHeaders(t){for(var e=[],n=$("<tr/>"),i=0;i<t.length;i++){var o=t[i];for(var s in o)-1==$.inArray(s,e)&&(e.push(s),n.append($("<th/>").html(s)))}return $("#excelDataTable").append(n),e}$(document).ready(function(){function t(t){this.divId=t,this.divSelector="#"+t,this.tooltip="",this.regionList=d3.select("#regionlist"),this.initMap=function(){var t=this,e=document.getElementById(t.divId);t.width=e.clientWidth,t.height=.75*t.width,console.log("Making map size: "+t.width+"x"+t.height),t.projection=d3.geo.conicConformal(),t.path=d3.geo.path().projection(t.projection),t.svg=d3.select(t.divSelector).append("svg").attr("width",t.width).attr("height",t.height),t.layer1=t.svg.append("g"),t.layer2=t.svg.append("g"),t.getCounties().then(function(){t.centerMapProjection(),t.drawCounties(),t.animateCounties(),t.addDistrictList()})},this.clear=function(){this.layer1.html(""),this.layer2.html("")},this.drawALL=function(){var t=this;t.centerMapProjection(),t.drawCounties(),t.animateCounties()},this.getCounties=function(){var t=$.Deferred(),e=this;return d3.json("mapdata/michigan4.geojson",function(n,i){e.Counties=i,t.resolve()}),t.promise()},this.drawCounties=function(){var t=this;t.layer1.selectAll("path").data(t.Counties.features).enter().append("path").attr("id",function(t,e){return"county_"+t.properties.geoid}).attr("class","county").attr({stroke:"#999","stroke-width":1,d:t.path}).on("mouseover",t.county_Mouseover).on("click",t.county_OnClick).on("mouseout",t.county_Mouseout)},this.animateCounties=function(){e.layer1.selectAll("path").each(function(t,n){e.animate("#county_"+t.properties.geoid)})},this.centerMapProjection=function(){var t=d3.geo.centroid(e.Counties.features[0]),n=[-1*t[0],-1*t[1]];e.projection.scale(1).translate([0,0]).rotate(n);var i=e.path.bounds(e.Counties),o=.95/Math.max((i[1][0]-i[0][0])/e.width,(i[1][1]-i[0][1])/e.height),s=[(e.width-o*(i[1][0]+i[0][0]))/2,(e.height-o*(i[1][1]+i[0][1]))/2];e.projection.scale(o).translate(s)},this.animate=function(t){var e=1.5,n=document.querySelector(t),i=n.getTotalLength();n.style.strokeDasharray=i+" "+i,n.style.strokeDashoffset=i,n.style.transition=n.style.WebkitTransition="none",n.getBoundingClientRect(),n.style.transition=n.style.WebkitTransition="stroke-dashoffset "+e+"s ease",n.style.strokeDashoffset="0"},this.arrangeLabels=function(){for(var t=this,e=1;e>0;)e=0,t.layer2.selectAll(".BOCES-name").each(function(){var n=this,i=this.getBoundingClientRect();t.layer2.selectAll(".BOCES-name").each(function(){if(this!=n){var t=this.getBoundingClientRect();if(2*Math.abs(i.left-t.left)<i.width+t.width&&2*Math.abs(i.top-t.top)<i.height+t.height){var o=.01*(Math.max(0,i.right-t.left)+Math.min(0,i.left-t.right)),s=.08*(Math.max(0,i.bottom-t.top)+Math.min(0,i.top-t.bottom)),a=d3.transform(d3.select(this).attr("transform")),r=d3.transform(d3.select(n).attr("transform"));e+=Math.abs(o)+Math.abs(s),r.translate=[r.translate[0]+o,r.translate[1]+s],a.translate=[a.translate[0]-o,a.translate[1]-s],d3.select(this).attr("transform","translate("+a.translate+")"),d3.select(n).attr("transform","translate("+r.translate+")"),i=this.getBoundingClientRect()}}})})},this.initTooltip=function(){e.tooltip=d3.select("body").append("div").attr("class","tooltip").style("opacity",0)},this.BOCES_OnClick=function(t,e){d3.select("#subregion-links").selectAll("ul").remove(),$("#region-title").text("BOCES: "+t.properties.name),$("#showme-region").hide(),d3.select(".selected-region").classed("selected-region",!1),d3.select(this).classed("selected-region",!0)},this.BOCES_Mouseover=function(t){e.tooltip.transition().duration(200).style("opacity",.9),e.tooltip.html(t.properties.name).style("left",d3.event.pageX+28+"px").style("top",d3.event.pageY-28+"px")},this.BOCES_Mouseout=function(t){e.tooltip.transition().duration(500).style("opacity",0)},this.county_OnClick=function(t,e){console.log(t.properties.name),console.log(e),s="Salt Lake County, UT",d3.select(".selected-region").classed("selected-region",!1),d3.select(this).classed("selected-region",!0),$("#subregion-links .snippet").hide(),d3.select("#subregion-links").selectAll("ul").remove(),$("#showme-region").hide(),"Marquette"==t.properties.name?($("#region-title").text(" County: "+t.properties.name),$("#subregion-links .snippet").show(),$("#showme-region").show(),d3.select("#region-link1").html("<a href="+t.properties.revenue_budget_link+' target="_blank"> District\'s Revenue Data </a>')):$("#showme-region").hide()},this.county_Mouseover=function(t){e.tooltip.transition().duration(200).style("opacity",.9),e.tooltip.html(t.properties.name).style("left",d3.event.pageX+28+"px").style("top",d3.event.pageY-28+"px")},this.county_Mouseout=function(t){e.tooltip.transition().duration(500).style("opacity",0)},this.addDistrictList=function(){newlist=[];for(var t=e.Counties.features.length-1;t>=0;t--)newlist.push(e.Counties.features[t].properties.name);newlist.sort(),e.regionList.selectAll(".checkbox").data(newlist).enter().append("li").attr("id",function(t,e){return"checkbox"+e}),e.regionList.selectAll("li").data(newlist).append("label").attr("for",function(t,e){return"checkbox"+e}).text(function(t){return t})},this.addBOCESList=function(){newlist=[];for(var t=e.BOCESPoints.features.length-1;t>=0;t--)newlist.push(e.BOCESPoints.features[t].properties.Name);newlist.sort(),e.regionList.selectAll(".checkbox").data(newlist).enter().append("li").attr("id",function(t,e){return"checkbox"+e}),e.regionList.selectAll("li").data(newlist).append("label").attr("for",function(t,e){return"checkbox"+e}).text(function(t){return t})}}var e=new t("map");e.initMap()}),$("#showme-region").hide(),d3.json("https://sheetsu.com/apis/0c7f8c07",function(t,e){var n=e.result});