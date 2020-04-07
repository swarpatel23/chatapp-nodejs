const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const messageLocationTemplate = document.querySelector(
  "#message-location-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

if (!username || !room) {
  location.href = "/";
} else {
  const autoScroll = () => {
    const $newMessage = $messages.lastElementChild;

    // height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    //how far have i scroll?
    const scollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scollOffset) {
      $messages.scrollTop = $messages.scrollHeight;
    }
  };

  document.querySelector("#text").focus();
  socket.on("message", (msg) => {
    //console.log(msg);

    const html = Mustache.render(messageTemplate, {
      username: msg.username,
      message: msg.text,
      createdAt: moment(msg.createdAt).format("h:mm a"),
    });
    if (msg.text != "") {
      $messages.insertAdjacentHTML("beforeend", html);
    }
    autoScroll();
    // let interact = document.querySelector("#interact");
    // let child = document.createElement("p");
    // child.innerHTML = msg;
    // interact.prepend(child);
  });

  socket.on("locationMessage", (location_url) => {
    console.log(location_url);
    const html = Mustache.render(messageLocationTemplate, {
      username: location_url.username,
      url: location_url.url,
      createdAt: moment(location_url.createdAt).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
  });

  socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
      room,
      users,
    });
    document.querySelector("#sidebar").innerHTML = html;
  });

  $messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = e.target.elements.message.value;
    if (message) {
      $messageFormButton.setAttribute("disabled", "disabled");
      socket.emit("clientmsg", message, (error) => {
        $messageFormButton.removeAttribute("disabled");
        if (error) {
          return console.log(error);
        }
        console.log("Message Deliverd");
      });
      document.querySelector("#text").value = "";
    }
  });

  document.querySelector("#send-location").addEventListener("click", () => {
    if (!navigator.geolocation) {
      return alert("Geoloction is not support by browser");
    }

    $sendLocationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);

      socket.emit(
        "sendLocation",
        {
          lat: position.coords.latitude,
          long: position.coords.longitude,
        },
        (location_ack) => {
          console.log(location_ack);
          $sendLocationButton.removeAttribute("disabled");
        }
      );
    });
  });

  socket.emit("join", { username, room }, (error) => {
    if (error) {
      alert(error);
      location.href = "/";
    }
  });
}
