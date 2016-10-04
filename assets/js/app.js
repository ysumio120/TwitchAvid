$(document).ready(function() {
	var vidNum = 0;
	var test1 = $("<div>").addClass("col-lg-6");
	test1.appendTo(".player");
	$("<div>").addClass("temp").appendTo(test1);
	
	//TEST
	var test2 = $("<div>").addClass("col-lg-6");
	test2.appendTo(".player");
	$("<div>").addClass("temp").appendTo(test2);
	
	//Activate droppable and accept draggables
	$(test1).droppable({
		addClasses: true,
		accept: ".vid",
		// classes: {
		// 	"ui-droppable-active": "highlight"
		// }
	});
	$(test2).droppable({
		addClasses: true,
		accept: ".vid",
		// classes: {
		// 	"ui-droppable-active": "highlight"
		// }
	});

	/* On success drop, 
	 * 	Append draggable element
	 *	Reset position of draggable element
	 * 	Remove temporary div placeholder
	 *  Remove border styling
	 */
	$(document).on("drop", ".ui-droppable" ,function(event, ui) {
		//$(this).removeAttr("style");
		//$(this).removeClass("test");
		$(this).empty();
		var oldParent = ui.draggable.parent();
		var newTemp = $("<div>");
		newTemp.addClass("temp");
		oldParent.droppable("enable");
		// oldParent.droppable({
		// 	addClasses: true,
		// 	accept: ".vid"
		// });

		newTemp.appendTo(oldParent);
		ui.draggable.appendTo(this);
		ui.draggable.css("left", 0);
		ui.draggable.css("top", 0);

		ui.draggable.parent().droppable("disable");
	});

	//If draggable element is not fully dropped, return back to original position
	// $(document).on("dropdeactivate", ".ui-droppable",function(event, ui) {
	// 	//$(this).children().removeAttr("style");
	// 	ui.draggable.css("left", 0);
	// 	ui.draggable.css("top", 0);
	// });

	$("#startStream").on("click", function() {
		var streamer = $("#streamer").val();
		var query = "https://api.twitch.tv/kraken/streams/" + streamer;

		$.ajax({
			url: query, 
			method: 'GET', 
			headers: {
				"Client-ID": "q0ojsiq3xgiqjopism2gu3z35py99jg"
			},
			error : function(jqXHR, textStatus, errorThrown) { 
    			if(jqXHR.status == 404 || errorThrown == 'Not Found') { 
       				console.log('There was a 404 error.'); 
    			}
			}
		}).done(function(response) {
			console.log(response);
			if(!response.stream) {
				console.log("NO RESPONSE");
				return;
			}
			var channelAPI = response._links.self;
			console.log(channelAPI);
			var streamName = response.stream.channel.name;
			console.log(streamName);


			var vid_container = $("<div>");
			vid_container.addClass("col-lg-6");
			//vid_container.attr("id", "vid" + vidNum);
			vid_container.appendTo(".player");
			vid_container.droppable({
				addClasses: true,
				accept: ".vid",
				// classes: {
				// "ui-droppable-active": "highlight"
				// }
			});
			vid_container.droppable("disable");
			vidNum++;
			var vidEmbed = $("<div>");
			vidEmbed.attr("id", streamName + vidNum);
			vidEmbed.addClass("vid");
			vidEmbed.data("name", streamName);
			vidEmbed.appendTo(vid_container);

			//Move cursor img for draggable handle
			var move = $("<img>");
			move.attr("src", "assets/images/move_cursor.png");
			move.appendTo(".vid");

			// Configure options for iframe embed
			var options = {
			//	width: 720,
			//	height: 400,
				channel: streamName
			};

			// Create interactive Iframe Embed
			var player = new Twitch.Player(streamName + vidNum, options);
			
			$(".vid").draggable({
				addClasses: true,
			//	opacity: 0.50,
				revert: "invalid",
				revertDuration: 100,
				scroll: false,
				handle: "img",
				appendTo: "body",
				helper: function() {

					// Get current size of embed video
					var width = $(this).innerWidth();
					var height = $(this).innerHeight();
					console.log(width);
					console.log(height);
					// Make copy of embed element and its container
					var clone = $(this).parent().clone();
					
					// Create 'shadow' of element with same dimensions
					clone.children().empty();
					clone.children().css("width", width);
					clone.children().css("height", height);
					clone.children().css("background-color", "grey");
					//clone.css({"display","none"});
					return clone;
				},
				containment: "parent",
				scrollSpeed: 10
			});
		});

		$("#streamer").val("");
		return false;
	});

	$("#startChat").on("click", function() {
		var streamer = $("#chat").val();
		var query = "http://www.twitch.tv/" + streamer + "/chat";

		var chat = $("<iframe></iframe>");
		chat.attr("frameborder", "0");
		chat.attr("scrolling", "no");
		chat.attr("id", "chat-embed");
		chat.attr("height", 400);
		chat.attr("src", query);

		var chatEmbed = $("<div>");
		chatEmbed.attr("id", "chat" + vidNum);
		chatEmbed.addClass("col-lg-6");
		chat.appendTo(chatEmbed);

		console.log(chatEmbed);
		chatEmbed.appendTo(".player");
	});


});