const express = require("express");
const router = express.Router();

const Service = require("../models/serviceModel");
const Client = require("../models/clientModel");
const Work = require("../models/workModel");

router.route("/").get(async (req, res) => {
  const services = await Service.find({});
  const clients = await Client.find({});
  const works = await Work.find({});

  res.render("home", {
    metaTitle: "Anasayfa",
    metaDesc:
      "Hikmet Küçük Endüstriyel İnşaat olarak 20 yılı aşkın senedir inşaat çözümleri sunuyoruz.",
    services: services,
    clients: clients,
    works: works,
  });
});

router.route("/kurumsal").get((req, res) => {
  res.render("about", {
    metaTitle: "Kurumsal | Boyaservis",
    metaDesc:
      "Hikmet Küçük Endüstriyel İnşaat olarak 20 yılı aşkın senedir inşaat çözümleri sunuyoruz. Firmamız hakkında.",
  });
});

router
  .route("/iletisim")
  .get((req, res) => {
    res.render("contact", {
      metaTitle: "İletişim | Boyaservis",
      metaDesc:
        "Hikmet Küçük Endüstriyel İnşaat olarak 20 yılı aşkın senedir inşaat çözümleri sunuyoruz. Firmamız hakkında.",
    });
  })
  .post((req, res) => {
    const nodeMailer = require("nodemailer");
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.MAIL_NAME,
        pass: process.env.MAIL_PASS,
      },
    });

    let mailOptions = {
      from: `"${req.body.name}" <${req.body.email}>`, // sender address
      to: `${process.env.ADMINMAIL}`, // list of receivers
      subject: "Websitesinden Mesaj | Boyaservis", // Subject line
      html: `
      <h1><b>Gönderen Ad:</b> ${req.body.name}</h1>
      <h2><b>Gönderen E-Posta:</b> ${req.body.email}</h2>
      <h2><b>Gönderen Telefon:</b> ${req.body.tel}</h2>
      <p><b>Gönderen Mesaj:</b> ${req.body.message}</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.json({ job: "error" });
      } else {
        console.log("Message %s sent: %s", info.messageId, info.response);
        res.json({ job: "success" });
      }
    });
  });

module.exports = router;
