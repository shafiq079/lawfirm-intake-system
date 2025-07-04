import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Tooltip from '../components/Tooltip';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ClientTextIntakeScreen = ({ initialData }) => {
  const { intakeLink } = useParams();
  const navigate = useNavigate();
  const initialValues = {
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    serviceType: '',
    description: initialData?.description || '',
    visaType: '',
    caseNumber: '',
  };

  // Attempt to pre-fill serviceType and visaType based on initialData.caseType
  if (initialData?.caseType) {
    const lowerCaseCaseType = initialData.caseType.toLowerCase();
    if (lowerCaseCaseType.includes('visa') || lowerCaseCaseType.includes('green card') || lowerCaseCaseType.includes('asylum') || lowerCaseCaseType.includes('citizenship')) {
      initialValues.serviceType = 'immigration';
      initialValues.visaType = initialData.caseType;
    } else if (lowerCaseCaseType.includes('family')) {
      initialValues.serviceType = 'family';
    } else if (lowerCaseCaseType.includes('criminal')) {
      initialValues.serviceType = 'criminal';
    } else {
      initialValues.serviceType = 'other';
    }
  }

  const validationSchema = Yup.object({
    fullName: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email address').required('Required'),
    phoneNumber: Yup.string().required('Required'),
    serviceType: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    visaType: Yup.string().when('serviceType', {
      is: 'immigration',
      then: (schema) => schema.required('Required for immigration cases'),
    }),
    caseNumber: Yup.string().when('serviceType', {
      is: 'criminal',
      then: (schema) => schema.required('Required for criminal cases'),
    }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log('Submitting form data:', values);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      console.log('Sending request to /api/intakes/submit with intakeLink:', intakeLink);
      await axios.post('/api/intakes/submit', { intakeLink, formData: values }, config);
      console.log('Form submitted successfully!');
      toast.success('Intake submitted successfully!');
      navigate('/'); // Redirect to home or a confirmation page
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response && error.response.data.message
        ? error.response.data.message
        : error.message);
    } finally {
      setSubmitting(false);
      console.log('Form submission process finished.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Client Text Intake</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Please fill out the form below to provide your intake information.
      </p>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <Tooltip text="Please enter your full legal name.">
                  <Field
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </Tooltip>
                <ErrorMessage name="fullName" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <Tooltip text="We will use this email to contact you regarding your case.">
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </Tooltip>
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <Tooltip text="Please provide a phone number where we can reach you.">
                  <Field
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </Tooltip>
                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Service Type</label>
                <Tooltip text="Select the type of legal service you are seeking.">
                  <Field
                    as="select"
                    id="serviceType"
                    name="serviceType"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a service type</option>
                    <option value="immigration">Immigration</option>
                    <option value="family">Family Law</option>
                    <option value="criminal">Criminal Defense</option>
                    <option value="other">Other</option>
                  </Field>
                </Tooltip>
                <ErrorMessage name="serviceType" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              {values.serviceType === 'immigration' && (
                <div>
                  <label htmlFor="visaType" className="block text-sm font-medium text-gray-700">Visa Type</label>
                  <Tooltip text="Specify the type of visa you are applying for or inquiring about.">
                    <Field
                      type="text"
                      id="visaType"
                      name="visaType"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </Tooltip>
                  <ErrorMessage name="visaType" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              )}

              {values.serviceType === 'criminal' && (
                <div>
                  <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700">Case Number (if applicable)</label>
                  <Tooltip text="If you have an existing criminal case, please provide the case number.">
                    <Field
                      type="text"
                      id="caseNumber"
                      name="caseNumber"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </Tooltip>
                  <ErrorMessage name="caseNumber" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              )}

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description of Needs</label>
                <Tooltip text="Please provide a detailed description of your legal needs or the issue you are facing.">
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows="4"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </Tooltip>
                <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ClientTextIntakeScreen;

