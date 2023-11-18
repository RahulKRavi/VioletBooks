const { Genre, Author, Book } = require('../models/bookModel'); 
const statusHelper = require('../helpers/statusHelper')

const loadListBooksForAdmin = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }
        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: '.*' + search + '.*' } }
            ];
        }
        const page = req.query.page || 1;
        const perPage = req.query.perPage || 5;
        const startIndex = (page - 1) * perPage;

        const sortField = req.query.sortField || 'title'; // Default sorting field
        const sortOrder = req.query.sortOrder || 1; // Default sorting order (1 for ascending, -1 for descending)
    
        // Create the sort object
        const sort = {};
        sort[sortField] = sortOrder;

        const totalBooks = await Book.countDocuments({isDeleted:0})
        const allBooks = await Book.find(query);
        const displayPagination = allBooks.length > perPage;
        const books = await Book.find(query)
            .sort(sort)
            .skip(startIndex)
            .limit(perPage)
        res.render('list-books',{ 
            books, 
            currentPage:parseInt(page), 
            totalPages: Math.ceil(totalBooks/perPage),
            displayPagination
        }) 
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/error-page')
    }
};

const loadAddBook = async (req,res)=>{
    try {
        const genres = await Genre.find();
        const authors = await Author.find(); 
        res.render('add-book', {genres,authors})  
    } catch (error) {
        console.log(error.nessage)
        res.redirect('/admin/error-page')
    }
}

const addBook = async(req,res)=>{
    try {
        const selectedGenre = req.body.genre;
        const selectedAuthor = req.body.author;

        const genreDocument = await Genre.findOne({ name: selectedGenre });
        const authorDocument = await Author.findOne({ name: selectedAuthor });

        const newBook = new Book({
            title: req.body.title,
            image: req.file.filename,
            about: req.body.about,
            price: req.body.price,
            stock: req.body.stock,
            genre: genreDocument,   
            author: authorDocument
        });

        const bookData = await newBook.save()
        if(bookData){
            res.redirect('/admin/list-books')
        } else {
            res.render('add-book', {message:'Unable to add New Book'})
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}

const loadEditBook = async (req,res)=>{
    try {
        const id = req.query.id;
        const bookData = await Book.findById({_id:id})
        if(bookData){
            res.render('edit-book', {books:bookData})
        }
        else{
            res.redirect('admin/list-books')
        }
    } catch(error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}

const editBook = async(req,res)=>{
    try {
        const bookData = await Book.findByIdAndUpdate({_id:req.body.id},{$set:{
            title:req.body.name,
            about:req.body.about,
            price:req.body.price,
            stock:req.body.stock
        }})
        if(bookData){
            res.redirect('/admin/list-books')
        }
        else{
            res.render('edit-book', {message:'Unable to Edit Book'})
        }
    } catch(error) {
        console.log(error.message)
    }
}

const deactivateBook = async(req,res)=>{
    await statusHelper.updateModelStatus(req,res,Book,1,'/admin/list-books')
}

const reactivateBook = async(req,res)=>{
    await statusHelper.updateModelStatus(req,res,Book,0,'/admin/list-books')
}



const loadListBooksForUser = async(req, res)=>{
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }
        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: '.*' + search + '.*' } }
            ];
        }
        const page = req.query.page || 1;
        const perPage = req.query.perPage || 12;
        const startIndex = (page - 1) * perPage;

        // Sorting
        const sortField = req.query.sortField || 'title'; // Default sorting field
        const sortOrder = req.query.sortOrder || 1; // Default sorting order (1 for ascending, -1 for descending)
    
        // Create the sort object
        const sort = {};
        sort[sortField] = sortOrder;


        const genres = await Genre.find()
        const totalBooks = await Book.countDocuments({isDeleted:0})
        const allBooks = await Book.find(query);
        const displayPagination = allBooks.length > perPage;
        const books = await Book.find(query)
            .sort(sort)
            .skip(startIndex)
            .limit(perPage)
        res.render('list-books',{ 
            genres, 
            books, 
            currentPage:parseInt(page), 
            totalPages: Math.ceil(totalBooks/perPage),
            displayPagination
        }) 
    } catch(error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}


const loadViewBook = async (req, res) => {
    try {
        const id = req.query.id;
        const genres = await Genre.find();
        const authors = await Author.find();
        const bookData = await Book.findById({ _id: id }).populate('author').populate('genre');
        
        if (bookData) {
            res.render('view-book', { books: bookData, genres, authors });
        } else {
            res.status(404).render('404', { errorMessage: 'The book you are looking for does not exist.' });
        }
    } catch (error) {
        console.error(error.message);
        res.redirect('/error-page')
    }
};

module.exports = {
    loadListBooksForAdmin,
    loadAddBook,
    addBook,
    loadEditBook,
    editBook,
    deactivateBook,
    reactivateBook,
    loadListBooksForUser,
    loadViewBook

}