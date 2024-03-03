'use strict';
import express from "express";
import { checkAuth } from "../middleware/auth.js";
import { addCompany, updateCompany, generarExcel, trayectoriaMayor, trayectoriaMenor, 
    companyByCategory, companyAZ, companyZA, selectCompanies} from "./company.controller.js";

const api = express.Router();

api.post('/addCompany', checkAuth, addCompany);
api.put('/updateCompany/:id', checkAuth, updateCompany);
api.get('/selectCompanies', checkAuth, selectCompanies)

api.get('/trayectoriaMayor', checkAuth, trayectoriaMayor);
api.get('/trayectoriaMenor', checkAuth, trayectoriaMenor);
api.get('/searchByCategory', checkAuth, companyByCategory)
api.get('/searchCompanyFromA-Z', checkAuth, companyAZ)
api.get('/searchCompanyFromZ-A', checkAuth, companyZA)
api.get('/crearReporte', checkAuth, generarExcel)

export default api;