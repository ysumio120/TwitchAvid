var vidArr = [];
var currentStreamers = [];
var vidNum = 0;
var currentTab = $(".home").data("tab", "Home");
var timeout = null;

$(document).ready(function() {

	// var test1 = $("<div>").addClass("col-lg-6");
	// test1.appendTo(".player");
	// $("<div>").addClass("temp").appendTo(test1);
	
	// //TEST
	// var test2 = $("<div>").addClass("col-lg-6");
	// test2.appendTo(".player");
	// $("<div>").addClass("temp").appendTo(test2);
	
	// //Activate droppable and accept draggables
	// $(test1).droppable({
	// 	addClasses: true,
	// 	accept: ".vid, .chat",
	// });
	
	// $(test2).droppable({
	// 	addClasses: true,
	// 	accept: ".vid, .chat",
	// });

	// vidArr.push(test1);
	// vidArr.push(test2);
	// //vidArr.splice(0, 1);
	// //$(test1).remove();
	// console.log(vidArr);

	//$(".tabs").tabs();
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

// Tell user if streamer status is either
// 		Online
// 		Offline
// 		Not available
$("#streamer").on("keydown", function() {
	clearTimeout(timeout);
	$(".text-status").text("");
	$("#startStream").text("Watch");
	$(".loading").css("display", "inline-block");
	$(".green").removeClass("show-status");
	$(".red").removeClass("show-status");
	timeout = setTimeout(function() {
		var streamer = $("#streamer").val();

		if(streamer == "") {
			$(".loading").css("display", "none");
			return;
		}
		console.log(streamer);
		var query = "https://api.twitch.tv/kraken/streams/" + streamer;

		twitchRequest(query).done(function(response) {
			console.log(response);
			$(".loading").css("display", "none");
			if(response.stream == null) {
				$("#startStream").text("Watch Anyway");
				$(".red").addClass("show-status");
				$(".text-status").text("Status: Offline").css("color","red");
			}
			else {
				$(".green").addClass("show-status");
				$("#startStream").text("Watch");
				$(".text-status").text("Status: Online").css("color","green");
			}
		});
	}, 500);

});

$("#startStream").on("click", function() {
	var streamer = $("#streamer").val();
	
	findStream(streamer);
});

$("#startChat").on("click", function() {
	var streamer = $("#chat").val();

	findChat(streamer);
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
		selectedTab.addClass("active");
		currentTab = selectedTab;
		return;
	}
	
	selectedTab.addClass("active");
	currentTab = selectedTab;
	var correspondingContent = currentTab.data("tab");
	if(correspondingContent) {
		console.log(correspondingContent);
		$(".player").find(".content.content-active").removeClass("content-active");
		$("#" + correspondingContent).addClass("content-active");
	}
});


// Assign name to tab with text from user after pressing 'enter'
$(document).on("keypress", "a input", function(event) {
	if(!event)
		e = window.event;
	var keyCode = event.keyCode || event.which;
	if(keyCode === 13) {
		var title = $(this).val();
		currentTab.data("tab", title);
		var a = $(this).parent();
		a.text(title);
		$(this).remove();
		var contentWrapper = $("<div></div>");
		contentWrapper.addClass("row content");
		contentWrapper.attr("id", title);
		contentWrapper.appendTo(".player");
		console.log($(".player").find(".content.content-active").attr("id"));
		$(".player").find(".content.content-active").removeClass("content-active");
		contentWrapper.addClass("content-active");
	}
});

// Allow sortable tabs by click-and-drag
$(".nav-tabs").sortable({
	delay: 200,
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

function twitchRequest(query) {
	var promise = $.ajax({
		url: query, 
		method: 'GET', 
		headers: {
			"Client-ID": "q0ojsiq3xgiqjopism2gu3z35py99jg"
		},
		error : function(jqXHR, textStatus, errorThrown) { 
			if(jqXHR.status == 404 || errorThrown == 'Not Found') { 
   				console.log('There was a 404 error.');
   				$(".error span").text("Error: Could not load");
   				$(".loading").css("display", "none");
   				$(".red").addClass("show-status");
   				$(".text-status").text("Status: Not Found").css("color","red");
			}
		}
	});

	return promise;

}

function findStream(streamer) {

	var query = "https://api.twitch.tv/kraken/streams/" + streamer;

	twitchRequest(query).done(function(response) {
		console.log(response);
		if(response.stream == null) {
			console.log("NO RESPONSE");
		}
		var channelAPI = response._links.self;
		console.log(channelAPI);
		//var streamer = response.stream.channel.name;
		console.log(streamer);

		var vid_container = $("<div>");
		vidArr.push(vid_container);
		vid_container.addClass("col-lg-6");
		vid_container.appendTo("#" + currentTab.data("tab"));
		vid_container.droppable({
			addClasses: true,
			accept: ".vid, .chat",
		});
		vid_container.droppable("disable");
		vidNum++;
		var vidEmbed = $("<div>");
		vidEmbed.attr("id", streamer);
		vidEmbed.addClass("vid");
		vidEmbed.data("name", streamer);
		vidEmbed.appendTo(vid_container);

		var deleteVid = $("<i></i>");
		deleteVid.addClass("fa fa-times");
		deleteVid.attr("aria-hidden", true);
		deleteVid.appendTo(vidEmbed);

		var move = $("<i></i>");
		move.attr("aria-hidden", true);
		move.addClass("fa fa-arrows");
		move.appendTo(".vid");

		// Configure options for iframe embed
		var options = {
			channel: streamer
		};

		// Create interactive Iframe Embed
		var player = new Twitch.Player(streamer, options);
		
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
				return clone;
			},
			containment: "parent",
			scrollSpeed: 10
		});


		if($("input[name='chat']").prop("checked")) {
			console.log("Chat Checked");
			findChat(streamer);
		}
	});

	$("#streamer").val("");
	$(".text-status").text("");
	$("#startStream").text("Watch");
	$(".green").removeClass("show-status");
	$(".red").removeClass("show-status");
	return false;	
}

function findChat(streamer) {
	if(!streamer) {
		return;
	}
	var query2 = "https://api.twitch.tv/kraken/chat/" + streamer;
	
	twitchRequest(query2).done(function(request) {
		console.log(request);

		var query = "http://www.twitch.tv/" + streamer + "/chat";

		var chat_container = $("<div>");
		//vidArr.push(vid_container);
		chat_container.addClass("col-lg-6");
		//vid_container.attr("id", "vid" + vidNum);
		chat_container.appendTo(".player");
		chat_container.droppable({
			addClasses: true,
			accept: ".vid, .chat",
		});
		chat_container.droppable("disable");

		chatEmbed = $("<div></div>");
		chatEmbed.addClass("chat");
		chatEmbed.appendTo(chat_container);

		var deleteChat = $("<i></i>");
		deleteChat.addClass("fa fa-times");
		deleteChat.attr("aria-hidden", true);
		deleteChat.appendTo(chatEmbed);

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
		chat_container.appendTo("#" + currentTab.data("tab"));	

	});

	$("#chat").val("");
	$(".green").removeClass("show-status");
	$(".red").removeClass("show-status");
	return false;	
}

$(".toggle i").on("click", function() {
	var up_down = $(this).hasClass("fa-chevron-up");
	if(up_down) {
		$(".search").slideUp(200);
		$(this).removeClass("fa-chevron-up");
		$(this).addClass("fa-chevron-down");
	}
	else {
		$(".search").slideDown(200);
		$(this).removeClass("fa-chevron-down");
		$(this).addClass("fa-chevron-up");
	}
})