var A = A || {};

/*--------------------------------------------------------------------------
  User Interface Methods
/*------------------------------------------------------------------------*/

A.UserInterface = {

  tabs: function () {

    jQuery('.tabs').each(function() {

      var activeClass = 'active',
        $t = jQuery('> ul li', this),
        $c = jQuery('.tab', this);

      $t.click(function() {
        $t.removeClass(activeClass);
        jQuery(this).addClass(activeClass);
        $c.removeClass(activeClass);
        $c.eq(jQuery(this).index()).addClass(activeClass);
        return false;
      });
    });
  },

  togglers: function () {

    jQuery('.toggle').on('click prepare', 'h4', function(ev) {

      // prepare:
      var $h4 = jQuery(this);
      $h4.siblings('.toggle-inner').slideToggle('fast');

      if (ev.type == 'click') {
        var $t = $h4.parent();
        // accordion:
        if ($t.hasClass('acc')) $t.siblings('.open.toggle.acc:first').find('h4').trigger('click');
        // classes:
        $t.toggleClass('open');
    }});

    jQuery('.toggle:not(.open) h4').trigger('prepare');
  },

  contactForm: function() { // contact form client logic

    if (!jQuery('#contact').length) return;

    var
      errClass = 'err',
      $form = jQuery('#contact'),
      $msg = $form.find('textarea[name="msg"]'),
      msgDef = $msg.val(),
      $name = $form.find('input[name="name"]'),
      nameDef = $name.val(),
      $mail = $form.find('input[name="mail"]'),
      mailDef = $mail.val(),
      $send = $form.find('input[type="submit"]'),
      $submitAlt = jQuery('<a/>', { href: "#", text: $send.val(), 'class': 'classic button' });

    // prepare
    $msg.attr('rows', 1).elastic().blur();
    $send.replaceWith($submitAlt);

    // emulating placeholders
    var placeholder = function($obj,dflt) {
      $obj
        .val(dflt)
        .focus(function(){ if ($obj.val() == dflt) $obj.val(''); $obj.removeClass(errClass); })
        .blur(function(){ if (!$obj.val()) $obj.val(dflt); });
    };
    placeholder($name, nameDef);
    placeholder($mail, mailDef);
    placeholder($msg, msgDef);

    // click event
    $submitAlt.click(function(ev){
      ev.preventDefault();

      var
        error = false,
        noText = function(c,dflt){ if (c.jquery) c=c.val(); return !(jQuery.trim(c).length && c!=dflt) },
        noMail = function(c) { if (c.jquery) c=c.val(); return !(c.match(/[a-zA-Z0-9_\.\-]+\@([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9]{2,4}/)); };

      if (noText($msg,msgDef)) { $msg.addClass(errClass); error = true; }
      else $msg.removeClass(errClass);

      if (noText($name,nameDef)) { $name.addClass(errClass); error = true; }
      else $name.removeClass(errClass);

      if (noText($mail,mailDef) || noMail($mail)) { $mail.addClass(errClass); error = true; }
      else $mail.removeClass(errClass);
      
      if (error) return;
      
      $submitAlt.remove();
      jQuery.post($form.attr('action'), $form.serialize(), function (resp) {
          // resp = $(resp).find('#email-response').html();
          if (resp) $form.fadeOut(function () {
              $form.replaceWith(resp).fadeIn();
          });
      });

    });
  },

  mobileMenu: function() {
    var id = '#menu-list-mobile';
    if (!jQuery(id).length) return;

    jQuery(id).change(function() {
      var v = jQuery(this).val();
      if (v) location.href = v;
    });
  },

  autoLoad: function () {

    this.contactForm();
    this.mobileMenu();
    this.tabs();
    this.togglers();
  }
};

/*--------------------------------------------------------------------------
  Google Map Wrapper
/*------------------------------------------------------------------------*/

A.GMap = {

  latitude: 51.508129,
  longitude: -0.128005,
  hue: '#3e3432',

  setup: function() {

    this.atts = this.$map.data();
    this.center = new google.maps.LatLng(this.atts.lat || this.latitude, this.atts.long || this.longitude);
    
    var opts = {
      center: this.center,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      scrollwheel: false,
      zoom: 17
    };
    this.map = new google.maps.Map(this.$map[0], opts);
    
    var m = new google.maps.Marker({
        map: this.map,
        position: this.center,
        icon: new google.maps.MarkerImage('img/marker.png', new google.maps.Size(61, 61), new google.maps.Point(0, 0), new google.maps.Point(31, 31))});
    
    var s = [{ stylers: [{ hue: this.atts.hue || this.hue }, {saturation: -90}, {visibility: 'simplified'}, {weight: 8}, {gamma: .3}] }];
    var t = new google.maps.StyledMapType(s, { name: 'Grayscale' });
    
    this.map.mapTypes.set('map', t);
    this.map.setMapTypeId('map');
  },

  onResize: function() {
    this.map && this.map.setCenter(this.center);
  },

  autoLoad: function() {

    this.$map = jQuery('#map');
    this.$map.length && this.setup();

    jQuery(window).resize(function(){ A.GMap.onResize(); });
  }
};

/*--------------------------------------------------------------------------
  Run 3rd-party jQuery Plugins
/*------------------------------------------------------------------------*/

A.JQueryPlugins = {

  autoLoad: function () {
  
    jQuery('ul#slides').responsiveSlides({
      auto: false,
      nav: true,
      pager: true,
      speed: 200,
      timeout: 5000
    });

    if (jQuery.fn.fitVids) jQuery('.media-container').fitVids();
  }
};

/*--------------------------------------------------------------------------
  Init jQuery & A Object
/*------------------------------------------------------------------------*/

; (function(){jQuery.noConflict();jQuery(document).ready(function(){for(var p in A)A.hasOwnProperty(p)&&A[p]&&A[p].autoLoad&&A[p].autoLoad()})})(jQuery);

/*--------------------------------------------------------------------------
  Packed 3rd-party jQuery Plugins
/*------------------------------------------------------------------------*/

// http://responsiveslides.com v1.32 by @viljamis
; (function(d,D,v){d.fn.responsiveSlides=function(h){var b=d.extend({auto:!0,speed:1E3,timeout:4E3,pager:!1,nav:!1,random:!1,pause:!1,pauseControls:!1,prevText:"Previous",nextText:"Next",maxwidth:"",controls:"",namespace:"rslides",before:function(){},after:function(){}},h);return this.each(function(){v++;var e=d(this),n,p,i,k,l,m=0,f=e.children(),w=f.size(),q=parseFloat(b.speed),x=parseFloat(b.timeout),r=parseFloat(b.maxwidth),c=b.namespace,g=c+v,y=c+"_nav "+g+"_nav",s=c+"_here",j=g+"_on",z=g+"_s",o=d("<ul class='"+c+"_tabs "+g+"_tabs' />"),A={"float":"left",position:"relative"},E={"float":"none",position:"absolute"},t=function(a){b.before();f.stop().fadeOut(q,function(){d(this).removeClass(j).css(E)}).eq(a).fadeIn(q,function(){d(this).addClass(j).css(A);b.after();m=a})};b.random&&(f.sort(function(){return Math.round(Math.random())-0.5}),e.empty().append(f));f.each(function(a){this.id=z+a});e.addClass(c+" "+g);h&&h.maxwidth&&e.css("max-width",r);f.hide().eq(0).addClass(j).css(A).show();if(1<f.size()){if(x<q+100)return;if(b.pager){var u=[];f.each(function(a){a=a+1;u=u+("<li><a href='#' class='"+z+a+"'>"+a+"</a></li>")});o.append(u);l=o.find("a");h.controls?d(b.controls).append(o):e.after(o);n=function(a){l.closest("li").removeClass(s).eq(a).addClass(s)}}b.auto&&(p=function(){k=setInterval(function(){f.stop(true,true);var a=m+1<w?m+1:0;b.pager&&n(a);t(a)},x)},p());i=function(){if(b.auto){clearInterval(k);p()}};b.pause&&e.hover(function(){clearInterval(k)},function(){i()});b.pager&&(l.bind("click",function(a){a.preventDefault();b.pauseControls||i();a=l.index(this);if(!(m===a||d("."+j+":animated").length)){n(a);t(a)}}).eq(0).closest("li").addClass(s),b.pauseControls&&l.hover(function(){clearInterval(k)},function(){i()}));if(b.nav){c="<a href='#' class='"+y+" prev'>"+b.prevText+"</a><a href='#' class='"+y+" next'>"+b.nextText+"</a>";h.controls?d(b.controls).append(c):e.after(c);var c=d("."+g+"_nav"),B=d("."+g+"_nav.prev");c.bind("click",function(a){a.preventDefault();if(!d("."+j+":animated").length){var c=f.index(d("."+j)),a=c-1,c=c+1<w?m+1:0;t(d(this)[0]===B[0]?a:c);b.pager&&n(d(this)[0]===B[0]?a:c);b.pauseControls||i()}});b.pauseControls&&c.hover(function(){clearInterval(k)},function(){i()})}}if("undefined"===typeof document.body.style.maxWidth&&h.maxwidth){var C=function(){e.css("width","100%");e.width()>r&&e.css("width",r)};C();d(D).bind("resize",function(){C()})}})}})(jQuery,this,0);
// Elastic by Jan Jarfalk unwrongest.com MIT License http://www.opensource.org/licenses/mit-license.php
; (function($){jQuery.fn.extend({elastic:function(){var g=['paddingTop','paddingRight','paddingBottom','paddingLeft','fontSize','lineHeight','fontFamily','width','fontWeight','border-top-width','border-right-width','border-bottom-width','border-left-width','borderTopStyle','borderTopColor','borderRightStyle','borderRightColor','borderBottomStyle','borderBottomColor','borderLeftStyle','borderLeftColor'];return this.each(function(){if(this.type!=='textarea'){return false}var f=jQuery(this),$twin=jQuery('<div />').css({'position':'absolute','display':'none','word-wrap':'break-word','white-space':'pre-wrap'}),lineHeight=parseInt(f.css('line-height'),10)||parseInt(f.css('font-size'),'10'),minheight=parseInt(f.css('height'),10)||lineHeight*3,maxheight=parseInt(f.css('max-height'),10)||Number.MAX_VALUE,goalheight=0;if(maxheight<0){maxheight=Number.MAX_VALUE}$twin.appendTo(f.parent());var i=g.length;while(i--){$twin.css(g[i].toString(),f.css(g[i].toString()))}function setTwinWidth(){var a=Math.floor(parseInt(f.width(),10));if($twin.width()!==a){$twin.css({'width':a+'px'});update(true)}}function setHeightAndOverflow(a,b){var c=Math.floor(parseInt(a,10));if(f.height()!==c){f.css({'height':c+'px','overflow':b})}}function update(a){var b=f.val().replace(/&/g,'&amp;').replace(/ {2}/g,'&nbsp;').replace(/<|>/g,'&gt;').replace(/\n/g,'<br />');var c=$twin.html().replace(/<br>/ig,'<br />');if(a||b+'&nbsp;'!==c){$twin.html(b+'&nbsp;');if(Math.abs($twin.height()+lineHeight-f.height())>3){var d=$twin.height()+lineHeight;if(d>=maxheight){setHeightAndOverflow(maxheight,'auto')}else if(d<=minheight){setHeightAndOverflow(minheight,'hidden')}else{setHeightAndOverflow(d,'hidden')}}}}f.css({'overflow':'hidden'});f.bind('keyup change cut paste',function(){update()});$(window).bind('resize',setTwinWidth);f.bind('resize',setTwinWidth);f.bind('update',update);f.bind('blur',function(){if($twin.height()<maxheight){if($twin.height()>minheight){f.height($twin.height())}else{f.height(minheight)}}});f.bind('input paste',function(e){setTimeout(update,250)});update()})}})})(jQuery);

