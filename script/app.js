let map;
let first_47; // temp

let app = {

  element : document.querySelector( '.app' ),

  variables : {

    elements : document.querySelectorAll( '[data-var]' ),

    initial : undefined,
    result : undefined,

    get : {

      "Death count" : function() {

        let deaths = app.variables.initial.deaths
        deaths = new Intl.NumberFormat( 'pt-BR' ).format( deaths )
        return deaths

      },

      "Time since first death" : function() {

        let today = new Date()
        let first = new Date( 2020, 2, 16 )

        let diff = {}

        diff.milliseconds = today - first
        diff.days = Math.floor( diff.milliseconds / (1000*60*60*24) )

        return diff.days + ' dias'

      },

      "User radius" : function() {

        let city = app.variables.result

        let km = turf.distance(
          turf.point( city.radius.inner_point ),
          turf.point( city.radius.outer_point )
        )

        if ( km < 1 )
          return Math.round( km * 1000 ) + ' m'

        let value = Math.round( km * 10 ) / 10
        value = new Intl.NumberFormat( 'pt-BR' ).format( value )
        return  value + ' km'

      },

      "Featured city 1" : function() {

        let city = app.variables.result.capitals_to_highlight[ 0 ]
        return city.name_muni + ' (' + city.name_state + ')'

      },

      "Featured city 1 location" : function() {

        let city = app.variables.result.capitals_to_highlight[ 0 ]
        return city.display_text

      },

      "Featured city 1 location description" : function() {

        let city = app.variables.result.capitals_to_highlight[ 0 ]
        return city.display_desc || ''

      },

      "Featured city 1 radius" : function() {

        let city = app.variables.result.capitals_to_highlight[ 0 ]
        let km = turf.distance(
          turf.point( city.radius.inner_point ),
          turf.point( city.radius.outer_point )
        )

        if ( km < 1 )
          return Math.round( km * 1000 ) + ' m'

        let value = Math.round( km * 10 ) / 10
        value = new Intl.NumberFormat( 'pt-BR' ).format( value )
        return  value + ' km'

      },

      "Featured city 2" : function() {

        let city = app.variables.result.capitals_to_highlight[ 1 ]
        return city.name_muni + ' (' + city.name_state + ')'

      },

      "Featured city 2 location" : function() {

        let city = app.variables.result.capitals_to_highlight[ 1 ]
        return city.display_text

      },

      "Featured city 2 location description" : function() {

        let city = app.variables.result.capitals_to_highlight[ 1 ]
        return city.display_desc || ''

      },

      "Featured city 2 radius" : function() {

        let city = app.variables.result.capitals_to_highlight[ 1 ]
        let km = turf.distance(
          turf.point( city.radius.inner_point ),
          turf.point( city.radius.outer_point )
        )

        if ( km < 1 )
          return Math.round( km * 1000 ) + ' m'

        let value = Math.round( km * 10 ) / 10
        value = new Intl.NumberFormat( 'pt-BR' ).format( value )
        return  value + ' km'

      },

      "Vanished city" : function() {

        let city = app.variables.result.neighboring_city
        return city.name_muni + ' (' + city.name_state + ')'

      },

      "Vanished city population" : function() {

        let city = app.variables.result.neighboring_city
        let population = city.pop_2019
        let value = Math.round( population / 1000 )
        return value + ' mil'

      },

      "Vanished city population difference" : function() {

        let city = app.variables.result.neighboring_city
        let population = city.pop_2019
        let deaths = app.variables.initial.deaths
        let difference = deaths - population

        if ( difference < 1000 )
          return difference

        let value = Math.round( difference / 1000 )
        return value + ' mil'

      },

      "Vanished cities" : function() {

        return ''

      }

    },

    update : function( list ) {

      list = list || Object.keys( app.variables.get )

      for ( let variable of list ) {

        for ( let element of app.variables.elements ) {

          if ( element.dataset.var == variable ) {

            let text = app.variables.get[ variable ]()
            element.innerText = text

          }

        }

      }

    },

    initialize : function() {

      let url = 'https://caco.app/count'
      let options = { mode: 'cors' }

      fetch( url, options )
        .then( response => response.json() )
        .then( data => {

          app.variables.initial = data
          app.variables.update(
            [
              'Death count'
            ]
          )

        } )
        .catch( error => console.log( error ) )

    }

  },

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

              // fix Rio de Janeiro addresses (they do not have short_code property)
              if ( context.id.includes( 'region' ) ) {

                if ( 'short_code' in context )
                  feature.secondary += ', ' + context.short_code.replace( 'BR-', '' )
                else
                  feature.secondary += context.text === 'Rio de Janeiro' ? ', RJ' : ''

              }

              if ( !feature.postcode )
                feature.postcode += context.id.includes( 'postcode' ) ? ' – ' + context.text : ''

            }

            feature.secondary = feature.secondary.replace( /(^,\s*)/g, '' )
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

    steps : {

      show : {

        "You are here" : function() {

          map.flyTo( {
            center : app.story.map.user,
            speed  : .1,
            zoom   : 15
          } )

          app.story.map.controls.labels.toggle( true )
          app.story.map.controls.user.marker()

          app.story.map.monitoring = setInterval( function() {

            if ( map.isStyleLoaded() && app.variables.result ) {

              app.story.map.controls.people.initialize()
              app.story.map.controls.people.toggle( false )

              // app.story.map.controls.people.overlay.initialize()
              // app.story.map.controls.people.overlay.toggle( false )

              app.story.map.controls.people.highlight.someInsideCircle.initialize( 1, 'first-death' )
              app.story.map.controls.people.highlight.someInsideCircle.initialize( 46, 'first-deaths' )
              app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-death' )
              app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-deaths' )

              app.story.map.controls.people.highlight.insideCircle.initialize(
                app.variables.result.radius.inner_point,
                app.variables.result.radius.outer_point
              )
              app.story.map.controls.people.highlight.insideCircle.toggle( false )

              app.story.map.controls.circle.initialize(
                app.variables.result.radius.inner_point,
                app.variables.result.radius.outer_point
              )
              app.story.map.controls.circle.toggle( false )



              app.element.dataset.loaded = true

              clearInterval( app.story.map.monitoring )

            }

          }, 200 )

        },
        "First death" : function() {

          map.flyTo( {
            center : app.story.map.user,
            speed  : .1,
            zoom   : 17.5,
          } )

          app.story.map.controls.labels.toggle( false )
          app.story.map.controls.user.marker()
          app.story.map.controls.people.toggle( false )
          // app.story.map.controls.people.overlay.toggle( false )
          app.story.map.controls.people.highlight.someInsideCircle.toggle( true, 'first-death' )
          app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-deaths' )
          app.story.map.controls.people.highlight.insideCircle.toggle( false )
          app.story.map.controls.circle.toggle( false )

        },
        "Following deaths" : function() {

          map.flyTo( {
            center : app.story.map.user,
            speed  : .1,
            zoom   : 17.25
          } )

          app.story.map.controls.labels.toggle( false )
          app.story.map.controls.user.marker()
          app.story.map.controls.people.toggle( false )
          // app.story.map.controls.people.overlay.toggle( false )
          app.story.map.controls.people.highlight.someInsideCircle.toggle( true, 'first-death' )
          app.story.map.controls.people.highlight.someInsideCircle.toggle( true, 'first-deaths' )
          app.story.map.controls.people.highlight.insideCircle.toggle( false )
          app.story.map.controls.circle.toggle( false )

        },
        "All deaths" : function() {

          app.story.map.controls.labels.toggle( false )
          app.story.map.controls.user.marker()
          app.story.map.controls.people.toggle( true )
          // app.story.map.controls.people.overlay.toggle( false )
          app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-death' )
          app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-deaths' )
          app.story.map.controls.people.highlight.insideCircle.toggle( true )
          app.story.map.controls.circle.toggle( false )
          app.story.map.controls.circle.fitOnScreen()

        },
        "All deaths with outline" : function() {

          app.story.map.controls.labels.toggle( false )
          app.story.map.controls.user.marker()
          app.story.map.controls.people.toggle( true )
          // app.story.map.controls.people.overlay.toggle( false )
          app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-death' )
          app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-deaths' )
          app.story.map.controls.people.highlight.insideCircle.toggle( true )
          app.story.map.controls.circle.toggle( true )
          app.story.map.controls.circle.fitOnScreen()

        },
        "City that would have vanished" : function() {

          let city = app.variables.result.neighboring_city
          let center = city.city_centroid

          map.flyTo( {
            center : center,
            speed  : 1,
            zoom   : 12
          } )

          app.story.map.controls.labels.toggle( true )
          app.story.map.controls.user.marker()
          app.story.map.controls.people.toggle( true )

          // app.story.map.controls.people.overlay.toggle( true )

          app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-death' )
          app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-deaths' )
          app.story.map.controls.people.highlight.insideCircle.toggle( false )
          app.story.map.controls.circle.toggle( false )

          app.story.map.controls.location.highlight( city.code_muni )

        },
        "City vanished" : function() {

          let city = app.variables.result.neighboring_city
          let center = city.city_centroid

          map.flyTo( {
            center : center,
            speed  : 1,
            zoom   : 12
          } )

          app.story.map.controls.labels.toggle( true )
          app.story.map.controls.user.marker()
          app.story.map.controls.people.toggle( true )

          // app.story.map.controls.people.overlay.toggle( true )

          app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-death' )
          app.story.map.controls.people.highlight.someInsideCircle.toggle( false, 'first-deaths' )
          app.story.map.controls.people.highlight.insideCircle.toggle( false )
          app.story.map.controls.circle.toggle( false )

          app.story.map.controls.location.fill( city.code_muni )

        },
        "Cities that would have vanished" : function() {

          map.flyTo( {
            center : app.story.map.user,
            speed  : .5,
            zoom   : 4
          } )

          app.story.map.controls.labels.toggle( false )

        },
        "Cities vanished" : function() {

          map.flyTo( {
            center : app.story.map.user,
            speed  : .5,
            zoom   : 4
          } )

          app.story.map.controls.labels.toggle( false )

        },
        "Featured city 1" : function() {

          let city = app.variables.result.capitals_to_highlight[ 0 ]
          let center = city.radius.inner_point

          map.flyTo( {
            center : center,
            speed  : 1,
            zoom   : 13
          } )

          app.story.map.controls.labels.toggle( true )

          app.story.map.controls.user.marker( center )

        },
        "Featured city 1 location" : function() {

          let city = app.variables.result.capitals_to_highlight[ 0 ]
          let center = city.radius.inner_point

          map.flyTo( {
            center : center,
            speed  : 1,
            zoom   : 15
          } )

          app.story.map.controls.labels.toggle( false )

          app.story.map.controls.user.marker( center )

        },
        "Featured city 2" : function() {

          let city = app.variables.result.capitals_to_highlight[ 1 ]
          let center = city.radius.inner_point

          map.flyTo( {
            center : center,
            speed  : 1,
            zoom   : 15
          } )

          app.story.map.controls.user.marker( center )

        },
        "Featured city 2 location" : function() {

          let city = app.variables.result.capitals_to_highlight[ 1 ]
          let center = city.radius.inner_point

          map.flyTo( {
            center : center,
            speed  : 1,
            zoom   : 15
          } )

          app.story.map.controls.user.marker( center )


        },

      },

      handle : function() {

        let active = document.querySelector( '.swiper-slide-active' )

        if ( !active )
          active = document.querySelector( '.swiper-slide' )

        let step = active.dataset.step

        app.story.steps.show[ step ]()

      }

    },

    map : {

      id : 'map',
      style : 'mapbox://styles/tiagombp/ckbz4zcsb2x3w1iqyc3y2eilr',
      token : 'pk.eyJ1IjoidGlhZ29tYnAiLCJhIjoiY2thdjJmajYzMHR1YzJ5b2huM2pscjdreCJ9.oT7nAiasQnIMjhUB-VFvmw',
      user : undefined,

      radius : function( center, point_on_circle ) {

        let center_ft = turf.point(center);
        let point_on_circle_ft = turf.point(point_on_circle);

        // calculate radius in km
        let radius = turf.distance(
          center_ft,
          point_on_circle_ft
        );

        return {
          center : center_ft,
          km : radius
        }

      },

      reset : function() {

        if ( map.getLayer(  'people-inside' ) ) map.removeLayer( 'people-inside' )
        if ( map.getLayer(  'circle'        ) ) map.removeLayer( 'circle' )
        if ( map.getSource( 'circle'        ) ) map.removeSource( 'circle' )

      },

      initialize : function( center ) {

        mapboxgl.accessToken = app.story.map.token

        app.story.map.user = center

        console.log( map )

        map = new mapboxgl.Map( {
          container: app.story.map.id,
          style:     app.story.map.style,
          center:    app.story.map.user,
          zoom:      19,
          pitch:     0,
          // preserveDrawingBuffer: true
        } )

        map.setMinZoom( 2 )
        map.setMaxZoom( 19 )
        map.keyboard.disable()
        map.dragRotate.disable()
        map.touchZoomRotate.disableRotation()

        app.story.steps.handle()
        app.story.map.reset()

        let url = 'https://caco.app/coords'

        url += '?'
        url += 'lat=' + center[ 1 ]
        url += '&'
        url += 'lon=' + center[ 0 ]

        let options = { mode : 'cors' }

        fetch( url, options )
          .then( response => response.json() )
          .then( data => {

            app.variables.result = data
            app.element.dataset.wouldVanish = data.user_city.would_vanish

            app.variables.update()

          } )
          .catch( error => console.log( error ) )

      },

      controls : {

        labels : {

          element : document.querySelector( '[name="labels"][type="checkbox"]' ),

          opacity : function( option ) {

            const layers = [
              'settlement-major-label',
              'settlement-minor-label',
              'settlement-subdivision-label',
              'natural-point-label',
              'poi-label',
              'water-point-label',
              'road-label',
              'waterway-label',
              'airport-label',
              'natural-line-label',
              // airport icons
            ]

            let opacity = option ? 1 : 0

            for ( layer of layers )
              map.setPaintProperty( layer, 'text-opacity', opacity )

          },

          toggle : function( boolean ) {

            let input = app.story.map.controls.labels.element

            if ( boolean === input.checked )
              return false

            if ( boolean === undefined )
              input.checked = !input.checked
            else
              input.checked = boolean

            input.dispatchEvent( new Event( 'change' ) )

          },

          initialize : function() {

            app.story.map.controls.labels.element.addEventListener( 'change', function() {

              app.story.map.controls.labels.opacity( this.checked )

            } )

          }

        },

        circle : {

          instance : undefined,

          reset : function () {

            if (map.getLayer('circle')) map.removeLayer('circle')
            if (map.getSource('circle')) map.removeSource('circle')

          },

          toggle : function( option ) {

            let opacity = option ? 1 : 0;
            map.setPaintProperty( 'circle', 'fill-opacity', opacity );

          },

          initialize : function( center, point_on_circle ) {

            app.story.map.controls.circle.reset()

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

            map.addSource(
            	'circle', {
            		'type': 'geojson',
            		'data': circle
            	}
            )

            map.addLayer({
            	'id': 'circle',
            	'type': 'fill',
            	'source': 'circle',
            	'layout': {},
            	'paint': {
            		'fill-outline-color': 'tomato',
            		'fill-color': 'transparent',
            		'fill-opacity': 0
            	}
            })

            app.story.map.controls.circle.instance = circle

          },

          fitOnScreen : function( padding ) {

            let circle = app.story.map.controls.circle.instance

            padding = padding || { top: 112, bottom: 112, left: 16, right: 16 }

          	bbox_circle = turf.bbox(circle);

          	map.fitBounds(bbox_circle, {
          		padding: padding,
          		duration: 6000
          	});
          }

        },

        user : {

          marker : function( center, options ) {

            center = center || app.story.map.user

            let marker = document.querySelector( '.marker' )

            new mapboxgl.Marker( marker )
              .setLngLat( center )
              .addTo( map )

            // if ( options === false )
            //   marker.classList.add( 'hidden' )
            //
            // else if ( options === true )
            //   marker.classList.remove( 'hidden' )

          },

          highlight : function( option ) {

          	let canvas = document.getElementById( 'user' )

          	// Set Canvas dimensions
          	let w = window.innerWidth;
          	let h = window.innerHeight;
          	canvas.width = w;
          	canvas.height = h;

          	// Get drawing context
          	let ctx = canvas.getContext('2d');

          	// animation parameters
          	// set a smaller r_step for slower animation
          	// max_r defines the maximum radius before beginning a new pulse
          	const r = 2;
          	let r_step = 1;
          	let new_r = r;
          	const max_r = 100;
          	const iterations_no = (max_r - r + 1) / r_step

          	const linewidth = 6;
          	const linewidth_step = linewidth / iterations_no;
          	let new_linewidth = linewidth;

          	// init point
          	function init_point( ctx ) {
          		ctx.beginPath();
          		ctx.lineWidth = 1;
          		ctx.strokeStyle = "goldenrod";
          		ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2, false);
          		ctx.stroke();
          	}

          	init_point( ctx );

          	let start;

          	function animate(timestamp) {

          		//in case we want to use a timer to stop the animation
          		if (start === undefined)
          			start = timestamp;
          		const elapsed = timestamp - start;

          		//clear canvas for new iteration
          		ctx.clearRect(0, 0, w, h);

          		//update
          		new_r += r_step;
          		new_linewidth -= linewidth_step;

          		if (new_r > max_r) {
          			new_r = r;
          			new_linewidth = 6;
          		}

          		//redraw user point
          		init_point( ctx )

          		//draw expanding circle with updated parameters
          		ctx.beginPath();
          		ctx.lineWidth = new_linewidth;
          		ctx.strokeStyle = "goldenrod";
          		ctx.arc(w / 2, h / 2, new_r, 0, Math.PI * 2, false);
          		ctx.stroke();

          		//here we would check if the timer is expired beforing requesting another frame
          		request = requestAnimationFrame(animate);
          	}

          	if (option) {
          		console.log("começando...");
          		request = requestAnimationFrame(animate);

          		// get map bounds
          		let bounds = map.getBounds();
          		let coordinates = [
          			[bounds._sw.lng, bounds._ne.lat],
          			[bounds._ne.lng, bounds._ne.lat],
          			[bounds._ne.lng, bounds._sw.lat],
          			[bounds._sw.lng, bounds._sw.lat]
          		];

          		// binds canvas to the map
          		map.addSource('canvas-source', {
          			type: 'canvas',
          			canvas: 'user',
          			coordinates: coordinates,
          			animate: true
          		});

          		map.addLayer({
          			id: 'canvas-layer',
          			type: 'raster',
          			source: 'canvas-source'
          		});
          	} else {
          		console.log("parando...")
          		cancelAnimationFrame(request);
          		if (map.getLayer("canvas-layer")) map.removeLayer("canvas-layer");
          		if (map.getSource("canvas-source")) map.removeSource("canvas-source");
          	}
          }

        },

        people : {

          toggle : function(option) {
          	map.setPaintProperty(
          		'people',
          		'circle-opacity',
          		option ? 1 : 0
          	);
          },

          initialize : function() {
            map.setPaintProperty(
              'people',
              'circle-opacity',
              0
            )
            map.setPaintProperty(
              'people',
              'circle-radius',
              1
            )
            map.moveLayer("people", "national-park")

          },

          overlay : {

            reset : function() {

              if (map.getLayer('overlay')) map.removeLayer('overlay');
              if (map.getSource('overlay')) map.removeSource('overlay');

            },

            toggle : function( option ) {

              let opacity = option ? .5 : 0;
              map.setPaintProperty( 'overlay', 'fill-opacity', opacity );

            },

            initialize : function() {

              app.story.map.controls.people.overlay.reset()

              let radius = app.story.map.radius(
                [0,0],
                [0,0.000001]
              )

              let circle = turf.circle(
                radius.center,
                radius.km
              )

              let mask = turf.mask( circle )

              map.addSource('overlay', {
                'type': 'geojson',
                'data': mask
              })

              map.addLayer({
                'id': 'overlay',
                'type': 'fill',
                'source': 'overlay',
                'paint': {
                  'fill-color': 'black',
                  'fill-opacity': 0
                }
              })

              map.moveLayer('overlay', 'road-label')

            },

          },

          highlight : {

            insideCircle : {

              reset : function() {

                if (map.getLayer('mask')) map.removeLayer('mask');
                if (map.getSource('mask')) map.removeSource('mask');

              },

              toggle : function( option ) {

                let opacity = option ? .66 : 0;
                map.setPaintProperty( 'mask', 'fill-opacity', opacity );

              },

              initialize : function( center, point_on_circle ) {

                app.story.map.controls.people.highlight.insideCircle.reset()

                let radius = app.story.map.radius( center, point_on_circle )

                let circle = turf.circle(
                  radius.center,
                  radius.km
                )

                let mask = turf.mask( circle )

                map.addSource('mask', {
                  'type': 'geojson',
                  'data': mask
                });

                map.addLayer({
                  'id': 'mask',
                  'type': 'fill',
                  'source': 'mask',
                  'paint': {
                    'fill-color': 'black',
                    'fill-opacity': 0
                  }
                });

                map.moveLayer('mask', 'road-label')

              }

            },

            someInsideCircle : {

              zoomToHighlight : function( center ) {

                center = center || app.story.map.user

              	// map.zoomTo(18);

              	let center_pt = turf.point(center);
              	// spreading the first deaths in a 100m radius around user location
              	let mini_circle = turf.circle(center_pt, .1);
              	let mini_circle_bbox = turf.bbox(mini_circle);

              	// map.fitBounds(
              	// 	mini_circle_bbox, {
              	// 		padding: {
              	// 			top: 0,
              	// 			left: 0,
              	// 			right: 0,
              	// 			bottom: 0 // 200
              	// 		}
              	// 	});

              	return mini_circle;
              },

              // remove :  function() {
              // 	if (map.getLayer('first-deaths')) {
              // 		// this will sort of make a small shrinking transition, before removing
              // 		map.setPaintProperty('first-deaths', 'circle-radius', 0);
              // 		map.removeLayer('first-deaths');
              // 		map.removeSource('first-deaths');
              // 		first_47 = undefined; // resets first_47
              // 	}
              // },

              toggle : function( option, name ) {

                console.log( name )

                let opacity = option ? 1 : 0;
                map.setPaintProperty( name, 'circle-opacity', opacity );


                // map.getLayer( name )

              },

              initialize : function( amount, name ) {

                if ( map.getLayer( name ) )
                  return false

                let circle = app.story.map.controls.people.highlight.someInsideCircle.zoomToHighlight()

              	let features_to_avoid = map.queryRenderedFeatures({
              		layers: ["water", "landuse", "national-park"]
              	});

              	let circle_livable;

              	if (features_to_avoid.length > 1) {
              		let poly_features_to_avoid = turf.union(...features_to_avoid);
              		circle_livable = turf.difference(circle, poly_features_to_avoid);
              	} else circle_livable = circle;

              	let bboxCircle = turf.bbox(circle);

              	let random_points = turf.randomPoint(amount, {
              		bbox: bboxCircle
              	});

              	let inside_points = turf.pointsWithinPolygon(random_points, circle_livable);

              	if (inside_points) {
              		if (first_47) {
              			first_47.features = [...first_47.features, ...inside_points.features]
              		} else first_47 = inside_points;
              	}
              	let nof_inside_points = first_47.features.length;
              	let tries = 0;

              	//test if points are inside livable area of circle
              	while (nof_inside_points < amount) {
              		let extra_point = turf.randomPoint(1, {
              			bbox: bboxCircle
              		});
              		let extra_point_within = turf.pointsWithinPolygon(extra_point, circle_livable);
              		if (extra_point_within) {
              			if (first_47) first_47.features = [...first_47.features, ...extra_point_within.features];
              			else first_47 = extra_point_within;
              			nof_inside_points++;
              		}
              		tries++
              		if (tries >= 100) break;
              	};

              	if (!map.getLayer( name )) {
              		map.addSource( name , {
              			'type': 'geojson',
              			'data': first_47
              		});

              		map.addLayer({
              			'id': name,
              			'type': 'circle',
              			'source': name,
              			'paint': {
              				'circle-radius': amount === 1 ? 5 : 3,
              				'circle-color': 'white',
                      'circle-opacity': 0
              			}
              		});
              	} else {
              		map.getSource(name).setData(first_47);
              	}
              }

            }

          }

        },

        location : {

          highlight : function(code) {
          	// pass city code to highlight, or
          	// "" to remove any existing highlights
          	// color is hard-coded in 'fill-outline-color'

          	if (!map.getLayer("highlighted_city")) {
          		map.addLayer({
          			'id': 'highlighted_city',
          			'type': 'fill',
          			'source': 'composite',
          			'source-layer': 'mun-8q037a',
          			'paint': {
          				'fill-opacity': 1,
          				'fill-outline-color': '#d7a565',
          				'fill-color': 'transparent'
          			},
          			'filter': ['==', 'code_muni', '']
          		});
          	}

          	map.setFilter(
          		'highlighted_city', [
          			'==',
          			['get', 'code_muni'],
          			code
          		]);
          },

          fill : function(code) {
          	map.setPaintProperty(
          		'highlighted_city',
          		'fill-color',
          		'#000000'
          	)
          }

        }

      }

    },

    begin : function( center ) {

      if ( app.story.carousel.instance )
        app.story.carousel.instance.destroy()

      app.story.carousel.initialize()

      app.pages.open( 'story' )
      app.story.map.initialize( center )

      app.search.suggestions.clear()
      app.search.form.element.reset()
      app.search.input.element.blur()

      app.story.carousel.instance.update()
      app.story.carousel.instance.keyboard.enable()

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

        grabCursor: true,

        on: {

          init : function () {

          },

          slideChangeTransitionEnd: function () {
            app.story.steps.handle()
          }

        }

      },

      initialize : function() {

        app.story.carousel.instance = new Swiper(
          app.story.carousel.selector,
          app.story.carousel.options
        )

      }

    },

    initialize : function() {

      app.story.map.controls.labels.initialize()

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

    app.variables.initialize()
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
