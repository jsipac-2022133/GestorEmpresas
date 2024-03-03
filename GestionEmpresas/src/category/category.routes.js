'use strict'

import express from 'express'
import { checkAuth } from '../middleware/auth.js'
import { addCategory,deleteCategory, getAllCategories, updateCategory } from './category.controller.js'

const api=express.Router()

api.post('/addNewCategory', checkAuth, addCategory)
api.get('/selectCategories', checkAuth, getAllCategories)
api.put('/updateCategory/:id', checkAuth, updateCategory)
api.delete('/deleteCategory/:id', checkAuth, deleteCategory)

export default api