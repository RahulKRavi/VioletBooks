const updateModelStatus = async(req,res,Model,statusValue,redirectPath)=>{
    try{
        const objectId = req.query.id
        await Model.findByIdAndUpdate({_id:objectId},{$set:{isDeleted:statusValue}})
        res.redirect(redirectPath)
    }
    catch{
        console.log(error.message)
    }
}

module.exports = { updateModelStatus }