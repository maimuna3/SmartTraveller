$(document).ready(function(){

    // ***** MAP SECTION ********
    /*
    * function that will add the markers on the map
    * @param feature
    * @param layer
    */
    function onEachFeature(feature, layer) {
        // Add text to the popup if its included in the JSON file
        if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
        // if the feature/country has properties, coordinates and name
        if (feature.properties && (feature.properties.lat_dec && feature.properties.lon_dec) && feature.properties.name) {
            // add the marker in the map
            L.marker([feature.properties.lat_dec, feature.properties.lon_dec]).addTo(map)
            .bindPopup("Country: " + feature.properties.name + "<br />City: " + feature.properties.city);
        }
        
         
    };

    // create a map in the "map" div, set the view to a given place and zoom
    var map = L.map('map').setView([50,11], 3);

    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    // Get params from URL address
    var contents = location.search.split("?")[1].split("&");
    // split the params in different variables
    var origin = contents[0].split("=")[1];
    var month = contents[1].split("=")[1];
    var budget = contents[2].split("=")[1];
    var lowTemp = contents[3].split("=")[1];
    var highTemp = contents[4].split("=")[1];
    

    if ((origin || month || budget || lowTemp || highTemp) === 'undefined') 
    {
        alert ("error");
    }
    else 
    {
        // Array that will contain the list of countries
        var results = [];
        // Object used per country when filtering
        var singleResult = {};
        // Read geoJSON file
        var geojson = $.getJSON('assets/data/worldmap.json', function (data) {
            L.geoJson(data, {
                filter: function(feature, layer) {
                    // If the origin matches the country, display a red circle on the map.
                    if(feature.properties.name === origin) {
                        var circle = L.circle([feature.properties.lat_dec, feature.properties.lon_dec], 60000, {
                            color: 'red',
                            fillColor: '#f03',
                            fillOpacity: 0.5
                        }).addTo(map);
                        circle.bindPopup("Your origin! (" + origin + ")");
                    }
                    // Set filter of outbounday and weather temperature to find countries that match the criteria.
                    if (Number(feature.properties.outboundDay) <= Number(budget) && Number(feature.properties[month + "_metric"]) >= Number(lowTemp) && Number(feature.properties[month + "_metric"]) <= Number(highTemp)) {
                        singleResult = {"id": feature.properties.id, "name": feature.properties.name, "outboundTripEU": feature.properties.outboundTripEU, "outboundDayEU": feature.properties.outboundDayEU, "domesticTrip": feature.properties.domesticTrip, "outboundTrip": feature.properties.outboundTrip, "domesticDay": feature.properties.domesticDay, "outboundDay": feature.properties.outboundDay, "currency": feature.properties.currency, "units_metric": feature.properties.units_metric, "month_metric": feature.properties[month + "_metric"], "jan": feature.properties["jan_metric"], "feb": feature.properties["feb_metric"], "mar": feature.properties["mar_metric"], "apr": feature.properties["apr_metric"], "may": feature.properties["may_metric"], "jun": feature.properties["jun_metric"], "jul": feature.properties["jul_metric"], "aug": feature.properties["aug_metric"], "oct": feature.properties["oct_metric"], "sep": feature.properties["sep_metric"], "nov": feature.properties["nov_metric"], "dec": feature.properties["dec_metric"]};
                        results.push(singleResult);
                        singleResult = {};
                        return true;
                    }
                },
                style: function (feature) {
                    // change opacity depending on how close to the budget is.
                    return {color: "#008CBA", fillOpacity: feature.properties.outboundDay * 0.7 / budget};
                },
                onEachFeature: onEachFeature
            }).addTo(map);
            
            // Call the function that displays the results
            if (results === undefined || results.length == 0) {

                var error = '<span class="error">'
                          + "Oops that's embarrassing! We could not find a destination for you. Please, try changing your preferences."
                          + '</span>';

                $('#destinations').append(error);

            } else {
                displayResults(results, budget, month);
            }
            // Configuration Slick
            configurationSlick();
        });
    }
});

/*
* function that defines the configuration of the Slick Carrousel.
*/
function configurationSlick(){
    $('.destinations-container').slick({
        centerMode: true,
        centerPadding: '160px',
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: false,
        responsive: 
        [
            {
                breakpoint: 768,
                settings: 
                {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 450,
                settings: 
                {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            }
        ]
    });
}

/*
* function that displays the list of destinations above the map.
* @param results = array that contains the (object) countries
* @param budget = variable defined in the URL address
* @param month = variable defined in the URL address (month of travelling)
*/
function displayResults(results, budget, month){
    var tmp, i, destination,
        country_temperature = 1;

    for (i = 0; i < results.length; i++) {
        
        if(results[i].name.indexOf(' ') !== -1){
            tmp = results[i].name.trim().replace(' ', '_');
        } else {
            tmp = results[i].name;
        } 
        
        if(results[i].month_metric>0){ country_temperature = results[i].month_metric * 3;}

        destination = '<div class="destination-option">'                                                       
                    + '<a class="destination-link" id="'+results[i].name+'_'+i+'" href="#" data-reveal-id="option-'+tmp+'-modal">'             
                    + '<h5>'+results[i].name+'</h5>'                                                                                           
                    + '<img src="img/destinations/'+results[i].name+'.jpg">'                                                                   
                    + '<div class="progress round"><span class="meter cost" style="width: '+ (results[i].outboundDay / 2) +'%;"></span></div>' 
                    + '<div class="progress round"><span class="meter temp" style="width: '+ country_temperature +'%;"></span></div>'        
                    + '<div class="progress round"><span class="meter visa" style="width: 100%;"></span></div>'                                
                    + '</a>'                                                                                                                   
                    + '</div>';

        $('.destinations-container').append(destination);
    }

    $('.destination-link').on('click', function () {
        // get country name and country ID
        var country  = (this.id).split('_')[0];
        var country_id = (this.id).split('_')[1];
        // empty the div that holds the detailed information
        $('#info').empty();
        // call the function that generates the detailed information
        generateInfo(country, country_id, results, budget, month);
        
        //scroll to info-section
        var scroll_speed = 400;

        $('html, body').animate({
            scrollTop: $("#infoResults").offset().top
        }, scroll_speed);
        
    }); 
}

/*
* function that generates the detailed information for a country
* @param country_name = name of the country
* @param i = country id
* @param results = array that contains the countries
* @param budget = budget specified in the form, taken from the URL address.
* @param month = month specified as month of travelling, taken from the URL address
*/
function generateInfo(country_name, i, results, budget, month) {
    var info = '<div id="infoResults" class="large-12 columns">'
             + '<div class="large-12 columns">' 
             + '<a id="closeButton" class="close-button right" aria-label="Close" onclick="hideInfo()">&#215;</a>' 
             + '</div>'  
             + '<div class="large-12 columns info-title">' 
             + '<span>' + country_name + '</span>'
             + '</div>' 
             + '<div class="row info-sub-data">'
             + '<div class="large-5 columns info-sub">'
             + '<h5 class="info-sub-title">' + month + '</h5>'
             + '<span>' + results[i].month_metric + '&deg;C</span>' 
             + '</div>' 
             + '<div class="large-2 columns info-sub">'
             + '<span class="flag-custom flag-icon flag-icon-' + results[i].id + '"></span>' 
             + '</div>' 
             + '<div class="large-5 columns info-sub">'
             + '<h5 class="info-sub-title">Visa</h5>'
             + '<span>no requirements</span>' 
             + '</div>' 
             + '</div><hr/>' 
             + '<div class="row">' 
             + '<div class="large-6 columns">'
             + '<h5 class="info-sub-title">Cost per day (&euro;)</h5>'
             + '<canvas id="cost-chart" height="180"></canvas>'
             + '</div>' 
             + '<div class="large-6 columns info-sub">'
             + '<h5 class="info-sub-title">Average Trip Cost (&euro;)</h5>' 
             + '<div class="row">' 
             + '<span class="large-12 columns info-sub-content">In ' + results[i].name + ': ' + '&euro;' + results[i].outboundTrip +'</span>'
             + '</div>' 
             + '<div class="row">' 
             + '<span class="large-12 columns info-sub-content">In Eurozone: ' + '&euro;' + results[i].outboundTripEU +'</span>'
             + '</div>' 
             + '</div>' 
             + '</div>' 
             + '<div id="weather" class="large-12 columns">' 
             + '<h5 class="info-sub-title">Weather in ' + results[i].name + '</h5><hr/>' 
             + '<canvas id="weather-chart"  height="70"></canvas>' 
             + '</div>' 
             + '</div>';

    // Append elements to the div with all the information and define charts divs
    $('#info').append(info);

    var tmp = [results[i].jan, results[i].feb, results[i].mar, results[i].apr, results[i].may, results[i].jun, results[i].jul, results[i].aug, results[i].sep, results[i].oct, results[i].nov, results[i].dec];

    // populate charts with the corresponding information
    var ctx = $("#weather-chart").get(0).getContext("2d");
    var ctx2 = $("#cost-chart").get(0).getContext("2d");
    var data = {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets: [
                {
                    label: "Year Weather",
                    fillColor: "rgba(0,140,186,0.2)",
                    strokeColor: "rgba(0,140,186,0.8)",
                    pointColor: "rgba(219,98,32,1)",
                    pointStrokeColor: "rgba(219,98,32,1)",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(219,98,32,1)",
                    data: tmp
                }
            ]
        };

    var dataCost = {
        labels: ["Budget", "Cost per day", "Avg. cost in Eurozone"],
        datasets: [
            {
                label: "Budget",
                fillColor: "rgba(0,140,186,0.2)",
                strokeColor: "rgba(0,140,186,0.8)",
                highlightFill: "rgba(219,98,32,0.75)",
                highlightStroke: "rgba(219,98,32,1)",
                data: [budget, results[i].outboundDay, results[i].outboundDayEU]
            }
        ]
    };

    var myBarChart = new Chart(ctx2).Bar(dataCost);
    var myNewChart = new Chart(ctx).Line(data);

}

/*
* function executed when clicking on the X on the detailed section div.
*/
function hideInfo(){
    $('#info').empty();
}

//foundation JS
$(document).foundation();