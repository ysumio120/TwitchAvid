$(document).ready(function() {
	var vidNum = 0;
	$("<div>").addClass("test col-lg-6").prependTo(".player");
	$("<div>").addClass("temp").appendTo(".test");

	//Activate droppable and accept draggables
	$(".test").droppable({
		addClasses: true,
		accept: ".vid",
	});

	/* On success drop, 
	 * 	Append draggable element
	 *	Reset position of draggable element
	 * 	Remove temporary div placeholder
	 *  Remove border styling
	 */
	$(".test").on("drop", function(event, ui) {
		$(this).removeAttr("style");
		$(this).removeClass("test");
		$(this).empty();
		ui.draggable.appendTo(this);
		ui.draggable.css("left", 0);
		ui.draggable.css("top", 0);
	});

	//If draggable element is not fully dropped, return back to original position
	$(".test").on("dropdeactivate", function(event, ui) {
		$(this).children().removeAttr("style");
		ui.draggable.css("left", 0);
		ui.draggable.css("top", 0);
	});

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
			
			vidEmbed.draggable({
				addClasses: true,
				opacity: 0.50,
			//	revert: "invalid",
			//	revertDuration: 100,
				handle: "img",
			//	iframeFix: true,
				helper: function() {

					// Get current size of embed video
					var width = vid_container.children().innerWidth();
					var height = vid_container.children().innerHeight();
					
					// Make copy of embed element and its container
					var clone = vid_container.clone();
					
					// Create 'shadow' of element with same dimensions
					clone.children().empty();
					clone.children().css("width", width);
					clone.children().css("height", height);
					clone.children().css("background-color", "grey");

					return clone;
				}
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