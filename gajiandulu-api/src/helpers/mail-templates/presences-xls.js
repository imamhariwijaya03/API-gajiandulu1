const config = require('config');
const dateHelper = require('../dateHelper');

const monthToString = date => {
  const arrayDate = date.split('-');
  const result = `${arrayDate[2]}-${dateHelper[parseInt(arrayDate[1])]}-${arrayDate[0]}`;
  return result;
};

const presencesXls = ({ companyData, start, end }) =>
  /*eslint-disable indent */
  `
  <div style="max-width:600px!important;font-family:Helvetica">
  <center>
  <img src="http://${config.host}/uploads/email/logo.png" style="background: #03A9F4;width: 300px"/>
  <h2>Data Presensi ${companyData.name}</h2>
  <p>Anda telah melakukan permintaan untuk request Data Presensi.</p>
  <p>Berikut adalah Data Presensi yang di export dalam bentuk excel pada periode</p>
  <h4>===================================================</h4>
  <h3> ${monthToString(start)} s/d ${monthToString(end)} </h3>
  <p>Lihat Attachment</p>
  <h4>===================================================</h4>
  <hr>
  <p>Jika kamu memiliki pertanyaan atau klarifikasi lebih lanjut, kamu dapat selalu menghubungi kami melalui:</p>
  <p>Email: cs@atenda.id</p>
  <p>LINE ID: @atendaid</p>
  <br>
  <p>Terima kasih atas dukungan dan kepercayaan kakak menggunakan Atenda!</p>
  <center>
    <a href="https://www.facebook.com/atenda.id" target="_blank" rel="noreferrer"><img src="http://${
      config.host
    }/uploads/email/facebook-icon.png"/></a>
    <a href="http://atenda.id" target="_blank" rel="noreferrer"><img src="http://${
      config.host
    }/uploads/email/link-icon.png"/></a>
    <a href="https://www.instagram.com/atenda.id" target="_blank" rel="noreferrer"><img src="http://${
      config.host
    }/uploads/email/instagram-icon.png"/></a>
  </center>
  <p>Copyright © 2019 PT. Atenda Rumah Kita, All rights reserved.</p>
  <p>Our mailing address is:</p>
  <p>cs@atenda.id</p>
  </center>
  </div>
  `;

module.exports = presencesXls;
