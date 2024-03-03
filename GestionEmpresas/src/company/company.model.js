import mongoose from "mongoose";

const companySchema=mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    impacto:{
        type: String,
        required: true
    },
    añosTrayectoria:{
        type: Number,
        required: true
    },
    category:{
        type: mongoose.Types.ObjectId,
        ref: 'category',
        required: true
    },
    web:{
        type: String,
        required: true
    }
})

export default mongoose.model('company', companySchema)