import React, { Component } from 'react';

const { GoogleSpreadsheet } = require('google-spreadsheet');

// Google Sheets Document ID -- PROD
const doc = new GoogleSpreadsheet(process.env.REACT_APP_GOOGLESHEETID);
function fileImgToBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      addImage(reader.result);
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
 }

 function addImage(base64img){
   (async function main(item) {
      try{
          await doc.useServiceAccountAuth({
          client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
          });
      
          await doc.loadInfo(); // Loads document properties and worksheets
      
          const sheet = doc.sheetsByIndex[0];
          if(item.length > 50000){
            alert("Image file size limit exceed");
            return;
          }
          let row = {Base64:item};
          await sheet.addRow(row);
      }catch(e){
        console.log(e);
          
      }  
  })(base64img);

}

function imageToDataUri(img, width, height) {

  // create an off-screen canvas
  var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

  // set its dimension to target size
  canvas.width = width;
  canvas.height = height;

  // draw source image into the off-screen canvas:
  ctx.drawImage(img, 0, 0, width, height);

  // encode image to data-uri with base64 version of compressed image
  return canvas.toDataURL();
}

class UploadImage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            image:'',
        };
    
        // this.handleChange = this.handleChange.bind(this);
        this.onImageChange = this.onImageChange.bind(this);
  
  
      } 

    onImageChange = event => {
        if (event.target.files && event.target.files[0]) {
          let blobImg = event.target.files[0];
          //console.log(URL.createObjectURL(img));
          //saveBase64(blobImg);
          createImageBitmap(blobImg).then(imageBitmap => {
            
            let smallImage = imageToDataUri(imageBitmap,400,400);
            let reducePx=1, reduceFactor=64;
            do{
              smallImage = imageToDataUri(imageBitmap,400-(reducePx*reduceFactor),400-(reducePx*reduceFactor));
              reducePx++;
              if(smallImage.length-50000 < 10000) reduceFactor=8;
              if(smallImage.length/2 < 50000) reduceFactor=2;
              console.log(reducePx+" "+smallImage.length);
            }while(smallImage.length > 50000);

            console.log(smallImage.length);
            addImage(smallImage);
            this.setState({
              image: smallImage
            });
          });
          // this.setState({
          //   image: URL.createObjectURL(blobImg)
          // });
        }
      };

    render(){
        return (
        <div>
            <img src={this.state.image} />
            <h1>Select Image</h1>
            <input type="file" name="myImage" accept=".jpg,.JPG,.jpeg,.JPEG,.png,.PNG,.gif,.GIF,.bmp,.BMP,.svg,.SVG,.webp,.WEBP" onChange={this.onImageChange} />          
        </div>
        )

    }

}

export default UploadImage; 