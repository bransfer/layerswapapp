import React from 'react';
import { useValidationContext } from '../../context/validationErrorContext';

const ValidationError: React.FC = () => {
    const { validationDetails, validationMessage } = useValidationContext();

    if (!validationMessage) return null;

    return (
        <div className={`p-2.5 my-2.5 relative rounded-md bg-secondary-700 border-l-8 ${validationDetails.type === "warning" ? "border-orange-400" : "border-red-400"}`}>
            <div className='flex items-center'>
                {validationDetails.icon}
                <p className='text-white font-medium ml-1'>{validationDetails.title}</p>
            </div>
            <p className="text-secondary-text ml-5 mt-1 text-sm">{validationMessage}</p>
        </div>
    );
};

export default ValidationError;