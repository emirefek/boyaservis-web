const express = require("express");
const router = express.Router();

const _ = require("lodash");

const Work = require("../models/workModel");
const Client = require("../models/clientModel");
const Service = require("../models/serviceModel");

router.route("/").get(async (req, res) => {
  const getWorks = await Work.find({});

  res.render("works", {
    metaTitle: "İşler | Boyaservis",
    metaDesc: "Hikmet Küçük Endüstriyel İnşaat olarak 20 yılı aşkın senedir inşaat çözümleri sunuyoruz. İşlerimizden bazıları.",
    works: getWorks,
  });
});

router.route("/:search").get(async (req, res) => {
  // const searchParam = _.lowerCase(req.params.search);
  // const getWork = await Work.findOne({
  //   title: { $regex: `^${searchParam}$`, $options: "i" },
  // });

  console.log("Work search: " + req.params.search);
  const getWork = await Work.findOne({ url: req.params.search });
  console.log(getWork);

  if (!getWork) {
    res.send("cant find work");
  }

  if (getWork) {
    const getClient = await Client.findOne({ _id: getWork.client });
    const getService = await Service.findOne({ _id: getWork.service });

    res.render("works-single", {
      metaTitle: `${getWork.title} | Boyaservis`,
      metaDesc: getWork.title + "Hizmetimiz, endüstriyel inşaat çözümleri.",
      work: getWork,
      workClient: getClient,
      workService: getService,
    });
  }
});

module.exports = router;
