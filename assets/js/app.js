var vidArr = [];
var currentStreamers = [];
var vidNum = 0;
var currentTab = $(".home").data("tab", "Home");
var timeout = null;
var prevDocument; 
var currDocument = $(document).height();
var token;

$("#login").click(function() {
	var username = $("#username").val();
	var password = $("#password").val();
	
	$.post("/login", {username: "username", password: "password"}, function(data) {
		console.log(data);
	});
});


$("#signup").click(function() {
	var username = $("#signupusername").val();
	var password = $("#signuppassword").val();
	
	$.post("/users/signup", {username: username, password: password}, function(data) {
		console.log(data);
	});
});

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

		// Create 'shadow' of element with same dimensions
		var clone = $(this).parent().clone();
		clone.children(".vid, .chat").empty();
		clone.children(".vid, .chat").css("width", width);
		clone.children(".vid, .chat").css("height", height);
		clone.children(".vid, .chat").css("background-color", "grey");
		clone.children(".vid, .chat").css("opacity", 0.5);
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

function formatNumwithCommas(number) {
	var result = [];
	number = number.toString();
	if(number.length <= 3)
		return number;
	else {
		do {
			var sub = number.substr(number.length-3);
			result.unshift(sub);
			number = number.substr(0, number.length-3);
		}while(number.length > 3);
		result.unshift(number);
	}

	return result.join();
}

$(document).ready(function() {
	Twitch.init({clientId: 'q0ojsiq3xgiqjopism2gu3z35py99jg'}, function(error, status) {
    	if (error) {
   			console.log(error);
  		}
  		if (status.authenticated) {
    		token = Twitch.getToken();
    		var userQuery = "https://api.twitch.tv/kraken/user";
    		twitchRequest(userQuery).done(function(userResponse) {
				var username = userResponse.display_name;
				$("#loggedInUser").text(username).css("display", "inline-block");
				$("#logoutBtn").css("display", "inline-block");
			
				var followChannelsQuery = "https://api.twitch.tv/kraken/users/" + userResponse.name + "/follows/channels"
				twitchRequest(followChannelsQuery).done(function(followChannelsResponse) {
					console.log(followChannelsResponse);
				});

				var followStreamsQuery = "https://api.twitch.tv/kraken/streams/followed?stream_type=all";
				twitchRequest(followStreamsQuery).done(function(followStreamsResponse) {
					console.log(followStreamsResponse);
				})
			});
			
  		}
  		else {
  			$(".twitch-connect").css("display", "inline-block");
  		}
  	
	  	$('.twitch-connect').click(function() {
				twitchLogin();
		})
  	});	
  	
  	// Cannot use Twitch.login() from Twitch SDK
  	// Builds URL with parameter force_verify set to 'true' (important)
  	// Ensures authorization for every login attempt
	function twitchLogin() {
		var headers = {
			response_type: "token",
			client_id: "q0ojsiq3xgiqjopism2gu3z35py99jg",
			redirect_uri: "https://twitchavid-development.herokuapp.com/",
			scope: "user_read channel_read user_subscriptions",
			force_verify: "true"
		}
		
		var url = "https://api.twitch.tv/kraken/oauth2/authorize?" + decodeURIComponent($.param(headers));
		window.location = url;
	}

	$("#logoutBtn").click(function() {
		Twitch.logout(function(error) {
    		if(error) throw error;
    		$("#loggedInUser").empty();
    		$("#loggedInUser").css("display", "none");
    		$("#logoutBtn").css("display", "none");
			$(".twitch-connect").css("display", "inline-block");
		});
	});

	var limit = 10; // Default limit 10
	var query = "https://api.twitch.tv/kraken/games/top?limit=" + limit;
	preloadImages("top-games", query,
		function(data, imgArr) {
			for(var i = 0; i < imgArr.length; i++) {
				var gameName = data.top[i].game.name
				$(imgArr[i]).attr("title", gameName);
				$(imgArr[i]).data("name", gameName);
				$(imgArr[i]).appendTo(".top-games");
			}
			$(".top-games").css("display", "block");
		}, 
		function(data, imgElem) {
			var height = 90; // Must be integer
			var width = Math.floor(height * .7258); // Must be integer

			// e.g. https://static-cdn.jtvnw.net/ttv-boxart/League%20of%20Legends-{width}x{height}.jpg
			var customSize = data.game.box.template;
			customSize = customSize.replace("{width}", width);
			customSize = customSize.replace("{height}", height);
			var imgsrc = data.game.box.small;
			$(imgElem).attr("src", customSize);
	})
});

// Return and displays list of relevant channels and games based on given user search
function searchInput() {
	clearTimeout(timeout);
	timeout = setTimeout(function() {
		var search = $("#search").val();

		if(search == "") {
			$(".searchResults").css("display", "none");
			$(".loading").css("display", "none");
			$(".channels b, .games b").nextAll().remove();
			return;
		}

		var channelLimit = 5;
		var searchChannel = "https://api.twitch.tv/kraken/search/channels?limit=" + channelLimit + "&q=" + search;
		var searchGame = "https://api.twitch.tv/kraken/search/games?q=" + search + "&type=suggest";

		twitchRequest(searchChannel).done(function(response) {
			$(".channels b").nextAll().remove();
			var results = response.channels
			if(results.length > 0) {
				$(".searchResults").css("display", "block");
			}
			var entryArr = [];
 			for(var i = 0; i < results.length; i++) {
				var name = results[i].name;
				var display_name = results[i].display_name;

				entryArr[i] = $("<div>");
				entryArr[i].addClass("entry");
				entryArr[i].text(display_name);
				entryArr[i].data("name", name);
				var channelQuery = "https://api.twitch.tv/kraken/streams/" + name;
				channelStatus(entryArr[i]);

				// Give visual display of whether channel in the list is online or offline (stream)
				// Offline: Red X
				// Online: 	Green Check
				function channelStatus(entry) {
					twitchRequest(channelQuery).done(function(response) {
						if(response.stream == null) {
							var offline = $("<img>");
							offline.attr("src", "/images/red.png");
							entry.append(offline);	
						}
						else {
							var online = $("<img>");
							online.attr("src", "/images/green.png");
							entry.append(online);	
						}
					});
				}
				entryArr[i].appendTo(".channels");
			}
		});

		twitchRequest(searchGame).done(function(response) {
			$(".games b").nextAll().remove();
			var results = response.games
			if(results.length > 0) {
				$(".searchResults").css("display", "block");
			}
			var limit = 4;
			if(results.length < 4)
				limit = results.length;
			for(var i = 0; i < limit; i++) {
				var entry = $("<div>");
				entry.text(results[i].name);
				entry.data("name", results[i].name);
				entry.appendTo(".games");
			}
		});

		$(".loading").css("display", "none");
	}, 400);
}

// Will swap (and maintain dimensions) streams
$(document).on("drop", ".ui-droppable", function(event, ui) {
	var otherVid = $(this).children(".vid, .chat");
	var oldParent = ui.draggable.parent();
	oldParent.append(otherVid);
	$(this).append(ui.draggable);
	oldParent.css("width", "");
	$(this).css("width", "");
});

// 
$("#search").on("keydown", function(event) {
	var hovered = $(".searchResults").find(".results-hover");
	if(!event)
		event = window.event;
	var keyCode = event.keyCode || event.which;
	switch(keyCode) {
		case 13: // Enter
			if(hovered.length != 0) {
				var parentCategory = hovered.parent();
				if(parentCategory.hasClass("channels")) {
					findStream($(".results-hover").data("name"));
				}
				else if(parentCategory.hasClass("games")) {
					preloadImages($(".results-hover").data("name"));
				}
			}
			break;

		case 38: // Up arrow
			// Prevent input cursor from moving to the beginning 
			event.preventDefault();
			// Highlight previous result
			var prevResult = hovered.prev("div");
			if(prevResult.length != 0) {
				prevResult.addClass("results-hover");
				hovered.removeClass("results-hover");
			}
			// If you reach the first result a catergory, highlight the last available
			// result of the previous category 
			else {
				var prevCategory = hovered.parent().prev();					
				do {
					if(prevCategory.children().length != 0) {
						prevCategory.children("div:last").addClass("results-hover");
						hovered.removeClass("results-hover");
						break;
					}
					prevCategory = prevCategory.prev();
				}while(prevCategory.length != 0);
			}
			break;
		case 40: // Down arrow	
			// Prevent input cursor from moving to the end
			event.preventDefault();
			var category;
			var results;
			if(hovered.length == 0) 
				category = $(".searchResults div").first(); 
			else {
				var nextResult = hovered.next("div");
				if(nextResult.length != 0) { 
					nextResult.addClass("results-hover");
					hovered.removeClass("results-hover");
					break;
				}
				category = hovered.parent().next();		
			}	
			results = $(category).children("b").nextAll();
				do {
					if(results.length > 0) {
						$(results[0]).addClass("results-hover");
						hovered.removeClass("results-hover");
						break;
					}
					category = category.next();
					results = $(category).children("b").nextAll();
				}while(category.length != 0) ;
				break;	
		default:
			searchInput();
			$(".loading").css("display", "inline-block");
			
	}
});

// Events when handling with each search result
$(".searchResults > div").on({
	mousemove: function() {
		var hovered = $(".searchResults").find(".results-hover");
		hovered.removeClass("results-hover");
		$(this).addClass("results-hover");
	},
	click: function() {
		var selected = $(this);
		var name = selected.data("name");
		if(selected.parent().hasClass("channels")){	
			findStream(name);
		}
		else if(selected.parent().hasClass("games")) {
			$(".live-streams-list").empty();
			$(".live-streams-list").css("display", "none");
			var limit = 25; // Default limit 25
			var query = "https://api.twitch.tv/kraken/streams?stream_type=live&game=" + name + "&limit=" + limit;
			streamListLoad(query);
		}
		$(".searchResults").css("display", "none");
	}
}, "div");

$("#startStream").on("click", function() {
	var streamer = $("#search").val();
	findStream(streamer);
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
	container.remove();
});

// Toggle tabs when clicked and display content
// Clicking the 'plus' tab will create a new tab
$(document).on("click", ".nav-tabs li", function() {
	currentTab.removeClass("active");
	var selectedTab = $(this);
	

	if(selectedTab.hasClass("addTab")) {
		var newTab = $("<li></li>");
		newTab.attr("role", "presentation");
		var a = $("<a></a>").attr("href", "");
		var input = $("<input>").attr("type", "text");
		input.appendTo(a);
		a.appendTo(newTab);
		newTab.insertBefore(".addTab");
		input.focus();
		selectedTab = newTab;
		selectedTab.addClass("active");
		currentTab = selectedTab;
		return false;
	}
	
	selectedTab.addClass("active");
	currentTab = selectedTab;
	var correspondingContent = currentTab.data("tab");
	if(correspondingContent) {
		console.log(correspondingContent);
		$(".player").find(".content.content-active").removeClass("content-active");
		$("#" + correspondingContent).addClass("content-active");
	}
	return false;
});

$(document).on("contextmenu", ".nav-tabs li:not(.addTab)", function(event) {
	if(!event)
		event = window.event;
	event.preventDefault();
	var tab = $(this);
	console.log("right click");
	var cursorLeft = event.pageX;
	var cursorTop = event.pageY;
	var coordinates = {
		top: cursorTop,
		left: cursorLeft
	}
	$(".contextmenu").offset(coordinates);
	$(".contextmenu").css("display", "inline-block");
	$(".contextmenu").data("clicked", tab);

	return false;
});

$("#tab-remove").click(function() {
	var tab = $(".contextmenu").data("clicked");
	var content = tab.children("a").text();
	tab.remove();
	$("#" + content).remove();
	$(".contextmenu").css("display", "none");
	return false;
});

// Assign name to tab with text from user after pressing 'enter'
$(document).on("keypress", "a input", function(event) {
	if(!event)
		e = window.event;
	var keyCode = event.keyCode || event.which;
	if(keyCode === 13) {
		var title = $(this).val().trim();
		if(title == "")
			return;
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
		return false;
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
			"Client-ID": "q0ojsiq3xgiqjopism2gu3z35py99jg",
			"Authorization": "OAuth " + token
		},
		error : function(jqXHR, textStatus, errorThrown) { 
			if(jqXHR.status == 404 || errorThrown == 'Not Found' || jqXHR.status == 422) { 
   				console.log('There was a 404 error.');
   				$(".loading").css("display", "none");
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

		// Container to maintain aspect ratio of video player
		var vid_container = $("<div>");
		vidArr.push(vid_container);
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
		vidNum++;
		var vidEmbed = $("<div>");
		vidEmbed.attr("id", streamer + "-" + currentTab.data("tab"));
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
		var moveDiv = $("<div>");
		moveDiv.appendTo(tools);
		var move = $("<i></i>");
		move.attr("aria-hidden", true);
		move.addClass("fa fa-arrows");
		move.appendTo(moveDiv);
		var moveText = $("<span></span>");
		moveText.text("Move");
		moveText.addClass("fa-arrows-text");
		moveText.appendTo(moveDiv);

		// Icon to enable/disable aspect ratio
		var arDiv = $("<div>");
		arDiv.appendTo(tools);
		var aspect_ratio = $("<img></img>");
		aspect_ratio.attr("src", "/images/aspect_ratio_16_9_red.png");
		aspect_ratio.addClass("aspect-ratio");
		aspect_ratio.data("enable", true);
		aspect_ratio.appendTo(arDiv);
		var arText = $("<span></span>");
		arText.text("Disable Aspect Ratio");
		arText.addClass("aspect-ratio-text");
		arText.appendTo(arDiv);

		// Configure options for iframe embed
		var options = {
			channel: streamer
		};

		// Create interactive Iframe Embed
		var player = new Twitch.Player(streamer + "-" + currentTab.data("tab"), options);
		
		//vid_container.width(vidEmbed.outerWidth());
		vidEmbed.width(vidEmbed.innerWidth());
		//vidEmbed.height(vidEmbed.innerHeight());

		// Create draggable object
		vidEmbed.draggable(draggableConfig);
		
		// Create resizable object
		vidEmbed.resizable(resizableConfig);

		if($("input[name='chat']").prop("checked")) {
			console.log("Chat Checked");
			var dimensions = { // Default chat dimensions (stream dimensions)
				width: vidEmbed.innerWidth(),
				height: vidEmbed.innerHeight()
			}
			findChat(streamer, dimensions);
		}
	});

	$(".text-status").text("");
	$("#startStream").text("Watch");
	$(".green").removeClass("show-status");
	$(".red").removeClass("show-status");
	return false;	
}

function findChat(streamer, dimensions) {
	if(!streamer) {
		return;
	}

	var query = "https://api.twitch.tv/kraken/chat/" + streamer;
	
	twitchRequest(query).done(function(request) {
		var query = "http://www.twitch.tv/" + streamer + "/chat";

		var chat_container = $("<div>");
		chat_container.css("width", "50%");
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
		chatEmbed = $("<div></div>");
		chatEmbed.addClass("chat " + streamer);
		chatEmbed.appendTo(chat_container);

		var resizableOverlay = $("<div>");
		resizableOverlay.addClass("resizable-overlay");
		resizableOverlay.appendTo(chatEmbed);

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

		chatEmbed.width(dimensions.width); // Set initial width
		chatEmbed.height(dimensions.height); // Set initial height

		chatEmbed.draggable(draggableConfig);
		chatEmbed.resizable(resizableConfig);

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

// Show clear distinction when aspect ratio is enabled/disabled
// Displays description on icon hover
$(document).on({
	click: function() {
		var parent = $(this).parent();
		var text = parent.children(".aspect-ratio-text");
		var vid = $(this).closest(".vid");

		var icon = $(this);
		var toggle = icon.data("enable");
		if(toggle) {
			icon.data("enable", false);
			icon.attr("src", "/images/aspect_ratio_16_9.png");
			text.text("Enable Aspect Ratio");
			toggleAspectRatio(vid, false);
		}
		else {
			icon.data("enable", true);
			icon.attr("src", "/images/aspect_ratio_16_9_red.png");
			text.text("Disable Aspect Ratio");
			toggleAspectRatio(vid, true);	
		}
	}
},".aspect-ratio")

// Allows user to enable/disable the aspect ratio of any stream
function toggleAspectRatio(videoPlayer, toggle) {
	var parentWidth = videoPlayer.outerWidth();
	// console.log(parentWidth);
	var width = videoPlayer.width();
	// console.log("Width: " + width);
	var height = videoPlayer.innerHeight();
	// console.log("Height: " + height);
	if(toggle) { // enable aspect ratio
		videoPlayer.parent().css("width", parentWidth);
		videoPlayer.css("padding-bottom", "56.25%");
		videoPlayer.css("width","100%");
		videoPlayer.css("height", "0");
	}
	else { // disable aspect ratio
		videoPlayer.parent().css("width", parentWidth);
		videoPlayer.css("padding-bottom", "0%");
		videoPlayer.height(height);
		videoPlayer.width(width);
	}
}

// Hide the search results window when user clicks anywhere outside that window 
$("body").on("click", function() {
	$(".searchResults").css("display", "none");
	$(".contextmenu").offset({top: 0, left: 0}); // Reset position of context menu otherwise unusual behavior occurs
	$(".contextmenu").css("display", "none");
});

// Show the search results window only if there is at least one result found
$("#search").on("click", function(event) {
	event.stopPropagation();
	var categories = $(".channels b, .games b").nextAll();
	for(var i = 0; i < categories.length; i++) {
		if($(categories[i]).is(":empty") == false) {
			$(".searchResults").css("display", "block");
			return false;
		}
	}
	
})

$(".top-games").on("click", "img", function() {
	$(".live-streams-list").empty();
	//$(".live-streams-list").css("display", "none");
	var game = $(this).data("name");
	var limit = 25; // Default limit 25
	var query = "https://api.twitch.tv/kraken/streams?stream_type=live&game=" + game + "&limit=" + limit;
	streamListLoad(query);

	return false;
})

function preloadImages(queryType, query, loadComplete, srcLoad) {
	twitchRequest(query).done(function(response) {
		var responseArr = [];
		switch(queryType) {
			case "top-games":
				responseArr = response.top;
				break;
			case "game-streams":
				responseArr = response.streams;
				break;
		}

		var loadCount = 0;
		var loadedImages = [];
		for(var i = 0; i < responseArr.length; i++) {
			loadedImages[i] = new Image();
			loadedImages[i].onload = function() {
				loadCount++;
				if(loadCount == responseArr.length)
					loadComplete(response, loadedImages);
			}
			loadedImages[i].onerror = function() {
				loadCount++;
				loadedImages.splice(loadedImages.indexOf(this), 1);
				if(loadCount == responseArr.length)
					loadComplete(response, loadedImages);
			}
			srcLoad(responseArr[i], loadedImages[i]);
		}			
	})
}

$(".live-streams-list").on("click", "div", function() {
	var channel = $(this).children("img").data("name");
	findStream(channel);
	return false;
});

$(".live-streams-list").scroll(function(event) {
	var height = $(this).height();
	var loadingHeight = $(this)[0].scrollHeight - $(this).find("img").height();
	var currentScrolledHeight = height + $(this).scrollTop();
	if(currentScrolledHeight > loadingHeight) {
		var nextLoad = $(this).data("nextLoad");
		if(nextLoad != "") {
			streamListLoad(nextLoad);
		}
		$(this).data("nextLoad", "");
	}
})


function streamListLoad(query) {
	preloadImages("game-streams", query, 
		function(data, imgArr) {
			for(var i = 0; i < imgArr.length; i++) {	
					//console.log(imgArr[i]);
					var liveStreamer = $("<div>");
					liveStreamer.addClass("col-lg-3 col-md-3");

					$(imgArr[i]).data("name", data.streams[i].channel.name);
					$(imgArr[i]).data("display_name", data.streams[i].channel.display_name);
					var viewerCount = data.streams[i].viewers;
					liveStreamer.append($(imgArr[i]));

					var label = $("<div>").html($(imgArr[i]).data("display_name") + "&nbsp;&#8226;&nbsp" + formatNumwithCommas(viewerCount) + " viewers");
					liveStreamer.append(label);
					liveStreamer.appendTo(".live-streams-list");
			}
			$(".live-streams-list").css("display", "block");
			$(".live-streams-list").data("nextLoad", data._links.next);
		}, 
		function(data, imgElem) {
			var height = 700; // Must be integer
			var width = Math.floor(height * 1.7778); // Must be integer

			// e.g. https://static-cdn.jtvnw.net/previews-ttv/live_user_nightblue3-{width}x{height}.jpg
			var customSize = data.preview.template;
			customSize = customSize.replace("{width}", width);
			customSize = customSize.replace("{height}", height);
			// imgElem.src = customSize;
			imgElem.src = data.preview.large;
			$(imgElem).data("template", data.preview.template);
	})
}
