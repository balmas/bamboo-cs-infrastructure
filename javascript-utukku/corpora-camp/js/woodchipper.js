/*
 * jQuery initialization. Allow for multiple display ports on a page.
 * Each could have its own WebSocket connection. They could be spawned by queries, for visual comparisons.
 */
$(function() {
  window.data_displays = $(".display_port").each(function(){
    $.extend(this, {
      jQ: null,
      data: null,
      ctx:null,
      non_drag_distance: 5,
      circle_size: 2,
      drag_start_x: 0,
      drag_start_y: 0,
      width: 0,
      height: 0,
      select_box: null,
      selected_rect: null,
      data_point_array: [],
      
        init: function(){
          // set up display drawing.
          this.jQ = $(this);
          this.width = this.jQ.width();
          this.height = this.jQ.height();
          
          // element has to be a <canvas>
          this.ctx = this.getContext("2d");
          
          // set up selection interaction.
          this.jQ.after($('<div class="select_box" />'));
          this.jQ.mousedown(this.mousedown);
          this.select_box = $('.select_box', this.parent);
          var canvas = this;
          this.select_box.mouseup(function(event){
            canvas.jQ.unbind("mousemove");
            canvas.select_box.hide();
            canvas.selected_rect = {
              "left": canvas.drag_start_x,
              "top": canvas.drag_start_y,
              "right": canvas.drag_start_x + canvas.select_box.width(),
              "bottom": canvas.drag_start_y + canvas.select_box.height()
            };
            canvas.draw();
          });
          
          // set up click interaction (just one click handler for all points in canvas)
          this.jQ.click(this.click);
          
          // get initial data.
          this.get_data();
        },
      
        get_data: function(){
          var display_port = this;
          $.getJSON('../html/data.json', function(data){ 
            display_port.data = data;
            display_port.data_point_array = [];
            display_port.draw();
          });
        },
      
        draw: function(){
          this.ctx.clearRect(0, 0, this.width, this.height);
          var display_port = this;
          
          
          // if there is a selected_rect, incorporate that into the multipliers.
          var x_multiplier_adj = 1;
          var y_multiplier_adj = 1;
          if (display_port.selected_rect != null){
            x_multiplier_adj = (display_port.width / display_port.select_box.width());
            y_multiplier_adj = (display_port.height / display_port.select_box.height());
          }
          
          // if there is a selected_rect, apply an offset based on its center.
          var x_offset = 0;
          var y_offset = 0;
          if (display_port.selected_rect != null){
            var display_port_pos = display_port.jQ.position();
            var select_box_pos = display_port.select_box.position();
            var select_box_center_x = select_box_pos.left + Math.floor(display_port.select_box.width()/2.0);
            var select_box_center_y = select_box_pos.top + Math.floor(display_port.select_box.height()/2.0);
            var display_port_center_x = display_port_pos.left + Math.floor(display_port.width/2.0);
            var display_port_center_y = display_port_pos.top + Math.floor(display_port.height/2.0);
            x_offset = ((display_port_center_x - select_box_center_x) * (display_port.width / display_port.select_box.width()));
            y_offset = ((display_port_center_y - select_box_center_y) * (display_port.height / display_port.select_box.height()));
          }
          
          $.each(this.data, function(key, val) {
              $.each(val, function(a, b) {
                  $.each(b, function(c, d) {      
                    x = d['x'] + 1;
                    y = d['y'] + 1;
                    
                    x_multiplier = display_port.width / 2.0;
                    y_multiplier = display_port.height / 2.0;
                    
                    x = x * x_multiplier * x_multiplier_adj;
                    y = y * y_multiplier * y_multiplier_adj;
                    
                    x = x - x_offset;
                    y = y - y_offset;
                    
                    display_port.circle(x, y, display_port.circle_size, d['color']);
                    
                    display_port.data_point_array.push({
                      "id": d['id'],
                      "x": x,
                      "y": y,
                    });
                  });
              });
          });
          
          // require another selection to use this.
          this.selected_rect = null;
        },
        
        circle: function(x, y, thickness, color){
          this.ctx.beginPath();
          this.ctx.arc(x, y, thickness, 0, Math.PI*2, true); 
          this.ctx.closePath();
          this.ctx.strokeStyle = color;
          this.ctx.stroke();
        },
        
        mousedown: function(event){
          this.drag_start_x = event.pageX;
          this.drag_start_y = event.pageY;
          this.jQ.mousemove(this.mousemove);
        },
        
        mousemove: function(event){
          if (this.is_real_drag(event)){
            // start dragging the select_box.
            this.select_box.css({ "left":this.drag_start_x , "top":this.drag_start_y, "width":0, "height":0 }).show();
            this.select_box.width(event.pageX - this.drag_start_x);
            this.select_box.height(event.pageY - this.drag_start_y);
          }
        },
        
        is_real_drag: function(event){
          var drag_x = Math.abs(event.pageX - this.drag_start_x);
          var drag_y = Math.abs(event.pageY - this.drag_start_y);
          return ((drag_x > this.non_drag_distance) && (drag_y > this.non_drag_distance))
        },
        
        click: function(event){
          // precaution.
          this.jQ.unbind("mousemove");
          
          var pos = this.jQ.position();
          var click_x = (event.pageX - pos.left);
          var click_y = (event.pageY - pos.top);
          // cycle through points to see if we've clicked on one.
          for (var i=0; i<this.data_point_array.length; i++){
            var data_point = this.data_point_array[i];
            if ((Math.abs(click_x - this.circle_size/2 - data_point['x']) <= this.circle_size) && (Math.abs(click_y - this.circle_size/2 - data_point['y']) <= this.circle_size)){
              alert("id = " + data_point['id']);
              break;
            }
          }
        }
        
    });
  });
  
  $(window.data_displays).each(function(){
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