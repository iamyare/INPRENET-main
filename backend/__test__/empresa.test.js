const request = require('supertest');
const assert = require('assert');
const express = require('express');
//import app from "./app.js"
const  app  = require('../app');

describe('POST /empresas', function() {
    it('responds with json', function(done) {
      request(app)
        .post('/empresas')
        .send(
            {
                nombre: "Empresa de Prueba",
                telefono: "123-456-7890",
                RTN: 123456789,
                representante_legal: "Nombre Representante",
                apoderado_legal: "Nombre Apoderado",
                correo: "empresa.prueba@example.com",
                logo: "ruta/del/logo.png"
            }
          )
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          return done();
        });
    });
  });

describe('GET /empresas', function() {
    it('responds with json', function(done) {
      request(app)
        .get(`/empresas:${1}` )
        .send(
            {
                uuid: "Empresa de Prueba"
            }
          )
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          return done();
        });
    });
  });