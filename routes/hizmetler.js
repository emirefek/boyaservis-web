const express = require("express");
const router = express.Router();

const Service = require("../models/serviceModel");
const Work = require("../models/workModel");

router.route("/").get(async (req, res) => {
  const services = await Service.find({});
  let allCategories = [];

  services.map((service, index) => {
    if (!allCategories.includes(service.category)) {
      allCategories.push(service.category);
    }
  });

  res.render("services", {
    metaTitle: "Hizmetler | Boyaservis",
    metaDesc: "Hikmet Küçük Endüstriyel İnşaat olarak 20 yılı aşkın senedir sunduğumuz tüm hizmetlerimiz.",
    services: services,
    allCategories: allCategories,
  });
});

router.route("/:search").get(async (req, res) => {
  const reqUrl = req.params.search;
  const service = await Service.findOne({ url: reqUrl });
  const releatedWorks = await Work.find({ service: service._id });

  res.render("services-single", {
    metaTitle: `${service.title} | Boyaservis`,
    metaDesc: service.title + "Hizmetimiz, endüstriyel inşaat çözümleri.",
    service: service,
    releatedWorks: releatedWorks,
  });
});

module.exports = router;
