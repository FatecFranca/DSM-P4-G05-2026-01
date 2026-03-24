import React, { useState } from 'react';
import { API_URL } from '../config/api';
import { jwtDecode } from 'jwt-decode';
import './login.css';

const Login = ({ onLogin }) => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState(null);
    const [isSignup, setIsSignup] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const route = isSignup ? "signup" : "login";
        try {
            const res = await fetch(`${API_URL}/auth/${route}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            let data = {};
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            }
            if (res.ok) {
                localStorage.setItem("token", data.token);
                const decoded = jwtDecode(data.token);
                onLogin(decoded.username);
            } else {
                setError(data.message || (isSignup ?  "Signup failed." : "Login failed."));
            }
        } catch (err) {
            setError("Could not connect to server or invalid response.");
        }
    };

    return (
        <div className="login-container">
            <h2 className='title'>{isSignup ? "Sign Up" : "Login"}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        placeholder='Username'
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        placeholder='Password'
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button className='login-button' type="submit">
                    {isSignup ? "Sign Up" : "Login"}
                </button>
            </form>
            <button
                className='toggle-button'
                style={{ marginTop: '1em' }}
                onClick={() => setIsSignup(!isSignup)}
            >
                {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </button>
            {error && <div style={{ color: "red" }}>{error}</div>}
        </div>
    );
};

export default Login;