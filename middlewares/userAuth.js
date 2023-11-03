const { User } = require('../models/userModel')


const isLogin = async (req, res, next) => {
    try {
        if(req.session.user_id) {
            const user = await User.findById(req.session.user_id);
            if(user && user.is_blocked === 0) {
                next();
            } else {

                res.redirect('/?message=User is blocked.');
            }
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
};


const isLogout = async( req, res, next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/home')
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = { isLogin, isLogout }