'use strict'

import {verifyToken} from '../helpers/generateToken.js'
import { checkUpdate } from "../utils/validator.js";
import excel from 'excel4node';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";
import Company from "./company.model.js";
import Category from "../category/category.model.js";

export const addCompany=async(req,res)=>{
    try {
        const token=req.headers.authorization.split(' ')[1]
        const decodedToken=await verifyToken(token)
        console.log(decodedToken)
        if(!decodedToken) return res.send({message: 'Invalid token'})

        const data=req.body

        if(data.category){
            let category = await Category.findOne({_id: data.category})
            if(!category) return res.status(404).send({message: 'Category not found'})
        }
        const company=new Company(data)
        await company.save()
        return res.send({message: 'Company saved successfully'})

    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error saving Company'})
    }
}


//MOSTRAR TODAS LAS EMPRESAS
export const selectCompanies = async (req, res) => {
    try {        
        const companies = await Company.find();

        res.send(['Todas las empresas', companies]);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Hubo un error al obtener todas las empresas" });
    }
}

//ACTUALIZAR
export const updateCompany=async(req,res)=>{
    try {
    const {id}=req.params
    const data=req.body

    const update=checkUpdate(data, id)
    if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be updated or missing data'})
    
    const token=req.headers.authorization.split(' ')[1]
    const decodedToken=await verifyToken(token)
    if(!decodedToken) return res.status(401).send({message: 'Invalid token'})

    const userId=decodedToken._id
    const CompanyToUpdate=await Company.find({_id: id, user: userId})
    if(!CompanyToUpdate) return res.status(403).send({message: 'You are not authorized to update this Company'})
    
    const updatedCompany=await Company.findOneAndUpdate(
        {_id: id},
        data,
        {new: true}
    )

    if(!updatedCompany) return res.status(404).send({message: 'Comment not found or not updated'})

    return res.send({message: 'Updated Company', updatedCompany})

    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error updating comment', error})
    }
}


//MAYOR A MENOR
export const trayectoriaMayor = async(req,res)=>{    
      try {        
        const companys = await Company.find().sort({ añosTrayectoria: -1 }).populate('category', ['-_id','name']);          
        res.send(['Empresas ordenadas por años de trayectoria de mayor a menor', companys]);

      } catch (error) {        
        console.error(error);
        res.status(500).send({ message: "Hubo un error al obtener las empresas por años de trayectoria" });
      }
    }
  
//MENOR A MAYOR
export const trayectoriaMenor = async(req,res)=>{
    try {        
        const companies = await Company.find().sort({ añosTrayectoria: 1 }).populate('category', ['-_id','name']);        
        res.send(['Empresas ordenadas por años de trayectoria de menor a mayor', companies]);

    } catch (error) {        
        console.error(error);
        res.status(500).send({ message: "Hubo un error al obtener las empresas por años de trayectoria" });
    }
}

//BUSCAR POR CATEGORÍA
export const companyByCategory = async (req, res) => {
    try {
        const nombreCategoria = req.body.category; 
        
        const categoria = await Category.findOne({ name: nombreCategoria });

        if (!categoria) {
            return res.status(404).send({ message: "La categoría especificada no fue encontrada" });
        }
        
        const companies = await Company.find({ category: categoria._id }).populate('category', ['-_id', 'name']);

        res.send(['Empresas con la categoría especificada', companies]);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Hubo un error al obtener las empresas por categoría" });
    }
}


//COMPANY DE A-Z
export const companyAZ = async (req, res) => {
    try {        
        const companies = await Company.find().sort({ name: 1 }).populate('category', ['-_id','name']);;

        res.send(['Empresas ordenadas alfabéticamente de A-Z', companies]);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Hubo un error al obtener las empresas en orden alfabético" });
    }
}

//COMPANY DE Z-A
export const companyZA = async (req, res) => {
    try {        
        const companies = await Company.find().sort({ name: -1 }).populate('category', ['-_id','name']);;
        res.send(['Empresas ordenadas alfabéticamente de Z-A', companies]);

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Hubo un error al obtener las empresas en orden alfabético" });
    }
}


//GENERARR EXCEL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
    
let reportCounter = 1;


function getUniqueFileName() {
    const fileName = `ReporteEmpresas-${reportCounter}.xlsx`;
    reportCounter++;
    return fileName;
}


export const generarExcel=async (req, res) => {
    try {        
        const Companys = await Company.find().populate('category');
        
        let wb = new excel.Workbook();
        let ws = wb.addWorksheet('Empresas');
        
        let styleHeader = wb.createStyle({
            font: {
                color: '#040404',
                size: 12,
                bold: true 
            }
        });

        // Emcabezados
        ws.cell(1, 1).string('Nombre').style(styleHeader);
        ws.cell(1, 2).string('Impacto').style(styleHeader);
        ws.cell(1, 3).string('Años de Trayectoria').style(styleHeader);
        ws.cell(1, 4).string('Categoría').style(styleHeader);
        ws.cell(1, 5).string('Sitio Web').style(styleHeader);

        // Datos
        Companys.forEach((company, index) => {
            ws.cell(index + 2, 1).string(company.name);
            ws.cell(index + 2, 2).string(company.impacto);
            ws.cell(index + 2, 3).number(company.añosTrayectoria);
            ws.cell(index + 2, 4).string(company.category.name); 
            ws.cell(index + 2, 5).string(company.web);
        });
        
        ws.column(1).setWidth(30);
        ws.column(2).setWidth(30);
        ws.column(3).setWidth(20);
        ws.column(4).setWidth(30);
        ws.column(5).setWidth(50);
        
        const fileName = getUniqueFileName();
        const pathExcel = path.join(__dirname, '..', 'reportes', fileName);
        
        wb.write(pathExcel, function(err, stats) {
            if (err) {
                console.log(err);
                res.status(500).send({ message: "Error al generar el archivo Excel" });
            } else {
                console.log("Excel generado exitosamente");                
                res.download(pathExcel, fileName, function(err) {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: "Error al descargar el archivo Excel" });
                    } else {
                        console.log("Archivo Excel descargado exitosamente");
                    }
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error al obtener las empresas desde la base de datos" });
    }
};
