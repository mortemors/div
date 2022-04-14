let includeHosts = true,
    minHost = 0,
    includeRaids = true,
    minRaid = 0,
	text = "",
	command = "!div",
	debug = false,
	topText = "",
    bottomText = "",
	shoutOutTime = 1,
	backgroundTime = 1,
	bottomTextReplaced = "",
	topTextReplaced = "",
	isPlaying = false,
	queue = [];

let totalEvents = 0;

console.log(totalEvents)
window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail.event) {
      	return;
    }
    if (typeof obj.detail.event.itemId !== "undefined") {
        return;
    }
    const listener = obj.detail.listener.split("-")[0];
    const event = obj.detail.event;

    if (listener === 'message') {
      	text = event.data.text.toLowerCase()
      	if(text.split(" ")[0] === command && (event.data["badges"][0]["type"] === "broadcaster" || event.data["badges"][0]["type"] === "moderator")) {
          	queue.push(text.split(" ")[1].replace(/[@]/, ''))
          	playQueue()
        } 
    } else if (listener === 'raid') {
        if (includeRaids && minRaid <= event.amount) {
            addEvent('raid', `Raid ${event.amount.toLocaleString()}`, event.name);
        }
    }
});

function playQueue () {
	if (isPlaying) {
      setTimeout(() => {playQueue()}, shoutOutTime * 1000);
      console.log("isPlaying")
    } else {
      const userToShout = queue.shift()
      queryDecapi(userToShout)
      console.log("else")
    }
}


window.addEventListener('onWidgetLoad', function (obj) {
    let recents = obj.detail.recents;
    recents.sort(function (a, b) {
        return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    });
    const fieldData = obj.detail.fieldData;
    includeHosts = (fieldData.includeHosts === "yes");
    minHost = fieldData.minHost;
    includeRaids = (fieldData.includeRaids === "yes");
    minRaid = fieldData.minRaid;
  	command = fieldData.command;
  	debug = (fieldData.debug === "yes");
	topText = fieldData.topText;
    bottomText = fieldData.bottomText;
  	shoutOutTime = fieldData.shoutOutTime;
  	backgroundTime = fieldData.backgroundTime;
  
     if(debug) {
       	queue.push("Morte_Mors")
       	playQueue()
     };
    let eventIndex;
    for (eventIndex = 0; eventIndex < recents.length; eventIndex++) {
        const event = recents[eventIndex];
    }
});

function queryDecapi(user) {
  let avatar, game, title, name;
  const urls = [
     'https://decapi.me/twitch/avatar/' + user,
     'https://decapi.me/twitch/game/' + user,
     'https://decapi.me/twitch/title/' + user
   ];

        // Make a promisse with the urls and get the infos from the responses
        Promise.all(urls.map(u => fetch(u)))
            .then(responses => Promise.all(responses.map(res => res.text())))
            .then(responses => {
                avatar = responses[0];
                game   = responses[1];
          		title   = responses[2];
                name   = user;
          		
				
          		topTextReplaced = topText.replace("*user*", name).replace("*title*", title).replace("*game*", game)
          		bottomTextReplaced = bottomText.replace("*user*", name).replace("*title*", title).replace("*game*", game)
          		animation(avatar, bottomTextReplaced, topTextReplaced)
            });
}

function animation(avatar, btText, tpText){
  	isPlaying = true;
  	totalEvents += 1;
	let element;
 	element = `
	<div class="event-container" id="event-1">
    	<div class="username-container">${tpText}</div>
		<div class="event-image"><img src="${avatar}"></img></div>
		<div class="details-container">${btText}</div>
    </div>
	`;
  	$('.main-container').append(element);
  	setTimeout(() => {removeEvent(1)}, shoutOutTime * 1000);
}

function removeEvent(eventId) {
	$(`#event-${eventId}`).addClass("event-container-out");
    setTimeout(() => {
      $(`#event-${eventId}`).remove();
      isPlaying = false;
    }, backgroundTime * 1000);
}