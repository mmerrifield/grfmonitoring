var map;
var watershed;
var project;
var markers = [];
var infographics = [];
var infowindows = [];
$(function () {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(38.954444, -123.733611)
  };
  map = new google.maps.Map($('#map-canvas')[0], mapOptions);
  getBoundaries();
  getYears();
  $('#Year').on('change', function () { getMarkers(); });
  $('#showWatershed').on('click', function () { if ($(this).is(':checked')) watershed.setMap(map); else watershed.setMap(null); });
  $('#showProject').on('click', function () { if ($(this).is(':checked')) project.setMap(map); else project.setMap(null); });
  $('#showDataSites').on('click', getMarkers);
  $('#PinFormat').on('change', getMarkers);
});
function getYears() {
  var params = {}
  params.site = ''
  params.type = '';
  $.get('GRFService.svc/Years', params, function (data) {
    var sel = $('#Year')[0];
    sel.options.length = 0;
    sel.options[0] = new Option('', '');
    $.each(data, function (index, yr) {
      sel.options[sel.options.length] = new Option(yr, yr);
    });
  });
}
function getBoundaries() {
  $.get('GRFService.svc/Boundaries', {}, function (data) {
    var watershedPts = [];
    $.each(data.Watershed, function (i, pt) {
      watershedPts.push(new google.maps.LatLng(pt.Lat, pt.Lng));
    });
    watershed = new google.maps.Polygon({
      paths: watershedPts,
      strokeColor: '#0000FF',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FFF',
      fillOpacity: 0
    });
    watershed.setMap(map);

    var projectPts = [];
    $.each(data.Project, function (i, pt) {
      projectPts.push(new google.maps.LatLng(pt.Lat, pt.Lng));
    });
    project = new google.maps.Polygon({
      paths: projectPts,
      strokeColor: '#000',
      strokeOpacity: 1.0,
      stroekWeight: 2,
      fillColor: '#FFF',
      fillOpacity: 0
    });
    project.setMap(map);
  });
}
function setAllMap(map) {
  $.each(markers, function (i, marker) { marker.setMap(map); });
  $.each(infographics, function (i, ig) { ig.setMap(map); });
  $.each(infowindows, function (i, iw) { iw.setMap(map); });
};
function clear() {
  setAllMap(null);
  markers = [];
  infographics = [];
  infowindows = [];
  google.maps.event.clearListeners(map, 'click');
}
function getMarkers() {
  clear();
  var params = {};
  params.year = $('#Year').val();
  params.showData = $('#showDataSites')[0].checked;
  params.format = $('#PinFormat').val();
  if (params.year === null || params.year.length === 0) return;
  $.get('GRFService.svc/Markers', params, function (data) {
    $.each(data, function (i, marker) {
      var pos = new google.maps.LatLng(marker.Lat, marker.Lng);
      var pin = new google.maps.Marker({ position: pos, map: map, title: marker.Tooltip, icon: marker.Marker });
      markers.push(pin);
      if (marker.InfoText.length > 0) {
        var iw = new google.maps.InfoWindow({ content: marker.InfoText, maxWidth: 400 });
        infowindows.push(iw);
        google.maps.event.addListener(pin, 'click', function () { iw.open(map, pin) });
      }
      if (marker.Radius > 0.0) {
        var opt = {
          strokeColor: marker.Color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: marker.Color,
          fillOpacity: 0.35,
          map: map,
          center: pos,
          radius: marker.Radius
        };
        var ginfo = new google.maps.Circle(opt);
        infographics.push(ginfo);
      }
    });
  });
}