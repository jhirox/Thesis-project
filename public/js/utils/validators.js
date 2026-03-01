function validateFields(fieldName, fieldValue, options = {}) {
    const { required = false, pattern = null, errorMessage = '' } = options;

    let returnMsg = "";

    if (fieldValue !== null && fieldValue !== undefined) fieldValue.trim();
    //   console.log('Validating field:', fieldValue);

    if (required && fieldValue === "" && fieldValue.length === 0) {
        returnMsg = `${fieldName} is required`;
    }

    if (pattern && fieldValue !== "" && !pattern.test(fieldValue)) {
        returnMsg = errorMessage || "Invalid format.";

    }
    console.log('Validation result for', fieldValue);

    return {
        message: returnMsg,
        isValid: returnMsg === ""
    };
}

const validate = (form, patterns) => {
    
    const errorMessages = [];
    const inputs = form.querySelectorAll('input');
    

    patterns.forEach((pattern) => {
        const input = Array.from(inputs).find(input => input.id == pattern.id);
        
        const value = input ? input.value.trim() : '';
        
        if(pattern.required === true && (value == '' || value == null)) {
            errorMessages.push(pattern.messages.required);
        }

        if( value != "" & pattern.pattern && !pattern.pattern.test(value)) {
            errorMessages.push(pattern.messages.pattern);
        }
});

    return errorMessages;

}

export {validateFields, validate};