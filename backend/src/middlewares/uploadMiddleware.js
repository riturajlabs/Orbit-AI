import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';


const storage = new CloudinaryStorage({

  cloudinary,

  params: {

    folder: 'orbit-ai/profiles',

    allowed_formats: [
      'jpg',
      'jpeg',
      'png',
      'webp',
    ],

    transformation: [
      {
        width: 500,
        height: 500,
        crop: 'limit',
      },
    ],

  },

});


const fileFilter = (req, file, cb)=>{

  if(file.mimetype.startsWith('image/')){

    cb(null,true);

  }
  else{

    cb(
      new Error('Only images are allowed'),
      false,
    );

  }

};


const upload = multer({

  storage,

  fileFilter,

  limits:{
    fileSize:5 * 1024 * 1024,
  },

});


console.log('Cloudinary upload middleware loaded');


export default upload;