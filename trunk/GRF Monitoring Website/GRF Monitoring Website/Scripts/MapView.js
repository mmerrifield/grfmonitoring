var map;
var watershed;
var project;
var streams;
var markers = [];
var infographics = [];
var infowindows = [];
$(function () {
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(38.9, -123.5)
  };
  map = new google.maps.Map($('#map-canvas')[0], mapOptions);
  getBoundaries();
  getYears();
  $('#Year').on('change', function () { getMarkers(); });
  $('#showWatershed').on('click', function () { if ($(this).is(':checked')) watershed.setMap(map); else watershed.setMap(null); });
  $('#showProject').on('click', function () { if ($(this).is(':checked')) project.setMap(map); else project.setMap(null); });
  $('#showStreams').on('click', function () { if ($(this).is(':checked')) streams.setMap(map); else streams.setMap(null); });
  $('#showDataSites').on('click', getMarkers);
  $('#PinFormat').on('change', getMarkers);
  $('#legendPos').on('change', showLegend);
  $(window).resize(recalcHeight);
  recalcHeight();
  showLegend();
});
var recalcHeight = function () {
  $("#map-canvas").height($(window).height() - 180); 
  map && google.maps.event.trigger(map, 'resize'); 
};
function showLegend() {
  $('#legend').hide();
  var val = $('#legendPos').val();
  if (val != 'hide'){
    if (val == 'top-left')
      $('#legend').css({ 'left': '2%', 'top': '0%', 'bottom': '', 'right': '' });
    else if (val == 'top-right')
      $('#legend').css({ 'right': '2%', 'top': '0%', 'bottom' : '', 'left':''});
    else if (val == 'bottom-left')
      $('#legend').css({ 'left': '2%', 'bottom': '0%', 'top': '', 'right': '' });
    else
      $('#legend').css({ 'right': '2%', 'bottom': '0%', 'top': '','left': '' });
    $('#legend').show();
  }
}
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
  var wsUrl, propUrl;
  $.get('GRFService.svc/Boundaries', {}, function (data) {
    $.each(data, function (i, d) {
      var tokens = d.split('=');
      if (tokens.length == 2) {
        if (tokens[0] == "Watershed") {
          watershed = new google.maps.KmlLayer({ url: tokens[1], clickable: false, preserveViewport: true });
          if ($('#showWatershed').is(':checked'))
            watershed.setMap(map);
        }
        else if (tokens[0] == "Property") {
          project = new google.maps.KmlLayer({ url: tokens[1], clickable: false, preserveViewport: true });
          if ($('#showProject').is(':checked'))
            project.setMap(map);
        }
        else if (tokens[0] == "Streams") {
          streams = new google.maps.KmlLayer({ url: tokens[1], clickable: false, preserveViewport: true });
          if ($('#showStreams').is(':checked'))
            streams.setMap(map);
        }
      }
    });
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