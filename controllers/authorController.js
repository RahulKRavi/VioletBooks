const { Author } = require('../models/bookModel'); 
const statusHelper = require('../helpers/statusHelper')

const loadListAuthorsForAdmin = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: '.*' + search + '.*' } },
            ];
        }
        const authorData = await Author.find(query);
        res.render('list-authors', { authors: authorData });
    } catch (error) {
        console.log(error.message);
    }
};

const loadAddAuthor = async (req,res)=>{
    try {
        res.render('add-author')  
    } catch (error) {
        console.log(error.nessage)
    }
}

const addAuthor = async(req,res)=>{
    try {
        const newAuthor = new Author({  
            name: req.body.name,
            nationality: req.body.nationality,
            image: req.file.filename,
            about: req.body.about
        })

        const authorData = await newAuthor.save()
        if(authorData){
            res.redirect('/admin/list-authors')
        }
        else{
            res.render('add-author', {message:'Unable to add New Author'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadEditAuthor = async (req,res)=>{
    try {
        const id = req.query.id;
        const authorData = await Author.findById({_id:id})
        if(authorData){
            res.render('edit-author', {authors:authorData})
        }
        else{
            res.redirect('admin/list-authors')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const editAuthor = async (req,res)=>{
    try {
        const authorData = await Author.findByIdAndUpdate({_id:req.body.id},{$set:{
            name: req.body.name,
            nationality: req.body.nationality,
            about: req.body.about
        }})
        if(authorData){
            res.redirect('/admin/list-authors')
        }
        else{
            res.render('edit-author', {message:'Unable to Edit Author'})
        }
    } catch (error) {
        console.log(error.message)
    }
}


const deactivateAuthor = async(req,res)=>{
    await statusHelper.updateModelStatus(req,res,Author,1,'/admin/list-authors')
}

const reactivateAuthor = async(req,res)=>{
    await statusHelper.updateModelStatus(req,res,Author,0,'/admin/list-authors')
}

module.exports = {
    loadListAuthorsForAdmin,
    loadAddAuthor,
    addAuthor,
    loadEditAuthor,
    editAuthor,
    deactivateAuthor,
    reactivateAuthor
}