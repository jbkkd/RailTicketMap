var directionsDisplay;
var autoCompleteStart, autoCompleteEnd;
var directionsService = new google.maps.DirectionsService();

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var mapOptions = {
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(51.16569, 10.45153)
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));

    var startInput = /** @type {HTMLInputElement} */(document.getElementById('start'));
    autoCompleteStart = new google.maps.places.Autocomplete(startInput,
        {
            componentRestrictions: {country: 'de'}
        });
    autoCompleteStart.bindTo('bounds', map);
    google.maps.event.addListener(autoCompleteStart, 'place_changed', function() {
        calcRoute();
    });

    var endInput = /** @type {HTMLInputElement} */(document.getElementById('end'));
    autoCompleteEnd = new google.maps.places.Autocomplete(endInput,
        {
            componentRestrictions: {country: 'de'}
        });
    autoCompleteEnd.bindTo('bounds', map);
    google.maps.event.addListener(autoCompleteEnd, 'place_changed', function() {
        calcRoute();
    });

    google.maps.event.addListener(autoCompleteStart, 'place_changed', function() {
        calcRoute();
    });
    google.maps.event.addListener(autoCompleteEnd, 'place_changed', function() {
        calcRoute();
    });

    var control = document.getElementById('control');
    control.style.display = 'block';
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
}

function calcRoute() {
    var start = document.getElementById('start').value;
    var end = document.getElementById('end').value;
    var date = $("#time").datetimepicker("getDate");
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
            departureTime: date
        }
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            $("#instructions").hide();
            addBuyNowLink();
            directionsDisplay.setDirections(response);
        }
    });
}

function ReplaceBahnlinkVariables(bahnlink, startFullAddress, endFullAddress) {
    var date = new $("#time").datetimepicker("getDate");
    bahnlink = bahnlink.replace("STARTDESTINATION", startFullAddress);
    bahnlink = bahnlink.replace("ENDDESTINATION", endFullAddress);
    bahnlink = bahnlink.replace("DATEOFDEPARTURE", date.toLocaleDateString("de-DE"));
    bahnlink = bahnlink.replace("TIMEOFDEPARTURE", date.getHours() + ":" + date.getMinutes());
    return bahnlink;
}
function addBuyNowLink() {
    var bahnlink = "http://reiseauskunft.bahn.de/bin/query.exe/en?existOptimizePrice=1&&S=STARTDESTINATION&REQ0JourneyStopsSID=&REQ0JourneyStopsS0A=7&ignoreTypeCheck=no&Z=ENDDESTINATION&REQ0JourneyStopsZ0A=7&trip-type=single&date=Tu%2C+DATEOFDEPARTURE&time=TIMEOFDEPARTURE&timesel=depart&returnTimesel=depart&optimize=0&travelProfile=-1&adult-number=1&children-number=0&infant-number=0&tariffTravellerType.1=E&tariffTravellerReductionClass.1=0&tariffTravellerAge.1=&qf-trav-bday-1=&tariffTravellerReductionClass.2=0&tariffTravellerReductionClass.3=0&tariffTravellerReductionClass.4=0&tariffTravellerReductionClass.5=0&tariffClass=2&start=1";
    var startPlace = autoCompleteStart.getPlace();
    var startStreetNumber, startStreet, startCity, startFullAddress;
    var endPlace = autoCompleteEnd.getPlace();
    var endStreetNumber, endStreet, endCity, endFullAddress;
    for (var i = 0; i < startPlace.address_components.length; i++) {
        var addressType = startPlace.address_components[i].types[0];
        var nameOfAddress = startPlace.address_components[i].long_name;
        if (addressType == "locality") {
            startCity = nameOfAddress
        }
        else if (addressType == "street_number")
        {
            startStreetNumber = nameOfAddress;
        }
        else if (addressType == "route")
        {
            startStreet = nameOfAddress;
        }
    }
    for (var i = 0; i < endPlace.address_components.length; i++) {
        var addressType = endPlace.address_components[i].types[0];
        var nameOfAddress = endPlace.address_components[i].long_name;
        if (addressType == "locality") {
            endCity = nameOfAddress;
        }
        else if (addressType == "street_number")
        {
            endStreetNumber = nameOfAddress;
        }
        else if (addressType == "route")
        {
            endStreet = nameOfAddress;
        }
    }
    startFullAddress = (startStreetNumber ? startStreetNumber + ", " : "");
    startFullAddress = startFullAddress + (startStreet ? startStreet + ", " : "");
    startFullAddress = startFullAddress + startCity;
    endFullAddress = (endStreetNumber ? endStreetNumber + ", " : "");
    endFullAddress = endFullAddress + (endStreet ? endStreet + ", " : "");
    endFullAddress = endFullAddress + endCity;
    bahnlink = ReplaceBahnlinkVariables(bahnlink, startFullAddress, endFullAddress);
    $("#buy-ticket-panel").show();
    $("#buy-ticket").attr("href", bahnlink);
}

function addBuyNowLinksToDirections(response) {
    var steps = response.routes[0].legs[0].steps;
    for (var i = 0; i < steps.length; ++i) {
        var agency = steps[i].transit.line.agencies[0];
        if (agency.name.indexOf("Deutsche Bahn") != -1)
        {
            agency.name += " - Buy Ticket"
            agency.url = "http://www.omer.com";
        }
    }
}
google.maps.event.addDomListener(window, 'load', initialize);

$(document).ready(function() {
    $('#time').datetimepicker({
        minDate: new Date()
    });
})