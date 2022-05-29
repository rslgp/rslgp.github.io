import React, { Component } from 'react';

const { GoogleSpreadsheet } = require('google-spreadsheet');

// Google Sheets Document ID -- PROD
const doc = new GoogleSpreadsheet(process.env.REACT_APP_GOOGLESHEETID);
function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      console.log(reader.result);
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
 }
class Images extends Component {

    constructor(props) {
        super(props);
        this.state = {
          images: [], 
        };  
      }
    componentDidMount() {
        
        (async function main(self) {
        try{
            await doc.useServiceAccountAuth({
            client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
            });
        
            await doc.loadInfo(); 
        
            const sheet = doc.sheetsByIndex[0];
            
            let rows = await sheet.getRows();
            self.setState({ images: rows });
        }catch(e){
            
        }
        
        })(this);

    }

    render(){
        return (
        <div>
        {this.state.images.map( (row,k) => 
                        {
                            return <div key={k} >
                                <img src={row.Base64}></img>
                                </div>;
                        }
                    )}
            
        </div>
        )

    }

}

export default Images; 