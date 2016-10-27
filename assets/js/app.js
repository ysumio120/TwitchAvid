var vidArr = [];
var currentStreamers = [];
var vidNum = 0;
var currentTab = $(".home").data("tab", "Home");
var timeout = null;
var prevDocument; 
var currDocument = $(document).height();
var searchInputLength = 0;

var draggableConfig = {
	addClasses: true,
	revert: "invalid",
	revertDuration: 100,
	handle: ".fa-arrows",
	appendTo: "body",
	helper: function() {

		// Get current size of embed video
		var width = $(this).innerWidth();
		var height = $(this).innerHeight();
		console.log(width);
		console.log(height);
		
		// Create 'shadow' of element with same dimensions
		var clone = $(this).parent().clone();
		clone.children(".vid").empty();
		clone.children(".vid").css("width", width);
		clone.children(".vid").css("height", height);
		clone.children(".vid").css("background-color", "grey");
		clone.children(".vid").css("opacity", 0.5);
		return clone;
	},
	containment: "parent",
	tolerance: "pointer",
	scroll: false,
	scrollSpeed: 10
};

var resizableConfig = {
	handles: "se",
	start: function() {
		//console.log("Prev Doc: " + originalDocument);
		var vidParent = $(this).parent();
		vidParent.css("width", "");
		
		var overlay = $(".resizable-overlay");
		overlay.css("display", "block");
	},
	stop: function(event, ui) {	
		prevDocument = currDocument;
		$("html").height($("body").height());
		currDocument = $(document).height();
		if(currDocument - prevDocument > 0) {
			$("html, body").animate({
		        scrollTop: $(document).scrollTop() + currDocument - prevDocument
		    });
		}
		
		var overlay = $(".resizable-overlay");
		overlay.css("display", "none");
	}
};

var menuHeight = function() {
	var tabHeight = $(".tabs").outerHeight(true);
	var searchHeight = $(".search").outerHeight(true);
	setTimeout ( function () {
        var toggleHeight = $('.toggle').outerHeight( true );
        console.log(tabHeight + searchHeight + toggleHeight);
        return tabHeight + searchHeight + toggleHeight;
    }, 50);
};

function searchInput() {
	clearTimeout(timeout);
	$(".text-status").text("");
	$("#startStream").text("Watch");
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

		var searchChannel = "https://api.twitch.tv/kraken/search/channels?limit=5&q=" + streamer;
		var searchGame = "https://api.twitch.tv/kraken/search/games?q=" + streamer + "&type=suggest";

		twitchRequest(searchChannel).done(function(response) {
			$(".channels").empty();
			var results = response.channels
			for(var i = 0; i < results.length; i++) {
				var entry = $("<div>");
				entry.text(results[i].display_name);
				entry.data("name", results[i].name);
				console.log(entry.data("name"));
				entry.appendTo(".channels");
			}
			//console.log(response);
		});

		twitchRequest(searchGame).done(function(response) {
			//console.log(response);
			$(".games").empty();
			var results = response.games
			for(var i = 0; i < 4; i++) {
				var entry = $("<div>");
				entry.text(results[i].name);
				entry.data("name", results[i].name);
				entry.appendTo(".games");
			}
			//console.log(response);
		});

		$(".loading").css("display", "inline-block");
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
	}, 400);
}

$(document).ready(function() {

	console.log(window.innerHeight);
	menuHeight();
	
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
	var otherVid = $(this).children(".vid");
	var oldParent = ui.draggable.parent();
	oldParent.append(otherVid);
	$(this).append(ui.draggable);

	// var newTemp = $("<div>");
	// newTemp.addClass("temp");
	// oldParent.droppable("enable");

	// newTemp.appendTo(oldParent);
	// ui.draggable.appendTo(this);
	// ui.draggable.css("left", 0);
	// ui.draggable.css("top", 0);

	//ui.draggable.parent().droppable("disable");
});

// Tell user if streamer status is either
// 		Online
// 		Offline
// 		Not available (Does not exist)
$("#streamer").on("keypress", function() {
	//searchInput();

});

$("#streamer").on("keyup", function(event) {
	console.log($(this));
	var hovered = $(this).find(".results-hover");
	console.log(hovered);
	if(hovered.length == 0)
		console.log("Nothing hovered");
	if(!event)
		e = window.event;
	var keyCode = event.keyCode || event.which;
	switch(keyCode) {
		// // Backspace
		// case 8:
		// 	searchInput();
		// 	break;
		// // Delete
		// case 46:
		// 	searchInput();
		// 	break;
		// Up arrow
		case 38:

			break;
		// Down arrow	
		case 40:
			break;
		default:
			if(searchInputLength != $(this).val().length) {
				searchInputLength = $(this).val().length;
				searchInput();
			}
	}
});

$("#startStream").on("click", function() {
	var streamer = $("#streamer").val();
	
	findStream(streamer);
});

$("#startChat").on("click", function() {
	var streamer = $("#chat").val();

	findChat(streamer);
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
   				$(".green").removeClass("show-status");
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

		// Container to maintain aspect ratio ofvideo player
		var vid_container = $("<div>");
		vidArr.push(vid_container);
		//vid_container.addClass("col-lg-6");
		vid_container.css("width", "50%");
		vid_container.appendTo("#" + currentTab.data("tab"));
		vid_container.droppable({
			addClasses: true,
			tolerance: "pointer",
			accept: function(draggable) {
				var id = draggable.attr("id");
				if($(this).children(".vid").attr("id") == id)
					return false;
				else return true;
			}

		});

		
		//vid_container.droppable("disable");
		vidNum++;
		var vidEmbed = $("<div>");
		vidEmbed.attr("id", streamer);
		vidEmbed.addClass("vid");
		vidEmbed.data("name", streamer);
		vidEmbed.appendTo(vid_container);
		
		// Icon to remove stream
		var deleteVid = $("<i></i>");
		deleteVid.addClass("fa fa-times");
		deleteVid.attr("aria-hidden", true);
		deleteVid.appendTo(vidEmbed);

		// Applying overlay will allow resizing even when mousing over the video player
		var resizableOverlay = $("<div>");
		resizableOverlay.addClass("resizable-overlay");
		resizableOverlay.appendTo(vidEmbed);

		// Add background behind new video player buttons for easier view
		var tools = $("<div>");
		tools.addClass("tools-background");
		tools.appendTo(vidEmbed);

		// Icon to move/drag stream
		var move = $("<i></i>");
		move.attr("aria-hidden", true);
		move.addClass("fa fa-arrows");
		move.appendTo(vidEmbed);

		var moveText = $("<span></span>");
		moveText.text("Move");
		moveText.addClass("fa-arrows-text");
		moveText.appendTo(move);

		// Icon to enable/disable aspect ratio
		var aspect_ratio = $("<img></img>");
		aspect_ratio.attr("src", "assets/images/aspect_ratio_16_9_red.png");
		aspect_ratio.addClass("aspect-ratio");
		aspect_ratio.data("enable", true);
		aspect_ratio.appendTo(vidEmbed);

		var arText = $("<span></span>");
		arText.text("Disable Aspect Ratio");
		arText.addClass("aspect-ratio-text");
		arText.appendTo(vidEmbed);

		// Configure options for iframe embed
		var options = {
			channel: streamer
		};

		// Create interactive Iframe Embed
		var player = new Twitch.Player(streamer, options);
		
		// Create draggable object
		vidEmbed.draggable(draggableConfig);
		
		// Create resizable object
		vidEmbed.resizable(resizableConfig);

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
	var query = "https://api.twitch.tv/kraken/chat/" + streamer;
	
	twitchRequest(query).done(function(request) {
		console.log(request);

		var query = "http://www.twitch.tv/" + streamer + "/chat";

		var chat_container = $("<div>");
		//vidArr.push(vid_container);
		chat_container.addClass("col-lg-6");
		//vid_container.attr("id", "vid" + vidNum);
		chat_container.appendTo("#" + currentTab.data("tab"));
		chat_container.droppable({
			addClasses: true,
			tolerance: "pointer",
			accept: function(draggable) {
				console.log(draggable.children("iframe"));
				var id = draggable.children("iframe").data("streamer");
				if($(this).children().children("iframe").data("streamer") == id)
					return false;
				 return true;
			}
		});
		//chat_container.droppable("disable");

		chatEmbed = $("<div></div>");
		chatEmbed.addClass("chat " + streamer);
		chatEmbed.appendTo(chat_container);

		var deleteChat = $("<i></i>");
		deleteChat.addClass("fa fa-times");
		deleteChat.attr("aria-hidden", true);
		deleteChat.appendTo(chatEmbed);

		var move = $("<i></i>");
		move.attr("aria-hidden", true);
		move.addClass("fa fa-arrows");
		move.appendTo(chatEmbed);	

		var chat = $("<iframe></iframe>");
		chat.attr("frameborder", "0");
		chat.attr("scrolling", "no");
		chat.attr("data-streamer", streamer);
		console.log(chat.data("streamer"));
		chat.attr("src", query);

		chat.appendTo(chatEmbed);

		chatEmbed.draggable(draggableConfig);

		$("#chat").val("");
		$(".green").removeClass("show-status");
		$(".red").removeClass("show-status");
		return false;	
	});
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
});

$(document).on({
	mouseenter: function() {
		var vid = $(this).parent();
		var text = vid.children(".aspect-ratio-text");
		text.css("display", "inline-block");			
	},
	mouseleave: function() {
		var vid = $(this).parent();
		var text = vid.children(".aspect-ratio-text");
		text.css("display", "none");
	},
	click: function() {
		var vid = $(this).parent();
		var text = vid.children(".aspect-ratio-text");

		var icon = $(this);
		var toggle = icon.data("enable");
		if(toggle) {
			icon.data("enable", false);
			icon.attr("src", "assets/images/aspect_ratio_16_9.png");
			text.text("Enable Aspect Ratio");
			toggleAspectRatio(vid, false);
		}
		else {
			icon.data("enable", true);
			icon.attr("src", "assets/images/aspect_ratio_16_9_red.png");
			text.text("Disable Aspect Ratio");
			toggleAspectRatio(vid, true);	
		}
	}
},".aspect-ratio")

function toggleAspectRatio(videoPlayer, toggle) {
	var parentWidth = videoPlayer.outerWidth();
	console.log(parentWidth);
	var width = videoPlayer.width();
	console.log("Width: " + width);
	var height = videoPlayer.innerHeight();
	console.log("Height: " + height);
	if(toggle) { // enable aspect ratio
		videoPlayer.parent().css("width", parentWidth);
		videoPlayer.css("padding-bottom", "56.25%");
		videoPlayer.css("width","100%");
		videoPlayer.css("height", "0");
	}
	else { // disable aspect ratio
		//videoPlayer.parent().css("width", "0%");
		videoPlayer.parent().css("width", parentWidth);
		videoPlayer.css("padding-bottom", "0%");
		videoPlayer.height(height);
		videoPlayer.width(width);
	}
}

$(".channels").on({
	click: function() {
		var selected = $(this);
		var channelName = selected.data("name");
		findStream(channelName);
	}

}, "div");
