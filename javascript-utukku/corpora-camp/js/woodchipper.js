/*
 * jQuery initialization. Allow for multiple display ports on a page.
 * Each could have its own WebSocket connection. They could be spawned by queries, for visual comparisons.
 */
$(function() {
  window.data_displays = $(".display_port").each(function(){
    $.extend(this, {
      jQ: null,
      data: null,
      drawer:null,
      width: 0,
      height: 0,
      select_box: null,
      
        init: function(){
          // set up display drawing.
          this.jQ = $(this);
          this.width = this.jQ.width();
          this.height = this.jQ.height();
          
          // create a Raphael object based on the element
          this.drawer = Raphael(this, this.width, this.height);
          
          // set up interaction.
          this.jQ.mousedown(this.mousedown);
          this.jQ.append($('<div class="select_box" />'));
          this.select_box = $('.select_box', this);
          
          // get initial data.
          this.get_data();
        },
      
        get_data: function(){
          var display_port = this;
          $.getJSON('../html/data.json', function(data){ 
            display_port.data = data;
            display_port.draw();
          });
        },
      
        draw: function(){
          var display_port = this;
          $.each(this.data, function(key, val) {
              $.each(val, function(a, b) {
                  $.each(b, function(c, d) {      
                    x = d['x'] + 1;
                    y = d['y'] + 1;
                    
                    x_multiplier = display_port.width / 2.0;
                    y_multiplier = display_port.height / 2.0;

                    var circle = display_port.drawer.circle(x*x_multiplier, y*y_multiplier, 2);
                    circle.attr("stroke", d['color']);

                    circle.node.id= d['id'];
                    circle.node.onclick=function(){alert(this.id)};
                  });
              });
          });
        },
        
        mousedown: function(event){
          this.select_box.css({ "left":event.pageX , "top":event.pageY }).show();
          this.jQ.mousemove(this.mousemove);
        },
        
        mousemove: function(event){
          var pos = this.select_box.position();
          this.select_box.width(event.pageX - pos.left);
          this.select_box.height(event.pageY - pos.top);
          this.jQ.mouseup(this.mouseup);
        },
        
        mouseup: function(event){
          var pos = this.select_box.position();
          var selected_rect = {
            "left": pos.left,
            "top": pos.top,
            "right": pos.left + this.select_box.width(),
            "bottom": pos.top + this.select_box.height()
          };
          this.select_box.hide();
          alert("selected_rect: " + unpack(selected_rect));
        }
    });
    
    this.init();
  });
});


// Utils.

function unpack(obj, delimiter){
  if (obj == undefined){ return "undefined" };
	var report = new Array();
	for (var m in obj){
		var member = obj[m];
		if (!(member instanceof Function)){
			if (member != undefined){ report.push(m +":"+ member); }
		}
	}
	delimiter = delimiter || "\t";
	return report.join(delimiter);
}



// 
// 
// canvas.zoom = function(){
//   this.draw();
// }

// // Create select box
// canvas.jQ.selectBox = $('<div/>')
//          .appendTo(canvas.jQ)
//          .attr('class', 'selector')
//          .css('position', 'absolute');
// 
// canvas.jQ.mousedown(function (e) {
//  canvas.jQ.showSelectBox(e);
// });
// 
// canvas.jQ.mousemove(function (e) {
//  canvas.jQ.refreshSelectBox(e);
// });
// 
// // Shows the select box
// canvas.jQ.showSelectBox = function (e) {
//  if (parent.is('.' + config.disabledClass)) {
//    return;
//  }
//   selectBoxOrigin = {}
//  selectBoxOrigin.left  = e.pageX - parentDim.left + parent[0].scrollLeft;
//  selectBoxOrigin.top   = e.pageY - parentDim.top + parent[0].scrollTop;
// 
//  var css = {
//    left:   selectBoxOrigin.left + 'px', 
//    top:    selectBoxOrigin.top + 'px', 
//    width:    '1px', 
//    height:   '1px'
//  };
//  selectBox.addClass(config.activeClass).css(css);
// };
// 
// // Refreshes the select box dimensions and possibly position
// canvas.jQ.refreshSelectBox = function (e) {
// 
//  var left    = e.pageX - parentDim.left + parent[0].scrollLeft;
//  var top     = e.pageY - parentDim.top + parent[0].scrollTop;
//  var newLeft   = left;
//  var newTop    = top;
//  var newWidth  = selectBoxOrigin.left - newLeft;
//  var newHeight = selectBoxOrigin.top - newTop;
// 
//  if (left > selectBoxOrigin.left) {
//    newLeft   = selectBoxOrigin.left;
//    newWidth  = left - selectBoxOrigin.left;
//  }
// 
//  if (top > selectBoxOrigin.top) {
//    newTop    = selectBoxOrigin.top;
//    newHeight = top - selectBoxOrigin.top;
//  }
// 
//  var css = {
//    left: newLeft + 'px', 
//    top:  newTop + 'px', 
//    width:  newWidth + 'px', 
//    height: newHeight + 'px'
//  };
//  selectBox.css(css);
// };
// 
// canvas.jQ.mouseup(function (e) {
//  hideSelectBox(e);
//   // pass info about our selection rect to the canvas & have it redraw itself.
//  canvas.zoom();
// });
// 
