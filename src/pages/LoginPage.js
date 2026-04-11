import React, { useState } from 'react';
import { validateLogin } from '../auth/loginConfig';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (validateLogin(email, password)) {
      onLoginSuccess();
      return;
    }
    setError('Invalid email or password.');
  }

  return (
    <div className="login-page app-above-watermark">
      <div className="login-page__card">
        <img
          className="login-page__logo"
          src={`${process.env.PUBLIC_URL}/spuc-logo.jpg`}
          alt=""
          loading="eager"
        />
        <h1 className="login-page__title">SPUC Result Dashboard</h1>
        <p className="login-page__subtitle">Sign in to continue</p>

        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          <label className="login-page__label" htmlFor="login-email">
            Email ID
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            className="login-page__input"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />

          <label className="login-page__label" htmlFor="login-password">
            Password
          </label>
          <div className="login-page__password-wrap">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="login-page__input login-page__input--with-toggle"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
            <button
              type="button"
              className="login-page__toggle-password"
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error ? (
            <p className="login-page__error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="login-page__submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
