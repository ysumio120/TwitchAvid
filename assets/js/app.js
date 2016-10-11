var vidArr = [];
var currentStreamers = [];
var vidNum = 0;
var currentTab = $(".home");

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
		accept: ".vid, .chat",
	});
	
	$(test2).droppable({
		addClasses: true,
		accept: ".vid, .chat",
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
$(document).on("drop", ".ui-droppable", function(event, ui) {
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
			accept: ".vid, .chat",
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

		var deleteVid = $("<i></i>");
		deleteVid.addClass("fa fa-times");
		deleteVid.attr("aria-hidden", true);
		deleteVid.appendTo(vidEmbed);

		//Move cursor img for draggable handle
		// var move = $("<img>");
		// move.attr("src", "assets/images/move_cursor.png");
		// move.appendTo(".vid");

		var move = $("<i></i>");
		move.attr("aria-hidden", true);
		move.addClass("fa fa-arrows");
		move.appendTo(".vid");


		// Configure options for iframe embed
		var options = {
		//	width: 720,
		//	height: 400,
			channel: streamName
		};

		// Create interactive Iframe Embed
		var player = new Twitch.Player(streamName, options);
		
		vidEmbed.draggable({
			addClasses: true,
		//	opacity: 0.50,
			revert: "invalid",
			revertDuration: 100,
			scroll: false,
			handle: ".fa-arrows",
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

	if(!streamer) {
		return;
	}

	var query = "http://www.twitch.tv/" + streamer + "/chat";

	var chat_container = $("<div>");
	//vidArr.push(vid_container);
	chat_container.addClass("col-lg-6");
	//vid_container.attr("id", "vid" + vidNum);
	chat_container.appendTo(".player");
	chat_container.droppable({
		addClasses: true,
		accept: ".vid, .chat",
		// classes: {
		// "ui-droppable-active": "highlight"
		// }
	});
	chat_container.droppable("disable");

	chatEmbed = $("<div></div>");
	chatEmbed.addClass("chat");
	chatEmbed.appendTo(chat_container);

	var deleteChat = $("<i></i>");
	deleteChat.addClass("fa fa-times");
	deleteChat.attr("aria-hidden", true);
	deleteChat.appendTo(chatEmbed);

	//Move cursor img for draggable handle
	// var move = $("<img>");
	// move.attr("src", "assets/images/move_cursor.png");
	// move.appendTo(".vid");

	var move = $("<i></i>");
	move.attr("aria-hidden", true);
	move.addClass("fa fa-arrows");
	move.appendTo(".chat");	

	var chat = $("<iframe></iframe>");
	chat.attr("frameborder", "0");
	chat.attr("scrolling", "no");
	chat.data("streamer", streamer);
	chat.attr("src", query);

	chat.appendTo(chatEmbed);

	chatEmbed.draggable({
			addClasses: true,
		//	opacity: 0.50,
			revert: "invalid",
			revertDuration: 100,
			scroll: false,
			handle: ".fa-arrows",
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

	console.log(chatEmbed);
	chat_container.appendTo(".player");
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
	$(".glyphicon-remove").css("display", "block");
});

$("#cancel").on("click", function() {
	$(".ui-droppable").removeClass("deletable");
	$(".vid iframe").css("opacity", "");
	$(".glyphicon-remove").css("display", "none");
});

$(document).on("click", ".fa-times", function() {
	console.log("CLICKED");
	var vid = $(this).parent();
	var container = vid.parent();
	container.droppable("enable");
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

// Toggle tabs when clicked and display content
// Clicking the 'plus' tab will create a new tab
$(document).on("click", ".nav-tabs li", function() {
	currentTab.removeClass("active");
	var selectedTab = $(this);
	

	if(selectedTab.hasClass("addTab")) {
		var newTab = $("<li></li>");
		newTab.attr("role", "presentation");
		var a = $("<a></a>").attr("href", "#");
		var input = $("<input>").attr("type", "text");
		input.appendTo(a);
		a.appendTo(newTab);
		newTab.insertBefore(".addTab");
		input.focus();
		selectedTab = newTab;
	}
	
	selectedTab.addClass("active");
	currentTab = selectedTab;
});

// $(document).on("click", "a input", function() {
// 	$(this).parent().css("color", "black");
// 	$(this).focus();

// });

// Assign name to tab with text from user after pressing 'enter'
$(document).on("keypress", "a input", function(event) {
	if(!event)
		e = window.event;
	var keyCode = event.keyCode || event.which;
	//console.log(keyCode);
	if(keyCode === 13) {
		var title = $(this).val();
		console.log(title);
		var a = $(this).parent();
		$(this).remove();
		a.text(title);
	}
});

// Allow sortable tabs by click-and-drag
$(".nav-tabs").sortable({
	axis: "x",
	containment: "parent",
	items: "> li:not(.addTab)"
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