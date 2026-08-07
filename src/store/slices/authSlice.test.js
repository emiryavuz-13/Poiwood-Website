import { describe, test, expect } from 'vitest';
import authReducer, { login, logout, setEmailVerified } from './authSlice';

describe('authSlice', () => {
  test('başlangıç durumu', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ user: null, token: null, isAuthenticated: false, emailVerified: false });
  });

  test('login ile kullanıcı bilgileri set edilir', () => {
    const state = authReducer(undefined, login({ user: { id: 'u1' }, token: 'tok', emailVerified: true }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual({ id: 'u1' });
    expect(state.token).toBe('tok');
    expect(state.emailVerified).toBe(true);
  });

  test('login emailVerified verilmezse false olur', () => {
    const state = authReducer(undefined, login({ user: { id: 'u1' }, token: 'tok' }));
    expect(state.emailVerified).toBe(false);
  });

  test('logout tüm alanları temizler', () => {
    let state = authReducer(undefined, login({ user: { id: 'u1' }, token: 'tok', emailVerified: true }));
    state = authReducer(state, logout());
    expect(state).toEqual({ user: null, token: null, isAuthenticated: false, emailVerified: false });
  });

  test('setEmailVerified sadece emailVerified alanını günceller', () => {
    let state = authReducer(undefined, login({ user: { id: 'u1' }, token: 'tok' }));
    state = authReducer(state, setEmailVerified(true));
    expect(state.emailVerified).toBe(true);
    expect(state.isAuthenticated).toBe(true);
  });
});
