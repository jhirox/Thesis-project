const loginPatterns =[
    {
        id: 'email',
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        required: true,
        messages: {
            required: 'Email is required.',
            pattern: 'Please enter a valid email address.'
        }
    },
    {
        id: 'password',
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_=+\\\[\]{};:'",.<>\/?]).{8,}$/,
        required: true,
        messages: {
            required: 'Password is required.',
            pattern: 'Password must be at least 8 characters, one uppercase, one lowercase, one digit, one special characters.'
        }
    }
];

export { loginPatterns };