import { Disclosure } from '@headlessui/react';
import { Album, ChevronDown, Mail, ScrollText, User } from 'lucide-react';
import { Field, Form, Formik, FormikErrors } from 'formik';
import { FC, useCallback } from 'react'
import toast from 'react-hot-toast';
import { useAuthDataUpdate, useAuthState } from '../context/authContext';
import { useTimerState } from '../context/timerContext';
import TokenService from '../lib/TokenService';
import LayerSwapAuthApiClient from '../lib/userAuthApiClient';
import SubmitButton from './buttons/submitButton';
import { Widget } from './Widget/Index';

type EmailFormValues = {
    email: string;
}

type Props = {
    onSend: (email: string) => void;
    compactLogin?: boolean;
}

const SendEmail: FC<Props> = ({ onSend, compactLogin }) => {
    const { codeRequested, tempEmail } = useAuthState()
    const { setCodeRequested, updateTempEmail } = useAuthDataUpdate();
    const initialValues: EmailFormValues = { email: tempEmail ?? "" };
    const { start: startTimer } = useTimerState()

    const sendEmail = useCallback(async (values: EmailFormValues) => {
        try {
            const inputEmail = values.email;

            if (inputEmail != tempEmail || !codeRequested) {

                const apiClient = new LayerSwapAuthApiClient();
                const res = await apiClient.getCodeAsync(inputEmail)
                if (res.error)
                    throw new Error(res.error)
                TokenService.setCodeNextTime(res?.data?.next)
                setCodeRequested(true);
                updateTempEmail(inputEmail)
                const next = new Date(res?.data?.next)
                const now = new Date()
                const miliseconds = next.getTime() - now.getTime()
                startTimer(Math.round((res?.data?.already_sent ? 60000 : miliseconds) / 1000))
            }
            onSend(inputEmail)
        }
        catch (error) {
            if (error.response?.data?.errors?.length > 0) {
                const message = error.response.data.errors.map(e => e.message).join(", ")
                toast.error(message)
            }
            else {
                toast.error(error.message)
            }
        }
    }, [tempEmail])

    function validateEmail(values: EmailFormValues) {
        let error: FormikErrors<EmailFormValues> = {};
        if (!values.email) {
            error.email = 'Required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
            error.email = 'Invalid email address';
        }
        return error;
    }

    return (
        <>
            <Formik
                initialValues={initialValues}
                onSubmit={sendEmail}
                validateOnMount={true}
                validate={validateEmail}
            >
                {({ isValid, isSubmitting }) => (
                    <Form autoComplete='true' className='w-full h-full'>
                        {
                            compactLogin ?
                                <div>
                                    <div className="w-full text-left text-base font-light">
                                        <div className='flex items-center justify-between'>
                                            <p className='text-xl text-primary-text'>
                                                Sign in with email
                                            </p>
                                        </div>
                                        <p className='mt-2 text-left text-secondary-text'>
                                            Securely store your exchange accounts, access your full transfer history and more.
                                        </p>
                                    </div>
                                    <div className="text-sm text-secondary-text font-normal mt-4">
                                        <div className='grid gap-4 grid-cols-5  items-center'>
                                            <div className="relative rounded-md shadow-sm col-span-3">
                                                <Field name="email">
                                                    {({ field }) => (
                                                        <input
                                                            {...field}
                                                            id='email'
                                                            placeholder="john@example.com"
                                                            autoComplete="email"
                                                            type="email"
                                                            className="h-12 pb-1 pt-0 text-primary-text  focus:ring-primary focus:border-primary border-secondary-500 pr-42 block
                                                   placeholder:text-secondary-text placeholder:text-sm placeholder:font-normal placeholder:opacity-50 bg-secondary-700 w-full font-semibold rounded-md"
                                                        />
                                                    )}
                                                </Field>
                                            </div>
                                            <div className='col-start-4 col-span-2'>
                                                <SubmitButton isDisabled={!isValid} isSubmitting={isSubmitting} >
                                                    Continue
                                                </SubmitButton>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className='h-full flex flex-col justify-between'>
                                    <Widget.Content center={true}>
                                        <User className='w-16 h-16 text-primary self-center mt-5 sm:mt-auto' />
                                        <div>
                                            <p className='mb-6 mt-2 pt-2 text-2xl font-bold text-primary-text leading-6 text-center font-roboto'>
                                                What&apos;s your email?
                                            </p>
                                        </div>
                                        <div className="relative rounded-md shadow-sm">
                                            <Field name="email">
                                                {({ field }) => (
                                                    <input
                                                        {...field}
                                                        id='email'
                                                        placeholder="john@example.com"
                                                        autoComplete="email"
                                                        type="email"
                                                        className="h-12 pb-1 pt-0 text-primary-text  focus:ring-primary focus:border-primary border-secondary-500 pr-42 block
                                                   placeholder:text-secondary-text placeholder:text-sm placeholder:font-normal placeholder:opacity-50 bg-secondary-700 w-full font-semibold rounded-md"
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                        <div className='px-3 text-primary-text mt-6'>
                                            <p className='text-left text-sm mb-3 text-secondary-text font-semibold'>
                                                By signing in you get
                                            </p>
                                            <ul className='space-y-3'>
                                                <li className='flex gap-3'>
                                                    <div>
                                                        <ScrollText className='h-5 w-5 mt-0.5 text-primary' />
                                                    </div>
                                                    <div>
                                                        <p className='font-semibold'>History</p>
                                                        <p className='text-secondary-text text-sm'>
                                                            Access your entire transaction history
                                                        </p>
                                                    </div>
                                                </li>
                                                <li className='flex gap-3'>
                                                    <div>
                                                        <Mail className='h-5 w-5 mt-0.5 text-primary' />
                                                    </div>
                                                    <div>
                                                        <p className='font-semibold'>Email updates</p>
                                                        <p className='text-secondary-text text-sm'>
                                                            Get a notification upon transfer completion
                                                        </p>
                                                    </div>
                                                </li>
                                                <li className='flex gap-3'>
                                                    <div>
                                                        <Album className='h-5 w-5 mt-0.5 text-primary' />
                                                    </div>
                                                    <div>
                                                        <p className='font-semibold'>Dedicated deposit address</p>
                                                        <p className='text-secondary-text text-sm'>
                                                            Get deposit addresses that stay the same and can be whitelisted in CEXes
                                                        </p>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </Widget.Content>
                                    <Widget.Footer>
                                        <SubmitButton isDisabled={!isValid} isSubmitting={isSubmitting} >
                                            Continue
                                        </SubmitButton>
                                    </Widget.Footer>
                                </div>
                        }
                    </Form>
                )}
            </Formik >
        </>
    )
}

export default SendEmail;