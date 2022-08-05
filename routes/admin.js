const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../models/userModel");
const Service = require("../models/serviceModel");
const Client = require("../models/clientModel");
const Work = require("../models/workModel");

const path = require("path");
const fs = require("fs");
const uploadMW = require("../middleware/uploadMW");
const Resize = require("../middleware/sharp");

const _ = require("lodash");

const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

const serviceLister = async () => {
  return (services = await Service.find({}));
};

router.route("/").get((req, res) => {
  res.redirect("/admin/main");
});

router.route("/main").get(auth, (req, res) => {
  res.render("admin/main");
});

router
  .route("/login")
  .get((req, res) => {
    res.render("admin/login", {
      metaTitle: "Admin login",
      headerStyle: "",
    });
  })
  .post((req, res) => {
    console.log(req.body);

    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local", { failureRedirect: "/admin/login" })(
          req,
          res,
          function () {
            console.log("User authenticated");
            res.redirect("/admin");
          }
        );
      }
    });
  });

router.route("/services").get(auth, async (req, res) => {
  const services = await Service.find({});

  // TODO: DEBLOAT THE SERVICES OUTPUT

  res.render("admin/services", {
    metaTitle: "Servisler",
    services: services,
  });
});

router
  .route("/service")
  .get(auth, async (req, res) => {
    const allServices = await Service.find({});
    let allCategories = [];

    allServices.map((service, index) => {
      if (!allCategories.includes(service.category)) {
        allCategories.push(service.category);
      }
    });

    res.render("admin/service-edit", {
      service: {
        miniIco: "fa-solid fa-hammer",
      },
      allCategories: allCategories,
      formJob: "add",
    });
  })
  .post(auth, async (req, res) => {
    let newServiceUrl = _.kebabCase(req.body.title);
    const sameUrl = await Service.findOne({ url: newServiceUrl });

    if (sameUrl) {
      while (newServiceUrl === sameUrl.url) {
        newServiceUrl = newServiceUrl + "-" + Math.floor(Math.random() * 100);
      }
    }

    const reqCategoryFunc = () => {
      if (req.body.category === "newCategory") {
        return req.body.categoryNew;
      } else {
        return req.body.category;
      }
    };
    const reqCategory = await reqCategoryFunc();

    const newService = new Service({
      title: req.body.title,
      desc: req.body.desc,
      miniIco: req.body.miniIco,
      category: reqCategory,
      url: newServiceUrl,
    });
    newService.save();
    res.redirect("/admin/services");
  });

router
  .route("/service/:id")
  .get(auth, async (req, res) => {
    const reqId = req.params.id;
    const getService = await Service.findOne({ _id: reqId });
    const allServices = await Service.find({});
    let allCategories = [];

    allServices.map((service, index) => {
      if (!allCategories.includes(service.category)) {
        allCategories.push(service.category);
      }
    });

    res.render("admin/service-edit", {
      service: getService,
      formJob: "edit",
      allCategories: allCategories,
    });
  })
  .post(auth, async (req, res) => {
    const job = req.query.job;
    const reqId = req.params.id;

    if (req.query.job === "edit") {
      const reqCategoryFunc = () => {
        if (req.body.category === "newCategory") {
          return req.body.categoryNew;
        } else {
          return req.body.category;
        }
      };
      const reqCategory = await reqCategoryFunc();

      const updatedService = await Service.findByIdAndUpdate(
        reqId,
        {
          title: req.body.title,
          desc: req.body.desc,
          miniIco: req.body.miniIco,
          category: reqCategory,
        },
        {
          new: true,
        }
      );
      res.redirect("/admin/services");
    }
    if (req.query.job === "delete") {
      const getService = await Service.findById(reqId);

      await getService.remove();
      res.redirect("/admin/services");
    }
  });

router.route("/clients").get(auth, async (req, res) => {
  const clients = await Client.find({});

  res.render("admin/clients", {
    clients: clients,
  });
});

router
  .route("/client")
  .get(auth, (req, res) => {
    res.render("admin/client-edit", {
      clientX: {},
      formJob: "add",
    });
  })
  .post(auth, uploadMW.single("logo"), async (req, res) => {
    const imagePath = path.join(__dirname, "../public/uploaded/images");
    const fileUpload = new Resize(imagePath, 300);
    if (!req.file) {
      res.status(401).json({ error: "Please provide an image" });
    }
    const filename = await fileUpload.save(req.file.buffer);

    const newClient = new Client({
      name: req.body.name,
      logo: filename,
    });
    newClient.save();

    res.redirect("/admin/clients");
  });

router
  .route("/client/:id")
  .get(auth, async (req, res) => {
    const reqId = req.params.id;
    const getClient = await Client.findOne({ _id: reqId });

    res.render("admin/client-edit", {
      clientX: getClient,
      formJob: "edit",
    });
  })
  .post(auth, uploadMW.single("logo"), async (req, res) => {
    const job = req.query.job;
    const reqId = req.params.id;
    const getClient = await Client.findById(reqId);

    if (job === "edit") {
      let filename;

      if (req.file) {
        const imagePath = path.join(__dirname, "../public/uploaded/images");
        const fileUpload = new Resize(imagePath, 300);
        filename = await fileUpload.save(req.file.buffer);
        const deletePath = path.normalize(imagePath + "/" + getClient.logo);

        fs.unlink(deletePath, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("!!! File Deleted: " + deletePath);
          }
        });
      }

      if (!req.file) {
        filename = getClient.logo;
      }

      const updatedClient = await Client.findByIdAndUpdate(
        reqId,
        {
          name: req.body.name,
          logo: filename,
        },
        {
          new: true,
        }
      );
      console.log(updatedClient);
      res.redirect("/admin/clients");
    }

    if (job === "delete") {
      const imagePath = path.join(__dirname, "../public/uploaded/images");
      const deletePath = path.normalize(imagePath + "/" + getClient.logo);

      fs.unlink(deletePath, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("!!! File Deleted: " + deletePath);
        }
      });

      await getClient.remove();
      res.redirect("/admin/clients");
    }
  });

router.route("/works").get(auth, async (req, res) => {
  const getWorks = await Work.find({});

  res.render("admin/works", {
    metaTitle: "İşler",
    works: getWorks,
  });
});

router
  .route("/work")
  .get(auth, async (req, res) => {
    const getClients = await Client.find({});
    const getServices = await Service.find({});

    res.render("admin/work-edit", {
      work: {},
      formJob: "add",
      clients: getClients,
      services: getServices,
    });
  })
  .post(auth, uploadMW.array("img", 20), async (req, res) => {
    const uploadedImg = req.files;
    const imagePath = path.join(__dirname, "../public/uploaded/images");
    let imgsNames = [];

    if (req.files.length === 0) {
      res.status(401).json({ error: "Please provide images" });
    }

    const eacher = new Promise((resolve, reject) => {
      uploadedImg.forEach(async (file, index, array) => {
        const fileUpload = new Resize(imagePath, 1000);
        const filename = await fileUpload.save(file.buffer);
        imgsNames.push(filename);

        const doneCheck = setInterval(() => {
          if (imgsNames.length === array.length) {
            clearInterval(doneCheck);
            resolve();
          }
        }, 200);
      });
    });

    eacher.then(async () => {
      let newWorkUrl = _.kebabCase(req.body.title);
      const sameUrl = await Work.findOne({ url: newWorkUrl });

      if (sameUrl) {
        while (newWorkUrl === sameUrl.url) {
          newWorkUrl = newWorkUrl + "-" + Math.floor(Math.random() * 100);
        }
      }

      const newWork = await Work.create({
        title: req.body.title,
        desc: req.body.desc,
        client: req.body.client,
        service: req.body.service,
        imgs: imgsNames,
        url: newWorkUrl,
      });

      res.redirect("/admin/works");
    });
  });

router
  .route("/work/:id")
  .get(auth, async (req, res) => {
    const getWork = await Work.findOne({ _id: req.params.id });
    const getClients = await Client.find({});
    const getServices = await Service.find({});

    res.render("admin/work-edit", {
      work: getWork,
      formJob: "edit",
      clients: getClients,
      services: getServices,
    });
  })
  .post(auth, uploadMW.array("img", 20), async (req, res) => {
    const job = req.query.job;
    const reqId = req.params.id;

    if (job === "edit") {
      const uploadedImg = req.files;
      const imagePath = path.join(__dirname, "../public/uploaded/images");
      let imgsNames = [];

      if (uploadedImg.length === 0) {
        const updatedWork = await Work.findByIdAndUpdate(
          reqId,
          {
            title: req.body.title,
            desc: req.body.desc,
            client: req.body.client,
            service: req.body.service,
          },
          {
            new: true,
          }
        );

        res.redirect("/admin/works");
      }

      const eacher = new Promise((resolve, reject) => {
        uploadedImg.forEach(async (file, index, array) => {
          const fileUpload = new Resize(imagePath, 1000);
          const filename = await fileUpload.save(file.buffer);
          imgsNames.push(filename);

          const doneCheck = setInterval(() => {
            if (imgsNames.length === array.length) {
              clearInterval(doneCheck);
              resolve();
            }
          }, 200);
        });
      });

      if (uploadedImg.length >= 1) {
        eacher.then(async () => {
          const updatedWork = await Work.findByIdAndUpdate(
            reqId,
            {
              title: req.body.title,
              desc: req.body.desc,
              client: req.body.client,
              service: req.body.service,
              imgs: imgsNames,
            },
            {
              new: false,
            }
          );

          const imagePath = path.join(__dirname, "../public/uploaded/images");
          const deletePath = path.normalize(imagePath + "/");
          updatedWork.imgs.forEach(async (img) => {
            fs.unlink(deletePath + img, (err) => {
              if (err) {
                console.log(err);
              } else {
                console.log("!!! File Deleted: " + deletePath + img);
              }
            });
          });

          res.redirect("/admin/works");
        });
      }
    }

    if (job === "delete") {
      const getWork = await Work.findById(reqId);
      const imagePath = path.join(__dirname, "../public/uploaded/images");
      const deletePath = path.normalize(imagePath + "/");

      getWork.imgs.forEach(async (img) => {
        fs.unlink(deletePath + img, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("!!! File Deleted: " + deletePath + img);
          }
        });
      });

      await getWork.remove();
      res.redirect("/admin/works");
    }
  });

router.route("/logout").get(auth, (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/admin");
  });
});

module.exports = router;
