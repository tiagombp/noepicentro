// Bairro, Cidade, UF — CEP


// span feature.text + ' ' + feature.address
// span Bairro, Cidade, UF — CEP


const app = {

  element : document.querySelector( '.app' ),

  pages : {

    previous : 'main',

    open : function( name ) {

      app.pages.previous = JSON.parse( JSON.stringify( app.element.dataset.page ) )

      app.element.dataset.page = name

    },

    close : function() {

      app.element.dataset.page = app.pages.previous

    },

    initialize : function() {

      app.element.dataset.page = 'main'

    }

  },

  cover : {

    initialize : function() {

    }

  },

  main : {

    element : document.querySelector( '.main' ),

    background : function() {

      document.querySelector( '.background' ).style.height = '0'

      setTimeout( function() {

        document.querySelector( '.background' ).style.height = ( app.main.element.scrollHeight - app.main.element.offsetHeight ) + 'px'

      }, 10 )

    },

    initialize : function() {

      app.main.background()

      window.addEventListener( 'resize', app.main.background )

    }

  },

  search : {

    form : {

      element : document.querySelector( 'form' ),

      initialize : function() {

        app.search.form.element.addEventListener( 'reset', function( event ) {

          app.search.suggestions.clear()

        } )

        app.search.form.element.addEventListener( 'submit', function( event ) {

          let suggestion = document.querySelector( '.suggestions ol li:first-child button' )

          if ( suggestion )
            suggestion.click()
          else
            app.search.input.identify()

          event.preventDefault()

        } )

      }

    },

    input : {

      sanitized : function() {

        return app.search.input.element.value.trim()

      },

      element : document.querySelector( 'input[type="search"]' ),

      debounce : {

        timer : undefined,

        function : function( callback, delay ) {

          delay = delay || 500

          clearTimeout( app.search.input.debounce.timer )

          app.search.input.debounce.timer = setTimeout( callback , delay )

        }

      },

      identify : function() {

        let api = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
        let token = 'pk.eyJ1IjoidGlhZ29tYnAiLCJhIjoiY2thdjJmajYzMHR1YzJ5b2huM2pscjdreCJ9.oT7nAiasQnIMjhUB-VFvmw'

        let address = encodeURIComponent( app.search.input.sanitized() )

        if ( address ) {

          let url = ''

          url += api
          url += address
          url += '.json'
          url += '?'
          url += 'country=br'
          url += '&'
          url += 'language=pt'
          url += '&'
          url += 'limit=3'
          url += '&'
          url += 'access_token='
          url += token

          fetch( url )
            .then( response => response.json() )
            .then( data => app.search.suggestions.handle( data ) )
            .catch( error => console.log( error ) )

        }

      },

      initialize : function() {

        app.search.input.element.addEventListener( 'input', function() {

          let address = app.search.input.sanitized()

          if ( address )
            app.search.input.debounce.function( app.search.input.identify )
          else
            app.search.suggestions.clear()

        } )

        app.search.input.element.addEventListener( 'focus', function() {

          app.element.dataset.search = 'focus'

        } )

        app.search.input.element.addEventListener( 'blur', function() {

          app.element.dataset.search = 'blur'

        } )

      }

    },

    suggestions : {

      // show : function() {
      //
      // },

      // hide : function() {
      //  app.element.dataset.search = 'blur'
      // },

      handle : function( data ) {

        console.log( data.features )

        if ( data.features ) {

          for ( let feature of data.features ) {

            feature.primary = ''
            feature.secondary = ''
            feature.postcode = ''

            feature.primary += feature.text
            feature.primary += feature.address ? ', ' + feature.address : ''

            for ( let context of feature.context ) {

              feature.secondary += context.id.includes( 'poi'          ) ? ', ' + context.text : ''
              feature.secondary += context.id.includes( 'neighborhood' ) ? ', ' + context.text : ''
              feature.secondary += context.id.includes( 'locality'     ) ? ', ' + context.text : ''
              feature.secondary += context.id.includes( 'place'        ) ? ', ' + context.text : ''
              feature.secondary += context.id.includes( 'district'     ) ? ', ' + context.text : ''
              feature.secondary += context.id.includes( 'region'       ) ? ', ' + context.short_code.replace( 'BR-', '' ) : ''

              if ( !feature.postcode )
                feature.postcode += context.id.includes( 'postcode' ) ? ' – ' + context.text : ''

            }

            feature.secondary = feature.secondary.replace(/(^,\s*)/g, '')
            feature.secondary += feature.postcode

          }

          app.search.suggestions.fill( data.features )

        }

      },

      fill : function( features ) {

        app.search.suggestions.clear()
        app.element.dataset.search = 'suggestions'

        let ol = document.querySelector( '.suggestions ol' )

        for ( let feature of features ) {

          let item, button, primary, secondary

          item = document.createElement( 'li' )

          button = document.createElement( 'button' )
          button.setAttribute( 'type', 'button' )
          button.value = JSON.stringify( feature.center )

          button.addEventListener( 'click', function() {

            let center = JSON.parse( this.value )
            app.story.begin( center )

          } )

          primary = document.createElement( 'span' )
          primary.innerText = feature.primary

          secondary = document.createElement( 'span' )
          secondary.innerText = feature.secondary

          button.appendChild( primary )
          button.appendChild( secondary )
          item.appendChild( button )
          ol.appendChild( item )

        }

      },

      clear : function() {

        let ol = document.querySelector( '.suggestions ol' )

        let item = ol.lastElementChild

        while ( item ) {
            ol.removeChild(item)
            item = ol.lastElementChild
        }

      },

      initialize : function() {

      },

    },

    geolocation : {

      handle : function( position ) {

        console.log( position )

        if ( position.coords ) {

          let center = [
            position.coords.longitude,
            position.coords.latitude
          ]

          app.story.begin( center )

        }

      },

      get : function() {

        if ( navigator.geolocation )
          navigator.geolocation.getCurrentPosition( app.search.geolocation.handle )

      },

      initialize : function() {

        if ( navigator.geolocation )
          app.element.dataset.geolocation = true
        else
          app.element.dataset.geolocation = false

      }

    },

    initialize : function() {

      app.search.form.initialize()
      app.search.input.initialize()
      app.search.suggestions.initialize()
      app.search.geolocation.initialize()

    }

  },

  story : {

    canvas : {

      map : {

        center : function( center ) {

          alert( center )

        }

      }

    },

    begin : function( center ) {

      app.search.suggestions.clear()
      app.search.form.element.reset()
      app.search.input.element.blur()

      app.pages.open( 'story' )

      app.story.canvas.map.center( center )
      app.story.carousel.instance.update()

    },

    carousel : {

      instance : undefined,

      selector : '.swiper-container',

      options : {

        pagination: {
          el: '.swiper-pagination',
          type: 'progressbar',
        },

        navigation: {
          prevEl: '.prev',
          nextEl: '.next',
        },

        keyboard: {
          enabled: true,
          onlyInViewport: false,
        },

      },

      initialize : function() {

        app.story.carousel.instance = new Swiper(
          app.story.carousel.selector,
          app.story.carousel.options
        )

      }

    },

    initialize : function() {

      app.story.carousel.initialize()

    }

  },

  poster : {

    initialize : function() {


    }

  },

  triggers : {

    elements : document.querySelectorAll( '[data-trigger]' ) ,

    initialize : function() {

      for ( let trigger of app.triggers.elements ) {

        trigger.addEventListener( 'click', function() {

          let instructions = this.dataset.trigger

          let f = new Function( instructions )

          return( f() )

        } )

      }

    }

  },

  initialize : function() {

    app.pages.initialize()
    app.cover.initialize()
    app.main.initialize()
    app.search.initialize()
    app.story.initialize()
    app.poster.initialize()
    app.triggers.initialize()

  }

}

app.initialize()



/* temporary until merge */

mapboxgl.accessToken = 'pk.eyJ1IjoidGlhZ29tYnAiLCJhIjoiY2thdjJmajYzMHR1YzJ5b2huM2pscjdreCJ9.oT7nAiasQnIMjhUB-VFvmw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/tiagombp/ckbz4zcsb2x3w1iqyc3y2eilr',
    center: [-30, 0],
    zoom: 4
});

// vis functions

function draw_circle(center, point_on_circle) {

    // remove circle layer, if it already exists
    if (map.getLayer('circle')) map.removeLayer('circle');
    if (map.getSource('circle')) map.removeSource('circle');

    // transform coordinates into features
    let center_ft = turf.point(center);
    let point_on_circle_ft = turf.point(point_on_circle);

    // calculate radius in km
    let radius = turf.distance(
        center_ft,
        point_on_circle_ft
    );

    // generates circle as feature
    let circle = turf.circle(center_ft, radius);

    map.addSource('circle', {
            'type': 'geojson',
            'data': circle});

    map.addLayer({
            'id': 'circle',
            'type': 'fill',
            'source': 'circle',
            'layout': {},
            'paint': {
            'fill-outline-color': 'tomato',
            'fill-color': 'transparent',
            'fill-opacity': 1
        }},
    );

    return circle;
}

function show_people() {
    map.setPaintProperty(
        'people',
        'circle-opacity',
        0.25
    );
    map.moveLayer("people", "national-park")
}

function highlight_people_inside(circle) {

    if (map.getLayer('people-inside')) map.removeLayer('people-inside');

    map.addLayer(
        {
        'id': 'people-inside',
        'type': 'circle',
        'source': 'composite',
        'source-layer': 'people',
        'paint': {
            'circle-radius': 2,
            'circle-color': 'white',
            'circle-opacity': 0.8
        },
        'filter': ['within', circle]
    },
    'people');
}

function toggle_labels(show) {
    //console.log(labels_layers, !labels_layers);
    //if (!labels_layers)
    labels_layers = ["settlement-subdivision-label", "poi-label", "water-point-label", "road-label",
    "waterway-label", "airport-label", "natural-line-label"];

    let opacity = show ? 1 : 0;

    for (layer of labels_layers) {
        map.setPaintProperty(layer, "text-opacity", opacity);
    }
}

function toggle_circle(show) {

    let opacity = show ? 1 : 0;

    map.setPaintProperty("circle", "fill-opacity", opacity);
}

// main function

function init_map() {

    // geocoder

    let geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        countries: 'br',
        language: 'pt-br',
        flyTo: {
            'speed': 2,
            'zoom': 4
        },
        mapboxgl: mapboxgl
    });

    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

    // got geocoder results

    geocoder.on('result', function(e) {

        console.log(e.result.center);

        // remove existing layers for new seatch

        if (map.getLayer('people-inside')) map.removeLayer('people-inside');
        if (map.getLayer('circle')) map.removeLayer('circle');
        if (map.getSource('circle')) map.removeSource('circle');

        // fly to result

        map.flyTo({
            'center': e.result.center,
            'speed': 0.8,
            'zoom': 12
         });

        let flying = true;

        // fetch

        let lat = e.result.center[1];
        let lon = e.result.center[0];


        let time_before = performance.now()
        fetch('https://coldfoot-api.eba-8zt2jyyb.us-west-2.elasticbeanstalk.com/coords?lat='+lat+'&lon=' + lon, {mode: 'cors'})
            .then(function(response) {
                if (!response.ok) {
                    throw Error();
                }
                return response.json();
            })
            .then(function(api_result) {
                let time_after = performance.now();
                console.log("tempo para fetch", time_after - time_before);

                let circle = draw_circle(
                    center = e.result.center,
                    point_on_circle = api_result[1]);

                bbox_circle = turf.bbox(circle);

                // wait for the end of fly_to camera movement
                map.on('moveend', function(e){
                    if (flying) {
                        flying = false;

                        map.fitBounds(bbox_circle, {
                            padding: {top: 20, bottom:20, left: 10, right: 10},
                            duration: 1000
                        });

                        let fittingBounds = true;

                        // wait for the end of fitBounds camera movement

                        map.on('moveend', function(e) {
                            if (fittingBounds) {
                                fittingBounds = false;

                                show_people();
                                highlight_people_inside(circle);
                                //toggle_labels(show = false);
                                //toggle_circle(show = false);
                            }
                        })

                    }
                });
            })
            // .catch(function(e) {
            //     $log.append("p").classed("erro", true).append("span").html("Erro na busca do raio. Provavelmente por causa do certificado do servidor da API. Experimente visitar primeiro <a href='https://coldfoot-api.eba-8zt2jyyb.us-west-2.elasticbeanstalk.com/'>esta página</a> e tentar novamente.");
            // });
    });
};

// init_map();
