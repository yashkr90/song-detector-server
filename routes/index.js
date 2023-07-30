import express from 'express';
var router = express.Router();
import multer from "multer";
import axios from "axios";
import fs from "@cyclic.sh/s3fs";
import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';
import  request  from 'request';
import { promisify } from 'util';


const unlinkAsync = promisify(fs.unlink)


const API_KEY=process.env.API_KEY;

const __filename = fileURLToPath(import.meta.url);
console.log("__filename", __filename);
const __dirname = dirname(__filename);
console.log("_dirname", __dirname);



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    console.log(file.mimetype);
    cb(null, Date.now() + '.wav') //Appending .mp3
  }
})

var upload = multer({ storage: storage });
var type = upload.single('upl');


// const upload= multer();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.post("/uploads", upload.single('upl') , async (req,res)=>{

  console.log("inside uploads");
  
  console.log(req.body);
  console.log("file is below");

  console.log(req.file);//gives the blob file



  // const songname = __dirname + '/public/uploads/' + req.file.filename;

const songname = path.join(__dirname,'../','public','uploads',req.file.filename);
console.log("songname", songname);

console.log(typeof songname);



  // const options = {
  //   method: 'POST',
  //   url: 'https://shazam-core.p.rapidapi.com/v1/tracks/recognize',
  //   headers: {
  //     'content-type': 'multipart/form-data; boundary=---011000010111000001101001',
  //     'X-RapidAPI-Key': API_KEY,
  //     'X-RapidAPI-Host': 'shazam-core.p.rapidapi.com',
  //     useQueryString: true
  //   },
  //   formData: {
  //     file: {
  //       value: fs.createReadStream(songname),
  //       options: { filename: songname, contentType: 'audio/wav' }
  //     }
  //   }
  // };


  // const data = new FormData();
  // data.append('file', fs.createReadStream(songname));


  // const options = {
  //   method: 'POST',
  //   url: 'https://shazam-core7.p.rapidapi.com/songs/recognize-song',
  //   headers: {
  //     'X-RapidAPI-Key': 'bdba7736c9mshdcee368220f321bp19a210jsn47c5d4112f40',
  //     'X-RapidAPI-Host': 'shazam-core7.p.rapidapi.com',
  //     ...data.getHeaders(),
  //   },
  //   data: data
  // };
  
  // try {
  //   const response = await axios.request(options);
  //   console.log(response.data);
  // } catch (error) {
  //   console.error(error);
  // }

  const options = {
    method: 'POST',
    url: 'https://shazam-core7.p.rapidapi.com/songs/recognize-song',
    headers: {
      'content-type': 'multipart/form-data; boundary=---011000010111000001101001',
      'X-RapidAPI-Key': 'bdba7736c9mshdcee368220f321bp19a210jsn47c5d4112f40',
      'X-RapidAPI-Host': 'shazam-core7.p.rapidapi.com'
    },
    formData: {
      audio: {
        value: fs.createReadStream(songname),
        options: {
          filename: songname,
          contentType: 'application/octet-stream'
        }
      }
    }
  };
  
  //   try {
  //   const response = await axios.post('https://shazam-core7.p.rapidapi.com/songs/recognize-song', options);
  //   const res=await response.json();
  //   console.log(res);
  //   // console.log(response.data);
  // } catch (error) {
  //   console.error(error);
  // }
  request(options, function (error, response, body) {

    // console.log(body);
    if (error) {
      console.log("there is error" + error);
      unlinkAsync(req.file.path);
    }
    else {
      console.log(response.statusCode);
      if (response.statusCode === 200) {
        // console.log(body);
        res.json({
          status: 'pass',
          resbody: body,
          statuscode: response.statusCode
        });
        unlinkAsync(req.file.path);
      }
      else {
        console.log("failes to detect");
        res.json({
          status: 'failed',
          resbody: body,
          statuscode: response.statusCode
        });
        unlinkAsync(req.file.path);
      }
    }
  });
})

export default router;
