import React, { useState } from "react";
import { API_URL } from "../config/api";
import "./inputClients.css";

const InputGym = ({ gyms = [], onGymAdded }) => {
    const [form, setForm] = useState({ address: "", phone: "", capacity: "", name: "" });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/gyms`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type":  "application/json"
                },
                body: JSON.stringify({
                    name: form.name,
                    address: form.address,
                    phone: form.phone,
                    capacity: Number(form.capacity)
                })
            });
            let data = {};
            try {
                data = await res.json();
            } catch {
                setMessage("Invalid response from server.");
                return;
            }
            if (!res.ok) {
                setMessage(data.message || "Failed to add gym.");
                return;
            }
            if (gyms.find((g) => g.name === data.name)) {
                setMessage("Gym with this name already exists.");
                return;
            }
            setMessage("Gym added successfully!");
            onGymAdded && onGymAdded(data);
            setForm({ address: "", phone: "", capacity: "", name: "" });
        } catch (err) {
            setMessage("Network error: Could not add gym.");
        }
    };

    return (
        <>
            <form className="Gym-form" onSubmit={handleSubmit}>
                <div className="home-inputs">
                    <h3>Sign up Gym</h3>
                    <input type="text" id="address" placeholder="Endereço" value={form.address} onChange={handleChange} />
                    <input type="text" id="phone" placeholder="Telefone" value={form.phone} onChange={handleChange} />
                    <input type="number" id="capacity" placeholder="Capacity" value={form.capacity} onChange={handleChange} />
                    <input type="text" id="name" placeholder="Nome da Academia" value={form.name} onChange={handleChange} />
                    <button type="submit" id="submit" className="home-button">Sign Up</button>
                    {message && <div className="gym-message">{message}</div>}
                </div>
            </form>
        </>
    );
};

export default InputGym;