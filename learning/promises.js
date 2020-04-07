const doWorkPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    //resolve([1, 3, 3, 4, 4]);
    reject("Things ent wrong");
  }, 3000);
});

doWorkPromise
  .then((result) => {
    console.log("success", result);
  })
  .catch((error) => {
    console.log("Error!", error);
  });
