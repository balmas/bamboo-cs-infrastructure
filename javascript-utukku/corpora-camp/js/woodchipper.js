$(window).load(function () {
	// Creates canvas 320 × 200 at 10, 50
	window.canvas = Raphael("canvas", 1000, 600);
	
  canvas.jQ = $("#canvas");
  
  $.getJSON('../html/data.json', function(data){ 
    canvas.data = data;
    canvas.draw();
  });

  canvas.draw = function(){
      $.each(this.data, function(key, val) {
          $.each(val, function(a, b) {
              $.each(b, function(c, d) {

                  x = d['x'] + 1;
                  y = d['y'] + 1;

                  var circle = canvas.circle(x*500, y*300, 2);
                  circle.attr("stroke", d['color']);
				
				circle.node.id= d['id'];
				circle.node.onclick=function(){alert(this.id)};
              });
          });
      });
  }
  
  
  canvas.zoom = function(){
    this.draw();
  }
  
  // Create select box
	canvas.jQ.selectBox = $('<div/>')
						.appendTo(canvas.jQ)
						.attr('class', 'selector')
						.css('position', 'absolute');
  
  canvas.jQ.mousedown(function (e) {
		canvas.jQ.showSelectBox(e);
	});
	
	canvas.jQ.mousemove(function (e) {
		canvas.jQ.refreshSelectBox(e);
	});
	
	// Shows the select box
	canvas.jQ.showSelectBox = function (e) {
		if (parent.is('.' + config.disabledClass)) {
			return;
		}
    selectBoxOrigin = {}
		selectBoxOrigin.left	= e.pageX - parentDim.left + parent[0].scrollLeft;
		selectBoxOrigin.top		= e.pageY - parentDim.top + parent[0].scrollTop;

		var css = {
			left:		selectBoxOrigin.left + 'px', 
			top:		selectBoxOrigin.top + 'px', 
			width:		'1px', 
			height:		'1px'
		};
		selectBox.addClass(config.activeClass).css(css);
	};

	// Refreshes the select box dimensions and possibly position
	canvas.jQ.refreshSelectBox = function (e) {

		var left		= e.pageX - parentDim.left + parent[0].scrollLeft;
		var top			= e.pageY - parentDim.top + parent[0].scrollTop;
		var newLeft		= left;
		var newTop		= top;
		var newWidth	= selectBoxOrigin.left - newLeft;
		var newHeight	= selectBoxOrigin.top - newTop;

		if (left > selectBoxOrigin.left) {
			newLeft		= selectBoxOrigin.left;
			newWidth	= left - selectBoxOrigin.left;
		}

		if (top > selectBoxOrigin.top) {
			newTop		= selectBoxOrigin.top;
			newHeight	= top - selectBoxOrigin.top;
		}

		var css = {
			left:	newLeft + 'px', 
			top:	newTop + 'px', 
			width:	newWidth + 'px', 
			height:	newHeight + 'px'
		};
		selectBox.css(css);
	};
	
	canvas.jQ.mouseup(function (e) {
		hideSelectBox(e);
    // pass info about our selection rect to the canvas & have it redraw itself.
		canvas.zoom();
	});
	
	
  

});