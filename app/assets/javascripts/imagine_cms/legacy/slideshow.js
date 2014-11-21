/********************************
 * custom effects               *
 ********************************/

Effect.BlindRight = function(element) {
  element = $(element);
  var oldWidth = Element.getStyle(element, 'width');
  var elementDimensions = Element.getDimensions(element);
  return new Effect.Scale(element, 100, 
    Object.extend({
        scaleContent: false,
        scaleY: false,
        scaleFrom: 0,
        scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
        restoreAfterFinish: true,
        afterSetup: function(effect) { with(Element) {
          makeClipping(effect.element);
            setStyle(effect.element, {width: '0px'});
            show(effect.element);
          }}
    }, arguments[1] || {})
  );
}

Effect.SlideAppear = function(element) {
    element = $(element);
    new Effect.Appear(element, arguments[2] || arguments[1] || {});
    new Effect.BlindRight(element, arguments[1] || {});
}

/********************************
 * slideshow functions          *
 ********************************/

var currentSlideIndex = 0;
var maxSlideIndex = -1;

function getNumSlides() {
    if (maxSlideIndex > -1) return maxSlideIndex;
    maxSlideIndex = 0;
    
    while ($('img_slideshow' + maxSlideIndex)) maxSlideIndex++;
    return maxSlideIndex;
}

function nextSlide(delay, transition) {
    if (typeof(transition) == 'undefined') transition = 'SlideAppear';
    changeSlide(delay, transition, 1);
}

function prevSlide(delay, transition) {
    if (typeof(transition) == 'undefined') transition = 'SlideAppear';
    changeSlide(delay, transition, -1);
}

// controls elements named img_slideshowX
// uses a global named currentSlideIndex to keep track of its state
// uses a global named maxSlideIndex to cache the discovered maximum slide index
function changeSlide(delay, transition, increment) {
    try {
        if (typeof(delay) == 'undefined') delay = -1;
        if (typeof(transition) == 'undefined') transition = 'SlideAppear';
        
        // this element is used for positioning
        origimg = $('img_slideshow');
        
        nextSlideIndex = currentSlideIndex + increment;
        if (!$('img_slideshow' + nextSlideIndex)) {
            if (increment > 0) {
                nextSlideIndex = 0;
            } else {
                nextSlideIndex = getNumSlides() - 1;
            }
        }
        
        if ((curimg  = $('img_slideshow' + currentSlideIndex)) &&
            (nextimg = $('img_slideshow' + nextSlideIndex))) {
            // push old images back
            for (var i = 0; i < getNumSlides(); i++) {
                $('img_slideshow' + i).style.zIndex = ((increment > 0) ? i : (getNumSlides() - i));
            }
            nextimg.style.zIndex = '90';
            nextimg.style.margin = '0';
            
            // really shouldn't have to do this, but I just can't figure it out...
            curimg.style.zIndex  = '89';
            
            // drag the new image over the main image
            var coords = getElementPosition(origimg);
            nextimg.style.position = 'absolute';
            nextimg.style.left = coords[0] + 'px';
            nextimg.style.top  = coords[1] + 'px';
            
            eval('Effect.' + transition + '(nextimg.id, { duration: 1.8 });');
            setTimeout('$("' + curimg.id + '").style.display = "none"', 1900);
            if (delay > 0) setTimeout('changeSlide(' + delay + ', "' + transition + '", ' + increment + ');', delay);
            
            currentSlideIndex = nextSlideIndex;
        }
    } catch (e) {}
}

// positions slide navigation elements (named btn_slidenext and btn_slideprev)
// relative to img_slideshow (x and y are the relative offsets)
function positionSlideNav(x, y) {
    try {
        img = $('img_slideshow');
        nav = $('div_slidenav');
        
        // move the buttons to their proper places
        nav.style.zIndex = '95';
        nav.style.position = 'relative';
        nav.style.left = x + 'px';
        nav.style.top  = y + 'px';
    } catch (e) {}
}
