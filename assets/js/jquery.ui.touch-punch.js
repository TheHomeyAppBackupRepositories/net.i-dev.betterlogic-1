/*!
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */

(function ($, Homey) {
    $.selectedTouchElement = null;
    // Detect touch support
    $.support.touch = 'ontouchend' in document;
  
    // Ignore browsers without touch support
    if (!$.support.touch) {
      return;
    }
  
    var mouseProto = $.ui.mouse.prototype,
        _mouseInit = mouseProto._mouseInit,
        _mouseDestroy = mouseProto._mouseDestroy,
        touchHandled, touchHandledMove;
  
    /**
     * Simulate a mouse event based on a corresponding touch event
     * @param {Object} event A touch event
     * @param {String} simulatedType The corresponding mouse event
     */
    function simulateMouseEvent (event, simulatedType, preventDefault) {
  
      // Ignore multi-touch events
      if (event.originalEvent.touches.length > 1) {
        return;
      }
  
      if(preventDefault) event.preventDefault();
  
      var touch = event.originalEvent.changedTouches[0],
          simulatedEvent = document.createEvent('MouseEvents');
      
      // Initialize the simulated mouse event using the touch event's coordinates
      simulatedEvent.initMouseEvent(
        simulatedType,    // type
        true,             // bubbles                    
        true,             // cancelable                 
        window,           // view                       
        1,                // detail                     
        touch.screenX,    // screenX                    
        touch.screenY,    // screenY                    
        touch.clientX,    // clientX                    
        touch.clientY,    // clientY                    
        false,            // ctrlKey                    
        false,            // altKey                     
        false,            // shiftKey                   
        false,            // metaKey                    
        0,                // button                     
        null              // relatedTarget              
      );
  
      // Dispatch the simulated event to the target element
      event.target.dispatchEvent(simulatedEvent);
    }
  
    /**
     * Handle the jQuery UI widget's touchstart events
     * @param {Object} event The widget element's touchstart event
     */
    mouseProto._touchStart = function (event) {
  
      var self = this;

      
      // Ignore the event if another widget is already being handled
      if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
        return;
      }
      
      
      if(!$.selectedTouchElement || $.selectedTouchElement!=event.target) {
        touchHandledMove = false;
        $.selectedTouchElement=event.target;
        //return;
      } else touchHandledMove = true;
      
      


      // Set the flag to prevent other widgets from inheriting the touch event      
      touchHandled = true;
      

      this.screenX = event.originalEvent.changedTouches[0].screenX;
      this.screenY = event.originalEvent.changedTouches[0].screenY;
  
      // Track movement to determine if interaction was a click
      self._touchMoved = false;
      
      
      this.touchedStarted = Date.now();
      if(this.startTimer) {
        clearTimeout(this.startTimer);
        delete this.startTimer;
      }
      this.startTimer = setTimeout(()=> {
        if (!this._touchMoved && this.touchedStarted && Date.now() - this.touchedStarted >=500) {        
            
                // Simulate the mouseup event
                simulateMouseEvent(event, 'mouseup', true);

                // Simulate the click event
                simulateMouseEvent(event, 'contextmenu', true);            
                this.touchedStarted = Date.now();
                touchHandled = false;
                touchHandledMove = false;
            
                // // Simulate the mouseout event
                // simulateMouseEvent(event, 'mouseout', true);
              }
          } , 500);

  
      // Simulate the mouseover event
      simulateMouseEvent(event, 'mouseover', true);
  
      // Simulate the mousemove event
      simulateMouseEvent(event, 'mousemove', true);
  
      // Simulate the mousedown event
      simulateMouseEvent(event, 'mousedown', true);
      
    };
  
    /**
     * Handle the jQuery UI widget's touchmove events
     * @param {Object} event The document's touchmove event
     */
    mouseProto._touchMove = function (event) {
  
      // Ignore event if not handled
      let margin = 10;
      let diffX = -1;
      let diffY = -1;
        try {
            diffX = this.screenX - event.originalEvent.changedTouches[0].screenX;
        } catch (error) {}
        try {
            diffY = this.screenY - event.originalEvent.changedTouches[0].screenY;
        } catch (error) {}

        if(diffY>margin || diffY<-margin || diffX>margin || diffX<-margin) ;
        else return;

      // Interaction was not a click
      this._touchMoved = true;
      this.touchedEnded = null;
      this.touchedStarted = null;

        if (!touchHandledMove) {
            return;
        }
    
        //Homey.alert(diffX);
    //   Homey.alert(
    //     this.screenX - event.originalEvent.changedTouches[0].screenX > 5 || this.screenX -event.originalEvent.changedTouches[0].screenX < -5  ||
    //     this.screenY - event.originalEvent.changedTouches[0].screenY > 5 || this.screenY -event.originalEvent.changedTouches[0].screenY < -5 );
      
        
      // Simulate the mousemove event
      simulateMouseEvent(event, 'mousemove', true);
      this.screenX = event.originalEvent.changedTouches[0].screenX;
      this.screenY = event.originalEvent.changedTouches[0].screenY;

    };
  
    /**
     * Handle the jQuery UI widget's touchend events
     * @param {Object} event The document's touchend event
     */
    mouseProto._touchEnd = function (event) {
  
        this.screenX = -1;
        this.screenY = -1;
      // Ignore event if not handled
      if (!touchHandled) {
        return;
      }
      this.touchedStarted = null;
      // Simulate the mouseup event
      simulateMouseEvent(event, 'mouseup', true);
  
      // Simulate the mouseout event
      simulateMouseEvent(event, 'mouseout', true);
  
      // If the touch interaction did not move, it should trigger a click
      if (!this._touchMoved) {
  
        // Simulate the click event
        simulateMouseEvent(event, 'click', true);

        if(this.touchedEnded && Date.now() - this.touchedEnded <=300) {        
            // Simulate the click event
            simulateMouseEvent(event, 'dblclick', true);  
          } 
        //   else if(this.touchedStarted && Date.now() - this.touchedStarted >=300) {        
        //     // Simulate the click event
        //     simulateMouseEvent(event, 'contextmenu', true);            
        //     this.touchedStarted = Date.now();
    
        //   }
      }
  
      this.touchedEnded = Date.now();
      // Unset the flag to allow other widgets to inherit the touch event
      touchHandled = false;
      touchHandledMove = false;
    };
  
    /**
     * A duck punch of the $.ui.mouse _mouseInit method to support touch events.
     * This method extends the widget with bound touch event handlers that
     * translate touch events to mouse events and pass them to the widget's
     * original mouse event handling methods.
     */
    mouseProto._mouseInit = function () {
      
      var self = this;
  
      // Delegate the touch handlers to the widget's element
      self.element.bind({
        touchstart: $.proxy(self, '_touchStart'),
        touchmove: $.proxy(self, '_touchMove'),
        touchend: $.proxy(self, '_touchEnd')
      });
  
      // Call the original $.ui.mouse init method
      _mouseInit.call(self);
    };
  
    /**
     * Remove the touch event handlers
     */
    mouseProto._mouseDestroy = function () {
      
      var self = this;
  
      // Delegate the touch handlers to the widget's element
      self.element.unbind({
        touchstart: $.proxy(self, '_touchStart'),
        touchmove: $.proxy(self, '_touchMove'),
        touchend: $.proxy(self, '_touchEnd')
      });
  
      // Call the original $.ui.mouse destroy method
      _mouseDestroy.call(self);
    };
  
  })(jQuery, Homey);