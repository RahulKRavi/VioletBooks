const { User, Address } = require('../models/userModel')
const bcrypt = require('bcryptjs')
const passwordHelper = require('../helpers/passwordHelper')

//Function to load the my-account view page with the account details
const loadMyAccount = async (req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id})
        res.render('my-account', {user:userData})  
    } catch (error) {
        console.log(error.nessage)
        res.redirect('/error-page')
    }
}

//Function to edit account details
const editMyAccount = async(req,res)=>{
    try {
        const userData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{
            fname:req.body.fname,
            lname:req.body.lname
        }})
        if (userData) {
            res.redirect('my-account')
        } else {
            res.render('my-account', {message:'Something Wrong'})
        }
    } catch(error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}

//Function to load the my-address view page with the address details
const loadMyAddress = async (req,res)=>{
    try {
        const addressData = await Address.find({user:req.session.user_id, isDeleted:0})
        res.render('my-address', {address:addressData})    
    } catch (error) {
        console.log(error.nessage)
        res.redirect('/error-page')
    }
}

//Function to delete an address from user profile
const deleteAddress = async( req, res)=>{
    try {
        const objectId = req.query.id
        await Address.findByIdAndUpdate({_id:objectId},{$set:{isDeleted:1}})
        res.redirect('my-address')
    } catch {
        console.log(error.message)
        res.redirect('/error-page')
    }
}


//Function to load the edit page for address
const loadEditAddress = async( req, res)=> {
    try {
        const addressId = req.query.id;
        const addressData = await Address.findById(addressId)
        res.render('edit-address', {address:addressData})
    } catch (error) {
        console.log(error)
        res.redirect('/error-page')
    }
}

//Function to edit and address
const editAddress = async(req, res)=> {
    try {
        const addressData = await Address.findOneAndUpdate({_id:req.body.id},{$set:{
            title:req.body.title,
            fname:req.body.fname,
            lname:req.body.lname,
            house:req.body.house,
            street:req.body.street,
            city:req.body.city,
            pin:req.body.pin,
            district:req.body.district,
            phone:req.body.phone
        }})
        if(addressData){
            res.redirect('my-address')
        } else {
            res.render('edit-address', {message:'Something Wrong'})
        }
    } catch (error){
        console.log(error)
        res.redirect('/error-page')
    }
}

//Function to load the add-address view page to add another address
const loadAddAddress = async (req,res)=>{
    try {
        res.render('add-address', {user_id:req.session.user_id})  
    } catch (error) {
        console.log(error.nessage)
        res.redirect('/error-page')
    }
}

//Function to add a new address to the profile
const addAddress = async (req, res) => {
    try {
        const id = req.body.id;
        const userData = await User.findOne({_id:id});       
        if (!userData) {
            return res.status(404).send('User not found');
        }
        const newAddress = new Address({
                user:userData,
                title:req.body.title,
                fname:req.body.fname,
                lname:req.body.lname,
                house:req.body.house,
                street:req.body.street,
                city:req.body.city,
                pin:req.body.pin,
                district:req.body.district,
                phone:req.body.phone
            });
        await newAddress.save();
        const addressData = await Address.find({user:req.session.user_id})
        if (addressData) {
            res.render('my-address', {address:addressData})
        } else {
            res.render('add-address', {message:'Unable to add new address'})
        }

    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page')
    }
};

//Function to choose the the address while checking out
const loadChooseAddress = async (req,res)=>{
    try { 
        const addressData = await Address.find({user:req.session.user_id, isDeleted:0})
        res.render('choose-address', {address:addressData})    
    } catch (error) {
        console.log(error.nessage)
        res.redirect('/error-page')
    }
}

//Function to load the change password view page 
const loadChangePassword = async (req,res)=>{   
    try {
        res.render('change-password')  
    } catch (error) {
        console.log(error.nessage)
        res.redirect('/error-page')
    }
}

//Function to load the change the passoword to a new one
const changePassword = async (req,res)=>{
    try {
        const userId = req.session.user_id; 
        const current = req.body.current
        const userData = await User.findById(userId)
        const passwordMatch = await bcrypt.compare(current, userData.password)
        if(passwordMatch){
            const password = req.body.password
            const confirm = req.body.confirm
            if( password !== confirm ){
                return res.render('change-password', {message: "Passwords not matching"})
            } else {
                const key =  await passwordHelper.securePassword(req.body.password)
                await User.findByIdAndUpdate({_id:userId},{$set:{password:key}})
                return res.render('change-password', {message: "Passwords Changed Succesfully"})
            }
        } else {
            return res.render('change-password', {message: "The password entered is wrong"})
        }
    } catch (error) {
        console.log(error.nessage)
        res.redirect('/error-page')
    }
}


module.exports = {
    loadChooseAddress,
    loadMyAccount,
    editMyAccount,
    loadMyAddress,
    deleteAddress,
    loadEditAddress,
    editAddress,
    loadAddAddress,
    addAddress,
    loadChangePassword,
    changePassword,
}