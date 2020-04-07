const users = [];

//add user, remove user, getUser, getUserInRoom,

const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the Data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }
  //check for existing User
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username in use!",
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id); //returns  -1 if not found

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUserInRoom = (room) => {
  // const userInRoom = [];
  // users.forEach((user) => {
  //   if (user.room === room) {
  //     userInRoom.push(user);
  //   }
  // });
  // return userInRoom;
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room == room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
};
