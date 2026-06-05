'use client';

import { useState } from 'react';

export default function AuthForms({ lang }) {
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = mode === 'login' ? 'auth/local' : 'auth/local/register';
    const body = mode === 'login'
      ? { identifier: email, password }
      : { username, email, password };

    try {
      const res = await fetch(`http://localhost:1337/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage(lang === 'ru' ? 'Успешно! Перенаправление...' : 'Success! Redirecting...');
        setTimeout(() => {
          window.location.href = `/${lang}/garage`;
        }, 1000);
      } else {
        setMessage(data.error?.message || 'Error');
      }
    } catch (err) {
      setMessage(lang === 'ru' ? 'Ошибка соединения' : 'Connection error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {mode === 'login'
          ? (lang === 'ru' ? 'Вход' : 'Login')
          : (lang === 'ru' ? 'Регистрация' : 'Register')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <input
            type="text"
            placeholder={lang === 'ru' ? 'Имя пользователя' : 'Username'}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700"
          required
        />
        <input
          type="password"
          placeholder={lang === 'ru' ? 'Пароль' : 'Password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700"
          required
        />

        {message && (
          <p className={`text-sm ${message.includes('Success') || message.includes('Успешно') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading
            ? (lang === 'ru' ? 'Загрузка...' : 'Loading...')
            : mode === 'login'
              ? (lang === 'ru' ? 'Войти' : 'Login')
              : (lang === 'ru' ? 'Зарегистрироваться' : 'Register')}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        {mode === 'login'
          ? (lang === 'ru' ? 'Нет аккаунта? ' : 'No account? ')
          : (lang === 'ru' ? 'Уже есть аккаунт? ' : 'Already have an account? ')}
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-blue-700 underline"
        >
          {mode === 'login'
            ? (lang === 'ru' ? 'Регистрация' : 'Register')
            : (lang === 'ru' ? 'Войти' : 'Login')}
        </button>
      </p>
    </div>
  );
}