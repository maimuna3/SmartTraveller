$(document).ready(function(){

    var scroll_speed = 400;

    //start-app-btn click
    $('#start-app-btn').click(function(){
        //scroll to form
        $('html, body').animate({
            scrollTop: $("#input-form-container").offset().top
        }, scroll_speed);
    });

    //resize the containers on the main to window size
    function resize_pages(){
        $('.main').height($(window).height());
    };
    resize_pages();
    $(window).resize(resize_pages);

    //noUiSlider - Temperature imputs
    
    // Append the option elements
    for ( var i = -20; i <= 40; i++ ){

        $('#input-select-low').append(
            '<option value="'+i+'">'+i+'&deg;C</option>'
        );

        $('#input-select-upper').append(
            '<option value="'+i+'">'+i+'&deg;C</option>'
        );
    }

    $('#range-temp').noUiSlider({
        start: [ 10, 30 ],
        connect: true,
        range: {
            'min': -20,
            'max': 40
        }
    });

    // A select element can't show any decimals
    $('#range-temp').Link('lower').to($('#input-select-low'), null, wNumb({
        decimals: 0
    }));

    $('#range-temp').Link('upper').to($('#input-select-upper'), null, wNumb({
        decimals: 0
    }));
    
});
//foundation JS
$(document).foundation();