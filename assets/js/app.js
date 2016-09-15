$(document).ready(function() {
	var vidNum = 0;

	$("#startStream").on("click", function() {
		var streamer = $("#streamer").val();
		var query = "https://api.twitch.tv/kraken/streams/" + streamer;

		$.ajax({
			url: query, 
			method: 'GET', 
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
			vidEmbed.draggable({addClasses: true});
			vidEmbed.addClass("vid");
			vidEmbed.data("name", streamName);
			var options = {
				width: 720,
				height: 400,
				channel: streamName
			};

			vidEmbed.appendTo(vid_container);
			console.log(vidEmbed);
			var player = new Twitch.Player(streamName + vidNum, options);

			//$(vidEmbed).children().draggable({addClasses: true});
			

			console.log(vid_container);

			//Activate droppable and accept draggables
			$(".test").droppable({addClasses: true});
			$(".test").droppable({accept: ".vid"});

			//Append draggable element and reset position
			$(".test").on("drop", function(event, ui) {
				ui.draggable.appendTo(this);
				$(this).removeClass("test");
				ui.draggable.css("left", 0);
				ui.draggable.css("top", 0);
			});

			//When dragging, highlight 'dropzone'
			$(".test").on("dropactivate", function(event, ui) {
				$(this).css({"border": "5px solid black"});
			});

			//If draggable element is not fully dropped, return back to original position
			$(".test").on("dropdeactivate", function(event, ui) {
				ui.draggable.css("left", 0);
				ui.draggable.css("top", 0);
			});
			//console.log(player);
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