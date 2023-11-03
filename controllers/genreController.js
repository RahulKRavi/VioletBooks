const { Genre, Book } = require('../models/bookModel'); 
const statusHelper = require('../helpers/statusHelper')


//Controller Functions For Admin Side


const loadListGenresForAdmin = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: '.*' + search + '.*' } }
            ];
        }
        const genreData = await Genre.find(query);
        res.render('list-genres', { genres: genreData });
    } 
    catch (error) {
        console.log(error.message);
    }
};

const loadAddGenre = async (req,res)=>{
    try {
        res.render('add-genre')  
    } catch (error) {
        console.log(error.nessage)
    }
}

const addGenre = async(req,res)=>{
    try {
        if (!genreName || !about) {
            return res.render('add-genre', {message:'Name and About are required'})
        }
        const existGenre = await Genre.findOne({name:req.body.genreName})
        if(existGenre){
            return res.render('add-genre', {message:'Genre already exists'})
        }
        const newGenre = new Genre({  
            name: req.body.genreName,
            about: req.body.about
        })
        const genreData = await newGenre.save()
        if(genreData){
            res.redirect('/admin/list-genres')
        }
        else{
            res.render('add-genre', {message:'Unable to add New Genre'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditGenre = async (req,res)=>{
    try {
        const id = req.query.id;
        const genreData = await Genre.findById({_id:id})
        if(genreData){
            res.render('edit-genre', {genres:genreData})
        }
        else{
            res.redirect('/admin/list-genres')
        }
    } catch (error) {
        console.log(error.nessage)
    }
}

const editGenre = async(req,res)=>{
    try {
        const genreData = await Genre.findByIdAndUpdate({_id:req.body.id},{$set:{
            name:req.body.name,
            about:req.body.about
        }})
        if(genreData){
            res.redirect('/admin/list-genres')
        }
        else{
            res.render('edit-genre', {message:'Unable to Edit Genre'})
        }
    } catch (error) {
        console.log(error.message)
    }
}


const deactivateGenre = async(req,res)=>{
    await statusHelper.updateModelStatus(req,res,Genre,1,'/admin/list-genres')
}

const reactivateGenre = async(req,res)=>{
    await statusHelper.updateModelStatus(req,res,Genre,0,'/admin/list-genres')
}



//Controller Functions For User Side


const loadViewGenre = async(req, res)=>{
    try{
        const id = req.query.id;
        const selectedGenre = await Genre.findById(id)

        const genres = await Genre.find()

        if(selectedGenre){
            const books = await Book.find({ genre: selectedGenre._id }).populate('genre');
            res.render('view-genre', {genres, selectedGenre, books})
        }
        else{
            res.render('/list-genres')
        }
    }
    catch(error){
        console.log(error.message)
    }
}

module.exports = {
    loadListGenresForAdmin,
    loadAddGenre,
    addGenre,
    loadEditGenre,
    editGenre,
    deactivateGenre,
    reactivateGenre,
    loadViewGenre
}