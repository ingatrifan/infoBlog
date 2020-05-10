const httpStatusCodes = require("http-status-codes");
const cloudinary = require('cloudinary');

exports.getUser = async(req,res) =>{
    try {
        let user = await req.db.User.findById(req.params.id)
        if (!user){
            req.flash('error',"This user can't be found")
            return res.status(httpStatusCodes.NOT_FOUND).redirect('back');
        } 
        let blogs = await req.db.Blog.find().where('author.id').equals(user._id).exec();
        return res.status(httpStatusCodes.OK).render('users/show',{user,blogs});

    } catch (error) {
        req.flash('error','Something went wrong...');
        console.log(error);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('back');
    }
}
exports.getEditUser = async(req,res) =>{
    try {
        let user = await req.db.User.findById(req.params.id)
        if (!user){
            req.flash('error',"This user can't be found")
            return res.status(httpStatusCodes.NOT_FOUND).redirect('back');
        } 
        return res.status(httpStatusCodes.OK).render('users/edit',{user});
    } catch (error) {
        req.flash('error','Something went wrong...');
        console.log(error);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('back');
    }
}

exports.putEditUser = async(req,res) =>{
    try {
        let user = await req.db.User.findById(req.params.id)
        if (!user){
            req.flash('error',"This user can't be found")
            return res.status(httpStatusCodes.NOT_FOUND).redirect('back');
        } 
        if (req.file){
            try{
                await cloudinary.v2.uploader.destroy(user.avatarId)
                var result =await cloudinary.v2.uploader.upload(req.file.path);
                user.avatar = result.secure_url;
                user.avatarId = result.public_id;
            }catch(err){
                req.flash("error","Something went wrong,please try again");
                console.log(error);
                return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('back');
            }
        }
        user.name =req.body.name
        user.lname= req.body.lname
        user.email= req.body.email
        user.instagram=req.body.instagram;
        user.facebook=req.body.facebook;
        user.tumblr=req.body.tumblr;
        user.description=req.body.description;
        user.save();
        req.flash("success","Successfully updated");
        return res.status(httpStatusCodes.OK).redirect("/users/"+req.params.id)
    } catch (error) {
        req.flash('error','Something went wrong...');
        console.log(error);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('back');
    }
}