const mongoose = require("mongoose")

const genreSchema = new mongoose.Schema({  
    name:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Number,
        default:0
    }
})

const authorSchema = new mongoose.Schema({  
    name:{
        type:String,
        required:true
    },
    nationality:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    image: {
        type: String,
        required: true
    },
    isDeleted:{
        type:Number,
        default:0
    }
})

const bookSchema = new mongoose.Schema({  
    title: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
    totalSales:{
        type:Number,
        default:0
    },
    isDeleted:{
        type:Number,
        default:0
    }
});


const Genre = mongoose.model('Genre', genreSchema);
const Author = mongoose.model('Author', authorSchema);
const Book = mongoose.model('Book', bookSchema);


 module.exports = {
    Genre,
    Author,
    Book
}