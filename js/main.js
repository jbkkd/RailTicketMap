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
    var departureTime = $("#time").datetimepicker("getDate");
    var arrivalTime;
    if ($("#departureArrival option:selected").val() == "arrive") {
        arrivalTime = $("#time").datetimepicker("getDate");
    }
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
            departureTime: departureTime,
            arrivalTime: arrivalTime
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

function ReplaceCountrySite(startCountry, endCountry, bahnlink) {
    function SetCountrySiteToGermany() {
        bahnlink = bahnlink.replace("COUNTRYSPECIFICSITE", "reiseauskunft.bahn.de");
    }

    function SetCountrySiteToSwitzerland() {
        bahnlink = bahnlink.replace("COUNTRYSPECIFICSITE", "fahrplan.sbb.ch");
    }

    if (startCountry == "Germany") {
        SetCountrySiteToGermany();
    }
    else if (startCountry == "Switzerland") {
        SetCountrySiteToSwitzerland();
    }
    else if (startCountry == "Denmark") {
        if (endCountry == "Denmark") {
            bahnlink = bahnlink.replace("COUNTRYSPECIFICSITE", "www.rejseplanen.dk");
        }
        else if (endCountry == "Germany") {
            SetCountrySiteToGermany();
        }
        else if (endCountry == "Switzerland") {
            SetCountrySiteToSwitzerland();
        }
    }
    return bahnlink;
}

function ReplaceBahnlinkVariables(bahnlink, startCountry, endCountry, startFullAddress, endFullAddress) {
    var date = $("#time").datetimepicker("getDate");
    date = date ? date : new Date;
    bahnlink = ReplaceCountrySite(startCountry, endCountry, bahnlink);
    bahnlink = bahnlink.replace("STARTDESTINATION", startFullAddress);
    bahnlink = bahnlink.replace("ENDDESTINATION", endFullAddress);
    bahnlink = bahnlink.replace("DATEOFJOURNEY", date.toLocaleDateString("de-DE"));
    bahnlink = bahnlink.replace("TIMEOFJOURNEY", date.getHours() + ":" + date.getMinutes());
    bahnlink = bahnlink.replace("DEPARTORARRIVE", $("#departureArrival option:selected").val());
    return bahnlink;
}

function addBuyNowLink() {
    var bahnlink = "http://COUNTRYSPECIFICSITE/bin/query.exe/en?existOptimizePrice=1&&S=STARTDESTINATION&REQ0JourneyStopsSID=&REQ0JourneyStopsS0A=7&ignoreTypeCheck=no&Z=ENDDESTINATION&REQ0JourneyStopsZ0A=7&trip-type=single&date=Tu%2C+DATEOFJOURNEY&time=TIMEOFJOURNEY&timesel=DEPARTORARRIVE&returnTimesel=depart&optimize=0&travelProfile=-1&adult-number=1&children-number=0&infant-number=0&tariffTravellerType.1=E&tariffTravellerReductionClass.1=0&tariffTravellerAge.1=&qf-trav-bday-1=&tariffTravellerReductionClass.2=0&tariffTravellerReductionClass.3=0&tariffTravellerReductionClass.4=0&tariffTravellerReductionClass.5=0&tariffClass=2&start=1";
    var startPlace = autoCompleteStart.getPlace();
    var startStreetNumber, startStreet, startCity, startFullAddress, startCountry;
    var endPlace = autoCompleteEnd.getPlace();
    var endStreetNumber, endStreet, endCity, endFullAddress, endCountry;
    var i, addressType, nameOfAddress;
    for (i = 0; i < startPlace.address_components.length; i++) {
        addressType = startPlace.address_components[i].types[0];
        nameOfAddress = startPlace.address_components[i].long_name;
        if (addressType == "locality") {
            startCity = nameOfAddress;
        }
        else if (addressType == "street_number") {
            startStreetNumber = nameOfAddress;
        }
        else if (addressType == "route") {
            startStreet = nameOfAddress;
        }
        else if (addressType == "country") {
            startCountry = nameOfAddress;
        }
    }
    for (i = 0; i < endPlace.address_components.length; i++) {
        addressType = endPlace.address_components[i].types[0];
        nameOfAddress = endPlace.address_components[i].long_name;
        if (addressType == "locality") {
            endCity = nameOfAddress;
        }
        else if (addressType == "street_number") {
            endStreetNumber = nameOfAddress;
        }
        else if (addressType == "route") {
            endStreet = nameOfAddress;
        }
        else if (addressType == "country") {
            endCountry = nameOfAddress;
        }
    }
    startFullAddress = (startStreetNumber ? startStreetNumber + ", " : "");
    startFullAddress = startFullAddress + (startStreet ? startStreet + ", " : "");
    startFullAddress = startFullAddress + startCity;
    endFullAddress = (endStreetNumber ? endStreetNumber + ", " : "");
    endFullAddress = endFullAddress + (endStreet ? endStreet + ", " : "");
    endFullAddress = endFullAddress + endCity;
    bahnlink = ReplaceBahnlinkVariables(bahnlink, startCountry, endCountry, startFullAddress, endFullAddress);
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

function rebindAutoComplete(element, startOrEnd) {
    if (startOrEnd == 'start') {
        autoCompleteStart.setComponentRestrictions({country: element.value});
    }
    else {
        autoCompleteEnd.setComponentRestrictions({country: element.value});
    }
}

function switchEndCountryOptions(element) {
    if (element.value == 'dk') {
	$('#endCountry option[value="nl"]').remove();
    } else {
	if ($('#endCountry option[value="nl"]').length == 0) {
	    var nl = '<option value="nl">Netherlands</option>';
	    $('#endCountry').append(nl);
	}
    }
}

google.maps.event.addDomListener(window, 'load', initialize);

$(document).ready(function() {
    $('#time').datetimepicker({
        minDate: new Date(),
        onSelect: function () {calcRoute();}
    });
    $('#startCountry').on('change', function() {
	rebindAutoComplete(this, 'start');
	switchEndCountryOptions(this);
    });
    $('#endCountry').on('change', function() {
	rebindAutoComplete(this, 'end');
    });
})
