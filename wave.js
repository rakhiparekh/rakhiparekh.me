var canvas = document.getElementById( "canvas" );
var size = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.requestAnimtionFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback ) {
        window.setTimeout( callback, 1000 / 60 );
    };

var options = {

    color: "#777",
    waveAmplitude: 15,
    waveRadius: 80,
    waveElasticity: 0.95,
    waveStrength: 0.011,
    waveMouse: 15,
    waveMax: 100,
    waveComeUp: function() {},
    waveRiseSpeed: 10,
};

var Mouse = ( function() {

    var exports = {
        x: 0,
        y: 0,
        bind: function( canvas ) {
            canvas.addEventListener( "mousemove", onMouseMove );
        },
        unbind: function( canvas ) {
            canvas.removeEventListener( "mousemove", onMouseMove );
        }
    };

    function onMouseMove( event ) {
        exports.x = event.pageX;
        exports.y = event.pageY;
    }

    return exports;

} )();

var Stage = {
    width: 1,
    height: 1,
    set: function( values ) {
        Stage.width = values.width;
        Stage.height = values.height;
    }
};

var times = function( amount, closure ) {
    for ( var i = 0; i < amount; i++ ) {
        closure( i );
    }
};

var func = function ( name ) {
    return function( obj ) {
        return obj[ name ]();
    };
};


var rand = function( min, max ) {
    return min + ( max - min ) * Math.random();
};

var bezier = function( points, context ) {

    var a, b, x, y;

    for ( var i = 1, length = points.length - 2; i < length; i++ ) {

        a = points[ i ];
        b = points[ i + 1 ];

        x = ( a.x + b.x ) * .5
        y = ( a.y + b.y ) * .5

        context.quadraticCurveTo( a.x, a.y, x, y );
    }

    a = points[ i ];
    b = points[ i + 1 ];

    context.quadraticCurveTo( a.x, a.y, b.x, b.y );
}

var distance = function( a, b ) {
    var x = b.x - a.x;
    var y = b.y - a.y;

    return Math.sqrt( x * x + y * y );
};

var clamp = function( val, min, max ) {
    return val < min ? min : ( val > max ? max : val );
}

var Water = function( context ) {

    var waves;

    function init() {
        options.waveComeUp = this.start.bind( this );
    }

    this.render = function() {
        context.strokeStyle = options.color;
        context.lineWidth = 0.7;
        context.beginPath();

        waves.forEach( func( "render" ) );

        context.stroke();
    };

    this.setSize = function( width, height ) {

        createWaves( height );

        waves.forEach( function( wave ) {
            wave.setSize( width, height );
        } );

    };

    this.start = function() {
        waves.forEach( func( "start" ) );
    };

    function createWaves( height ) {

        waves = [];
        var distance = 55;

        times( height / distance, function( index ) {
            waves.push( new Wave( 0, index * distance + 10, context, rand( 0.18, 0.22 ) * index ) );
        } );

    }

    init.call( this );

};

var Wave = function( originalX, originalY, context, offset ) {

    var anchors;
    var width;
    var height;
    var mouseDirection;
    var oldMouse;
    var x;
    var y;

    function init() {
        x = targetX = originalX;
        y = targetY = originalY;

        anchors = [];
        mouseDirection = { x: 0, y: 0 };

        var anchor;
        var current = 0;
        var start = - options.waveAmplitude;
        var target = options.waveAmplitude;
        var delta = offset;
        var step = 0.4;

        times( 20, function() {
            anchor = new Anchor( current, 0, start, target, delta );
            anchor.setOrigin( current + x, y );

            anchors.push( anchor );

            current += 90;
            delta += step;

            if ( delta > 1 ) {
                times( Math.floor( delta ), function() {
                    delta--;
                    start *= -1;
                    target *= -1;
                } );
            }

        } );
    }

    this.render = function() {

        update();

        context.save();
        context.translate( x, y );

        context.moveTo( anchors[ 0 ].x, anchors[ 0 ].y );
        bezier( anchors, context );

        context.restore();
    };

    this.setSize = function( _width, _height ) {
        width = _width;
        height = _height;

        var step = _width / ( anchors.length - 1 );

        anchors.forEach( function( anchor, i ) {
            anchor.x = step * i;
            anchor.setOrigin( anchor.x, y );
        } );
    };

    this.onAmpChange = function() {
        anchors.forEach( func( "onAmpChange" ) );
    };

    this.start = function() {
        y = height + 300 + originalY * 0.4;
    };

    function update() {
        targetY = Math.min( y, Mouse.y + originalY );
        y += ( targetY - y ) / options.waveRiseSpeed;

        updateMouse();

        anchors.forEach( function( anchor ) {
            anchor.update( mouseDirection, y );
        } );
    }

    function updateMouse() {
        if ( ! oldMouse ) {
            oldMouse = { x: Mouse.x, y: Mouse.y };
            return;
        }

        mouseDirection.x = Mouse.x - oldMouse.x;
        mouseDirection.y = Mouse.y - oldMouse.y;

        oldMouse = { x: Mouse.x, y: Mouse.y };
    }

    init.call( this );

};

var Anchor = function( x, y, start, target, delta ) {

    var spring;
    var motion;
    var origin;

    function init() {
        spring = new Spring();
        motion = new Motion( start, target, delta );
        origin = {};
        this.x = x;
        this.y = y;
    }

    this.update = function( mouseDirection, currentY ) {
        origin.y = currentY;

        var factor = getMultiplier();
        var vector = {
            x: mouseDirection.x * factor * options.waveMouse,
            y: mouseDirection.y * factor * options.waveMouse
        }

        if ( factor > 0 ) {
            spring.shoot( vector );
        }

        spring.update();
        motion.update();

        this.y = motion.get() + spring.y;
    };

    this.onAmpChange = function() {
        motion.onAmpChange();
    };

    this.setOrigin = function( x, y ) {
        origin.x = x;
        origin.y = y;
    };


    function getMultiplier() {
        var lang = distance( Mouse, origin );
        var radius = options.waveRadius;

        return  lang < radius ? 1 - lang / radius : 0;
    }

    init.call( this );

};

var Motion = function( start, target, delta ) {

    var SPEED = 0.02;
    var half;
    var upper;
    var lower;
    var min;
    var max;

    function init() {
        this.onAmpChange();
    }


    this.setRange = function( a, b ) {
        min = a;
        max = b;
    };

    this.update = function() {
        delta += SPEED;

        if ( delta > 1 ) {
            delta = 0;
            start = target;
            target = target < half ? rand( upper, max ) : rand( min, lower );
        }
    };

    this.get = function() {
        var factor = ( Math.cos( ( 1 + delta ) * Math.PI ) + 1 ) / 2;
        return start + factor * ( target - start );
    };

    this.onAmpChange = function() {
        min = - options.waveAmplitude;
        max = options.waveAmplitude;
        half = min + ( max - min ) / 2;
        upper = min + ( max - min ) * .75;
        lower = min + ( max - min ) * .25;
    };


    init.call( this );

};

var Spring = function() {

    var px = 0;
    var py = 0;
    var vx = 0;
    var vy = 0;
    var targetX = 0;
    var targetY = 0;
    var timeout;

    function init() {
        this.x = 0;
        this.y = 0;
    }

    this.update = function() {
        vx = targetX - this.x;
        vy = targetY - this.y;
        px = px * options.waveElasticity + vx * options.waveStrength;
        py = py * options.waveElasticity + vy * options.waveStrength;
        this.x += px;
        this.y += py;
    };

    this.shoot = function( vector ) {
        targetX = clamp( vector.x, -options.waveMax, options.waveMax );
        targetY = clamp( vector.y, -options.waveMax, options.waveMax );

        clearTimeout( timeout );
        timeout = setTimeout( cancelOffset, 100 );
    };

    function cancelOffset() {
        targetX = 0;
        targetY = 0;
    }

    init.call( this );
};

var Canvas = function( canvas, size ) {

    var context;
    var width, height;
    var animations;
    var alive = true;

    function init() {

        context = canvas.getContext( "2d" );

        setTimeout( function() {
            Mouse.bind( canvas );
        }, 1000 );

        Stage.set( size );

        animation = new Water( context );

        this.setSize( size.width, size.height );

        animation.start();

        requestAnimtionFrame( render );
    }

    function render() {
        context.setTransform( 1, 0, 0, 1, 0, 0 );
        context.clearRect( 0, 0, width, height );

        context.save();
        animation.render();
        context.restore();

        requestAnimtionFrame( render );
    }

    this.setSize = function( _width, _height ) {

        canvas.width = Stage.width = width = _width;
        canvas.height = Stage.height = height = _height;

        animation.setSize( _width, _height );
    }

    init.call( this );
};

var app = new Canvas( canvas, size );

window.addEventListener( "resize", function() {
    app.setSize( window.innerWidth, window.innerHeight );
}, false );