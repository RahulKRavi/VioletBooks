const Banner = require('../models/bannerModel'); 
const statusHelper = require('../helpers/statusHelper')

const loadListBannersForAdmin = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }
        let query = {};
        if (search) {
            query.$or = [
                { text: { $regex: '.*' + search + '.*' } },
            ];
        }
        const bannerData = await Banner.find(query);
        res.render('list-banners', { banners: bannerData });
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/error-page')
    }
};

const loadAddBanner = async (req,res)=>{
    try {
        res.render('add-banner')  
    } catch (error) {
        console.log(error.nessage)
        res.redirect('/admin/error-page')
    }
}

const addBanner = async(req,res)=>{
    try {
        const newBanner = new Banner({  
            text: req.body.text,
            url: req.body.url,
            image: req.file.filename
        })

        const bannerData = await newBanner.save()
        if(bannerData){
            res.redirect('/admin/list-banners')
        }
        else{
            res.render('add-banner', {message:'Unable to add New Banner'})
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/admin/error-page')
    }
}

const loadEditBanner = async (req,res)=>{
    try{
        const id = req.query.id;
        const bannerData = await Banner.findById({_id:id})
        if(bannerData){
            res.render('edit-banner', {banners:bannerData})
        }
        else{
            res.redirect('admin/list-banners')
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/admin/error-page')
    }
}

const editBanner = async (req,res)=>{
    try{
        const bannerData = await Banner.findByIdAndUpdate({_id:req.body.id},{$set:{
            text: req.body.text,
            url: req.body.url
        }})
        if(bannerData){
            res.redirect('/admin/list-banners')
        }
        else{
            res.render('edit-banner', {message:'Unable to Edit Banner'})
        }
    } catch(error) {
        console.log(error.message)
        res.redirect('/admin/error-page')
    }
}


const deactivateBanner = async(req,res)=>{
    await statusHelper.updateModelStatus(req,res,Banner,1,'/admin/list-banners')
}

const reactivateBanner = async(req,res)=>{
    await statusHelper.updateModelStatus(req,res,Banner,0,'/admin/list-banners')
}

module.exports = {
    loadListBannersForAdmin,
    loadAddBanner,
    addBanner,
    loadEditBanner,
    editBanner,
    deactivateBanner,
    reactivateBanner
}