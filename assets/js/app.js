var vidArr = [];
var currentStreamers = [];
var vidNum = 0;

$(document).ready(function() {
	
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
	});
	
	$(test2).droppable({
		addClasses: true,
		accept: ".vid",
	});

	vidArr.push(test1);
	vidArr.push(test2);
	//vidArr.splice(0, 1);
	//$(test1).remove();
	console.log(vidArr);

});

/* On success drop, 
 * 	Append draggable element
 *	Reset position of draggable element
 * 	Remove temporary div placeholder
 *  Remove border styling
 */
$(document).on("drop", ".ui-droppable" ,function(event, ui) {
	$(this).empty();
	var oldParent = ui.draggable.parent();
	var newTemp = $("<div>");
	newTemp.addClass("temp");
	oldParent.droppable("enable");

	newTemp.appendTo(oldParent);
	ui.draggable.appendTo(this);
	ui.draggable.css("left", 0);
	ui.draggable.css("top", 0);

	ui.draggable.parent().droppable("disable");
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
		
		if(!checkDupeStreamers(streamName)) {
			currentStreamers.push(streamName);
		}
		else return;

		var vid_container = $("<div>");
		vidArr.push(vid_container);
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
		vidEmbed.attr("id", streamName);
		vidEmbed.addClass("vid");
		vidEmbed.data("name", streamName);
		vidEmbed.appendTo(vid_container);

		var deleteVid = $("<span></span>");
		deleteVid.addClass("glyphicon glyphicon-remove");
		deleteVid.attr("aria-hidden", true);
		deleteVid.appendTo(vidEmbed);
		deleteVid.css({"font-size": "200%", "right": 0, "position": "absolute", "z-index": 1});

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
		var player = new Twitch.Player(streamName, options);
		
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

$("#edit").on("click", function() {
	if(vidArr.length > 0) {
		vidArr[0].remove();
		vidArr.splice(0, 1);
	}	
	// for(var i = 0; i < vidArr.length; i++) {
	// 	if(vidArr.children().attr("id") == streamer)
	// }
});

$("#delete").on("click", function() {
	$(".ui-droppable").addClass("deletable");
	$(".vid iframe").css("opacity", 0.3);
});

$("#cancel").on("click", function() {
	$(".ui-droppable").removeClass("deletable");
	$(".vid iframe").css("opacity", "");
});

$(document).on("click", ".glyphicon-remove", function() {
	console.log("CLICKED");
	var vid = $(this).parent();
	var container = vid.parent();
	console.log(vid);
	var streamer = vid.attr("id");
	for(var i = 0; i < currentStreamers.length; i++) {
		if(streamer == currentStreamers[i]) {
			currentStreamers.splice(i, 1);
		}
	}
	console.log(currentStreamers);
	vid.remove();
	var newTemp = $("<div>");
	newTemp.addClass("temp");
	newTemp.appendTo(container);
});

function checkDupeStreamers(streamer) {
	for(var i = 0; i < currentStreamers.length; i++) {
		if(currentStreamers[i] == streamer) {
			console.log("DUPE");
			return true;
		}
	}

	return false;
}