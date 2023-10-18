import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import "./form.css";
import axios from 'axios';
import {FormModel} from '../models/formModel';
import MapComponent from '../map/map'
import ReactModal from 'react-modal';
// import {validateAddress, AddressValidationProps} from '../validation/validation';
// import {haversineDistance} from '../geocoding/geocoding'
// require('dotenv').config();

export default function Form() {
  // const levenshtein = require('fast-levenshtein');
  // TODO: Replace with frontend URL
  // const rootUrl = "http://localhost:8000"
  // const rootUrl = "https://b9e7-74-101-57-2.ngrok-free.app"
  const rootUrl = "https://r3jisf3gkibaicbcdr6y5kerka0mnbny.lambda-url.us-east-1.on.aws" // replace with deployed URL in production
  // const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  // TODO: Default value is 0
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [requirePO, setRequirePO] = useState(false);
  const [modal, setModal] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');

  const [possibleSites, setPossibleSites] = useState([]);
  const [possibleSiteEquipments, setPossibleSiteEquipments] = useState<{ [key: string]: any }[]>([]);
  const [lat, setLat] = useState(40.728331390509545);
  const [lng, setLng] = useState(-73.69377750670284);
  // const [addressIsValid, setAddressIsValid] = useState(false);
  const { register, handleSubmit, formState: { errors }, trigger, reset, watch, setValue } = useForm<FormModel>();

  const street1 = watch('Street_1');
  const city = watch('City');
  const state = watch('State');
  const zip = watch('Zip');
  

  async function getLatLng() {
    if (street1 !== "" && city !== "" && state !== "" && zip !== "") {
      await axios.post(`${rootUrl}/api/v1/latlng`, {
        "city": city,
        "state": state,
        "zip": zip,
        "addressLine": [street1]
      })
        .then(response => {
          // console.log(response.data[0])
          setLat(response.data[0])
          setLng(response.data[1])
        })
        .catch(error => {
          console.log("Error rendering your location", error)
        })
    }
  }

  // useEffect(() => {
  //   async function getLatLng() {
  //     if (street1 !== "" && city !== "" && state !== "" && zip !== "") {
  //       await axios.post(`${rootUrl}/api/v1/latlng`, {
  //         "city": city,
  //         "state": state,
  //         "zip": zip,
  //         "addressLine": [street1]
  //       })
  //         .then(response => {
  //           // console.log(response.data[0])
  //           setLat(response.data[0])
  //           setLng(response.data[1])
  //         })
  //         .catch(error => {
  //           console.log("Error rendering your location", error)
  //         })
  //     }
  //   }
  //   getLatLng()
  // }, [street1, city, state, zip])
  
  const onSubmit = async (data: FormModel) => {
    // useEffect(() => {<MapComponent latitude={lat} longitude={lng} />}, [watch('Street_1'), watch('City'), watch('State'), watch('Zip')])
    
    // Validate
    
    const isValid = await trigger(); // trigger validation
    if (isValid) {
      setLoading(true)
      console.log("Form data:")
      console.log(data)

      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "Images" && value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      if (data.Images) {
        for (let i = 0; i < data.Images.length; i++) {
          formData.append("Images", data.Images[i]);
        }
      }
      
      await axios.post(`${rootUrl}/api/v1/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          console.log("Response data:")
          console.log(response.data)
          console.log(response.data['Submission Msg'])
        })
        .catch(error => {
          console.log("There was an error!", error);
        })

      // TODO: uncomment these two lines for production
      setSubmitted(true);
      reset();

      // setAddressIsValid(false);
      // setLat(undefined);
      // setLng(undefined);
      setLoading(false)
    }
  };

  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  const handleEquipmentClick = (equipment: {[key: string]: any}) => {
    setSelectedEquipment(equipment['clntsteeqpmnt_rn']);
    setValue("Equipment_ID", equipment['clntsteeqpmnt_id']);
    setValue("Equipment_RN", equipment['clntsteeqpmnt_rn']);
    setValue("Equipment_Name", equipment['clntsteeqpmnt_nme']);
    setValue("Site_ID", equipment['clntste_id']);
    setValue("Site_RN", equipment['clntste_rn']);
  };

  const addressValidation = async () => {
    // setLoading(true)
    const isValid = await trigger(); // trigger validation\

    // validate address
    const street1 = watch('Street_1')
    // const street2 = watch('Street_2') ?? ""
    // const street3 = watch('Street_3') ?? ""
    // const street4 = watch('Street_4') ?? ""
    const city = watch('City')
    const state = watch('State')
    const zip = watch('Zip')
    
    if (isValid) {
      try {
        setLoading(true)
        const validationMsg = await axios.post(`${rootUrl}/api/v1/validateAddress`, {
          "city": city,
          "state": state,
          "zip": zip,
          "addressLine": [street1]
          // "addressLine": [street1, street2]
        })
        // var coords = null
        setLoading(false)
      
        if (validationMsg.status === 200) {
          console.log("Address Validation API is OK");
          if (validationMsg.data && validationMsg.data.result && validationMsg.data.result.verdict && validationMsg.data.result.verdict.addressComplete) {
            const addressArray = validationMsg.data.result.address.addressComponents; // Assuming your formatted address is comma-separated
            
            setValue("Street_1", addressArray[0].componentName.text + " " + addressArray[1].componentName.text)
            // if (addressArray.length > 7) {
            //   setValue("Street_2", addressArray[2].componentName.text)
            //   setValue("City", addressArray[3].componentName.text)
            //   setValue("State", addressArray[4].componentName.text)
            //   setValue("Zip", addressArray[5].componentName.text)
            // } else { // == 7
            //   setValue("City", addressArray[2].componentName.text)
            //   setValue("State", addressArray[3].componentName.text)
            //   setValue("Zip", addressArray[4].componentName.text)
            // }
            // setValue("Street_2", addressArray[addressArray.length - 6].componentName.text)
            setValue("City", addressArray[addressArray.length - 5].componentName.text)
            setValue("State", addressArray[addressArray.length - 4].componentName.text)
            setValue("Zip", addressArray[addressArray.length - 3].componentName.text)

            console.log("addressComplete attribute is present.")
            
            
            alert("Address is complete and validated, here's your formatted address:" +
            `\n\n${validationMsg.data.result.address.formattedAddress}\n\n` +
            "If you think this is incorrect, please go back to change your address."
            // + `\nYour coordinate is: ${}`
            )
            // setStep((prevStep) => prevStep + 1);
            // window.scrollTo(0, 0);
          } else {
            // setLoading(false)
            console.log(validationMsg.data.result)
            console.log("addressComplete attribute is NOT present.")

            const addressArray = validationMsg.data.result.address.addressComponents;
            // setValue("Street_1", addressArray[0].componentName.text + " " + addressArray[1].componentName.text)
            // if (addressArray.length > 7) {
            //   setValue("Street_2", addressArray[2].componentName.text)
            //   setValue("City", addressArray[3].componentName.text)
            //   setValue("State", addressArray[4].componentName.text)
            //   setValue("Zip", addressArray[5].componentName.text)
            // } else { // == 7
            //   setValue("City", addressArray[2].componentName.text)
            //   setValue("State", addressArray[3].componentName.text)
            //   setValue("Zip", addressArray[4].componentName.text)
            // }
            setValue("Street_1", addressArray[0].componentName.text + " " + addressArray[1].componentName.text)
            setValue("City", addressArray[addressArray.length - 5].componentName.text)
            setValue("State", addressArray[addressArray.length - 4].componentName.text)
            setValue("Zip", addressArray[addressArray.length - 3].componentName.text)

            alert("The address is NOT complete, but it may still be valid. Here's your formatted address" +
            `\n\n${validationMsg.data.result.address.formattedAddress}\n\n` + 
            "If you believe this is the correct address, please dismiss this message and proceed. Otherwise, go back and change your address.")
          }
          setStep((prevStep) => prevStep + 1);
          window.scrollTo(0, 0);
        } else {
          // setLoading(false)
          console.log("Address Validation API is NOT OK");
          alert("Error. Address validation API call failed with error code 4xx")
        }
        // if (addressIsValid) {
        //   setStep((prevStep) => prevStep + 1);
        //   window.scrollTo(0, 0);
        // } else {
        //   alert("Address is not valid, double check your input")
        // }
      } catch (error) {
        // setLoading(false)
        alert(`Error. Address validation API call failed with error ${error}`)
      }
    }
  };

  const nextPage = async () => {
    // setLoading(true)
    const isValid = await trigger(); // trigger validation
    // setLoading(false)
    if (isValid) {
      setStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
    }
    // setLoading(false)
  };

  const back = async () => {
    setStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  const home = async () => {
    setStep(0);
  };

  const newRequest = async () => {
    setStep(0);
    setSubmitted(false)
    setRequirePO(false)
    // setSelectedFiles(null)
  };

  const getSiteInfo = async () => {
    const isValid = await trigger();
    if (isValid) {
      setLoading(true)
      setModal(true)
      setStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
      var rawEmails = watch('Business_Emails').split(",")
      var emails = rawEmails.map(email => email.trim().toLowerCase())

      var rawPhones = watch('Business_Phone_Numbers').split(",")
      var phones = rawPhones.map(phone => phone.trim().toLowerCase())

      await axios.post(`${rootUrl}/api/v1/getSiteInfo/`, {
        "businessName": watch('Business_Name'),
        "street1": watch('Street_1'),
        "city": watch('City'),
        "state": watch('State'),
        "zip": watch('Zip'),
        "email": watch('Email_Address'),
        "phone": watch('Phone_Number'),
        "emails": emails,
        "phoneNumbers": phones
      })
        .then(async response => {
          // setLoading(false)
          console.log("Site Info")
          console.log(response.data)
          // if (response.data.length === 1) {
          //   // only one match
          //   // best scenario
          //   // display info
          //   setPossibleSites(response.data)
          //   setLoading(false)
          // } else {
          //   //setStep((prevStep) => prevStep + 1);
          //   setLoading(false)
          // }
          setPossibleSites(response.data)
          // console.log(possibleSites.length)

          if (response.data.length === 0) {
            await axios.get(`${rootUrl}/api/v1/clientAddressPlaceholder/`)
              .then(clientSites => {
                var siteEquipments: { [key: string]: any }[] = [];
                for (var j = 0; j < clientSites.data.length; j++) {
                  siteEquipments = siteEquipments.concat(clientSites.data[j])
                }
                console.log("Site Equipment Info")
                setPossibleSiteEquipments(siteEquipments)
                console.log(siteEquipments)
                setLoading(false)
              })
              .catch(error => {
                console.log("There was an error!", error);
                setLoading(false)
              })
          } else {
            await axios.get(`${rootUrl}/api/v1/clientAddressByZip/${watch('Zip').trim().toLowerCase()}`)
              .then(clientSites => {
                var siteEquipments: { [key: string]: any }[] = [];
                for (var i = 0; i < response.data.length; i++) {
                  for (var j = 0; j < clientSites.data.length; j++) {
                    if (response.data[i]['clntste_rn'] === clientSites.data[j]['clntste_rn'] && (response.data[i]['clntste_rn'] !== "350161652" || response.data[i]['clntste_rn'] !== 350161652)) {
                      // console.log(response.data[i]['clntste_rn'])
                      siteEquipments = siteEquipments.concat(clientSites.data[j])
                      // setPossibleSiteEquipments(possibleSiteEquipments.concat(clientSites.data[j]))
                    }
                  }
                }
                console.log("Site Equipment Info")
                setPossibleSiteEquipments(siteEquipments)
                console.log(siteEquipments)
                setLoading(false)
              })
              .catch(error => {
                console.log("There was an error!", error);
                setLoading(false)
              })
          }
        })
      .catch(error => {
        console.log("There was an error!", error);
        setLoading(false)
      })
    }
    // setLoading(true)
    
    // await axios.post(`${rootUrl}/api/v1/getSiteInfo/`, {
    //   "businessName": watch('Business_Name'),
    //   "street1": watch('Street_1'),
    //   "city": watch('City'),
    //   "state": watch('State'),
    //   "zip": watch('Zip'),
    //   "email": watch('Email_Address'),
    //   "phone": watch('Phone_Number'),
    // })
    //   .then(response => {
    //     // setLoading(false)
    //     console.log("Site Info")
    //     console.log(response.data)
    //     // if (response.data.length === 1) {
    //     //   // only one match
    //     //   // best scenario
    //     //   // display info
    //     //   setPossibleSites(response.data)
    //     //   setLoading(false)
    //     // } else {
    //     //   //setStep((prevStep) => prevStep + 1);
    //     //   setLoading(false)
    //     // }
    //     setPossibleSites(response.data)
    //     setLoading(false)
    //   })
    //   .catch(error => {
    //     console.log("There was an error!", error);
    //     setLoading(false)
    //   })

  };

  const isResidential = async () => {
    setStep(-1);
  };

  const appDownload = async () => {
    setStep(-2);
  };

  // interface ImageUploaderProps {
  //   onChange: (files: FileList | null) => void;
  //   value?: FileList | null;
  // }

  // const ImageUploader: React.FC<ImageUploaderProps> = ({ onChange, value }) => {
  //   return (
  //     <div className="file-upload">
  //       <p className="file-upload-info">Select images from your device, up to 5 images</p>
  //       <p className="file-upload-info">Currently selected:  <span>{selectedFiles?.length === undefined ? 0 : selectedFiles?.length}</span></p>
        
  //       {value && Array.from(value).map((file, index) => (
  //         <img 
  //           key={index} 
  //           src={URL.createObjectURL(file)} 
  //           alt={`Preview ${index}`}
  //           className='file-upload-preview' 
  //         />
  //       ))}
        
  //       <input
  //         id="file-upload"
  //         type="file"
  //         accept="image/*"
  //         multiple
  //         onChange={(e) => {
  //           const files = e.target.files;
  //           if (files && files.length > 5) {
  //             alert('You can select a maximum of 5 images only.');
  //             return; 
  //           }
  //           onChange(files);
  //           setSelectedFiles(files);
  //         }}
  //         className="file-upload-input"
  //       />
  //       <label htmlFor="file-upload" className="file-upload-label">
  //         <i className="fa-solid fa-upload fa-2xl" style={{"color": "#ffffff"}}></i>
  //       </label>
  //     </div>
  //   );
  // };

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      <ReactModal
        className="site-matching-modal"
        isOpen={modal}
      >
        <div className='site-matching-modal-content'>
          <div style={{"display" : "flex", "alignItems" : "center", "gap": "10px"}}><i className="fa-solid fa-circle-info fa-xl" style={{"color": "#000000"}}></i><h2>Please read</h2></div>
          <p>
            We are matching your information to records in our database. Please read the following instructions for the next step.
          </p>
          <div className="site-matching-modal-content-section">
            <div className="site-matching-modal-content-section-box">
              <h4 className="site-matching-modal-content-section-box-title">New customers</h4>
              <p>You should <b>not</b> see any match listed. Please click <span className="confirm-button">Confirm Site</span> and we will reach out to confirm your request later.</p>
            </div>
            
            <div className="site-matching-modal-content-section-box">
              <h4 className="site-matching-modal-content-section-box-title">Returning customers</h4>
              <p>If you see your site <b>listed among the matches</b>, please click <span className="confirm-button">Confirm Site</span> to proceed. Otherwise, please click <span className="back-button">Go back</span> and correct your information.</p>
            </div>
          </div>
          <button className="modal-button" onClick={() => {setModal(false)}}><i className="fa-solid fa-circle-check" style={{"color": "#ffffff"}}></i> Understood</button>
        </div>
      </ReactModal>
      {/* Loading animation */}
      {loading === true && 
        <div style={{"fontFamily": "'Poppins', sans-serif;"}}>
          <i className="spinner fa-solid fa-spinner fa-spin-pulse fa-2xl" style={{"color": "#0056b3", "marginTop": "100px"}}></i>
          <p>Getting information to you as fast as possible. Please wait a moment...</p>
        </div>
      }
      {/* <button type="button" onClick={test}>Test</button> */}
      {loading === false &&
        <div className="form-content">
          
          { submitted ? <div className='form-section'>
            <h3 className='subTitle'>Thank you, your request has been recorded</h3>
            <p>Our agents will reach out soon.</p>
            <div className="nav-buttons">
              <button className='form-button backToHome' type="button" onClick={newRequest}>Home</button>
            </div>
          </div>
          : <>
        {step === -1 && (
          <div className='form-section'>
            <h3 className='subTitle'>We are sorry we could not assist you. We only provide service to commercial locations. If you are a commercial customer, click the button to go back.</h3>
            <div className="nav-buttons">
              <button className='form-button back' type="button" onClick={home}>Back</button>
            </div>
          </div>
        )}

        {step === -2 && (
          <div className='form-section'>
            <h3 className='subTitle'>Please download DNAS Connect to proceed, this web form is for non-contract customers only.</h3>
            <img className='dnas-app-logo' src={process.env.PUBLIC_URL + '/img/dnas-connect-logo.png'} alt='DNAS Connect app icon'/>
            <p>"DNAS Connect" is available for download for both iOS and Android devices</p>
            <div className='qr-codes'>
              <div className='qr-code-container'>
                <img className='qr-code' src={process.env.PUBLIC_URL + '/img/dnas-connect-apple.png'} alt='app store qr code'/>
                <p><i className="fa-brands fa-app-store-ios"></i>   App Store</p>
                <a className='app-store-button' href='https://apps.apple.com/us/app/dnas-lite/id1531944898' target='_blank' rel='noopener noreferrer'>
                <i className="fa-brands fa-apple"></i>   Get it on App Store
                </a>
              </div>
              
              <div className='qr-code-container'>
                <img className='qr-code' src={process.env.PUBLIC_URL + '/img/dnas-connect-google.png'} alt='play store qr code'/>
                <p><i className="fa-brands fa-google-play"></i>   Google Play</p>
                <a className='app-store-button' href='https://play.google.com/store/apps/details?id=com.dayniteit.dnaslite&pcampaignid=web_share' target='_blank' rel='noopener noreferrer'>
                <i className="fa-brands fa-google-play"></i>   Get it on Google Play
                </a>
              </div>
            </div>
            <div className="nav-buttons">
              <button className='form-button back' type="button" onClick={home}>Back</button>
            </div>
          </div>
        )}

        {step === 0 && (
          <div className='form-section'>
            {/* <img src={process.env.PUBLIC_URL + '/img/dnas-logo.png'} alt='DNAS Logo' /> */}
            <h1 className='title'>Welcome to DNAS Non-Contract Customer Service Request Form</h1>
            <h3 className='subTitle'>Day & Nite / All Service / Popular Plumbing</h3>
            <h4 className='subTitle'>Visit our website to learn more about us <a href="https://www.wearetheone.com">www.wearetheone.com</a></h4>
            <p>Are you requesting service for a residential or commercial location?</p>
            <div className="nav-buttons">
              <button className='form-button commercial' type="button" onClick={nextPage}>Commercial</button>
              <button className='form-button residential' type="button" onClick={isResidential}>Residential</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className='form-section'>
            <h3 className='subTitle'>Do you have a DNAS Connect Account?</h3>
            
            <div className="nav-buttons">
              <button className='form-button yes' type="button" onClick={appDownload}>Yes</button>
              <button className='form-button No' type="button" onClick={nextPage}>No</button>
            </div>
          </div>
        )}  

        {step === 2 && (
          <div className='form-section'>
            <h1 className='title'>Site Info</h1>
            <p>Business Name <span className='required'>*</span></p>
            <input className="input text" type="text" placeholder="Business Name" {...register("Business_Name", { required: true })} />
            {errors['Business_Name'] && errors['Business_Name'].type === 'required' && <p style={{ color: 'red' }}>Business Name is required.</p>}

            <p>Street 1 <span className='required'>*</span></p>
            <input className="input text" type="text" placeholder="Street 1" {...register("Street_1", { required: true })} />
            {errors['Street_1'] && errors['Street_1'].type === 'required' && <p style={{ color: 'red' }}>Street 1 is required.</p>}

            <p>Street 2</p>
            <input className="input text" type="text" placeholder="Street 2" {...register("Street_2")} />

            <p>Street 3</p>
            <input className="input text" type="text" placeholder="Street 3" {...register("Street_3")} />

            <p>Street 4</p>
            <input className="input text" type="text" placeholder="Street 4" {...register("Street_4")} />

            <p>City <span className='required'>*</span></p>
            <input className="input text" type="text" placeholder="City" {...register("City", { required: true })} />
            {errors['City'] && errors['City'].type === 'required' && <p style={{ color: 'red' }}>City is required.</p>}

            <p>State <span className='required'>*</span></p>
            <input className="input text" type="text" placeholder="State" {...register("State", { 
              required: "State is required.",
              pattern: {
                value: /^[A-Z]{2}$/,
                message: "State must be 2 captialized letters."
              }  
            })} />
            {errors['State'] && <p style={{ color: 'red' }}>{errors['State'].message}</p>}
            {/* {errors['State'] && errors['State'].type === 'pattern' && <p style={{ color: 'red' }}>{errors['State'].message}</p>} */}

            <p>Zip Code <span className='required'>*</span></p>
            <input className="input number" type="text" placeholder="Zip Code" {...register("Zip", { 
              required: "Zip Code is required.",
              pattern: {
                value: /^\d{5}$/,
                message: "Zip Code must be a 5-digit number."
              }
            })} />
            {errors['Zip'] && <p style={{ color: 'red' }}>{errors['Zip'].message}</p>}
            {/* {errors['Zip'] && errors['Zip'].type === 'pattern' && <p style={{ color: 'red' }}>{errors['Zip'].message}</p>} */}
            {/* {errors['Zip'] && errors['Zip'].type === 'required' && <p style={{ color: 'red' }}>Zip is required.</p>} */}

            {/* {await axios.post(`${rootUrl}/api/v1/latlng`, {
                "city": watch('City'),
                "state": watch('State'),
                "zip": watch('Zip'),
                "addressLine": [watch('Street_1')]
              })
            } */}
            <p>Address Preview</p>
            <MapComponent latitude={lat} longitude={lng} />
            <div className="nav-buttons">
              <button className='form-button viewAddress' type="button" onClick={getLatLng}>View your address in map</button>
            </div>
            
            <div className="nav-buttons">
              <button className='form-button back' type="button" onClick={back}>Back</button>
              <button className='form-button next' type="button" onClick={addressValidation}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className='form-section'>
            <h1 className='title'>Contact Info</h1>
            <p>First Name <span className='required'>*</span></p>
            <input className="input text" type="text" placeholder="First Name" {...register("First_Name", {required: true})} />
            {errors['First_Name'] && errors['First_Name'].type === 'required' && <p style={{ color: 'red' }}>First Name is required.</p>}

            <p>Last Name</p>
            <input className="input text" type="text" placeholder="Last Name" {...register("Last_Name", {})} />

            <p>Email Address <span className='required'>*</span></p>
            <input className="input text" type="text" placeholder="Email Address" {...register("Email_Address", {required: true})} />
            {errors['Email_Address'] && errors['Email_Address'].type === 'required' && <p style={{ color: 'red' }}>Email Address is required.</p>}

            <p>Phone Number <span className='required'>*</span></p>
            <input className="input number" type="tel" placeholder="Phone Number" {...register("Phone_Number", {required: true})}/>
            {errors['Phone_Number'] && errors['Phone_Number'].type === 'required' && <p style={{ color: 'red' }}>Phone Number is required.</p>}

            <p>Phone Number Ext.</p>
            <input className="input number" type="tel" placeholder="Ext" {...register("Phone_Number_Ext", {})} />

            <p>Alternative Phone Number</p>
            <input className="input number" type="tel" placeholder="Alternative Phone Number" {...register("Alternative_Phone_Number", {})} />

            <p>Alternative Phone Number Ext.</p>
            <input className="input number" type="tel" placeholder="Ext" {...register("Alternative_Phone_Number_Ext", {})} />
            
            <h3 className="subTitle">Business Contact Info</h3>
            <h4>These are used by the aglorithm to match your info to our database records. Please provide the best response for the best result.</h4>
            <p>Business Email Addresses (Please provide a list of email address(es) under your company's email domain) <span className='required'>*</span></p>
            <p>Seperate by comma (,)</p>
            <input className="input text" type="text" placeholder="Business Emails" {...register("Business_Emails", {required: true})} />
            {errors['Business_Emails'] && errors['Business_Emails'].type === 'required' && <p style={{ color: 'red' }}>Business Emails is required.</p>}

            <p>Business Phone Numbers (Please provide a list phone number(s) that was used to contact DNAS before) <span className='required'>*</span></p>
            <p>Seperate by comma (,)</p>
            <input className="input text" type="text" placeholder="Business Phone Numbers" {...register("Business_Phone_Numbers", {required: true})} />
            {errors['Business_Phone_Numbers'] && errors['Business_Phone_Numbers'].type === 'required' && <p style={{ color: 'red' }}>Business Phone Numbers is required.</p>}

            <div className="tips" style={{"marginTop": "20px"}}>
              <h4><i className="fa-solid fa-circle-info" style={{"color": "#000000"}}></i> Tips for getting the right site</h4>
              <p>Make sure your business name and site address are correct. 
                Pay attention to your business emails' domain addresses (ensure your are using the correct work email address). 
                For business phone numbers, make sure you are using the numbers that you used to contact with DNAS.
              </p>
            </div>

            <div className="nav-buttons">
              <button className='form-button back' type="button" onClick={back}>Back</button>
              <button className='form-button next' type="button" onClick={getSiteInfo}>Next</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className='form-section'>
            <h1 className='title'>Confirm your site info</h1>

            <h2 className='subTitle'>Matching Sites</h2>
            <p>Based on information your provided, here are the possible sites from our database that match your information.</p>
            <div className="tips">
              <h4 className="tips-subtitle">New customers</h4>
              <p>You should <b>not</b> see any match listed. Please click <span className="confirm-button">Confirm Site</span> and we will reach out to confirm your request later.</p>

              <h4 className="tips-subtitle">Returning customers</h4>
              <p>If you see your site <b>listed among the matches</b>, please click <span className="confirm-button">Confirm Site</span> to proceed. Otherwise, please click <span className="back-button">Go back</span> and correct your information.</p>
              {/* <h4>Returning customers</h4>
              <p>
                You should see your site information displayed below. You might see more than one site due to how we structure our database. 
                If you see your site listed in the possible matches, please click 'Confirm Site' to proceed. 
                Otherwise, please click 'Go back' and correct your information.
              </p>
              <h4>New customers</h4>
              <p>Please click 'Confirm Site' and one of our agents will reach out to confirm your request later.</p> */}
              
            </div>
            <div className="site-info-wrapper">
              {
                possibleSites &&
                  possibleSites.map((site, index) => (
                    <div className="site-info">
                      <div key={index} className="site">
                        <h4>Business Name</h4>
                        <p>{site['clntste_nme']}</p>
                        <h4>Site Address</h4>
                        <p>{site['clntste_addrss_shp_addrss_strt']}</p>
                        <p>{site['clntste_addrss_shp_addrss_cty']}, {site['clntste_addrss_shp_addrss_stte']} {site['clntste_addrss_shp_addrss_zp']}</p>
                      </div>
                    </div>
                  )
                )
              }

              {
                (!possibleSites || possibleSites.length === 0) &&
                  <div className="site-info">
                    <h4>No customer site from our database matches your information.</h4>
                    <p>If you are a returning customer, please go back and correct your information. If you are a new customer, gracefully ignore this message and proceed to the next step.</p>
                  </div>

              }
            </div>


            <div className="tips">
              <h4><i className="fa-solid fa-circle-info" style={{"color": "#000000"}}></i> Tips for getting the right site</h4>
              <p>Make sure your business name and site address are correct. 
                Pay attention to your business emails' domain addresses (ensure your are using the correct work email address). 
                For business phone numbers, make sure you are using the numbers that you used to contact with DNAS.
              </p>
            </div>
            
            <div className="nav-buttons">
              <button className='form-button back' type="button" onClick={back}>Go back</button>
              <button className='form-button next' type="button" onClick={nextPage}>Confirm Site</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className='form-section'>
            <h1 className='title'>Equipment Information</h1>
            <p>Manufacturer</p>
            <input className="input text" type="text" placeholder="Manufacturer" {...register("Manufacturer", {})} />
            
            <p>Model</p>
            <input className="input text" type="text" placeholder="Model" {...register("Model", {})} />

            <p>Under Manufacturer Warranty?</p>
            <select className="select" defaultValue="No" {...register("Under_Manufacturer_Warranty")}>
              {/* <option value="-"></option> */}
              <option value="No"> No</option>
              <option value="Yes">Yes</option>
            </select>

            <p>Has the equipment been serviced in the last 30 days?</p>
            <select className="select" defaultValue="No" {...register("Recently_Serviced")}>
              <option value="No"> No</option>
              <option value="Yes">Yes</option>
              {/* <option value="No"> No</option> */}
            </select>

            <p>If yes, enter relevant Information:</p>
            <textarea className="input textarea" {...register("Service_Info", {})} />

            <p>Do you require a purchase order number?</p>
            <select className="select" defaultValue="No" {...register("Require_PO_number")} onChange={(e) => {
              const value = e.target.value;
              if (value === "Yes") {
                setRequirePO(true);
              } else {
                setRequirePO(false);
              }
            }}>
              <option value="No"> No</option>
              {/* <option value="-"></option> */}
              <option value="Yes">Yes</option>
              {/* <option value="No"> No</option> */}
            </select>

            <p>Purchase Order Number {requirePO && <span className='required'>*</span>}</p>
            <input className="input text" type="text" placeholder="Purchase Order Number" {...register("Purchase_Order_Number", {required: requirePO})} />
            {errors['Purchase_Order_Number'] && errors['Purchase_Order_Number'].type === 'required' && <p style={{ color: 'red' }}>Purchase Order Number is required.</p>}

            
            <p>Exact Location (Instructions of access) <span className='required'>*</span></p>
            <input className="input text" type="text" placeholder="Location" {...register("Location", {required: true})} />
            {errors['Location'] && errors['Location'].type === 'required' && <p style={{ color: 'red' }}>Exact Location (Instructions of access) is required.</p>}


            <p>Equipment (Choose one from the list) <span className='required'>*</span></p>
            {/* <select className="select" {...register("Type", { required: true })}>
              <option value="" disabled selected hidden>Select an option...</option>
              <option value="Refrigeration">Refrigeration</option>
              <option value="HVAC">HVAC</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Plumbing">Plumbing</option>
            </select> */}
            <div className="tips">
              <i className="fa-solid fa-circle-info" style={{"color": "#000000"}}></i><p>If you don't see any equipment below, please reach out to <a href='mailto:clientconcierge@wearetheone.com'>clientconcierge@wearetheone.com</a></p>
            </div>
            <input type="hidden" {...register("Equipment_RN", { required: true })}/>
            <input type="hidden" {...register("Equipment_Name", { required: true })}/>
            <input type="hidden" {...register("Equipment_ID", { required: true })}/>
            <input type="hidden" {...register("Site_ID", { required: true })}/>
            <input type="hidden" {...register("Site_RN", { required: true })}/>

            {/* <select className="select" {...register("Type", { required: true })}>
              <option value="" disabled selected hidden>Select an option...</option>
              {possibleSiteEquipments.map((siteEquipment) => (
                  <option value={siteEquipment['clntsteeqpmnt_rn']}>{siteEquipment['clntste_nme']} - {siteEquipment['clntsteeqpmnt_nme']} | {siteEquipment['clntsteeqpmnt_id']}</option>
              ))}
            </select> */}
            <div className="equipment-list-wrapper">
              <input
                className="input text"
                type="text"
                placeholder="Search / filter this list (based on address, name, manufacturer, or model)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{"marginBottom": "1em"}} 
              />
              <ul className="equipment-list">
                  {possibleSiteEquipments
                    .filter(siteEquipment => 
                      siteEquipment['clntste_nme'].toLowerCase().includes(searchTerm.toLowerCase()) ||
                      siteEquipment['clntsteeqpmnt_nme'].toLowerCase().includes(searchTerm.toLowerCase()) ||
                      siteEquipment['clntsteeqpmnt_mnfctrr'].toLowerCase().includes(searchTerm.toLowerCase()) ||
                      siteEquipment['clntsteeqpmnt_mnfctrr_mdl'].toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((siteEquipment) => (
                      <li 
                          key={siteEquipment['clntsteeqpmnt_rn']} 
                          onClick={() => handleEquipmentClick(siteEquipment)}
                          className={selectedEquipment === siteEquipment['clntsteeqpmnt_rn'] ? 'selected' : ''}
                      >
                        <div className="equipment-list-li-content">
                          <div>
                            {siteEquipment['clntste_nme']}
                            
                            <p>
                              <b>Name</b>&nbsp;&nbsp;{siteEquipment['clntsteeqpmnt_nme']}&nbsp;&nbsp;
                              <b>Manufacturer</b>&nbsp;&nbsp;{siteEquipment['clntsteeqpmnt_mnfctrr'] ? siteEquipment['clntsteeqpmnt_mnfctrr'] : "n/a"}&nbsp;&nbsp;
                              <b>Model</b>&nbsp;&nbsp;{siteEquipment['clntsteeqpmnt_mnfctrr_mdl'] ? siteEquipment['clntsteeqpmnt_mnfctrr_mdl'] : "n/a"}
                            </p>
                          </div>
                          <i className="equipment-list-li-content-check fa-solid fa-circle-check" style={{"color": "#ffffff"}}></i>
                        </div>
                      </li>
                  ))}
              </ul>
            </div>
            {errors['Equipment_RN'] && errors['Equipment_RN'].type === 'required' && <p style={{ color: 'red' }}>Equipment is required.</p>}

            <p>Description of Problem <span className='required'>*</span></p>
            <textarea className="input textarea" {...register("Description", {required: true})} />
            {errors['Description'] && errors['Description'].type === 'required' && <p style={{ color: 'red' }}>Description of Problem is required.</p>}
            

            <div className="nav-buttons">
              <button className='form-button back' type="button" onClick={back}>Back</button>
              <button className='form-button next' type="button" onClick={nextPage}>Next</button>
            </div>
          </div>
        )}

        {/* {step === 6 && (
          <div className='form-section'>
            <h1 className='title'>Service Requirements</h1>
            <p>Exact Location (Instructions of access) <span className='required'>*</span></p>
            <input className="input text" type="text" placeholder="Location" {...register("Location", {required: true})} />
            {errors['Location'] && errors['Location'].type === 'required' && <p style={{ color: 'red' }}>Exact Location (Instructions of access) is required.</p>}


            <p>Equipment (Choose one from the list) <span className='required'>*</span></p>
            <select className="select" {...register("Type", { required: true })}>
              <option value="" disabled selected hidden>Select an option...</option>
              <option value="Refrigeration">Refrigeration</option>
              <option value="HVAC">HVAC</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Plumbing">Plumbing</option>
            </select>
            <input type="hidden" {...register("Type", { required: true })}/>
            <select className="select" {...register("Type", { required: true })}>
              <option value="" disabled selected hidden>Select an option...</option>
              {possibleSiteEquipments.map((siteEquipment) => (
                  <option value={siteEquipment['clntsteeqpmnt_rn']}>{siteEquipment['clntste_nme']} - {siteEquipment['clntsteeqpmnt_nme']} | {siteEquipment['clntsteeqpmnt_id']}</option>
              ))}
            </select>
            
            {errors['Type'] && errors['Type'].type === 'required' && <p style={{ color: 'red' }}>Equipment is required.</p>}

            <p>Description of Problem <span className='required'>*</span></p>
            <textarea className="input textarea" {...register("Description", {required: true})} />
            {errors['Description'] && errors['Description'].type === 'required' && <p style={{ color: 'red' }}>Description of Problem is required.</p>}
            
            <p>Upload Images</p>
            
            <Controller
              name="Images"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <ImageUploader onChange={field.onChange} value={field.value} />
              )}
            />

            <div className="nav-buttons">
              <button className='form-button back' type="button" onClick={back}>Back</button>
              <button className='form-button next' type="button" onClick={nextPage}>Next</button>
            </div>
          </div>
        )} */}

        {step === 6 && (
          <div className='form-section'>
            <h1 className='title'>Availability</h1>
            <p>Preferred Date <span className='required'>*</span></p>
            <input className="input date" type="date" placeholder="Preferred Date" min={(new Date()).toISOString().split('T')[0]} {...register("Preferred_Date", {required: true})} />
            {errors['Preferred_Date'] && errors['Preferred_Date'].type === 'required' && <p style={{ color: 'red' }}>Preferred Date is required.</p>}

            <p>Preferred Start Time <span className='required'>*</span></p>
            <input 
              className="input time" 
              type="time" 
              {...register("Preferred_Start_Time", {
                required: "Preferred Start Time is required."
              })} 
            />
            {errors.Preferred_Start_Time && <p style={{ color: 'red' }}>{errors.Preferred_Start_Time.message}</p>}
            
            <p>Preferred End Time <span className='required'>*</span></p>
            <input 
              className="input time" 
              type="time" 
              {...register("Preferred_End_Time", {
                required: "Preferred End Time is required."
              })} 
            />
            {errors.Preferred_End_Time && <p style={{ color: 'red' }}>{errors.Preferred_End_Time.message}</p>}

            <p>O/T Approved</p>
            <select className="select" defaultValue="No" {...register("OT_Approved")}>
              {/* <option value="-"></option> */}
              <option value="No"> No</option>
              <option value="Yes">Yes</option>
              {/* <option value="No"> No</option> */}
            </select>

            <p>Additional Comments</p>
            <textarea className="input textarea" {...register("Comments", {})} />

            <div className="nav-buttons">
              <button className='form-button back' type="button" onClick={back}>Back</button>
              <input className='form-button submit' type="submit" value="Submit" />
            </div>
          </div>
        )}

        {Object.keys(errors).length > 0 && step >= 2 && (
          <p className='error'>Please correct errors.</p>
        )}
        </>
        }
      
        </div>
      }
    </form>
  );
}
