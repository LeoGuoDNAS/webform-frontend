import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import "./form.css";

interface FormData {
  'Street 1': string;
  'Street 2'?: string;
  'Street 3'?: string;
  'Street 4'?: string;
  'City': string;
  'State': string;
  'Zip': number;
  "First Name": string;
  "Last Name": string;
  "Email Address": string;
  "Phone Number": number;
  "Phone Number Ext": number;
  "Alternative Phone Number": number;
  "Alternative Phone Number Ext": number;
  "Manufacturer": string;
  'Model': string;
  'Under Manufacturer Warranty': "" | "Yes" | "No";
  "Recently Serviced": "" | "Yes" | "No";
  "Service Info": string;
  "Have PO number" : "" | "Yes" | "No";
  "Purchase Order Number": number;
  'Location': string;
  'Type': "Refrigeration" | "HVAC" | "Kitchen" | "Plumbing";
  'Description': string
  'Preferred Date': string;
  'Preferred Time': "6-9" | "9-12" | "12-2:30";
  "OT Approved" : "" | "Yes" | "No";
  "Comments": string;
}

export default function Form() {
  // const [isRes, setIsRes] = useState(false);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, trigger, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // console.log(data);
    const isValid = await trigger(); // trigger validation
    if (isValid) {
      console.log(data);
      setSubmitted(true);
      reset();
    }
  };

  const nextPage = async () => {
    const isValid = await trigger(); // trigger validation
    if (isValid) {
      setStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
    }
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
  };

  const isResidential = async () => {
    setStep(-1);
  };

  const appDownload = async () => {
    setStep(-2);
  };

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      {/* {submitted ? (<></>) : <div>as</div>)} */}
      <div className="form-content">
        { submitted ? <div className='form-section'>
          <h3 className='subTitle'>Thank you for your information</h3>
          <p>Our agents will reach out soon.</p>
          <div className="nav-buttons">
            <button className='form-button backToHome' type="button" onClick={newRequest}>Start a new request</button>
          </div>
        </div>
         : <>
      {step === -1 && (
        <div className='form-section'>
          <h3 className='subTitle'>We are sorry we could not assist you. We only provide service to commercial locations. If you are a commercial location, click the button to go back.</h3>
          <div className="nav-buttons">
            <button className='form-button back' type="button" onClick={home}>Back</button>
          </div>
        </div>
      )}

      {step === -2 && (
        <div className='form-section'>
          <h3 className='subTitle'>Please download DNAS Connect to proceed, this web form is for non-contract customers only.</h3>
          <p>"DNAS Connect" is available for download for both iOS and Android devices</p>
          <div className='qr-codes'>
            <div className='qr-code-container'>
              <img className='qr-code' src={process.env.PUBLIC_URL + '/img/dnas-connect-apple.png'} alt='app store qr code'/>
              <p><i className="fa-brands fa-app-store-ios"></i>   App Store</p>
              <a className='app-store-button' href='https://apps.apple.com/us/app/dnas-lite/id1531944898'>
               <i className="fa-brands fa-apple"></i>   Get it on App Store
              </a>
            </div>
            
            <div className='qr-code-container'>
              <img className='qr-code' src={process.env.PUBLIC_URL + '/img/dnas-connect-google.png'} alt='play store qr code'/>
              <p><i className="fa-brands fa-google-play"></i>   Google Play</p>
              <a className='app-store-button' href='https://play.google.com/store/apps/details?id=com.dayniteit.dnaslite&pcampaignid=web_share'>
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
          <h1 className='title'>Welcome to DNAS Non-Contract Customer Service Request Form</h1>
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
          <h1 className='title'>Site Address</h1>
          <p>Street 1 *</p>
          <input className="input text" type="text" placeholder="Street 1" {...register("Street 1", { required: true })} />
          {errors['Street 1'] && errors['Street 1'].type === 'required' && <p style={{ color: 'red' }}>Street 1 is required.</p>}

          <p>Street 2</p>
          <input className="input text" type="text" placeholder="Street 2" {...register("Street 2")} />

          <p>Street 3</p>
          <input className="input text" type="text" placeholder="Street 3" {...register("Street 3")} />

          <p>Street 4</p>
          <input className="input text" type="text" placeholder="Street 4" {...register("Street 4")} />

          <p>City *</p>
          <input className="input text" type="text" placeholder="City" {...register("City", { required: true })} />
          {errors['City'] && errors['City'].type === 'required' && <p style={{ color: 'red' }}>City is required.</p>}

          <p>State *</p>
          <input className="input text" type="text" placeholder="State" {...register("State", { required: true })} />
          {errors['State'] && errors['State'].type === 'required' && <p style={{ color: 'red' }}>State is required.</p>}

          <p>Zip Code *</p>
          <input className="input number" type="number" placeholder="Zip Code" {...register("Zip", { required: true })} />
          {errors['Zip'] && errors['Zip'].type === 'required' && <p style={{ color: 'red' }}>Zip is required.</p>}

          <div className="nav-buttons">
            <button className='form-button back' type="button" onClick={back}>Back</button>
            <button className='form-button next' type="button" onClick={nextPage}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className='form-section'>
          <h1 className='title'>Contact Person Details</h1>
          <p>First Name *</p>
          <input className="input text" type="text" placeholder="First Name" {...register("First Name", {required: true})} />
          {errors['First Name'] && errors['First Name'].type === 'required' && <p style={{ color: 'red' }}>First Name is required.</p>}

          <p>Last Name</p>
          <input className="input text" type="text" placeholder="Last Name" {...register("Last Name", {})} />

          <p>Email Address *</p>
          <input className="input text" type="text" placeholder="Email Address" {...register("Email Address", {required: true})} />
          {errors['Email Address'] && errors['Email Address'].type === 'required' && <p style={{ color: 'red' }}>Email Address is required.</p>}

          <p>Phone Number *</p>
          <input className="input number" type="number" placeholder="Phone Number" {...register("Phone Number", {required: true})} />
          {errors['Phone Number'] && errors['Phone Number'].type === 'required' && <p style={{ color: 'red' }}>Phone Number is required.</p>}

          <p>Ext.</p>
          <input className="input number" type="number" placeholder="Ext" {...register("Phone Number Ext", {})} />

          <p>Alternative Phone Number</p>
          <input className="input number" type="number" placeholder="Alternative Phone Number" {...register("Alternative Phone Number", {})} />

          <p>Ext.</p>
          <input className="input number" type="number" placeholder="Ext" {...register("Alternative Phone Number Ext", {})} />
          
          <div className="nav-buttons">
            <button className='form-button back' type="button" onClick={back}>Back</button>
            <button className='form-button next' type="button" onClick={nextPage}>Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className='form-section'>
          <h1 className='title'>Equipment Information</h1>
          <p>Manufacturer</p>
          <input className="input text" type="text" placeholder="Manufacturer" {...register("Manufacturer", {})} />
          
          <p>Model</p>
          <input className="input text" type="text" placeholder="Model" {...register("Model", {})} />

          <p>Under Manufacturer Warranty?</p>
          <select className="select"  {...register("Under Manufacturer Warranty")}>
            <option value=""></option>
            <option value="Yes">Yes</option>
            <option value=" No"> No</option>
          </select>

          <p>Has the equipment been serviced in the last 30 days?</p>
          <select className="select" {...register("Recently Serviced")}>
            <option value=""></option>
            <option value="Yes">Yes</option>
            <option value=" No"> No</option>
          </select>

          <p>If yes, enter relevant Information:</p>
          <textarea className="input textarea" {...register("Service Info", {})} />

          <p>Do you have a purchase order number?</p>
          <select className="select" {...register("Have PO number")}>
            <option value=""></option>
            <option value="Yes">Yes</option>
            <option value=" No"> No</option>
          </select>

          <p>Purchase Order Number</p>
          <input className="input text" type="text" placeholder="Purchase Order Number" {...register("Purchase Order Number", {})} />
          
          <div className="nav-buttons">
            <button className='form-button back' type="button" onClick={back}>Back</button>
            <button className='form-button next' type="button" onClick={nextPage}>Next</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className='form-section'>
          <h1 className='title'>Service Requirements</h1>
          <p>Exact Location (Instructions of access) *</p>
          <input className="input text" type="text" placeholder="Location" {...register("Location", {required: true})} />
          {errors['Location'] && errors['Location'].type === 'required' && <p style={{ color: 'red' }}>Exact Location (Instructions of access) is required.</p>}


          <p>Equipment Type *</p>
          <select className="select" {...register("Type", { required: true })}>
            <option value="" disabled selected hidden>Select an option...</option>
            <option value="Refrigeration">Refrigeration</option>
            <option value="HVAC"> HVAC</option>
            <option value="Kitchen"> Kitchen</option>
            <option value="Plumbing"> Plumbing</option>
          </select>
          {errors['Type'] && errors['Type'].type === 'required' && <p style={{ color: 'red' }}>Equipment Type is required.</p>}

          <p>Description of Problem *</p>
          <textarea className="input textarea" {...register("Description", {required: true})} />
          {errors['Description'] && errors['Description'].type === 'required' && <p style={{ color: 'red' }}>Description of Problem is required.</p>}
          
          <div className="nav-buttons">
            <button className='form-button back' type="button" onClick={back}>Back</button>
            <button className='form-button next' type="button" onClick={nextPage}>Next</button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className='form-section'>
          <h1 className='title'>Availability</h1>
          <p>Preferred Date *</p>
          <input className="input date" type="date" placeholder="Preferred Date" {...register("Preferred Date", {required: true})} />
          {errors['Preferred Date'] && errors['Preferred Date'].type === 'required' && <p style={{ color: 'red' }}>Preferred Date is required.</p>}

          <p>Preferred Time *</p>
          <select className="select" {...register("Preferred Time", { required: true })}>
            <option value="" disabled selected hidden>Select an option...</option>
            <option value="6-9">6-9</option>
            <option value=" 9-12"> 9-12</option>
            <option value=" 12-2:30"> 12-2:30</option>
          </select>
          {errors['Preferred Time'] && errors['Preferred Time'].type === 'required' && <p style={{ color: 'red' }}>Preferred Time is required.</p>}

          <p>O/T Approved</p>
          <select className="select" {...register("OT Approved")}>
            <option value=""></option>
            <option value="Yes">Yes</option>
            <option value=" No"> No</option>
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
    </form>
  );
}
