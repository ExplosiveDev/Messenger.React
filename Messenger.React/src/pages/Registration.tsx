import React, { FC, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "../assets/styles/Register.module.css";

const Registration: FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<{
        phone: string;
        confirmPassword?: string; // Додаємо нове поле
    }>({
        phone: '',
        confirmPassword: ''
    });
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    
        // Перевірка на номер телефону
        if (name === 'phone') {
            const phonePattern = /^\+380\d{9}$/;
            setErrors({
                ...errors,
                phone: phonePattern.test(value)
                    ? ''
                    : 'Please enter a valid phone number in the format +380XXXXXXXXX'
            });
        }
    
        
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        if (formData.password !== formData.confirmPassword) {
            setErrors((prev) => ({
                ...prev,
                confirmPassword: 'Passwords do not match'
            }));
            return;
        } else {
            setErrors((prev) => ({ ...prev, confirmPassword: '' }));
        }
    
        if (errors.phone) {
            alert(errors.phone);
            return;
        }
    
        try {
            const response = await axios.post(
                'http://192.168.0.100:5187/Users/register',
                formData
            );
            if(response.status === 200){
                navigate('/login');
            }
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    return (
        <section className={styles.registerSection}>
            <div className={styles.registerContainer}>
                <h2 className={styles.registerTitle}>Register</h2>
                <p className={styles.registerSubtitle}>
                    Have an account? <Link to="/login">Sign in</Link>
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className={styles.formControl}
                        name="userName"
                        placeholder="User Name"
                        required
                        value={formData.userName}
                        onChange={handleChange}
                    />
                    <input
                        type="tel"
                        className={styles.formControl}
                        name="phone"
                        placeholder="+380XXXXXXXXX"
                        pattern="^\+380\d{9}$"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    {errors.phone && (
                        <div className={styles.textDanger}>{errors.phone}</div>
                    )}
                    <input
                        type="password"
                        className={styles.formControl}
                        name="password"
                        placeholder="Password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        className={styles.formControl}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                        <div className={styles.textDanger}>{errors.confirmPassword}</div>
                    )}
                    <button className={styles.btnRegister} type="submit">
                        Register
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Registration;
